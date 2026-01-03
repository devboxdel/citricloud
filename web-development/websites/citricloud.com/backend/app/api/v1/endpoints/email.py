"""
Email API endpoints for CITRICLOUD Workspace Email
Handles sending, receiving, and managing emails via Resend
"""
from fastapi import APIRouter, Depends, HTTPException, status, Request, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, and_, func
from typing import List, Optional
from datetime import datetime
import uuid

from app.core.database import get_db
from app.api.dependencies import get_current_user
from app.models.models import User
from app.models.email_models import Email, EmailAttachment, EmailSignature, EmailStatus, EmailFolder
from app.schemas.email_schemas import (
    EmailCreate, EmailDraft, EmailUpdate, EmailResponse, EmailListResponse,
    EmailReply, EmailForward, EmailSignatureCreate, EmailSignatureUpdate, EmailSignatureResponse,
    ResendWebhookEvent, InboundEmailWebhook
)
from app.core.email import send_email
from app.core.config import settings
from app.core.resend_service import resend_service

import resend

router = APIRouter()


def generate_snippet(text: Optional[str], html: Optional[str], max_length: int = 200) -> str:
    """Generate email snippet from text or HTML content"""
    content = text or html or ""
    # Remove HTML tags if HTML
    if html and not text:
        import re
        content = re.sub(r'<[^>]+>', '', html)
    # Truncate and clean
    snippet = content.strip()[:max_length]
    if len(content) > max_length:
        snippet += "..."
    return snippet


# ========== Email CRUD Operations ==========

@router.post("/send", response_model=EmailResponse, status_code=status.HTTP_201_CREATED)
async def send_email_endpoint(
    email_data: EmailCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Send a new email via Resend"""
    try:
        # Import EmailAlias model
        from app.models.email_alias_models import EmailAlias
        
        # Determine sender address (user's alias or default username)
        sender_email = None
        display_name = current_user.full_name or current_user.username
        
        if email_data.from_email:
            # User wants to send from specific alias - validate it belongs to them
            alias_local_part = email_data.from_email.split('@')[0]
            result = await db.execute(
                select(EmailAlias).where(
                    and_(
                        EmailAlias.user_id == current_user.id,
                        EmailAlias.alias == alias_local_part,
                        EmailAlias.is_active == True
                    )
                )
            )
            alias = result.scalar_one_or_none()
            if not alias:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"Email alias '{email_data.from_email}' not found or not active"
                )
            sender_email = alias.full_email
            if alias.display_name:
                display_name = alias.display_name
        else:
            # Use default username@domain
            domain = settings.EMAIL_FROM.split('@')[1]
            sender_email = f"{current_user.username}@{domain}"
        
        # Format sender address with display name
        sender_address = f"{display_name} <{sender_email}>"
        
        # Send via Resend
        resend.api_key = settings.RESEND_API_KEY
        
        # Prepare email data
        email_payload = {
            "from": sender_address,
            "to": email_data.to_addresses,
            "subject": email_data.subject,
        }
        # Add optional fields
        if email_data.cc_addresses:
            email_payload["cc"] = email_data.cc_addresses
        if email_data.bcc_addresses:
            email_payload["bcc"] = email_data.bcc_addresses
        if email_data.body_html:
            email_payload["html"] = email_data.body_html
        if email_data.body_text:
            email_payload["text"] = email_data.body_text
        # Handle attachments (Resend expects list of {filename, content})
        import base64
        attachment_meta: List[EmailAttachment] = []
        if email_data.attachments:
            resend_attachments = []
            for a in email_data.attachments:
                filename = a.get('filename')
                content_type = a.get('content_type') or 'application/octet-stream'
                content_b64 = a.get('content_base64')
                if not filename or not content_b64:
                    continue
                resend_attachments.append({
                    'filename': filename,
                    'content': content_b64
                })
            if resend_attachments:
                email_payload['attachments'] = resend_attachments
        
        # Send email
        response = resend.Emails.send(email_payload)
        
        # Create email record in database
        snippet = generate_snippet(email_data.body_text, email_data.body_html)
        
        new_email = Email(
            user_id=current_user.id,
            from_address=sender_email,
            to_addresses=email_data.to_addresses,
            cc_addresses=email_data.cc_addresses,
            bcc_addresses=email_data.bcc_addresses,
            subject=email_data.subject,
            body_text=email_data.body_text,
            body_html=email_data.body_html,
            snippet=snippet,
            status=EmailStatus.SENT,
            folder=EmailFolder.SENT,
            is_read=True,
            labels=email_data.labels,
            resend_email_id=response.get('id') if response else None,
            sent_at=datetime.utcnow(),
            thread_id=str(uuid.uuid4())  # Generate new thread ID
        )
        
        db.add(new_email)
        await db.commit()
        # Persist attachment metadata
        if email_data.attachments:
            for a in email_data.attachments:
                filename = a.get('filename')
                content_type = a.get('content_type') or 'application/octet-stream'
                content_b64 = a.get('content_base64')
                if not filename or not content_b64:
                    continue
                size = len(base64.b64decode(content_b64)) if content_b64 else 0
                attachment = EmailAttachment(
                    email_id=new_email.id,
                    filename=filename,
                    content_type=content_type,
                    size=size,
                    file_path=None,
                    file_url=None
                )
                db.add(attachment)
            await db.commit()
        await db.refresh(new_email, attribute_names=['attachments'])
        
        return new_email
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to send email: {str(e)}"
        )


@router.post("/drafts", response_model=EmailResponse, status_code=status.HTTP_201_CREATED)
async def create_draft(
    draft_data: EmailDraft,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Save an email as draft"""
    from_address = f"{current_user.username}@{settings.EMAIL_FROM.split('@')[1]}"
    snippet = generate_snippet(draft_data.body_text, draft_data.body_html)
    
    new_draft = Email(
        user_id=current_user.id,
        from_address=from_address,
        to_addresses=draft_data.to_addresses,
        cc_addresses=draft_data.cc_addresses,
        bcc_addresses=draft_data.bcc_addresses,
        subject=draft_data.subject,
        body_text=draft_data.body_text,
        body_html=draft_data.body_html,
        snippet=snippet,
        status=EmailStatus.DRAFT,
        folder=EmailFolder.DRAFTS,
        is_read=True,
        labels=draft_data.labels,
        thread_id=str(uuid.uuid4())
    )
    
    db.add(new_draft)
    await db.commit()
    await db.refresh(new_draft)
    
    return new_draft


@router.get("/", response_model=List[EmailListResponse])
async def get_emails(
    folder: Optional[EmailFolder] = None,
    is_starred: Optional[bool] = None,
    is_read: Optional[bool] = None,
    search: Optional[str] = None,
    to_address: Optional[str] = None,
    skip: int = 0,
    limit: int = 50,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    background_tasks: BackgroundTasks = BackgroundTasks()
):
    """Get user's emails with filtering - fetches from database and syncs with Resend API"""
    
    # First, sync received emails from Resend API in background
    async def sync_resend_emails():
        try:
            # Fetch received emails from Resend
            result = resend_service.list_received_emails()
            if result["success"] and result.get("data"):
                received_data = result["data"]
                emails_list = received_data.get("data", []) if isinstance(received_data, dict) else received_data
                
                for email_data in emails_list:
                    # Check if email already exists in database
                    external_id = email_data.get("email_id") or email_data.get("id")
                    if external_id:
                        existing = await db.execute(
                            select(Email).where(Email.external_message_id == external_id)
                        )
                        if existing.scalar_one_or_none():
                            continue  # Skip if already in database
                    
                    # Get recipient addresses
                    to_addrs = email_data.get("to", [])
                    if isinstance(to_addrs, str):
                        to_addrs = [to_addrs]
                    
                    recipient_email = to_addrs[0] if to_addrs else None
                    if not recipient_email:
                        continue
                    
                    # Check if this email is for current user or their aliases
                    local_part = recipient_email.split('@')[0] if '@' in recipient_email else None
                    if not local_part:
                        continue
                    
                    # Check if it's user's alias or username
                    user_match = False
                    if current_user.username == local_part:
                        user_match = True
                    else:
                        # Check aliases
                        from app.models.email_alias_models import EmailAlias
                        alias_result = await db.execute(
                            select(EmailAlias).where(
                                and_(
                                    EmailAlias.user_id == current_user.id,
                                    EmailAlias.alias == local_part,
                                    EmailAlias.is_active == True
                                )
                            )
                        )
                        if alias_result.scalar_one_or_none():
                            user_match = True
                    
                    if not user_match:
                        continue
                    
                    # Create email record
                    from_address = email_data.get("from", "")
                    subject = email_data.get("subject", "(No subject)")
                    html = email_data.get("html")
                    text = email_data.get("text")
                    
                    snippet = generate_snippet(text, html)
                    
                    new_email = Email(
                        user_id=current_user.id,
                        from_address=from_address,
                        to_addresses=to_addrs,
                        subject=subject,
                        body_text=text,
                        body_html=html,
                        snippet=snippet,
                        status=EmailStatus.RECEIVED,
                        folder=EmailFolder.INBOX,
                        is_read=False,
                        external_message_id=external_id,
                        thread_id=str(uuid.uuid4()),
                        created_at=datetime.utcnow()
                    )
                    
                    db.add(new_email)
                
                await db.commit()
        except Exception as e:
            print(f"Error syncing Resend emails: {e}")
            import traceback
            traceback.print_exc()
    
    # Sync emails from Resend (don't wait for it to complete)
    background_tasks.add_task(sync_resend_emails)
    
    # Query database emails
    query = select(Email).where(Email.user_id == current_user.id)
    
    # Apply filters
    if folder:
        query = query.where(Email.folder == folder)
    if to_address:
        # Filter by recipient address using JSON containment operator
        from sqlalchemy.dialects.postgresql import JSONB
        from sqlalchemy import cast, literal
        # Convert to_addresses to text and check if it contains the address
        query = query.where(
            cast(Email.to_addresses, String).like(f'%{to_address}%')
        )
    if is_starred is not None:
        query = query.where(Email.is_starred == is_starred)
    if is_read is not None:
        query = query.where(Email.is_read == is_read)
    if search:
        search_term = f"%{search}%"
        query = query.where(
            or_(
                Email.subject.ilike(search_term),
                Email.from_address.ilike(search_term),
                Email.body_text.ilike(search_term)
            )
        )
    
    # Order by date descending
    query = query.order_by(Email.created_at.desc())
    query = query.offset(skip).limit(limit)
    
    result = await db.execute(query)
    emails = result.scalars().all()
    
    # Add has_attachments field
    email_list = []
    for email in emails:
        email_dict = EmailListResponse.model_validate(email).model_dump()
        # Count attachments
        attach_result = await db.execute(
            select(func.count(EmailAttachment.id)).where(EmailAttachment.email_id == email.id)
        )
        email_dict['has_attachments'] = (attach_result.scalar() or 0) > 0
        email_list.append(EmailListResponse(**email_dict))
    
    return email_list


@router.get("/{email_id}", response_model=EmailResponse)
async def get_email(
    email_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get a specific email by ID"""
    result = await db.execute(
        select(Email).where(
            and_(Email.id == email_id, Email.user_id == current_user.id)
        )
    )
    email = result.scalar_one_or_none()
    
    if not email:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Email not found"
        )
    
    # Mark as read if not already
    if not email.is_read:
        email.is_read = True
        await db.commit()
        await db.refresh(email)
    
    return email


@router.patch("/{email_id}", response_model=EmailResponse)
async def update_email(
    email_id: int,
    update_data: EmailUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update email properties (read, starred, folder, etc.)"""
    result = await db.execute(
        select(Email).where(
            and_(Email.id == email_id, Email.user_id == current_user.id)
        )
    )
    email = result.scalar_one_or_none()
    
    if not email:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Email not found"
        )
    
    # Update fields
    update_dict = update_data.model_dump(exclude_unset=True)
    for field, value in update_dict.items():
        setattr(email, field, value)
    
    email.updated_at = datetime.utcnow()
    await db.commit()
    await db.refresh(email)
    
    return email


@router.delete("/{email_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_email(
    email_id: int,
    permanent: bool = False,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete an email (move to trash or permanent delete)"""
    result = await db.execute(
        select(Email).where(
            and_(Email.id == email_id, Email.user_id == current_user.id)
        )
    )
    email = result.scalar_one_or_none()
    
    if not email:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Email not found"
        )
    
    if permanent or email.folder == EmailFolder.TRASH:
        # Permanently delete
        await db.delete(email)
    else:
        # Move to trash
        email.folder = EmailFolder.TRASH
        email.updated_at = datetime.utcnow()
    
    await db.commit()


@router.post("/{email_id}/reply", response_model=EmailResponse)
async def reply_to_email(
    email_id: int,
    reply_data: EmailReply,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Reply to an email"""
    # Get original email
    result = await db.execute(
        select(Email).where(
            and_(Email.id == email_id, Email.user_id == current_user.id)
        )
    )
    original_email = result.scalar_one_or_none()
    
    if not original_email:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Original email not found"
        )
    
    # Create reply email
    user_address = f"{current_user.username}@{settings.EMAIL_FROM.split('@')[1]}"
    sender_address = settings.EMAIL_FROM
    to_addresses = [original_email.from_address]
    subject = f"Re: {original_email.subject}" if not original_email.subject.startswith("Re:") else original_email.subject
    
    # Send via Resend
    try:
        resend.api_key = settings.RESEND_API_KEY

        email_payload = {
            "from": sender_address,
            "to": to_addresses,
            "subject": subject,
            "reply_to": [user_address],
        }
        
        if reply_data.cc_addresses:
            email_payload["cc"] = reply_data.cc_addresses
        if reply_data.body_html:
            email_payload["html"] = reply_data.body_html
        if reply_data.body_text:
            email_payload["text"] = reply_data.body_text
        
        response = resend.Emails.send(email_payload)
        
        # Save reply in database
        snippet = generate_snippet(reply_data.body_text, reply_data.body_html)
        
        reply_email = Email(
            user_id=current_user.id,
            from_address=user_address,
            to_addresses=to_addresses,
            cc_addresses=reply_data.cc_addresses,
            subject=subject,
            body_text=reply_data.body_text,
            body_html=reply_data.body_html,
            snippet=snippet,
            status=EmailStatus.SENT,
            folder=EmailFolder.SENT,
            is_read=True,
            thread_id=original_email.thread_id,  # Same thread
            in_reply_to=email_id,
            resend_email_id=response.get('id') if response else None,
            sent_at=datetime.utcnow()
        )
        
        db.add(reply_email)
        await db.commit()
        await db.refresh(reply_email)
        
        return reply_email
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to send reply: {str(e)}"
        )


@router.post("/{email_id}/forward", response_model=EmailResponse)
async def forward_email(
    email_id: int,
    forward_data: EmailForward,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Forward an email to other recipients"""
    # Get original email
    result = await db.execute(
        select(Email).where(
            and_(Email.id == email_id, Email.user_id == current_user.id)
        )
    )
    original_email = result.scalar_one_or_none()
    
    if not original_email:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Original email not found"
        )
    
    # Create forwarded email
    user_address = f"{current_user.username}@{settings.EMAIL_FROM.split('@')[1]}"
    sender_address = settings.EMAIL_FROM
    subject = f"Fwd: {original_email.subject}" if not original_email.subject.startswith("Fwd:") else original_email.subject
    
    # Combine original content with new message
    body_text = f"{forward_data.body_text or ''}\n\n---------- Forwarded message ----------\nFrom: {original_email.from_address}\nSubject: {original_email.subject}\n\n{original_email.body_text or ''}"
    body_html = f"{forward_data.body_html or ''}<br><br><hr><p><strong>Forwarded message</strong></p><p>From: {original_email.from_address}<br>Subject: {original_email.subject}</p><br>{original_email.body_html or ''}"
    
    # Send via Resend
    try:
        resend.api_key = settings.RESEND_API_KEY

        email_payload = {
            "from": sender_address,
            "to": forward_data.to_addresses,
            "subject": subject,
            "text": body_text,
            "html": body_html,
            "reply_to": [user_address],
        }
        
        if forward_data.cc_addresses:
            email_payload["cc"] = forward_data.cc_addresses
        
        response = resend.Emails.send(email_payload)
        
        # Save forwarded email in database
        snippet = generate_snippet(body_text, body_html)
        
        forwarded_email = Email(
            user_id=current_user.id,
            from_address=user_address,
            to_addresses=forward_data.to_addresses,
            cc_addresses=forward_data.cc_addresses,
            subject=subject,
            body_text=body_text,
            body_html=body_html,
            snippet=snippet,
            status=EmailStatus.SENT,
            folder=EmailFolder.SENT,
            is_read=True,
            thread_id=str(uuid.uuid4()),  # New thread for forwarded email
            resend_email_id=response.get('id') if response else None,
            sent_at=datetime.utcnow()
        )
        
        db.add(forwarded_email)
        await db.commit()
        await db.refresh(forwarded_email)
        
        return forwarded_email
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to forward email: {str(e)}"
        )


# ========== Email Signature Operations ==========

@router.post("/signature", response_model=EmailSignatureResponse, status_code=status.HTTP_201_CREATED)
async def create_signature(
    signature_data: EmailSignatureCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create or update user's email signature"""
    # Check if signature exists
    result = await db.execute(
        select(EmailSignature).where(EmailSignature.user_id == current_user.id)
    )
    existing_signature = result.scalar_one_or_none()
    
    if existing_signature:
        # Update existing
        existing_signature.signature_html = signature_data.signature_html
        existing_signature.signature_text = signature_data.signature_text
        existing_signature.is_enabled = signature_data.is_enabled
        existing_signature.updated_at = datetime.utcnow()
        await db.commit()
        await db.refresh(existing_signature)
        return existing_signature
    else:
        # Create new
        new_signature = EmailSignature(
            user_id=current_user.id,
            signature_html=signature_data.signature_html,
            signature_text=signature_data.signature_text,
            is_enabled=signature_data.is_enabled
        )
        db.add(new_signature)
        await db.commit()
        await db.refresh(new_signature)
        return new_signature


@router.get("/signature", response_model=EmailSignatureResponse)
async def get_signature(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get user's email signature"""
    result = await db.execute(
        select(EmailSignature).where(EmailSignature.user_id == current_user.id)
    )
    signature = result.scalar_one_or_none()
    
    if not signature:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Email signature not found"
        )
    
    return signature


# ========== Webhook Endpoints ==========

@router.post("/webhooks/resend", status_code=status.HTTP_200_OK)
async def resend_webhook(
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """Handle Resend webhooks for email events (sent, delivered, bounced, etc.)"""
    try:
        event_data = await request.json()
        event_type = event_data.get('type')
        data = event_data.get('data', {})
        
        email_id = data.get('email_id')
        
        if not email_id:
            return {"status": "ignored", "reason": "no email_id"}
        
        # Find email by resend_email_id
        result = await db.execute(
            select(Email).where(Email.resend_email_id == email_id)
        )
        email = result.scalar_one_or_none()
        
        if not email:
            return {"status": "ignored", "reason": "email not found"}
        
        # Update email status based on event type
        if event_type == "email.delivered":
            email.status = EmailStatus.DELIVERED
            email.delivered_at = datetime.utcnow()
        elif event_type == "email.bounced" or event_type == "email.delivery_delayed":
            email.status = EmailStatus.FAILED
        
        email.updated_at = datetime.utcnow()
        await db.commit()
        
        return {"status": "processed", "event_type": event_type}
        
    except Exception as e:
        return {"status": "error", "message": str(e)}


@router.post("/webhooks/inbound", status_code=status.HTTP_200_OK)
async def inbound_email_webhook(
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """Handle inbound emails from Resend"""
    try:
        # Parse raw JSON body to handle flexible structure
        body = await request.body()
        import json
        payload = json.loads(body.decode('utf-8'))
        
        # Verify webhook signature (optional)
        signature = request.headers.get("svix-signature")
        if signature and settings.RESEND_WEBHOOK_SECRET_INBOUND:
            import hmac
            import hashlib
            expected_signature = hmac.new(
                settings.RESEND_WEBHOOK_SECRET_INBOUND.encode(),
                body,
                hashlib.sha256
            ).hexdigest()
            # Svix signature format: "v1,signature"
            if signature.startswith("v1,"):
                signature = signature.split(",")[1]
            if not hmac.compare_digest(signature, expected_signature):
                raise HTTPException(status_code=401, detail="Invalid signature")
        
        # Extract data from payload (handle nested or flat structure)
        data = payload.get('data', payload)
        
        # Extract recipient addresses
        to_addresses = data.get('to', [])
        if isinstance(to_addresses, str):
            to_addresses = [to_addresses]
        
        recipient_email = to_addresses[0] if to_addresses else None
        if not recipient_email:
            return {"status": "ignored", "reason": "no recipient"}
        
        # Extract local part before @ to find user
        # For incoming email like user@citricloud.com or 85guray@citricloud.com
        local_part = recipient_email.split('@')[0]
        
        # Try to find user by username matching local_part
        # First try exact match, then try variations
        result = await db.execute(
            select(User).where(
                or_(
                    User.username == local_part,
                    User.username == local_part[::-1]  # reversed (e.g., guray85 vs 85guray)
                )
            )
        )
        user = result.scalar_one_or_none()
        
        # If still not found, try finding by email domain match
        if not user:
            result = await db.execute(
                select(User).where(User.email.ilike(f"%{local_part}%"))
            )
            user = result.scalar_one_or_none()
        
        # If still not found, check email aliases
        if not user:
            from app.models.email_alias_models import EmailAlias
            result = await db.execute(
                select(EmailAlias).where(
                    and_(
                        EmailAlias.alias == local_part,
                        EmailAlias.is_active == True
                    )
                )
            )
            alias = result.scalar_one_or_none()
            if alias:
                # Get the user who owns this alias
                result = await db.execute(
                    select(User).where(User.id == alias.user_id)
                )
                user = result.scalar_one_or_none()
        
        if not user:
            return {"status": "ignored", "reason": f"user not found for {recipient_email}"}
        
        # Extract email fields
        from_address = data.get('from', '')
        subject = data.get('subject', '(No subject)')
        html = data.get('html')
        text = data.get('text')
        message_id = data.get('email_id') or data.get('message_id')
        
        # Create email record
        snippet = generate_snippet(text, html)
        
        new_email = Email(
            user_id=user.id,
            from_address=from_address,
            to_addresses=to_addresses,
            subject=subject,
            body_text=text,
            body_html=html,
            snippet=snippet,
            status=EmailStatus.RECEIVED,
            folder=EmailFolder.INBOX,
            is_read=False,
            external_message_id=message_id,
            thread_id=str(uuid.uuid4()),
            created_at=datetime.utcnow()
        )
        
        db.add(new_email)
        await db.commit()
        
        return {"status": "received", "email_id": new_email.id}
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        return {"status": "error", "message": str(e)}


@router.get("/folders/counts")
async def get_folder_counts(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get email counts per folder"""
    counts = {}
    
    for folder in EmailFolder:
        result = await db.execute(
            select(func.count(Email.id)).where(
                and_(Email.user_id == current_user.id, Email.folder == folder)
            )
        )
        counts[folder.value] = result.scalar() or 0
    
    # Add unread count for inbox
    unread_result = await db.execute(
        select(func.count(Email.id)).where(
            and_(
                Email.user_id == current_user.id,
                Email.folder == EmailFolder.INBOX,
                Email.is_read == False
            )
        )
    )
    counts['unread'] = unread_result.scalar() or 0
    
    # Add starred count
    starred_result = await db.execute(
        select(func.count(Email.id)).where(
            and_(Email.user_id == current_user.id, Email.is_starred == True)
        )
    )
    counts['starred'] = starred_result.scalar() or 0
    
    return counts


# ========== Advanced Resend API Operations ==========

@router.post("/batch/send", status_code=status.HTTP_202_ACCEPTED)
async def send_batch_emails(
    emails: List[EmailCreate],
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Send multiple emails in a batch
    Useful for newsletters, bulk notifications, etc.
    """
    try:
        user_address = f"{current_user.username}@{settings.EMAIL_FROM.split('@')[1]}"
        sender_address = settings.EMAIL_FROM
        
        # Prepare batch email data
        batch_emails = []
        for email_data in emails:
            email_payload = {
                "from": sender_address,
                "to": email_data.to_addresses,
                "subject": email_data.subject,
                "reply_to": [user_address],
            }
            
            if email_data.cc_addresses:
                email_payload["cc"] = email_data.cc_addresses
            if email_data.bcc_addresses:
                email_payload["bcc"] = email_data.bcc_addresses
            if email_data.body_html:
                email_payload["html"] = email_data.body_html
            if email_data.body_text:
                email_payload["text"] = email_data.body_text
            
            batch_emails.append(email_payload)
        
        # Send batch
        result = resend_service.send_batch_emails(batch_emails)
        
        if not result["success"]:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Batch send failed: {result['error']}"
            )
        
        # Save emails to database
        saved_emails = []
        for email_data in emails:
            snippet = generate_snippet(email_data.body_text, email_data.body_html)
            
            new_email = Email(
                user_id=current_user.id,
                from_address=user_address,
                to_addresses=email_data.to_addresses,
                cc_addresses=email_data.cc_addresses,
                bcc_addresses=email_data.bcc_addresses,
                subject=email_data.subject,
                body_text=email_data.body_text,
                body_html=email_data.body_html,
                snippet=snippet,
                status=EmailStatus.SENT,
                folder=EmailFolder.SENT,
                is_read=True,
                labels=email_data.labels,
                sent_at=datetime.utcnow(),
                thread_id=str(uuid.uuid4())
            )
            
            db.add(new_email)
            saved_emails.append(new_email)
        
        await db.commit()
        
        return {
            "status": "batch_sent",
            "count": len(saved_emails),
            "emails_sent": len(batch_emails),
            "result": result["data"]
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to send batch emails: {str(e)}"
        )


@router.get("/resend/{resend_email_id}/details")
async def get_resend_email_details(
    resend_email_id: str,
    current_user: User = Depends(get_current_user)
):
    """
    Get detailed information about an email from Resend API
    Includes delivery status, opens, clicks, etc.
    """
    result = resend_service.get_email(resend_email_id)
    
    if not result["success"]:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Email not found: {result['error']}"
        )
    
    return result["data"]


@router.post("/resend/{resend_email_id}/reschedule")
async def reschedule_email(
    resend_email_id: str,
    minutes_from_now: int = 1,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Reschedule a scheduled email to send at a different time
    """
    # Find email in database
    result = await db.execute(
        select(Email).where(
            and_(
                Email.resend_email_id == resend_email_id,
                Email.user_id == current_user.id
            )
        )
    )
    email = result.scalar_one_or_none()
    
    if not email:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Email not found"
        )
    
    # Reschedule via Resend API
    reschedule_result = resend_service.reschedule_email(resend_email_id, minutes_from_now)
    
    if not reschedule_result["success"]:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to reschedule: {reschedule_result['error']}"
        )
    
    return {
        "status": "rescheduled",
        "email_id": email.id,
        "resend_email_id": resend_email_id,
        "scheduled_at": reschedule_result["scheduled_at"]
    }


@router.post("/resend/{resend_email_id}/cancel")
async def cancel_scheduled_email(
    resend_email_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Cancel a scheduled email before it's sent
    """
    # Find email in database
    result = await db.execute(
        select(Email).where(
            and_(
                Email.resend_email_id == resend_email_id,
                Email.user_id == current_user.id
            )
        )
    )
    email = result.scalar_one_or_none()
    
    if not email:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Email not found"
        )
    
    # Cancel via Resend API
    cancel_result = resend_service.cancel_email(resend_email_id)
    
    if not cancel_result["success"]:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to cancel: {cancel_result['error']}"
        )
    
    # Update email status
    email.status = EmailStatus.FAILED
    email.folder = EmailFolder.DRAFTS
    email.updated_at = datetime.utcnow()
    await db.commit()
    
    return {
        "status": "cancelled",
        "email_id": email.id,
        "resend_email_id": resend_email_id
    }


@router.get("/resend/{resend_email_id}/attachments")
async def get_email_attachments_from_resend(
    resend_email_id: str,
    current_user: User = Depends(get_current_user)
):
    """
    List all attachments for a sent email from Resend API
    """
    result = resend_service.list_attachments(resend_email_id)
    
    if not result["success"]:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Failed to retrieve attachments: {result['error']}"
        )
    
    return result["data"]


@router.get("/resend/{resend_email_id}/attachments/{attachment_id}")
async def get_email_attachment_details(
    resend_email_id: str,
    attachment_id: str,
    current_user: User = Depends(get_current_user)
):
    """
    Get details of a specific attachment from a sent email
    """
    result = resend_service.get_attachment(resend_email_id, attachment_id)
    
    if not result["success"]:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Attachment not found: {result['error']}"
        )
    
    return result["data"]


@router.get("/resend/list/all")
async def list_all_sent_emails_from_resend(
    current_user: User = Depends(get_current_user)
):
    """
    List all sent emails from Resend API
    Useful for syncing or auditing
    """
    result = resend_service.list_emails()
    
    if not result["success"]:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to list emails: {result['error']}"
        )
    
    return result["data"]


@router.get("/received/list")
async def list_received_emails_from_resend(
    current_user: User = Depends(get_current_user)
):
    """
    List all received (inbound) emails from Resend API
    """
    result = resend_service.list_received_emails()
    
    if not result["success"]:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to list received emails: {result['error']}"
        )
    
    return result["data"]


@router.get("/received/{resend_email_id}")
async def get_received_email_details(
    resend_email_id: str,
    current_user: User = Depends(get_current_user)
):
    """
    Get details of a specific received (inbound) email from Resend API
    """
    result = resend_service.get_received_email(resend_email_id)
    
    if not result["success"]:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Received email not found: {result['error']}"
        )
    
    return result["data"]


@router.get("/received/{resend_email_id}/attachments")
async def list_received_email_attachments(
    resend_email_id: str,
    current_user: User = Depends(get_current_user)
):
    """
    List all attachments for a received (inbound) email
    """
    result = resend_service.list_received_email_attachments(resend_email_id)
    
    if not result["success"]:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Failed to retrieve attachments: {result['error']}"
        )
    
    return result["data"]


@router.get("/received/{resend_email_id}/attachments/{attachment_id}")
async def get_received_email_attachment(
    resend_email_id: str,
    attachment_id: str,
    current_user: User = Depends(get_current_user)
):
    """
    Get details and content of a specific attachment from a received email
    """
    result = resend_service.get_received_email_attachment(resend_email_id, attachment_id)
    
    if not result["success"]:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Attachment not found: {result['error']}"
        )
    
    return result["data"]
