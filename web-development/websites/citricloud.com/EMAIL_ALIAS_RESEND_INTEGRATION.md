# Email Alias Integration with Resend

## Overview
The Email Workspace app now supports sending and receiving emails using Email Aliases integrated with Resend API. Users can create multiple email aliases (e.g., sales@citricloud.com, support@citricloud.com) and send/receive emails through these aliases.

## Features Implemented

### ✅ Backend Changes

1. **Email Schema Updates** (`backend/app/schemas/email_schemas.py`)
   - Added `from_email` optional field to `EmailBase` schema
   - Allows users to specify which email alias to send from

2. **Send Email Endpoint** (`backend/app/api/v1/endpoints/email.py`)
   - Updated `/email/send` endpoint to support email aliases
   - Validates that the specified alias belongs to the authenticated user
   - Uses alias display_name if available
   - Falls back to default `username@domain` if no alias specified
   
   **Flow:**
   ```python
   if email_data.from_email:
       # Extract alias local part (before @)
       alias_local_part = email_data.from_email.split('@')[0]
       
       # Validate alias belongs to user and is active
       alias = db.query(EmailAlias).filter(
           EmailAlias.user_id == current_user.id,
           EmailAlias.alias == alias_local_part,
           EmailAlias.is_active == True
       ).first()
       
       if alias:
           sender_email = alias.full_email
           display_name = alias.display_name or current_user.full_name
   else:
       # Use default username@domain
       sender_email = f"{current_user.username}@{domain}"
   ```

3. **Email Receiving** (`backend/app/api/v1/endpoints/email.py`)
   - Already supports routing incoming emails to aliases
   - Checks recipient's local part against user's aliases
   - Automatically assigns emails to the alias owner
   
   **Webhook Flow:**
   ```python
   # Extract recipient local part
   local_part = recipient_email.split('@')[0]
   
   # Check if it matches an alias
   alias = db.query(EmailAlias).filter(
       EmailAlias.alias == local_part,
       EmailAlias.is_active == True
   ).first()
   
   if alias:
       user = alias.user  # Assign to alias owner
   ```

### ✅ Frontend Changes

1. **State Management** (`frontend/src/pages/workspace/Email.tsx`)
   - Added `composeFromEmail` state to track selected sender alias
   - Added `showFromDropdown` state for dropdown visibility

2. **Compose Modal UI**
   - Replaced static "From" field with interactive dropdown
   - Shows default `username@citricloud.com` option
   - Lists all active email aliases with their display names
   - Visual indicator (✓) for selected alias
   
   **UI Features:**
   - Default username option with "Default" label
   - Alias options with display names as subtitles
   - Blue highlight for selected option
   - Checkmark icon on selected item

3. **API Integration** (`frontend/src/lib/api.ts`)
   - Added `from_email` parameter to `sendEmail` API signature
   - Automatically includes selected alias when sending

## Usage

### Creating Email Aliases

1. Navigate to Workspace → Email
2. Click on email alias dropdown (top left)
3. Select or create an alias
4. Set display name and description (optional)

**Limits:**
- Regular users: Up to 5 aliases
- System Admins: Unlimited

### Sending Emails from Alias

1. Click "Compose" to start new email
2. Click "From" dropdown in compose modal
3. Select desired alias or use default
4. Compose and send email

**Example:**
```
From: Sales Team <sales@citricloud.com>
To: customer@example.com
Subject: Product Inquiry

Hello, thank you for contacting our sales team...
```

### Receiving Emails to Alias

Emails sent to any active alias will automatically appear in the user's inbox:
- `sales@citricloud.com` → User's inbox
- `support@citricloud.com` → User's inbox
- `username@citricloud.com` → User's inbox

**Filtering:**
- Use the email dropdown to filter by specific alias
- Select "All Mailboxes" to view all emails

## Configuration

### Resend Setup

1. **Domain Verification**
   - Verify your domain in Resend dashboard
   - Add DNS records (MX, SPF, DKIM)

2. **Inbound Email**
   - Configure inbound routing in Resend
   - Set webhook URL: `https://citricloud.com/api/v1/email/webhooks/inbound`
   - Add webhook secret to `.env`:
   ```
   RESEND_WEBHOOK_SECRET_INBOUND=your_webhook_secret
   ```

3. **API Key**
   - Get API key from Resend dashboard
   - Add to `.env`:
   ```
   RESEND_API_KEY=re_xxxxxxxxxxxx
   EMAIL_FROM=noreply@citricloud.com
   ```

### Email Alias Model

```python
class EmailAlias(Base):
    id: int
    user_id: int  # Foreign key to User
    alias: str  # Local part (e.g., "sales")
    display_name: str  # Display name (e.g., "Sales Team")
    description: str  # Purpose description
    is_active: bool  # Active status
    is_verified: bool  # Verification status
    created_at: datetime
    updated_at: datetime
    
    @property
    def full_email(self):
        return f"{self.alias}@citricloud.com"
```

## API Endpoints

### Email Alias Management

- `GET /api/v1/email-aliases/` - List user's aliases
- `POST /api/v1/email-aliases/` - Create new alias
- `GET /api/v1/email-aliases/{id}` - Get alias details
- `PATCH /api/v1/email-aliases/{id}` - Update alias
- `DELETE /api/v1/email-aliases/{id}` - Delete alias

### Email Operations

- `POST /api/v1/email/send` - Send email (with optional `from_email`)
- `GET /api/v1/email/` - List emails (with optional `to_address` filter)
- `POST /api/v1/email/webhooks/inbound` - Receive inbound emails

## Database Schema

```sql
CREATE TABLE email_aliases (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    alias VARCHAR(255) UNIQUE NOT NULL,
    display_name VARCHAR(255),
    description VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    verified_at TIMESTAMP
);

CREATE INDEX ix_email_aliases_user_active ON email_aliases(user_id, is_active);
CREATE INDEX ix_email_aliases_alias_active ON email_aliases(alias, is_active);
```

## Security & Validation

### Alias Creation
- Must be unique across all users
- Alphanumeric with dots, hyphens, underscores only
- Reserved aliases blocked (admin, root, postmaster, etc.)
- Automatically verified for domain owners

### Sending Validation
- Validates alias belongs to authenticated user
- Checks alias is active
- Returns 403 Forbidden for unauthorized aliases
- Sanitizes and validates email addresses

### Receiving Validation
- Webhook signature verification (optional)
- Validates recipient domain matches
- Routes to correct user based on alias
- Prevents unauthorized access

## Testing

### Manual Testing

1. **Create Alias:**
   ```bash
   curl -X POST https://citricloud.com/api/v1/email-aliases/ \
     -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "alias": "sales",
       "display_name": "Sales Team",
       "description": "Sales inquiries"
     }'
   ```

2. **Send from Alias:**
   - Open Email app
   - Click Compose
   - Select "sales@citricloud.com" from dropdown
   - Send email

3. **Receive to Alias:**
   - Send test email to sales@citricloud.com
   - Check inbox for received email
   - Verify it appears in "All Mailboxes"

### Resend Test Mode

For testing without sending real emails:
```python
# In backend/app/core/config.py
EMAIL_FROM = "onboarding@resend.dev"  # Test domain
```

## Troubleshooting

### Emails Not Sending

1. Check Resend API key is valid
2. Verify domain is verified in Resend
3. Check backend logs: `sudo journalctl -u citricloud-backend -f`
4. Ensure alias is active: `is_active=true`

### Emails Not Receiving

1. Verify MX records point to Resend
2. Check inbound webhook is configured
3. Verify webhook secret matches `.env`
4. Check alias exists and is active
5. Review backend webhook logs

### Alias Not Appearing

1. Refresh email aliases list
2. Check alias is active: `PATCH /email-aliases/{id}` with `is_active: true`
3. Clear browser cache
4. Check user owns the alias

## Future Enhancements

- [ ] Alias forwarding rules
- [ ] Signature per alias
- [ ] Auto-reply settings per alias
- [ ] Shared aliases for teams
- [ ] Analytics per alias
- [ ] Spam filtering per alias

## Support

For issues or questions:
- Check logs: `/var/log/citricloud/`
- Review Resend dashboard
- Contact support@citricloud.com

---

**Last Updated:** December 10, 2024
**Version:** 1.0.0
**Status:** ✅ Production Ready
