import React, { useState } from 'react';
import { Server, Cpu, HardDrive, Zap } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';

const DeployServer: React.FC = () => {
  const [selectedPlan, setSelectedPlan] = useState('standard');

  const plans = [
    { id: 'basic', name: 'Basic', cpu: '1 CPU', ram: '2GB RAM', storage: '25GB SSD', price: '$5/mo' },
    { id: 'standard', name: 'Standard', cpu: '2 CPU', ram: '4GB RAM', storage: '50GB SSD', price: '$10/mo' },
    { id: 'premium', name: 'Premium', cpu: '4 CPU', ram: '8GB RAM', storage: '100GB SSD', price: '$20/mo' },
    { id: 'enterprise', name: 'Enterprise', cpu: '8 CPU', ram: '16GB RAM', storage: '200GB SSD', price: '$40/mo' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Deploy New Server</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Configure and deploy your virtual private server
          </p>
        </div>

        {/* Plan Selection */}
        <div className="glass-card p-6">
          <h2 className="text-xl font-bold mb-4">Select Plan</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {plans.map((plan) => (
              <div
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id)}
                className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${
                  selectedPlan === plan.id
                    ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-primary-400'
                }`}
              >
                <h3 className="text-lg font-bold mb-2">{plan.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{plan.cpu}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{plan.ram}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{plan.storage}</p>
                <p className="text-2xl font-bold text-primary-600">{plan.price}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Configuration */}
        <div className="glass-card p-6">
          <h2 className="text-xl font-bold mb-4">Server Configuration</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Server Name</label>
              <input
                type="text"
                placeholder="web-server-01"
                className="input-field"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Operating System</label>
                <select className="input-field">
                  <option>Ubuntu 22.04 LTS</option>
                  <option>Ubuntu 20.04 LTS</option>
                  <option>Debian 11</option>
                  <option>CentOS 8</option>
                  <option>Rocky Linux 9</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Datacenter</label>
                <select className="input-field">
                  <option>US East (Virginia)</option>
                  <option>US West (California)</option>
                  <option>EU West (Ireland)</option>
                  <option>Asia Pacific (Singapore)</option>
                </select>
              </div>
            </div>
            <div>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input type="checkbox" className="rounded" />
                <span className="text-sm">Enable automatic backups (+$2/mo)</span>
              </label>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="glass-card p-6">
          <h2 className="text-xl font-bold mb-4">Order Summary</h2>
          <div className="space-y-2 mb-6">
            <div className="flex justify-between">
              <span>Plan:</span>
              <span className="font-semibold">{plans.find(p => p.id === selectedPlan)?.name}</span>
            </div>
            <div className="flex justify-between">
              <span>Total:</span>
              <span className="font-bold text-2xl text-primary-600">{plans.find(p => p.id === selectedPlan)?.price}</span>
            </div>
          </div>
          <button className="w-full px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl transition-all">
            Deploy Server
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DeployServer;
