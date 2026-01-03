#!/usr/bin/env python3
"""
Test script for Resend API integration
Tests all email operations to ensure proper connectivity
"""
import asyncio
import sys
from pathlib import Path

# Add backend to path
backend_path = Path(__file__).parent
sys.path.insert(0, str(backend_path))

from app.core.resend_service import resend_service
from app.core.config import settings


async def test_resend_integration():
    """Test all Resend API operations"""
    
    print("=" * 70)
    print("CITRICLOUD - Resend API Integration Test")
    print("=" * 70)
    print()
    
    # Check API key configuration
    print("1. Configuration Check")
    print("-" * 70)
    if not settings.RESEND_API_KEY or settings.RESEND_API_KEY == "your_resend_api_key_here":
        print("❌ RESEND_API_KEY not configured!")
        print("   Please set RESEND_API_KEY in your .env file")
        return False
    else:
        print(f"✓ API Key configured: {settings.RESEND_API_KEY[:10]}...")
        print(f"✓ From address: {settings.EMAIL_FROM}")
    print()
    
    # Test 1: List emails (safe operation)
    print("2. Testing List Emails")
    print("-" * 70)
    result = resend_service.list_emails()
    if result["success"]:
        print("✓ List emails successful")
        print(f"  Response type: {type(result['data'])}")
    else:
        print(f"❌ List emails failed: {result['error']}")
    print()
    
    # Test 2: List received emails
    print("3. Testing List Received Emails")
    print("-" * 70)
    result = resend_service.list_received_emails()
    if result["success"]:
        print("✓ List received emails successful")
        print(f"  Response type: {type(result['data'])}")
    else:
        print(f"❌ List received emails failed: {result['error']}")
    print()
    
    # Test 3: Send test email (if configured)
    test_email = input("Enter test email address (or press Enter to skip): ").strip()
    if test_email:
        print()
        print("4. Testing Send Email")
        print("-" * 70)
        result = resend_service.send_email(
            from_address=settings.EMAIL_FROM,
            to_addresses=[test_email],
            subject="CITRICLOUD Test Email",
            html="<h1>Test Email</h1><p>This is a test email from CITRICLOUD workspace.</p>",
            text="Test Email - This is a test email from CITRICLOUD workspace."
        )
        
        if result["success"]:
            print("✓ Email sent successfully!")
            print(f"  Email ID: {result['data'].get('id', 'N/A')}")
            
            # Try to retrieve the email
            email_id = result['data'].get('id')
            if email_id:
                print()
                print("5. Testing Retrieve Email")
                print("-" * 70)
                retrieve_result = resend_service.get_email(email_id)
                if retrieve_result["success"]:
                    print("✓ Email retrieved successfully")
                    print(f"  Subject: {retrieve_result['data'].get('subject', 'N/A')}")
                else:
                    print(f"❌ Email retrieval failed: {retrieve_result['error']}")
        else:
            print(f"❌ Email send failed: {result['error']}")
        print()
    
    print("=" * 70)
    print("Integration Test Complete")
    print("=" * 70)
    print()
    print("Next steps:")
    print("1. Check your Resend dashboard for sent emails")
    print("2. Configure webhooks for inbound emails")
    print("3. Set up domain authentication")
    print("4. Test the API endpoints via the frontend")
    print()
    
    return True


if __name__ == "__main__":
    try:
        asyncio.run(test_resend_integration())
    except KeyboardInterrupt:
        print("\n\nTest interrupted by user")
    except Exception as e:
        print(f"\n\nError during testing: {str(e)}")
        import traceback
        traceback.print_exc()
