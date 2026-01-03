
"""
API endpoints for Lists and ListItems
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from typing import List as TypingList
from app.core.database import get_db
from app.api.dependencies import get_current_user
from app.models.list_models import List as ListModel, ListItem as ListItemModel
from app.models.models import User
from app.schemas.list_schemas import ListCreate, ListUpdate, ListResponse, ListItemCreate, ListItemUpdate, ListItemResponse

router = APIRouter()

@router.get("/lists", response_model=TypingList[ListResponse])
async def get_lists(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(select(ListModel).options(selectinload(ListModel.items)).where(ListModel.user_id == current_user.id))
    return result.scalars().all()

@router.post("/lists", response_model=ListResponse)
async def create_list(list_in: ListCreate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    new_list = ListModel(user_id=current_user.id, name=list_in.name)
    db.add(new_list)
    await db.commit()
    await db.refresh(new_list)
    return new_list

@router.put("/lists/{list_id}", response_model=ListResponse)
async def update_list(list_id: int, list_in: ListUpdate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(select(ListModel).where(ListModel.id == list_id, ListModel.user_id == current_user.id))
    db_list = result.scalar_one_or_none()
    if not db_list:
        raise HTTPException(status_code=404, detail="List not found")
    db_list.name = list_in.name
    await db.commit()
    await db.refresh(db_list)
    return db_list

@router.delete("/lists/{list_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_list(list_id: int, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(select(ListModel).where(ListModel.id == list_id, ListModel.user_id == current_user.id))
    db_list = result.scalar_one_or_none()
    if not db_list:
        raise HTTPException(status_code=404, detail="List not found")
    await db.delete(db_list)
    await db.commit()
    return

@router.post("/lists/{list_id}/items", response_model=ListItemResponse)
async def add_list_item(list_id: int, item_in: ListItemCreate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(select(ListModel).where(ListModel.id == list_id, ListModel.user_id == current_user.id))
    db_list = result.scalar_one_or_none()
    if not db_list:
        raise HTTPException(status_code=404, detail="List not found")
    new_item = ListItemModel(list_id=list_id, text=item_in.text, checked=item_in.checked, priority=item_in.priority)
    db.add(new_item)
    await db.commit()
    await db.refresh(new_item)
    return new_item

@router.put("/lists/{list_id}/items/{item_id}", response_model=ListItemResponse)
async def update_list_item(list_id: int, item_id: int, item_in: ListItemUpdate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(select(ListItemModel).join(ListModel).where(ListItemModel.id == item_id, ListItemModel.list_id == list_id, ListModel.user_id == current_user.id))
    db_item = result.scalar_one_or_none()
    if not db_item:
        raise HTTPException(status_code=404, detail="Item not found")
    db_item.text = item_in.text
    db_item.checked = item_in.checked
    db_item.priority = item_in.priority
    await db.commit()
    await db.refresh(db_item)
    return db_item

@router.delete("/lists/{list_id}/items/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_list_item(list_id: int, item_id: int, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(select(ListItemModel).join(ListModel).where(ListItemModel.id == item_id, ListItemModel.list_id == list_id, ListModel.user_id == current_user.id))
    db_item = result.scalar_one_or_none()
    if not db_item:
        raise HTTPException(status_code=404, detail="Item not found")
    await db.delete(db_item)
    await db.commit()
    return
