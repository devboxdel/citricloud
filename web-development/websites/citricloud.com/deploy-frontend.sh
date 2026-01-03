#!/bin/bash
# Frontend Deployment Script for CitriCloud
# This script builds the frontend and handles Cloudflare cache

set -e  # Exit on error

echo "🚀 Starting CitriCloud Frontend Deployment..."
echo ""

# Change to frontend directory
cd "$(dirname "$0")/frontend"

# Build the frontend
echo "📦 Building frontend..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Frontend build completed successfully!"
else
    echo "❌ Frontend build failed!"
    exit 1
fi

echo ""
echo "📊 Build Summary:"
ls -lh dist/index.html
echo "Total assets: $(find dist/assets -type f | wc -l) files"
echo ""

# Cloudflare cache purge (optional - requires setup)
if [ -n "$CF_ZONE_ID" ] && [ -n "$CF_API_TOKEN" ]; then
    echo "🌐 Purging Cloudflare cache for HTML files..."
    
    # Purge ONLY HTML entrypoints to avoid evicting cached assets
    curl -s -X POST "https://api.cloudflare.com/client/v4/zones/$CF_ZONE_ID/purge_cache" \
      -H "Authorization: Bearer $CF_API_TOKEN" \
      -H "Content-Type: application/json" \
      --data '{
        "files": [
          "https://www.citricloud.com/",
          "https://www.citricloud.com/index.html",
          "https://shop.citricloud.com/",
          "https://shop.citricloud.com/index.html",
          "https://blog.citricloud.com/",
          "https://blog.citricloud.com/index.html",
          "https://contact.citricloud.com/",
          "https://contact.citricloud.com/index.html"
        ]
      }' | jq -r '.success'
    
    if [ $? -eq 0 ]; then
        echo "✅ Cloudflare cache purged!"
    else
        echo "⚠️  Cloudflare cache purge failed (manual purge recommended)"
    fi
else
    echo "⚠️  Cloudflare API credentials not set"
    echo "   Export CF_ZONE_ID and CF_API_TOKEN to enable auto-purge"
    echo "   OR manually purge cache at: https://dash.cloudflare.com"
fi

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📝 Next steps:"
echo "   1. If Cloudflare wasn't auto-purged, manually purge cache"
echo "   2. Test the site in incognito mode"
echo "   3. Hard refresh (Ctrl+Shift+R) if needed"
echo ""
