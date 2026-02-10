#!/usr/bin/env python3
"""
Test Suite for Business Details Feature
Tests PUT /api/profile/business endpoint and related functionality
"""

import pytest
import requests
import os
from datetime import datetime

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://biz-finmar.preview.emergentagent.com')

class TestBusinessDetailsAPI:
    """Tests for the Business Details API endpoint"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup test user and get auth token"""
        self.base_url = f"{BASE_URL}/api"
        self.test_email = f"test_biz_{datetime.now().strftime('%H%M%S%f')}@example.com"
        self.test_password = "Test123!"
        
        # Register test user
        register_data = {
            "email": self.test_email,
            "password": self.test_password,
            "name": "Test Business User",
            "business_name": "Initial Business"
        }
        
        response = requests.post(f"{self.base_url}/auth/register", json=register_data)
        if response.status_code == 200:
            self.token = response.json().get("access_token")
            self.user_id = response.json().get("user", {}).get("user_id")
        else:
            pytest.skip(f"Could not register test user: {response.text}")
        
        self.headers = {"Authorization": f"Bearer {self.token}"}
        yield
        
        # Cleanup - no explicit cleanup needed as test users are unique
    
    def test_update_business_details_all_required_fields(self):
        """Test PUT /api/profile/business with all required fields"""
        business_data = {
            "business_name": "Test Business Pty Ltd",
            "abn": "12 345 678 901",
            "industry": "technology",
            "phone": "0412 345 678"
        }
        
        response = requests.put(
            f"{self.base_url}/profile/business",
            json=business_data,
            headers=self.headers
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data["business_name"] == business_data["business_name"]
        assert data["abn"] == business_data["abn"]
        assert data["industry"] == business_data["industry"]
        assert data["phone"] == business_data["phone"]
    
    def test_update_business_details_with_optional_fields(self):
        """Test PUT /api/profile/business with optional address fields"""
        business_data = {
            "business_name": "Full Test Business Pty Ltd",
            "abn": "98 765 432 109",
            "industry": "retail",
            "phone": "0498 765 432",
            "address": "123 Test Street",
            "city": "Sydney",
            "state": "NSW",
            "postcode": "2000"
        }
        
        response = requests.put(
            f"{self.base_url}/profile/business",
            json=business_data,
            headers=self.headers
        )
        
        assert response.status_code == 200
        
        data = response.json()
        assert data["address"] == business_data["address"]
        assert data["city"] == business_data["city"]
        assert data["state"] == business_data["state"]
        assert data["postcode"] == business_data["postcode"]
    
    def test_update_business_details_missing_required_fields(self):
        """Test validation - missing required fields should return 422"""
        incomplete_data = {
            "business_name": "Test Business"
            # Missing abn, industry, phone
        }
        
        response = requests.put(
            f"{self.base_url}/profile/business",
            json=incomplete_data,
            headers=self.headers
        )
        
        assert response.status_code == 422, f"Expected 422 for missing fields, got {response.status_code}"
    
    def test_business_details_persist_via_get_profile(self):
        """Test that business details persist and can be retrieved via GET /api/profile"""
        # First update business details
        business_data = {
            "business_name": "Persistent Business Pty Ltd",
            "abn": "11 222 333 444",
            "industry": "healthcare",
            "phone": "0411 222 333"
        }
        
        update_response = requests.put(
            f"{self.base_url}/profile/business",
            json=business_data,
            headers=self.headers
        )
        assert update_response.status_code == 200
        
        # Now retrieve via GET /api/profile
        get_response = requests.get(
            f"{self.base_url}/profile",
            headers=self.headers
        )
        
        assert get_response.status_code == 200
        
        profile = get_response.json()
        assert profile["business_name"] == business_data["business_name"]
        assert profile["abn"] == business_data["abn"]
        assert profile["industry"] == business_data["industry"]
        assert profile["phone"] == business_data["phone"]
    
    def test_business_details_without_auth(self):
        """Test that endpoint requires authentication"""
        business_data = {
            "business_name": "Test Business",
            "abn": "12 345 678 901",
            "industry": "technology",
            "phone": "0412 345 678"
        }
        
        response = requests.put(
            f"{self.base_url}/profile/business",
            json=business_data
            # No auth headers
        )
        
        assert response.status_code == 401, f"Expected 401 without auth, got {response.status_code}"
    
    def test_checkout_after_business_details(self):
        """Test that checkout works after saving business details"""
        # First save business details
        business_data = {
            "business_name": "Checkout Test Business",
            "abn": "55 666 777 888",
            "industry": "professional",
            "phone": "0455 666 777"
        }
        
        update_response = requests.put(
            f"{self.base_url}/profile/business",
            json=business_data,
            headers=self.headers
        )
        assert update_response.status_code == 200
        
        # Now create checkout session
        checkout_data = {
            "plan_type": "combined",
            "plan_tier": "essentials",
            "add_ons": [],
            "origin_url": BASE_URL
        }
        
        checkout_response = requests.post(
            f"{self.base_url}/payments/checkout",
            json=checkout_data,
            headers=self.headers
        )
        
        assert checkout_response.status_code == 200
        
        checkout = checkout_response.json()
        assert "checkout_url" in checkout
        assert "session_id" in checkout
        assert "stripe.com" in checkout["checkout_url"]


class TestIndustryOptions:
    """Test that all industry options are valid"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup test user"""
        self.base_url = f"{BASE_URL}/api"
        self.test_email = f"test_ind_{datetime.now().strftime('%H%M%S%f')}@example.com"
        
        register_data = {
            "email": self.test_email,
            "password": "Test123!",
            "name": "Industry Test User"
        }
        
        response = requests.post(f"{self.base_url}/auth/register", json=register_data)
        if response.status_code == 200:
            self.token = response.json().get("access_token")
        else:
            pytest.skip(f"Could not register test user: {response.text}")
        
        self.headers = {"Authorization": f"Bearer {self.token}"}
    
    @pytest.mark.parametrize("industry", [
        "retail",
        "hospitality",
        "construction",
        "healthcare",
        "professional",
        "technology",
        "ndis",
        "manufacturing",
        "transport",
        "real_estate",
        "education",
        "other"
    ])
    def test_valid_industry_options(self, industry):
        """Test that all industry options from the frontend dropdown are accepted"""
        business_data = {
            "business_name": f"Test {industry.title()} Business",
            "abn": "12 345 678 901",
            "industry": industry,
            "phone": "0412 345 678"
        }
        
        response = requests.put(
            f"{self.base_url}/profile/business",
            json=business_data,
            headers=self.headers
        )
        
        assert response.status_code == 200, f"Industry '{industry}' should be valid"
        assert response.json()["industry"] == industry


class TestPackagesAPI:
    """Test package endpoints used by pricing page"""
    
    def test_get_combined_packages(self):
        """Test GET /api/packages/combined"""
        response = requests.get(f"{BASE_URL}/api/packages/combined")
        
        assert response.status_code == 200
        
        packages = response.json()
        expected_tiers = ["essentials", "growth", "pro", "executive"]
        
        for tier in expected_tiers:
            assert tier in packages, f"Missing tier: {tier}"
            assert "name" in packages[tier]
            assert "price" in packages[tier]
    
    def test_get_accounting_packages(self):
        """Test GET /api/packages/accounting"""
        response = requests.get(f"{BASE_URL}/api/packages/accounting")
        
        assert response.status_code == 200
        
        packages = response.json()
        expected_tiers = ["starter", "growth", "advanced", "premium"]
        
        for tier in expected_tiers:
            assert tier in packages
    
    def test_get_marketing_packages(self):
        """Test GET /api/packages/marketing"""
        response = requests.get(f"{BASE_URL}/api/packages/marketing")
        
        assert response.status_code == 200
        
        packages = response.json()
        expected_tiers = ["basic", "growth", "pro", "ultimate"]
        
        for tier in expected_tiers:
            assert tier in packages
    
    def test_get_addons(self):
        """Test GET /api/packages/addons"""
        response = requests.get(f"{BASE_URL}/api/packages/addons")
        
        assert response.status_code == 200
        
        addons = response.json()
        expected_addons = ["ai_dashboard", "ai_document", "ai_crm", "website_branding", "ecommerce"]
        
        for addon in expected_addons:
            assert addon in addons


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
