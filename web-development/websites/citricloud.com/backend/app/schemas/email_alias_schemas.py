"""
Email Alias schemas for CITRICLOUD
"""
from pydantic import BaseModel, Field, field_validator
from typing import Optional
from datetime import datetime
import re


class EmailAliasCreate(BaseModel):
    """Schema for creating a new email alias"""
    alias: str = Field(..., min_length=1, max_length=64, description="Email alias (without @citricloud.com)")
    display_name: Optional[str] = Field(None, max_length=255, description="Display name for the alias")
    description: Optional[str] = Field(None, max_length=500, description="Description of the alias purpose")
    
    @field_validator('alias')
    @classmethod
    def validate_alias(cls, v: str) -> str:
        """Validate alias format"""
        # Convert to lowercase
        v = v.lower().strip()
        
        # Check if valid email local part (before @)
        if not re.match(r'^[a-z0-9][a-z0-9._-]*[a-z0-9]$', v) and len(v) > 1:
            raise ValueError('Alias must contain only lowercase letters, numbers, dots, hyphens, and underscores')
        
        if len(v) == 1 and not re.match(r'^[a-z0-9]$', v):
            raise ValueError('Single character alias must be alphanumeric')
        
        # Prevent reserved aliases
        reserved = ['admin', 'root', 'postmaster', 'abuse', 'noreply', 'no-reply', 'support', 'info', 'contact', 'webmaster', 'hostmaster']
        if v in reserved:
            raise ValueError(f'Alias "{v}" is reserved and cannot be used')
        
        return v
    
    class Config:
        json_schema_extra = {
            "example": {
                "alias": "sales",
                "display_name": "Sales Team",
                "description": "Alias for sales inquiries"
            }
        }


class EmailAliasUpdate(BaseModel):
    """Schema for updating an email alias"""
    display_name: Optional[str] = Field(None, max_length=255, description="Display name for the alias")
    description: Optional[str] = Field(None, max_length=500, description="Description of the alias purpose")
    is_active: Optional[bool] = Field(None, description="Whether the alias is active")
    
    class Config:
        json_schema_extra = {
            "example": {
                "display_name": "Sales Team (Updated)",
                "description": "Updated description",
                "is_active": True
            }
        }


class EmailAliasResponse(BaseModel):
    """Schema for email alias response"""
    id: int
    user_id: int
    alias: str
    full_email: str
    display_name: Optional[str] = None
    description: Optional[str] = None
    is_active: bool
    is_verified: bool
    created_at: datetime
    updated_at: datetime
    verified_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "id": 1,
                "user_id": 1,
                "alias": "sales",
                "full_email": "sales@citricloud.com",
                "display_name": "Sales Team",
                "description": "Alias for sales inquiries",
                "is_active": True,
                "is_verified": True,
                "created_at": "2024-01-01T00:00:00",
                "updated_at": "2024-01-01T00:00:00",
                "verified_at": "2024-01-01T00:00:00"
            }
        }


class EmailAliasListResponse(BaseModel):
    """Schema for list of email aliases"""
    total: int
    aliases: list[EmailAliasResponse]
    
    class Config:
        json_schema_extra = {
            "example": {
                "total": 2,
                "aliases": [
                    {
                        "id": 1,
                        "user_id": 1,
                        "alias": "sales",
                        "full_email": "sales@citricloud.com",
                        "display_name": "Sales Team",
                        "is_active": True,
                        "is_verified": True
                    }
                ]
            }
        }
