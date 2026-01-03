/**
 * Email Service Integration Examples
 * Demonstrates how to use all Resend API functions in the workspace
 */

import { emailAPI } from '../lib/api';

// ========== Example 1: Send Single Email ==========
export async function sendSingleEmail() {
  try {
    const response = await emailAPI.sendEmail({
      to_addresses: ['recipient@example.com'],
      subject: 'Hello from CITRICLOUD',
      body_html: '<h1>Welcome</h1><p>This is a test email from CITRICLOUD Workspace.</p>',
      body_text: 'Welcome - This is a test email from CITRICLOUD Workspace.',
      cc_addresses: ['cc@example.com'],
      labels: ['important', 'test']
    });
    
    console.log('Email sent successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Failed to send email:', error);
    throw error;
  }
}

// ========== Example 2: Send Batch Emails ==========
export async function sendBatchEmails() {
  try {
    const emails = [
      {
        to_addresses: ['user1@example.com'],
        subject: 'Newsletter - Edition 1',
        body_html: '<h1>Newsletter</h1><p>Content for user 1</p>',
        body_text: 'Newsletter - Content for user 1'
      },
      {
        to_addresses: ['user2@example.com'],
        subject: 'Newsletter - Edition 1',
        body_html: '<h1>Newsletter</h1><p>Content for user 2</p>',
        body_text: 'Newsletter - Content for user 2'
      },
      {
        to_addresses: ['user3@example.com'],
        subject: 'Newsletter - Edition 1',
        body_html: '<h1>Newsletter</h1><p>Content for user 3</p>',
        body_text: 'Newsletter - Content for user 3'
      }
    ];
    
    const response = await emailAPI.sendBatchEmails(emails);
    console.log('Batch emails sent:', response.data);
    return response.data;
  } catch (error) {
    console.error('Failed to send batch emails:', error);
    throw error;
  }
}

// ========== Example 3: Get Email Details ==========
export async function getEmailDetails(resendEmailId: string) {
  try {
    const response = await emailAPI.getResendEmailDetails(resendEmailId);
    console.log('Email details:', response.data);
    return response.data;
  } catch (error) {
    console.error('Failed to get email details:', error);
    throw error;
  }
}

// ========== Example 4: Reschedule Email ==========
export async function rescheduleEmail(resendEmailId: string, minutes: number = 5) {
  try {
    const response = await emailAPI.rescheduleEmail(resendEmailId, minutes);
    console.log('Email rescheduled:', response.data);
    return response.data;
  } catch (error) {
    console.error('Failed to reschedule email:', error);
    throw error;
  }
}

// ========== Example 5: Cancel Scheduled Email ==========
export async function cancelEmail(resendEmailId: string) {
  try {
    const response = await emailAPI.cancelScheduledEmail(resendEmailId);
    console.log('Email cancelled:', response.data);
    return response.data;
  } catch (error) {
    console.error('Failed to cancel email:', error);
    throw error;
  }
}

// ========== Example 6: List All Sent Emails ==========
export async function listAllSentEmails() {
  try {
    const response = await emailAPI.listAllSentEmails();
    console.log('All sent emails:', response.data);
    return response.data;
  } catch (error) {
    console.error('Failed to list sent emails:', error);
    throw error;
  }
}

// ========== Example 7: List Email Attachments ==========
export async function listEmailAttachments(resendEmailId: string) {
  try {
    const response = await emailAPI.listEmailAttachments(resendEmailId);
    console.log('Email attachments:', response.data);
    return response.data;
  } catch (error) {
    console.error('Failed to list attachments:', error);
    throw error;
  }
}

// ========== Example 8: Get Attachment Details ==========
export async function getAttachmentDetails(resendEmailId: string, attachmentId: string) {
  try {
    const response = await emailAPI.getEmailAttachment(resendEmailId, attachmentId);
    console.log('Attachment details:', response.data);
    return response.data;
  } catch (error) {
    console.error('Failed to get attachment:', error);
    throw error;
  }
}

// ========== Example 9: List Received Emails ==========
export async function listReceivedEmails() {
  try {
    const response = await emailAPI.listReceivedEmails();
    console.log('Received emails:', response.data);
    return response.data;
  } catch (error) {
    console.error('Failed to list received emails:', error);
    throw error;
  }
}

// ========== Example 10: Get Received Email Details ==========
export async function getReceivedEmailDetails(resendEmailId: string) {
  try {
    const response = await emailAPI.getReceivedEmailDetails(resendEmailId);
    console.log('Received email details:', response.data);
    return response.data;
  } catch (error) {
    console.error('Failed to get received email:', error);
    throw error;
  }
}

// ========== Example 11: List Received Email Attachments ==========
export async function listReceivedEmailAttachments(resendEmailId: string) {
  try {
    const response = await emailAPI.listReceivedEmailAttachments(resendEmailId);
    console.log('Received email attachments:', response.data);
    return response.data;
  } catch (error) {
    console.error('Failed to list received attachments:', error);
    throw error;
  }
}

// ========== Example 12: Get Received Email Attachment ==========
export async function getReceivedAttachment(resendEmailId: string, attachmentId: string) {
  try {
    const response = await emailAPI.getReceivedEmailAttachment(resendEmailId, attachmentId);
    console.log('Received attachment:', response.data);
    return response.data;
  } catch (error) {
    console.error('Failed to get received attachment:', error);
    throw error;
  }
}

// ========== Example 13: Complete Email Workflow ==========
export async function completeEmailWorkflow() {
  try {
    console.log('Starting complete email workflow...');
    
    // 1. Send an email
    console.log('Step 1: Sending email...');
    const sentEmail = await sendSingleEmail();
    const resendEmailId = sentEmail.resend_email_id;
    
    // 2. Get email details
    console.log('Step 2: Getting email details...');
    await getEmailDetails(resendEmailId);
    
    // 3. List all sent emails
    console.log('Step 3: Listing all sent emails...');
    await listAllSentEmails();
    
    // 4. Get folder counts
    console.log('Step 4: Getting folder counts...');
    const counts = await emailAPI.getFolderCounts();
    console.log('Folder counts:', counts.data);
    
    console.log('Workflow completed successfully!');
    
    return {
      success: true,
      message: 'All email operations completed successfully'
    };
  } catch (error) {
    console.error('Workflow failed:', error);
    throw error;
  }
}

// ========== Example 14: Inbox Management ==========
export async function manageInbox() {
  try {
    // Get all inbox emails
    const inboxEmails = await emailAPI.getEmails({
      folder: 'inbox',
      is_read: false,
      limit: 50
    });
    
    console.log(`Found ${inboxEmails.data.length} unread emails`);
    
    // Mark first email as read
    if (inboxEmails.data.length > 0) {
      const firstEmail = inboxEmails.data[0];
      await emailAPI.updateEmail(firstEmail.id, {
        is_read: true,
        is_starred: true
      });
      console.log('Marked first email as read and starred');
    }
    
    // Get updated counts
    const counts = await emailAPI.getFolderCounts();
    console.log('Updated counts:', counts.data);
    
    return inboxEmails.data;
  } catch (error) {
    console.error('Failed to manage inbox:', error);
    throw error;
  }
}

// ========== Example 15: Reply to Email ==========
export async function replyToEmail(emailId: number) {
  try {
    const response = await emailAPI.replyToEmail(emailId, {
      body_html: '<p>Thank you for your email. I will get back to you soon.</p>',
      body_text: 'Thank you for your email. I will get back to you soon.',
      cc_addresses: []
    });
    
    console.log('Reply sent:', response.data);
    return response.data;
  } catch (error) {
    console.error('Failed to send reply:', error);
    throw error;
  }
}

// ========== Example 16: Forward Email ==========
export async function forwardEmail(emailId: number, recipients: string[]) {
  try {
    const response = await emailAPI.forwardEmail(emailId, {
      to_addresses: recipients,
      body_html: '<p>Please see the forwarded message below.</p>',
      body_text: 'Please see the forwarded message below.'
    });
    
    console.log('Email forwarded:', response.data);
    return response.data;
  } catch (error) {
    console.error('Failed to forward email:', error);
    throw error;
  }
}

// ========== Example 17: Email Signature Management ==========
export async function manageSignature() {
  try {
    // Create/update signature
    await emailAPI.saveSignature({
      signature_html: '<p>Best regards,<br><strong>Your Name</strong><br>CITRICLOUD Team</p>',
      signature_text: 'Best regards,\nYour Name\nCITRICLOUD Team',
      is_enabled: true
    });
    
    console.log('Signature saved');
    
    // Get current signature
    const signature = await emailAPI.getSignature();
    console.log('Current signature:', signature.data);
    
    return signature.data;
  } catch (error) {
    console.error('Failed to manage signature:', error);
    throw error;
  }
}

// ========== Example 18: Draft Management ==========
export async function manageDrafts() {
  try {
    // Save draft
    const draft = await emailAPI.saveDraft({
      to_addresses: ['recipient@example.com'],
      subject: 'Draft Email',
      body_html: '<p>This is a draft email...</p>',
      body_text: 'This is a draft email...'
    });
    
    console.log('Draft saved:', draft.data);
    
    // Get all drafts
    const drafts = await emailAPI.getEmails({
      folder: 'drafts',
      limit: 50
    });
    
    console.log(`Found ${drafts.data.length} drafts`);
    
    return drafts.data;
  } catch (error) {
    console.error('Failed to manage drafts:', error);
    throw error;
  }
}

// ========== Export All Examples ==========
export const emailExamples = {
  sendSingleEmail,
  sendBatchEmails,
  getEmailDetails,
  rescheduleEmail,
  cancelEmail,
  listAllSentEmails,
  listEmailAttachments,
  getAttachmentDetails,
  listReceivedEmails,
  getReceivedEmailDetails,
  listReceivedEmailAttachments,
  getReceivedAttachment,
  completeEmailWorkflow,
  manageInbox,
  replyToEmail,
  forwardEmail,
  manageSignature,
  manageDrafts
};

export default emailExamples;
