import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Layout, Plus, ExternalLink, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardLayout from '../components/DashboardLayout';
import { hostingAPI } from '../lib/api';

const ControlPanels: React.FC = () => {
  const [showInstallModal, setShowInstallModal] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['control-panels'],
    queryFn: () => hostingAPI.getControlPanels(),
  });

  const installMutation = useMutation({
    mutationFn: hostingAPI.installControlPanel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['control-panels'] });
      toast.success('Control panel installation started!');
      setShowInstallModal(false);
    },
    onError: () => {
      toast.error('Failed to install control panel');
    },
  });

  const handleInstall = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    installMutation.mutate({
      server_id: parseInt(formData.get('server_id') as string),
      panel_type: formData.get('panel_type') as string,
    });
  };

  const panels = [
    {
      name: 'cPanel',
      description: 'Industry-leading control panel with WHM',
      icon: '🔧',
      color: 'bg-orange-600',
    },
    {
      name: 'Plesk',
      description: 'Modern control panel for web hosting',
      icon: '⚙️',
      color: 'bg-blue-600',
    },
    {
      name: 'DirectAdmin',
      description: 'Lightweight and fast control panel',
      icon: '🎛️',
      color: 'bg-green-600',
    },
    {
      name: 'Webmin',
      description: 'Free web-based system administration',
      icon: '🖥️',
      color: 'bg-purple-600',
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Control Panels</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage your server control panels
            </p>
          </div>
          <button
            onClick={() => setShowInstallModal(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus size={20} />
            <span>Install Panel</span>
          </button>
        </div>

        {/* Available Panels */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Available Control Panels</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {panels.map((panel, index) => (
              <motion.div
                key={panel.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="glass-card p-6 text-center hover:shadow-2xl transition-all duration-200 cursor-pointer group"
              >
                <div
                  className={`w-16 h-16 mx-auto mb-4 rounded-2xl ${panel.color} flex items-center justify-center text-3xl group-hover:scale-110 transition-transform duration-200`}
                >
                  {panel.icon}
                </div>
                <h3 className="text-xl font-bold mb-2">{panel.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {panel.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Installed Panels */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Installed Panels</h2>
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {data?.items?.map((panel: any, index: number) => (
                <motion.div
                  key={panel.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="glass-card p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-3 rounded-xl bg-blue-600 text-white">
                        <Layout size={24} />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">{panel.panel_type}</h3>
                        <p className="text-sm text-gray-500">Server: {panel.server_name}</p>
                      </div>
                    </div>
                    <div className="px-3 py-1 bg-green-100 text-green-600 rounded-full text-xs font-medium">
                      Active
                    </div>
                  </div>

                  <div className="space-y-2 mb-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Version:</span>
                      <span className="font-medium">{panel.version}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">URL:</span>
                      <span className="font-mono text-xs truncate">{panel.url}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Installed:</span>
                      <span className="text-xs">
                        {new Date(panel.installed_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <a
                      href={panel.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all"
                    >
                      <ExternalLink size={16} />
                      <span className="text-sm">Open Panel</span>
                    </a>
                    <button className="flex items-center justify-center px-4 py-2 bg-purple-50 dark:bg-purple-900/20 text-purple-600 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-all">
                      <Shield size={16} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Features */}
        <div className="glass-card p-6">
          <h2 className="text-xl font-bold mb-4">Control Panel Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-semibold mb-2">Easy Management</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Manage your websites, domains, and email through an intuitive interface.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Security Built-in</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                SSL certificates, firewalls, and security tools included out of the box.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">One-Click Apps</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Install popular applications like WordPress, Joomla, and more with one click.
              </p>
            </div>
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
              <h2 className="text-2xl font-bold mb-6">Install Control Panel</h2>
              <form onSubmit={handleInstall} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Select Server</label>
                  <select name="server_id" required className="input-field">
                    <option value="">Choose a server...</option>
                    <option value="1">web-server-01</option>
                    <option value="2">web-server-02</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Control Panel</label>
                  <select name="panel_type" required className="input-field">
                    <option value="">Choose a panel...</option>
                    <option value="cPanel">cPanel with WHM</option>
                    <option value="Plesk">Plesk</option>
                    <option value="DirectAdmin">DirectAdmin</option>
                    <option value="Webmin">Webmin (Free)</option>
                  </select>
                </div>
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    ⚠️ Installation may take 10-30 minutes depending on the panel.
                  </p>
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

export default ControlPanels;
