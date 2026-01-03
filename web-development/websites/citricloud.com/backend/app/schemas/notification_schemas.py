"""
Notification Schemas
Pydantic models for notification API requests/responses
"""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


class NotificationType(str, Enum):
    """Types of notifications"""
    INFO = "info"
    SUCCESS = "success"
    WARNING = "warning"
    ERROR = "error"
    MESSAGE = "message"
    ALERT = "alert"
    SYSTEM = "system"


class NotificationPriority(str, Enum):
    """Notification priority levels"""
    LOW = "low"
    NORMAL = "normal"
    HIGH = "high"
    URGENT = "urgent"


class NotificationBase(BaseModel):
    """Base notification schema"""
    title: str = Field(..., max_length=255)
    message: str
    type: NotificationType = NotificationType.INFO
    priority: NotificationPriority = NotificationPriority.NORMAL
    link: Optional[str] = Field(None, max_length=500)
    icon: Optional[str] = Field(None, max_length=100)
    action_label: Optional[str] = Field(None, max_length=100)
    action_url: Optional[str] = Field(None, max_length=500)
    expires_at: Optional[datetime] = None


class NotificationCreate(NotificationBase):
    """Schema for creating a notification"""
    user_id: Optional[int] = None  # None for broadcast notifications


class NotificationUpdate(BaseModel):
    """Schema for updating a notification"""
    is_read: Optional[bool] = None
    is_archived: Optional[bool] = None


class NotificationResponse(NotificationBase):
    """Schema for notification response"""
    id: int
    user_id: Optional[int]
    is_read: bool
    is_archived: bool
    created_at: datetime
    read_at: Optional[datetime]

    class Config:
        from_attributes = True


class NotificationSettingsBase(BaseModel):
    """Base notification settings schema"""
    email_notifications: bool = True
    push_notifications: bool = True
    sms_notifications: bool = False
    notification_types: Optional[str] = None
    quiet_hours_start: Optional[str] = Field(None, pattern=r'^\d{2}:\d{2}$')
    quiet_hours_end: Optional[str] = Field(None, pattern=r'^\d{2}:\d{2}$')


class NotificationSettingsUpdate(NotificationSettingsBase):
    """Schema for updating notification settings"""
    pass


class NotificationSettingsResponse(NotificationSettingsBase):
    """Schema for notification settings response"""
    id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


class NotificationStats(BaseModel):
    """Notification statistics"""
    total: int
    unread: int
    read: int
    archived: int
    by_type: dict
    by_priority: dict
