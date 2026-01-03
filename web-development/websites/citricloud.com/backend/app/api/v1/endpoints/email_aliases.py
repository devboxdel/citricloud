"""
Email Alias API endpoints for CITRICLOUD
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List

from app.core.database import get_db
from app.models.models import User, UserRole
from app.models.email_alias_models import EmailAlias
from app.schemas.email_alias_schemas import (
    EmailAliasCreate,
    EmailAliasUpdate,
    EmailAliasResponse,
    EmailAliasListResponse
)
from app.api.dependencies import get_current_user


router = APIRouter()


@router.post("/", response_model=EmailAliasResponse, status_code=status.HTTP_201_CREATED)
async def create_email_alias(
    alias_data: EmailAliasCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Create a new email alias
    - Maximum 5 aliases for regular users
    - Unlimited for System Admins
    """
    # Check alias limit for non-admin users
    if current_user.role != UserRole.SYSTEM_ADMIN:
        result = await db.execute(
            select(func.count(EmailAlias.id))
            .where(EmailAlias.user_id == current_user.id)
        )
        count = result.scalar()
        
        if count >= 5:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Maximum of 5 email aliases allowed. Please delete an existing alias first."
            )
    
    # Check if alias already exists
    result = await db.execute(
        select(EmailAlias)
        .where(EmailAlias.alias == alias_data.alias)
    )
    existing_alias = result.scalar_one_or_none()
    
    if existing_alias:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Email alias '{alias_data.alias}@citricloud.com' is already taken"
        )
    
    # Create new alias
    new_alias = EmailAlias(
        user_id=current_user.id,
        alias=alias_data.alias,
        display_name=alias_data.display_name,
        description=alias_data.description,
        is_active=True,
        is_verified=True  # Auto-verify since user owns the domain
    )
    
    db.add(new_alias)
    await db.commit()
    await db.refresh(new_alias)
    
    return new_alias


@router.get("/", response_model=EmailAliasListResponse)
async def list_email_aliases(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    List all email aliases for the current user
    """
    result = await db.execute(
        select(EmailAlias)
        .where(EmailAlias.user_id == current_user.id)
        .order_by(EmailAlias.created_at.desc())
    )
    aliases = result.scalars().all()
    
    return EmailAliasListResponse(
        total=len(aliases),
        aliases=aliases
    )


@router.get("/{alias_id}", response_model=EmailAliasResponse)
async def get_email_alias(
    alias_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get a specific email alias
    """
    result = await db.execute(
        select(EmailAlias)
        .where(
            EmailAlias.id == alias_id,
            EmailAlias.user_id == current_user.id
        )
    )
    alias = result.scalar_one_or_none()
    
    if not alias:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Email alias not found"
        )
    
    return alias


@router.patch("/{alias_id}", response_model=EmailAliasResponse)
async def update_email_alias(
    alias_id: int,
    alias_data: EmailAliasUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Update an email alias
    """
    result = await db.execute(
        select(EmailAlias)
        .where(
            EmailAlias.id == alias_id,
            EmailAlias.user_id == current_user.id
        )
    )
    alias = result.scalar_one_or_none()
    
    if not alias:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Email alias not found"
        )
    
    # Update fields
    update_data = alias_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(alias, field, value)
    
    await db.commit()
    await db.refresh(alias)
    
    return alias


@router.delete("/{alias_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_email_alias(
    alias_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Delete an email alias
    """
    result = await db.execute(
        select(EmailAlias)
        .where(
            EmailAlias.id == alias_id,
            EmailAlias.user_id == current_user.id
        )
    )
    alias = result.scalar_one_or_none()
    
    if not alias:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Email alias not found"
        )
    
    await db.delete(alias)
    await db.commit()
    
    return None
