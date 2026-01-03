# Quick Fix: Initialize Missing Roles

## The Issue
You're getting 500 errors when assigning certain roles because they don't exist in the database yet.

## Quick Solution (Via Web Interface)

1. **Login as admin** at: https://my.citricloud.com/login

2. **Go to Roles page**: https://my.citricloud.com/dashboard/crm/roles

3. **Click "Initialize Default Roles"** button at the top of the page

4. **Done!** All 24 roles will now be available for assignment

## What This Does

The initialization will create these missing roles:
- Developer
- Manager  
- Spectator
- Keymaster
- Blocked
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

Plus ensure these existing ones are present:
- System Admin
- Administrator
- Moderator
- Subscriber
- Editor
- Contributor
- Author

## Verify the Fix

After initializing:

1. Go to: https://my.citricloud.com/dashboard/crm/users
2. Click on any user
3. Try changing their role to "Moderator" or any other previously broken role
4. It should work without errors now!

## Alternative: API Method

If you prefer using the API directly:

```bash
# Replace YOUR_EMAIL and YOUR_PASSWORD with your admin credentials
python3 initialize_roles.py YOUR_EMAIL YOUR_PASSWORD
```

For example:
```bash
python3 initialize_roles.py admin@citricloud.com mypassword123
```

## Files Updated

The fix required updating these files:
- ✅ `backend/app/api/v1/endpoints/crm.py` - Added 17 missing roles
- ✅ `frontend/src/pages/dashboard/CRMRoles.tsx` - Updated UI to show all roles
- ✅ Backend has been restarted automatically

All you need to do is click the "Initialize Default Roles" button!
