import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import '../../styles/quill-custom.css';
import {
  FiMessageSquare,
  FiSend,
  FiFilter,
  FiSearch,
  FiMail,
  FiArchive,
  FiTrash2,
  FiAlertCircle,
  FiCheckCircle,
  FiClock,
  FiUser,
  FiX
} from 'react-icons/fi';
import DashboardLayout from '../../components/DashboardLayout';
import { crmAPI } from '../../lib/api';
import { useToast } from '../../components/Toast';

const priorityStyles: Record<string, string> = {
  low: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300',
  medium: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
  high: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300',
  urgent: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
};

const statusStyles: Record<string, string> = {
  unread: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
  read: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
  archived: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300',
};

export default function CRMMessages() {
  const pageSize = 20;
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<string>('');
  const [search, setSearch] = useState('');
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [showComposeModal, setShowComposeModal] = useState(false);
  const [recipientIds, setRecipientIds] = useState<number[]>([]);
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState('medium');
  const [isSending, setIsSending] = useState(false);
  
  const quillModules = useMemo(() => ({
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'color': [] }, { 'background': [] }],
      ['link'],
      ['clean']
    ]
  }), []);
  
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const { data, isLoading } = useQuery({
    queryKey: ['crm-messages', page, statusFilter, priorityFilter],
    queryFn: async () => {
      const response = await crmAPI.getMessages({
        page,
        page_size: pageSize,
        status_filter: statusFilter || undefined,
        priority_filter: priorityFilter || undefined,
      });
      return response.data;
    },
  });

  const { data: usersData, isLoading: usersLoading, error: usersError } = useQuery({
    queryKey: ['crm-users-list'],
    queryFn: async () => {
      const response = await crmAPI.getUsers({ page: 1, page_size: 100 });
      return response.data;
    },
  });

  const users = usersData?.items || [];

  const createMessageMutation = useMutation({
    mutationFn: (data: any) => crmAPI.createMessage(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-messages'] });
      showToast('Message sent successfully', 'success');
      setShowComposeModal(false);
      setRecipientIds([]);
      setSubject('');
      setContent('');
      setPriority('medium');
    },
    onError: (error: any) => {
      showToast(error.response?.data?.detail || 'Failed to send message', 'error');
    },
  });

  const deleteMessageMutation = useMutation({
    mutationFn: (id: number) => crmAPI.deleteMessage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-messages'] });
      showToast('Message deleted', 'success');
      setSelectedMessage(null);
    },
    onError: (error: any) => {
      showToast(error.response?.data?.detail || 'Failed to delete message', 'error');
    },
  });

  const handleSendMessage = async () => {
    if (recipientIds.length === 0 || !subject || !content) {
      showToast('Please fill in all fields', 'error');
      return;
    }

    setIsSending(true);
    // Send message to each recipient
    try {
      for (const recipientId of recipientIds) {
        await crmAPI.createMessage({
          recipient_id: recipientId,
          subject,
          content,
          priority,
        });
      }
      queryClient.invalidateQueries({ queryKey: ['crm-messages'] });
      showToast(`Message sent to ${recipientIds.length} recipient(s)`, 'success');
      setShowComposeModal(false);
      setRecipientIds([]);
      setSubject('');
      setContent('');
      setPriority('medium');
    } catch (error: any) {
      showToast(error.response?.data?.detail || 'Failed to send message', 'error');
    } finally {
      setIsSending(false);
    }
  };

  const messages = data?.items || [];
  const total = data?.total || 0;

  const renderPriorityBadge = (priority: string) => (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${priorityStyles[priority] || 'bg-gray-100 text-gray-700'}`}>
      {priority}
    </span>
  );

  const renderStatusBadge = (status: string) => (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold capitalize ${statusStyles[status] || 'bg-gray-100 text-gray-700'}`}>
      {status === 'unread' && <FiMail className="w-3 h-3" />}
      {status === 'read' && <FiCheckCircle className="w-3 h-3" />}
      {status === 'archived' && <FiArchive className="w-3 h-3" />}
      {status}
    </span>
  );

  return (
    <DashboardLayout
      title="Messages"
      breadcrumb={<div className="text-xs text-gray-500">CRM / User Management / Messages</div>}
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">User Messages</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Send and manage messages to users
          </p>
        </div>
        <button
          onClick={() => setShowComposeModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-all"
        >
          <FiSend className="w-4 h-4" />
          <span>New Message</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2">
          <FiFilter className="w-4 h-4 text-gray-500" />
          <select
            value={statusFilter}
            onChange={(e) => {
              setPage(1);
              setStatusFilter(e.target.value);
            }}
            className="bg-transparent text-sm text-gray-700 dark:text-gray-200 focus:outline-none"
          >
            <option value="">All Status</option>
            <option value="unread">Unread</option>
            <option value="read">Read</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        <div className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2">
          <FiFilter className="w-4 h-4 text-gray-500" />
          <select
            value={priorityFilter}
            onChange={(e) => {
              setPage(1);
              setPriorityFilter(e.target.value);
            }}
            className="bg-transparent text-sm text-gray-700 dark:text-gray-200 focus:outline-none"
          >
            <option value="">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>
      </div>

      {/* Messages List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-600">
              <tr>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Recipient
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Subject
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Priority
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Sent
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                    </div>
                  </td>
                </tr>
              ) : messages.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500 dark:text-gray-400">
                    No messages found
                  </td>
                </tr>
              ) : (
                messages.map((message: any) => (
                  <tr
                    key={message.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
                    onClick={() => setSelectedMessage(message)}
                  >
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-medium text-gray-900 dark:text-gray-100">
                          {message.recipient_name || message.recipient?.username || 'Unknown'}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {message.recipient_email || message.recipient?.email || 'N/A'}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-900 dark:text-gray-100">
                      {message.subject}
                    </td>
                    <td className="py-3 px-4">{renderPriorityBadge(message.priority)}</td>
                    <td className="py-3 px-4">{renderStatusBadge(message.status)}</td>
                    <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                      {new Date(message.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm('Delete this message?')) {
                            deleteMessageMutation.mutate(message.id);
                          }
                        }}
                        className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {total > pageSize && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, total)} of {total} messages
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={page * pageSize >= total}
                className="px-3 py-1 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Compose Message Modal */}
      {showComposeModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">New Message</h3>
              <button
                onClick={() => setShowComposeModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Recipients (Select multiple users)
                </label>
                {usersLoading ? (
                  <div className="text-sm text-gray-500 dark:text-gray-400">Loading users...</div>
                ) : usersError ? (
                  <div className="text-sm text-red-600 dark:text-red-400">Failed to load users</div>
                ) : (
                  <div className="border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 p-3 max-h-48 overflow-y-auto">
                    {users.length === 0 ? (
                      <div className="text-sm text-gray-500 dark:text-gray-400">No users available</div>
                    ) : (
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 p-2 hover:bg-gray-50 dark:hover:bg-gray-600 rounded-lg cursor-pointer">
                          <input
                            type="checkbox"
                            checked={recipientIds.length === users.length}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setRecipientIds(users.map((u: any) => u.id));
                              } else {
                                setRecipientIds([]);
                              }
                            }}
                            className="w-4 h-4 text-primary-500 rounded focus:ring-2 focus:ring-primary-500"
                          />
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Select All ({users.length})
                          </span>
                        </label>
                        {users.map((user: any) => (
                          <label 
                            key={user.id}
                            className="flex items-center gap-2 p-2 hover:bg-gray-50 dark:hover:bg-gray-600 rounded-lg cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={recipientIds.includes(user.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setRecipientIds([...recipientIds, user.id]);
                                } else {
                                  setRecipientIds(recipientIds.filter(id => id !== user.id));
                                }
                              }}
                              className="w-4 h-4 text-primary-500 rounded focus:ring-2 focus:ring-primary-500"
                            />
                            <div className="flex-1">
                              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {user.full_name || user.username}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {user.email}
                              </div>
                            </div>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                {recipientIds.length > 0 && (
                  <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    {recipientIds.length} recipient(s) selected
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Message subject"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Priority
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Message
                </label>
                <div className="bg-white dark:bg-gray-700 rounded-xl border border-gray-300 dark:border-gray-600">
                  <ReactQuill
                    theme="snow"
                    value={content}
                    onChange={setContent}
                    modules={quillModules}
                    placeholder="Type your message here..."
                    className="h-64"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setShowComposeModal(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSendMessage}
                disabled={isSending}
                className="px-4 py-2 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
              >
                {isSending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <FiSend className="w-4 h-4" />
                    Send to {recipientIds.length > 0 ? `${recipientIds.length} recipient(s)` : 'recipients'}
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Message Detail Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{selectedMessage.subject}</h3>
                <div className="flex items-center gap-2 mt-2">
                  {renderPriorityBadge(selectedMessage.priority)}
                  {renderStatusBadge(selectedMessage.status)}
                </div>
              </div>
              <button
                onClick={() => setSelectedMessage(null)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-start gap-3 pb-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex-1">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">To:</div>
                  <div className="font-medium text-gray-900 dark:text-gray-100">
                    {selectedMessage.recipient_name || selectedMessage.recipient?.username || 'Unknown'}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {selectedMessage.recipient_email || selectedMessage.recipient?.email || 'N/A'}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Sent:</div>
                  <div className="text-sm text-gray-900 dark:text-gray-100">
                    {new Date(selectedMessage.created_at).toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="prose prose-sm dark:prose-invert max-w-none">
                <div 
                  className="text-gray-800 dark:text-gray-200"
                  dangerouslySetInnerHTML={{ __html: selectedMessage.content }}
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setSelectedMessage(null)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all"
              >
                Close
              </button>
              <button
                onClick={() => {
                  if (confirm('Delete this message?')) {
                    deleteMessageMutation.mutate(selectedMessage.id);
                  }
                }}
                className="px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all inline-flex items-center gap-2"
              >
                <FiTrash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </DashboardLayout>
  );
}
