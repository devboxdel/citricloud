"""
Maintenance Mode Middleware
Redirects users to maintenance page when maintenance mode is enabled
Exempts system admins and administrators
"""
from fastapi import Request, status
from fastapi.responses import RedirectResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import SessionLocal
from app.models.site_settings_models import SiteSettings
from app.models.models import UserRole


# Paths that should always be accessible during maintenance
EXEMPT_PATHS = [
    "/api/v1/auth/login",
    "/api/v1/auth/register", 
    "/api/v1/auth/refresh",
    "/api/v1/auth/logout",
    "/api/v1/site-settings/maintenance",  # Check maintenance status
    "/health",
    "/",
    "/maintenance",  # The maintenance page itself
]


async def maintenance_mode_middleware(request: Request, call_next):
    """
    Check if maintenance mode is enabled and redirect non-admin users
    """
    # Allow exempt paths
    if any(request.url.path.startswith(path) for path in EXEMPT_PATHS):
        return await call_next(request)
    
    # Allow static files and uploads
    if request.url.path.startswith("/uploads") or request.url.path.startswith("/static"):
        return await call_next(request)
    
    # Check maintenance mode
    try:
        async with SessionLocal() as db:
            result = await db.execute(select(SiteSettings))
            settings = result.scalar_one_or_none()
            
            if settings and settings.maintenance_mode:
                # Check if user is admin (from JWT token in Authorization header)
                auth_header = request.headers.get("Authorization")
                
                if auth_header:
                    # If user is authenticated, check their role
                    # We'll use the dependency to get current user if token is valid
                    from app.api.dependencies import get_current_user_optional
                    from app.core.database import get_db
                    
                    try:
                        # Get DB session
                        db_session = SessionLocal()
                        # Decode token and get user
                        from app.core.security import decode_access_token
                        token = auth_header.replace("Bearer ", "")
                        payload = decode_access_token(token)
                        
                        if payload:
                            user_id = payload.get("sub")
                            if user_id:
                                from app.models.models import User
                                user_result = await db_session.execute(
                                    select(User).filter(User.id == int(user_id))
                                )
                                user = user_result.scalar_one_or_none()
                                
                                # Allow admins to bypass maintenance mode
                                if user and user.role in [UserRole.SYSTEM_ADMIN, UserRole.ADMINISTRATOR]:
                                    await db_session.close()
                                    return await call_next(request)
                        
                        await db_session.close()
                    except Exception:
                        pass  # If token is invalid, treat as unauthenticated
                
                # Redirect to maintenance page for API requests
                if request.url.path.startswith("/api/"):
                    from fastapi.responses import JSONResponse
                    return JSONResponse(
                        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                        content={
                            "detail": "Site is currently under maintenance. Please try again later.",
                            "maintenance_mode": True
                        }
                    )
                
                # Redirect to maintenance page for regular requests
                return RedirectResponse(url="/maintenance", status_code=status.HTTP_307_TEMPORARY_REDIRECT)
    
    except Exception as e:
        # If there's an error checking maintenance mode, allow the request
        pass
    
    return await call_next(request)
