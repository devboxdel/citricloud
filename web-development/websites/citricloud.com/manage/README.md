# CITRICLOUD Hosting Management Dashboard

A complete hosting management platform for managing servers, VPN, domains, DNS, email, WordPress installations, and control panels.

## 🚀 Quick Start

### Frontend Setup

```bash
cd manage/frontend
npm install
npm run dev  # Development server on http://localhost:5174
```

### Build & Deploy

```bash
cd manage/frontend
npm run deploy  # Builds and deploys to /var/www/manage.citricloud.com/
```

## 🏗️ Architecture

### Frontend
- **Framework**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS with glassmorphism design
- **State Management**: Zustand + TanStack Query
- **Routing**: React Router v6
- **Animations**: Framer Motion
- **Auth**: Shared JWT tokens with main CITRICLOUD app

### Backend
- **Framework**: FastAPI (integrated with existing backend)
- **Database**: PostgreSQL (shared with main app)
- **Authentication**: Reuses existing CITRICLOUD auth system
- **Endpoints**: `/api/v1/hosting/*`

## 📁 Project Structure

```
manage/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── DashboardLayout.tsx      # Main layout with sidebar
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx             # Overview dashboard
│   │   │   ├── Servers.tsx               # Server management
│   │   │   ├── VPN.tsx                   # VPN connections
│   │   │   ├── Domains.tsx               # Domain registration
│   │   │   ├── DNS.tsx                   # DNS management
│   │   │   ├── Email.tsx                 # Email accounts
│   │   │   ├── WordPress.tsx             # WordPress installations
│   │   │   └── ControlPanels.tsx         # Control panel management
│   │   ├── store/
│   │   │   └── authStore.ts              # Auth state (synced with main app)
│   │   ├── lib/
│   │   │   └── api.ts                    # API client with interceptors
│   │   ├── App.tsx                       # Main app with routing
│   │   ├── main.tsx                      # Entry point
│   │   └── index.css                     # Global styles
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── tsconfig.json
└── backend/ (integrated into main backend)
    └── app/
        ├── api/v1/endpoints/
        │   └── hosting.py                # Hosting endpoints
        └── models/
            └── hosting_models.py         # Hosting database models
```

## 🔐 Authentication

The manage dashboard uses the **same authentication system** as the main CITRICLOUD platform:

1. Users log in at `my.citricloud.com/login`
2. JWT tokens are stored in localStorage and cookies
3. Cookies are set with domain `.citricloud.com` for cross-subdomain access
4. When accessing `manage.citricloud.com`, auth is automatically validated
5. If not authenticated, users are redirected to login page

### Protected Routes
All routes require authentication. The `ProtectedRoute` component checks `isAuthenticated` from `authStore` and redirects unauthenticated users.

## 🎨 Features

### Server Management
- Deploy virtual private servers
- Choose OS, plan, and datacenter
- Start/stop/restart/reboot servers
- Monitor server status
- Delete servers

### VPN
- Create VPN connections (OpenVPN, WireGuard, IKEv2)
- Download configuration files
- Manage VPN credentials
- Multi-location support

### Domain Management
- Search domain availability
- Register domains
- Transfer domains
- Auto-renewal settings
- Domain expiration tracking

### DNS Management
- Create/edit/delete DNS records
- Support for A, AAAA, CNAME, MX, TXT, NS records
- TTL configuration
- MX priority settings

### Email Management
- Create email accounts
- Set quotas
- Monitor usage
- IMAP/SMTP configuration
- Email forwarders

### WordPress
- One-click WordPress installation
- WordPress version management
- Plugin management
- Auto-updates
- SSL included

### Control Panels
- Install cPanel, Plesk, DirectAdmin, Webmin
- Manage control panel access
- Version tracking

## 🔧 Development

### Install Dependencies
```bash
cd manage/frontend
npm install
```

### Development Server
```bash
npm run dev
```
Runs on `http://localhost:5174` with API proxy to backend on port 8000.

### Build
```bash
npm run build
```
Output: `dist/` directory

### Preview Build
```bash
npm run preview
```

## 🚀 Deployment

### Prerequisites
- Nginx configured for `manage.citricloud.com`
- Backend running on port 8000
- Database migrations applied

### Deploy Frontend
```bash
cd manage/frontend
npm run deploy
```

This command:
1. Builds the production bundle
2. Copies files to `/var/www/manage.citricloud.com/html/`
3. Reloads Nginx

### Backend Integration
The hosting endpoints are automatically included when the main backend starts. No separate deployment needed.

### Database Migrations
```bash
cd backend
alembic revision --autogenerate -m "Add hosting models"
alembic upgrade head
```

## 🌐 Nginx Configuration

Add to your main nginx config:

```nginx
# Manage subdomain
server {
    listen 80;
    listen [::]:80;
    server_name manage.citricloud.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name manage.citricloud.com;

    ssl_certificate /etc/letsencrypt/live/citricloud.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/citricloud.com/privkey.pem;

    root /var/www/manage.citricloud.com/html;
    index index.html;

    # SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API proxy
    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

Create directory:
```bash
sudo mkdir -p /var/www/manage.citricloud.com/html
sudo chown -R $USER:$USER /var/www/manage.citricloud.com
```

Reload Nginx:
```bash
sudo nginx -t
sudo systemctl reload nginx
```

## 📊 Database Models

### Server
- id, user_id, name, plan, os, datacenter, ip, status, timestamps

### VPN
- id, user_id, name, protocol, location, server_ip, created_at

### Domain
- id, user_id, name, expires_at, auto_renew, created_at

### DNSZone
- id, user_id, domain_id, domain, created_at

### DNSRecord
- id, zone_id, type, name, content, ttl, priority, timestamps

### EmailAccount
- id, user_id, email, password_hash, quota, used, created_at

### WordPressSite
- id, user_id, domain, title, admin_email, version, php_version, status, plugin_count, theme, timestamps

### ControlPanel
- id, user_id, server_id, panel_type, url, version, installed_at

## 🔌 API Endpoints

### Servers
- `GET /api/v1/hosting/servers` - List servers
- `POST /api/v1/hosting/servers` - Create server
- `GET /api/v1/hosting/servers/{id}` - Get server details
- `DELETE /api/v1/hosting/servers/{id}` - Delete server
- `POST /api/v1/hosting/servers/{id}/{action}` - Control server (start/stop/restart/reboot)

### VPN
- `GET /api/v1/hosting/vpn` - List VPNs
- `POST /api/v1/hosting/vpn` - Create VPN
- `GET /api/v1/hosting/vpn/{id}/config` - Download config

### Domains
- `GET /api/v1/hosting/domains` - List domains
- `GET /api/v1/hosting/domains/search?domain=example.com` - Search availability
- `POST /api/v1/hosting/domains/register` - Register domain

### DNS
- `GET /api/v1/hosting/dns/zones` - List DNS zones
- `GET /api/v1/hosting/dns/zones/{zone_id}/records` - List records
- `POST /api/v1/hosting/dns/zones/{zone_id}/records` - Create record
- `DELETE /api/v1/hosting/dns/zones/{zone_id}/records/{record_id}` - Delete record

### Email
- `GET /api/v1/hosting/email/accounts` - List accounts
- `POST /api/v1/hosting/email/accounts` - Create account

### WordPress
- `GET /api/v1/hosting/wordpress` - List sites
- `POST /api/v1/hosting/wordpress/install` - Install WordPress
- `POST /api/v1/hosting/wordpress/{id}/update` - Update WordPress

### Control Panels
- `GET /api/v1/hosting/control-panels` - List panels
- `POST /api/v1/hosting/control-panels/install` - Install panel

## 🔐 Security

- All endpoints require authentication (JWT token)
- CORS configured for `.citricloud.com` domain
- SQL injection protection via SQLAlchemy ORM
- Password hashing with bcrypt
- HTTPS enforced
- Rate limiting (recommended to add)

## 🧪 Testing

Use Swagger docs for API testing:
```
https://manage.citricloud.com/api/v1/docs
```

Or curl examples:
```bash
# Get servers (requires auth token)
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://manage.citricloud.com/api/v1/hosting/servers

# Create server
curl -X POST -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"web-01","plan":"standard","os":"Ubuntu 22.04","datacenter":"us-east-1"}' \
  https://manage.citricloud.com/api/v1/hosting/servers
```

## 📝 TODO

- [ ] Integrate actual cloud provider APIs (DigitalOcean, Linode, Vultr)
- [ ] Integrate domain registrar API (Namecheap, GoDaddy)
- [ ] Implement real VPN provisioning
- [ ] Add WordPress auto-installer script
- [ ] Implement control panel installation scripts
- [ ] Add billing integration
- [ ] Add usage metering and quotas
- [ ] Implement backup/snapshot functionality
- [ ] Add monitoring and alerts
- [ ] Implement SSH key management
- [ ] Add firewall management
- [ ] Implement SSL certificate management

## 📚 Documentation

- [Main CITRICLOUD Docs](../README.md)
- [API Documentation](../API_TESTING.md)
- [Deployment Guide](../DEPLOYMENT.md)

## 🆘 Support

For issues or questions:
- Check `/api/v1/docs` for API documentation
- Review browser console for frontend errors
- Check backend logs: `sudo journalctl -u citricloud-backend -f`
- Nginx logs: `sudo tail -f /var/log/nginx/error.log`

---

**Version**: 1.0.0  
**Last Updated**: 2026-01-09  
**Domain**: manage.citricloud.com
