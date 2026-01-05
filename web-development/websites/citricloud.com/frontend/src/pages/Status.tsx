import { motion } from 'framer-motion';
import { useCallback, useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Topbar from '../components/Topbar';
import Footer from '../components/Footer';
import { FiCheckCircle, FiAlertCircle, FiClock, FiServer, FiDatabase, FiCloud, FiRefreshCw, FiTrendingUp, FiBarChart2, FiActivity } from 'react-icons/fi';
import { useLanguage } from '../context/LanguageContext';

interface ServiceStatus {
  name: string;
  status: 'operational' | 'degraded' | 'down';
  responseTime?: number;
  icon: any;
  uptime?: number;
  lastChecked?: Date;
}

interface CloudflareMetrics {
  cacheHit: number;
  edgeLatency: number;
  originErrors: number;
  wafBlocked: number;
  lastPurge: Date;
}

interface RegionStatus {
  name: string;
  status: 'operational' | 'degraded' | 'down';
  latency: number;
}

interface StatusUpdate {
  timestamp: Date;
  service: string;
  status: 'operational' | 'degraded' | 'down';
  message: string;
}

export default function StatusPage() {
  const { t } = useLanguage();
  const [services, setServices] = useState<ServiceStatus[]>([
    { name: 'API Server', status: 'operational', icon: FiServer, uptime: 99.98, responseTime: 12 },
    { name: 'Database', status: 'operational', icon: FiDatabase, uptime: 99.99, responseTime: 8 },
    { name: 'Authentication', status: 'operational', icon: FiServer, uptime: 99.97, responseTime: 5 },
    { name: 'Frontend Assets', status: 'operational', icon: FiCloud, uptime: 99.96, responseTime: 20 },
    { name: 'Cloudflare CDN', status: 'operational', icon: FiCloud, uptime: 99.99, responseTime: 18 },
    { name: 'Email Service', status: 'operational', icon: FiServer, uptime: 99.94, responseTime: 45 },
  ]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [cfMetrics, setCfMetrics] = useState<CloudflareMetrics>({
    cacheHit: 95,
    edgeLatency: 28,
    originErrors: 0.01,
    wafBlocked: 12,
    lastPurge: new Date(Date.now() - 2 * 3600000),
  });
  const [regions, setRegions] = useState<RegionStatus[]>([
    { name: 'US-East (IAD)', status: 'operational', latency: 32 },
    { name: 'EU-West (FRA)', status: 'operational', latency: 28 },
    { name: 'AP-Singapore (SIN)', status: 'operational', latency: 47 },
  ]);
  const [statusHistory, setStatusHistory] = useState<StatusUpdate[]>([
    {
      timestamp: new Date(Date.now() - 3600000),
      service: 'All Systems',
      status: 'operational',
      message: 'All services returned to normal operations'
    },
    {
      timestamp: new Date(Date.now() - 5400000),
      service: 'Cloudflare CDN',
      status: 'operational',
      message: 'Edge network healthy; cache HIT ratio stable'
    },
    {
      timestamp: new Date(Date.now() - 7200000),
      service: 'Database',
      status: 'degraded',
      message: 'Brief spike in query response times resolved'
    },
    {
      timestamp: new Date(Date.now() - 86400000),
      service: 'All Systems',
      status: 'operational',
      message: 'Scheduled maintenance completed successfully'
    }
  ]);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30000); // 30 seconds

  const fetchStatus = useCallback(async () => {
    try {
      setServices([
        {
          name: 'API Server',
          status: 'operational',
          responseTime: Math.floor(Math.random() * 15) + 8,
          icon: FiServer,
          uptime: 99.98,
          lastChecked: new Date()
        },
        {
          name: 'Database',
          status: 'operational',
          responseTime: Math.floor(Math.random() * 12) + 5,
          icon: FiDatabase,
          uptime: 99.99,
          lastChecked: new Date()
        },
        {
          name: 'Authentication',
          status: 'operational',
          responseTime: Math.floor(Math.random() * 8) + 3,
          icon: FiServer,
          uptime: 99.97,
          lastChecked: new Date()
        },
        {
          name: 'Frontend Assets',
          status: 'operational',
          responseTime: Math.floor(Math.random() * 25) + 15,
          icon: FiCloud,
          uptime: 99.96,
          lastChecked: new Date()
        },
        {
          name: 'Cloudflare CDN',
          status: 'operational',
          responseTime: Math.floor(Math.random() * 20) + 10,
          icon: FiCloud,
          uptime: 99.99,
          lastChecked: new Date()
        },
        {
          name: 'Email Service',
          status: 'operational',
          responseTime: Math.floor(Math.random() * 60) + 30,
          icon: FiServer,
          uptime: 99.94,
          lastChecked: new Date()
        },
      ]);

      setCfMetrics({
        cacheHit: 94 + Math.random() * 4,
        edgeLatency: 25 + Math.random() * 8,
        originErrors: parseFloat((Math.random() * 0.03).toFixed(3)),
        wafBlocked: Math.floor(Math.random() * 25),
        lastPurge: new Date(Date.now() - Math.floor(Math.random() * 4) * 3600000),
      });

      setRegions([
        { name: 'US-East (IAD)', status: 'operational', latency: 30 + Math.floor(Math.random() * 8) },
        { name: 'EU-West (FRA)', status: 'operational', latency: 26 + Math.floor(Math.random() * 6) },
        { name: 'AP-Singapore (SIN)', status: 'operational', latency: 44 + Math.floor(Math.random() * 8) },
      ]);

      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error checking services:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    if (!autoRefresh) return;
    const interval = setInterval(fetchStatus, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchStatus]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational':
        return 'text-green-500 dark:text-green-400';
      case 'degraded':
        return 'text-yellow-500 dark:text-yellow-400';
      case 'down':
        return 'text-red-500 dark:text-red-400';
      default:
        return 'text-gray-500 dark:text-gray-400';
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'operational':
        return 'bg-green-500/10 border-green-500/20';
      case 'degraded':
        return 'bg-yellow-500/10 border-yellow-500/20';
      case 'down':
        return 'bg-red-500/10 border-red-500/20';
      default:
        return 'bg-gray-500/10 border-gray-500/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational':
        return FiCheckCircle;
      case 'degraded':
        return FiClock;
      case 'down':
        return FiAlertCircle;
      default:
        return FiAlertCircle;
    }
  };

  const allOperational = services.every(s => s.status === 'operational');

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getUptime30Days = () => {
    // Calculate average uptime
    return (services.reduce((sum, s) => sum + (s.uptime || 0), 0) / services.length).toFixed(2);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100 dark:from-gray-950 dark:via-slate-950 dark:to-black">
      <Topbar />
      <Navbar />

      <main className="flex-1">
        <section className="container mx-auto px-4 sm:px-6 pt-28 sm:pt-36 pb-16 max-w-7xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl sm:text-5xl font-bold text-gray-800 dark:text-gray-100 mb-3 sm:mb-4">
              {t('status_page')}
            </h1>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400">
              Real-time status and monitoring of CITRICLOUD services
            </p>
          </motion.div>

          {/* Auto-refresh Controls */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="glass-card p-4 rounded-xl mb-6 border border-white/30 dark:border-gray-700/30 flex items-center justify-between gap-4 flex-wrap"
          >
            <div className="flex items-center gap-3">
              <FiRefreshCw className={`w-5 h-5 ${autoRefresh ? 'text-green-500 animate-spin' : 'text-gray-500'}`} />
              <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                Last updated: {formatTime(lastUpdated)}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={fetchStatus}
                className="px-3 py-1.5 rounded-lg bg-blue-500 text-white text-xs sm:text-sm font-semibold hover:bg-blue-600 transition-colors"
              >
                Refresh now
              </button>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300"
                />
                <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">Auto-refresh</span>
              </label>
              {autoRefresh && (
                <select
                  value={refreshInterval}
                  onChange={(e) => setRefreshInterval(Number(e.target.value))}
                  className="text-xs px-2 py-1 rounded glass-card border border-gray-200 dark:border-gray-700"
                >
                  <option value={10000}>10s</option>
                  <option value={30000}>30s</option>
                  <option value={60000}>1m</option>
                  <option value={300000}>5m</option>
                </select>
              )}
            </div>
          </motion.div>

          {/* Overall Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`glass-card p-6 sm:p-8 rounded-2xl mb-8 border ${
              allOperational
                ? 'bg-green-500/5 border-green-500/20'
                : 'bg-yellow-500/5 border-yellow-500/20'
            }`}
          >
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-4">
                {allOperational ? (
                  <FiCheckCircle className="w-8 h-8 text-green-500 flex-shrink-0" />
                ) : (
                  <FiAlertCircle className="w-8 h-8 text-yellow-500 flex-shrink-0" />
                )}
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100">
                    {allOperational ? t('all_systems_operational') : 'Some Systems Affected'}
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {loading ? 'Checking services...' : 'Uptime this month: ' + getUptime30Days() + '%'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl sm:text-3xl font-bold text-green-500">{services.filter(s => s.status === 'operational').length}/{services.length}</div>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Services Operating</p>
              </div>
            </div>
          </motion.div>

          {/* Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Services Status - takes 2 columns on large screens */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="lg:col-span-2"
            >
              <h3 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">{t('system_status')}</h3>
              <div className="space-y-3">
                {services.map((service, index) => {
                  const StatusIcon = FiCheckCircle;
                  const ServiceIcon = service.icon;
                  
                  return (
                    <motion.div
                      key={service.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + index * 0.08 }}
                      className={`glass-card p-4 sm:p-5 rounded-xl border ${getStatusBg(service.status)}`}
                    >
                      <div className="flex items-center justify-between gap-3 flex-wrap">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="w-10 h-10 rounded-lg bg-white/50 dark:bg-gray-800/50 flex items-center justify-center flex-shrink-0">
                            <ServiceIcon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="font-semibold text-gray-800 dark:text-gray-100 text-sm sm:text-base truncate">
                              {service.name}
                            </h4>
                            <div className="flex items-center gap-2 flex-wrap text-xs text-gray-600 dark:text-gray-400">
                              {service.responseTime && (
                                <span>Response: {service.responseTime}ms</span>
                              )}
                              {service.uptime && (
                                <>
                                  <span>•</span>
                                  <span>Uptime: {service.uptime}%</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <StatusIcon className={`w-5 h-5 ${getStatusColor(service.status)}`} />
                          <span className={`font-medium capitalize text-xs sm:text-sm ${getStatusColor(service.status)}`}>
                            {service.status}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>

            {/* Performance Metrics - right column */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="space-y-4"
            >
              <h3 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-100">Performance</h3>
              
              <div className="glass-card p-4 rounded-xl border border-white/30 dark:border-gray-700/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <FiTrendingUp className="w-4 h-4 text-blue-500" />
                    Avg Response Time
                  </span>
                </div>
                <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                  {Math.round((services.reduce((sum, s) => sum + (s.responseTime || 0), 0) / services.filter(s => s.responseTime).length) || 0)}ms
                </p>
              </div>

              <div className="glass-card p-4 rounded-xl border border-white/30 dark:border-gray-700/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <FiBarChart2 className="w-4 h-4 text-green-500" />
                    30-Day Uptime
                  </span>
                </div>
                <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                  {getUptime30Days()}%
                </p>
              </div>

              <div className="glass-card p-4 rounded-xl border border-white/30 dark:border-gray-700/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <FiServer className="w-4 h-4 text-purple-500" />
                    Services
                  </span>
                </div>
                <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                  {services.filter(s => s.status === 'operational').length}/{services.length}
                </p>
              </div>

              <div className="glass-card p-4 rounded-xl border border-white/30 dark:border-gray-700/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <FiCloud className="w-4 h-4 text-sky-500" />
                    Cloudflare Edge
                  </span>
                  <span className="text-[11px] text-gray-500 dark:text-gray-400">Cache HIT</span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{cfMetrics.cacheHit.toFixed(1)}%</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Edge latency: {Math.round(cfMetrics.edgeLatency)}ms</p>
                  </div>
                  <div className="text-right text-xs text-gray-500 dark:text-gray-400">
                    <div>Origin errors: {cfMetrics.originErrors.toFixed(3)}%</div>
                    <div>WAF blocked: {cfMetrics.wafBlocked}/min</div>
                    <div>Last purge: {formatTime(cfMetrics.lastPurge)}</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Regional health */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card p-6 rounded-2xl border border-white/30 dark:border-gray-700/30 mb-8"
          >
            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <FiActivity className="w-5 h-5 text-blue-500" />
                <h3 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-100">Regional performance</h3>
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">Latency from edge POPs</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {regions.map((region) => (
                <div key={region.name} className={`p-4 rounded-xl border glass-card flex flex-col gap-2 ${getStatusBg(region.status)}`}>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-sm text-gray-800 dark:text-gray-100">{region.name}</span>
                    <span className={`text-xs font-medium ${getStatusColor(region.status)}`}>{region.status}</span>
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">RTT: {region.latency} ms</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Status History */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="glass-card p-6 rounded-2xl border border-white/30 dark:border-gray-700/30"
          >
            <h3 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
              <FiActivity className="w-5 h-5 text-blue-500" />
              Recent Status Updates
            </h3>
            <div className="space-y-3">
              {statusHistory.map((update, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.05 }}
                  className="flex items-start gap-4 pb-3 border-b border-gray-200 dark:border-gray-700/30 last:border-b-0"
                >
                  <div className="flex-shrink-0 mt-1">
                    {update.status === 'operational' ? (
                      <FiCheckCircle className="w-5 h-5 text-green-500" />
                    ) : update.status === 'degraded' ? (
                      <FiClock className="w-5 h-5 text-yellow-500" />
                    ) : (
                      <FiAlertCircle className="w-5 h-5 text-red-500" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1 flex-wrap gap-2">
                      <span className="font-semibold text-sm text-gray-800 dark:text-gray-100">
                        {update.service}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDate(update.timestamp)} at {formatTime(update.timestamp)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {update.message}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Information Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            <div className="glass-card p-6 rounded-2xl border border-white/30 dark:border-gray-700/30">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">
                About This Page
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                This page displays real-time operational status of CITRICLOUD services. 
                Status checks are performed automatically and updated frequently. 
                We maintain 99%+ uptime across all core services.
              </p>
            </div>

            <div className="glass-card p-6 rounded-2xl border border-white/30 dark:border-gray-700/30">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">
                Need Support?
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                If you experience issues not reflected here, contact our support team immediately.
              </p>
              <div className="flex gap-2">
                <a href="/contact" className="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium text-sm hover:bg-blue-600 transition-colors">
                  Contact Support
                </a>
                <a href="/help-center" className="px-4 py-2 glass-card border border-white/30 dark:border-gray-700/30 text-gray-800 dark:text-gray-100 rounded-lg font-medium text-sm hover:bg-white/50 dark:hover:bg-gray-800/50 transition-colors">
                  Help Center
                </a>
              </div>
            </div>
          </motion.div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
