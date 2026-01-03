import { useQuery } from '@tanstack/react-query';
import DashboardLayout from '../../components/DashboardLayout';
import { srmAPI } from '../../lib/api';
import { motion } from 'framer-motion';
import { FiDatabase, FiRefreshCw, FiServer } from 'react-icons/fi';
import { useState } from 'react';

export default function SRMDatabasesPage() {
  const [autoRefresh, setAutoRefresh] = useState(true);

  const { data: databasesData, refetch } = useQuery({
    queryKey: ['srm-databases'],
    queryFn: async () => {
      const response = await srmAPI.listDatabases();
      return response.data;
    },
    refetchInterval: autoRefresh ? 10000 : false,
  });

  const getTypeIcon = (type: string) => {
    if (type.includes('PostgreSQL')) return '🐘';
    if (type.includes('Redis')) return '🔴';
    if (type.includes('MySQL')) return '🐬';
    if (type.includes('MongoDB')) return '🍃';
    return '📦';
  };

  return (
    <DashboardLayout
      title="Server Resources - Databases"
      breadcrumb={<div className="text-xs text-gray-500">Database server management</div>}
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
          <span className="text-sm text-gray-600 dark:text-gray-300">Auto-refresh (10s)</span>
        </label>
        <button
          onClick={() => refetch()}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary-500 text-white text-sm hover:bg-primary-600 transition-colors"
        >
          <FiRefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Total Databases */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6 rounded-2xl bg-white/80 dark:bg-gray-800/90 border border-white/30 dark:border-gray-700/50 shadow-sm mb-8"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center text-white">
            <FiDatabase className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-gray-700 dark:text-gray-200">Total Databases</h3>
        </div>
        <p className="text-4xl font-bold text-gray-800 dark:text-gray-100">{databasesData?.total_databases || 0}</p>
      </motion.div>

      {/* Databases List */}
      <div className="space-y-4">
        {databasesData?.databases?.map((database: any, idx: number) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="glass-card p-6 rounded-2xl bg-white/80 dark:bg-gray-800/90 border border-white/30 dark:border-gray-700/50 shadow-sm"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="text-3xl">{getTypeIcon(database.type)}</div>
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-gray-100">{database.name}</h3>
                  <p className="text-xs text-gray-500">{database.type}</p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                database.status === 'running'
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
              }`}>
                {database.status}
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Host</p>
                <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{database.host}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Port</p>
                <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{database.port}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Size</p>
                <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{database.size_mb} MB</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Connections</p>
                <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{database.connections}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {(!databasesData?.databases || databasesData.databases.length === 0) && (
        <div className="text-center py-12">
          <p className="text-gray-500">No databases found</p>
        </div>
      )}
    </DashboardLayout>
  );
}
