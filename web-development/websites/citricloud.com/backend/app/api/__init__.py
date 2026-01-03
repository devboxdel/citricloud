from fastapi import APIRouter
from app.api.v1.endpoints import lists, bookings, forms, todos, courses

api_router = APIRouter()
api_router.include_router(lists.router, prefix="/v1", tags=["lists"])
api_router.include_router(bookings.router, prefix="/v1", tags=["bookings"])
api_router.include_router(forms.router, prefix="/v1", tags=["forms"])
api_router.include_router(todos.router, prefix="/v1", tags=["todos"])
api_router.include_router(courses.router, prefix="/v1", tags=["courses"])

