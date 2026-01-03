#!/bin/bash

# CITRICLOUD Performance Optimization Script

echo "⚡ Optimizing CITRICLOUD for maximum performance..."

# Frontend Optimizations
echo ""
echo "📦 Optimizing Frontend..."
cd frontend

# Clean install dependencies
echo "Cleaning and reinstalling dependencies..."
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps

# Build production bundle
echo "Building optimized production bundle..."
npm run build

# Analyze bundle size
echo "Bundle analysis..."
du -sh dist/

# Backend Optimizations
echo ""
echo "🔧 Optimizing Backend..."
cd ../backend

# Upgrade all packages
echo "Upgrading backend packages..."
source venv/bin/activate
pip install --upgrade pip
pip install --upgrade -r requirements.txt

# Database optimizations
echo ""
echo "🗄️  Optimizing Database..."
sudo -u postgres psql citricloud << EOF
-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_invoices_order_id ON invoices(order_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_tickets_user_id ON tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_pages_slug ON pages(slug);
CREATE INDEX IF NOT EXISTS idx_pages_status ON pages(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_author_id ON blog_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category_id ON blog_posts(category_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);

-- Analyze tables for query optimization
ANALYZE users;
ANALYZE orders;
ANALYZE invoices;
ANALYZE tickets;
ANALYZE pages;
ANALYZE blog_posts;
ANALYZE products;

-- Vacuum to reclaim space and update statistics
VACUUM ANALYZE;
EOF

# Redis optimizations
echo ""
echo "💾 Optimizing Redis..."
redis-cli CONFIG SET maxmemory 256mb
redis-cli CONFIG SET maxmemory-policy allkeys-lru
redis-cli CONFIG SET save ""
redis-cli CONFIG REWRITE

echo ""
echo "✅ Optimization complete!"
echo ""
echo "Performance Tips:"
echo "1. Enable Gzip/Brotli compression on your web server"
echo "2. Use a CDN for static assets"
echo "3. Enable HTTP/2 or HTTP/3"
echo "4. Configure proper caching headers"
echo "5. Monitor with Lighthouse, GTmetrix, and PageSpeed Insights"
echo ""
echo "🎯 Target Scores:"
echo "  - Performance: 100/100"
echo "  - Accessibility: 100/100"
echo "  - Best Practices: 100/100"
echo "  - SEO: 100/100"
