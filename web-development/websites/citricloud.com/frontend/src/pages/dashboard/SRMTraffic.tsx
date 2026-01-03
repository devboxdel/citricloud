import { useQuery } from '@tanstack/react-query';
import DashboardLayout from '../../components/DashboardLayout';
import { srmAPI } from '../../lib/api';
import { motion } from 'framer-motion';
import {
  FiBarChart2, FiRefreshCw, FiTrendingUp, FiUsers, FiArrowUp, FiArrowDown
} from 'react-icons/fi';
import { useState } from 'react';

export default function SRMTraffic() {
  const [autoRefresh, setAutoRefresh] = useState(true);
  const isDark = document.documentElement.classList.contains('dark');

  const { data: trafficData, isLoading } = useQuery({
    queryKey: ['srm-traffic-overview'],
    queryFn: async () => {
      const response = await srmAPI.getTrafficOverview();
      return response.data;
    },
    refetchInterval: autoRefresh ? 5000 : false,
  });

  if (isLoading) {
    return (
      <DashboardLayout title="Traffic">
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
    <DashboardLayout title="Traffic">
      <motion.div
        className="w-full"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className={`text-4xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Traffic Analytics</h1>
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Real-time bandwidth and traffic distribution monitoring</p>
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

        {/* Bandwidth Summary */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
          variants={containerVariants}
        >
          <motion.div
            className={`rounded-xl p-6 ${isDark ? 'bg-gradient-to-br from-blue-900 to-blue-800 text-white' : 'bg-gradient-to-br from-blue-50 to-blue-100 text-gray-900 border border-blue-200'}`}
            variants={itemVariants}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Data Sent</h2>
              <FiArrowUp className="w-5 h-5 text-blue-300" />
            </div>
            <div className="space-y-3">
              <div>
                <div className="text-3xl font-bold mb-1">{trafficData?.bandwidth?.total_sent_gb} GB</div>
                <div className="text-sm text-blue-200">Total Data Sent (All-time)</div>
              </div>
              <div className="bg-blue-900/50 rounded px-3 py-2">
                <div className="text-sm mb-1">Current Rate</div>
                <div className="text-xl font-semibold">{trafficData?.bandwidth?.current_sent_mbps} Mbps</div>
              </div>
              <div className="text-xs text-blue-300">Peak: {trafficData?.bandwidth?.peak_sent_mbps} Mbps</div>
            </div>
          </motion.div>

          <motion.div
            className={`rounded-xl p-6 ${isDark ? 'bg-gradient-to-br from-green-900 to-green-800 text-white' : 'bg-gradient-to-br from-green-50 to-green-100 text-gray-900 border border-green-200'}`}
            variants={itemVariants}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Data Received</h2>
              <FiArrowDown className="w-5 h-5 text-green-300" />
            </div>
            <div className="space-y-3">
              <div>
                <div className="text-3xl font-bold mb-1">{trafficData?.bandwidth?.total_recv_gb} GB</div>
                <div className="text-sm text-green-200">Total Data Received (All-time)</div>
              </div>
              <div className="bg-green-900/50 rounded px-3 py-2">
                <div className="text-sm mb-1">Current Rate</div>
                <div className="text-xl font-semibold">{trafficData?.bandwidth?.current_recv_mbps} Mbps</div>
              </div>
              <div className="text-xs text-green-300">Peak: {trafficData?.bandwidth?.peak_recv_mbps} Mbps</div>
            </div>
          </motion.div>
        </motion.div>

        {/* Traffic Distribution */}
        <motion.div
          className={`rounded-xl p-6 mb-8 ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200 shadow-sm'}`}
          variants={itemVariants}
        >
          <h2 className={`text-xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>Protocol Distribution</h2>
          <div className="space-y-4">
            {trafficData?.traffic_distribution && Object.entries(trafficData.traffic_distribution).map(([protocol, percentage]: [string, any], idx) => (
              <div key={idx}>
                <div className="flex justify-between mb-2">
                  <span className={`font-semibold capitalize ${isDark ? 'text-white' : 'text-gray-900'}`}>{protocol}</span>
                  <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{percentage}%</span>
                </div>
                <div className={`h-3 rounded-full overflow-hidden ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                  <div
                    className={`h-full transition-all ${
                      protocol === 'https'
                        ? 'bg-gradient-to-r from-green-500 to-green-600'
                        : protocol === 'http'
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600'
                        : protocol === 'ssh'
                        ? 'bg-gradient-to-r from-purple-500 to-purple-600'
                        : 'bg-gradient-to-r from-gray-500 to-gray-600'
                    }`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Top Protocols */}
        <motion.div
          className={`rounded-xl p-6 mb-8 ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200 shadow-sm'}`}
          variants={itemVariants}
        >
          <h2 className={`text-xl font-bold mb-6 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <FiBarChart2 className="w-5 h-5" />
            Top Protocols by Connections
          </h2>
          <div className="space-y-3">
            {trafficData?.top_protocols?.map((proto: any, idx: number) => (
              <div
                key={idx}
                className={`rounded-lg p-4 border transition-colors ${isDark ? 'bg-gray-900 border-gray-700 hover:border-gray-600' : 'bg-white border-gray-200 hover:border-gray-300'}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{proto.protocol}</span>
                  </div>
                  <span className="text-lg font-bold text-blue-400">{proto.percentage}%</span>
                </div>
                <div className={`flex justify-between text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  <span>Connections: {(proto.connections).toLocaleString()}</span>
                  <span>Active</span>
                </div>
                <div className={`mt-2 h-2 rounded-full overflow-hidden ${isDark ? 'bg-gray-800' : 'bg-gray-200'}`}>
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
                    style={{ width: `${proto.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Top Pages */}
        <motion.div
          className={`rounded-xl p-6 mb-8 ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200 shadow-sm'}`}
          variants={itemVariants}
        >
          <h2 className={`text-xl font-bold mb-6 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <FiUsers className="w-5 h-5" />
            Top Source IPs
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                  <th className={`text-left py-3 px-3 font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>IP Address</th>
                  <th className={`text-left py-3 px-3 font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Requests</th>
                  <th className={`text-left py-3 px-3 font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Data Sent (MB)</th>
                  <th className={`text-left py-3 px-3 font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Activity</th>
                </tr>
              </thead>
              <tbody>
                {trafficData?.top_ips?.map((ip: any, idx: number) => (
                  <tr key={idx} className={`border-b transition-colors ${isDark ? 'border-gray-700 hover:bg-gray-900/50' : 'border-gray-200 hover:bg-gray-50'}`}>
                    <td className={`py-3 px-3 font-mono ${isDark ? 'text-white' : 'text-gray-900'}`}>{ip.ip}</td>
                    <td className={`py-3 px-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{(ip.requests).toLocaleString()}</td>
                    <td className={`py-3 px-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{ip.data_sent_mb}</td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-24 h-2 rounded-full overflow-hidden ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                          <div
                            className="h-full bg-green-500 rounded-full"
                            style={{ width: `${(ip.requests / Math.max(...trafficData?.top_ips.map((i: any) => i.requests))) * 100}%` }}
                          ></div>
                        </div>
                        <FiTrendingUp className="w-4 h-4 text-green-400" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Hourly Traffic Chart */}
        <motion.div
          className={`rounded-xl p-6 ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-gray-50 border border-gray-200'}`}
          variants={itemVariants}
        >
          <h2 className={`text-xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>Traffic Over Last 24 Hours</h2>
          <div className="overflow-x-auto">
            <div className="min-w-[720px] md:min-w-0 flex items-end gap-3" style={{ height: '250px' }}>
              {trafficData?.hourly_traffic?.map((hour: any, idx: number) => {
                const maxSent = Math.max(...trafficData.hourly_traffic.map((h: any) => h.sent_mb));
                const maxRecv = Math.max(...trafficData.hourly_traffic.map((h: any) => h.recv_mb));
                const max = Math.max(maxSent, maxRecv);
                const sentHeight = (hour.sent_mb / max) * 200;
                const recvHeight = (hour.recv_mb / max) * 200;
                
                return (
                  <div key={idx} className="flex-1 min-w-[24px] flex flex-col items-center gap-1 group">
                    <div className="w-full flex items-end justify-center gap-1 h-48">
                      <div
                        className="w-1/3 bg-gradient-to-t from-blue-500 to-blue-600 rounded-t opacity-70 group-hover:opacity-100 transition-opacity"
                        style={{ height: `${sentHeight}px` }}
                        title={`Sent: ${hour.sent_mb}MB`}
                      ></div>
                      <div
                        className="w-1/3 bg-gradient-to-t from-green-500 to-green-600 rounded-t opacity-70 group-hover:opacity-100 transition-opacity"
                        style={{ height: `${recvHeight}px` }}
                        title={`Recv: ${hour.recv_mb}MB`}
                      ></div>
                    </div>
                    <span className={`${isDark ? 'text-gray-400' : 'text-gray-600'} text-xs mt-2`}>{idx}h</span>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="mt-4 flex flex-wrap justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded"></div>
              <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>Sent</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gradient-to-r from-green-500 to-green-600 rounded"></div>
              <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>Received</span>
            </div>
          </div>
        </motion.div>

        {/* Last Updated */}
        <motion.div
          className="mt-8 text-center text-gray-400 text-sm"
          variants={itemVariants}
        >
          Last updated: {new Date(trafficData?.timestamp || Date.now()).toLocaleTimeString()}
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
}
