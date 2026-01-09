import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Server, Shield, Globe, FileCode, TrendingUp, Activity } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import { hostingAPI } from '../lib/api';

const Dashboard: React.FC = () => {
  const { data: servers } = useQuery({
    queryKey: ['servers'],
    queryFn: () => hostingAPI.getServers({ page: 1, page_size: 100 }),
  });

  const { data: vpns } = useQuery({
    queryKey: ['vpns'],
    queryFn: () => hostingAPI.getVPNs({ page: 1, page_size: 100 }),
  });

  const { data: domains } = useQuery({
    queryKey: ['domains'],
    queryFn: () => hostingAPI.getDomains({ page: 1, page_size: 100 }),
  });

  const { data: wordpress } = useQuery({
    queryKey: ['wordpress'],
    queryFn: () => hostingAPI.getWordPressSites({ page: 1, page_size: 100 }),
  });

  const stats = [
    {
      name: 'Servers',
      value: servers?.total || 0,
      icon: Server,
      color: 'from-blue-600',
      href: '/servers',
    },
    {
      name: 'VPN Connections',
      value: vpns?.total || 0,
      icon: Shield,
      color: 'from-green-600',
      href: '/vpn',
    },
    {
      name: 'Domains',
      value: domains?.total || 0,
      icon: Globe,
      color: 'from-purple-600',
      href: '/domains',
    },
    {
      name: 'WordPress Sites',
      value: wordpress?.total || 0,
      icon: FileCode,
      color: 'from-orange-600',
      href: '/wordpress',
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Hosting Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your servers, domains, VPN, and hosting infrastructure
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <motion.a
              key={stat.name}
              href={stat.href}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-200 dark:border-gray-700 rounded-2xl p-6 hover:shadow-2xl hover:shadow-primary-500/20 dark:hover:shadow-primary-500/10 transition-all duration-200 cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`p-3 rounded-xl ${stat.color.replace('from-', 'bg-').replace(/ to-.*/, '')} text-white shadow-lg group-hover:scale-110 transition-transform duration-200`}
                >
                  <stat.icon size={24} />
                </div>
                <TrendingUp className="text-green-500" size={20} />
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">{stat.value}</p>
              <p className="text-gray-600 dark:text-gray-400">{stat.name}</p>
            </motion.a>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <a
              href="/servers"
              className="p-4 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-primary-500 dark:hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/10 transition-all duration-200 text-center group"
            >
              <Server className="mx-auto mb-2 text-gray-400 group-hover:text-primary-500" size={32} />
              <p className="font-medium text-gray-700 dark:text-gray-300 group-hover:text-primary-600 dark:group-hover:text-primary-400">Deploy Server</p>
            </a>
            <a
              href="/vpn"
              className="p-4 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-green-500 dark:hover:border-green-400 hover:bg-green-50 dark:hover:bg-green-900/10 transition-all duration-200 text-center group"
            >
              <Shield className="mx-auto mb-2 text-gray-400 group-hover:text-green-500" size={32} />
              <p className="font-medium text-gray-700 dark:text-gray-300 group-hover:text-green-600 dark:group-hover:text-green-400">Setup VPN</p>
            </a>
            <a
              href="/domains"
              className="p-4 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-purple-500 dark:hover:border-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/10 transition-all duration-200 text-center group"
            >
              <Globe className="mx-auto mb-2 text-gray-400 group-hover:text-purple-500" size={32} />
              <p className="font-medium text-gray-700 dark:text-gray-300 group-hover:text-purple-600 dark:group-hover:text-purple-400">Register Domain</p>
            </a>
            <a
              href="/wordpress"
              className="p-4 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-orange-500 dark:hover:border-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/10 transition-all duration-200 text-center group"
            >
              <FileCode className="mx-auto mb-2 text-gray-400 group-hover:text-orange-500" size={32} />
              <p className="font-medium text-gray-700 dark:text-gray-300 group-hover:text-orange-600 dark:group-hover:text-orange-400">Install WordPress</p>
            </a>
          </div>
        </div>

        {/* System Status */}
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">System Status</h2>
            <div className="flex items-center space-x-2">
              <Activity className="text-green-500 animate-pulse" size={20} />
              <span className="text-green-500 dark:text-green-400 font-medium">All Systems Operational</span>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50">
              <span className="text-gray-700 dark:text-gray-300 font-medium">API Status</span>
              <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full text-sm font-medium">
                Operational
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50">
              <span className="text-gray-700 dark:text-gray-300 font-medium">DNS Servers</span>
              <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full text-sm font-medium">
                Operational
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50">
              <span className="text-gray-700 dark:text-gray-300 font-medium">Email Service</span>
              <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full text-sm font-medium">
                Operational
              </span>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
