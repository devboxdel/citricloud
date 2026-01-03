from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class FormQuestionBase(BaseModel):
    type: str
    question: str
    options: Optional[str] = None  # JSON-encoded list
    required: bool = False
    order: int = 0

class FormQuestionCreate(FormQuestionBase):
    pass

class FormQuestionUpdate(FormQuestionBase):
    pass

class FormQuestionResponse(FormQuestionBase):
    id: int

    class Config:
        from_attributes = True

class FormBase(BaseModel):
    title: str
    description: Optional[str] = None
    status: str = 'draft'
    is_starred: bool = False
    category: Optional[str] = None

class FormCreate(FormBase):
    questions: Optional[List[FormQuestionCreate]] = []

class FormUpdate(FormBase):
    questions: Optional[List[FormQuestionUpdate]] = []

class FormResponse(FormBase):
    id: int
    created_at: datetime
    updated_at: datetime
    questions: List[FormQuestionResponse] = []

    class Config:
        from_attributes = True
