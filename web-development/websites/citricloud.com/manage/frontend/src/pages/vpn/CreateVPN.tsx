import React, { useState } from 'react';
import { Plus, Shield, Users, Key } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';

const CreateVPN: React.FC = () => {
  const [selectedProtocol, setSelectedProtocol] = useState('wireguard');

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Create VPN Connection</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Set up a secure VPN tunnel for your infrastructure
          </p>
        </div>

        {/* Protocol Selection */}
        <div className="glass-card p-6">
          <h2 className="text-xl font-bold mb-4">Select VPN Protocol</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { id: 'wireguard', name: 'WireGuard', speed: 'Fastest', security: 'High' },
              { id: 'openvpn', name: 'OpenVPN', speed: 'Fast', security: 'Very High' },
              { id: 'ipsec', name: 'IPSec', speed: 'Good', security: 'Enterprise' }
            ].map((protocol) => (
              <div
                key={protocol.id}
                onClick={() => setSelectedProtocol(protocol.id)}
                className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${
                  selectedProtocol === protocol.id
                    ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-primary-400'
                }`}
              >
                <Shield className="mb-3" size={32} />
                <h3 className="text-lg font-bold mb-2">{protocol.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Speed: {protocol.speed}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Security: {protocol.security}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Configuration */}
        <div className="glass-card p-6">
          <h2 className="text-xl font-bold mb-4">VPN Configuration</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Connection Name</label>
              <input type="text" placeholder="office-vpn" className="input-field" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Server Location</label>
                <select className="input-field">
                  <option>US East</option>
                  <option>US West</option>
                  <option>Europe</option>
                  <option>Asia Pacific</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Max Connections</label>
                <input type="number" defaultValue="5" className="input-field" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">IP Range</label>
              <input type="text" placeholder="10.0.0.0/24" className="input-field" />
            </div>
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2">
                <input type="checkbox" defaultChecked className="rounded" />
                <span className="text-sm">Enable Split Tunneling</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="checkbox" defaultChecked className="rounded" />
                <span className="text-sm">Auto-connect on boot</span>
              </label>
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="glass-card p-6">
          <h2 className="text-xl font-bold mb-4">Security Settings</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Encryption Level</label>
              <select className="input-field">
                <option>AES-256-GCM (Recommended)</option>
                <option>AES-128-GCM</option>
                <option>ChaCha20-Poly1305</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Authentication</label>
              <select className="input-field">
                <option>Certificate-based</option>
                <option>Pre-shared Key</option>
                <option>Username/Password</option>
              </select>
            </div>
          </div>
        </div>

        <button className="w-full px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl transition-all flex items-center justify-center space-x-2">
          <Plus size={20} />
          <span>Create VPN Connection</span>
        </button>
      </div>
    </DashboardLayout>
  );
};

export default CreateVPN;
