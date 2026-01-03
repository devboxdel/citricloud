import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { erpAPI } from '../../lib/api';
import { motion } from 'framer-motion';
import { FiSearch, FiFilter, FiEye } from 'react-icons/fi';

export default function ERPOrders() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const navigate = useNavigate();

  const { data: ordersData, isLoading } = useQuery({
    queryKey: ['orders', page, search, statusFilter],
    queryFn: async () => {
      const response = await erpAPI.getOrders({ 
        page, 
        page_size: 10,
        search,
        status: statusFilter 
      });
      return response.data;
    },
    refetchInterval: () => (document.visibilityState === 'visible' ? 2000 : 15000),
    staleTime: 5000,
    refetchOnWindowFocus: true,
    keepPreviousData: true,
  });

  const orders = ordersData?.items || [];
  const totalPages = ordersData?.pages || 1;

  const handleViewOrder = (order: any) => {
    navigate(`/dashboard/erp/orders/${order.id}`);
  };

  const getStatusColor = (status: string) => {
    const statusMap: Record<string, string> = {
      'pending': 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300',
      'planned': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      'working_on': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
      'processing': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      'in_production': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
      'quality_check': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
      'ready_to_ship': 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300',
      'shipped': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300',
      'delivered': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      'on_hold': 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
      'cancelled': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      'refunded': 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300',
      'completed': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
    };
    return statusMap[status.toLowerCase()] || statusMap['pending'];
  };

  const formatStatus = (status: string) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6 rounded-2xl bg-white/80 dark:bg-gray-800/90 border border-white/30 dark:border-gray-700/50 shadow-sm"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Orders Management</h2>
        
        <div className="flex gap-4">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search orders..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          
          <div className="relative">
            <FiFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-10 pr-8 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="planned">Planned</option>
              <option value="working_on">Working On</option>
              <option value="processing">Processing</option>
              <option value="in_production">In Production</option>
              <option value="quality_check">Quality Check</option>
              <option value="ready_to_ship">Ready to Ship</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="on_hold">On Hold</option>
              <option value="cancelled">Cancelled</option>
              <option value="refunded">Refunded</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-200">Order #</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-200">Customer</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-200">Amount</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-200">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-200">Date</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-200">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order: any) => (
                  <tr key={order.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="py-3 px-4 text-gray-800 dark:text-gray-300">{order.order_number}</td>
                    <td className="py-3 px-4 text-gray-800 dark:text-gray-300">{order.user?.email || 'Unknown'}</td>
                    <td className="py-3 px-4 text-gray-800 dark:text-gray-300">${order.total_amount} {order.currency}</td>
                    <td className="py-3 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {formatStatus(order.status)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <button 
                        onClick={() => handleViewOrder(order)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-600 dark:text-gray-400"
                        title="View order details"
                      >
                        <FiEye className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex justify-center mt-6 gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 disabled:opacity-50"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-gray-600 dark:text-gray-300">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </>
      )}
    </motion.div>
  );
}
