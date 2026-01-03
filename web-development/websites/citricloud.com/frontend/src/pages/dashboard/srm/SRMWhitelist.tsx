import { useState } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '../../../components/DashboardLayout';
import { FiShield, FiPlus, FiTrash2, FiGlobe, FiCheck, FiX } from 'react-icons/fi';

interface WhitelistEntry {
  id: string;
  ipAddress: string;
  description: string;
  addedAt: Date;
  status: 'active' | 'inactive';
}

export default function SRMWhitelist() {
  const [entries, setEntries] = useState<WhitelistEntry[]>([
    {
      id: '1',
      ipAddress: '192.168.1.100',
      description: 'Office Network',
      addedAt: new Date('2024-12-01'),
      status: 'active'
    },
    {
      id: '2',
      ipAddress: '10.0.0.50',
      description: 'Development Server',
      addedAt: new Date('2024-12-02'),
      status: 'active'
    }
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newEntry, setNewEntry] = useState({ ipAddress: '', description: '' });

  const handleAddEntry = () => {
    if (!newEntry.ipAddress) return;
    
    const entry: WhitelistEntry = {
      id: String(entries.length + 1),
      ipAddress: newEntry.ipAddress,
      description: newEntry.description,
      addedAt: new Date(),
      status: 'active'
    };

    setEntries([...entries, entry]);
    setNewEntry({ ipAddress: '', description: '' });
    setShowAddModal(false);
  };

  const handleDeleteEntry = (id: string) => {
    setEntries(entries.filter(entry => entry.id !== id));
  };

  const toggleStatus = (id: string) => {
    setEntries(entries.map(entry => 
      entry.id === id 
        ? { ...entry, status: entry.status === 'active' ? 'inactive' : 'active' }
        : entry
    ));
  };

  return (
    <DashboardLayout title="IP Whitelist">
      <div className="p-4 sm:p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">IP Whitelist</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Allow traffic from specific IP addresses</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all"
          >
            <FiPlus className="w-5 h-5" />
            Add IP
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Total Entries</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{entries.length}</p>
              </div>
              <FiShield className="w-8 h-8 text-green-500" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Active</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {entries.filter(e => e.status === 'active').length}
                </p>
              </div>
              <FiCheck className="w-8 h-8 text-green-500" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Inactive</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {entries.filter(e => e.status === 'inactive').length}
                </p>
              </div>
              <FiX className="w-8 h-8 text-gray-500" />
            </div>
          </motion.div>
        </div>

        {/* Whitelist Table */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">IP Address</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Added</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {entries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <FiGlobe className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{entry.ipAddress}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600 dark:text-gray-400">{entry.description || '-'}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600 dark:text-gray-400">{entry.addedAt.toLocaleDateString()}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => toggleStatus(entry.id)}
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          entry.status === 'active'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
                        }`}
                      >
                        {entry.status}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => handleDeleteEntry(entry.id)}
                        className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                      >
                        <FiTrash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white dark:bg-gray-900 rounded-xl max-w-md w-full p-6"
            >
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Add IP to Whitelist</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    IP Address *
                  </label>
                  <input
                    type="text"
                    value={newEntry.ipAddress}
                    onChange={(e) => setNewEntry({ ...newEntry, ipAddress: e.target.value })}
                    placeholder="192.168.1.1"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <input
                    type="text"
                    value={newEntry.description}
                    onChange={(e) => setNewEntry({ ...newEntry, description: e.target.value })}
                    placeholder="Office network, VPN, etc."
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleAddEntry}
                    className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all"
                  >
                    Add to Whitelist
                  </button>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
