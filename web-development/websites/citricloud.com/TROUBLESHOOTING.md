# Troubleshooting Guide

## Authentication Issues

### Console Error: "No token found in localStorage"

**Symptoms:**
```
API Request interceptor - Token exists: false Length: 0
API Request - No token found in localStorage
```

**Cause:** You're not logged in, but trying to access protected routes.

**Solution:**

1. **Ensure backend is running:**
   ```bash
   cd backend
   source venv/bin/activate
   uvicorn main:app --host 0.0.0.0 --port 8000 --reload
   ```

2. **Navigate to the login page:**
   ```
   http://localhost:5173/login
   ```

3. **Log in with credentials:**
   - Email: `85guray@gmail.com`
   - Password: `password123`

4. **If you're not redirected automatically, clear browser storage:**
   - Open DevTools (F12)
   - Go to Application tab → Storage
   - Click "Clear site data"
   - Refresh the page

5. **Verify tokens are stored:**
   - Open DevTools → Application → Local Storage
   - Check for `access_token` and `refresh_token`

### Backend Errors

#### IndentationError in dependencies.py

**Fixed:** The print statements had incorrect indentation. This has been resolved.

#### Backend hanging on login requests

**Cause:** Multiple uvicorn processes or stuck database connections.

**Solution:**
```bash
# Kill all uvicorn processes
pkill -9 -f "uvicorn main:app"

# Wait and restart
sleep 2
cd backend && source venv/bin/activate
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

#### Reset User Password

If you need to reset a password:
```bash
cd backend
source venv/bin/activate
python reset_password.py
```

Or manually via database:
```bash
PGPASSWORD=citricloud psql -U citricloud -h localhost -d citricloud
```

### Protected Routes Not Redirecting

If you can still see protected pages without being logged in:

1. Check browser console for React Router errors
2. Clear localStorage manually:
   ```javascript
   localStorage.clear();
   window.location.reload();
   ```

3. Check if auth storage is persisted incorrectly:
   ```javascript
   // In browser console
   console.log(localStorage.getItem('auth-storage'));
   ```

### API Requests Failing with 401

**After logging in**, if requests still fail:

1. Check token expiry (default: 30 minutes)
2. The refresh token should automatically renew the access token
3. If refresh fails, you'll be redirected to `/login`

## Development Tips

### Quick Login Test
```bash
# Test login endpoint directly
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'
```

### Check Authentication Status
```javascript
// In browser console
const auth = JSON.parse(localStorage.getItem('auth-storage') || '{}');
console.log('Authenticated:', auth.state?.isAuthenticated);
console.log('User:', auth.state?.user);
```

### Force Logout
```javascript
// In browser console
localStorage.removeItem('access_token');
localStorage.removeItem('refresh_token');
localStorage.removeItem('auth-storage');
window.location.href = '/login';
```
