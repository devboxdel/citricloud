import { useQuery } from '@tanstack/react-query';
import DashboardLayout from '../../components/DashboardLayout';
import { motion } from 'framer-motion';
import { FiBriefcase, FiUsers, FiTrendingUp, FiDollarSign, FiMail, FiTarget } from 'react-icons/fi';
import { useState } from 'react';

interface Campaign {
  id: number;
  name: string;
  status: 'active' | 'paused' | 'completed' | 'draft';
  type: 'email' | 'social' | 'display' | 'search';
  budget: number;
  spent: number;
  impressions: number;
  clicks: number;
  conversions: number;
  start_date: string;
  end_date: string;
}

const STATUS_COLORS = {
  active: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300',
  paused: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300',
  completed: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300',
  draft: 'bg-gray-100 dark:bg-gray-700/50 text-gray-700 dark:text-gray-400',
};

const TYPE_COLORS = {
  email: 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300',
  social: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300',
  display: 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300',
  search: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300',
};

export default function CRMCampaigns() {
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Mock data for campaigns - replace with real API when available
  const campaigns: Campaign[] = [
    {
      id: 1,
      name: 'Summer Sale 2024',
      status: 'active',
      type: 'email',
      budget: 5000,
      spent: 3200,
      impressions: 45000,
      clicks: 2400,
      conversions: 120,
      start_date: '2024-06-01',
      end_date: '2024-08-31',
    },
    {
      id: 2,
      name: 'Product Launch Campaign',
      status: 'active',
      type: 'social',
      budget: 10000,
      spent: 8500,
      impressions: 150000,
      clicks: 8900,
      conversions: 450,
      start_date: '2024-05-15',
      end_date: '2024-07-15',
    },
    {
      id: 3,
      name: 'Brand Awareness Q2',
      status: 'completed',
      type: 'display',
      budget: 7500,
      spent: 7500,
      impressions: 280000,
      clicks: 5600,
      conversions: 280,
      start_date: '2024-04-01',
      end_date: '2024-06-30',
    },
    {
      id: 4,
      name: 'Holiday Campaign',
      status: 'draft',
      type: 'search',
      budget: 15000,
      spent: 0,
      impressions: 0,
      clicks: 0,
      conversions: 0,
      start_date: '2024-11-01',
      end_date: '2024-12-31',
    },
  ];

  const filteredCampaigns = selectedStatus === 'all'
    ? campaigns
    : campaigns.filter(c => c.status === selectedStatus);

  const stats = {
    totalCampaigns: campaigns.length,
    activeCampaigns: campaigns.filter(c => c.status === 'active').length,
    totalBudget: campaigns.reduce((sum, c) => sum + c.budget, 0),
    totalSpent: campaigns.reduce((sum, c) => sum + c.spent, 0),
    totalConversions: campaigns.reduce((sum, c) => sum + c.conversions, 0),
    totalImpressions: campaigns.reduce((sum, c) => sum + c.impressions, 0),
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const calculateROI = (campaign: Campaign) => {
    if (campaign.spent === 0) return 0;
    // Assuming average conversion value of $100
    const revenue = campaign.conversions * 100;
    const roi = ((revenue - campaign.spent) / campaign.spent) * 100;
    return roi.toFixed(1);
  };

  const calculateCTR = (campaign: Campaign) => {
    if (campaign.impressions === 0) return '0.0';
    return ((campaign.clicks / campaign.impressions) * 100).toFixed(2);
  };

  return (
    <DashboardLayout
      title="Campaigns"
      breadcrumb={<div className="text-xs text-gray-500">CRM / Campaigns</div>}
    >
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Marketing Campaigns</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Manage and track marketing campaigns</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 rounded-2xl bg-white/80 dark:bg-gray-800/90"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center text-white">
              <FiBriefcase className="w-6 h-6" />
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-300 text-sm">Total Campaigns</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{stats.totalCampaigns}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6 rounded-2xl bg-white/80 dark:bg-gray-800/90"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-500 flex items-center justify-center text-white">
              <FiTarget className="w-6 h-6" />
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-300 text-sm">Active</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{stats.activeCampaigns}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6 rounded-2xl bg-white/80 dark:bg-gray-800/90"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500 flex items-center justify-center text-white">
              <FiDollarSign className="w-6 h-6" />
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-300 text-sm">Total Spent</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                {formatCurrency(stats.totalSpent)}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-6 rounded-2xl bg-white/80 dark:bg-gray-800/90"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-orange-500 flex items-center justify-center text-white">
              <FiTrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-300 text-sm">Conversions</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                {formatNumber(stats.totalConversions)}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
        {['all', 'active', 'paused', 'completed', 'draft'].map((status) => (
          <button
            key={status}
            onClick={() => setSelectedStatus(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
              selectedStatus === status
                ? 'bg-blue-500 text-white'
                : 'bg-white/60 dark:bg-gray-700/60 text-gray-700 dark:text-gray-300 hover:bg-white/80 dark:hover:bg-gray-700/80'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Campaigns Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredCampaigns.map((campaign, index) => (
          <motion.div
            key={campaign.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass-card p-6 rounded-2xl bg-white/80 dark:bg-gray-800/90 hover:shadow-xl transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">
                  {campaign.name}
                </h3>
                <div className="flex gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[campaign.status]}`}>
                    {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${TYPE_COLORS[campaign.type]}`}>
                    {campaign.type.charAt(0).toUpperCase() + campaign.type.slice(1)}
                  </span>
                </div>
              </div>
            </div>

            {/* Budget Progress */}
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600 dark:text-gray-400">Budget</span>
                <span className="text-gray-800 dark:text-gray-100 font-medium">
                  {formatCurrency(campaign.spent)} / {formatCurrency(campaign.budget)}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all"
                  style={{ width: `${(campaign.spent / campaign.budget) * 100}%` }}
                />
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Impressions</p>
                <p className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                  {formatNumber(campaign.impressions)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Clicks</p>
                <p className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                  {formatNumber(campaign.clicks)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">CTR</p>
                <p className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                  {calculateCTR(campaign)}%
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">ROI</p>
                <p className={`text-lg font-semibold ${
                  parseFloat(String(calculateROI(campaign))) >= 0 ? 'text-green-500' : 'text-red-500'
                }`}>
                  {calculateROI(campaign)}%
                </p>
              </div>
            </div>

            {/* Dates */}
            <div className="text-xs text-gray-500 dark:text-gray-400 pt-4 border-t border-gray-200 dark:border-gray-700">
              {formatDate(campaign.start_date)} - {formatDate(campaign.end_date)}
            </div>
          </motion.div>
        ))}
      </div>

      {filteredCampaigns.length === 0 && (
        <div className="text-center py-12">
          <FiBriefcase className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 dark:text-gray-400">No campaigns found</p>
        </div>
      )}
    </DashboardLayout>
  );
}
