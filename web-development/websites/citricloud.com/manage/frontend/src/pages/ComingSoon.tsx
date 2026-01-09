import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Plus, Search, Filter } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';

interface ComingSoonProps {
  title?: string;
  description?: string;
}

const ComingSoon: React.FC<ComingSoonProps> = ({ title, description }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Extract page name from path
  const pathParts = location.pathname.split('/').filter(Boolean);
  const pageName = title || pathParts[pathParts.length - 1]
    ?.split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ') || 'Page';

  // Determine category and show relevant actions
  const category = pathParts[0];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              {pageName}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {description || `Manage your ${pageName.toLowerCase()} settings and configurations`}
            </p>
          </div>
          <button className="px-6 py-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white transition-all disabled:opacity-50 flex items-center space-x-2">
            <Plus size={20} />
            <span>Create New</span>
          </button>
        </div>

        {/* Search and Filter Bar */}
        <div className="glass-card p-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder={`Search ${pageName.toLowerCase()}...`}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 focus:border-primary-500 dark:focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20 transition-all"
              />
            </div>
            <button className="px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all flex items-center space-x-2">
              <Filter size={20} />
              <span>Filter</span>
            </button>
          </div>
        </div>

        {/* Empty State */}
        <div className="glass-card p-12">
          <div className="text-center max-w-2xl mx-auto">
            <div className="w-24 h-24 bg-gray-100 dark:bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-6xl">📦</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              No {pageName} Yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Get started by creating your first {pageName.toLowerCase()}. It only takes a few clicks!
            </p>
            <button className="inline-flex items-center space-x-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl">
              <Plus size={20} />
              <span>Create {pageName}</span>
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card p-6 hover:shadow-lg transition-all cursor-pointer">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-xl flex items-center justify-center mb-4">
              <span className="text-2xl">📊</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              View Statistics
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Track your {pageName.toLowerCase()} performance and metrics
            </p>
          </div>
          
          <div className="glass-card p-6 hover:shadow-lg transition-all cursor-pointer">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-xl flex items-center justify-center mb-4">
              <span className="text-2xl">⚙️</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Configure Settings
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Customize how your {pageName.toLowerCase()} work
            </p>
          </div>
          
          <div className="glass-card p-6 hover:shadow-lg transition-all cursor-pointer">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-xl flex items-center justify-center mb-4">
              <span className="text-2xl">📚</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Documentation
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Learn how to use {pageName.toLowerCase()} effectively
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ComingSoon;
