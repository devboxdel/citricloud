#!/bin/bash

# Post-build deployment script
# Automatically updates logs and reloads nginx after build

set -e

echo "🚀 Starting post-build deployment..."

# Check if build was successful
if [ ! -d "dist" ]; then
  echo "❌ Error: dist directory not found. Build may have failed."
  exit 1
fi

echo "✅ Build artifacts found in dist/"

# Reload nginx to serve new files
echo "🔄 Reloading nginx..."
sudo systemctl reload nginx

if [ $? -eq 0 ]; then
  echo "✅ Nginx reloaded successfully!"
else
  echo "⚠️  Warning: Nginx reload failed. You may need to reload manually."
fi

# Get build info
BUILD_TIME=$(date '+%Y-%m-%d at %H:%M')
BUILD_SIZE=$(du -sh dist 2>/dev/null | cut -f1)

echo ""
echo "📊 Build Summary:"
echo "   Time: $BUILD_TIME"
echo "   Size: $BUILD_SIZE"
echo ""
echo "🎉 Deployment complete! Changes are now live on citricloud.com"
echo ""
echo "💡 Tip: Clear browser cache (Ctrl+Shift+R) to see changes immediately"
