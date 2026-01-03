"""
CRM Dashboard - User management routes
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, String
from typing import List, Optional
from datetime import datetime
import logging

from app.core.database import get_db
from app.api.dependencies import get_current_user, require_admin
from app.models.models import User, UserRole, Role
from app.schemas.schemas import UserResponse, UserCreate, UserUpdate, PaginatedResponse, RoleResponse, RoleCreate, RoleUpdate, MessageCreate, MessageUpdate, MessageResponse
from app.core.security import get_password_hash

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/users", response_model=PaginatedResponse)
async def list_users(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: Optional[str] = None,
    role: Optional[UserRole] = None,
    is_active: Optional[bool] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """List users with pagination and filters"""
    query = select(User)
    
    # Apply filters
    if search:
        query = query.where(
            (User.email.ilike(f"%{search}%")) |
            (User.username.ilike(f"%{search}%")) |
            (User.full_name.ilike(f"%{search}%"))
        )
    
    if role:
        query = query.where(User.role == role)
    
    if is_active is not None:
        query = query.where(User.is_active == is_active)
    
    # Get total count
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar()
    
    # Apply pagination
    query = query.offset((page - 1) * page_size).limit(page_size)
    
    result = await db.execute(query)
    users = result.scalars().all()
    
    # Convert to UserResponse schemas
    user_responses = [UserResponse.model_validate(user) for user in users]
    
    return {
        "items": user_responses,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (total + page_size - 1) // page_size
    }


@router.put("/users/{user_id}/role/{role_id}", response_model=UserResponse)
async def assign_user_role(
    user_id: int,
    role_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Assign a user to a CRM role"""
    # Verify user exists
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Verify role exists
    result = await db.execute(select(Role).where(Role.id == role_id))
    role = result.scalar_one_or_none()
    if not role:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Role not found"
        )
    
    # Assign role to user
    user.role_id = role_id
    await db.commit()
    await db.refresh(user)
    
    return user


# Place static "me" routes BEFORE dynamic /users/{user_id} to avoid conflicts
@router.get("/users/me", response_model=UserResponse)
async def get_me(
    current_user: User = Depends(get_current_user),
):
    """Get current authenticated user's profile"""
    return current_user


@router.put("/users/me", response_model=UserResponse)
async def update_me(
    user_data: UserUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update current authenticated user's profile (self-service)"""
    # Only allow updating specific fields
    updates = user_data.model_dump(exclude_unset=True)
    allowed_fields = {"full_name", "phone", "avatar_url"}
    for field, value in updates.items():
        if field in allowed_fields:
            setattr(current_user, field, value)

    await db.commit()
    await db.refresh(current_user)

    return current_user


@router.get("/users/me/preferences")
async def get_user_preferences(
    current_user: User = Depends(get_current_user)
):
    """Get current user's preferences"""
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
        "phone_number": current_user.phone,
        # Two-Factor Authentication settings
        "two_factor_enabled": current_user.two_factor_enabled or False,
        "totp_secret": current_user.two_factor_secret,
        "backup_codes": current_user.two_factor_backup_codes or []
    }


@router.put("/users/me/preferences")
async def update_user_preferences(
    payload: dict,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update current user's preferences"""
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
    
    # Two-Factor Authentication settings
    if "two_factor_enabled" in data and data["two_factor_enabled"]:
        # If enabling 2FA, verify the code first
        if "verify_code" in data and "totp_secret" in data:
            import pyotp
            totp = pyotp.TOTP(data["totp_secret"])
            if not totp.verify(data["verify_code"], valid_window=1):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid verification code. Please check your authenticator app and try again."
                )
        current_user.two_factor_enabled = data["two_factor_enabled"]
    elif "two_factor_enabled" in data and not data["two_factor_enabled"]:
        # Disabling 2FA
        current_user.two_factor_enabled = False
        
    if "totp_secret" in data:
        current_user.two_factor_secret = data["totp_secret"]
    if "backup_codes" in data:
        current_user.two_factor_backup_codes = data["backup_codes"]
    
    db.add(current_user)
    await db.commit()
    await db.refresh(current_user)
    
    return {"message": "Preferences updated successfully"}


@router.get("/users/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Get user by ID"""
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return user


@router.post("/users", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(
    user_data: UserCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Create a new user"""
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
    
    user = User(
        email=user_data.email,
        username=user_data.username,
        hashed_password=get_password_hash(user_data.password),
        full_name=user_data.full_name,
        role=user_data.role,
        phone=user_data.phone,
    )
    
    db.add(user)
    await db.commit()
    await db.refresh(user)
    
    return user


@router.put("/users/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: int,
    user_data: UserUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Update user"""
    try:
        result = await db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Update fields
        update_data = user_data.model_dump(exclude_unset=True)
        
        logger.info(f"Updating user {user_id} with data: {update_data}")
        
        for field, value in update_data.items():
            # Handle role field - convert to lowercase to match UserRole enum values
            if field == 'role' and value is not None:
                role_value = value.lower()
                logger.info(f"Setting role to: {role_value}")
                # Validate role exists in UserRole enum
                try:
                    UserRole(role_value)  # This will raise ValueError if invalid
                    setattr(user, field, role_value)
                except ValueError as e:
                    logger.error(f"Invalid role value: {role_value}. Valid roles: {[r.value for r in UserRole]}")
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"Invalid role: {role_value}. Must be one of: {', '.join([r.value for r in UserRole])}"
                    )
            else:
                setattr(user, field, value)
        
        await db.commit()
        await db.refresh(user)
        
        logger.info(f"Successfully updated user {user_id}")
        return user
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating user {user_id}: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating user: {str(e)}"
        )
    
    return user




@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Delete user - soft delete (deactivate) active users, hard delete inactive users"""
    if user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete your own account"
        )
    
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # If user is already inactive, hard delete (permanent removal)
    if not user.is_active:
        await db.delete(user)
        await db.commit()
        return None
    
    # If user is active, soft delete (deactivate)
    user.is_active = False
    await db.commit()
    
    return None


@router.get("/stats")
async def get_crm_stats(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Get CRM statistics"""
    # Total users
    total_users_result = await db.execute(select(func.count(User.id)))
    total_users = total_users_result.scalar()
    
    # Active users
    active_users_result = await db.execute(
        select(func.count(User.id)).where(User.is_active == True)
    )
    active_users = active_users_result.scalar()
    
    # Users by role
    roles_result = await db.execute(
        select(User.role, func.count(User.id)).group_by(User.role)
    )
    users_by_role = {role: count for role, count in roles_result.all()}  # role is now a string
    
    return {
        "total_users": total_users,
        "active_users": active_users,
        "inactive_users": total_users - active_users,
        "users_by_role": users_by_role
    }


# ========== ROLE MANAGEMENT ==========

@router.post("/roles/initialize", tags=["CRM Dashboard"])
async def initialize_default_roles(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Initialize default roles - creates essential roles if they don't exist"""
    
    DEFAULT_ROLES = [
        {'name': 'System Admin', 'role_key': 'system_admin', 'description': 'Full system access with all permissions', 'color': 'red', 'is_system_role': True},
        {'name': 'Developer', 'role_key': 'developer', 'description': 'Software development and technical access', 'color': 'teal', 'is_system_role': True},
        {'name': 'Administrator', 'role_key': 'administrator', 'description': 'Administrative access to manage users and settings', 'color': 'purple', 'is_system_role': True},
        {'name': 'Manager', 'role_key': 'manager', 'description': 'Team and project management', 'color': 'orange', 'is_system_role': False},
        {'name': 'Moderator', 'role_key': 'moderator', 'description': 'Content moderation and user management', 'color': 'yellow', 'is_system_role': False},
        {'name': 'Spectator', 'role_key': 'spectator', 'description': 'View-only access to the system', 'color': 'rose', 'is_system_role': False},
        {'name': 'Subscriber', 'role_key': 'subscriber', 'description': 'Subscription user with premium access', 'color': 'green', 'is_system_role': False},
        {'name': 'Keymaster', 'role_key': 'keymaster', 'description': 'Key management and security access', 'color': 'amber', 'is_system_role': False},
        {'name': 'Editor', 'role_key': 'editor', 'description': 'Content editor with publishing rights', 'color': 'purple', 'is_system_role': False},
        {'name': 'Contributor', 'role_key': 'contributor', 'description': 'Content contributor without publishing rights', 'color': 'teal', 'is_system_role': False},
        {'name': 'Blocked', 'role_key': 'blocked', 'description': 'Blocked user with restricted access', 'color': 'red', 'is_system_role': False},
        {'name': 'Author', 'role_key': 'author', 'description': 'Content author who can publish own posts', 'color': 'indigo', 'is_system_role': False},
        {'name': 'Participant', 'role_key': 'participant', 'description': 'Active participant in community activities', 'color': 'lime', 'is_system_role': False},
        {'name': 'Operator', 'role_key': 'operator', 'description': 'System operator with operational access', 'color': 'indigo', 'is_system_role': False},
        {'name': 'Support', 'role_key': 'support', 'description': 'Customer support and assistance', 'color': 'blue', 'is_system_role': False},
        {'name': 'Finance Manager', 'role_key': 'finance_manager', 'description': 'Financial management and oversight', 'color': 'emerald', 'is_system_role': False},
        {'name': 'Employee', 'role_key': 'employee', 'description': 'Standard employee access', 'color': 'cyan', 'is_system_role': False},
        {'name': 'Accountant', 'role_key': 'accountant', 'description': 'Accounting and financial records', 'color': 'green', 'is_system_role': False},
        {'name': 'Payroll', 'role_key': 'payroll', 'description': 'Payroll management and processing', 'color': 'sky', 'is_system_role': False},
        {'name': 'Receptionist', 'role_key': 'receptionist', 'description': 'Front desk and reception duties', 'color': 'pink', 'is_system_role': False},
        {'name': 'Marketing Assistant', 'role_key': 'marketing_assistant', 'description': 'Marketing support and campaigns', 'color': 'fuchsia', 'is_system_role': False},
        {'name': 'Officer', 'role_key': 'officer', 'description': 'Company officer with authority', 'color': 'violet', 'is_system_role': False},
        {'name': 'User', 'role_key': 'user', 'description': 'Standard user access', 'color': 'blue', 'is_system_role': False},
        {'name': 'Guest', 'role_key': 'guest', 'description': 'Guest access with limited permissions', 'color': 'gray', 'is_system_role': False},
    ]
    
    success_count = 0
    skip_count = 0
    
    for role_data in DEFAULT_ROLES:
        # Check if role already exists
        result = await db.execute(select(Role).where(Role.role_key == role_data['role_key']))
        existing_role = result.scalar_one_or_none()
        
        if existing_role:
            skip_count += 1
            continue
        
        # Create new role
        new_role = Role(
            name=role_data['name'],
            role_key=role_data['role_key'],
            description=role_data['description'],
            color=role_data['color'],
            is_system_role=role_data['is_system_role'],
            permissions={}
        )
        db.add(new_role)
        success_count += 1
    
    await db.commit()
    
    return {
        "successCount": success_count,
        "skipCount": skip_count,
        "message": f"Initialized {success_count} roles ({skip_count} already existed)"
    }


@router.get("/roles")
async def list_roles(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all roles with pagination - available to all authenticated users"""
    try:
        query = select(Role)
        
        if search:
            query = query.where(
                (Role.name.ilike(f"%{search}%")) |
                (Role.description.ilike(f"%{search}%"))
            )
        
        # Get total count
        count_query = select(func.count()).select_from(query.subquery())
        total_result = await db.execute(count_query)
        total = total_result.scalar()
        
        # Apply pagination
        query = query.offset((page - 1) * page_size).limit(page_size)
        
        result = await db.execute(query)
        roles = result.scalars().all()
        
        # Convert to dicts manually to avoid serialization issues
        items = []
        for role in roles:
            # Convert permissions from dict keys to array, or default to empty array
            perms = role.permissions if role.permissions else {}
            permissions_array = list(perms.keys()) if isinstance(perms, dict) else []
            
            # Calculate actual user count from database
            # Cast User.role enum to text and compare case-insensitively
            try:
                user_count_query = select(func.count()).select_from(User).where(
                    func.lower(func.cast(User.role, String)) == role.role_key.lower()
                )
                user_count_result = await db.execute(user_count_query)
                actual_user_count = user_count_result.scalar() or 0
            except Exception as e:
                print(f"Error counting users for role {role.role_key}: {str(e)}")
                actual_user_count = 0
            
            items.append({
                "id": role.id,
                "name": role.name,
                "role_key": role.role_key,
                "description": role.description,
                "color": role.color,
                "is_system_role": role.is_system_role,
                "permissions": permissions_array,
                "user_count": actual_user_count,
                "created_at": role.created_at,
                "updated_at": role.updated_at
            })
        
        return {
            "items": items,
            "total": total,
            "page": page,
            "page_size": page_size,
            "total_pages": (total + page_size - 1) // page_size
        }
    except Exception as e:
        import traceback
        print(f"Error in list_roles: {str(e)}")
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error listing roles: {str(e)}"
        )


@router.get("/roles/{role_id}", response_model=RoleResponse)
async def get_role(
    role_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Get a specific role"""
    result = await db.execute(select(Role).where(Role.id == role_id))
    role = result.scalar_one_or_none()
    
    if not role:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Role not found"
        )
    
    return role


@router.post("/roles", response_model=RoleResponse, status_code=status.HTTP_201_CREATED)
async def create_role(
    role_data: RoleCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Create a new role"""
    # Check if role_key exists
    result = await db.execute(select(Role).where(Role.role_key == role_data.role_key))
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Role key already exists"
        )
    
    # Convert permissions array to dict for storage
    perms_dict = {perm: True for perm in (role_data.permissions or [])} if role_data.permissions else {}
    
    role = Role(
        name=role_data.name,
        role_key=role_data.role_key,
        description=role_data.description,
        color=role_data.color,
        is_system_role=role_data.is_system_role or False,
        permissions=perms_dict
    )
    
    db.add(role)
    await db.commit()
    await db.refresh(role)
    
    return role


@router.put("/roles/{role_id}", response_model=RoleResponse)
async def update_role(
    role_id: int,
    role_data: RoleUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Update a role"""
    try:
        result = await db.execute(select(Role).where(Role.id == role_id))
        role = result.scalar_one_or_none()
        
        if not role:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Role not found"
            )
        
        # Allow updating system roles - they need permission updates
        # if role.is_system_role:
        #     raise HTTPException(
        #         status_code=status.HTTP_400_BAD_REQUEST,
        #         detail="Cannot modify system roles"
        #     )
        
        # Update fields
        update_data = role_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            # Convert permissions array to dict for storage
            if field == 'permissions' and isinstance(value, list):
                value = {perm: True for perm in value}
            setattr(role, field, value)
        
        role.updated_at = datetime.utcnow()
        await db.commit()
        await db.refresh(role)
        
        return role
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating role: {str(e)}"
        )


@router.delete("/roles/{role_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_role(
    role_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Delete a role"""
    result = await db.execute(select(Role).where(Role.id == role_id))
    role = result.scalar_one_or_none()
    
    if not role:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Role not found"
        )
    
    if role.is_system_role:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete system roles"
        )
    
    if role.user_count > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot delete role with {role.user_count} assigned users"
        )
    
    await db.delete(role)
    await db.commit()
    
    return None


@router.get("/roles/{role_id}/users", response_model=PaginatedResponse)
async def get_role_users(
    role_id: int,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Get all users with a specific role"""
    # Verify role exists
    result = await db.execute(select(Role).where(Role.id == role_id))
    role = result.scalar_one_or_none()
    if not role:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Role not found"
        )
    
    # This would require matching UserRole enum value to role_key
    # For now, get users by role_key from UserRole enum
    query = select(User)
    
    # Get total count
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar()
    
    # Apply pagination
    query = query.offset((page - 1) * page_size).limit(page_size)
    
    result = await db.execute(query)
    users = result.scalars().all()
    
    return {
        "items": users,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (total + page_size - 1) // page_size
    }



# ========== Messages Endpoints ==========

@router.post("/messages", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
async def create_message(
    message_data: MessageCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Create a new message (admin/role to user)"""
    from app.models.message_models import Message
    
    # Verify recipient exists
    recipient_result = await db.execute(select(User).where(User.id == message_data.recipient_id))
    recipient = recipient_result.scalar_one_or_none()
    if not recipient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Recipient user not found"
        )
    
    # Create message
    message = Message(
        sender_id=current_user.id,
        recipient_id=message_data.recipient_id,
        subject=message_data.subject,
        content=message_data.content,
        priority=message_data.priority,
    )
    
    db.add(message)
    await db.commit()
    await db.refresh(message)
    
    # Add sender/recipient info
    response_data = {
        "id": message.id,
        "sender_id": message.sender_id,
        "recipient_id": message.recipient_id,
        "subject": message.subject,
        "content": message.content,
        "priority": message.priority,
        "status": message.status,
        "read_at": message.read_at,
        "archived_at": message.archived_at,
        "created_at": message.created_at,
        "updated_at": message.updated_at,
        "sender_name": current_user.full_name or current_user.username,
        "sender_email": current_user.email,
        "recipient_name": recipient.full_name or recipient.username,
        "recipient_email": recipient.email,
    }
    
    return response_data


@router.get("/messages", response_model=PaginatedResponse)
async def list_messages(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    recipient_id: Optional[int] = Query(None),
    status_filter: Optional[str] = Query(None),
    priority_filter: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """List all messages (admin view)"""
    from app.models.message_models import Message
    
    query = select(Message).join(User, Message.recipient_id == User.id, isouter=True)
    
    # Apply filters
    if recipient_id:
        query = query.where(Message.recipient_id == recipient_id)
    if status_filter:
        query = query.where(Message.status == status_filter)
    if priority_filter:
        query = query.where(Message.priority == priority_filter)
    
    # Order by created date (newest first)
    query = query.order_by(Message.created_at.desc())
    
    # Get total count
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar()
    
    # Apply pagination
    query = query.offset((page - 1) * page_size).limit(page_size)
    
    result = await db.execute(query)
    messages = result.scalars().all()
    
    # Enrich with sender/recipient info
    items = []
    for message in messages:
        sender_result = await db.execute(select(User).where(User.id == message.sender_id))
        sender = sender_result.scalar_one_or_none()
        recipient_result = await db.execute(select(User).where(User.id == message.recipient_id))
        recipient = recipient_result.scalar_one_or_none()
        
        items.append({
            "id": message.id,
            "sender_id": message.sender_id,
            "recipient_id": message.recipient_id,
            "subject": message.subject,
            "content": message.content,
            "priority": message.priority,
            "status": message.status,
            "read_at": message.read_at,
            "archived_at": message.archived_at,
            "created_at": message.created_at,
            "updated_at": message.updated_at,
            "sender_name": sender.full_name or sender.username if sender else None,
            "sender_email": sender.email if sender else None,
            "recipient_name": recipient.full_name or recipient.username if recipient else None,
            "recipient_email": recipient.email if recipient else None,
        })
    
    return {
        "items": items,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (total + page_size - 1) // page_size
    }


@router.get("/messages/my", response_model=PaginatedResponse)
async def get_my_messages(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status_filter: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get messages for the authenticated user"""
    from app.models.message_models import Message, MessageStatus
    
    query = select(Message).where(Message.recipient_id == current_user.id)
    
    # Apply status filter
    if status_filter:
        # Convert string to lowercase and use it directly
        if isinstance(status_filter, str):
            try:
                # Validate it's a valid status
                status_enum = MessageStatus(status_filter.lower())
                # Use the string value for comparison since DB column is VARCHAR
                query = query.where(Message.status == status_enum.value)
            except ValueError:
                pass  # Invalid status, ignore filter
    
    # Order by created date (newest first)
    query = query.order_by(Message.created_at.desc())
    
    # Get total count
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar()
    
    # Apply pagination
    query = query.offset((page - 1) * page_size).limit(page_size)
    
    result = await db.execute(query)
    messages = result.scalars().all()
    
    # Enrich with sender info
    items = []
    for message in messages:
        sender_result = await db.execute(select(User).where(User.id == message.sender_id))
        sender = sender_result.scalar_one_or_none()
        
        items.append({
            "id": message.id,
            "sender_id": message.sender_id,
            "recipient_id": message.recipient_id,
            "subject": message.subject,
            "content": message.content,
            "priority": message.priority,
            "status": message.status,
            "read_at": message.read_at,
            "archived_at": message.archived_at,
            "created_at": message.created_at,
            "updated_at": message.updated_at,
            "sender_name": sender.full_name or sender.username if sender else None,
            "sender_email": sender.email if sender else None,
            "recipient_name": current_user.full_name or current_user.username,
            "recipient_email": current_user.email,
        })
    
    return {
        "items": items,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (total + page_size - 1) // page_size
    }


@router.get("/messages/{message_id}", response_model=MessageResponse)
async def get_message(
    message_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific message"""
    from app.models.message_models import Message
    
    result = await db.execute(select(Message).where(Message.id == message_id))
    message = result.scalar_one_or_none()
    
    if not message:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Message not found"
        )
    
    # Check if user has access (sender, recipient, or admin)
    if message.recipient_id != current_user.id and message.sender_id != current_user.id:
        if current_user.role not in ["system_admin", "administrator", "manager"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to view this message"
            )
    
    # Mark as read if recipient is viewing
    if message.recipient_id == current_user.id and message.status == "unread":
        message.status = "read"
        message.read_at = func.now()
        await db.commit()
        await db.refresh(message)
    
    # Get sender and recipient info
    sender_result = await db.execute(select(User).where(User.id == message.sender_id))
    sender = sender_result.scalar_one_or_none()
    recipient_result = await db.execute(select(User).where(User.id == message.recipient_id))
    recipient = recipient_result.scalar_one_or_none()
    
    return {
        "id": message.id,
        "sender_id": message.sender_id,
        "recipient_id": message.recipient_id,
        "subject": message.subject,
        "content": message.content,
        "priority": message.priority,
        "status": message.status,
        "read_at": message.read_at,
        "archived_at": message.archived_at,
        "created_at": message.created_at,
        "updated_at": message.updated_at,
        "sender_name": sender.full_name or sender.username if sender else None,
        "sender_email": sender.email if sender else None,
        "recipient_name": recipient.full_name or recipient.username if recipient else None,
        "recipient_email": recipient.email if recipient else None,
    }


@router.patch("/messages/{message_id}", response_model=MessageResponse)
async def update_message_status(
    message_id: int,
    message_update: MessageUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update message status (mark as read/archived)"""
    from app.models.message_models import Message
    
    result = await db.execute(select(Message).where(Message.id == message_id))
    message = result.scalar_one_or_none()
    
    if not message:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Message not found"
        )
    
    # Check if user has access (recipient or admin)
    if message.recipient_id != current_user.id:
        if current_user.role not in ["system_admin", "administrator", "manager"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to update this message"
            )
    
    # Update status
    if message_update.status:
        message.status = message_update.status
        if message_update.status == "read" and not message.read_at:
            message.read_at = func.now()
        elif message_update.status == "archived" and not message.archived_at:
            message.archived_at = func.now()
    
    await db.commit()
    await db.refresh(message)
    
    # Get sender and recipient info
    sender_result = await db.execute(select(User).where(User.id == message.sender_id))
    sender = sender_result.scalar_one_or_none()
    recipient_result = await db.execute(select(User).where(User.id == message.recipient_id))
    recipient = recipient_result.scalar_one_or_none()
    
    return {
        "id": message.id,
        "sender_id": message.sender_id,
        "recipient_id": message.recipient_id,
        "subject": message.subject,
        "content": message.content,
        "priority": message.priority,
        "status": message.status,
        "read_at": message.read_at,
        "archived_at": message.archived_at,
        "created_at": message.created_at,
        "updated_at": message.updated_at,
        "sender_name": sender.full_name or sender.username if sender else None,
        "sender_email": sender.email if sender else None,
        "recipient_name": recipient.full_name or recipient.username if recipient else None,
        "recipient_email": recipient.email if recipient else None,
    }


@router.delete("/messages/{message_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_message(
    message_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Delete a message (admin only)"""
    from app.models.message_models import Message
    
    result = await db.execute(select(Message).where(Message.id == message_id))
    message = result.scalar_one_or_none()
    
    if not message:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Message not found"
        )
    
    await db.delete(message)
    await db.commit()
    
    return None
