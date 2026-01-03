import { useQuery } from '@tanstack/react-query';
import DashboardLayout from '../../components/DashboardLayout';
import { cmsAPI } from '../../lib/api';
import { motion } from 'framer-motion';
import { FiFileText, FiPlus, FiEdit, FiTrash2, FiEye } from 'react-icons/fi';
import { useState } from 'react';

export default function CMSPages() {
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const { data: pagesData, isLoading } = useQuery({
    queryKey: ['cms-pages', page],
    queryFn: async () => {
      const response = await cmsAPI.getPages({ page, page_size: pageSize });
      return response.data;
    },
  });

  return (
    <DashboardLayout
      title="Pages"
      breadcrumb={<div className="text-xs text-gray-500">CMS / Pages</div>}
    >
      {/* Header Actions */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">All Pages</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Manage your website pages
          </p>
        </div>
        <button className="glass-button px-6 py-3 rounded-xl text-white font-medium flex items-center gap-2">
          <FiPlus className="w-5 h-5" />
          Create Page
        </button>
      </div>

      {/* Pages Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6 rounded-2xl bg-white/80 dark:bg-gray-800/90 border border-white/30 dark:border-gray-700/50 shadow-sm dark:shadow-[0_0_0_1px_rgba(255,255,255,0.05)]"
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
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-200">Title</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-200">Slug</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-200">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-200">Created</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-200">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pagesData?.items?.map((page: any) => (
                  <tr key={page.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-white/60 dark:hover:bg-gray-700/60 transition-all">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                          <FiFileText className="text-blue-500 dark:text-blue-400" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-800 dark:text-gray-100">{page.title}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-300">/{page.slug}</td>
                    <td className="py-3 px-4">
                      <span className={`px-3 py-1 rounded-lg text-sm font-medium ${
                        page.status === 'published'
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                          : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                      }`}>
                        {page.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-300">
                      {new Date(page.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <button className="p-2 rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all" title="View">
                          <FiEye className="w-4 h-4" />
                        </button>
                        <button className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all" title="Edit">
                          <FiEdit className="w-4 h-4" />
                        </button>
                        <button className="p-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all" title="Delete">
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagesData?.total > pageSize && (
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, pagesData.total)} of {pagesData.total} pages
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={page * pageSize >= pagesData.total}
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
