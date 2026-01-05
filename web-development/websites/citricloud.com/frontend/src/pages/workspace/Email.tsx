import React, { useState, useEffect } from 'react';
import { List as ListIcon, ListOrdered, Link as LinkIcon, Heading as HeadingIcon, Eraser, Bold, Italic, Underline, Paperclip } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { FiMail, FiStar, FiSend, FiEdit, FiTrash2, FiInbox, FiArchive, FiAlertCircle, FiPaperclip, FiCornerUpLeft, FiCornerUpRight, FiSearch, FiRefreshCw, FiChevronDown, FiMoreHorizontal, FiArrowLeft, FiTrendingUp, FiSettings, FiX, FiMenu, FiFolder, FiTag, FiClock, FiPlus, FiChevronRight, FiAlertTriangle, FiCheckCircle } from 'react-icons/fi';
import { emailAPI, emailAliasAPI } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

type Email = {
  id: number;
  from_address: string;
  to_addresses: string[];
  subject: string;
  body_text?: string;
  body_html?: string;
  snippet: string;
  created_at: string;
  is_read: boolean;
  is_starred: boolean;
  folder: string;
  attachments?: { name: string; size: string }[];
  labels?: string[];
  status?: string;
};

type Folder = {
  name: string;
  icon: string;
  count: number;
};

type CustomFolder = {
  id: string;
  name: string;
  icon: string;
  count: number;
};

type Label = {
  id: string;
  name: string;
  color: string;
};

export default function EmailApp() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [currentFolder, setCurrentFolder] = useState('inbox');
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [showCompose, setShowCompose] = useState(false);
  const [showReply, setShowReply] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSidebar, setShowSidebar] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showEmailList, setShowEmailList] = useState(true);
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [folderCounts, setFolderCounts] = useState<any>({});
  const [showFavoritesCollapse, setShowFavoritesCollapse] = useState(true);
  const [showFoldersCollapse, setShowFoldersCollapse] = useState(true);
  const [showLabelsCollapse, setShowLabelsCollapse] = useState(true);
  const [customFolders, setCustomFolders] = useState<CustomFolder[]>([]);
  const [customLabels, setCustomLabels] = useState<Label[]>([]);
  const [showNewFolderDialog, setShowNewFolderDialog] = useState(false);
  const [showNewLabelDialog, setShowNewLabelDialog] = useState(false);
  const [showQuickSteps, setShowQuickSteps] = useState(false);
  const [showEmailListMenu, setShowEmailListMenu] = useState(false);
  const [showBcc, setShowBcc] = useState(false);
  const [composeFromEmail, setComposeFromEmail] = useState<string>(''); // Email alias to send from
  const [showFromDropdown, setShowFromDropdown] = useState(false);
  const [storageUsed, setStorageUsed] = useState(0);
  const [storageTotal] = useState(15000); // 15GB in MB
  // Rich text editor ref (contentEditable div instead of textarea)
  const composeBodyRef = React.useRef<HTMLDivElement>(null);
  const [fontSize, setFontSize] = useState('14');
  const [textColor, setTextColor] = useState('#000000');
  const [composeBodyHtml, setComposeBodyHtml] = useState('');
  const [showHeadings, setShowHeadings] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const attachmentInputRef = React.useRef<HTMLInputElement>(null);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const [pendingLinkRange, setPendingLinkRange] = useState<Range | null>(null);
  const [emailAliases, setEmailAliases] = useState<any[]>([]);
  const [loadingAliases, setLoadingAliases] = useState(false);
  const [selectedFromEmail, setSelectedFromEmail] = useState<string>('');
  const [showEmailDropdown, setShowEmailDropdown] = useState(false);

  // Load emails and folder counts from API
  useEffect(() => {
    loadEmails();
    loadFolderCounts();
    loadEmailAliases();
  }, [currentFolder, searchQuery]);

  // Reload emails when selected alias changes
  useEffect(() => {
    if (selectedFromEmail) {
      loadEmails();
    }
  }, [selectedFromEmail]);

  // Track dark mode
  useEffect(() => {
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };
    
    checkDarkMode();
    
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    
    return () => observer.disconnect();
  }, []);

  // Sync compose text color with theme for visibility
  useEffect(() => {
    setTextColor(isDarkMode ? '#ffffff' : '#000000');
  }, [isDarkMode]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (showEmailListMenu && !target.closest('.email-list-menu')) {
        setShowEmailListMenu(false);
      }
      if (showQuickSteps && !target.closest('.quick-steps-menu')) {
        setShowQuickSteps(false);
      }
      if (showEmailDropdown && !target.closest('.email-dropdown')) {
        setShowEmailDropdown(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showEmailListMenu, showQuickSteps, showEmailDropdown]);

  const loadEmails = async () => {
    try {
      setLoading(true);
      const params: any = {
        limit: 50
      };

      if (currentFolder === 'starred') {
        params.is_starred = true;
      } else if (currentFolder !== 'all') {
        params.folder = currentFolder.toUpperCase();
      }

      if (searchQuery) {
        params.search = searchQuery;
      }

      // Filter by selected email address (alias or primary)
      if (selectedFromEmail) {
        params.to_address = selectedFromEmail;
      }

      const response = await emailAPI.getEmails(params);
      const data = Array.isArray(response.data) ? response.data : response.data?.emails || [];
      console.log('=== EMAIL API RESPONSE ===');
      console.log('LoadEmails - Folder:', currentFolder, 'Params:', params, 'Count:', data.length);
      console.log('Selected alias:', selectedFromEmail);
      setEmails(data);
      
      // Calculate storage usage (approximate based on email count and size)
      const approxSize = data.length * 0.1; // ~100KB per email
      setStorageUsed(approxSize);
    } catch (error) {
      console.error('Failed to load emails:', error);
      setEmails([]);
    } finally {
      setLoading(false);
    }
  };

  const loadFolderCounts = async () => {
    try {
      const response = await emailAPI.getFolderCounts();
      setFolderCounts(response.data);
    } catch (error) {
      console.error('Failed to load folder counts:', error);
    }
  };

  const loadEmailAliases = async () => {
    try {
      setLoadingAliases(true);
      const response = await emailAliasAPI.listAliases();
      const aliases = response.data.aliases || [];
      console.log('Loaded aliases:', aliases);
      setEmailAliases(aliases);
      
      // Don't set default alias - show all emails by default
      // Users can manually select an alias to filter
    } catch (error) {
      console.error('Failed to load email aliases:', error);
      setEmailAliases([]);
    } finally {
      setLoadingAliases(false);
    }
  };

  const folders: Folder[] = [
    { name: 'inbox', icon: 'inbox', count: folderCounts.unread || 0 },
    { name: 'starred', icon: 'star', count: folderCounts.starred || 0 },
    { name: 'sent', icon: 'send', count: folderCounts.sent || 0 },
    { name: 'drafts', icon: 'edit', count: folderCounts.drafts || 0 },
    { name: 'archive', icon: 'archive', count: folderCounts.archive || 0 },
    { name: 'spam', icon: 'alert', count: folderCounts.spam || 0 },
    { name: 'trash', icon: 'trash', count: folderCounts.trash || 0 },
  ];

  const filteredEmails = emails;

  const toggleStar = async (emailId: number) => {
    const email = emails.find(e => e.id === emailId);
    if (!email) return;
    
    try {
      await emailAPI.updateEmail(emailId, { is_starred: !email.is_starred });
      setEmails(prev => prev.map(e => e.id === emailId ? { ...e, is_starred: !e.is_starred } : e));
    } catch (error) {
      console.error('Failed to toggle star:', error);
    }
  };

  const markAsRead = async (emailId: number, read: boolean = true) => {
    try {
      await emailAPI.updateEmail(emailId, { is_read: read });
      setEmails(prev => prev.map(e => e.id === emailId ? { ...e, is_read: read } : e));
      if (selectedEmail?.id === emailId) {
        setSelectedEmail({ ...selectedEmail, is_read: read });
      }
      loadFolderCounts();
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const archiveEmail = async (emailId: number) => {
    try {
      await emailAPI.updateEmail(emailId, { folder: 'archive' });
      setEmails(prev => prev.filter(e => e.id !== emailId));
      if (selectedEmail?.id === emailId) {
        setSelectedEmail(null);
      }
      loadFolderCounts();
    } catch (error) {
      console.error('Failed to archive email:', error);
    }
  };

  const deleteEmail = async (emailId: number) => {
    try {
      await emailAPI.updateEmail(emailId, { folder: 'trash' });
      setEmails(prev => prev.filter(e => e.id !== emailId));
      if (selectedEmail?.id === emailId) {
        setSelectedEmail(null);
      }
      loadFolderCounts();
    } catch (error) {
      console.error('Failed to delete email:', error);
    }
  };

  const performQuickStep = async (action: string, emailId?: number) => {
    const targetId = emailId || selectedEmail?.id;
    if (!targetId) return;

    switch (action) {
      case 'move-archive':
        await archiveEmail(targetId);
        break;
      case 'mark-read-archive':
        await markAsRead(targetId, true);
        await archiveEmail(targetId);
        break;
      case 'delete':
        await deleteEmail(targetId);
        break;
      case 'mark-unread':
        await markAsRead(targetId, false);
        break;
    }
    setShowQuickSteps(false);
  };

  const applyFormatting = (tag: string) => {
    const editor = composeBodyRef.current;
    if (!editor) return;
    editor.focus();
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    const range = selection.getRangeAt(0);
    // Ensure selection is within our editor
    if (!editor.contains(range.commonAncestorContainer)) return;
    let wrapperTag = '';
    switch (tag) {
      case 'bold': wrapperTag = 'strong'; break;
      case 'italic': wrapperTag = 'em'; break;
      case 'underline': wrapperTag = 'u'; break;
      default: return;
    }
    // If selection collapsed, insert empty formatted element for user to type
    if (selection.isCollapsed) {
      const el = document.createElement(wrapperTag);
      // zero-width space so caret can be inside
      const zwsp = document.createTextNode('\u200B');
      el.appendChild(zwsp);
      range.insertNode(el);
      // place caret inside element after zwsp
      const newRange = document.createRange();
      newRange.setStart(el.firstChild as Text, 1);
      newRange.setEnd(el.firstChild as Text, 1);
      selection.removeAllRanges();
      selection.addRange(newRange);
      setComposeBodyHtml(editor.innerHTML);
      return;
    }
    const selectedText = range.toString();
    const el = document.createElement(wrapperTag);
    el.textContent = selectedText;
    range.deleteContents();
    range.insertNode(el);
    // Move caret after inserted node
    range.setStartAfter(el);
    range.setEndAfter(el);
    selection.removeAllRanges();
    selection.addRange(range);
    setComposeBodyHtml(editor.innerHTML);
  };

  const applyList = (type: 'ul' | 'ol') => {
    const editor = composeBodyRef.current;
    if (!editor) return;
    editor.focus();
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    const range = selection.getRangeAt(0);
    if (!editor.contains(range.commonAncestorContainer)) return;
    
    const listEl = document.createElement(type);
    
    if (selection.isCollapsed) {
      // No selection - insert empty list with one item
      const li = document.createElement('li');
      li.textContent = '\u200B'; // zero-width space for cursor placement
      listEl.appendChild(li);
      range.insertNode(listEl);
      // Place cursor inside the li
      const newRange = document.createRange();
      newRange.setStart(li.firstChild as Text, 1);
      newRange.setEnd(li.firstChild as Text, 1);
      selection.removeAllRanges();
      selection.addRange(newRange);
    } else {
      // Has selection - convert lines to list items
      const selectedText = range.toString();
      const lines = selectedText.split(/\n+/).map(l => l.trim()).filter(Boolean);
      if (lines.length === 0) {
        // Selection has no text, insert empty list
        const li = document.createElement('li');
        li.textContent = '\u200B';
        listEl.appendChild(li);
      } else {
        lines.forEach(line => {
          const li = document.createElement('li');
          li.textContent = line;
          listEl.appendChild(li);
        });
      }
      range.deleteContents();
      range.insertNode(listEl);
      range.setStartAfter(listEl);
      range.setEndAfter(listEl);
      selection.removeAllRanges();
      selection.addRange(range);
    }
    setComposeBodyHtml(editor.innerHTML);
  };

  const applyLink = () => {
    const editor = composeBodyRef.current;
    if (!editor) return;
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    const range = selection.getRangeAt(0).cloneRange();
    if (!editor.contains(range.commonAncestorContainer)) return;
    
    // Store range and open dialog
    setPendingLinkRange(range);
    if (selection.isCollapsed) {
      setLinkText('');
      setLinkUrl('');
    } else {
      setLinkText(range.toString());
      setLinkUrl('');
    }
    setShowLinkDialog(true);
  };

  const insertLink = () => {
    if (!pendingLinkRange || !linkUrl) return;
    const editor = composeBodyRef.current;
    if (!editor) return;
    
    const selection = window.getSelection();
    if (!selection) return;
    
    const a = document.createElement('a');
    a.href = linkUrl;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.textContent = linkText || linkUrl;
    
    selection.removeAllRanges();
    selection.addRange(pendingLinkRange);
    const range = selection.getRangeAt(0);
    range.deleteContents();
    range.insertNode(a);
    range.setStartAfter(a);
    range.setEndAfter(a);
    selection.removeAllRanges();
    selection.addRange(range);
    setComposeBodyHtml(editor.innerHTML);
    
    // Reset dialog
    setShowLinkDialog(false);
    setLinkUrl('');
    setLinkText('');
    setPendingLinkRange(null);
    editor.focus();
  };

  const applyHeading = (level: 'p' | 'h1' | 'h2' | 'h3') => {
    const editor = composeBodyRef.current;
    if (!editor) return;
    editor.focus();
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    const range = selection.getRangeAt(0);
    if (!editor.contains(range.commonAncestorContainer)) return;
    
    const el = document.createElement(level === 'p' ? 'p' : level);
    
    if (selection.isCollapsed) {
      // No selection - insert empty heading with zero-width space
      const zwsp = document.createTextNode('\u200B');
      el.appendChild(zwsp);
      range.insertNode(el);
      // Place cursor inside
      const newRange = document.createRange();
      newRange.setStart(el.firstChild as Text, 1);
      newRange.setEnd(el.firstChild as Text, 1);
      selection.removeAllRanges();
      selection.addRange(newRange);
    } else {
      // Has selection - wrap it
      const text = range.toString();
      el.textContent = text;
      range.deleteContents();
      range.insertNode(el);
      range.setStartAfter(el);
      range.setEndAfter(el);
      selection.removeAllRanges();
      selection.addRange(range);
    }
    setComposeBodyHtml(editor.innerHTML);
  };

  const clearFormatting = () => {
    const editor = composeBodyRef.current;
    if (!editor) return;
    editor.focus();
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    const range = selection.getRangeAt(0);
    if (!editor.contains(range.commonAncestorContainer)) return;
    
    if (selection.isCollapsed) {
      // No selection - clear formatting of current parent node if it's a formatting tag
      let node = range.startContainer;
      if (node.nodeType === Node.TEXT_NODE) {
        node = node.parentNode as Node;
      }
      // Check if parent is a formatting element (strong, em, u, h1-h3, a, etc.)
      if (node && node !== editor && node.parentNode) {
        const tagName = (node as Element).tagName?.toLowerCase();
        if (['strong', 'em', 'u', 'b', 'i', 'h1', 'h2', 'h3', 'a'].includes(tagName)) {
          // Replace formatted node with its text content
          const text = (node as Element).textContent || '';
          const textNode = document.createTextNode(text);
          (node as Element).replaceWith(textNode);
          // Move cursor after text
          const newRange = document.createRange();
          newRange.setStartAfter(textNode);
          newRange.setEndAfter(textNode);
          selection.removeAllRanges();
          selection.addRange(newRange);
          setComposeBodyHtml(editor.innerHTML);
        }
      }
      return;
    }
    
    // Has selection - strip formatting from selected text
    const text = range.toString();
    const textNode = document.createTextNode(text);
    range.deleteContents();
    range.insertNode(textNode);
    range.setStartAfter(textNode);
    range.setEndAfter(textNode);
    selection.removeAllRanges();
    selection.addRange(range);
    setComposeBodyHtml(editor.innerHTML);
  };

  const sendEmail = async (to: string, subject: string, bcc?: string[]) => {
    try {
      setSending(true);
      const baseHtml = composeBodyHtml || '';
      const htmlBody = `<div style="font-size: ${fontSize}px; color: ${textColor};">${baseHtml}</div>`;
      const bodyText = baseHtml
        .replace(/<br\s*\/?>(\n)?/gi, '\n')
        .replace(/<\/p>/gi, '\n')
        .replace(/<[^>]+>/g, '')
        .trim();
      // Prepare attachments base64
      const attachmentPayload = await Promise.all(
        attachments.map(file => new Promise<{filename:string; content_type:string; content_base64:string}>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const result = reader.result as string;
            const base64 = result.split(',')[1];
            resolve({
              filename: file.name,
              content_type: file.type || 'application/octet-stream',
              content_base64: base64
            });
          };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        }))
      );
      const response = await emailAPI.sendEmail({
        to_addresses: [to],
        bcc_addresses: bcc && bcc.length ? bcc : undefined,
        subject,
        body_text: bodyText,
        body_html: htmlBody,
        from_email: composeFromEmail || undefined,
        attachments: attachmentPayload.length ? attachmentPayload : undefined
      });
      console.log('Email sent successfully:', response.data);
      setShowCompose(false);
      setAttachments([]);
      setComposeBodyHtml('');
      setCurrentFolder('sent');
      setSelectedEmail(null);
    } catch (error: any) {
      console.error('Failed to send email:', error);
      alert(error.response?.data?.detail || 'Failed to send email. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const getFolderIcon = (iconName: string) => {
    switch(iconName) {
      case 'inbox': return <FiInbox className="w-4 h-4" />;
      case 'star': return <FiStar className="w-4 h-4" />;
      case 'send': return <FiSend className="w-4 h-4" />;
      case 'edit': return <FiEdit className="w-4 h-4" />;
      case 'archive': return <FiArchive className="w-4 h-4" />;
      case 'alert': return <FiAlertCircle className="w-4 h-4" />;
      case 'trash': return <FiTrash2 className="w-4 h-4" />;
      case 'folder': return <FiFolder className="w-4 h-4" />;
      case 'clock': return <FiClock className="w-4 h-4" />;
      default: return <FiMail className="w-4 h-4" />;
    }
  };

  const groupEmailsByDate = (emails: Email[]) => {
    const today = new Date();
    const groups: Record<string, Email[]> = {
      'This week': [],
      'Last week': [],
      'This month': [],
      'Last month': []
    };

    emails.forEach(email => {
      const emailDate = new Date(email.created_at);
      const daysDiff = Math.floor((today.getTime() - emailDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff < 7) groups['This week'].push(email);
      else if (daysDiff < 14) groups['Last week'].push(email);
      else if (daysDiff < 30) groups['This month'].push(email);
      else groups['Last month'].push(email);
    });

    return groups;
  };

  const emailGroups = groupEmailsByDate(filteredEmails);

  return (
    <div className="h-screen flex flex-col bg-white dark:bg-gray-900 overflow-hidden overflow-x-hidden">
      <style>{`html,body{overflow-x:hidden;}`}</style>
      {/* Top Header Bar */}
      <div className="bg-blue-500 text-white px-2 sm:px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-4 flex-1">
          {/* Mobile Menu Button */}
          <button 
            onClick={() => setShowSidebar(!showSidebar)}
            className="p-2 hover:bg-white/10 rounded lg:hidden"
            title="Toggle menu"
          >
            <FiMenu className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-2">
            <img 
              src="/box-white.svg" 
              alt="CITRICLOUD" 
              className="h-7 sm:h-8 w-auto rounded-lg"
            />
            <div className="flex flex-col">
              <span className="text-white font-semibold text-xs sm:text-sm" style={{ fontFamily: "'Source Code Pro', monospace" }}>CITRICLOUD.com</span>
              <span className="text-white/80 text-[8px] sm:text-[9px] tracking-wide" style={{ fontFamily: "'Source Code Pro', monospace" }}>Enterprise Cloud Platform</span>
            </div>
            <span className="text-white font-semibold text-sm">Email</span>
          </div>
          <div className="relative flex-1 max-w-md hidden md:block">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/70" />
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-1.5 bg-blue-600 dark:bg-blue-700 text-white placeholder-white/70 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Email Alias Dropdown */}
          <div className="relative email-dropdown">
            <button
              onClick={() => setShowEmailDropdown(!showEmailDropdown)}
              className="flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded text-sm transition-colors"
              title="Select email address"
            >
              <FiMail className="w-4 h-4" />
              <span className="hidden md:inline max-w-[150px] truncate">{selectedFromEmail || 'All Mailboxes'}</span>
              <FiChevronDown className="w-3 h-3" />
            </button>
            {showEmailDropdown && (
              <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
                <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-200 dark:border-gray-700">
                  Open Email Inbox
                </div>
                {/* All Mailboxes option */}
                <button
                  onClick={() => {
                    setSelectedFromEmail('');
                    setShowEmailDropdown(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                    !selectedFromEmail ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <FiInbox className="w-4 h-4 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium">All Mailboxes</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Show all emails</div>
                    </div>
                    {!selectedFromEmail && <FiCheckCircle className="w-4 h-4 flex-shrink-0" />}
                  </div>
                </button>
                {emailAliases.filter((alias: any) => alias.is_active).map((alias: any) => (
                  <button
                    key={alias.id}
                    onClick={() => {
                      setSelectedFromEmail(alias.full_email);
                      setShowEmailDropdown(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                      selectedFromEmail === alias.full_email ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <FiMail className="w-4 h-4 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{alias.full_email}</div>
                        {alias.display_name && <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{alias.display_name}</div>}
                      </div>
                      {selectedFromEmail === alias.full_email && <FiCheckCircle className="w-4 h-4 flex-shrink-0" />}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="hidden sm:block">
          </div>
          <button 
            onClick={() => setShowSettings(true)}
            className="p-2 hover:bg-white/10 rounded hidden sm:block"
            title="Settings"
          >
            <FiSettings className="w-5 h-5" />
          </button>
          <button 
            onClick={() => navigate('/workspace')}
            className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 hover:bg-white/10 rounded transition-colors"
            title="Go back to Workspace"
          >
            <FiArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium hidden sm:inline">Back</span>
          </button>
        </div>
      </div>
      {/* Mobile Search Bar */}
      <div className="md:hidden bg-blue-500 px-2 pb-2 -mt-1">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60" />
          <input
            type="text"
            placeholder="Search mail"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-3 py-2 rounded bg-blue-600/40 dark:bg-blue-700/50 text-white placeholder-white/60 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
        </div>
      </div>


      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl h-[600px] flex overflow-hidden">
            {/* Settings Sidebar */}
            <div className="w-64 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 p-4">
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Settings</h2>
                <input 
                  type="text" 
                  placeholder="Search settings" 
                  className="w-full mt-2 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <nav className="space-y-1">
                <button className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">Account</button>
                <button className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">General</button>
                <button className="w-full text-left px-3 py-2 text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded font-medium">Email</button>
                <button className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">Calendar</button>
                <button className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">People</button>
                <button className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">Copilot</button>
              </nav>
            </div>

            {/* Settings Content */}
            <div className="flex-1 flex flex-col">
              {/* Settings Header */}
              <div className="flex items-center justify-between px-3 sm:px-4 lg:px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-4">
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white">Layout</h3>
                  <div className="flex gap-2 text-sm">
                    <button className="px-3 py-1 bg-blue-500 text-white rounded">Layout</button>
                    <button className="px-3 py-1 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">Template</button>
                  </div>
                </div>
                <button 
                  onClick={() => setShowSettings(false)}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                >
                  <FiX className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
              </div>

              {/* Settings Body */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                <div className="max-w-3xl space-y-6">
                  {/* Inbox Priority */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Inbox Priority</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      Do you want your email to be sorted in Outlook so you can focus on the most important messages?
                    </p>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2">
                        <input type="radio" name="priority" className="text-blue-600" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Sort messages in Priority and Other</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="radio" name="priority" defaultChecked className="text-blue-600" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Don't sort my messages</span>
                      </label>
                    </div>
                  </div>

                  {/* Text Size and Spacing */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Text size and spacing</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      Outlook uses this text size and spacing when adapting content to your screen. This has no impact on received or sent email content.
                    </p>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2">
                        <input type="radio" name="textsize" className="text-blue-600" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Small</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="radio" name="textsize" className="text-blue-600" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Normal</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="radio" name="textsize" defaultChecked className="text-blue-600" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Large</span>
                      </label>
                    </div>
                  </div>

                  {/* Organize Messages */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Organize messages</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">How do you want to organize the message list?</p>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2">
                        <input type="radio" name="organize" defaultChecked className="text-blue-600" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Group messages by conversation</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="radio" name="organize" className="text-blue-600" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Group messages by translations in conversations</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="radio" name="organize" className="text-blue-600" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Don't group messages</span>
                      </label>
                    </div>
                  </div>

                  {/* Reading Pane */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">What do you want to see in the reading pane?</h4>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2">
                        <input type="radio" name="reading" defaultChecked className="text-blue-600" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">All messages in the selected conversation</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="radio" name="reading" className="text-blue-600" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Only the selected message</span>
                      </label>
                    </div>
                  </div>

                  {/* Deleted Items */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Do you want to see deleted items in your conversations?</h4>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2">
                        <input type="radio" name="deleted" defaultChecked className="text-blue-600" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Show deleted items</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden overflow-x-hidden relative w-full">
        {/* Mobile Overlay */}
        {showSidebar && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setShowSidebar(false)}
          />
        )}
        
        {/* Sidebar */}
        <aside className={`
          w-60 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col
          fixed lg:relative inset-y-0 left-0 z-50 transform transition-transform duration-300 top-0 mt-[50px] lg:mt-0
          ${showSidebar ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          <div className="p-3">
            <button 
              onClick={() => {
                setShowCompose(true);
                setShowSidebar(false);
                setShowEmailList(false);
              }}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-3 rounded text-sm font-medium flex items-center gap-2 transition-colors"
            >
              <FiEdit className="w-4 h-4" /> New Email
            </button>
          </div>
          
          {/* Favorites Section */}
          <div className="px-3 mb-1">
            <button 
              onClick={() => setShowFavoritesCollapse(!showFavoritesCollapse)}
              className="w-full flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 py-1 hover:text-gray-900 dark:hover:text-gray-200"
            >
              <span className="font-semibold">Favorites</span>
              {showFavoritesCollapse ? <FiChevronDown className="w-3 h-3" /> : <FiChevronRight className="w-3 h-3" />}
            </button>
          </div>

          {showFavoritesCollapse && (
            <nav className="px-2 space-y-0.5 mb-3">
              {['inbox', 'archive', 'starred', 'sent', 'drafts', 'spam', 'trash'].map((folderName) => {
                const folder = folders.find(f => f.name === folderName);
                if (!folder) return null;
                return (
                  <button
                    key={folder.name}
                    onClick={() => { 
                      setCurrentFolder(folder.name); 
                      setSelectedEmail(null); 
                      setShowSidebar(false);
                      setShowEmailList(true);
                    }}
                    className={`w-full flex items-center justify-between px-2 py-1.5 rounded text-sm transition-colors ${
                      currentFolder === folder.name
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      {getFolderIcon(folder.icon)}
                      <span className="text-sm capitalize">{folder.name}</span>
                    </span>
                    {folder.count > 0 && (
                      <span className={`text-xs font-semibold ${currentFolder === folder.name ? 'text-blue-700 dark:text-blue-300' : 'text-gray-600 dark:text-gray-400'}`}>
                        {folder.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          )}

          {/* Folders Section */}
          <div className="px-3 mb-1">
            <button 
              onClick={() => setShowFoldersCollapse(!showFoldersCollapse)}
              className="w-full flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 py-1 hover:text-gray-900 dark:hover:text-gray-200"
            >
              <span className="font-semibold">Folders</span>
              <div className="flex items-center gap-1">
                <button 
                  onClick={(e) => { e.stopPropagation(); setShowNewFolderDialog(true); }}
                  className="p-0.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                  title="New folder"
                >
                  <FiPlus className="w-3 h-3" />
                </button>
                {showFoldersCollapse ? <FiChevronDown className="w-3 h-3" /> : <FiChevronRight className="w-3 h-3" />}
              </div>
            </button>
          </div>

          {showFoldersCollapse && (
            <nav className="px-2 space-y-0.5 mb-3">
              {customFolders.map((folder) => (
                <button
                  key={folder.id}
                  onClick={() => { 
                    setCurrentFolder(folder.id); 
                    setSelectedEmail(null); 
                    setShowSidebar(false);
                    setShowEmailList(true);
                  }}
                  className={`w-full flex items-center justify-between px-2 py-1.5 rounded text-sm transition-colors ${
                    currentFolder === folder.id
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <FiFolder className="w-4 h-4" />
                    <span className="text-sm">{folder.name}</span>
                  </span>
                </button>
              ))}
            </nav>
          )}

          {/* Labels Section */}
          <div className="px-3 mb-1">
            <button 
              onClick={() => setShowLabelsCollapse(!showLabelsCollapse)}
              className="w-full flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 py-1 hover:text-gray-900 dark:hover:text-gray-200"
            >
              <span className="font-semibold">Labels</span>
              <div className="flex items-center gap-1">
                <button 
                  onClick={(e) => { e.stopPropagation(); setShowNewLabelDialog(true); }}
                  className="p-0.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                  title="New label"
                >
                  <FiPlus className="w-3 h-3" />
                </button>
                {showLabelsCollapse ? <FiChevronDown className="w-3 h-3" /> : <FiChevronRight className="w-3 h-3" />}
              </div>
            </button>
          </div>

          {showLabelsCollapse && customLabels.length > 0 && (
            <nav className="px-2 space-y-0.5 mb-3">
              {customLabels.map((label) => (
                <button
                  key={label.id}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <FiTag className="w-4 h-4" style={{ color: label.color }} />
                  <span className="text-sm">{label.name}</span>
                </button>
              ))}
            </nav>
          )}

          <div className="flex-1"></div>

          {/* Storage Section */}
          <div className="p-3 border-t border-gray-200 dark:border-gray-700">
            <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
              Storage: {storageUsed.toFixed(1)} MB / {(storageTotal / 1024).toFixed(0)} GB
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
              <div 
                className="bg-blue-500 h-1.5 rounded-full transition-all duration-300" 
                style={{ width: `${Math.min((storageUsed / storageTotal) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
        </aside>

        {/* Email List Panel */}
        <div className={`
          w-full md:w-80 lg:w-96 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col min-w-0
          ${!showEmailList ? 'hidden md:flex' : 'flex'}
        `}>
          {/* Toolbar */}
          <div className="border-b border-gray-200 dark:border-gray-700 px-4 py-2 flex items-center gap-2">
            <button 
              onClick={() => selectedEmail && deleteEmail(selectedEmail.id)}
              disabled={!selectedEmail}
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-600 dark:text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed" 
              title="Delete"
            >
              <FiTrash2 className="w-4 h-4" />
            </button>
            <button 
              onClick={() => selectedEmail && archiveEmail(selectedEmail.id)}
              disabled={!selectedEmail}
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-600 dark:text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed" 
              title="Archive"
            >
              <FiArchive className="w-4 h-4" />
            </button>
            <button 
              onClick={() => selectedEmail && markAsRead(selectedEmail.id, !selectedEmail.is_read)}
              disabled={!selectedEmail}
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-600 dark:text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed" 
              title={selectedEmail?.is_read ? "Mark as unread" : "Mark as read"}
            >
              <FiMail className="w-4 h-4" />
            </button>
            <div className="ml-auto flex items-center gap-1 relative quick-steps-menu">
              <button 
                onClick={() => setShowQuickSteps(!showQuickSteps)}
                className="px-2 py-1 text-xs hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-700 dark:text-gray-300 flex items-center gap-1"
              >
                Quick steps <FiChevronDown className="w-3 h-3" />
              </button>
              {showQuickSteps && (
                <div className="absolute top-full right-0 mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10">
                  <button 
                    onClick={() => performQuickStep('move-archive')}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                  >
                    Move to Archive
                  </button>
                  <button 
                    onClick={() => performQuickStep('mark-read-archive')}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                  >
                    Mark as Read & Archive
                  </button>
                  <button 
                    onClick={() => performQuickStep('delete')}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                  >
                    Delete
                  </button>
                  <button 
                    onClick={() => performQuickStep('mark-unread')}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                  >
                    Mark as Unread
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Email List Header */}
          <div className="border-b border-gray-200 dark:border-gray-700 px-3 sm:px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-gray-900 dark:text-white">{currentFolder}</h2>
              <FiStar className="w-4 h-4 text-gray-400" />
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => loadEmails()}
                disabled={loading}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                title="Refresh"
              >
                <FiRefreshCw className={`w-4 h-4 text-gray-600 dark:text-gray-400 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <div className="relative email-list-menu">
                <button 
                  onClick={() => setShowEmailListMenu(!showEmailListMenu)}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                  title="More options"
                >
                  <FiMoreHorizontal className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </button>
                {showEmailListMenu && (
                  <div className="absolute top-full right-0 mt-1 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10">
                    <button 
                      onClick={() => {
                        emails.forEach(email => markAsRead(email.id, true));
                        setShowEmailListMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700"
                    >
                      Mark all as read
                    </button>
                    <button 
                      onClick={() => {
                        emails.forEach(email => markAsRead(email.id, false));
                        setShowEmailListMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700"
                    >
                      Mark all as unread
                    </button>
                    <button 
                      onClick={() => {
                        setCurrentFolder('inbox');
                        setShowEmailListMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700"
                    >
                      Go to Inbox
                    </button>
                    <button 
                      onClick={() => {
                        loadEmails();
                        setShowEmailListMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700"
                    >
                      Refresh folder
                    </button>
                    <button 
                      onClick={() => {
                        setShowSettings(true);
                        setShowEmailListMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                    >
                      Email settings
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Email List */}
          <div className="flex-1 overflow-y-auto">
            {filteredEmails.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
                <FiMail className="w-12 h-12 mb-2 text-gray-300 dark:text-gray-600" />
                <div className="text-sm">No emails found</div>
              </div>
            ) : (
              Object.entries(emailGroups).map(([group, groupEmails]) => 
                groupEmails.length > 0 ? (
                  <div key={group}>
                    <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                      <button className="flex items-center gap-2 text-xs font-semibold text-gray-700 dark:text-gray-300">
                        <FiChevronDown className="w-3 h-3" />
                        {group}
                      </button>
                    </div>
                    {groupEmails.map((email) => (
                      <div
                        key={email.id}
                        onClick={() => { 
                          console.log('Clicked email:', email.id, email.subject, 'Body text:', email.body_text, 'Body HTML:', email.body_html);
                          setSelectedEmail(email); 
                          setShowReply(false); 
                          if (!email.is_read) markAsRead(email.id); 
                          setShowEmailList(false); 
                        }}
                        className={`px-3 sm:px-4 py-3 cursor-pointer border-b border-gray-100 dark:border-gray-800 transition-colors ${
                          selectedEmail?.id === email.id
                            ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-l-blue-600'
                            : email.is_read 
                              ? 'hover:bg-gray-50 dark:hover:bg-gray-800' 
                              : 'bg-blue-50/30 dark:bg-blue-900/10 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${
                            email.from_address.includes('Power') ? 'bg-purple-500' : 'bg-blue-500'
                          }`}>
                            {email.from_address.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-0.5">
                              <p className={`text-sm truncate ${!email.is_read ? 'font-semibold text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                                {email.from_address}
                              </p>
                              <span className="text-xs text-gray-500 dark:text-gray-400 ml-2 flex-shrink-0">
                                {new Date(email.created_at).toLocaleDateString('nl-NL', { month: 'short', day: 'numeric' })}
                              </span>
                            </div>
                            <p className={`text-sm truncate mb-1 ${!email.is_read ? 'font-semibold text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>
                              {email.subject}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-500 truncate">{email.snippet}</p>
                            {email.attachments && email.attachments.length > 0 && (
                              <div className="flex items-center gap-1 mt-1">
                                <FiPaperclip className="w-3 h-3 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <button 
                            onClick={(e) => { e.stopPropagation(); toggleStar(email.id); }}
                            className="text-gray-400 hover:text-yellow-500 transition-colors"
                          >
                            {email.is_starred ? <FiStar className="w-4 h-4 fill-yellow-500 text-yellow-500" /> : <FiStar className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null
              )
            )}
          </div>
        </div>

        {/* Email Reading Panel */}
        <div className={`
          flex-1 bg-white dark:bg-gray-900 flex flex-col min-w-0
          ${showEmailList ? 'hidden md:flex' : 'flex'}
        `}>
          {/* Compose Modal - Outlook Style */}
          {showCompose ? (
            <div className="h-full flex flex-col w-full">
              {/* Compose Header */}
              <div className="border-b border-gray-200 dark:border-gray-700 px-4 py-2">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setShowCompose(false)}
                      className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                      title="Close"
                    >
                      ×
                    </button>
                    <h2 className="text-sm font-medium text-gray-900 dark:text-white">New message</h2>
                  </div>
                  {/* Temporarily disable compose actions dropdown to avoid runtime issues */}
                  <div className="flex items-center gap-2">
                    <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-600 dark:text-gray-400">
                      <FiMoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                {/* Toolbar */}
                <div className="flex items-center gap-2 py-2 border-b border-gray-200 dark:border-gray-700">
                  <button 
                    type="submit" 
                    form="compose-form"
                    disabled={sending}
                    className="px-4 py-1.5 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded text-sm font-medium transition-colors flex items-center gap-1"
                  >
                    <FiSend className="w-3 h-3" /> {sending ? 'Sending...' : 'Send'}
                  </button>
                </div>
              </div>

              {/* Compose Form */}
              <form 
                id="compose-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  const fd = new FormData(e.currentTarget);
                  const bccRaw = String(fd.get('bcc') || '').trim();
                  const bccList = bccRaw ? bccRaw.split(',').map(s => s.trim()).filter(Boolean) : undefined;
                  sendEmail(String(fd.get('to')), String(fd.get('subject')), bccList);
                }} 
                className="flex-1 flex flex-col overflow-hidden"
              >
                <div className="flex-1 flex flex-col overflow-hidden">
                  {/* From Field */}
                  <div className="flex items-center border-b border-gray-200 dark:border-gray-700 px-4 py-2">
                    <label className="text-sm text-gray-600 dark:text-gray-400 w-16">From:</label>
                    <div className="flex-1 relative">
                      <button 
                        type="button"
                        onClick={() => setShowFromDropdown(!showFromDropdown)}
                        className="flex items-center gap-1 text-sm text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 px-2 py-1 rounded transition-colors"
                      >
                        <span>{composeFromEmail || `${user?.username}@citricloud.com`}</span>
                        <FiChevronDown className="w-3 h-3 text-gray-600 dark:text-gray-400" />
                      </button>
                      
                      {/* From Dropdown */}
                      {showFromDropdown && (
                        <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 min-w-[250px]">
                          <div className="py-1">
                            {/* Default username */}
                            <button
                              type="button"
                              onClick={() => {
                                setComposeFromEmail('');
                                setShowFromDropdown(false);
                              }}
                              className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                                !composeFromEmail ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span>{user?.username}@citricloud.com</span>
                                {!composeFromEmail && <FiCheckCircle className="w-4 h-4 flex-shrink-0" />}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Default</div>
                            </button>
                            
                            {/* Email aliases */}
                            {emailAliases.map((alias) => (
                              <button
                                key={alias.id}
                                type="button"
                                onClick={() => {
                                  setComposeFromEmail(alias.full_email);
                                  setShowFromDropdown(false);
                                }}
                                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                                  composeFromEmail === alias.full_email ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <span>{alias.full_email}</span>
                                  {composeFromEmail === alias.full_email && <FiCheckCircle className="w-4 h-4 flex-shrink-0" />}
                                </div>
                                {alias.display_name && (
                                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{alias.display_name}</div>
                                )}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* To Field */}
                  <div className="flex items-center border-b border-gray-200 dark:border-gray-700 px-4 py-2">
                    <label className="text-sm text-gray-600 dark:text-gray-400 w-16">To:</label>
                    <input 
                      name="to" 
                      placeholder="Where do you want to email to be delivered?" 
                      className="flex-1 text-sm bg-transparent border-none focus:outline-none text-gray-900 dark:text-white placeholder-gray-400" 
                      required 
                    />
                    <button 
                      type="button" 
                      className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 ml-2"
                      onClick={() => setShowBcc(v => !v)}
                    >
                      BCC
                    </button>
                  </div>

                  {/* Temporarily hide BCC input to isolate crash */}

                  {/* Subject Field */}
                  <div className="flex items-center border-b border-gray-200 dark:border-gray-700 px-4 py-2">
                    <label className="text-sm text-gray-600 dark:text-gray-400 w-16">Subject:</label>
                    <input 
                      name="subject" 
                      placeholder="Add a subject" 
                      className="flex-1 text-sm bg-transparent border-none focus:outline-none text-gray-900 dark:text-white placeholder-gray-400" 
                      required 
                    />
                  </div>

                  {/* Rich Text Toolbar */}
                  <div className="flex items-center gap-1 px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 overflow-x-auto">
                    <button 
                      type="button" 
                      onMouseDown={(e) => { e.preventDefault(); applyFormatting('bold'); }}
                      className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-gray-600 dark:text-gray-400" 
                      title="Bold (Ctrl+B)"
                    >
                      <Bold className="w-4 h-4" />
                    </button>
                    <button 
                      type="button" 
                      onMouseDown={(e) => { e.preventDefault(); applyFormatting('italic'); }}
                      className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-gray-600 dark:text-gray-400" 
                      title="Italic (Ctrl+I)"
                    >
                      <Italic className="w-4 h-4" />
                    </button>
                    <button 
                      type="button" 
                      onMouseDown={(e) => { e.preventDefault(); applyFormatting('underline'); }}
                      className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-gray-600 dark:text-gray-400" 
                      title="Underline (Ctrl+U)"
                    >
                      <Underline className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onMouseDown={(e) => { e.preventDefault(); applyList('ul'); }}
                      className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-gray-600 dark:text-gray-400"
                      title="Bullet list"
                    ><ListIcon className="w-4 h-4" /></button>
                    <button
                      type="button"
                      onMouseDown={(e) => { e.preventDefault(); applyList('ol'); }}
                      className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-gray-600 dark:text-gray-400"
                      title="Numbered list"
                    ><ListOrdered className="w-4 h-4" /></button>
                    <button
                      type="button"
                      onMouseDown={(e) => { e.preventDefault(); applyLink(); }}
                      className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-blue-600 dark:text-blue-400"
                      title="Insert link"
                    ><LinkIcon className="w-4 h-4" /></button>
                    <div 
                      className="relative heading-dropdown"
                      onMouseEnter={() => setShowHeadings(true)}
                      onMouseLeave={() => setShowHeadings(false)}
                    >
                      <button
                        type="button"
                        className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-gray-600 dark:text-gray-400"
                        title="Heading level"
                      ><HeadingIcon className="w-4 h-4" /></button>
                      {showHeadings && (
                        <div className="absolute left-0 top-full mt-1 z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-lg p-1 flex flex-col min-w-[90px]">
                          {['h1','h2','h3','p'].map(h => (
                            <button
                              key={h}
                              type="button"
                              onMouseDown={(e) => { e.preventDefault(); applyHeading(h as 'h1'|'h2'|'h3'|'p'); }}
                              className="text-left px-2 py-1 text-xs hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-700 dark:text-gray-300"
                            >{h.toUpperCase()}</button>
                          ))}
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onMouseDown={(e) => { e.preventDefault(); clearFormatting(); }}
                      className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-red-600 dark:text-red-400"
                      title="Clear formatting"
                    ><Eraser className="w-4 h-4" /></button>
                    <div className="w-px h-4 bg-gray-300 dark:bg-gray-600 mx-1"></div>
                    <select 
                      value={fontSize}
                      onChange={(e) => setFontSize(e.target.value)}
                      className="px-2 py-1 text-xs bg-transparent border border-gray-300 dark:border-gray-600 rounded text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500" 
                      title="Font size"
                    >
                      <option value="12">12</option>
                      <option value="14">14</option>
                      <option value="16">16</option>
                      <option value="18">18</option>
                      <option value="20">20</option>
                      <option value="24">24</option>
                      <option value="28">28</option>
                      <option value="32">32</option>
                    </select>
                    <input 
                      type="color" 
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                      className="w-8 h-6 border border-gray-300 dark:border-gray-600 rounded cursor-pointer" 
                      title="Text color" 
                    />
                    <div className="w-px h-4 bg-gray-300 dark:bg-gray-600 mx-1"></div>
                    <button 
                      type="button" 
                      onClick={() => attachmentInputRef.current?.click()}
                      className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-gray-600 dark:text-gray-400" 
                      title="Attach files"
                    >
                      <Paperclip className="w-4 h-4" />
                    </button>
                    <input
                      ref={attachmentInputRef}
                      type="file"
                      multiple
                      className="hidden"
                      onChange={(e) => {
                        const files = e.target.files ? Array.from(e.target.files) : [];
                        if (files.length) {
                          setAttachments(prev => [...prev, ...files]);
                          e.target.value='';
                        }
                      }}
                    />
                  </div>

                  {/* Message Body */}
                  <div className="flex-1 px-4 py-4 overflow-y-auto">
                    <style>{`
                      [contenteditable] ul, [contenteditable] ol {
                        margin: 0.5em 0;
                        padding-left: 2em;
                      }
                      [contenteditable] ul {
                        list-style-type: disc;
                      }
                      [contenteditable] ol {
                        list-style-type: decimal;
                      }
                      [contenteditable] li {
                        margin: 0.25em 0;
                      }
                      [contenteditable] h1 {
                        font-size: 2em;
                        font-weight: bold;
                        margin: 0.67em 0;
                      }
                      [contenteditable] h2 {
                        font-size: 1.5em;
                        font-weight: bold;
                        margin: 0.75em 0;
                      }
                      [contenteditable] h3 {
                        font-size: 1.17em;
                        font-weight: bold;
                        margin: 0.83em 0;
                      }
                      [contenteditable] p {
                        margin: 0.5em 0;
                      }
                      [contenteditable] a {
                        color: #2563eb;
                        text-decoration: underline;
                        cursor: pointer;
                      }
                      [contenteditable] strong {
                        font-weight: bold;
                      }
                      [contenteditable] em {
                        font-style: italic;
                      }
                      [contenteditable] u {
                        text-decoration: underline;
                      }
                      [contenteditable]:empty:before {
                        content: attr(data-placeholder);
                        color: #9ca3af;
                        pointer-events: none;
                      }
                    `}</style>
                    <div
                       ref={composeBodyRef}
                       contentEditable
                       data-placeholder="Type your message here..."
                       className="w-full h-full min-h-[200px] text-sm bg-transparent border-none focus:outline-none resize-none text-gray-900 dark:text-white"
                       style={{ fontSize: `${fontSize}px`, color: textColor }}
                       onInput={(e) => setComposeBodyHtml((e.currentTarget as HTMLDivElement).innerHTML)}
                     ></div>
                     {attachments.length > 0 && (
                       <div className="mt-3 space-y-1">
                         {attachments.map((file, idx) => (
                           <div key={idx} className="flex items-center justify-between text-xs bg-gray-100 dark:bg-gray-700 rounded px-2 py-1">
                             <span className="truncate max-w-[70%]" title={file.name}>{file.name}</span>
                             <button
                               type="button"
                               onClick={() => setAttachments(prev => prev.filter((_, i) => i !== idx))}
                               className="text-red-500 hover:text-red-600 dark:text-red-400"
                             >Remove</button>
                           </div>
                         ))}
                       </div>
                     )}
                   </div>
                 </div>

                {/* Resend Footer */}
                <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-3 bg-gray-50 dark:bg-gray-800/50">
                  <div className="flex items-center justify-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <span>CITRICLOUD Email powered by</span>
                    <a 
                      href="https://resend.com" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium flex items-center gap-1"
                    >
                      <FiSend className="w-3 h-3" />
                      Resend
                    </a>
                  </div>
                </div>
              </form>

              {/* Link Dialog Modal */}
              {showLinkDialog && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowLinkDialog(false)}>
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4 sm:p-6 w-96" onClick={(e) => e.stopPropagation()}>
                    <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Insert Link</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">URL</label>
                        <input
                          type="url"
                          value={linkUrl}
                          onChange={(e) => setLinkUrl(e.target.value)}
                          placeholder="https://example.com"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                          autoFocus
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Link Text (optional)</label>
                        <input
                          type="text"
                          value={linkText}
                          onChange={(e) => setLinkText(e.target.value)}
                          placeholder="Click here"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 mt-6">
                      <button
                        onClick={() => { setShowLinkDialog(false); setLinkUrl(''); setLinkText(''); setPendingLinkRange(null); }}
                        className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={insertLink}
                        disabled={!linkUrl}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed rounded-md"
                      >
                        Insert
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : selectedEmail ? (
            /* Email Detail View */
            <div className="h-full flex flex-col">
              {/* Toolbar */}
              <div className="border-b border-gray-200 dark:border-gray-700 px-3 sm:px-4 py-2 flex items-center gap-2">
                {/* Mobile Back Button */}
                <button 
                  onClick={() => { 
                    setShowEmailList(true);
                    setSelectedEmail(null);
                  }}
                  className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-600 dark:text-gray-400 md:hidden" 
                  title="Back to list"
                >
                  <FiArrowLeft className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => deleteEmail(selectedEmail.id)}
                  className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-600 dark:text-gray-400" 
                  title="Delete"
                >
                  <FiTrash2 className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => archiveEmail(selectedEmail.id)}
                  className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-600 dark:text-gray-400" 
                  title="Archive"
                >
                  <FiArchive className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => markAsRead(selectedEmail.id, !selectedEmail.is_read)}
                  className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-600 dark:text-gray-400" 
                  title={selectedEmail.is_read ? "Mark as unread" : "Mark as read"}
                >
                  <FiMail className="w-4 h-4" />
                </button>
                <div className="flex-1"></div>
                <button 
                  onClick={() => toggleStar(selectedEmail.id)}
                  className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-600 dark:text-gray-400"
                >
                  {selectedEmail.is_starred ? <FiStar className="w-4 h-4 fill-yellow-500 text-yellow-500" /> : <FiStar className="w-4 h-4" />}
                </button>
              </div>

              {/* Email Header */}
                      <div className="px-4 sm:px-3 sm:px-4 lg:px-6 py-4 border-b border-gray-200 dark:border-gray-700 w-full overflow-x-hidden">
                <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 dark:text-white mb-4">{selectedEmail.subject}</h2>
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm ${
                    selectedEmail.from_address.includes('Power') ? 'bg-purple-500' : 'bg-blue-500'
                  }`}>
                    {selectedEmail.from_address.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{selectedEmail.from_address.split('@')[0]}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">&lt;{selectedEmail.from_address}&gt;</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          to: {selectedEmail.to_addresses.map(addr => `<${addr}>`).join(', ')}
                        </p>
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        {new Date(selectedEmail.created_at).toLocaleString('en-US', { 
                          weekday: 'short',
                          day: '2-digit', 
                          month: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Email Body */}
              <div className="flex-1 px-4 sm:px-3 sm:px-4 lg:px-6 py-4 sm:py-6 overflow-y-auto overflow-x-hidden">
                <div className="max-w-4xl w-full break-words">
                  {selectedEmail.body_html ? (
                    <div 
                      className="text-sm text-gray-900 dark:text-gray-100 leading-relaxed prose dark:prose-invert max-w-full break-words"
                      style={{wordBreak:'break-word', overflowWrap:'break-word'}}
                      dangerouslySetInnerHTML={{ __html: selectedEmail.body_html }}
                    />
                  ) : selectedEmail.body_text ? (
                    <p className="whitespace-pre-wrap text-sm text-gray-900 dark:text-gray-100 leading-relaxed">{selectedEmail.body_text}</p>
                  ) : (
                    <div className="text-center py-12">
                      <div className="text-gray-400 dark:text-gray-500 mb-2">
                        <FiMail className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">This message has no content</p>
                    </div>
                  )}
                </div>

                {/* Attachments */}
                {selectedEmail.attachments && selectedEmail.attachments.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 max-w-4xl">
                    <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3">
                      {selectedEmail.attachments.length} {selectedEmail.attachments.length === 1 ? 'Attachment' : 'Attachments'}
                    </h3>
                    <div className="flex gap-3">
                      {selectedEmail.attachments.map((att, idx) => (
                        <div key={idx} className="flex items-center gap-2 px-3 py-2 rounded border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                          <FiPaperclip className="w-4 h-4 text-gray-400" />
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-gray-900 dark:text-gray-100">{att.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{att.size}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Reply Section */}
              {!showReply ? (
                <div className="px-3 sm:px-4 lg:px-6 py-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setShowReply(true)}
                      className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium transition-colors flex items-center gap-2"
                    >
                      <FiCornerUpLeft className="w-4 h-4" /> Reply
                    </button>
                    <button className="px-4 py-1.5 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-sm font-medium transition-colors flex items-center gap-2">
                      <FiCornerUpRight className="w-4 h-4" /> Forward
                    </button>
                  </div>
                </div>
              ) : (
                <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                  {/* Reply Header */}
                  <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">From:</span>
                        <span className="text-sm text-gray-900 dark:text-white font-medium">youremail@citricloud.com</span>
                        <button type="button" className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
                          <FiChevronDown className="w-3 h-3 text-gray-600 dark:text-gray-400" />
                        </button>
                      </div>
                      <button 
                        onClick={() => setShowReply(false)}
                        className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                      >
                        ×
                      </button>
                    </div>
                  </div>

                  {/* To Field */}
                  <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">To:</span>
                      <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">
                        <div className="w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs font-semibold">
                          {selectedEmail.from_address.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm text-gray-900 dark:text-white">{selectedEmail.from_address}</span>
                      </div>
                    </div>
                  </div>

                  {/* Reply Body */}
                  <div className="px-4 py-3">
                    <textarea
                      placeholder="Type your reply..."
                      className="w-full h-32 text-sm bg-transparent border-none focus:outline-none resize-none text-gray-900 dark:text-white placeholder-gray-400"
                    ></textarea>
                  </div>

                  {/* Reply Actions */}
                  <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium transition-colors flex items-center gap-2">
                        <FiSend className="w-3 h-3" /> Send
                      </button>
                      <button 
                        onClick={() => setShowReply(false)}
                        className="px-4 py-1.5 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-sm font-medium transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                      <button className="hover:text-gray-700 dark:hover:text-gray-300">See the recommended...</button>
                      <span>|</span>
                      <button className="flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-300">
                        <FiEdit className="w-3 h-3" /> (No subject)
                      </button>
                      <button 
                        onClick={() => setShowReply(false)}
                        className="hover:text-gray-700 dark:hover:text-gray-300"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-32 h-32 mx-auto mb-4 opacity-20">
                  <svg viewBox="0 0 100 100" fill="currentColor" className="text-gray-400">
                    <path d="M50 20 L80 40 L80 80 L20 80 L20 40 Z M50 20 L20 40 L50 60 L80 40 Z" />
                  </svg>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Select an item to read</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Nothing is selected</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Folder Dialog */}
      {showNewFolderDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Create New Folder</h3>
              <button 
                onClick={() => setShowNewFolderDialog(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <FiX className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const folderName = String(formData.get('folderName'));
                const folderIcon = String(formData.get('folderIcon'));
                
                const newFolder: CustomFolder = {
                  id: `custom-${Date.now()}`,
                  name: folderName,
                  icon: folderIcon,
                  count: 0
                };
                
                setCustomFolders([...customFolders, newFolder]);
                setShowNewFolderDialog(false);
                e.currentTarget.reset();
              }}
              className="p-4 space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Folder Name
                </label>
                <input
                  type="text"
                  name="folderName"
                  required
                  placeholder="Enter folder name"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Icon
                </label>
                <select
                  name="folderIcon"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="folder">📁 Folder</option>
                  <option value="briefcase">💼 Briefcase</option>
                  <option value="file">📄 File</option>
                  <option value="clipboard">📋 Clipboard</option>
                  <option value="calendar">📅 Calendar</option>
                  <option value="bookmark">🔖 Bookmark</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewFolderDialog(false)}
                  className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Create Folder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Label Dialog */}
      {showNewLabelDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Create New Label</h3>
              <button 
                onClick={() => setShowNewLabelDialog(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <FiX className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const labelName = String(formData.get('labelName'));
                const labelColor = String(formData.get('labelColor'));
                
                const newLabel: Label = {
                  id: `label-${Date.now()}`,
                  name: labelName,
                  color: labelColor
                };
                
                setCustomLabels([...customLabels, newLabel]);
                setShowNewLabelDialog(false);
                e.currentTarget.reset();
              }}
              className="p-4 space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Label Name
                </label>
                <input
                  type="text"
                  name="labelName"
                  required
                  placeholder="Enter label name"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Color
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#6366f1', '#14b8a6', '#f97316', '#84cc16', '#06b6d4', '#a855f7'].map((color) => (
                    <label key={color} className="relative cursor-pointer">
                      <input
                        type="radio"
                        name="labelColor"
                        value={color}
                        defaultChecked={color === '#3b82f6'}
                        className="sr-only peer"
                      />
                      <div
                        className="w-10 h-10 rounded-md border-2 border-transparent peer-checked:border-gray-900 dark:peer-checked:border-white hover:scale-110 transition-transform"
                        style={{ backgroundColor: color }}
                      ></div>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewLabelDialog(false)}
                  className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Create Label
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
