# Cloudflare API Bypass Configuration for my.citricloud.com

## Problem
Cloudflare is blocking API requests on `my.citricloud.com` with security challenges, preventing the login functionality and other API calls from working properly.

## Solution Options

### Option 1: Page Rule (Easiest - Using Your Current Interface)

1. **Navigate to Page Rules**
   - Go to your Cloudflare dashboard
   - Select your domain: `citricloud.com`
   - Click on **Rules** in the left sidebar
   - Click on **Page Rules**

2. **Create New Page Rule**
   - Click the **"Create Page Rule"** button
   - In the URL pattern field, enter:
     ```
     my.citricloud.com/api/*
     ```

3. **Configure Settings**
   - Click **"+ Add a Setting"** dropdown
   - Select **"Security Level"**
   - Set it to: **"Essentially Off"**
   
   - Click **"+ Add a Setting"** again
   - Select **"Browser Integrity Check"**
   - Set it to: **"Off"**

4. **Save**
   - Click **"Save and Deploy"**

**Result:** All requests to `my.citricloud.com/api/*` will bypass Cloudflare's security challenges.

---

### Option 2: WAF Custom Rules (Recommended for More Control)

1. **Navigate to WAF**
   - Go to Cloudflare Dashboard
   - Select your domain: `citricloud.com`
   - Click **Security** in the left sidebar
   - Click **WAF** (Web Application Firewall)

2. **Create Custom Rule**
   - Click on **"Custom rules"** tab
   - Click **"Create rule"** button

3. **Configure Rule**
   - **Rule name:** `Bypass API for my.citricloud.com`
   
   - **Field:** `Hostname`
   - **Operator:** `equals`
   - **Value:** `my.citricloud.com`
   
   - Click **"And"** to add another condition
   
   - **Field:** `URI Path`
   - **Operator:** `starts with`
   - **Value:** `/api/`

4. **Set Action**
   - Under **"Then..."** section
   - Select action: **"Skip"**
   - Check these boxes:
     - ✅ All remaining custom rules
     - ✅ Rate limiting rules
     - ✅ Super Bot Fight Mode
     - ✅ Bot Fight Mode
     - ✅ Challenge

5. **Deploy**
   - Click **"Deploy"** button

---

### Option 3: Configuration Rules (Alternative Method)

1. **Navigate to Configuration Rules**
   - Go to Cloudflare Dashboard
   - Select your domain: `citricloud.com`
   - Click **Rules** in the left sidebar
   - Click **Configuration Rules**

2. **Create Rule**
   - Click **"Create rule"** button
   - **Rule name:** `API Security Bypass for my.citricloud.com`

3. **Set Conditions**
   - **Field:** `Hostname`
   - **Operator:** `equals`
   - **Value:** `my.citricloud.com`
   
   - Click **"And"**
   
   - **Field:** `URI Path`
   - **Operator:** `starts with`
   - **Value:** `/api/`

4. **Configure Settings**
   - Under **"Then the settings are..."**
   - Find **"Security Level"**
   - Set to: **"Essentially Off"**
   - Find **"Bot Fight Mode"**
   - Toggle: **"Off"**

5. **Deploy**
   - Click **"Deploy"** button

---

### Option 4: Transform Rules (For Advanced Users)

1. **Navigate to Transform Rules**
   - Go to **Rules** → **Transform Rules**
   - Click on **"Modify Request Header"** tab
   - Create a rule to add `X-CF-Bypass: 1` header for API requests

---

## Quick Verification Steps

After implementing any of the above options:

1. **Clear Browser Cache**
   - Press `Ctrl + Shift + Delete` (Chrome/Firefox)
   - Clear cached images and files

2. **Test API Endpoint**
   - Open browser console (F12)
   - Go to: `https://my.citricloud.com/login`
   - Try to login
   - Check the Network tab for API calls to `/api/v1/auth/login`
   - Should return JSON response without Cloudflare challenge page

3. **Test via cURL** (from your local machine)
   ```bash
   curl -s "https://my.citricloud.com/api/v1/cms/public/blog/categories" | head -20
   ```
   Should return JSON data, not HTML challenge page

---

## Recommended Approach

**For your setup, I recommend Option 1 (Page Rule)** because:
- ✅ It's available in your current Cloudflare plan
- ✅ Simple to configure
- ✅ Takes effect immediately
- ✅ You can see it in your existing Page Rules interface

**The Page Rule will look like this:**
```
URL Pattern: my.citricloud.com/api/*
Settings:
  - Security Level: Essentially Off
  - Browser Integrity Check: Off
```

---

## Alternative: Lower Security for Entire Subdomain

If you want to disable challenges for the entire `my.citricloud.com` subdomain:

1. **Create Page Rule**
   - URL: `my.citricloud.com/*`
   - Setting: Security Level → "Essentially Off"

**Note:** This is less secure but ensures no API calls are blocked.

---

## Troubleshooting

### Still seeing challenges?

1. **Wait 2-3 minutes** for Cloudflare to propagate the rule
2. **Clear Cloudflare cache:**
   - Go to **Caching** → **Configuration**
   - Click **"Purge Everything"**
3. **Check rule priority:**
   - Page Rules are applied in order from top to bottom
   - Drag your API bypass rule to the **top** of the list
4. **Verify the URL pattern:**
   - Make sure there are no typos
   - Pattern is case-sensitive
   - Use `*` as wildcard, not `**`

### Browser still caching old response?

1. Open **Incognito/Private window**
2. Or clear browser cache completely
3. Hard refresh: `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac)

---

## Security Considerations

✅ **Safe:** API endpoints are protected by JWT authentication
✅ **Safe:** Rate limiting is still handled by nginx on your server
✅ **Safe:** Only `/api/*` paths are bypassed, not the entire site
⚠️ **Note:** Consider enabling rate limiting in Cloudflare for `/api/v1/auth/login` to prevent brute force attacks

---

## Testing Login After Configuration

1. Go to: `https://my.citricloud.com/login`
2. Use test credentials:
   - **Email:** (you need to create a user first)
   - **Password:** (your password)
3. Open DevTools (F12) → Network tab
4. Submit login form
5. Look for request to `/api/v1/auth/login`
6. Should see JSON response with `access_token`

---

## Creating a Test User

If you need to create a test user, run this on your server:

```bash
cd /home/ubuntu/infrastructure/cloud/web-development/websites/citricloud.com/backend
source venv/bin/activate
python create_test_user.py
```

This will create:
- **Email:** `test@citricloud.com`
- **Password:** `Test123!`
- **Role:** `admin`

---

## Current Status

✅ Nginx configuration: **Working** - API proxy is configured for both domains
✅ Backend API: **Working** - Responding correctly on port 8000
✅ Frontend (main): **Working** - `citricloud.com` loads fine
❌ Frontend (subdomain): **Blocked** - Cloudflare challenging `my.citricloud.com/api/*`

**Action Required:** Implement one of the bypass options above in your Cloudflare dashboard.
