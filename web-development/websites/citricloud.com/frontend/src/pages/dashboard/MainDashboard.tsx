import { useQuery } from '@tanstack/react-query';
import DashboardLayout from '../../components/DashboardLayout';
import { crmAPI, cmsAPI, erpAPI } from '../../lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import {
  FiUsers, FiFileText, FiShoppingCart, FiDollarSign,
  FiTrendingUp, FiAlertCircle, FiCheckCircle, FiClock,
  FiSettings, FiLayout, FiPackage, FiBarChart2, FiMail,
  FiGrid, FiServer, FiShield, FiZap, FiTarget, FiAward,
  FiBookOpen, FiArrowRight, FiPlayCircle, FiStar, FiCode,
  FiEdit, FiDatabase, FiBox, FiMessageSquare, FiTool, FiGlobe
} from 'react-icons/fi';

export default function MainDashboard() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('overview');
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);

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

  // Role-specific features and capabilities
  const getRoleFeatures = () => {
    const role = user?.role || 'user';
    
    const features: Record<string, any> = {
      system_admin: {
        title: 'System Administrator',
        description: 'Full system access with complete control over all modules and configurations',
        capabilities: [
          { icon: <FiSettings />, title: 'System Configuration', desc: 'Manage global settings and configurations', path: '/dashboard/settings' },
          { icon: <FiUsers />, title: 'User Management', desc: 'Create, edit, and manage all user accounts', path: '/dashboard/crm/users' },
          { icon: <FiShield />, title: 'Role Management', desc: 'Define and assign user roles and permissions', path: '/dashboard/crm/roles' },
          { icon: <FiServer />, title: 'Server Management', desc: 'Monitor and manage server resources', path: '/dashboard/srm' },
          { icon: <FiDatabase />, title: 'Database Administration', desc: 'Manage databases and backups', path: '/dashboard/srm/databases' },
          { icon: <FiCode />, title: 'API Management', desc: 'Configure API endpoints and webhooks', path: '/dashboard/srm/api-endpoints' },
        ],
        quickActions: [
          { label: 'View All Users', path: '/dashboard/crm/users', icon: <FiUsers /> },
          { label: 'System Logs', path: '/dashboard/logs', icon: <FiFileText /> },
          { label: 'Server Status', path: '/dashboard/srm', icon: <FiServer /> },
          { label: 'Security Settings', path: '/dashboard/settings', icon: <FiShield /> },
        ],
      },
      developer: {
        title: 'Developer',
        description: 'Technical access to development tools, API management, and system integrations',
        capabilities: [
          { icon: <FiCode />, title: 'API Development', desc: 'Create and manage REST APIs', path: '/dashboard/srm/api-endpoints' },
          { icon: <FiServer />, title: 'Server Resources', desc: 'Monitor server performance', path: '/dashboard/srm/performance' },
          { icon: <FiDatabase />, title: 'Database Access', desc: 'Query and manage databases', path: '/dashboard/srm/databases' },
          { icon: <FiTool />, title: 'Developer Tools', desc: 'Access debugging and testing tools', path: '/dashboard/srm/terminal' },
          { icon: <FiGlobe />, title: 'Domain Management', desc: 'Configure domains and DNS', path: '/dashboard/srm/domains' },
          { icon: <FiZap />, title: 'Cache Management', desc: 'Manage application caches', path: '/dashboard/srm/caches' },
        ],
        quickActions: [
          { label: 'API Endpoints', path: '/dashboard/srm/api-endpoints', icon: <FiCode /> },
          { label: 'Terminal Access', path: '/dashboard/srm/terminal', icon: <FiTool /> },
          { label: 'Performance', path: '/dashboard/srm/performance', icon: <FiBarChart2 /> },
          { label: 'Logs', path: '/dashboard/logs', icon: <FiFileText /> },
        ],
      },
      administrator: {
        title: 'Administrator',
        description: 'Manage content, users, and business operations across CRM, CMS, and ERP modules',
        capabilities: [
          { icon: <FiLayout />, title: 'CMS Management', desc: 'Create and manage website content', path: '/dashboard/cms' },
          { icon: <FiUsers />, title: 'CRM Operations', desc: 'Manage customer relationships', path: '/dashboard/crm' },
          { icon: <FiShoppingCart />, title: 'ERP Management', desc: 'Handle orders, invoices, and inventory', path: '/dashboard/erp' },
          { icon: <FiFileText />, title: 'Content Publishing', desc: 'Create blog posts and pages', path: '/dashboard/cms/blog-posts' },
          { icon: <FiPackage />, title: 'Product Management', desc: 'Manage product catalog', path: '/dashboard/erp/products' },
          { icon: <FiMessageSquare />, title: 'Support Tickets', desc: 'Manage customer support', path: '/dashboard/crm/tickets' },
        ],
        quickActions: [
          { label: 'Create Blog Post', path: '/dashboard/cms/blog-posts', icon: <FiEdit /> },
          { label: 'Manage Users', path: '/dashboard/crm/users', icon: <FiUsers /> },
          { label: 'View Orders', path: '/dashboard/erp', icon: <FiShoppingCart /> },
          { label: 'Customer Tickets', path: '/dashboard/crm/tickets', icon: <FiMessageSquare /> },
        ],
      },
      user: {
        title: 'User',
        description: 'Access your personal dashboard and manage your account settings',
        capabilities: [
          { icon: <FiSettings />, title: 'Profile Settings', desc: 'Update your personal information', path: '/dashboard/profile' },
          { icon: <FiShoppingCart />, title: 'My Orders', desc: 'View your order history', path: '/dashboard/erp/my-orders' },
          { icon: <FiMessageSquare />, title: 'Support Tickets', desc: 'Create and track support requests', path: '/dashboard/crm/my-tickets' },
          { icon: <FiMail />, title: 'Email Workspace', desc: 'Access your email workspace', path: '/dashboard/workspace/email' },
          { icon: <FiGrid />, title: 'Workspace Apps', desc: 'Access productivity tools', path: '/dashboard/workspace' },
          { icon: <FiBarChart2 />, title: 'Reports', desc: 'View your activity reports', path: '/dashboard/reports' },
        ],
        quickActions: [
          { label: 'My Profile', path: '/dashboard/profile', icon: <FiSettings /> },
          { label: 'My Orders', path: '/dashboard/erp/my-orders', icon: <FiShoppingCart /> },
          { label: 'Support', path: '/dashboard/crm/my-tickets', icon: <FiMessageSquare /> },
          { label: 'Email', path: '/dashboard/workspace/email', icon: <FiMail /> },
        ],
      },
    };

    return features[role] || features.user;
  };

  const roleData = getRoleFeatures();

  // Interactive feature cards
  const platformFeatures = [
    {
      icon: <FiZap className="w-8 h-8" />,
      title: 'Lightning Fast',
      description: 'Optimized performance with edge caching and CDN delivery',
      color: 'from-yellow-500 to-orange-500',
    },
    {
      icon: <FiShield className="w-8 h-8" />,
      title: 'Secure by Default',
      description: 'Enterprise-grade security with 2FA and encryption',
      color: 'from-green-500 to-emerald-500',
    },
    {
      icon: <FiAward className="w-8 h-8" />,
      title: 'Award Winning',
      description: 'Recognized for excellence in cloud hosting',
      color: 'from-purple-500 to-pink-500',
    },
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <FiBarChart2 /> },
    { id: 'capabilities', label: 'What You Can Do', icon: <FiTarget /> },
    { id: 'quickstart', label: 'Quick Start Guide', icon: <FiPlayCircle /> },
  ];

  return (
    <DashboardLayout
      title="Main Dashboard"
      breadcrumb={<div className="text-xs text-gray-500">Overview</div>}
    >
      {/* Welcome Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6 sm:p-8 lg:p-10 rounded-2xl mb-6 sm:mb-8 bg-gradient-to-br from-primary-500/20 via-purple-500/20 to-pink-500/20 dark:from-primary-500/30 dark:via-purple-500/30 dark:to-pink-500/30 border border-primary-500/30 dark:border-primary-400/30 relative overflow-hidden"
      >
        {/* Animated background */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-72 h-72 bg-primary-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
          <div className="absolute top-0 right-0 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse animation-delay-2000"></div>
          <div className="absolute bottom-0 left-1/2 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse animation-delay-4000"></div>
        </div>

        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0 mb-6">
            <div className="flex items-center space-x-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 10 }}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-primary-600 to-purple-600 shadow-xl flex items-center justify-center flex-shrink-0"
              >
                <FiStar className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </motion.div>
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-1">
                  Welcome back, {user?.full_name || 'User'}!
                </h1>
                <div className="flex items-center space-x-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-primary-500 text-white">
                    {roleData.title}
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    • Last login: {new Date().toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <p className="text-base sm:text-lg text-gray-700 dark:text-gray-200 max-w-3xl">
            {roleData.description}
          </p>
        </div>
      </motion.div>

      {/* Tabs Navigation */}
      <div className="glass-card rounded-2xl p-1 mb-6 bg-white/90 dark:bg-gray-800/90 border border-gray-200/50 dark:border-gray-700/50 inline-flex">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2 px-4 sm:px-6 py-2 sm:py-3 rounded-xl transition-all ${
              activeTab === tab.id
                ? 'bg-primary-500 text-white shadow-md'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            {tab.icon}
            <span className="hidden sm:inline font-medium">{tab.label}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02, y: -5 }}
                  className="glass-card p-4 sm:p-6 rounded-2xl bg-white/90 dark:bg-gray-800/90 border border-gray-200/50 dark:border-gray-700/50 cursor-pointer"
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

            {/* Platform Features */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {platformFeatures.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  onHoverStart={() => setHoveredFeature(index)}
                  onHoverEnd={() => setHoveredFeature(null)}
                  className="glass-card p-6 rounded-2xl bg-white/90 dark:bg-gray-800/90 border border-gray-200/50 dark:border-gray-700/50 relative overflow-hidden cursor-pointer"
                >
                  <motion.div
                    initial={false}
                    animate={{ opacity: hoveredFeature === index ? 0.1 : 0 }}
                    className={`absolute inset-0 bg-gradient-to-br ${feature.color}`}
                  />
                  <div className="relative z-10">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-white mb-4 shadow-lg`}>
                      {feature.icon}
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{feature.description}</p>
                  </div>
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
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start space-x-3 p-3 hover:bg-white/50 dark:hover:bg-gray-700/50 rounded-xl transition-all cursor-pointer"
                    >
                      <div className="mt-1">{activity.icon}</div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900 dark:text-white font-medium">{activity.text}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-300 mt-1">{activity.time}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}

        {activeTab === 'capabilities' && (
          <motion.div
            key="capabilities"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Role Capabilities */}
            <div className="glass-card p-6 sm:p-8 rounded-2xl bg-white/90 dark:bg-gray-800/90 border border-gray-200/50 dark:border-gray-700/50">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center">
                  <FiTarget className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Your Capabilities</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-300">What you can do as a {roleData.title}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {roleData.capabilities.map((capability: any, index: number) => (
                  <Link key={index} to={capability.path}>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ scale: 1.02, y: -2 }}
                      className="p-5 bg-gradient-to-br from-white to-gray-50 dark:from-gray-700 dark:to-gray-800 rounded-xl border border-gray-200/50 dark:border-gray-600/50 hover:border-primary-500 dark:hover:border-primary-400 transition-all cursor-pointer"
                    >
                      <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 rounded-lg bg-primary-500/10 dark:bg-primary-500/20 flex items-center justify-center text-primary-600 dark:text-primary-400 flex-shrink-0">
                          {capability.icon}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{capability.title}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-300">{capability.desc}</p>
                        </div>
                      </div>
                    </motion.div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="glass-card p-6 rounded-2xl bg-white/90 dark:bg-gray-800/90 border border-gray-200/50 dark:border-gray-700/50">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                <FiZap className="text-primary-500" />
                <span>Quick Actions</span>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {roleData.quickActions.map((action: any, index: number) => (
                  <Link key={index} to={action.path}>
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-4 bg-gradient-to-br from-primary-500 to-purple-500 rounded-xl text-white text-center cursor-pointer shadow-lg hover:shadow-xl transition-all"
                    >
                      <div className="flex justify-center mb-2">
                        <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                          {action.icon}
                        </div>
                      </div>
                      <p className="text-sm font-semibold">{action.label}</p>
                    </motion.div>
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'quickstart' && (
          <motion.div
            key="quickstart"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="glass-card p-6 sm:p-8 rounded-2xl bg-white/90 dark:bg-gray-800/90 border border-gray-200/50 dark:border-gray-700/50">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                  <FiBookOpen className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Quick Start Guide</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Get started in 3 easy steps</p>
                </div>
              </div>

              <div className="space-y-4">
                {[
                  {
                    step: 1,
                    title: 'Explore Your Dashboard',
                    description: 'Familiarize yourself with the main dashboard and available modules.',
                    action: 'Navigate through the sidebar to explore different sections',
                    icon: <FiLayout />,
                  },
                  {
                    step: 2,
                    title: 'Configure Your Profile',
                    description: 'Set up your account preferences, security settings, and notifications.',
                    action: 'Go to Profile Settings',
                    link: '/dashboard/profile',
                    icon: <FiSettings />,
                  },
                  {
                    step: 3,
                    title: 'Start Managing',
                    description: 'Begin using the platform features based on your role and permissions.',
                    action: 'Access your main workspace',
                    icon: <FiCheckCircle />,
                  },
                ].map((guide, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start space-x-4 p-5 bg-gradient-to-r from-white to-gray-50 dark:from-gray-700 dark:to-gray-800 rounded-xl border border-gray-200/50 dark:border-gray-600/50"
                  >
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-purple-500 text-white flex items-center justify-center font-bold">
                        {guide.step}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="text-primary-600 dark:text-primary-400">{guide.icon}</div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{guide.title}</h3>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{guide.description}</p>
                      {guide.link ? (
                        <Link to={guide.link}>
                          <button className="inline-flex items-center space-x-2 text-sm font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300">
                            <span>{guide.action}</span>
                            <FiArrowRight />
                          </button>
                        </Link>
                      ) : (
                        <p className="text-sm text-gray-500 dark:text-gray-400 italic">{guide.action}</p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Help Resources */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { title: 'Documentation', desc: 'Comprehensive guides and tutorials', icon: <FiBookOpen />, link: '/documentation' },
                { title: 'Help Center', desc: 'Find answers to common questions', icon: <FiMessageSquare />, link: '/help-center' },
                { title: 'Contact Support', desc: 'Get help from our support team', icon: <FiMail />, link: '/contact' },
              ].map((resource, index) => (
                <Link key={index} to={resource.link}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    className="glass-card p-6 rounded-xl bg-white/90 dark:bg-gray-800/90 border border-gray-200/50 dark:border-gray-700/50 cursor-pointer hover:border-primary-500 dark:hover:border-primary-400 transition-all"
                  >
                    <div className="w-12 h-12 rounded-lg bg-primary-500/10 dark:bg-primary-500/20 flex items-center justify-center text-primary-600 dark:text-primary-400 mb-4">
                      {resource.icon}
                    </div>
                    <h3 className="font-bold text-gray-900 dark:text-white mb-2">{resource.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{resource.desc}</p>
                  </motion.div>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}