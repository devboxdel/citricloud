"""
Database models for CITRICLOUD
"""
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey, Enum, Float, JSON, Table, Index
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

from app.core.database import Base

# Association table for blog post related posts (many-to-many)
blog_post_related = Table(
    'blog_post_related',
    Base.metadata,
    Column('blog_post_id', Integer, ForeignKey('blog_posts.id', ondelete='CASCADE'), primary_key=True),
    Column('related_post_id', Integer, ForeignKey('blog_posts.id', ondelete='CASCADE'), primary_key=True)
)


class UserRole(str, enum.Enum):
    """User roles"""
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


class TicketStatus(str, enum.Enum):
    """Ticket statuses"""
    OPEN = "open"
    IN_PROGRESS = "in_progress"
    WAITING_RESPONSE = "waiting_response"
    RESOLVED = "resolved"
    CLOSED = "closed"


class OrderStatus(str, enum.Enum):
    """Order statuses"""
    PENDING = "pending"
    PLANNED = "planned"
    WORKING_ON = "working_on"
    PROCESSING = "processing"
    IN_PRODUCTION = "in_production"
    QUALITY_CHECK = "quality_check"
    READY_TO_SHIP = "ready_to_ship"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    ON_HOLD = "on_hold"
    CANCELLED = "cancelled"
    REFUNDED = "refunded"
    COMPLETED = "completed"


class InvoiceStatus(str, enum.Enum):
    """Invoice statuses"""
    DRAFT = "draft"
    SENT = "sent"
    PAID = "paid"
    OVERDUE = "overdue"
    CANCELLED = "cancelled"


class PageStatus(str, enum.Enum):
    """Page statuses"""
    DRAFT = "draft"
    PUBLISHED = "published"
    ARCHIVED = "archived"


class ReportType(str, enum.Enum):
    """Report types"""
    FINANCIAL = "financial"
    SALES = "sales"
    INVENTORY = "inventory"
    SUPPLIERS = "suppliers"


class ContentType(str, enum.Enum):
    """Supported content types for user-generated items"""
    BLOG = "blog"
    NEWS = "news"


class CommentStatus(str, enum.Enum):
    """Comment moderation states"""
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    SPAM = "spam"
    ARCHIVED = "archived"


class CommentReportStatus(str, enum.Enum):
    """Statuses for reported comments"""
    OPEN = "open"
    IN_REVIEW = "in_review"
    RESOLVED = "resolved"
    DISMISSED = "dismissed"


# ========== CRM Models ==========

class Role(Base):
    """Role model for role management"""
    __tablename__ = "roles"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False, index=True)
    role_key = Column(String(100), unique=True, nullable=False, index=True)
    description = Column(Text)
    is_system_role = Column(Boolean, default=False)  # System roles cannot be deleted
    color = Column(String(50), default="blue")  # For UI display
    permissions = Column(JSON, default={})  # JSON object with permission flags
    user_count = Column(Integer, default=0)  # Cached count of users with this role
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    users = relationship("User", foreign_keys="User.role_id", uselist=True)


class User(Base):
    """User model"""
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    username = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255))
    role = Column(Enum(UserRole, name="userrole", create_type=False), default=UserRole.SUBSCRIBER.value, nullable=False)
    role_id = Column(Integer, ForeignKey("roles.id"), nullable=True)  # Link to Role table
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    avatar_url = Column(String(500))
    phone = Column(String(50))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login = Column(DateTime)
    
    # Two-Factor Authentication
    two_factor_enabled = Column(Boolean, default=False)
    two_factor_secret = Column(String(255), nullable=True)
    two_factor_backup_codes = Column(JSON, nullable=True)  # Encrypted list of backup codes
    
    # User Preferences
    preferred_language = Column(String(10), default="en")
    preferred_date_format = Column(String(50), default="MM/DD/YYYY")
    preferred_timezone = Column(String(50), default="UTC")
    
    # Appearance & Theme Preferences
    theme_mode = Column(String(20), default="auto")
    theme_auto_source = Column(String(20), default="system")
    primary_color = Column(String(10), default="#0ea5e9")
    
    # Notification Preferences
    email_notifications = Column(Boolean, default=True)
    push_notifications = Column(Boolean, default=True)
    marketing_emails = Column(Boolean, default=False)
    
    # Privacy Preferences
    profile_visibility = Column(String(20), default="public")
    activity_visibility = Column(String(20), default="connections")
    data_sharing = Column(Boolean, default=False)
    analytics_enabled = Column(Boolean, default=True)
    
    # Security Preferences
    recovery_email = Column(String(255), nullable=True)
    recovery_phone = Column(String(50), nullable=True)
    
    # Accessibility Preferences
    font_size = Column(String(20), default="medium")
    high_contrast = Column(Boolean, default=False)
    reduce_motion = Column(Boolean, default=False)
    screen_reader = Column(Boolean, default=False)
    
    # Billing Address Information
    address = Column(String(500), nullable=True)
    city = Column(String(100), nullable=True)
    country = Column(String(100), nullable=True)
    zip_code = Column(String(20), nullable=True)
    province = Column(String(100), nullable=True)
    district = Column(String(100), nullable=True)
    block = Column(String(100), nullable=True)
    
    # Relationships
    orders = relationship("Order", back_populates="user")
    tickets = relationship("Ticket", back_populates="user", foreign_keys="Ticket.user_id")
    blog_posts = relationship("BlogPost", back_populates="author")
    workspace_files = relationship("WorkspaceFile", back_populates="user")
    emails = relationship("Email", back_populates="user")
    email_signature = relationship("EmailSignature", back_populates="user", uselist=False)
    email_aliases = relationship("EmailAlias", back_populates="user")
    created_shared_emails = relationship("SharedEmail", foreign_keys="SharedEmail.created_by_user_id", back_populates="created_by")
    shared_emails = relationship("SharedEmail", secondary="shared_email_members", back_populates="members")
    notifications = relationship("Notification", back_populates="user")
    notification_settings = relationship("NotificationSetting", back_populates="user", uselist=False)
    user_sessions = relationship("UserSession", back_populates="user", cascade="all, delete-orphan")
    crm_role = relationship("Role", foreign_keys=[role_id], uselist=False)
    
    # Hosting Management Relationships
    servers = relationship("Server", back_populates="user", cascade="all, delete-orphan")
    vpns = relationship("VPN", back_populates="user", cascade="all, delete-orphan")
    domains = relationship("Domain", back_populates="user", cascade="all, delete-orphan")
    dns_zones = relationship("DNSZone", back_populates="user", cascade="all, delete-orphan")
    email_accounts = relationship("EmailAccount", back_populates="user", cascade="all, delete-orphan")
    wordpress_sites = relationship("WordPressSite", back_populates="user", cascade="all, delete-orphan")
    control_panels = relationship("ControlPanel", back_populates="user", cascade="all, delete-orphan")


# ========== ERP Models ==========

class Order(Base):
    """Order model"""
    __tablename__ = "orders"
    
    id = Column(Integer, primary_key=True, index=True)
    order_number = Column(String(100), unique=True, nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    status = Column(Enum(OrderStatus), default=OrderStatus.PENDING, nullable=False)
    total_amount = Column(Float, nullable=False)
    currency = Column(String(10), default="USD")
    shipping_address = Column(JSON)
    billing_address = Column(JSON)
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="orders")
    order_items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")
    invoice = relationship("Invoice", back_populates="order", uselist=False)


class OrderItem(Base):
    """Order item model"""
    __tablename__ = "order_items"
    
    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    quantity = Column(Integer, nullable=False)
    unit_price = Column(Float, nullable=False)
    total_price = Column(Float, nullable=False)
    
    # Relationships
    order = relationship("Order", back_populates="order_items")
    product = relationship("Product", back_populates="order_items")


class Invoice(Base):
    """Invoice model"""
    __tablename__ = "invoices"
    
    id = Column(Integer, primary_key=True, index=True)
    invoice_number = Column(String(100), unique=True, nullable=False, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), unique=True, nullable=False)
    status = Column(Enum(InvoiceStatus), default=InvoiceStatus.DRAFT, nullable=False)
    amount = Column(Float, nullable=False)
    tax_amount = Column(Float, default=0)
    total_amount = Column(Float, nullable=False)
    currency = Column(String(10), default="USD")
    due_date = Column(DateTime)
    paid_date = Column(DateTime)
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    order = relationship("Order", back_populates="invoice")


class Ticket(Base):
    """Support ticket model"""
    __tablename__ = "tickets"
    
    id = Column(Integer, primary_key=True, index=True)
    ticket_number = Column(String(100), unique=True, nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    subject = Column(String(500), nullable=False)
    description = Column(Text, nullable=False)
    status = Column(Enum(TicketStatus), default=TicketStatus.OPEN, nullable=False)
    priority = Column(String(20), default="medium")
    assigned_to = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    closed_at = Column(DateTime)
    
    # Relationships
    user = relationship("User", back_populates="tickets", foreign_keys=[user_id])
    assigned_user = relationship("User", foreign_keys=[assigned_to])


class Supplier(Base):
    """Supplier model"""
    __tablename__ = "suppliers"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    contact_person = Column(String(255))
    email = Column(String(255))
    phone = Column(String(50))
    address = Column(Text)
    category = Column(String(100))
    status = Column(String(50), default="Active")
    rating = Column(Float, default=0.0)
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


# ========== CMS Models ==========

class Page(Base):
    """Page model"""
    __tablename__ = "pages"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(500), nullable=False)
    slug = Column(String(500), unique=True, nullable=False, index=True)
    content = Column(Text)
    meta_title = Column(String(500))
    meta_description = Column(Text)
    meta_keywords = Column(String(500))
    status = Column(Enum(PageStatus), default=PageStatus.DRAFT, nullable=False)
    template = Column(String(100), default="default")
    order_index = Column(Integer, default=0)
    is_homepage = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    published_at = Column(DateTime)


class Menu(Base):
    """Menu model"""
    __tablename__ = "menus"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    slug = Column(String(100), unique=True, nullable=False, index=True)
    location = Column(String(50))  # header, footer, sidebar
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    menu_items = relationship("MenuItem", back_populates="menu", cascade="all, delete-orphan")


class MenuItem(Base):
    """Menu item model"""
    __tablename__ = "menu_items"
    
    id = Column(Integer, primary_key=True, index=True)
    menu_id = Column(Integer, ForeignKey("menus.id"), nullable=False)
    parent_id = Column(Integer, ForeignKey("menu_items.id"))
    title = Column(String(200), nullable=False)
    url = Column(String(500), nullable=False)
    icon = Column(String(100))
    order_index = Column(Integer, default=0)
    target = Column(String(20), default="_self")  # _self, _blank
    is_active = Column(Boolean, default=True)
    
    # Relationships
    menu = relationship("Menu", back_populates="menu_items")
    children = relationship("MenuItem", backref="parent", remote_side=[id])


class BlogCategory(Base):
    """Blog category model"""
    __tablename__ = "blog_categories"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    slug = Column(String(200), unique=True, nullable=False, index=True)
    description = Column(Text)
    icon = Column(String(100))  # Ionicons icon name
    order_index = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    blog_posts = relationship("BlogPost", back_populates="category")


class BlogPost(Base):
    """Blog post model"""
    __tablename__ = "blog_posts"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(500), nullable=False)
    slug = Column(String(500), unique=True, nullable=False, index=True)
    excerpt = Column(Text)
    content = Column(Text, nullable=False)
    featured_image = Column(String(500))
    author_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    category_id = Column(Integer, ForeignKey("blog_categories.id"))
    status = Column(Enum(PageStatus), default=PageStatus.DRAFT, nullable=False)
    meta_title = Column(String(500))
    meta_description = Column(Text)
    views_count = Column(Integer, default=0)
    is_sticky = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    published_at = Column(DateTime)
    
    # Relationships
    author = relationship("User", back_populates="blog_posts")
    category = relationship("BlogCategory", back_populates="blog_posts")
    related_posts = relationship(
        "BlogPost",
        secondary=blog_post_related,
        primaryjoin="BlogPost.id==blog_post_related.c.blog_post_id",
        secondaryjoin="BlogPost.id==blog_post_related.c.related_post_id",
        backref="related_to"
    )


class Comment(Base):
    """User comments on blog or news posts"""
    __tablename__ = "comments"

    id = Column(Integer, primary_key=True, index=True)
    post_id = Column(Integer, ForeignKey("blog_posts.id"), nullable=True)
    post_type = Column(Enum(ContentType), default=ContentType.BLOG, nullable=False)
    post_title = Column(String(500))
    post_slug = Column(String(500))
    author_name = Column(String(255))
    author_email = Column(String(255))
    content = Column(Text, nullable=False)
    status = Column(Enum(CommentStatus), default=CommentStatus.PENDING, nullable=False)
    platform = Column(String(50), default="web")  # web, ios, android
    likes_count = Column(Integer, default=0, nullable=False)
    dislikes_count = Column(Integer, default=0, nullable=False)
    # Emoji reactions stored as JSON: {"👍": 5, "❤️": 3, "😊": 2}
    reactions = Column(Text, default="{}")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    post = relationship("BlogPost")
    reports = relationship("CommentReport", back_populates="comment", cascade="all, delete-orphan")
    user_reactions = relationship("CommentReaction", back_populates="comment", cascade="all, delete-orphan")


class CommentReaction(Base):
    """Track individual user reactions to comments"""
    __tablename__ = "comment_reactions"

    id = Column(Integer, primary_key=True, index=True)
    comment_id = Column(Integer, ForeignKey("comments.id"), nullable=False)
    user_identifier = Column(String(255), nullable=False)  # email or user_id
    emoji = Column(String(10), nullable=False)
    platform = Column(String(50), default="web")  # web, ios, android
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    comment = relationship("Comment", back_populates="user_reactions")

    # Unique constraint: one reaction per user per comment
    __table_args__ = (
        Index('idx_comment_user_reaction', 'comment_id', 'user_identifier', unique=True),
    )


class CommentReport(Base):
    """User-submitted reports against comments"""
    __tablename__ = "comment_reports"

    id = Column(Integer, primary_key=True, index=True)
    comment_id = Column(Integer, ForeignKey("comments.id"), nullable=True)
    post_id = Column(Integer, ForeignKey("blog_posts.id"), nullable=True)
    post_type = Column(Enum(ContentType), default=ContentType.BLOG, nullable=False)
    reason = Column(String(200))
    details = Column(Text)
    reporter_name = Column(String(255))
    reporter_email = Column(String(255))
    platform = Column(String(50), default="web")
    status = Column(Enum(CommentReportStatus), default=CommentReportStatus.OPEN, nullable=False)
    action_taken = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    comment = relationship("Comment", back_populates="reports")
    post = relationship("BlogPost")


class ProductCategory(Base):
    """Product category model"""
    __tablename__ = "product_categories"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    slug = Column(String(200), unique=True, nullable=False, index=True)
    description = Column(Text)
    parent_id = Column(Integer, ForeignKey("product_categories.id"))
    image_url = Column(String(500))
    order_index = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    products = relationship("Product", back_populates="category")
    parent = relationship("ProductCategory", remote_side=[id], foreign_keys=[parent_id], backref="children")


class Product(Base):
    """Product model"""
    __tablename__ = "products"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(500), nullable=False)
    slug = Column(String(500), unique=True, nullable=False, index=True)
    description = Column(Text)
    short_description = Column(Text)
    sku = Column(String(100), unique=True, nullable=False, index=True)
    price = Column(Float, nullable=False)
    sale_price = Column(Float)
    category_id = Column(Integer, ForeignKey("product_categories.id"))
    images = Column(JSON)  # Array of image URLs
    stock_quantity = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    is_featured = Column(Boolean, default=False)
    meta_title = Column(String(500))
    meta_description = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    category = relationship("ProductCategory", back_populates="products")
    order_items = relationship("OrderItem", back_populates="product", cascade="all, delete-orphan")
    stock_movements = relationship("StockMovement", back_populates="product", cascade="all, delete-orphan")


class StockMovement(Base):
    """Stock movement history"""
    __tablename__ = "stock_movements"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    change = Column(Integer, nullable=False)  # delta applied
    quantity_before = Column(Integer, nullable=False)
    quantity_after = Column(Integer, nullable=False)
    reason = Column(String(200), default="manual_adjustment")
    note = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    product = relationship("Product", back_populates="stock_movements")
    user = relationship("User")


# ========== Workspace Models ==========

class WorkspaceFile(Base):
    """Workspace file model (similar to OneDrive)"""
    __tablename__ = "workspace_files"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String(500), nullable=False)
    file_type = Column(String(100))
    file_size = Column(Integer)
    file_path = Column(String(1000), nullable=False)
    parent_id = Column(Integer, ForeignKey("workspace_files.id"))
    is_folder = Column(Boolean, default=False)
    is_shared = Column(Boolean, default=False)
    shared_with = Column(JSON)  # Array of user IDs
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="workspace_files")
    children = relationship("WorkspaceFile", backref="parent", remote_side=[id])


class Announcement(Base):
    """Announcement model"""
    __tablename__ = "announcements"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(500), nullable=False)
    content = Column(Text, nullable=False)
    type = Column(String(50), default="info")  # info, warning, success, error
    is_active = Column(Boolean, default=True)
    priority = Column(Integer, default=0)
    start_date = Column(DateTime)
    end_date = Column(DateTime)
    target_roles = Column(JSON)  # Array of roles to show to
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Report(Base):
    """Report model"""
    __tablename__ = "reports"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    type = Column(Enum(ReportType), nullable=False)
    parameters = Column(JSON, default={}) # Date range, etc.
    data = Column(JSON, default={}) # The actual report data
    created_by_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    created_by = relationship("User")


class UserSession(Base):
    """User session model for tracking active sessions"""
    __tablename__ = "user_sessions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    session_token = Column(String(500), unique=True, nullable=False)
    device_name = Column(String(255))
    device_type = Column(String(50))  # mobile, desktop, tablet
    browser = Column(String(100))
    operating_system = Column(String(100))
    ip_address = Column(String(45))
    location = Column(String(255))  # Country, City
    is_active = Column(Boolean, default=True)
    last_activity = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime)
    
    # Relationships
    user = relationship("User", back_populates="user_sessions")
    
    def __repr__(self):
        return f"<UserSession(user_id={self.user_id}, device={self.device_name}, ip={self.ip_address})>"

