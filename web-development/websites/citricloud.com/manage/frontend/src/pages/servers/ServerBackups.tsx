import React from 'react';
import { Download, Clock, HardDrive, Plus } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';

const ServerBackups: React.FC = () => {
  const backups = [
    { id: '1', name: 'production-backup-001', date: '2026-01-09 14:30', size: '25.3 GB', server: 'web-server-01', status: 'Completed' },
    { id: '2', name: 'production-backup-002', date: '2026-01-08 14:30', size: '25.1 GB', server: 'web-server-01', status: 'Completed' },
    { id: '3', name: 'db-backup-daily', date: '2026-01-09 02:00', size: '8.4 GB', server: 'db-server-01', status: 'Completed' },
    { id: '4', name: 'app-backup-weekly', date: '2026-01-07 00:00', size: '45.2 GB', server: 'app-server-01', status: 'Completed' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Server Backups</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage and restore server backups
            </p>
          </div>
          <button className="px-6 py-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white transition-all flex items-center space-x-2">
            <Plus size={20} />
            <span>Create Backup</span>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="glass-card p-6">
            <HardDrive className="text-blue-600 mb-3" size={32} />
            <p className="text-3xl font-bold mb-1">104 GB</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Backup Size</p>
          </div>
          <div className="glass-card p-6">
            <Clock className="text-green-600 mb-3" size={32} />
            <p className="text-3xl font-bold mb-1">Daily</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Backup Frequency</p>
          </div>
          <div className="glass-card p-6">
            <Download className="text-purple-600 mb-3" size={32} />
            <p className="text-3xl font-bold mb-1">30 Days</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Retention Period</p>
          </div>
          <div className="glass-card p-6">
            <span className="text-3xl mb-3 block">✅</span>
            <p className="text-3xl font-bold mb-1">100%</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Success Rate</p>
          </div>
        </div>

        {/* Backup Schedule */}
        <div className="glass-card p-6">
          <h2 className="text-xl font-bold mb-4">Backup Schedule</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <div>
                <p className="font-medium">Full Server Backup</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Every day at 2:00 AM UTC</p>
              </div>
              <span className="px-3 py-1 text-sm font-semibold rounded bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200">
                Active
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <div>
                <p className="font-medium">Database Backup</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Every 6 hours</p>
              </div>
              <span className="px-3 py-1 text-sm font-semibold rounded bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200">
                Active
              </span>
            </div>
          </div>
        </div>

        {/* Backups List */}
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Backup Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Server</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Size</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {backups.map((backup) => (
                  <tr key={backup.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-6 py-4 whitespace-nowrap font-medium">{backup.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{backup.server}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{backup.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{backup.size}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-semibold rounded bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200">
                        {backup.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button className="text-primary-600 hover:text-primary-700 mr-3">Restore</button>
                      <button className="text-blue-600 hover:text-blue-700 mr-3">Download</button>
                      <button className="text-red-600 hover:text-red-700">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ServerBackups;
