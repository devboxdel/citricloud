import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiBell, 
  FiCheck, 
  FiX, 
  FiInfo, 
  FiAlertCircle, 
  FiAlertTriangle,
  FiCheckCircle,
  FiMessageSquare,
  FiSettings,
  FiTrash2,
  FiArchive
} from 'react-icons/fi';
import { notificationAPI } from '../lib/api';

// Notification types
type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'message' | 'alert' | 'system';
type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';

interface Notification {
  id: number;
  user_id?: number;
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  link?: string;
  icon?: string;
  is_read: boolean;
  is_archived: boolean;
  action_label?: string;
  action_url?: string;
  expires_at?: string;
  created_at: string;
  read_at?: string;
}

// Get icon based on notification type
const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case 'success':
      return <FiCheckCircle className="w-5 h-5 text-green-500" />;
    case 'error':
      return <FiAlertCircle className="w-5 h-5 text-red-500" />;
    case 'warning':
      return <FiAlertTriangle className="w-5 h-5 text-yellow-500" />;
    case 'message':
      return <FiMessageSquare className="w-5 h-5 text-blue-500" />;
    case 'alert':
      return <FiAlertTriangle className="w-5 h-5 text-orange-500" />;
    default:
      return <FiInfo className="w-5 h-5 text-gray-500 dark:text-gray-400" />;
  }
};

// Get color classes based on priority
const getPriorityColor = (priority: NotificationPriority) => {
  switch (priority) {
    case 'urgent':
      return 'border-l-4 border-red-500 bg-red-50 dark:bg-red-900/10';
    case 'high':
      return 'border-l-4 border-orange-500 bg-orange-50 dark:bg-orange-900/10';
    case 'normal':
      return 'border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/10';
    default:
      return 'border-l-4 border-gray-300 dark:border-gray-700';
  }
};

// Format relative time
const formatRelativeTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return date.toLocaleDateString();
};

interface NotificationBellProps {
  isOpen?: boolean;
  setIsOpen?: (open: boolean) => void;
}

export default function NotificationBell({ isOpen: externalIsOpen, setIsOpen: externalSetIsOpen }: NotificationBellProps = {}) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  
  // Use external state if provided, otherwise use internal state
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const setIsOpen = externalSetIsOpen || setInternalIsOpen;

  // Fetch notifications - only if user is authenticated
  const { data: notifications = [], isLoading, isError: notificationsError } = useQuery({
    queryKey: ['notifications', filter],
    queryFn: async () => {
      try {
        const response = await notificationAPI.getNotifications({ 
          unread_only: filter === 'unread', 
          limit: 20 
        });
        return response.data || [];
      } catch (error: any) {
        // Silently fail for unauthenticated users
        if (error?.response?.status === 401) {
          return [];
        }
        throw error;
      }
    },
    refetchInterval: 30000, // Refetch every 30 seconds
    enabled: true,
    retry: false,
  });

  // Fetch unread count - only if user is authenticated
  const { data: countData, isError: countError } = useQuery({
    queryKey: ['notification-count'],
    queryFn: async () => {
      try {
        const response = await notificationAPI.getCount();
        return response.data;
      } catch (error: any) {
        // Silently fail for unauthenticated users
        if (error?.response?.status === 401) {
          return { unread_count: 0 };
        }
        throw error;
      }
    },
    refetchInterval: 30000,
    retry: false,
  });

  const unreadCount = countData?.unread_count || 0;

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: number) => {
      await notificationAPI.updateNotification(notificationId, { is_read: true });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notification-count'] });
    },
  });

  // Mark all as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      await notificationAPI.markAllAsRead();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notification-count'] });
    },
  });

  // Delete notification mutation
  const deleteNotificationMutation = useMutation({
    mutationFn: async (notificationId: number) => {
      await notificationAPI.deleteNotification(notificationId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notification-count'] });
    },
  });

  // Portal handles click-outside via overlay

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.is_read) {
      markAsReadMutation.mutate(notification.id);
    }
    if (notification.link) {
      window.location.href = notification.link;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
        aria-label="Notifications"
      >
        <FiBell className="w-5 h-5 text-gray-700 dark:text-gray-200" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-600 text-white text-xs font-bold flex items-center justify-center"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </motion.span>
        )}
      </button>

      {/* Dropdown Panel - Portal */}
      {isOpen && createPortal(
        <div className="fixed inset-0 z-[9998]" onClick={(e) => { e.stopPropagation(); setIsOpen(false); }} />,
        document.body
      )}
      {isOpen && createPortal(
        <motion.div
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.2 }}
          className="fixed right-2 sm:right-4 md:right-20 top-[58px] sm:top-[62px] md:top-[84px] w-96 max-w-[calc(100vw-2rem)] bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-800 z-[9999] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Notifications
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                aria-label="Close Notifications"
                title="Close Notifications"
                className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
              >
                <FiX className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`flex-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  filter === 'all'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`flex-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  filter === 'unread'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                Unread
              </button>
            </div>
          </div>

          {/* Notifications List */}
          {isLoading ? (
            <div className="p-4 text-center text-gray-600 dark:text-gray-400">
              Loading notifications...
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center text-gray-600 dark:text-gray-400">
              <FiBell className="w-12 h-12 mx-auto mb-2 opacity-20" />
              <p>No notifications</p>
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto">
              {notifications.map((notification: Notification) => (
                <motion.div
                  key={notification.id}
                  layout
                  className={`p-4 border-b border-gray-100 dark:border-gray-800 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all ${getPriorityColor(notification.priority)}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex gap-3">
                    {/* Icon */}
                    <div className="flex-shrink-0">
                      {getNotificationIcon(notification.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className={`text-sm font-semibold ${
                          !notification.is_read 
                            ? 'text-gray-900 dark:text-white' 
                            : 'text-gray-700 dark:text-gray-300'
                        }`}>
                          {notification.title}
                        </h4>
                        {!notification.is_read && (
                          <span className="flex-shrink-0 w-2 h-2 rounded-full bg-blue-600" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                        {notification.message}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500 dark:text-gray-500">
                          {formatRelativeTime(notification.created_at)}
                        </span>
                        <div className="flex gap-1">
                          {!notification.is_read && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                markAsReadMutation.mutate(notification.id);
                              }}
                              className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
                              title="Mark as read"
                            >
                              <FiCheck className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotificationMutation.mutate(notification.id);
                            }}
                            className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/20 transition-all"
                            title="Delete"
                          >
                            <FiTrash2 className="w-3.5 h-3.5 text-red-500" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
              <a
                href="/notifications"
                className="block text-center text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-all"
                onClick={() => setIsOpen(false)}
              >
                View all notifications
              </a>
            </div>
          )}
        </motion.div>,
        document.body
      )}
    </div>
  );
}
