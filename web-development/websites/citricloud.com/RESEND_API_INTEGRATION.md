# Resend API Integration - Complete Reference

## Overview

This document describes the complete Resend API integration for the CITRICLOUD Workspace Email system. All Resend API functions have been integrated and are accessible via REST API endpoints.

## Architecture

### Core Components

1. **ResendEmailService** (`backend/app/core/resend_service.py`)
   - Comprehensive wrapper for all Resend API operations
   - Handles send, batch, retrieve, update, cancel, list, and attachment operations
   - Singleton service instance for consistent API key management

2. **Email API Endpoints** (`backend/app/api/v1/endpoints/email.py`)
   - RESTful API endpoints for email operations
   - Integrated with database for email tracking
   - User authentication and authorization

3. **Email Utility** (`backend/app/core/email.py`)
   - Helper functions for common email operations
   - Simplified interface for sending emails

## API Endpoints

### Base URL
```
https://citricloud.com/api/v1/email
```

### Authentication
All endpoints require Bearer token authentication:
```
Authorization: Bearer <your_jwt_token>
```

---

## 1. Send Single Email

**Endpoint:** `POST /api/v1/email/send`

**Description:** Send a single email via Resend

**Request Body:**
```json
{
  "to_addresses": ["recipient@example.com"],
  "cc_addresses": ["cc@example.com"],
  "bcc_addresses": ["bcc@example.com"],
  "subject": "Your Subject",
  "body_html": "<p>HTML content</p>",
  "body_text": "Plain text content",
  "labels": ["important", "project-x"]
}
```

**Response:**
```json
{
  "id": 1,
  "user_id": 123,
  "from_address": "username@citricloud.com",
  "to_addresses": ["recipient@example.com"],
  "subject": "Your Subject",
  "status": "sent",
  "resend_email_id": "5e4d5e4d-5e4d-5e4d-5e4d-5e4d5e4d5e4d",
  "sent_at": "2025-11-28T12:00:00Z"
}
```

---

## 2. Send Batch Emails

**Endpoint:** `POST /api/v1/email/batch/send`

**Description:** Send multiple emails in a single batch operation

**Request Body:**
```json
[
  {
    "to_addresses": ["user1@example.com"],
    "subject": "Newsletter #1",
    "body_html": "<h1>Content for user 1</h1>",
    "body_text": "Text for user 1"
  },
  {
    "to_addresses": ["user2@example.com"],
    "subject": "Newsletter #2",
    "body_html": "<h1>Content for user 2</h1>",
    "body_text": "Text for user 2"
  }
]
```

**Response:**
```json
{
  "status": "batch_sent",
  "count": 2,
  "emails_sent": 2,
  "result": {
    "data": [...]
  }
}
```

---

## 3. Get Email Details from Resend

**Endpoint:** `GET /api/v1/email/resend/{resend_email_id}/details`

**Description:** Retrieve detailed information about an email from Resend API

**Response:**
```json
{
  "id": "5e4d5e4d-5e4d-5e4d-5e4d-5e4d5e4d5e4d",
  "object": "email",
  "from": "sender@citricloud.com",
  "to": ["recipient@example.com"],
  "subject": "Subject",
  "created_at": "2025-11-28T12:00:00Z",
  "last_event": "delivered"
}
```

---

## 4. List All Sent Emails

**Endpoint:** `GET /api/v1/email/resend/list/all`

**Description:** List all emails sent via Resend (for syncing/auditing)

**Response:**
```json
{
  "object": "list",
  "data": [
    {
      "id": "5e4d5e4d-5e4d-5e4d-5e4d-5e4d5e4d5e4d",
      "from": "sender@citricloud.com",
      "to": ["recipient@example.com"],
      "subject": "Subject",
      "created_at": "2025-11-28T12:00:00Z"
    }
  ]
}
```

---

## 5. Reschedule Email

**Endpoint:** `POST /api/v1/email/resend/{resend_email_id}/reschedule`

**Description:** Reschedule a scheduled email to send at a different time

**Query Parameters:**
- `minutes_from_now` (integer, default: 1) - Minutes from now to schedule

**Response:**
```json
{
  "status": "rescheduled",
  "email_id": 123,
  "resend_email_id": "5e4d5e4d-5e4d-5e4d-5e4d-5e4d5e4d5e4d",
  "scheduled_at": "2025-11-28T12:05:00Z"
}
```

---

## 6. Cancel Scheduled Email

**Endpoint:** `POST /api/v1/email/resend/{resend_email_id}/cancel`

**Description:** Cancel a scheduled email before it's sent

**Response:**
```json
{
  "status": "cancelled",
  "email_id": 123,
  "resend_email_id": "5e4d5e4d-5e4d-5e4d-5e4d-5e4d5e4d5e4d"
}
```

---

## 7. List Email Attachments (Sent)

**Endpoint:** `GET /api/v1/email/resend/{resend_email_id}/attachments`

**Description:** List all attachments for a sent email

**Response:**
```json
{
  "object": "list",
  "data": [
    {
      "id": "4a90a90a-90a9-0a90-a90a-90a90a90a90a",
      "filename": "document.pdf",
      "content_type": "application/pdf",
      "size": 12345
    }
  ]
}
```

---

## 8. Get Attachment Details (Sent)

**Endpoint:** `GET /api/v1/email/resend/{resend_email_id}/attachments/{attachment_id}`

**Description:** Get details of a specific attachment from a sent email

**Response:**
```json
{
  "id": "4a90a90a-90a9-0a90-a90a-90a90a90a90a",
  "filename": "document.pdf",
  "content_type": "application/pdf",
  "size": 12345,
  "url": "https://..."
}
```

---

## 9. List Received Emails

**Endpoint:** `GET /api/v1/email/received/list`

**Description:** List all received (inbound) emails from Resend

**Response:**
```json
{
  "object": "list",
  "data": [
    {
      "id": "5e4d5e4d-5e4d-5e4d-5e4d-5e4d5e4d5e4d",
      "from": "sender@example.com",
      "to": ["username@citricloud.com"],
      "subject": "Inbound Email",
      "received_at": "2025-11-28T12:00:00Z"
    }
  ]
}
```

---

## 10. Get Received Email Details

**Endpoint:** `GET /api/v1/email/received/{resend_email_id}`

**Description:** Get details of a specific received email

**Response:**
```json
{
  "id": "5e4d5e4d-5e4d-5e4d-5e4d-5e4d5e4d5e4d",
  "from": "sender@example.com",
  "to": ["username@citricloud.com"],
  "subject": "Inbound Email",
  "html": "<p>HTML content</p>",
  "text": "Text content",
  "received_at": "2025-11-28T12:00:00Z"
}
```

---

## 11. List Received Email Attachments

**Endpoint:** `GET /api/v1/email/received/{resend_email_id}/attachments`

**Description:** List all attachments for a received email

**Response:**
```json
{
  "object": "list",
  "data": [
    {
      "id": "abc01abc-01ab-c01a-bc01-abc01abc01ab",
      "filename": "attachment.pdf",
      "content_type": "application/pdf",
      "size": 54321
    }
  ]
}
```

---

## 12. Get Received Email Attachment

**Endpoint:** `GET /api/v1/email/received/{resend_email_id}/attachments/{attachment_id}`

**Description:** Get details and content of a specific attachment from a received email

**Response:**
```json
{
  "id": "abc01abc-01ab-c01a-bc01-abc01abc01ab",
  "filename": "attachment.pdf",
  "content_type": "application/pdf",
  "size": 54321,
  "content": "base64_encoded_content",
  "url": "https://..."
}
```

---

## Existing Email Endpoints

### 13. Create Draft
**POST** `/api/v1/email/drafts`

### 14. Get All Emails
**GET** `/api/v1/email/?folder=inbox&is_starred=true&is_read=false&search=keyword`

### 15. Get Single Email
**GET** `/api/v1/email/{email_id}`

### 16. Update Email
**PATCH** `/api/v1/email/{email_id}`

### 17. Delete Email
**DELETE** `/api/v1/email/{email_id}?permanent=false`

### 18. Reply to Email
**POST** `/api/v1/email/{email_id}/reply`

### 19. Forward Email
**POST** `/api/v1/email/{email_id}/forward`

### 20. Email Signature
- **POST** `/api/v1/email/signature` - Create/Update
- **GET** `/api/v1/email/signature` - Get

### 21. Folder Counts
**GET** `/api/v1/email/folders/counts`

### 22. Webhooks
- **POST** `/api/v1/email/webhooks/resend` - Resend delivery events
- **POST** `/api/v1/email/webhooks/inbound` - Inbound emails

---

## Python Usage Examples

### Using ResendEmailService Directly

```python
from app.core.resend_service import resend_service

# Send single email
result = resend_service.send_email(
    from_address="Acme <onboarding@resend.dev>",
    to_addresses=["delivered@resend.dev"],
    subject="hello world",
    html="<p>it works!</p>",
    text="it works!"
)

# Send batch emails
batch_result = resend_service.send_batch_emails([
    {
        "from": "Acme <onboarding@resend.dev>",
        "to": ["foo@gmail.com"],
        "subject": "hello world",
        "html": "<h1>it works!</h1>"
    },
    {
        "from": "Acme <onboarding@resend.dev>",
        "to": ["bar@outlook.com"],
        "subject": "world hello",
        "html": "<p>it works!</p>"
    }
])

# Retrieve email
email = resend_service.get_email("5e4d5e4d-5e4d-5e4d-5e4d-5e4d5e4d5e4d")

# Update/reschedule email
update = resend_service.reschedule_email(
    email_id="5e4d5e4d-5e4d-5e4d-5e4d-5e4d5e4d5e4d",
    minutes_from_now=5
)

# Cancel email
cancel = resend_service.cancel_email("5e4d5e4d-5e4d-5e4d-5e4d-5e4d5e4d5e4d")

# List emails
emails = resend_service.list_emails()

# List attachments
attachments = resend_service.list_attachments("5e4d5e4d-5e4d-5e4d-5e4d-5e4d5e4d5e4d")

# Get attachment
attachment = resend_service.get_attachment(
    email_id="5e4d5e4d-5e4d-5e4d-5e4d-5e4d5e4d5e4d",
    attachment_id="4a90a90a-90a9-0a90-a90a-90a90a90a90a"
)

# List received emails
received = resend_service.list_received_emails()

# Get received email
received_email = resend_service.get_received_email("5e4d5e4d-5e4d-5e4d-5e4d-5e4d5e4d5e4d")

# List received email attachments
received_attachments = resend_service.list_received_email_attachments("5e4d5e4d-5e4d-5e4d-5e4d-5e4d5e4d5e4d")

# Get received email attachment
received_attachment = resend_service.get_received_email_attachment(
    email_id="5e4d5e4d-5e4d-5e4d-5e4d-5e4d5e4d5e4d",
    attachment_id="abc01abc-01ab-c01a-bc01-abc01abc01ab"
)
```

### Using Email Utility Functions

```python
from app.core.email import send_email, send_bulk_emails

# Send single email
await send_email(
    to_email="recipient@example.com",
    subject="Hello",
    html_body="<p>Hello World</p>",
    text_body="Hello World",
    cc=["cc@example.com"],
    reply_to=["reply@example.com"]
)

# Send bulk emails
await send_bulk_emails([
    {
        "to": "user1@example.com",
        "subject": "Newsletter",
        "html": "<h1>Newsletter</h1>",
        "text": "Newsletter"
    },
    {
        "to": "user2@example.com",
        "subject": "Newsletter",
        "html": "<h1>Newsletter</h1>",
        "text": "Newsletter"
    }
])
```

---

## Configuration

### Environment Variables

Add to your `.env` file:

```bash
# Resend API Configuration
RESEND_API_KEY=re_ThcWuUJx_Ap7Y616uB8QUpxMFuhX3NR8W
EMAIL_FROM=CITRICLOUD <noreply@citricloud.com>
```

### Resend Dashboard Setup

1. **Domain Verification**
   - Add DNS records for `citricloud.com`
   - Verify domain in Resend dashboard

2. **Inbound Email Setup**
   - Configure MX records for receiving emails
   - Set webhook URL: `https://citricloud.com/api/v1/email/webhooks/inbound`

3. **Webhook Configuration**
   - Add webhook endpoint: `https://citricloud.com/api/v1/email/webhooks/resend`
   - Subscribe to events: `email.sent`, `email.delivered`, `email.bounced`, etc.

---

## Features

✅ **Send Single Email** - Individual email delivery  
✅ **Batch Email Sending** - Bulk email operations  
✅ **Email Retrieval** - Get email details from Resend  
✅ **Email Updates** - Reschedule or modify emails  
✅ **Email Cancellation** - Cancel scheduled emails  
✅ **Email Listing** - List all sent emails  
✅ **Attachment Management** - Upload, list, and retrieve attachments  
✅ **Received Emails** - Handle inbound emails  
✅ **Received Attachments** - Manage inbound attachments  
✅ **Webhooks** - Real-time email event notifications  
✅ **Database Integration** - Local storage of all emails  
✅ **User Authentication** - Secure access control  
✅ **Email Threading** - Conversation grouping  
✅ **Email Folders** - Inbox, Sent, Drafts, Trash, etc.  
✅ **Email Signatures** - Customizable signatures  
✅ **Reply & Forward** - Email conversation features  

---

## Security Notes

- All API endpoints require JWT authentication
- Resend API key is stored securely in environment variables
- Email content is sanitized before storage
- User-specific email isolation (users can only access their own emails)
- Webhook endpoints validate event authenticity

---

## Error Handling

All endpoints return standard HTTP status codes:

- `200 OK` - Success
- `201 Created` - Resource created
- `202 Accepted` - Batch operation accepted
- `204 No Content` - Successful deletion
- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Missing or invalid authentication
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

Error response format:
```json
{
  "detail": "Error message describing what went wrong"
}
```

---

## Testing

### API Testing with curl

```bash
# Get JWT token first
TOKEN="your_jwt_token_here"

# Send email
curl -X POST https://citricloud.com/api/v1/email/send \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "to_addresses": ["test@example.com"],
    "subject": "Test Email",
    "body_html": "<p>This is a test</p>"
  }'

# List emails
curl -X GET https://citricloud.com/api/v1/email/ \
  -H "Authorization: Bearer $TOKEN"

# Get folder counts
curl -X GET https://citricloud.com/api/v1/email/folders/counts \
  -H "Authorization: Bearer $TOKEN"
```

---

## Support

For issues or questions:
- Check logs: `backend/setup_log.txt`
- Review documentation: This file
- Contact: admin@citricloud.com

---

## Version

- **API Version:** v1
- **Resend SDK:** Python SDK (latest)
- **Last Updated:** November 28, 2025
