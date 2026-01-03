"""
Comprehensive Resend API Service Integration
Handles all email operations: send, batch send, retrieve, update, cancel, list, attachments
"""
import resend
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta

from app.core.config import settings


class ResendEmailService:
    """Service class for Resend API email operations"""
    
    def __init__(self):
        """Initialize Resend service with API key"""
        resend.api_key = settings.RESEND_API_KEY
    
    # ========== Send Operations ==========
    
    def send_email(
        self,
        from_address: str,
        to_addresses: List[str],
        subject: str,
        html: Optional[str] = None,
        text: Optional[str] = None,
        cc: Optional[List[str]] = None,
        bcc: Optional[List[str]] = None,
        reply_to: Optional[List[str]] = None,
        attachments: Optional[List[Dict[str, Any]]] = None,
        tags: Optional[List[Dict[str, str]]] = None,
        scheduled_at: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Send a single email via Resend API
        
        Args:
            from_address: Sender email address (e.g., "Acme <onboarding@resend.dev>")
            to_addresses: List of recipient email addresses
            subject: Email subject
            html: HTML body content
            text: Plain text body content
            cc: List of CC recipients
            bcc: List of BCC recipients
            reply_to: List of reply-to addresses
            attachments: List of attachment dictionaries
            tags: List of tag dictionaries for categorization
            scheduled_at: ISO 8601 datetime string for scheduled sending
            
        Returns:
            Dictionary with email ID and status
        """
        try:
            params: resend.Emails.SendParams = {
                "from": from_address,
                "to": to_addresses,
                "subject": subject,
            }
            
            # Add optional fields
            if html:
                params["html"] = html
            if text:
                params["text"] = text
            if cc:
                params["cc"] = cc
            if bcc:
                params["bcc"] = bcc
            if reply_to:
                params["reply_to"] = reply_to
            if attachments:
                params["attachments"] = attachments
            if tags:
                params["tags"] = tags
            if scheduled_at:
                params["scheduled_at"] = scheduled_at
            
            email = resend.Emails.send(params)
            return {"success": True, "data": email}
            
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def send_batch_emails(
        self,
        emails: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Send multiple emails in a batch via Resend API
        
        Args:
            emails: List of email parameter dictionaries, each containing:
                    - from: Sender address
                    - to: List of recipients
                    - subject: Email subject
                    - html: HTML content
                    - text: Text content (optional)
                    
        Returns:
            Dictionary with batch send results
        """
        try:
            params: List[resend.Emails.SendParams] = []
            
            for email_data in emails:
                email_params: resend.Emails.SendParams = {
                    "from": email_data["from"],
                    "to": email_data["to"],
                    "subject": email_data["subject"],
                    "html": email_data.get("html", ""),
                }
                
                # Add optional fields
                if "text" in email_data:
                    email_params["text"] = email_data["text"]
                if "cc" in email_data:
                    email_params["cc"] = email_data["cc"]
                if "bcc" in email_data:
                    email_params["bcc"] = email_data["bcc"]
                if "reply_to" in email_data:
                    email_params["reply_to"] = email_data["reply_to"]
                if "attachments" in email_data:
                    email_params["attachments"] = email_data["attachments"]
                if "tags" in email_data:
                    email_params["tags"] = email_data["tags"]
                
                params.append(email_params)
            
            result = resend.Batch.send(params)
            return {"success": True, "data": result}
            
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    # ========== Retrieve Operations ==========
    
    def get_email(self, email_id: str) -> Dict[str, Any]:
        """
        Retrieve a specific email by ID
        
        Args:
            email_id: The Resend email ID
            
        Returns:
            Dictionary with email details
        """
        try:
            email = resend.Emails.get(email_id=email_id)
            return {"success": True, "data": email}
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def list_emails(
        self,
        limit: Optional[int] = 100,
        offset: Optional[int] = 0
    ) -> Dict[str, Any]:
        """
        List sent emails
        
        Args:
            limit: Maximum number of emails to return
            offset: Number of emails to skip
            
        Returns:
            Dictionary with list of emails
        """
        try:
            emails = resend.Emails.list()
            return {"success": True, "data": emails}
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    # ========== Update Operations ==========
    
    def update_email(
        self,
        email_id: str,
        scheduled_at: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Update a scheduled email
        
        Args:
            email_id: The Resend email ID
            scheduled_at: New ISO 8601 datetime string for scheduled sending
            
        Returns:
            Dictionary with update status
        """
        try:
            update_params: resend.Emails.UpdateParams = {
                "id": email_id,
            }
            
            if scheduled_at:
                update_params["scheduled_at"] = scheduled_at
            
            result = resend.Emails.update(params=update_params)
            return {"success": True, "data": result}
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def reschedule_email(
        self,
        email_id: str,
        minutes_from_now: int = 1
    ) -> Dict[str, Any]:
        """
        Reschedule an email to send after specified minutes
        
        Args:
            email_id: The Resend email ID
            minutes_from_now: Number of minutes from now to schedule
            
        Returns:
            Dictionary with update status
        """
        try:
            new_schedule_time = (datetime.now() + timedelta(minutes=minutes_from_now)).isoformat()
            
            update_params: resend.Emails.UpdateParams = {
                "id": email_id,
                "scheduled_at": new_schedule_time
            }
            
            result = resend.Emails.update(params=update_params)
            return {"success": True, "data": result, "scheduled_at": new_schedule_time}
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    # ========== Cancel Operations ==========
    
    def cancel_email(self, email_id: str) -> Dict[str, Any]:
        """
        Cancel a scheduled email
        
        Args:
            email_id: The Resend email ID
            
        Returns:
            Dictionary with cancellation status
        """
        try:
            result = resend.Emails.cancel(email_id=email_id)
            return {"success": True, "data": result}
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    # ========== Attachment Operations (Sent Emails) ==========
    
    def list_attachments(self, email_id: str) -> Dict[str, Any]:
        """
        List all attachments for a sent email
        
        Args:
            email_id: The Resend email ID
            
        Returns:
            Dictionary with list of attachments
        """
        try:
            attachments = resend.Emails.Attachments.list(email_id=email_id)
            return {"success": True, "data": attachments}
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def get_attachment(
        self,
        email_id: str,
        attachment_id: str
    ) -> Dict[str, Any]:
        """
        Retrieve a specific attachment from a sent email
        
        Args:
            email_id: The Resend email ID
            attachment_id: The attachment ID
            
        Returns:
            Dictionary with attachment details
        """
        try:
            attachment = resend.Emails.Attachments.get(
                email_id=email_id,
                attachment_id=attachment_id
            )
            return {"success": True, "data": attachment}
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    # ========== Received Email Operations ==========
    
    def list_received_emails(
        self,
        limit: Optional[int] = 100,
        offset: Optional[int] = 0
    ) -> Dict[str, Any]:
        """
        List received (inbound) emails
        
        Args:
            limit: Maximum number of emails to return
            offset: Number of emails to skip
            
        Returns:
            Dictionary with list of received emails
        """
        try:
            received_emails = resend.Emails.Receiving.list()
            return {"success": True, "data": received_emails}
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def get_received_email(self, email_id: str) -> Dict[str, Any]:
        """
        Retrieve a specific received (inbound) email
        
        Args:
            email_id: The Resend email ID
            
        Returns:
            Dictionary with received email details
        """
        try:
            received_email = resend.Emails.Receiving.get(email_id=email_id)
            return {"success": True, "data": received_email}
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def list_received_email_attachments(self, email_id: str) -> Dict[str, Any]:
        """
        List all attachments for a received email
        
        Args:
            email_id: The Resend email ID
            
        Returns:
            Dictionary with list of attachments
        """
        try:
            from resend import EmailsReceiving
            
            all_attachments: EmailsReceiving.Attachments.ListResponse = (
                resend.Emails.Receiving.Attachments.list(email_id=email_id)
            )
            return {"success": True, "data": all_attachments}
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def get_received_email_attachment(
        self,
        email_id: str,
        attachment_id: str
    ) -> Dict[str, Any]:
        """
        Retrieve a specific attachment from a received email
        
        Args:
            email_id: The Resend email ID
            attachment_id: The attachment ID
            
        Returns:
            Dictionary with attachment details and content
        """
        try:
            attachment_details: resend.EmailAttachmentDetails = (
                resend.Emails.Receiving.Attachments.get(
                    email_id=email_id,
                    attachment_id=attachment_id,
                )
            )
            return {"success": True, "data": attachment_details}
        except Exception as e:
            return {"success": False, "error": str(e)}


# Singleton instance
resend_service = ResendEmailService()
