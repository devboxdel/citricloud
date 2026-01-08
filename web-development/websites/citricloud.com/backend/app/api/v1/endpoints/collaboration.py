"""
Collaboration API endpoints: Teams, Messages, File Sharing, Activity Feed
"""
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_, and_, desc
from sqlalchemy.orm import selectinload
from typing import List, Optional
from datetime import datetime, timedelta

from app.core.database import get_db
from app.api.dependencies import get_current_user
from app.models.models import User
from app.models.collaboration_models import (
    Team, TeamMember, Channel, ChannelMessage, Conversation,
    ConversationParticipant, ChatMessage, SharedFile, SharedFolder,
    FileShare, ActivityLog, ActivityType, TeamRole
)
from pydantic import BaseModel

router = APIRouter()


# ==================== SCHEMAS ====================

class TeamCreate(BaseModel):
    name: str
    description: Optional[str] = None
    avatar: str = "🚀"
    color: str = "from-blue-500 to-indigo-500"
    is_public: bool = True


class MessageCreate(BaseModel):
    conversation_id: Optional[int] = None
    recipient_id: Optional[int] = None  # For new conversations
    content: str


class FolderCreate(BaseModel):
    name: str
    icon: str = "📁"
    color: str = "from-blue-500 to-indigo-500"


# ==================== TEAMS ====================

@router.get("/teams")
async def get_teams(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get all teams for the current user"""
    # Get teams where user is a member
    query = select(Team).join(TeamMember).where(
        TeamMember.user_id == current_user.id
    ).options(
        selectinload(Team.members).selectinload(TeamMember.user),
        selectinload(Team.channels)
    ).order_by(Team.created_at.desc())
    
    result = await db.execute(query)
    teams = result.scalars().all()
    
    return {
        "teams": [
            {
                "id": team.id,
                "name": team.name,
                "description": team.description,
                "avatar": team.avatar,
                "color": team.color,
                "members": len(team.members),
                "channels": len(team.channels),
                "isStarred": any(m.is_starred for m in team.members if m.user_id == current_user.id),
                "created_at": team.created_at.isoformat()
            }
            for team in teams
        ]
    }


@router.post("/teams")
async def create_team(
    team_data: TeamCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a new team"""
    team = Team(
        name=team_data.name,
        description=team_data.description,
        avatar=team_data.avatar,
        color=team_data.color,
        is_public=team_data.is_public,
        created_by=current_user.id
    )
    db.add(team)
    await db.flush()
    
    # Add creator as owner
    member = TeamMember(
        team_id=team.id,
        user_id=current_user.id,
        role=TeamRole.OWNER
    )
    db.add(member)
    
    # Create default channels
    general_channel = Channel(
        team_id=team.id,
        name="general",
        description="Team-wide announcements and discussions"
    )
    db.add(general_channel)
    
    # Log activity
    activity = ActivityLog(
        user_id=current_user.id,
        activity_type=ActivityType.TEAM_CREATE,
        action="created a new team",
        target=team.name
    )
    db.add(activity)
    
    await db.commit()
    await db.refresh(team)
    
    return {"id": team.id, "name": team.name, "message": "Team created successfully"}


@router.get("/teams/{team_id}")
async def get_team_details(
    team_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get team details"""
    query = select(Team).where(Team.id == team_id).options(
        selectinload(Team.members).selectinload(TeamMember.user),
        selectinload(Team.channels)
    )
    result = await db.execute(query)
    team = result.scalar_one_or_none()
    
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    
    # Check if user is member
    is_member = any(m.user_id == current_user.id for m in team.members)
    if not is_member:
        raise HTTPException(status_code=403, detail="Not a member of this team")
    
    # Get unread message counts per channel
    unread_counts = {}
    for channel in team.channels:
        member = next(m for m in team.members if m.user_id == current_user.id)
        last_read = member.joined_at  # Simplified - you'd track this per channel
        
        unread_query = select(func.count(ChannelMessage.id)).where(
            and_(
                ChannelMessage.channel_id == channel.id,
                ChannelMessage.created_at > last_read,
                ChannelMessage.user_id != current_user.id
            )
        )
        unread_result = await db.execute(unread_query)
        unread_counts[channel.id] = unread_result.scalar() or 0
    
    return {
        "id": team.id,
        "name": team.name,
        "description": team.description,
        "avatar": team.avatar,
        "color": team.color,
        "members": [
            {
                "id": m.user.id,
                "name": m.user.full_name,
                "email": m.user.email,
                "role": m.role.value,
                "avatar": m.user.email[0].upper(),  # First letter as placeholder
                "status": "online"  # You'd track this in Redis
            }
            for m in team.members
        ],
        "channels": [
            {
                "id": c.id,
                "name": c.name,
                "description": c.description,
                "is_private": c.is_private,
                "unread": unread_counts.get(c.id, 0)
            }
            for c in team.channels
        ]
    }


# ==================== MESSAGES / CONVERSATIONS ====================

@router.get("/conversations")
async def get_conversations(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get all conversations for current user"""
    query = select(Conversation).join(ConversationParticipant).where(
        ConversationParticipant.user_id == current_user.id
    ).options(
        selectinload(Conversation.participants).selectinload(ConversationParticipant.user),
        selectinload(Conversation.messages).selectinload(ChatMessage.user)
    ).order_by(Conversation.updated_at.desc())
    
    result = await db.execute(query)
    conversations = result.scalars().all()
    
    conv_list = []
    for conv in conversations:
        # Get other participant(s)
        other_participants = [p for p in conv.participants if p.user_id != current_user.id]
        
        # Get last message
        last_message = conv.messages[-1] if conv.messages else None
        
        # Count unread messages
        participant = next(p for p in conv.participants if p.user_id == current_user.id)
        last_read = participant.last_read_at or participant.joined_at
        unread = sum(1 for m in conv.messages if m.created_at > last_read and m.user_id != current_user.id)
        
        if conv.is_group:
            name = conv.name
            avatar = conv.avatar
        elif other_participants:
            other = other_participants[0].user
            name = other.full_name
            avatar = other.email[0].upper()
        else:
            continue
        
        conv_list.append({
            "id": conv.id,
            "name": name,
            "avatar": avatar,
            "lastMessage": last_message.content if last_message else "",
            "time": last_message.created_at.isoformat() if last_message else conv.created_at.isoformat(),
            "unread": unread,
            "status": "online",  # Would track in Redis
            "isGroup": conv.is_group,
            "isStarred": participant.is_starred
        })
    
    return {"conversations": conv_list}


@router.get("/conversations/{conversation_id}/messages")
async def get_messages(
    conversation_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    limit: int = Query(50, le=100)
):
    """Get messages in a conversation"""
    # Verify user is participant
    participant_query = select(ConversationParticipant).where(
        and_(
            ConversationParticipant.conversation_id == conversation_id,
            ConversationParticipant.user_id == current_user.id
        )
    )
    participant_result = await db.execute(participant_query)
    participant = participant_result.scalar_one_or_none()
    
    if not participant:
        raise HTTPException(status_code=403, detail="Not a participant in this conversation")
    
    # Get messages
    query = select(ChatMessage).where(
        ChatMessage.conversation_id == conversation_id
    ).options(
        selectinload(ChatMessage.user)
    ).order_by(ChatMessage.created_at.asc()).limit(limit)
    
    result = await db.execute(query)
    messages = result.scalars().all()
    
    # Mark as read
    participant.last_read_at = datetime.utcnow()
    await db.commit()
    
    return {
        "messages": [
            {
                "id": msg.id,
                "sender": msg.user.full_name,
                "avatar": msg.user.email[0].upper(),
                "content": msg.content,
                "time": msg.created_at.strftime("%I:%M %p"),
                "isSelf": msg.user_id == current_user.id
            }
            for msg in messages
        ]
    }


@router.post("/messages")
async def send_message(
    message_data: MessageCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Send a message"""
    conversation_id = message_data.conversation_id
    
    # If no conversation_id, create new conversation
    if not conversation_id and message_data.recipient_id:
        # Check if conversation already exists
        query = select(Conversation).join(ConversationParticipant).where(
            ConversationParticipant.user_id.in_([current_user.id, message_data.recipient_id])
        ).group_by(Conversation.id).having(func.count(ConversationParticipant.id) == 2)
        
        result = await db.execute(query)
        existing_conv = result.scalar_one_or_none()
        
        if existing_conv:
            conversation_id = existing_conv.id
        else:
            # Create new conversation
            conversation = Conversation(is_group=False)
            db.add(conversation)
            await db.flush()
            
            # Add participants
            for user_id in [current_user.id, message_data.recipient_id]:
                participant = ConversationParticipant(
                    conversation_id=conversation.id,
                    user_id=user_id
                )
                db.add(participant)
            
            conversation_id = conversation.id
    
    if not conversation_id:
        raise HTTPException(status_code=400, detail="No conversation specified")
    
    # Create message
    message = ChatMessage(
        conversation_id=conversation_id,
        user_id=current_user.id,
        content=message_data.content
    )
    db.add(message)
    
    # Update conversation timestamp
    conv_query = select(Conversation).where(Conversation.id == conversation_id)
    conv_result = await db.execute(conv_query)
    conversation = conv_result.scalar_one()
    conversation.updated_at = datetime.utcnow()
    
    # Log activity
    activity = ActivityLog(
        user_id=current_user.id,
        activity_type=ActivityType.MESSAGE_SEND,
        action="sent a message",
        target=f"Conversation {conversation_id}"
    )
    db.add(activity)
    
    await db.commit()
    await db.refresh(message)
    
    return {
        "id": message.id,
        "conversation_id": conversation_id,
        "message": "Message sent successfully"
    }


# ==================== FILE SHARING ====================

@router.get("/folders")
async def get_folders(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get all shared folders"""
    query = select(SharedFolder).options(
        selectinload(SharedFolder.files)
    ).order_by(SharedFolder.created_at.desc())
    
    result = await db.execute(query)
    folders = result.scalars().all()
    
    return {
        "folders": [
            {
                "id": folder.id,
                "name": folder.name,
                "icon": folder.icon,
                "color": folder.color,
                "files": len(folder.files),
                "shared": folder.is_shared
            }
            for folder in folders
        ]
    }


@router.post("/folders")
async def create_folder(
    folder_data: FolderCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a new folder"""
    folder = SharedFolder(
        name=folder_data.name,
        icon=folder_data.icon,
        color=folder_data.color,
        created_by=current_user.id
    )
    db.add(folder)
    await db.commit()
    await db.refresh(folder)
    
    return {"id": folder.id, "name": folder.name}


@router.get("/files")
async def get_files(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    folder_id: Optional[int] = None
):
    """Get shared files"""
    query = select(SharedFile).options(
        selectinload(SharedFile.owner),
        selectinload(SharedFile.shares)
    ).order_by(SharedFile.updated_at.desc())
    
    if folder_id:
        query = query.where(SharedFile.folder_id == folder_id)
    
    result = await db.execute(query)
    files = result.scalars().all()
    
    def format_size(bytes):
        for unit in ['B', 'KB', 'MB', 'GB']:
            if bytes < 1024:
                return f"{bytes:.1f} {unit}"
            bytes /= 1024
        return f"{bytes:.1f} TB"
    
    def time_ago(dt):
        now = datetime.utcnow()
        diff = now - dt
        if diff.days > 0:
            return f"{diff.days} day{'s' if diff.days > 1 else ''} ago"
        hours = diff.seconds // 3600
        if hours > 0:
            return f"{hours} hour{'s' if hours > 1 else ''} ago"
        minutes = (diff.seconds % 3600) // 60
        return f"{minutes} minute{'s' if minutes > 1 else ''} ago" if minutes > 0 else "just now"
    
    return {
        "files": [
            {
                "id": file.id,
                "name": file.name,
                "type": file.file_type,
                "size": format_size(file.size),
                "modified": time_ago(file.updated_at),
                "owner": file.owner.full_name,
                "ownerAvatar": file.owner.email[0].upper(),
                "shared": [s.shared_with_user.full_name for s in file.shares if s.shared_with_user],
                "isStarred": file.is_starred,
                "color": f"text-{file.file_type.lower()}-500"
            }
            for file in files
        ]
    }


# ==================== ACTIVITY FEED ====================

@router.get("/activity")
async def get_activity(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    days: int = Query(7, le=90)
):
    """Get activity feed"""
    since = datetime.utcnow() - timedelta(days=days)
    
    query = select(ActivityLog).where(
        ActivityLog.created_at >= since
    ).options(
        selectinload(ActivityLog.user)
    ).order_by(ActivityLog.created_at.desc()).limit(100)
    
    result = await db.execute(query)
    activities = result.scalars().all()
    
    def time_ago(dt):
        now = datetime.utcnow()
        diff = now - dt
        if diff.days > 0:
            return f"{diff.days} day{'s' if diff.days > 1 else ''} ago"
        hours = diff.seconds // 3600
        if hours > 0:
            return f"{hours} hour{'s' if hours > 1 else ''} ago"
        minutes = (diff.seconds % 3600) // 60
        return f"{minutes} minute{'s' if minutes > 1 else ''} ago" if minutes > 0 else "just now"
    
    # Map activity types to icons and colors
    type_config = {
        ActivityType.FILE_UPLOAD: ("upload", "blue"),
        ActivityType.FILE_DOWNLOAD: ("download", "indigo"),
        ActivityType.FILE_EDIT: ("edit", "orange"),
        ActivityType.FILE_DELETE: ("trash", "red"),
        ActivityType.COMMENT: ("message-square", "green"),
        ActivityType.TEAM_CREATE: ("users", "purple"),
        ActivityType.TEAM_JOIN: ("users", "purple"),
        ActivityType.TASK_COMPLETE: ("check-circle", "green"),
        ActivityType.MESSAGE_SEND: ("message-square", "green"),
    }
    
    return {
        "activities": [
            {
                "id": act.id,
                "user": {
                    "name": act.user.full_name if act.user else "System",
                    "avatar": act.user.email[0].upper() if act.user else "🤖"
                },
                "action": act.action,
                "target": act.target,
                "time": time_ago(act.created_at),
                "icon": type_config.get(act.activity_type, ("activity", "gray"))[0],
                "color": type_config.get(act.activity_type, ("activity", "gray"))[1]
            }
            for act in activities
        ]
    }


@router.get("/activity/stats")
async def get_activity_stats(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get activity statistics"""
    # Total activities
    total_query = select(func.count(ActivityLog.id))
    total_result = await db.execute(total_query)
    total = total_result.scalar()
    
    # Active members (users with activity in last 7 days)
    since = datetime.utcnow() - timedelta(days=7)
    active_query = select(func.count(func.distinct(ActivityLog.user_id))).where(
        ActivityLog.created_at >= since
    )
    active_result = await db.execute(active_query)
    active_members = active_result.scalar()
    
    # Files shared
    files_query = select(func.count(SharedFile.id))
    files_result = await db.execute(files_query)
    files_count = files_result.scalar()
    
    # Messages sent
    messages_query = select(func.count(ChatMessage.id))
    messages_result = await db.execute(messages_query)
    messages_count = messages_result.scalar()
    
    return {
        "total_activities": total,
        "active_members": active_members,
        "files_shared": files_count,
        "messages_sent": messages_count
    }
