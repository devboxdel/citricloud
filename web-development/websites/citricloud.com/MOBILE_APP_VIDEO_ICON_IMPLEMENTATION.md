# Mobile App: Add Video Icon to News Items - Implementation Guide

## Status
❌ Mobile app directory not found in workspace
**Location Expected**: `/home/ubuntu/infrastructure/cloud/app-development/websites/citricloud.com/mobile-app`

The mobile app appears to be in a separate workspace that's not currently accessible. This guide provides the exact implementation code you need to apply.

---

## Problem
News items don't show a video icon overlay when the category is 'Video' or 'Film', unlike blog posts in the frontend which display this feature.

## Solution Overview
Add the same video icon overlay logic to News item screens in the mobile app. The logic checks if a post's category icon is 'video' or 'film' and displays a play button overlay on the featured image.

---

## Implementation Details

### 1. Backend API Response (No Changes Needed)
The API already returns:
```json
{
  "id": 1,
  "title": "News Item Title",
  "featured_image": "/uploads/uuid.ext",
  "category_id": 5,
  "content": "...",
  ...
}
```

And categories return:
```json
{
  "id": 5,
  "name": "Video",
  "slug": "video",
  "icon": "video"  // or "film"
}
```

### 2. Frontend Reference (Blog.tsx)
The web frontend implements this in `BlogPosts.tsx` (lines 48-150):

```tsx
// Helper function to check if category is video
const isVideoCategory = (post: any) => {
  const cat = categories.find((c: any) => c.id === post?.category_id);
  return cat?.icon === 'video' || cat?.icon === 'film';
};

// In the render, on the featured image container:
<div className="mb-4 rounded-xl overflow-hidden relative h-44 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
  <img src={post.featured_image} alt={post.title} className="w-full h-44 object-contain" />
  {isVideoCategory(post) && (
    <div className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-all">
      <div className="w-12 h-12 rounded-full bg-white/90 dark:bg-gray-100 flex items-center justify-center shadow-lg">
        <FiVideo className="w-6 h-6 text-primary-600" />
      </div>
    </div>
  )}
</div>
```

---

## Files to Modify in Mobile App

### Screens to Update
Identify and update these screens to show video icons:
1. **News List Screen** (HomeTab, NewsScreen, or similar)
2. **Blog List Screen** (if News and Blog are separate)
3. **News Detail Screen** (optional - can add it there too)

### Key Screens to Search For
- `HomeTab.tsx` / `HomeScreen.tsx`
- `NewsScreen.tsx` / `NewsListScreen.tsx`
- `BlogScreen.tsx` / `BlogListScreen.tsx`
- Any screen that displays items with featured images

---

## Step-by-Step Implementation

### Step 1: Add Helper Function
Add this function to your News/Blog list screen component:

```typescript
// Check if post category icon is 'video' or 'film'
const isVideoCategory = (item: any) => {
  const category = categories.find((c: any) => c.id === item?.category_id);
  return category?.icon === 'video' || category?.icon === 'film';
};
```

### Step 2: Add Video Icon Overlay
Wrap your featured image in a container and add conditional overlay:

```jsx
// For each news/blog item with featured image
{item.featured_image && (
  <View style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', height: 200 }}>
    <Image
      source={{ 
        uri: resolveImageUrl(item.featured_image) 
      }}
      style={{
        width: '100%',
        height: '100%',
        resizeMode: 'cover'
      }}
    />
    
    {/* Video Icon Overlay */}
    {isVideoCategory(item) && (
      <View style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <View style={{
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          justifyContent: 'center',
          alignItems: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 4,
          elevation: 5
        }}>
          <Ionicons 
            name="play-circle" 
            size={48} 
            color="#0066cc"  // primary-600 equivalent
          />
        </View>
      </View>
    )}
  </View>
)}
```

### Step 3: Ensure Categories are Loaded
Make sure your component has access to categories:

```typescript
// In your component
const [categories, setCategories] = useState([]);

useEffect(() => {
  // Fetch categories from API
  const fetchCategories = async () => {
    try {
      const response = await fetch('https://my.citricloud.com/api/v1/cms/public/categories');
      const data = await response.json();
      setCategories(data.items || data);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };
  
  fetchCategories();
}, []);
```

---

## Import Statements Required

```typescript
import { Ionicons } from '@expo/vector-icons';
import { View, Image } from 'react-native';
```

---

## Visual Result
When a News item with a 'Video' or 'Film' category is displayed:
- Featured image shows normally
- A semi-transparent dark overlay (30% black) appears over the image
- A white circular button with play icon appears in the center
- Icon color: Primary blue (#0066cc or equivalent)
- Icon size: 48px

---

## Testing Checklist
- [ ] Load news/blog list screen
- [ ] Find items with "Video" or "Film" category
- [ ] Verify video icon appears over featured image
- [ ] Verify icon doesn't appear for other categories
- [ ] Verify icon appears on multiple items with video categories
- [ ] Test on both light and dark mode (if applicable)
- [ ] Verify clicking the item still navigates to detail screen
- [ ] Test with slow network (verify overlay still shows while image loads)

---

## Troubleshooting

### Icon Not Showing
- Verify `@expo/vector-icons` is installed: `npm install @expo/vector-icons`
- Check that categories are being fetched correctly
- Verify category icons are actually 'video' or 'film' in the database

### Image Issues
- Ensure `resolveImageUrl()` function is implemented (for relative paths)
- Check network requests in Expo DevTools to verify image URL format

### Overlay Issues
- Verify `View` style properties (position: 'relative' is key)
- Check z-index positioning if using other overlays

---

## Files Modified
- **Mobile App News List Screen** (to be identified and updated)
- **Mobile App Blog List Screen** (if separate)

---

## Deployment
After implementing:
1. Test thoroughly in Expo Go app
2. Build production APK/IPA
3. Deploy to app stores
4. Monitor for any image loading issues

---

## Related Documentation
- Web Frontend Implementation: `/frontend/src/pages/BlogPosts.tsx` (lines 48-150)
- Blog Detail Screen Image Fix: `BLOG_IMAGE_FIX_COMPLETE.md`
- API Documentation: Backend returns category icon field

