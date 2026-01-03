#!/usr/bin/env python3
"""
Script to reset user password or create test user
"""
import asyncio
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import SessionLocal
from app.core.security import get_password_hash
from app.models.models import User

async def reset_password(email: str, new_password: str):
    """Reset password for a user"""
    async with SessionLocal() as db:
        result = await db.execute(select(User).where(User.email == email))
        user = result.scalar_one_or_none()
        
        if user:
            user.hashed_password = get_password_hash(new_password)
            await db.commit()
            print(f"✅ Password reset successfully for {email}")
            print(f"New password: {new_password}")
        else:
            print(f"❌ User with email {email} not found")

async def main():
    # Reset password for existing user
    await reset_password("85guray@gmail.com", "password123")

if __name__ == "__main__":
    asyncio.run(main())
