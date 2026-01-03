"""
Site Settings API endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.api.dependencies import get_current_user
from app.models.models import User, UserRole
from app.models.site_settings_models import SiteSettings
from app.schemas.site_settings_schemas import (
    SiteSettingsUpdate,
    SiteSettingsResponse,
    MaintenanceModeResponse
)

router = APIRouter()


async def get_or_create_settings(db: AsyncSession) -> SiteSettings:
    """Get existing settings or create default ones"""
    result = await db.execute(select(SiteSettings).limit(1))
    settings = result.scalar_one_or_none()
    
    if not settings:
        settings = SiteSettings()
        db.add(settings)
        await db.commit()
        await db.refresh(settings)
    
    return settings


@router.get("/", response_model=SiteSettingsResponse)
async def get_site_settings(
    db: AsyncSession = Depends(get_db)
):
    """Get current site settings (public endpoint for maintenance check)"""
    settings = await get_or_create_settings(db)
    return settings


@router.get("/maintenance", response_model=MaintenanceModeResponse)
async def check_maintenance_mode(
    db: AsyncSession = Depends(get_db)
):
    """Check if site is in maintenance mode (public endpoint)"""
    settings = await get_or_create_settings(db)
    return MaintenanceModeResponse(
        maintenance_mode=settings.maintenance_mode,
        message="Site is currently under maintenance. Please check back later." if settings.maintenance_mode else None
    )


@router.put("/", response_model=SiteSettingsResponse)
async def update_site_settings(
    settings_data: SiteSettingsUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update site settings (admin only)"""
    # Check if user is admin
    if current_user.role not in [UserRole.SYSTEM_ADMIN, UserRole.ADMINISTRATOR]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can update site settings"
        )
    
    settings = await get_or_create_settings(db)
    
    # Update settings
    update_data = settings_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(settings, field, value)
    
    await db.commit()
    await db.refresh(settings)
    
    return settings


@router.post("/maintenance/toggle", response_model=MaintenanceModeResponse)
async def toggle_maintenance_mode(
    enable: bool,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Toggle maintenance mode on/off (admin only)"""
    # Check if user is admin
    if current_user.role not in [UserRole.SYSTEM_ADMIN, UserRole.ADMINISTRATOR]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can toggle maintenance mode"
        )
    
    settings = await get_or_create_settings(db)
    settings.maintenance_mode = enable
    
    await db.commit()
    await db.refresh(settings)
    
    return MaintenanceModeResponse(
        maintenance_mode=settings.maintenance_mode,
        message="Maintenance mode enabled. Site visitors will be redirected." if enable else "Maintenance mode disabled. Site is now accessible."
    )
