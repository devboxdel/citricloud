# Roles and Users Initialization - Deployment Guide

## Summary of Changes

### Problem
The "Initialize Default Roles" button and user role assignment features weren't working in the CRM panel because:
1. Users table didn't have a relationship to the new Role table
2. Role initialization was using wrong API approach
3. No endpoint for assigning users to roles

### Solution
Added complete role-user relationship system with dedicated initialization and assignment endpoints.

---

## Files Modified

### Backend (3 files)

#### 1. `backend/app/models/models.py`
**Changes:**
- Added `role_id` field to User model (Foreign Key to roles.id)
- Added `crm_role` relationship to User model
- Added `users` relationship to Role model

**Key Lines:**
- Line 88: `users = relationship("User", foreign_keys="User.role_id", uselist=True)` in Role class
- Line 107: `role_id = Column(Integer, ForeignKey("roles.id"), nullable=True)` in User class
- Line 123: `crm_role = relationship("Role", foreign_keys=[role_id], uselist=False)` in User class

#### 2. `backend/app/schemas/schemas.py`
**Changes:**
- Added `role_id` to UserResponse schema

**Key Lines:**
- Line 144: `role_id: Optional[int] = None  # Link to CRM role`

#### 3. `backend/app/api/v1/endpoints/crm.py`
**Changes:**
- Added `POST /roles/initialize` endpoint for bulk role creation
- Added `PUT /users/{user_id}/role/{role_id}` endpoint for role assignment

**Key Functions:**
- Lines 277-330: `initialize_default_roles()` - Creates 22 default roles
- Lines 521-548: `assign_user_role()` - Assigns user to role

### Frontend (2 files)

#### 1. `frontend/src/lib/api.ts`
**Changes:**
- Added `initializeRoles()` method
- Added `assignUserRole()` method

**Key Lines:**
- Line 130: `initializeRoles: () => api.post('/crm/roles/initialize', {})`
- Line 129: `assignUserRole: (userId: number, roleId: number) => api.put(...)`

#### 2. `frontend/src/pages/dashboard/CRMRoles.tsx`
**Changes:**
- Updated `createRoleMutation` to use `initializeRoles()` endpoint
- Removed individual role creation loop

**Key Change:**
- Lines 79-91: Now calls `crmAPI.initializeRoles()` instead of loop

---

## Deployment Steps

### Step 1: Deploy Backend Changes
```bash
cd backend

# Verify syntax
python -m py_compile app/models/models.py
python -m py_compile app/api/v1/endpoints/crm.py
python -m py_compile app/schemas/schemas.py

# Optional: Run tests
python -m pytest tests/ -v

# Restart backend
# The application will automatically create/migrate the database on startup
```

### Step 2: Deploy Frontend Changes
```bash
cd frontend

# Build and verify
npm run build

# Deploy to production
npm run deploy  # or your deployment command
```

### Step 3: Database Migration
The database schema changes are applied automatically on application startup:
1. The new `role_id` column is created in the users table
2. The relationship constraints are established
3. The database is backward compatible (old `role` enum field remains)

**Manual Migration (if needed):**
```sql
-- Add role_id column to users table
ALTER TABLE users ADD COLUMN role_id INTEGER;

-- Add foreign key constraint
ALTER TABLE users ADD CONSTRAINT fk_users_role_id 
FOREIGN KEY (role_id) REFERENCES roles(id);
```

### Step 4: Initialize Default Roles
After deployment:
1. Log in as admin user
2. Navigate to Dashboard → CRM → Roles
3. Click "Initialize Default Roles" button
4. Verify all 22 roles are created

---

## API Reference

### Initialize Default Roles
```http
POST /api/v1/crm/roles/initialize
Authorization: Bearer {token}
Content-Type: application/json

Response (200):
{
  "successCount": 22,
  "skipCount": 0,
  "message": "Initialized 22 roles (0 already existed)"
}
```

### Assign User to Role
```http
PUT /api/v1/crm/users/{user_id}/role/{role_id}
Authorization: Bearer {token}
Content-Type: application/json

Response (200):
{
  "id": 1,
  "email": "user@example.com",
  "username": "user",
  "role": "user",
  "role_id": 5,  // New field linking to Role table
  "is_active": true,
  "created_at": "2025-12-06T..."
}
```

### Get All Roles
```http
GET /api/v1/crm/roles?page=1&page_size=50
Authorization: Bearer {token}

Response (200):
{
  "items": [
    {
      "id": 1,
      "name": "System Admin",
      "role_key": "system_admin",
      "description": "Full system access",
      "is_system_role": true,
      "color": "red",
      "user_count": 1,
      "created_at": "..."
    },
    ...
  ],
  "total": 22,
  "page": 1,
  "page_size": 50,
  "total_pages": 1
}
```

---

## Testing Checklist

### Backend Testing
- [ ] `POST /api/v1/crm/roles/initialize` returns success
- [ ] Second call returns skip count for existing roles
- [ ] `PUT /api/v1/crm/users/{id}/role/{role_id}` updates role
- [ ] Invalid user_id returns 404
- [ ] Invalid role_id returns 404
- [ ] Database shows role_id populated for assigned users

### Frontend Testing
- [ ] Navigate to Dashboard → CRM → Roles
- [ ] "Initialize Default Roles" button appears when no roles exist
- [ ] Click button shows loading state
- [ ] Success message displays with count
- [ ] Roles grid shows all 22 roles
- [ ] Can search/filter roles
- [ ] Navigate to Dashboard → CRM → Users
- [ ] Users table loads without errors
- [ ] Can see user role assignments

### Integration Testing
- [ ] Fresh install: Database creates properly
- [ ] Existing install: Migration applies smoothly
- [ ] Role initialization idempotent (can run multiple times)
- [ ] User role persistence across page reloads
- [ ] Pagination works for both roles and users

---

## Rollback Plan

If issues occur, rollback using:

### Step 1: Revert Code Changes
```bash
# Git rollback to previous version
git revert <commit-hash>

# Or manually restore from backup
```

### Step 2: Database Rollback
The changes are backward compatible, but if needed:
```sql
-- Roles and user_id assignments remain (no data loss)
-- Can simply drop the foreign key if absolutely necessary:
ALTER TABLE users DROP CONSTRAINT fk_users_role_id;
ALTER TABLE users DROP COLUMN role_id;
```

### Step 3: Restart Services
```bash
# Restart backend
systemctl restart citricloud-backend

# Restart frontend
systemctl restart citricloud-frontend
```

---

## Troubleshooting

### Issue: "No roles found" button doesn't appear
**Solution:**
- Hard refresh browser (Ctrl+Shift+R)
- Clear localStorage: `localStorage.clear()`
- Verify admin role in database

### Issue: Initialize button doesn't work
**Solution:**
- Check browser console for errors
- Verify API endpoint: `GET /api/v1/crm/roles/initialize`
- Check server logs for 500 errors
- Ensure user is authenticated

### Issue: Users show old role field instead of new role_id
**Solution:**
- Frontend might be caching response
- Clear browser cache
- Verify API returns `role_id` field
- Check UserResponse schema includes `role_id`

### Issue: Database migration fails
**Solution:**
- Delete `backend/citricloud.db` to start fresh
- Restart backend to recreate with new schema
- Check SQLAlchemy version compatibility

---

## Performance Considerations

- **Role initialization**: O(22) database queries (one per role check)
- **User role assignment**: O(2) database queries (verify user and role)
- **Pagination**: Efficient with SQL LIMIT/OFFSET
- **Caching**: Frontend caches queries with React Query

## Security Considerations

- ✅ Requires admin authentication for all endpoints
- ✅ System roles are protected from modification
- ✅ Role deletion prevented if users assigned
- ✅ Foreign key constraints prevent orphaned references
- ✅ Input validation on all endpoints

---

## Monitoring

Monitor these metrics post-deployment:

```
1. API Response Times:
   - POST /crm/roles/initialize < 2s
   - PUT /crm/users/{id}/role/{role_id} < 500ms

2. Error Rates:
   - 4xx errors for invalid inputs
   - 5xx errors should be near 0%

3. Database:
   - role_id column populated for new assignments
   - No orphaned role references
   - Referential integrity maintained
```

---

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review backend logs: `backend/backend.log`
3. Check frontend console: F12 → Console
4. Review database directly: SQLite browser

---

**Implementation Date**: December 6, 2025
**Status**: Ready for Production
**Version**: 1.0.0
