import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { sharedEmailAPI } from '../lib/api';
import { useAuthStore } from '../store/authStore';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { 
  FiMail, 
  FiSend, 
  FiRefreshCw, 
  FiArrowLeft, 
  FiInbox, 
  FiArchive,
  FiTrash2,
  FiClock,
  FiUser,
  FiPaperclip,
  FiEdit3,
  FiStar,
  FiCheckSquare,
  FiSquare,
  FiUsers
} from 'react-icons/fi';

interface SharedEmail {
  id: number;
  full_email: string;
  display_name: string;
  description: string;
  email_name: string;
}

interface Email {
  id: number;
  from: string;
  to: string;
  subject: string;
  body: string;
  created_at: string;
  is_read: boolean;
  has_attachments: boolean;
  folder?: 'inbox' | 'archived' | 'deleted';
  is_starred?: boolean;
  sent_by?: string;
}

interface Member {
  id: number;
  email: string;
  username: string;
  full_name?: string;
}

type EmailView = 'inbox' | 'archived' | 'deleted' | 'starred';

export default function SharedEmailInbox() {
  const { sharedEmailId } = useParams<{ sharedEmailId: string }>();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  const [sharedEmail, setSharedEmail] = useState<SharedEmail | null>(null);
  const [emails, setEmails] = useState<Email[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCompose, setShowCompose] = useState(false);
  const [composing, setComposing] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [selectedEmails, setSelectedEmails] = useState<number[]>([]);
  const [selectMode, setSelectMode] = useState(false);
  const [archiving, setArchiving] = useState(false);
  const [currentView, setCurrentView] = useState<EmailView>('inbox');
  const [members, setMembers] = useState<Member[]>([]);
  const [showMembers, setShowMembers] = useState(true);

  // Compose form state
  const [composeData, setComposeData] = useState({
    to: '',
    subject: '',
    body: ''
  });

  useEffect(() => {
    loadSharedEmail();
    loadEmails();
    loadMembers();
  }, [sharedEmailId]);

  const loadSharedEmail = async () => {
    try {
      const response = await sharedEmailAPI.listSharedEmails();
      const email = response.data.shared_emails.find((e: any) => e.id === parseInt(sharedEmailId || '0'));
      if (email) {
        setSharedEmail(email);
      } else {
        navigate('/profile');
      }
    } catch (error) {
      console.error('Failed to load shared email:', error);
      navigate('/profile');
    }
  };

  const loadEmails = async () => {
    setLoading(true);
    try {
      // Load emails from Resend API (both sent FROM and received TO this shared email)
      const response = await sharedEmailAPI.listSentEmails(parseInt(sharedEmailId || '0'));
      console.log('API Response:', response);
      
      // The API returns { data: [...emails], object: "list", has_more: false }
      const sentEmails = response.data?.data || response.data || [];
      console.log('Emails found:', sentEmails.length, sentEmails);
      
      // Transform Resend email format to our Email interface
      const transformedEmails = sentEmails.map((email: any) => ({
        id: email.id,
        from: email.from || '',
        to: Array.isArray(email.to) ? email.to.join(', ') : email.to || '',
        subject: email.subject || 'No Subject',
        body: email.html || email.text || '',
        created_at: email.created_at || new Date().toISOString(),
        is_read: true,
        is_starred: email.is_starred || false,
        sent_by: email.sent_by,
        has_attachments: false,
        folder: (email.folder || 'inbox') as 'inbox' | 'archived' | 'deleted'
      }));
      
      console.log('Transformed emails:', transformedEmails);
      setEmails(transformedEmails);
    } catch (error) {
      console.error('Failed to load emails:', error);
      setEmails([]);
    } finally {
      setLoading(false);
    }
  };

  const loadMembers = async () => {
    try {
      const response = await sharedEmailAPI.getSharedEmail(parseInt(sharedEmailId || '0'));
      if (response.data.members) {
        setMembers(response.data.members);
      }
    } catch (error) {
      console.error('Failed to load members:', error);
    }
  };

  const handleSendEmail = async () => {
    if (!composeData.to || !composeData.subject || !composeData.body) {
      alert('Please fill in all fields');
      return;
    }

    setComposing(true);
    try {
      await sharedEmailAPI.sendSharedEmail(parseInt(sharedEmailId || '0'), composeData);
      
      // Clear form and close compose
      setComposeData({ to: '', subject: '', body: '' });
      setShowCompose(false);
      
      // Show success message
      setSuccessMessage('✅ Email sent successfully!');
      setTimeout(() => setSuccessMessage(''), 4000);
      
      // Refresh email list
      await loadEmails();
    } catch (error: any) {
      console.error('Failed to send email:', error);
      alert(error.response?.data?.detail || 'Failed to send email');
    } finally {
      setComposing(false);
    }
  };

  const handleRefresh = () => {
    loadEmails();
  };

  const handleReply = (email: Email) => {
    setComposeData({
      to: email.from,
      subject: email.subject.startsWith('Re:') ? email.subject : `Re: ${email.subject}`,
      body: `\n\n---\nOn ${new Date(email.created_at).toLocaleString()}, ${email.from} wrote:\n${email.body}`
    });
    setShowCompose(true);
    setSelectedEmail(null);
  };

  const handleArchive = async (emailId: number) => {
    if (!confirm('Archive this email?')) return;
    
    setArchiving(true);
    try {
      // Update backend
      await sharedEmailAPI.updateMessageMetadata(parseInt(sharedEmailId || '0'), emailId, { folder: 'archived' });
      
      // Update local state
      setEmails(emails.map(e => 
        e.id === emailId ? { ...e, folder: 'archived' as const } : e
      ));
      setSelectedEmail(null);
      setSuccessMessage('✅ Email archived');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error: any) {
      console.error('Failed to archive email:', error);
      alert('Failed to archive email');
    } finally {
      setArchiving(false);
    }
  };

  const handleDelete = async (emailId: number) => {
    if (!confirm('Move this email to trash?')) return;
    
    setDeleting(true);
    try {
      // Update backend
      await sharedEmailAPI.updateMessageMetadata(parseInt(sharedEmailId || '0'), emailId, { folder: 'deleted' });
      
      // Update local state
      setEmails(emails.map(e => 
        e.id === emailId ? { ...e, folder: 'deleted' as const } : e
      ));
      setSelectedEmail(null);
      setSuccessMessage('✅ Email moved to trash');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error: any) {
      console.error('Failed to delete email:', error);
      alert('Failed to delete email');
    } finally {
      setDeleting(false);
    }
  };

  const handleRestore = async (emailId: number, fromFolder: 'archived' | 'deleted') => {
    try {
      // Update backend
      await sharedEmailAPI.updateMessageMetadata(parseInt(sharedEmailId || '0'), emailId, { folder: 'inbox' });
      
      // Update local state
      setEmails(emails.map(e => 
        e.id === emailId ? { ...e, folder: 'inbox' as const } : e
      ));
      setSelectedEmail(null);
      setSuccessMessage(`✅ Email restored from ${fromFolder}`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error: any) {
      console.error('Failed to restore email:', error);
      alert('Failed to restore email');
    }
  };

  const handlePermanentDelete = async (emailId: number) => {
    if (!confirm('Permanently delete this email? This action cannot be undone!')) return;
    
    setDeleting(true);
    try {
      // Delete from backend
      await sharedEmailAPI.deleteMessage(parseInt(sharedEmailId || '0'), emailId);
      
      // Remove from local state
      setEmails(emails.filter(e => e.id !== emailId));
      setSelectedEmail(null);
      setSuccessMessage('✅ Email permanently deleted');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error: any) {
      console.error('Failed to permanently delete email:', error);
      alert('Failed to permanently delete email');
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleStar = async (emailId: number) => {
    const email = emails.find(e => e.id === emailId);
    if (!email) return;
    
    const newStarred = !email.is_starred;
    
    try {
      // Update backend
      await sharedEmailAPI.updateMessageMetadata(parseInt(sharedEmailId || '0'), emailId, { is_starred: newStarred });
      
      // Update local state
      setEmails(emails.map(e => 
        e.id === emailId ? { ...e, is_starred: newStarred } : e
      ));
    } catch (error: any) {
      console.error('Failed to toggle star:', error);
      // Optionally show error to user
    }
  };

  const handleBulkDelete = async () => {
    if (selectedEmails.length === 0) return;
    
    // If in deleted view, permanently delete; otherwise, move to trash
    const isPermanent = currentView === 'deleted';
    const confirmMsg = isPermanent 
      ? `Permanently delete ${selectedEmails.length} selected emails? This action cannot be undone!`
      : `Delete ${selectedEmails.length} selected emails?`;
    
    if (!confirm(confirmMsg)) return;
    
    setDeleting(true);
    try {
      if (isPermanent) {
        // Permanently delete from backend
        await Promise.all(
          selectedEmails.map(emailId => 
            sharedEmailAPI.deleteMessage(parseInt(sharedEmailId || '0'), emailId)
          )
        );
        
        // Remove from local state
        setEmails(emails.filter(e => !selectedEmails.includes(e.id)));
        setSuccessMessage(`✅ ${selectedEmails.length} emails permanently deleted`);
      } else {
        // Move to trash
        await Promise.all(
          selectedEmails.map(emailId => 
            sharedEmailAPI.updateMessageMetadata(parseInt(sharedEmailId || '0'), emailId, { folder: 'deleted' })
          )
        );
        
        // Update local state
        setEmails(emails.map(e => 
          selectedEmails.includes(e.id) ? { ...e, folder: 'deleted' as const } : e
        ));
        setSuccessMessage(`✅ ${selectedEmails.length} emails moved to trash`);
      }
      
      setSelectedEmails([]);
      setSelectMode(false);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error: any) {
      console.error('Failed to bulk delete:', error);
      alert('Failed to delete emails');
    } finally {
      setDeleting(false);
    }
  };

  const toggleSelectEmail = (emailId: number) => {
    setSelectedEmails(prev => 
      prev.includes(emailId) 
        ? prev.filter(id => id !== emailId)
        : [...prev, emailId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedEmails.length === filteredEmails.length) {
      setSelectedEmails([]);
    } else {
      setSelectedEmails(filteredEmails.map(e => e.id));
    }
  };

  // Filter emails based on current view
  const filteredEmails = emails.filter(email => {
    if (currentView === 'starred') {
      return email.is_starred === true;
    }
    const folder = email.folder || 'inbox';
    return folder === currentView;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
      <Navbar />
      
      <div className="container mx-auto px-2 sm:px-4 md:px-6 py-8 pt-40 max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <Link
            to="/profile"
            className="inline-flex items-center gap-2 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 mb-4"
          >
            <FiArrowLeft className="w-4 h-4" />
            Back to Profile
          </Link>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <FiInbox className="w-8 h-8 text-primary-500" />
                {sharedEmail?.display_name || sharedEmail?.full_email || 'Shared Inbox'}
              </h1>
              {sharedEmail && (
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  {sharedEmail.full_email}
                  {sharedEmail.description && ` • ${sharedEmail.description}`}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              {/* Success Message Toast */}
              {successMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="fixed top-24 right-4 z-50 px-6 py-3 bg-green-500 text-white rounded-lg shadow-lg flex items-center gap-2"
                >
                  <FiSend className="w-5 h-5" />
                  {successMessage}
                </motion.div>
              )}
              
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="px-4 py-2 rounded-lg bg-gray-500/10 hover:bg-gray-500/20 text-gray-700 dark:text-gray-300 font-medium transition-all flex items-center gap-2"
              >
                <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              
              {selectMode ? (
                <>
                  <button
                    onClick={handleBulkDelete}
                    disabled={selectedEmails.length === 0 || deleting}
                    className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    <FiTrash2 className="w-4 h-4" />
                    Delete Selected ({selectedEmails.length})
                  </button>
                  <button
                    onClick={() => {
                      setSelectMode(false);
                      setSelectedEmails([]);
                    }}
                    className="px-4 py-2 rounded-lg bg-gray-500/10 hover:bg-gray-500/20 text-gray-700 dark:text-gray-300 font-medium transition-all"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setSelectMode(true)}
                    className="px-4 py-2 rounded-lg bg-gray-500/10 hover:bg-gray-500/20 text-gray-700 dark:text-gray-300 font-medium transition-all flex items-center gap-2"
                  >
                    <FiCheckSquare className="w-4 h-4" />
                    Select
                  </button>
                  <button
                    onClick={() => setShowCompose(true)}
                    className="px-4 py-2 rounded-lg bg-primary-500 hover:bg-primary-600 text-white font-medium transition-all flex items-center gap-2"
                  >
                    <FiEdit3 className="w-4 h-4" />
                    Compose
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* View Tabs - Horizontally scrollable */}
        <div className="mb-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto scrollbar-hide">
              <div className="flex border-b border-gray-200 dark:border-gray-700 min-w-max">
                <button
                  onClick={() => setCurrentView('inbox')}
                  className={`px-6 py-3 text-sm font-medium transition-all flex items-center gap-2 whitespace-nowrap ${
                    currentView === 'inbox'
                      ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 border-b-2 border-primary-500'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  }`}
                >
                  <FiInbox className="w-4 h-4" />
                  <span>Inbox ({emails.filter(e => (e.folder || 'inbox') === 'inbox').length})</span>
                </button>
                <button
                  onClick={() => setCurrentView('archived')}
                  className={`px-6 py-3 text-sm font-medium transition-all flex items-center gap-2 whitespace-nowrap ${
                    currentView === 'archived'
                      ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 border-b-2 border-primary-500'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  }`}
                >
                  <FiArchive className="w-4 h-4" />
                  <span>Archived ({emails.filter(e => e.folder === 'archived').length})</span>
                </button>
                <button
                  onClick={() => setCurrentView('deleted')}
                  className={`px-6 py-3 text-sm font-medium transition-all flex items-center gap-2 whitespace-nowrap ${
                    currentView === 'deleted'
                      ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 border-b-2 border-primary-500'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  }`}
                >
                  <FiTrash2 className="w-4 h-4" />
                  <span>Deleted ({emails.filter(e => e.folder === 'deleted').length})</span>
                </button>
                <button
                  onClick={() => setCurrentView('starred')}
                  className={`px-6 py-3 text-sm font-medium transition-all flex items-center gap-2 whitespace-nowrap ${
                    currentView === 'starred'
                      ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 border-b-2 border-primary-500'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  }`}
                >
                  <FiStar className="w-4 h-4" />
                  <span>Starred ({emails.filter(e => e.is_starred === true).length})</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Email List */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    {currentView === 'inbox' && <><FiInbox className="w-5 h-5" />Inbox</>}
                    {currentView === 'archived' && <><FiArchive className="w-5 h-5" />Archived</>}
                    {currentView === 'deleted' && <><FiTrash2 className="w-5 h-5" />Deleted</>}
                    {currentView === 'starred' && <><FiStar className="w-5 h-5" />Starred</>}
                    <span className="text-gray-500">({filteredEmails.length})</span>
                  </h2>
                  
                  {selectMode && filteredEmails.length > 0 && (
                    <button
                      onClick={toggleSelectAll}
                      className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 flex items-center gap-2"
                    >
                      {selectedEmails.length === filteredEmails.length ? (
                        <><FiCheckSquare className="w-4 h-4" /> Deselect All</>
                      ) : (
                        <><FiSquare className="w-4 h-4" /> Select All</>
                      )}
                    </button>
                  )}
                </div>
              </div>
              
              <div className="overflow-y-auto scrollbar-hide" style={{ maxHeight: 'calc(100vh - 340px)' }}>
                {loading ? (
                  <div className="p-8 text-center text-gray-500">
                    <FiRefreshCw className="w-8 h-8 mx-auto mb-2 animate-spin" />
                    Loading emails...
                  </div>
                ) : filteredEmails.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    {currentView === 'inbox' && (
                      <>
                        <FiInbox className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>No emails yet</p>
                        <p className="text-sm mt-1">Compose a new email to get started</p>
                      </>
                    )}
                    {currentView === 'archived' && (
                      <>
                        <FiArchive className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>No archived emails</p>
                      </>
                    )}
                    {currentView === 'deleted' && (
                      <>
                        <FiTrash2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>No deleted emails</p>
                      </>
                    )}
                    {currentView === 'starred' && (
                      <>
                        <FiStar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>No starred emails</p>
                        <p className="text-sm mt-1">Star emails to find them easily</p>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredEmails.map((email) => (
                      <button
                        key={email.id}
                        onClick={() => {
                          if (!selectMode) setSelectedEmail(email);
                        }}
                        className={`w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all ${
                          selectedEmail?.id === email.id
                            ? 'bg-primary-50 dark:bg-primary-900/20 border-l-4 border-primary-500'
                            : !email.is_read
                            ? 'bg-blue-50/50 dark:bg-blue-900/10'
                            : ''
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {selectMode && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleSelectEmail(email.id);
                              }}
                              className="mt-1"
                            >
                              {selectedEmails.includes(email.id) ? (
                                <FiCheckSquare className="w-5 h-5 text-primary-600" />
                              ) : (
                                <FiSquare className="w-5 h-5 text-gray-400" />
                              )}
                            </button>
                          )}
                          
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-1">
                              <span className={`text-sm font-medium ${!email.is_read ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                                {email.from}
                              </span>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleToggleStar(email.id);
                                  }}
                                  className="hover:scale-110 transition-transform"
                                >
                                  <FiStar className={`w-4 h-4 ${email.is_starred ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}`} />
                                </button>
                                {!email.is_read && (
                                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                )}
                              </div>
                            </div>
                            <p className={`text-sm mb-1 truncate ${!email.is_read ? 'font-semibold text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>
                              {email.subject}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <FiClock className="w-3 h-3" />
                              {new Date(email.created_at).toLocaleString()}
                              {email.has_attachments && (
                                <FiPaperclip className="w-3 h-3 ml-2" />
                              )}
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Email Content / Compose */}
          <div className="lg:col-span-2">
            {/* Members List */}
            {members.length > 0 && showMembers && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <FiUsers className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                        Shared Inbox Members ({members.length})
                      </h3>
                    </div>
                    <p className="text-xs text-blue-700 dark:text-blue-300 mb-2">
                      All members can view and send emails from this shared inbox
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {members.map((member) => (
                        <div
                          key={member.id}
                          className="inline-flex items-center gap-1.5 px-2 py-1 bg-white dark:bg-gray-800 rounded border border-blue-200 dark:border-blue-700"
                        >
                          <FiUser className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                          <span className="text-xs text-gray-900 dark:text-gray-100">
                            {member.full_name || member.username}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => setShowMembers(false)}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 ml-3 text-sm"
                  >
                    ✕
                  </button>
                </div>
              </motion.div>
            )}
            
            {showCompose ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <FiEdit3 className="w-5 h-5" />
                    Compose Email
                  </h2>
                  <button
                    onClick={() => setShowCompose(false)}
                    className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      From
                    </label>
                    <input
                      type="text"
                      value={sharedEmail?.full_email || ''}
                      disabled
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Sent By (Your Identity)
                    </label>
                    <input
                      type="text"
                      value={user?.email || ''}
                      disabled
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 font-medium"
                    />
                    <p className="text-xs text-gray-500 mt-1">Recipients will see this email was sent by you via the shared inbox</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      To
                    </label>
                    <input
                      type="email"
                      value={composeData.to}
                      onChange={(e) => setComposeData({ ...composeData, to: e.target.value })}
                      placeholder="recipient@example.com"
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Subject
                    </label>
                    <input
                      type="text"
                      value={composeData.subject}
                      onChange={(e) => setComposeData({ ...composeData, subject: e.target.value })}
                      placeholder="Email subject"
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Message
                    </label>
                    <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                      <ReactQuill
                        theme="snow"
                        value={composeData.body}
                        onChange={(value) => setComposeData({ ...composeData, body: value })}
                        placeholder="Write your message..."
                        style={{ height: '300px', marginBottom: '50px' }}
                        modules={{
                          toolbar: [
                            [{ 'header': [1, 2, 3, false] }],
                            ['bold', 'italic', 'underline', 'strike'],
                            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                            [{ 'color': [] }, { 'background': [] }],
                            ['link'],
                            ['clean']
                          ]
                        }}
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 justify-end">
                    <button
                      onClick={() => setShowCompose(false)}
                      disabled={composing}
                      className="px-6 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSendEmail}
                      disabled={composing}
                      className="px-6 py-2 rounded-lg bg-primary-500 hover:bg-primary-600 text-white font-medium transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                      {composing ? (
                        <>
                          <FiRefreshCw className="w-4 h-4 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <FiSend className="w-4 h-4" />
                          Send Email
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            ) : selectedEmail ? (
              <motion.div
                key={selectedEmail.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
              >
                <div className="border-b border-gray-200 dark:border-gray-700 pb-4 mb-4">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                    {selectedEmail.subject}
                  </h2>
                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                      <FiUser className="w-4 h-4" />
                      <span>From: {selectedEmail.from}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FiClock className="w-4 h-4" />
                      {new Date(selectedEmail.created_at).toLocaleString()}
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    To: {selectedEmail.to}
                  </div>
                </div>

                <div className="prose dark:prose-invert max-w-none">
                  <div 
                    className="text-gray-700 dark:text-gray-300"
                    dangerouslySetInnerHTML={{ __html: selectedEmail.body }}
                  />
                </div>

                <div className="mt-6 flex gap-3">
                  {currentView === 'inbox' && (
                    <>
                      <button
                        onClick={() => handleReply(selectedEmail)}
                        className="px-4 py-2 rounded-lg bg-primary-500 hover:bg-primary-600 text-white font-medium transition-all flex items-center gap-2"
                      >
                        <FiSend className="w-4 h-4" />
                        Reply
                      </button>
                      <button
                        onClick={() => handleArchive(selectedEmail.id)}
                        disabled={archiving}
                        className="px-4 py-2 rounded-lg bg-gray-500/10 hover:bg-gray-500/20 text-gray-700 dark:text-gray-300 font-medium transition-all flex items-center gap-2 disabled:opacity-50"
                      >
                        <FiArchive className={`w-4 h-4 ${archiving ? 'animate-pulse' : ''}`} />
                        {archiving ? 'Archiving...' : 'Archive'}
                      </button>
                      <button
                        onClick={() => handleDelete(selectedEmail.id)}
                        disabled={deleting}
                        className="px-4 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 font-medium transition-all flex items-center gap-2 disabled:opacity-50"
                      >
                        <FiTrash2 className={`w-4 h-4 ${deleting ? 'animate-pulse' : ''}`} />
                        {deleting ? 'Deleting...' : 'Delete'}
                      </button>
                    </>
                  )}
                  
                  {(currentView === 'archived' || currentView === 'deleted') && (
                    <>
                      <button
                        onClick={() => handleRestore(selectedEmail.id, currentView)}
                        className="px-4 py-2 rounded-lg bg-primary-500 hover:bg-primary-600 text-white font-medium transition-all flex items-center gap-2"
                      >
                        <FiInbox className="w-4 h-4" />
                        Restore to Inbox
                      </button>
                      
                      {currentView === 'deleted' && (
                        <button
                          onClick={() => handlePermanentDelete(selectedEmail.id)}
                          disabled={deleting}
                          className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition-all flex items-center gap-2 disabled:opacity-50"
                        >
                          <FiTrash2 className={`w-4 h-4 ${deleting ? 'animate-pulse' : ''}`} />
                          {deleting ? 'Removing...' : 'Remove Permanently'}
                        </button>
                      )}
                    </>
                  )}
                </div>
              </motion.div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center">
                <FiMail className="w-16 h-16 mx-auto mb-4 text-gray-400 opacity-50" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Select an email to read
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Choose an email from the list to view its contents
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
