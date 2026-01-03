# Sticky/Featured Posts - Quick Start Guide

## How to Mark a Blog Post as Featured

### Method 1: Quick Toggle (Recommended)
1. Go to **Dashboard → CMS → Blog Posts**
2. Look for the **"Featured"** column in the blog posts table
3. Click the button for the post you want to feature
   - Shows **"☆ Feature"** (gray) if not featured
   - Shows **"⭐ Featured"** (amber) if already featured
4. The button will update immediately

### Method 2: Edit Form
1. Go to **Dashboard → CMS → Blog Posts**
2. Click the **Edit icon** (pencil) for the post
3. Scroll to find the checkbox: **"Mark as Featured/Sticky Post"**
4. Check/uncheck as needed
5. Click **"Update"** button at the bottom

## Understanding Featured Posts

### What Happens When You Mark a Post as Featured?
- ✅ The post appears at the **top** of the blog listing
- ✅ The post appears at the **top** of the public API response
- ✅ The post keeps its position even when new posts are published
- ✅ Multiple posts can be featured at once
- ✅ Featured posts are sorted by publication date among themselves

### Admin Dashboard View
```
Blog Posts Table:
┌─────────────────┬──────────┬───────────┬────────┬───────────┐
│ Title           │ Status   │ Featured  │ Views  │ Actions   │
├─────────────────┼──────────┼───────────┼────────┼───────────┤
│ Featured Post   │Published │ ⭐Featured│  1,245 │ Edit/View │
│ Another Feature │Published │ ⭐Featured│    842 │ Edit/View │
│ Regular Post    │Published │ ☆ Feature │    356 │ Edit/View │
│ Draft Post      │Draft     │ ☆ Feature │      0 │ Edit/View │
└─────────────────┴──────────┴───────────┴────────┴───────────┘
```

### Public Blog View
```
Featured/Sticky Posts (appear first):
┌─────────────────────────────┐
│ Featured Post               │
│ [Featured image] [Content]  │
└─────────────────────────────┘

┌─────────────────────────────┐
│ Another Featured Post       │
│ [Featured image] [Content]  │
└─────────────────────────────┘

Regular Posts (sorted by date):
┌─────────────────────────────┐
│ Recent Post                 │
│ [Featured image] [Content]  │
└─────────────────────────────┘
```

## Key Features

| Feature | Description |
|---------|-------------|
| **Quick Toggle** | Click button to instantly toggle featured status |
| **Visual Feedback** | Amber background for featured, gray for regular |
| **Real-time Updates** | Changes visible immediately |
| **Sorting** | Featured posts always appear first |
| **Multiple Featured** | No limit on number of featured posts |
| **Auto Sort** | Works automatically - no configuration needed |

## Common Use Cases

### 1. Promote New Product Launch
- Write blog post about new product
- Mark as featured to get visibility
- Featured post stays on top while you continue publishing other content

### 2. Highlight Important Updates
- Feature critical announcements
- Users see them immediately on blog homepage

### 3. Showcase Best Content
- Feature your most popular or high-quality posts
- Draw attention to evergreen content

### 4. Seasonal Promotions
- Feature posts related to current season/events
- Quickly unfeature when promotion ends

## Visual Indicators

### Button States
- **☆ Feature** (Gray button) - Post is not currently featured
- **⭐ Featured** (Amber button) - Post is currently featured
- **...** (Button with ellipsis) - Toggle is in progress (loading)

### Status Badges
- **Green** - Published post
- **Yellow** - Draft post
- **Amber** - Featured/sticky post

## Best Practices

1. **Use Sparingly** - Featured posts grab attention; too many dilutes the impact
2. **Keep Recent** - Update featured posts regularly to keep content fresh
3. **Test Timing** - Feature posts when your audience is most active
4. **Monitor Views** - Check view counts to see if featured posts get more engagement
5. **Combine with SEO** - Featured posts should be high-quality, SEO-optimized content

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Button not responding | Check network connection, page may need refresh |
| Featured status not saving | Verify you have admin permissions |
| Posts not reordering | Refresh page to see latest sorting |
| Can't see Featured column | May be hidden on mobile; use edit form instead |

## API Integration

For developers integrating with the blog API:

```bash
# Get featured posts (they appear first in the response)
GET /cms/public/blog/posts

# Example response shows featured posts first:
{
  "items": [
    {
      "id": 1,
      "title": "Featured Post",
      "is_sticky": true,
      "published_at": "2024-12-10T10:00:00Z",
      ...
    },
    {
      "id": 2,
      "title": "Another Featured Post",
      "is_sticky": true,
      "published_at": "2024-12-09T10:00:00Z",
      ...
    },
    {
      "id": 3,
      "title": "Regular Post",
      "is_sticky": false,
      "published_at": "2024-12-08T10:00:00Z",
      ...
    }
  ],
  "total": 3,
  "page": 1,
  "page_size": 20
}
```

## Related Features

- **Blog Categories** - Organize posts by topic
- **Meta Tags** - Optimize for SEO
- **Featured Images** - Eye-catching thumbnails
- **Post Status** - Draft/Published control
- **View Counter** - Track post popularity

---

**Last Updated**: December 16, 2024
**Version**: 1.0
**Status**: ✅ Production Ready
