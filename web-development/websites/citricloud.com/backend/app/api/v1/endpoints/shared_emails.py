"""
Shared Email API endpoints for role-based/department-based email management
"""
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, func
from typing import List
from datetime import datetime, timedelta

from app.core.database import get_db
from app.api.dependencies import get_current_user
from app.models.models import User
from app.models.shared_email_models import SharedEmail, shared_email_members
from app.models.shared_email_invite_models import SharedEmailInvite as InviteModel, InviteStatus
from app.models.notification_models import Notification, NotificationType, NotificationPriority
from app.schemas.shared_email_schemas import (
    SharedEmailCreate,
    SharedEmailUpdate,
    SharedEmailResponse,
    SharedEmailListResponse,
    SharedEmailInvite,
    SharedEmailMemberResponse
)

router = APIRouter()


# ========== Shared Email CRUD Operations ==========

@router.post("/", response_model=SharedEmailResponse, status_code=status.HTTP_201_CREATED)
async def create_shared_email(
    data: SharedEmailCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Create a new shared email group (admin only)
    """
    # Check if user is admin
    if current_user.role not in ["system_admin", "administrator"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can create shared email groups"
        )
    
    # Check if email name already exists
    result = await db.execute(
        select(SharedEmail).where(SharedEmail.email_name == data.email_name.lower())
    )
    existing = result.scalar_one_or_none()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Shared email '{data.email_name}@citricloud.com' already exists"
        )
    
    # Create shared email
    new_shared_email = SharedEmail(
        email_name=data.email_name.lower(),
        display_name=data.display_name,
        description=data.description,
        created_by_user_id=current_user.id,
        is_active=True
    )
    
    db.add(new_shared_email)
    await db.commit()
    await db.refresh(new_shared_email)
    
    # Automatically add creator as a member
    await db.execute(
        shared_email_members.insert().values(
            shared_email_id=new_shared_email.id,
            user_id=current_user.id
        )
    )
    await db.commit()
    
    # Prepare response
    response_data = SharedEmailResponse(
        id=new_shared_email.id,
        email_name=new_shared_email.email_name,
        full_email=new_shared_email.full_email,
        display_name=new_shared_email.display_name,
        description=new_shared_email.description,
        is_active=new_shared_email.is_active,
        created_by_user_id=new_shared_email.created_by_user_id,
        created_at=new_shared_email.created_at,
        updated_at=new_shared_email.updated_at,
        member_count=1,
        members=[]
    )
    
    return response_data


@router.get("/", response_model=SharedEmailListResponse)
async def list_shared_emails(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    List all shared email groups
    """
    # Get all shared emails
    result = await db.execute(
        select(SharedEmail).where(SharedEmail.is_active == True).order_by(SharedEmail.created_at.desc())
    )
    shared_emails = result.scalars().all()
    
    # Build response with member counts
    response_list = []
    for shared_email in shared_emails:
        # Count members
        member_result = await db.execute(
            select(func.count()).select_from(shared_email_members).where(
                shared_email_members.c.shared_email_id == shared_email.id
            )
        )
        member_count = member_result.scalar() or 0
        
        # Get member details
        members_query = await db.execute(
            select(User).join(
                shared_email_members,
                and_(
                    shared_email_members.c.user_id == User.id,
                    shared_email_members.c.shared_email_id == shared_email.id
                )
            )
        )
        members = members_query.scalars().all()
        
        member_list = [
            SharedEmailMemberResponse(
                id=member.id,
                username=member.username,
                full_name=member.full_name,
                email=member.email
            )
            for member in members
        ]
        
        response_list.append(
            SharedEmailResponse(
                id=shared_email.id,
                email_name=shared_email.email_name,
                full_email=shared_email.full_email,
                display_name=shared_email.display_name,
                description=shared_email.description,
                is_active=shared_email.is_active,
                created_by_user_id=shared_email.created_by_user_id,
                created_at=shared_email.created_at,
                updated_at=shared_email.updated_at,
                member_count=member_count,
                members=member_list
            )
        )
    
    return SharedEmailListResponse(
        shared_emails=response_list,
        total=len(response_list)
    )


@router.get("/{shared_email_id}", response_model=SharedEmailResponse)
async def get_shared_email(
    shared_email_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get a specific shared email group
    """
    result = await db.execute(
        select(SharedEmail).where(SharedEmail.id == shared_email_id)
    )
    shared_email = result.scalar_one_or_none()
    
    if not shared_email:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Shared email not found"
        )
    
    # Count members
    member_result = await db.execute(
        select(func.count()).select_from(shared_email_members).where(
            shared_email_members.c.shared_email_id == shared_email.id
        )
    )
    member_count = member_result.scalar() or 0
    
    # Get member details
    members_query = await db.execute(
        select(User).join(
            shared_email_members,
            and_(
                shared_email_members.c.user_id == User.id,
                shared_email_members.c.shared_email_id == shared_email.id
            )
        )
    )
    members = members_query.scalars().all()
    
    member_list = [
        SharedEmailMemberResponse(
            id=member.id,
            username=member.username,
            full_name=member.full_name,
            email=member.email
        )
        for member in members
    ]
    
    return SharedEmailResponse(
        id=shared_email.id,
        email_name=shared_email.email_name,
        full_email=shared_email.full_email,
        display_name=shared_email.display_name,
        description=shared_email.description,
        is_active=shared_email.is_active,
        created_by_user_id=shared_email.created_by_user_id,
        created_at=shared_email.created_at,
        updated_at=shared_email.updated_at,
        member_count=member_count,
        members=member_list
    )


@router.patch("/{shared_email_id}", response_model=SharedEmailResponse)
async def update_shared_email(
    shared_email_id: int,
    data: SharedEmailUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Update a shared email group (admin only)
    """
    if current_user.role not in ["system_admin", "administrator"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can update shared email groups"
        )
    
    result = await db.execute(
        select(SharedEmail).where(SharedEmail.id == shared_email_id)
    )
    shared_email = result.scalar_one_or_none()
    
    if not shared_email:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Shared email not found"
        )
    
    # Update fields
    if data.display_name is not None:
        shared_email.display_name = data.display_name
    if data.description is not None:
        shared_email.description = data.description
    if data.is_active is not None:
        shared_email.is_active = data.is_active
    
    await db.commit()
    await db.refresh(shared_email)
    
    # Get member count and details
    member_result = await db.execute(
        select(func.count()).select_from(shared_email_members).where(
            shared_email_members.c.shared_email_id == shared_email.id
        )
    )
    member_count = member_result.scalar() or 0
    
    members_query = await db.execute(
        select(User).join(
            shared_email_members,
            and_(
                shared_email_members.c.user_id == User.id,
                shared_email_members.c.shared_email_id == shared_email.id
            )
        )
    )
    members = members_query.scalars().all()
    
    member_list = [
        SharedEmailMemberResponse(
            id=member.id,
            username=member.username,
            full_name=member.full_name,
            email=member.email
        )
        for member in members
    ]
    
    return SharedEmailResponse(
        id=shared_email.id,
        email_name=shared_email.email_name,
        full_email=shared_email.full_email,
        display_name=shared_email.display_name,
        description=shared_email.description,
        is_active=shared_email.is_active,
        created_by_user_id=shared_email.created_by_user_id,
        created_at=shared_email.created_at,
        updated_at=shared_email.updated_at,
        member_count=member_count,
        members=member_list
    )


@router.delete("/{shared_email_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_shared_email(
    shared_email_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Delete a shared email group (admin only)
    """
    if current_user.role not in ["system_admin", "administrator"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can delete shared email groups"
        )
    
    result = await db.execute(
        select(SharedEmail).where(SharedEmail.id == shared_email_id)
    )
    shared_email = result.scalar_one_or_none()
    
    if not shared_email:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Shared email not found"
        )
    
    await db.delete(shared_email)
    await db.commit()


# ========== Member Management ==========

@router.post("/{shared_email_id}/members", status_code=status.HTTP_201_CREATED)
async def add_member_to_shared_email(
    shared_email_id: int,
    invite: SharedEmailInvite,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Send an invite to a user to join a shared email group (admin only)
    """
    if current_user.role not in ["system_admin", "administrator"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can invite members to shared email groups"
        )
    
    # Get shared email
    result = await db.execute(
        select(SharedEmail).where(SharedEmail.id == shared_email_id)
    )
    shared_email = result.scalar_one_or_none()
    
    if not shared_email:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Shared email not found"
        )
    
    # Find user by email
    user_result = await db.execute(
        select(User).where(User.email == invite.user_email)
    )
    user = user_result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with email '{invite.user_email}' not found"
        )
    
    # Check if user is already a member
    check_result = await db.execute(
        select(shared_email_members).where(
            and_(
                shared_email_members.c.shared_email_id == shared_email_id,
                shared_email_members.c.user_id == user.id
            )
        )
    )
    existing = check_result.first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User is already a member of this shared email"
        )
    
    # Check for existing pending invite
    pending_invite_result = await db.execute(
        select(InviteModel).where(
            and_(
                InviteModel.shared_email_id == shared_email_id,
                InviteModel.invited_user_id == user.id,
                InviteModel.status == InviteStatus.PENDING.value
            )
        )
    )
    pending_invite = pending_invite_result.scalar_one_or_none()
    
    if pending_invite:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User already has a pending invite for this shared email"
        )
    
    # Create notification
    notification = Notification(
        user_id=user.id,
        title="Shared Email Invitation",
        message=f"You've been invited to join the shared email: {shared_email.full_email}",
        type=NotificationType.INFO,
        priority=NotificationPriority.NORMAL,
        link=f"/profile?tab=notifications",
        action_label="View Invite",
        action_url=f"/api/v1/shared-emails/invites"
    )
    db.add(notification)
    await db.flush()
    
    # Create pending invite
    invite_record = InviteModel(
        shared_email_id=shared_email_id,
        invited_user_id=user.id,
        invited_by_user_id=current_user.id,
        notification_id=notification.id,
        status=InviteStatus.PENDING.value,
        expires_at=datetime.utcnow() + timedelta(days=7)
    )
    db.add(invite_record)
    await db.commit()
    
    return {"message": f"Invitation sent to {invite.user_email} successfully"}


@router.delete("/{shared_email_id}/members/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_member_from_shared_email(
    shared_email_id: int,
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Remove a member from a shared email group (admin only)
    """
    if current_user.role not in ["system_admin", "administrator"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can remove members from shared email groups"
        )
    
    # Check if shared email exists
    result = await db.execute(
        select(SharedEmail).where(SharedEmail.id == shared_email_id)
    )
    shared_email = result.scalar_one_or_none()
    
    if not shared_email:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Shared email not found"
        )
    
    # Remove member
    await db.execute(
        shared_email_members.delete().where(
            and_(
                shared_email_members.c.shared_email_id == shared_email_id,
                shared_email_members.c.user_id == user_id
            )
        )
    )
    await db.commit()


# ========== Invite Management ==========

@router.get("/invites")
async def list_user_invites(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    List all pending invites for the current user
    """
    # Temporarily return empty list to fix the 422 error
    return {"invites": []}


@router.post("/invites/{invite_id}/accept", status_code=status.HTTP_200_OK)
async def accept_invite(
    invite_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Accept a shared email invite
    """
    # Get invite
    result = await db.execute(
        select(InviteModel, SharedEmail).
        join(SharedEmail, InviteModel.shared_email_id == SharedEmail.id).
        where(InviteModel.id == invite_id)
    )
    row = result.first()
    
    if not row:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invite not found"
        )
    
    invite, shared_email = row
    
    # Verify invite is for current user
    if invite.invited_user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This invite is not for you"
        )
    
    # Check if invite is still pending
    if invite.status != InviteStatus.PENDING.value:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invite has already been {invite.status}"
        )
    
    # Check if expired
    if invite.expires_at and invite.expires_at < datetime.utcnow():
        invite.status = InviteStatus.EXPIRED.value
        await db.commit()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invite has expired"
        )
    
    # Check if already a member
    check_result = await db.execute(
        select(shared_email_members).where(
            and_(
                shared_email_members.c.shared_email_id == invite.shared_email_id,
                shared_email_members.c.user_id == current_user.id
            )
        )
    )
    if check_result.first():
        # Mark as accepted anyway
        invite.status = InviteStatus.ACCEPTED.value
        invite.responded_at = datetime.utcnow()
        await db.commit()
        return {"message": "You are already a member of this shared email"}
    
    # Add member
    await db.execute(
        shared_email_members.insert().values(
            shared_email_id=invite.shared_email_id,
            user_id=current_user.id
        )
    )
    
    # Update invite status
    invite.status = InviteStatus.ACCEPTED.value
    invite.responded_at = datetime.utcnow()
    
    # Mark notification as read
    if invite.notification_id:
        notif_result = await db.execute(
            select(Notification).where(Notification.id == invite.notification_id)
        )
        notification = notif_result.scalar_one_or_none()
        if notification:
            notification.is_read = True
            notification.read_at = datetime.utcnow()
    
    await db.commit()
    
    return {
        "message": f"Successfully joined {shared_email.full_email}",
        "shared_email": {
            "id": shared_email.id,
            "email": shared_email.full_email,
            "display_name": shared_email.display_name
        }
    }


@router.post("/invites/{invite_id}/decline", status_code=status.HTTP_200_OK)
async def decline_invite(
    invite_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Decline a shared email invite
    """
    # Get invite
    result = await db.execute(
        select(InviteModel, SharedEmail).
        join(SharedEmail, InviteModel.shared_email_id == SharedEmail.id).
        where(InviteModel.id == invite_id)
    )
    row = result.first()
    
    if not row:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invite not found"
        )
    
    invite, shared_email = row
    
    # Verify invite is for current user
    if invite.invited_user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This invite is not for you"
        )
    
    # Check if invite is still pending
    if invite.status != InviteStatus.PENDING.value:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invite has already been {invite.status}"
        )
    
    # Update invite status
    invite.status = InviteStatus.DECLINED.value
    invite.responded_at = datetime.utcnow()
    
    # Mark notification as read
    if invite.notification_id:
        notif_result = await db.execute(
            select(Notification).where(Notification.id == invite.notification_id)
        )
        notification = notif_result.scalar_one_or_none()
        if notification:
            notification.is_read = True
            notification.read_at = datetime.utcnow()
    
    await db.commit()
    
    return {"message": f"Invite to {shared_email.full_email} declined"}


# ========== Shared Email Messaging with Resend API ==========

@router.get("/{shared_email_id}/messages")
async def get_shared_email_messages(
    shared_email_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get all messages for a shared email inbox
    Members and admins can access
    """
    # Allow admins to access any shared email, otherwise check membership
    if current_user.role not in ["system_admin", "administrator"]:
        # Verify user is a member of this shared email
        result = await db.execute(
            select(shared_email_members).where(
                and_(
                    shared_email_members.c.shared_email_id == shared_email_id,
                    shared_email_members.c.user_id == current_user.id
                )
            )
        )
        
        if not result.first():
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not a member of this shared email"
            )
    
    # For now, return empty list - will be populated when emails are received
    # In production, you would query from a shared_email_messages table
    return {"emails": []}


@router.post("/{shared_email_id}/send")
async def send_shared_email(
    shared_email_id: int,
    data: dict,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Send an email from a shared email address using Resend API
    Members and admins can send
    """
    import os
    import httpx
    import logging
    
    logger = logging.getLogger(__name__)
    logger.info(f"=== SEND EMAIL START: shared_email_id={shared_email_id}, user={current_user.id}")
    logger.info(f"=== DATA RECEIVED: {data}")
    
    # Allow admins to send from any shared email, otherwise check membership
    if current_user.role not in ["system_admin", "administrator"]:
        # Verify user is a member of this shared email
        result = await db.execute(
            select(shared_email_members).where(
                and_(
                    shared_email_members.c.shared_email_id == shared_email_id,
                    shared_email_members.c.user_id == current_user.id
                )
            )
        )
        
        if not result.first():
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not a member of this shared email"
            )
    
    logger.info("=== MEMBERSHIP CHECK PASSED")
    
    # Get shared email details
    email_result = await db.execute(
        select(SharedEmail).where(SharedEmail.id == shared_email_id)
    )
    shared_email = email_result.scalar_one_or_none()
    
    logger.info(f"=== SHARED EMAIL: {shared_email}")
    
    if not shared_email:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Shared email not found"
        )
    
    # Get Resend API key from environment
    resend_api_key = os.getenv("RESEND_API_KEY")
    logger.info(f"=== RESEND_API_KEY present: {bool(resend_api_key)}")
    
    if not resend_api_key:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Email service not configured"
        )
    
    # Send email via Resend API
    try:
        # Get email body safely
        email_body = data.get("body", "")
        if not email_body:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email body cannot be empty"
            )
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://api.resend.com/emails",
                headers={
                    "Authorization": f"Bearer {resend_api_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "from": f"{shared_email.display_name or shared_email.email_name} <{shared_email.full_email}>",
                    "to": [data.get("to")],
                    "subject": data.get("subject", "No Subject"),
                    "html": f"<div style='font-family: sans-serif;'>{email_body.replace(chr(10), '<br>')}</div>",
                    "text": email_body
                },
                timeout=30.0
            )
            
            if response.status_code not in [200, 201]:
                error_detail = response.json() if response.text else "Unknown error"
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Failed to send email: {error_detail}"
                )
            
            email_data = response.json()
            
            # Store sent email in database
            try:
                import json as json_lib
                from sqlalchemy import text
                insert_query = text("""
                    INSERT INTO shared_email_messages 
                    (shared_email_id, resend_email_id, from_address, to_addresses, subject, body_html, body_text, direction, status, created_at)
                    VALUES (:shared_email_id, :resend_email_id, :from_address, :to_addresses, :subject, :body_html, :body_text, :direction, :status, NOW())
                """)
                
                await db.execute(insert_query, {
                    "shared_email_id": shared_email_id,
                    "resend_email_id": email_data.get("id"),
                    "from_address": shared_email.full_email,
                    "to_addresses": json_lib.dumps([data.get("to")]),
                    "subject": data.get("subject", "No Subject"),
                    "body_html": f"<div style='font-family: sans-serif;'>{email_body.replace(chr(10), '<br>')}</div>",
                    "body_text": email_body,
                    "direction": "outbound",
                    "status": "sent"
                })
                await db.commit()
            except Exception as db_error:
                logger.error(f"Failed to store sent email in database: {str(db_error)}")
                # Don't fail the request if database storage fails
            
            return {
                "message": "Email sent successfully",
                "email_id": email_data.get("id"),
                "from": shared_email.full_email,
                "to": data.get("to"),
                "subject": data.get("subject", "No Subject")
            }
            
    except HTTPException:
        raise
    except httpx.HTTPError as e:
        import traceback
        print(f"HTTP Error sending email: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to send email: {str(e)}"
        )
    except Exception as e:
        import traceback
        print(f"Unexpected error sending email: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Unexpected error: {str(e)}"
        )


@router.post("/{shared_email_id}/send-batch")
async def send_batch_emails(
    shared_email_id: int,
    emails: List[dict],
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Send multiple emails at once from a shared email address using Resend API
    Members and admins can send
    """
    import os
    import httpx
    
    # Allow admins to send from any shared email, otherwise check membership
    if current_user.role not in ["system_admin", "administrator"]:
        result = await db.execute(
            select(shared_email_members).where(
                and_(
                    shared_email_members.c.shared_email_id == shared_email_id,
                    shared_email_members.c.user_id == current_user.id
                )
            )
        )
        
        if not result.first():
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not a member of this shared email"
            )
    
    # Get shared email details
    email_result = await db.execute(
        select(SharedEmail).where(SharedEmail.id == shared_email_id)
    )
    shared_email = email_result.scalar_one_or_none()
    
    if not shared_email:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Shared email not found"
        )
    
    # Get Resend API key
    resend_api_key = os.getenv("RESEND_API_KEY")
    if not resend_api_key:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Email service not configured"
        )
    
    # Prepare batch emails
    batch_emails = []
    for email_data in emails:
        batch_emails.append({
            "from": f"{shared_email.display_name or shared_email.email_name} <{shared_email.full_email}>",
            "to": [email_data.get("to")],
            "subject": email_data.get("subject"),
            "html": f"<div style='font-family: sans-serif;'>{email_data.get('body', '').replace(chr(10), '<br>')}</div>",
            "text": email_data.get("body", "")
        })
    
    # Send batch via Resend API
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://api.resend.com/emails/batch",
                headers={
                    "Authorization": f"Bearer {resend_api_key}",
                    "Content-Type": "application/json"
                },
                json=batch_emails,
                timeout=30.0
            )
            
            if response.status_code not in [200, 201]:
                error_detail = response.json() if response.text else "Unknown error"
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Failed to send batch emails: {error_detail}"
                )
            
            result_data = response.json()
            return {
                "message": "Batch emails sent successfully",
                "data": result_data
            }
            
    except httpx.HTTPError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to send batch emails: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Unexpected error: {str(e)}"
        )


@router.get("/{shared_email_id}/emails")
async def list_sent_emails(
    shared_email_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    List all messages (both sent and received) for this shared email from database
    Members and admins can access
    """
    import logging
    logger = logging.getLogger(__name__)
    
    # Allow admins to access any shared email, otherwise check membership
    if current_user.role not in ["system_admin", "administrator"]:
        result = await db.execute(
            select(shared_email_members).where(
                and_(
                    shared_email_members.c.shared_email_id == shared_email_id,
                    shared_email_members.c.user_id == current_user.id
                )
            )
        )
        
        if not result.first():
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not a member of this shared email"
            )
    
    # Get shared email details
    email_result = await db.execute(
        select(SharedEmail).where(SharedEmail.id == shared_email_id)
    )
    shared_email = email_result.scalar_one_or_none()
    
    if not shared_email:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Shared email not found"
        )
    
    # Query messages from database
    try:
        from sqlalchemy import text
        query = text("""
            SELECT 
                id,
                resend_email_id,
                from_address,
                to_addresses,
                cc_addresses,
                subject,
                body_html,
                body_text,
                direction,
                status,
                is_read,
                folder,
                is_starred,
                created_at,
                received_at
            FROM shared_email_messages
            WHERE shared_email_id = :shared_email_id
            ORDER BY created_at DESC
            LIMIT 100
        """)
        
        result = await db.execute(query, {"shared_email_id": shared_email_id})
        rows = result.fetchall()
        
        # Transform to match Resend API format for frontend compatibility
        messages = []
        for row in rows:
            messages.append({
                "id": row.id,
                "from": row.from_address,
                "to": row.to_addresses if isinstance(row.to_addresses, list) else [row.to_addresses],
                "cc": row.cc_addresses if row.cc_addresses else [],
                "subject": row.subject or "No Subject",
                "html": row.body_html,
                "text": row.body_text,
                "created_at": row.created_at.isoformat() if row.created_at else None,
                "last_event": row.status or "unknown",
                "direction": row.direction,
                "is_read": row.is_read,
                "folder": row.folder or "inbox",
                "is_starred": row.is_starred or False
            })
        
        logger.info(f"=== MESSAGES FROM DATABASE FOR {shared_email.full_email}: {len(messages)}")
        
        return {
            "data": messages,
            "object": "list",
            "has_more": False
        }
        
    except Exception as e:
        import traceback
        logger.error(f"Error fetching messages: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch messages: {str(e)}"
        )


@router.patch("/{shared_email_id}/messages/{message_id}")
async def update_message_metadata(
    shared_email_id: int,
    message_id: int,
    data: dict,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Update email message metadata (folder, starred status, etc.)
    Members and admins can update
    """
    import logging
    from sqlalchemy import text
    
    logger = logging.getLogger(__name__)
    
    # Verify user is member or admin
    if current_user.role not in ["system_admin", "administrator"]:
        result = await db.execute(
            select(shared_email_members).where(
                and_(
                    shared_email_members.c.shared_email_id == shared_email_id,
                    shared_email_members.c.user_id == current_user.id
                )
            )
        )
        
        if not result.first():
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not a member of this shared email"
            )
    
    try:
        # Build UPDATE query dynamically based on provided fields
        update_fields = []
        params = {"message_id": message_id, "shared_email_id": shared_email_id}
        
        if "folder" in data:
            update_fields.append("folder = :folder")
            params["folder"] = data["folder"]
        
        if "is_starred" in data:
            update_fields.append("is_starred = :is_starred")
            params["is_starred"] = data["is_starred"]
        
        if "is_read" in data:
            update_fields.append("is_read = :is_read")
            params["is_read"] = data["is_read"]
        
        if not update_fields:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No valid fields to update"
            )
        
        query = f"""
            UPDATE shared_email_messages 
            SET {', '.join(update_fields)}
            WHERE id = :message_id AND shared_email_id = :shared_email_id
            RETURNING id
        """
        
        result = await db.execute(text(query), params)
        updated_row = result.fetchone()
        await db.commit()
        
        if not updated_row:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Message not found"
            )
        
        logger.info(f"Updated message {message_id} metadata: {data}")
        return {"status": "success", "message_id": message_id}
        
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        logger.error(f"Error updating message metadata: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update message: {str(e)}"
        )


@router.delete("/{shared_email_id}/messages/{message_id}")
async def delete_message(
    shared_email_id: int,
    message_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Permanently delete an email message
    Members and admins can delete
    """
    import logging
    from sqlalchemy import text
    
    logger = logging.getLogger(__name__)
    
    # Verify user is member or admin
    if current_user.role not in ["system_admin", "administrator"]:
        result = await db.execute(
            select(shared_email_members).where(
                and_(
                    shared_email_members.c.shared_email_id == shared_email_id,
                    shared_email_members.c.user_id == current_user.id
                )
            )
        )
        
        if not result.first():
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not a member of this shared email"
            )
    
    try:
        result = await db.execute(
            text("""
                DELETE FROM shared_email_messages 
                WHERE id = :message_id AND shared_email_id = :shared_email_id
                RETURNING id
            """),
            {"message_id": message_id, "shared_email_id": shared_email_id}
        )
        deleted_row = result.fetchone()
        await db.commit()
        
        if not deleted_row:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Message not found"
            )
        
        logger.info(f"Permanently deleted message {message_id}")
        return {"status": "success", "message": "Message permanently deleted"}
        
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        logger.error(f"Error deleting message: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete message: {str(e)}"
        )


@router.get("/{shared_email_id}/emails/{email_id}")
async def get_email_details(
    shared_email_id: int,
    email_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Retrieve details of a specific email from Resend
    Members and admins can access
    """
    import os
    import httpx
    
    # Allow admins to access any shared email, otherwise check membership
    if current_user.role not in ["system_admin", "administrator"]:
        result = await db.execute(
            select(shared_email_members).where(
                and_(
                    shared_email_members.c.shared_email_id == shared_email_id,
                    shared_email_members.c.user_id == current_user.id
                )
            )
        )
        
        if not result.first():
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not a member of this shared email"
            )
    
    # Get Resend API key
    resend_api_key = os.getenv("RESEND_API_KEY")
    if not resend_api_key:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Email service not configured"
        )
    
    # Get email via Resend API
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"https://api.resend.com/emails/{email_id}",
                headers={
                    "Authorization": f"Bearer {resend_api_key}"
                },
                timeout=30.0
            )
            
            if response.status_code != 200:
                error_detail = response.json() if response.text else "Unknown error"
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Email not found: {error_detail}"
                )
            
            result_data = response.json()
            return result_data
            
    except httpx.HTTPError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve email: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Unexpected error: {str(e)}"
        )


@router.patch("/{shared_email_id}/emails/{email_id}")
async def update_email(
    shared_email_id: int,
    email_id: str,
    update_data: dict,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Update a scheduled email (e.g., change scheduled_at time)
    Members and admins can update
    """
    import os
    import httpx
    
    # Allow admins to update any shared email, otherwise check membership
    if current_user.role not in ["system_admin", "administrator"]:
        result = await db.execute(
            select(shared_email_members).where(
                and_(
                    shared_email_members.c.shared_email_id == shared_email_id,
                    shared_email_members.c.user_id == current_user.id
                )
            )
        )
        
        if not result.first():
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not a member of this shared email"
            )
    
    # Get Resend API key
    resend_api_key = os.getenv("RESEND_API_KEY")
    if not resend_api_key:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Email service not configured"
        )
    
    # Update email via Resend API
    try:
        async with httpx.AsyncClient() as client:
            response = await client.patch(
                f"https://api.resend.com/emails/{email_id}",
                headers={
                    "Authorization": f"Bearer {resend_api_key}",
                    "Content-Type": "application/json"
                },
                json=update_data,
                timeout=30.0
            )
            
            if response.status_code not in [200, 204]:
                error_detail = response.json() if response.text else "Unknown error"
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Failed to update email: {error_detail}"
                )
            
            return {
                "message": "Email updated successfully",
                "email_id": email_id
            }
            
    except httpx.HTTPError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update email: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Unexpected error: {str(e)}"
        )


@router.post("/{shared_email_id}/emails/{email_id}/cancel")
async def cancel_email(
    shared_email_id: int,
    email_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Cancel a scheduled email
    Members and admins can cancel
    """
    import os
    import httpx
    
    # Allow admins to cancel from any shared email, otherwise check membership
    if current_user.role not in ["system_admin", "administrator"]:
        result = await db.execute(
            select(shared_email_members).where(
                and_(
                    shared_email_members.c.shared_email_id == shared_email_id,
                    shared_email_members.c.user_id == current_user.id
                )
            )
        )
        
        if not result.first():
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not a member of this shared email"
            )
    
    # Get Resend API key
    resend_api_key = os.getenv("RESEND_API_KEY")
    if not resend_api_key:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Email service not configured"
        )
    
    # Cancel email via Resend API
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"https://api.resend.com/emails/{email_id}/cancel",
                headers={
                    "Authorization": f"Bearer {resend_api_key}"
                },
                timeout=30.0
            )
            
            if response.status_code not in [200, 204]:
                error_detail = response.json() if response.text else "Unknown error"
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Failed to cancel email: {error_detail}"
                )
            
            return {
                "message": "Email cancelled successfully",
                "email_id": email_id
            }
            
    except httpx.HTTPError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to cancel email: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Unexpected error: {str(e)}"
        )


@router.get("/{shared_email_id}/emails/{email_id}/attachments")
async def list_email_attachments(
    shared_email_id: int,
    email_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    List attachments for a specific email
    Members and admins can access
    """
    import os
    import httpx
    
    # Allow admins to access any shared email, otherwise check membership
    if current_user.role not in ["system_admin", "administrator"]:
        result = await db.execute(
            select(shared_email_members).where(
                and_(
                    shared_email_members.c.shared_email_id == shared_email_id,
                    shared_email_members.c.user_id == current_user.id
                )
            )
        )
        
        if not result.first():
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not a member of this shared email"
            )
    
    # Get Resend API key
    resend_api_key = os.getenv("RESEND_API_KEY")
    if not resend_api_key:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Email service not configured"
        )
    
    # List attachments via Resend API
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"https://api.resend.com/emails/{email_id}/attachments",
                headers={
                    "Authorization": f"Bearer {resend_api_key}"
                },
                timeout=30.0
            )
            
            if response.status_code != 200:
                error_detail = response.json() if response.text else "Unknown error"
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Attachments not found: {error_detail}"
                )
            
            result_data = response.json()
            return result_data
            
    except httpx.HTTPError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to list attachments: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Unexpected error: {str(e)}"
        )


@router.get("/{shared_email_id}/emails/{email_id}/attachments/{attachment_id}")
async def get_email_attachment(
    shared_email_id: int,
    email_id: str,
    attachment_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Retrieve a specific attachment from an email
    Members and admins can access
    """
    import os
    import httpx
    
    # Allow admins to access any shared email, otherwise check membership
    if current_user.role not in ["system_admin", "administrator"]:
        result = await db.execute(
            select(shared_email_members).where(
                and_(
                    shared_email_members.c.shared_email_id == shared_email_id,
                    shared_email_members.c.user_id == current_user.id
                )
            )
        )
        
        if not result.first():
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not a member of this shared email"
            )
    
    # Get Resend API key
    resend_api_key = os.getenv("RESEND_API_KEY")
    if not resend_api_key:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Email service not configured"
        )
    
    # Get attachment via Resend API
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"https://api.resend.com/emails/{email_id}/attachments/{attachment_id}",
                headers={
                    "Authorization": f"Bearer {resend_api_key}"
                },
                timeout=30.0
            )
            
            if response.status_code != 200:
                error_detail = response.json() if response.text else "Unknown error"
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Attachment not found: {error_detail}"
                )
            
            result_data = response.json()
            return result_data
            
    except httpx.HTTPError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve attachment: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Unexpected error: {str(e)}"
        )


# ========== Resend Inbound Email Webhook ==========

@router.post("/webhooks/inbound")
async def inbound_email_webhook(
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """
    Webhook endpoint to receive inbound emails from Resend
    Event type: email.received
    This endpoint does not require authentication (webhook from Resend)
    """
    import json as json_lib
    import logging
    from sqlalchemy import text
    import httpx
    import os
    
    logger = logging.getLogger(__name__)
    
    try:
        # Get the webhook payload
        payload = await request.json()
        logger.info(f"Received inbound email webhook: {payload}")
        
        # Check if this is an email.received event
        if payload.get("type") != "email.received":
            logger.info(f"Ignoring non-received event: {payload.get('type')}")
            return {"status": "ignored", "message": "Not an email.received event"}
        
        # Extract email data from Resend webhook format
        email_data = payload.get("data", {})
        
        from_address = email_data.get("from", "")
        to_addresses = email_data.get("to", [])
        subject = email_data.get("subject", "No Subject")
        email_id = email_data.get("email_id")
        created_at_str = email_data.get("created_at")
        
        # Parse timestamp string to datetime
        from dateutil import parser as date_parser
        created_at = date_parser.parse(created_at_str) if created_at_str else None
        
        # Note: Resend webhooks don't include email body/attachments
        # We need to fetch them using the Resend API
        resend_api_key = os.getenv("RESEND_API_KEY")
        
        html_body = None
        text_body = None
        
        try:
            # Fetch email content from Resend API
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"https://api.resend.com/emails/{email_id}",
                    headers={"Authorization": f"Bearer {resend_api_key}"},
                    timeout=10.0
                )
                
                if response.status_code == 200:
                    email_content = response.json()
                    html_body = email_content.get("html")
                    text_body = email_content.get("text")
                else:
                    logger.warning(f"Failed to fetch email content: {response.status_code}")
        except Exception as fetch_error:
            logger.error(f"Error fetching email content: {str(fetch_error)}")
            # Continue without body content
        
        # Determine which shared email this belongs to
        # Check if any TO address matches a shared email
        for recipient in to_addresses:
            # Query shared emails to find match
            result = await db.execute(
                text("""
                    SELECT id, email_name 
                    FROM shared_emails 
                    WHERE :recipient LIKE '%' || email_name || '@citricloud.com%'
                """),
                {"recipient": str(recipient)}
            )
            shared_email_row = result.fetchone()
            
            if shared_email_row:
                shared_email_id = shared_email_row.id
                
                # Insert into shared_email_messages
                await db.execute(
                    text("""
                        INSERT INTO shared_email_messages 
                        (shared_email_id, resend_email_id, from_address, to_addresses, 
                         subject, body_html, body_text, direction, status, created_at, received_at)
                        VALUES (:shared_email_id, :resend_email_id, :from_address, 
                                :to_addresses, :subject, :body_html, :body_text, 
                                :direction, :status, :created_at, :received_at)
                        ON CONFLICT (resend_email_id) DO NOTHING
                    """),
                    {
                        "shared_email_id": shared_email_id,
                        "resend_email_id": email_id,
                        "from_address": from_address,
                        "to_addresses": json_lib.dumps(to_addresses),
                        "subject": subject,
                        "body_html": html_body,
                        "body_text": text_body,
                        "direction": "inbound",
                        "status": "received",
                        "created_at": created_at,
                        "received_at": created_at
                    }
                )
                await db.commit()
                
                logger.info(f"✅ Stored inbound email to {shared_email_row.email_name}: {subject}")
                
                return {"status": "success", "message": "Email stored"}
        
        logger.warning(f"No matching shared email found for recipients: {to_addresses}")
        return {"status": "ignored", "message": "No matching shared email"}
        
    except Exception as e:
        import traceback
        logger.error(f"Error processing inbound webhook: {str(e)}")
        logger.error(traceback.format_exc())
        await db.rollback()
        
        # Return 200 to prevent Resend from retrying
        return {"status": "error", "message": str(e)}

