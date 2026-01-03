# CITRICLOUD Development Guide for AI Agents

## Project Overview

CITRICLOUD is a full-stack platform with **dual codebases**:
- **Web Platform** (`web-development/websites/citricloud.com/`) - React/FastAPI for multi-dashboard SaaS
- **Mobile App** (`app-development/websites/citricloud.com/mobile-app/`) - React Native/Expo companion

Both share authentication but have separate concerns. The web platform serves multiple subdomains (my.citricloud.com, help.citricloud.com, etc.) while mobile provides on-the-go access.

## Architecture Principles

### Backend (FastAPI + PostgreSQL)
Located: `web-development/websites/citricloud.com/backend/`

**Module Organization**: API endpoints are grouped by business domain, not technical layer:
- `endpoints/auth.py` - Authentication, 2FA, profile, sessions
- `endpoints/crm.py` - Users, roles, pipeline, campaigns
- `endpoints/cms.py` - Pages, blogs, products, menus, media
- `endpoints/erp.py` - Orders, invoices, tickets, suppliers
- `endpoints/email.py` - Email workspace (Resend integration)

**Database Models** follow SQLAlchemy async patterns. Related models are in separate files (e.g., `email_models.py`, `site_settings_models.py`). Always use `AsyncSession` and `async/await`.

**Role-Based Access**: Use dependency injection for role checks:
```python
from app.api.dependencies import require_admin, get_current_user
# For admin-only: current_user: User = Depends(require_admin)
# For authenticated: current_user: User = Depends(get_current_user)
```

### Frontend (React + Vite + TypeScript)
Located: `web-development/websites/citricloud.com/frontend/`

**State Management**:
- **Zustand** for global state (`store/authStore.ts`, `store/cartStore.ts`)
- **TanStack Query** for server state (all API calls)
- **React Context** for cross-cutting concerns (LanguageContext, ChatContext)

**API Client Pattern**: All API calls go through `lib/api.ts`. It exports namespaced API objects:
```typescript
import { authAPI, crmAPI, cmsAPI, erpAPI, emailAPI } from '../lib/api';
// Usage: const users = await crmAPI.getUsers({ page: 1, page_size: 20 });
```

**Routing**: Uses React Router v6 with lazy loading. Protected routes check `isAuthenticated` from `authStore`. Dashboard routes (`/dashboard/*`) require authentication.

**Styling**: Tailwind CSS with custom design system. Use `glass-card` class for consistent UI. Dark mode via `useThemeStore`.

### Mobile App (React Native + Expo)
Located: `app-development/websites/citricloud.com/mobile-app/`

**Navigation**: Bottom tabs (Home, Services, Workspace, Status, Account). Uses React Navigation.

**Authentication**: Shares JWT tokens with web via `store/authStore.ts` (similar pattern to web). Tokens stored in AsyncStorage.

**API Integration**: Reuses web API patterns via `src/lib/api.ts`. Mobile makes same API calls as web to backend port 8000.

## Critical Developer Workflows

### Building & Deployment

**Frontend Build** (from `frontend/`):
```bash
npm run deploy  # Builds, updates logs, reloads nginx (production)
npm run build   # Standard build with auto-logging
npm run build:skip-log  # Emergency build without log updates
```

**Backend Restart**:
```bash
# Via systemd (production)
sudo systemctl restart citricloud-backend
# Or direct (development)
cd backend && source venv/bin/activate && uvicorn main:app --reload
```

**Mobile Development** (from `mobile-app/`):
```bash
npm start  # Starts Expo dev server
# Scan QR with Expo Go, or press 'a'/'i' for emulator
```

### Environment Variables

**Backend** (`.env` at project root):
- `DATABASE_URL` - PostgreSQL connection
- `REDIS_URL` - Cache connection
- `RESEND_API_KEY` - Email service
- `JWT_SECRET_KEY` - Token signing
- `CORS_ORIGINS` - Allowed frontend origins

**Frontend** uses Vite env vars (`import.meta.env`):
- `VITE_API_URL` - Backend API base (defaults to `/api/v1` for same-origin)

### Testing Strategy

**No formal test suite yet**, but patterns exist:
- Backend: `test_*.py` scripts for manual verification (`test_order_status.py`, `test_resend_integration.py`)
- Frontend: Build with TypeScript strict mode catches type errors
- API Testing: Use `/api/v1/docs` (Swagger) or cURL examples in `API_TESTING.md`

Manual QA documented in `TESTING_DEPLOYMENT_CHECKLIST.md` for features.

## Project-Specific Conventions

### Authentication Flow
1. User logs in at `my.citricloud.com/login` (subdomain enforced)
2. Backend returns `access_token` (30min) and `refresh_token` (7 days)
3. Frontend stores in `localStorage` AND cookies (for cross-subdomain SSO)
4. API client auto-refreshes on 401 using `refresh_token`
5. Cookies domain is `.citricloud.com` for cross-subdomain access

### Multi-Domain Setup
- **www.citricloud.com** - Marketing site (public)
- **my.citricloud.com** - Dashboard login/auth (authenticated)
- **help.citricloud.com** - Help center (routes to `/help-center`)
- **documentation.citricloud.com** - Docs (routes to `/documentation`)

All served from same frontend build via Nginx SPA fallback. Nginx config at root: `citricloud-nginx.conf`.

### Database Migrations
Uses Alembic. To create migration:
```bash
cd backend
alembic revision --autogenerate -m "description"
alembic upgrade head
```

### Image Uploads
Handled via multipart/form-data to backend endpoints. Files stored in `/var/www/citricloud.com/uploads` and served by Nginx at `/uploads/*`.

### Email System (Resend)
Email workspace integrated with Resend API. Key endpoints:
- `/email/send` - Send email
- `/email/` - List emails
- `/email-aliases/` - Manage email aliases (sales@, support@)
- Webhooks configured for inbound email

### Lazy Loading Pattern
Frontend uses React.lazy for all pages:
```typescript
const CRMDashboard = lazy(() => import('./pages/dashboard/CRMDashboard'));
// Wrap routes with <Suspense fallback={<LoadingScreen />}>
```

### Error Handling
- Backend: Use FastAPI HTTPException with proper status codes
- Frontend: TanStack Query handles errors; show toast with `react-hot-toast`
- API responses follow consistent format: `{ detail: "message" }` for errors

### Design System
iOS 26 "Liquid Glass" aesthetic:
- Glassmorphism via `glass-card` class
- Gradient backgrounds with `bg-gradient-to-br from-*/to-*`
- Framer Motion animations on scroll (`whileInView`)
- Dark mode toggle persists in localStorage

## Integration Points

### Redis Caching
Cache layer for translation API, frequently accessed data. Use `app/core/cache.py` functions:
```python
from app.core.cache import get_cache, set_cache
await set_cache(key, value, expire=3600)
data = await get_cache(key)
```

### Maintenance Mode
Middleware in `app/middleware/maintenance.py` checks site settings. Admins bypass. Frontend shows maintenance page when enabled.

### Logging System
Frontend has auto-logging on build. Script `scripts/update-logs.js` analyzes git commits and updates `Log.tsx` page automatically.

### Documentation Strategy
Extensive markdown docs in project root (e.g., `BLOG_SYNC_IMPLEMENTATION.md`). Each major feature has:
- Implementation guide
- Testing checklist
- Deployment instructions
- Quick reference

See `DOCUMENTATION_INDEX.md` for catalog.

## Key Files to Reference

- `backend/main.py` - FastAPI app entry, middleware setup, CORS
- `backend/app/api/v1/router.py` - API router registration
- `backend/app/api/dependencies.py` - Auth dependencies, role checks
- `backend/app/models/models.py` - Core database models
- `frontend/src/App.tsx` - Route definitions, lazy loading setup
- `frontend/src/lib/api.ts` - API client, interceptors, error handling
- `frontend/src/store/authStore.ts` - Auth state, token management
- `README.md` - Quick start, tech stack
- `DEPLOYMENT.md` - Production deployment guide

## Common Pitfalls

1. **CORS Issues**: Add origins to `CORS_ORIGINS` in backend `.env` and restart backend
2. **Token Refresh Loops**: Check if refresh endpoint is excluded from retry logic in `api.ts`
3. **Cross-Subdomain Auth**: Ensure cookies set with `domain=.citricloud.com` and `SameSite=Lax`
4. **Build Failures**: Run `npm run build:skip-log` to bypass log updates if git fails
5. **Database Locks**: Use `AsyncSession` properly with `async with` context managers
6. **TypeScript Errors**: Frontend is strict mode; avoid `any` types, define interfaces
7. **Mobile Build Issues**: Check Node version matches web (20.x), clear Expo cache if needed

## Performance Considerations

- Frontend assets fingerprinted with content hash (Vite automatic)
- Nginx caches static assets with `Cache-Control: public, max-age=31536000`
- HTML files never cached (`max-age=0`)
- Backend uses Redis for expensive queries (translations, config)
- Database queries use indexes; check `models.py` for `Index()` definitions
- TanStack Query caches API responses; use `staleTime` wisely

---

**Last Updated**: 2026-01-03  
**Project Version**: 1.0.0  
**Architecture**: Microservices (FastAPI backend + React frontend + React Native mobile)
