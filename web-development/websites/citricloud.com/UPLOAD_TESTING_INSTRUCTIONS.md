# Upload Feature - Testing Instructions with Diagnostics

**Frontend Deployed**: 2025-12-12 16:45:19 UTC

## Quick Diagnostic Test

Follow these steps to identify exactly where the upload process fails:

### 1. Clear Browser Cache & Open DevTools
- Hard refresh: **Ctrl+Shift+R** (Windows/Linux) or **Cmd+Shift+R** (Mac)
- Open DevTools: **F12**
- Go to **Console** tab
- Leave it visible throughout testing

### 2. Navigate to ERP Dashboard - Categories
- Click **Dashboard** in navbar
- Click **ERP** → **Categories**
- Scroll to find a category or create a new one
- Click the **Upload Image** button (camera icon)
- Select a **small JPG or PNG file** (< 1MB for faster testing)

### 3. Watch Console Output for These Patterns

**Expected Successful Flow** (all 4 phases):
```
🔴 handleImageUpload ENTRY (categories), file: [File object]
✅ File selected: { name: 'image.jpg', size: 12345, type: 'image/jpeg' }
✅ File size validation PASSED
✅ File type validation PASSED
➡️  Calling uploadImageMutation.mutateAsync...
🔵 uploadImageMutation.mutationFn START (categories), file: image.jpg
➡️  Calling erpAPI.uploadImage...
✅ uploadImageMutation.onSuccess FIRED (categories)
✅ erpAPI returned: {data: {success: true, image_url: '/uploads/...', filename: '...'}}
✅ image_url extracted: /uploads/xxxx.jpg
✅ Showing success toast
✅ Upload completed: ...
```

### 4. Report Based on Console Output

**Case A: All green messages** ✅
- Upload is working! Check if image now displays in category card
- **Next step**: Save the category and verify image persists in database

**Case B: Stops at "🔴 handleImageUpload ENTRY"**
- File input isn't firing at all
- **Action**: Verify button click works, try different file, try different browser

**Case C: Stops at "✅ File selected" with validation messages**
- File validation failing
- **Action**: Copy exact error message and report

**Case D: Stops at "🔵 uploadImageMutation.mutationFn START"**
- Frontend mutation starting but API call never completing
- **Action**: Check browser network tab (DevTools → Network)
  - Is POST request to `/api/v1/erp/upload-image` visible?
  - What's the HTTP status code?
  - Copy the response body

**Case E: Shows "❌ uploadImageMutation.onError FIRED"**
- API call failed
- **Action**: Copy the console error message showing:
  - HTTP status (401, 403, 500, etc.)
  - Error message/detail
  - Full error response

**Case F: No console messages at all**
- Old cached code still running
- **Action**: 
  1. Restart browser completely
  2. Try private/incognito window
  3. Try different browser
  4. If still nothing: Backend may be down (check `systemctl status citricloud-backend`)

### 5. Additional Verification Commands

If upload fails, run these to check system state:

```bash
# Check if upload directory exists and is writable
ls -lh /var/www/citricloud.com/uploads/

# Check backend is running
systemctl status citricloud-backend

# Check recent backend logs for upload errors
journalctl -u citricloud-backend -n 50 | grep -i "upload\|error\|image"

# Check if frontend was deployed (check timestamp)
ls -l /var/www/citricloud.com/index.html
stat /var/www/citricloud.com/assets/index-*.js | head -1
```

---

## Testing Checklist

- [ ] Browser hard refreshed (Ctrl+Shift+R)
- [ ] DevTools Console tab open
- [ ] ERP Dashboard Categories page loaded
- [ ] File selected via upload button
- [ ] Console shows diagnostic emoji messages
- [ ] Upload completes (all steps or identified failure point)
- [ ] Report which emoji sequence appears (copy-paste from console)

---

## Key Diagnostic Emoji Meanings

- 🔴 **RED**: Entry point / Start of process
- 🔵 **BLUE**: API mutation started
- ✅ **GREEN CHECK**: Validation passed or step succeeded
- ❌ **RED X**: Validation failed or error occurred
- ➡️ **ARROW**: About to call next function/API

Each emoji is followed by a description of what's happening. If flow stops at any emoji, that indicates the failure point.

---

## For Backend Analysis (if errors persist)

After reporting console output, we can check:
1. Backend upload endpoint logs to see if request arrived
2. Nginx access logs to see if POST reached the API
3. File permissions on `/uploads` directory
4. Authentication token validation
5. Multipart form-data parsing

**Report the emoji sequence you see, and we'll investigate the specific failure point.**
