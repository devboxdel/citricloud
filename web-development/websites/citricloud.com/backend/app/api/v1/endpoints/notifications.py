"""
Notification API Endpoints
RESTful API for notification management
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import and_, or_, func, select, update
from typing import List, Optional
from datetime import datetime

from app.api.dependencies import get_db, get_current_user
from app.models.models import User
from app.models.notification_models import Notification, NotificationSetting, NotificationType, NotificationPriority
from app.schemas.notification_schemas import (
    NotificationCreate,
    NotificationUpdate,
    NotificationResponse,
    NotificationSettingsUpdate,
    NotificationSettingsResponse,
    NotificationStats
)

router = APIRouter()


@router.get("/", response_model=List[NotificationResponse])
async def get_notifications(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    unread_only: bool = Query(False),
    type: Optional[NotificationType] = None,
    priority: Optional[NotificationPriority] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get user notifications with filtering and pagination
    """
    filters = [
        Notification.user_id == current_user.id,
        Notification.is_archived == False,
        or_(
            Notification.expires_at.is_(None),
            Notification.expires_at > datetime.utcnow()
        )
    ]
    
    if unread_only:
        filters.append(Notification.is_read == False)
    
    if type:
        filters.append(Notification.type == type)
    
    if priority:
        filters.append(Notification.priority == priority)
    
    query = select(Notification).where(and_(*filters)).order_by(
        Notification.priority.desc(),
        Notification.created_at.desc()
    ).offset(skip).limit(limit)
    
    result = await db.execute(query)
    notifications = result.scalars().all()
    
    return notifications


@router.get("/count")
async def get_notification_count(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get count of unread notifications
    """
    query = select(func.count(Notification.id)).where(
        and_(
            Notification.user_id == current_user.id,
            Notification.is_read == False,
            Notification.is_archived == False,
            or_(
                Notification.expires_at.is_(None),
                Notification.expires_at > datetime.utcnow()
            )
        )
    )
    
    result = await db.execute(query)
    count = result.scalar_one()
    
    return {"unread_count": count}


@router.get("/stats", response_model=NotificationStats)
async def get_notification_stats(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get notification statistics for current user
    """
    base_query = select(Notification).where(Notification.user_id == current_user.id)
    
    # Get total count
    total_result = await db.execute(select(func.count(Notification.id)).where(Notification.user_id == current_user.id))
    total = total_result.scalar_one()
    
    # Get unread count
    unread_result = await db.execute(select(func.count(Notification.id)).where(and_(Notification.user_id == current_user.id, Notification.is_read == False)))
    unread = unread_result.scalar_one()
    
    # Get read count
    read_result = await db.execute(select(func.count(Notification.id)).where(and_(Notification.user_id == current_user.id, Notification.is_read == True)))
    read = read_result.scalar_one()
    
    # Get archived count
    archived_result = await db.execute(select(func.count(Notification.id)).where(and_(Notification.user_id == current_user.id, Notification.is_archived == True)))
    archived = archived_result.scalar_one()
    
    # Count by type
    by_type = {}
    for notification_type in NotificationType:
        type_result = await db.execute(select(func.count(Notification.id)).where(and_(Notification.user_id == current_user.id, Notification.type == notification_type)))
        count = type_result.scalar_one()
        by_type[notification_type.value] = count
    
    # Count by priority
    by_priority = {}
    for priority in NotificationPriority:
        priority_result = await db.execute(select(func.count(Notification.id)).where(and_(Notification.user_id == current_user.id, Notification.priority == priority)))
        count = priority_result.scalar_one()
        by_priority[priority.value] = count
    
    return {
        "total": total,
        "unread": unread,
        "read": read,
        "archived": archived,
        "by_type": by_type,
        "by_priority": by_priority
    }


@router.get("/{notification_id}", response_model=NotificationResponse)
async def get_notification(
    notification_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get a specific notification by ID
    """
    query = select(Notification).where(
        and_(
            Notification.id == notification_id,
            Notification.user_id == current_user.id
        )
    )
    
    result = await db.execute(query)
    notification = result.scalar_one_or_none()
    
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    return notification


@router.post("/", response_model=NotificationResponse, status_code=201)
async def create_notification(
    notification: NotificationCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Create a new notification (admin only for now)
    """
    db_notification = Notification(
        user_id=notification.user_id or current_user.id,
        title=notification.title,
        message=notification.message,
        type=notification.type,
        priority=notification.priority,
        link=notification.link,
        icon=notification.icon,
        action_label=notification.action_label,
        action_url=notification.action_url,
        expires_at=notification.expires_at
    )
    
    db.add(db_notification)
    await db.commit()
    await db.refresh(db_notification)
    
    return db_notification


@router.patch("/{notification_id}", response_model=NotificationResponse)
async def update_notification(
    notification_id: int,
    notification_update: NotificationUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Update a notification (mark as read/archived)
    """
    query = select(Notification).where(
        and_(
            Notification.id == notification_id,
            Notification.user_id == current_user.id
        )
    )
    
    result = await db.execute(query)
    notification = result.scalar_one_or_none()
    
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    if notification_update.is_read is not None:
        notification.is_read = notification_update.is_read
        if notification_update.is_read and not notification.read_at:
            notification.read_at = datetime.utcnow()
    
    if notification_update.is_archived is not None:
        notification.is_archived = notification_update.is_archived
    
    await db.commit()
    await db.refresh(notification)
    
    return notification


@router.post("/mark-all-read")
async def mark_all_read(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Mark all notifications as read
    """
    stmt = update(Notification).where(
        and_(
            Notification.user_id == current_user.id,
            Notification.is_read == False
        )
    ).values(
        is_read=True,
        read_at=datetime.utcnow()
    )
    
    await db.execute(stmt)
    await db.commit()
    
    return {"message": "All notifications marked as read"}


@router.delete("/{notification_id}")
async def delete_notification(
    notification_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Delete a notification
    """
    query = select(Notification).where(
        and_(
            Notification.id == notification_id,
            Notification.user_id == current_user.id
        )
    )
    
    result = await db.execute(query)
    notification = result.scalar_one_or_none()
    
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    db.delete(notification)
    await db.commit()
    
    return {"message": "Notification deleted successfully"}


@router.get("/settings/me", response_model=NotificationSettingsResponse)
async def get_notification_settings(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get current user's notification settings
    """
    query = select(NotificationSetting).where(NotificationSetting.user_id == current_user.id)
    
    result = await db.execute(query)
    settings = result.scalar_one_or_none()
    
    if not settings:
        settings = NotificationSetting(user_id=current_user.id)
        db.add(settings)
        await db.commit()
        await db.refresh(settings)
    
    return settings


@router.put("/settings/me", response_model=NotificationSettingsResponse)
async def update_notification_settings(
    settings_update: NotificationSettingsUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Update current user's notification settings
    """
    query = select(NotificationSetting).where(NotificationSetting.user_id == current_user.id)
    
    result = await db.execute(query)
    settings = result.scalar_one_or_none()
    
    if not settings:
        settings = NotificationSetting(user_id=current_user.id)
        db.add(settings)
    
    # Update fields
    for field, value in settings_update.dict(exclude_unset=True).items():
        setattr(settings, field, value)
    
    settings.updated_at = datetime.utcnow()
    await db.commit()
    await db.refresh(settings)
    
    return settings
