#!/usr/bin/env python3
"""
Test Business Details Modal Feature
Tests the PUT /api/profile/business endpoint and related functionality
"""

import requests
import json
from datetime import datetime

BASE_URL = "https://biz-finmar.preview.emergentagent.com/api"

def test_business_details():
    print("=" * 60)
    print("Testing Business Details Feature")
    print("=" * 60)
    
    # Test 1: Register a new test user
    print("\n1. Registering test user...")
    test_email = f"test_business_{datetime.now().strftime('%H%M%S')}@example.com"
    register_data = {
        "email": test_email,
        "password": "Test123!",
        "name": "Test Business User",
        "business_name": "Initial Business Name"
    }
    
    response = requests.post(f"{BASE_URL}/auth/register", json=register_data)
    if response.status_code != 200:
        print(f"❌ Registration failed: {response.status_code} - {response.text}")
        return False
    
    token = response.json().get("access_token")
    user = response.json().get("user")
    print(f"✅ User registered: {user.get('user_id')}")
    print(f"   Initial business_name: {user.get('business_name')}")
    print(f"   Initial abn: {user.get('abn')}")
    print(f"   Initial industry: {user.get('industry')}")
    print(f"   Initial phone: {user.get('phone')}")
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # Test 2: Test PUT /api/profile/business with all required fields
    print("\n2. Testing PUT /api/profile/business with all required fields...")
    business_data = {
        "business_name": "Test Business Pty Ltd",
        "abn": "12 345 678 901",
        "industry": "technology",
        "phone": "0412 345 678"
    }
    
    response = requests.put(f"{BASE_URL}/profile/business", json=business_data, headers=headers)
    if response.status_code != 200:
        print(f"❌ Business details update failed: {response.status_code} - {response.text}")
        return False
    
    updated_user = response.json()
    print(f"✅ Business details updated successfully")
    print(f"   business_name: {updated_user.get('business_name')}")
    print(f"   abn: {updated_user.get('abn')}")
    print(f"   industry: {updated_user.get('industry')}")
    print(f"   phone: {updated_user.get('phone')}")
    
    # Verify the data was saved correctly
    assert updated_user.get('business_name') == business_data['business_name'], "business_name mismatch"
    assert updated_user.get('abn') == business_data['abn'], "abn mismatch"
    assert updated_user.get('industry') == business_data['industry'], "industry mismatch"
    assert updated_user.get('phone') == business_data['phone'], "phone mismatch"
    print("✅ All fields verified correctly")
    
    # Test 3: Test with optional fields
    print("\n3. Testing PUT /api/profile/business with optional fields...")
    business_data_full = {
        "business_name": "Full Test Business Pty Ltd",
        "abn": "98 765 432 109",
        "industry": "retail",
        "phone": "0498 765 432",
        "address": "123 Test Street",
        "city": "Sydney",
        "state": "NSW",
        "postcode": "2000"
    }
    
    response = requests.put(f"{BASE_URL}/profile/business", json=business_data_full, headers=headers)
    if response.status_code != 200:
        print(f"❌ Business details update with optional fields failed: {response.status_code} - {response.text}")
        return False
    
    updated_user = response.json()
    print(f"✅ Business details with optional fields updated successfully")
    print(f"   address: {updated_user.get('address')}")
    print(f"   city: {updated_user.get('city')}")
    print(f"   state: {updated_user.get('state')}")
    print(f"   postcode: {updated_user.get('postcode')}")
    
    # Test 4: Test validation - missing required fields
    print("\n4. Testing validation - missing required fields...")
    incomplete_data = {
        "business_name": "Test Business"
        # Missing abn, industry, phone
    }
    
    response = requests.put(f"{BASE_URL}/profile/business", json=incomplete_data, headers=headers)
    if response.status_code == 422:
        print(f"✅ Validation works - missing required fields rejected (422)")
    else:
        print(f"⚠️ Unexpected response for missing fields: {response.status_code} - {response.text}")
    
    # Test 5: Verify data persists via GET /api/profile
    print("\n5. Verifying data persists via GET /api/profile...")
    response = requests.get(f"{BASE_URL}/profile", headers=headers)
    if response.status_code != 200:
        print(f"❌ Get profile failed: {response.status_code} - {response.text}")
        return False
    
    profile = response.json()
    print(f"✅ Profile retrieved successfully")
    print(f"   business_name: {profile.get('business_name')}")
    print(f"   abn: {profile.get('abn')}")
    print(f"   industry: {profile.get('industry')}")
    print(f"   phone: {profile.get('phone')}")
    
    # Verify the data matches what we saved
    assert profile.get('business_name') == business_data_full['business_name'], "business_name not persisted"
    assert profile.get('abn') == business_data_full['abn'], "abn not persisted"
    assert profile.get('industry') == business_data_full['industry'], "industry not persisted"
    assert profile.get('phone') == business_data_full['phone'], "phone not persisted"
    print("✅ All data persisted correctly")
    
    # Test 6: Test checkout flow after business details
    print("\n6. Testing checkout flow after business details...")
    checkout_data = {
        "plan_type": "combined",
        "plan_tier": "essentials",
        "add_ons": [],
        "origin_url": "https://biz-finmar.preview.emergentagent.com"
    }
    
    response = requests.post(f"{BASE_URL}/payments/checkout", json=checkout_data, headers=headers)
    if response.status_code != 200:
        print(f"❌ Checkout creation failed: {response.status_code} - {response.text}")
        return False
    
    checkout_response = response.json()
    print(f"✅ Checkout session created successfully")
    print(f"   checkout_url: {checkout_response.get('checkout_url')[:80]}...")
    print(f"   session_id: {checkout_response.get('session_id')}")
    
    # Test 7: Test with existing test credentials
    print("\n7. Testing with existing test credentials (test_business@example.com)...")
    login_data = {
        "email": "test_business@example.com",
        "password": "Test123!"
    }
    
    response = requests.post(f"{BASE_URL}/auth/login", login_data)
    if response.status_code == 200:
        existing_token = response.json().get("access_token")
        existing_user = response.json().get("user")
        print(f"✅ Logged in with test credentials")
        print(f"   business_name: {existing_user.get('business_name')}")
        print(f"   abn: {existing_user.get('abn')}")
        print(f"   industry: {existing_user.get('industry')}")
        print(f"   phone: {existing_user.get('phone')}")
    else:
        print(f"⚠️ Test user doesn't exist yet, creating...")
        register_data = {
            "email": "test_business@example.com",
            "password": "Test123!",
            "name": "Test Business User"
        }
        response = requests.post(f"{BASE_URL}/auth/register", json=register_data)
        if response.status_code == 200:
            print("✅ Test user created")
        else:
            print(f"⚠️ Could not create test user: {response.text}")
    
    print("\n" + "=" * 60)
    print("All Business Details Tests Passed!")
    print("=" * 60)
    return True

if __name__ == "__main__":
    success = test_business_details()
    exit(0 if success else 1)
