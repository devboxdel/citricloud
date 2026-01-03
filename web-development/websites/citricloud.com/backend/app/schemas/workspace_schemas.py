from pydantic import BaseModel
from typing import Any, Optional
from datetime import datetime

class WorkspaceItemBase(BaseModel):
    app_name: str
    item_key: str
    data: Any

class WorkspaceItemCreate(WorkspaceItemBase):
    pass

class WorkspaceItemUpdate(BaseModel):
    data: Any

class WorkspaceItemResponse(BaseModel):
    id: int
    app_name: str
    item_key: str
    data: Any
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
