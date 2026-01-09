import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { FileCode, Plus, ExternalLink, RefreshCw, Plug } from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardLayout from '../components/DashboardLayout';
import { hostingAPI } from '../lib/api';

const WordPressPage: React.FC = () => {
  const [showInstallModal, setShowInstallModal] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['wordpress'],
    queryFn: () => hostingAPI.getWordPressSites(),
  });

  const installMutation = useMutation({
    mutationFn: hostingAPI.installWordPress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wordpress'] });
      toast.success('WordPress installation started!');
      setShowInstallModal(false);
    },
    onError: () => {
      toast.error('Failed to install WordPress');
    },
  });

  const updateMutation = useMutation({
    mutationFn: hostingAPI.updateWordPress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wordpress'] });
      toast.success('WordPress updated successfully!');
    },
    onError: () => {
      toast.error('Failed to update WordPress');
    },
  });

  const handleInstall = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    installMutation.mutate({
      domain: formData.get('domain') as string,
      admin_email: formData.get('admin_email') as string,
      admin_password: formData.get('admin_password') as string,
      title: formData.get('title') as string,
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">WordPress</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage your WordPress installations
            </p>
          </div>
          <button
            onClick={() => setShowInstallModal(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus size={20} />
            <span>Install WordPress</span>
          </button>
        </div>

        {/* WordPress Sites */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {data?.items?.map((site: any, index: number) => (
              <motion.div
                key={site.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="glass-card p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 rounded-xl bg-orange-600 text-white">
                      <FileCode size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold">{site.title}</h3>
                      <p className="text-sm text-gray-500">{site.domain}</p>
                    </div>
                  </div>
                  <div
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      site.status === 'active'
                        ? 'bg-green-100 text-green-600'
                        : 'bg-yellow-100 text-yellow-600'
                    }`}
                  >
                    {site.status}
                  </div>
                </div>

                <div className="space-y-2 mb-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Version:</span>
                    <span className="font-medium">{site.version}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">PHP Version:</span>
                    <span className="font-medium">{site.php_version}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Plugins:</span>
                    <span className="font-medium">{site.plugin_count || 0} installed</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Theme:</span>
                    <span className="font-medium">{site.theme || 'Default'}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <a
                    href={`https://${site.domain}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all"
                  >
                    <ExternalLink size={16} />
                    <span className="text-sm">Visit Site</span>
                  </a>
                  <a
                    href={`https://${site.domain}/wp-admin`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center px-4 py-2 bg-purple-50 dark:bg-purple-900/20 text-purple-600 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-all"
                    title="Admin Panel"
                  >
                    <Plug size={16} />
                  </a>
                  <button
                    onClick={() => updateMutation.mutate(site.id)}
                    className="flex items-center justify-center px-4 py-2 bg-green-50 dark:bg-green-900/20 text-green-600 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-all"
                    title="Update WordPress"
                  >
                    <RefreshCw size={16} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card p-6">
            <h3 className="font-bold mb-2">One-Click Install</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Install WordPress in seconds with automated setup and configuration.
            </p>
          </div>
          <div className="glass-card p-6">
            <h3 className="font-bold mb-2">Auto Updates</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Keep your WordPress core, plugins, and themes up to date automatically.
            </p>
          </div>
          <div className="glass-card p-6">
            <h3 className="font-bold mb-2">SSL Included</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Free SSL certificates automatically configured for all WordPress sites.
            </p>
          </div>
        </div>

        {/* Install Modal */}
        {showInstallModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card p-6 max-w-md w-full"
            >
              <h2 className="text-2xl font-bold mb-6">Install WordPress</h2>
              <form onSubmit={handleInstall} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Domain</label>
                  <select name="domain" required className="input-field">
                    <option value="">Select a domain...</option>
                    <option value="example.com">example.com</option>
                    <option value="myblog.com">myblog.com</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Site Title</label>
                  <input
                    type="text"
                    name="title"
                    required
                    className="input-field"
                    placeholder="My Awesome Site"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Admin Email</label>
                  <input
                    type="email"
                    name="admin_email"
                    required
                    className="input-field"
                    placeholder="admin@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Admin Password</label>
                  <input
                    type="password"
                    name="admin_password"
                    required
                    minLength={8}
                    className="input-field"
                    placeholder="Strong password"
                  />
                </div>
                <div className="flex space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowInstallModal(false)}
                    className="flex-1 px-6 py-3 rounded-xl border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={installMutation.isPending}
                    className="flex-1 px-6 py-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white transition-all disabled:opacity-50"
                  >
                    {installMutation.isPending ? 'Installing...' : 'Install'}
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

export default WordPressPage;
