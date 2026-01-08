"""
Script to create collaboration tables in the database.
Run this once to initialize all collaboration features.
"""
from sqlalchemy import create_engine
from app.core.config import settings
from app.models.collaboration_models import Base as CollaborationBase

def create_tables():
    """Create all collaboration tables."""
    print("Creating collaboration tables...")
    
    # Create sync engine from async URL by replacing postgresql+asyncpg with postgresql
    db_url = settings.DATABASE_URL.replace("postgresql+asyncpg://", "postgresql://")
    engine = create_engine(db_url, echo=True)
    
    # Create all collaboration tables
    CollaborationBase.metadata.create_all(bind=engine)
    
    engine.dispose()
    print("✅ Collaboration tables created successfully!")

if __name__ == "__main__":
    create_tables()
