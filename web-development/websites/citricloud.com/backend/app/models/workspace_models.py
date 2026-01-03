from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base
from sqlalchemy.dialects.postgresql import JSONB

class WorkspaceItem(Base):
    __tablename__ = "workspace_items"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    app_name = Column(String(100), nullable=False, index=True)
    item_key = Column(String(100), nullable=False, index=True)
    data = Column(JSONB, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User")
