import { useQuery } from '@tanstack/react-query';
import DashboardLayout from '../../components/DashboardLayout';
import { srmAPI } from '../../lib/api';
import { motion } from 'framer-motion';
import { FiCpu, FiRefreshCw } from 'react-icons/fi';
import { useState } from 'react';

export default function SRMCPUPage() {
  const [autoRefresh, setAutoRefresh] = useState(true);

  const { data: cpuData, refetch } = useQuery({
    queryKey: ['srm-cpu-detail'],
    queryFn: async () => {
      const response = await srmAPI.getCPUUsage();
      return response.data;
    },
    refetchInterval: autoRefresh ? 3000 : false,
  });

  const getColorByUsage = (percent: number) => {
    if (percent < 30) return 'bg-green-500';
    if (percent < 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <DashboardLayout
      title="Server Resources - CPU Usage"
      breadcrumb={<div className="text-xs text-gray-500">Real-time CPU monitoring</div>}
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
          <span className="text-sm text-gray-600 dark:text-gray-300">Auto-refresh (3s)</span>
        </label>
        <button
          onClick={() => refetch()}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary-500 text-white text-sm hover:bg-primary-600 transition-colors"
        >
          <FiRefreshCw className="w-4 h-4" />
          Refresh
        </button>
        <span className="text-xs text-gray-500">
          Last updated: {new Date(cpuData?.timestamp || '').toLocaleTimeString()}
        </span>
      </div>

      {/* Overall CPU Usage */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8 rounded-2xl bg-white/80 dark:bg-gray-800/90 border border-white/30 dark:border-gray-700/50 shadow-sm mb-8"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">Overall CPU Usage</h2>
            <p className="text-xs text-gray-500">Total system CPU utilization</p>
          </div>
          <div className="w-20 h-20 rounded-full flex items-center justify-center border-4 border-gray-200 dark:border-gray-700"
               style={{
                 borderColor: 'rgba(200,200,200,0.2)',
                 background: `conic-gradient(${getColorByUsage(cpuData?.overall_percent || 0).replace('bg-', '')} 0% ${cpuData?.overall_percent || 0}%, rgba(200,200,200,0.1) ${cpuData?.overall_percent || 0}%)`
               }}>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{cpuData?.overall_percent?.toFixed(1) || 0}%</p>
              <p className="text-xs text-gray-500">Usage</p>
            </div>
          </div>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all ${getColorByUsage(cpuData?.overall_percent || 0)}`}
            style={{ width: `${cpuData?.overall_percent || 0}%` }}
          />
        </div>
      </motion.div>

      {/* CPU Frequency and Times */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6 rounded-2xl bg-white/80 dark:bg-gray-800/90 border border-white/30 dark:border-gray-700/50 shadow-sm"
        >
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-4">CPU Frequency</h3>
          <div className="space-y-4">
            <div>
              <p className="text-xs text-gray-500 mb-1">Current</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{cpuData?.frequency?.current_ghz || 0} GHz</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Minimum</p>
              <p className="text-lg font-semibold text-gray-800 dark:text-gray-100">{cpuData?.frequency?.min_ghz || 0} GHz</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Maximum</p>
              <p className="text-lg font-semibold text-gray-800 dark:text-gray-100">{cpuData?.frequency?.max_ghz || 0} GHz</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="glass-card p-6 rounded-2xl bg-white/80 dark:bg-gray-800/90 border border-white/30 dark:border-gray-700/50 shadow-sm"
        >
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-4">CPU Time Distribution</h3>
          <div className="space-y-3">
            {cpuData?.times && Object.entries(cpuData.times).map(([key, value]: [string, any]) => (
              <div key={key}>
                <div className="flex justify-between mb-1">
                  <p className="text-xs text-gray-500 capitalize">{key}</p>
                  <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">{value?.toFixed(1) || 0}%</p>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                  <div
                    className="h-1.5 rounded-full bg-blue-500"
                    style={{ width: `${value || 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Per-CPU Usage */}
      {cpuData?.per_cpu_percent && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6 rounded-2xl bg-white/80 dark:bg-gray-800/90 border border-white/30 dark:border-gray-700/50 shadow-sm"
        >
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-6">Per-CPU Usage</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {cpuData.per_cpu_percent.map((cpu: number, index: number) => (
              <div key={index} className="text-center">
                <p className="text-xs text-gray-500 mb-2">CPU {index}</p>
                <div className="relative h-24 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-end justify-center p-2">
                  <div
                    className={`w-full rounded ${getColorByUsage(cpu)} transition-all`}
                    style={{ height: `${cpu}%` }}
                  />
                </div>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 mt-2">{cpu?.toFixed(1) || 0}%</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </DashboardLayout>
  );
}
