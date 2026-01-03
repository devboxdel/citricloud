import { useQuery } from '@tanstack/react-query';
import DashboardLayout from '../../components/DashboardLayout';
import { srmAPI } from '../../lib/api';
import { motion } from 'framer-motion';
import {
  FiZap, FiRefreshCw, FiTrendingUp, FiActivity, FiHardDrive, FiLayers
} from 'react-icons/fi';
import { useState } from 'react';

export default function SRMPerformance() {
  const [autoRefresh, setAutoRefresh] = useState(true);
  const isDark = document.documentElement.classList.contains('dark');

  const { data: perfData, isLoading } = useQuery({
    queryKey: ['srm-performance-overview'],
    queryFn: async () => {
      const response = await srmAPI.getPerformanceOverview();
      return response.data;
    },
    refetchInterval: autoRefresh ? 3000 : false,
  });

  if (isLoading) {
    return (
      <DashboardLayout title="Performance">
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

  const getPerformanceColor = (percent: number) => {
    if (percent < 50) return 'text-green-400';
    if (percent < 75) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <DashboardLayout title="Performance">
      <motion.div
        className="w-full"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className={`text-4xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Performance Metrics</h1>
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Real-time server performance and speed analysis</p>
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

        {/* Key Performance Indicators */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
          variants={containerVariants}
        >
          <motion.div
            className={`rounded-xl p-6 ${isDark ? 'bg-gradient-to-br from-blue-900 to-blue-800 text-white' : 'bg-gradient-to-br from-blue-50 to-blue-100 text-gray-900 border border-blue-200'}`}
            variants={itemVariants}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">CPU Performance</h2>
              <FiZap className="w-5 h-5 text-blue-300" />
            </div>
            <div className={`text-4xl font-bold mb-2 ${getPerformanceColor(perfData?.cpu_performance?.current_usage_percent)}`}>
              {perfData?.cpu_performance?.current_usage_percent?.toFixed(1)}%
            </div>
            <div className="text-sm text-blue-200">Current Usage</div>
            <div className="mt-3 text-xs text-blue-300">Response: {perfData?.cpu_performance?.response_time_ms}ms</div>
          </motion.div>

          <motion.div
            className={`rounded-xl p-6 ${isDark ? 'bg-gradient-to-br from-purple-900 to-purple-800 text-white' : 'bg-gradient-to-br from-purple-50 to-purple-100 text-gray-900 border border-purple-200'}`}
            variants={itemVariants}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Memory</h2>
              <FiActivity className="w-5 h-5 text-purple-300" />
            </div>
            <div className={`text-4xl font-bold mb-2 ${getPerformanceColor(perfData?.memory_performance?.current_usage_percent)}`}>
              {perfData?.memory_performance?.current_usage_percent?.toFixed(1)}%
            </div>
            <div className="text-sm text-purple-200">
              {perfData?.memory_performance?.used_gb?.toFixed(2)}GB / {perfData?.memory_performance?.total_gb?.toFixed(2)}GB
            </div>
          </motion.div>

          <motion.div
            className={`rounded-xl p-6 ${isDark ? 'bg-gradient-to-br from-orange-900 to-orange-800 text-white' : 'bg-gradient-to-br from-orange-50 to-orange-100 text-gray-900 border border-orange-200'}`}
            variants={itemVariants}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Uptime</h2>
              <FiTrendingUp className="w-5 h-5 text-orange-300" />
            </div>
            <div className="text-4xl font-bold text-green-400 mb-2">{perfData?.uptime_percent}%</div>
            <div className="text-sm text-orange-200">Server Availability</div>
          </motion.div>

          <motion.div
            className={`rounded-xl p-6 ${isDark ? 'bg-gradient-to-br from-green-900 to-green-800 text-white' : 'bg-gradient-to-br from-green-50 to-green-100 text-gray-900 border border-green-200'}`}
            variants={itemVariants}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Throughput</h2>
              <FiZap className="w-5 h-5 text-green-300" />
            </div>
            <div className="text-4xl font-bold mb-2">{(perfData?.request_throughput || 0).toLocaleString()}</div>
            <div className="text-sm text-green-200">Requests per minute</div>
          </motion.div>
        </motion.div>

        {/* CPU Performance Details */}
        <motion.div
          className={`rounded-xl p-6 mb-8 ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200 shadow-sm'}`}
          variants={itemVariants}
        >
          <h2 className={`text-xl font-bold mb-6 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <FiZap className="w-5 h-5" />
            CPU Performance Analysis
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className={`rounded-lg p-4 ${isDark ? 'bg-gray-900' : 'bg-white border border-gray-200'}`}>
              <div className={`text-sm mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Current Usage</div>
              <div className="text-2xl font-bold text-blue-400">{perfData?.cpu_performance?.current_usage_percent?.toFixed(1)}%</div>
              <div className={`mt-3 h-2 rounded-full overflow-hidden ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-blue-600"
                  style={{ width: `${perfData?.cpu_performance?.current_usage_percent}%` }}
                ></div>
              </div>
            </div>

            <div className={`rounded-lg p-4 ${isDark ? 'bg-gray-900' : 'bg-white border border-gray-200'}`}>
              <div className={`text-sm mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>1 Min Average</div>
              <div className="text-2xl font-bold text-yellow-400">{perfData?.cpu_performance?.average_load_1min?.toFixed(2)}</div>
              <div className="text-xs text-gray-400 mt-2">Load average</div>
            </div>

            <div className={`rounded-lg p-4 ${isDark ? 'bg-gray-900' : 'bg-white border border-gray-200'}`}>
              <div className={`text-sm mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>5 Min Average</div>
              <div className="text-2xl font-bold text-yellow-400">{perfData?.cpu_performance?.average_load_5min?.toFixed(2)}</div>
              <div className="text-xs text-gray-400 mt-2">Load average</div>
            </div>

            <div className={`rounded-lg p-4 ${isDark ? 'bg-gray-900' : 'bg-white border border-gray-200'}`}>
              <div className={`text-sm mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>15 Min Average</div>
              <div className="text-2xl font-bold text-yellow-400">{perfData?.cpu_performance?.average_load_15min?.toFixed(2)}</div>
              <div className="text-xs text-gray-400 mt-2">Load average</div>
            </div>
          </div>
        </motion.div>

        {/* Disk Performance */}
        <motion.div
          className={`rounded-xl p-6 mb-8 ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200 shadow-sm'}`}
          variants={itemVariants}
        >
          <h2 className={`text-xl font-bold mb-6 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <FiHardDrive className="w-5 h-5" />
            Disk I/O Performance
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`rounded-lg p-4 ${isDark ? 'bg-gray-900' : 'bg-white border border-gray-200'}`}>
              <div className={`text-sm mb-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Read Operations</div>
              <div className="text-3xl font-bold text-blue-400 mb-2">{(perfData?.disk_performance?.read_count || 0).toLocaleString()}</div>
              <div className="text-xs text-gray-400">Total reads: {(perfData?.disk_performance?.read_bytes ? (perfData.disk_performance.read_bytes / (1024**3)).toFixed(2) : 0)} GB</div>
              <div className="text-xs text-gray-400">Time: {perfData?.disk_performance?.read_time_ms}ms</div>
            </div>

            <div className={`rounded-lg p-4 ${isDark ? 'bg-gray-900' : 'bg-white border border-gray-200'}`}>
              <div className={`text-sm mb-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Write Operations</div>
              <div className="text-3xl font-bold text-purple-400 mb-2">{(perfData?.disk_performance?.write_count || 0).toLocaleString()}</div>
              <div className="text-xs text-gray-400">Total writes: {(perfData?.disk_performance?.write_bytes ? (perfData.disk_performance.write_bytes / (1024**3)).toFixed(2) : 0)} GB</div>
              <div className="text-xs text-gray-400">Time: {perfData?.disk_performance?.write_time_ms}ms</div>
            </div>

            <div className={`rounded-lg p-4 ${isDark ? 'bg-gray-900' : 'bg-white border border-gray-200'}`}>
              <div className={`text-sm mb-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total I/O</div>
              <div className="text-3xl font-bold text-green-400 mb-2">{((perfData?.disk_performance?.read_count || 0) + (perfData?.disk_performance?.write_count || 0)).toLocaleString()}</div>
              <div className="text-xs text-gray-400">Combined operations</div>
            </div>
          </div>
        </motion.div>

        {/* Page Load Times */}
        <motion.div
          className={`rounded-xl p-6 mb-8 ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200 shadow-sm'}`}
          variants={itemVariants}
        >
          <h2 className={`text-xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>Page Load Times</h2>
          <div className="space-y-4">
            {[
              { name: 'Homepage', time: perfData?.page_load_times?.homepage_ms, icon: '🏠' },
              { name: 'Dashboard', time: perfData?.page_load_times?.dashboard_ms, icon: '📊' },
              { name: 'API Average', time: perfData?.page_load_times?.api_average_ms, icon: '⚙️' },
              { name: 'Database Query', time: perfData?.page_load_times?.database_average_ms, icon: '🗄️' },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-4">
                <span className="text-2xl w-8">{item.icon}</span>
                <div className="flex-1">
                  <div className="flex justify-between mb-2">
                    <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{item.name}</span>
                    <span className={`font-bold ${item.time < 200 ? 'text-green-400' : item.time < 500 ? 'text-yellow-400' : 'text-red-400'}`}>
                      {item.time}ms
                    </span>
                  </div>
                  <div className={`h-3 rounded-full overflow-hidden ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                    <div
                      className={`h-full rounded-full transition-all ${
                        item.time < 200
                          ? 'bg-gradient-to-r from-green-500 to-green-600'
                          : item.time < 500
                          ? 'bg-gradient-to-r from-yellow-500 to-yellow-600'
                          : 'bg-gradient-to-r from-red-500 to-red-600'
                      }`}
                      style={{ width: `${Math.min((item.time / 500) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Performance Summary */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
          variants={containerVariants}
        >
          <motion.div
            className={`rounded-xl p-6 ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200 shadow-sm'}`}
            variants={itemVariants}
          >
            <h3 className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Memory Performance</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Total Memory</span>
                <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{perfData?.memory_performance?.total_gb?.toFixed(2)} GB</span>
              </div>
              <div className="flex justify-between">
                <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Used Memory</span>
                <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{perfData?.memory_performance?.used_gb?.toFixed(2)} GB</span>
              </div>
              <div className="flex justify-between">
                <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Available Memory</span>
                <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{perfData?.memory_performance?.available_gb?.toFixed(2)} GB</span>
              </div>
              <div className={`border-t pt-3 mt-3 flex justify-between ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <span className={`font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Usage Percentage</span>
                <span className={`font-bold text-lg ${getPerformanceColor(perfData?.memory_performance?.current_usage_percent)}`}>
                  {perfData?.memory_performance?.current_usage_percent?.toFixed(1)}%
                </span>
              </div>
            </div>
          </motion.div>

          <motion.div
            className={`rounded-xl p-6 ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200 shadow-sm'}`}
            variants={itemVariants}
          >
            <h3 className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>System Health</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Server Uptime</span>
                <span className="text-green-400 font-bold">{perfData?.uptime_percent}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Response Time</span>
                <span className="text-blue-400 font-bold">{perfData?.cpu_performance?.response_time_ms}ms</span>
              </div>
              <div className="flex justify-between items-center">
                <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Throughput</span>
                <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{(perfData?.request_throughput || 0).toLocaleString()} req/min</span>
              </div>
              <div className={`border-t pt-3 mt-3 flex justify-between items-center ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <span className={`font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Overall Status</span>
                <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm font-semibold">Excellent</span>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Last Updated */}
        <motion.div
          className="mt-8 text-center text-gray-400 text-sm"
          variants={itemVariants}
        >
          Last updated: {new Date(perfData?.timestamp || Date.now()).toLocaleTimeString()}
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
}
