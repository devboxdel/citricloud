from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional, List
from datetime import datetime
from app.models.email_models import EmailStatus, EmailFolder


# ========== Email Schemas ==========

class EmailAttachmentBase(BaseModel):
    """Base email attachment schema"""
    filename: str
    content_type: str
    size: int


class EmailAttachmentCreate(EmailAttachmentBase):
    """Schema for creating an email attachment"""
    file_path: Optional[str] = None
    file_url: Optional[str] = None


class EmailAttachmentResponse(EmailAttachmentBase):
    """Schema for email attachment response"""
    id: int
    email_id: int
    file_path: Optional[str] = None
    file_url: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class EmailBase(BaseModel):
    """Base email schema"""
    to_addresses: List[EmailStr]
    cc_addresses: Optional[List[EmailStr]] = None
    bcc_addresses: Optional[List[EmailStr]] = None
    subject: str = Field(..., max_length=500)
    body_text: Optional[str] = None
    body_html: Optional[str] = None
    labels: Optional[List[str]] = None
    from_email: Optional[str] = None  # Email alias to send from
    
    @field_validator('to_addresses')
    @classmethod
    def validate_to_addresses(cls, v):
        if not v or len(v) == 0:
            raise ValueError('At least one recipient is required')
        return v


class EmailCreate(EmailBase):
    """Schema for creating/sending an email"""
    attachments: Optional[List[dict]] = None  # {filename, content_type, content_base64}
    folder: EmailFolder = EmailFolder.SENT
    status: EmailStatus = EmailStatus.DRAFT


class EmailDraft(EmailBase):
    """Schema for saving an email draft"""
    folder: EmailFolder = EmailFolder.DRAFTS
    status: EmailStatus = EmailStatus.DRAFT


class EmailUpdate(BaseModel):
    """Schema for updating an email"""
    is_read: Optional[bool] = None
    is_starred: Optional[bool] = None
    is_important: Optional[bool] = None
    folder: Optional[EmailFolder] = None
    labels: Optional[List[str]] = None


class EmailResponse(BaseModel):
    """Schema for email response"""
    id: int
    user_id: int
    from_address: str
    to_addresses: List[str]
    cc_addresses: Optional[List[str]] = None
    bcc_addresses: Optional[List[str]] = None
    subject: str
    body_text: Optional[str] = None
    body_html: Optional[str] = None
    snippet: Optional[str] = None
    status: EmailStatus
    folder: EmailFolder
    is_read: bool
    is_starred: bool
    is_important: bool
    labels: Optional[List[str]] = None
    thread_id: Optional[str] = None
    in_reply_to: Optional[int] = None
    resend_email_id: Optional[str] = None
    external_message_id: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    sent_at: Optional[datetime] = None
    delivered_at: Optional[datetime] = None
    attachments: List[EmailAttachmentResponse] = []

    class Config:
        from_attributes = True


class EmailListResponse(BaseModel):
    """Schema for email list response (compact)"""
    id: int
    from_address: str
    to_addresses: List[str]
    subject: str
    snippet: Optional[str] = None
    body_text: Optional[str] = None
    body_html: Optional[str] = None
    status: EmailStatus
    folder: EmailFolder
    is_read: bool
    is_starred: bool
    is_important: bool
    labels: Optional[List[str]] = None
    created_at: datetime
    sent_at: Optional[datetime] = None
    has_attachments: bool = False

    class Config:
        from_attributes = True


class EmailReply(BaseModel):
    """Schema for replying to an email"""
    body_text: Optional[str] = None
    body_html: Optional[str] = None
    cc_addresses: Optional[List[EmailStr]] = None


class EmailForward(BaseModel):
    """Schema for forwarding an email"""
    to_addresses: List[EmailStr]
    cc_addresses: Optional[List[EmailStr]] = None
    body_text: Optional[str] = None
    body_html: Optional[str] = None


# ========== Email Signature Schemas ==========

class EmailSignatureBase(BaseModel):
    """Base email signature schema"""
    signature_html: str
    signature_text: str
    is_enabled: bool = True


class EmailSignatureCreate(EmailSignatureBase):
    """Schema for creating an email signature"""
    pass


class EmailSignatureUpdate(BaseModel):
    """Schema for updating an email signature"""
    signature_html: Optional[str] = None
    signature_text: Optional[str] = None
    is_enabled: Optional[bool] = None


class EmailSignatureResponse(EmailSignatureBase):
    """Schema for email signature response"""
    id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ========== Webhook Schemas ==========

class ResendWebhookEvent(BaseModel):
    """Schema for Resend webhook events"""
    type: str  # email.sent, email.delivered, email.bounced, etc.
    created_at: str
    data: dict


class InboundEmailWebhook(BaseModel):
    """Schema for inbound email webhook from Resend"""
    type: str = Field(default="email.received")
    created_at: Optional[str] = None
    data: Optional[dict] = None
    
    # Direct payload fields (alternative structure)
    from_address: Optional[str] = Field(None, alias="from")
    to: Optional[List[str]] = None
    subject: Optional[str] = None
    html: Optional[str] = None
    text: Optional[str] = None
    message_id: Optional[str] = Field(None, alias="email_id")
    headers: Optional[dict] = None
    attachments: Optional[List[dict]] = None
    
    class Config:
        populate_by_name = True
        extra = "allow"  # Allow extra fields from Resend
