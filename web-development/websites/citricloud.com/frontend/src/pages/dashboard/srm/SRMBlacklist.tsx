import { useState } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '../../../components/DashboardLayout';
import { FiShield, FiPlus, FiTrash2, FiGlobe, FiAlertCircle, FiX } from 'react-icons/fi';

interface BlacklistEntry {
  id: string;
  type: 'ip' | 'country';
  value: string;
  description: string;
  addedAt: Date;
  status: 'active' | 'inactive';
  blockedRequests: number;
}

export default function SRMBlacklist() {
  const [entries, setEntries] = useState<BlacklistEntry[]>([
    {
      id: '1',
      type: 'ip',
      value: '203.0.113.0',
      description: 'Suspicious activity detected',
      addedAt: new Date('2024-12-01'),
      status: 'active',
      blockedRequests: 1247
    },
    {
      id: '2',
      type: 'country',
      value: 'CN',
      description: 'Country block',
      addedAt: new Date('2024-12-02'),
      status: 'active',
      blockedRequests: 3421
    },
    {
      id: '3',
      type: 'ip',
      value: '198.51.100.0/24',
      description: 'Spam source',
      addedAt: new Date('2024-12-03'),
      status: 'active',
      blockedRequests: 892
    }
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newEntry, setNewEntry] = useState({ 
    type: 'ip' as 'ip' | 'country', 
    value: '', 
    description: '' 
  });

  const countries = [
    { code: 'CN', name: 'China' },
    { code: 'RU', name: 'Russia' },
    { code: 'KP', name: 'North Korea' },
    { code: 'IR', name: 'Iran' },
    { code: 'BR', name: 'Brazil' },
    { code: 'IN', name: 'India' },
  ];

  const handleAddEntry = () => {
    if (!newEntry.value) return;
    
    const entry: BlacklistEntry = {
      id: String(entries.length + 1),
      type: newEntry.type,
      value: newEntry.value,
      description: newEntry.description,
      addedAt: new Date(),
      status: 'active',
      blockedRequests: 0
    };

    setEntries([...entries, entry]);
    setNewEntry({ type: 'ip', value: '', description: '' });
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

  const totalBlocked = entries.reduce((sum, entry) => sum + entry.blockedRequests, 0);

  return (
    <DashboardLayout title="IP Blacklist">
      <div className="p-4 sm:p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">IP Blacklist</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Block traffic from specific IP addresses or countries</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all"
          >
            <FiPlus className="w-5 h-5" />
            Add Block
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
                <p className="text-gray-600 dark:text-gray-400 text-sm">Total Blocks</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{entries.length}</p>
              </div>
              <FiShield className="w-8 h-8 text-red-500" />
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
                <p className="text-gray-600 dark:text-gray-400 text-sm">Blocked Requests</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {totalBlocked.toLocaleString()}
                </p>
              </div>
              <FiAlertCircle className="w-8 h-8 text-orange-500" />
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
                <p className="text-gray-600 dark:text-gray-400 text-sm">Active Rules</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {entries.filter(e => e.status === 'active').length}
                </p>
              </div>
              <FiX className="w-8 h-8 text-red-500" />
            </div>
          </motion.div>
        </div>

        {/* Blacklist Table */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Value</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Blocked</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {entries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        entry.type === 'ip' 
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                          : 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
                      }`}>
                        {entry.type.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <FiGlobe className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{entry.value}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600 dark:text-gray-400">{entry.description || '-'}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600 dark:text-gray-400">{entry.blockedRequests.toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => toggleStatus(entry.id)}
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          entry.status === 'active'
                            ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
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
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Add to Blacklist</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Block Type *
                  </label>
                  <select
                    value={newEntry.type}
                    onChange={(e) => setNewEntry({ ...newEntry, type: e.target.value as 'ip' | 'country', value: '' })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="ip">IP Address</option>
                    <option value="country">Country</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {newEntry.type === 'ip' ? 'IP Address / Range' : 'Country Code'} *
                  </label>
                  {newEntry.type === 'ip' ? (
                    <input
                      type="text"
                      value={newEntry.value}
                      onChange={(e) => setNewEntry({ ...newEntry, value: e.target.value })}
                      placeholder="192.168.1.1 or 192.168.1.0/24"
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  ) : (
                    <select
                      value={newEntry.value}
                      onChange={(e) => setNewEntry({ ...newEntry, value: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      <option value="">Select country...</option>
                      {countries.map(country => (
                        <option key={country.code} value={country.code}>
                          {country.name} ({country.code})
                        </option>
                      ))}
                    </select>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <input
                    type="text"
                    value={newEntry.description}
                    onChange={(e) => setNewEntry({ ...newEntry, description: e.target.value })}
                    placeholder="Reason for blocking"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleAddEntry}
                    className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all"
                  >
                    Add to Blacklist
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
