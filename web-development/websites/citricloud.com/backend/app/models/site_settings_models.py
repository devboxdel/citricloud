"""
Site Settings models for frontend configuration
"""
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text
from datetime import datetime

from app.core.database import Base


class SiteSettings(Base):
    """Site settings model for storing frontend configuration"""
    __tablename__ = "site_settings"

    id = Column(Integer, primary_key=True, index=True)
    
    # General settings
    site_name = Column(String(255), default="CITRICLOUD")
    site_tagline = Column(String(500), default="Code delivered. Projects accelerated.")
    
    # Feature toggles
    enable_blog = Column(Boolean, default=True)
    enable_shop = Column(Boolean, default=True)
    enable_community = Column(Boolean, default=True)
    enable_workspace = Column(Boolean, default=True)
    
    # System settings
    maintenance_mode = Column(Boolean, default=False)
    dark_mode_default = Column(Boolean, default=False)
    
    # Branding
    logo_url = Column(String(500), default="/logo.svg")
    favicon_url = Column(String(500), default="/favicon.ico")
    primary_color = Column(String(50), default="#3B82F6")
    accent_color = Column(String(50), default="#8B5CF6")
    
    # Typography & Layout
    font_family = Column(String(100), default="Inter")
    header_layout = Column(String(50), default="centered")
    footer_layout = Column(String(50), default="full")
    
    # Additional settings (JSON)
    custom_css = Column(Text, nullable=True)
    custom_js = Column(Text, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f"<SiteSettings {self.site_name}>"
