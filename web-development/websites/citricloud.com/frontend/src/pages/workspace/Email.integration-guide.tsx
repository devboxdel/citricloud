// Example: How to integrate Workspace Email with Resend API
// This file shows the key changes needed in Email.tsx

import { emailAPI } from '@/lib/api';
import { useState, useEffect } from 'react';

// ========== Email Type Definitions ==========
type Email = {
  id: number;
  from_address: string;
  to_addresses: string[];
  cc_addresses?: string[];
  subject: string;
  body_text?: string;
  body_html?: string;
  snippet?: string;
  created_at: string;
  sent_at?: string;
  is_read: boolean;
  is_starred: boolean;
  folder: 'inbox' | 'sent' | 'drafts' | 'trash' | 'spam' | 'archive';
  status: 'draft' | 'sent' | 'delivered' | 'failed' | 'received';
  labels?: string[];
  has_attachments?: boolean;
};

type FolderCounts = {
  inbox: number;
  sent: number;
  drafts: number;
  trash: number;
  spam: number;
  archive: number;
  unread: number;
  starred: number;
};

// ========== Example: Load Emails from API ==========
export function useEmails(folder: string) {
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEmails();
  }, [folder]);

  const loadEmails = async () => {
    try {
      setLoading(true);
      const response = await emailAPI.getEmails({
        folder: folder.toLowerCase(),
        limit: 50,
      });
      setEmails(response.data);
    } catch (error) {
      console.error('Failed to load emails:', error);
    } finally {
      setLoading(false);
    }
  };

  return { emails, loading, reload: loadEmails };
}

// ========== Example: Load Folder Counts ==========
export function useFolderCounts() {
  const [counts, setCounts] = useState<FolderCounts | null>(null);

  useEffect(() => {
    loadCounts();
  }, []);

  const loadCounts = async () => {
    try {
      const response = await emailAPI.getFolderCounts();
      setCounts(response.data);
    } catch (error) {
      console.error('Failed to load folder counts:', error);
    }
  };

  return { counts, reload: loadCounts };
}

// ========== Example: Send Email ==========
export async function sendEmail(data: {
  to: string;
  cc?: string;
  subject: string;
  body: string;
}) {
  try {
    const response = await emailAPI.sendEmail({
      to_addresses: [data.to],
      cc_addresses: data.cc ? [data.cc] : undefined,
      subject: data.subject,
      body_text: data.body,
      body_html: `<p>${data.body.replace(/\n/g, '<br>')}</p>`,
    });
    
    console.log('Email sent successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Failed to send email:', error);
    throw error;
  }
}

// ========== Example: Save Draft ==========
export async function saveDraft(data: {
  to: string;
  subject: string;
  body: string;
}) {
  try {
    const response = await emailAPI.saveDraft({
      to_addresses: [data.to],
      subject: data.subject,
      body_text: data.body,
      body_html: `<p>${data.body.replace(/\n/g, '<br>')}</p>`,
    });
    
    console.log('Draft saved:', response.data);
    return response.data;
  } catch (error) {
    console.error('Failed to save draft:', error);
    throw error;
  }
}

// ========== Example: Reply to Email ==========
export async function replyToEmail(emailId: number, body: string) {
  try {
    const response = await emailAPI.replyToEmail(emailId, {
      body_text: body,
      body_html: `<p>${body.replace(/\n/g, '<br>')}</p>`,
    });
    
    console.log('Reply sent:', response.data);
    return response.data;
  } catch (error) {
    console.error('Failed to send reply:', error);
    throw error;
  }
}

// ========== Example: Forward Email ==========
export async function forwardEmail(emailId: number, to: string[], body?: string) {
  try {
    const response = await emailAPI.forwardEmail(emailId, {
      to_addresses: to,
      body_text: body,
      body_html: body ? `<p>${body.replace(/\n/g, '<br>')}</p>` : undefined,
    });
    
    console.log('Email forwarded:', response.data);
    return response.data;
  } catch (error) {
    console.error('Failed to forward email:', error);
    throw error;
  }
}

// ========== Example: Mark as Read ==========
export async function markAsRead(emailId: number) {
  try {
    await emailAPI.updateEmail(emailId, { is_read: true });
  } catch (error) {
    console.error('Failed to mark as read:', error);
  }
}

// ========== Example: Toggle Star ==========
export async function toggleStar(emailId: number, currentState: boolean) {
  try {
    await emailAPI.updateEmail(emailId, { is_starred: !currentState });
  } catch (error) {
    console.error('Failed to toggle star:', error);
  }
}

// ========== Example: Delete Email ==========
export async function deleteEmail(emailId: number, permanent: boolean = false) {
  try {
    await emailAPI.deleteEmail(emailId, permanent);
  } catch (error) {
    console.error('Failed to delete email:', error);
  }
}

// ========== Example: Move to Folder ==========
export async function moveToFolder(emailId: number, folder: string) {
  try {
    await emailAPI.updateEmail(emailId, { folder });
  } catch (error) {
    console.error('Failed to move email:', error);
  }
}

// ========== Integration Steps ==========
/*

1. REPLACE Mock Data with API Calls:
   - Remove the hardcoded emails array
   - Use useEmails() hook to fetch from API
   - Use useFolderCounts() for sidebar counts

2. UPDATE Send Email Function:
   - Replace the mock sendEmail function
   - Call emailAPI.sendEmail() with form data
   - Handle success/error states
   - Reload email list after sending

3. UPDATE Email Actions:
   - toggleStar() - Call emailAPI.updateEmail()
   - markAsRead() - Call emailAPI.updateEmail()
   - deleteEmail() - Call emailAPI.deleteEmail()
   - Move to folder - Call emailAPI.updateEmail()

4. ADD Reply/Forward:
   - Use emailAPI.replyToEmail()
   - Use emailAPI.forwardEmail()
   - Include original email context

5. HANDLE Loading States:
   - Show spinners while loading
   - Handle empty states
   - Display error messages

6. REFRESH Logic:
   - Auto-refresh inbox every 30s
   - Manual refresh button
   - Reload after actions

Example Implementation in Email.tsx:

```tsx
export default function EmailApp() {
  const [currentFolder, setCurrentFolder] = useState('inbox');
  const { emails, loading, reload } = useEmails(currentFolder);
  const { counts, reload: reloadCounts } = useFolderCounts();
  
  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      reload();
      reloadCounts();
    }, 30000);
    return () => clearInterval(interval);
  }, []);
  
  const handleSend = async (formData) => {
    try {
      await sendEmail(formData);
      await reload();
      await reloadCounts();
      setShowCompose(false);
      // Show success toast
    } catch (error) {
      // Show error toast
    }
  };
  
  const handleToggleStar = async (emailId, currentState) => {
    await toggleStar(emailId, currentState);
    await reload();
    await reloadCounts();
  };
  
  // ... rest of component
}
```

7. ERROR HANDLING:
   - Wrap all API calls in try-catch
   - Show user-friendly error messages
   - Log errors for debugging
   - Retry failed requests

8. OPTIMISTIC UPDATES:
   - Update UI immediately
   - Revert on API error
   - Improves perceived performance

*/
