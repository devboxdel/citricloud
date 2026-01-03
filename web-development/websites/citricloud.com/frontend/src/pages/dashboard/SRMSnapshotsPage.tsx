import { useQuery } from '@tanstack/react-query';
import DashboardLayout from '../../components/DashboardLayout';
import { srmAPI } from '../../lib/api';
import { motion } from 'framer-motion';
import { FiCamera, FiRefreshCw } from 'react-icons/fi';
import { useState } from 'react';

export default function SRMSnapshotsPage() {
  const [autoRefresh, setAutoRefresh] = useState(false);

  const { data: snapshotsData, refetch } = useQuery({
    queryKey: ['srm-snapshots'],
    queryFn: async () => {
      const response = await srmAPI.listSnapshots();
      return response.data;
    },
    refetchInterval: autoRefresh ? 30000 : false,
  });

  const getTotalSnapshotSize = () => {
    if (!snapshotsData?.snapshots) return 0;
    return snapshotsData.snapshots.reduce((sum: number, s: any) => sum + s.size_mb, 0);
  };

  return (
    <DashboardLayout
      title="Server Resources - Snapshots"
      breadcrumb={<div className="text-xs text-gray-500">System snapshot management</div>}
    >
      {/* Controls */}
      <div className="mb-6 flex items-center gap-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={autoRefresh}
            onChange={(e) => setAutoRefresh(e.target.checked)}
            className="w-4 h-4 rounded"
          />
          <span className="text-sm text-gray-600 dark:text-gray-300">Auto-refresh (30s)</span>
        </label>
        <button
          onClick={() => refetch()}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary-500 text-white text-sm hover:bg-primary-600 transition-colors"
        >
          <FiRefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 rounded-2xl bg-white/80 dark:bg-gray-800/90 border border-white/30 dark:border-gray-700/50 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-purple-500 flex items-center justify-center text-white">
              <FiCamera className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-gray-700 dark:text-gray-200">Total Snapshots</h3>
          </div>
          <p className="text-3xl font-bold text-gray-800 dark:text-gray-100">{snapshotsData?.total_snapshots || 0}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6 rounded-2xl bg-white/80 dark:bg-gray-800/90 border border-white/30 dark:border-gray-700/50 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-indigo-500 flex items-center justify-center text-white">
              <FiCamera className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-gray-700 dark:text-gray-200">Total Size</h3>
          </div>
          <p className="text-3xl font-bold text-gray-800 dark:text-gray-100">{getTotalSnapshotSize().toFixed(2)} MB</p>
        </motion.div>
      </div>

      {/* Snapshots List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card rounded-2xl bg-white/80 dark:bg-gray-800/90 border border-white/30 dark:border-gray-700/50 shadow-sm overflow-hidden"
      >
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Snapshot Files</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700/50">
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">Filename</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">Size</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">Created</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">Modified</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {snapshotsData?.snapshots?.map((snapshot: any, idx: number) => (
                <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-gray-800 dark:text-gray-200">{snapshot.filename}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{snapshot.size_mb} MB</td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                    {new Date(snapshot.created_at).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                    {new Date(snapshot.modified_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {(!snapshotsData?.snapshots || snapshotsData.snapshots.length === 0) && (
          <div className="text-center py-12">
            <p className="text-gray-500">No snapshots found</p>
          </div>
        )}
      </motion.div>
    </DashboardLayout>
  );
}
