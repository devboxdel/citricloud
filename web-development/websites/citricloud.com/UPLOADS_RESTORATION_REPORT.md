# Uploads Directory Restoration Report

**Date**: January 8, 2026  
**Issue**: Missing uploads directory causing 404 errors for product and blog images  
**Status**: ✅ RESOLVED

## What Happened

The `/var/www/citricloud.com/uploads/` directory was accidentally deleted or removed, causing all product and blog images to return 404 errors. The backend had a symbolic link pointing to this directory (`backend/uploads -> /var/www/citricloud.com/uploads`), but the target directory did not exist.

## Root Cause

Investigation revealed:
- The uploads directory structure was intact (symlink existed)
- The target directory `/var/www/citricloud.com/uploads/` was missing
- Backups showed the directory has been empty for several weeks
- Database still contained references to 6 image files that were previously uploaded

## Missing Images Found

**Product Images** (from `products.images` column):
- `/uploads/258220287e2079658d1474990a6fb8e9.png`
- `/uploads/9ad3b7ce-8223-4d0d-985a-eb6ee53c7526.webp`
- `/uploads/08e83569-acc4-4fba-8e0f-d7dcd31c1880.webp`
- `/uploads/567b28dac29b6a98443e472d57531d33.jpg`

**Blog Post Images** (from `blog_posts.featured_image` column):
- `/uploads/08e83569-acc4-4fba-8e0f-d7dcd31c1880.webp`
- `/uploads/e73694f659fea810e17012ff98628fd6.webp`
- `/uploads/62ee94a9-fbc8-4a0f-9053-f0989865e44c.jpg`

## Resolution Steps

### 1. Recreated Directory Structure
```bash
sudo mkdir -p /var/www/citricloud.com/uploads
sudo chown ubuntu:ubuntu /var/www/citricloud.com/uploads
```

### 2. Created Placeholder Images
Since original images were not in any backups, created solid color placeholder images (800x600px) for all missing files:
```bash
cd /var/www/citricloud.com/uploads
python3 -c "
from PIL import Image
for filename in ['08e83569...', '62ee94a9...', ...]:
    img = Image.new('RGB', (800, 600), color=(30, 41, 59))
    img.save(filename)
"
```

### 3. Verified Web Access
- Tested: `https://citricloud.com/uploads/08e83569-acc4-4fba-8e0f-d7dcd31c1880.webp`
- Status: Returns 200 OK
- Nginx serving files correctly

### 4. Restarted Backend
```bash
sudo systemctl restart citricloud-backend
```
Backend now properly mounts `/uploads` directory via FastAPI StaticFiles.

## Current State

✅ **Directory exists**: `/var/www/citricloud.com/uploads/`  
✅ **6 placeholder images created**: All referenced images now exist  
✅ **Symlink valid**: `backend/uploads -> /var/www/citricloud.com/uploads`  
✅ **Nginx serving**: Images accessible via HTTPS  
✅ **Backend running**: FastAPI serving uploads via `/uploads/*`  
✅ **No more 404 errors**: Frontend will load placeholder images instead of broken links

## Next Steps for User

**IMPORTANT**: The created images are solid color placeholders (dark blue background). You need to:

1. **Replace placeholders with actual images** via the dashboard:
   - Go to CMS → Products and re-upload product images
   - Go to CMS → Blog Posts and re-upload featured images

2. **Or provide original images** if you have backups:
   - Upload to `/var/www/citricloud.com/uploads/` with exact filenames
   - Ensure `ubuntu:ubuntu` ownership
   - Images will immediately appear on site

3. **Monitor future uploads**:
   - Test image upload functionality in dashboard
   - Verify new uploads appear in `/var/www/citricloud.com/uploads/`
   - Check daily backups include uploads directory

## Prevention

To prevent this in the future:

1. **Verify backup script includes uploads**:
   ```bash
   grep -A5 "uploads" /home/ubuntu/infrastructure/cloud/web-development/websites/citricloud.com/backup.sh
   ```

2. **Add monitoring** for uploads directory:
   ```bash
   # Check if directory exists and is not empty
   [ -d "/var/www/citricloud.com/uploads" ] && [ "$(ls -A /var/www/citricloud.com/uploads)" ]
   ```

3. **Document upload workflow** in dashboard admin guide

## Technical Details

### Backend Configuration
- **Upload Directory**: `/var/www/citricloud.com/uploads`
- **Configured in**: `backend/app/core/config.py` (`UPLOAD_DIR`)
- **Mounted in FastAPI**: `main.py` line 118 (`app.mount("/uploads", ...)`)
- **Database Models**: 
  - `Product.images` (JSON array)
  - `BlogPost.featured_image` (String)

### Frontend Handling
- **Image Resolution**: Uses `getImageUrl()` and `resolveImageUrl()` utilities
- **Error Handling**: Component shows icon placeholder when image fails (FiPackage, FiFileText)
- **State Tracking**: `failedImages` Set prevents repeated 404 requests

### File Permissions
```bash
drwxrwxr-x 2 ubuntu ubuntu 4096 Jan  8 14:34 uploads/
-rw-rw-r-- 1 ubuntu ubuntu  940 Jan  8 14:36 08e83569-acc4-4fba-8e0f-d7dcd31c1880.webp
```

## Summary

The uploads directory was missing, causing 404 errors for 6 images referenced in the database. The directory has been recreated with placeholder images so the site functions correctly. The user should replace these placeholders with actual images via the dashboard CMS tools.

**No code changes were required** - this was purely a missing file system directory issue.
