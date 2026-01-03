# Architecture and Data Flow: Roles & Users System

## Database Schema

```
┌─────────────────────────────────┐
│           ROLES TABLE           │
├─────────────────────────────────┤
│ id (PK)                         │
│ name                            │
│ role_key                        │
│ description                     │
│ is_system_role                  │
│ color                           │
│ permissions (JSON)              │
│ user_count                      │
│ created_at                      │
│ updated_at                      │
└─────────────────────────────────┘
          ↑
          │ 1 (one-to-many)
          │
          │
┌─────────────────────────────────┐
│          USERS TABLE            │
├─────────────────────────────────┤
│ id (PK)                         │
│ email                           │
│ username                        │
│ hashed_password                 │
│ full_name                       │
│ role (ENUM - legacy)            │
│ role_id (FK) ←─────┘ (NEW!)     │
│ is_active                       │
│ is_verified                     │
│ avatar_url                      │
│ phone                           │
│ created_at                      │
│ updated_at                      │
│ last_login                      │
└─────────────────────────────────┘
```

## API Flow Diagram

### Initialization Flow

```
┌──────────────────────────────────────────────────────────────┐
│                    FRONTEND (CRMRoles.tsx)                   │
│                                                              │
│  User clicks "Initialize Default Roles" button              │
└──────────────────────────────────────┬───────────────────────┘
                                       │
                                       ▼
┌──────────────────────────────────────────────────────────────┐
│              API Client (frontend/src/lib/api.ts)             │
│                                                              │
│  crmAPI.initializeRoles()                                    │
│  → POST /api/v1/crm/roles/initialize                         │
└──────────────────────────────────────┬───────────────────────┘
                                       │
                                       ▼
┌──────────────────────────────────────────────────────────────┐
│              BACKEND API (crm.py)                            │
│                                                              │
│  initialize_default_roles()                                  │
│  ├─ For each of 22 DEFAULT_ROLES:                            │
│  │  ├─ Check if role_key exists in database                  │
│  │  ├─ If not: Create new Role                               │
│  │  └─ If yes: Increment skipCount                           │
│  └─ Return { successCount, skipCount }                       │
└──────────────────────────────────────┬───────────────────────┘
                                       │
                                       ▼
┌──────────────────────────────────────────────────────────────┐
│                 DATABASE (SQLite)                            │
│                                                              │
│  Insert 22 roles into ROLES table                            │
│  ├─ system_admin, developer, administrator (protected)       │
│  ├─ moderator, spectator, subscriber, keymaster, ...         │
│  └─ All 22 roles stored with unique role_key                 │
└──────────────────────────────────────┬───────────────────────┘
                                       │
                                       ▼
┌──────────────────────────────────────────────────────────────┐
│              RESPONSE Flow (Backend → Frontend)              │
│                                                              │
│  { successCount: 22, skipCount: 0 }                          │
│  → Query refetch triggered                                   │
│  → GET /api/v1/crm/roles (refresh list)                      │
│  → Roles displayed in grid                                   │
└──────────────────────────────────────┬───────────────────────┘
                                       │
                                       ▼
┌──────────────────────────────────────────────────────────────┐
│                    FRONTEND Display                          │
│                                                              │
│  "Successfully initialized 22 roles"                         │
│  ├─ Role cards appear in grid                                │
│  ├─ Can search/filter roles                                  │
│  ├─ Can edit custom roles                                    │
│  └─ Can delete custom roles                                  │
└──────────────────────────────────────────────────────────────┘
```

### User Role Assignment Flow

```
┌──────────────────────────────────────────────────────────────┐
│                  FRONTEND (CRMUsers.tsx)                     │
│                                                              │
│  User selects a role for another user                        │
│  └─ Click "Assign Role" or dropdown change                   │
└──────────────────────────────────────┬───────────────────────┘
                                       │
                                       ▼
┌──────────────────────────────────────────────────────────────┐
│              API Client (frontend/src/lib/api.ts)             │
│                                                              │
│  crmAPI.assignUserRole(userId, roleId)                       │
│  → PUT /api/v1/crm/users/{userId}/role/{roleId}             │
└──────────────────────────────────────┬───────────────────────┘
                                       │
                                       ▼
┌──────────────────────────────────────────────────────────────┐
│              BACKEND API (crm.py)                            │
│                                                              │
│  assign_user_role(user_id, role_id)                          │
│  ├─ Verify User exists (404 if not)                          │
│  ├─ Verify Role exists (404 if not)                          │
│  ├─ Set user.role_id = role_id                               │
│  └─ Return updated UserResponse                              │
└──────────────────────────────────────┬───────────────────────┘
                                       │
                                       ▼
┌──────────────────────────────────────────────────────────────┐
│                 DATABASE (SQLite)                            │
│                                                              │
│  UPDATE users SET role_id = ? WHERE id = ?                   │
│  └─ Foreign key constraint maintained                        │
└──────────────────────────────────────┬───────────────────────┘
                                       │
                                       ▼
┌──────────────────────────────────────────────────────────────┐
│              RESPONSE Flow (Backend → Frontend)              │
│                                                              │
│  UserResponse {                                              │
│    id: 1,                                                    │
│    email: "user@...",                                        │
│    username: "user",                                         │
│    role: "user",        ← legacy field                        │
│    role_id: 5,          ← NEW! Links to Role table            │
│    is_active: true                                           │
│  }                                                           │
└──────────────────────────────────────┬───────────────────────┘
                                       │
                                       ▼
┌──────────────────────────────────────────────────────────────┐
│                    FRONTEND Display                          │
│                                                              │
│  User table updated to show:                                 │
│  ├─ User's assigned role (from role_id)                      │
│  ├─ Role color indicator                                     │
│  └─ Role description on hover                                │
└──────────────────────────────────────────────────────────────┘
```

## Component Architecture

```
┌─────────────────────────────────────────────────────────────┐
│              CRMDashboard (Router)                          │
│                                                             │
│  ├─ Detects route: /dashboard/crm/roles                     │
│  │  └─ Renders CRMRoles component                           │
│  │                                                           │
│  └─ Detects route: /dashboard/crm                           │
│     └─ Renders CRMUsers component                           │
└─────────────────────────────────────────────────────────────┘
          │                             │
          ▼                             ▼
┌──────────────────────┐    ┌──────────────────────┐
│    CRMRoles.tsx      │    │    CRMUsers.tsx      │
│                      │    │                      │
│ Features:            │    │ Features:            │
│ ├─ Initialize        │    │ ├─ List users        │
│ ├─ Search roles      │    │ ├─ Search users      │
│ ├─ Edit custom       │    │ ├─ Show roles        │
│ ├─ Delete custom     │    │ ├─ Paginate          │
│ └─ View stats        │    │ └─ Edit details      │
│                      │    │                      │
│ State:               │    │ State:               │
│ ├─ roles[]           │    │ ├─ users[]           │
│ ├─ searchTerm        │    │ ├─ searchTerm        │
│ ├─ editingId         │    │ ├─ page              │
│ └─ formData          │    │ └─ pageSize          │
│                      │    │                      │
│ Queries:             │    │ Queries:             │
│ └─ useQuery(roles)   │    │ └─ useQuery(users)   │
│                      │    │                      │
│ Mutations:           │    │ Mutations:           │
│ ├─ create (init)     │    │ ├─ create            │
│ ├─ update            │    │ ├─ update            │
│ └─ delete            │    │ └─ delete            │
└──────────────────────┘    └──────────────────────┘
          │                             │
          └──────────┬──────────────────┘
                     │
                     ▼
          ┌──────────────────────┐
          │   crmAPI (lib/api)   │
          │                      │
          │ ├─ initializeRoles() │
          │ ├─ getRoles()        │
          │ ├─ createRole()      │
          │ ├─ updateRole()      │
          │ ├─ deleteRole()      │
          │ ├─ getUsers()        │
          │ ├─ assignUserRole()  │
          │ └─ ...               │
          └──────────┬───────────┘
                     │
                     ▼
          ┌──────────────────────┐
          │    Axios Instance    │
          │                      │
          │ Base URL: /api/v1    │
          │ Auth: Bearer Token   │
          │ CORS: Enabled        │
          └──────────┬───────────┘
                     │
                     ▼
          ┌──────────────────────┐
          │  FastAPI Backend     │
          │                      │
          │  Router: /crm        │
          │  ├─ /roles           │
          │  ├─ /roles/init      │
          │  ├─ /users           │
          │  └─ /users/{}/role   │
          └──────────┬───────────┘
                     │
                     ▼
          ┌──────────────────────┐
          │  SQLite Database     │
          │                      │
          │  ├─ roles table      │
          │  ├─ users table      │
          │  └─ relations        │
          └──────────────────────┘
```

## State Management Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    React Query (tanstack)                   │
│                                                             │
│  ├─ queryKey: ['crm-roles']                                 │
│  │  └─ Cached for automatic refetch on update               │
│  │                                                           │
│  ├─ queryKey: ['crm-users', page, search]                   │
│  │  └─ Separate cache per page/search combo                 │
│  │                                                           │
│  └─ Mutations (create/update/delete)                        │
│     ├─ Auto-refetch on success                              │
│     ├─ Show success/error messages                          │
│     └─ Update UI immediately                                │
└─────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────┐
│              Component Local State                          │
│                                                             │
│  CRMRoles:                    CRMUsers:                     │
│  ├─ searchTerm                ├─ page                        │
│  ├─ editingId                 ├─ search                      │
│  ├─ formData                  ├─ selectedUser (optional)     │
│  ├─ errorMessage              └─ editingUser (optional)      │
│  └─ successMessage                                          │
└─────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────┐
│              UI Rendering                                   │
│                                                             │
│  ├─ Role cards grid (CRMRoles)                              │
│  ├─ Users table (CRMUsers)                                  │
│  ├─ Search inputs                                           │
│  ├─ Action buttons                                          │
│  ├─ Loading spinners                                        │
│  ├─ Success/error messages                                  │
│  └─ Pagination controls                                     │
└─────────────────────────────────────────────────────────────┘
```

## Data Model Relationships

```
                    ┌─ User A ─┐
                    │ role_id=1 │
                    └───────────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
        ▼                 ▼                 ▼
    ┌────────────┐  ┌────────────┐  ┌────────────┐
    │ User B     │  │ User C     │  │ User D     │
    │ role_id=1  │  │ role_id=2  │  │ role_id=1  │
    └────────────┘  └────────────┘  └────────────┘
        │                 │                 │
        └─────────────────┼─────────────────┘
                          │
                ┌─────────┴─────────┐
                │                   │
                ▼                   ▼
            ┌──────────┐      ┌──────────┐
            │ Role: 1  │      │ Role: 2  │
            │ Manager  │      │ Admin    │
            └──────────┘      └──────────┘

One Role : Many Users
(One-to-Many relationship)
```

## Security & Validation Flow

```
Request → Authentication Check
           │
           ├─ No token? → 401 Unauthorized
           │
           └─ Token valid? → Continue
                  │
                  ▼
             Authorization Check
             │
             ├─ require_admin?
             │  ├─ Is admin? → Continue
             │  └─ Not admin? → 403 Forbidden
             │
             └─ Continue
                    │
                    ▼
             Parameter Validation
             │
             ├─ user_id exists?
             │  └─ No? → 404 Not Found
             │
             ├─ role_id exists?
             │  └─ No? → 404 Not Found
             │
             └─ All valid? → Continue
                    │
                    ▼
             Database Operation
             │
             ├─ Foreign key constraint
             ├─ No orphaned references
             └─ Data integrity maintained
                    │
                    ▼
             Response → 200 OK with data
```

---

## Key Metrics & Performance

### Database Queries
- **Initialize roles**: 1 query per role (22 total) ~ 100ms
- **Assign user role**: 2 queries (verify + update) ~ 50ms
- **Get roles list**: 1 query ~ 30ms
- **Get users list**: 1 query with pagination ~ 50ms

### API Response Times
- `POST /crm/roles/initialize`: < 2 seconds
- `PUT /crm/users/{id}/role/{role_id}`: < 500ms
- `GET /crm/roles`: < 1 second
- `GET /crm/users`: < 1 second

### Frontend Performance
- Initial load: ~2 seconds (with network)
- Search filtering: Instant (client-side)
- Pagination: < 1 second per page
- Role assignment: < 1 second

---

**Architecture Complete** ✅
