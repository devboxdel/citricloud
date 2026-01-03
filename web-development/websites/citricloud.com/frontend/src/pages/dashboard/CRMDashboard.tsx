import { useQuery } from '@tanstack/react-query';
import DashboardLayout from '../../components/DashboardLayout';
import { crmAPI } from '../../lib/api';
import { motion } from 'framer-motion';
import { FiUsers, FiUserCheck, FiUserX, FiShield, FiX } from 'react-icons/fi';
import { useLocation } from 'react-router-dom';
import { lazy, Suspense, useState } from 'react';


const CRMRoles = lazy(() => import('./CRMRoles'));
const CRMTickets = lazy(() => import('./CRMTickets'));
const CRMPipeline = lazy(() => import('./CRMPipeline'));
const CRMCampaigns = lazy(() => import('./CRMCampaigns'));
const CRMReports = lazy(() => import('./CRMReports'));
const CRMUsers = lazy(() => import('./CRMUsers'));
const CRMMessages = lazy(() => import('./CRMMessages'));
const MarketingTemplateBuilder = lazy(() => import('./MarketingTemplateBuilder'));
const ChatSupport = lazy(() => import('./ChatSupport'));

const ROLE_COLORS: Record<string, string> = {
  blue: 'bg-blue-500',
  red: 'bg-red-500',
  green: 'bg-green-500',
  purple: 'bg-purple-500',
  yellow: 'bg-yellow-500',
  pink: 'bg-pink-500',
  indigo: 'bg-indigo-500',
  teal: 'bg-teal-500',
  cyan: 'bg-cyan-500',
  orange: 'bg-orange-500',
  gray: 'bg-gray-500',
  amber: 'bg-amber-500',
  lime: 'bg-lime-500',
  emerald: 'bg-emerald-500',
  sky: 'bg-sky-500',
  fuchsia: 'bg-fuchsia-500',
  violet: 'bg-violet-500',
  rose: 'bg-rose-500',
};

const ROLE_TEXT_COLORS: Record<string, string> = {
  blue: 'text-blue-700 dark:text-blue-400',
  red: 'text-red-700 dark:text-red-400',
  green: 'text-green-700 dark:text-green-400',
  purple: 'text-purple-700 dark:text-purple-400',
  yellow: 'text-yellow-700 dark:text-yellow-400',
  pink: 'text-pink-700 dark:text-pink-400',
  indigo: 'text-indigo-700 dark:text-indigo-400',
  teal: 'text-teal-700 dark:text-teal-400',
  cyan: 'text-cyan-700 dark:text-cyan-400',
  orange: 'text-orange-700 dark:text-orange-400',
  gray: 'text-gray-700 dark:text-gray-400',
  amber: 'text-amber-700 dark:text-amber-400',
  lime: 'text-lime-700 dark:text-lime-400',
  emerald: 'text-emerald-700 dark:text-emerald-400',
  sky: 'text-sky-700 dark:text-sky-400',
  fuchsia: 'text-fuchsia-700 dark:text-fuchsia-400',
  violet: 'text-violet-700 dark:text-violet-400',
  rose: 'text-rose-700 dark:text-rose-400',
};

const ROLE_BG_COLORS: Record<string, string> = {
  blue: 'bg-blue-100 dark:bg-blue-900/30',
  red: 'bg-red-100 dark:bg-red-900/30',
  green: 'bg-green-100 dark:bg-green-900/30',
  purple: 'bg-purple-100 dark:bg-purple-900/30',
  yellow: 'bg-yellow-100 dark:bg-yellow-900/30',
  pink: 'bg-pink-100 dark:bg-pink-900/30',
  indigo: 'bg-indigo-100 dark:bg-indigo-900/30',
  teal: 'bg-teal-100 dark:bg-teal-900/30',
  cyan: 'bg-cyan-100 dark:bg-cyan-900/30',
  orange: 'bg-orange-100 dark:bg-orange-900/30',
  gray: 'bg-gray-100 dark:bg-gray-900/30',
  amber: 'bg-amber-100 dark:bg-amber-900/30',
  lime: 'bg-lime-100 dark:bg-lime-900/30',
  emerald: 'bg-emerald-100 dark:bg-emerald-900/30',
  sky: 'bg-sky-100 dark:bg-sky-900/30',
  fuchsia: 'bg-fuchsia-100 dark:bg-fuchsia-900/30',
  violet: 'bg-violet-100 dark:bg-violet-900/30',
  rose: 'bg-rose-100 dark:bg-rose-900/30',
};

export default function CRMDashboard() {
  const location = useLocation();
  const [editingUser, setEditingUser] = useState<any>(null);
  const [editForm, setEditForm] = useState({ full_name: '', phone: '', role: '' });

  // Always call hooks first (Rules of Hooks - must be called in same order every render)
  const { data: users, isLoading, error, refetch } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await crmAPI.getUsers({ page: 1, page_size: 20 });
      return response.data;
    },
    retry: 1,
    staleTime: 0,
  });

  const { data: rolesData } = useQuery({
    queryKey: ['crm-roles'],
    queryFn: async () => {
      const response = await crmAPI.getRoles({ page: 1, page_size: 100 });
      return response.data;
    },
  });

  const { data: stats, error: statsError } = useQuery({
    queryKey: ['crm-stats'],
    queryFn: async () => {
      const response = await crmAPI.getStats();
      return response.data;
    },
    retry: 1,
    staleTime: 0,
  });

  const roles = (rolesData as any)?.items || [];

  const getRoleInfo = (roleKey: string) => {
    const role = roles.find((r: any) => r.role_key === roleKey);
    return role || { name: roleKey.replace('_', ' '), color: 'purple' };
  };

  const handleEditUser = (user: any) => {
    setEditingUser(user);
    setEditForm({
      full_name: user.full_name || '',
      phone: user.phone || '',
      role: user.role || 'USER'
    });
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await crmAPI.updateUser(editingUser.id, editForm);
      setEditingUser(null);
      refetch();
    } catch (error) {
      console.error('Failed to update user:', error);
      alert('Failed to update user');
    }
  };

  const statsCards = [
    {
      title: 'Total Users',
      value: stats?.total_users || 0,
      icon: <FiUsers className="w-6 h-6" />,
      color: 'bg-blue-500',
    },
    {
      title: 'Active Users',
      value: stats?.active_users || 0,
      icon: <FiUserCheck className="w-6 h-6" />,
      color: 'bg-green-500',
    },
    {
      title: 'Inactive Users',
      value: stats?.inactive_users || 0,
      icon: <FiUserX className="w-6 h-6" />,
      color: 'bg-red-500',
    },
  ];

  // Route to sub-pages (after all hooks)
  if (location.pathname.includes('/users')) {
    return (
      <Suspense fallback={<div className="flex justify-center items-center h-screen"><div className="spinner"></div></div>}>
        <CRMUsers />
      </Suspense>
    );
  }
  if (location.pathname.includes('/roles')) {
    return (
      <Suspense fallback={<div className="flex justify-center items-center h-screen"><div className="spinner"></div></div>}>
        <CRMRoles />
      </Suspense>
    );
  }
  if (location.pathname.includes('/messages')) {
    return (
      <Suspense fallback={<div className="flex justify-center items-center h-screen"><div className="spinner"></div></div>}>
        <CRMMessages />
      </Suspense>
    );
  }
  if (location.pathname.includes('/tickets')) {
    return (
      <Suspense fallback={<div className="flex justify-center items-center h-screen"><div className="spinner"></div></div>}>
        <CRMTickets />
      </Suspense>
    );
  }
  if (location.pathname.includes('/pipeline')) {
    return (
      <Suspense fallback={<div className="flex justify-center items-center h-screen"><div className="spinner"></div></div>}>
        <CRMPipeline />
      </Suspense>
    );
  }
  if (location.pathname.includes('/campaigns')) {
    return (
      <Suspense fallback={<div className="flex justify-center items-center h-screen"><div className="spinner"></div></div>}>
        <CRMCampaigns />
      </Suspense>
    );
  }
  if (location.pathname.includes('/marketing-template-builder')) {
    return (
      <Suspense fallback={<div className="flex justify-center items-center h-screen"><div className="spinner"></div></div>}>
        <MarketingTemplateBuilder />
      </Suspense>
    );
  }
  if (location.pathname.includes('/chat-support')) {
    return (
      <Suspense fallback={<div className="flex justify-center items-center h-screen"><div className="spinner"></div></div>}>
        <ChatSupport />
      </Suspense>
    );
  }
  if (location.pathname.includes('/reports')) {
    return (
      <Suspense fallback={<div className="flex justify-center items-center h-screen"><div className="spinner"></div></div>}>
        <CRMReports />
      </Suspense>
    );
  }

  return (
    <DashboardLayout
      title="CRM Dashboard"
      breadcrumb={<div className="text-xs text-gray-500">Customer Relations</div>}
    >
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {statsCards.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass-card p-6 rounded-2xl bg-white/80 dark:bg-gray-800/90 border border-white/30 dark:border-gray-700/50 shadow-sm dark:shadow-[0_0_0_1px_rgba(255,255,255,0.05)]"
          >
            <div className="flex items-center space-x-4">
              <div className={`w-12 h-12 rounded-xl ${stat.color} flex items-center justify-center text-white`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-300 text-sm">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{stat.value}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Users Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card p-6 rounded-2xl bg-white/80 dark:bg-gray-800/90 border border-white/30 dark:border-gray-700/50 shadow-sm dark:shadow-[0_0_0_1px_rgba(255,255,255,0.05)]"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Users</h2>
          <button className="glass-button px-6 py-2 rounded-xl text-white font-medium">
            Add User
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="spinner"></div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600 dark:text-red-400 mb-4">
              Failed to load users: {error instanceof Error ? error.message : String(error)}
            </p>
            <button 
              onClick={() => refetch()}
              className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-all"
            >
              Retry
            </button>
          </div>
        ) : !users?.items || users.items.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            No users found
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
                {users?.items?.map((user: any) => (
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
                      {(() => {
                        const roleInfo = getRoleInfo(user.role);
                        const bgColor = ROLE_BG_COLORS[roleInfo.color] || 'bg-purple-100 dark:bg-purple-900/30';
                        const textColor = ROLE_TEXT_COLORS[roleInfo.color] || 'text-purple-700 dark:text-purple-400';
                        return (
                          <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-lg ${bgColor} ${textColor} text-sm font-medium`}>
                            <FiShield className="w-3 h-3" />
                            <span className="capitalize">{roleInfo.name}</span>
                          </span>
                        );
                      })()}
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
                      <button 
                        onClick={() => handleEditUser(user)}
                        className="text-primary-500 hover:text-primary-600 font-medium"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-6"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">Edit User</h3>
              <button
                onClick={() => setEditingUser(null)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleUpdateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={editingUser.username}
                  disabled
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={editingUser.email}
                  disabled
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={editForm.full_name}
                  onChange={e => setEditForm({ ...editForm, full_name: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-primary-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Phone
                </label>
                <input
                  type="text"
                  value={editForm.phone}
                  onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-primary-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Role
                </label>
                <select
                  value={editForm.role}
                  onChange={e => setEditForm({ ...editForm, role: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-primary-500 focus:outline-none"
                >
                  <option value="USER">User</option>
                  <option value="SYSTEM_ADMIN">System Admin</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 rounded-lg bg-primary-500 text-white hover:bg-primary-600 transition-colors"
                >
                  Update User
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </DashboardLayout>
  );
}
