import os
import sys
import asyncio
import httpx
import json as json_lib
from sqlalchemy import text, create_engine
from sqlalchemy.orm import sessionmaker

# Add app to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

DATABASE_URL = "postgresql://citricloud:citricloud@localhost:5432/citricloud"

async def backfill_emails():
    # Get emails from Resend
    resend_api_key = "re_ThcWuUJx_Ap7Y616uB8QUpxMFuhX3NR8W"
    
    async with httpx.AsyncClient() as client:
        response = await client.get(
            "https://api.resend.com/emails",
            headers={"Authorization": f"Bearer {resend_api_key}"},
            params={"limit": 100},
            timeout=30.0
        )
        
        if response.status_code != 200:
            print(f"Failed to fetch emails: {response.status_code}")
            return
        
        data = response.json()
        emails = data.get("data", [])
        print(f"Fetched {len(emails)} emails from Resend")
        
        # Connect to database
        engine = create_engine(DATABASE_URL)
        conn = engine.connect()
        
        # Get shared email addresses
        result = conn.execute(text("SELECT id, email_name, email_name || '@citricloud.com' as full_email FROM shared_emails"))
        shared_emails = {row.full_email: row.id for row in result.fetchall()}
        print(f"Found {len(shared_emails)} shared emails: {list(shared_emails.keys())}")
        
        inserted = 0
        for email in emails:
            email_from = email.get("from", "")
            email_to = email.get("to", [])
            
            # Determine which shared email this belongs to
            shared_email_id = None
            direction = None
            
            # Check if sent FROM a shared email
            for shared_addr, se_id in shared_emails.items():
                if shared_addr in email_from:
                    shared_email_id = se_id
                    direction = "outbound"
                    break
            
            # Check if sent TO a shared email
            if not shared_email_id:
                for shared_addr, se_id in shared_emails.items():
                    if isinstance(email_to, list):
                        for recipient in email_to:
                            if shared_addr in str(recipient):
                                shared_email_id = se_id
                                direction = "inbound"
                                break
                    if shared_email_id:
                        break
            
            if shared_email_id:
                # Insert into database
                try:
                    conn.execute(text("""
                        INSERT INTO shared_email_messages 
                        (shared_email_id, resend_email_id, from_address, to_addresses, subject, body_html, body_text, direction, status, created_at)
                        VALUES (:shared_email_id, :resend_email_id, :from_address, :to_addresses, :subject, :body_html, :body_text, :direction, :status, :created_at)
                        ON CONFLICT (resend_email_id) DO NOTHING
                    """), {
                        "shared_email_id": shared_email_id,
                        "resend_email_id": email.get("id"),
                        "from_address": email_from,
                        "to_addresses": json_lib.dumps(email_to),
                        "subject": email.get("subject", "No Subject"),
                        "body_html": email.get("html"),
                        "body_text": email.get("text"),
                        "direction": direction,
                        "status": email.get("last_event", "unknown"),
                        "created_at": email.get("created_at")
                    })
                    conn.commit()
                    inserted += 1
                    print(f"Inserted {direction} email: {email.get('subject')} (ID: {email.get('id')})")
                except Exception as e:
                    print(f"Error inserting email {email.get('id')}: {e}")
                    conn.rollback()
        
        print(f"\nBackfill complete! Inserted {inserted} emails")
        conn.close()

if __name__ == "__main__":
    asyncio.run(backfill_emails())
