"""
Authentication routes
"""
from fastapi import APIRouter, Depends, HTTPException, status, Form, Response, Request
from typing import Optional
from fastapi.responses import JSONResponse, ORJSONResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from datetime import datetime, timedelta
import secrets
from pydantic import EmailStr

from app.core.database import get_db
from app.core.security import verify_password, get_password_hash, create_access_token, create_refresh_token, decode_token
from app.api.dependencies import get_current_user
from app.models.models import User, Order, Invoice, Ticket, UserSession
from app.models.notification_models import NotificationSetting
from app.schemas.schemas import (
    UserLogin,
    UserRegister,
    Token,
    TwoFactorRequired,
    TwoFactorVerify,
    UserResponse,
    ForgotPasswordRequest,
    ChangePasswordRequest,
    ResetPasswordRequest,
    PaginatedResponse,
    OrderResponse,
    InvoiceResponse,
    TicketResponse,
)
from fastapi import Query
from sqlalchemy import func
from app.core.cache import set_cache, get_cache, delete_cache
from app.core.email import send_email
from app.core.config import settings

router = APIRouter()


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(
    user_data: UserRegister,
    db: AsyncSession = Depends(get_db)
):
    """Register a new user"""
    # Check if email exists
    result = await db.execute(select(User).where(User.email == user_data.email))
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Check if username exists
    result = await db.execute(select(User).where(User.username == user_data.username))
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already taken"
        )
    
    # Create new user
    user = User(
        email=user_data.email,
        username=user_data.username,
        hashed_password=get_password_hash(user_data.password),
        full_name=user_data.full_name,
        phone=user_data.phone,
    )
    
    db.add(user)
    await db.commit()
    await db.refresh(user)
    
    return user


@router.get("/profile/orders", response_model=PaginatedResponse)
async def get_user_orders(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get current user's orders"""
    # Count total orders
    count_result = await db.execute(
        select(func.count(Order.id)).where(Order.user_id == current_user.id)
    )
    total = count_result.scalar() or 0
    
    # Get paginated orders
    query = select(Order).options(selectinload(Order.order_items)).where(Order.user_id == current_user.id)
    query = query.order_by(Order.created_at.desc()).offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(query)
    orders = result.scalars().all()
    order_items = [OrderResponse.model_validate(order) for order in orders]
    
    return {
        "items": order_items,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (total + page_size - 1) // page_size if total > 0 else 0
    }


@router.get("/profile/invoices", response_model=PaginatedResponse)
async def get_user_invoices(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get current user's invoices"""
    # Count total invoices for user (through orders)
    count_result = await db.execute(
        select(func.count(Invoice.id)).join(Order).where(Order.user_id == current_user.id)
    )
    total = count_result.scalar() or 0
    
    # Get paginated invoices
    query = select(Invoice).join(Order).where(Order.user_id == current_user.id)
    query = query.order_by(Invoice.created_at.desc()).offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(query)
    invoices = result.scalars().all()
    invoice_items = [InvoiceResponse.model_validate(inv) for inv in invoices]
    
    return {
        "items": invoice_items,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (total + page_size - 1) // page_size if total > 0 else 0
    }


@router.get("/profile/stats")
async def get_user_stats(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get current user's profile statistics"""
    # Count orders
    orders_count_query = select(func.count(Order.id)).where(Order.user_id == current_user.id)
    orders_result = await db.execute(orders_count_query)
    orders_count = orders_result.scalar()
    
    # Count invoices
    invoices_count_query = select(func.count(Invoice.id)).join(Order).where(Order.user_id == current_user.id)
    invoices_result = await db.execute(invoices_count_query)
    invoices_count = invoices_result.scalar()
    
    # Count tickets
    from app.models.models import Ticket
    tickets_count_query = select(func.count(Ticket.id)).where(Ticket.user_id == current_user.id)
    tickets_result = await db.execute(tickets_count_query)
    tickets_count = tickets_result.scalar()
    
    return {
        "orders": orders_count,
        "invoices": invoices_count,
        "tickets": tickets_count
    }


@router.get("/profile/tickets", response_model=PaginatedResponse)
async def get_user_tickets(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get current user's tickets"""
    # Count total tickets
    count_result = await db.execute(
        select(func.count(Ticket.id)).where(Ticket.user_id == current_user.id)
    )
    total = count_result.scalar() or 0
    
    # Get paginated tickets
    query = select(Ticket).where(Ticket.user_id == current_user.id)
    query = query.order_by(Ticket.created_at.desc()).offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(query)
    tickets = result.scalars().all()
    ticket_items = [TicketResponse.model_validate(ticket) for ticket in tickets]
    
    return {
        "items": ticket_items,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (total + page_size - 1) // page_size if total > 0 else 0
    }


@router.post("/login")
async def login(
    credentials: UserLogin,
    response: Response,
    db: AsyncSession = Depends(get_db)
):
    """Login and get access token or request 2FA"""
    # Find user by email
    result = await db.execute(select(User).where(User.email == credentials.email))
    user = result.scalar_one_or_none()
    
    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive"
        )
    
    # Check if 2FA is enabled
    if user.two_factor_enabled and user.two_factor_secret:
        # Create temporary token for 2FA verification (5 min expiry)
        temp_token = create_access_token(
            data={"sub": str(user.id), "email": user.email, "temp_2fa": True},
            expires_delta=timedelta(minutes=5)
        )
        return ORJSONResponse(content={
            "requires_2fa": True,
            "temp_token": temp_token,
            "message": "Two-factor authentication required"
        })
    
    # Update last login
    user.last_login = datetime.utcnow()
    await db.commit()
    
    # Create tokens
    # user.role is stored as string in database, not an enum
    role_value = user.role if isinstance(user.role, str) else user.role.value
    access_token = create_access_token(data={"sub": str(user.id), "email": user.email, "role": role_value})
    refresh_token = create_refresh_token(data={"sub": str(user.id)})
    
    # Prepare payload and set cookies on Response parameter
    payload = {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }
    cookie_domain = ".citricloud.com"
    resp = ORJSONResponse(content=payload)
    resp.set_cookie(
        key="access_token",
        value=access_token,
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        httponly=False,
        secure=True,
        samesite="lax",
        path="/",
        domain=cookie_domain,
    )
    resp.set_cookie(
        key="refresh_token",
        value=refresh_token,
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60,
        httponly=False,  # Changed to False so JavaScript can read it
        secure=True,
        samesite="lax",  # Changed from none to lax
        path="/",
        domain=cookie_domain,
    )
    # Explicit header append in case client/lib requires it
    resp.headers.append(
        "Set-Cookie",
        f"access_token={access_token}; Path=/; Domain=.citricloud.com; Max-Age={settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60}; Secure; SameSite=Lax"
    )
    resp.headers.append(
        "Set-Cookie",
        f"refresh_token={refresh_token}; Path=/; Domain=.citricloud.com; Max-Age={settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60}; Secure; SameSite=Lax"
    )
    resp.headers["X-Debug-Cookie"] = "1"
    return resp


@router.post("/verify-2fa", response_model=Token)
async def verify_2fa(
    verification: TwoFactorVerify,
    response: Response,
    db: AsyncSession = Depends(get_db)
):
    """Verify 2FA code and complete login"""
    import pyotp
    
    # Decode temporary token
    try:
        payload = decode_token(verification.temp_token)
        if not payload.get("temp_2fa"):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid temporary token"
            )
        user_id = int(payload.get("sub"))
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired temporary token"
        )
    
    # Get user
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    
    if not user or not user.two_factor_enabled:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Two-factor authentication not enabled"
        )
    
    # Verify TOTP code
    totp = pyotp.TOTP(user.two_factor_secret)
    if not totp.verify(verification.code, valid_window=1):
        # Check backup codes if TOTP fails
        backup_codes = user.two_factor_backup_codes or []
        if verification.code not in backup_codes:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid verification code"
            )
        # Remove used backup code
        backup_codes.remove(verification.code)
        user.two_factor_backup_codes = backup_codes
    
    # Update last login
    user.last_login = datetime.utcnow()
    await db.commit()
    
    # Create full access tokens
    role_value = user.role if isinstance(user.role, str) else user.role.value
    access_token = create_access_token(data={"sub": str(user.id), "email": user.email, "role": role_value})
    refresh_token = create_refresh_token(data={"sub": str(user.id)})
    
    # Set cookies and return tokens
    payload = {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }
    cookie_domain = ".citricloud.com"
    resp = ORJSONResponse(content=payload)
    resp.set_cookie(
        key="access_token",
        value=access_token,
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        httponly=False,
        secure=True,
        samesite="lax",
        path="/",
        domain=cookie_domain,
    )
    resp.set_cookie(
        key="refresh_token",
        value=refresh_token,
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60,
        httponly=False,
        secure=True,
        samesite="lax",
        path="/",
        domain=cookie_domain,
    )
    resp.headers.append(
        "Set-Cookie",
        f"access_token={access_token}; Path=/; Domain=.citricloud.com; Max-Age={settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60}; Secure; SameSite=Lax"
    )
    resp.headers.append(
        "Set-Cookie",
        f"refresh_token={refresh_token}; Path=/; Domain=.citricloud.com; Max-Age={settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60}; Secure; SameSite=Lax"
    )
    resp.headers["X-Debug-Cookie"] = "1"
    return resp


@router.post("/refresh", response_model=Token)
async def refresh_token(
    refresh_token: Optional[str] = Form(None),
    request: Request = None,
    response: Response = None,
    db: AsyncSession = Depends(get_db)
):
    """Refresh access token"""
    # Fallback to cookie if form not provided
    if not refresh_token and request is not None:
        refresh_token = request.cookies.get("refresh_token")
    payload = decode_token(refresh_token) if refresh_token else None
    
    if payload is None or payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )
    
    user_id = payload.get("sub")
    
    # Get user
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive"
        )
    
    # Create new tokens
    role_value = user.role if isinstance(user.role, str) else user.role.value
    access_token = create_access_token(data={"sub": str(user.id), "email": user.email, "role": role_value})
    new_refresh_token = create_refresh_token(data={"sub": str(user.id)})
    
    # Prepare payload and set cookies on Response parameter
    payload = {
        "access_token": access_token,
        "refresh_token": new_refresh_token,
        "token_type": "bearer"
    }
    cookie_domain = ".citricloud.com"
    resp = ORJSONResponse(content=payload)
    resp.set_cookie(
        key="access_token",
        value=access_token,
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        httponly=False,
        secure=True,
        samesite="lax",
        path="/",
        domain=cookie_domain,
    )
    resp.set_cookie(
        key="refresh_token",
        value=new_refresh_token,
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60,
        httponly=False,
        secure=True,
        samesite="lax",
        path="/",
        domain=cookie_domain,
    )
    resp.headers.append(
        "Set-Cookie",
        f"access_token={access_token}; Path=/; Domain=.citricloud.com; Max-Age={settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60}; Secure; SameSite=Lax"
    )
    resp.headers.append(
        "Set-Cookie",
        f"refresh_token={new_refresh_token}; Path=/; Domain=.citricloud.com; Max-Age={settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60}; Secure; SameSite=Lax"
    )
    resp.headers["X-Debug-Cookie"] = "1"
    return resp


@router.post("/logout")
async def logout(response: Response):
    """Logout user: clear auth cookies; client may also clear local storage."""
    cookie_domain = ".citricloud.com"
    # Clear cookies by setting expired max_age
    response.delete_cookie(key="access_token", domain=cookie_domain, path="/")
    response.delete_cookie(key="refresh_token", domain=cookie_domain, path="/")
    return {"message": "Successfully logged out"}


@router.post("/change-password")
async def change_password(
    payload: ChangePasswordRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Allow authenticated users to change their password."""
    if not verify_password(payload.current_password, current_user.hashed_password):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Current password is incorrect")

    if payload.new_password == payload.current_password:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="New password must be different from current password")

    current_user.hashed_password = get_password_hash(payload.new_password)
    await db.commit()
    await db.refresh(current_user)

    return {"message": "Password updated successfully"}


# ======================== Password Reset Flow ========================

@router.post("/forgot-password")
async def forgot_password(payload: ForgotPasswordRequest, db: AsyncSession = Depends(get_db)):
    """
    Request a password reset link. Always returns 200 to avoid user enumeration.
    Creates a short-lived token stored in cache and emails a link to the user.
    """
    # Check if user exists (do not reveal result to client)
    result = await db.execute(select(User).where(User.email == payload.email))
    user = result.scalar_one_or_none()

    if user:
        token = secrets.token_urlsafe(32)
        ttl = settings.PASSWORD_RESET_TOKEN_TTL_MINUTES * 60
        cache_key = f"pwdreset:{token}"
        # Store user id in cache for limited time
        await set_cache(cache_key, str(user.id), ttl=ttl)

        reset_link = f"{settings.FRONTEND_URL}/reset-password?token={token}"

        subject = f"{settings.APP_NAME} Password Reset"
        text_body = (
            f"Hello,\n\n"
            f"We received a request to reset your password.\n"
            f"Use the link below to set a new password (valid for {settings.PASSWORD_RESET_TOKEN_TTL_MINUTES} minutes):\n\n"
            f"{reset_link}\n\n"
            f"If you didn't request this, you can safely ignore this email."
        )
        html_body = f"""
            <p>Hello,</p>
            <p>We received a request to reset your password.</p>
            <p>
              <a href="{reset_link}" style="display:inline-block;padding:10px 16px;background:#2563eb;color:#fff;text-decoration:none;border-radius:8px;">
                Reset your password
              </a>
            </p>
            <p>This link will expire in {settings.PASSWORD_RESET_TOKEN_TTL_MINUTES} minutes.</p>
            <p>If you didn't request this, you can ignore this email.</p>
        """

        # Fire and forget (we don't block on email success for security)
        await send_email(user.email, subject, html_body, text_body)

    # Always respond the same way
    return {"message": "If an account with that email exists, a reset link has been sent."}


@router.post("/reset-password")
async def reset_password(payload: ResetPasswordRequest, db: AsyncSession = Depends(get_db)):
    """
    Reset password using a valid token issued via /forgot-password.
    """
    cache_key = f"pwdreset:{payload.token}"
    user_id_str = await get_cache(cache_key)
    if not user_id_str:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired reset token")

    # Load user and update password
    result = await db.execute(select(User).where(User.id == int(user_id_str)))
    user = result.scalar_one_or_none()
    if not user:
        # Clean cache anyway
        await delete_cache(cache_key)
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid reset token")

    user.hashed_password = get_password_hash(payload.new_password)
    await db.commit()
    await delete_cache(cache_key)

    return {"message": "Password has been reset successfully"}


@router.get("/profile/orders", response_model=PaginatedResponse)
async def get_user_orders(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get current user's orders"""
    query = select(Order).where(Order.user_id == current_user.id)
    
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar()
    
    query = query.order_by(Order.created_at.desc()).offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(query)
    orders = result.scalars().all()
    
    return {
        "items": orders,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (total + page_size - 1) // page_size
    }


@router.get("/profile/invoices", response_model=PaginatedResponse)
async def get_user_invoices(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get current user's invoices"""
    # Join with orders to filter by user
    query = select(Invoice).join(Order).where(Order.user_id == current_user.id)
    
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar()
    
    query = query.order_by(Invoice.created_at.desc()).offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(query)
    invoices = result.scalars().all()
    
    return {
        "items": invoices,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (total + page_size - 1) // page_size
    }


@router.get("/profile/stats")
async def get_user_stats(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get current user's profile statistics"""
    # Count orders
    orders_count_query = select(func.count(Order.id)).where(Order.user_id == current_user.id)
    orders_result = await db.execute(orders_count_query)
    orders_count = orders_result.scalar()
    
    # Count invoices
    invoices_count_query = select(func.count(Invoice.id)).join(Order).where(Order.user_id == current_user.id)
    invoices_result = await db.execute(invoices_count_query)
    invoices_count = invoices_result.scalar()
    
    # Count tickets
    tickets_count_query = select(func.count(Ticket.id)).where(Ticket.user_id == current_user.id)
    tickets_result = await db.execute(tickets_count_query)
    tickets_count = tickets_result.scalar()
    
    return {
        "orders": orders_count,
        "invoices": invoices_count,
        "tickets": tickets_count
    }


# ============== Two-Factor Authentication Endpoints ==============

@router.post("/2fa/enable")
async def enable_2fa(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Generate TOTP secret for 2FA setup"""
    try:
        import pyotp
        import qrcode
        from io import BytesIO
        import base64
        
        print(f"[2FA_ENABLE] Starting 2FA setup for user {current_user.email}")
        
        # Generate TOTP secret
        secret = pyotp.random_base32()
        print(f"[2FA_ENABLE] Generated secret")
        
        # Generate QR code
        totp = pyotp.TOTP(secret)
        qr_uri = totp.provisioning_uri(
            name=current_user.email,
            issuer_name="Citricloud"
        )
        print(f"[2FA_ENABLE] Generated provisioning URI")
        
        # Create QR code image
        qr = qrcode.QRCode(version=1, box_size=10, border=5)
        qr.add_data(qr_uri)
        qr.make(fit=True)
        qr_image = qr.make_image(fill_color="black", back_color="white")
        print(f"[2FA_ENABLE] Generated QR code image")
        
        # Convert to base64
        buffer = BytesIO()
        qr_image.save(buffer, format='PNG')
        qr_base64 = base64.b64encode(buffer.getvalue()).decode('utf-8')
        print(f"[2FA_ENABLE] Converted to base64")
        
        # Store secret temporarily (not yet verified)
        current_user.two_factor_secret = secret
        await db.commit()
        print(f"[2FA_ENABLE] Saved secret to database")
        
        return {
            "secret": secret,
            "qr_code": f"data:image/png;base64,{qr_base64}",
            "provisioning_uri": qr_uri
        }
    except Exception as e:
        print(f"[2FA_ENABLE] ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Failed to enable 2FA: {str(e)}")


@router.post("/2fa/verify")
async def verify_2fa(
    payload: dict,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Verify TOTP code and enable 2FA"""
    import pyotp
    
    code = payload.get("code") if isinstance(payload, dict) else getattr(payload, "code", None)
    
    if not code:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Verification code is required"
        )
    
    if not current_user.two_factor_secret:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="2FA setup not initiated"
        )
    
    # Verify the code (allow for time window drift)
    totp = pyotp.TOTP(current_user.two_factor_secret)
    if not totp.verify(code, valid_window=1):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid verification code"
        )
    
    # Enable 2FA
    current_user.two_factor_enabled = True
    
    # Generate backup codes
    import secrets
    backup_codes = [secrets.token_hex(4) for _ in range(10)]
    current_user.two_factor_backup_codes = backup_codes
    
    await db.commit()
    
    return {
        "message": "2FA enabled successfully",
        "backup_codes": backup_codes
    }


@router.post("/2fa/disable")
async def disable_2fa(
    payload: dict,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Disable 2FA with password verification"""
    password = payload.get("password") if isinstance(payload, dict) else getattr(payload, "password", None)
    
    if not password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password is required"
        )
    
    # Verify password
    if not verify_password(password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid password"
        )
    
    # Disable 2FA
    current_user.two_factor_enabled = False
    current_user.two_factor_secret = None
    current_user.two_factor_backup_codes = None
    
    await db.commit()
    
    return {"message": "2FA disabled successfully"}


@router.get("/2fa/status")
async def get_2fa_status(
    current_user: User = Depends(get_current_user)
):
    """Get current 2FA status"""
    return {
        "enabled": current_user.two_factor_enabled,
        "has_backup_codes": bool(current_user.two_factor_backup_codes)
    }


# ============== Active Sessions Endpoints ==============

@router.get("/sessions")
async def get_sessions(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all active sessions for current user"""
    result = await db.execute(
        select(UserSession).where(
            UserSession.user_id == current_user.id,
            UserSession.is_active == True
        ).order_by(UserSession.last_activity.desc())
    )
    sessions = result.scalars().all()
    
    return {
        "sessions": [
            {
                "id": session.id,
                "device_name": session.device_name,
                "device_type": session.device_type,
                "browser": session.browser,
                "operating_system": session.operating_system,
                "ip_address": session.ip_address,
                "location": session.location,
                "last_activity": session.last_activity.isoformat(),
                "created_at": session.created_at.isoformat(),
                "expires_at": session.expires_at.isoformat()
            }
            for session in sessions
        ]
    }


@router.post("/sessions/{session_id}/terminate")
async def terminate_session(
    session_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Terminate a specific session"""
    result = await db.execute(
        select(UserSession).where(
            UserSession.id == session_id,
            UserSession.user_id == current_user.id
        )
    )
    session = result.scalar_one_or_none()
    
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found"
        )
    
    session.is_active = False
    await db.commit()
    
    return {"message": "Session terminated successfully"}


@router.post("/sessions/terminate-others")
async def terminate_all_other_sessions(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    request: Request = None
):
    """Terminate all other sessions except current"""
    # Get current session ID from request (if available)
    current_session_id = request.headers.get("X-Session-ID") if request else None
    
    # Deactivate all other sessions
    await db.execute(
        select(UserSession).where(
            UserSession.user_id == current_user.id,
            UserSession.is_active == True,
            UserSession.id != current_session_id if current_session_id else True
        )
    )
    
    # Mark as inactive
    result = await db.execute(
        select(UserSession).where(
            UserSession.user_id == current_user.id,
            UserSession.is_active == True,
            UserSession.id != current_session_id if current_session_id else True
        )
    )
    sessions = result.scalars().all()
    for session in sessions:
        session.is_active = False
    
    await db.commit()
    
    return {"message": f"Terminated {len(sessions)} session(s)"}


# ============== Notification Settings Endpoints ==============

@router.get("/notification-settings")
async def get_notification_settings(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get user's notification preferences"""
    result = await db.execute(
        select(NotificationSetting).where(NotificationSetting.user_id == current_user.id)
    )
    settings = result.scalar_one_or_none()
    
    if not settings:
        # Create default settings if not exist
        settings = NotificationSetting(user_id=current_user.id)
        db.add(settings)
        await db.commit()
    
    return {
        "email_notifications": settings.email_notifications,
        "push_notifications": settings.push_notifications,
        "sms_notifications": settings.sms_notifications,
        "order_updates": settings.order_updates
    }


@router.put("/notification-settings")
async def update_notification_settings(
    payload: dict,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update user's notification preferences"""
    data = payload if isinstance(payload, dict) else payload.model_dump()
    
    result = await db.execute(
        select(NotificationSetting).where(NotificationSetting.user_id == current_user.id)
    )
    settings = result.scalar_one_or_none()
    
    if not settings:
        settings = NotificationSetting(user_id=current_user.id)
        db.add(settings)
    
    # Update fields if provided
    if "email_notifications" in data:
        settings.email_notifications = data["email_notifications"]
    if "push_notifications" in data:
        settings.push_notifications = data["push_notifications"]
    if "sms_notifications" in data:
        settings.sms_notifications = data["sms_notifications"]
    if "order_updates" in data:
        settings.order_updates = data["order_updates"]
    
    await db.commit()
    
    return {"message": "Notification settings updated successfully"}


# ============== User Preferences Endpoints ==============

@router.get("/preferences")
async def get_user_preferences(
    current_user: User = Depends(get_current_user)
):
    """Get user's preferences"""
    return {
        "language": current_user.preferred_language or "en",
        "date_format": current_user.preferred_date_format or "MM/DD/YYYY",
        "timezone": current_user.preferred_timezone or "UTC",
        "theme_mode": current_user.theme_mode or "auto",
        "theme_auto_source": current_user.theme_auto_source or "system",
        "primary_color": current_user.primary_color or "#0ea5e9",
        "email_notifications": current_user.email_notifications if current_user.email_notifications is not None else True,
        "push_notifications": current_user.push_notifications if current_user.push_notifications is not None else True,
        "marketing_emails": current_user.marketing_emails or False,
        "profile_visibility": current_user.profile_visibility or "public",
        "activity_visibility": current_user.activity_visibility or "connections",
        "data_sharing": current_user.data_sharing or False,
        "analytics_enabled": current_user.analytics_enabled if current_user.analytics_enabled is not None else True,
        "recovery_email": current_user.recovery_email,
        "recovery_phone": current_user.recovery_phone,
        "font_size": current_user.font_size or "medium",
        "high_contrast": current_user.high_contrast or False,
        "reduce_motion": current_user.reduce_motion or False,
        "screen_reader": current_user.screen_reader or False,
        "address": current_user.address,
        "city": current_user.city,
        "country": current_user.country,
        "zip_code": current_user.zip_code,
        "province": current_user.province,
        "district": current_user.district,
        "block": current_user.block,
        "phone_number": current_user.phone
    }


@router.put("/preferences")
async def update_user_preferences(
    payload: dict,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update user's preferences"""
    data = payload if isinstance(payload, dict) else payload.model_dump()
    
    # Update user preferences
    if "language" in data:
        current_user.preferred_language = data["language"]
    if "date_format" in data:
        current_user.preferred_date_format = data["date_format"]
    if "timezone" in data:
        current_user.preferred_timezone = data["timezone"]
    if "theme_mode" in data:
        current_user.theme_mode = data["theme_mode"]
    if "theme_auto_source" in data:
        current_user.theme_auto_source = data["theme_auto_source"]
    if "primary_color" in data:
        current_user.primary_color = data["primary_color"]
    if "email_notifications" in data:
        current_user.email_notifications = data["email_notifications"]
    if "push_notifications" in data:
        current_user.push_notifications = data["push_notifications"]
    if "marketing_emails" in data:
        current_user.marketing_emails = data["marketing_emails"]
    if "profile_visibility" in data:
        current_user.profile_visibility = data["profile_visibility"]
    if "activity_visibility" in data:
        current_user.activity_visibility = data["activity_visibility"]
    if "data_sharing" in data:
        current_user.data_sharing = data["data_sharing"]
    if "analytics_enabled" in data:
        current_user.analytics_enabled = data["analytics_enabled"]
    if "recovery_email" in data:
        current_user.recovery_email = data["recovery_email"]
    if "recovery_phone" in data:
        current_user.recovery_phone = data["recovery_phone"]
    if "font_size" in data:
        current_user.font_size = data["font_size"]
    if "high_contrast" in data:
        current_user.high_contrast = data["high_contrast"]
    if "reduce_motion" in data:
        current_user.reduce_motion = data["reduce_motion"]
    if "screen_reader" in data:
        current_user.screen_reader = data["screen_reader"]
    if "address" in data:
        current_user.address = data["address"]
    if "city" in data:
        current_user.city = data["city"]
    if "country" in data:
        current_user.country = data["country"]
    if "zip_code" in data:
        current_user.zip_code = data["zip_code"]
    if "province" in data:
        current_user.province = data["province"]
    if "district" in data:
        current_user.district = data["district"]
    if "block" in data:
        current_user.block = data["block"]
    if "phone_number" in data:
        current_user.phone = data["phone_number"]
    
    db.add(current_user)
    await db.commit()
    await db.refresh(current_user)
    
    return {"message": "Preferences updated successfully"}


@router.put("/preferences/language")
async def update_language_preference(
    payload: dict,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update user's language preference"""
    data = payload if isinstance(payload, dict) else payload.model_dump()
    language = data.get("language", "en")
    
    if language not in ["en", "es", "fr", "de", "pt"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid language"
        )
    
    current_user.preferred_language = language
    await db.commit()
    
    return {"message": "Language preference updated", "language": language}


@router.put("/preferences/date-format")
async def update_date_format_preference(
    payload: dict,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update user's date format preference"""
    data = payload if isinstance(payload, dict) else payload.model_dump()
    date_format = data.get("date_format", "MM/DD/YYYY")
    
    valid_formats = ["MM/DD/YYYY", "DD/MM/YYYY", "YYYY-MM-DD", "DD.MM.YYYY"]
    if date_format not in valid_formats:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid date format"
        )
    
    current_user.preferred_date_format = date_format
    await db.commit()
    
    return {"message": "Date format preference updated", "date_format": date_format}


@router.put("/preferences/timezone")
async def update_timezone_preference(
    payload: dict,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update user's timezone preference"""
    data = payload if isinstance(payload, dict) else payload.model_dump()
    timezone = data.get("timezone", "UTC")
    
    current_user.preferred_timezone = timezone
    await db.commit()
    
    return {"message": "Timezone preference updated", "timezone": timezone}

