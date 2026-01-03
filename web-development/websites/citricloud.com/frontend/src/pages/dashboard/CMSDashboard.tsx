import { useQuery } from '@tanstack/react-query';
import DashboardLayout from '../../components/DashboardLayout';
import { cmsAPI } from '../../lib/api';
import { motion } from 'framer-motion';
import { FiFileText, FiShoppingCart, FiEdit, FiPackage, FiSettings } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

export default function CMSDashboard() {
  const navigate = useNavigate();
  
  const { data: stats } = useQuery({
    queryKey: ['cms-stats'],
    queryFn: async () => {
      const response = await cmsAPI.getStats();
      return response.data;
    },
  });

  const { data: pages } = useQuery({
    queryKey: ['pages'],
    queryFn: async () => {
      const response = await cmsAPI.getPages({ page: 1, page_size: 10 });
      return response.data;
    },
  });

  const statsCards = [
    {
      title: 'Total Pages',
      value: stats?.total_pages || 0,
      icon: <FiFileText className="w-6 h-6" />,
      color: 'bg-blue-500',
    },
    {
      title: 'Blog Posts',
      value: stats?.total_blog_posts || 0,
      icon: <FiEdit className="w-6 h-6" />,
      color: 'bg-purple-500',
    },
    {
      title: 'Products',
      value: stats?.total_products || 0,
      icon: <FiShoppingCart className="w-6 h-6" />,
      color: 'bg-green-500',
    },
  ];

  return (
    <DashboardLayout
      title="CMS Dashboard"
      breadcrumb={<div className="text-xs text-gray-500">Content Management</div>}
    >
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="glass-card p-6 rounded-2xl text-left hover:shadow-lg transition-all bg-white/80 dark:bg-gray-800/90 border border-white/30 dark:border-gray-700/50"
        >
          <FiFileText className="w-8 h-8 text-primary-500 mb-3" />
          <h3 className="font-bold text-gray-800 dark:text-gray-100">Create Page</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Add a new page to your website</p>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="glass-card p-6 rounded-2xl text-left hover:shadow-lg transition-all bg-white/80 dark:bg-gray-800/90 border border-white/30 dark:border-gray-700/50"
        >
          <FiEdit className="w-8 h-8 text-purple-500 mb-3" />
          <h3 className="font-bold text-gray-800 dark:text-gray-100">Write Blog Post</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Create a new blog article</p>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="glass-card p-6 rounded-2xl text-left hover:shadow-lg transition-all bg-white/80 dark:bg-gray-800/90 border border-white/30 dark:border-gray-700/50"
        >
          <FiShoppingCart className="w-8 h-8 text-green-500 mb-3" />
          <h3 className="font-bold text-gray-800 dark:text-gray-100">Add Product</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Add a new product to shop</p>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="glass-card p-6 rounded-2xl text-left hover:shadow-lg transition-all bg-white/80 dark:bg-gray-800/90 border border-white/30 dark:border-gray-700/50"
        >
          <FiPackage className="w-8 h-8 text-orange-500 mb-3" />
          <h3 className="font-bold text-gray-800 dark:text-gray-100">Manage Menus</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Edit navigation menus</p>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/dashboard/cms/frontend-settings')}
          className="glass-card p-6 rounded-2xl text-left hover:shadow-lg transition-all bg-white/80 dark:bg-gray-800/90 border border-white/30 dark:border-gray-700/50"
        >
          <FiSettings className="w-8 h-8 text-blue-500 mb-3" />
          <h3 className="font-bold text-gray-800 dark:text-gray-100">Frontend Settings</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Configure frontend options</p>
        </motion.button>
      </div>

      {/* Pages List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card p-6 rounded-2xl bg-white/80 dark:bg-gray-800/90 border border-white/30 dark:border-gray-700/50 shadow-sm dark:shadow-[0_0_0_1px_rgba(255,255,255,0.05)]"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Recent Pages</h2>
          <button className="glass-button px-6 py-2 rounded-xl text-white font-medium">
            View All
          </button>
        </div>

        <div className="space-y-3">
          {pages?.items?.slice(0, 5).map((page: any) => (
            <div
              key={page.id}
              className="flex items-center justify-between p-4 bg-white/70 dark:bg-gray-800/70 rounded-xl hover:bg-white/80 dark:hover:bg-gray-700/80 transition-all border border-white/30 dark:border-gray-700/40"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <FiFileText className="text-blue-500" />
                </div>
                <div>
                  <p className="font-medium text-gray-800 dark:text-gray-100">{page.title}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">/{page.slug}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <span className={`px-3 py-1 rounded-lg text-sm font-medium ${
                  page.status === 'published'
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                    : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                }`}>
                  {page.status}
                </span>
                <button className="text-primary-500 hover:text-primary-600 font-medium">
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
