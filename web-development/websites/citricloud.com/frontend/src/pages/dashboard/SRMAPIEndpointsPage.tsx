import { useQuery } from '@tanstack/react-query';
import DashboardLayout from '../../components/DashboardLayout';
import { srmAPI } from '../../lib/api';
import { motion } from 'framer-motion';
import { FiGitBranch, FiRefreshCw, FiZap } from 'react-icons/fi';
import { useState } from 'react';

export default function SRMAPIEndpointsPage() {
  const [autoRefresh, setAutoRefresh] = useState(true);

  const { data: endpointsData, refetch } = useQuery({
    queryKey: ['srm-api-endpoints'],
    queryFn: async () => {
      const response = await srmAPI.listAPIEndpoints();
      return response.data;
    },
    refetchInterval: autoRefresh ? 10000 : false,
  });

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'POST': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'PUT': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'DELETE': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case 'PATCH': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  return (
    <DashboardLayout
      title="Server Resources - API Endpoints"
      breadcrumb={<div className="text-xs text-gray-500">API endpoint monitoring</div>}
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

      {/* Total Endpoints */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6 rounded-2xl bg-white/80 dark:bg-gray-800/90 border border-white/30 dark:border-gray-700/50 shadow-sm mb-8"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-purple-500 flex items-center justify-center text-white">
            <FiGitBranch className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-gray-700 dark:text-gray-200">Total API Endpoints</h3>
        </div>
        <p className="text-4xl font-bold text-gray-800 dark:text-gray-100">{endpointsData?.total_endpoints || 0}</p>
      </motion.div>

      {/* Endpoints List */}
      <div className="space-y-4">
        {endpointsData?.endpoints?.map((endpoint: any, idx: number) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="glass-card p-6 rounded-2xl bg-white/80 dark:bg-gray-800/90 border border-white/30 dark:border-gray-700/50 shadow-sm"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${getMethodColor(endpoint.method)}`}>
                    {endpoint.method}
                  </span>
                  <code className="text-sm font-mono text-gray-800 dark:text-gray-200">{endpoint.path}</code>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{endpoint.description}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                endpoint.status === 'active'
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
              }`}>
                {endpoint.status}
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div>
                <p className="text-xs text-gray-500 mb-1 flex items-center gap-2">
                  <FiZap className="w-3 h-3" />
                  Hits
                </p>
                <p className="text-lg font-semibold text-gray-800 dark:text-gray-100">{endpoint.hits.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Avg Response Time</p>
                <p className="text-lg font-semibold text-gray-800 dark:text-gray-100">{endpoint.avg_response_time_ms}ms</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Performance</p>
                <p className={`text-lg font-semibold ${
                  endpoint.avg_response_time_ms < 100 ? 'text-green-600' :
                  endpoint.avg_response_time_ms < 300 ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  {endpoint.avg_response_time_ms < 100 ? '✓ Good' :
                   endpoint.avg_response_time_ms < 300 ? '⚠ Fair' : '✗ Slow'}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {(!endpointsData?.endpoints || endpointsData.endpoints.length === 0) && (
        <div className="text-center py-12">
          <p className="text-gray-500">No API endpoints found</p>
        </div>
      )}
    </DashboardLayout>
  );
}
