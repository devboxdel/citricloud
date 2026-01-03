# API Testing Guide - CITRICLOUD

## Base URL
- Development: `http://localhost:8000/api/v1`
- Production: `https://yourdomain.com/api/v1`

## Authentication

All authenticated endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <access_token>
```

---

## Authentication Endpoints

### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "username": "johndoe",
  "password": "SecurePass123!",
  "full_name": "John Doe",
  "phone": "+1234567890"
}
```

Response:
```json
{
  "id": 1,
  "email": "user@example.com",
  "username": "johndoe",
  "full_name": "John Doe",
  "role": "user",
  "is_active": true,
  "is_verified": false,
  "created_at": "2025-11-25T10:00:00Z"
}
```

### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

Response:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

### Refresh Token
```http
POST /auth/refresh
Content-Type: application/json

{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## CRM Endpoints (Admin Only)

### List Users
```http
GET /crm/users?page=1&page_size=20&search=john&role=user&is_active=true
Authorization: Bearer <token>
```

Response:
```json
{
  "items": [
    {
      "id": 1,
      "email": "user@example.com",
      "username": "johndoe",
      "full_name": "John Doe",
      "role": "user",
      "is_active": true,
      "created_at": "2025-11-25T10:00:00Z"
    }
  ],
  "total": 1,
  "page": 1,
  "page_size": 20,
  "total_pages": 1
}
```

### Get User by ID
```http
GET /crm/users/1
Authorization: Bearer <token>
```

### Create User
```http
POST /crm/users
Authorization: Bearer <token>
Content-Type: application/json

{
  "email": "newuser@example.com",
  "username": "newuser",
  "password": "SecurePass123!",
  "full_name": "New User",
  "role": "user"
}
```

### Update User
```http
PUT /crm/users/1
Authorization: Bearer <token>
Content-Type: application/json

{
  "full_name": "Updated Name",
  "phone": "+1234567890"
}
```

### Delete User
```http
DELETE /crm/users/1
Authorization: Bearer <token>
```

### Get CRM Stats
```http
GET /crm/stats
Authorization: Bearer <token>
```

Response:
```json
{
  "total_users": 100,
  "active_users": 95,
  "inactive_users": 5,
  "users_by_role": {
    "user": 90,
    "administrator": 8,
    "system_admin": 2
  }
}
```

---

## CMS Endpoints (Admin Only)

### Pages

#### List Pages
```http
GET /cms/pages?page=1&page_size=20&search=home&status=published
Authorization: Bearer <token>
```

#### Get Page by ID
```http
GET /cms/pages/1
Authorization: Bearer <token>
```

#### Create Page
```http
POST /cms/pages
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "About Us",
  "slug": "about-us",
  "content": "<p>Welcome to our website!</p>",
  "meta_title": "About Us - CITRICLOUD",
  "meta_description": "Learn more about CITRICLOUD",
  "status": "published",
  "template": "default"
}
```

#### Update Page
```http
PUT /cms/pages/1
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated Title",
  "content": "<p>Updated content</p>",
  "status": "published"
}
```

#### Delete Page
```http
DELETE /cms/pages/1
Authorization: Bearer <token>
```

### Blog Posts

#### List Blog Posts
```http
GET /cms/blog/posts?page=1&page_size=20&category_id=1&status=published
Authorization: Bearer <token>
```

#### Create Blog Post
```http
POST /cms/blog/posts
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Getting Started with CITRICLOUD",
  "slug": "getting-started",
  "excerpt": "A quick guide to get started",
  "content": "<p>Full blog content here...</p>",
  "featured_image": "https://example.com/image.jpg",
  "category_id": 1,
  "status": "published"
}
```

### Products

#### List Products
```http
GET /cms/products?page=1&page_size=20&category_id=1
Authorization: Bearer <token>
```

#### Create Product
```http
POST /cms/products
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Premium Dashboard Package",
  "slug": "premium-dashboard",
  "description": "Full-featured dashboard solution",
  "short_description": "Premium features included",
  "sku": "PKG-001",
  "price": 99.99,
  "sale_price": 79.99,
  "category_id": 1,
  "images": ["https://example.com/image1.jpg"],
  "stock_quantity": 100,
  "is_featured": true
}
```

### Get CMS Stats
```http
GET /cms/stats
Authorization: Bearer <token>
```

---

## ERP Endpoints

### Orders

#### List Orders (Admin)
```http
GET /erp/orders?page=1&page_size=20&status=pending&user_id=1
Authorization: Bearer <token>
```

#### Get Order by ID
```http
GET /erp/orders/1
Authorization: Bearer <token>
```

#### Create Order
```http
POST /erp/orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "items": [
    {
      "product_id": 1,
      "quantity": 2
    }
  ],
  "shipping_address": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zip": "10001",
    "country": "USA"
  },
  "billing_address": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zip": "10001",
    "country": "USA"
  },
  "notes": "Please deliver between 9am-5pm"
}
```

#### Update Order Status (Admin)
```http
PUT /erp/orders/1
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "processing",
  "notes": "Order being prepared"
}
```

### Invoices

#### List Invoices (Admin)
```http
GET /erp/invoices?page=1&page_size=20&status=paid
Authorization: Bearer <token>
```

#### Get Invoice by ID
```http
GET /erp/invoices/1
Authorization: Bearer <token>
```

#### Create Invoice (Admin)
```http
POST /erp/invoices
Authorization: Bearer <token>
Content-Type: application/json

{
  "order_id": 1,
  "due_date": "2025-12-31T23:59:59Z",
  "notes": "Payment due within 30 days"
}
```

#### Update Invoice (Admin)
```http
PUT /erp/invoices/1
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "paid",
  "notes": "Payment received"
}
```

### Tickets

#### List Tickets
```http
GET /erp/tickets?page=1&page_size=20&status=open&priority=high
Authorization: Bearer <token>
```

#### Get Ticket by ID
```http
GET /erp/tickets/1
Authorization: Bearer <token>
```

#### Create Ticket
```http
POST /erp/tickets
Authorization: Bearer <token>
Content-Type: application/json

{
  "subject": "Cannot access dashboard",
  "description": "I'm getting an error when trying to log in to the dashboard",
  "priority": "high"
}
```

#### Update Ticket (Admin)
```http
PUT /erp/tickets/1
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "in_progress",
  "priority": "medium",
  "assigned_to": 2
}
```

### Get ERP Stats
```http
GET /erp/stats
Authorization: Bearer <token>
```

Response:
```json
{
  "total_orders": 156,
  "total_revenue": 15600.50,
  "paid_invoices": 120,
  "pending_invoices": 36,
  "open_tickets": 12,
  "resolved_tickets": 88
}
```

---

## Testing with cURL

### Register
```bash
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "password": "TestPass123!",
    "full_name": "Test User"
  }'
```

### Login
```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123!"
  }'
```

### Use Token
```bash
TOKEN="your_access_token_here"

curl -X GET http://localhost:8000/api/v1/crm/stats \
  -H "Authorization: Bearer $TOKEN"
```

---

## Testing with Python

```python
import requests

BASE_URL = "http://localhost:8000/api/v1"

# Register
response = requests.post(
    f"{BASE_URL}/auth/register",
    json={
        "email": "test@example.com",
        "username": "testuser",
        "password": "TestPass123!",
        "full_name": "Test User"
    }
)
print(response.json())

# Login
response = requests.post(
    f"{BASE_URL}/auth/login",
    json={
        "email": "test@example.com",
        "password": "TestPass123!"
    }
)
tokens = response.json()
access_token = tokens["access_token"]

# Make authenticated request
headers = {"Authorization": f"Bearer {access_token}"}
response = requests.get(f"{BASE_URL}/crm/stats", headers=headers)
print(response.json())
```

---

## Error Responses

### 400 Bad Request
```json
{
  "error": true,
  "message": "Validation error",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format",
      "type": "value_error"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "error": true,
  "message": "Invalid authentication credentials",
  "status_code": 401
}
```

### 403 Forbidden
```json
{
  "error": true,
  "message": "You don't have permission to access this resource",
  "status_code": 403
}
```

### 404 Not Found
```json
{
  "error": true,
  "message": "Resource not found",
  "status_code": 404
}
```

### 500 Internal Server Error
```json
{
  "error": true,
  "message": "Internal server error",
  "status_code": 500
}
```

---

## Rate Limiting

Default rate limits:
- Anonymous: 100 requests per minute
- Authenticated: 1000 requests per minute

Rate limit headers:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
```

---

## API Documentation

Interactive API documentation available at:
- Swagger UI: `http://localhost:8000/api/v1/docs`
- ReDoc: `http://localhost:8000/api/v1/redoc`
