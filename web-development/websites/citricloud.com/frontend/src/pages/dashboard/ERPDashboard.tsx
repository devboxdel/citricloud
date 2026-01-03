import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useLocation } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { erpAPI } from '../../lib/api';
import { motion } from 'framer-motion';
import { FiShoppingCart, FiFileText, FiAlertCircle, FiDollarSign } from 'react-icons/fi';
import ERPOrders from './ERPOrders';
import ERPInvoices from './ERPInvoices';
import ERPSuppliers from './ERPSuppliers';
import ERPReports from './ERPReports';
import ERPProducts from './ERPProducts';
import ERPCategories from './ERPCategories';
import ERPStockManagement from './ERPStockManagement';
import ERPOrderDetail from './ERPOrderDetail';

export default function ERPDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('overview');
  const isOrderDetail = /\/dashboard\/erp\/orders\/\d+/.test(location.pathname);

  useEffect(() => {
    const segments = location.pathname.split('/');
    const erpIndex = segments.indexOf('erp');
    const currentTab = segments[erpIndex + 1];
    
    if (currentTab && ['orders', 'invoices', 'suppliers', 'reports', 'products', 'categories', 'stock'].includes(currentTab)) {
      setActiveTab(currentTab);
    } else {
      setActiveTab('overview');
    }
  }, [location]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === 'overview') {
      navigate('/dashboard/erp');
    } else {
      navigate(`/dashboard/erp/${tab}`);
    }
  };

  const { data: stats } = useQuery({
    queryKey: ['erp-stats'],
    queryFn: async () => {
      const response = await erpAPI.getStats();
      return response.data;
    },
  });

  const { data: orders } = useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const response = await erpAPI.getOrders({ page: 1, page_size: 5 });
      return response.data;
    },
  });

  const statsCards = [
    {
      title: 'Total Orders',
      value: stats?.total_orders || 0,
      icon: <FiShoppingCart className="w-6 h-6" />,
      color: 'bg-blue-500',
    },
    {
      title: 'Total Revenue',
      value: `$${(stats?.total_revenue || 0).toLocaleString()}`,
      icon: <FiDollarSign className="w-6 h-6" />,
      color: 'bg-green-500',
    },
    {
      title: 'Paid Invoices',
      value: stats?.paid_invoices || 0,
      icon: <FiFileText className="w-6 h-6" />,
      color: 'bg-purple-500',
    },
    {
      title: 'Open Tickets',
      value: stats?.open_tickets || 0,
      icon: <FiAlertCircle className="w-6 h-6" />,
      color: 'bg-yellow-500',
    },
  ];

  return (
    <DashboardLayout
      title="ERP Dashboard"
      breadcrumb={<div className="text-xs text-gray-500">Enterprise Resource Planning</div>}
    >
      {/* Tabs */}
      <div className="flex space-x-4 mb-6 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
        {['overview', 'products', 'categories', 'stock', 'orders', 'invoices', 'suppliers', 'reports'].map((tab) => (
          <button
            key={tab}
            onClick={() => handleTabChange(tab)}
            className={`pb-2 px-4 text-sm font-medium capitalize transition-colors relative whitespace-nowrap ${
              activeTab === tab
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            {tab.replace('-', ' ')}
            {activeTab === tab && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400"
              />
            )}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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

          {/* Recent Orders */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card p-6 rounded-2xl mb-6 bg-white/80 dark:bg-gray-800/90 border border-white/30 dark:border-gray-700/50 shadow-sm dark:shadow-[0_0_0_1px_rgba(255,255,255,0.05)]"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Recent Orders</h2>
              <button 
                onClick={() => handleTabChange('orders')}
                className="glass-button px-6 py-2 rounded-xl text-white font-medium"
              >
                View All
              </button>
            </div>

            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-200">Order #</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-200">Amount</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-200">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-200">Date</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-200">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders?.items?.map((order: any) => (
                    <tr key={order.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-white/60 dark:hover:bg-gray-700/60 transition-all">
                      <td className="py-3 px-4">
                        <span className="font-medium text-gray-800 dark:text-gray-100">{order.order_number || order.id}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-gray-800 dark:text-gray-100">
                          ${order.total_amount.toFixed(2)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-3 py-1 rounded-lg text-sm font-medium ${
                          order.status === 'delivered' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                          order.status === 'processing' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' :
                          order.status === 'shipped' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400' :
                          'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-300">
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <button className="text-primary-500 hover:text-primary-600 font-medium">
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </>
      )}

      {isOrderDetail ? (
        <ERPOrderDetail />
      ) : (
        <>
          {activeTab === 'orders' && <ERPOrders />}
          {activeTab === 'invoices' && <ERPInvoices />}
          {activeTab === 'suppliers' && <ERPSuppliers />}
          {activeTab === 'reports' && <ERPReports />}
          {activeTab === 'products' && <ERPProducts />}
          {activeTab === 'categories' && <ERPCategories />}
          {activeTab === 'stock' && <ERPStockManagement />}
        </>
      )}
    </DashboardLayout>
  );
}
