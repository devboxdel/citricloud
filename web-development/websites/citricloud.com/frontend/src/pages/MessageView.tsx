import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiArchive, FiMail } from 'react-icons/fi';
import DashboardLayout from '../components/DashboardLayout';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { crmAPI } from '../lib/api';
import { useLocation } from 'react-router-dom';

export default function MessageView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const isDashboardContext = new URLSearchParams(location.search).get('context') === 'dashboard' || location.pathname.startsWith('/dashboard');

  const { data: message, isLoading } = useQuery({
    queryKey: ['message', id],
    queryFn: async () => {
      const response = await crmAPI.getMessage(parseInt(id!));
      return response.data;
    },
    enabled: !!id,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => 
      crmAPI.updateMessageStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-messages'] });
      queryClient.invalidateQueries({ queryKey: ['message', id] });
    },
  });

  // Mark as read when viewing
  useQuery({
    queryKey: ['mark-read', id],
    queryFn: async () => {
      if (message?.status === 'unread') {
        await crmAPI.updateMessageStatus(parseInt(id!), 'read');
      }
      return null;
    },
    enabled: !!message && message.status === 'unread',
  });

  const priorityStyles: Record<string, string> = {
    low: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300',
    medium: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
    high: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300',
    urgent: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
  };

  const handleArchive = () => {
    if (message) {
      updateStatusMutation.mutate(
        { id: message.id, status: 'archived' },
        { onSuccess: () => navigate(-1) }
      );
    }
  };

  const content = isDashboardContext ? (
    <DashboardLayout
      title="Message"
      breadcrumb={<div className="text-xs text-gray-500">Profile / Messages / View</div>}
    >
      {renderContent()}
    </DashboardLayout>
  ) : (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          {renderContent()}
        </div>
      </div>
      <Footer />
    </>
  );

  function renderContent() {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
      );
    }

    if (!message) {
      return (
        <div className="text-center py-20">
          <FiMail className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600 dark:text-gray-400">Message not found</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 px-4 py-2 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-all"
          >
            Go Back
          </button>
        </div>
      );
    }

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
        >
          <FiArrowLeft className="w-5 h-5" />
          <span>Back to Messages</span>
        </button>

        {/* Message Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
              {message.subject}
            </h1>
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <span className={`px-3 py-1 rounded-full text-sm font-semibold capitalize ${priorityStyles[message.priority]}`}>
                {message.priority}
              </span>
              {message.status === 'unread' && (
                <span className="px-3 py-1 rounded-full bg-blue-500 text-white text-sm font-semibold">
                  Unread
                </span>
              )}
              {message.status === 'archived' && (
                <span className="px-3 py-1 rounded-full bg-gray-500 text-white text-sm font-semibold">
                  Archived
                </span>
              )}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <p>
                <span className="font-semibold">From:</span> {message.sender_name} ({message.sender_email})
              </p>
              <p>
                <span className="font-semibold">Date:</span> {new Date(message.created_at).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <div 
              className="prose prose-sm dark:prose-invert max-w-none text-gray-800 dark:text-gray-200"
              dangerouslySetInnerHTML={{ __html: message.content }}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
            {message.status !== 'archived' && (
              <button
                onClick={handleArchive}
                disabled={updateStatusMutation.isPending}
                className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-all disabled:opacity-50"
              >
                <FiArchive className="w-4 h-4" />
                Archive
              </button>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  return content;
}
