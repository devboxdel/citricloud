#!/usr/bin/env python3
"""
Migration script to add blog_post_related table for related posts feature
"""
import os
import sys
from pathlib import Path

# Add the backend directory to path
sys.path.insert(0, str(Path(__file__).parent))

from sqlalchemy import text, inspect, create_engine
from app.core.config import settings

def add_related_posts_table():
    """Add blog_post_related association table if it doesn't exist"""
    
    # Convert async database URL to sync URL
    database_url = settings.DATABASE_URL
    if database_url.startswith('postgresql+asyncpg'):
        database_url = database_url.replace('postgresql+asyncpg', 'postgresql')
    
    # Create sync engine
    engine = create_engine(database_url)
    
    # Check if table already exists
    inspector = inspect(engine)
    tables = inspector.get_table_names()
    
    if 'blog_post_related' in tables:
        print("✓ Table 'blog_post_related' already exists")
        engine.dispose()
        return True
    
    # Create the table
    try:
        with engine.begin() as connection:
            connection.execute(text("""
                CREATE TABLE blog_post_related (
                    blog_post_id INTEGER NOT NULL,
                    related_post_id INTEGER NOT NULL,
                    PRIMARY KEY (blog_post_id, related_post_id),
                    FOREIGN KEY (blog_post_id) REFERENCES blog_posts(id) ON DELETE CASCADE,
                    FOREIGN KEY (related_post_id) REFERENCES blog_posts(id) ON DELETE CASCADE
                )
            """))
            
            # Create indexes for better performance
            connection.execute(text(
                "CREATE INDEX idx_blog_post_related_post_id ON blog_post_related(blog_post_id)"
            ))
            connection.execute(text(
                "CREATE INDEX idx_blog_post_related_related_id ON blog_post_related(related_post_id)"
            ))
            
        print("✓ Successfully created 'blog_post_related' table with indexes")
        engine.dispose()
        return True
    except Exception as e:
        print(f"✗ Error creating table: {e}")
        engine.dispose()
        return False

if __name__ == "__main__":
    print("Starting migration to add blog_post_related table...")
    success = add_related_posts_table()
    sys.exit(0 if success else 1)
