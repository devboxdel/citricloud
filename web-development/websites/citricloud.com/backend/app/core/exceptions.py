"""
Custom exceptions
"""
from fastapi import Request, status
from fastapi.responses import ORJSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from typing import Any, Dict


class CitriCloudException(Exception):
    """Base exception for CITRICLOUD"""
    def __init__(self, message: str, status_code: int = 500):
        self.message = message
        self.status_code = status_code
        super().__init__(self.message)


class NotFoundException(CitriCloudException):
    """Resource not found exception"""
    def __init__(self, message: str = "Resource not found"):
        super().__init__(message, status_code=404)


class UnauthorizedException(CitriCloudException):
    """Unauthorized exception"""
    def __init__(self, message: str = "Unauthorized"):
        super().__init__(message, status_code=401)


class ForbiddenException(CitriCloudException):
    """Forbidden exception"""
    def __init__(self, message: str = "Forbidden"):
        super().__init__(message, status_code=403)


class BadRequestException(CitriCloudException):
    """Bad request exception"""
    def __init__(self, message: str = "Bad request"):
        super().__init__(message, status_code=400)


async def http_exception_handler(request: Request, exc: StarletteHTTPException) -> ORJSONResponse:
    """Handle HTTP exceptions"""
    return ORJSONResponse(
        status_code=exc.status_code,
        content={
            "error": True,
            "message": exc.detail,
            "status_code": exc.status_code,
        },
    )


async def validation_exception_handler(request: Request, exc: RequestValidationError) -> ORJSONResponse:
    """Handle validation exceptions"""
    errors = []
    for error in exc.errors():
        errors.append({
            "field": ".".join(str(loc) for loc in error["loc"]),
            "message": error["msg"],
            "type": error["type"],
        })
    
    return ORJSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "error": True,
            "message": "Validation error",
            "errors": errors,
        },
    )
