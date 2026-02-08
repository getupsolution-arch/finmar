#!/usr/bin/env python3
"""
FINMAR Backend API Testing Suite
Tests all core API endpoints for the Australian subscription platform
"""

import requests
import sys
import json
from datetime import datetime
from typing import Dict, Any, Optional

class FinmarAPITester:
    def __init__(self, base_url="https://acctechmarkets.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.token = None
        self.user_id = None
        self.admin_token = None
        self.admin_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []
        self.session = requests.Session()
        
        # Test user credentials
        self.test_email = f"test_user_{datetime.now().strftime('%H%M%S')}@example.com"
        self.test_password = "TestPass123!"
        self.test_name = "Test User"

    def log_result(self, test_name: str, success: bool, details: str = ""):
        """Log test result"""
        self.tests_run += 1
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} - {test_name}")
        if details:
            print(f"    {details}")
        
        if success:
            self.tests_passed += 1
        else:
            self.failed_tests.append({"test": test_name, "details": details})

    def make_request(self, method: str, endpoint: str, data: Optional[Dict] = None, 
                    expected_status: int = 200, auth_required: bool = False) -> tuple:
        """Make HTTP request and return success status and response"""
        url = f"{self.base_url}/{endpoint.lstrip('/')}"
        headers = {'Content-Type': 'application/json'}
        
        if auth_required and self.token:
            headers['Authorization'] = f'Bearer {self.token}'
        
        try:
            if method.upper() == 'GET':
                response = self.session.get(url, headers=headers)
            elif method.upper() == 'POST':
                response = self.session.post(url, json=data, headers=headers)
            elif method.upper() == 'PUT':
                response = self.session.put(url, json=data, headers=headers)
            elif method.upper() == 'DELETE':
                response = self.session.delete(url, headers=headers)
            else:
                return False, {"error": f"Unsupported method: {method}"}
            
            success = response.status_code == expected_status
            try:
                response_data = response.json()
            except:
                response_data = {"text": response.text, "status_code": response.status_code}
            
            return success, response_data
            
        except Exception as e:
            return False, {"error": str(e)}

    def test_health_check(self):
        """Test API health endpoint"""
        success, response = self.make_request('GET', '/health')
        if success and response.get('status') == 'healthy':
            self.log_result("Health Check", True, "API is healthy")
        else:
            self.log_result("Health Check", False, f"Response: {response}")

    def test_root_endpoint(self):
        """Test API root endpoint"""
        success, response = self.make_request('GET', '/')
        if success and 'FINMAR API' in response.get('message', ''):
            self.log_result("Root Endpoint", True, "API root accessible")
        else:
            self.log_result("Root Endpoint", False, f"Response: {response}")

    def test_user_registration(self):
        """Test user registration"""
        user_data = {
            "email": self.test_email,
            "password": self.test_password,
            "name": self.test_name,
            "business_name": "Test Business Pty Ltd"
        }
        
        success, response = self.make_request('POST', '/auth/register', user_data)
        if success and response.get('access_token'):
            self.token = response['access_token']
            self.user_id = response['user']['user_id']
            self.log_result("User Registration", True, f"User created: {self.user_id}")
        else:
            self.log_result("User Registration", False, f"Response: {response}")

    def test_user_login(self):
        """Test user login"""
        login_data = {
            "email": self.test_email,
            "password": self.test_password
        }
        
        success, response = self.make_request('POST', '/auth/login', login_data)
        if success and response.get('access_token'):
            # Update token in case it's different
            self.token = response['access_token']
            self.log_result("User Login", True, "Login successful")
        else:
            self.log_result("User Login", False, f"Response: {response}")

    def test_get_current_user(self):
        """Test getting current user info"""
        success, response = self.make_request('GET', '/auth/me', auth_required=True)
        if success and response.get('email') == self.test_email:
            self.log_result("Get Current User", True, f"User info retrieved")
        else:
            self.log_result("Get Current User", False, f"Response: {response}")

    def test_accounting_packages(self):
        """Test accounting packages endpoint"""
        success, response = self.make_request('GET', '/packages/accounting')
        expected_tiers = ['starter', 'growth', 'advanced', 'premium']
        
        if success and all(tier in response for tier in expected_tiers):
            self.log_result("Accounting Packages", True, f"Found {len(response)} packages")
        else:
            self.log_result("Accounting Packages", False, f"Response: {response}")

    def test_marketing_packages(self):
        """Test marketing packages endpoint"""
        success, response = self.make_request('GET', '/packages/marketing')
        expected_tiers = ['basic', 'growth', 'pro', 'ultimate']
        
        if success and all(tier in response for tier in expected_tiers):
            self.log_result("Marketing Packages", True, f"Found {len(response)} packages")
        else:
            self.log_result("Marketing Packages", False, f"Response: {response}")

    def test_combined_packages(self):
        """Test combined packages endpoint"""
        success, response = self.make_request('GET', '/packages/combined')
        expected_tiers = ['essentials', 'growth', 'pro', 'executive']
        
        if success and all(tier in response for tier in expected_tiers):
            self.log_result("Combined Packages", True, f"Found {len(response)} packages")
        else:
            self.log_result("Combined Packages", False, f"Response: {response}")

    def test_addons_packages(self):
        """Test add-ons packages endpoint"""
        success, response = self.make_request('GET', '/packages/addons')
        expected_addons = ['ai_dashboard', 'ai_document', 'ai_crm']
        
        if success and any(addon in response for addon in expected_addons):
            self.log_result("Add-ons Packages", True, f"Found {len(response)} add-ons")
        else:
            self.log_result("Add-ons Packages", False, f"Response: {response}")

    def test_contact_form(self):
        """Test contact form submission"""
        contact_data = {
            "name": "Test Contact",
            "email": "test.contact@example.com",
            "phone": "+61 400 123 456",
            "business_name": "Test Business",
            "service_interest": "accounting",
            "message": "This is a test contact form submission"
        }
        
        success, response = self.make_request('POST', '/contact', contact_data)
        if success and response.get('contact_id'):
            self.log_result("Contact Form", True, f"Contact created: {response['contact_id']}")
        else:
            self.log_result("Contact Form", False, f"Response: {response}")

    def test_my_subscription(self):
        """Test getting user's subscription"""
        success, response = self.make_request('GET', '/subscriptions/my', auth_required=True)
        # New user should have no subscription (null response is expected)
        if success or response is None:
            self.log_result("My Subscription", True, "No subscription (expected for new user)")
        else:
            self.log_result("My Subscription", False, f"Response: {response}")

    # ==================== PROFILE TESTS ====================
    
    def test_get_profile(self):
        """Test GET /api/profile - get user profile data"""
        success, response = self.make_request('GET', '/profile', auth_required=True)
        if success and response.get('email') == self.test_email:
            self.log_result("Get Profile", True, f"Profile retrieved for {response.get('name')}")
        else:
            self.log_result("Get Profile", False, f"Response: {response}")

    def test_update_profile(self):
        """Test PUT /api/profile - update user profile"""
        profile_data = {
            "name": "Updated Test User",
            "business_name": "Updated Business Pty Ltd",
            "phone": "+61 400 123 456"
        }
        
        success, response = self.make_request('PUT', '/profile', profile_data, auth_required=True)
        if success and response.get('name') == profile_data['name']:
            self.log_result("Update Profile", True, f"Profile updated successfully")
        else:
            self.log_result("Update Profile", False, f"Response: {response}")

    def test_change_password(self):
        """Test POST /api/profile/change-password - change user password"""
        password_data = {
            "current_password": self.test_password,
            "new_password": "NewTestPass123!"
        }
        
        success, response = self.make_request('POST', '/profile/change-password', password_data, auth_required=True)
        if success and response.get('message'):
            # Update password for future tests
            self.test_password = password_data['new_password']
            self.log_result("Change Password", True, "Password changed successfully")
        else:
            self.log_result("Change Password", False, f"Response: {response}")

    def test_subscription_history(self):
        """Test GET /api/subscriptions/history - get subscription history"""
        success, response = self.make_request('GET', '/subscriptions/history', auth_required=True)
        if success and isinstance(response, list):
            self.log_result("Subscription History", True, f"Retrieved {len(response)} subscription records")
        else:
            self.log_result("Subscription History", False, f"Response: {response}")

    def test_subscription_change(self):
        """Test POST /api/subscriptions/change - create checkout for plan change"""
        change_data = {
            "plan_type": "accounting",
            "plan_tier": "growth",
            "origin_url": "https://acctechmarkets.preview.emergentagent.com"
        }
        
        success, response = self.make_request('POST', '/subscriptions/change', change_data, auth_required=True)
        if success and response.get('checkout_url'):
            self.log_result("Subscription Change", True, f"Checkout URL created for plan change")
        else:
            self.log_result("Subscription Change", False, f"Response: {response}")

    def test_subscription_cancel(self):
        """Test POST /api/subscriptions/cancel - cancel active subscription"""
        # First, we need to create a subscription to cancel
        # Since we can't complete a real payment, we'll test the endpoint with no active subscription
        success, response = self.make_request('POST', '/subscriptions/cancel', {}, auth_required=True, expected_status=400)
        if success or (response.get('detail') and 'No active subscription' in response['detail']):
            self.log_result("Subscription Cancel", True, "Cancel endpoint works (no active subscription to cancel)")
        else:
            self.log_result("Subscription Cancel", False, f"Response: {response}")

    def test_profile_with_test_credentials(self):
        """Test profile endpoints with the provided test credentials"""
        # Test with provided credentials
        test_login_data = {
            "email": "profile_test@test.com",
            "password": "test123"
        }
        
        success, response = self.make_request('POST', '/auth/login', test_login_data)
        if success and response.get('access_token'):
            # Store original token
            original_token = self.token
            self.token = response['access_token']
            
            # Test profile endpoints with test user
            success, profile_response = self.make_request('GET', '/profile', auth_required=True)
            if success and profile_response.get('email') == 'profile_test@test.com':
                self.log_result("Get Profile (Test Credentials)", True, f"Profile retrieved for test user")
            else:
                self.log_result("Get Profile (Test Credentials)", False, f"Response: {profile_response}")
            
            # Restore original token
            self.token = original_token
            self.log_result("Profile Test Credentials", True, "Test credentials work for profile access")
        else:
            self.log_result("Profile Test Credentials", False, f"Test credentials failed: {response}")

    def test_ai_insights(self):
        """Test AI insights endpoint"""
        ai_data = {
            "query": "What are the key benefits of proper bookkeeping for Australian small businesses?",
            "context": "Testing AI functionality"
        }
        
        success, response = self.make_request('POST', '/ai/insights', ai_data, auth_required=True)
        if success and response.get('insight'):
            insight_length = len(response['insight'])
            self.log_result("AI Insights", True, f"AI response received ({insight_length} chars)")
        else:
            self.log_result("AI Insights", False, f"Response: {response}")

    def test_ai_chat_history(self):
        """Test AI chat history endpoint"""
        success, response = self.make_request('GET', '/ai/chat-history', auth_required=True)
        if success and isinstance(response, list):
            self.log_result("AI Chat History", True, f"Found {len(response)} chat entries")
        else:
            self.log_result("AI Chat History", False, f"Response: {response}")

    def test_checkout_creation(self):
        """Test checkout session creation"""
        checkout_data = {
            "plan_type": "accounting",
            "plan_tier": "starter",
            "add_ons": ["ai_dashboard"],
            "origin_url": "https://acctechmarkets.preview.emergentagent.com"
        }
        
        success, response = self.make_request('POST', '/payments/checkout', checkout_data, auth_required=True)
        if success and response.get('checkout_url'):
            self.log_result("Checkout Creation", True, "Stripe checkout URL generated")
        else:
            self.log_result("Checkout Creation", False, f"Response: {response}")

    def test_logout(self):
        """Test user logout"""
        success, response = self.make_request('POST', '/auth/logout', auth_required=True)
        if success and response.get('message'):
            self.log_result("User Logout", True, "Logout successful")
        else:
            self.log_result("User Logout", False, f"Response: {response}")

    # ==================== ADMIN TESTS ====================
    
    def test_admin_login(self):
        """Test admin login with provided credentials"""
        admin_data = {
            "email": "sajeev@getupsolutions.com.au",
            "password": "Getup@4665"
        }
        
        success, response = self.make_request('POST', '/admin/login', admin_data)
        if success and response.get('access_token'):
            self.admin_token = response['access_token']
            self.admin_id = response['admin']['admin_id']
            self.log_result("Admin Login", True, f"Admin logged in: {self.admin_id}")
            return True
        else:
            self.log_result("Admin Login", False, f"Response: {response}")
            return False

    def test_admin_me(self):
        """Test getting current admin info"""
        headers = {'Authorization': f'Bearer {self.admin_token}'}
        success, response = self.make_request('GET', '/admin/me', auth_required=True)
        
        # Override headers for admin token
        url = f"{self.base_url}/admin/me"
        try:
            resp = self.session.get(url, headers=headers)
            success = resp.status_code == 200
            response = resp.json() if success else {"error": resp.text}
        except Exception as e:
            success, response = False, {"error": str(e)}
        
        if success and response.get('role') == 'admin':
            self.log_result("Admin Me", True, f"Admin info retrieved")
        else:
            self.log_result("Admin Me", False, f"Response: {response}")

    def test_admin_dashboard_stats(self):
        """Test admin dashboard statistics"""
        headers = {'Authorization': f'Bearer {self.admin_token}'}
        url = f"{self.base_url}/admin/dashboard/stats"
        
        try:
            resp = self.session.get(url, headers=headers)
            success = resp.status_code == 200
            response = resp.json() if success else {"error": resp.text}
        except Exception as e:
            success, response = False, {"error": str(e)}
        
        expected_fields = ['total_users', 'active_subscriptions', 'new_contacts', 'total_revenue']
        if success and all(field in response for field in expected_fields):
            self.log_result("Admin Dashboard Stats", True, f"Stats retrieved: {len(response)} fields")
        else:
            self.log_result("Admin Dashboard Stats", False, f"Response: {response}")

    def test_admin_users_list(self):
        """Test admin users list endpoint"""
        headers = {'Authorization': f'Bearer {self.admin_token}'}
        url = f"{self.base_url}/admin/users"
        
        try:
            resp = self.session.get(url, headers=headers)
            success = resp.status_code == 200
            response = resp.json() if success else {"error": resp.text}
        except Exception as e:
            success, response = False, {"error": str(e)}
        
        if success and 'users' in response and 'total' in response:
            user_count = len(response['users'])
            self.log_result("Admin Users List", True, f"Retrieved {user_count} users")
        else:
            self.log_result("Admin Users List", False, f"Response: {response}")

    def test_admin_subscriptions_list(self):
        """Test admin subscriptions list endpoint"""
        headers = {'Authorization': f'Bearer {self.admin_token}'}
        url = f"{self.base_url}/admin/subscriptions"
        
        try:
            resp = self.session.get(url, headers=headers)
            success = resp.status_code == 200
            response = resp.json() if success else {"error": resp.text}
        except Exception as e:
            success, response = False, {"error": str(e)}
        
        if success and 'subscriptions' in response:
            sub_count = len(response['subscriptions'])
            self.log_result("Admin Subscriptions List", True, f"Retrieved {sub_count} subscriptions")
        else:
            self.log_result("Admin Subscriptions List", False, f"Response: {response}")

    def test_admin_contacts_list(self):
        """Test admin contacts list endpoint"""
        headers = {'Authorization': f'Bearer {self.admin_token}'}
        url = f"{self.base_url}/admin/contacts"
        
        try:
            resp = self.session.get(url, headers=headers)
            success = resp.status_code == 200
            response = resp.json() if success else {"error": resp.text}
        except Exception as e:
            success, response = False, {"error": str(e)}
        
        if success and 'contacts' in response:
            contact_count = len(response['contacts'])
            self.log_result("Admin Contacts List", True, f"Retrieved {contact_count} contacts")
        else:
            self.log_result("Admin Contacts List", False, f"Response: {response}")

    def test_admin_transactions_list(self):
        """Test admin transactions list endpoint"""
        headers = {'Authorization': f'Bearer {self.admin_token}'}
        url = f"{self.base_url}/admin/transactions"
        
        try:
            resp = self.session.get(url, headers=headers)
            success = resp.status_code == 200
            response = resp.json() if success else {"error": resp.text}
        except Exception as e:
            success, response = False, {"error": str(e)}
        
        if success and 'transactions' in response:
            txn_count = len(response['transactions'])
            self.log_result("Admin Transactions List", True, f"Retrieved {txn_count} transactions")
        else:
            self.log_result("Admin Transactions List", False, f"Response: {response}")

    def test_admin_revenue_chart(self):
        """Test admin revenue chart endpoint"""
        headers = {'Authorization': f'Bearer {self.admin_token}'}
        url = f"{self.base_url}/admin/revenue/chart?days=30"
        
        try:
            resp = self.session.get(url, headers=headers)
            success = resp.status_code == 200
            response = resp.json() if success else {"error": resp.text}
        except Exception as e:
            success, response = False, {"error": str(e)}
        
        if success and 'data' in response:
            self.log_result("Admin Revenue Chart", True, f"Chart data retrieved")
        else:
            self.log_result("Admin Revenue Chart", False, f"Response: {response}")

    def run_all_tests(self):
        """Run all API tests"""
        print("🚀 Starting FINMAR API Tests")
        print("=" * 50)
        
        # Basic API tests
        self.test_health_check()
        self.test_root_endpoint()
        
        # Package endpoints (no auth required)
        self.test_accounting_packages()
        self.test_marketing_packages()
        self.test_combined_packages()
        self.test_addons_packages()
        
        # Contact form (no auth required)
        self.test_contact_form()
        
        # Authentication flow
        self.test_user_registration()
        if self.token:  # Only continue if registration successful
            self.test_user_login()
            self.test_get_current_user()
            
            # Profile management tests
            print("\n👤 Testing Profile Management")
            print("-" * 30)
            self.test_get_profile()
            self.test_update_profile()
            self.test_change_password()
            
            # Subscription management tests
            print("\n💳 Testing Subscription Management")
            print("-" * 30)
            self.test_my_subscription()
            self.test_subscription_history()
            self.test_subscription_change()
            self.test_subscription_cancel()
            
            # Other authenticated endpoints
            print("\n🤖 Testing Other Features")
            print("-" * 30)
            self.test_ai_insights()
            self.test_ai_chat_history()
            self.test_checkout_creation()
            
            # Test with provided credentials
            print("\n🔑 Testing Provided Credentials")
            print("-" * 30)
            self.test_profile_with_test_credentials()
            
            self.test_logout()
        
        # Admin tests
        print("\n🔐 Testing Admin Endpoints")
        print("-" * 30)
        admin_login_success = self.test_admin_login()
        if admin_login_success and self.admin_token:
            self.test_admin_me()
            self.test_admin_dashboard_stats()
            self.test_admin_users_list()
            self.test_admin_subscriptions_list()
            self.test_admin_contacts_list()
            self.test_admin_transactions_list()
            self.test_admin_revenue_chart()
        
        # Print summary
        print("\n" + "=" * 50)
        print(f"📊 Test Summary: {self.tests_passed}/{self.tests_run} passed")
        
        if self.failed_tests:
            print("\n❌ Failed Tests:")
            for failure in self.failed_tests:
                print(f"  - {failure['test']}: {failure['details']}")
        
        return self.tests_passed == self.tests_run

def main():
    """Main test runner"""
    tester = FinmarAPITester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())