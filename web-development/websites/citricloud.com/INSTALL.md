# CITRICLOUD - Installation & Setup Guide

## Prerequisites

- **Python 3.11+**
- **Node.js 18+**
- **PostgreSQL 14+**
- **Redis 6+**

## Quick Start

### 1. Clone or Navigate to Project
```bash
cd /home/ubuntu/infrastructure/cloud/web-development/websites/citricloud.com
```

### 2. Run Setup Script
```bash
chmod +x setup.sh
./setup.sh
```

### 3. Start Application
```bash
chmod +x start.sh
./start.sh
```

## Manual Setup

### Backend Setup

1. Create virtual environment:
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Configure environment:
```bash
cp ../.env.example .env
# Edit .env with your configuration
```

4. Setup PostgreSQL database:
```bash
sudo -u postgres psql
CREATE DATABASE citricloud;
CREATE USER citricloud WITH PASSWORD 'citricloud';
GRANT ALL PRIVILEGES ON DATABASE citricloud TO citricloud;
\q
```

5. Start Redis:
```bash
sudo systemctl start redis-server
```

6. Run backend:
```bash
uvicorn main:app --reload
```

### Frontend Setup

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Configure environment:
```bash
# Create .env file
echo "VITE_API_URL=http://localhost:8000/api/v1" > .env
```

3. Start development server:
```bash
npm run dev
```

## Access Points

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/api/v1/docs
- **ReDoc**: http://localhost:8000/api/v1/redoc

## Default Credentials

After first run, create an admin account:
1. Go to http://localhost:3000/register
2. Register with your email
3. Access the dashboard

## Production Deployment

### Build Frontend
```bash
cd frontend
npm run build
```

### Run Backend with Gunicorn
```bash
cd backend
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

### Environment Variables for Production
Update `.env` file:
```env
ENVIRONMENT=production
DEBUG=False
DATABASE_URL=postgresql://user:password@host:5432/citricloud
REDIS_URL=redis://host:6379/0
JWT_SECRET_KEY=your-secure-secret-key
CORS_ORIGINS=https://yourdomain.com
```

## Architecture

### Backend Structure
```
backend/
├── app/
│   ├── api/
│   │   ├── dependencies.py
│   │   └── v1/
│   │       ├── endpoints/
│   │       │   ├── auth.py
│   │       │   ├── crm.py
│   │       │   ├── cms.py
│   │       │   └── erp.py
│   │       └── router.py
│   ├── core/
│   │   ├── config.py
│   │   ├── database.py
│   │   ├── security.py
│   │   ├── cache.py
│   │   └── exceptions.py
│   ├── models/
│   │   └── models.py
│   └── schemas/
│       └── schemas.py
├── main.py
└── requirements.txt
```

### Frontend Structure
```
frontend/
├── src/
│   ├── components/
│   │   └── DashboardLayout.tsx
│   ├── pages/
│   │   ├── Home.tsx
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   ├── MyProfile.tsx
│   │   ├── Workspace.tsx
│   │   └── dashboard/
│   │       ├── MainDashboard.tsx
│   │       ├── CRMDashboard.tsx
│   │       ├── CMSDashboard.tsx
│   │       └── ERPDashboard.tsx
│   ├── lib/
│   │   └── api.ts
│   ├── store/
│   │   └── authStore.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── package.json
└── vite.config.ts
```

## Features

### ✅ Implemented
- JWT Authentication & Authorization
- Role-based Access Control (RBAC)
- Main Dashboard with real-time stats
- CRM Dashboard (User Management)
- CMS Dashboard (Content Management)
- ERP Dashboard (Orders, Invoices, Tickets)
- My Profile & Workspace
- iOS 26 Liquid Glass Design System
- Performance Optimizations
- Responsive Design

### 🔧 Database Models
- Users & Roles
- Orders & Order Items
- Invoices
- Tickets
- Pages
- Blog Posts & Categories
- Products & Categories
- Menus & Menu Items
- Workspace Files
- Announcements

### 🎨 Design Features
- Liquid Glass Effect with backdrop blur
- Smooth animations with Framer Motion
- Primary solid color scheme (no gradients on UI elements)
- Responsive and mobile-friendly
- Custom scrollbar styling
- Glass morphism effects

## Performance Optimizations

1. **Code Splitting**: Lazy loading of routes
2. **Caching**: Redis caching layer
3. **Database**: Optimized queries with proper indexing
4. **Compression**: Gzip and Brotli compression
5. **CDN Ready**: Static assets optimized
6. **Image Optimization**: WebP support
7. **Tree Shaking**: Minimal bundle size

## Troubleshooting

### Backend Issues
```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql

# Check if Redis is running
sudo systemctl status redis-server

# View backend logs
cd backend
tail -f *.log
```

### Frontend Issues
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Check build
npm run build
```

## Support

For issues or questions, please check:
- API Documentation: http://localhost:8000/api/v1/docs
- Project README: /README.md

## License

Proprietary - All rights reserved
