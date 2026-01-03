"""
API endpoints for Bookings
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List as TypingList
from app.core.database import get_db
from app.api.dependencies import get_current_user
from app.models.booking_models import Booking as BookingModel
from app.models.models import User
from app.schemas.booking_schemas import BookingCreate, BookingUpdate, BookingResponse

router = APIRouter()

@router.get("/bookings", response_model=TypingList[BookingResponse])
async def get_bookings(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(select(BookingModel).where(BookingModel.user_id == current_user.id))
    return result.scalars().all()

@router.post("/bookings", response_model=BookingResponse)
async def create_booking(booking_in: BookingCreate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    new_booking = BookingModel(user_id=current_user.id, **booking_in.dict())
    db.add(new_booking)
    await db.commit()
    await db.refresh(new_booking)
    return new_booking

@router.put("/bookings/{booking_id}", response_model=BookingResponse)
async def update_booking(booking_id: int, booking_in: BookingUpdate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(select(BookingModel).where(BookingModel.id == booking_id, BookingModel.user_id == current_user.id))
    db_booking = result.scalar_one_or_none()
    if not db_booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    for field, value in booking_in.dict().items():
        setattr(db_booking, field, value)
    await db.commit()
    await db.refresh(db_booking)
    return db_booking

@router.delete("/bookings/{booking_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_booking(booking_id: int, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(select(BookingModel).where(BookingModel.id == booking_id, BookingModel.user_id == current_user.id))
    db_booking = result.scalar_one_or_none()
    if not db_booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    await db.delete(db_booking)
    await db.commit()
    return
