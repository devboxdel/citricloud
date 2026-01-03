"""
Shared Email schemas for API validation and responses
"""
from pydantic import BaseModel, field_validator, Field
from typing import Optional, List
from datetime import datetime


class SharedEmailBase(BaseModel):
    """Base shared email schema"""
    email_name: str = Field(..., max_length=255)
    display_name: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = Field(None, max_length=500)
    
    @field_validator('email_name')
    @classmethod
    def validate_email_name(cls, v):
        """Validate email name format"""
        if not v:
            raise ValueError('Email name is required')
        
        # Convert to lowercase
        v = v.lower().strip()
        
        # Check format
        if not v.isalnum() and '_' not in v and '-' not in v:
            raise ValueError('Email name must contain only letters, numbers, hyphens, and underscores')
        
        # Check reserved words
        reserved = ['admin', 'root', 'postmaster', 'webmaster', 'hostmaster', 'abuse', 'noreply']
        if v in reserved:
            raise ValueError(f'Email name "{v}" is reserved')
        
        return v


class SharedEmailCreate(SharedEmailBase):
    """Schema for creating a shared email"""
    pass


class SharedEmailUpdate(BaseModel):
    """Schema for updating a shared email"""
    display_name: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = Field(None, max_length=500)
    is_active: Optional[bool] = None


class SharedEmailMemberResponse(BaseModel):
    """Schema for shared email member info"""
    id: int
    username: str
    full_name: Optional[str] = None
    email: Optional[str] = None
    
    class Config:
        from_attributes = True


class SharedEmailResponse(BaseModel):
    """Schema for shared email response"""
    id: int
    email_name: str
    full_email: str
    display_name: Optional[str] = None
    description: Optional[str] = None
    is_active: bool
    created_by_user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    member_count: int = 0
    members: List[SharedEmailMemberResponse] = []
    
    class Config:
        from_attributes = True


class SharedEmailListResponse(BaseModel):
    """Schema for list of shared emails"""
    shared_emails: List[SharedEmailResponse]
    total: int


class SharedEmailInvite(BaseModel):
    """Schema for inviting user to shared email"""
    user_email: str = Field(..., description="Email address of user to invite")
