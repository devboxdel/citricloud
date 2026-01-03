# Cloudflare Cache Setup Guide for CitriCloud

## Problem
Cloudflare caches both your `index.html` and your JavaScript/CSS files. When you deploy updates:
- New JS/CSS files are built with new hashes (e.g., `Shop-DQhqtj3L.js` → `Shop-xrr3xCge.js`)
- The `index.html` references these new files
- But Cloudflare serves the OLD cached `index.html`, which references OLD file hashes
- Result: 404 errors or old code running

## Solution: Proper Cache Strategy

### 1. Nginx Configuration (Already Mostly Correct)

Your current nginx config is good:
- ✅ HTML files: No cache (via `location /` block)
- ✅ JS/CSS with hashes: 1 year cache (immutable)
- ✅ Images/fonts: 1 year cache

**Optional Enhancement:** Add explicit HTML location block in `/etc/nginx/nginx.conf`:

```nginx
# Add this BEFORE "location ~* \.(?:css|js|mjs|map)$" in each server block

# HTML files - never cache (especially index.html)
location ~* \.html$ {
  add_header Cache-Control "no-cache, no-store, must-revalidate, max-age=0" always;
  add_header Pragma "no-cache" always;
  add_header Expires "0" always;
  add_header X-Content-Type-Options "nosniff" always;
  etag off;
  try_files $uri =404;
}
```

Then reload nginx: `sudo nginx -t && sudo systemctl reload nginx`

### 2. Cloudflare Dashboard Settings

#### A. **Cache Rules** (Recommended Approach)

Go to: **Cloudflare Dashboard → Caching → Cache Rules**

Create a rule: "Do Not Cache HTML"
- **If:** URI Path matches `*.html` OR URI Path equals `/`
- **Then:** 
  - Cache eligibility: Bypass cache
  - Edge TTL: Do not cache
  
Create a rule: "Cache Static Assets"
- **If:** URI Path Extension matches `css|js|png|jpg|jpeg|gif|svg|webp|ico|woff|woff2|ttf|otf`
- **Then:**
  - Cache eligibility: Eligible for cache
  - Edge TTL: Respect existing headers
  - Browser TTL: Respect existing headers

#### B. **Page Rules** (Alternative)

Go to: **Cloudflare Dashboard → Rules → Page Rules**

1. **Rule for HTML/Root:**
   - URL: `https://shop.citricloud.com/` or `*citricloud.com/*.html`
   - Settings:
     - Cache Level: Bypass
     - Browser Cache TTL: Respect Existing Headers

2. **Rule for Assets:**
   - URL: `*citricloud.com/*.{js,css,png,jpg,jpeg,gif,svg,webp,ico,woff,woff2,ttf,otf}`
   - Settings:
     - Cache Level: Cache Everything
     - Edge Cache TTL: 1 month
     - Browser Cache TTL: Respect Existing Headers

### 3. Cloudflare Configuration Settings

Go to: **Cloudflare Dashboard → Caching → Configuration**

**Recommended Settings:**
- ✅ Browser Cache TTL: **Respect Existing Headers** (let nginx control it)
- ✅ Always Online: OFF (for SPAs, can cause issues)
- ✅ Development Mode: Use when testing (bypasses cache for 3 hours)

### 4. After Every Deployment

**Method 1: Selective Purge (Recommended)**
```bash
# Only purge HTML files
curl -X POST "https://api.cloudflare.com/client/v4/zones/YOUR_ZONE_ID/purge_cache" \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Content-Type: application/json" \
  --data '{"files":["https://shop.citricloud.com/index.html","https://www.citricloud.com/index.html"]}'
```

**Method 2: Purge Everything (Easier but slower)**
- Go to Cloudflare Dashboard
- Caching → Configuration
- Click "Purge Everything"

**Method 3: Use Development Mode**
- Turn on Development Mode before deploying
- Wait 3 minutes after deployment
- Turn off Development Mode

### 5. Automated Deployment Script

Add to your deployment process:

```bash
#!/bin/bash
# deploy-frontend.sh

cd /home/ubuntu/infrastructure/cloud/web-development/websites/citricloud.com/frontend

# Build
npm run build

# Purge Cloudflare cache for HTML files only
curl -X POST "https://api.cloudflare.com/client/v4/zones/$CF_ZONE_ID/purge_cache" \
  -H "Authorization: Bearer $CF_API_TOKEN" \
  -H "Content-Type: application/json" \
  --data '{
    "files": [
      "https://shop.citricloud.com/",
      "https://shop.citricloud.com/index.html",
      "https://www.citricloud.com/",
      "https://www.citricloud.com/index.html"
    ]
  }'

echo "✅ Deployment complete! Cache purged for HTML files."
```

## Quick Reference

### Cache Strategy Summary

| File Type | Cache Duration | Why |
|-----------|---------------|-----|
| `index.html` | **No cache** | Entry point, always needs to be fresh |
| `Shop-abc123.js` | **1 year** | Hash changes when content changes |
| `api-xyz789.css` | **1 year** | Hash changes when content changes |
| Images/Fonts | **1 year** | Rarely change |
| API responses | **No cache** | Dynamic data |

### Troubleshooting

**Problem:** Still seeing old code after deployment
- ✅ Check: Hard refresh browser (Ctrl+Shift+R)
- ✅ Check: Open in incognito window
- ✅ Check: Purge Cloudflare cache
- ✅ Check: Verify nginx reloaded: `sudo systemctl status nginx`
- ✅ Check: View source of index.html - does it reference new hashed files?

**Quick Validation (after deploy)**
- HTML bypassed: `curl -I https://www.citricloud.com/ | egrep -i "cache-control|cf-cache-status|expires"` → expect `no-cache` headers and `CF-Cache-Status: DYNAMIC/BYPASS`
- Assets cached: `curl -I https://www.citricloud.com/assets/<hash>.js | egrep -i "cache-control|cf-cache-status|expires"` → expect `Cache-Control: public, ... immutable` and `CF-Cache-Status: HIT` on second call

**Problem:** 404 errors on assets
- ✅ This happens when index.html is cached but assets are new
- ✅ Solution: Purge Cloudflare cache
- ✅ Prevention: Set up proper cache rules above

**Problem:** Need immediate testing
- ✅ Enable Cloudflare Development Mode (3-hour bypass)
- ✅ Or add `?v=timestamp` to your URL for testing

## Cloudflare API Setup (Optional)

To automate cache purging:

1. Get your Zone ID:
   - Cloudflare Dashboard → Overview → Zone ID (right sidebar)

2. Create API Token:
   - My Profile → API Tokens → Create Token
   - Use template: "Edit zone cache"
   - Zone Resources: Include → Specific zone → citricloud.com
   - Save token securely

3. Add to your environment:
   ```bash
   export CF_ZONE_ID="your_zone_id"
   export CF_API_TOKEN="your_api_token"
   ```

## Best Practices

1. **Never manually edit files in `/dist`** - always rebuild
2. **Always purge HTML after deployment** - automate this
3. **Use Development Mode for testing** - saves manual purges
4. **Monitor Cloudflare analytics** - check cache hit ratio
5. **Set up cache rules once** - forget about manual management

## Current Status

✅ Nginx configuration: Correct (HTML no-cache, assets long cache)
✅ Vite build: Generates hashed filenames automatically
⚠️ Cloudflare: Needs cache rules or manual purges after each deployment

**Next Step:** Set up Cloudflare Cache Rules as described in section 2A above.
