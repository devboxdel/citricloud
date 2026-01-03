import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { erpAPI } from '../../lib/api';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiUser, FiMapPin, FiCalendar, FiPackage, FiDollarSign, FiClock } from 'react-icons/fi';
import toast from 'react-hot-toast';

const orderStatuses = [
  { value: 'pending', label: 'Pending', color: 'gray' },
  { value: 'planned', label: 'Planned', color: 'blue' },
  { value: 'working_on', label: 'Working On', color: 'purple' },
  { value: 'processing', label: 'Processing', color: 'yellow' },
  { value: 'in_production', label: 'In Production', color: 'orange' },
  { value: 'quality_check', label: 'Quality Check', color: 'indigo' },
  { value: 'ready_to_ship', label: 'Ready to Ship', color: 'teal' },
  { value: 'shipped', label: 'Shipped', color: 'cyan' },
  { value: 'delivered', label: 'Delivered', color: 'green' },
  { value: 'on_hold', label: 'On Hold', color: 'amber' },
  { value: 'cancelled', label: 'Cancelled', color: 'red' },
  { value: 'refunded', label: 'Refunded', color: 'pink' },
  { value: 'completed', label: 'Completed', color: 'emerald' },
];

const statusColors: Record<string, string> = {
  gray: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300 border-gray-300 dark:border-gray-700',
  blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-300 dark:border-blue-700',
  purple: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 border-purple-300 dark:border-purple-700',
  yellow: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700',
  orange: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 border-orange-300 dark:border-orange-700',
  indigo: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300 border-indigo-300 dark:border-indigo-700',
  teal: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300 border-teal-300 dark:border-teal-700',
  cyan: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300 border-cyan-300 dark:border-cyan-700',
  green: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-300 dark:border-green-700',
  amber: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border-amber-300 dark:border-amber-700',
  red: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-300 dark:border-red-700',
  pink: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300 border-pink-300 dark:border-pink-700',
  emerald: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700',
};

export default function ERPOrderDetail() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedStatus, setSelectedStatus] = useState('');

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', orderId],
    queryFn: async () => {
      const response = await erpAPI.getOrder(Number(orderId));
      return response.data;
    },
    enabled: !!orderId,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async (status: string) => {
      const response = await erpAPI.updateOrderStatus(Number(orderId), status);
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || 'Order status updated successfully');
      queryClient.invalidateQueries({ queryKey: ['order', orderId] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to update order status');
    },
  });

  const handleStatusChange = () => {
    if (selectedStatus && selectedStatus !== order?.status) {
      updateStatusMutation.mutate(selectedStatus);
    }
  };

  const getStatusColor = (status: string) => {
    const statusObj = orderStatuses.find(s => s.value === status);
    return statusColors[statusObj?.color || 'gray'];
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <p className="text-gray-600 dark:text-gray-400 mb-4">Order not found</p>
        <Link
          to="/dashboard/erp/orders"
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Back to Orders
        </Link>
      </div>
    );
  }

  // Set initial status when order loads
  if (!selectedStatus && order) {
    setSelectedStatus(order.status);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard/erp/orders')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <FiArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Order Details
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              {order.order_number}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - 2/3 width */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6 rounded-2xl bg-white/80 dark:bg-gray-800/90 border border-white/30 dark:border-gray-700/50"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2 mb-4">
              <FiUser className="w-5 h-5" />
              Customer Information
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Name</p>
                <p className="text-gray-900 dark:text-gray-100 font-medium">
                  {order.user?.full_name || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                <p className="text-gray-900 dark:text-gray-100">
                  {order.user?.email || 'N/A'}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Shipping Address */}
          {order.shipping_address && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-card p-6 rounded-2xl bg-white/80 dark:bg-gray-800/90 border border-white/30 dark:border-gray-700/50"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2 mb-4">
                <FiMapPin className="w-5 h-5" />
                Shipping Address
              </h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {order.shipping_address.street || ''}<br />
                {order.shipping_address.city || ''}, {order.shipping_address.state || ''} {order.shipping_address.zip || ''}<br />
                {order.shipping_address.country || ''}
              </p>
            </motion.div>
          )}

          {/* Notes */}
          {order.notes && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-card p-6 rounded-2xl bg-white/80 dark:bg-gray-800/90 border border-white/30 dark:border-gray-700/50"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Notes
              </h3>
              <p className="text-gray-700 dark:text-gray-300">{order.notes}</p>
            </motion.div>
          )}
        </div>

        {/* Right Column - 1/3 width */}
        <div className="space-y-6">
          {/* Order Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-6 rounded-2xl bg-white/80 dark:bg-gray-800/90 border border-white/30 dark:border-gray-700/50"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2 mb-4">
              <FiPackage className="w-5 h-5" />
              Order Information
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <FiCalendar className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Created</p>
                  <p className="text-sm">{new Date(order.created_at).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <FiClock className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Updated</p>
                  <p className="text-sm">{new Date(order.updated_at).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <FiDollarSign className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Total</p>
                  <p className="text-sm font-semibold">${order.total_amount} {order.currency}</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Status Management */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-6 rounded-2xl bg-white/80 dark:bg-gray-800/90 border border-white/30 dark:border-gray-700/50"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Order Status
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Current Status:</p>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(order.status)}`}>
                  {orderStatuses.find(s => s.value === order.status)?.label || order.status}
                </span>
              </div>
              
              <div>
                <label className="text-sm text-gray-600 dark:text-gray-400 mb-2 block">
                  Change Status:
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  {orderStatuses.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleStatusChange}
                disabled={selectedStatus === order.status || updateStatusMutation.isPending}
                className="w-full px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {updateStatusMutation.isPending ? 'Updating...' : 'Update Status'}
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
