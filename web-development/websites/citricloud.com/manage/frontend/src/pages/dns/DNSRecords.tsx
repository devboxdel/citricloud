import React from 'react';
import { Plus, Globe2, FileText } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';

const DNSRecords: React.FC = () => {
  const records = [
    { type: 'A', name: '@', value: '192.168.1.1', ttl: '3600' },
    { type: 'AAAA', name: '@', value: '2001:db8::1', ttl: '3600' },
    { type: 'CNAME', name: 'www', value: 'example.com', ttl: '3600' },
    { type: 'MX', name: '@', value: 'mail.example.com', ttl: '3600', priority: 10 },
    { type: 'TXT', name: '@', value: 'v=spf1 include:_spf.example.com ~all', ttl: '3600' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">DNS Records</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage DNS records for your domains
            </p>
          </div>
          <button className="px-6 py-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white transition-all flex items-center space-x-2">
            <Plus size={20} />
            <span>Add Record</span>
          </button>
        </div>

        {/* Quick Add Buttons */}
        <div className="glass-card p-4">
          <div className="flex flex-wrap gap-2">
            {['A Record', 'AAAA Record', 'CNAME', 'MX Record', 'TXT Record', 'SRV Record'].map((type) => (
              <button key={type} className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all text-sm">
                + {type}
              </button>
            ))}
          </div>
        </div>

        {/* Records Table */}
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Value</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">TTL</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Priority</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {records.map((record, index) => (
                  <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-semibold rounded bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200">
                        {record.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{record.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 max-w-xs truncate">{record.value}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{record.ttl}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{record.priority || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button className="text-primary-600 hover:text-primary-700 mr-3">Edit</button>
                      <button className="text-red-600 hover:text-red-700">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card p-6">
            <Globe2 className="mb-3 text-blue-600" size={32} />
            <h3 className="font-bold mb-2">Propagation Time</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">DNS changes typically take 1-24 hours to propagate globally</p>
          </div>
          <div className="glass-card p-6">
            <FileText className="mb-3 text-green-600" size={32} />
            <h3 className="font-bold mb-2">Record Types</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Support for A, AAAA, CNAME, MX, TXT, SRV, and more</p>
          </div>
          <div className="glass-card p-6">
            <span className="text-3xl mb-3 block">🔄</span>
            <h3 className="font-bold mb-2">Auto Backup</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">All changes are automatically backed up for easy restoration</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DNSRecords;
