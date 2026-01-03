import { useQuery } from '@tanstack/react-query';
import DashboardLayout from '../../components/DashboardLayout';
import { srmAPI } from '../../lib/api';
import { motion } from 'framer-motion';
import {
  FiDatabase, FiTrendingUp, FiRefreshCw, FiAlertCircle, FiCheckCircle
} from 'react-icons/fi';
import { useEffect, useState } from 'react';

export default function SRMCaches() {
  const [autoRefresh, setAutoRefresh] = useState(true);
  const isDark = document.documentElement.classList.contains('dark');

  const { data: cachesData, isLoading } = useQuery({
    queryKey: ['srm-caches-overview'],
    queryFn: async () => {
      const response = await srmAPI.getCachesOverview();
      return response.data;
    },
    refetchInterval: autoRefresh ? 5000 : false,
  });

  if (isLoading) {
    return (
      <DashboardLayout title="Caches">
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin">
            <FiRefreshCw className="w-8 h-8" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <DashboardLayout title="Caches">
      <motion.div
        className="w-full"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className={`text-4xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Cache Management</h1>
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Real-time cache statistics and performance metrics</p>
          </div>
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-4 py-2 rounded-lg transition-all ${
              autoRefresh
                ? 'bg-green-600 text-white'
                : isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
            }`}
          >
            <FiRefreshCw className={`inline w-4 h-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
            {autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* System Cache */}
          <motion.div
            className={`rounded-xl p-6 ${isDark ? 'bg-gradient-to-br from-blue-900 to-blue-800 text-white' : 'bg-gradient-to-br from-blue-50 to-blue-100 text-gray-900 border border-blue-200'}`}
            variants={itemVariants}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">System Cache</h2>
              <FiDatabase className={`w-5 h-5 ${isDark ? 'text-blue-300' : 'text-blue-600'}`} />
            </div>
            <div className="space-y-3">
              <div>
                <div className={`text-sm mb-1 ${isDark ? 'text-blue-200' : 'text-blue-700'}`}>Used Memory</div>
                <div className="text-2xl font-bold">{cachesData?.system_cache?.used_mb || 0} MB</div>
              </div>
              <div>
                <div className={`text-sm mb-1 ${isDark ? 'text-blue-200' : 'text-blue-700'}`}>Available</div>
                <div className="text-xl font-semibold">{cachesData?.system_cache?.available_mb || 0} MB</div>
              </div>
              <div>
                <div className={`text-sm mb-1 ${isDark ? 'text-blue-200' : 'text-blue-700'}`}>Hit Ratio</div>
                <div className="flex items-center">
                  <div className="text-xl font-semibold flex-1">{cachesData?.system_cache?.hit_ratio || 0}%</div>
                  <FiCheckCircle className="w-5 h-5 text-green-400" />
                </div>
              </div>
              <div>
                <div className={`text-sm mb-1 ${isDark ? 'text-blue-200' : 'text-blue-700'}`}>Evictions/sec</div>
                <div className="text-lg">{cachesData?.system_cache?.evictions_per_sec || 0}</div>
              </div>
            </div>
          </motion.div>

          {/* Redis Cache */}
          <motion.div
            className={`rounded-xl p-6 ${isDark ? 'bg-gradient-to-br from-red-900 to-red-800 text-white' : 'bg-gradient-to-br from-red-50 to-red-100 text-gray-900 border border-red-200'}`}
            variants={itemVariants}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Redis Cache</h2>
              <FiDatabase className={`w-5 h-5 ${isDark ? 'text-red-300' : 'text-red-600'}`} />
            </div>
            <div className="space-y-3">
              <div>
                <div className={`text-sm mb-1 ${isDark ? 'text-red-200' : 'text-red-700'}`}>Status</div>
                <div className="flex items-center">
                  <div className="text-lg font-semibold flex-1 capitalize">{cachesData?.redis_cache?.status || 'N/A'}</div>
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                </div>
              </div>
              <div>
                <div className={`text-sm mb-1 ${isDark ? 'text-red-200' : 'text-red-700'}`}>Memory Usage</div>
                <div className="text-xl font-semibold">{cachesData?.redis_cache?.memory_mb || 0} MB</div>
              </div>
              <div>
                <div className={`text-sm mb-1 ${isDark ? 'text-red-200' : 'text-red-700'}`}>Keys Stored</div>
                <div className="text-lg font-semibold">{(cachesData?.redis_cache?.keys_count || 0).toLocaleString()}</div>
              </div>
              <div>
                <div className={`text-sm mb-1 ${isDark ? 'text-red-200' : 'text-red-700'}`}>Commands/sec</div>
                <div className="flex items-center">
                  <div className="text-lg font-semibold">{cachesData?.redis_cache?.commands_per_sec || 0}</div>
                  <FiTrendingUp className="w-4 h-4 text-green-400 ml-2" />
                </div>
              </div>
            </div>
          </motion.div>

          {/* File Cache */}
          <motion.div
            className={`rounded-xl p-6 ${isDark ? 'bg-gradient-to-br from-purple-900 to-purple-800 text-white' : 'bg-gradient-to-br from-purple-50 to-purple-100 text-gray-900 border border-purple-200'}`}
            variants={itemVariants}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">File Cache</h2>
              <FiDatabase className={`w-5 h-5 ${isDark ? 'text-purple-300' : 'text-purple-600'}`} />
            </div>
            <div className="space-y-3">
              <div>
                <div className={`text-sm mb-1 ${isDark ? 'text-purple-200' : 'text-purple-700'}`}>Cache Path</div>
                <div className="text-sm font-mono">{cachesData?.file_cache?.path || 'N/A'}</div>
              </div>
              <div>
                <div className={`text-sm mb-1 ${isDark ? 'text-purple-200' : 'text-purple-700'}`}>Cache Size</div>
                <div className="text-xl font-semibold">{cachesData?.file_cache?.size_mb || 0} MB</div>
              </div>
              <div>
                <div className={`text-sm mb-1 ${isDark ? 'text-purple-200' : 'text-purple-700'}`}>Files Cached</div>
                <div className="text-lg font-semibold">{(cachesData?.file_cache?.files_cached || 0).toLocaleString()}</div>
              </div>
              <div>
                <div className={`text-sm mb-1 ${isDark ? 'text-purple-200' : 'text-purple-700'}`}>Hit Ratio</div>
                <div className="text-lg font-semibold">{cachesData?.file_cache?.hit_ratio || 0}%</div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Cache Performance Chart */}
        <motion.div
          className={`rounded-xl p-6 ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200 shadow-sm'}`}
          variants={itemVariants}
        >
          <h2 className={`text-xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>Cache Performance Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className={`rounded-lg p-4 ${isDark ? 'bg-gray-900' : 'bg-white border border-gray-200'}`}>
              <p className={`text-sm mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Overall Hit Ratio</p>
              <div className="flex items-center">
                <div className={`text-4xl font-bold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>{cachesData?.system_cache?.hit_ratio || 0}%</div>
                <div className={`ml-4 flex-1 h-12 rounded-lg overflow-hidden ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300"
                    style={{ width: `${cachesData?.system_cache?.hit_ratio || 0}%` }}
                  ></div>
                </div>
              </div>
            </div>
            <div className={`rounded-lg p-4 ${isDark ? 'bg-gray-900' : 'bg-white border border-gray-200'}`}>
              <p className={`text-sm mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>File Cache Hit Ratio</p>
              <div className="flex items-center">
                <div className={`text-4xl font-bold ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>{cachesData?.file_cache?.hit_ratio || 0}%</div>
                <div className={`ml-4 flex-1 h-12 rounded-lg overflow-hidden ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-purple-600 transition-all duration-300"
                    style={{ width: `${cachesData?.file_cache?.hit_ratio || 0}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Last Updated */}
        <motion.div
          className={`mt-6 text-center text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
          variants={itemVariants}
        >
          Last updated: {new Date(cachesData?.timestamp || Date.now()).toLocaleTimeString()}
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
}
