# Roles Management - Quick Start Guide

## What's New?
A complete role management system has been added to your CRM dashboard with support for 22 different user roles.

## Quick Access
**Path**: Dashboard → CRM → Roles  
**URL**: `http://yourdomain.com/dashboard/crm/roles`

## First Time Setup

1. **Navigate to Roles Page**
   - Go to Dashboard
   - Click "CRM" in the sidebar
   - Select "Roles"

2. **Initialize Default Roles**
   - Click the "Initialize Default Roles" button
   - This creates all 22 pre-configured roles in your database
   - Takes about 1-2 seconds

3. **Review Your Roles**
   - View all roles in a card-based grid
   - Each card shows:
     - Role name
     - Description
     - Number of users assigned
     - Whether it's a system role (protected)

## Available Roles (22 Total)

### Management Roles
- System Admin (⚠️ System Role)
- Administrator (⚠️ System Role)  
- Developer (⚠️ System Role)
- Manager
- Employee

### Content Roles
- Editor
- Author
- Contributor
- Moderator

### Specialized Roles
- Finance Manager
- Accountant
- Payroll
- Support
- Receptionist
- Marketing Assistant
- Officer
- Operator

### Access Roles
- Keymaster
- Participant
- Subscriber
- Spectator
- Blocked

## Features

### 🔍 Search & Filter
- Search roles by name
- Filter by description
- Real-time results

### ✏️ Edit Roles
- Update role names
- Modify descriptions
- Change display colors
- **Note**: System roles cannot be edited

### 🗑️ Delete Roles
- Delete custom roles
- **Protected**: Cannot delete roles with assigned users
- **Protected**: Cannot delete system roles

### 📊 Statistics
- Total roles count
- System vs custom roles
- Total users across all roles

## Multi-Language Support
Roles are fully translated in:
- 🇬🇧 English
- 🇳🇱 Dutch (Nederlands)
- 🇩🇪 German (Deutsch)
- 🇫🇷 French (Français)
- 🇪🇸 Spanish (Español)

Switch languages in the top navigation to see all translations.

## Best Practices

1. **Keep System Roles**: Don't modify or delete the three system roles (System Admin, Administrator, Developer)

2. **Custom Roles**: Create custom roles for your specific organizational needs beyond the defaults

3. **User Assignment**: 
   - Assign users to roles in the User Management section
   - One user can have one primary role
   - Roles determine permissions and access levels

4. **Deletion**: Always ensure you have no users assigned to a role before deleting it

## Color Coding
Each role has a unique color for visual identification:
- Red roles: Administrative/System roles
- Blue roles: Management roles
- Green roles: Support/Services roles
- Purple roles: Development roles
- Yellow roles: Financial roles

## Permission Management
Roles can be assigned specific permissions through the JSON permissions field. Permissions include:
- Dashboard access
- User management
- Content management
- Financial operations
- And more...

## Troubleshooting

**Can't see roles?**
- Clear browser cache (Ctrl+Shift+R)
- Ensure you're logged in as admin
- Try refreshing the page

**Can't delete a role?**
- Check if users are assigned to this role
- System roles cannot be deleted
- Try reassigning users first

**Need to reset?**
- Navigate to Roles page
- Click "Initialize Default Roles" again
- Existing roles won't be duplicated

## API Endpoints (Developer Info)

```
GET    /api/v1/crm/roles                - List roles
POST   /api/v1/crm/roles                - Create role
GET    /api/v1/crm/roles/{id}           - Get role details
PUT    /api/v1/crm/roles/{id}           - Update role
DELETE /api/v1/crm/roles/{id}           - Delete role
GET    /api/v1/crm/roles/{id}/users     - List role users
```

## Support
For issues or questions about roles management:
1. Check this guide first
2. Review the implementation documentation (ROLES_IMPLEMENTATION.md)
3. Contact support@citricloud.com

---
**Version**: 1.0  
**Status**: Production Ready ✅  
**Last Updated**: December 6, 2025
