import { motion } from 'framer-motion';
import { useState, useMemo } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { FiChevronRight, FiSearch, FiHelpCircle, FiLock, FiDollarSign, FiZap, FiAlertCircle, FiPhone, FiChevronDown, FiStar, FiTrendingUp, FiBook, FiPlayCircle, FiArrowRight } from 'react-icons/fi';
import { useLanguage } from '../context/LanguageContext';

interface Article {
  title: string;
  desc: string;
  content: string[];
  views?: number;
  helpful?: number;
  featured?: boolean;
}

interface HelpTopic {
  id: string;
  category: string;
  title: string;
  description: string;
  icon: any;
  articles: Article[];
}

export default function HelpCenterPage() {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedArticle, setSelectedArticle] = useState<{ topicId: string; articleIndex: number } | null>(null);
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set(['getting-started']));
  const [feedbackGiven, setFeedbackGiven] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string>('');
  const [sortBy, setSortBy] = useState<'recent' | 'popular'>('popular');

  const topics: HelpTopic[] = [
    {
      id: 'getting-started',
      category: 'Getting Started',
      title: 'Getting Started',
      description: 'Learn the basics and get up and running in minutes',
      icon: FiZap,
      articles: [
        {
          title: 'Create Your Account',
          desc: 'Sign up and set up your CITRICLOUD profile',
          content: [
            'Creating an account on CITRICLOUD is quick and easy:',
            '',
            '1. Visit citricloud.com and click "Sign Up"',
            '2. Enter your email address and create a strong password',
            '3. Verify your email by clicking the link in the confirmation email',
            '4. Complete your profile with your name and preferred settings',
            '5. Choose your initial plan (Free, Pro, or Enterprise)',
            '',
            'Once your account is created, you\'ll have access to the full dashboard and all available features based on your plan.'
          ]
        },
        {
          title: 'First Steps Dashboard',
          desc: 'Navigate the main dashboard interface',
          content: [
            'The CITRICLOUD dashboard is your command center. Here\'s what you\'ll see:',
            '',
            'Main Navigation (Left Sidebar):',
            '• Dashboard - Overview of your account and activities',
            '• Workspace - Access all workspace apps (Email, Documents, etc.)',
            '• Settings - Account preferences and configuration',
            '• Support - Access help resources',
            '',
            'Dashboard Overview:',
            '• Quick stats showing your account activity',
            '• Recent updates and notifications',
            '• Quick access buttons to frequently used features',
            '• Performance metrics and usage statistics',
            '',
            'Top Navigation Bar:',
            '• Search function to find pages and content',
            '• Notifications bell for system alerts',
            '• Profile menu for account management'
          ]
        },
        {
          title: 'Quick Setup Guide',
          desc: 'Configure your workspace in 5 minutes',
          content: [
            'Follow these steps to get your workspace ready:',
            '',
            'Step 1: Complete Your Profile (1 min)',
            '• Go to Settings > Profile',
            '• Add your avatar and display name',
            '• Set your timezone and language preferences',
            '',
            'Step 2: Configure Email (2 min)',
            '• Navigate to Workspace > Email',
            '• Connect your email account or create a new one',
            '• Set up email forwarding if needed',
            '',
            'Step 3: Invite Team Members (1 min)',
            '• Go to Settings > Team',
            '• Click "Invite Member"',
            '• Enter team member emails',
            '',
            'Step 4: Set Preferences (1 min)',
            '• Choose your theme (Light/Dark)',
            '• Enable notifications',
            '• Set privacy preferences',
            '',
            'You\'re ready to start using CITRICLOUD!'
          ]
        },
        {
          title: 'Team Invitations',
          desc: 'Add team members to your workspace',
          content: [
            'Inviting team members to your CITRICLOUD workspace:',
            '',
            'How to Invite Team Members:',
            '1. Click Settings in the main navigation',
            '2. Go to Team Management',
            '3. Click "Invite New Member"',
            '4. Enter their email address',
            '5. Select their role (Member, Editor, Admin)',
            '6. Click "Send Invitation"',
            '',
            'Roles & Permissions:',
            '• Member - Can view and use workspace apps',
            '• Editor - Can create and modify content',
            '• Admin - Full access and can manage team settings',
            '',
            'Invitation Process:',
            '• Invitee receives an email invitation',
            '• They click the link to accept',
            '• New account is created automatically',
            '• They\'re added to your workspace',
            '',
            'Removing Team Members:',
            '• Go to Team Management',
            '• Click the member you want to remove',
            '• Click "Remove from Workspace"'
          ]
        }
      ]
    },
    {
      id: 'account-security',
      category: 'Account & Security',
      title: 'Account & Security',
      description: 'Manage your account, passwords, and security settings',
      icon: FiLock,
      articles: [
        {
          title: 'Change Password',
          desc: 'Update your account password securely',
          content: [
            'To change your password:',
            '',
            '1. Go to Settings > Security',
            '2. Click "Change Password"',
            '3. Enter your current password',
            '4. Create a new password (minimum 12 characters)',
            '5. Confirm the new password',
            '6. Click "Update Password"',
            '',
            'Password Requirements:',
            '• Minimum 12 characters',
            '• Include uppercase and lowercase letters',
            '• Include at least one number',
            '• Include at least one special character (!@#$%^&*)',
            '',
            'Security Tips:',
            '• Change your password every 90 days',
            '• Don\'t reuse previous passwords',
            '• Use a unique password for CITRICLOUD'
          ]
        },
        {
          title: 'Two-Factor Authentication',
          desc: 'Enable 2FA for enhanced security',
          content: [
            'Two-Factor Authentication adds an extra security layer:',
            '',
            'Enabling 2FA:',
            '1. Go to Settings > Security',
            '2. Click "Enable Two-Factor Authentication"',
            '3. Choose your authentication method (Authenticator App or SMS)',
            '',
            'Using Authenticator App (Recommended):',
            '• Download Google Authenticator or Authy',
            '• Scan the QR code in CITRICLOUD',
            '• Save your backup codes in a secure place',
            '• Enter the 6-digit code to confirm',
            '',
            'Using SMS:',
            '• Enter your phone number',
            '• Receive a verification code via SMS',
            '• Enter the code to confirm',
            '',
            'Backup Codes:',
            '• Save these codes in a secure location',
            '• Use them if you lose access to your authenticator',
            '• Each code can only be used once'
          ]
        },
        {
          title: 'Manage Sessions',
          desc: 'View and close active login sessions',
          content: [
            'Monitor and manage your active login sessions:',
            '',
            'View Active Sessions:',
            '1. Go to Settings > Security > Active Sessions',
            '2. See all devices logged into your account',
            '3. View device type, location, and last accessed time',
            '',
            'Session Information:',
            '• Device type (Desktop, Mobile, Tablet)',
            '• Browser and OS information',
            '• IP address and approximate location',
            '• Last activity timestamp',
            '',
            'Close Sessions:',
            '• Click "Sign Out" next to any session to close it',
            '• Click "Sign Out All" to close all sessions except current',
            '• You\'ll need to log in again on closed devices',
            '',
            'Best Practices:',
            '• Regularly check for unfamiliar sessions',
            '• Sign out from public computers after use',
            '• Sign out devices you no longer use'
          ]
        },
        {
          title: 'Privacy Settings',
          desc: 'Control your data and privacy preferences',
          content: [
            'Manage how your data is used:',
            '',
            'Privacy Controls:',
            '1. Go to Settings > Privacy',
            '2. Review each privacy setting',
            '',
            'Available Options:',
            '• Profile Visibility - Who can see your profile',
            '• Activity Visibility - Who can see your activity',
            '• Data Sharing - Allow analytics and improvements',
            '• Marketing Emails - Receive promotional content',
            '• Analytics - Help us improve CITRICLOUD',
            '',
            'Data Collection:',
            '• We only collect necessary data for service operation',
            '• Your data is never sold to third parties',
            '• You can request a data export anytime',
            '• You can delete your account and all data',
            '',
            'GDPR Compliance:',
            '• We comply with GDPR regulations',
            '• You have the right to access your data',
            '• You have the right to request data deletion'
          ]
        },
        {
          title: 'Account Recovery',
          desc: 'Recover access to your account',
          content: [
            'If you\'ve lost access to your account:',
            '',
            'Forgot Password:',
            '1. Go to the login page',
            '2. Click "Forgot Password"',
            '3. Enter your email address',
            '4. Check your email for recovery link',
            '5. Click the link and set a new password',
            '',
            'Locked Account:',
            'If your account is locked due to security:',
            '• Check your email for security alert',
            '• Follow the instructions to unlock',
            '• Verify your identity with security questions',
            '',
            'Lost 2FA Access:',
            '• Use backup codes if you have them',
            '• Contact support with verification proof',
            '• Complete identity verification process',
            '',
            'Contacting Support:',
            '• Visit support.citricloud.com',
            '• Submit a recovery request',
            '• Respond to verification emails'
          ]
        }
      ]
    },
    {
      id: 'billing-plans',
      category: 'Billing & Plans',
      title: 'Billing & Plans',
      description: 'Subscriptions, invoices, and plan management',
      icon: FiDollarSign,
      articles: [
        {
          title: 'Choose a Plan',
          desc: 'Compare and select the right plan for you',
          content: [
            'CITRICLOUD offers plans for every business size:',
            '',
            'Free Plan:',
            '• Perfect for individuals and small projects',
            '• 5GB storage',
            '• Basic workspace apps',
            '• Community support',
            '',
            'Pro Plan ($29/month):',
            '• Ideal for small teams',
            '• 500GB storage',
            '• All workspace apps',
            '• Email support',
            '• Advanced analytics',
            '',
            'Enterprise Plan (Custom):',
            '• For large organizations',
            '• Unlimited storage',
            '• Custom integrations',
            '• Priority support',
            '• Dedicated account manager',
            '',
            'Comparison:',
            '• Visit /pricing to compare all features',
            '• 14-day free trial available',
            '• No credit card required for trial'
          ]
        },
        {
          title: 'Upgrade Your Plan',
          desc: 'Upgrade to a higher tier',
          content: [
            'Upgrading your CITRICLOUD plan:',
            '',
            'How to Upgrade:',
            '1. Go to Settings > Billing',
            '2. Click "View Plans"',
            '3. Select the plan you want',
            '4. Click "Upgrade Now"',
            '5. Enter billing information',
            '6. Complete payment',
            '',
            'What Happens:',
            '• Upgrade takes effect immediately',
            '• Pro-rated charges applied',
            '• Extra features unlocked instantly',
            '• Old plan data is preserved',
            '',
            'Billing:',
            '• Monthly billing starts on upgrade date',
            '• You\'ll be charged on the same date monthly',
            '• Invoice sent via email',
            '',
            'Trial Period:',
            '• Free trial of 14 days available',
            '• No automatic charges after trial',
            '• Cancel anytime without penalty'
          ]
        },
        {
          title: 'Manage Subscriptions',
          desc: 'Cancel or modify your subscription',
          content: [
            'Managing your subscription:',
            '',
            'View Subscription:',
            '1. Go to Settings > Billing > Subscription',
            '2. See current plan and renewal date',
            '',
            'Cancel Subscription:',
            '1. Click "Cancel Subscription"',
            '2. Select reason for cancellation (optional)',
            '3. Confirm cancellation',
            '4. Access continues until end of billing period',
            '',
            'What Happens After Cancellation:',
            '• You keep your data for 30 days',
            '• Downgrade to Free plan automatically',
            '• Free plan features remain active',
            '',
            'Pause Subscription:',
            '• Pause for up to 3 months',
            '• Resume anytime from same billing date',
            '• No charges during pause',
            '',
            'Reactivation:',
            '• Go to Settings > Billing',
            '• Click "Reactivate Subscription"',
            '• Choose your plan again'
          ]
        },
        {
          title: 'Download Invoices',
          desc: 'Access your billing invoices',
          content: [
            'Accessing and downloading invoices:',
            '',
            'View Invoices:',
            '1. Go to Settings > Billing > Invoices',
            '2. See all invoices with dates and amounts',
            '',
            'Download Invoices:',
            '• Click the invoice you want',
            '• Click "Download PDF"',
            '• Invoice saved to your computer',
            '',
            'Invoice Contents:',
            '• Invoice number and date',
            '• Billing period',
            '• Amount charged',
            '• Payment method used',
            '• Tax information',
            '• Your billing address',
            '',
            'Email Invoices:',
            '• Invoices automatically emailed on payment date',
            '• Change email in Settings > Billing',
            '• Request duplicate invoice if needed'
          ]
        },
        {
          title: 'Payment Methods',
          desc: 'Add and manage payment methods',
          content: [
            'Managing your payment methods:',
            '',
            'Add Payment Method:',
            '1. Go to Settings > Billing > Payment Methods',
            '2. Click "Add Payment Method"',
            '3. Enter card details or connect bank account',
            '4. Complete verification',
            '',
            'Supported Payment Methods:',
            '• Credit cards (Visa, Mastercard, American Express)',
            '• Debit cards',
            '• Bank transfer',
            '• PayPal',
            '',
            'Remove Payment Method:',
            '• Click the payment method',
            '• Click "Remove"',
            '• Confirm removal',
            '',
            'Set Default Payment:',
            '• Click payment method to view options',
            '• Click "Set as Default"',
            '• Future charges use this method',
            '',
            'Security:',
            '• All payments encrypted',
            '• PCI DSS compliant',
            '• Your card details never stored on our servers'
          ]
        },
        {
          title: 'Refunds & Billing Issues',
          desc: 'Get help with billing problems',
          content: [
            'Resolving billing and refund issues:',
            '',
            'Refund Policy:',
            '• 30-day money-back guarantee on first purchase',
            '• Monthly plans can be cancelled anytime',
            '• Unused portion refunded on cancellation',
            '',
            'Requesting a Refund:',
            '1. Go to Settings > Billing > Invoices',
            '2. Find the charge in question',
            '3. Click "Request Refund"',
            '4. Provide reason for refund request',
            '5. Wait for response (typically 5-7 business days)',
            '',
            'Disputed Charges:',
            '• Contact support immediately',
            '• Provide transaction ID and details',
            '• We\'ll investigate and resolve',
            '',
            'Billing Issues:',
            '• Wrong amount charged - Contact billing support',
            '• Double charge - We\'ll refund immediately',
            '• Payment declined - Update payment method',
            '',
            'Contact Billing Support:',
            '• Email: billing@citricloud.com',
            '• Available 24/7'
          ]
        }
      ]
    },
    {
      id: 'workspace-apps',
      category: 'Workspace Apps',
      title: 'Workspace Apps',
      description: 'Using Email, Documents, Sheets, Projects, and more',
      icon: FiHelpCircle,
      articles: [
        {
          title: 'Email Client',
          desc: 'Send, receive, and manage emails',
          content: [
            'Using the CITRICLOUD Email Client:',
            '',
            'Accessing Email:',
            '1. Go to Workspace > Email',
            '2. View your inbox, drafts, sent items',
            '',
            'Composing Emails:',
            '• Click "Compose New"',
            '• Enter recipient email address',
            '• Add subject and message',
            '• Attach files if needed',
            '• Click "Send"',
            '',
            'Email Organization:',
            '• Create folders for organization',
            '• Use labels for categorization',
            '• Set up filters for automatic sorting',
            '• Archive old emails',
            '',
            'Email Features:',
            '• Rich text formatting',
            '• Scheduled send',
            '• Email templates',
            '• Email signatures',
            '• Read receipts',
            '',
            'Attachments:',
            '• Drag and drop files to attach',
            '• Max file size: 25MB',
            '• Supported formats: All common types'
          ]
        },
        {
          title: 'Documents & Words',
          desc: 'Create and edit documents',
          content: [
            'Creating and editing documents with Words:',
            '',
            'Creating a Document:',
            '1. Go to Workspace > Words',
            '2. Click "New Document"',
            '3. Add title and start typing',
            '',
            'Rich Text Editing:',
            '• Bold, italic, underline formatting',
            '• Heading levels (H1-H6)',
            '• Bullet and numbered lists',
            '• Tables and code blocks',
            '',
            'Collaboration:',
            '• Share documents with team members',
            '• Real-time collaboration',
            '• Version history',
            '• Comments and discussions',
            '',
            'Document Features:',
            '• Auto-save every few seconds',
            '• Export as PDF or Word',
            '• Print directly from editor',
            '• Search within document',
            '',
            'Templates:',
            '• Use pre-built document templates',
            '• Create custom templates',
            '• Save frequently used formats'
          ]
        },
        {
          title: 'Sheets & Spreadsheets',
          desc: 'Build spreadsheets and analyze data',
          content: [
            'Working with spreadsheets in Sheets:',
            '',
            'Creating a Spreadsheet:',
            '1. Go to Workspace > Sheets',
            '2. Click "New Spreadsheet"',
            '',
            'Basic Operations:',
            '• Click cells to enter data',
            '• Use formulas for calculations',
            '• Format cells (bold, color, etc.)',
            '• Insert rows and columns',
            '',
            'Functions:',
            '• SUM, AVERAGE, COUNT',
            '• IF, AND, OR logical functions',
            '• VLOOKUP and INDEX/MATCH',
            '• Custom formulas',
            '',
            'Charts & Graphs:',
            '• Create charts from data',
            '• Bar, line, pie charts',
            '• Embedded reports',
            '',
            'Data Management:',
            '• Sort and filter data',
            '• Pivot tables',
            '• Data validation',
            '• Import from CSV'
          ]
        },
        {
          title: 'Projects & Planner',
          desc: 'Manage projects and tasks',
          content: [
            'Managing projects with Projects & Planner:',
            '',
            'Creating a Project:',
            '1. Go to Workspace > Projects',
            '2. Click "New Project"',
            '3. Set project name and description',
            '',
            'Project Views:',
            '• List view - See all tasks',
            '• Board view - Kanban-style columns',
            '• Calendar view - Timeline',
            '• Gantt chart - Project timeline',
            '',
            'Managing Tasks:',
            '• Click "Add Task"',
            '• Set title and description',
            '• Assign to team member',
            '• Set due date and priority',
            '• Add attachments',
            '',
            'Collaboration:',
            '• Share projects with team',
            '• Comment on tasks',
            '• Track progress',
            '• Send notifications',
            '',
            'Templates:',
            '• Use project templates',
            '• Duplicate existing projects',
            '• Save custom workflows'
          ]
        },
        {
          title: 'File Storage & Drive',
          desc: 'Upload and organize files',
          content: [
            'Using CITRICLOUD Drive for file storage:',
            '',
            'Uploading Files:',
            '1. Go to Workspace > Drive',
            '2. Click "Upload" or drag and drop',
            '3. Select file(s) from your computer',
            '',
            'File Organization:',
            '• Create folders for organization',
            '• Move files between folders',
            '• Rename files',
            '• Delete or restore files',
            '',
            'Sharing Files:',
            '• Right-click file > Share',
            '• Generate shareable link',
            '• Set access permissions',
            '• Expiring links option',
            '',
            'File Preview:',
            '• Preview documents before opening',
            '• View images and videos',
            '• Read PDFs',
            '',
            'Storage Limits:',
            '• Free: 5GB',
            '• Pro: 500GB',
            '• Enterprise: Unlimited'
          ]
        },
        {
          title: 'Forms & Surveys',
          desc: 'Create and distribute forms',
          content: [
            'Creating forms and surveys:',
            '',
            'Creating a Form:',
            '1. Go to Workspace > Forms',
            '2. Click "New Form"',
            '3. Add title and description',
            '',
            'Adding Questions:',
            '• Text input',
            '• Multiple choice',
            '• Checkboxes',
            '• Dropdown menus',
            '• Rating scales',
            '• Date and time pickers',
            '',
            'Form Features:',
            '• Required field marking',
            '• Conditional logic',
            '• Custom thank you message',
            '• Email notifications',
            '',
            'Sharing Forms:',
            '• Generate shareable link',
            '• Embed in website',
            '• Share via email',
            '• QR code',
            '',
            'Viewing Responses:',
            '• View all responses',
            '• Export to CSV/Excel',
            '• See response charts'
          ]
        },
        {
          title: 'Lists & Todo',
          desc: 'Create checklists and to-do lists',
          content: [
            'Managing tasks with Lists & Todo:',
            '',
            'Creating a List:',
            '1. Go to Workspace > Lists',
            '2. Click "New List"',
            '3. Name your list',
            '',
            'Adding Items:',
            '• Type item and press Enter',
            '• Reorder by dragging',
            '• Check off completed items',
            '',
            'List Features:',
            '• Add descriptions',
            '• Set due dates',
            '• Assign to team members',
            '• Add priorities (High, Medium, Low)',
            '• Add tags for categorization',
            '',
            'List Sharing:',
            '• Share with team members',
            '• Set permissions',
            '• Collaborate in real-time',
            '',
            'Templates:',
            '• Use list templates',
            '• Create recurring lists',
            '• Daily/weekly checklists'
          ]
        },
        {
          title: 'Contacts Management',
          desc: 'Organize your contacts',
          content: [
            'Managing contacts in CITRICLOUD:',
            '',
            'Adding Contacts:',
            '1. Go to Workspace > Contacts',
            '2. Click "New Contact"',
            '3. Enter name and information',
            '',
            'Contact Information:',
            '• Name and email',
            '• Phone numbers',
            '• Company and position',
            '• Addresses',
            '• Custom fields',
            '',
            'Organizing Contacts:',
            '• Create contact groups',
            '• Add tags',
            '• Create contact lists',
            '',
            'Contact Features:',
            '• Notes and history',
            '• Linked interactions',
            '• Contact preferences',
            '',
            'Import/Export:',
            '• Import from CSV',
            '• Export contact list',
            '• Sync with email'
          ]
        }
      ]
    },
    {
      id: 'troubleshooting',
      category: 'Troubleshooting',
      title: 'Troubleshooting',
      description: 'Common issues and solutions',
      icon: FiAlertCircle,
      articles: [
        {
          title: 'Can\'t Login',
          desc: 'Troubleshoot login issues',
          content: [
            'Solutions for login problems:',
            '',
            'Check Your Credentials:',
            '• Verify you\'re using correct email',
            '• Caps Lock is off',
            '• No extra spaces in password',
            '',
            'Reset Your Password:',
            '1. Click "Forgot Password" on login page',
            '2. Enter your email',
            '3. Check your email for reset link',
            '4. Create new password',
            '5. Try logging in again',
            '',
            'Account Locked:',
            '• Too many failed login attempts',
            '• Wait 30 minutes before trying again',
            '• Or reset password',
            '',
            'Cookies & Cache:',
            '• Clear browser cookies',
            '• Clear browser cache',
            '• Try different browser',
            '',
            'Contact Support:',
            '• If still cannot login',
            '• Email: support@citricloud.com'
          ]
        },
        {
          title: 'Page Not Loading',
          desc: 'Fix loading and performance issues',
          content: [
            'Troubleshooting page loading issues:',
            '',
            'Internet Connection:',
            '• Check internet connection',
            '• Try refreshing the page',
            '• Try different network (WiFi/Mobile)',
            '',
            'Browser Issues:',
            '• Clear browser cache and cookies',
            '• Disable browser extensions',
            '• Try incognito/private mode',
            '• Try different browser',
            '',
            'Device Issues:',
            '• Restart your device',
            '• Update browser to latest version',
            '• Check available storage space',
            '',
            'CITRICLOUD Status:',
            '• Check status.citricloud.com',
            '• Look for system maintenance',
            '',
            'Still Not Working?',
            '• Contact support with screenshot',
            '• Include browser and OS info'
          ]
        },
        {
          title: 'Sync Problems',
          desc: 'Resolve data synchronization issues',
          content: [
            'Fixing data synchronization problems:',
            '',
            'Manual Refresh:',
            '• Press F5 or Ctrl+R to refresh',
            '• Try refreshing multiple times',
            '',
            'Browser Cache:',
            '• Clear browser cache',
            '• Clear cookies for citricloud.com',
            '• Restart browser',
            '',
            'Device Sync:',
            '• Sign out from all devices',
            '• Sign in again on primary device',
            '• Wait 5 minutes',
            '• Sign in on other devices',
            '',
            'Check Connection:',
            '• Verify internet connection',
            '• Check bandwidth usage',
            '• Try on different network',
            '',
            'Force Sync:',
            '• Go to Settings > Data',
            '• Click "Force Sync"',
            '• Wait for completion'
          ]
        },
        {
          title: 'Email Not Working',
          desc: 'Fix email sending and receiving',
          content: [
            'Troubleshooting email issues:',
            '',
            'Emails Not Sending:',
            '• Check internet connection',
            '• Verify email address is correct',
            '• Check file attachment sizes',
            '• Try again in a few minutes',
            '',
            'Emails Not Receiving:',
            '• Check spam folder',
            '• Verify email forwarding settings',
            '• Check inbox filters',
            '• Whitelist sender addresses',
            '',
            'Email Delays:',
            '• Can take up to 5 minutes',
            '• Check spam filters',
            '• Check network connection',
            '',
            'Email Configuration:',
            '• Go to Workspace > Email Settings',
            '• Verify IMAP/SMTP settings',
            '• Re-authenticate email account',
            '',
            'Contact Email Support:',
            '• Email: email-support@citricloud.com'
          ]
        },
        {
          title: 'File Upload Issues',
          desc: 'Resolve file upload errors',
          content: [
            'Fixing file upload problems:',
            '',
            'Upload Fails:',
            '• Check file size (max 25MB)',
            '• Check file type (check allowed types)',
            '• Try different file',
            '• Try different browser',
            '',
            'Upload Too Slow:',
            '• Check internet speed',
            '• Reduce file size',
            '• Try different network',
            '',
            'Storage Full:',
            '• Check available storage',
            '• Delete unnecessary files',
            '• Upgrade your plan',
            '',
            'File Not Appearing:',
            '• Wait a few moments',
            '• Refresh the page',
            '• Check upload folder',
            '',
            'Still Having Issues?',
            '• Try uploading via drag and drop',
            '• Contact support with file details'
          ]
        },
        {
          title: 'Browser Compatibility',
          desc: 'Ensure browser compatibility',
          content: [
            'Browser compatibility and requirements:',
            '',
            'Supported Browsers:',
            '• Chrome 90+',
            '• Firefox 88+',
            '• Safari 14+',
            '• Edge 90+',
            '',
            'Requirements:',
            '• JavaScript enabled',
            '• Cookies enabled',
            '• Modern browser version',
            '',
            'Unsupported Features:',
            '• Internet Explorer (not supported)',
            '• Very old browser versions',
            '',
            'Improving Performance:',
            '• Update your browser',
            '• Disable unnecessary extensions',
            '• Clear cache regularly',
            '',
            'Mobile Browsers:',
            '• Chrome Mobile',
            '• Safari iOS',
            '• Firefox Mobile',
            '• Samsung Internet'
          ]
        },
        {
          title: 'Connection Issues',
          desc: 'Fix network and connection problems',
          content: [
            'Troubleshooting connection problems:',
            '',
            'Internet Connection:',
            '• Check WiFi connection',
            '• Try mobile hotspot',
            '• Check network speed (speedtest.net)',
            '',
            'Firewall/VPN:',
            '• Try disabling VPN',
            '• Check firewall settings',
            '• Whitelist citricloud.com',
            '',
            'DNS Issues:',
            '• Try changing DNS to 8.8.8.8',
            '• Flush DNS cache',
            '• Try different network',
            '',
            'Router/Modem:',
            '• Restart router',
            '• Restart modem',
            '• Check router settings',
            '',
            'Persistent Issues:',
            '• Contact your ISP',
            '• Contact support@citricloud.com'
          ]
        }
      ]
    },
    {
      id: 'contact-support',
      category: 'Contact Support',
      title: 'Contact Support',
      description: 'Reach our support team for help',
      icon: FiPhone,
      articles: [
        {
          title: 'Email Support',
          desc: 'support@citricloud.com - Response within 2 hours',
          content: [
            'Contacting support via email:',
            '',
            'Email Address:',
            '• support@citricloud.com',
            '• Response time: Within 2 hours',
            '',
            'What to Include:',
            '• Describe your issue clearly',
            '• Include steps to reproduce',
            '• Attach screenshots if relevant',
            '• Include your account email',
            '• Your browser and OS info',
            '',
            'Response Priority:',
            '• Account compromised - Highest',
            '• Billing issues - High',
            '• Feature issues - Medium',
            '• General questions - Normal',
            '',
            'Available 24/7',
            '• Support team available all hours',
            '• Holidays included'
          ]
        },
        {
          title: 'Live Chat',
          desc: 'Chat with support during business hours',
          content: [
            'Using live chat support:',
            '',
            'Accessing Live Chat:',
            '1. Click chat icon in bottom right',
            '2. Enter your name and email',
            '3. Start typing your message',
            '',
            'Business Hours:',
            '• Monday-Friday: 9am-6pm EST',
            '• Saturday: 10am-4pm EST',
            '• Sunday: Closed',
            '',
            'Chat Features:',
            '• Real-time support',
            '• Share screenshots',
            '• Quick responses',
            '',
            'Outside Business Hours:',
            '• Leave a message',
            '• We\'ll respond via email',
            '• Typically within 2 hours'
          ]
        },
        {
          title: 'Submit a Ticket',
          desc: 'Create a support ticket from your account',
          content: [
            'Creating a support ticket:',
            '',
            'How to Submit:',
            '1. Go to Settings > Support',
            '2. Click "Create New Ticket"',
            '3. Choose ticket category',
            '4. Provide detailed description',
            '5. Attach relevant files',
            '6. Click "Submit"',
            '',
            'Ticket Tracking:',
            '• Receive ticket number',
            '• Track status in Settings',
            '• Receive email updates',
            '',
            'Categories:',
            '• Technical Issue',
            '• Billing Problem',
            '• Feature Request',
            '• Account Issue',
            '• Security Report',
            '',
            'Response Time:',
            '• Critical: 1 hour',
            '• High: 4 hours',
            '• Medium: 24 hours',
            '• Low: 48 hours'
          ]
        },
        {
          title: 'Status Page',
          desc: 'Check system status and incidents',
          content: [
            'Using the status page:',
            '',
            'Accessing Status Page:',
            '• Visit status.citricloud.com',
            '• See real-time system status',
            '',
            'Status Indicators:',
            '• Operational - All systems working',
            '• Degraded - Reduced performance',
            '• Partial Outage - Some services down',
            '• Major Outage - Service down',
            '',
            'Components Monitored:',
            '• API Server',
            '• Database',
            '• Email Service',
            '• Workspace Apps',
            '• CDN',
            '',
            'Incident History:',
            '• View past incidents',
            '• See resolution time',
            '• Subscribe to updates'
          ]
        },
        {
          title: 'Community Forum',
          desc: 'Connect with other CITRICLOUD users',
          content: [
            'Joining the community forum:',
            '',
            'Forum Features:',
            '• Ask questions',
            '• Share tips and tricks',
            '• Vote on feature requests',
            '• Help other users',
            '',
            'Getting Started:',
            '1. Visit community.citricloud.com',
            '2. Create account',
            '3. Browse categories',
            '4. Post your question',
            '',
            'Forum Categories:',
            '• General Discussion',
            '• Feature Requests',
            '• Tips and Tricks',
            '• Bug Reports',
            '• Workspace Apps',
            '',
            'Best Practices:',
            '• Search before posting',
            '• Be respectful',
            '• Provide detailed information',
            '• Mark answers as solution'
          ]
        },
        {
          title: 'Schedule a Call',
          desc: 'Book a support call with our team',
          content: [
            'Scheduling a support call:',
            '',
            'How to Schedule:',
            '1. Go to Settings > Support',
            '2. Click "Schedule Call"',
            '3. Select date and time',
            '4. Describe your issue',
            '5. Confirm booking',
            '',
            'Available Times:',
            '• Monday-Friday: 9am-5pm EST',
            '• 30-minute slots',
            '• Video call via Zoom',
            '',
            'Before Your Call:',
            '• Prepare screenshots',
            '• Have browser open',
            '• Test your audio/video',
            '',
            'Call Topics:',
            '• General training',
            '• Feature demonstrations',
            '• Troubleshooting',
            '• Account setup'
          ]
        }
      ]
    }
  ];

  // Add metadata to articles for featured/popular tracking
  const getArticleMetadata = (topicId: string, articleIndex: number) => {
    const featured = topicId === 'getting-started' && (articleIndex === 0 || articleIndex === 1);
    const views = Math.floor(Math.random() * 5000) + 500;
    const helpful = Math.floor(Math.random() * 100) + 20;
    return { featured, views, helpful };
  };

  // Get all articles flat for searching and sorting
  const allArticles = useMemo(() => {
    return topics.flatMap((topic) =>
      topic.articles.map((article, idx) => ({
        ...article,
        ...getArticleMetadata(topic.id, idx),
        topicId: topic.id,
        topicTitle: topic.title,
        topicIcon: topic.icon,
        articleIndex: idx
      }))
    );
  }, []);

  // Get featured articles
  const featuredArticles = useMemo(
    () => allArticles.filter(a => a.featured).slice(0, 3),
    [allArticles]
  );

  // Get popular articles
  const popularArticles = useMemo(
    () => allArticles.sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 5),
    [allArticles]
  );

  const filteredTopics = topics.filter(topic => {
    if (selectedCategory !== 'all' && topic.category !== selectedCategory) return false;
    const query = searchQuery.toLowerCase();
    return (
      topic.title.toLowerCase().includes(query) ||
      topic.description.toLowerCase().includes(query) ||
      topic.articles.some(a => a.title.toLowerCase().includes(query) || a.desc.toLowerCase().includes(query))
    );
  });

  const categories = ['all', ...Array.from(new Set(topics.map(t => t.category)))];

  const toggleTopic = (topicId: string) => {
    const newExpanded = new Set(expandedTopics);
    if (newExpanded.has(topicId)) {
      newExpanded.delete(topicId);
    } else {
      newExpanded.add(topicId);
    }
    setExpandedTopics(newExpanded);
    setSelectedArticle(null);
  };

  const selectedTopic = filteredTopics.find(t => selectedArticle?.topicId === t.id);
  const selectedArticleData = selectedTopic && selectedArticle ? selectedTopic.articles[selectedArticle.articleIndex] : null;

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100 dark:from-gray-950 dark:via-slate-950 dark:to-black">
      <Navbar />
      <main className="flex-1">
        <section className="container mx-auto px-4 sm:px-6 pt-28 sm:pt-36 pb-16 max-w-7xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 sm:mb-12"
          >
            <h1 className="text-3xl sm:text-5xl font-bold text-gray-800 dark:text-gray-100 mb-3 sm:mb-4">
              Help Center
            </h1>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-3xl">
              Find answers to frequently asked questions and get help from our comprehensive guides and support resources
            </p>
          </motion.div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="mb-8"
          >
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 dark:text-gray-400" />
              <input
                type="text"
                placeholder="Search help articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 sm:py-4 rounded-xl glass-card bg-white/80 dark:bg-gray-900/70 border border-white/30 dark:border-gray-700/30 dark:text-gray-100 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </motion.div>

          {/* Featured Articles */}
          {!searchQuery && selectedCategory === 'all' && !selectedArticle && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 }}
              className="mb-8"
            >
              <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
                <FiStar className="w-5 h-5 text-yellow-500" />
                Featured Articles
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {featuredArticles.map((article, i) => (
                  <motion.button
                    key={i}
                    onClick={() => setSelectedArticle({ topicId: article.topicId, articleIndex: article.articleIndex })}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + i * 0.05 }}
                    className="glass-card p-4 rounded-lg border border-white/30 dark:border-gray-700/30 hover:shadow-lg hover:border-blue-500/30 transition-all text-left"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                        <FiStar className="w-4 h-4 text-yellow-500" />
                      </div>
                      <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">Featured</span>
                    </div>
                    <h3 className="font-semibold text-gray-800 dark:text-gray-100 line-clamp-2 mb-1">{article.title}</h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">{article.desc}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500 dark:text-gray-500">{article.topicTitle}</span>
                      <FiArrowRight className="w-4 h-4 text-blue-500" />
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Category Filter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8 flex flex-wrap gap-2"
          >
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-lg font-medium transition-all text-sm ${
                  selectedCategory === cat
                    ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                    : 'glass-card hover:shadow-lg'
                }`}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </motion.div>

          {/* Layout: Topics on left, Article on right */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Topics List */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="lg:col-span-1 space-y-3"
            >
              {filteredTopics.map((topic, idx) => {
                const Icon = topic.icon;
                const isExpanded = expandedTopics.has(topic.id);
                
                return (
                  <motion.div
                    key={topic.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + idx * 0.05 }}
                    className="glass-card rounded-lg border border-white/30 dark:border-gray-700/30 overflow-hidden"
                  >
                    {/* Topic Header */}
                    <button
                      onClick={() => toggleTopic(topic.id)}
                      className="w-full p-4 flex items-center justify-between hover:bg-white/50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <div className="flex items-center gap-3 text-left flex-1">
                        <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                          <Icon className="w-4 h-4 text-blue-500" />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-800 dark:text-gray-100 text-sm">
                            {topic.title}
                          </h3>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {topic.articles.length} articles
                          </p>
                        </div>
                      </div>
                      <FiChevronDown
                        className={`w-4 h-4 text-gray-600 dark:text-gray-400 transition-transform flex-shrink-0 ${
                          isExpanded ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    {/* Articles List */}
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="border-t border-white/30 dark:border-gray-700/30 bg-white/20 dark:bg-gray-900/20"
                      >
                        <div className="space-y-1 p-2">
                          {topic.articles.map((article, artIdx) => (
                            <button
                              key={artIdx}
                              onClick={() => setSelectedArticle({ topicId: topic.id, articleIndex: artIdx })}
                              className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                                selectedArticle?.topicId === topic.id && selectedArticle?.articleIndex === artIdx
                                  ? 'bg-blue-500 text-white'
                                  : 'text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-800/50'
                              }`}
                            >
                              <div className="flex items-start gap-2">
                                <FiChevronRight className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                <span className="line-clamp-2">{article.title}</span>
                              </div>
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
            </motion.div>

            {/* Article Display */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="lg:col-span-2"
            >
              {selectedArticleData ? (
                <div className="glass-card p-6 sm:p-8 rounded-2xl border border-white/30 dark:border-gray-700/30 sticky top-24">
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                    {selectedArticleData.title}
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                    {selectedArticleData.desc}
                  </p>
                  
                  <div className="prose prose-gray dark:prose-invert max-w-none">
                    {selectedArticleData.content.map((line, idx) => {
                      if (line === '') return <div key={idx} className="h-3" />;
                      if (line.startsWith('•')) {
                        return (
                          <li key={idx} className="text-gray-700 dark:text-gray-300 ml-4 mb-1">
                            {line.substring(2)}
                          </li>
                        );
                      }
                      if (/^\d+\./.test(line)) {
                        return (
                          <li key={idx} className="text-gray-700 dark:text-gray-300 ml-4 mb-1">
                            {line}
                          </li>
                        );
                      }
                      return (
                        <p key={idx} className="text-gray-700 dark:text-gray-300 mb-3">
                          {line}
                        </p>
                      );
                    })}
                  </div>

                  {/* Article Footer CTA */}
                  <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      Did this article help you?
                    </p>
                    {feedbackGiven ? (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-2 text-sm font-medium"
                      >
                        <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center text-white">
                          ✓
                        </div>
                        <span className="text-green-600 dark:text-green-400">
                          {feedbackMessage}
                        </span>
                      </motion.div>
                    ) : (
                      <div className="flex gap-3 flex-wrap">
                        <button
                          onClick={() => {
                            setFeedbackGiven('yes');
                            setFeedbackMessage('Thank you! We\'re glad this article helped.');
                            setTimeout(() => setFeedbackGiven(null), 3000);
                          }}
                          className="px-4 py-2 bg-green-500/10 text-green-600 dark:text-green-400 rounded-lg font-medium hover:bg-green-500/20 hover:scale-105 transition-all text-sm active:scale-95"
                        >
                          Yes, helpful
                        </button>
                        <button
                          onClick={() => {
                            setFeedbackGiven('no');
                            setFeedbackMessage('Thanks for the feedback. We\'ll improve this article.');
                            setTimeout(() => setFeedbackGiven(null), 3000);
                          }}
                          className="px-4 py-2 bg-red-500/10 text-red-600 dark:text-red-400 rounded-lg font-medium hover:bg-red-500/20 hover:scale-105 transition-all text-sm active:scale-95"
                        >
                          No, not helpful
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Related Articles */}
                  {selectedTopic && (
                    <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Related Articles</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {selectedTopic.articles.slice(0, 4).map((article, idx) => (
                          <button
                            key={idx}
                            onClick={() => setSelectedArticle({ topicId: selectedTopic.id, articleIndex: idx })}
                            className={`p-3 rounded-lg border transition-all text-left text-sm ${
                              selectedArticle?.articleIndex === idx
                                ? 'border-blue-500 bg-blue-500/10'
                                : 'border-gray-200 dark:border-gray-700 hover:border-blue-500/50'
                            }`}
                          >
                            <p className="font-medium text-gray-800 dark:text-gray-100 line-clamp-1">{article.title}</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-1">{article.desc}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="glass-card p-8 sm:p-12 rounded-2xl border border-white/30 dark:border-gray-700/30 text-center">
                  <FiHelpCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Select an article to read
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">
                    Browse the topics on the left or search for what you need
                  </p>
                </div>
              )}
            </motion.div>
          </div>

          {/* Video Tutorials Section */}
          {!selectedArticleData && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 }}
              className="mt-12 glass-card p-8 sm:p-10 rounded-2xl bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border border-red-200 dark:border-red-700/50"
            >
              <div className="max-w-4xl">
                <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                  <FiPlayCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
                  Video Tutorials
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {[
                    { title: 'Getting Started with CITRICLOUD', duration: '5:30' },
                    { title: 'Setting Up Your Workspace', duration: '8:15' },
                    { title: 'Email Management Guide', duration: '6:45' },
                    { title: 'Collaboration Features', duration: '7:20' }
                  ].map((video, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.14 + i * 0.05 }}
                      className="group relative overflow-hidden rounded-lg bg-black/20 dark:bg-black/40 border border-red-200/50 dark:border-red-700/30 cursor-pointer hover:border-red-500/50 transition-all"
                    >
                      <div className="aspect-video flex items-center justify-center bg-gradient-to-br from-red-900/20 to-pink-900/20">
                        <FiPlayCircle className="w-12 h-12 text-red-600 dark:text-red-400 group-hover:scale-110 transition-transform" />
                      </div>
                      <div className="p-4">
                        <h4 className="font-semibold text-gray-800 dark:text-gray-100 mb-2 line-clamp-2 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                          {video.title}
                        </h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Duration: {video.duration}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                  📺 More video tutorials coming soon! Subscribe to our <a href="#" className="text-red-600 dark:text-red-400 font-semibold hover:underline">YouTube channel</a> to stay updated.
                </p>
              </div>
            </motion.div>
          )}

          {/* Popular Articles Section */}
          {!selectedArticleData && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="mt-12 glass-card p-8 sm:p-10 rounded-2xl bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 border border-indigo-200 dark:border-indigo-700/50"
            >
              <div className="max-w-4xl">
                <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                  <FiTrendingUp className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                  Popular Articles
                </h3>

                <div className="space-y-3">
                  {popularArticles.map((article, i) => (
                    <motion.button
                      key={i}
                      onClick={() => setSelectedArticle({ topicId: article.topicId, articleIndex: article.articleIndex })}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.17 + i * 0.05 }}
                      className="w-full p-4 rounded-lg bg-white/50 dark:bg-gray-800/30 hover:bg-white/80 dark:hover:bg-gray-800/50 border border-indigo-200/50 dark:border-indigo-700/30 transition-all text-left group"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">#{i + 1}</span>
                            <h4 className="font-semibold text-gray-800 dark:text-gray-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 line-clamp-1 transition-colors">
                              {article.title}
                            </h4>
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-1">{article.desc}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-500">
                            <span>📚 {article.topicTitle}</span>
                            <span>👁️ {article.views} views</span>
                            <span>👍 {article.helpful}%</span>
                          </div>
                        </div>
                        <FiArrowRight className="w-5 h-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Community Forum Section */}
          {!selectedArticleData && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-12 glass-card p-8 sm:p-10 rounded-2xl bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border border-purple-200 dark:border-purple-700/50"
            >
              <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
                    <FiPhone className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Community Forum</h3>
                    <p className="text-purple-600 dark:text-purple-300 text-sm">Connect with other CITRICLOUD users</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8 mb-8">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Forum Features</h4>
                    <ul className="space-y-3">
                      {[
                        'Ask questions and get answers',
                        'Share tips and tricks',
                        'Vote on feature requests',
                        'Help other community members',
                        'Connect with like-minded users',
                        'Access expert advice'
                      ].map((feature, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-gray-700 dark:text-gray-300">
                          <span className="w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center text-white flex-shrink-0 text-xs mt-0.5">✓</span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Forum Categories</h4>
                    <div className="space-y-2">
                      {[
                        'General Discussion',
                        'Feature Requests',
                        'Tips and Tricks',
                        'Bug Reports',
                        'Workspace Apps',
                        'Best Practices'
                      ].map((category, i) => (
                        <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/50 dark:bg-gray-800/30 text-sm text-gray-700 dark:text-gray-300">
                          <FiChevronRight className="w-4 h-4 text-purple-500" />
                          {category}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mb-8 p-6 rounded-lg bg-white/50 dark:bg-gray-800/30 border border-primary-200 dark:border-primary-700/30">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Getting Started</h4>
                  <ol className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                    <li className="flex gap-3">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary-600 text-white flex-shrink-0 font-semibold text-xs">1</span>
                      <span>Visit <a href="/contact/community" className="text-primary-600 dark:text-primary-400 font-semibold hover:underline">Community Forum</a></span>
                    </li>
                    <li className="flex gap-3">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary-600 text-white flex-shrink-0 font-semibold text-xs">2</span>
                      <span>Create an account using your email</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary-600 text-white flex-shrink-0 font-semibold text-xs">3</span>
                      <span>Browse categories and explore discussions</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary-600 text-white flex-shrink-0 font-semibold text-xs">4</span>
                      <span>Post your question or share your experience</span>
                    </li>
                  </ol>
                </div>

                <div className="mb-8 p-6 rounded-lg bg-white/50 dark:bg-gray-800/30 border border-blue-200 dark:border-blue-700/30">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Community Guidelines</h4>
                  <ul className="grid md:grid-cols-2 gap-4 text-sm text-gray-700 dark:text-gray-300">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 font-bold mt-0.5">→</span>
                      <span><strong>Search first</strong> - Help avoid duplicate questions</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 font-bold mt-0.5">→</span>
                      <span><strong>Be respectful</strong> - Treat all members with courtesy</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 font-bold mt-0.5">→</span>
                      <span><strong>Provide details</strong> - Share error messages and screenshots</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 font-bold mt-0.5">→</span>
                      <span><strong>Mark solutions</strong> - Help others find answers quickly</span>
                    </li>
                  </ul>
                </div>

                <div className="flex flex-wrap gap-4 justify-center">
                  <a
                    href="/contact/community"
                    className="px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-all hover:scale-105 active:scale-95 text-sm"
                  >
                    Visit Community Forum
                  </a>
                  <a
                    href="/contact/community"
                    className="px-6 py-3 bg-white dark:bg-gray-800 text-primary-600 dark:text-primary-400 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border border-primary-200 dark:border-primary-700 text-sm"
                  >
                    Join Community
                  </a>
                </div>
              </div>
            </motion.div>
          )}

          {/* CTA Section */}
          {!selectedArticleData && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-16 glass-card p-8 sm:p-10 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 text-white text-center border border-blue-500/20"
            >
              <h3 className="text-2xl sm:text-3xl font-bold mb-3">Still need help?</h3>
              <p className="text-white/90 mb-6 text-sm sm:text-base max-w-2xl mx-auto">
                Can't find what you're looking for? Our support team is ready to help you 24/7.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <a href="/contact" className="px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-50 transition-colors text-sm sm:text-base">
                  Contact Support
                </a>
                <a href="mailto:support@citricloud.com" className="px-6 py-3 bg-white/20 text-white rounded-lg font-semibold hover:bg-white/30 transition-colors text-sm sm:text-base">
                  Email Us
                </a>
              </div>
            </motion.div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}
