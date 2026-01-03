# Tickets Implementation Sync Guide
## Mobile App ↔ Web App

### Overview
The mobile app now has full ticket management implemented. This guide helps sync the web app to match.

### Current Status

#### ✅ Mobile App (WORKING)
- Location: `/mobile-app/src/screens/ProfileSheet.tsx`
- Tickets Tab: Shows datatable with ID, Subject, Priority, Status, Date
- Create Ticket Modal: Full form with subject, priority, message
- API Endpoints: `/erp/tickets`, `/support/tickets`, `/auth/profile/tickets` (with fallbacks)
- Features:
  - View all user tickets in table format
  - Create new support tickets
  - Priority badges (High/Medium/Low with color coding)
  - Status badges (Open/Closed/Pending/Resolved with color coding)
  - Auto-refresh after ticket creation

#### ⚠️ Web App (NEEDS SYNC)
- Location: `/web-development/websites/citricloud.com/frontend/src/pages/Profile.tsx`
- Issue: Tickets visible on mobile, NOT showing on web
- Need: Implement same API calls and UI as mobile

### API Endpoints

All endpoints are relative to `https://my.citricloud.com/api/v1`

```typescript
// Fetch user's support tickets
GET /erp/tickets
GET /support/tickets (fallback)
GET /auth/profile/tickets (fallback)

// Create new support ticket
POST /erp/tickets
POST /support/tickets (fallback)
POST /auth/profile/tickets (fallback)

// Get profile stats (includes ticket count)
GET /auth/profile/stats
```

### Request/Response Format

#### Create Ticket Request
```json
{
  "subject": "Test Ticket",
  "description": "This is the ticket message",
  "priority": "medium"
}
```

#### Ticket Response Object
```json
{
  "id": 1,
  "subject": "Test Ticket",
  "description": "This is the ticket message",
  "priority": "medium",
  "status": "open",
  "created_at": "2025-12-23T10:00:00Z",
  "updated_at": "2025-12-23T10:00:00Z"
}
```

#### Tickets List Response
```json
{
  "items": [
    { "id": 1, "subject": "...", "description": "...", "priority": "...", "status": "...", "created_at": "..." },
    { "id": 2, ... }
  ]
}
```

### Validation Rules

- **Subject**: Minimum 5 characters required
- **Description**: Required field
- **Priority**: "low", "medium", or "high"

### Mobile App Implementation Details

#### API Client (`mobile-app/src/lib/api.ts`)
```typescript
getTickets: async () => {
  // Tries multiple endpoints with fallbacks
  // Returns empty array on error
}

createTicket: async (subject: string, message: string, priority?: string) => {
  // Validates subject length (min 5 chars)
  // Sends to POST endpoint
  // Throws on error
}
```

#### UI Component (`mobile-app/src/screens/ProfileSheet.tsx`)
- Datatable with columns: ID, Subject, Priority, Status, Date
- Color-coded badges for priority and status
- Modal form for ticket creation
- Real-time refresh after creation
- Error handling with Alert dialogs

### Web App Implementation Checklist

**For `/web-development/websites/citricloud.com/frontend/src/pages/Profile.tsx`:**

- [ ] Import/create API client for tickets
  - [ ] getTickets() function with endpoint fallbacks
  - [ ] createTicket() function with validation
  
- [ ] Create Tickets Tab Component
  - [ ] Table/datatable for displaying tickets
  - [ ] Columns: ID, Subject, Priority, Status, Date
  - [ ] Add color-coded priority badges
  - [ ] Add color-coded status badges
  - [ ] Loading state while fetching
  - [ ] Empty state message
  
- [ ] Create New Ticket Modal/Dialog
  - [ ] Subject input (min 5 chars validation)
  - [ ] Description textarea
  - [ ] Priority dropdown selector
  - [ ] Submit button with loading state
  - [ ] Cancel button
  - [ ] Error display
  
- [ ] State Management
  - [ ] tickets array state
  - [ ] loading state
  - [ ] createTicketError state
  - [ ] showCreateTicket modal visibility
  
- [ ] Hooks/Effects
  - [ ] useEffect to fetch tickets when tab active
  - [ ] Auto-refresh after ticket creation
  - [ ] Proper error handling and logging
  
- [ ] Testing
  - [ ] Create test ticket from web
  - [ ] Verify it appears on mobile
  - [ ] Create test ticket from mobile
  - [ ] Verify it appears on web
  - [ ] Test validation (subject < 5 chars)
  - [ ] Test form error handling

### Color Coding Standards

**Priority Badges:**
- High: Red (#EF4444)
- Medium: Orange (#FFA500)
- Low: Green (#10B981)

**Status Badges:**
- Open: Blue (accent color)
- Closed: Gray (muted)
- Pending: Orange (#FFA500)
- Resolved: Green (#10B981)

### Testing Checklist

1. **Mobile → Web Sync**
   - Create ticket on mobile app
   - Refresh web profile page
   - Verify ticket appears in datatable

2. **Web → Mobile Sync**
   - Create ticket on web profile
   - Refresh mobile app profile
   - Verify ticket appears in datatable

3. **Form Validation**
   - Try subject < 5 chars (should error)
   - Try empty description (should error)
   - Valid submission (should succeed)

4. **Error Handling**
   - Network disconnection
   - Invalid priority value
   - Server errors

### Backend Notes

- `/erp/tickets` endpoint is having 500 errors - backend team should fix
- Fallback endpoints `/support/tickets` and `/auth/profile/tickets` are alternatives
- All endpoints require Authorization header with Bearer token
- Ticket data is persisted in database and synced across web/mobile
