import requests
import json

# Test with no auth
print("Testing POST /api/v1/erp/orders without auth:")
response = requests.post(
    'http://localhost:8000/api/v1/erp/orders',
    json={
        "items": [{"product_id": 1, "quantity": 1}],
        "shipping_address": {
            "first_name": "Test",
            "last_name": "User",
            "email": "test@example.com",
            "address": "123 Test St",
            "city": "Test City",
            "country": "Test Country",
            "zip_code": "12345"
        },
        "billing_address": {
            "first_name": "Test",
            "last_name": "User",
            "email": "test@example.com",
            "address": "123 Test St",
            "city": "Test City",
            "country": "Test Country",
            "zip_code": "12345"
        }
    }
)
print(f"Status: {response.status_code}")
print(f"Response: {response.text}")
