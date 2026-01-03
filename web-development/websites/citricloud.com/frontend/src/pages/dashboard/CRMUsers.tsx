import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import DashboardLayout from '../../components/DashboardLayout';
import { crmAPI } from '../../lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUsers, FiShield, FiUserCheck, FiUserX, FiX, FiSave, FiTrash2, FiAlertTriangle } from 'react-icons/fi';
import { useState } from 'react';

const ROLE_COLORS = {
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

export default function CRMUsers() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [editingUser, setEditingUser] = useState<any>(null);
  const [deletingUser, setDeletingUser] = useState<any>(null);
  const [editFormData, setEditFormData] = useState({ role: '', is_active: true });
  const pageSize = 20;
  const queryClient = useQueryClient();

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

  // Fetch roles for the dropdown
  const { data: rolesData, isLoading: rolesLoading, error: rolesError } = useQuery({
    queryKey: ['crm-roles'],
    queryFn: async () => {
      const response = await crmAPI.getRoles({ page: 1, page_size: 100 });
      console.log('Roles response:', response.data);
      return response.data;
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: any }) => {
      const response = await crmAPI.updateUser(id, updates);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-users'] });
      queryClient.invalidateQueries({ queryKey: ['crm-roles'] });
      setEditingUser(null);
      refetch();
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await crmAPI.deleteUser(id);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-users'] });
      queryClient.invalidateQueries({ queryKey: ['crm-roles'] });
      setDeletingUser(null);
      refetch();
    },
  });

  const users = (data as any)?.items || [];
  const total = (data as any)?.total || 0;
  const totalPages = Math.ceil(total / pageSize);
  const roles = (rolesData as any)?.items || [];
  
  console.log('Roles data:', rolesData);
  console.log('Roles array:', roles);
  console.log('Roles loading:', rolesLoading);
  console.log('Roles error:', rolesError);

  const handleEditClick = (user: any) => {
    setEditingUser(user);
    setEditFormData({
      role: user.role.toLowerCase(), // Convert to lowercase to match role_key format
      is_active: user.is_active,
    });
  };

  const handleSaveUser = () => {
    if (editingUser) {
      updateUserMutation.mutate({
        id: editingUser.id,
        updates: editFormData,
      });
    }
  };

  const handleDeleteUser = () => {
    if (deletingUser) {
      deleteUserMutation.mutate(deletingUser.id);
    }
  };

  const getRoleName = (roleKey: string) => {
    const role = roles.find((r: any) => r.role_key === roleKey);
    return role ? role.name : roleKey.replace('_', ' ');
  };

  const getRoleColor = (roleKey: string) => {
    const role = roles.find((r: any) => r.role_key === roleKey);
    return role?.color || 'blue';
  };

  return (
    <DashboardLayout
      title="Users"
      breadcrumb={<div className="text-xs text-gray-500">CRM / Users</div>}
    >
      {/* Edit User Modal */}
      <AnimatePresence>
        {editingUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setEditingUser(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Edit User</h2>
                <button
                  onClick={() => setEditingUser(null)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <FiX className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    value={editingUser.username}
                    disabled
                    className="w-full px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400"
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
                    className="w-full px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Role
                  </label>
                  {rolesLoading ? (
                    <div className="w-full px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400">
                      Loading roles...
                    </div>
                  ) : rolesError ? (
                    <div className="w-full px-4 py-2 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-600 text-red-600 dark:text-red-400">
                      Error loading roles: {(rolesError as any)?.message || 'Unknown error'}
                    </div>
                  ) : (
                    <select
                      value={editFormData.role}
                      onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select a role</option>
                      {roles.length === 0 ? (
                        <option value="" disabled>No roles available</option>
                      ) : (
                        roles.map((role: any) => (
                          <option key={role.id} value={role.role_key}>
                            {role.name}
                          </option>
                        ))
                      )}
                    </select>
                  )}
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={editFormData.is_active}
                    onChange={(e) => setEditFormData({ ...editFormData, is_active: e.target.checked })}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <label htmlFor="is_active" className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Active User
                  </label>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleSaveUser}
                  disabled={updateUserMutation.isPending}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                >
                  <FiSave className="w-4 h-4" />
                  {updateUserMutation.isPending ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-medium rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
                      <div className="inline-flex items-center space-x-2">
                        <div className={`w-8 h-8 rounded-lg ${ROLE_COLORS[getRoleColor(user.role) as keyof typeof ROLE_COLORS]} flex items-center justify-center text-white`}>
                          <FiShield className="w-4 h-4" />
                        </div>
                        <span className="font-medium text-gray-800 dark:text-gray-100">{getRoleName(user.role)}</span>
                      </div>
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
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => handleEditClick(user)}
                          className="text-primary-500 hover:text-primary-600 font-medium"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => setDeletingUser(user)}
                          className="text-red-500 hover:text-red-600 font-medium"
                        >
                          Remove
                        </button>
                      </div>
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

      {/* Delete Confirmation Dialog */}
      <AnimatePresence>
        {deletingUser && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <FiAlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Remove User</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">This action cannot be undone</p>
                </div>
              </div>

              <div className="mb-6 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                <p className="text-gray-700 dark:text-gray-300">
                  {deletingUser.is_active ? (
                    <>
                      Are you sure you want to <strong>deactivate</strong> <strong>{deletingUser.username}</strong>?
                    </>
                  ) : (
                    <>
                      Are you sure you want to <strong>permanently delete</strong> <strong>{deletingUser.username}</strong>?
                    </>
                  )}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  Email: {deletingUser.email}<br />
                  Role: {getRoleName(deletingUser.role)}<br />
                  Status: {deletingUser.is_active ? 'Active' : 'Inactive'}
                </p>
                {deletingUser.is_active ? (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 italic">
                    The user will be deactivated but not deleted. You can delete them permanently by clicking remove again when they're inactive.
                  </p>
                ) : (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-3 font-semibold">
                    ⚠️ This will permanently delete the user from the database. This action cannot be undone.
                  </p>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setDeletingUser(null)}
                  disabled={deleteUserMutation.isPending}
                  className="flex-1 px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteUser}
                  disabled={deleteUserMutation.isPending}
                  className="flex-1 px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {deleteUserMutation.isPending ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      {deletingUser.is_active ? 'Deactivating...' : 'Deleting...'}
                    </>
                  ) : (
                    <>
                      <FiTrash2 />
                      {deletingUser.is_active ? 'Deactivate' : 'Delete Permanently'}
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
