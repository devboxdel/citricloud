#!/usr/bin/env python3
"""
Update role colors in the database to match the new color scheme
"""
import asyncio
import sys
sys.path.insert(0, '/home/ubuntu/infrastructure/cloud/web-development/websites/citricloud.com/backend')

from app.core.database import SessionLocal
from app.models.models import Role
from sqlalchemy import select

async def update_colors():
    """Update role colors to new vibrant scheme"""
    
    COLOR_UPDATES = {
        'developer': 'teal',
        'administrator': 'purple',
        'spectator': 'rose',
        'employee': 'cyan',
        'operator': 'indigo',
        'user': 'blue',
        'guest': 'gray',
    }
    
    async with SessionLocal() as db:
        print("=" * 60)
        print("Updating Role Colors")
        print("=" * 60)
        print()
        
        updated_count = 0
        
        for role_key, new_color in COLOR_UPDATES.items():
            result = await db.execute(select(Role).where(Role.role_key == role_key))
            role = result.scalar_one_or_none()
            
            if role:
                old_color = role.color
                role.color = new_color
                print(f"✓ {role.name}: {old_color} → {new_color}")
                updated_count += 1
            else:
                print(f"⊘ {role_key}: not found")
        
        await db.commit()
        
        print()
        print("=" * 60)
        print(f"Updated {updated_count} role colors")
        print("=" * 60)

if __name__ == "__main__":
    asyncio.run(update_colors())
