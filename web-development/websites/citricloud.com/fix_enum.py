#!/usr/bin/env python3
"""
Fix PostgreSQL userrole enum - Add missing UPPERCASE values
The enum currently has some values in UPPERCASE and some in lowercase
This causes SQLAlchemy to fail when trying to set certain roles
"""
import asyncio
import sys
sys.path.insert(0, '/home/ubuntu/infrastructure/cloud/web-development/websites/citricloud.com/backend')

from app.core.database import SessionLocal
from sqlalchemy import text

async def fix_enum():
    """Add missing enum values to PostgreSQL"""
    
    # These are the roles that need to be added in UPPERCASE
    # (they currently only exist in lowercase)
    missing_uppercase_values = [
        'MODERATOR',
        'SPECTATOR', 
        'SUBSCRIBER',
        'KEYMASTER',
        'EDITOR',
        'CONTRIBUTOR',
        'BLOCKED',
        'AUTHOR',
        'PARTICIPANT',
        'OPERATOR',
        'SUPPORT',
        'FINANCE_MANAGER',
        'EMPLOYEE',
        'ACCOUNTANT',
        'PAYROLL',
        'RECEPTIONIST',
        'MARKETING_ASSISTANT',
        'OFFICER'
    ]
    
    async with SessionLocal() as db:
        print("=" * 60)
        print("Fixing PostgreSQL userrole enum")
        print("=" * 60)
        print()
        
        # Get current enum values
        result = await db.execute(text("SELECT unnest(enum_range(NULL::userrole))"))
        current_values = [str(v) for v in result.scalars().all()]
        
        print(f"Current enum has {len(current_values)} values")
        print()
        
        # Add missing values
        added_count = 0
        for value in missing_uppercase_values:
            if value not in current_values:
                print(f"Adding: {value}")
                try:
                    await db.execute(text(f"ALTER TYPE userrole ADD VALUE '{value}'"))
                    await db.commit()
                    added_count += 1
                except Exception as e:
                    print(f"  ⚠ Error (might already exist): {e}")
                    await db.rollback()
            else:
                print(f"✓ Exists: {value}")
        
        print()
        print("=" * 60)
        print(f"Added {added_count} new enum values")
        print("=" * 60)
        
        # Verify final state
        print()
        print("Final enum values:")
        result = await db.execute(text("SELECT unnest(enum_range(NULL::userrole))"))
        all_values = result.scalars().all()
        for v in sorted(all_values):
            print(f"  - {v}")
        
        print()
        print(f"Total: {len(all_values)} values")

if __name__ == "__main__":
    asyncio.run(fix_enum())
