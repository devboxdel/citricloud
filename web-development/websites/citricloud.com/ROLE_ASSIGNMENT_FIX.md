# Role Assignment Fix - Deployment Guide

## Problem

Users were getting 500 errors when trying to assign certain roles:
- ❌ Moderator, Spectator, Subscriber, Keymaster, Editor, Contributor, Blocked, Author
- ❌ Participant, Operator, Support, Finance Manager, Employee, Accountant, Payroll
- ❌ Receptionist, Marketing Assistant, Officer
- ✅ Only Developer, Administrator, Manager, System Admin were working

## Root Cause

The role assignment endpoint `PUT /api/v1/crm/users/{user_id}/role/{role_id}` requires roles to exist in the `roles` table. However, the `initialize_default_roles` endpoint only created 7 roles, while the `UserRole` enum defined 24 roles total.

## Solution

1. **Updated Backend** (`backend/app/api/v1/endpoints/crm.py`)
   - Expanded `DEFAULT_ROLES` from 7 to 24 roles
   - Added all missing roles with proper descriptions and colors

2. **Updated Frontend** (`frontend/src/pages/dashboard/CRMRoles.tsx`)
   - Updated `DEFAULT_ROLES` to match backend
   - Added color mappings for all new role colors

3. **Created Initialization Script** (`initialize_roles.py`)
   - Automated role initialization via API

## Deployment Steps

### Step 1: Stop Running Services

```bash
# If using start.sh
pkill -f uvicorn
pkill -f "npm run dev"

# If using systemd
sudo systemctl stop citricloud-backend
sudo systemctl stop citricloud-frontend
```

### Step 2: Update Backend

The backend changes are already in place. Just restart the service:

```bash
cd /home/ubuntu/infrastructure/cloud/web-development/websites/citricloud.com/backend
source venv/bin/activate
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Or if using the start script:

```bash
cd /home/ubuntu/infrastructure/cloud/web-development/websites/citricloud.com
./start.sh
```

### Step 3: Initialize Missing Roles

Run the initialization script to create all missing roles in the database:

```bash
cd /home/ubuntu/infrastructure/cloud/web-development/websites/citricloud.com

# Make script executable
chmod +x initialize_roles.py

# Run the script (requires admin credentials)
python3 initialize_roles.py
```

**Note:** The script will attempt to login with credentials from `.env` file:
- `ADMIN_EMAIL` (default: admin@citricloud.com)
- `ADMIN_PASSWORD` (default: admin123)

### Step 4: Rebuild Frontend

```bash
cd /home/ubuntu/infrastructure/cloud/web-development/websites/citricloud.com/frontend
npm run build
```

### Step 5: Restart Services

If using start.sh:
```bash
cd /home/ubuntu/infrastructure/cloud/web-development/websites/citricloud.com
./start.sh
```

If using systemd:
```bash
sudo systemctl restart citricloud-backend
sudo systemctl restart citricloud-frontend
```

## Verification

### 1. Check Available Roles

Visit: https://my.citricloud.com/dashboard/crm/roles

You should see all 24 roles listed:
- System Admin
- Developer
- Administrator
- Manager
- Moderator
- Spectator
- Subscriber
- Keymaster
- Editor
- Contributor
- Blocked
- Author
- Participant
- Operator
- Support
- Finance Manager
- Employee
- Accountant
- Payroll
- Receptionist
- Marketing Assistant
- Officer
- User
- Guest

### 2. Test Role Assignment

1. Go to: https://my.citricloud.com/dashboard/crm/users
2. Click on any user
3. Try changing their role to each of the previously broken roles
4. Verify no 500 errors occur
5. Check the user's role is updated successfully

### 3. Verify API Response

```bash
# Get list of roles
curl -X GET "http://localhost:8000/api/v1/crm/roles?page=1&page_size=50" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Should return 24 roles total
```

## Alternative: Manual API Call

If the script doesn't work, you can manually call the API:

```bash
# 1. Login to get token
TOKEN=$(curl -X POST "http://localhost:8000/api/v1/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin@citricloud.com&password=admin123" \
  | jq -r '.access_token')

# 2. Initialize roles
curl -X POST "http://localhost:8000/api/v1/crm/roles/initialize" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
```

## Files Modified

1. `backend/app/api/v1/endpoints/crm.py` - Added 17 new roles to DEFAULT_ROLES
2. `frontend/src/pages/dashboard/CRMRoles.tsx` - Updated DEFAULT_ROLES and ROLE_COLORS
3. `initialize_roles.py` - New script for automated role initialization

## Rollback Plan

If issues occur:

1. The changes are backward compatible
2. Existing roles are not modified (only new ones are added)
3. To rollback, simply don't run the initialization script
4. Existing working roles (Developer, Administrator, Manager, System Admin) remain functional

## Notes

- The initialization endpoint is idempotent - running it multiple times is safe
- System roles (System Admin, Developer, Administrator) cannot be deleted via UI
- Role colors use Tailwind CSS color classes
- All 24 roles now match the UserRole enum in the backend

## Support

If you encounter issues:
1. Check backend logs: `tail -f backend/backend.log`
2. Check frontend console for errors
3. Verify database connection
4. Ensure admin credentials are correct
