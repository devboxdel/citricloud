import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Shield, Plus, Download, Key } from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardLayout from '../components/DashboardLayout';
import { hostingAPI } from '../lib/api';

const VPN: React.FC = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['vpns'],
    queryFn: () => hostingAPI.getVPNs(),
  });

  const createMutation = useMutation({
    mutationFn: hostingAPI.createVPN,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vpns'] });
      toast.success('VPN created successfully!');
      setShowCreateModal(false);
    },
    onError: () => {
      toast.error('Failed to create VPN');
    },
  });

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    createMutation.mutate({
      name: formData.get('name') as string,
      protocol: formData.get('protocol') as string,
      location: formData.get('location') as string,
    });
  };

  const handleDownloadConfig = async (id: number) => {
    try {
      const config = await hostingAPI.getVPNConfig(id);
      const blob = new Blob([config.content], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `vpn-config-${id}.ovpn`;
      a.click();
      toast.success('Configuration downloaded!');
    } catch (error) {
      toast.error('Failed to download configuration');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">VPN</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Secure VPN connections for your infrastructure
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus size={20} />
            <span>Create VPN</span>
          </button>
        </div>

        {/* VPN Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data?.items?.map((vpn: any, index: number) => (
              <motion.div
                key={vpn.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="glass-card p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 rounded-xl bg-green-600 text-white">
                      <Shield size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">{vpn.name}</h3>
                      <p className="text-sm text-gray-500">{vpn.protocol}</p>
                    </div>
                  </div>
                  <div className="px-3 py-1 bg-green-100 text-green-600 rounded-full text-xs font-medium">
                    Active
                  </div>
                </div>

                <div className="space-y-2 mb-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Location:</span>
                    <span className="font-medium">{vpn.location}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Server IP:</span>
                    <span className="font-mono text-xs">{vpn.server_ip}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Created:</span>
                    <span className="text-xs">
                      {new Date(vpn.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleDownloadConfig(vpn.id)}
                    className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all"
                  >
                    <Download size={16} />
                    <span className="text-sm">Config</span>
                  </button>
                  <button className="flex items-center justify-center px-4 py-2 bg-purple-50 dark:bg-purple-900/20 text-purple-600 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-all">
                    <Key size={16} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Info Section */}
        <div className="glass-card p-6">
          <h2 className="text-xl font-bold mb-4">VPN Setup Instructions</h2>
          <div className="space-y-4 text-sm text-gray-600 dark:text-gray-400">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                1. Download Configuration
              </h3>
              <p>Click the "Config" button to download your VPN configuration file.</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                2. Install OpenVPN Client
              </h3>
              <p>Install OpenVPN on your device from the official website.</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                3. Import Configuration
              </h3>
              <p>Import the downloaded .ovpn file into your OpenVPN client.</p>
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
              <h2 className="text-2xl font-bold mb-6">Create VPN Connection</h2>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">VPN Name</label>
                  <input
                    type="text"
                    name="name"
                    required
                    className="input-field"
                    placeholder="office-vpn"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Protocol</label>
                  <select name="protocol" required className="input-field">
                    <option value="OpenVPN">OpenVPN</option>
                    <option value="WireGuard">WireGuard</option>
                    <option value="IKEv2">IKEv2</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Location</label>
                  <select name="location" required className="input-field">
                    <option value="US East">US East</option>
                    <option value="US West">US West</option>
                    <option value="EU West">EU West</option>
                    <option value="Asia Pacific">Asia Pacific</option>
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

export default VPN;
