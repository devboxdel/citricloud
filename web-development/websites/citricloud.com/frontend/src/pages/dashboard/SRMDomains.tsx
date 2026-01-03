import { useQuery } from '@tanstack/react-query';
import DashboardLayout from '../../components/DashboardLayout';
import { srmAPI } from '../../lib/api';
import { motion } from 'framer-motion';
import {
  FiGlobe, FiRefreshCw, FiCheckCircle, FiAlertTriangle, FiShield, FiClock
} from 'react-icons/fi';
import { useState } from 'react';

export default function SRMDomains() {
  const [autoRefresh, setAutoRefresh] = useState(true);
  const isDark = document.documentElement.classList.contains('dark');

  const { data: domainsData, isLoading } = useQuery({
    queryKey: ['srm-domains-overview'],
    queryFn: async () => {
      const response = await srmAPI.getDomainsOverview();
      return response.data;
    },
    refetchInterval: autoRefresh ? 10000 : false,
  });

  if (isLoading) {
    return (
      <DashboardLayout title="Domains">
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

  const getSSLColor = (status: string) => {
    return status === 'valid' ? 'text-green-400' : 'text-red-400';
  };

  const getStatusColor = (status: string) => {
    return status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400';
  };

  return (
    <DashboardLayout title="Domains">
      <motion.div
        className="w-full"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className={`text-4xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Domains Management</h1>
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Monitor your domain registrations and SSL certificates</p>
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

        {/* Primary Domain */}
        <motion.div
          className={`rounded-xl p-6 mb-8 ${isDark ? 'bg-gradient-to-br from-cyan-900 to-cyan-800 text-white' : 'bg-gradient-to-br from-cyan-50 to-blue-50 text-gray-900 border border-cyan-200'}`}
          variants={itemVariants}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <FiGlobe className="w-6 h-6 text-cyan-300" />
              <h2 className="text-2xl font-bold">Primary Domain</h2>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor('active')}`}>
              Active
            </div>
          </div>
          <div className="text-3xl font-bold mb-6">{domainsData?.primary_domain}</div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className={`rounded-lg p-4 ${isDark ? 'bg-black/30' : 'bg-white/80 border border-cyan-100'}`}>
              <div className={`text-sm mb-2 ${isDark ? 'text-cyan-300' : 'text-cyan-600'}`}>Registration</div>
              <div className="text-xl font-semibold">{domainsData?.domains?.[0]?.registration_days_left || 0} days</div>
            </div>
            <div className={`rounded-lg p-4 ${isDark ? 'bg-black/30' : 'bg-white/80 border border-cyan-100'}`}>
              <div className={`text-sm mb-2 ${isDark ? 'text-cyan-300' : 'text-cyan-600'}`}>SSL Status</div>
              <div className={`text-xl font-semibold ${getSSLColor(domainsData?.domains?.[0]?.ssl_status)}`}>
                {domainsData?.domains?.[0]?.ssl_status?.toUpperCase()}
              </div>
            </div>
            <div className={`rounded-lg p-4 ${isDark ? 'bg-black/30' : 'bg-white/80 border border-cyan-100'}`}>
              <div className={`text-sm mb-2 ${isDark ? 'text-cyan-300' : 'text-cyan-600'}`}>SSL Expiry</div>
              <div className="text-xl font-semibold">{domainsData?.domains?.[0]?.ssl_expiry_days || 0} days</div>
            </div>
            <div className={`rounded-lg p-4 ${isDark ? 'bg-black/30' : 'bg-white/80 border border-cyan-100'}`}>
              <div className={`text-sm mb-2 ${isDark ? 'text-cyan-300' : 'text-cyan-600'}`}>Requests/hour</div>
              <div className="text-xl font-semibold">{(domainsData?.domains?.[0]?.requests_per_hour || 0).toLocaleString()}</div>
            </div>
          </div>
        </motion.div>

        {/* Domains List */}
        <motion.div
          className={`rounded-xl p-6 ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200 shadow-sm'}`}
          variants={itemVariants}
        >
          <h2 className={`text-xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>All Domains</h2>
          <div className="space-y-4">
            {domainsData?.domains?.map((domain: any, idx: number) => (
              <div
                key={idx}
                className={`rounded-lg p-5 border transition-colors ${isDark ? 'bg-gray-900 border-gray-700 hover:border-gray-600' : 'bg-white border-gray-200 hover:border-gray-300 shadow-sm'}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <FiGlobe className="w-5 h-5 text-blue-400" />
                    <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{domain.domain}</h3>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(domain.status)}`}>
                    {domain.status}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div>
                    <div className={`text-xs mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Registration</div>
                    <div className="flex items-center gap-1">
                      <FiClock className="w-4 h-4 text-yellow-400" />
                      <span className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{domain.registration_days_left}d</span>
                    </div>
                  </div>
                  <div>
                    <div className={`text-xs mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>SSL Status</div>
                    <div className={`text-sm font-semibold ${getSSLColor(domain.ssl_status)}`}>
                      {domain.ssl_status.toUpperCase()}
                    </div>
                  </div>
                  <div>
                    <div className={`text-xs mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>SSL Expiry</div>
                    <div className="flex items-center gap-1">
                      <FiShield className="w-4 h-4 text-green-400" />
                      <span className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{domain.ssl_expiry_days}d</span>
                    </div>
                  </div>
                  <div>
                    <div className={`text-xs mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>DNS Status</div>
                    <div className="flex items-center gap-1">
                      <FiCheckCircle className="w-4 h-4 text-green-400" />
                      <span className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{domain.dns_status}</span>
                    </div>
                  </div>
                  <div>
                    <div className={`text-xs mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Requests/hour</div>
                    <span className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{(domain.requests_per_hour).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* System Information */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8"
          variants={containerVariants}
        >
          <motion.div
            className={`rounded-xl p-6 ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200 shadow-sm'}`}
            variants={itemVariants}
          >
            <h3 className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Server Information</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Hostname:</span>
                <span className={`font-mono text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{domainsData?.hostname}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>DNS Server 1:</span>
                <span className={`font-mono text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{domainsData?.dns_servers?.[0]}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>DNS Server 2:</span>
                <span className={`font-mono text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{domainsData?.dns_servers?.[1]}</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            className={`rounded-xl p-6 ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200 shadow-sm'}`}
            variants={itemVariants}
          >
            <h3 className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Domain Overview</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Total Domains:</span>
                <span className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>{domainsData?.domains?.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Active Domains:</span>
                <span className="text-green-400 font-bold text-lg">{domainsData?.domains?.filter((d: any) => d.status === 'active').length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>SSL Coverage:</span>
                <span className="text-blue-400 font-bold text-lg">100%</span>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Last Updated */}
        <motion.div
          className="mt-8 text-center text-gray-400 text-sm"
          variants={itemVariants}
        >
          Last updated: {new Date(domainsData?.timestamp || Date.now()).toLocaleTimeString()}
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
}
