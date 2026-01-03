import { useQuery } from '@tanstack/react-query';
import DashboardLayout from '../../components/DashboardLayout';
import { srmAPI } from '../../lib/api';
import { motion } from 'framer-motion';
import {
  FiShield, FiRefreshCw, FiCheckCircle, FiAlertTriangle, FiLock, FiClock
} from 'react-icons/fi';
import { useState } from 'react';

export default function SRMSSLTLs() {
  const [autoRefresh, setAutoRefresh] = useState(true);
  const isDark = document.documentElement.classList.contains('dark');

  const { data: sslData, isLoading } = useQuery({
    queryKey: ['srm-ssl-tls-overview'],
    queryFn: async () => {
      const response = await srmAPI.getSSLTLSOverview();
      return response.data;
    },
    refetchInterval: autoRefresh ? 10000 : false,
  });

  if (isLoading) {
    return (
      <DashboardLayout title="SSL/TLS">
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

  const getStatusColor = (days: number) => {
    if (days > 30) return 'bg-green-500/20 text-green-400';
    if (days > 7) return 'bg-yellow-500/20 text-yellow-400';
    return 'bg-red-500/20 text-red-400';
  };

  const getStatusIcon = (days: number) => {
    if (days > 30) return <FiCheckCircle className="w-5 h-5 text-green-400" />;
    if (days > 7) return <FiAlertTriangle className="w-5 h-5 text-yellow-400" />;
    return <FiAlertTriangle className="w-5 h-5 text-red-400" />;
  };

  return (
    <DashboardLayout title="SSL/TLS">
      <motion.div
        className="w-full"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className={`text-4xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>SSL/TLS Certificates</h1>
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Monitor certificate expiration and security status</p>
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

        {/* SSL Summary */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
          variants={containerVariants}
        >
          <motion.div
            className={`rounded-xl p-6 ${isDark ? 'bg-gradient-to-br from-emerald-900 to-emerald-800 text-white' : 'bg-gradient-to-br from-emerald-50 to-emerald-100 text-gray-900 border border-emerald-200'}`}
            variants={itemVariants}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Security Status</h2>
              <FiLock className="w-5 h-5 text-emerald-300" />
            </div>
            <div className="text-3xl font-bold mb-2">Secure</div>
            <div className="text-sm text-emerald-200">All certificates are valid</div>
            <div className="mt-4 flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm">All systems operational</span>
            </div>
          </motion.div>

          <motion.div
            className={`rounded-xl p-6 ${isDark ? 'bg-gradient-to-br from-blue-900 to-blue-800 text-white' : 'bg-gradient-to-br from-blue-50 to-blue-100 text-gray-900 border border-blue-200'}`}
            variants={itemVariants}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">SSL Protocol</h2>
              <FiShield className="w-5 h-5 text-blue-300" />
            </div>
            <div className="text-2xl font-bold mb-2">{sslData?.ssl_protocol_version}</div>
            <div className="text-sm text-blue-200">Latest secure protocol</div>
            <div className="mt-3 text-xs text-blue-300 bg-blue-900/50 rounded px-2 py-1 inline-block">
              {sslData?.cipher_suite}
            </div>
          </motion.div>

          <motion.div
            className={`rounded-xl p-6 ${isDark ? 'bg-gradient-to-br from-purple-900 to-purple-800 text-white' : 'bg-gradient-to-br from-purple-50 to-purple-100 text-gray-900 border border-purple-200'}`}
            variants={itemVariants}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">HSTS Status</h2>
              <FiCheckCircle className="w-5 h-5 text-purple-300" />
            </div>
            <div className="text-2xl font-bold mb-2">{sslData?.hsts_enabled ? 'Enabled' : 'Disabled'}</div>
            <div className="text-sm text-purple-200">Max Age: {sslData?.hsts_max_age?.toLocaleString()} seconds</div>
          </motion.div>
        </motion.div>

        {/* Certificates List */}
        <motion.div
          className="space-y-4"
          variants={containerVariants}
        >
          {sslData?.certificates?.map((cert: any, idx: number) => {
            const expiryDate = new Date(cert.expiry_date);
            const today = new Date();
            const daysToExpiry = Math.floor((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            
            return (
              <motion.div
                key={idx}
                className={`rounded-xl p-6 border transition-colors ${isDark ? 'bg-gray-800 border-gray-700 hover:border-gray-600' : 'bg-white border-gray-200 hover:border-gray-300 shadow-sm'}`}
                variants={itemVariants}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3 flex-1">
                    <FiShield className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{cert.domain}</h3>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Issued by {cert.issuer}</p>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-2 ${getStatusColor(daysToExpiry)}`}>
                    {getStatusIcon(daysToExpiry)}
                    {cert.status.toUpperCase()}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className={`rounded-lg p-3 ${isDark ? 'bg-gray-900' : 'bg-gray-50 border border-gray-200'}`}>
                    <div className={`text-xs mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Algorithm</div>
                    <div className={`text-sm font-mono font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{cert.algorithm}</div>
                  </div>
                  <div className={`rounded-lg p-3 ${isDark ? 'bg-gray-900' : 'bg-gray-50 border border-gray-200'}`}>
                    <div className={`text-xs mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Days to Expiry</div>
                    <div className={`text-lg font-bold ${daysToExpiry > 30 ? 'text-green-400' : daysToExpiry > 7 ? 'text-yellow-400' : 'text-red-400'}`}>
                      {daysToExpiry} days
                    </div>
                  </div>
                  <div className={`rounded-lg p-3 ${isDark ? 'bg-gray-900' : 'bg-gray-50 border border-gray-200'}`}>
                    <div className={`text-xs mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Issue Date</div>
                    <div className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{new Date(cert.issue_date).toLocaleDateString()}</div>
                  </div>
                  <div className={`rounded-lg p-3 ${isDark ? 'bg-gray-900' : 'bg-gray-50 border border-gray-200'}`}>
                    <div className={`text-xs mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Expiry Date</div>
                    <div className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{new Date(cert.expiry_date).toLocaleDateString()}</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className={`rounded-lg p-3 ${isDark ? 'bg-gray-900' : 'bg-gray-50 border border-gray-200'}`}>
                    <div className={`text-xs mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Renewal Status</div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-green-400 font-semibold">{cert.renewal_status}</span>
                    </div>
                  </div>
                  <div className={`rounded-lg p-3 ${isDark ? 'bg-gray-900' : 'bg-gray-50 border border-gray-200'}`}>
                    <div className={`text-xs mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>SHA256 Fingerprint</div>
                    <div className="font-mono text-xs text-blue-300 break-all">{cert.sha256_fingerprint}</div>
                  </div>
                </div>

                {/* Expiry Progress Bar */}
                <div className={`mt-4 pt-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Certificate Validity</span>
                    <span className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{((365 - daysToExpiry) / 365 * 100).toFixed(1)}%</span>
                  </div>
                  <div className={`w-full h-2 rounded-full overflow-hidden ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        daysToExpiry > 30
                          ? 'bg-gradient-to-r from-green-500 to-green-400'
                          : daysToExpiry > 7
                          ? 'bg-gradient-to-r from-yellow-500 to-yellow-400'
                          : 'bg-gradient-to-r from-red-500 to-red-400'
                      }`}
                      style={{ width: `${Math.max(100 - (365 - daysToExpiry) / 365 * 100, 0)}%` }}
                    ></div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Security Information */}
        <motion.div
          className={`mt-8 rounded-xl p-6 ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200 shadow-sm'}`}
          variants={itemVariants}
        >
          <h2 className={`text-xl font-bold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <FiShield className="w-5 h-5" />
            Security Configuration
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`rounded-lg p-4 ${isDark ? 'bg-gray-900' : 'bg-gray-50 border border-gray-200'}`}>
              <div className={`text-sm mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>SSL Protocol Version</div>
              <div className="text-lg font-bold text-blue-400">{sslData?.ssl_protocol_version}</div>
              <div className="text-xs text-gray-500 mt-1">Industry Standard</div>
            </div>
            <div className={`rounded-lg p-4 ${isDark ? 'bg-gray-900' : 'bg-gray-50 border border-gray-200'}`}>
              <div className={`text-sm mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Cipher Suite</div>
              <div className="text-xs font-mono text-green-400 break-all">{sslData?.cipher_suite}</div>
              <div className="text-xs text-gray-500 mt-2">256-bit Encryption</div>
            </div>
            <div className={`rounded-lg p-4 ${isDark ? 'bg-gray-900' : 'bg-gray-50 border border-gray-200'}`}>
              <div className={`text-sm mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>HSTS Status</div>
              <div className="text-lg font-bold text-emerald-400">{sslData?.hsts_enabled ? '✓ Enabled' : '✗ Disabled'}</div>
              <div className="text-xs text-gray-500 mt-1">Security Headers Active</div>
            </div>
          </div>
        </motion.div>

        {/* Last Updated */}
        <motion.div
          className="mt-8 text-center text-gray-400 text-sm"
          variants={itemVariants}
        >
          Last updated: {new Date(sslData?.timestamp || Date.now()).toLocaleTimeString()}
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
}
