# 🚀 Citricloud.com - Quick Reference

## ✅ Your Site is LIVE!

### 🌐 URLs
- **Main Site**: https://citricloud.com ✅ WORKING
- **WWW**: https://www.citricloud.com ✅ WORKING
- **Dashboard**: https://my.citricloud.com ✅ PROXIED (returns 403 from Vite dev server)
- **API Docs**: https://citricloud.com/docs
- **API**: https://citricloud.com/api/*

---

## 🔧 What Was Fixed

### The Problem
- **500 Internal Server Error** on all requests
- Nginx redirect loop errors in logs

### The Solution
- **Root Cause**: Wrong Nginx root directory
- **Fixed**: Updated path from `/home/ubuntu/websites/citricloud/` to `/home/ubuntu/infrastructure/cloud/web-development/websites/citricloud.com/`
- **Result**: Site now returns HTTP 200 ✅

---

## ⚡ Quick Commands

### Check if site is running
```bash
curl -I https://citricloud.com
# Should return: HTTP/2 200
```

### Restart Nginx
```bash
sudo systemctl reload nginx
```

### View logs
```bash
# Access log
sudo tail -f /var/log/nginx/access.log

# Error log
sudo tail -f /var/log/nginx/error.log
```

### Check backend
```bash
ps aux | grep uvicorn
```

---

## 📋 What's Next

### 1. Add Email DNS Records (High Priority)
Go to Cloudflare → DNS → Add these records (**DNS Only**, not proxied):

```
TXT   @                   v=spf1 include:_spf.resend.com ~all
CNAME resend._domainkey   resend._domainkey.resend.com
TXT   _dmarc              v=DMARC1; p=none; rua=mailto:dmarc@citricloud.com
MX    @    10             mail.citricloud.com
```

Then verify domain in Resend dashboard.

### 2. Fix WWW IP (Medium Priority)
In Cloudflare DNS, change:
```
A  www  57.129.74.174  →  57.129.74.173
```

### 3. Configure my.citricloud.com (Optional)
Currently proxies to Vite dev server (port 3000) which returns 403.

**Option A**: Allow Vite external access (dev only)
```js
// vite.config.ts
server: {
  host: true,
  hmr: { host: 'my.citricloud.com' }
}
```

**Option B**: Serve production build instead
```nginx
# In nginx.conf, replace my.citricloud.com proxy with:
root /home/ubuntu/infrastructure/.../frontend/dist;
location / { try_files $uri $uri/ /index.html; }
```

---

## 📁 Important Paths

### Frontend
```
Production build: frontend/dist/  ← Served by Nginx
Development: npm run dev (port 3000)
```

### Backend
```
FastAPI: backend/main.py (port 8000)
Config: backend/.env
```

### Nginx
```
Config: /etc/nginx/nginx.conf (lines 124-222, 438-478)
Logs: /var/log/nginx/
```

---

## 🔍 Testing

```bash
# Homepage
curl https://citricloud.com

# API
curl https://citricloud.com/api/health

# Static asset
curl -I https://citricloud.com/assets/index-*.js

# Dashboard subdomain
curl -I https://my.citricloud.com
# Returns 403 (Vite host checking - expected)
```

---

## 📞 Need Help?

Check these files:
- `FINAL_DEPLOYMENT_STATUS.md` - Complete deployment info
- `TROUBLESHOOTING.md` - Common issues
- `API_TESTING.md` - API endpoints guide

---

**Status**: ✅ **PRODUCTION READY**  
**Last Updated**: November 28, 2025  
**Next Step**: Add Resend DNS records for email
