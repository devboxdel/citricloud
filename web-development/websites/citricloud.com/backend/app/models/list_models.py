from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class List(Base):
    __tablename__ = "lists"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    items = relationship("ListItem", back_populates="list", cascade="all, delete-orphan")

class ListItem(Base):
    __tablename__ = "list_items"
    id = Column(Integer, primary_key=True, index=True)
    list_id = Column(Integer, ForeignKey("lists.id"), nullable=False)
    text = Column(String(1000), nullable=False)
    checked = Column(Boolean, default=False)
    priority = Column(String(20), default="medium")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    list = relationship("List", back_populates="items")
