import { useQuery } from '@tanstack/react-query';
import DashboardLayout from '../../components/DashboardLayout';
import { srmAPI } from '../../lib/api';
import { motion } from 'framer-motion';
import { FiHardDrive, FiRefreshCw } from 'react-icons/fi';
import { useState } from 'react';

export default function SRMStoragePage() {
  const [autoRefresh, setAutoRefresh] = useState(true);

  const { data: storageData, refetch } = useQuery({
    queryKey: ['srm-storage-detail'],
    queryFn: async () => {
      const response = await srmAPI.getStorageOverview();
      return response.data;
    },
    refetchInterval: autoRefresh ? 10000 : false,
  });

  const getColorByUsage = (percent: number) => {
    if (percent < 50) return 'bg-green-500';
    if (percent < 75) return 'bg-yellow-500';
    if (percent < 90) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getTotalStats = () => {
    if (!storageData?.partitions) return { total: 0, used: 0, free: 0 };
    return storageData.partitions.reduce((acc: any, p: any) => ({
      total: acc.total + p.total_gb,
      used: acc.used + p.used_gb,
      free: acc.free + p.free_gb,
    }), { total: 0, used: 0, free: 0 });
  };

  const totalStats = getTotalStats();
  const totalPercent = totalStats.total > 0 ? (totalStats.used / totalStats.total * 100) : 0;

  return (
    <DashboardLayout
      title="Server Resources - Storage"
      breadcrumb={<div className="text-xs text-gray-500">Disk partitions and usage</div>}
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
          <span className="text-sm text-gray-600 dark:text-gray-300">Auto-refresh (10s)</span>
        </label>
        <button
          onClick={() => refetch()}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary-500 text-white text-sm hover:bg-primary-600 transition-colors"
        >
          <FiRefreshCw className="w-4 h-4" />
          Refresh
        </button>
        <span className="text-xs text-gray-500">
          Last updated: {new Date(storageData?.timestamp || '').toLocaleTimeString()}
        </span>
      </div>

      {/* Total Storage Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8 rounded-2xl bg-white/80 dark:bg-gray-800/90 border border-white/30 dark:border-gray-700/50 shadow-sm mb-8"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">Total Storage</h2>
            <p className="text-xs text-gray-500">Combined capacity of all partitions</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-gray-800 dark:text-gray-100">{totalPercent.toFixed(1)}%</p>
            <p className="text-xs text-gray-500">Used</p>
          </div>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 mb-4">
          <div
            className={`h-4 rounded-full transition-all ${getColorByUsage(totalPercent)}`}
            style={{ width: `${totalPercent}%` }}
          />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-gray-500 mb-1">Used</p>
            <p className="text-lg font-semibold text-gray-800 dark:text-gray-100">{totalStats.used.toFixed(1)} GB</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Free</p>
            <p className="text-lg font-semibold text-gray-800 dark:text-gray-100">{totalStats.free.toFixed(1)} GB</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Total</p>
            <p className="text-lg font-semibold text-gray-800 dark:text-gray-100">{totalStats.total.toFixed(1)} GB</p>
          </div>
        </div>
      </motion.div>

      {/* Individual Partitions */}
      <div className="space-y-4">
        {storageData?.partitions && storageData.partitions.map((partition: any, index: number) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass-card p-6 rounded-2xl bg-white/80 dark:bg-gray-800/90 border border-white/30 dark:border-gray-700/50 shadow-sm"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                  <FiHardDrive className="w-4 h-4" />
                  {partition.device}
                </h3>
                <p className="text-xs text-gray-500 mt-1">{partition.mountpoint} • {partition.fstype}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{partition.percent.toFixed(1)}%</p>
                <p className="text-xs text-gray-500">Usage</p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4">
              <div
                className={`h-2 rounded-full transition-all ${getColorByUsage(partition.percent)}`}
                style={{ width: `${partition.percent}%` }}
              />
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Used</p>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{partition.used_gb} GB</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Free</p>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{partition.free_gb} GB</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Total</p>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{partition.total_gb} GB</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {(!storageData?.partitions || storageData.partitions.length === 0) && (
        <div className="text-center py-12">
          <p className="text-gray-500">No storage information available</p>
        </div>
      )}
    </DashboardLayout>
  );
}
