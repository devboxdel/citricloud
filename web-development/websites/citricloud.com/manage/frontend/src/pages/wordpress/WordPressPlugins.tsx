import React from 'react';
import { Package, Download, Shield, Zap } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';

const WordPressPlugins: React.FC = () => {
  const categories = ['All', 'Security', 'SEO', 'Performance', 'E-Commerce', 'Forms'];
  const [selectedCategory, setSelectedCategory] = React.useState('All');

  const plugins = [
    { name: 'Wordfence Security', category: 'Security', installs: '4M+', rating: 4.8, installed: true },
    { name: 'Yoast SEO', category: 'SEO', installs: '5M+', rating: 4.9, installed: true },
    { name: 'WP Rocket', category: 'Performance', installs: '2M+', rating: 4.9, installed: false },
    { name: 'WooCommerce', category: 'E-Commerce', installs: '5M+', rating: 4.6, installed: true },
    { name: 'Contact Form 7', category: 'Forms', installs: '5M+', rating: 4.5, installed: false },
    { name: 'Akismet', category: 'Security', installs: '5M+', rating: 4.7, installed: true },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">WordPress Plugins</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage and install plugins for your WordPress sites
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="glass-card p-6">
            <Package className="text-blue-600 mb-3" size={32} />
            <p className="text-3xl font-bold mb-1">12</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Installed Plugins</p>
          </div>
          <div className="glass-card p-6">
            <Download className="text-green-600 mb-3" size={32} />
            <p className="text-3xl font-bold mb-1">3</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Updates Available</p>
          </div>
          <div className="glass-card p-6">
            <Shield className="text-purple-600 mb-3" size={32} />
            <p className="text-3xl font-bold mb-1">8</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Active Plugins</p>
          </div>
          <div className="glass-card p-6">
            <Zap className="text-orange-600 mb-3" size={32} />
            <p className="text-3xl font-bold mb-1">Good</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Site Performance</p>
          </div>
        </div>

        {/* Categories */}
        <div className="glass-card p-4">
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-lg transition-all ${
                  selectedCategory === cat
                    ? 'bg-primary-600 text-white'
                    : 'border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Plugins Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plugins
            .filter(p => selectedCategory === 'All' || p.category === selectedCategory)
            .map((plugin, index) => (
              <div key={index} className="glass-card p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/20 rounded-lg flex items-center justify-center">
                    <Package className="text-primary-600" size={24} />
                  </div>
                  {plugin.installed && (
                    <span className="px-2 py-1 text-xs font-semibold rounded bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200">
                      Installed
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-bold mb-2">{plugin.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{plugin.category}</p>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-gray-600 dark:text-gray-400">{plugin.installs} installs</span>
                  <div className="flex items-center">
                    <span className="text-yellow-500 mr-1">★</span>
                    <span className="text-sm font-medium">{plugin.rating}</span>
                  </div>
                </div>
                <button className={`w-full px-4 py-2 rounded-lg transition-all ${
                  plugin.installed
                    ? 'bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800'
                    : 'bg-primary-600 hover:bg-primary-700 text-white'
                }`}>
                  {plugin.installed ? 'Configure' : 'Install'}
                </button>
              </div>
            ))}
        </div>

        {/* Bulk Actions */}
        <div className="glass-card p-6">
          <h2 className="text-xl font-bold mb-4">Bulk Actions</h2>
          <div className="flex flex-wrap gap-3">
            <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all">
              Update All Plugins
            </button>
            <button className="px-6 py-3 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-all">
              Deactivate All
            </button>
            <button className="px-6 py-3 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-all">
              Export Settings
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default WordPressPlugins;
