# Maintenance Mode Implementation - Complete ✅

## Overview
Fully functional maintenance mode system integrated with Frontend Settings on CMS panel. Allows administrators to put the entire site into maintenance mode with automatic redirect to https://my.citricloud.com/maintenance.

## Components Implemented

### Backend

#### 1. Database Model
**File**: `backend/app/models/site_settings_models.py`
- **SiteSettings** table with singleton pattern
- Fields:
  - `maintenance_mode` (Boolean) - Toggle maintenance mode on/off
  - `site_name` (String) - Site name
  - `enable_blog`, `enable_shop`, `enable_community`, `enable_workspace` (Boolean) - Feature toggles
  - `dark_mode_default` (Boolean) - Default dark mode preference
  - `logo_url`, `favicon_url` (String) - Branding assets
  - `primary_color`, `accent_color` (String) - Color scheme
  - `font_family` (String) - Typography
  - `header_layout`, `footer_layout` (String) - Layout preferences
  - `custom_css`, `custom_js` (Text) - Custom styling/scripts
  - Timestamps: `created_at`, `updated_at`

#### 2. Pydantic Schemas
**File**: `backend/app/schemas/site_settings_schemas.py`
- `SiteSettingsBase` - Base schema with all fields optional
- `SiteSettingsUpdate` - Inherits from Base for update requests
- `SiteSettingsResponse` - Includes id and timestamps for API responses
- `MaintenanceModeResponse` - Simple response with maintenance_mode boolean and message

#### 3. API Endpoints
**File**: `backend/app/api/v1/endpoints/site_settings.py`

**Public Endpoints**:
- `GET /api/v1/site-settings/` - Get current site settings (no auth required)
- `GET /api/v1/site-settings/maintenance` - Check if maintenance mode is active (no auth required)

**Admin-Only Endpoints** (requires SYSTEM_ADMIN or ADMINISTRATOR role):
- `PUT /api/v1/site-settings/` - Update all site settings
- `POST /api/v1/site-settings/maintenance/toggle` - Toggle maintenance mode on/off

**Helper Functions**:
- `get_or_create_settings()` - Ensures single settings record exists (singleton pattern)

#### 4. Maintenance Mode Middleware
**File**: `backend/app/middleware/maintenance.py`
- Checks maintenance_mode before processing requests
- Exempts paths: `/api/v1/auth/*`, `/health`, `/`, `/maintenance`, `/uploads`, `/static`
- For authenticated admin users (SYSTEM_ADMIN, ADMINISTRATOR): bypass maintenance mode
- For API requests during maintenance: returns 503 JSON error
- For regular requests during maintenance: redirects to `/maintenance` page
- Gracefully handles errors (allows request on error)

**Registered in**: `backend/main.py` as HTTP middleware

#### 5. Router Registration
**File**: `backend/app/api/v1/router.py`
- Imported `site_settings` from endpoints
- Registered with prefix `/site-settings` and tag "Site Settings"
- Added to API info endpoint list

### Frontend

#### 1. API Integration
**File**: `frontend/src/lib/api.ts`
- `siteSettingsAPI` object with methods:
  - `getSettings()` - Fetch current settings
  - `updateSettings(data)` - Update settings (admin only)
  - `checkMaintenance()` - Public maintenance check
  - `toggleMaintenance()` - Toggle maintenance on/off (admin only)

#### 2. Frontend Settings Page
**File**: `frontend/src/pages/dashboard/CMSFrontendSettings.tsx`

**Features**:
- ✅ Load settings from API on mount
- ✅ Save settings to API (admin only)
- ✅ Loading state while fetching
- ✅ Saving state with disabled button
- ✅ Error handling with user-friendly alerts

**UI Sections**:
1. **General Settings**
   - Site Name (text input)
   - Site Tagline (text input)
   - Maintenance Mode (toggle switch) ⚠️
   - Dark Mode by Default (toggle switch)

2. **Feature Toggles**
   - Enable Blog (toggle)
   - Enable Shop (toggle)
   - Enable Community (toggle)
   - Enable Workspace (toggle)

3. **Brand & Logo**
   - Logo URL (text input)
   - Favicon URL (text input)
   - Primary Color (color picker)
   - Accent Color (color picker)

4. **Typography & Layout**
   - Font Family (dropdown: Inter, Roboto, Poppins, Open Sans, Lato)
   - Header Layout (dropdown: Centered, Left Aligned, Split)
   - Footer Layout (dropdown: Full Width, Compact, Minimal)

5. **Live Preview** (coming soon placeholder)

#### 3. Navigation
- **Sidebar**: Frontend Settings menu item added to CMS sidebar
  - Icon: FiZap (lightning bolt)
  - Path: `/dashboard/cms/frontend-settings`
  - File: `frontend/src/components/DashboardLayout.tsx`

- **Dashboard Quick Action**: Updated button to navigate to settings page
  - File: `frontend/src/pages/dashboard/CMSDashboard.tsx`

## Database Migration

The database migration happens automatically via SQLAlchemy's `Base.metadata.create_all()` on application startup (`backend/main.py` lifespan function). The `site_settings` table is created if it doesn't exist.

**Table Structure**:
```sql
CREATE TABLE site_settings (
    id SERIAL PRIMARY KEY,
    maintenance_mode BOOLEAN DEFAULT FALSE,
    site_name VARCHAR DEFAULT 'CITRICLOUD',
    enable_blog BOOLEAN DEFAULT TRUE,
    enable_shop BOOLEAN DEFAULT TRUE,
    enable_community BOOLEAN DEFAULT TRUE,
    enable_workspace BOOLEAN DEFAULT TRUE,
    dark_mode_default BOOLEAN DEFAULT FALSE,
    logo_url VARCHAR DEFAULT '/logo.svg',
    favicon_url VARCHAR DEFAULT '/favicon.ico',
    primary_color VARCHAR DEFAULT '#3B82F6',
    accent_color VARCHAR DEFAULT '#8B5CF6',
    font_family VARCHAR DEFAULT 'Inter',
    header_layout VARCHAR DEFAULT 'centered',
    footer_layout VARCHAR DEFAULT 'full',
    custom_css TEXT,
    custom_js TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

## How It Works

### Normal Operation (Maintenance Mode OFF)
1. User visits site
2. Middleware checks `site_settings.maintenance_mode` → FALSE
3. Request proceeds normally
4. Site functions as usual

### Maintenance Mode ON
1. Admin enables maintenance mode via Frontend Settings page
2. API updates `site_settings.maintenance_mode = TRUE`
3. Non-admin user visits any page
4. Middleware intercepts request:
   - Checks `maintenance_mode` → TRUE
   - Checks if user is admin (from JWT token)
   - User is NOT admin → Redirects to `/maintenance` (307 Temporary Redirect)
   - User IS admin (SYSTEM_ADMIN or ADMINISTRATOR) → Allows access
5. Admin users can still access all pages and turn off maintenance mode

### API Behavior During Maintenance
- API requests during maintenance return:
  ```json
  {
    "detail": "Site is currently under maintenance. Please try again later.",
    "maintenance_mode": true
  }
  ```
  Status Code: 503 Service Unavailable

## Testing

### Backend API Tests
```bash
# Check current settings
curl http://localhost:8001/api/v1/site-settings/

# Check maintenance status (public endpoint)
curl http://localhost:8001/api/v1/site-settings/maintenance

# Toggle maintenance mode (requires admin auth)
curl -X POST http://localhost:8001/api/v1/site-settings/maintenance/toggle \
  -H "Authorization: Bearer <admin_token>"

# Update settings (requires admin auth)
curl -X PUT http://localhost:8001/api/v1/site-settings/ \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{"maintenance_mode": true, "site_name": "Updated Name"}'
```

### Frontend Testing
1. Login as admin user
2. Navigate to CMS Dashboard → Frontend Settings
3. Toggle "Maintenance Mode" switch
4. Click "Save Changes"
5. Verify alert: "Settings saved successfully!"
6. Open incognito window (not logged in)
7. Visit any page → Should redirect to `/maintenance`
8. Login as admin → Should bypass maintenance mode
9. Disable maintenance mode via Frontend Settings
10. Non-admin users can now access the site again

## Security

- ✅ Admin-only endpoints protected by role check (SYSTEM_ADMIN or ADMINISTRATOR)
- ✅ Public endpoints for checking settings (needed for maintenance page display)
- ✅ JWT token validation in middleware for admin bypass
- ✅ Graceful error handling (allows request on middleware errors)
- ✅ CORS configured for secure cross-origin requests

## Performance

- ✅ Database query runs once per request (minimal overhead)
- ✅ Singleton pattern ensures single settings record
- ✅ Middleware short-circuits for exempt paths
- ✅ No caching needed (settings change infrequently)

## Files Created/Modified

### Created
- `backend/app/models/site_settings_models.py`
- `backend/app/schemas/site_settings_schemas.py`
- `backend/app/api/v1/endpoints/site_settings.py`
- `backend/app/middleware/maintenance.py`
- `frontend/src/pages/dashboard/CMSFrontendSettings.tsx`

### Modified
- `backend/main.py` - Added maintenance middleware
- `backend/app/api/v1/router.py` - Registered site_settings router
- `frontend/src/lib/api.ts` - Added siteSettingsAPI
- `frontend/src/components/DashboardLayout.tsx` - Added Frontend Settings to sidebar
- `frontend/src/pages/dashboard/CMSDashboard.tsx` - Updated button navigation

## Next Steps (Optional Enhancements)

1. **Maintenance Page Customization**
   - Allow admins to customize maintenance page message
   - Add expected return time field
   - Custom maintenance page template

2. **Scheduled Maintenance**
   - Add start_time and end_time fields
   - Automatic enable/disable based on schedule
   - Countdown timer on maintenance page

3. **Notification System**
   - Send email/notification when maintenance mode is enabled
   - Alert admins before scheduled maintenance
   - Notify users when site returns

4. **Advanced Settings**
   - Allow specific IP addresses to bypass maintenance
   - Whitelist certain user roles
   - Maintenance mode for specific sections only

5. **Analytics Integration**
   - Track how many users hit maintenance page
   - Log maintenance duration
   - Generate maintenance reports

## Conclusion

✅ **Maintenance Mode is fully functional and production-ready!**

The system provides a complete solution for putting the website into maintenance mode with:
- Easy toggle from CMS Frontend Settings page
- Automatic redirect to maintenance page for non-admin users
- Admin bypass to manage site during maintenance
- Secure role-based access control
- Clean API design with public and admin-only endpoints
- Comprehensive frontend UI for managing all site settings

**Maintenance Page URL**: https://my.citricloud.com/maintenance

---

*Implementation completed on December 10, 2025*
*Backend running on port 8001*
*Frontend deployed to production*
