import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import DashboardLayout from '../../components/DashboardLayout';
import { crmAPI } from '../../lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { FiShield, FiEdit2, FiTrash2, FiPlus, FiX, FiCheck, FiUsers } from 'react-icons/fi';
import { useState } from 'react';
import { Link } from 'react-router-dom';

interface Role {
  id: number;
  name: string;
  role_key: string;
  description: string;
  is_system_role: boolean;
  color: string;
  user_count: number;
  permissions?: string[];
  created_at: string;
  updated_at: string;
}

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

const DEFAULT_ROLES = [
  { name: 'System Admin', role_key: 'system_admin', description: 'Full system access with all permissions', color: 'red', is_system_role: true },
  { name: 'Developer', role_key: 'developer', description: 'Software development and technical access', color: 'teal', is_system_role: true },
  { name: 'Administrator', role_key: 'administrator', description: 'Administrative access to manage users and settings', color: 'purple', is_system_role: true },
  { name: 'Manager', role_key: 'manager', description: 'Team and project management', color: 'orange', is_system_role: false },
  { name: 'Moderator', role_key: 'moderator', description: 'Content moderation and user management', color: 'yellow', is_system_role: false },
  { name: 'Spectator', role_key: 'spectator', description: 'View-only access to the system', color: 'rose', is_system_role: false },
  { name: 'Subscriber', role_key: 'subscriber', description: 'Subscription user with premium access', color: 'green', is_system_role: false },
  { name: 'Keymaster', role_key: 'keymaster', description: 'Key management and security access', color: 'amber', is_system_role: false },
  { name: 'Editor', role_key: 'editor', description: 'Content editor with publishing rights', color: 'purple', is_system_role: false },
  { name: 'Contributor', role_key: 'contributor', description: 'Content contributor without publishing rights', color: 'teal', is_system_role: false },
  { name: 'Blocked', role_key: 'blocked', description: 'Blocked user with restricted access', color: 'red', is_system_role: false },
  { name: 'Author', role_key: 'author', description: 'Content author who can publish own posts', color: 'indigo', is_system_role: false },
  { name: 'Participant', role_key: 'participant', description: 'Active participant in community activities', color: 'lime', is_system_role: false },
  { name: 'Operator', role_key: 'operator', description: 'System operator with operational access', color: 'indigo', is_system_role: false },
  { name: 'Support', role_key: 'support', description: 'Customer support and assistance', color: 'blue', is_system_role: false },
  { name: 'Finance Manager', role_key: 'finance_manager', description: 'Financial management and oversight', color: 'emerald', is_system_role: false },
  { name: 'Employee', role_key: 'employee', description: 'Standard employee access', color: 'cyan', is_system_role: false },
  { name: 'Accountant', role_key: 'accountant', description: 'Accounting and financial records', color: 'green', is_system_role: false },
  { name: 'Payroll', role_key: 'payroll', description: 'Payroll management and processing', color: 'sky', is_system_role: false },
  { name: 'Receptionist', role_key: 'receptionist', description: 'Front desk and reception duties', color: 'pink', is_system_role: false },
  { name: 'Marketing Assistant', role_key: 'marketing_assistant', description: 'Marketing support and campaigns', color: 'fuchsia', is_system_role: false },
  { name: 'Officer', role_key: 'officer', description: 'Company officer with authority', color: 'violet', is_system_role: false },
  { name: 'User', role_key: 'user', description: 'Standard user access', color: 'blue', is_system_role: false },
  { name: 'Guest', role_key: 'guest', description: 'Guest access with limited permissions', color: 'gray', is_system_role: false },
];

// Available permissions
const AVAILABLE_PERMISSIONS = [
  'users.view', 'users.create', 'users.edit', 'users.delete',
  'roles.view', 'roles.create', 'roles.edit', 'roles.delete',
  'content.view', 'content.create', 'content.edit', 'content.delete', 'content.publish',
  'settings.view', 'settings.edit',
  'reports.view', 'reports.export',
  'tickets.view', 'tickets.create', 'tickets.edit', 'tickets.close',
  'messages.view', 'messages.send',
];

export default function CRMRoles() {
  const queryClient = useQueryClient();
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({ 
    name: '', 
    description: '', 
    color: 'blue',
    permissions: [] as string[]
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const { data: rolesData, isLoading, refetch } = useQuery({
    queryKey: ['crm-roles'],
    queryFn: async () => {
      try {
        const response = await crmAPI.getRoles({ page: 1, page_size: 50 });
        return response.data;
      } catch (error) {
        console.error('Error fetching roles:', error);
        return { items: [], total: 0 };
      }
    },
  });

  const initializeRolesMutation = useMutation({
    mutationFn: () => crmAPI.initializeRoles(),
    onSuccess: async (data) => {
      console.log('Initialize response:', data);
      // Invalidate and refetch
      await queryClient.invalidateQueries({ queryKey: ['crm-roles'] });
      await queryClient.refetchQueries({ queryKey: ['crm-roles'] });
      setSuccessMessage('Default roles initialized successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
    },
    onError: (error: any) => {
      console.error('Initialize error:', error);
      setErrorMessage(error.message || 'Failed to initialize roles');
      setTimeout(() => setErrorMessage(null), 3000);
    },
  });

  const createRoleMutation = useMutation({
    mutationFn: (data: any) => crmAPI.createRole(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-roles'] });
      setIsCreating(false);
      setFormData({ name: '', description: '', color: 'blue', permissions: [] });
      setSuccessMessage('Role created successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
    },
    onError: (error: any) => {
      setErrorMessage(error.message || 'Failed to create role');
      setTimeout(() => setErrorMessage(null), 3000);
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: (data: { id: number; updates: any }) =>
      crmAPI.updateRole(data.id, data.updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-roles'] });
      setEditingRole(null);
      setFormData({ name: '', description: '', color: 'blue', permissions: [] });
      setSuccessMessage('Role updated successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
    },
    onError: (error: any) => {
      setErrorMessage(error.message || 'Failed to update role');
      setTimeout(() => setErrorMessage(null), 3000);
    },
  });

  const deleteRoleMutation = useMutation({
    mutationFn: (id: number) => crmAPI.deleteRole(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-roles'] });
      setSuccessMessage('Role deleted successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
    },
    onError: (error: any) => {
      setErrorMessage(error.message || 'Failed to delete role');
      setTimeout(() => setErrorMessage(null), 3000);
    },
  });

  const roles = rolesData?.items || [];
  const filteredRoles = roles.filter(
    (role: Role) =>
      role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      role.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      role.role_key.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreate = () => {
    setIsCreating(true);
    setFormData({ name: '', description: '', color: 'blue', permissions: [] });
  };

  const handleEdit = (role: Role) => {
    setEditingRole(role);
    // Ensure permissions is always an array
    let permissionsArray: string[] = [];
    if (Array.isArray(role.permissions)) {
      permissionsArray = role.permissions;
    } else if (role.permissions && typeof role.permissions === 'object') {
      // Convert object keys to array if needed
      permissionsArray = Object.keys(role.permissions);
    }
    
    setFormData({
      name: role.name,
      description: role.description,
      color: role.color,
      permissions: permissionsArray,
    });
  };

  const handleSave = () => {
    if (isCreating) {
      createRoleMutation.mutate(formData);
    } else if (editingRole) {
      updateRoleMutation.mutate({
        id: editingRole.id,
        updates: formData,
      });
    }
  };

  const handleCancel = () => {
    setEditingRole(null);
    setIsCreating(false);
    setFormData({ name: '', description: '', color: 'blue', permissions: [] });
  };

  const togglePermission = (permission: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter(p => p !== permission)
        : [...prev.permissions, permission]
    }));
  };

  return (
    <DashboardLayout
      title="Roles Management"
      breadcrumb={<div className="text-xs text-gray-500">CRM / Roles</div>}
    >
      {/* Error and Success Messages */}
      {errorMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="mb-4 p-4 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 rounded-xl"
        >
          {errorMessage}
        </motion.div>
      )}
      {successMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="mb-4 p-4 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 text-green-700 dark:text-green-300 rounded-xl"
        >
          {successMessage}
        </motion.div>
      )}

      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Roles & Permissions</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage user roles and access levels</p>
        </div>
        <div className="flex gap-3">
          {roles.length === 0 && !isLoading && (
            <button
              onClick={() => initializeRolesMutation.mutate()}
              disabled={initializeRolesMutation.isPending}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiShield className="w-5 h-5" />
              {initializeRolesMutation.isPending ? 'Initializing...' : 'Initialize Default Roles'}
            </button>
          )}
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all"
          >
            <FiPlus className="w-5 h-5" />
            Add Role
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search roles by name, description, or role key..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-3 rounded-xl bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Roles Table */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="spinner"></div>
        </div>
      ) : filteredRoles.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-card p-12 rounded-2xl text-center"
        >
          <FiShield className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 dark:text-gray-400">No roles found.</p>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-2xl overflow-hidden bg-white/80 dark:bg-gray-800/90 border border-white/30 dark:border-gray-700/50"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700 dark:text-gray-200 text-sm">Role</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700 dark:text-gray-200 text-sm">Key</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700 dark:text-gray-200 text-sm">Description</th>
                  <th className="text-center py-4 px-6 font-semibold text-gray-700 dark:text-gray-200 text-sm">Users</th>
                  <th className="text-center py-4 px-6 font-semibold text-gray-700 dark:text-gray-200 text-sm">Type</th>
                  <th className="text-center py-4 px-6 font-semibold text-gray-700 dark:text-gray-200 text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRoles.map((role: Role, index: number) => (
                  <motion.tr
                    key={role.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-gray-100 dark:border-gray-800 hover:bg-white/60 dark:hover:bg-gray-700/60 transition-all"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg ${ROLE_COLORS[role.color as keyof typeof ROLE_COLORS] || 'bg-blue-500'} flex items-center justify-center text-white`}>
                          <FiShield className="w-5 h-5" />
                        </div>
                        <span className="font-medium text-gray-800 dark:text-gray-100">{role.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <code className="text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-700 dark:text-gray-300">
                        {role.role_key}
                      </code>
                    </td>
                    <td className="py-4 px-6">
                      <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md">{role.description}</p>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <Link
                        to={`/dashboard/crm/users?role=${role.role_key}`}
                        className="inline-flex items-center justify-center gap-1 px-3 py-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        title={`View ${role.user_count} user${role.user_count !== 1 ? 's' : ''} with ${role.name} role`}
                      >
                        <FiUsers className="w-4 h-4 text-gray-500" />
                        <span className="font-medium text-gray-700 dark:text-gray-300">{role.user_count}</span>
                      </Link>
                    </td>
                    <td className="py-4 px-6 text-center">
                      {role.is_system_role ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300">
                          System
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                          Custom
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEdit(role)}
                          className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                          title="Edit role"
                        >
                          <FiEdit2 className="w-4 h-4" />
                        </button>
                        {!role.is_system_role && (
                          <button
                            onClick={() => {
                              if (confirm(`Delete role "${role.name}"?`)) {
                                deleteRoleMutation.mutate(role.id);
                              }
                            }}
                            disabled={deleteRoleMutation.isPending || role.user_count > 0}
                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title={role.user_count > 0 ? 'Cannot delete role with users' : 'Delete role'}
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Create/Edit Role Modal */}
      <AnimatePresence>
        {(isCreating || editingRole) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={handleCancel}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700"
            >
              <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {isCreating ? 'Create New Role' : 'Edit Role'}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {isCreating ? 'Define a new role with permissions' : 'Modify role details and permissions'}
                  </p>
                </div>
                <button
                  onClick={handleCancel}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <FiX className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Role Details */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Role Name
                      {editingRole?.is_system_role && <span className="ml-2 text-xs text-gray-500">(System Role - Name cannot be changed)</span>}
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      disabled={editingRole?.is_system_role}
                      className="w-full px-4 py-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Color
                    </label>
                    <div className="flex gap-2 flex-wrap">
                      {Object.entries(ROLE_COLORS).map(([colorKey, colorClass]) => (
                        <button
                          key={colorKey}
                          onClick={() => setFormData({ ...formData, color: colorKey })}
                          className={`w-10 h-10 rounded-lg ${colorClass} flex items-center justify-center transition-all ${
                            formData.color === colorKey ? 'ring-2 ring-offset-2 ring-gray-900 dark:ring-white' : ''
                          }`}
                        >
                          {formData.color === colorKey && <FiCheck className="w-5 h-5 text-white" />}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Permissions */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Permissions</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {AVAILABLE_PERMISSIONS.map((permission) => (
                      <label
                        key={permission}
                        className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={formData.permissions.includes(permission)}
                          onChange={() => togglePermission(permission)}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300 font-mono">{permission}</span>
                      </label>
                    ))}
                  </div>
                  {formData.permissions.length > 0 && (
                    <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                      {formData.permissions.length} permission{formData.permissions.length !== 1 ? 's' : ''} selected
                    </p>
                  )}
                </div>
              </div>

              <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-6 flex gap-3">
                <button
                  onClick={handleSave}
                  disabled={updateRoleMutation.isPending}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {updateRoleMutation.isPending ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  onClick={handleCancel}
                  disabled={updateRoleMutation.isPending}
                  className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Statistics */}
      {roles.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8 glass-card p-6 rounded-2xl bg-white/80 dark:bg-gray-800/90"
        >
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Role Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Roles</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{roles.length}</p>
            </div>
            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">System Roles</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                {roles.filter((r: Role) => r.is_system_role).length}
              </p>
            </div>
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">Custom Roles</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                {roles.filter((r: Role) => !r.is_system_role).length}
              </p>
            </div>
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Users</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                {roles.reduce((sum: number, r: Role) => sum + r.user_count, 0)}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </DashboardLayout>
  );
}
