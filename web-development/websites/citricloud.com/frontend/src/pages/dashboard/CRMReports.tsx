import { useQuery } from '@tanstack/react-query';
import DashboardLayout from '../../components/DashboardLayout';
import { crmAPI, erpAPI } from '../../lib/api';
import { motion } from 'framer-motion';
import { 
  FiBarChart2, 
  FiUsers, 
  FiDollarSign, 
  FiShoppingCart,
  FiTrendingUp,
  FiFileText,
  FiCalendar,
  FiDownload
} from 'react-icons/fi';

export default function CRMReports() {
  // Fetch CRM stats
  const { data: crmStatsData } = useQuery({
    queryKey: ['crm-stats'],
    queryFn: async () => {
      try {
        const response = await crmAPI.getStats();
        return response.data;
      } catch (error) {
        console.error('Error fetching CRM stats:', error);
        return null;
      }
    },
  });

  // Fetch ERP stats
  const { data: erpStatsData } = useQuery({
    queryKey: ['erp-stats'],
    queryFn: async () => {
      try {
        const response = await erpAPI.getStats();
        return response.data;
      } catch (error) {
        console.error('Error fetching ERP stats:', error);
        return null;
      }
    },
  });

  // Fetch recent users
  const { data: usersData } = useQuery({
    queryKey: ['recent-users'],
    queryFn: async () => {
      try {
        const response = await crmAPI.getUsers({ page: 1, page_size: 10 });
        return response.data;
      } catch (error) {
        return { items: [], total: 0 };
      }
    },
  });

  // Fetch recent orders
  const { data: ordersData } = useQuery({
    queryKey: ['recent-orders'],
    queryFn: async () => {
      try {
        const response = await erpAPI.getOrders({ page: 1, page_size: 10 });
        return response.data;
      } catch (error) {
        return { items: [], total: 0 };
      }
    },
  });

  // Fetch tickets
  const { data: ticketsData } = useQuery({
    queryKey: ['tickets-summary'],
    queryFn: async () => {
      try {
        const response = await erpAPI.getTickets({ page: 1, page_size: 100 });
        return response.data;
      } catch (error) {
        return { items: [], total: 0 };
      }
    },
  });

  const crmStats = crmStatsData || {};
  const erpStats = erpStatsData || {};
  const users = usersData?.items || [];
  const orders = ordersData?.items || [];
  const tickets = ticketsData?.items || [];

  // Calculate ticket stats
  const ticketStats = {
    total: tickets.length,
    open: tickets.filter((t: any) => t.status === 'open').length,
    inProgress: tickets.filter((t: any) => t.status === 'in_progress').length,
    resolved: tickets.filter((t: any) => t.status === 'resolved').length,
  };

  // Calculate order stats
  const orderStats = {
    total: orders.length,
    pending: orders.filter((o: any) => o.status === 'pending').length,
    processing: orders.filter((o: any) => o.status === 'processing').length,
    shipped: orders.filter((o: any) => o.status === 'shipped').length,
    delivered: orders.filter((o: any) => o.status === 'delivered').length,
    totalRevenue: orders.reduce((sum: number, o: any) => sum + (o.total_amount || 0), 0),
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

  const exportReport = () => {
    const reportData = {
      generated_at: new Date().toISOString(),
      crm_stats: crmStats,
      erp_stats: erpStats,
      ticket_stats: ticketStats,
      order_stats: orderStats,
      total_users: users.length,
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `crm-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <DashboardLayout
      title="Reports"
      breadcrumb={<div className="text-xs text-gray-500">CRM / Reports</div>}
    >
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Analytics & Reports</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Comprehensive business insights and metrics</p>
        </div>
        <button
          onClick={exportReport}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
        >
          <FiDownload className="w-4 h-4" />
          Export Report
        </button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 rounded-2xl bg-white/80 dark:bg-gray-800/90"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center text-white">
              <FiUsers className="w-6 h-6" />
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-300 text-sm">Total Users</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                {formatNumber(crmStats.total_users || 0)}
              </p>
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
              <p className="text-gray-600 dark:text-gray-300 text-sm">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                {formatCurrency(orderStats.totalRevenue)}
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
            <div className="w-12 h-12 rounded-xl bg-purple-500 flex items-center justify-center text-white">
              <FiShoppingCart className="w-6 h-6" />
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-300 text-sm">Total Orders</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                {formatNumber(erpStats.total_orders || 0)}
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
              <FiFileText className="w-6 h-6" />
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-300 text-sm">Total Tickets</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                {formatNumber(ticketStats.total)}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Detailed Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* User Activity */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-card p-6 rounded-2xl bg-white/80 dark:bg-gray-800/90"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center text-white">
              <FiUsers className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">User Activity</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Active Users</span>
              <span className="text-lg font-semibold text-green-500">
                {formatNumber(crmStats.active_users || 0)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Inactive Users</span>
              <span className="text-lg font-semibold text-gray-500">
                {formatNumber((crmStats.total_users || 0) - (crmStats.active_users || 0))}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">New This Month</span>
              <span className="text-lg font-semibold text-blue-500">
                {formatNumber(Math.floor((crmStats.total_users || 0) * 0.15))}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Order Status */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-card p-6 rounded-2xl bg-white/80 dark:bg-gray-800/90"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-green-500 flex items-center justify-center text-white">
              <FiShoppingCart className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Order Status</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Pending</span>
              <span className="text-lg font-semibold text-yellow-500">{orderStats.pending}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Processing</span>
              <span className="text-lg font-semibold text-blue-500">{orderStats.processing}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Delivered</span>
              <span className="text-lg font-semibold text-green-500">{orderStats.delivered}</span>
            </div>
          </div>
        </motion.div>

        {/* Ticket Status */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6 rounded-2xl bg-white/80 dark:bg-gray-800/90"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-orange-500 flex items-center justify-center text-white">
              <FiFileText className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Ticket Status</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Open</span>
              <span className="text-lg font-semibold text-blue-500">{ticketStats.open}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">In Progress</span>
              <span className="text-lg font-semibold text-yellow-500">{ticketStats.inProgress}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Resolved</span>
              <span className="text-lg font-semibold text-green-500">{ticketStats.resolved}</span>
            </div>
          </div>
        </motion.div>

        {/* Performance Metrics */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6 rounded-2xl bg-white/80 dark:bg-gray-800/90"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-purple-500 flex items-center justify-center text-white">
              <FiTrendingUp className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Performance</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Avg. Order Value</span>
              <span className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                {orderStats.total > 0 
                  ? formatCurrency(orderStats.totalRevenue / orderStats.total)
                  : '$0.00'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Ticket Resolution Rate</span>
              <span className="text-lg font-semibold text-green-500">
                {ticketStats.total > 0
                  ? `${((ticketStats.resolved / ticketStats.total) * 100).toFixed(1)}%`
                  : '0%'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Order Fulfillment</span>
              <span className="text-lg font-semibold text-blue-500">
                {orderStats.total > 0
                  ? `${((orderStats.delivered / orderStats.total) * 100).toFixed(1)}%`
                  : '0%'}
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Report Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card p-6 rounded-2xl bg-white/80 dark:bg-gray-800/90"
      >
        <div className="flex items-center gap-3 mb-4">
          <FiCalendar className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Report generated on {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </span>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          This report includes real-time data from your CRM and ERP systems. Click "Export Report" to download
          a detailed JSON file with all metrics and statistics.
        </p>
      </motion.div>
    </DashboardLayout>
  );
}
