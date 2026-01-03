#!/usr/bin/env python3
"""
Direct database script to create missing roles
This bypasses the API and directly inserts roles into the database
"""
import asyncio
import sys
sys.path.insert(0, '/home/ubuntu/infrastructure/cloud/web-development/websites/citricloud.com/backend')

from app.core.database import SessionLocal
from app.models.models import Role
from sqlalchemy import select

async def create_roles():
    """Create all default roles directly in the database"""
    
    DEFAULT_ROLES = [
        {'name': 'System Admin', 'role_key': 'system_admin', 'description': 'Full system access with all permissions', 'color': 'red', 'is_system_role': True},
        {'name': 'Developer', 'role_key': 'developer', 'description': 'Software development and technical access', 'color': 'cyan', 'is_system_role': True},
        {'name': 'Administrator', 'role_key': 'administrator', 'description': 'Administrative access to manage users and settings', 'color': 'blue', 'is_system_role': True},
        {'name': 'Manager', 'role_key': 'manager', 'description': 'Team and project management', 'color': 'orange', 'is_system_role': False},
        {'name': 'Moderator', 'role_key': 'moderator', 'description': 'Content moderation and user management', 'color': 'yellow', 'is_system_role': False},
        {'name': 'Spectator', 'role_key': 'spectator', 'description': 'View-only access to the system', 'color': 'gray', 'is_system_role': False},
        {'name': 'Subscriber', 'role_key': 'subscriber', 'description': 'Subscription user with premium access', 'color': 'green', 'is_system_role': False},
        {'name': 'Keymaster', 'role_key': 'keymaster', 'description': 'Key management and security access', 'color': 'amber', 'is_system_role': False},
        {'name': 'Editor', 'role_key': 'editor', 'description': 'Content editor with publishing rights', 'color': 'purple', 'is_system_role': False},
        {'name': 'Contributor', 'role_key': 'contributor', 'description': 'Content contributor without publishing rights', 'color': 'teal', 'is_system_role': False},
        {'name': 'Blocked', 'role_key': 'blocked', 'description': 'Blocked user with restricted access', 'color': 'red', 'is_system_role': False},
        {'name': 'Author', 'role_key': 'author', 'description': 'Content author who can publish own posts', 'color': 'indigo', 'is_system_role': False},
        {'name': 'Participant', 'role_key': 'participant', 'description': 'Active participant in community activities', 'color': 'lime', 'is_system_role': False},
        {'name': 'Operator', 'role_key': 'operator', 'description': 'System operator with operational access', 'color': 'slate', 'is_system_role': False},
        {'name': 'Support', 'role_key': 'support', 'description': 'Customer support and assistance', 'color': 'blue', 'is_system_role': False},
        {'name': 'Finance Manager', 'role_key': 'finance_manager', 'description': 'Financial management and oversight', 'color': 'emerald', 'is_system_role': False},
        {'name': 'Employee', 'role_key': 'employee', 'description': 'Standard employee access', 'color': 'neutral', 'is_system_role': False},
        {'name': 'Accountant', 'role_key': 'accountant', 'description': 'Accounting and financial records', 'color': 'green', 'is_system_role': False},
        {'name': 'Payroll', 'role_key': 'payroll', 'description': 'Payroll management and processing', 'color': 'sky', 'is_system_role': False},
        {'name': 'Receptionist', 'role_key': 'receptionist', 'description': 'Front desk and reception duties', 'color': 'pink', 'is_system_role': False},
        {'name': 'Marketing Assistant', 'role_key': 'marketing_assistant', 'description': 'Marketing support and campaigns', 'color': 'fuchsia', 'is_system_role': False},
        {'name': 'Officer', 'role_key': 'officer', 'description': 'Company officer with authority', 'color': 'violet', 'is_system_role': False},
        {'name': 'User', 'role_key': 'user', 'description': 'Standard user access', 'color': 'stone', 'is_system_role': False},
        {'name': 'Guest', 'role_key': 'guest', 'description': 'Guest access with limited permissions', 'color': 'zinc', 'is_system_role': False},
    ]
    
    async with SessionLocal() as db:
        print("=" * 60)
        print("CITRICLOUD - Direct Database Role Creation")
        print("=" * 60)
        print()
        
        success_count = 0
        skip_count = 0
        
        for role_data in DEFAULT_ROLES:
            # Check if role already exists
            result = await db.execute(select(Role).where(Role.role_key == role_data['role_key']))
            existing_role = result.scalar_one_or_none()
            
            if existing_role:
                print(f"⊘ Skipped: {role_data['name']} (already exists)")
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
            print(f"✓ Created: {role_data['name']}")
            success_count += 1
        
        await db.commit()
        
        print()
        print("=" * 60)
        print(f"SUCCESS: Created {success_count} roles")
        print(f"         Skipped {skip_count} existing roles")
        print(f"         Total: {success_count + skip_count} roles in database")
        print("=" * 60)
        
        # Verify by listing all roles
        print()
        print("All roles in database:")
        result = await db.execute(select(Role).order_by(Role.name))
        all_roles = result.scalars().all()
        for role in all_roles:
            print(f"  - {role.name} ({role.role_key})")

if __name__ == "__main__":
    asyncio.run(create_roles())
