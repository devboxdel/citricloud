import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Globe2, Plus, Edit2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardLayout from '../components/DashboardLayout';
import { hostingAPI } from '../lib/api';

const DNS: React.FC = () => {
  const [selectedZone, setSelectedZone] = useState<number | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const queryClient = useQueryClient();

  const { data: zones, isLoading: zonesLoading } = useQuery({
    queryKey: ['dns-zones'],
    queryFn: () => hostingAPI.getDNSZones(),
  });

  const { data: records, isLoading: recordsLoading } = useQuery({
    queryKey: ['dns-records', selectedZone],
    queryFn: () => hostingAPI.getDNSRecords(selectedZone!),
    enabled: !!selectedZone,
  });

  const createMutation = useMutation({
    mutationFn: ({ zoneId, data }: any) => hostingAPI.createDNSRecord(zoneId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dns-records'] });
      toast.success('DNS record created!');
      setShowCreateModal(false);
    },
    onError: () => {
      toast.error('Failed to create DNS record');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: ({ zoneId, recordId }: any) => hostingAPI.deleteDNSRecord(zoneId, recordId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dns-records'] });
      toast.success('DNS record deleted!');
    },
    onError: () => {
      toast.error('Failed to delete DNS record');
    },
  });

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedZone) return;
    
    const formData = new FormData(e.currentTarget);
    createMutation.mutate({
      zoneId: selectedZone,
      data: {
        type: formData.get('type') as string,
        name: formData.get('name') as string,
        content: formData.get('content') as string,
        ttl: parseInt(formData.get('ttl') as string),
        priority: formData.get('priority') ? parseInt(formData.get('priority') as string) : undefined,
      },
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">DNS Management</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage DNS records for your domains
          </p>
        </div>

        {/* Zone Selector */}
        <div className="glass-card p-6">
          <label className="block text-sm font-medium mb-2">Select DNS Zone</label>
          <select
            value={selectedZone || ''}
            onChange={(e) => setSelectedZone(Number(e.target.value))}
            className="input-field"
          >
            <option value="">Select a domain...</option>
            {zones?.items?.map((zone: any) => (
              <option key={zone.id} value={zone.id}>
                {zone.domain}
              </option>
            ))}
          </select>
        </div>

        {/* DNS Records */}
        {selectedZone && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">DNS Records</h2>
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn-primary flex items-center space-x-2"
              >
                <Plus size={20} />
                <span>Add Record</span>
              </button>
            </div>

            {recordsLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : (
              <div className="glass-card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-900/50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Content
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          TTL
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {records?.items?.map((record: any) => (
                        <tr key={record.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded text-xs font-medium">
                              {record.type}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap font-mono text-sm">
                            {record.name}
                          </td>
                          <td className="px-6 py-4 font-mono text-sm">{record.content}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {record.ttl}s
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              <button className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 rounded-lg transition-all">
                                <Edit2 size={16} />
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm('Delete this DNS record?')) {
                                    deleteMutation.mutate({
                                      zoneId: selectedZone,
                                      recordId: record.id,
                                    });
                                  }
                                }}
                                className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 rounded-lg transition-all"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
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
              <h2 className="text-2xl font-bold mb-6">Add DNS Record</h2>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Record Type</label>
                  <select name="type" required className="input-field">
                    <option value="A">A - IPv4 Address</option>
                    <option value="AAAA">AAAA - IPv6 Address</option>
                    <option value="CNAME">CNAME - Canonical Name</option>
                    <option value="MX">MX - Mail Exchange</option>
                    <option value="TXT">TXT - Text Record</option>
                    <option value="NS">NS - Name Server</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Name</label>
                  <input
                    type="text"
                    name="name"
                    required
                    className="input-field"
                    placeholder="@ or subdomain"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Content</label>
                  <input
                    type="text"
                    name="content"
                    required
                    className="input-field"
                    placeholder="IP address or value"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">TTL (seconds)</label>
                    <input
                      type="number"
                      name="ttl"
                      required
                      defaultValue={3600}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Priority (MX only)</label>
                    <input
                      type="number"
                      name="priority"
                      className="input-field"
                      placeholder="10"
                    />
                  </div>
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
                    className="flex-1 btn-primary disabled:opacity-50"
                  >
                    {createMutation.isPending ? 'Adding...' : 'Add'}
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

export default DNS;
