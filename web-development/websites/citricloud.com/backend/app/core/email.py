"""
Email utility using Resend API for reliable email delivery
"""
import resend
from typing import Optional, List, Dict, Any

from app.core.config import settings
from app.core.resend_service import resend_service


async def send_email(
    to_email: str, 
    subject: str, 
    html_body: str, 
    text_body: Optional[str] = None,
    cc: Optional[List[str]] = None,
    bcc: Optional[List[str]] = None,
    reply_to: Optional[List[str]] = None,
    attachments: Optional[List[Dict[str, Any]]] = None
) -> bool:
    """Send email using Resend API.

    Args:
        to_email: Recipient email address
        subject: Email subject line
        html_body: HTML content of the email
        text_body: Plain text content (optional, for fallback)
        cc: List of CC recipients (optional)
        bcc: List of BCC recipients (optional)
        reply_to: List of reply-to addresses (optional)
        attachments: List of attachments (optional)

    Returns:
        True if email sent successfully, False otherwise.
    """
    try:
        # Use the resend service
        result = resend_service.send_email(
            from_address=settings.EMAIL_FROM,
            to_addresses=[to_email],
            subject=subject,
            html=html_body,
            text=text_body,
            cc=cc,
            bcc=bcc,
            reply_to=reply_to,
            attachments=attachments
        )
        
        return result["success"]
        
    except Exception as e:
        # In production, integrate proper logging here
        print(f"Email send failed: {str(e)}")
        return False


async def send_bulk_emails(
    emails: List[Dict[str, Any]]
) -> Dict[str, Any]:
    """
    Send multiple emails in a batch using Resend API
    
    Args:
        emails: List of email dictionaries with keys: to, subject, html, text (optional)
    
    Returns:
        Dictionary with success status and results
    """
    try:
        # Prepare batch with sender address
        batch_emails = []
        for email in emails:
            batch_emails.append({
                "from": settings.EMAIL_FROM,
                "to": [email["to"]],
                "subject": email["subject"],
                "html": email["html"],
                "text": email.get("text")
            })
        
        result = resend_service.send_batch_emails(batch_emails)
        return result
        
    except Exception as e:
        return {"success": False, "error": str(e)}
