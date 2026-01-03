# Domain Configuration Guide - citricloud.com

## Server IP: 57.129.74.173
## Domain: citricloud.com

This guide will help you connect your server to the domain and configure Resend email service.

---

## Part 1: DNS Configuration (Domain Registrar)

### Step 1: Add A Records
Go to your domain registrar's DNS management panel and add these records:

```
Type: A
Name: @
Value: 57.129.74.173
TTL: 3600 (or Auto)

Type: A
Name: www
Value: 57.129.74.173
TTL: 3600 (or Auto)
```

**Result**: 
- `citricloud.com` → 57.129.74.173
- `www.citricloud.com` → 57.129.74.173

### Step 2: Verify DNS Propagation
After adding DNS records, wait 5-30 minutes and verify:

```bash
# Check if domain points to your IP
dig citricloud.com +short
# Should return: 57.129.74.173

dig www.citricloud.com +short
# Should return: 57.129.74.173

# Alternative using nslookup
nslookup citricloud.com
nslookup www.citricloud.com
```

---

## Part 2: Resend Domain Configuration

### Step 1: Add Domain in Resend Dashboard

1. **Login to Resend**: https://resend.com/login
2. **Navigate to Domains**: Click "Domains" in sidebar
3. **Add Domain**: Click "Add Domain" button
4. **Enter Domain**: Type `citricloud.com` (without www)
5. **Click Continue**

### Step 2: Add DNS Records for Email

Resend will provide you with DNS records. You need to add these to your domain registrar:

#### Expected DNS Records:

**SPF Record** (TXT):
```
Type: TXT
Name: @
Value: v=spf1 include:amazonses.com ~all
TTL: 3600
```

**DKIM Record** (TXT):
```
Type: TXT
Name: resend._domainkey
Value: [Resend will provide this - it's a long string starting with p=]
TTL: 3600
```

**DMARC Record** (TXT):
```
Type: TXT
Name: _dmarc
Value: v=DMARC1; p=none; rua=mailto:dmarc@citricloud.com
TTL: 3600
```

**MX Records** (for receiving email):
```
Type: MX
Name: @
Value: feedback-smtp.us-east-1.amazonses.com
Priority: 10
TTL: 3600
```

### Step 3: Verify Domain in Resend

1. **Wait for DNS propagation** (5-30 minutes)
2. **Click "Verify" button** in Resend dashboard
3. **Check verification status** - should show green checkmark

### Step 4: Update Email Addresses

Once verified, you can send from any email address on your domain:
- `noreply@citricloud.com` (already configured in .env)
- `support@citricloud.com`
- `admin@citricloud.com`
- `{username}@citricloud.com` (for Workspace Email)

---

## Part 3: Nginx Web Server Configuration

### Step 1: Create Nginx Configuration

Create or update Nginx config for citricloud.com:

```bash
sudo nano /etc/nginx/sites-available/citricloud.com
```

Add this configuration:

```nginx
# HTTP - Redirect to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name citricloud.com www.citricloud.com 57.129.74.173;
    
    # Redirect all HTTP to HTTPS
    return 301 https://citricloud.com$request_uri;
}

# HTTPS - Frontend
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name citricloud.com www.citricloud.com;
    
    # SSL Configuration (will be managed by Certbot)
    ssl_certificate /etc/letsencrypt/live/citricloud.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/citricloud.com/privkey.pem;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # Root directory for frontend
    root /home/ubuntu/infrastructure/cloud/web-development/websites/citricloud.com/frontend/dist;
    index index.html;
    
    # Frontend routes - SPA configuration
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Backend API proxy
    location /api/ {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Static files caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### Step 2: Enable Site and Test

```bash
# Create symbolic link to enable site
sudo ln -s /etc/nginx/sites-available/citricloud.com /etc/nginx/sites-enabled/

# Test Nginx configuration
sudo nginx -t

# If test passes, reload Nginx
sudo systemctl reload nginx
```

---

## Part 4: SSL Certificate (Let's Encrypt)

### Step 1: Install Certbot

```bash
# Install Certbot and Nginx plugin
sudo apt update
sudo apt install certbot python3-certbot-nginx -y
```

### Step 2: Obtain SSL Certificate

```bash
# Get certificate for both domain and www subdomain
sudo certbot --nginx -d citricloud.com -d www.citricloud.com

# Follow prompts:
# - Enter email address for urgent renewal notices
# - Agree to terms of service
# - Choose whether to redirect HTTP to HTTPS (recommended: Yes)
```

### Step 3: Test Auto-Renewal

```bash
# Test renewal process
sudo certbot renew --dry-run

# Certbot auto-renewal should be set up automatically via systemd timer
```

---

## Part 5: Application Configuration

### Frontend Configuration

Update frontend environment (if using Vite):

```bash
# Create/update frontend/.env.production
echo "VITE_API_URL=https://citricloud.com/api/v1" > frontend/.env.production
```

### Build Frontend

```bash
cd /home/ubuntu/infrastructure/cloud/web-development/websites/citricloud.com/frontend
npm run build
```

### Backend is Already Configured

The backend .env has been updated with:
- ✅ `EMAIL_FROM=noreply@citricloud.com`
- ✅ `FRONTEND_URL=https://citricloud.com`
- ✅ `CORS_ORIGINS` includes citricloud.com
- ✅ `ALLOWED_HOSTS` includes citricloud.com and 57.129.74.173

---

## Part 6: Start/Restart Services

### Backend (FastAPI)

```bash
cd /home/ubuntu/infrastructure/cloud/web-development/websites/citricloud.com/backend

# If using systemd service:
sudo systemctl restart citricloud-backend

# Or run directly with uvicorn:
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### Frontend (Nginx already serving)

Frontend is automatically served by Nginx from the `dist` folder after build.

---

## Part 7: Configure Resend Webhooks

### Update Webhook URLs

In Resend dashboard, update webhook endpoints:

**Delivery Tracking Webhook:**
- URL: `https://citricloud.com/api/v1/email/webhooks/resend`
- Events: email.sent, email.delivered, email.bounced, email.delivery_delayed

**Inbound Email Webhook:**
- URL: `https://citricloud.com/api/v1/email/webhooks/inbound`
- Purpose: Receive emails sent to @citricloud.com addresses

---

## Part 8: Testing

### Test Domain Connection

```bash
# Test if domain resolves
curl -I http://citricloud.com

# Test HTTPS (after SSL setup)
curl -I https://citricloud.com

# Test API
curl https://citricloud.com/api/v1/
```

### Test Email Sending

```bash
# Login to get token
TOKEN=$(curl -X POST https://citricloud.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@citricloud.com","password":"your-password"}' \
  | jq -r '.access_token')

# Send test email
curl -X POST https://citricloud.com/api/v1/email/send \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "to_addresses": ["test@example.com"],
    "subject": "Test from citricloud.com",
    "body_html": "<p>Email sent successfully from citricloud.com!</p>",
    "body_text": "Email sent successfully from citricloud.com!"
  }'
```

### Test Email Receiving

1. Send an email to `{username}@citricloud.com`
2. Check if webhook is triggered in Resend dashboard
3. Verify email appears in user's inbox in Workspace Email

---

## Quick Checklist

### DNS Configuration
- [ ] Add A record for @ → 57.129.74.173
- [ ] Add A record for www → 57.129.74.173
- [ ] Wait for DNS propagation (5-30 min)
- [ ] Verify with `dig citricloud.com`

### Resend Configuration
- [ ] Add domain in Resend dashboard
- [ ] Add SPF, DKIM, DMARC DNS records
- [ ] Add MX records for receiving email
- [ ] Verify domain in Resend
- [ ] Update webhook URLs to use https://citricloud.com

### Server Configuration
- [ ] Create Nginx configuration
- [ ] Enable site in Nginx
- [ ] Install Certbot
- [ ] Obtain SSL certificate
- [ ] Build frontend (`npm run build`)
- [ ] Restart backend service
- [ ] Restart Nginx

### Testing
- [ ] Test domain access: https://citricloud.com
- [ ] Test API: https://citricloud.com/api/v1/
- [ ] Test email sending from Workspace Email
- [ ] Test password reset email
- [ ] Test receiving email at {username}@citricloud.com

---

## Troubleshooting

### Domain Not Resolving
- Wait longer for DNS propagation (up to 48 hours)
- Clear DNS cache: `sudo systemd-resolve --flush-caches`
- Check with multiple DNS checkers: https://dnschecker.org

### SSL Certificate Issues
- Ensure DNS is pointing to your server first
- Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`
- Try manual certificate: `sudo certbot certonly --nginx`

### Email Not Sending
- Verify domain in Resend dashboard
- Check API key is correct in .env
- Review backend logs
- Check Resend dashboard for errors

### Email Not Receiving
- Verify MX records are added
- Check webhook URL is accessible
- Test webhook with curl
- Review Resend webhook logs

---

## Support Resources

- **DNS Propagation Check**: https://dnschecker.org
- **Resend Documentation**: https://resend.com/docs
- **Let's Encrypt Guide**: https://letsencrypt.org/getting-started/
- **Nginx Documentation**: https://nginx.org/en/docs/

---

**Configuration Date**: November 28, 2025
**Server IP**: 57.129.74.173
**Domain**: citricloud.com
**Email Service**: Resend (citricloud.com verified domain)
