"""
Shared Email models for role-based/department-based email management
"""
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Index, Table
from sqlalchemy.orm import relationship
from datetime import datetime

from app.core.database import Base


# Association table for shared email members
shared_email_members = Table(
    'shared_email_members',
    Base.metadata,
    Column('shared_email_id', Integer, ForeignKey('shared_emails.id', ondelete='CASCADE'), primary_key=True),
    Column('user_id', Integer, ForeignKey('users.id', ondelete='CASCADE'), primary_key=True),
    Column('added_at', DateTime, default=datetime.utcnow, nullable=False)
)


class SharedEmail(Base):
    """Shared email model for role-based/department-based mailboxes"""
    __tablename__ = "shared_emails"

    id = Column(Integer, primary_key=True, index=True)
    
    # Creator (admin who created this shared mailbox)
    created_by_user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Email details
    email_name = Column(String(255), nullable=False, unique=True, index=True)  # e.g., "administrator", "crm", "support"
    display_name = Column(String(255), nullable=True)  # e.g., "Administrator Team"
    description = Column(String(500), nullable=True)  # Purpose of the shared mailbox
    
    # Status
    is_active = Column(Boolean, default=True, nullable=False)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    created_by = relationship("User", foreign_keys=[created_by_user_id], back_populates="created_shared_emails")
    members = relationship("User", secondary=shared_email_members, back_populates="shared_emails")
    
    # Indexes
    __table_args__ = (
        Index('ix_shared_emails_created_by', 'created_by_user_id'),
        Index('ix_shared_emails_active', 'is_active'),
    )
    
    def __repr__(self):
        return f"<SharedEmail {self.email_name}@citricloud.com>"
    
    @property
    def full_email(self):
        """Return full email address"""
        return f"{self.email_name}@citricloud.com"
