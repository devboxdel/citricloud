from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Enum, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base
import enum

class FormStatus(str, enum.Enum):
    draft = "draft"
    active = "active"
    closed = "closed"

class Form(Base):
    __tablename__ = "forms"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    status = Column(Enum(FormStatus), default=FormStatus.draft, nullable=False)
    is_starred = Column(Boolean, default=False)
    category = Column(String(100))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    questions = relationship("FormQuestion", back_populates="form", cascade="all, delete-orphan")

class FormQuestion(Base):
    __tablename__ = "form_questions"
    id = Column(Integer, primary_key=True, index=True)
    form_id = Column(Integer, ForeignKey("forms.id"), nullable=False)
    type = Column(String(50), nullable=False)
    question = Column(Text, nullable=False)
    options = Column(Text)  # JSON-encoded list for options
    required = Column(Boolean, default=False)
    order = Column(Integer, default=0)
    form = relationship("Form", back_populates="questions")
