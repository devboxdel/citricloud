"""
API v1 Router
"""
from fastapi import APIRouter

from app.api.v1.endpoints import auth, crm, cms, erp, activity, status_codes, email, email_aliases, shared_emails, courses, lists, bookings, forms, todos, workspace, notifications, srm, invoices, site_settings, shop, collaboration

api_router = APIRouter()


@api_router.get("/", tags=["API Info"])
async def api_root():
    """API v1 root endpoint - shows available endpoints"""
    return {
        "message": "CITRICLOUD API v1",
        "version": "1.0.0",
        "endpoints": {
            "auth": "/api/v1/auth",
            "crm": "/api/v1/crm",
            "cms": "/api/v1/cms",
            "erp": "/api/v1/erp",
            "shop": "/api/v1/shop",
            "email": "/api/v1/email",
            "email_aliases": "/api/v1/email-aliases",
            "shared_emails": "/api/v1/shared-emails",
            "invoices": "/api/v1/invoices",
            "site_settings": "/api/v1/site-settings",
            "status_codes": "/api/v1/status-codes",
            "documentation": "/api/v1/docs",
        },
    }


# Include all endpoint routers
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(crm.router, prefix="/crm", tags=["CRM Dashboard"])
api_router.include_router(cms.router, prefix="/cms", tags=["CMS Dashboard"])
api_router.include_router(erp.router, prefix="/erp", tags=["ERP Dashboard"])
api_router.include_router(shop.router, prefix="/shop", tags=["Public Shop"])
api_router.include_router(email.router, prefix="/email", tags=["Workspace Email"])
api_router.include_router(email_aliases.router, prefix="/email-aliases", tags=["Email Aliases"])
api_router.include_router(shared_emails.router, prefix="/shared-emails", tags=["Shared Emails"])
api_router.include_router(invoices.router, prefix="/invoices", tags=["Invoices"])
api_router.include_router(activity.router, prefix="/activity", tags=["Workspace Activity"])
api_router.include_router(status_codes.router, tags=["Status Codes"])
api_router.include_router(courses.router, prefix="/courses", tags=["Workspace Courses"])
api_router.include_router(lists.router, prefix="/lists", tags=["Workspace Lists"])
api_router.include_router(bookings.router, prefix="/bookings", tags=["Workspace Bookings"])
api_router.include_router(forms.router, prefix="/forms", tags=["Workspace Forms"])
api_router.include_router(todos.router, prefix="/todos", tags=["Workspace Todos"])
api_router.include_router(workspace.router, prefix="/workspace", tags=["Workspace Items"])
api_router.include_router(notifications.router, prefix="/notifications", tags=["Notifications"])
api_router.include_router(srm.router, prefix="/srm", tags=["Server Resources Management"])
api_router.include_router(site_settings.router, prefix="/site-settings", tags=["Site Settings"])
api_router.include_router(collaboration.router, prefix="/collaboration", tags=["Collaboration"])

