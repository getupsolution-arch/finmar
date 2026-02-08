# FINMAR - Product Requirements Document

## Original Problem Statement
FINMAR is a modern Australian business combining Accounting Services, Digital Marketing, and AI-powered business tools into one integrated subscription platform. FINMAR provides a complete business support ecosystem for small and medium businesses seeking compliance + Sales and marketing growth + AI automation in one place.

## User Personas
1. **Small Business Owner** - Needs bookkeeping, BAS compliance, and basic marketing
2. **Growing Startup** - Requires comprehensive accounting + aggressive digital marketing
3. **Established SMB** - Wants full-service package with AI automation and CRM
4. **NDIS/Healthcare Provider** - Needs compliance-focused accounting with client management

## Core Requirements (Static)
- Subscription-based platform with tiered pricing (AUD)
- Accounting packages: $250-$625/month
- Marketing packages: $149-$799/month  
- Combined packages: $399-$1,299/month
- AI-powered business insights dashboard
- Stripe payment integration
- JWT + Google OAuth authentication

## Architecture
- **Frontend**: React 19 with Tailwind CSS, Framer Motion, shadcn/ui
- **Backend**: FastAPI with MongoDB
- **AI**: OpenAI GPT-5.2 via Emergent LLM Key
- **Payments**: Stripe via emergentintegrations library
- **Auth**: JWT (custom) + Google OAuth (Emergent Auth)

## What's Been Implemented (Feb 8, 2026)

### Backend API Endpoints
- ✅ `/api/auth/register` - User registration with JWT
- ✅ `/api/auth/login` - User login with JWT
- ✅ `/api/auth/session` - Google OAuth session processing
- ✅ `/api/auth/me` - Get current user
- ✅ `/api/auth/logout` - User logout
- ✅ `/api/packages/accounting` - Accounting pricing tiers
- ✅ `/api/packages/marketing` - Marketing pricing tiers
- ✅ `/api/packages/combined` - Combined package pricing
- ✅ `/api/packages/addons` - Add-on services
- ✅ `/api/subscriptions/my` - Get user subscription
- ✅ `/api/payments/checkout` - Create Stripe checkout
- ✅ `/api/payments/status/{session_id}` - Check payment status
- ✅ `/api/webhook/stripe` - Stripe webhook handler
- ✅ `/api/ai/insights` - AI business insights (GPT-5.2)
- ✅ `/api/ai/chat-history` - AI conversation history
- ✅ `/api/contact` - Contact form submission

### Frontend Pages
- ✅ Homepage - Hero, stats, services overview, testimonials, CTA
- ✅ Services - Accounting, Marketing, AI tools sections
- ✅ Pricing - Interactive tier selection with Combined/Accounting/Marketing tabs
- ✅ Contact - Contact form with service interest dropdown
- ✅ Login - Email/password + Google OAuth
- ✅ Register - Full registration form + Google OAuth
- ✅ Dashboard - Subscription status, AI assistant, quick actions
- ✅ Payment Success - Payment verification polling

### Design System
- Font: Outfit (headings) + Plus Jakarta Sans (body)
- Primary: Deep Navy #0F172A
- Secondary: Wattle Gold #F59E0B
- Accent: Coral #F43F5E

## Prioritized Backlog

### P0 (Critical) - Completed
- [x] User authentication (JWT + Google OAuth)
- [x] Subscription tiers display
- [x] Stripe payment integration
- [x] AI insights dashboard

### P1 (High Priority) - Next Phase
- [ ] User profile management
- [ ] Subscription upgrade/downgrade flow
- [ ] Billing history page
- [ ] Email notifications for payment events
- [ ] Password reset flow

### P2 (Medium Priority)
- [ ] Admin dashboard for managing users
- [ ] Service request/support tickets
- [ ] Document upload for accounting
- [ ] Marketing campaign reports
- [ ] Advanced AI analytics

### P3 (Nice to Have)
- [ ] Mobile app (PWA)
- [ ] Multi-user business accounts
- [ ] API access for integrations
- [ ] Custom reporting builder
- [ ] White-label options

## Next Tasks List
1. Implement user profile editing
2. Add subscription change flow (upgrade/downgrade)
3. Create billing history with invoice downloads
4. Add email notifications via SendGrid/Resend
5. Implement password reset with email verification
