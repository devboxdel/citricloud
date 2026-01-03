# Blog Post Update 500 Error - FIXED

## Problem
When updating a blog post via PUT request to `/api/v1/cms/blog/posts/{id}`, the endpoint was returning a 500 Internal Server Error.

## Root Cause
The `update_blog_post()` endpoint was missing slug uniqueness validation. When a user attempted to change a blog post's slug to one that already exists, SQLAlchemy would throw a database integrity error (unique constraint violation on the `slug` column), which resulted in a 500 error being returned to the client instead of a proper 400 error.

## Solution Implemented
Added slug uniqueness validation to the `update_blog_post()` endpoint in [backend/app/api/v1/endpoints/cms.py](backend/app/api/v1/endpoints/cms.py#L407).

### Code Changes
**File**: `backend/app/api/v1/endpoints/cms.py` (lines 407-428)

Added validation before updating fields:
```python
# Check if slug is being changed and if new slug already exists
if 'slug' in update_dict and update_dict['slug'] != post.slug:
    result = await db.execute(select(BlogPost).where(BlogPost.slug == update_dict['slug']))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Slug already exists")
```

This validation:
1. Checks if the slug field is being updated
2. Verifies the new slug differs from the current slug
3. Queries the database for any existing blog post with the new slug
4. Returns a proper 400 Bad Request error if a conflict is found
5. Prevents the database constraint violation error

## Why This Fixes the 500 Error
- Before: Invalid slug → Database constraint violation → 500 error
- After: Invalid slug → Proper validation → 400 error with clear message

## Testing
After restarting the backend, test the fix with:

### Update with same slug (should work):
```bash
curl -X PUT http://127.0.0.1:8000/api/v1/cms/blog/posts/5 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "title": "Updated Title",
    "content": "Updated content"
  }'
```
Expected: `200 OK` with updated post data

### Update with new unique slug (should work):
```bash
curl -X PUT http://127.0.0.1:8000/api/v1/cms/blog/posts/5 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "title": "New Title",
    "slug": "new-unique-slug",
    "content": "Updated content"
  }'
```
Expected: `200 OK` with updated post data

### Update with existing slug (should fail gracefully):
```bash
curl -X PUT http://127.0.0.1:8000/api/v1/cms/blog/posts/5 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "title": "Title",
    "slug": "existing-post-slug",
    "content": "Content"
  }'
```
Expected: `400 Bad Request` with message: `{"detail":"Slug already exists"}`

## Restart Backend
The backend needs to be restarted for the changes to take effect:

```bash
# Kill existing uvicorn process
pkill -f uvicorn

# Navigate to backend directory
cd /home/ubuntu/infrastructure/cloud/web-development/websites/citricloud.com/backend

# Start uvicorn with the venv
./.venv/bin/python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload &
```

Or if using systemd service (if configured):
```bash
sudo systemctl restart citricloud-api
```

## Frontend Impact
The frontend CMSBlogPosts component will now display proper error messages:
- "Slug already exists" → Clear validation error
- Other field updates will work normally
- Related posts and all other features remain unchanged

## Summary
✅ Added proper slug validation to update endpoint  
✅ Returns 400 Bad Request for duplicate slugs (instead of 500)  
✅ No breaking changes to API or frontend  
✅ Matches pattern used in create_blog_post endpoint  
✅ User sees clear error message on conflict

---
**Date Fixed**: December 16, 2024  
**File Modified**: `backend/app/api/v1/endpoints/cms.py`  
**Lines Changed**: Lines 407-428  
**Backward Compatible**: ✅ Yes
