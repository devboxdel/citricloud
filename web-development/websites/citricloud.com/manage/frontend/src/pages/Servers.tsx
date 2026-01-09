import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Server, Plus, Power, RefreshCw, Trash2, PlayCircle, StopCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardLayout from '../components/DashboardLayout';
import { hostingAPI } from '../lib/api';

const Servers: React.FC = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['servers'],
    queryFn: () => hostingAPI.getServers(),
  });

  const createMutation = useMutation({
    mutationFn: hostingAPI.createServer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['servers'] });
      toast.success('Server created successfully!');
      setShowCreateModal(false);
    },
    onError: () => {
      toast.error('Failed to create server');
    },
  });

  const controlMutation = useMutation({
    mutationFn: ({ id, action }: { id: number; action: any }) =>
      hostingAPI.controlServer(id, action),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['servers'] });
      toast.success('Server action completed!');
    },
    onError: () => {
      toast.error('Failed to perform action');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: hostingAPI.deleteServer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['servers'] });
      toast.success('Server deleted successfully!');
    },
    onError: () => {
      toast.error('Failed to delete server');
    },
  });

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    createMutation.mutate({
      name: formData.get('name') as string,
      plan: formData.get('plan') as string,
      os: formData.get('os') as string,
      datacenter: formData.get('datacenter') as string,
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Servers</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage your virtual private servers
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus size={20} />
            <span>Deploy Server</span>
          </button>
        </div>

        {/* Servers Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data?.items?.map((server: any, index: number) => (
              <motion.div
                key={server.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="glass-card p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold mb-1">{server.name}</h3>
                    <p className="text-sm text-gray-500">{server.os}</p>
                  </div>
                  <div
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      server.status === 'running'
                        ? 'bg-green-100 text-green-600'
                        : 'bg-red-100 text-red-600'
                    }`}
                  >
                    {server.status}
                  </div>
                </div>

                <div className="space-y-2 mb-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Plan:</span>
                    <span className="font-medium">{server.plan}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Datacenter:</span>
                    <span className="font-medium">{server.datacenter}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">IP:</span>
                    <span className="font-mono text-xs">{server.ip || 'Provisioning...'}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {server.status === 'running' ? (
                    <button
                      onClick={() =>
                        controlMutation.mutate({ id: server.id, action: 'stop' })
                      }
                      className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-all"
                    >
                      <StopCircle size={16} />
                      <span className="text-sm">Stop</span>
                    </button>
                  ) : (
                    <button
                      onClick={() =>
                        controlMutation.mutate({ id: server.id, action: 'start' })
                      }
                      className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-green-50 dark:bg-green-900/20 text-green-600 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-all"
                    >
                      <PlayCircle size={16} />
                      <span className="text-sm">Start</span>
                    </button>
                  )}
                  <button
                    onClick={() =>
                      controlMutation.mutate({ id: server.id, action: 'restart' })
                    }
                    className="flex items-center justify-center px-3 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all"
                  >
                    <RefreshCw size={16} />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this server?')) {
                        deleteMutation.mutate(server.id);
                      }
                    }}
                    className="flex items-center justify-center px-3 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card p-6 max-w-md w-full"
            >
              <h2 className="text-2xl font-bold mb-6">Deploy New Server</h2>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Server Name</label>
                  <input
                    type="text"
                    name="name"
                    required
                    className="input-field"
                    placeholder="web-server-01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Plan</label>
                  <select name="plan" required className="input-field">
                    <option value="basic">Basic - 1 CPU, 2GB RAM</option>
                    <option value="standard">Standard - 2 CPU, 4GB RAM</option>
                    <option value="premium">Premium - 4 CPU, 8GB RAM</option>
                    <option value="enterprise">Enterprise - 8 CPU, 16GB RAM</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Operating System</label>
                  <select name="os" required className="input-field">
                    <option value="Ubuntu 22.04">Ubuntu 22.04 LTS</option>
                    <option value="Ubuntu 20.04">Ubuntu 20.04 LTS</option>
                    <option value="Debian 11">Debian 11</option>
                    <option value="CentOS 8">CentOS 8</option>
                    <option value="Rocky Linux 9">Rocky Linux 9</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Datacenter</label>
                  <select name="datacenter" required className="input-field">
                    <option value="us-east-1">US East (Virginia)</option>
                    <option value="us-west-1">US West (California)</option>
                    <option value="eu-west-1">EU West (Ireland)</option>
                    <option value="ap-southeast-1">Asia Pacific (Singapore)</option>
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
                    {createMutation.isPending ? 'Creating...' : 'Deploy'}
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

export default Servers;
