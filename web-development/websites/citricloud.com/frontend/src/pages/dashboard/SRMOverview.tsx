import { useQuery } from '@tanstack/react-query';
import DashboardLayout from '../../components/DashboardLayout';
import { srmAPI } from '../../lib/api';
import { motion } from 'framer-motion';
import {
  FiServer, FiCpu, FiHardDrive, FiWifi, FiActivity,
  FiCheckCircle, FiAlertCircle, FiRefreshCw
} from 'react-icons/fi';
import { useEffect, useState } from 'react';

export default function SRMOverview() {
  const [autoRefresh, setAutoRefresh] = useState(true);
  
  // Fetch system overview
  const { data: systemData, refetch: refetchSystem, isLoading: isLoadingSystem } = useQuery({
    queryKey: ['srm-system-overview'],
    queryFn: async () => {
      const response = await srmAPI.getSystemOverview();
      return response.data;
    },
    refetchInterval: autoRefresh ? 5000 : false,
  });

  // Fetch CPU usage
  const { data: cpuData } = useQuery({
    queryKey: ['srm-cpu-usage'],
    queryFn: async () => {
      const response = await srmAPI.getCPUUsage();
      return response.data;
    },
    refetchInterval: autoRefresh ? 5000 : false,
  });

  // Fetch storage overview
  const { data: storageData } = useQuery({
    queryKey: ['srm-storage-overview'],
    queryFn: async () => {
      const response = await srmAPI.getStorageOverview();
      return response.data;
    },
    refetchInterval: autoRefresh ? 10000 : false,
  });

  // Fetch network stats
  const { data: networkData } = useQuery({
    queryKey: ['srm-network-stats'],
    queryFn: async () => {
      const response = await srmAPI.getNetworkStats();
      return response.data;
    },
    refetchInterval: autoRefresh ? 5000 : false,
  });

  const statsCards = [
    {
      title: 'CPU Usage',
      value: `${systemData?.cpu?.percent?.toFixed(1) || 0}%`,
      icon: <FiCpu className="w-6 h-6" />,
      color: 'bg-blue-500',
      subtext: `${systemData?.cpu?.count || 0} cores @ ${systemData?.cpu?.frequency_ghz?.toFixed(2) || 0} GHz`,
    },
    {
      title: 'Memory Usage',
      value: `${systemData?.memory?.percent?.toFixed(1) || 0}%`,
      icon: <FiActivity className="w-6 h-6" />,
      color: 'bg-purple-500',
      subtext: `${systemData?.memory?.used_gb || 0}GB / ${systemData?.memory?.total_gb || 0}GB`,
    },
    {
      title: 'Disk Usage',
      value: `${systemData?.disk?.percent?.toFixed(1) || 0}%`,
      icon: <FiHardDrive className="w-6 h-6" />,
      color: 'bg-orange-500',
      subtext: `${systemData?.disk?.used_gb || 0}GB / ${systemData?.disk?.total_gb || 0}GB`,
    },
    {
      title: 'System Uptime',
      value: `${Math.floor((systemData?.uptime_seconds || 0) / 86400)} days`,
      icon: <FiCheckCircle className="w-6 h-6" />,
      color: 'bg-green-500',
      subtext: `Boot: ${new Date(systemData?.boot_time || '').toLocaleString()}`,
    },
  ];

  return (
    <DashboardLayout
      title="Server Resources - Overview"
      breadcrumb={<div className="text-xs text-gray-500">Real-time system monitoring</div>}
    >
      {/* Auto Refresh Toggle */}
      <div className="mb-6 flex items-center gap-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={autoRefresh}
            onChange={(e) => setAutoRefresh(e.target.checked)}
            className="w-4 h-4 rounded"
          />
          <span className="text-sm text-gray-600 dark:text-gray-300">Auto-refresh (5s)</span>
        </label>
        <button
          onClick={() => refetchSystem()}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary-500 text-white text-sm hover:bg-primary-600 transition-colors"
        >
          <FiRefreshCw className="w-4 h-4" />
          Refresh
        </button>
        <span className="text-xs text-gray-500">
          Last updated: {new Date(systemData?.timestamp || '').toLocaleTimeString()}
        </span>
      </div>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsCards.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass-card p-6 rounded-2xl bg-white/80 dark:bg-gray-800/90 border border-white/30 dark:border-gray-700/50 shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">{stat.title}</h3>
              <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center text-white`}>
                {stat.icon}
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">{stat.value}</p>
            <p className="text-xs text-gray-500">{stat.subtext}</p>
            <div className="mt-4 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${stat.color}`}
                style={{ width: `${parseFloat(stat.value.replace('%', '')) || 0}%` }}
              />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Storage Partitions */}
      {storageData?.partitions && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card rounded-2xl bg-white/80 dark:bg-gray-800/90 border border-white/30 dark:border-gray-700/50 shadow-sm mb-8 overflow-hidden"
        >
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Storage Partitions</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700/50">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">Device</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">Mount Point</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">Usage</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">Size</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {storageData.partitions.map((partition: any, idx: number) => (
                  <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-800 dark:text-gray-200">{partition.device}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{partition.mountpoint}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{partition.fstype}</td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 max-w-xs">
                          <div
                            className="h-2 rounded-full bg-orange-500"
                            style={{ width: `${partition.percent}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-600 dark:text-gray-400">{partition.percent}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{partition.used_gb}GB / {partition.total_gb}GB</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Network Statistics */}
      {networkData && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <div className="glass-card p-6 rounded-2xl bg-white/80 dark:bg-gray-800/90 border border-white/30 dark:border-gray-700/50 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <FiWifi className="w-5 h-5 text-cyan-500" />
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">Network Data</h3>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-500">Bytes Sent</p>
                <p className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                  {(networkData.io.bytes_sent / (1024**3)).toFixed(2)} GB
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Bytes Received</p>
                <p className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                  {(networkData.io.bytes_recv / (1024**3)).toFixed(2)} GB
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Active Connections</p>
                <p className="text-lg font-semibold text-gray-800 dark:text-gray-100">{networkData.connections}</p>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 rounded-2xl bg-white/80 dark:bg-gray-800/90 border border-white/30 dark:border-gray-700/50 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <FiActivity className="w-5 h-5 text-indigo-500" />
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">Network Packets</h3>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-500">Packets Sent</p>
                <p className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                  {networkData.io.packets_sent.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Packets Received</p>
                <p className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                  {networkData.io.packets_recv.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Errors In</p>
                <p className="text-lg font-semibold text-gray-800 dark:text-gray-100">{networkData.io.errin}</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </DashboardLayout>
  );
}
