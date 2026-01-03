from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class BookingBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    start_time: datetime
    end_time: datetime
    location: Optional[str] = None

class BookingCreate(BookingBase):
    pass

class BookingUpdate(BookingBase):
    pass

class BookingResponse(BookingBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
