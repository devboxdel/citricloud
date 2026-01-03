# Mobile App Video Icon Implementation - File Location Guide

## Status Report
⚠️ **Mobile app directory not found in current workspace**

The mobile app files are referenced throughout the documentation but are not present in:
- `/home/ubuntu/infrastructure/cloud/web-development/websites/citricloud.com/mobile-app`

Based on the workspace structure, they should be located at one of these paths:
1. `/home/ubuntu/infrastructure/cloud/app-development/websites/citricloud.com/mobile-app` (as mentioned in task)
2. A sibling directory outside the current workspace

---

## Files You Need to Modify

### Primary Screens to Update

#### 1. **News List/Feed Screen**
**Typical file names:**
- `src/screens/NewsScreen.tsx`
- `src/screens/HomeTab.tsx`
- `src/screens/NewsListScreen.tsx`
- `src/screens/HomeScreen.tsx`
- `src/components/NewsFeed.tsx`

**What to look for:**
- Renders multiple news items in a list/grid
- Each item has a `featured_image` field
- Uses `FlatList` or `ScrollView` to display items
- Fetch news from: `/api/v1/cms/public/blog/posts`

**What to update:**
- Find where `item.featured_image` is rendered in an `<Image />` component
- Wrap it with a relative positioned `<View>` container
- Add the video icon overlay conditional block

#### 2. **News Detail Screen** (Optional)
**Typical file names:**
- `src/screens/NewsDetailScreen.tsx`
- `src/screens/BlogDetailScreen.tsx` (already has image fix)
- `src/screens/NewsPostScreen.tsx`

**What to update:**
- If showing featured image at top of detail view
- Already has URL resolution (from BLOG_IMAGE_FIX_COMPLETE.md)
- Just add the video overlay block

#### 3. **Home Tab / Dashboard** (if shows news)
**Typical file names:**
- `src/screens/HomeTab.tsx`
- `src/navigation/TabNavigator.tsx` (check the "Home" tab implementation)
- `src/screens/Dashboard.tsx`

**What to update:**
- If includes news carousel or featured news section
- Apply same video overlay logic

---

## Implementation Checklist

### Step 1: Locate the Mobile App
```bash
# From your project root, find the mobile app:
find . -name "NewsScreen.tsx" -o -name "HomeTab.tsx" -o -name "BlogDetailScreen.tsx"

# Or check if it's in the expected directory:
ls -la /home/ubuntu/infrastructure/cloud/app-development/websites/citricloud.com/mobile-app/
```

### Step 2: Identify News/Blog List Component
Open the news list screen and find:
```tsx
// Look for this pattern:
<FlatList
  data={newsItems}
  renderItem={({ item }) => (
    <View>
      {item.featured_image && (
        <Image source={{ uri: item.featured_image }} />
      )}
      {/* Rest of the item */}
    </View>
  )}
/>
```

### Step 3: Add Video Icon Logic
1. Add the helper function at the top of the component:
```tsx
const isVideoCategory = (item: any) => {
  const category = categories.find(c => c.id === item?.category_id);
  return category?.icon === 'video' || category?.icon === 'film';
};
```

2. Ensure categories are loaded (usually already done)

3. Wrap featured image in a View with position: relative:
```tsx
<View style={{ position: 'relative', height: 200, overflow: 'hidden' }}>
  <Image source={{ uri: item.featured_image }} />
  
  {/* Add this block */}
  {isVideoCategory(item) && (
    <View style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' }}>
      <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(255,255,255,0.9)', justifyContent: 'center', alignItems: 'center' }}>
        <Ionicons name="play-circle" size={48} color="#0066cc" />
      </View>
    </View>
  )}
</View>
```

### Step 4: Verify Imports
Ensure your file imports:
```tsx
import { Ionicons } from '@expo/vector-icons';
```

### Step 5: Test
- [ ] Load news list screen
- [ ] Find news item with category "Video" or "Film"
- [ ] Verify play icon appears over featured image
- [ ] Icon should not appear on other categories
- [ ] Tap to navigate still works

---

## Files Already Implemented (Reference)

### ✅ Blog Detail Screen
- **File**: `src/screens/BlogDetailScreen.tsx`
- **Fix**: Image URL resolution (converts relative paths to absolute URLs)
- **Status**: Already deployed
- **Did NOT implement**: Video icon overlay (because blog detail shows single post, not list)

---

## Expected API Responses

### News/Blog List Endpoint
**URL**: `https://my.citricloud.com/api/v1/cms/public/blog/posts`

**Response**:
```json
{
  "items": [
    {
      "id": 1,
      "title": "Sample News",
      "featured_image": "/uploads/uuid.webp",
      "category_id": 5,
      "excerpt": "...",
      "content": "...",
      "published_at": "2025-12-20T00:00:00Z"
    }
  ]
}
```

### Categories Endpoint
**URL**: `https://my.citricloud.com/api/v1/cms/public/categories`

**Response**:
```json
{
  "items": [
    {
      "id": 5,
      "name": "Video",
      "slug": "video",
      "icon": "video"  // ← This is what we check
    },
    {
      "id": 6,
      "name": "Film",
      "slug": "film",
      "icon": "film"   // ← Or this
    }
  ]
}
```

---

## Color Reference

| Purpose | Color | Format | Usage |
|---------|-------|--------|-------|
| Primary Blue | #0066cc | Hex | Icon color |
| Overlay Black | rgba(0,0,0,0.3) | RGBA | Overlay background |
| Circle Background | rgba(255,255,255,0.9) | RGBA | Icon circle background |

---

## Size Reference

| Component | Dimension | Context |
|-----------|-----------|---------|
| Icon Circle | 56x56 | Small news cards |
| Icon Circle | 80x80 | Featured/Large cards |
| Icon Size | 48px | Small circles |
| Icon Size | 64px | Large circles |
| Image Height | 200px | Standard news card |
| Image Height | 300px | Featured news |

---

## Quick Search Commands

```bash
# Find all React Native screen files
find mobile-app/src/screens -type f -name "*.tsx" -o -name "*.ts"

# Search for Image component usage
grep -r "component.*Image" mobile-app/src/screens

# Find FlatList usage
grep -r "FlatList" mobile-app/src/screens

# Find NewsScreen or HomeTab
find mobile-app -name "*News*" -o -name "*Home*" | grep -i screen

# Find Ionicons usage in screens
grep -r "Ionicons" mobile-app/src/screens
```

---

## Common Issues & Solutions

### Issue: Icon doesn't appear
**Causes**:
1. Categories not loaded yet (async timing)
2. Category icon value is different (check API response)
3. isVideoCategory function not defined
4. Overlay positioned incorrectly

**Solution**:
```tsx
// Add fallback/debug logging
console.log('Categories loaded:', categories);
console.log('Item category:', item.category_id);
console.log('Is video?', isVideoCategory(item));
```

### Issue: Icon appears on all items
**Cause**: isVideoCategory function always returns true

**Solution**: Verify the function checks for both 'video' AND 'film':
```tsx
const isVideoCategory = (item: any) => {
  const category = categories.find(c => c.id === item?.category_id);
  return category?.icon === 'video' || category?.icon === 'film';
};
```

### Issue: Image not visible behind overlay
**Cause**: Overlay color too dark or image loading slow

**Solution**: Adjust overlay opacity or use semi-transparent overlay:
```tsx
// Less dark overlay (0.2 instead of 0.3):
backgroundColor: 'rgba(0, 0, 0, 0.2)'

// Or add image loading state:
onLoad={() => {/* show overlay after loaded */}}
```

---

## Deployment Steps

1. **Update mobile app code**
   - Modify news list screen(s)
   - Add video icon logic
   - Test thoroughly

2. **Build new APK/IPA**
   ```bash
   cd mobile-app
   npm run build:android  # or build:ios
   ```

3. **Test in Expo Go**
   ```bash
   cd mobile-app
   npm start
   # Scan QR code with Expo Go
   ```

4. **Deploy to App Stores**
   - Submit to Google Play Store (Android)
   - Submit to Apple App Store (iOS)
   - Monitor crash reports

5. **Monitor**
   - Check analytics for video content engagement
   - Monitor for image loading issues
   - Track user interactions with video items

---

## Related Files in Repository

- **Web Frontend Example**: `/frontend/src/pages/BlogPosts.tsx` (lines 48-150)
- **Web Frontend Example**: `/frontend/src/pages/Blog.tsx` (lines 80-495)
- **Blog Image Fix**: `/BLOG_IMAGE_FIX_COMPLETE.md`
- **Previous Mobile Fix**: `/BLOG_IMAGE_IMPLEMENTATION.md`

---

## Need Help?

If the mobile app directory cannot be located:

1. Check if it's in a separate git repository
2. Verify the path in your environment configuration
3. Look for a `mobile-app` folder that might be:
   - On a different machine
   - In cloud storage
   - In a monorepo submodule
   - Hidden (check with `ls -la`)

4. Contact DevOps/Infrastructure team for the correct path

---

**Last Updated**: December 23, 2025
**Status**: Awaiting mobile app directory access
**Implementation**: Ready - Code templates provided

