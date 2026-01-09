import React from 'react';
import { Mail, Plus, Send, Archive } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';

const EmailAccounts: React.FC = () => {
  const accounts = [
    { email: 'admin@example.com', quota: '5 GB', used: '2.3 GB', status: 'Active' },
    { email: 'support@example.com', quota: '10 GB', used: '7.1 GB', status: 'Active' },
    { email: 'sales@example.com', quota: 'Unlimited', used: '15.4 GB', status: 'Active' },
    { email: 'info@example.com', quota: '2 GB', used: '0.8 GB', status: 'Active' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Email Accounts</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage email accounts for your domains
            </p>
          </div>
          <button className="px-6 py-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white transition-all flex items-center space-x-2">
            <Plus size={20} />
            <span>Create Account</span>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="glass-card p-6">
            <Mail className="text-blue-600 mb-3" size={32} />
            <p className="text-3xl font-bold mb-1">4</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Accounts</p>
          </div>
          <div className="glass-card p-6">
            <Send className="text-green-600 mb-3" size={32} />
            <p className="text-3xl font-bold mb-1">1,234</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Emails Sent Today</p>
          </div>
          <div className="glass-card p-6">
            <Archive className="text-purple-600 mb-3" size={32} />
            <p className="text-3xl font-bold mb-1">25.6 GB</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Storage Used</p>
          </div>
          <div className="glass-card p-6">
            <span className="text-3xl mb-3 block">📊</span>
            <p className="text-3xl font-bold mb-1">98%</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Delivery Rate</p>
          </div>
        </div>

        {/* Accounts List */}
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email Address</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Quota</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Used</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {accounts.map((account, index) => (
                  <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center mr-3">
                          <Mail className="text-primary-600" size={20} />
                        </div>
                        <span className="font-medium">{account.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{account.quota}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center">
                        <span className="mr-2">{account.used}</span>
                        {account.quota !== 'Unlimited' && (
                          <div className="w-20 bg-gray-200 dark:bg-gray-900 rounded-full h-2">
                            <div className="bg-blue-600 h-2 rounded-full" style={{ width: '46%' }}></div>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-semibold rounded bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200">
                        {account.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button className="text-primary-600 hover:text-primary-700 mr-3">Manage</button>
                      <button className="text-gray-600 hover:text-gray-700 mr-3">Login</button>
                      <button className="text-red-600 hover:text-red-700">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card p-6 cursor-pointer hover:shadow-lg transition-all">
            <h3 className="font-bold mb-2">Email Forwarders</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Set up email forwarding rules</p>
          </div>
          <div className="glass-card p-6 cursor-pointer hover:shadow-lg transition-all">
            <h3 className="font-bold mb-2">Spam Filters</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Configure spam protection settings</p>
          </div>
          <div className="glass-card p-6 cursor-pointer hover:shadow-lg transition-all">
            <h3 className="font-bold mb-2">Auto Responders</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Create automatic email responses</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default EmailAccounts;
