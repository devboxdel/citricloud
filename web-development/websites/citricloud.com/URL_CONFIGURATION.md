# CitriCloud URL Configuration

## Overview
This document outlines the final URL configuration for all CitriCloud pages as of December 23, 2025.

---

## Main Domain Pages (citricloud.com)

| Page | URL |
|------|-----|
| Status Page | https://citricloud.com/status |
| Activity Log | https://citricloud.com/log |
| Sitemap | https://citricloud.com/sitemap |
| API Reference | https://citricloud.com/api-reference |
| Error Pages | https://citricloud.com/error-pages |
| Landing Page | https://citricloud.com/landing |
| Coming Soon | https://citricloud.com/coming-soon |
| Maintenance | https://citricloud.com/maintenance |
| FAQ | https://citricloud.com/faq |

---

## Subdomain Pages

| Page | URL |
|------|-----|
| Help Center | https://help.citricloud.com/center |
| Documentation | https://documentation.citricloud.com/ |

---

## Technical Configuration

### Frontend Routes (App.tsx)
- All main domain routes are defined on the root path `/` for citricloud.com
- Help Center routes: `/help-center`, `/center`
- Documentation routes: `/documentation`, `/docs`
- Subdomain routing logic automatically serves:
  - `help.citricloud.com` → Help Center page
  - `documentation.citricloud.com` → Documentation page

### Nginx Configuration (citricloud-nginx.conf)
- **Main domain**: citricloud.com and www.citricloud.com serve from `/frontend/dist`
- **help.citricloud.com**: Added with dedicated HTTPS server block (lines added after contact.citricloud.com)
- **documentation.citricloud.com**: Added with dedicated HTTPS server block

All subdomains:
- Auto-redirect HTTP to HTTPS
- Use shared SSL certificate from `/etc/letsencrypt/live/citricloud.com/`
- Serve SPA from `/frontend/dist`
- Disable caching for HTML files (max-age=0)
- Enable compression (gzip & brotli)
- Implement rate limiting and security headers

---

## Build & Deployment Status

### Latest Build
- **Date**: December 23, 2025
- **Status**: ✅ Success
- **Time**: 25.20s
- **Modules**: 2246 transformed
- **Assets**: 351 files in `/frontend/dist`

### Changes Made
1. Updated `frontend/src/App.tsx`:
   - Enhanced SubdomainRouter to handle help.citricloud.com and documentation.citricloud.com
   - Added routes for `/center` (Help Center alias) and `/docs` (Documentation alias)

2. Updated `citricloud-nginx.conf`:
   - Added HTTP/HTTPS server blocks for help.citricloud.com
   - Added HTTP/HTTPS server blocks for documentation.citricloud.com
   - Configured SSL, security headers, rate limiting, and SPA routing for both subdomains

### Deployment Ready
- Frontend build: ✅ Complete
- Nginx config: ✅ Updated
- Next step: Run `./deploy-frontend.sh` from project root to deploy changes

---

## Testing Checklist

- [ ] https://citricloud.com/status - Status page loads
- [ ] https://citricloud.com/log - Activity log loads
- [ ] https://citricloud.com/sitemap - Sitemap loads
- [ ] https://citricloud.com/api-reference - API Reference loads (with role-based access)
- [ ] https://citricloud.com/error-pages - Error pages list loads
- [ ] https://citricloud.com/landing - Landing page loads
- [ ] https://citricloud.com/coming-soon - Coming soon page loads
- [ ] https://citricloud.com/maintenance - Maintenance page loads
- [ ] https://citricloud.com/faq - FAQ page loads
- [ ] https://help.citricloud.com/center - Help Center loads
- [ ] https://documentation.citricloud.com/ - Documentation loads
- [ ] Subdomain redirects work (help.citricloud.com/center → loads correctly)
- [ ] Hard refresh (Ctrl+Shift+R) shows latest content
- [ ] Mobile responsive on all pages
- [ ] Dark/light theme toggle works on all pages

---

## Notes

- All pages now have consistent, predictable URLs
- Main domain pages are accessible without subdomain prefix
- Help Center and Documentation have dedicated subdomains for better organization
- API Reference requires authentication (system_admin, administrator, or developer roles)
- Cloudflare caching configured to:
  - Cache static assets (CSS, JS, images) with long TTL
  - Bypass HTML caching (DYNAMIC) to always serve fresh content
- Deploy script auto-purges HTML cache from Cloudflare on deployment

---

## Related Documentation

- See `CLOUDFLARE_CACHE_SETUP.md` for caching configuration details
- See `API_TESTING.md` for API Reference authentication requirements
- See `DEPLOYMENT_GUIDE_ROLES_USERS.md` for role-based access control setup
