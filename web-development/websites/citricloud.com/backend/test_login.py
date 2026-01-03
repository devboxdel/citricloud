import asyncio
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import async_session
from app.models.models import User
from app.core.security import get_password_hash
from sqlalchemy import select

async def create_test_user():
    async with async_session() as session:
        # Check if user exists
        result = await session.execute(
            select(User).where(User.email == "test@citricloud.com")
        )
        user = result.scalar_one_or_none()
        
        if user:
            print("Test user already exists")
            print(f"Email: test@citricloud.com")
            print("Password: Test123!")
        else:
            # Create new user
            user = User(
                email="test@citricloud.com",
                username="testuser",
                password_hash=get_password_hash("Test123!"),
                role="admin",
                is_active=True
            )
            session.add(user)
            await session.commit()
            print("Test user created successfully!")
            print(f"Email: test@citricloud.com")
            print("Password: Test123!")

asyncio.run(create_test_user())
