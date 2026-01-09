#!/bin/bash
# Deploy CITRICLOUD Manage Frontend

set -e

echo "🚀 Deploying CITRICLOUD Manage Frontend..."

# Navigate to frontend directory
cd "$(dirname "$0")/frontend"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Build production bundle
echo "🔨 Building production bundle..."
npm run build

# Create target directory if it doesn't exist
sudo mkdir -p /var/www/manage.citricloud.com/html

# Backup existing deployment
if [ -d "/var/www/manage.citricloud.com/html.backup" ]; then
    echo "🗑️  Removing old backup..."
    sudo rm -rf /var/www/manage.citricloud.com/html.backup
fi

if [ -d "/var/www/manage.citricloud.com/html" ] && [ "$(ls -A /var/www/manage.citricloud.com/html)" ]; then
    echo "💾 Backing up current deployment..."
    sudo mv /var/www/manage.citricloud.com/html /var/www/manage.citricloud.com/html.backup
    sudo mkdir -p /var/www/manage.citricloud.com/html
fi

# Copy new build
echo "📂 Copying files..."
sudo cp -r dist/* /var/www/manage.citricloud.com/html/

# Set proper permissions
echo "🔒 Setting permissions..."
sudo chown -R www-data:www-data /var/www/manage.citricloud.com/html
sudo chmod -R 755 /var/www/manage.citricloud.com/html

# Test nginx config
echo "🧪 Testing Nginx configuration..."
sudo nginx -t

# Reload nginx
echo "🔄 Reloading Nginx..."
sudo systemctl reload nginx

echo "✅ Deployment complete!"
echo "🌐 Visit: https://manage.citricloud.com"
