from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

from app.core.database import get_db
from app.api.dependencies import get_current_user
from app.models.models import User
from app.models.hosting_models import Server, VPN, Domain, DNSZone, DNSRecord, EmailAccount, WordPressSite, ControlPanel

router = APIRouter()

# Pydantic schemas
class ServerCreate(BaseModel):
    name: str
    plan: str
    os: str
    datacenter: str

class ServerResponse(BaseModel):
    id: int
    name: str
    plan: str
    os: str
    datacenter: str
    ip: Optional[str]
    status: str
    created_at: datetime

class VPNCreate(BaseModel):
    name: str
    protocol: str
    location: str

class DomainSearch(BaseModel):
    domain: str
    available: bool
    price: float

class DNSRecordCreate(BaseModel):
    type: str
    name: str
    content: str
    ttl: int
    priority: Optional[int] = None

class EmailAccountCreate(BaseModel):
    email: str
    password: str
    quota: int

class WordPressInstall(BaseModel):
    domain: str
    admin_email: str
    admin_password: str
    title: str

class ControlPanelInstall(BaseModel):
    server_id: int
    panel_type: str


# Servers endpoints
@router.get("/servers")
async def get_servers(
    page: int = 1,
    page_size: int = 20,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all servers for the current user"""
    offset = (page - 1) * page_size
    
    result = await db.execute(
        select(Server)
        .where(Server.user_id == current_user.id)
        .offset(offset)
        .limit(page_size)
    )
    servers = result.scalars().all()
    
    total_result = await db.execute(
        select(Server).where(Server.user_id == current_user.id)
    )
    total = len(total_result.scalars().all())
    
    return {
        "items": servers,
        "total": total,
        "page": page,
        "page_size": page_size
    }

@router.post("/servers", response_model=ServerResponse)
async def create_server(
    server_data: ServerCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new server"""
    server = Server(
        user_id=current_user.id,
        name=server_data.name,
        plan=server_data.plan,
        os=server_data.os,
        datacenter=server_data.datacenter,
        status="provisioning"
    )
    db.add(server)
    await db.commit()
    await db.refresh(server)
    
    # TODO: Trigger actual server provisioning via cloud provider API
    
    return server

@router.get("/servers/{server_id}")
async def get_server(
    server_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific server"""
    result = await db.execute(
        select(Server).where(
            Server.id == server_id,
            Server.user_id == current_user.id
        )
    )
    server = result.scalar_one_or_none()
    
    if not server:
        raise HTTPException(status_code=404, detail="Server not found")
    
    return server

@router.delete("/servers/{server_id}")
async def delete_server(
    server_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a server"""
    result = await db.execute(
        select(Server).where(
            Server.id == server_id,
            Server.user_id == current_user.id
        )
    )
    server = result.scalar_one_or_none()
    
    if not server:
        raise HTTPException(status_code=404, detail="Server not found")
    
    await db.delete(server)
    await db.commit()
    
    # TODO: Trigger actual server deletion via cloud provider API
    
    return {"message": "Server deleted successfully"}

@router.post("/servers/{server_id}/{action}")
async def control_server(
    server_id: int,
    action: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Control server (start/stop/restart/reboot)"""
    if action not in ["start", "stop", "restart", "reboot"]:
        raise HTTPException(status_code=400, detail="Invalid action")
    
    result = await db.execute(
        select(Server).where(
            Server.id == server_id,
            Server.user_id == current_user.id
        )
    )
    server = result.scalar_one_or_none()
    
    if not server:
        raise HTTPException(status_code=404, detail="Server not found")
    
    # Update server status based on action
    if action == "start":
        server.status = "running"
    elif action == "stop":
        server.status = "stopped"
    elif action in ["restart", "reboot"]:
        server.status = "restarting"
    
    await db.commit()
    
    # TODO: Trigger actual server action via cloud provider API
    
    return {"message": f"Server {action} initiated", "status": server.status}


# VPN endpoints
@router.get("/vpn")
async def get_vpns(
    page: int = 1,
    page_size: int = 20,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all VPN connections for the current user"""
    offset = (page - 1) * page_size
    
    result = await db.execute(
        select(VPN)
        .where(VPN.user_id == current_user.id)
        .offset(offset)
        .limit(page_size)
    )
    vpns = result.scalars().all()
    
    total_result = await db.execute(
        select(VPN).where(VPN.user_id == current_user.id)
    )
    total = len(total_result.scalars().all())
    
    return {
        "items": vpns,
        "total": total,
        "page": page,
        "page_size": page_size
    }

@router.post("/vpn")
async def create_vpn(
    vpn_data: VPNCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new VPN connection"""
    vpn = VPN(
        user_id=current_user.id,
        name=vpn_data.name,
        protocol=vpn_data.protocol,
        location=vpn_data.location,
        server_ip="0.0.0.0"  # Will be assigned during provisioning
    )
    db.add(vpn)
    await db.commit()
    await db.refresh(vpn)
    
    # TODO: Provision actual VPN server
    
    return vpn

@router.get("/vpn/{vpn_id}/config")
async def get_vpn_config(
    vpn_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get VPN configuration file"""
    result = await db.execute(
        select(VPN).where(
            VPN.id == vpn_id,
            VPN.user_id == current_user.id
        )
    )
    vpn = result.scalar_one_or_none()
    
    if not vpn:
        raise HTTPException(status_code=404, detail="VPN not found")
    
    # TODO: Generate actual OpenVPN config
    config_content = f"""client
dev tun
proto {vpn.protocol.lower()}
remote {vpn.server_ip} 1194
resolv-retry infinite
nobind
persist-key
persist-tun
remote-cert-tls server
cipher AES-256-CBC
verb 3
"""
    
    return {"content": config_content}


# Domains endpoints
@router.get("/domains")
async def get_domains(
    page: int = 1,
    page_size: int = 20,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all domains for the current user"""
    offset = (page - 1) * page_size
    
    result = await db.execute(
        select(Domain)
        .where(Domain.user_id == current_user.id)
        .offset(offset)
        .limit(page_size)
    )
    domains = result.scalars().all()
    
    total_result = await db.execute(
        select(Domain).where(Domain.user_id == current_user.id)
    )
    total = len(total_result.scalars().all())
    
    return {
        "items": domains,
        "total": total,
        "page": page,
        "page_size": page_size
    }

@router.get("/domains/search")
async def search_domain(
    domain: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Search for domain availability"""
    # TODO: Integrate with actual domain registrar API
    # For now, return mock data
    import random
    available = random.choice([True, False])
    price = 12.99 if available else 0
    
    return {
        "domain": domain,
        "available": available,
        "price": price
    }

@router.post("/domains/register")
async def register_domain(
    domain: str,
    years: int,
    auto_renew: bool,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Register a new domain"""
    # TODO: Integrate with domain registrar API
    
    from datetime import timedelta
    expires_at = datetime.utcnow() + timedelta(days=365 * years)
    
    domain_obj = Domain(
        user_id=current_user.id,
        name=domain,
        expires_at=expires_at,
        auto_renew=auto_renew
    )
    db.add(domain_obj)
    await db.commit()
    await db.refresh(domain_obj)
    
    return domain_obj


# DNS endpoints
@router.get("/dns/zones")
async def get_dns_zones(
    page: int = 1,
    page_size: int = 20,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all DNS zones"""
    offset = (page - 1) * page_size
    
    result = await db.execute(
        select(DNSZone)
        .where(DNSZone.user_id == current_user.id)
        .offset(offset)
        .limit(page_size)
    )
    zones = result.scalars().all()
    
    total_result = await db.execute(
        select(DNSZone).where(DNSZone.user_id == current_user.id)
    )
    total = len(total_result.scalars().all())
    
    return {
        "items": zones,
        "total": total,
        "page": page,
        "page_size": page_size
    }

@router.get("/dns/zones/{zone_id}/records")
async def get_dns_records(
    zone_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get DNS records for a zone"""
    # Verify zone ownership
    zone_result = await db.execute(
        select(DNSZone).where(
            DNSZone.id == zone_id,
            DNSZone.user_id == current_user.id
        )
    )
    zone = zone_result.scalar_one_or_none()
    
    if not zone:
        raise HTTPException(status_code=404, detail="DNS zone not found")
    
    result = await db.execute(
        select(DNSRecord).where(DNSRecord.zone_id == zone_id)
    )
    records = result.scalars().all()
    
    return {"items": records}

@router.post("/dns/zones/{zone_id}/records")
async def create_dns_record(
    zone_id: int,
    record_data: DNSRecordCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new DNS record"""
    # Verify zone ownership
    zone_result = await db.execute(
        select(DNSZone).where(
            DNSZone.id == zone_id,
            DNSZone.user_id == current_user.id
        )
    )
    zone = zone_result.scalar_one_or_none()
    
    if not zone:
        raise HTTPException(status_code=404, detail="DNS zone not found")
    
    record = DNSRecord(
        zone_id=zone_id,
        type=record_data.type,
        name=record_data.name,
        content=record_data.content,
        ttl=record_data.ttl,
        priority=record_data.priority
    )
    db.add(record)
    await db.commit()
    await db.refresh(record)
    
    # TODO: Update actual DNS provider
    
    return record

@router.delete("/dns/zones/{zone_id}/records/{record_id}")
async def delete_dns_record(
    zone_id: int,
    record_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a DNS record"""
    # Verify zone ownership
    zone_result = await db.execute(
        select(DNSZone).where(
            DNSZone.id == zone_id,
            DNSZone.user_id == current_user.id
        )
    )
    zone = zone_result.scalar_one_or_none()
    
    if not zone:
        raise HTTPException(status_code=404, detail="DNS zone not found")
    
    result = await db.execute(
        select(DNSRecord).where(
            DNSRecord.id == record_id,
            DNSRecord.zone_id == zone_id
        )
    )
    record = result.scalar_one_or_none()
    
    if not record:
        raise HTTPException(status_code=404, detail="DNS record not found")
    
    await db.delete(record)
    await db.commit()
    
    return {"message": "DNS record deleted successfully"}


# Email endpoints
@router.get("/email/accounts")
async def get_email_accounts(
    page: int = 1,
    page_size: int = 20,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all email accounts"""
    offset = (page - 1) * page_size
    
    result = await db.execute(
        select(EmailAccount)
        .where(EmailAccount.user_id == current_user.id)
        .offset(offset)
        .limit(page_size)
    )
    accounts = result.scalars().all()
    
    total_result = await db.execute(
        select(EmailAccount).where(EmailAccount.user_id == current_user.id)
    )
    total = len(total_result.scalars().all())
    
    return {
        "items": accounts,
        "total": total,
        "page": page,
        "page_size": page_size
    }

@router.post("/email/accounts")
async def create_email_account(
    account_data: EmailAccountCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new email account"""
    from passlib.context import CryptContext
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    
    account = EmailAccount(
        user_id=current_user.id,
        email=account_data.email,
        password_hash=pwd_context.hash(account_data.password),
        quota=account_data.quota,
        used=0
    )
    db.add(account)
    await db.commit()
    await db.refresh(account)
    
    # TODO: Create actual email account on mail server
    
    return account


# WordPress endpoints
@router.get("/wordpress")
async def get_wordpress_sites(
    page: int = 1,
    page_size: int = 20,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all WordPress sites"""
    offset = (page - 1) * page_size
    
    result = await db.execute(
        select(WordPressSite)
        .where(WordPressSite.user_id == current_user.id)
        .offset(offset)
        .limit(page_size)
    )
    sites = result.scalars().all()
    
    total_result = await db.execute(
        select(WordPressSite).where(WordPressSite.user_id == current_user.id)
    )
    total = len(total_result.scalars().all())
    
    return {
        "items": sites,
        "total": total,
        "page": page,
        "page_size": page_size
    }

@router.post("/wordpress/install")
async def install_wordpress(
    install_data: WordPressInstall,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Install WordPress on a domain"""
    site = WordPressSite(
        user_id=current_user.id,
        domain=install_data.domain,
        title=install_data.title,
        admin_email=install_data.admin_email,
        version="6.4.2",
        php_version="8.2",
        status="installing"
    )
    db.add(site)
    await db.commit()
    await db.refresh(site)
    
    # TODO: Trigger actual WordPress installation script
    
    return site

@router.post("/wordpress/{site_id}/update")
async def update_wordpress(
    site_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update WordPress to latest version"""
    result = await db.execute(
        select(WordPressSite).where(
            WordPressSite.id == site_id,
            WordPressSite.user_id == current_user.id
        )
    )
    site = result.scalar_one_or_none()
    
    if not site:
        raise HTTPException(status_code=404, detail="WordPress site not found")
    
    # TODO: Trigger actual WordPress update
    site.version = "6.4.2"  # Latest version
    await db.commit()
    
    return {"message": "WordPress update initiated", "version": site.version}


# Control Panels endpoints
@router.get("/control-panels")
async def get_control_panels(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all installed control panels"""
    result = await db.execute(
        select(ControlPanel).where(ControlPanel.user_id == current_user.id)
    )
    panels = result.scalars().all()
    
    return {"items": panels}

@router.post("/control-panels/install")
async def install_control_panel(
    install_data: ControlPanelInstall,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Install a control panel on a server"""
    # Verify server ownership
    server_result = await db.execute(
        select(Server).where(
            Server.id == install_data.server_id,
            Server.user_id == current_user.id
        )
    )
    server = server_result.scalar_one_or_none()
    
    if not server:
        raise HTTPException(status_code=404, detail="Server not found")
    
    panel = ControlPanel(
        user_id=current_user.id,
        server_id=install_data.server_id,
        panel_type=install_data.panel_type,
        url=f"https://{server.ip}:2087",  # Example URL
        version="1.0.0"
    )
    db.add(panel)
    await db.commit()
    await db.refresh(panel)
    
    # TODO: Trigger actual control panel installation script
    
    return panel
