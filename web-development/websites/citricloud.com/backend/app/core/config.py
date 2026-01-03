"""
Core configuration settings
"""
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List
import secrets


class Settings(BaseSettings):
    """Application settings"""
    
    # Application
    APP_NAME: str = "CITRICLOUD"
    APP_VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    API_PREFIX: str = "/api/v1"
    
    # Database
    DATABASE_URL: str = "postgresql://citricloud:citricloud@localhost:5432/citricloud"
    DATABASE_TEST_URL: str = "postgresql://citricloud:citricloud@localhost:5432/citricloud_test"
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"
    
    # JWT
    JWT_SECRET_KEY: str = "your-super-secret-jwt-key-change-in-production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # CORS
    CORS_ORIGINS: str = "http://localhost:3000,http://localhost:5173"
    
    # Security
    SECRET_KEY: str = secrets.token_urlsafe(32)
    ALLOWED_HOSTS: str = "localhost,127.0.0.1"
    
    # Email - Resend API
    RESEND_API_KEY: str = "re_ThcWuUJx_Ap7Y616uB8QUpxMFuhX3NR8W"
    RESEND_WEBHOOK_SECRET_INBOUND: str = "whsec_4SWB7TLS73ldtqCpUZ1s4ucy+w0l3fPN"
    RESEND_WEBHOOK_SECRET_EVENTS: str = "whsec_LMnusn9IXGxCi8bPtYngakSQ3xJmUK+j"
    EMAIL_FROM: str = "support@mail.citricloud.com"  # Use subdomain for better email reputation
    FRONTEND_URL: str = "http://localhost:5173"
    PASSWORD_RESET_TOKEN_TTL_MINUTES: int = 15
    
    # Storage
    UPLOAD_DIR: str = "/var/www/citricloud.com/uploads"
    MAX_UPLOAD_SIZE: int = 10485760  # 10MB
    
    # Performance
    ENABLE_COMPRESSION: bool = True
    ENABLE_CACHING: bool = True
    CACHE_TTL: int = 3600
    
    # Pagination
    DEFAULT_PAGE_SIZE: int = 20
    MAX_PAGE_SIZE: int = 100
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True
    )
    
    @property
    def cors_origins_list(self) -> List[str]:
        """Parse CORS origins from comma-separated string"""
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]
    
    @property
    def allowed_hosts_list(self) -> List[str]:
        """Parse allowed hosts from comma-separated string"""
        return [host.strip() for host in self.ALLOWED_HOSTS.split(",")]


settings = Settings()
