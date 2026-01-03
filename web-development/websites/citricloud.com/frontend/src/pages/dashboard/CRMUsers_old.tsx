import { useQuery } from '@tanstack/react-query';
import DashboardLayout from '../../components/DashboardLayout';
import { crmAPI } from '../../lib/api';
import { motion } from 'framer-motion';
import { FiUsers, FiShield, FiUserCheck, FiUserX } from 'react-icons/fi';
import { useState } from 'react';

export default function CRMUsers() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const pageSize = 20;

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['crm-users', page, search],
    queryFn: async () => {
      const params: any = { page, page_size: pageSize };
      if (search) params.search = search;
      const response = await crmAPI.getUsers(params);
      return response.data;
    },
    placeholderData: (previousData) => previousData,
  });

  const users = (data as any)?.items || [];
  const total = (data as any)?.total || 0;
  const totalPages = Math.ceil(total / pageSize);

  return (
    <DashboardLayout
      title="Users"
      breadcrumb={<div className="text-xs text-gray-500">CRM / Users</div>}
    >
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Users</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage all users in real time</p>
        </div>
        <input
          type="text"
          placeholder="Search users..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6 rounded-2xl bg-white/80 dark:bg-gray-800/90 border border-white/30 dark:border-gray-700/50 shadow-sm"
      >
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="spinner"></div>
          </div>
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-200">User</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-200">Email</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-200">Role</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-200">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-200">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user: any) => (
                  <tr key={user.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-white/60 dark:hover:bg-gray-700/60 transition-all">
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-lg bg-primary-500/10 flex items-center justify-center">
                          <FiUsers className="text-primary-500" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-800 dark:text-gray-100">{user.username}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{user.full_name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-300">{user.email}</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-sm font-medium">
                        <FiShield className="w-3 h-3" />
                        <span className="capitalize">{user.role.replace('_', ' ')}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {user.is_active ? (
                        <span className="px-3 py-1 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm font-medium">
                          Active
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-sm font-medium">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <button className="text-primary-500 hover:text-primary-600 font-medium">
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {/* Pagination */}
            <div className="flex justify-between items-center mt-6">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Page {page} of {totalPages} ({total} users)
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page === totalPages}
                  className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </DashboardLayout>
  );
}
