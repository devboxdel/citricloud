"""
Notification Models
Comprehensive notification system for user alerts and messages
"""
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import enum


class NotificationType(str, enum.Enum):
    """Types of notifications"""
    INFO = "info"
    SUCCESS = "success"
    WARNING = "warning"
    ERROR = "error"
    MESSAGE = "message"
    ALERT = "alert"
    SYSTEM = "system"


class NotificationPriority(str, enum.Enum):
    """Notification priority levels"""
    LOW = "low"
    NORMAL = "normal"
    HIGH = "high"
    URGENT = "urgent"


class Notification(Base):
    """Notification model for user alerts"""
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    type = Column(Enum(NotificationType), default=NotificationType.INFO)
    priority = Column(Enum(NotificationPriority), default=NotificationPriority.NORMAL)
    link = Column(String(500), nullable=True)
    icon = Column(String(100), nullable=True)
    is_read = Column(Boolean, default=False, index=True)
    is_archived = Column(Boolean, default=False, index=True)
    action_label = Column(String(100), nullable=True)
    action_url = Column(String(500), nullable=True)
    expires_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    read_at = Column(DateTime, nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="notifications")

    def __repr__(self):
        return f"<Notification(id={self.id}, user_id={self.user_id}, title={self.title}, is_read={self.is_read})>"


class NotificationSetting(Base):
    """User notification preferences"""
    __tablename__ = "notification_settings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    email_notifications = Column(Boolean, default=True)
    push_notifications = Column(Boolean, default=True)
    sms_notifications = Column(Boolean, default=False)
    order_updates = Column(Boolean, default=True)
    notification_types = Column(Text, nullable=True)  # JSON array of enabled types
    quiet_hours_start = Column(String(5), nullable=True)  # HH:MM format
    quiet_hours_end = Column(String(5), nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="notification_settings")

    def __repr__(self):
        return f"<NotificationSetting(user_id={self.user_id})>"
