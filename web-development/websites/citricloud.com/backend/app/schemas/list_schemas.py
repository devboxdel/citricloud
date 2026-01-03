from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class ListItemBase(BaseModel):
    text: str
    checked: bool = False
    priority: Optional[str] = "medium"

class ListItemCreate(ListItemBase):
    pass

class ListItemUpdate(ListItemBase):
    pass

class ListItemResponse(ListItemBase):
    id: int
    created_at: datetime
    updated_at: datetime

class ListBase(BaseModel):
    name: str

class ListCreate(ListBase):
    pass

class ListUpdate(ListBase):
    pass

class ListResponse(ListBase):
    id: int
    created_at: datetime
    updated_at: datetime
    items: Optional[list[ListItemResponse]] = []
