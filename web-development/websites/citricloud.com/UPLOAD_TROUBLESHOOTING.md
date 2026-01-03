# Upload Not Working - Troubleshooting Guide

## Current Status
- ✅ Backend endpoint exists and is functional
- ✅ Frontend timeout fixes applied
- ✅ Client-side validation added
- ✅ Error handling improved
- ✅ Debugging logs added
- ✅ Both deployed (Backend: 15:46:30, Frontend: 16:00:54)

## How to Diagnose the Issue

### Step 1: Open Browser Console
1. Open citricloud.com in your browser
2. Press **F12** to open Developer Tools
3. Go to **Console** tab
4. Keep it open during testing

### Step 2: Clear Browser Cache
**IMPORTANT**: The old frontend code might be cached!

**Method 1 - Hard Refresh**:
- Windows/Linux: `Ctrl + Shift + R` or `Ctrl + F5`
- Mac: `Cmd + Shift + R`

**Method 2 - Clear Cache**:
1. Press F12 (Developer Tools)
2. Right-click the refresh button
3. Select "Empty Cache and Hard Reload"

**Method 3 - Incognito Mode**:
- Open citricloud.com in an incognito/private window
- This ensures no cached files

### Step 3: Test Category Upload
1. Go to ERP Dashboard → Categories
2. Click "New Category" or edit existing
3. Look for the image upload section
4. Click or drag an image file
5. **Watch the console** - you should see:
   ```
   handleImageUpload called, file: [File object]
   File details: {name: "image.jpg", size: 12345, type: "image/jpeg"}
   Starting upload...
   uploadImageMutation mutationFn called with file: image.jpg
   ```

### Step 4: Check What's Happening

#### If you see console logs:
✅ **Frontend is working** - Check for errors in next logs:
- Look for "Upload mutation success" or "Upload mutation error"
- If error, note the message

#### If you DON'T see console logs:
❌ **Frontend code not loaded** or **Input not triggering**:
1. Hard refresh the page (Ctrl + Shift + R)
2. Check Network tab - look for `index-*.js` files
3. Verify timestamp is recent (16:00 or later)
4. Try incognito mode

### Step 5: Check Network Tab
1. In Developer Tools, go to **Network** tab
2. Try uploading an image
3. Look for request to `/api/v1/erp/upload-image`
4. Click on it to see:
   - Request Headers (should have Authorization token)
   - Response (should show success or error)

#### If NO network request appears:
- Frontend is not calling the API
- Check console for errors preventing the call
- Verify modal is actually open
- Try clicking the upload area directly

#### If network request shows:
- **200 OK**: Upload successful! Check response body for image_url
- **401 Unauthorized**: Authentication issue - try logging out and back in
- **400 Bad Request**: File validation failed - check error message
- **500 Server Error**: Backend issue - check logs
- **Timeout**: Increase timeout or check file size

### Step 6: Test Product Upload
Same as Step 3, but:
1. Go to ERP Dashboard → Products
2. Try uploading to Products instead
3. Console logs should show "(products)" suffix

## Common Issues & Solutions

### Issue: "Spinner keeps spinning forever"
**Cause**: Request timeout or network error
**Solution**:
1. Check Network tab for failed request
2. Check console for timeout error
3. Try smaller image (< 1MB)
4. Check internet connection

### Issue: "No response or error"
**Cause**: Old cached frontend
**Solution**:
1. Hard refresh (Ctrl + Shift + R)
2. Clear browser cache completely
3. Try incognito mode
4. Verify deployment timestamp in console

### Issue: "Upload succeeds but image not saved"
**Cause**: Form submission not including image_url
**Solution**:
1. Check console log "Upload successful"
2. Verify image_url is in categoryForm/productImages
3. Check if you're clicking "Save" after upload
4. Verify form submission includes images field

### Issue: "401 Unauthorized"
**Cause**: No auth token or expired token
**Solution**:
1. Log out and log back in
2. Check localStorage for access_token
3. Try refreshing the page
4. Check if token is being sent in request headers

### Issue: "File size must be less than 5MB" for small files
**Cause**: Client-side validation working correctly
**Solution**:
- This IS the validation working
- Check actual file size
- Try a different image file

## Check Backend Logs

If upload seems to reach backend but fails:

```bash
# Check recent logs
journalctl -u citricloud-backend --since "1 minute ago" --no-pager | grep -E "upload|Upload|image|error|Error"

# Monitor live logs
journalctl -u citricloud-backend -f | grep -E "upload|image"
```

## Verify File Upload

After successful upload, check if file exists:

```bash
# List uploaded files
ls -lh /var/www/citricloud.com/uploads/

# Check latest upload
ls -lht /var/www/citricloud.com/uploads/ | head -5
```

## Check Database

After saving category/product, verify images in database:

```bash
# Check categories with images
PGPASSWORD=citricloud psql -h localhost -U citricloud -d citricloud \
  -c "SELECT id, name, image_url FROM product_categories WHERE image_url IS NOT NULL;"

# Check products with images
PGPASSWORD=citricloud psql -h localhost -U citricloud -d citricloud \
  -c "SELECT id, name, images FROM products WHERE images IS NOT NULL;"
```

## Test Upload Directly

Test upload endpoint with curl (get token from browser localStorage):

```bash
# Replace YOUR_TOKEN with actual token
TOKEN="YOUR_TOKEN"

# Create test image
convert -size 100x100 xc:blue /tmp/test.jpg

# Test upload
curl -X POST http://localhost:8000/api/v1/erp/upload-image \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@/tmp/test.jpg"
```

## Expected Behavior

### Successful Upload Flow:
1. Select image → Console: "handleImageUpload called"
2. Validation passes → Console: "Starting upload..."
3. API called → Console: "uploadImageMutation mutationFn called"
4. Success → Console: "Upload successful", Toast: "Image uploaded successfully"
5. Preview shows → Image appears in form
6. Save form → Image URL saved to database
7. Shop page → Image displays on product/category

### What You Should See:
- **Console**: Multiple log messages tracking upload progress
- **Network**: POST request to /api/v1/erp/upload-image
- **Toast**: Success message appears
- **Preview**: Image appears in upload area
- **Form**: image_url populated

## Still Not Working?

### Collect Debug Info:
1. **Console logs**: Screenshot or copy all console messages
2. **Network tab**: Export HAR file or screenshot requests
3. **Backend logs**: Run journalctl command above
4. **Browser info**: Which browser and version?
5. **Cache status**: Did you clear cache?
6. **Deployment time**: Check if frontend/backend match expected times

### Report Back With:
- What you see in console when clicking upload
- Any error messages (console or toast)
- Network tab showing upload-image request (or lack thereof)
- Backend logs showing upload attempt
- Browser and version used
- Whether you cleared cache

## Quick Checklist

Before reporting issue, verify:
- [ ] Cleared browser cache (hard refresh)
- [ ] Tried incognito mode
- [ ] Console tab open and showing logs
- [ ] Logged in as admin user
- [ ] Modal is actually open
- [ ] Clicking upload area
- [ ] File is valid image (JPG, PNG, GIF, WebP)
- [ ] File is under 5MB
- [ ] Frontend timestamp is 16:00 or later
- [ ] Backend restarted at 15:46 or later

---

**Last Updated**: December 12, 2025 16:01 UTC  
**Frontend Deployed**: 16:00:54  
**Backend Deployed**: 15:46:30  
**Debug Logging**: ✅ Enabled
