#!/usr/bin/env python3
"""
Seed demo products for testing the e-commerce integration
"""
import asyncio
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.core.database import SessionLocal, engine, Base
from app.models.models import Product, ProductCategory


async def seed_products():
    """Create demo products for testing"""
    async with SessionLocal() as db:
        # Check if products already exist
        existing_query = select(func.count(Product.id))
        result = await db.execute(existing_query)
        if result.scalar() > 0:
            print("Products already exist. Skipping seed.")
            return
        
        # Create categories first
        categories = [
            {"name": "Demo", "slug": "demo"},
            {"name": "Templates", "slug": "templates"},
            {"name": "Components", "slug": "components"},
            {"name": "Kits", "slug": "kits"},
            {"name": "UI Kits", "slug": "ui-kits"},
            {"name": "Bundles", "slug": "bundles"},
            {"name": "Assets", "slug": "assets"},
        ]
        
        category_map = {}
        for cat_data in categories:
            category = ProductCategory(
                name=cat_data["name"],
                slug=cat_data["slug"],
                description=f"{cat_data['name']} category"
            )
            db.add(category)
            await db.flush()
            category_map[cat_data["slug"]] = category.id
        
        # Create demo products
        products = [
            {"name": "Demo Product - Try Before You Buy", "slug": "demo-product", "price": 0.00, "category": "demo", "description": "Free demo product to test the checkout process"},
            {"name": "Premium Dashboard Template", "slug": "premium-dashboard-template", "price": 49.99, "category": "templates", "description": "Professional dashboard with modern design"},
            {"name": "Analytics Component Pack", "slug": "analytics-component-pack", "price": 29.99, "category": "components", "description": "Complete analytics components suite"},
            {"name": "E-commerce Starter Kit", "slug": "ecommerce-starter-kit", "price": 79.99, "category": "kits", "description": "Full e-commerce solution ready to deploy"},
            {"name": "Mobile App UI Kit", "slug": "mobile-app-ui-kit", "price": 39.99, "category": "ui-kits", "description": "Mobile-first UI components and screens"},
            {"name": "Admin Panel Pro", "slug": "admin-panel-pro", "price": 59.99, "category": "templates", "description": "Advanced admin panel template"},
            {"name": "Landing Page Bundle", "slug": "landing-page-bundle", "price": 34.99, "category": "bundles", "description": "10+ landing page templates"},
            {"name": "Icon Pack Collection", "slug": "icon-pack-collection", "price": 19.99, "category": "assets", "description": "500+ premium icons in multiple formats"},
        ]
        
        for product_data in products:
            product = Product(
                name=product_data["name"],
                slug=product_data["slug"],
                description=product_data["description"],
                sku=f"SKU-{product_data['slug'].upper()}",
                price=product_data["price"],
                category_id=category_map[product_data["category"]],
                stock_quantity=100,
                is_active=True
            )
            db.add(product)
        
        await db.commit()
        print(f"Successfully seeded {len(products)} products!")


if __name__ == "__main__":
    asyncio.run(seed_products())