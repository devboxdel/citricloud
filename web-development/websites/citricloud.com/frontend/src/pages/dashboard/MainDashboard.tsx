import { useQuery } from '@tanstack/react-query';
import DashboardLayout from '../../components/DashboardLayout';
import { crmAPI, cmsAPI, erpAPI } from '../../lib/api';
import { motion } from 'framer-motion';
import {
  FiUsers, FiFileText, FiShoppingCart, FiDollarSign,
  FiTrendingUp, FiAlertCircle, FiCheckCircle, FiClock
} from 'react-icons/fi';

export default function MainDashboard() {
  const { data: crmStats } = useQuery({
    queryKey: ['crm-stats'],
    queryFn: async () => {
      const response = await crmAPI.getStats();
      return response.data;
    },
  });

  const { data: cmsStats } = useQuery({
    queryKey: ['cms-stats'],
    queryFn: async () => {
      const response = await cmsAPI.getStats();
      return response.data;
    },
  });

  const { data: erpStats } = useQuery({
    queryKey: ['erp-stats'],
    queryFn: async () => {
      const response = await erpAPI.getStats();
      return response.data;
    },
  });

  const stats = [
    {
      title: 'Total Users',
      value: crmStats?.total_users || 0,
      icon: <FiUsers className="w-8 h-8" />,
      color: 'bg-blue-500',
      trend: '+12%',
    },
    {
      title: 'Total Revenue',
      value: `$${(erpStats?.total_revenue || 0).toLocaleString()}`,
      icon: <FiDollarSign className="w-8 h-8" />,
      color: 'bg-green-500',
      trend: '+23%',
    },
    {
      title: 'Total Orders',
      value: erpStats?.total_orders || 0,
      icon: <FiShoppingCart className="w-8 h-8" />,
      color: 'bg-purple-500',
      trend: '+8%',
    },
    {
      title: 'Total Pages',
      value: cmsStats?.total_pages || 0,
      icon: <FiFileText className="w-8 h-8" />,
      color: 'bg-orange-500',
      trend: '+5%',
    },
  ];

  const recentActivity = [
    { icon: <FiCheckCircle className="text-green-500" />, text: 'New order #12345 received', time: '2 minutes ago' },
    { icon: <FiUsers className="text-blue-500" />, text: 'New user registered', time: '15 minutes ago' },
    { icon: <FiAlertCircle className="text-yellow-500" />, text: 'Support ticket #789 opened', time: '1 hour ago' },
    { icon: <FiFileText className="text-purple-500" />, text: 'Blog post published', time: '2 hours ago' },
  ];

  return (
    <DashboardLayout
      title="Main Dashboard"
      breadcrumb={<div className="text-xs text-gray-500">Overview</div>}
    >
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass-card p-4 sm:p-6 rounded-2xl bg-white/90 dark:bg-gray-800/90 border border-gray-200/50 dark:border-gray-700/50"
          >
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl ${stat.color} flex items-center justify-center text-white shadow-md`}>
                {stat.icon}
              </div>
              <span className="text-xs sm:text-sm font-semibold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-500/20 px-2 sm:px-3 py-1 rounded-lg">
                {stat.trend}
              </span>
            </div>
            <h3 className="text-gray-700 dark:text-gray-200 text-xs sm:text-sm font-semibold mb-1">{stat.title}</h3>
            <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white break-words">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-card p-6 rounded-2xl bg-white/90 dark:bg-gray-800/90 border border-gray-200/50 dark:border-gray-700/50"
        >
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Quick Overview</h2>
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between p-3 sm:p-4 bg-white/50 dark:bg-gray-700/50 rounded-xl">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center">
                  <FiUsers className="text-blue-500 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-700 dark:text-gray-200 font-medium">Active Users</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{crmStats?.active_users || 0}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 sm:p-4 bg-white/50 dark:bg-gray-700/50 rounded-xl">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-yellow-100 dark:bg-yellow-500/20 flex items-center justify-center">
                  <FiClock className="text-yellow-500 dark:text-yellow-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-700 dark:text-gray-200 font-medium">Open Tickets</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{erpStats?.open_tickets || 0}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 sm:p-4 bg-white/50 dark:bg-gray-700/50 rounded-xl">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-500/20 flex items-center justify-center">
                  <FiCheckCircle className="text-green-500 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-700 dark:text-gray-200 font-medium">Paid Invoices</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{erpStats?.paid_invoices || 0}</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-card p-4 sm:p-6 rounded-2xl bg-white/90 dark:bg-gray-800/90 border border-gray-200/50 dark:border-gray-700/50"
        >
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">Recent Activity</h2>
          <div className="space-y-3 sm:space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 hover:bg-white/50 dark:hover:bg-gray-700/50 rounded-xl transition-all">
                <div className="mt-1">{activity.icon}</div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900 dark:text-white font-medium">{activity.text}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-300 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Welcome Message */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card p-4 sm:p-6 lg:p-8 rounded-2xl mt-4 sm:mt-6 bg-gradient-to-r from-primary-500/20 to-purple-500/20 dark:from-primary-500/30 dark:to-purple-500/30 border border-primary-500/30 dark:border-primary-400/30"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-primary-600 shadow-lg flex items-center justify-center flex-shrink-0">
            <FiTrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-1 sm:mb-2">
              Welcome to CITRICLOUD
            </h3>
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-200">
              Your comprehensive platform for managing dashboards, content, and business operations.
              Everything is running smoothly and optimized for peak performance.
            </p>
          </div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
