#!/usr/bin/env python3
"""
Script to initialize all default roles in the database
Run this after updating the backend to create missing role entries

Usage:
    python3 initialize_roles.py [email] [password]
    
    If email/password not provided, will use env vars or defaults
"""
import requests
import sys
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configuration
API_URL = os.getenv('API_URL', 'http://localhost:8000')
API_BASE = f"{API_URL}/api/v1"

def get_admin_token(email=None, password=None):
    """Get authentication token for an admin user"""
    # Try command line args, then env vars, then defaults
    email = email or os.getenv('ADMIN_EMAIL', 'admin@citricloud.com')
    password = password or os.getenv('ADMIN_PASSWORD', 'admin123')
    
    print(f"Attempting to login as {email}...")
    
    try:
        response = requests.post(
            f"{API_BASE}/auth/login",
            json={
                'email': email,
                'password': password
            },
            headers={'Content-Type': 'application/json'}
        )
        response.raise_for_status()
        data = response.json()
        print("✓ Login successful")
        return data.get('access_token')
    except requests.exceptions.RequestException as e:
        print(f"✗ Login failed: {e}")
        if hasattr(e.response, 'text'):
            print(f"  Response: {e.response.text}")
        print("\nPlease provide valid admin credentials:")
        print("  python3 initialize_roles.py <email> <password>")
        sys.exit(1)

def initialize_roles(token):
    """Call the initialize roles endpoint"""
    print("\nInitializing roles...")
    
    try:
        response = requests.post(
            f"{API_BASE}/crm/roles/initialize",
            headers={
                'Authorization': f'Bearer {token}',
                'Content-Type': 'application/json'
            }
        )
        response.raise_for_status()
        data = response.json()
        
        print("✓ Roles initialized successfully!")
        print(f"  Created: {data.get('successCount', 0)} roles")
        print(f"  Skipped: {data.get('skipCount', 0)} existing roles")
        print(f"  Message: {data.get('message', 'Done')}")
        
        return True
    except requests.exceptions.RequestException as e:
        print(f"✗ Role initialization failed: {e}")
        if hasattr(e, 'response') and e.response is not None:
            print(f"  Status: {e.response.status_code}")
            print(f"  Response: {e.response.text}")
        return False

def main():
    print("=" * 60)
    print("CITRICLOUD - Role Initialization Script")
    print("=" * 60)
    print()
    
    # Get credentials from command line if provided
    email = sys.argv[1] if len(sys.argv) > 1 else None
    password = sys.argv[2] if len(sys.argv) > 2 else None
    
    # Get admin token
    token = get_admin_token(email, password)
    
    # Initialize roles
    if initialize_roles(token):
        print("\n" + "=" * 60)
        print("SUCCESS: All roles have been initialized")
        print("=" * 60)
        sys.exit(0)
    else:
        print("\n" + "=" * 60)
        print("FAILED: Role initialization encountered errors")
        print("=" * 60)
        sys.exit(1)

if __name__ == "__main__":
    main()
