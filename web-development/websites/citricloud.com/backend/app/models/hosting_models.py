from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.models.models import Base


class Server(Base):
    __tablename__ = "hosting_servers"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(255), nullable=False)
    plan = Column(String(100), nullable=False)
    os = Column(String(100), nullable=False)
    datacenter = Column(String(100), nullable=False)
    ip = Column(String(45), nullable=True)  # IPv4 or IPv6
    status = Column(String(50), default="provisioning")  # provisioning, running, stopped, etc.
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    user = relationship("User", back_populates="servers")


class VPN(Base):
    __tablename__ = "hosting_vpn"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(255), nullable=False)
    protocol = Column(String(50), nullable=False)  # OpenVPN, WireGuard, etc.
    location = Column(String(100), nullable=False)
    server_ip = Column(String(45), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="vpns")


class Domain(Base):
    __tablename__ = "hosting_domains"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(255), nullable=False, unique=True)
    expires_at = Column(DateTime, nullable=False)
    auto_renew = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="domains")
    dns_zone = relationship("DNSZone", back_populates="domain_obj", uselist=False)


class DNSZone(Base):
    __tablename__ = "hosting_dns_zones"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    domain_id = Column(Integer, ForeignKey("hosting_domains.id", ondelete="CASCADE"), nullable=False)
    domain = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="dns_zones")
    domain_obj = relationship("Domain", back_populates="dns_zone")
    records = relationship("DNSRecord", back_populates="zone", cascade="all, delete-orphan")


class DNSRecord(Base):
    __tablename__ = "hosting_dns_records"
    
    id = Column(Integer, primary_key=True, index=True)
    zone_id = Column(Integer, ForeignKey("hosting_dns_zones.id", ondelete="CASCADE"), nullable=False)
    type = Column(String(10), nullable=False)  # A, AAAA, CNAME, MX, TXT, etc.
    name = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    ttl = Column(Integer, default=3600)
    priority = Column(Integer, nullable=True)  # For MX records
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    zone = relationship("DNSZone", back_populates="records")


class EmailAccount(Base):
    __tablename__ = "hosting_email_accounts"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    email = Column(String(255), nullable=False, unique=True)
    password_hash = Column(String(255), nullable=False)
    quota = Column(Integer, nullable=False)  # in MB
    used = Column(Integer, default=0)  # in MB
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="email_accounts")


class WordPressSite(Base):
    __tablename__ = "hosting_wordpress_sites"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    domain = Column(String(255), nullable=False)
    title = Column(String(255), nullable=False)
    admin_email = Column(String(255), nullable=False)
    version = Column(String(50), nullable=False)
    php_version = Column(String(50), nullable=False)
    status = Column(String(50), default="active")  # active, installing, error
    plugin_count = Column(Integer, default=0)
    theme = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    user = relationship("User", back_populates="wordpress_sites")


class ControlPanel(Base):
    __tablename__ = "hosting_control_panels"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    server_id = Column(Integer, ForeignKey("hosting_servers.id", ondelete="CASCADE"), nullable=False)
    panel_type = Column(String(100), nullable=False)  # cPanel, Plesk, etc.
    url = Column(String(500), nullable=False)
    version = Column(String(50), nullable=False)
    installed_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="control_panels")
    server = relationship("Server")
