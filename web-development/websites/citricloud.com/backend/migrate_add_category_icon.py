#!/usr/bin/env python3
"""
Migration script to add icon column to blog_categories table
"""
import os
import sys
from pathlib import Path

# Add the backend directory to path
sys.path.insert(0, str(Path(__file__).parent))

from sqlalchemy import text, inspect, create_engine
from app.core.config import settings

def add_category_icon():
    """Add icon column to blog_categories table if it doesn't exist"""
    
    # Convert async database URL to sync URL
    database_url = settings.DATABASE_URL
    if database_url.startswith('postgresql+asyncpg'):
        database_url = database_url.replace('postgresql+asyncpg', 'postgresql')
    
    # Create sync engine
    engine = create_engine(database_url)
    
    # Check if column already exists
    inspector = inspect(engine)
    columns = [col['name'] for col in inspector.get_columns('blog_categories')]
    
    if 'icon' in columns:
        print("✓ Column 'icon' already exists in blog_categories table")
        engine.dispose()
        return True
    
    # Add the column
    try:
        with engine.begin() as connection:
            connection.execute(text(
                "ALTER TABLE blog_categories ADD COLUMN icon VARCHAR(100)"
            ))
            # Set default icon for existing categories
            connection.execute(text(
                "UPDATE blog_categories SET icon = 'pricetag' WHERE icon IS NULL"
            ))
        print("✓ Successfully added 'icon' column to blog_categories table")
        engine.dispose()
        return True
    except Exception as e:
        print(f"✗ Error adding column: {e}")
        engine.dispose()
        return False

if __name__ == "__main__":
    print("Starting migration to add icon column to blog_categories...")
    success = add_category_icon()
    sys.exit(0 if success else 1)
