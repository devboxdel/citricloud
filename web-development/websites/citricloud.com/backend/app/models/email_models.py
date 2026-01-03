from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey, Enum as SQLEnum, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime
import enum

from app.core.database import Base


class EmailStatus(str, enum.Enum):
    """Email status enumeration"""
    DRAFT = "DRAFT"
    SENT = "SENT"
    DELIVERED = "DELIVERED"
    FAILED = "FAILED"
    RECEIVED = "RECEIVED"


class EmailFolder(str, enum.Enum):
    """Email folder enumeration"""
    INBOX = "INBOX"
    SENT = "SENT"
    DRAFTS = "DRAFTS"
    TRASH = "TRASH"
    SPAM = "SPAM"
    ARCHIVE = "ARCHIVE"


class Email(Base):
    """Email model for storing user emails"""
    __tablename__ = "emails"

    id = Column(Integer, primary_key=True, index=True)
    
    # User relationship
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Email fields
    from_address = Column(String(255), nullable=False, index=True)
    to_addresses = Column(JSON, nullable=False)  # List of email addresses
    cc_addresses = Column(JSON, nullable=True)  # List of CC email addresses
    bcc_addresses = Column(JSON, nullable=True)  # List of BCC email addresses
    
    subject = Column(String(500), nullable=False)
    body_text = Column(Text, nullable=True)
    body_html = Column(Text, nullable=True)
    snippet = Column(String(200), nullable=True)  # First 200 chars for preview
    
    # Status and folder
    status = Column(SQLEnum(EmailStatus), default=EmailStatus.DRAFT, nullable=False, index=True)
    folder = Column(SQLEnum(EmailFolder), default=EmailFolder.INBOX, nullable=False, index=True)
    
    # Flags
    is_read = Column(Boolean, default=False, nullable=False)
    is_starred = Column(Boolean, default=False, nullable=False)
    is_important = Column(Boolean, default=False, nullable=False)
    
    # Email metadata
    labels = Column(JSON, nullable=True)  # Custom labels/tags
    thread_id = Column(String(100), nullable=True, index=True)  # For conversation grouping
    in_reply_to = Column(Integer, ForeignKey("emails.id"), nullable=True)  # Reply reference
    
    # External email provider IDs
    resend_email_id = Column(String(100), nullable=True, index=True)  # Resend email ID
    external_message_id = Column(String(255), nullable=True)  # Message-ID header
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    sent_at = Column(DateTime(timezone=True), nullable=True)
    delivered_at = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="emails")
    attachments = relationship("EmailAttachment", back_populates="email", cascade="all, delete-orphan")
    replies = relationship("Email", backref="parent_email", remote_side=[id])


class EmailAttachment(Base):
    """Email attachment model"""
    __tablename__ = "email_attachments"

    id = Column(Integer, primary_key=True, index=True)
    email_id = Column(Integer, ForeignKey("emails.id", ondelete="CASCADE"), nullable=False)
    
    filename = Column(String(255), nullable=False)
    content_type = Column(String(100), nullable=False)
    size = Column(Integer, nullable=False)  # Size in bytes
    
    # Storage
    file_path = Column(String(500), nullable=True)  # Local file path
    file_url = Column(String(500), nullable=True)  # URL if stored in cloud
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    # Relationships
    email = relationship("Email", back_populates="attachments")


class EmailSignature(Base):
    """User email signature model"""
    __tablename__ = "email_signatures"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True)
    
    signature_html = Column(Text, nullable=False)
    signature_text = Column(Text, nullable=False)
    is_enabled = Column(Boolean, default=True, nullable=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="email_signature")
