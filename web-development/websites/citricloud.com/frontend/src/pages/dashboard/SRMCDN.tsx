import { useQuery } from '@tanstack/react-query';
import DashboardLayout from '../../components/DashboardLayout';
import { srmAPI } from '../../lib/api';
import { motion } from 'framer-motion';
import {
  FiGlobe, FiRefreshCw, FiCheckCircle, FiTrendingUp, FiShield, FiMapPin
} from 'react-icons/fi';
import { useState } from 'react';

export default function SRMCDN() {
  const [autoRefresh, setAutoRefresh] = useState(true);
  const isDark = document.documentElement.classList.contains('dark');

  const { data: cdnData, isLoading } = useQuery({
    queryKey: ['srm-cdn-overview'],
    queryFn: async () => {
      const response = await srmAPI.getCDNOverview();
      return response.data;
    },
    refetchInterval: autoRefresh ? 10000 : false,
  });

  if (isLoading) {
    return (
      <DashboardLayout title="CDN">
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
    <DashboardLayout title="CDN">
      <motion.div
        className="w-full"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className={`text-4xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>CDN & Content Delivery</h1>
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Global content delivery network performance and analytics</p>
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

        {/* CDN Overview */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
          variants={containerVariants}
        >
          <motion.div
            className={`rounded-xl p-6 ${isDark ? 'bg-gradient-to-br from-blue-900 to-blue-800 text-white' : 'bg-gradient-to-br from-blue-50 to-blue-100 text-gray-900 border border-blue-200'}`}
            variants={itemVariants}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Provider</h2>
              <FiGlobe className="w-5 h-5 text-blue-300" />
            </div>
            <div className="text-2xl font-bold mb-2">{cdnData?.cdn_provider}</div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-blue-200">{cdnData?.cdn_status}</span>
            </div>
          </motion.div>

          <motion.div
            className={`rounded-xl p-6 ${isDark ? 'bg-gradient-to-br from-purple-900 to-purple-800 text-white' : 'bg-gradient-to-br from-purple-50 to-purple-100 text-gray-900 border border-purple-200'}`}
            variants={itemVariants}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Cache Hit Ratio</h2>
              <FiTrendingUp className="w-5 h-5 text-purple-300" />
            </div>
            <div className="text-3xl font-bold text-purple-300 mb-2">{cdnData?.cache_status?.cache_hit_ratio}%</div>
            <div className="text-sm text-purple-200">Content delivery efficiency</div>
          </motion.div>

          <motion.div
            className={`rounded-xl p-6 ${isDark ? 'bg-gradient-to-br from-green-900 to-green-800 text-white' : 'bg-gradient-to-br from-green-50 to-green-100 text-gray-900 border border-green-200'}`}
            variants={itemVariants}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Cache Size</h2>
              <FiCheckCircle className="w-5 h-5 text-green-300" />
            </div>
            <div className="text-3xl font-bold text-green-300 mb-2">{cdnData?.cache_status?.cache_size_gb} GB</div>
            <div className="text-sm text-green-200">{(cdnData?.cache_status?.cached_files || 0).toLocaleString()} files</div>
          </motion.div>

          <motion.div
            className={`rounded-xl p-6 ${isDark ? 'bg-gradient-to-br from-orange-900 to-orange-800 text-white' : 'bg-gradient-to-br from-orange-50 to-orange-100 text-gray-900 border border-orange-200'}`}
            variants={itemVariants}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Bandwidth Saved</h2>
              <FiTrendingUp className="w-5 h-5 text-orange-300" />
            </div>
            <div className="text-3xl font-bold text-orange-300 mb-2">{cdnData?.traffic_acceleration?.total_bandwidth_saved_gb} GB</div>
            <div className="text-sm text-orange-200">{cdnData?.traffic_acceleration?.percentage_acceleration}% reduction</div>
          </motion.div>
        </motion.div>

        {/* Cache Status */}
        <motion.div
          className={`rounded-xl p-6 mb-8 ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200 shadow-sm'}`}
          variants={itemVariants}
        >
          <h2 className={`text-xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>Cache Performance</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className={`rounded-lg p-4 ${isDark ? 'bg-gray-900' : 'bg-gray-50 border border-gray-200'}`}>
              <div className={`text-sm mb-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Hit Ratio</div>
              <div className="text-4xl font-bold text-blue-400 mb-2">{cdnData?.cache_status?.cache_hit_ratio}%</div>
              <div className="flex items-center gap-2">
                <div className={`flex-1 h-2 rounded-full overflow-hidden ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600"
                    style={{ width: `${cdnData?.cache_status?.cache_hit_ratio}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className={`rounded-lg p-4 ${isDark ? 'bg-gray-900' : 'bg-gray-50 border border-gray-200'}`}>
              <div className={`text-sm mb-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Cache Size</div>
              <div className="text-3xl font-bold text-purple-400">{cdnData?.cache_status?.cache_size_gb}</div>
              <div className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>GB allocated</div>
            </div>

            <div className={`rounded-lg p-4 ${isDark ? 'bg-gray-900' : 'bg-gray-50 border border-gray-200'}`}>
              <div className={`text-sm mb-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Cached Files</div>
              <div className="text-3xl font-bold text-green-400">{(cdnData?.cache_status?.cached_files || 0).toLocaleString()}</div>
              <div className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Files in cache</div>
            </div>

            <div className={`rounded-lg p-4 ${isDark ? 'bg-gray-900' : 'bg-gray-50 border border-gray-200'}`}>
              <div className={`text-sm mb-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Purges (24h)</div>
              <div className="text-3xl font-bold text-yellow-400">{cdnData?.cache_status?.cache_purges_today}</div>
              <div className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Cache invalidations</div>
            </div>
          </div>
        </motion.div>

        {/* Edge Locations */}
        <motion.div
          className={`rounded-xl p-6 mb-8 ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200 shadow-sm'}`}
          variants={itemVariants}
        >
          <h2 className={`text-xl font-bold mb-6 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <FiMapPin className="w-5 h-5" />
            Edge Locations
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {cdnData?.edge_locations?.map((edge: any, idx: number) => (
              <div
                key={idx}
                className={`rounded-lg p-5 border transition-colors ${isDark ? 'bg-gray-900 border-gray-700 hover:border-gray-600' : 'bg-gray-50 border-gray-200 hover:border-gray-300'}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{edge.location}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm text-green-400">{edge.status}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Cache Hit Ratio</span>
                    <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{edge.cache_hit_ratio}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Requests/sec</span>
                    <span className="text-blue-400 font-semibold">{(edge.requests_per_sec).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Response Time</span>
                    <span className="text-green-400 font-semibold">{edge.avg_response_time_ms}ms</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Security & Analytics */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
          variants={containerVariants}
        >
          <motion.div
            className={`rounded-xl p-6 ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200 shadow-sm'}`}
            variants={itemVariants}
          >
            <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              <FiShield className="w-5 h-5" />
              Security
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>DDoS Attacks Blocked</span>
                <span className="text-orange-400 font-bold">{(cdnData?.security?.ddos_attacks_blocked || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Malicious Requests</span>
                <span className="text-red-400 font-bold">{(cdnData?.security?.malicious_requests_blocked || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Countries Allowed</span>
                <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{cdnData?.security?.countries_allowed}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>WAF Rules</span>
                <span className="text-green-400 font-semibold">{cdnData?.security?.waf_rules_enabled} active</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            className={`rounded-xl p-6 ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200 shadow-sm'}`}
            variants={itemVariants}
          >
            <h3 className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Analytics</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Unique Visitors</span>
                <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{(cdnData?.analytics?.unique_visitors || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Total Requests</span>
                <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{(cdnData?.analytics?.total_requests || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Bandwidth Saved</span>
                <span className="text-green-400 font-semibold">{cdnData?.analytics?.bandwidth_saved_percentage}%</span>
              </div>
              <div className={`flex justify-between items-center border-t pt-3 mt-3 ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <span className={`font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Cost Savings</span>
                <span className="text-blue-400 font-bold text-lg">${cdnData?.analytics?.cost_savings_usd}</span>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Traffic Acceleration Summary */}
        <motion.div
          className={`rounded-xl p-6 ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200 shadow-sm'}`}
          variants={itemVariants}
        >
          <h2 className={`text-xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>Traffic Acceleration</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`rounded-lg p-4 ${isDark ? 'bg-gray-900' : 'bg-gray-50 border border-gray-200'}`}>
              <div className={`text-sm mb-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total Bandwidth Saved</div>
              <div className="text-3xl font-bold text-blue-400 mb-2">{cdnData?.traffic_acceleration?.total_bandwidth_saved_gb} GB</div>
              <div className="text-xs text-gray-500">All-time savings</div>
            </div>

            <div className={`rounded-lg p-4 ${isDark ? 'bg-gray-900' : 'bg-gray-50 border border-gray-200'}`}>
              <div className={`text-sm mb-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Acceleration Rate</div>
              <div className="text-3xl font-bold text-green-400 mb-2">{cdnData?.traffic_acceleration?.percentage_acceleration}%</div>
              <div className="text-xs text-gray-500">Performance boost</div>
            </div>

            <div className={`rounded-lg p-4 ${isDark ? 'bg-gray-900' : 'bg-gray-50 border border-gray-200'}`}>
              <div className={`text-sm mb-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Latency Reduction</div>
              <div className="text-3xl font-bold text-purple-400 mb-2">{cdnData?.traffic_acceleration?.average_latency_reduction_ms}ms</div>
              <div className="text-xs text-gray-500">Average improvement</div>
            </div>
          </div>
        </motion.div>

        {/* Last Updated */}
        <motion.div
          className="mt-8 text-center text-gray-400 text-sm"
          variants={itemVariants}
        >
          Last updated: {new Date(cdnData?.timestamp || Date.now()).toLocaleTimeString()}
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
}
