from fastapi import FastAPI, APIRouter, HTTPException, Request, Depends
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
import jwt
import bcrypt
import httpx

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Configuration
JWT_SECRET = os.environ.get('JWT_SECRET', 'finmar_jwt_secret')
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 168  # 7 days

# Stripe Configuration
STRIPE_API_KEY = os.environ.get('STRIPE_API_KEY')

# LLM Configuration
EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY')

# Create the main app
app = FastAPI(title="FINMAR API", version="1.0.0")

# Create router with /api prefix
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# ==================== MODELS ====================

# Subscription Packages - Australian Pricing
ACCOUNTING_PACKAGES = {
    "starter": {"name": "Starter", "price": 250.00, "revenue_range": "$0–$200K", "payroll_employees": 1},
    "growth": {"name": "Growth", "price": 375.00, "revenue_range": "$201K–$500K", "payroll_employees": 2},
    "advanced": {"name": "Advanced", "price": 500.00, "revenue_range": "$501K–$750K", "payroll_employees": 3},
    "premium": {"name": "Premium", "price": 625.00, "revenue_range": "$751K–$1M+", "payroll_employees": 5}
}

MARKETING_PACKAGES = {
    "basic": {"name": "Marketing Basic", "price": 149.00, "posts_per_month": 8, "features": ["Social media management", "Basic designs", "Monthly report"]},
    "growth": {"name": "Marketing Growth", "price": 299.00, "posts_per_month": 12, "features": ["Google Business Profile", "Ad creatives", "Monthly strategy"]},
    "pro": {"name": "Marketing Pro", "price": 499.00, "posts_per_month": 16, "features": ["1 reel/month", "Google + Meta Ads", "SEO basics", "Review system"]},
    "ultimate": {"name": "Marketing Ultimate + AI", "price": 799.00, "posts_per_month": 20, "features": ["4 reels/month", "Website updates", "Blog content", "CRM setup", "AI dashboard", "Priority support"]}
}

COMBINED_PACKAGES = {
    "essentials": {"name": "Essentials", "price": 399.00, "accounting": "starter", "marketing": "basic"},
    "growth": {"name": "Growth", "price": 599.00, "accounting": "growth", "marketing": "growth"},
    "pro": {"name": "Pro", "price": 899.00, "accounting": "advanced", "marketing": "pro"},
    "executive": {"name": "Executive", "price": 1299.00, "accounting": "premium", "marketing": "ultimate", "extras": ["AI Dashboard", "CRM"]}
}

ADD_ONS = {
    "ai_dashboard": {"name": "AI Financial Dashboard", "price": 39.00},
    "ai_document": {"name": "AI Document Automation", "price": 29.00},
    "ai_crm": {"name": "AI CRM", "price": 79.00},
    "website_branding": {"name": "Website & Branding", "price": 59.00, "setup_fee": 249.00},
    "ecommerce": {"name": "E-commerce Integration", "price": 49.00}
}

# Pydantic Models
class UserBase(BaseModel):
    email: EmailStr
    name: str
    business_name: Optional[str] = None
    phone: Optional[str] = None

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str
    business_name: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    user_id: str
    email: str
    name: str
    picture: Optional[str] = None
    business_name: Optional[str] = None
    phone: Optional[str] = None
    created_at: datetime
    subscription_status: Optional[str] = "inactive"
    current_plan: Optional[str] = None
    role: Optional[str] = "user"  # user or admin

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: User

# Admin Models
class AdminLogin(BaseModel):
    email: EmailStr
    password: str

class AdminUser(BaseModel):
    model_config = ConfigDict(extra="ignore")
    admin_id: str
    email: str
    name: str
    role: str = "admin"
    created_at: datetime

class AdminTokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    admin: AdminUser

class UserUpdate(BaseModel):
    name: Optional[str] = None
    business_name: Optional[str] = None
    phone: Optional[str] = None
    subscription_status: Optional[str] = None
    role: Optional[str] = None

class ContactUpdate(BaseModel):
    status: str  # new, in_progress, resolved, closed

class Subscription(BaseModel):
    model_config = ConfigDict(extra="ignore")
    subscription_id: str
    user_id: str
    plan_type: str  # accounting, marketing, combined
    plan_tier: str
    add_ons: List[str] = []
    status: str = "active"
    amount: float
    currency: str = "AUD"
    start_date: datetime
    next_billing_date: datetime
    created_at: datetime

class PaymentTransaction(BaseModel):
    model_config = ConfigDict(extra="ignore")
    transaction_id: str
    user_id: str
    session_id: str
    amount: float
    currency: str
    status: str
    plan_type: str
    plan_tier: str
    metadata: Dict[str, Any] = {}
    created_at: datetime
    updated_at: datetime

class ContactRequest(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    business_name: Optional[str] = None
    service_interest: str
    message: str

class AIInsightRequest(BaseModel):
    query: str
    context: Optional[str] = None

class CheckoutRequest(BaseModel):
    plan_type: str
    plan_tier: str
    add_ons: List[str] = []
    origin_url: str

# ==================== AUTH HELPERS ====================

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_jwt_token(user_id: str, email: str, role: str = "user") -> str:
    payload = {
        "user_id": user_id,
        "email": email,
        "role": role,
        "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS),
        "iat": datetime.now(timezone.utc)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(request: Request) -> User:
    # Try cookie first
    session_token = request.cookies.get("session_token")
    
    # Try Authorization header
    if not session_token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            session_token = auth_header.split(" ")[1]
    
    if not session_token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    # Check if it's a JWT token
    try:
        payload = jwt.decode(session_token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("user_id")
        user_doc = await db.users.find_one({"user_id": user_id}, {"_id": 0})
        if user_doc:
            if isinstance(user_doc.get('created_at'), str):
                user_doc['created_at'] = datetime.fromisoformat(user_doc['created_at'])
            return User(**user_doc)
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        pass
    
    # Check session token in database (Google OAuth)
    session_doc = await db.user_sessions.find_one({"session_token": session_token}, {"_id": 0})
    if not session_doc:
        raise HTTPException(status_code=401, detail="Invalid session")
    
    # Check expiry
    expires_at = session_doc.get("expires_at")
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at)
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=401, detail="Session expired")
    
    user_doc = await db.users.find_one({"user_id": session_doc["user_id"]}, {"_id": 0})
    if not user_doc:
        raise HTTPException(status_code=401, detail="User not found")
    
    if isinstance(user_doc.get('created_at'), str):
        user_doc['created_at'] = datetime.fromisoformat(user_doc['created_at'])
    
    return User(**user_doc)

# ==================== AUTH ROUTES ====================

@api_router.post("/auth/register", response_model=TokenResponse)
async def register(user_data: UserCreate):
    # Check if user exists
    existing = await db.users.find_one({"email": user_data.email}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_id = f"user_{uuid.uuid4().hex[:12]}"
    hashed_pw = hash_password(user_data.password)
    
    user_doc = {
        "user_id": user_id,
        "email": user_data.email,
        "name": user_data.name,
        "password_hash": hashed_pw,
        "business_name": user_data.business_name,
        "picture": None,
        "phone": None,
        "subscription_status": "inactive",
        "current_plan": None,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.users.insert_one(user_doc)
    
    token = create_jwt_token(user_id, user_data.email)
    
    user_doc.pop('password_hash', None)
    user_doc['created_at'] = datetime.fromisoformat(user_doc['created_at'])
    
    return TokenResponse(access_token=token, user=User(**user_doc))

@api_router.post("/auth/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    user_doc = await db.users.find_one({"email": credentials.email}, {"_id": 0})
    if not user_doc:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not verify_password(credentials.password, user_doc.get("password_hash", "")):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_jwt_token(user_doc["user_id"], credentials.email)
    
    user_doc.pop('password_hash', None)
    if isinstance(user_doc.get('created_at'), str):
        user_doc['created_at'] = datetime.fromisoformat(user_doc['created_at'])
    
    return TokenResponse(access_token=token, user=User(**user_doc))

@api_router.post("/auth/session")
async def process_google_session(request: Request):
    """Process Google OAuth session_id from Emergent Auth"""
    body = await request.json()
    session_id = body.get("session_id")
    
    if not session_id:
        raise HTTPException(status_code=400, detail="session_id required")
    
    # Exchange session_id for user data
    async with httpx.AsyncClient() as client:
        response = await client.get(
            "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
            headers={"X-Session-ID": session_id}
        )
        
        if response.status_code != 200:
            raise HTTPException(status_code=401, detail="Invalid session")
        
        auth_data = response.json()
    
    email = auth_data.get("email")
    name = auth_data.get("name")
    picture = auth_data.get("picture")
    session_token = auth_data.get("session_token")
    
    # Check if user exists
    existing = await db.users.find_one({"email": email}, {"_id": 0})
    
    if existing:
        user_id = existing["user_id"]
        # Update user data
        await db.users.update_one(
            {"user_id": user_id},
            {"$set": {"name": name, "picture": picture}}
        )
    else:
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        user_doc = {
            "user_id": user_id,
            "email": email,
            "name": name,
            "picture": picture,
            "business_name": None,
            "phone": None,
            "subscription_status": "inactive",
            "current_plan": None,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.users.insert_one(user_doc)
    
    # Store session
    session_doc = {
        "user_id": user_id,
        "session_token": session_token,
        "expires_at": (datetime.now(timezone.utc) + timedelta(days=7)).isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.user_sessions.delete_many({"user_id": user_id})
    await db.user_sessions.insert_one(session_doc)
    
    # Get user data
    user_doc = await db.users.find_one({"user_id": user_id}, {"_id": 0})
    user_doc.pop('password_hash', None)
    if isinstance(user_doc.get('created_at'), str):
        user_doc['created_at'] = datetime.fromisoformat(user_doc['created_at'])
    
    response = JSONResponse(content={"user": User(**user_doc).model_dump(mode='json')})
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=True,
        samesite="none",
        path="/",
        max_age=7*24*60*60
    )
    return response

@api_router.get("/auth/me", response_model=User)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@api_router.post("/auth/logout")
async def logout(request: Request):
    session_token = request.cookies.get("session_token")
    if session_token:
        await db.user_sessions.delete_many({"session_token": session_token})
    
    response = JSONResponse(content={"message": "Logged out"})
    response.delete_cookie("session_token", path="/")
    return response

# ==================== SUBSCRIPTION ROUTES ====================

@api_router.get("/packages/accounting")
async def get_accounting_packages():
    return ACCOUNTING_PACKAGES

@api_router.get("/packages/marketing")
async def get_marketing_packages():
    return MARKETING_PACKAGES

@api_router.get("/packages/combined")
async def get_combined_packages():
    return COMBINED_PACKAGES

@api_router.get("/packages/addons")
async def get_addons():
    return ADD_ONS

@api_router.get("/subscriptions/my", response_model=Optional[Subscription])
async def get_my_subscription(current_user: User = Depends(get_current_user)):
    sub_doc = await db.subscriptions.find_one(
        {"user_id": current_user.user_id, "status": "active"},
        {"_id": 0}
    )
    if sub_doc:
        for field in ['start_date', 'next_billing_date', 'created_at']:
            if isinstance(sub_doc.get(field), str):
                sub_doc[field] = datetime.fromisoformat(sub_doc[field])
        return Subscription(**sub_doc)
    return None

# ==================== PAYMENT ROUTES ====================

@api_router.post("/payments/checkout")
async def create_checkout(checkout_data: CheckoutRequest, current_user: User = Depends(get_current_user)):
    from emergentintegrations.payments.stripe.checkout import StripeCheckout, CheckoutSessionRequest
    
    # Calculate amount based on plan
    amount = 0.0
    if checkout_data.plan_type == "accounting":
        if checkout_data.plan_tier not in ACCOUNTING_PACKAGES:
            raise HTTPException(status_code=400, detail="Invalid accounting plan")
        amount = ACCOUNTING_PACKAGES[checkout_data.plan_tier]["price"]
    elif checkout_data.plan_type == "marketing":
        if checkout_data.plan_tier not in MARKETING_PACKAGES:
            raise HTTPException(status_code=400, detail="Invalid marketing plan")
        amount = MARKETING_PACKAGES[checkout_data.plan_tier]["price"]
    elif checkout_data.plan_type == "combined":
        if checkout_data.plan_tier not in COMBINED_PACKAGES:
            raise HTTPException(status_code=400, detail="Invalid combined plan")
        amount = COMBINED_PACKAGES[checkout_data.plan_tier]["price"]
    else:
        raise HTTPException(status_code=400, detail="Invalid plan type")
    
    # Add add-ons
    for addon in checkout_data.add_ons:
        if addon in ADD_ONS:
            amount += ADD_ONS[addon]["price"]
    
    # Build URLs from origin
    success_url = f"{checkout_data.origin_url}/payment-success?session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{checkout_data.origin_url}/pricing"
    
    # Initialize Stripe
    host_url = str(checkout_data.origin_url).rstrip('/')
    webhook_url = f"{os.environ.get('REACT_APP_BACKEND_URL', checkout_data.origin_url)}/api/webhook/stripe"
    
    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
    
    # Create checkout session
    checkout_request = CheckoutSessionRequest(
        amount=float(amount),
        currency="aud",
        success_url=success_url,
        cancel_url=cancel_url,
        metadata={
            "user_id": current_user.user_id,
            "plan_type": checkout_data.plan_type,
            "plan_tier": checkout_data.plan_tier,
            "add_ons": ",".join(checkout_data.add_ons)
        }
    )
    
    session = await stripe_checkout.create_checkout_session(checkout_request)
    
    # Create payment transaction record
    transaction_doc = {
        "transaction_id": f"txn_{uuid.uuid4().hex[:12]}",
        "user_id": current_user.user_id,
        "session_id": session.session_id,
        "amount": amount,
        "currency": "AUD",
        "status": "pending",
        "payment_status": "initiated",
        "plan_type": checkout_data.plan_type,
        "plan_tier": checkout_data.plan_tier,
        "add_ons": checkout_data.add_ons,
        "metadata": {"stripe_session_id": session.session_id},
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.payment_transactions.insert_one(transaction_doc)
    
    return {"checkout_url": session.url, "session_id": session.session_id}

@api_router.get("/payments/status/{session_id}")
async def get_payment_status(session_id: str, current_user: User = Depends(get_current_user)):
    from emergentintegrations.payments.stripe.checkout import StripeCheckout
    
    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url="")
    
    status = await stripe_checkout.get_checkout_status(session_id)
    
    # Update transaction in database
    if status.payment_status == "paid":
        txn = await db.payment_transactions.find_one({"session_id": session_id}, {"_id": 0})
        
        if txn and txn.get("status") != "completed":
            # Update transaction
            await db.payment_transactions.update_one(
                {"session_id": session_id},
                {"$set": {
                    "status": "completed",
                    "payment_status": "paid",
                    "updated_at": datetime.now(timezone.utc).isoformat()
                }}
            )
            
            # Create/update subscription
            sub_id = f"sub_{uuid.uuid4().hex[:12]}"
            now = datetime.now(timezone.utc)
            
            sub_doc = {
                "subscription_id": sub_id,
                "user_id": current_user.user_id,
                "plan_type": txn["plan_type"],
                "plan_tier": txn["plan_tier"],
                "add_ons": txn.get("add_ons", []),
                "status": "active",
                "amount": txn["amount"],
                "currency": "AUD",
                "start_date": now.isoformat(),
                "next_billing_date": (now + timedelta(days=30)).isoformat(),
                "created_at": now.isoformat()
            }
            
            # Deactivate old subscriptions
            await db.subscriptions.update_many(
                {"user_id": current_user.user_id, "status": "active"},
                {"$set": {"status": "inactive"}}
            )
            
            await db.subscriptions.insert_one(sub_doc)
            
            # Update user subscription status
            await db.users.update_one(
                {"user_id": current_user.user_id},
                {"$set": {
                    "subscription_status": "active",
                    "current_plan": f"{txn['plan_type']}_{txn['plan_tier']}"
                }}
            )
    
    return {
        "status": status.status,
        "payment_status": status.payment_status,
        "amount_total": status.amount_total,
        "currency": status.currency
    }

@api_router.post("/webhook/stripe")
async def stripe_webhook(request: Request):
    from emergentintegrations.payments.stripe.checkout import StripeCheckout
    
    body = await request.body()
    sig = request.headers.get("Stripe-Signature")
    
    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url="")
    
    try:
        webhook_response = await stripe_checkout.handle_webhook(body, sig)
        
        if webhook_response.payment_status == "paid":
            session_id = webhook_response.session_id
            await db.payment_transactions.update_one(
                {"session_id": session_id},
                {"$set": {
                    "status": "completed",
                    "payment_status": "paid",
                    "updated_at": datetime.now(timezone.utc).isoformat()
                }}
            )
        
        return {"received": True}
    except Exception as e:
        logger.error(f"Webhook error: {e}")
        return {"received": True}

# ==================== AI ROUTES ====================

@api_router.post("/ai/insights")
async def get_ai_insights(insight_request: AIInsightRequest, current_user: User = Depends(get_current_user)):
    from emergentintegrations.llm.chat import LlmChat, UserMessage
    
    chat = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=f"insights_{current_user.user_id}_{uuid.uuid4().hex[:8]}",
        system_message="""You are FINMAR AI Assistant, an expert in Australian business finance, marketing strategy, and business automation. 
        You help small and medium businesses with:
        - Financial insights and bookkeeping advice
        - BAS/GST compliance guidance
        - Digital marketing strategies
        - Business growth recommendations
        - Automation opportunities
        
        Provide practical, actionable advice tailored to Australian SMBs. Keep responses concise and professional."""
    )
    
    chat.with_model("openai", "gpt-5.2")
    
    context = insight_request.context or ""
    full_query = f"{context}\n\nUser Query: {insight_request.query}" if context else insight_request.query
    
    user_message = UserMessage(text=full_query)
    
    try:
        response = await chat.send_message(user_message)
        
        # Store chat history
        chat_doc = {
            "chat_id": f"chat_{uuid.uuid4().hex[:12]}",
            "user_id": current_user.user_id,
            "query": insight_request.query,
            "response": response,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.ai_chats.insert_one(chat_doc)
        
        return {"insight": response}
    except Exception as e:
        logger.error(f"AI Error: {e}")
        raise HTTPException(status_code=500, detail="AI service temporarily unavailable")

@api_router.get("/ai/chat-history")
async def get_chat_history(current_user: User = Depends(get_current_user)):
    chats = await db.ai_chats.find(
        {"user_id": current_user.user_id},
        {"_id": 0}
    ).sort("created_at", -1).limit(20).to_list(20)
    return chats

# ==================== CONTACT ROUTES ====================

@api_router.post("/contact")
async def submit_contact(contact: ContactRequest):
    contact_doc = {
        "contact_id": f"contact_{uuid.uuid4().hex[:12]}",
        "name": contact.name,
        "email": contact.email,
        "phone": contact.phone,
        "business_name": contact.business_name,
        "service_interest": contact.service_interest,
        "message": contact.message,
        "status": "new",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.contacts.insert_one(contact_doc)
    
    return {"message": "Thank you for contacting us. We'll be in touch soon!", "contact_id": contact_doc["contact_id"]}

# ==================== ADMIN ROUTES ====================

# Admin credentials - can be stored in env or database
ADMIN_CREDENTIALS = {
    "sajeev@getupsolutions.com.au": {
        "password_hash": hash_password("Getup@4665"),
        "name": "Sajeev Admin",
        "admin_id": "admin_sajeev001"
    }
}

async def get_current_admin(request: Request):
    """Verify admin authentication"""
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Admin authentication required")
    
    token = auth_header.split(" ")[1]
    
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        if payload.get("role") != "admin":
            raise HTTPException(status_code=403, detail="Admin access required")
        
        admin_id = payload.get("user_id")
        # Check in admins collection first
        admin_doc = await db.admins.find_one({"admin_id": admin_id}, {"_id": 0})
        if admin_doc:
            if isinstance(admin_doc.get('created_at'), str):
                admin_doc['created_at'] = datetime.fromisoformat(admin_doc['created_at'])
            return AdminUser(**admin_doc)
        
        # Check if it's a user with admin role
        user_doc = await db.users.find_one({"user_id": admin_id, "role": "admin"}, {"_id": 0})
        if user_doc:
            if isinstance(user_doc.get('created_at'), str):
                user_doc['created_at'] = datetime.fromisoformat(user_doc['created_at'])
            return AdminUser(
                admin_id=user_doc["user_id"],
                email=user_doc["email"],
                name=user_doc["name"],
                role="admin",
                created_at=user_doc["created_at"]
            )
        
        raise HTTPException(status_code=401, detail="Admin not found")
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

@api_router.post("/admin/login", response_model=AdminTokenResponse)
async def admin_login(credentials: AdminLogin):
    """Admin login endpoint"""
    email = credentials.email.lower()
    
    # Check hardcoded admin credentials first
    if email in ADMIN_CREDENTIALS:
        admin_data = ADMIN_CREDENTIALS[email]
        if verify_password(credentials.password, admin_data["password_hash"]):
            # Create or update admin in database
            admin_doc = await db.admins.find_one({"email": email}, {"_id": 0})
            if not admin_doc:
                admin_doc = {
                    "admin_id": admin_data["admin_id"],
                    "email": email,
                    "name": admin_data["name"],
                    "role": "admin",
                    "created_at": datetime.now(timezone.utc).isoformat()
                }
                await db.admins.insert_one(admin_doc)
            
            token = create_jwt_token(admin_data["admin_id"], email, "admin")
            
            if isinstance(admin_doc.get('created_at'), str):
                admin_doc['created_at'] = datetime.fromisoformat(admin_doc['created_at'])
            
            return AdminTokenResponse(
                access_token=token,
                admin=AdminUser(**admin_doc)
            )
    
    # Check users with admin role
    user_doc = await db.users.find_one({"email": email, "role": "admin"}, {"_id": 0})
    if user_doc and verify_password(credentials.password, user_doc.get("password_hash", "")):
        token = create_jwt_token(user_doc["user_id"], email, "admin")
        
        if isinstance(user_doc.get('created_at'), str):
            user_doc['created_at'] = datetime.fromisoformat(user_doc['created_at'])
        
        return AdminTokenResponse(
            access_token=token,
            admin=AdminUser(
                admin_id=user_doc["user_id"],
                email=user_doc["email"],
                name=user_doc["name"],
                role="admin",
                created_at=user_doc["created_at"]
            )
        )
    
    raise HTTPException(status_code=401, detail="Invalid admin credentials")

@api_router.get("/admin/me")
async def get_admin_me(admin: AdminUser = Depends(get_current_admin)):
    """Get current admin info"""
    return admin

@api_router.get("/admin/dashboard/stats")
async def get_admin_stats(admin: AdminUser = Depends(get_current_admin)):
    """Get dashboard statistics"""
    # Count users
    total_users = await db.users.count_documents({})
    active_subscriptions = await db.subscriptions.count_documents({"status": "active"})
    new_contacts = await db.contacts.count_documents({"status": "new"})
    total_contacts = await db.contacts.count_documents({})
    
    # Calculate revenue
    pipeline = [
        {"$match": {"status": "completed"}},
        {"$group": {"_id": None, "total": {"$sum": "$amount"}}}
    ]
    revenue_result = await db.payment_transactions.aggregate(pipeline).to_list(1)
    total_revenue = revenue_result[0]["total"] if revenue_result else 0
    
    # Monthly revenue
    thirty_days_ago = (datetime.now(timezone.utc) - timedelta(days=30)).isoformat()
    monthly_pipeline = [
        {"$match": {"status": "completed", "created_at": {"$gte": thirty_days_ago}}},
        {"$group": {"_id": None, "total": {"$sum": "$amount"}}}
    ]
    monthly_result = await db.payment_transactions.aggregate(monthly_pipeline).to_list(1)
    monthly_revenue = monthly_result[0]["total"] if monthly_result else 0
    
    # Subscription breakdown
    sub_pipeline = [
        {"$match": {"status": "active"}},
        {"$group": {"_id": "$plan_type", "count": {"$sum": 1}}}
    ]
    sub_breakdown = await db.subscriptions.aggregate(sub_pipeline).to_list(10)
    subscription_by_type = {item["_id"]: item["count"] for item in sub_breakdown}
    
    return {
        "total_users": total_users,
        "active_subscriptions": active_subscriptions,
        "new_contacts": new_contacts,
        "total_contacts": total_contacts,
        "total_revenue": total_revenue,
        "monthly_revenue": monthly_revenue,
        "subscription_by_type": subscription_by_type
    }

@api_router.get("/admin/users")
async def get_all_users(
    skip: int = 0, 
    limit: int = 50,
    search: Optional[str] = None,
    admin: AdminUser = Depends(get_current_admin)
):
    """Get all users with pagination and search"""
    query = {}
    if search:
        query = {
            "$or": [
                {"email": {"$regex": search, "$options": "i"}},
                {"name": {"$regex": search, "$options": "i"}},
                {"business_name": {"$regex": search, "$options": "i"}}
            ]
        }
    
    users = await db.users.find(query, {"_id": 0, "password_hash": 0}).skip(skip).limit(limit).to_list(limit)
    total = await db.users.count_documents(query)
    
    return {"users": users, "total": total, "skip": skip, "limit": limit}

@api_router.get("/admin/users/{user_id}")
async def get_user_detail(user_id: str, admin: AdminUser = Depends(get_current_admin)):
    """Get user details including subscription"""
    user = await db.users.find_one({"user_id": user_id}, {"_id": 0, "password_hash": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    subscription = await db.subscriptions.find_one(
        {"user_id": user_id, "status": "active"}, 
        {"_id": 0}
    )
    
    transactions = await db.payment_transactions.find(
        {"user_id": user_id}, 
        {"_id": 0}
    ).sort("created_at", -1).limit(10).to_list(10)
    
    return {
        "user": user,
        "subscription": subscription,
        "transactions": transactions
    }

@api_router.put("/admin/users/{user_id}")
async def update_user(user_id: str, update: UserUpdate, admin: AdminUser = Depends(get_current_admin)):
    """Update user details"""
    update_data = {k: v for k, v in update.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No update data provided")
    
    result = await db.users.update_one({"user_id": user_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {"message": "User updated successfully"}

@api_router.delete("/admin/users/{user_id}")
async def delete_user(user_id: str, admin: AdminUser = Depends(get_current_admin)):
    """Delete a user"""
    result = await db.users.delete_one({"user_id": user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Also delete related data
    await db.subscriptions.delete_many({"user_id": user_id})
    await db.user_sessions.delete_many({"user_id": user_id})
    await db.ai_chats.delete_many({"user_id": user_id})
    
    return {"message": "User deleted successfully"}

@api_router.get("/admin/subscriptions")
async def get_all_subscriptions(
    skip: int = 0,
    limit: int = 50,
    status: Optional[str] = None,
    admin: AdminUser = Depends(get_current_admin)
):
    """Get all subscriptions"""
    query = {}
    if status:
        query["status"] = status
    
    subscriptions = await db.subscriptions.find(query, {"_id": 0}).skip(skip).limit(limit).to_list(limit)
    total = await db.subscriptions.count_documents(query)
    
    # Enrich with user info
    for sub in subscriptions:
        user = await db.users.find_one({"user_id": sub["user_id"]}, {"_id": 0, "name": 1, "email": 1})
        sub["user_name"] = user["name"] if user else "Unknown"
        sub["user_email"] = user["email"] if user else "Unknown"
    
    return {"subscriptions": subscriptions, "total": total}

@api_router.put("/admin/subscriptions/{subscription_id}")
async def update_subscription(subscription_id: str, status: str, admin: AdminUser = Depends(get_current_admin)):
    """Update subscription status"""
    result = await db.subscriptions.update_one(
        {"subscription_id": subscription_id},
        {"$set": {"status": status}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Subscription not found")
    
    return {"message": "Subscription updated"}

@api_router.get("/admin/contacts")
async def get_all_contacts(
    skip: int = 0,
    limit: int = 50,
    status: Optional[str] = None,
    admin: AdminUser = Depends(get_current_admin)
):
    """Get all contact inquiries"""
    query = {}
    if status:
        query["status"] = status
    
    contacts = await db.contacts.find(query, {"_id": 0}).skip(skip).limit(limit).sort("created_at", -1).to_list(limit)
    total = await db.contacts.count_documents(query)
    
    return {"contacts": contacts, "total": total}

@api_router.put("/admin/contacts/{contact_id}")
async def update_contact(contact_id: str, update: ContactUpdate, admin: AdminUser = Depends(get_current_admin)):
    """Update contact status"""
    result = await db.contacts.update_one(
        {"contact_id": contact_id},
        {"$set": {"status": update.status, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Contact not found")
    
    return {"message": "Contact updated"}

@api_router.delete("/admin/contacts/{contact_id}")
async def delete_contact(contact_id: str, admin: AdminUser = Depends(get_current_admin)):
    """Delete a contact inquiry"""
    result = await db.contacts.delete_one({"contact_id": contact_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Contact not found")
    
    return {"message": "Contact deleted"}

@api_router.get("/admin/transactions")
async def get_all_transactions(
    skip: int = 0,
    limit: int = 50,
    status: Optional[str] = None,
    admin: AdminUser = Depends(get_current_admin)
):
    """Get all payment transactions"""
    query = {}
    if status:
        query["status"] = status
    
    transactions = await db.payment_transactions.find(query, {"_id": 0}).skip(skip).limit(limit).sort("created_at", -1).to_list(limit)
    total = await db.payment_transactions.count_documents(query)
    
    return {"transactions": transactions, "total": total}

@api_router.get("/admin/revenue/chart")
async def get_revenue_chart(days: int = 30, admin: AdminUser = Depends(get_current_admin)):
    """Get revenue data for chart"""
    start_date = (datetime.now(timezone.utc) - timedelta(days=days)).isoformat()
    
    pipeline = [
        {"$match": {"status": "completed", "created_at": {"$gte": start_date}}},
        {"$addFields": {"date": {"$substr": ["$created_at", 0, 10]}}},
        {"$group": {"_id": "$date", "revenue": {"$sum": "$amount"}, "count": {"$sum": 1}}},
        {"$sort": {"_id": 1}}
    ]
    
    results = await db.payment_transactions.aggregate(pipeline).to_list(days)
    
    return {"data": results, "period_days": days}

# ==================== GENERAL ROUTES ====================

@api_router.get("/")
async def root():
    return {"message": "FINMAR API - Australian Business Platform", "version": "1.0.0"}

@api_router.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now(timezone.utc).isoformat()}

# Include router
app.include_router(api_router)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
