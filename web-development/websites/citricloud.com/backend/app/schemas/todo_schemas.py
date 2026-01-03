from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class TodoBase(BaseModel):
    text: str
    done: bool = False

class TodoCreate(TodoBase):
    pass

class TodoUpdate(TodoBase):
    pass

class TodoResponse(TodoBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime
