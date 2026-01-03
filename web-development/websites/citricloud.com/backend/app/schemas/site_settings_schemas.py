"""
Site Settings schemas for API
"""
from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class SiteSettingsBase(BaseModel):
    """Base site settings schema"""
    site_name: Optional[str] = "CITRICLOUD"
    site_tagline: Optional[str] = "Cloud Solutions for Modern Business"
    enable_blog: Optional[bool] = True
    enable_shop: Optional[bool] = True
    enable_community: Optional[bool] = True
    enable_workspace: Optional[bool] = True
    maintenance_mode: Optional[bool] = False
    dark_mode_default: Optional[bool] = False
    logo_url: Optional[str] = "/logo.svg"
    favicon_url: Optional[str] = "/favicon.ico"
    primary_color: Optional[str] = "#3B82F6"
    accent_color: Optional[str] = "#8B5CF6"
    font_family: Optional[str] = "Inter"
    header_layout: Optional[str] = "centered"
    footer_layout: Optional[str] = "full"
    custom_css: Optional[str] = None
    custom_js: Optional[str] = None


class SiteSettingsUpdate(SiteSettingsBase):
    """Schema for updating site settings"""
    pass


class SiteSettingsResponse(SiteSettingsBase):
    """Schema for site settings response"""
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class MaintenanceModeResponse(BaseModel):
    """Response for maintenance mode check"""
    maintenance_mode: bool
    message: Optional[str] = None
