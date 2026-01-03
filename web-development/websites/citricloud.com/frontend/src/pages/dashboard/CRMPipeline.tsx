import { useQuery } from '@tanstack/react-query';
import DashboardLayout from '../../components/DashboardLayout';
import { erpAPI } from '../../lib/api';
import { motion } from 'framer-motion';
import { FiTrendingUp, FiDollarSign, FiShoppingCart, FiPackage, FiTruck, FiCheckCircle } from 'react-icons/fi';
import { useState } from 'react';

interface Order {
  id: number;
  order_number: string;
  status: string;
  total_amount: number;
  currency: string;
  created_at: string;
  user?: {
    username: string;
    email: string;
  };
}

const PIPELINE_STAGES = [
  { key: 'pending', label: 'Pending', icon: <FiShoppingCart />, color: 'bg-blue-500' },
  { key: 'processing', label: 'Processing', icon: <FiPackage />, color: 'bg-yellow-500' },
  { key: 'shipped', label: 'Shipped', icon: <FiTruck />, color: 'bg-purple-500' },
  { key: 'delivered', label: 'Delivered', icon: <FiCheckCircle />, color: 'bg-green-500' },
];

export default function CRMPipeline() {
  const [selectedStage, setSelectedStage] = useState<string>('all');

  const { data: ordersData, isLoading } = useQuery({
    queryKey: ['crm-pipeline', selectedStage],
    queryFn: async () => {
      try {
        const params: any = { page: 1, page_size: 100 };
        if (selectedStage !== 'all') {
          params.status = selectedStage;
        }
        const response = await erpAPI.getOrders(params);
        return response.data;
      } catch (error) {
        console.error('Error fetching orders:', error);
        return { items: [], total: 0 };
      }
    },
  });

  const orders = ordersData?.items || [];

  // Group orders by stage
  const ordersByStage = PIPELINE_STAGES.reduce((acc, stage) => {
    acc[stage.key] = orders.filter((order: Order) => order.status === stage.key);
    return acc;
  }, {} as Record<string, Order[]>);

  // Calculate stats
  const stats = {
    totalOrders: orders.length,
    totalValue: orders.reduce((sum: number, order: Order) => sum + order.total_amount, 0),
    pending: ordersByStage.pending?.length || 0,
    processing: ordersByStage.processing?.length || 0,
    shipped: ordersByStage.shipped?.length || 0,
    delivered: ordersByStage.delivered?.length || 0,
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <DashboardLayout
      title="Sales Pipeline"
      breadcrumb={<div className="text-xs text-gray-500">CRM / Sales Pipeline</div>}
    >
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Sales Pipeline</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Track orders through the sales process</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 rounded-2xl bg-white/80 dark:bg-gray-800/90"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center text-white">
              <FiTrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-300 text-sm">Total Orders</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{stats.totalOrders}</p>
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
              <FiDollarSign className="w-6 h-6" />
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-300 text-sm">Total Value</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                {formatCurrency(stats.totalValue)}
              </p>
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
            <div className="w-12 h-12 rounded-xl bg-yellow-500 flex items-center justify-center text-white">
              <FiPackage className="w-6 h-6" />
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-300 text-sm">In Progress</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                {stats.pending + stats.processing}
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
            <div className="w-12 h-12 rounded-xl bg-green-500 flex items-center justify-center text-white">
              <FiCheckCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-300 text-sm">Delivered</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{stats.delivered}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Pipeline View */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="spinner"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {PIPELINE_STAGES.map((stage, stageIndex) => {
            const stageOrders = ordersByStage[stage.key] || [];
            const stageValue = stageOrders.reduce((sum, order) => sum + order.total_amount, 0);

            return (
              <motion.div
                key={stage.key}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: stageIndex * 0.1 }}
                className="glass-card p-4 rounded-xl bg-white/80 dark:bg-gray-800/90 border border-white/30 dark:border-gray-700/50"
              >
                {/* Stage Header */}
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-8 h-8 rounded-lg ${stage.color} flex items-center justify-center text-white`}>
                      {stage.icon}
                    </div>
                    <h3 className="font-semibold text-gray-800 dark:text-gray-100">{stage.label}</h3>
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    {stageOrders.length} orders • {formatCurrency(stageValue)}
                  </div>
                </div>

                {/* Orders in Stage */}
                <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar">
                  {stageOrders.length === 0 ? (
                    <p className="text-xs text-gray-500 dark:text-gray-400 text-center py-4">
                      No orders
                    </p>
                  ) : (
                    stageOrders.map((order: Order) => (
                      <div
                        key={order.id}
                        className="p-3 rounded-lg bg-white/50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-mono text-gray-500 dark:text-gray-400">
                            #{order.order_number}
                          </span>
                          <span className="text-xs font-bold text-gray-800 dark:text-gray-100">
                            {formatCurrency(order.total_amount, order.currency)}
                          </span>
                        </div>
                        {order.user && (
                          <p className="text-xs text-gray-600 dark:text-gray-300 truncate">
                            {order.user.username}
                          </p>
                        )}
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {formatDate(order.created_at)}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
}
