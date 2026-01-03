"""
Public Shop API - Products and Categories for the Shop page
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_
from sqlalchemy.orm import selectinload
from typing import Optional, List

from app.core.database import get_db
from app.models.models import Product, ProductCategory
from app.schemas.schemas import PaginatedResponse, ShopProductResponse, ShopCategoryResponse

router = APIRouter()


@router.get("/products")
async def get_shop_products(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: Optional[str] = None,
    category_id: Optional[int] = None,
    sort_by: Optional[str] = Query(None, regex="^(newest|price-low|price-high|popular)$"),
    db: AsyncSession = Depends(get_db)
):
    """
    Get products for the public shop page.
    No authentication required.
    """
    query = select(Product).options(selectinload(Product.category)).where(Product.is_active == True)
    
    if search:
        query = query.where(
            or_(
                Product.name.ilike(f"%{search}%"),
                Product.description.ilike(f"%{search}%"),
                Product.sku.ilike(f"%{search}%")
            )
        )
    
    if category_id:
        query = query.where(Product.category_id == category_id)
    
    # Sorting
    if sort_by == "price-low":
        query = query.order_by(Product.price.asc())
    elif sort_by == "price-high":
        query = query.order_by(Product.price.desc())
    elif sort_by == "popular":
        query = query.order_by(Product.is_featured.desc(), Product.created_at.desc())
    else:  # newest or default
        query = query.order_by(Product.created_at.desc())
    
    # Count total
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar()
    
    # Apply pagination
    query = query.offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(query)
    products = result.scalars().all()
    
    # Convert to Pydantic models
    product_responses = [ShopProductResponse.model_validate(product) for product in products]
    
    return {
        "items": product_responses,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (total + page_size - 1) // page_size
    }


@router.get("/products/{slug}", response_model=ShopProductResponse)
async def get_product_by_slug(
    slug: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Get a single product by slug for the product detail page.
    No authentication required.
    """
    result = await db.execute(
        select(Product)
        .options(selectinload(Product.category))
        .where(Product.slug == slug, Product.is_active == True)
    )
    product = result.scalar_one_or_none()
    
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    return ShopProductResponse.model_validate(product)


@router.get("/categories")
async def get_shop_categories(
    page: int = Query(1, ge=1),
    page_size: int = Query(100, ge=1, le=100),
    db: AsyncSession = Depends(get_db)
):
    """
    Get product categories for the shop page.
    No authentication required.
    """
    query = select(ProductCategory).options(selectinload(ProductCategory.parent)).where(ProductCategory.is_active == True).order_by(ProductCategory.order_index)
    
    # Count total
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar()
    
    # Apply pagination
    query = query.offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(query)
    categories = result.scalars().all()
    
    # Add product count for each category
    items_with_count = []
    for category in categories:
        product_count_query = select(func.count(Product.id)).where(
            Product.category_id == category.id,
            Product.is_active == True
        )
        product_count_result = await db.execute(product_count_query)
        product_count = product_count_result.scalar()
        
        # Serialize parent category if exists
        parent_data = None
        if category.parent:
            parent_data = {
                "id": category.parent.id,
                "name": category.parent.name,
                "slug": category.parent.slug,
            }
        
        category_dict = {
            "id": category.id,
            "name": category.name,
            "slug": category.slug,
            "description": category.description,
            "parent_id": category.parent_id,
            "parent": parent_data,
            "image_url": category.image_url,
            "order_index": category.order_index,
            "product_count": product_count
        }
        items_with_count.append(category_dict)
    
    return {
        "items": items_with_count,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (total + page_size - 1) // page_size
    }
