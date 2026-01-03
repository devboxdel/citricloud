"""
Authentication dependencies
"""
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional

from app.core.database import get_db
from app.core.security import decode_token
from app.models.models import User, UserRole
from app.schemas.schemas import TokenData

# Allow missing Authorization header; we'll fallback to cookies
security = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    request: Request = None,
    db: AsyncSession = Depends(get_db)
) -> User:
    """Get current authenticated user"""
    print(f"DEBUG get_current_user: Received credentials")
    token = credentials.credentials if credentials else None
    print(f"DEBUG get_current_user: Token length: {len(token) if token else 0}")
    # Fallback to cookie if Authorization header missing
    if not token and request is not None:
        cookie_token = request.cookies.get("access_token")
        token = cookie_token
        print(f"DEBUG get_current_user: Using cookie token: {bool(cookie_token)}")

    payload = decode_token(token) if token else None
    print(f"DEBUG get_current_user: Payload: {payload}")
    
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user_id_str = payload.get("sub")
    print(f"DEBUG get_current_user: User ID from token: {user_id_str}")
    if user_id_str is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
        )
    
    try:
        user_id = int(user_id_str)
    except (ValueError, TypeError):
        print(f"DEBUG get_current_user: Failed to convert user_id to int: {user_id_str}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
        )
    
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive",
        )
    
    return user


async def get_current_active_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """Get current active user"""
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive"
        )
    return current_user


def require_role(*allowed_roles: UserRole):
    """Dependency to require specific user roles"""
    async def role_checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You don't have permission to access this resource"
            )
        return current_user
    return role_checker


# Role-based dependencies
async def require_admin(current_user: User = Depends(get_current_user)) -> User:
    """Require admin role"""
    # Convert role to string for comparison if needed
    user_role = current_user.role if isinstance(current_user.role, str) else current_user.role.value
    user_role_lower = user_role.lower()
    allowed_roles = ["system_admin", "developer", "administrator"]
    
    print(f"DEBUG: User role: {user_role} (lowercase: {user_role_lower}), Allowed: {allowed_roles}")
    
    if user_role_lower not in allowed_roles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Admin access required. Your role: {user_role}"
        )
    return current_user


async def require_system_admin(current_user: User = Depends(get_current_user)) -> User:
    """Require system admin role"""
    # Convert role to string for comparison if needed
    user_role = current_user.role if isinstance(current_user.role, str) else current_user.role.value
    user_role_lower = user_role.lower()
    allowed_roles = ["system_admin", "developer"]
    
    if user_role_lower not in allowed_roles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"System admin access required. Your role: {user_role}"
        )
    return current_user


# Optional authentication
async def get_current_user_optional(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: AsyncSession = Depends(get_db)
) -> Optional[User]:
    """Get current user if authenticated, otherwise None"""
    if credentials is None:
        return None
    
    try:
        return await get_current_user(credentials, db)
    except HTTPException:
        return None
