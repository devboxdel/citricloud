"""
CMS Dashboard - Content management routes
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from typing import Optional
from datetime import datetime
import os
import uuid
from pathlib import Path

from app.core.database import get_db
from app.api.dependencies import get_current_user, require_admin
from app.models.models import (
    User, Page, BlogPost, BlogCategory, Product, ProductCategory, Menu, MenuItem, PageStatus,
    Comment, CommentReport, CommentStatus, CommentReportStatus, ContentType
)
from app.schemas.schemas import (
    PageCreate, PageUpdate, PageResponse,
    BlogPostCreate, BlogPostUpdate, BlogPostResponse,
    BlogCategoryCreate, BlogCategoryResponse,
    ProductCreate, ProductUpdate, ProductResponse,
    ProductCategoryCreate, ProductCategoryResponse,
    MenuCreate, MenuResponse, MenuItemCreate, MenuItemResponse,
    PaginatedResponse, PageStatusEnum,
    CommentCreate, CommentUpdate, CommentResponse,
    CommentReportCreate, CommentReportUpdate, CommentReportResponse,
    CommentStatusEnum, CommentReportStatusEnum, ContentTypeEnum
)

router = APIRouter()


# Helper to safely serialize blog posts (avoid circular references)
def serialize_blog_post(post: BlogPost) -> BlogPostResponse:
    related = []
    # Only include related posts if they were eagerly loaded to avoid async lazy-load issues
    if "related_posts" in post.__dict__ and post.related_posts:
        for rp in post.related_posts:
            related.append(BlogPostResponse.model_validate({
                'id': rp.id,
                'title': rp.title,
                'slug': rp.slug,
                'excerpt': rp.excerpt,
                'content': rp.content,
                'featured_image': rp.featured_image,
                'author_id': rp.author_id,
                'category_id': rp.category_id,
                'status': rp.status,
                'views_count': rp.views_count,
                'is_sticky': rp.is_sticky,
                'created_at': rp.created_at,
                'updated_at': rp.updated_at,
                'published_at': rp.published_at,
                'related_posts': None,
                'meta_title': rp.meta_title,
                'meta_description': rp.meta_description,
            }))

    return BlogPostResponse.model_validate({
        'id': post.id,
        'title': post.title,
        'slug': post.slug,
        'excerpt': post.excerpt,
        'content': post.content,
        'featured_image': post.featured_image,
        'author_id': post.author_id,
        'category_id': post.category_id,
        'status': post.status,
        'views_count': post.views_count,
        'is_sticky': post.is_sticky,
        'created_at': post.created_at,
        'updated_at': post.updated_at,
        'published_at': post.published_at,
        'related_posts': related if related else None,
        'meta_title': post.meta_title,
        'meta_description': post.meta_description,
    })


def serialize_comment(comment: Comment) -> CommentResponse:
    import json
    reactions = json.loads(comment.reactions) if comment.reactions else {}
    return CommentResponse.model_validate({
        'id': comment.id,
        'post_id': comment.post_id,
        'post_type': comment.post_type,
        'post_title': comment.post_title,
        'post_slug': comment.post_slug,
        'author_name': comment.author_name,
        'author_email': comment.author_email,
        'content': comment.content,
        'status': comment.status,
        'platform': comment.platform,
        'likes_count': comment.likes_count,
        'dislikes_count': comment.dislikes_count,
        'reactions': reactions,
        'created_at': comment.created_at,
        'updated_at': comment.updated_at,
    })


def serialize_comment_report(report: CommentReport) -> CommentReportResponse:
    return CommentReportResponse.model_validate({
        'id': report.id,
        'comment_id': report.comment_id,
        'post_id': report.post_id,
        'post_type': report.post_type,
        'reason': report.reason,
        'details': report.details,
        'reporter_name': report.reporter_name,
        'reporter_email': report.reporter_email,
        'platform': report.platform,
        'status': report.status,
        'action_taken': report.action_taken,
        'comment_content': report.comment.content if report.comment else None,
        'post_title': report.post.title if report.post else (report.comment.post.title if report.comment and report.comment.post else report.comment.post_title if report.comment else None),
        'post_slug': report.post.slug if report.post else (report.comment.post.slug if report.comment and report.comment.post else report.comment.post_slug if report.comment else None),
        'created_at': report.created_at,
        'updated_at': report.updated_at,
    })


# ========== Pages ==========

@router.get("/pages", response_model=PaginatedResponse)
async def list_pages(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: Optional[str] = None,
    status_filter: Optional[PageStatusEnum] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """List pages with pagination"""
    query = select(Page)
    
    if search:
        query = query.where(
            (Page.title.ilike(f"%{search}%")) |
            (Page.slug.ilike(f"%{search}%"))
        )
    
    if status_filter:
        query = query.where(Page.status == status_filter)
    
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar()
    
    query = query.offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(query)
    pages = result.scalars().all()
    
    return {
        "items": pages,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (total + page_size - 1) // page_size
    }


@router.get("/pages/{page_id}", response_model=PageResponse)
async def get_page(
    page_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Get page by ID"""
    result = await db.execute(select(Page).where(Page.id == page_id))
    page = result.scalar_one_or_none()
    
    if not page:
        raise HTTPException(status_code=404, detail="Page not found")
    
    return page


@router.post("/pages", response_model=PageResponse, status_code=201)
async def create_page(
    page_data: PageCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Create a new page"""
    # Check if slug exists
    result = await db.execute(select(Page).where(Page.slug == page_data.slug))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Slug already exists")
    
    page = Page(**page_data.model_dump())
    
    if page.status == PageStatusEnum.PUBLISHED and not page.published_at:
        page.published_at = datetime.utcnow()
    
    db.add(page)
    await db.commit()
    await db.refresh(page)
    
    return page


@router.put("/pages/{page_id}", response_model=PageResponse)
async def update_page(
    page_id: int,
    page_data: PageUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Update page"""
    result = await db.execute(select(Page).where(Page.id == page_id))
    page = result.scalar_one_or_none()
    
    if not page:
        raise HTTPException(status_code=404, detail="Page not found")
    
    for field, value in page_data.model_dump(exclude_unset=True).items():
        setattr(page, field, value)
    
    if page.status == PageStatusEnum.PUBLISHED and not page.published_at:
        page.published_at = datetime.utcnow()
    
    await db.commit()
    await db.refresh(page)
    
    return page


@router.delete("/pages/{page_id}", status_code=204)
async def delete_page(
    page_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Delete page"""
    result = await db.execute(select(Page).where(Page.id == page_id))
    page = result.scalar_one_or_none()
    
    if not page:
        raise HTTPException(status_code=404, detail="Page not found")
    
    await db.delete(page)
    await db.commit()


# ========== Blog Categories ==========

@router.get("/blog/categories", response_model=list[BlogCategoryResponse])
async def list_blog_categories(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """List all blog categories"""
    result = await db.execute(select(BlogCategory).order_by(BlogCategory.order_index))
    categories = result.scalars().all()
    return categories


@router.post("/blog/categories", response_model=BlogCategoryResponse, status_code=201)
async def create_blog_category(
    category_data: BlogCategoryCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Create a new blog category"""
    result = await db.execute(select(BlogCategory).where(BlogCategory.slug == category_data.slug))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Slug already exists")
    
    category = BlogCategory(**category_data.model_dump())
    db.add(category)
    await db.commit()
    await db.refresh(category)
    
    return category


@router.put("/blog/categories/{category_id}", response_model=BlogCategoryResponse)
async def update_blog_category(
    category_id: int,
    category_data: BlogCategoryCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Update blog category"""
    result = await db.execute(select(BlogCategory).where(BlogCategory.id == category_id))
    category = result.scalar_one_or_none()
    
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    for field, value in category_data.model_dump(exclude_unset=True).items():
        setattr(category, field, value)
    
    await db.commit()
    await db.refresh(category)
    
    return category


@router.delete("/blog/categories/{category_id}", status_code=204)
async def delete_blog_category(
    category_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Delete blog category"""
    result = await db.execute(select(BlogCategory).where(BlogCategory.id == category_id))
    category = result.scalar_one_or_none()
    
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    await db.delete(category)
    await db.commit()


# ========== Blog Posts ==========

@router.get("/blog/posts", response_model=PaginatedResponse)
async def list_blog_posts(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: Optional[str] = None,
    category_id: Optional[int] = None,
    status_filter: Optional[PageStatusEnum] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """List blog posts with pagination - Featured posts first"""
    from sqlalchemy import desc
    
    query = select(BlogPost)
    
    if search:
        query = query.where(
            (BlogPost.title.ilike(f"%{search}%")) |
            (BlogPost.content.ilike(f"%{search}%"))
        )
    
    if category_id:
        query = query.where(BlogPost.category_id == category_id)
    
    if status_filter:
        query = query.where(BlogPost.status == status_filter)
    
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar()
    
    # Order by sticky/featured status first (True first), then by updated date
    query = query.order_by(desc(BlogPost.is_sticky), BlogPost.updated_at.desc())
    query = query.offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(query)
    posts = result.scalars().all()
    
    # Convert to Pydantic models
    # Convert to Pydantic models - dict conversion to avoid circular references
    posts_response = []
    for post in posts:
        post_dict = {
            'id': post.id,
            'title': post.title,
            'slug': post.slug,
            'excerpt': post.excerpt,
            'content': post.content,
            'featured_image': post.featured_image,
            'author_id': post.author_id,
            'category_id': post.category_id,
            'status': post.status,
            'views_count': post.views_count,
            'is_sticky': post.is_sticky,
            'created_at': post.created_at,
            'updated_at': post.updated_at,
            'published_at': post.published_at,
            'meta_title': post.meta_title,
            'meta_description': post.meta_description,
            'related_posts': None  # Don't include related posts in public endpoint to avoid circular references
        }
        posts_response.append(BlogPostResponse.model_validate(post_dict))
    
    return {
        "items": posts_response,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (total + page_size - 1) // page_size
    }


@router.post("/blog/posts", response_model=BlogPostResponse, status_code=201)
async def create_blog_post(
    post_data: BlogPostCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Create a new blog post"""
    result = await db.execute(select(BlogPost).where(BlogPost.slug == post_data.slug))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Slug already exists")
    
    # Extract related_post_ids before creating the post
    related_post_ids = post_data.related_post_ids
    post_dict = post_data.model_dump(exclude={'related_post_ids'})
    
    post = BlogPost(**post_dict, author_id=current_user.id)
    
    if post.status == PageStatusEnum.PUBLISHED:
        post.published_at = datetime.utcnow()
    
    db.add(post)
    await db.flush()  # Flush to get the post ID
    
    # Handle related posts
    if related_post_ids:
        result = await db.execute(select(BlogPost).where(BlogPost.id.in_(related_post_ids)))
        related_posts = result.scalars().all()
        post.related_posts = list(related_posts)
    
    await db.commit()
    await db.refresh(post)
    
    return post


@router.put("/blog/posts/{post_id}", response_model=BlogPostResponse)
async def update_blog_post(
    post_id: int,
    post_data: BlogPostUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Update blog post"""
    # Eager-load related_posts to avoid async lazy-load (MissingGreenlet) when reassigning
    result = await db.execute(
        select(BlogPost)
        .options(selectinload(BlogPost.related_posts))
        .where(BlogPost.id == post_id)
    )
    post = result.scalar_one_or_none()
    
    if not post:
        raise HTTPException(status_code=404, detail="Blog post not found")
    
    # Extract related_post_ids
    update_dict = post_data.model_dump(exclude_unset=True)
    related_post_ids = update_dict.pop('related_post_ids', None)
    
    # Update regular fields
    for field, value in update_dict.items():
        setattr(post, field, value)
    
    # Handle related posts
    if related_post_ids is not None:
        if related_post_ids:
            result = await db.execute(select(BlogPost).where(BlogPost.id.in_(related_post_ids)))
            related_posts = result.scalars().all()
            post.related_posts = list(related_posts)
        else:
            post.related_posts = []
    
    if post.status == PageStatusEnum.PUBLISHED and not post.published_at:
        post.published_at = datetime.utcnow()
    
    await db.commit()
    await db.refresh(post)
    
    return post


@router.delete("/blog/posts/{post_id}", status_code=204)
async def delete_blog_post(
    post_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Delete blog post"""
    result = await db.execute(select(BlogPost).where(BlogPost.id == post_id))
    post = result.scalar_one_or_none()
    
    if not post:
        raise HTTPException(status_code=404, detail="Blog post not found")
    
    await db.delete(post)
    await db.commit()


# ========== Blog Comments ==========

@router.post("/public/blog/comments", response_model=CommentResponse, status_code=201)
async def create_public_comment(
    comment_data: CommentCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Authenticated endpoint: Create a comment for a blog or news post (requires login)"""
    target_post = None

    if comment_data.post_id:
        post_result = await db.execute(select(BlogPost).where(BlogPost.id == comment_data.post_id))
        target_post = post_result.scalar_one_or_none()
        if not target_post:
            raise HTTPException(status_code=404, detail="Blog post not found")

    # Use authenticated user's information
    comment = Comment(
        post_id=target_post.id if target_post else comment_data.post_id,
        post_type=ContentType(comment_data.post_type),
        post_title=comment_data.post_title or (target_post.title if target_post else None),
        post_slug=comment_data.post_slug or (target_post.slug if target_post else None),
        content=comment_data.content,
        author_name=current_user.full_name or current_user.username,
        author_email=current_user.email,
        status=CommentStatus.PENDING,
        platform=comment_data.platform or "web",
    )

    db.add(comment)
    await db.commit()
    await db.refresh(comment)

    return serialize_comment(comment)


@router.get("/public/blog/posts/{post_id}/comments", response_model=list[CommentResponse])
async def get_public_post_comments(
    post_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Public endpoint: Get approved comments for a blog post by post ID"""
    query = select(Comment).where(
        Comment.post_id == post_id,
        Comment.status == CommentStatus.APPROVED
    ).order_by(Comment.created_at.desc())
    
    result = await db.execute(query)
    comments = result.scalars().all()
    
    return [serialize_comment(comment) for comment in comments]


@router.get("/public/blog/comments", response_model=list[CommentResponse])
async def get_public_comments(
    post_id: int = Query(..., description="Blog post ID to get comments for"),
    db: AsyncSession = Depends(get_db)
):
    """Public endpoint: Get approved comments for a blog post (fallback with query param)"""
    query = select(Comment).where(
        Comment.post_id == post_id,
        Comment.status == CommentStatus.APPROVED
    ).order_by(Comment.created_at.desc())
    
    result = await db.execute(query)
    comments = result.scalars().all()
    
    return [serialize_comment(comment) for comment in comments]


@router.post("/public/blog/posts/{post_id}/comments/{comment_id}/like", response_model=CommentResponse)
async def like_public_post_comment(
    post_id: int,
    comment_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Public endpoint: Like a comment on a specific post"""
    result = await db.execute(select(Comment).where(
        Comment.id == comment_id,
        Comment.post_id == post_id
    ))
    comment = result.scalar_one_or_none()
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    
    comment.likes_count += 1
    await db.commit()
    await db.refresh(comment)
    
    return serialize_comment(comment)


@router.post("/public/blog/posts/{post_id}/comments/{comment_id}/dislike", response_model=CommentResponse)
async def dislike_public_post_comment(
    post_id: int,
    comment_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Public endpoint: Dislike a comment on a specific post"""
    result = await db.execute(select(Comment).where(
        Comment.id == comment_id,
        Comment.post_id == post_id
    ))
    comment = result.scalar_one_or_none()
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    
    comment.dislikes_count += 1
    await db.commit()
    await db.refresh(comment)
    
    return serialize_comment(comment)


@router.post("/public/blog/comments/{comment_id}/like", response_model=CommentResponse)
async def like_public_comment(
    comment_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Public endpoint: Like a comment (fallback)"""
    result = await db.execute(select(Comment).where(Comment.id == comment_id))
    comment = result.scalar_one_or_none()
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    
    comment.likes_count += 1
    await db.commit()
    await db.refresh(comment)
    
    return serialize_comment(comment)


@router.post("/public/blog/comments/{comment_id}/dislike", response_model=CommentResponse)
async def dislike_public_comment(
    comment_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Public endpoint: Dislike a comment (fallback)"""
    result = await db.execute(select(Comment).where(Comment.id == comment_id))
    comment = result.scalar_one_or_none()
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    
    comment.dislikes_count += 1
    await db.commit()
    await db.refresh(comment)
    
    return serialize_comment(comment)


@router.post("/public/blog/comments/{comment_id}/report", status_code=201)
async def report_public_comment(
    comment_id: int,
    report_data: dict,
    db: AsyncSession = Depends(get_db)
):
    """Public endpoint: Report a comment"""
    result = await db.execute(select(Comment).where(Comment.id == comment_id))
    comment = result.scalar_one_or_none()
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    

@router.post("/public/blog/comments/{comment_id}/reaction")
async def add_comment_reaction(
    comment_id: int,
    reaction_data: dict,
    db: AsyncSession = Depends(get_db)
):
    """Add emoji reaction to a comment (web, iOS, Android)"""
    from app.models.models import CommentReaction
    import json
    
    emoji = reaction_data.get('emoji', '👍')
    user_identifier = reaction_data.get('user_identifier')  # email or device_id
    platform = reaction_data.get('platform', 'web')
    
    if not user_identifier:
        raise HTTPException(status_code=400, detail="user_identifier required")
    
    # Get comment
    result = await db.execute(select(Comment).where(Comment.id == comment_id))
    comment = result.scalar_one_or_none()
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    
    # Check if user already reacted
    existing = await db.execute(
        select(CommentReaction).where(
            CommentReaction.comment_id == comment_id,
            CommentReaction.user_identifier == user_identifier
        )
    )
    existing_reaction = existing.scalar_one_or_none()
    
    # Parse current reactions
    reactions = json.loads(comment.reactions) if comment.reactions else {}
    
    if existing_reaction:
        # Remove old emoji count
        old_emoji = existing_reaction.emoji
        if old_emoji in reactions:
            reactions[old_emoji] = max(0, reactions[old_emoji] - 1)
            if reactions[old_emoji] == 0:
                del reactions[old_emoji]
        
        # Update to new emoji
        existing_reaction.emoji = emoji
        existing_reaction.platform = platform
    else:
        # Create new reaction
        new_reaction = CommentReaction(
            comment_id=comment_id,
            user_identifier=user_identifier,
            emoji=emoji,
            platform=platform
        )
        db.add(new_reaction)
    
    # Update emoji count
    reactions[emoji] = reactions.get(emoji, 0) + 1
    comment.reactions = json.dumps(reactions)
    
    await db.commit()
    await db.refresh(comment)
    
    return {"success": True, "reactions": reactions}


@router.delete("/public/blog/comments/{comment_id}/reaction")
async def remove_comment_reaction(
    comment_id: int,
    user_identifier: str = Query(...),
    db: AsyncSession = Depends(get_db)
):
    """Remove emoji reaction from a comment"""
    from app.models.models import CommentReaction
    import json
    
    # Get comment
    result = await db.execute(select(Comment).where(Comment.id == comment_id))
    comment = result.scalar_one_or_none()
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    
    # Find existing reaction
    existing = await db.execute(
        select(CommentReaction).where(
            CommentReaction.comment_id == comment_id,
            CommentReaction.user_identifier == user_identifier
        )
    )
    existing_reaction = existing.scalar_one_or_none()
    
    if not existing_reaction:
        raise HTTPException(status_code=404, detail="Reaction not found")
    
    # Parse current reactions
    reactions = json.loads(comment.reactions) if comment.reactions else {}
    
    # Remove emoji count
    emoji = existing_reaction.emoji
    if emoji in reactions:
        reactions[emoji] = max(0, reactions[emoji] - 1)
        if reactions[emoji] == 0:
            del reactions[emoji]
    
    comment.reactions = json.dumps(reactions)
    
    # Delete reaction record
    await db.delete(existing_reaction)
    await db.commit()
    await db.refresh(comment)
    
    return {"success": True, "reactions": reactions}


@router.get("/public/blog/comments/{comment_id}/user-reaction")
async def get_user_reaction(
    comment_id: int,
    user_identifier: str = Query(...),
    db: AsyncSession = Depends(get_db)
):
    """Get user's current reaction to a comment"""
    from app.models.models import CommentReaction
    
    result = await db.execute(
        select(CommentReaction).where(
            CommentReaction.comment_id == comment_id,
            CommentReaction.user_identifier == user_identifier
        )
    )
    reaction = result.scalar_one_or_none()
    
    if reaction:
        return {"emoji": reaction.emoji, "created_at": reaction.created_at}
    return {"emoji": None}

    # Create a comment report
    report = CommentReport(
        comment_id=comment_id,
        post_id=comment.post_id,
        post_type=comment.post_type,
        reason=report_data.get("reason", "Inappropriate content"),
        details=report_data.get("details", ""),
        reporter_name=report_data.get("reporter_name"),
        reporter_email=report_data.get("reporter_email"),
        status=CommentReportStatus.PENDING,
        platform=report_data.get("platform", "web")
    )
    
    db.add(report)
    await db.commit()
    
    return {"message": "Report submitted successfully"}


@router.get("/blog/comments", response_model=PaginatedResponse)
async def list_blog_comments(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status_filter: Optional[CommentStatusEnum] = None,
    post_type: Optional[ContentTypeEnum] = None,
    platform: Optional[str] = None,
    post_id: Optional[int] = None,
    search: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """List comments for moderation"""
    query = select(Comment).options(selectinload(Comment.post))

    if status_filter:
        query = query.where(Comment.status == status_filter)
    if post_type:
        query = query.where(Comment.post_type == post_type)
    if platform:
        query = query.where(Comment.platform == platform)
    if post_id:
        query = query.where(Comment.post_id == post_id)
    if search:
        query = query.where(
            (Comment.content.ilike(f"%{search}%")) |
            (Comment.author_name.ilike(f"%{search}%")) |
            (Comment.author_email.ilike(f"%{search}%"))
        )

    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar()

    query = query.order_by(Comment.created_at.desc())
    query = query.offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(query)
    comments = result.scalars().all()

    return {
        "items": [serialize_comment(comment) for comment in comments],
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (total + page_size - 1) // page_size
    }


@router.patch("/blog/comments/{comment_id}", response_model=CommentResponse)
async def update_blog_comment(
    comment_id: int,
    comment_data: CommentUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Update comment status or content"""
    result = await db.execute(select(Comment).where(Comment.id == comment_id))
    comment = result.scalar_one_or_none()

    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")

    for field, value in comment_data.model_dump(exclude_unset=True).items():
        setattr(comment, field, value)

    comment.updated_at = datetime.utcnow()
    await db.commit()
    await db.refresh(comment)

    return serialize_comment(comment)


@router.delete("/blog/comments/{comment_id}", status_code=204)
async def delete_blog_comment(
    comment_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Delete a comment"""
    result = await db.execute(select(Comment).where(Comment.id == comment_id))
    comment = result.scalar_one_or_none()

    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")

    await db.delete(comment)
    await db.commit()


# ========== Comment Reports ==========

@router.post("/public/blog/reports", response_model=CommentReportResponse, status_code=201)
async def create_comment_report(
    report_data: CommentReportCreate,
    db: AsyncSession = Depends(get_db)
):
    """Public endpoint: Report a comment"""
    comment = None
    if report_data.comment_id:
        comment_result = await db.execute(
            select(Comment).options(selectinload(Comment.post)).where(Comment.id == report_data.comment_id)
        )
        comment = comment_result.scalar_one_or_none()
        if not comment:
            raise HTTPException(status_code=404, detail="Comment not found")

    post = None
    target_post_id = report_data.post_id or (comment.post_id if comment else None)
    if target_post_id:
        post_result = await db.execute(select(BlogPost).where(BlogPost.id == target_post_id))
        post = post_result.scalar_one_or_none()

    report = CommentReport(
        comment_id=comment.id if comment else report_data.comment_id,
        post_id=post.id if post else target_post_id,
        post_type=ContentType(report_data.post_type),
        reason=report_data.reason,
        details=report_data.details,
        reporter_name=report_data.reporter_name,
        reporter_email=report_data.reporter_email,
        platform=report_data.platform or "web",
        status=CommentReportStatus.OPEN,
    )

    db.add(report)
    await db.commit()
    await db.refresh(report)

    return serialize_comment_report(report)


@router.get("/blog/reports", response_model=PaginatedResponse)
async def list_comment_reports(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status_filter: Optional[CommentReportStatusEnum] = None,
    post_type: Optional[ContentTypeEnum] = None,
    platform: Optional[str] = None,
    post_id: Optional[int] = None,
    comment_id: Optional[int] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """List reports filed against comments"""
    query = select(CommentReport).options(
        selectinload(CommentReport.comment).selectinload(Comment.post),
        selectinload(CommentReport.post)
    )

    if status_filter:
        query = query.where(CommentReport.status == status_filter)
    if post_type:
        query = query.where(CommentReport.post_type == post_type)
    if platform:
        query = query.where(CommentReport.platform == platform)
    if post_id:
        query = query.where(CommentReport.post_id == post_id)
    if comment_id:
        query = query.where(CommentReport.comment_id == comment_id)

    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar()

    query = query.order_by(CommentReport.created_at.desc())
    query = query.offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(query)
    reports = result.scalars().all()

    return {
        "items": [serialize_comment_report(report) for report in reports],
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (total + page_size - 1) // page_size
    }


@router.patch("/blog/reports/{report_id}", response_model=CommentReportResponse)
async def update_comment_report(
    report_id: int,
    report_data: CommentReportUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Update report status or action taken"""
    result = await db.execute(select(CommentReport).where(CommentReport.id == report_id))
    report = result.scalar_one_or_none()

    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    for field, value in report_data.model_dump(exclude_unset=True).items():
        setattr(report, field, value)

    report.updated_at = datetime.utcnow()
    await db.commit()
    await db.refresh(report)

    return serialize_comment_report(report)
# ========== Product Categories ==========

@router.get("/products/categories", response_model=list[ProductCategoryResponse])
async def list_product_categories(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """List all product categories"""
    result = await db.execute(select(ProductCategory).order_by(ProductCategory.order_index))
    categories = result.scalars().all()
    return categories


@router.post("/products/categories", response_model=ProductCategoryResponse, status_code=201)
async def create_product_category(
    category_data: ProductCategoryCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Create a new product category"""
    result = await db.execute(select(ProductCategory).where(ProductCategory.slug == category_data.slug))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Slug already exists")
    
    category = ProductCategory(**category_data.model_dump())
    db.add(category)
    await db.commit()
    await db.refresh(category)
    
    return category


# ========== Products ==========

@router.get("/products", response_model=PaginatedResponse)
async def list_products(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: Optional[str] = None,
    category_id: Optional[int] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """List products with pagination"""
    query = select(Product)
    
    if search:
        query = query.where(
            (Product.name.ilike(f"%{search}%")) |
            (Product.sku.ilike(f"%{search}%"))
        )
    
    if category_id:
        query = query.where(Product.category_id == category_id)
    
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar()
    
    query = query.offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(query)
    products = result.scalars().all()
    
    return {
        "items": products,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (total + page_size - 1) // page_size
    }


@router.post("/products", response_model=ProductResponse, status_code=201)
async def create_product(
    product_data: ProductCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Create a new product"""
    result = await db.execute(select(Product).where(Product.sku == product_data.sku))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="SKU already exists")
    
    product = Product(**product_data.model_dump())
    db.add(product)
    await db.commit()
    await db.refresh(product)
    
    return product


@router.put("/products/{product_id}", response_model=ProductResponse)
async def update_product(
    product_id: int,
    product_data: ProductUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Update product"""
    result = await db.execute(select(Product).where(Product.id == product_id))
    product = result.scalar_one_or_none()
    
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    for field, value in product_data.model_dump(exclude_unset=True).items():
        setattr(product, field, value)
    
    await db.commit()
    await db.refresh(product)
    
    return product


# ========== Menus ==========

@router.get("/menus", response_model=list[MenuResponse])
async def list_menus(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """List all menus"""
    result = await db.execute(select(Menu))
    menus = result.scalars().all()
    return menus


@router.post("/menus", response_model=MenuResponse, status_code=201)
async def create_menu(
    menu_data: MenuCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Create a new menu"""
    result = await db.execute(select(Menu).where(Menu.slug == menu_data.slug))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Slug already exists")
    
    menu = Menu(**menu_data.model_dump())
    db.add(menu)
    await db.commit()
    await db.refresh(menu)
    
    return menu


@router.get("/stats")
async def get_cms_stats(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Get CMS statistics"""
    # Count pages
    pages_result = await db.execute(select(func.count(Page.id)))
    total_pages = pages_result.scalar()
    
    # Count blog posts
    posts_result = await db.execute(select(func.count(BlogPost.id)))
    total_posts = posts_result.scalar()
    
    # Count products
    products_result = await db.execute(select(func.count(Product.id)))
    total_products = products_result.scalar()
    
    return {
        "total_pages": total_pages,
        "total_blog_posts": total_posts,
        "total_products": total_products
    }


# ========== Public API Endpoints (No Authentication Required) ==========

@router.get("/public/blog/posts")
async def list_public_blog_posts(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    category_id: Optional[int] = None,
    db: AsyncSession = Depends(get_db)
):
    """Public endpoint: List published blog posts with pagination - Featured posts first"""
    from sqlalchemy import desc
    
    query = select(BlogPost).where(BlogPost.status == PageStatus.PUBLISHED)
    
    if category_id:
        query = query.where(BlogPost.category_id == category_id)
    
    # Order by sticky/featured status first (True first), then by published date
    query = query.order_by(desc(BlogPost.is_sticky), BlogPost.published_at.desc())
    
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar()
    
    query = query.offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(query)
    posts = result.scalars().all()
    
    # Convert to Pydantic models
    # Convert to Pydantic models - dict conversion to avoid circular references
    posts_response = []
    for post in posts:
        post_dict = {
            'id': post.id,
            'title': post.title,
            'slug': post.slug,
            'excerpt': post.excerpt,
            'content': post.content,
            'featured_image': post.featured_image,
            'author_id': post.author_id,
            'category_id': post.category_id,
            'status': post.status,
            'views_count': post.views_count,
            'is_sticky': post.is_sticky,
            'created_at': post.created_at,
            'updated_at': post.updated_at,
            'published_at': post.published_at,
            'meta_title': post.meta_title,
            'meta_description': post.meta_description,
            'related_posts': None  # Don't include related posts in public endpoint to avoid circular references
        }
        posts_response.append(BlogPostResponse.model_validate(post_dict))
    
    return {
        "items": posts_response,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (total + page_size - 1) // page_size
    }


@router.get("/public/blog/categories", response_model=list[BlogCategoryResponse])
async def list_public_blog_categories(
    db: AsyncSession = Depends(get_db)
):
    """Public endpoint: List active blog categories"""
    result = await db.execute(
        select(BlogCategory)
        .where(BlogCategory.is_active == True)
        .order_by(BlogCategory.order_index)
    )
    categories = result.scalars().all()
    return categories


@router.get("/public/products/categories", response_model=list[ProductCategoryResponse])
async def list_public_product_categories(
    db: AsyncSession = Depends(get_db)
):
    """Public endpoint: List active product categories"""
    result = await db.execute(
        select(ProductCategory)
        .where(ProductCategory.is_active == True)
        .order_by(ProductCategory.order_index)
    )
    categories = result.scalars().all()
    return categories


@router.get("/public/blog/posts/slug/{slug}", response_model=BlogPostResponse)
async def get_public_blog_post_by_slug(
    slug: str,
    db: AsyncSession = Depends(get_db)
):
    """Public endpoint: Get a published blog post by slug and increment view count"""
    result = await db.execute(
        select(BlogPost)
        .options(selectinload(BlogPost.related_posts))
        .where(BlogPost.slug == slug)
        .where(BlogPost.status == PageStatusEnum.PUBLISHED)
    )
    post = result.scalar_one_or_none()
    
    if not post:
        raise HTTPException(status_code=404, detail="Blog post not found")
    
    # Increment view count
    post.views_count = (post.views_count or 0) + 1
    await db.commit()
    await db.refresh(post)
    
    return serialize_blog_post(post)


@router.get("/public/blog/posts/{post_id}", response_model=BlogPostResponse)
async def get_public_blog_post(
    post_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Public endpoint: Get a published blog post by ID and increment view count"""
    result = await db.execute(
        select(BlogPost)
        .options(selectinload(BlogPost.related_posts))
        .where(BlogPost.id == post_id)
        .where(BlogPost.status == PageStatusEnum.PUBLISHED)
    )
    post = result.scalar_one_or_none()
    
    if not post:
        raise HTTPException(status_code=404, detail="Blog post not found")
    
    # Increment view count
    post.views_count = (post.views_count or 0) + 1
    await db.commit()
    await db.refresh(post)
    
    return serialize_blog_post(post)


# ========== Media Upload ==========

@router.post("/media/upload")
async def upload_media(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Upload media file"""
    from app.core.config import settings
    
    print(f"\n=== UPLOAD_MEDIA DEBUG ===")
    print(f"User: {current_user.email if current_user else 'None'}")
    print(f"File name: {file.filename}")
    print(f"File content_type received: '{file.content_type}'")
    print(f"File size: {file.size}")
    
    # Validate file type (include common aliases from various browsers)
    allowed_types = [
        "image/jpeg",
        "image/jpg",      # alias seen in some UAs
        "image/pjpeg",    # progressive JPEG
        "image/png",
        "image/x-png",    # legacy alias
        "image/gif",
        "image/webp",
        "image/svg+xml",
        # Add fallback for empty or missing content type
        "application/octet-stream",  # Fallback for files without proper MIME type
    ]
    
    print(f"Checking if '{file.content_type}' is in allowed_types")
    
    # If content_type is not recognized, try to guess from filename
    actual_content_type = file.content_type
    if not actual_content_type or actual_content_type not in allowed_types:
        # Try to infer from file extension
        if file.filename:
            ext = file.filename.lower().split('.')[-1]
            ext_to_type = {
                'jpg': 'image/jpeg',
                'jpeg': 'image/jpeg',
                'png': 'image/png',
                'gif': 'image/gif',
                'webp': 'image/webp',
                'svg': 'image/svg+xml',
            }
            if ext in ext_to_type:
                actual_content_type = ext_to_type[ext]
                print(f"Inferred content type from extension '{ext}': {actual_content_type}")
    
    if actual_content_type not in allowed_types:
        error_msg = f"Invalid file type. Received: '{file.content_type}'. Only images are allowed."
        print(f"❌ {error_msg}")
        raise HTTPException(status_code=400, detail=error_msg)
    
    print(f"✓ Content type validated")
    
    # Create uploads directory if it doesn't exist
    upload_dir = Path(settings.UPLOAD_DIR)
    upload_dir.mkdir(parents=True, exist_ok=True)
    
    # Generate unique filename
    file_extension = file.filename.split(".")[-1] if "." in file.filename else "jpg"
    unique_filename = f"{uuid.uuid4()}.{file_extension}"
    file_path = upload_dir / unique_filename
    
    # Save file
    try:
        contents = await file.read()
        with open(file_path, "wb") as f:
            f.write(contents)
        print(f"✓ File saved to {file_path}")
    except Exception as e:
        error_msg = f"Failed to upload file: {str(e)}"
        print(f"❌ {error_msg}")
        raise HTTPException(status_code=500, detail=error_msg)
    
    # Return URL
    file_url = f"/uploads/{unique_filename}"
    
    print(f"✓ Upload successful: {file_url}\n")
    
    return {
        "success": True,
        "url": file_url,
        "filename": unique_filename,
        "original_filename": file.filename,
        "size": len(contents),
        "content_type": actual_content_type
    }


@router.get("/media")
async def list_media(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """List all uploaded media files"""
    from app.core.config import settings
    upload_dir = Path(settings.UPLOAD_DIR)
    
    if not upload_dir.exists():
        return {"items": []}
    
    media_files = []
    for file_path in upload_dir.iterdir():
        if file_path.is_file():
            stat = file_path.stat()
            media_files.append({
                "filename": file_path.name,
                "url": f"/uploads/{file_path.name}",
                "size": stat.st_size,
                "created_at": datetime.fromtimestamp(stat.st_ctime).isoformat(),
                "type": "image"
            })
    
    # Sort by creation time, newest first
    media_files.sort(key=lambda x: x["created_at"], reverse=True)
    
    return {"items": media_files}


@router.delete("/media/{filename}", status_code=204)
async def delete_media(
    filename: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Delete an uploaded media file"""
    print(f"DEBUG: Delete media request received for filename: {filename}")
    print(f"DEBUG: Current user: {current_user.email}, role: {current_user.role}")
    
    # Sanitize filename to prevent directory traversal
    if "/" in filename or "\\" in filename or filename.startswith("."):
        print(f"DEBUG: Invalid filename: {filename}")
        raise HTTPException(status_code=400, detail="Invalid filename")
    
    # Use configured upload directory
    from app.core.config import settings
    uploads_dir = Path(settings.UPLOAD_DIR)
    file_path = uploads_dir / filename
    
    print(f"DEBUG: Upload dir: {uploads_dir}")
    print(f"DEBUG: File path: {file_path}")
    
    # Verify file exists and is in uploads directory
    try:
        file_path = file_path.resolve()
        uploads_dir = uploads_dir.resolve()
        
        print(f"DEBUG: Resolved file path: {file_path}")
        print(f"DEBUG: Resolved uploads dir: {uploads_dir}")
        print(f"DEBUG: File exists: {file_path.exists()}")
        
        # Ensure file is within uploads directory
        if not str(file_path).startswith(str(uploads_dir)):
            print(f"DEBUG: File path security check failed")
            raise HTTPException(status_code=400, detail="Invalid file path")
        
        if not file_path.exists():
            print(f"DEBUG: File not found at {file_path}")
            raise HTTPException(status_code=404, detail="File not found")
        
        # Delete the file
        print(f"DEBUG: Attempting to delete file: {file_path}")
        file_path.unlink()
        print(f"DEBUG: File deleted successfully")
        return None
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete file: {str(e)}")
