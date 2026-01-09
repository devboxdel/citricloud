import React from 'react';
import { Activity, Cpu, HardDrive, Wifi, TrendingUp } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';

const Monitoring: React.FC = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Server Monitoring</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Real-time performance metrics and alerts
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">CPU Usage</h3>
              <Cpu className="text-blue-600" size={24} />
            </div>
            <p className="text-3xl font-bold mb-2">45%</p>
            <div className="w-full bg-gray-200 dark:bg-gray-900 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: '45%' }}></div>
            </div>
          </div>

          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Memory</h3>
              <Activity className="text-green-600" size={24} />
            </div>
            <p className="text-3xl font-bold mb-2">62%</p>
            <div className="w-full bg-gray-200 dark:bg-gray-900 rounded-full h-2">
              <div className="bg-green-600 h-2 rounded-full" style={{ width: '62%' }}></div>
            </div>
          </div>

          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Disk Usage</h3>
              <HardDrive className="text-purple-600" size={24} />
            </div>
            <p className="text-3xl font-bold mb-2">38%</p>
            <div className="w-full bg-gray-200 dark:bg-gray-900 rounded-full h-2">
              <div className="bg-purple-600 h-2 rounded-full" style={{ width: '38%' }}></div>
            </div>
          </div>

          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Network</h3>
              <Wifi className="text-orange-600" size={24} />
            </div>
            <p className="text-3xl font-bold mb-2">125 MB/s</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">↑ 65 MB/s ↓ 60 MB/s</p>
          </div>
        </div>

        {/* Performance Chart */}
        <div className="glass-card p-6">
          <h2 className="text-xl font-bold mb-4">Performance Overview</h2>
          <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl">
            <div className="text-center">
              <TrendingUp size={48} className="mx-auto mb-2 text-gray-400" />
              <p className="text-gray-600 dark:text-gray-400">Performance chart visualization</p>
            </div>
          </div>
        </div>

        {/* Active Alerts */}
        <div className="glass-card p-6">
          <h2 className="text-xl font-bold mb-4">Active Alerts</h2>
          <div className="space-y-3">
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl">
              <p className="font-medium text-yellow-800 dark:text-yellow-200">High CPU Usage Detected</p>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">Server web-01 - CPU usage above 80% for 5 minutes</p>
            </div>
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
              <p className="font-medium text-blue-800 dark:text-blue-200">Backup Completed</p>
              <p className="text-sm text-blue-700 dark:text-blue-300">Server db-01 - Backup completed successfully</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Monitoring;
