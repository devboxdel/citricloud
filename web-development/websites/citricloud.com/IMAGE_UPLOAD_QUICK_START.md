# Image Upload Feature - Quick Start Guide

## 🎯 What's New

You can now upload images for product categories and products directly from the ERP Dashboard. Uploaded images automatically display on the public Shop page and Product Details page.

## 📋 Prerequisites

- Access to ERP Dashboard (requires admin/staff role)
- Images in supported formats: JPEG, PNG, GIF, or WebP
- Image file size under 5MB per file

## 🚀 How to Use

### Category Image Upload

1. Go to **ERP Dashboard** → **Categories**
2. Click **"New Category"** or click **edit icon** on existing category
3. In the category modal, find the **image upload section**
4. **Drag and drop** an image onto the upload area, or **click to browse**
5. Preview appears showing the uploaded image
6. To remove the image, click the **"×"** button on the preview
7. Click **"Save Category"**
8. Image is now stored and associated with the category

**Where it appears:**
- Category management in ERP Dashboard
- Future: Shop category listings

### Product Image Upload

1. Go to **ERP Dashboard** → **Products**
2. Click **"New Product"** or click **edit icon** on existing product
3. In the product modal, scroll to **image upload section**
4. **Drag and drop** multiple images onto the upload area, or **click to browse**
5. Images appear in a **gallery preview** as you upload them
6. To remove any image, **hover over it** and click the **"×"** button
7. Arrange images as desired in the gallery
8. Click **"Save Product"**
9. Images are now stored and associated with the product

**Where they appear:**
- Product cards on **Shop page** (first image shown)
- **Product Details page** with full gallery and thumbnail navigation

## 📸 Supported Image Formats

- **JPEG** (.jpg, .jpeg) ✅
- **PNG** (.png) ✅
- **GIF** (.gif) ✅
- **WebP** (.webp) ✅

**Not supported:** BMP, TIFF, SVG, or other formats

## ⚙️ Technical Details

### File Upload Specifications
- **Maximum file size:** 5MB per image
- **Upload location:** `/var/www/citricloud.com/uploads/`
- **Public URL path:** `/uploads/{unique-filename}`
- **Authentication:** Requires valid admin/staff credentials

### Storage
- Images are stored permanently on the server
- Each image gets a unique filename to prevent collisions
- Images are served via Nginx for optimal performance

### Database Storage
- **Category images:** Stored as single URL in `ProductCategory.image_url`
- **Product images:** Stored as array of URLs in `Product.images`

## 🎨 Image Display

### Shop Page
- Shows first image from product's image array
- Displays with hover zoom effect
- Falls back to package icon if no image provided

### Product Details Page
- Shows main image with zoom capability
- Thumbnail gallery below for image navigation
- Click thumbnails to switch main image
- Responsive design for mobile/tablet/desktop

## ✅ Quality Recommendations

### Best Practices

1. **Use high-quality images**
   - Minimum 500x500 pixels recommended
   - 1200x1200 pixels for best quality on Product Details

2. **Image naming**
   - Use descriptive filenames
   - Include product/category name when possible

3. **Aspect ratios**
   - Square (1:1) works best for product thumbnails
   - Landscape (16:9) for category banners

4. **File optimization**
   - Compress images before uploading
   - Use PNG for graphics/logos
   - Use JPEG for photographs

### File Size Tips
- Aim for 50-200KB per image (under 5MB limit)
- Use image compression tools before upload
- Balance quality with performance

## 🐛 Troubleshooting

### Upload Fails
**Problem:** "Upload failed" error message
- Verify file format is supported (JPEG, PNG, GIF, WebP)
- Check file size is under 5MB
- Try uploading again
- Check browser console for detailed error

### Image Doesn't Display
**Problem:** No image shows on Shop or ProductDetail
- Verify upload was successful (no error messages)
- Refresh the page (Ctrl+F5 or Cmd+Shift+R)
- Check database to confirm image URL was saved
- Clear browser cache if image still doesn't appear

### Wrong Image Shows
**Problem:** Different image displays than expected
- For Shop page: Verify first image in gallery is correct
- For ProductDetails: Check thumbnail order is correct
- Remove and re-upload correct image

## 📊 Image Limits

- **Per category:** 1 image
- **Per product:** Unlimited images (no hard limit, practical limit ~10-20)

## 🔒 Security Notes

- Only authenticated admin/staff can upload images
- Images are scanned for file type validity
- Filenames are randomized to prevent directory traversal
- Images stored outside web root for additional security

## 💾 Backup & Recovery

All uploaded images are:
- Stored in `/var/www/citricloud.com/uploads/`
- Included in regular system backups
- Recoverable if accidentally deleted

Contact system administrator for image recovery requests.

## 📞 Support

For technical issues:
1. Check error messages in browser console
2. Review backend logs: `journalctl -u citricloud-backend -n 50`
3. Verify upload directory permissions: `ls -la /var/www/citricloud.com/uploads/`

---

**Version:** 1.0  
**Last Updated:** December 12, 2025  
**Feature Status:** ✅ Active and Ready to Use
