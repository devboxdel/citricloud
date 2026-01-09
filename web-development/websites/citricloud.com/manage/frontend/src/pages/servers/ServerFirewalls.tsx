import React from 'react';
import { Shield, Lock, Key, AlertTriangle } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';

const ServerFirewalls: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState('rules');

  const firewallRules = [
    { id: 1, name: 'SSH Access', port: '22', protocol: 'TCP', source: '0.0.0.0/0', action: 'Allow', enabled: true },
    { id: 2, name: 'HTTP', port: '80', protocol: 'TCP', source: '0.0.0.0/0', action: 'Allow', enabled: true },
    { id: 3, name: 'HTTPS', port: '443', protocol: 'TCP', source: '0.0.0.0/0', action: 'Allow', enabled: true },
    { id: 4, name: 'MySQL', port: '3306', protocol: 'TCP', source: '10.0.0.0/8', action: 'Allow', enabled: true },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Server Firewalls</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Configure firewall rules to secure your servers
          </p>
        </div>

        {/* Security Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card p-6">
            <Shield className="text-green-600 mb-3" size={32} />
            <p className="text-3xl font-bold mb-1 text-green-600">Protected</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Firewall Status</p>
          </div>
          <div className="glass-card p-6">
            <Lock className="text-blue-600 mb-3" size={32} />
            <p className="text-3xl font-bold mb-1">12</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Active Rules</p>
          </div>
          <div className="glass-card p-6">
            <AlertTriangle className="text-orange-600 mb-3" size={32} />
            <p className="text-3xl font-bold mb-1">3</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Recent Blocks</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="glass-card">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <div className="flex space-x-8 px-6">
              {['rules', 'blocked', 'logs'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                    activeTab === tab
                      ? 'border-primary-600 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6">
            {activeTab === 'rules' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold">Firewall Rules</h3>
                  <button className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-all">
                    + Add Rule
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-900">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Rule Name</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Port</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Protocol</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Source</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Action</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {firewallRules.map((rule) => (
                        <tr key={rule.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                          <td className="px-4 py-3 font-medium">{rule.name}</td>
                          <td className="px-4 py-3 text-sm">{rule.port}</td>
                          <td className="px-4 py-3 text-sm">{rule.protocol}</td>
                          <td className="px-4 py-3 text-sm font-mono text-xs">{rule.source}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 text-xs font-semibold rounded ${
                              rule.action === 'Allow' 
                                ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200'
                                : 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200'
                            }`}>
                              {rule.action}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input type="checkbox" checked={rule.enabled} className="sr-only peer" onChange={() => {}} />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                            </label>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <button className="text-primary-600 hover:text-primary-700 mr-3">Edit</button>
                            <button className="text-red-600 hover:text-red-700">Delete</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'blocked' && (
              <div className="text-center py-8">
                <AlertTriangle className="mx-auto mb-4 text-gray-400" size={48} />
                <p className="text-lg font-medium mb-2">3 IPs Currently Blocked</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Review blocked connections and manage your block list</p>
              </div>
            )}

            {activeTab === 'logs' && (
              <div className="space-y-2">
                {[
                  { time: '10:45:22', ip: '192.168.1.100', action: 'Allowed', port: '443' },
                  { time: '10:45:15', ip: '203.0.113.45', action: 'Blocked', port: '22' },
                  { time: '10:44:58', ip: '192.168.1.100', action: 'Allowed', port: '80' },
                ].map((log, i) => (
                  <div key={i} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <span className="text-sm font-mono">{log.time}</span>
                    <span className="text-sm font-mono">{log.ip}</span>
                    <span className="text-sm">Port {log.port}</span>
                    <span className={`px-2 py-1 text-xs font-semibold rounded ${
                      log.action === 'Allowed'
                        ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200'
                        : 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200'
                    }`}>
                      {log.action}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card p-6 cursor-pointer hover:shadow-lg transition-all">
            <Key className="mb-3 text-blue-600" size={32} />
            <h3 className="font-bold mb-2">SSH Keys</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Manage SSH access keys</p>
          </div>
          <div className="glass-card p-6 cursor-pointer hover:shadow-lg transition-all">
            <Shield className="mb-3 text-green-600" size={32} />
            <h3 className="font-bold mb-2">DDoS Protection</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Configure attack mitigation</p>
          </div>
          <div className="glass-card p-6 cursor-pointer hover:shadow-lg transition-all">
            <Lock className="mb-3 text-purple-600" size={32} />
            <h3 className="font-bold mb-2">Security Audit</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Run security scan</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ServerFirewalls;
