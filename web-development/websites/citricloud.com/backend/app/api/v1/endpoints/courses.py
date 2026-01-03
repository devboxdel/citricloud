"""
API endpoints for Courses
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from typing import List as TypingList
from app.core.database import get_db
from app.api.dependencies import get_current_user
from app.models.course_models import Course as CourseModel, Lesson as LessonModel
from app.models.models import User
from app.schemas.course_schemas import CourseCreate, CourseUpdate, CourseResponse, LessonCreate, LessonUpdate, LessonResponse

router = APIRouter()

@router.get("/courses", response_model=TypingList[CourseResponse])
async def get_courses(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(select(CourseModel).options(selectinload(CourseModel.lessons)).where(CourseModel.user_id == current_user.id))
    return result.scalars().all()

@router.post("/courses", response_model=CourseResponse)
async def create_course(course_in: CourseCreate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    lessons = [LessonModel(**lesson.dict()) for lesson in course_in.lessons]
    new_course = CourseModel(
        user_id=current_user.id,
        title=course_in.title,
        category=course_in.category,
        duration=course_in.duration,
        level=course_in.level,
        snippet=course_in.snippet,
        is_favorite=course_in.is_favorite,
        labels=','.join(course_in.labels) if course_in.labels else None,
        completed=course_in.completed,
        progress=course_in.progress,
        lessons=lessons
    )
    db.add(new_course)
    await db.commit()
    await db.refresh(new_course)
    return new_course

@router.put("/courses/{course_id}", response_model=CourseResponse)
async def update_course(course_id: int, course_in: CourseUpdate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(select(CourseModel).where(CourseModel.id == course_id, CourseModel.user_id == current_user.id))
    db_course = result.scalar_one_or_none()
    if not db_course:
        raise HTTPException(status_code=404, detail="Course not found")
    for attr, value in course_in.dict(exclude_unset=True).items():
        if attr == "lessons" and value is not None:
            db_course.lessons.clear()
            for lesson in value:
                db_course.lessons.append(LessonModel(**lesson))
        elif attr == "labels" and value is not None:
            setattr(db_course, attr, ','.join(value))
        else:
            setattr(db_course, attr, value)
    await db.commit()
    await db.refresh(db_course)
    return db_course

@router.delete("/courses/{course_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_course(course_id: int, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(select(CourseModel).where(CourseModel.id == course_id, CourseModel.user_id == current_user.id))
    db_course = result.scalar_one_or_none()
    if not db_course:
        raise HTTPException(status_code=404, detail="Course not found")
    await db.delete(db_course)
    await db.commit()
    return
