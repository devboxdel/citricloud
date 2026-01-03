# Blog Image Upload & Display - Testing Guide

## Quick Start Test

### Prerequisites
- Backend running on `https://my.citricloud.com`
- Mobile app running in Expo
- Admin account for dashboard access

### Test Steps

#### 1. Upload Image via CMS Dashboard

```bash
# Navigate to dashboard
https://dashboard.citricloud.com/cms/posts

# Steps:
1. Click "Create New Post" or edit existing post
2. Scroll to "Featured Image" section
3. Click "Upload" button
4. Select image file (JPEG, PNG, WebP recommended)
5. Verify image appears in preview
6. Note the URL in the form field (should be like: /uploads/abc123-def456.webp)
```

**Expected Result**:
- Image displays in dashboard preview
- Form shows: `featured_image: "/uploads/{uuid}.{ext}"`
- No errors in console

---

#### 2. View on Web (blog.citricloud.com)

```bash
# After publishing post:
https://blog.citricloud.com

# Steps:
1. Check blog list - look for featured images
2. Hover over post with featured image
3. Click "Read Article" to view full post
4. Verify featured image displays at top of post
```

**Expected Result**:
- Featured image displays in blog list (if showing images)
- Featured image displays at top of blog post
- No broken image icons
- Image loads quickly (cache-busted)

---

#### 3. View on Mobile App

```bash
# Prerequisites:
- Mobile app running (npm start in mobile-app directory)
- Logged in to mobile app
- At least one blog post with featured_image published

# Steps:
1. Navigate to "Blog" tab
2. Tap on a blog post title
3. Wait for BlogDetailScreen to load
4. Verify featured image displays at top

# Advanced testing:
5. Open network inspector (React Native Debugger)
6. Look for GET request to: https://my.citricloud.com/uploads/{uuid}.{ext}
7. Verify HTTP 200 response with image data
```

**Expected Result**:
- Featured image displays correctly
- Image height: 200px
- Image width: full screen width
- No console errors about image loading
- Network request shows successful download

---

## Detailed Verification

### Code Check
```typescript
// BlogDetailScreen.tsx - Line 87-97
const rawImage = post.featured_image || post.image;

// Resolve relative image paths to absolute URLs for React Native
const resolveImageUrl = (url: string | null | undefined): string | null => {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('/')) return `https://my.citricloud.com${url}`;
  return null;
};

const imageUrl = resolveImageUrl(rawImage);

// Line 127
{imageUrl ? (
  <Image source={{ uri: imageUrl }} style={{...}} resizeMode="cover" />
) : null}
```

### Backend API Check
```bash
# Test endpoint returns featured_image
curl -X GET "https://my.citricloud.com/api/v1/cms/public/blog/posts?page=1&page_size=1"

# Response should include:
{
  "items": [
    {
      "id": 1,
      "title": "Post Title",
      "featured_image": "/uploads/uuid.webp",  # ← This is key
      "content": "...",
      ...
    }
  ]
}
```

### Image Upload Endpoint
```bash
# Test upload
curl -X POST "https://my.citricloud.com/api/v1/cms/media/upload" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@test_image.webp"

# Response:
{
  "success": true,
  "url": "/uploads/uuid.webp",
  "filename": "uuid.webp",
  "size": 12345,
  "content_type": "image/webp"
}
```

---

## Troubleshooting

### Issue: Image doesn't show on mobile
**Check**:
1. Network request shows 404 → URL not resolving correctly
2. Network request shows 500 → Backend error
3. Network request shows 200 but image doesn't render → Image decode error

**Fix**:
- Verify backend is running on `https://my.citricloud.com`
- Check `resolveImageUrl()` function is resolving to full URL
- Check image format is supported (JPEG/PNG/WebP)
- Check featured_image field exists in post response

### Issue: Image doesn't show on web
**Check**:
1. Browser console for 404 errors
2. Check Cloudflare cache status
3. Verify `getImageUrl()` adding cache-busting parameter

**Fix**:
- Clear browser cache
- Try private/incognito window
- Check `?v=timestamp` parameter in URL
- Verify `uploads/` directory exists on server

### Issue: Image upload fails
**Check**:
1. File type is JPEG/PNG/GIF/WebP/SVG
2. File size is reasonable
3. User is admin
4. Backend has write permissions to `uploads/` directory

**Fix**:
- Check backend logs for upload errors
- Verify `uploads/` directory has 755 permissions
- Try smaller image file
- Check disk space available

---

## Performance Notes

- Images are stored locally (not on CDN)
- Cache-busting parameter (`?v=timestamp`) on web to bypass Cloudflare
- Mobile app requests directly from `my.citricloud.com`
- Recommended image sizes:
  - Featured image: 800x600 or 16:9 aspect ratio
  - Max file size: 5MB
  - Format: WebP (best compression), or PNG/JPEG

---

## Rollback Plan

If issues occur, revert mobile app change:
```typescript
// Old code (before fix)
const image = post.featured_image || post.image;
{image ? (
  <Image source={{ uri: image }} />  // This will fail for relative paths
) : null}

// New code (after fix)
const imageUrl = resolveImageUrl(rawImage);
{imageUrl ? (
  <Image source={{ uri: imageUrl }} />  // This works for relative paths
) : null}
```

The fix is reversible and doesn't affect other parts of the app.

---

## Success Criteria

✅ Upload image via CMS dashboard
✅ Image displays in dashboard preview
✅ Publish blog post with featured image
✅ Image displays on blog.citricloud.com
✅ Image displays on mobile app BlogDetailScreen
✅ Image displays on blog list (if enabled)
✅ No console errors or failed network requests
✅ Image loads quickly with cache-busting

---

## Next Steps

1. Deploy mobile app with updated BlogDetailScreen.tsx
2. Test on physical device (iOS/Android)
3. Monitor for any image loading errors
4. Update documentation if additional changes needed
5. Consider optimizing image uploads with compression
