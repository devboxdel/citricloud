"""
API endpoints for Forms and FormQuestions
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from typing import List as TypingList
from app.core.database import get_db
from app.api.dependencies import get_current_user
from app.models.form_models import Form as FormModel, FormQuestion as FormQuestionModel, FormStatus
from app.models.models import User
from app.schemas.form_schemas import FormCreate, FormUpdate, FormResponse, FormQuestionCreate, FormQuestionUpdate, FormQuestionResponse
import json

router = APIRouter()

@router.get("/forms", response_model=TypingList[FormResponse])
async def get_forms(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(select(FormModel).options(selectinload(FormModel.questions)).where(FormModel.user_id == current_user.id))
    return result.scalars().all()

@router.post("/forms", response_model=FormResponse)
async def create_form(form_in: FormCreate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Coerce status to Enum
    status_val = FormStatus(form_in.status) if isinstance(form_in.status, str) else form_in.status
    new_form = FormModel(user_id=current_user.id, title=form_in.title, description=form_in.description, status=status_val, is_starred=form_in.is_starred, category=form_in.category)
    db.add(new_form)
    await db.flush()
    # Add questions if provided
    if form_in.questions:
        for q in form_in.questions:
            # Ensure options are stored as JSON-encoded string
            opts = q.options
            if isinstance(opts, (list, dict)):
                opts = json.dumps(opts)
            db.add(FormQuestionModel(form_id=new_form.id, type=q.type, question=q.question, options=opts, required=q.required, order=q.order))
    await db.commit()
    await db.refresh(new_form)
    return new_form

@router.put("/forms/{form_id}", response_model=FormResponse)
async def update_form(form_id: int, form_in: FormUpdate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(select(FormModel).where(FormModel.id == form_id, FormModel.user_id == current_user.id))
    db_form = result.scalar_one_or_none()
    if not db_form:
        raise HTTPException(status_code=404, detail="Form not found")
    db_form.title = form_in.title
    db_form.description = form_in.description
    # Coerce status to Enum
    db_form.status = FormStatus(form_in.status) if isinstance(form_in.status, str) else form_in.status
    db_form.is_starred = form_in.is_starred
    db_form.category = form_in.category
    await db.commit()
    await db.refresh(db_form)
    return db_form

@router.delete("/forms/{form_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_form(form_id: int, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(select(FormModel).where(FormModel.id == form_id, FormModel.user_id == current_user.id))
    db_form = result.scalar_one_or_none()
    if not db_form:
        raise HTTPException(status_code=404, detail="Form not found")
    await db.delete(db_form)
    await db.commit()
    return

@router.post("/forms/{form_id}/questions", response_model=FormQuestionResponse)
async def add_question(form_id: int, q_in: FormQuestionCreate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(select(FormModel).where(FormModel.id == form_id, FormModel.user_id == current_user.id))
    db_form = result.scalar_one_or_none()
    if not db_form:
        raise HTTPException(status_code=404, detail="Form not found")
    # Ensure options are stored as JSON-encoded string
    opts = q_in.options
    if isinstance(opts, (list, dict)):
        opts = json.dumps(opts)
    new_q = FormQuestionModel(form_id=form_id, type=q_in.type, question=q_in.question, options=opts, required=q_in.required, order=q_in.order)
    db.add(new_q)
    await db.commit()
    await db.refresh(new_q)
    return new_q

@router.put("/forms/{form_id}/questions/{question_id}", response_model=FormQuestionResponse)
async def update_question(form_id: int, question_id: int, q_in: FormQuestionUpdate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(select(FormQuestionModel).join(FormModel).where(FormQuestionModel.id == question_id, FormQuestionModel.form_id == form_id, FormModel.user_id == current_user.id))
    db_q = result.scalar_one_or_none()
    if not db_q:
        raise HTTPException(status_code=404, detail="Question not found")
    db_q.type = q_in.type
    db_q.question = q_in.question
    # Ensure options are stored as JSON-encoded string
    opts = q_in.options
    if isinstance(opts, (list, dict)):
        opts = json.dumps(opts)
    db_q.options = opts
    db_q.required = q_in.required
    db_q.order = q_in.order
    await db.commit()
    await db.refresh(db_q)
    return db_q

@router.delete("/forms/{form_id}/questions/{question_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_question(form_id: int, question_id: int, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(select(FormQuestionModel).join(FormModel).where(FormQuestionModel.id == question_id, FormQuestionModel.form_id == form_id, FormModel.user_id == current_user.id))
    db_q = result.scalar_one_or_none()
    if not db_q:
        raise HTTPException(status_code=404, detail="Question not found")
    await db.delete(db_q)
    await db.commit()
    return
