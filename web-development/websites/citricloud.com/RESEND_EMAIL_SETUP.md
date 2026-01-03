# Resend Email Integration Guide

This guide explains how to set up and use Resend for sending and receiving emails in CITRICLOUD Workspace Email.

## Overview

CITRICLOUD uses [Resend](https://resend.com) as its email service provider for reliable transactional and workspace email functionality. This integration enables:

- ✅ Sending emails from Workspace Email
- ✅ Receiving emails via webhooks
- ✅ Email tracking (sent, delivered, bounced)
- ✅ Email signatures
- ✅ Reply and forward functionality
- ✅ Draft management

## Setup Instructions

### 1. Resend Account Setup

1. **Sign up for Resend**: Visit [resend.com](https://resend.com) and create an account
2. **Get API Key**: Navigate to API Keys section and copy your API key
3. **Verify Domain** (Optional but recommended):
   - Add your custom domain (e.g., `citricloud.com`)
   - Add required DNS records (SPF, DKIM, DMARC)
   - Wait for verification (usually takes a few minutes)

### 2. Backend Configuration

The API key is already configured in `.env`:

```bash
# Email - Resend API
RESEND_API_KEY=re_ThcWuUJx_Ap7Y616uB8QUpxMFuhX3NR8W
EMAIL_FROM=onboarding@resend.dev
FRONTEND_URL=http://localhost:5173
PASSWORD_RESET_TOKEN_TTL_MINUTES=15
```

**For production**, update these values:
- `EMAIL_FROM`: Change to your verified domain email (e.g., `noreply@citricloud.com`)
- `FRONTEND_URL`: Update to your production URL
- `RESEND_API_KEY`: Use a production API key (keep secret!)

### 3. Database Setup

Run migrations to create email tables:

```bash
cd backend

# If using Alembic
alembic upgrade head

# Or create tables directly
python -c "
import asyncio
from app.core.database import engine, Base
from app.models.models import *
from app.models.email_models import *

async def create_tables():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print('✓ Email tables created')

asyncio.run(create_tables())
"
```

### 4. Configure Resend Webhooks

To receive emails and track delivery status, set up webhooks in Resend dashboard:

#### A. Email Events Webhook (Tracking)
- **Endpoint**: `https://yourdomain.com/api/v1/email/webhooks/resend`
- **Events**: Select all (email.sent, email.delivered, email.bounced, etc.)
- **Purpose**: Updates email delivery status in database

#### B. Inbound Email Webhook (Receiving)
- **Endpoint**: `https://yourdomain.com/api/v1/email/webhooks/inbound`
- **Purpose**: Receives incoming emails sent to user addresses
- **Email Format**: `username@yourdomain.com` → delivered to user with that username

**Example Webhook Configuration:**
```json
{
  "url": "https://citricloud.com/api/v1/email/webhooks/resend",
  "events": [
    "email.sent",
    "email.delivered",
    "email.bounced",
    "email.delivery_delayed"
  ]
}
```

### 5. Start Backend Server

```bash
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## Usage

### Sending Emails

Users can send emails through the Workspace Email interface. Each email:

1. **From Address**: Auto-generated as `username@yourdomain.com`
2. **Sending**: Via Resend API
3. **Storage**: Saved in database with `sent` status
4. **Tracking**: Webhook updates delivery status

**API Example:**
```bash
curl -X POST http://localhost:8000/api/v1/email/send \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "to_addresses": ["recipient@example.com"],
    "subject": "Test Email",
    "body_html": "<p>Hello from CITRICLOUD!</p>",
    "body_text": "Hello from CITRICLOUD!"
  }'
```

### Receiving Emails

When someone sends an email to `username@yourdomain.com`:

1. Resend receives the email
2. Fires webhook to `/api/v1/email/webhooks/inbound`
3. Backend creates email record in database
4. Email appears in user's inbox
5. User sees it in Workspace Email

**Inbound Webhook Payload Example:**
```json
{
  "from": "sender@example.com",
  "to": ["john@citricloud.com"],
  "subject": "Hello John",
  "html": "<p>Email content</p>",
  "text": "Email content",
  "message_id": "msg_abc123"
}
```

### Email Features

#### 1. **Folders**
- Inbox
- Sent
- Drafts
- Starred
- Trash
- Spam
- Archive

#### 2. **Operations**
- Send new email
- Reply to email
- Forward email
- Save draft
- Mark as read/unread
- Star/unstar
- Move to folder
- Delete (soft/permanent)

#### 3. **Email Signatures**
Users can create custom signatures:

```typescript
await emailAPI.saveSignature({
  signature_html: '<p>Best regards,<br>John Doe</p>',
  signature_text: 'Best regards,\nJohn Doe',
  is_enabled: true
});
```

## API Endpoints

### Email Management
- `POST /api/v1/email/send` - Send email
- `POST /api/v1/email/drafts` - Save draft
- `GET /api/v1/email/` - List emails (with filters)
- `GET /api/v1/email/{id}` - Get email details
- `PATCH /api/v1/email/{id}` - Update email properties
- `DELETE /api/v1/email/{id}` - Delete email
- `POST /api/v1/email/{id}/reply` - Reply to email
- `POST /api/v1/email/{id}/forward` - Forward email

### Email Signature
- `POST /api/v1/email/signature` - Create/update signature
- `GET /api/v1/email/signature` - Get signature

### Folder Management
- `GET /api/v1/email/folders/counts` - Get email counts per folder

### Webhooks (Public - No Auth)
- `POST /api/v1/email/webhooks/resend` - Resend event webhook
- `POST /api/v1/email/webhooks/inbound` - Inbound email webhook

## Database Schema

### `emails` Table
```sql
CREATE TABLE emails (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    from_address VARCHAR(255) NOT NULL,
    to_addresses JSON NOT NULL,
    cc_addresses JSON,
    bcc_addresses JSON,
    subject VARCHAR(500) NOT NULL,
    body_text TEXT,
    body_html TEXT,
    snippet VARCHAR(200),
    status VARCHAR(20) NOT NULL,  -- draft, sent, delivered, failed, received
    folder VARCHAR(20) NOT NULL,  -- inbox, sent, drafts, trash, spam, archive
    is_read BOOLEAN DEFAULT FALSE,
    is_starred BOOLEAN DEFAULT FALSE,
    is_important BOOLEAN DEFAULT FALSE,
    labels JSON,
    thread_id VARCHAR(100),
    in_reply_to INTEGER REFERENCES emails(id),
    resend_email_id VARCHAR(100),
    external_message_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE,
    sent_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE
);
```

### `email_attachments` Table
```sql
CREATE TABLE email_attachments (
    id SERIAL PRIMARY KEY,
    email_id INTEGER NOT NULL REFERENCES emails(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    content_type VARCHAR(100) NOT NULL,
    size INTEGER NOT NULL,
    file_path VARCHAR(500),
    file_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### `email_signatures` Table
```sql
CREATE TABLE email_signatures (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    signature_html TEXT NOT NULL,
    signature_text TEXT NOT NULL,
    is_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE
);
```

## Testing

### 1. Test Sending Email
```bash
# Login first to get token
TOKEN=$(curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@citricloud.com","password":"admin123"}' \
  | jq -r '.access_token')

# Send test email
curl -X POST http://localhost:8000/api/v1/email/send \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "to_addresses": ["test@resend.dev"],
    "subject": "Test from CITRICLOUD",
    "body_html": "<h1>Hello!</h1><p>This is a test email.</p>",
    "body_text": "Hello! This is a test email."
  }'
```

### 2. Test Webhooks Locally (using ngrok)
```bash
# Install ngrok
brew install ngrok  # or download from ngrok.com

# Start tunnel
ngrok http 8000

# Copy the HTTPS URL (e.g., https://abc123.ngrok.io)
# Add webhook in Resend: https://abc123.ngrok.io/api/v1/email/webhooks/resend
```

### 3. Monitor Logs
```bash
# Backend logs
cd backend
tail -f logs/app.log

# Check Resend dashboard for email status
```

## Resend Limits

### Free Tier
- **100 emails/day**
- **1 domain**
- **API access**
- **Webhook support**

### Paid Plans (Pro)
- **50,000+ emails/month**
- **Unlimited domains**
- **Priority support**
- **Advanced analytics**

See [resend.com/pricing](https://resend.com/pricing) for details.

## Troubleshooting

### Email Not Sending
1. Check API key in `.env`
2. Verify `EMAIL_FROM` is valid
3. Check Resend dashboard for errors
4. Review backend logs

### Email Not Receiving
1. Verify webhook URL is accessible (use ngrok for local testing)
2. Check webhook is registered in Resend dashboard
3. Ensure username exists in database
4. Check webhook logs in Resend dashboard

### Delivery Issues
1. Verify domain SPF/DKIM records
2. Check spam folder
3. Review Resend analytics dashboard
4. Check email reputation

### Common Errors

**"Invalid API key"**
- Solution: Verify `RESEND_API_KEY` in `.env`

**"Domain not verified"**
- Solution: Use `onboarding@resend.dev` or verify your custom domain

**"Rate limit exceeded"**
- Solution: Upgrade Resend plan or wait for limit reset

**"Webhook endpoint unreachable"**
- Solution: Use ngrok for local testing or ensure production URL is accessible

## Security Best Practices

1. **API Keys**: Never commit API keys to version control
2. **Webhooks**: Validate webhook signatures (if Resend provides them)
3. **Rate Limiting**: Implement rate limiting on email endpoints
4. **Spam Prevention**: Add CAPTCHA to compose form if needed
5. **User Isolation**: Always filter emails by `user_id`
6. **Input Validation**: Sanitize email content to prevent XSS

## Production Checklist

- [ ] Domain verified in Resend
- [ ] Production API key configured
- [ ] Webhooks registered with production URL
- [ ] DNS records added (SPF, DKIM, DMARC)
- [ ] SSL/TLS enabled on webhook endpoints
- [ ] Database backups configured
- [ ] Error monitoring set up (Sentry, etc.)
- [ ] Rate limiting implemented
- [ ] Email templates designed
- [ ] User documentation written

## Resources

- **Resend Docs**: https://resend.com/docs
- **API Reference**: https://resend.com/docs/api-reference
- **Python SDK**: https://github.com/resend/resend-python
- **Status Page**: https://status.resend.com

## Support

For issues with:
- **CITRICLOUD**: Contact your system administrator
- **Resend Service**: support@resend.com or Resend dashboard chat
- **Integration**: Check backend logs and Resend dashboard

---

**Last Updated**: November 28, 2025
**Version**: 1.0.0
