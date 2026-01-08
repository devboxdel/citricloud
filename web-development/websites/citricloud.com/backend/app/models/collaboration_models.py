"""
Collaboration models for Teams, Chat, File Sharing, and Activity Feed
"""
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, Enum as SQLEnum, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from enum import Enum
from .models import Base


class TeamRole(str, Enum):
    OWNER = "owner"
    ADMIN = "admin"
    MEMBER = "member"


class Team(Base):
    """Teams for collaboration"""
    __tablename__ = "teams"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    avatar = Column(String(10), default="🚀")  # Emoji avatar
    color = Column(String(50), default="from-blue-500 to-indigo-500")
    is_public = Column(Boolean, default=True)
    
    created_by = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    creator = relationship("User", foreign_keys=[created_by], backref="created_teams")
    members = relationship("TeamMember", back_populates="team", cascade="all, delete-orphan")
    channels = relationship("Channel", back_populates="team", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Team {self.id}: {self.name}>"


class TeamMember(Base):
    """Team membership"""
    __tablename__ = "team_members"

    id = Column(Integer, primary_key=True, index=True)
    team_id = Column(Integer, ForeignKey("teams.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    role = Column(SQLEnum(TeamRole), default=TeamRole.MEMBER, nullable=False)
    is_starred = Column(Boolean, default=False)
    
    joined_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    team = relationship("Team", back_populates="members")
    user = relationship("User", backref="team_memberships")

    def __repr__(self):
        return f"<TeamMember team={self.team_id} user={self.user_id}>"


class Channel(Base):
    """Communication channels within teams"""
    __tablename__ = "channels"

    id = Column(Integer, primary_key=True, index=True)
    team_id = Column(Integer, ForeignKey("teams.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    is_private = Column(Boolean, default=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    team = relationship("Team", back_populates="channels")
    messages = relationship("ChannelMessage", back_populates="channel", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Channel {self.id}: {self.name}>"


class ChannelMessage(Base):
    """Messages in team channels"""
    __tablename__ = "channel_messages"

    id = Column(Integer, primary_key=True, index=True)
    channel_id = Column(Integer, ForeignKey("channels.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    content = Column(Text, nullable=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    channel = relationship("Channel", back_populates="messages")
    user = relationship("User", backref="channel_messages")

    def __repr__(self):
        return f"<ChannelMessage {self.id}>"


class Conversation(Base):
    """Direct message conversations"""
    __tablename__ = "conversations"

    id = Column(Integer, primary_key=True, index=True)
    is_group = Column(Boolean, default=False)
    name = Column(String(255), nullable=True)  # For group chats
    avatar = Column(String(10), nullable=True)  # For group chats
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    participants = relationship("ConversationParticipant", back_populates="conversation", cascade="all, delete-orphan")
    messages = relationship("ChatMessage", back_populates="conversation", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Conversation {self.id}>"


class ConversationParticipant(Base):
    """Participants in conversations"""
    __tablename__ = "conversation_participants"

    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(Integer, ForeignKey("conversations.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    is_starred = Column(Boolean, default=False)
    last_read_at = Column(DateTime(timezone=True), nullable=True)
    
    joined_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    conversation = relationship("Conversation", back_populates="participants")
    user = relationship("User", backref="conversations")

    def __repr__(self):
        return f"<ConversationParticipant {self.id}>"


class ChatMessage(Base):
    """Direct messages in conversations"""
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(Integer, ForeignKey("conversations.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    content = Column(Text, nullable=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    conversation = relationship("Conversation", back_populates="messages")
    user = relationship("User", backref="chat_messages")

    def __repr__(self):
        return f"<ChatMessage {self.id}>"


class SharedFile(Base):
    """Shared files and folders"""
    __tablename__ = "shared_files"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    file_type = Column(String(50), nullable=False)  # PDF, DOCX, etc.
    file_path = Column(String(500), nullable=False)  # Path to actual file
    size = Column(Integer, nullable=False)  # Size in bytes
    folder_id = Column(Integer, ForeignKey("shared_folders.id", ondelete="SET NULL"), nullable=True)
    
    owner_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    is_starred = Column(Boolean, default=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    owner = relationship("User", foreign_keys=[owner_id], backref="owned_files")
    folder = relationship("SharedFolder", back_populates="files")
    shares = relationship("FileShare", back_populates="file", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<SharedFile {self.id}: {self.name}>"


class SharedFolder(Base):
    """Folders for organizing shared files"""
    __tablename__ = "shared_folders"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    icon = Column(String(10), default="📁")
    color = Column(String(50), default="from-blue-500 to-indigo-500")
    is_shared = Column(Boolean, default=True)
    
    created_by = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    creator = relationship("User", foreign_keys=[created_by], backref="created_folders")
    files = relationship("SharedFile", back_populates="folder", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<SharedFolder {self.id}: {self.name}>"


class FileShare(Base):
    """File sharing permissions"""
    __tablename__ = "file_shares"

    id = Column(Integer, primary_key=True, index=True)
    file_id = Column(Integer, ForeignKey("shared_files.id", ondelete="CASCADE"), nullable=False)
    shared_with_user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    shared_with_team_id = Column(Integer, ForeignKey("teams.id", ondelete="CASCADE"), nullable=True)
    
    can_edit = Column(Boolean, default=False)
    can_delete = Column(Boolean, default=False)
    
    shared_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    file = relationship("SharedFile", back_populates="shares")
    shared_with_user = relationship("User", foreign_keys=[shared_with_user_id])
    shared_with_team = relationship("Team", foreign_keys=[shared_with_team_id])

    def __repr__(self):
        return f"<FileShare {self.id}>"


class ActivityType(str, Enum):
    FILE_UPLOAD = "file_upload"
    FILE_DOWNLOAD = "file_download"
    FILE_EDIT = "file_edit"
    FILE_DELETE = "file_delete"
    FILE_SHARE = "file_share"
    COMMENT = "comment"
    TEAM_CREATE = "team_create"
    TEAM_JOIN = "team_join"
    TEAM_LEAVE = "team_leave"
    CHANNEL_CREATE = "channel_create"
    TASK_CREATE = "task_create"
    TASK_COMPLETE = "task_complete"
    MESSAGE_SEND = "message_send"
    USER_LOGIN = "user_login"
    USER_LOGOUT = "user_logout"
    SYSTEM_BACKUP = "system_backup"


class ActivityLog(Base):
    """Activity feed logging"""
    __tablename__ = "activity_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True)  # Null for system activities
    activity_type = Column(SQLEnum(ActivityType), nullable=False)
    action = Column(String(255), nullable=False)  # Human-readable action
    target = Column(String(255), nullable=False)  # Target of the action
    extra_data = Column(JSON, nullable=True)  # Additional data
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False, index=True)

    # Relationships
    user = relationship("User", backref="activities")

    def __repr__(self):
        return f"<ActivityLog {self.id}: {self.activity_type}>"
