import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  FiMessageSquare,
  FiAlertTriangle,
  FiCheckCircle,
  FiTrash2,
  FiFilter,
  FiRefreshCw,
  FiLayers
} from 'react-icons/fi';
import DashboardLayout from '../../components/DashboardLayout';
import { cmsAPI } from '../../lib/api';
import { useToast } from '../../components/Toast';

const statusStyles: Record<string, string> = {
  pending: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300',
  approved: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300',
  rejected: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300',
  spam: 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300',
  archived: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
};

export default function CMSComments() {
  const pageSize = 20;
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'spam' | 'archived'>('all');
  const [postType, setPostType] = useState<'all' | 'blog' | 'news'>('all');
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [isAutoRefreshing, setIsAutoRefreshing] = useState(false);
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['cms-comments', page, statusFilter, postType],
    queryFn: async () => {
      setIsAutoRefreshing(true);
      const response = await cmsAPI.getBlogComments({
        page,
        page_size: pageSize,
        status_filter: statusFilter === 'all' ? undefined : statusFilter,
        post_type: postType === 'all' ? undefined : postType,
      });
      setLastRefresh(new Date());
      setTimeout(() => setIsAutoRefreshing(false), 500);
      return response.data;
    },
    refetchInterval: 30000, // Auto-refresh every 30 seconds
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status, comment }: { id: number; status: string; comment?: any }) => {
      // If marking as spam, create a report first
      if (status === 'spam' && comment) {
        try {
          await cmsAPI.submitBlogReport({
            comment_id: id,
            post_id: comment.post_id,
            post_type: comment.post_type || 'blog',
            post_title: comment.post_title,
            post_slug: comment.post_slug,
            reason: 'spam',
            description: `Spam comment from ${comment.author_name || 'Anonymous'}: ${comment.content?.substring(0, 100)}...`,
            reporter_name: 'System',
            reporter_email: 'system@citricloud.com',
          });
        } catch (error) {
          console.error('Failed to create spam report:', error);
          // Continue with status update even if report creation fails
        }
      }
      return cmsAPI.updateBlogComment(id, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms-comments'] });
      queryClient.invalidateQueries({ queryKey: ['cms-reports'] }); // Refresh reports page too
      showToast('Comment updated', 'success');
    },
    onError: (error: any) => {
      console.error('Update comment error', error);
      showToast(error.response?.data?.detail || 'Failed to update comment', 'error');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => cmsAPI.deleteBlogComment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms-comments'] });
      showToast('Comment removed', 'success');
    },
    onError: (error: any) => {
      console.error('Delete comment error', error);
      showToast(error.response?.data?.detail || 'Failed to delete comment', 'error');
    },
  });

  const handleStatusChange = (id: number, status: string, comment?: any) => {
    updateStatusMutation.mutate({ id, status, comment });
  };

  const comments = data?.items || [];
  const total = data?.total || 0;

  const renderStatusBadge = (status: string) => (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${statusStyles[status] || 'bg-gray-100 text-gray-700'}`}>
      {status.replace('_', ' ')}
    </span>
  );

  const renderTypeBadge = (type: string) => (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
      <FiLayers className="w-3.5 h-3.5" />
      {type === 'news' ? 'News' : 'Blog'}
    </span>
  );

  const renderPlatformBadge = (platform: string) => {
    const platformLower = (platform || 'web').toLowerCase();
    const platformStyles: Record<string, { bg: string; text: string; icon: string; label: string }> = {
      web: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-300', icon: '🌐', label: 'Web' },
      ios: { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-700 dark:text-gray-300', icon: '📱', label: 'iOS' },
      android: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-300', icon: '🤖', label: 'Android' },
    };
    const style = platformStyles[platformLower] || platformStyles.web;
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${style.bg} ${style.text}`}>
        <span>{style.icon}</span>
        <span>{style.label}</span>
      </span>
    );
  };

  return (
    <DashboardLayout
      title="Comments"
      breadcrumb={<div className="text-xs text-gray-500">CMS / Blog / Comments</div>}
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">All Comments</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Synced with blog and news posts across web and mobile. Moderate comments and keep threads healthy.
          </p>
          <div className="mt-2 flex items-center gap-2 text-xs">
            <span className={`inline-flex items-center gap-1 ${
              isAutoRefreshing ? 'text-green-500' : 'text-gray-500 dark:text-gray-400'
            }`}>
              <FiRefreshCw className={`w-3 h-3 ${
                isAutoRefreshing ? 'animate-spin' : ''
              }`} />
              Auto-refresh: ON (30s)
            </span>
            <span className="text-gray-400">•</span>
            <span className="text-gray-500 dark:text-gray-400">
              Last refresh: {lastRefresh.toLocaleTimeString()}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => queryClient.invalidateQueries({ queryKey: ['cms-comments'] })}
            className="px-3 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
            title="Refresh"
          >
            <FiRefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
          </button>
          <div className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2">
            <FiFilter className="w-4 h-4 text-gray-500" />
            <select
              value={postType}
              onChange={(e) => {
                setPage(1);
                setPostType(e.target.value as 'all' | 'blog' | 'news');
              }}
              className="bg-transparent text-sm text-gray-700 dark:text-gray-200 focus:outline-none"
            >
              <option value="all">All Types</option>
              <option value="blog">Blog</option>
              <option value="news">News</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => {
                setPage(1);
                setStatusFilter(e.target.value as typeof statusFilter);
              }}
              className="bg-transparent text-sm text-gray-700 dark:text-gray-200 focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="spam">Spam</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6 rounded-2xl bg-white/80 dark:bg-gray-800/90 border border-white/30 dark:border-gray-700/50 shadow-sm"
      >
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
          </div>
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-200">Post</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-200">Author</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-200">Comment</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-200">Platform</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-200">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-200">Submitted</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-200">Actions</th>
                </tr>
              </thead>
              <tbody>
                {comments.map((comment: any) => (
                  <tr key={comment.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-white/70 dark:hover:bg-gray-700/50 transition">
                    <td className="py-3 px-4 align-top">
                      <div className="flex flex-col gap-1">
                        <div className="font-semibold text-gray-900 dark:text-gray-50">{comment.post_title || 'Untitled Post'}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{comment.post_slug ? `/${comment.post_slug}` : '—'}</div>
                        {renderTypeBadge(comment.post_type)}
                      </div>
                    </td>
                    <td className="py-3 px-4 align-top">
                      <div className="font-medium text-gray-800 dark:text-gray-100">{comment.author_name || 'Anonymous'}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{comment.author_email || 'N/A'}</div>
                    </td>
                    <td className="py-3 px-4 align-top">
                      <p className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed line-clamp-3">
                        {comment.content}
                      </p>
                    </td>
                    <td className="py-3 px-4 align-top">{renderPlatformBadge(comment.platform)}</td>
                    <td className="py-3 px-4 align-top">{renderStatusBadge(comment.status)}</td>
                    <td className="py-3 px-4 align-top text-sm text-gray-600 dark:text-gray-300">
                      {comment.created_at ? new Date(comment.created_at).toLocaleString() : '—'}
                    </td>
                    <td className="py-3 px-4 align-top">
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => handleStatusChange(comment.id, 'approved')}
                          disabled={updateStatusMutation.isPending}
                          className="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-semibold bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/50 transition disabled:opacity-60"
                        >
                          <FiCheckCircle className="w-4 h-4" /> Approve
                        </button>
                        <button
                          onClick={() => handleStatusChange(comment.id, 'spam', comment)}
                          disabled={updateStatusMutation.isPending}
                          className="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-semibold bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/50 transition disabled:opacity-60"
                        >
                          <FiAlertTriangle className="w-4 h-4" /> Spam
                        </button>
                        <button
                          onClick={() => handleStatusChange(comment.id, 'rejected')}
                          disabled={updateStatusMutation.isPending}
                          className="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-semibold bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/50 transition disabled:opacity-60"
                        >
                          <FiAlertTriangle className="w-4 h-4" /> Reject
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Delete this comment?')) {
                              deleteMutation.mutate(comment.id);
                            }
                          }}
                          disabled={deleteMutation.isPending}
                          className="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition disabled:opacity-60"
                        >
                          <FiTrash2 className="w-4 h-4" /> Remove
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {comments.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                      No comments found for this filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {total > pageSize && (
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, total)} of {total} comments
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page * pageSize >= total}
                className="px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </DashboardLayout>
  );
}
