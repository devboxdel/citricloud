"""
Email Alias models for user email management
"""
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Index
from sqlalchemy.orm import relationship
from datetime import datetime

from app.core.database import Base


class EmailAlias(Base):
    """Email alias model for users to manage multiple email addresses"""
    __tablename__ = "email_aliases"

    id = Column(Integer, primary_key=True, index=True)
    
    # User relationship
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Alias details
    alias = Column(String(255), nullable=False, unique=True, index=True)  # e.g., "support" for support@citricloud.com
    display_name = Column(String(255), nullable=True)  # Optional display name
    description = Column(String(500), nullable=True)  # Purpose of the alias
    
    # Status
    is_active = Column(Boolean, default=True, nullable=False)
    is_verified = Column(Boolean, default=False, nullable=False)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    verified_at = Column(DateTime, nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="email_aliases")
    
    # Indexes
    __table_args__ = (
        Index('ix_email_aliases_user_active', 'user_id', 'is_active'),
        Index('ix_email_aliases_alias_active', 'alias', 'is_active'),
    )
    
    def __repr__(self):
        return f"<EmailAlias {self.alias}@citricloud.com>"
    
    @property
    def full_email(self):
        """Return full email address"""
        return f"{self.alias}@citricloud.com"
