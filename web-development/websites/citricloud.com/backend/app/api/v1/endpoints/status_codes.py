"""
HTTP Status Code API Endpoints
Provides endpoints to retrieve HTTP status code information
"""

from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from app.core.http_status import HTTPStatusManager, HTTPStatusCategory

router = APIRouter(prefix="/status-codes", tags=["Status Codes"])


@router.get("/", response_model=List[dict])
async def get_all_status_codes(
    category: Optional[str] = Query(None, description="Filter by category"),
    code: Optional[int] = Query(None, description="Filter by specific code")
):
    """
    Get all HTTP status codes or filter by category/code
    
    Query Parameters:
    - category: Filter by category (Informational, Success, Redirection, Client Error, Server Error)
    - code: Filter by specific status code
    """
    if code:
        status = HTTPStatusManager.get_status_by_code(code)
        if not status:
            raise HTTPException(status_code=404, detail=f"Status code {code} not found")
        return [status]
    
    if category:
        # Validate category
        valid_categories = [c.value for c in HTTPStatusCategory]
        if category not in valid_categories:
            raise HTTPException(
                status_code=400, 
                detail=f"Invalid category. Must be one of: {', '.join(valid_categories)}"
            )
        return HTTPStatusManager.get_status_by_category(category)
    
    return HTTPStatusManager.get_all_status_codes()


@router.get("/categories", response_model=List[str])
async def get_categories():
    """Get all available status code categories"""
    return [category.value for category in HTTPStatusCategory]


@router.get("/{code}", response_model=dict)
async def get_status_code(code: int):
    """
    Get detailed information about a specific HTTP status code
    
    Path Parameters:
    - code: HTTP status code (e.g., 200, 404, 500)
    """
    status = HTTPStatusManager.get_status_by_code(code)
    if not status:
        raise HTTPException(status_code=404, detail=f"Status code {code} not found")
    return status


@router.get("/category/{category_name}", response_model=List[dict])
async def get_status_codes_by_category(category_name: str):
    """
    Get all HTTP status codes in a specific category
    
    Path Parameters:
    - category_name: Category name (Informational, Success, Redirection, Client Error, Server Error)
    """
    # Validate category
    valid_categories = [c.value for c in HTTPStatusCategory]
    if category_name not in valid_categories:
        raise HTTPException(
            status_code=400, 
            detail=f"Invalid category. Must be one of: {', '.join(valid_categories)}"
        )
    
    status_codes = HTTPStatusManager.get_status_by_category(category_name)
    return status_codes
