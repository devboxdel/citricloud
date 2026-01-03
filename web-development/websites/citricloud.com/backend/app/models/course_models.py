from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class Lesson(Base):
    __tablename__ = "lessons"
    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    title = Column(String(255), nullable=False)
    content = Column(String, nullable=False)
    completed = Column(Boolean, default=False)

class Course(Base):
    __tablename__ = "courses"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(255), nullable=False)
    category = Column(String(100), nullable=False)
    duration = Column(String(50), nullable=False)
    level = Column(String(50), nullable=False)
    snippet = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    is_favorite = Column(Boolean, default=False)
    labels = Column(String(255), nullable=True)  # Comma-separated labels
    completed = Column(Boolean, default=False)
    progress = Column(Integer, default=0)

    user = relationship("User")
    lessons = relationship("Lesson", cascade="all, delete-orphan", backref="course")
