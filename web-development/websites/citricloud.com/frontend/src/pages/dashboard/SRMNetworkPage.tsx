import { useQuery } from '@tanstack/react-query';
import DashboardLayout from '../../components/DashboardLayout';
import { srmAPI } from '../../lib/api';
import { motion } from 'framer-motion';
import { FiWifi, FiRefreshCw, FiArrowUp, FiArrowDown } from 'react-icons/fi';
import { useState, useEffect } from 'react';

export default function SRMNetworkPage() {
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [networkHistory, setNetworkHistory] = useState<any[]>([]);

  const { data: networkData, refetch } = useQuery({
    queryKey: ['srm-network-detail'],
    queryFn: async () => {
      const response = await srmAPI.getNetworkStats();
      return response.data;
    },
    refetchInterval: autoRefresh ? 5000 : false,
  });

  // Track network history for chart-like visualization
  useEffect(() => {
    if (networkData) {
      setNetworkHistory(prev => {
        const updated = [...prev, networkData];
        return updated.slice(-20); // Keep last 20 measurements
      });
    }
  }, [networkData]);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i];
  };

  return (
    <DashboardLayout
      title="Server Resources - Network"
      breadcrumb={<div className="text-xs text-gray-500">Real-time network monitoring</div>}
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
          onClick={() => refetch()}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary-500 text-white text-sm hover:bg-primary-600 transition-colors"
        >
          <FiRefreshCw className="w-4 h-4" />
          Refresh
        </button>
        <span className="text-xs text-gray-500">
          Last updated: {new Date(networkData?.timestamp || '').toLocaleTimeString()}
        </span>
      </div>

      {/* Network Traffic Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8 rounded-2xl bg-white/80 dark:bg-gray-800/90 border border-white/30 dark:border-gray-700/50 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-green-500 flex items-center justify-center text-white">
              <FiArrowUp className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-700 dark:text-gray-200">Data Sent</h3>
              <p className="text-xs text-gray-500">Total bytes transmitted</p>
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">
            {formatBytes(networkData?.io?.bytes_sent || 0)}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {networkData?.io?.packets_sent?.toLocaleString() || 0} packets
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-8 rounded-2xl bg-white/80 dark:bg-gray-800/90 border border-white/30 dark:border-gray-700/50 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center text-white">
              <FiArrowDown className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-700 dark:text-gray-200">Data Received</h3>
              <p className="text-xs text-gray-500">Total bytes received</p>
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">
            {formatBytes(networkData?.io?.bytes_recv || 0)}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {networkData?.io?.packets_recv?.toLocaleString() || 0} packets
          </p>
        </motion.div>
      </div>

      {/* Connections */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card p-8 rounded-2xl bg-white/80 dark:bg-gray-800/90 border border-white/30 dark:border-gray-700/50 shadow-sm mb-8"
      >
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-6">Active Connections</h2>
        <p className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-2">{networkData?.connections || 0}</p>
        <p className="text-sm text-gray-600 dark:text-gray-400">Active network connections (IPv4)</p>
      </motion.div>

      {/* Errors and Drops */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-6 rounded-2xl bg-white/80 dark:bg-gray-800/90 border border-white/30 dark:border-gray-700/50 shadow-sm"
        >
          <h3 className="font-semibold text-gray-700 dark:text-gray-200 mb-6">Errors</h3>
          <div className="space-y-4">
            <div>
              <p className="text-xs text-gray-500 mb-1">Errors In</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{networkData?.io?.errin || 0}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Errors Out</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{networkData?.io?.errout || 0}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="glass-card p-6 rounded-2xl bg-white/80 dark:bg-gray-800/90 border border-white/30 dark:border-gray-700/50 shadow-sm"
        >
          <h3 className="font-semibold text-gray-700 dark:text-gray-200 mb-6">Dropped Packets</h3>
          <div className="space-y-4">
            <div>
              <p className="text-xs text-gray-500 mb-1">Dropped In</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{networkData?.io?.dropin || 0}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Dropped Out</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{networkData?.io?.dropout || 0}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Network History Chart */}
      {networkHistory.length > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card p-6 rounded-2xl bg-white/80 dark:bg-gray-800/90 border border-white/30 dark:border-gray-700/50 shadow-sm"
        >
          <h3 className="font-semibold text-gray-700 dark:text-gray-200 mb-6">Network Trend (Last 20 Updates)</h3>
          <div className="space-y-4">
            <div>
              <p className="text-xs text-gray-500 mb-2">Data Sent Trend</p>
              <div className="flex items-end gap-1 h-16 bg-gray-100 dark:bg-gray-700 p-2 rounded-lg">
                {networkHistory.map((point, idx) => (
                  <div
                    key={idx}
                    className="flex-1 bg-green-500 rounded-sm transition-all"
                    style={{
                      height: `${Math.min(100, (point.io.bytes_sent / (networkHistory[networkHistory.length - 1].io.bytes_sent || 1)) * 100)}%`,
                      opacity: 0.5 + (idx / networkHistory.length) * 0.5,
                    }}
                    title={formatBytes(point.io.bytes_sent)}
                  />
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs text-gray-500 mb-2">Data Received Trend</p>
              <div className="flex items-end gap-1 h-16 bg-gray-100 dark:bg-gray-700 p-2 rounded-lg">
                {networkHistory.map((point, idx) => (
                  <div
                    key={idx}
                    className="flex-1 bg-blue-500 rounded-sm transition-all"
                    style={{
                      height: `${Math.min(100, (point.io.bytes_recv / (networkHistory[networkHistory.length - 1].io.bytes_recv || 1)) * 100)}%`,
                      opacity: 0.5 + (idx / networkHistory.length) * 0.5,
                    }}
                    title={formatBytes(point.io.bytes_recv)}
                  />
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </DashboardLayout>
  );
}
