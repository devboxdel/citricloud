import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiUser, FiMapPin, FiCalendar, FiPackage, FiDollarSign, FiClock } from 'react-icons/fi';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { erpAPI } from '../lib/api';
import toast from 'react-hot-toast';

interface OrderDetailModalProps {
  order: any;
  isOpen: boolean;
  onClose: () => void;
}

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

export default function OrderDetailModal({ order, isOpen, onClose }: OrderDetailModalProps) {
  const [selectedStatus, setSelectedStatus] = useState(order?.status || 'pending');
  const queryClient = useQueryClient();

  const updateStatusMutation = useMutation({
    mutationFn: async (status: string) => {
      const response = await erpAPI.updateOrderStatus(order.id, status);
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || 'Order status updated successfully');
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to update order status');
    },
  });

  const handleStatusChange = () => {
    if (selectedStatus !== order.status) {
      updateStatusMutation.mutate(selectedStatus);
    }
  };

  const getStatusColor = (status: string) => {
    const statusObj = orderStatuses.find(s => s.value === status);
    return statusColors[statusObj?.color || 'gray'];
  };

  if (!order) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />
          
          {/* Modal */}
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 max-h-[90vh] overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    Order Details
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400 mt-1">
                    {order.order_number}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <FiX className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Customer Info */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                      <FiUser className="w-5 h-5" />
                      Customer Information
                    </h3>
                    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 space-y-2">
                      <p className="text-gray-700 dark:text-gray-300">
                        <span className="font-medium">Name:</span> {order.user?.full_name || 'N/A'}
                      </p>
                      <p className="text-gray-700 dark:text-gray-300">
                        <span className="font-medium">Email:</span> {order.user?.email || 'N/A'}
                      </p>
                    </div>
                  </div>

                  {/* Order Info */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                      <FiPackage className="w-5 h-5" />
                      Order Information
                    </h3>
                    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 space-y-2">
                      <p className="text-gray-700 dark:text-gray-300 flex items-center gap-2">
                        <FiCalendar className="w-4 h-4" />
                        <span className="font-medium">Created:</span> {new Date(order.created_at).toLocaleDateString()}
                      </p>
                      <p className="text-gray-700 dark:text-gray-300 flex items-center gap-2">
                        <FiClock className="w-4 h-4" />
                        <span className="font-medium">Updated:</span> {new Date(order.updated_at).toLocaleDateString()}
                      </p>
                      <p className="text-gray-700 dark:text-gray-300 flex items-center gap-2">
                        <FiDollarSign className="w-4 h-4" />
                        <span className="font-medium">Total:</span> ${order.total_amount} {order.currency}
                      </p>
                    </div>
                  </div>

                  {/* Shipping Address */}
                  {order.shipping_address && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                        <FiMapPin className="w-5 h-5" />
                        Shipping Address
                      </h3>
                      <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                        <p className="text-gray-700 dark:text-gray-300">
                          {order.shipping_address.street || ''}<br />
                          {order.shipping_address.city || ''}, {order.shipping_address.state || ''} {order.shipping_address.zip || ''}<br />
                          {order.shipping_address.country || ''}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Status Management */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      Order Status
                    </h3>
                    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                      <div className="mb-3">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Current Status:</span>
                        <div className="mt-1">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(order.status)}`}>
                            {orderStatuses.find(s => s.value === order.status)?.label || order.status}
                          </span>
                        </div>
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
                    </div>
                  </div>
                </div>

                {/* Notes */}
                {order.notes && (
                  <div className="mt-6 space-y-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      Notes
                    </h3>
                    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                      <p className="text-gray-700 dark:text-gray-300">{order.notes}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleStatusChange}
                  disabled={selectedStatus === order.status || updateStatusMutation.isPending}
                  className="px-6 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {updateStatusMutation.isPending ? 'Updating...' : 'Update Status'}
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
