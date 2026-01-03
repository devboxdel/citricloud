# CITRICLOUD

A comprehensive full-stack web development platform for creating dashboards and websites.

## Architecture

### Backend (Python FastAPI)
- **Main Dashboard**: Central hub with navigation to all modules
- **CRM Dashboard**: User and role management system
- **CMS Dashboard**: Content management for pages, blogs, products, menus
- **ERP Dashboard**: Order, invoice, and ticket management

### Frontend (React + Vite)
- **Public Website**: Marketing site with authentication
- **My Profile**: User workspace with orders, invoices, tickets
- **Workspace**: Productivity tools (similar to Microsoft 365)

## Features

- Single Sign-On (SSO) across all modules
- Real-time data synchronization
- iOS 26 Liquid Glass design system
- Optimized for 100/100 performance scores
- Role-based access control
- RESTful API architecture

## Tech Stack

**Backend:**
- FastAPI (Python 3.11+)
- PostgreSQL (Database)
- SQLAlchemy (ORM)
- Alembic (Migrations)
- Redis (Caching)
- JWT Authentication

**Frontend:**
- React 18
- Vite (Build tool)
- TanStack Query (Data fetching)
- Zustand (State management)
- React Router v6
- Tailwind CSS

## Quick Start

### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
alembic upgrade head
uvicorn main:app --reload
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## Performance Optimizations

- Code splitting and lazy loading
- Image optimization with WebP
- Gzip/Brotli compression
- Redis caching layer
- Database query optimization
- CDN integration ready
- Service Worker for offline support

## License

Proprietary - All rights reserved
