"""
Generic persistence endpoints for Workspace apps
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from typing import List as TypingList, Optional
from app.core.database import get_db
from app.api.dependencies import get_current_user
from app.models.workspace_models import WorkspaceItem as WorkspaceItemModel
from app.models.models import User
from app.schemas.workspace_schemas import WorkspaceItemCreate, WorkspaceItemUpdate, WorkspaceItemResponse

router = APIRouter()

@router.get("/items", response_model=TypingList[WorkspaceItemResponse])
async def get_items(app: Optional[str] = None, key: Optional[str] = None, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    query = select(WorkspaceItemModel).where(WorkspaceItemModel.user_id == current_user.id)
    if app:
        query = query.where(WorkspaceItemModel.app_name == app)
    if key:
        query = query.where(WorkspaceItemModel.item_key == key)
    result = await db.execute(query)
    return result.scalars().all()

@router.post("/items", response_model=WorkspaceItemResponse, status_code=status.HTTP_201_CREATED)
async def create_item(item_in: WorkspaceItemCreate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Upsert by (user_id, app_name, item_key)
    result = await db.execute(
        select(WorkspaceItemModel).where(
            and_(
                WorkspaceItemModel.user_id == current_user.id,
                WorkspaceItemModel.app_name == item_in.app_name,
                WorkspaceItemModel.item_key == item_in.item_key,
            )
        )
    )
    existing = result.scalar_one_or_none()
    if existing:
        existing.data = item_in.data
        await db.commit()
        await db.refresh(existing)
        return existing
    new_item = WorkspaceItemModel(
        user_id=current_user.id,
        app_name=item_in.app_name,
        item_key=item_in.item_key,
        data=item_in.data,
    )
    db.add(new_item)
    await db.commit()
    await db.refresh(new_item)
    return new_item

@router.put("/items/{item_id}", response_model=WorkspaceItemResponse)
async def update_item(item_id: int, item_in: WorkspaceItemUpdate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(select(WorkspaceItemModel).where(and_(WorkspaceItemModel.id == item_id, WorkspaceItemModel.user_id == current_user.id)))
    db_item = result.scalar_one_or_none()
    if not db_item:
        raise HTTPException(status_code=404, detail="Workspace item not found")
    db_item.data = item_in.data
    await db.commit()
    await db.refresh(db_item)
    return db_item

@router.delete("/items/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_item(item_id: int, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(select(WorkspaceItemModel).where(and_(WorkspaceItemModel.id == item_id, WorkspaceItemModel.user_id == current_user.id)))
    db_item = result.scalar_one_or_none()
    if not db_item:
        raise HTTPException(status_code=404, detail="Workspace item not found")
    await db.delete(db_item)
    await db.commit()
    return
