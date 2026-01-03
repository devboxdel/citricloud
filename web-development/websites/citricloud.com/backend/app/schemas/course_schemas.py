from pydantic import BaseModel, field_validator
from typing import List, Optional
from datetime import datetime

class LessonBase(BaseModel):
    title: str
    content: str
    completed: Optional[bool] = False

class LessonCreate(LessonBase):
    pass

class LessonUpdate(LessonBase):
    pass

class LessonResponse(LessonBase):
    id: int
    course_id: int

    class Config:
        from_attributes = True

class CourseBase(BaseModel):
    title: str
    category: str
    duration: str
    level: str
    snippet: Optional[str] = None
    is_favorite: Optional[bool] = False
    labels: Optional[List[str]] = []
    completed: Optional[bool] = False
    progress: Optional[int] = 0

class CourseCreate(CourseBase):
    lessons: List[LessonCreate]

class CourseUpdate(CourseBase):
    lessons: Optional[List[LessonUpdate]] = None

class CourseResponse(BaseModel):
    id: int
    user_id: int
    title: str
    category: str
    duration: str
    level: str
    snippet: Optional[str] = None
    is_favorite: Optional[bool] = False
    labels: List[str] = []  # Will be converted from string
    completed: Optional[bool] = False
    progress: Optional[int] = 0
    created_at: datetime
    lessons: List[LessonResponse]

    @field_validator('labels', mode='before')
    @classmethod
    def split_labels(cls, v):
        if isinstance(v, str) and v:
            return v.split(',')
        return []

    class Config:
        from_attributes = True
