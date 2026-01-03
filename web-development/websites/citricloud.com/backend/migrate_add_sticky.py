#!/usr/bin/env python3
"""
Migration script to add is_sticky column to blog_posts table
"""
import os
import sys
from pathlib import Path

# Add the backend directory to path
sys.path.insert(0, str(Path(__file__).parent))

from sqlalchemy import text, inspect, create_engine
from app.core.config import settings

def add_sticky_column():
    """Add is_sticky column to blog_posts table if it doesn't exist"""
    
    # Convert async database URL to sync URL
    database_url = settings.DATABASE_URL
    if database_url.startswith('postgresql+asyncpg'):
        database_url = database_url.replace('postgresql+asyncpg', 'postgresql')
    
    # Create sync engine
    engine = create_engine(database_url)
    
    # Check if column already exists
    inspector = inspect(engine)
    columns = [col['name'] for col in inspector.get_columns('blog_posts')]
    
    if 'is_sticky' in columns:
        print("✓ Column 'is_sticky' already exists in blog_posts table")
        engine.dispose()
        return True
    
    # Add the column
    try:
        with engine.begin() as connection:
            connection.execute(text(
                "ALTER TABLE blog_posts ADD COLUMN is_sticky BOOLEAN DEFAULT FALSE"
            ))
        print("✓ Successfully added 'is_sticky' column to blog_posts table")
        engine.dispose()
        return True
    except Exception as e:
        print(f"✗ Error adding column: {e}")
        engine.dispose()
        return False

if __name__ == "__main__":
    print("Starting migration to add is_sticky column...")
    success = add_sticky_column()
    sys.exit(0 if success else 1)
