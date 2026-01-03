"""
CITRICLOUD Backend API
FastAPI application entry point
"""
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import ORJSONResponse
from fastapi.exceptions import RequestValidationError
from fastapi.staticfiles import StaticFiles
from starlette.exceptions import HTTPException as StarletteHTTPException
import time
import logging
from pathlib import Path

from app.core.config import settings
from app.core.database import engine, Base, get_db
from app.core.cache import get_redis_client
from app.api.v1.router import api_router
from app.core.exceptions import http_exception_handler, validation_exception_handler
from app.middleware.maintenance import maintenance_mode_middleware

# Import models to ensure they're registered with SQLAlchemy
from app.models import models  # noqa
from app.models import email_models  # noqa
from app.models import email_alias_models  # noqa
from app.models import shared_email_models  # noqa
from app.models import shared_email_invite_models  # noqa

# Configure logging
logging.basicConfig(
    level=logging.INFO if settings.DEBUG else logging.WARNING,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events"""
    # Startup
    logger.info("🚀 Starting CITRICLOUD Backend API...")
    
    # Create database tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    # Initialize Redis connection
    redis_client = await get_redis_client()
    logger.info("✅ Redis connection established")
    
    # Create upload directory
    upload_dir = Path(settings.UPLOAD_DIR)
    upload_dir.mkdir(exist_ok=True)
    
    logger.info("✅ CITRICLOUD Backend API started successfully")
    
    yield
    
    # Shutdown
    logger.info("🛑 Shutting down CITRICLOUD Backend API...")
    if redis_client:
        await redis_client.close()
    await engine.dispose()


# Initialize FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    description="Comprehensive platform for creating dashboards and websites",
    version=settings.APP_VERSION,
    default_response_class=ORJSONResponse,
    lifespan=lifespan,
    docs_url=f"{settings.API_PREFIX}/docs" if settings.DEBUG else None,
    redoc_url=f"{settings.API_PREFIX}/redoc" if settings.DEBUG else None,
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-Total-Count", "X-Page", "X-Per-Page"],
)

# Compression Middleware
if settings.ENABLE_COMPRESSION:
    app.add_middleware(GZipMiddleware, minimum_size=1000)


# Performance monitoring middleware
@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    return response


# Maintenance mode middleware
@app.middleware("http")
async def check_maintenance_mode(request: Request, call_next):
    return await maintenance_mode_middleware(request, call_next)


# Exception handlers
app.add_exception_handler(StarletteHTTPException, http_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)


# Mount static files
upload_dir = Path(settings.UPLOAD_DIR)
if upload_dir.exists():
    app.mount("/uploads", StaticFiles(directory=str(upload_dir)), name="uploads")


# Include API router
app.include_router(api_router, prefix=settings.API_PREFIX)


@app.get("/", tags=["root"])
async def root():
    """Health check endpoint"""
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "operational",
        "environment": settings.ENVIRONMENT,
    }


@app.get("/health", tags=["root"])
async def health_check():
    """Detailed health check"""
    try:
        # Check database
        from app.core.database import SessionLocal
        db = SessionLocal()
        db.execute("SELECT 1")
        db.close()
        db_status = "healthy"
    except Exception as e:
        db_status = f"unhealthy: {str(e)}"
    
    try:
        # Check Redis
        redis_client = await get_redis_client()
        await redis_client.ping()
        redis_status = "healthy"
    except Exception as e:
        redis_status = f"unhealthy: {str(e)}"
    
    return {
        "status": "operational",
        "database": db_status,
        "cache": redis_status,
        "version": settings.APP_VERSION,
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG,
        log_level="info" if settings.DEBUG else "warning",
    )
