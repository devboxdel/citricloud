import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  FiAlertTriangle,
  FiCheckCircle,
  FiEye,
  FiX,
  FiRefreshCw,
  FiLayers
} from 'react-icons/fi';
import DashboardLayout from '../../components/DashboardLayout';
import { cmsAPI } from '../../lib/api';
import { useToast } from '../../components/Toast';

const statusStyles: Record<string, string> = {
  open: 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300',
  in_review: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300',
  resolved: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300',
  dismissed: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300',
};

export default function CMSReports() {
  const pageSize = 20;
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'in_review' | 'resolved' | 'dismissed'>('all');
  const [postType, setPostType] = useState<'all' | 'blog' | 'news'>('all');
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['cms-reports', page, statusFilter, postType],
    queryFn: async () => {
      const response = await cmsAPI.getBlogReports({
        page,
        page_size: pageSize,
        status_filter: statusFilter === 'all' ? undefined : statusFilter,
        post_type: postType === 'all' ? undefined : postType,
      });
      return response.data;
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      cmsAPI.updateBlogReport(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms-reports'] });
      showToast('Report updated', 'success');
    },
    onError: (error: any) => {
      console.error('Update report error', error);
      showToast(error.response?.data?.detail || 'Failed to update report', 'error');
    },
  });

  const reports = data?.items || [];
  const total = data?.total || 0;

  const renderStatusBadge = (status: string) => (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${statusStyles[status] || 'bg-gray-100 text-gray-700'}`}>
      {status.replace('_', ' ')}
    </span>
  );

  const renderTypeBadge = (type: string) => (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
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

  const statusActionButtons = (report: any) => (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => updateStatusMutation.mutate({ id: report.id, status: 'in_review' })}
        disabled={updateStatusMutation.isPending}
        className="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-semibold bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition disabled:opacity-60"
      >
        <FiEye className="w-4 h-4" /> Review
      </button>
      <button
        onClick={() => updateStatusMutation.mutate({ id: report.id, status: 'resolved' })}
        disabled={updateStatusMutation.isPending}
        className="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-semibold bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/50 transition disabled:opacity-60"
      >
        <FiCheckCircle className="w-4 h-4" /> Resolve
      </button>
      <button
        onClick={() => updateStatusMutation.mutate({ id: report.id, status: 'dismissed' })}
        disabled={updateStatusMutation.isPending}
        className="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition disabled:opacity-60"
      >
        <FiX className="w-4 h-4" /> Dismiss
      </button>
    </div>
  );

  return (
    <DashboardLayout
      title="Reports & Violations"
      breadcrumb={<div className="text-xs text-gray-500">CMS / Blog / Reports</div>}
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Reports & Violations</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            When users report comments from the website or mobile apps, they appear here for investigation.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => queryClient.invalidateQueries({ queryKey: ['cms-reports'] })}
            className="px-3 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
            title="Refresh"
          >
            <FiRefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
          </button>
          <div className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2">
            <FiAlertTriangle className="w-4 h-4 text-gray-500" />
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
              <option value="open">Open</option>
              <option value="in_review">In Review</option>
              <option value="resolved">Resolved</option>
              <option value="dismissed">Dismissed</option>
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
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-200">Comment</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-200">Reason</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-200">Reporter</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-200">Platform</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-200">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-200">Actions</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report: any) => (
                  <tr key={report.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-white/70 dark:hover:bg-gray-700/50 transition">
                    <td className="py-3 px-4 align-top">
                      <div className="flex flex-col gap-1">
                        <div className="font-semibold text-gray-900 dark:text-gray-50">{report.post_title || 'Unknown Post'}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{report.post_slug ? `/${report.post_slug}` : '—'}</div>
                        {renderTypeBadge(report.post_type)}
                      </div>
                    </td>
                    <td className="py-3 px-4 align-top">
                      <p className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed line-clamp-3">
                        {report.comment_content || 'Comment removed'}
                      </p>
                    </td>
                    <td className="py-3 px-4 align-top">
                      <div className="text-sm text-gray-800 dark:text-gray-100 font-semibold flex items-center gap-2">
                        <FiAlertTriangle className="w-4 h-4 text-amber-500" /> {report.reason || '—'}
                      </div>
                      {report.details && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{report.details}</p>
                      )}
                    </td>
                    <td className="py-3 px-4 align-top">
                      <div className="font-medium text-gray-800 dark:text-gray-100">{report.reporter_name || 'Anonymous'}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{report.reporter_email || 'N/A'}</div>
                    </td>
                    <td className="py-3 px-4 align-top">{renderPlatformBadge(report.platform)}</td>
                    <td className="py-3 px-4 align-top">{renderStatusBadge(report.status)}</td>
                    <td className="py-3 px-4 align-top">
                      {statusActionButtons(report)}
                    </td>
                  </tr>
                ))}
                {reports.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                      No reports found for this filter.
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
              Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, total)} of {total} reports
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
