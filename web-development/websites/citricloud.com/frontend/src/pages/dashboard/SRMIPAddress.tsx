import { useQuery } from '@tanstack/react-query';
import DashboardLayout from '../../components/DashboardLayout';
import { srmAPI } from '../../lib/api';
import { motion } from 'framer-motion';
import {
  FiWifi, FiRefreshCw, FiCheckCircle, FiMap, FiPackage, FiServer
} from 'react-icons/fi';
import { useState } from 'react';

export default function SRMIPAddress() {
  const [autoRefresh, setAutoRefresh] = useState(true);
  const isDark = document.documentElement.classList.contains('dark');

  const { data: ipData, isLoading } = useQuery({
    queryKey: ['srm-ipaddress-overview'],
    queryFn: async () => {
      const response = await srmAPI.getIPAddressOverview();
      return response.data;
    },
    refetchInterval: autoRefresh ? 10000 : false,
  });

  if (isLoading) {
    return (
      <DashboardLayout title="IP Address">
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
    <DashboardLayout title="IP Address">
      <motion.div
        className="w-full"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className={`text-4xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>IP Address & Network</h1>
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Network configuration and connectivity information</p>
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

        {/* IP Summary */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
          variants={containerVariants}
        >
          <motion.div
            className={`rounded-xl p-6 ${isDark ? 'bg-gradient-to-br from-green-900 to-green-800 text-white' : 'bg-gradient-to-br from-green-50 to-green-100 text-gray-900 border border-green-200'}`}
            variants={itemVariants}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Local IP</h2>
              <FiWifi className="w-5 h-5 text-green-300" />
            </div>
            <div className="text-4xl font-bold font-mono mb-4">{ipData?.local_ip}</div>
            <div className="text-sm text-green-200">
              Hostname: <span className="font-mono">{ipData?.local_hostname}</span>
            </div>
          </motion.div>

          <motion.div
            className={`rounded-xl p-6 ${isDark ? 'bg-gradient-to-br from-blue-900 to-blue-800 text-white' : 'bg-gradient-to-br from-blue-50 to-blue-100 text-gray-900 border border-blue-200'}`}
            variants={itemVariants}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Public IP</h2>
              <FiServer className="w-5 h-5 text-blue-300" />
            </div>
            <div className="text-4xl font-bold font-mono mb-4">{ipData?.public_ip}</div>
            <div className="text-sm text-blue-200">
              Location: <span className="font-semibold">{ipData?.city}, {ipData?.country}</span>
            </div>
          </motion.div>
        </motion.div>

        {/* ISP Information */}
        <motion.div
          className={`rounded-xl p-6 mb-8 ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200 shadow-sm'}`}
          variants={itemVariants}
        >
          <h2 className={`text-xl font-bold mb-6 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <FiMap className="w-5 h-5" />
            Geolocation & ISP
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className={`rounded-lg p-4 ${isDark ? 'bg-gray-900' : 'bg-white border border-gray-200'}`}>
              <div className={`text-xs mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Country</div>
              <div className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{ipData?.country}</div>
            </div>
            <div className={`rounded-lg p-4 ${isDark ? 'bg-gray-900' : 'bg-white border border-gray-200'}`}>
              <div className={`text-xs mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>City</div>
              <div className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{ipData?.city}</div>
            </div>
            <div className={`rounded-lg p-4 ${isDark ? 'bg-gray-900' : 'bg-white border border-gray-200'}`}>
              <div className={`text-xs mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>ISP Provider</div>
              <div className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{ipData?.isp}</div>
            </div>
            <div className={`rounded-lg p-4 ${isDark ? 'bg-gray-900' : 'bg-white border border-gray-200'}`}>
              <div className={`text-xs mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Connections</div>
              <div className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{(ipData?.connections_count || 0).toLocaleString()}</div>
            </div>
          </div>
        </motion.div>

        {/* Network Interfaces */}
        <motion.div
          className={`rounded-xl p-6 mb-8 ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200 shadow-sm'}`}
          variants={itemVariants}
        >
          <h2 className={`text-xl font-bold mb-6 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <FiPackage className="w-5 h-5" />
            Network Interfaces
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {ipData?.interfaces?.slice(0, 8).map((iface: any, idx: number) => (
              <div
                key={idx}
                className={`rounded-lg p-4 ${isDark ? 'bg-gray-900 border border-gray-700' : 'bg-white border border-gray-200 shadow-sm'}`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <FiCheckCircle className={`w-4 h-4 ${iface.address === ipData?.local_ip ? 'text-green-400' : 'text-gray-500'}`} />
                    <span className={`font-mono font-semibold truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>{iface.interface}</span>
                  </div>
                  <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{iface.family}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm break-words">
                  <div>
                    <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>IP:</span>
                    <span className="ml-2 font-mono text-blue-400 break-all">{iface.address}</span>
                  </div>
                  <div>
                    <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Netmask:</span>
                    <span className={`ml-2 font-mono ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{iface.netmask || 'N/A'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Network Statistics */}
        <motion.div
          className={`rounded-xl p-6 mb-8 ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200 shadow-sm'}`}
          variants={itemVariants}
        >
          <h2 className={`text-xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>Network Statistics</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                  <th className={`text-left py-3 px-3 font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Interface</th>
                  <th className={`text-left py-3 px-3 font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Status</th>
                  <th className={`text-left py-3 px-3 font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Speed (Mbps)</th>
                  <th className={`text-left py-3 px-3 font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>MTU</th>
                  <th className={`text-left py-3 px-3 font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>In Packets</th>
                  <th className={`text-left py-3 px-3 font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Out Packets</th>
                </tr>
              </thead>
              <tbody>
                {ipData?.network_stats?.map((stat: any, idx: number) => (
                  <tr key={idx} className={`border-b transition-colors ${isDark ? 'border-gray-700 hover:bg-gray-900/50' : 'border-gray-200 hover:bg-gray-50'}`}>
                    <td className={`py-3 px-3 font-mono ${isDark ? 'text-white' : 'text-gray-900'}`}>{stat.interface}</td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-1 rounded text-xs ${stat.is_up ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                        {stat.is_up ? 'UP' : 'DOWN'}
                      </span>
                    </td>
                    <td className={`py-3 px-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{stat.speed_mbps}</td>
                    <td className={`py-3 px-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{stat.mtu}</td>
                    <td className={`py-3 px-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{(stat.in_packets || 0).toLocaleString()}</td>
                    <td className={`py-3 px-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{(stat.out_packets || 0).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Traffic Summary */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
          variants={containerVariants}
        >
          <motion.div
            className={`rounded-xl p-6 ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200 shadow-sm'}`}
            variants={itemVariants}
          >
            <h3 className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Total Bytes Sent</h3>
            <div className="text-4xl font-bold text-blue-400 mb-2">
              {(ipData?.total_bytes_sent ? (ipData.total_bytes_sent / (1024**3)).toFixed(2) : '0')} GB
            </div>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>All-time traffic sent from this server</p>
          </motion.div>

          <motion.div
            className={`rounded-xl p-6 ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200 shadow-sm'}`}
            variants={itemVariants}
          >
            <h3 className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Total Bytes Received</h3>
            <div className="text-4xl font-bold text-green-400 mb-2">
              {(ipData?.total_bytes_recv ? (ipData.total_bytes_recv / (1024**3)).toFixed(2) : '0')} GB
            </div>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>All-time traffic received on this server</p>
          </motion.div>
        </motion.div>

        {/* Last Updated */}
        <motion.div
          className="mt-8 text-center text-gray-400 text-sm"
          variants={itemVariants}
        >
          Last updated: {new Date(ipData?.timestamp || Date.now()).toLocaleTimeString()}
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
}
