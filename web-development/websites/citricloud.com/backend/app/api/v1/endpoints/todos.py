"""
API endpoints for Todo
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List as TypingList
from app.core.database import get_db
from app.api.dependencies import get_current_user
from app.models.todo_models import Todo as TodoModel
from app.models.models import User
from app.schemas.todo_schemas import TodoCreate, TodoUpdate, TodoResponse

router = APIRouter()

@router.get("/todos", response_model=TypingList[TodoResponse])
async def get_todos(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(select(TodoModel).where(TodoModel.user_id == current_user.id))
    return result.scalars().all()

@router.post("/todos", response_model=TodoResponse)
async def create_todo(todo_in: TodoCreate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    new_todo = TodoModel(user_id=current_user.id, text=todo_in.text, done=todo_in.done)
    db.add(new_todo)
    await db.commit()
    await db.refresh(new_todo)
    return new_todo

@router.put("/todos/{todo_id}", response_model=TodoResponse)
async def update_todo(todo_id: int, todo_in: TodoUpdate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(select(TodoModel).where(TodoModel.id == todo_id, TodoModel.user_id == current_user.id))
    db_todo = result.scalar_one_or_none()
    if not db_todo:
        raise HTTPException(status_code=404, detail="Todo not found")
    db_todo.text = todo_in.text
    db_todo.done = todo_in.done
    await db.commit()
    await db.refresh(db_todo)
    return db_todo

@router.delete("/todos/{todo_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_todo(todo_id: int, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(select(TodoModel).where(TodoModel.id == todo_id, TodoModel.user_id == current_user.id))
    db_todo = result.scalar_one_or_none()
    if not db_todo:
        raise HTTPException(status_code=404, detail="Todo not found")
    await db.delete(db_todo)
    await db.commit()
    return
