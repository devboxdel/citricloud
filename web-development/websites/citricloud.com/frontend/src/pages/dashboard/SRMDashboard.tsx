import { useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { motion } from 'framer-motion';
import {
  FiServer, FiCpu, FiHardDrive, FiWifi, FiActivity,
  FiAlertCircle, FiCheckCircle, FiAlertTriangle, FiTrendingUp
} from 'react-icons/fi';

export default function SRMDashboard() {
  // Mock server data
  const [serverStats] = useState({
    total_servers: 12,
    online_servers: 11,
    offline_servers: 1,
    avg_cpu_usage: 42,
    avg_memory_usage: 58,
    total_storage_gb: 2048,
    used_storage_gb: 1456,
    network_bandwidth_mbps: 850,
  });

  const servers = [
    {
      id: 1,
      name: 'web-server-01',
      ip: '192.168.1.101',
      status: 'online',
      cpu: 35,
      memory: 52,
      storage: 68,
      uptime: '45 days',
    },
    {
      id: 2,
      name: 'web-server-02',
      ip: '192.168.1.102',
      status: 'online',
      cpu: 48,
      memory: 64,
      storage: 72,
      uptime: '45 days',
    },
    {
      id: 3,
      name: 'db-server-01',
      ip: '192.168.1.201',
      status: 'online',
      cpu: 22,
      memory: 78,
      storage: 85,
      uptime: '90 days',
    },
    {
      id: 4,
      name: 'cache-server-01',
      ip: '192.168.1.301',
      status: 'offline',
      cpu: 0,
      memory: 0,
      storage: 0,
      uptime: '0 days',
    },
  ];

  const statsCards = [
    {
      title: 'Total Servers',
      value: serverStats.total_servers,
      icon: <FiServer className="w-6 h-6" />,
      color: 'bg-blue-500',
    },
    {
      title: 'Online Servers',
      value: serverStats.online_servers,
      icon: <FiCheckCircle className="w-6 h-6" />,
      color: 'bg-green-500',
    },
    {
      title: 'Offline Servers',
      value: serverStats.offline_servers,
      icon: <FiAlertCircle className="w-6 h-6" />,
      color: 'bg-red-500',
    },
    {
      title: 'Avg CPU Usage',
      value: `${serverStats.avg_cpu_usage}%`,
      icon: <FiCpu className="w-6 h-6" />,
      color: 'bg-purple-500',
    },
  ];

  const resourceCards = [
    {
      title: 'Memory Usage',
      value: `${serverStats.avg_memory_usage}%`,
      icon: <FiActivity className="w-6 h-6" />,
      color: 'bg-orange-500',
    },
    {
      title: 'Storage Used',
      value: `${Math.round((serverStats.used_storage_gb / serverStats.total_storage_gb) * 100)}%`,
      subtitle: `${serverStats.used_storage_gb}GB / ${serverStats.total_storage_gb}GB`,
      icon: <FiHardDrive className="w-6 h-6" />,
      color: 'bg-indigo-500',
    },
    {
      title: 'Network Bandwidth',
      value: `${serverStats.network_bandwidth_mbps}Mbps`,
      icon: <FiWifi className="w-6 h-6" />,
      color: 'bg-cyan-500',
    },
  ];

  const getStatusColor = (status: string) => {
    return status === 'online' ? 'text-green-500 bg-green-50 dark:bg-green-900/20' : 'text-red-500 bg-red-50 dark:bg-red-900/20';
  };

  const getStatusBg = (status: string) => {
    return status === 'online' ? 'bg-green-500' : 'bg-red-500';
  };

  return (
    <DashboardLayout
      title="Server Resources Management"
      breadcrumb={<div className="text-xs text-gray-500">Monitor and manage server resources</div>}
    >
      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsCards.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass-card p-6 rounded-2xl bg-white/80 dark:bg-gray-800/90 border border-white/30 dark:border-gray-700/50 shadow-sm dark:shadow-[0_0_0_1px_rgba(255,255,255,0.05)]"
          >
            <div className="flex items-center space-x-4">
              <div className={`w-12 h-12 rounded-xl ${stat.color} flex items-center justify-center text-white`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-300 text-sm">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{stat.value}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Resource Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {resourceCards.map((card, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: (index + 4) * 0.1 }}
            className="glass-card p-6 rounded-2xl bg-white/80 dark:bg-gray-800/90 border border-white/30 dark:border-gray-700/50 shadow-sm dark:shadow-[0_0_0_1px_rgba(255,255,255,0.05)]"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">{card.title}</h3>
              <div className={`w-10 h-10 rounded-xl ${card.color} flex items-center justify-center text-white`}>
                {card.icon}
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-1">{card.value}</p>
            {card.subtitle && <p className="text-xs text-gray-500">{card.subtitle}</p>}
            <div className="mt-4 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${card.color.replace('bg-', 'bg-')}`}
                style={{ width: `${parseInt(card.value)}%` }}
              />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Servers List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-card rounded-2xl bg-white/80 dark:bg-gray-800/90 border border-white/30 dark:border-gray-700/50 shadow-sm dark:shadow-[0_0_0_1px_rgba(255,255,255,0.05)] overflow-hidden"
      >
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Server Status</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700/50">
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">Server</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">IP Address</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">CPU</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">Memory</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">Storage</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">Uptime</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {servers.map((server, index) => (
                <tr key={server.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-800 dark:text-gray-200 font-medium">{server.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{server.ip}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(server.status)}`}>
                      <span className={`w-2 h-2 rounded-full ${getStatusBg(server.status)}`}></span>
                      <span>{server.status}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-800 dark:text-gray-200">{server.cpu}%</td>
                  <td className="px-6 py-4 text-sm text-gray-800 dark:text-gray-200">{server.memory}%</td>
                  <td className="px-6 py-4 text-sm text-gray-800 dark:text-gray-200">{server.storage}%</td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{server.uptime}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
