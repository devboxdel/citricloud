import React from 'react';
import { Server, Shield, Gauge } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';

const ControlPanelInstall: React.FC = () => {
  const [selectedPanel, setSelectedPanel] = React.useState('cpanel');

  const panels = [
    {
      id: 'cpanel',
      name: 'cPanel/WHM',
      description: 'Industry standard control panel',
      price: '$45/month',
      features: ['Web hosting management', 'Email accounts', 'File manager', 'DNS management'],
      recommended: true,
    },
    {
      id: 'plesk',
      name: 'Plesk',
      description: 'Modern web hosting platform',
      price: '$38/month',
      features: ['Multi-server management', 'WordPress toolkit', 'Docker support', 'Security core'],
      recommended: false,
    },
    {
      id: 'directadmin',
      name: 'DirectAdmin',
      description: 'Lightweight control panel',
      price: '$29/month',
      features: ['Fast performance', 'User-friendly interface', 'Multiple PHP versions', 'Let\'s Encrypt'],
      recommended: false,
    },
    {
      id: 'webmin',
      name: 'Webmin',
      description: 'Free open-source panel',
      price: 'Free',
      features: ['System administration', 'User management', 'Apache/Nginx config', 'Database management'],
      recommended: false,
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Install Control Panel</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Choose and install a control panel for your server
          </p>
        </div>

        {/* Panel Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {panels.map((panel) => (
            <div
              key={panel.id}
              onClick={() => setSelectedPanel(panel.id)}
              className={`glass-card p-6 cursor-pointer transition-all ${
                selectedPanel === panel.id
                  ? 'ring-2 ring-primary-600'
                  : 'hover:shadow-lg'
              }`}
            >
              {panel.recommended && (
                <span className="inline-block px-2 py-1 text-xs font-semibold rounded bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200 mb-3">
                  Recommended
                </span>
              )}
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xl font-bold">{panel.name}</h3>
                <span className="text-lg font-bold text-primary-600">{panel.price}</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{panel.description}</p>
              <ul className="space-y-2">
                {panel.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center text-sm">
                    <span className="text-green-500 mr-2">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Server Selection */}
        <div className="glass-card p-6">
          <h2 className="text-xl font-bold mb-4">Select Server</h2>
          <div className="space-y-3">
            {['web-server-01 (Ubuntu 22.04)', 'app-server-01 (CentOS 8)', 'dev-server-01 (Debian 11)'].map((server, idx) => (
              <label key={idx} className="flex items-center p-4 bg-gray-50 dark:bg-gray-900 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800">
                <input type="radio" name="server" defaultChecked={idx === 0} className="mr-3" />
                <Server className="mr-3 text-gray-600" size={20} />
                <span>{server}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Installation Options */}
        <div className="glass-card p-6">
          <h2 className="text-xl font-bold mb-4">Installation Options</h2>
          <div className="space-y-4">
            <label className="flex items-center space-x-2">
              <input type="checkbox" defaultChecked className="rounded" />
              <span className="text-sm">Install with SSL certificate</span>
            </label>
            <label className="flex items-center space-x-2">
              <input type="checkbox" defaultChecked className="rounded" />
              <span className="text-sm">Configure firewall rules</span>
            </label>
            <label className="flex items-center space-x-2">
              <input type="checkbox" className="rounded" />
              <span className="text-sm">Enable automatic backups</span>
            </label>
            <label className="flex items-center space-x-2">
              <input type="checkbox" defaultChecked className="rounded" />
              <span className="text-sm">Set up email service</span>
            </label>
          </div>
        </div>

        {/* Installation Summary */}
        <div className="glass-card p-6 bg-gray-50 dark:bg-gray-900">
          <h2 className="text-xl font-bold mb-4">Installation Summary</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Control Panel:</span>
              <span className="font-medium">{panels.find(p => p.id === selectedPanel)?.name}</span>
            </div>
            <div className="flex justify-between">
              <span>Monthly Cost:</span>
              <span className="font-medium">{panels.find(p => p.id === selectedPanel)?.price}</span>
            </div>
            <div className="flex justify-between">
              <span>Installation Time:</span>
              <span className="font-medium">~15 minutes</span>
            </div>
          </div>
        </div>

        {/* Install Button */}
        <button className="w-full px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl transition-all flex items-center justify-center space-x-2">
          <Shield size={20} />
          <span>Install Control Panel</span>
        </button>

        {/* Warning */}
        <div className="glass-card p-4 bg-orange-50 dark:bg-orange-900/20">
          <p className="text-sm text-orange-900 dark:text-orange-100">
            <strong>Important:</strong> Installing a control panel will modify your server configuration. Make sure to backup your data before proceeding.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ControlPanelInstall;
