"""
Create test user for login testing
"""
import asyncio
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import SessionLocal
from app.models.models import User, UserRole
from app.models import email_models  # Import to register Email model
from app.core.security import get_password_hash

async def create_test_user():
    async with SessionLocal() as db:
        # Check if user exists
        result = await db.execute(select(User).where(User.email == "85guray@gmail.com"))
        user = result.scalar_one_or_none()
        
        if user:
            print(f"✓ User already exists: {user.email}")
            print(f"  ID: {user.id}")
            print(f"  Username: {user.username}")
            print(f"  Is Active: {user.is_active}")
            print(f"  Role: {user.role}")
            
            # Update password to FBkolik07
            user.hashed_password = get_password_hash("FBkolik07")
            await db.commit()
            print(f"✓ Password updated to: FBkolik07")
        else:
            # Create new user
            user = User(
                email="85guray@gmail.com",
                username="guray",
                hashed_password=get_password_hash("FBkolik07"),
                full_name="Guray",
                role=UserRole.ADMIN,
                is_active=True,
            )
            db.add(user)
            await db.commit()
            await db.refresh(user)
            print(f"✓ Created new user:")
            print(f"  Email: {user.email}")
            print(f"  Password: FBkolik07")
            print(f"  Username: {user.username}")
            print(f"  Role: {user.role}")

if __name__ == "__main__":
    asyncio.run(create_test_user())
