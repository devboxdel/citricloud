"""
Message models for CRM messaging system
"""
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from enum import Enum
from .models import Base


class MessagePriority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"


class MessageStatus(str, Enum):
    UNREAD = "unread"
    READ = "read"
    ARCHIVED = "archived"


class Message(Base):
    """Messages sent from roles/admins to users"""
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    sender_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    recipient_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    subject = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    
    priority = Column(SQLEnum(MessagePriority), default=MessagePriority.MEDIUM, nullable=False)
    status = Column(String(20), default=MessageStatus.UNREAD.value, nullable=False)
    
    # Metadata
    read_at = Column(DateTime(timezone=True), nullable=True)
    archived_at = Column(DateTime(timezone=True), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    sender = relationship("User", foreign_keys=[sender_id], backref="sent_messages")
    recipient = relationship("User", foreign_keys=[recipient_id], backref="received_messages")

    def __repr__(self):
        return f"<Message {self.id}: {self.subject}>"
