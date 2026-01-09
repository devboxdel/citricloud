import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Mail, Plus, Key, Forward } from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardLayout from '../components/DashboardLayout';
import { hostingAPI } from '../lib/api';

const Email: React.FC = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['email-accounts'],
    queryFn: () => hostingAPI.getEmailAccounts(),
  });

  const createMutation = useMutation({
    mutationFn: hostingAPI.createEmailAccount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-accounts'] });
      toast.success('Email account created!');
      setShowCreateModal(false);
    },
    onError: () => {
      toast.error('Failed to create email account');
    },
  });

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    createMutation.mutate({
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      quota: parseInt(formData.get('quota') as string),
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Email</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage email accounts and forwarders
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus size={20} />
            <span>Create Account</span>
          </button>
        </div>

        {/* Email Accounts */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {data?.items?.map((account: any, index: number) => (
              <motion.div
                key={account.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="glass-card p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 rounded-xl bg-blue-600 text-white">
                      <Mail size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold">{account.email}</h3>
                      <p className="text-sm text-gray-500">Email Account</p>
                    </div>
                  </div>
                  <div className="px-3 py-1 bg-green-100 text-green-600 rounded-full text-xs font-medium">
                    Active
                  </div>
                </div>

                <div className="space-y-2 mb-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Quota:</span>
                    <span className="font-medium">{account.quota} MB</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Used:</span>
                    <span className="font-medium">{account.used || 0} MB</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Created:</span>
                    <span className="text-xs">
                      {new Date(account.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Usage Bar */}
                <div className="mb-4">
                  <div className="w-full bg-gray-200 dark:bg-gray-900 rounded-full h-2">
                    <div
                      className="bg-primary-600 h-2 rounded-full"
                      style={{ width: `${((account.used || 0) / account.quota) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all">
                    <Key size={16} />
                    <span className="text-sm">Change Password</span>
                  </button>
                  <button className="flex items-center justify-center px-4 py-2 bg-purple-50 dark:bg-purple-900/20 text-purple-600 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-all">
                    <Forward size={16} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Email Configuration */}
        <div className="glass-card p-6">
          <h2 className="text-xl font-bold mb-4">Email Configuration</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2">Incoming Server (IMAP)</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Server:</span>
                  <span className="font-mono">mail.citricloud.com</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Port:</span>
                  <span className="font-mono">993</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Security:</span>
                  <span className="font-mono">SSL/TLS</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Outgoing Server (SMTP)</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Server:</span>
                  <span className="font-mono">mail.citricloud.com</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Port:</span>
                  <span className="font-mono">587</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Security:</span>
                  <span className="font-mono">STARTTLS</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card p-6 max-w-md w-full"
            >
              <h2 className="text-2xl font-bold mb-6">Create Email Account</h2>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    required
                    className="input-field"
                    placeholder="user@yourdomain.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Password</label>
                  <input
                    type="password"
                    name="password"
                    required
                    minLength={8}
                    className="input-field"
                    placeholder="Strong password"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Quota (MB)</label>
                  <select name="quota" required className="input-field">
                    <option value="1000">1 GB</option>
                    <option value="2000">2 GB</option>
                    <option value="5000">5 GB</option>
                    <option value="10000">10 GB</option>
                    <option value="0">Unlimited</option>
                  </select>
                </div>
                <div className="flex space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 px-6 py-3 rounded-xl border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createMutation.isPending}
                    className="flex-1 px-6 py-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white transition-all disabled:opacity-50"
                  >
                    {createMutation.isPending ? 'Creating...' : 'Create'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Email;
