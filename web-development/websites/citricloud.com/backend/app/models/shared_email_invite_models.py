"""
Shared Email Invite models for pending member invitations
"""
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Index, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

from app.core.database import Base


class InviteStatus(str, enum.Enum):
    """Status of shared email invite"""
    PENDING = "pending"
    ACCEPTED = "accepted"
    DECLINED = "declined"
    EXPIRED = "expired"


class SharedEmailInvite(Base):
    """Pending invites for shared email membership"""
    __tablename__ = "shared_email_invites"

    id = Column(Integer, primary_key=True, index=True)
    
    # Invite details
    shared_email_id = Column(Integer, ForeignKey("shared_emails.id", ondelete="CASCADE"), nullable=False, index=True)
    invited_user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    invited_by_user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    # Status
    status = Column(String(50), default=InviteStatus.PENDING.value, nullable=False, index=True)
    
    # Notification
    notification_id = Column(Integer, ForeignKey("notifications.id", ondelete="SET NULL"), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    responded_at = Column(DateTime, nullable=True)
    expires_at = Column(DateTime, nullable=True)
    
    # Relationships
    shared_email = relationship("SharedEmail")
    invited_user = relationship("User", foreign_keys=[invited_user_id])
    invited_by = relationship("User", foreign_keys=[invited_by_user_id])
    notification = relationship("Notification")
    
    # Indexes
    __table_args__ = (
        Index('ix_invite_status', 'status'),
        Index('ix_invite_user_status', 'invited_user_id', 'status'),
    )
    
    def __repr__(self):
        return f"<SharedEmailInvite(id={self.id}, user={self.invited_user_id}, status={self.status})>"
