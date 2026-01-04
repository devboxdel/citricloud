"""
Pydantic schemas for API requests/responses
"""
from pydantic import BaseModel, EmailStr, Field, validator, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum


# ========== Enums ==========

class UserRoleEnum(str, Enum):
    SYSTEM_ADMIN = "system_admin"
    DEVELOPER = "developer"
    ADMINISTRATOR = "administrator"
    MODERATOR = "moderator"
    SPECTATOR = "spectator"
    SUBSCRIBER = "subscriber"
    KEYMASTER = "keymaster"
    EDITOR = "editor"
    CONTRIBUTOR = "contributor"
    BLOCKED = "blocked"
    AUTHOR = "author"
    PARTICIPANT = "participant"
    OPERATOR = "operator"
    SUPPORT = "support"
    FINANCE_MANAGER = "finance_manager"
    MANAGER = "manager"
    EMPLOYEE = "employee"
    ACCOUNTANT = "accountant"
    PAYROLL = "payroll"
    RECEPTIONIST = "receptionist"
    MARKETING_ASSISTANT = "marketing_assistant"
    OFFICER = "officer"
    USER = "user"
    GUEST = "guest"


class TicketStatusEnum(str, Enum):
    OPEN = "open"
    IN_PROGRESS = "in_progress"
    WAITING_RESPONSE = "waiting_response"
    RESOLVED = "resolved"
    CLOSED = "closed"


class OrderStatusEnum(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"
    REFUNDED = "refunded"


class InvoiceStatusEnum(str, Enum):
    DRAFT = "draft"
    SENT = "sent"
    PAID = "paid"
    OVERDUE = "overdue"
    CANCELLED = "cancelled"


class PageStatusEnum(str, Enum):
    DRAFT = "draft"
    PUBLISHED = "published"
    ARCHIVED = "archived"


class ReportTypeEnum(str, Enum):
    FINANCIAL = "financial"
    SALES = "sales"
    INVENTORY = "inventory"
    SUPPLIERS = "suppliers"


class ContentTypeEnum(str, Enum):
    BLOG = "blog"
    NEWS = "news"


class CommentStatusEnum(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    SPAM = "spam"
    ARCHIVED = "archived"


class CommentReportStatusEnum(str, Enum):
    OPEN = "open"
    IN_REVIEW = "in_review"
    RESOLVED = "resolved"
    DISMISSED = "dismissed"


# ========== Base Schemas ==========

class BaseSchema(BaseModel):
    class Config:
        from_attributes = True
        populate_by_name = True


# ========== Auth Schemas ==========

class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserRegister(BaseModel):
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=100)
    password: str = Field(..., min_length=8)
    full_name: Optional[str] = None
    phone: Optional[str] = None


class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class TwoFactorRequired(BaseModel):
    requires_2fa: bool = True
    temp_token: str
    message: str = "Two-factor authentication required"


class TwoFactorVerify(BaseModel):
    temp_token: str
    code: str = Field(..., min_length=6, max_length=6)


class TokenData(BaseModel):
    user_id: Optional[int] = None
    email: Optional[str] = None
    role: Optional[str] = None


# ========== Password Reset Schemas ==========

class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(..., min_length=8)


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=8)


# ========== User Schemas ==========

class UserBase(BaseSchema):
    email: EmailStr
    username: str
    full_name: Optional[str] = None
    role: str = "user"  # Store as lowercase string matching DB enum
    phone: Optional[str] = None


class UserCreate(UserBase):
    password: str = Field(..., min_length=8)


class UserUpdate(BaseModel):
    role: Optional[str] = None  # Lowercase string matching DB enum
    full_name: Optional[str] = None
    phone: Optional[str] = None
    avatar_url: Optional[str] = None
    is_active: Optional[bool] = None


class UserResponse(UserBase):
    id: int
    is_active: bool
    is_verified: bool
    avatar_url: Optional[str] = None
    created_at: datetime
    last_login: Optional[datetime] = None
    role_id: Optional[int] = None  # Link to CRM role


# ========== Role Schemas ==========

class RoleBase(BaseModel):
    name: str
    description: Optional[str] = None
    color: str = "blue"
    permissions: Optional[List[str]] = []


class RoleCreate(RoleBase):
    role_key: str
    is_system_role: Optional[bool] = False


class RoleUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    color: Optional[str] = None
    permissions: Optional[List[str]] = None


class RoleResponse(RoleBase):
    id: int
    role_key: str
    is_system_role: bool
    user_count: int
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


# ========== Order Schemas ==========

class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int = Field(..., gt=0)


class OrderItemResponse(BaseSchema):
    id: int
    product_id: int
    quantity: int
    unit_price: float
    total_price: float


class OrderCreate(BaseModel):
    items: List[OrderItemCreate]
    shipping_address: Dict[str, Any]
    billing_address: Optional[Dict[str, Any]] = None
    notes: Optional[str] = None


class OrderUpdate(BaseModel):
    status: Optional[OrderStatusEnum] = None
    notes: Optional[str] = None


class OrderResponse(BaseSchema):
    id: int
    order_number: str
    user_id: int
    status: OrderStatusEnum
    total_amount: float
    currency: str
    shipping_address: Optional[Dict[str, Any]] = None
    billing_address: Optional[Dict[str, Any]] = None
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    order_items: List[OrderItemResponse] = []


# ========== Invoice Schemas ==========

class InvoiceCreate(BaseModel):
    order_id: int
    due_date: Optional[datetime] = None
    notes: Optional[str] = None


class InvoiceUpdate(BaseModel):
    status: Optional[str] = None
    notes: Optional[str] = None
    
    @validator('status')
    def validate_status(cls, v):
        if v and v not in [s.value for s in InvoiceStatusEnum]:
            raise ValueError(f'Invalid status: {v}')
        return v


class InvoiceResponse(BaseSchema):
    id: int
    invoice_number: str
    order_id: int
    status: InvoiceStatusEnum
    amount: float
    tax_amount: float
    total_amount: float
    currency: str
    due_date: Optional[datetime] = None
    paid_date: Optional[datetime] = None
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime


# ========== Ticket Schemas ==========

class TicketCreate(BaseModel):
    subject: str = Field(..., min_length=5, max_length=500)
    description: str = Field(..., min_length=10)
    priority: str = Field(default="medium", pattern="^(low|medium|high|urgent)$")


class TicketUpdate(BaseModel):
    status: Optional[TicketStatusEnum] = None
    priority: Optional[str] = Field(None, pattern="^(low|medium|high|urgent)$")
    assigned_to: Optional[int] = None


class TicketResponse(BaseSchema):
    id: int
    ticket_number: str
    user_id: int
    subject: str
    description: str
    status: TicketStatusEnum
    priority: str
    assigned_to: Optional[int] = None
    created_at: datetime
    updated_at: datetime
    closed_at: Optional[datetime] = None


# ========== Supplier Schemas ==========

class SupplierCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    contact_person: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    category: Optional[str] = None
    notes: Optional[str] = None

class SupplierUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    contact_person: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    category: Optional[str] = None
    status: Optional[str] = None
    rating: Optional[float] = None
    notes: Optional[str] = None

class SupplierResponse(BaseSchema):
    id: int
    name: str
    contact_person: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    category: Optional[str] = None
    status: str
    rating: float
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime


# ========== Page Schemas ==========

class PageCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=500)
    slug: str = Field(..., min_length=1, max_length=500)
    content: Optional[str] = None
    meta_title: Optional[str] = None
    meta_description: Optional[str] = None
    meta_keywords: Optional[str] = None
    status: PageStatusEnum = PageStatusEnum.DRAFT
    template: str = "default"
    is_homepage: bool = False


class PageUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=500)
    content: Optional[str] = None
    meta_title: Optional[str] = None
    meta_description: Optional[str] = None
    meta_keywords: Optional[str] = None
    status: Optional[PageStatusEnum] = None


class PageResponse(BaseSchema):
    id: int
    title: str
    slug: str
    content: Optional[str] = None
    meta_title: Optional[str] = None
    meta_description: Optional[str] = None
    status: PageStatusEnum
    template: str
    is_homepage: bool
    created_at: datetime
    updated_at: datetime
    published_at: Optional[datetime] = None


# ========== Blog Schemas ==========

class BlogCategoryCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    slug: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    icon: Optional[str] = None
    order_index: int = 0
    is_active: bool = True


class BlogCategoryResponse(BaseSchema):
    id: int
    name: str
    slug: str
    description: Optional[str] = None
    icon: Optional[str] = None
    order_index: int
    is_active: bool
    created_at: datetime


class BlogPostCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=500)
    slug: str = Field(..., min_length=1, max_length=500)
    excerpt: Optional[str] = None
    content: str = Field(..., min_length=1)
    featured_image: Optional[str] = None
    category_id: Optional[int] = None
    status: PageStatusEnum = PageStatusEnum.DRAFT
    meta_title: Optional[str] = None
    meta_description: Optional[str] = None
    is_sticky: bool = False
    related_post_ids: Optional[List[int]] = None


class BlogPostUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=500)
    content: Optional[str] = None
    excerpt: Optional[str] = None
    featured_image: Optional[str] = None
    category_id: Optional[int] = None
    status: Optional[PageStatusEnum] = None
    is_sticky: Optional[bool] = None
    related_post_ids: Optional[List[int]] = None


class BlogPostResponse(BaseSchema):
    id: int
    title: str
    slug: str
    excerpt: Optional[str] = None
    content: str
    featured_image: Optional[str] = None
    author_id: int
    category_id: Optional[int] = None
    status: PageStatusEnum
    views_count: int
    is_sticky: bool
    created_at: datetime
    updated_at: datetime
    published_at: Optional[datetime] = None
    related_posts: Optional[List['BlogPostResponse']] = None
    meta_title: Optional[str] = None
    meta_description: Optional[str] = None
    class Config:
        from_attributes = True


# ========== Comment Schemas ==========

class CommentCreate(BaseModel):
    post_id: Optional[int] = None
    post_type: ContentTypeEnum = ContentTypeEnum.BLOG
    post_title: Optional[str] = None
    post_slug: Optional[str] = None
    content: str = Field(..., min_length=1)
    author_name: Optional[str] = None
    author_email: Optional[EmailStr] = None
    platform: str = "web"


class CommentUpdate(BaseModel):
    status: Optional[CommentStatusEnum] = None
    content: Optional[str] = None


class CommentResponse(BaseSchema):
    id: int
    post_id: Optional[int] = None
    post_type: ContentTypeEnum
    post_title: Optional[str] = None
    post_slug: Optional[str] = None
    author_name: Optional[str] = None
    author_email: Optional[EmailStr] = None
    content: str
    status: CommentStatusEnum
    platform: Optional[str] = None
    likes_count: int = 0
    dislikes_count: int = 0
    reactions: dict = {}
    created_at: datetime
    updated_at: datetime


class CommentReportCreate(BaseModel):
    comment_id: Optional[int] = None
    post_id: Optional[int] = None
    post_type: ContentTypeEnum = ContentTypeEnum.BLOG
    reason: str = Field(..., min_length=2, max_length=200)
    details: Optional[str] = None
    reporter_name: Optional[str] = None
    reporter_email: Optional[EmailStr] = None
    platform: str = "web"


class CommentReportUpdate(BaseModel):
    status: Optional[CommentReportStatusEnum] = None
    action_taken: Optional[str] = None


class CommentReportResponse(BaseSchema):
    id: int
    comment_id: Optional[int] = None
    post_id: Optional[int] = None
    post_type: ContentTypeEnum
    reason: Optional[str] = None
    details: Optional[str] = None
    reporter_name: Optional[str] = None
    reporter_email: Optional[EmailStr] = None
    platform: Optional[str] = None
    status: CommentReportStatusEnum
    action_taken: Optional[str] = None
    comment_content: Optional[str] = None
    post_title: Optional[str] = None
    post_slug: Optional[str] = None
    created_at: datetime
    updated_at: datetime


# ========== Product Schemas ==========

class ProductCategoryCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    slug: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    parent_id: Optional[int] = None
    image_url: Optional[str] = None
    order_index: Optional[int] = Field(0, ge=0)
    is_active: bool = True


class ProductCategoryResponse(BaseSchema):
    id: int
    name: str
    slug: str
    description: Optional[str] = None
    parent_id: Optional[int] = None
    image_url: Optional[str] = None
    order_index: int = 0
    is_active: bool
    created_at: datetime


class ProductCategoryUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    slug: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None
    parent_id: Optional[int] = None
    image_url: Optional[str] = None
    order_index: Optional[int] = Field(None, ge=0)
    is_active: Optional[bool] = None


class ProductCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=500)
    slug: str = Field(..., min_length=1, max_length=500)
    description: Optional[str] = None
    short_description: Optional[str] = None
    sku: str = Field(..., min_length=1, max_length=100)
    price: float = Field(..., ge=0)
    sale_price: Optional[float] = None
    category_id: Optional[int] = None
    images: Optional[List[str]] = []
    stock_quantity: int = Field(default=0, ge=0)
    is_featured: bool = False


class ProductUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=500)
    description: Optional[str] = None
    short_description: Optional[str] = None
    price: Optional[float] = Field(None, ge=0)
    sale_price: Optional[float] = None
    category_id: Optional[int] = None
    images: Optional[List[str]] = None
    stock_quantity: Optional[int] = Field(None, ge=0)
    is_active: Optional[bool] = None
    is_featured: Optional[bool] = None


class ProductResponse(BaseSchema):
    id: int
    name: str
    slug: str
    description: Optional[str] = None
    short_description: Optional[str] = None
    sku: str
    price: float
    sale_price: Optional[float] = None
    category_id: Optional[int] = None
    images: Optional[List[str]] = []
    stock_quantity: int
    is_active: bool
    is_featured: bool
    created_at: datetime
    updated_at: datetime


class StockMovementResponse(BaseSchema):
    id: int
    product_id: int
    product_name: Optional[str]
    sku: Optional[str]
    change: int
    quantity_before: int
    quantity_after: int
    reason: Optional[str]
    note: Optional[str]
    user_email: Optional[str]
    created_at: datetime


class StockUpdateRequest(BaseModel):
    quantity: int = Field(..., ge=0)
    reason: Optional[str] = Field(None, max_length=200)
    note: Optional[str] = Field(None, max_length=2000)


class StockBulkAdjustmentItem(BaseModel):
    sku: str = Field(..., min_length=1, max_length=100)
    delta: int = Field(...)
    reason: Optional[str] = Field(None, max_length=200)
    note: Optional[str] = Field(None, max_length=2000)


class StockBulkAdjustmentRequest(BaseModel):
    items: List[StockBulkAdjustmentItem]


# ========== Shop Schemas (Public API) ==========

class ShopProductResponse(BaseSchema):
    """Product response for public shop with nested category"""
    id: int
    name: str
    slug: str
    description: Optional[str] = None
    short_description: Optional[str] = None
    sku: str
    price: float
    sale_price: Optional[float] = None
    images: Optional[List[str]] = []
    stock_quantity: Optional[int] = 0  # Allow None, default to 0
    is_featured: Optional[bool] = False  # Allow None, default to False
    category: Optional[ProductCategoryResponse] = None  # Nested category


class ShopCategoryResponse(BaseModel):
    """Category response for public shop with product count"""
    id: int
    name: str
    slug: str
    description: Optional[str] = None
    image_url: Optional[str] = None
    order_index: int
    product_count: int


# ========== Menu Schemas ==========

class MenuItemCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    url: str = Field(..., min_length=1, max_length=500)
    parent_id: Optional[int] = None
    icon: Optional[str] = None
    target: str = "_self"


class MenuItemResponse(BaseSchema):
    id: int
    menu_id: int
    parent_id: Optional[int] = None
    title: str
    url: str
    icon: Optional[str] = None
    order_index: int
    target: str
    is_active: bool


class MenuCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    slug: str = Field(..., min_length=1, max_length=100)
    location: Optional[str] = None


class MenuResponse(BaseSchema):
    id: int
    name: str
    slug: str
    location: Optional[str] = None
    is_active: bool
    created_at: datetime
    menu_items: List[MenuItemResponse] = []


# ========== Announcement Schemas ==========

class AnnouncementCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=500)
    content: str = Field(..., min_length=1)
    type: str = Field(default="info", pattern="^(info|warning|success|error)$")
    priority: int = Field(default=0, ge=0)
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    target_roles: Optional[List[str]] = []


class AnnouncementResponse(BaseSchema):
    id: int
    title: str
    content: str
    type: str
    is_active: bool
    priority: int
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    target_roles: Optional[List[str]] = []
    created_at: datetime


# ========== Report Schemas ==========

class ReportCreate(BaseSchema):
    name: str
    type: ReportTypeEnum
    parameters: Optional[Dict[str, Any]] = {}

class ReportResponse(BaseSchema):
    id: int
    name: str
    type: ReportTypeEnum
    parameters: Dict[str, Any]
    data: Dict[str, Any]
    created_by_id: Optional[int]
    created_at: datetime


# ========== Message Schemas ==========

class MessagePriorityEnum(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"


class MessageStatusEnum(str, Enum):
    UNREAD = "unread"
    READ = "read"
    ARCHIVED = "archived"


class MessageCreate(BaseModel):
    recipient_id: int = Field(..., gt=0)
    subject: str = Field(..., min_length=1, max_length=255)
    content: str = Field(..., min_length=1)
    priority: MessagePriorityEnum = MessagePriorityEnum.MEDIUM


class MessageUpdate(BaseModel):
    status: Optional[MessageStatusEnum] = None


class MessageResponse(BaseSchema):
    id: int
    sender_id: int
    recipient_id: int
    subject: str
    content: str
    priority: MessagePriorityEnum
    status: MessageStatusEnum
    read_at: Optional[datetime] = None
    archived_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    sender_name: Optional[str] = None
    sender_email: Optional[str] = None
    recipient_name: Optional[str] = None
    recipient_email: Optional[str] = None


# ========== Pagination Schema ==========

class PaginatedResponse(BaseModel):
    items: List[Any]
    total: int
    page: int
    page_size: int
    total_pages: int
