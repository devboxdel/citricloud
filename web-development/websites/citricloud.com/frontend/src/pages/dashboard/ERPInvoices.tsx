import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { erpAPI } from '../../lib/api';
import { motion } from 'framer-motion';
import { FiSearch, FiFilter, FiDownload, FiEdit2, FiX, FiCheck } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function ERPInvoices() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [editingInvoice, setEditingInvoice] = useState<number | null>(null);
  const [editStatus, setEditStatus] = useState('');
  const queryClient = useQueryClient();

  const { data: invoicesData, isLoading } = useQuery({
    queryKey: ['invoices', page, search, statusFilter],
    queryFn: async () => {
      const response = await erpAPI.getInvoices({ 
        page, 
        page_size: 10,
        search,
        status_filter: statusFilter 
      });
      return response.data;
    },
    refetchInterval: () => (document.visibilityState === 'visible' ? 2000 : 15000),
    staleTime: 5000,
    refetchOnWindowFocus: true,
    keepPreviousData: true,
  });

  const updateInvoiceMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => 
      erpAPI.updateInvoice(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast.success('Invoice updated successfully');
      setEditingInvoice(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to update invoice');
    },
  });

  const invoices = invoicesData?.items || [];
  const totalPages = invoicesData?.total_pages || invoicesData?.pages || 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6 rounded-2xl bg-white/80 dark:bg-gray-800/90 border border-white/30 dark:border-gray-700/50 shadow-sm"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Invoices Management</h2>
        
        <div className="flex gap-4">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search invoices..."
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
              <option value="PAID">Paid</option>
              <option value="PENDING">Pending</option>
              <option value="OVERDUE">Overdue</option>
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
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-200">Invoice #</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-200">Customer</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-200">Amount</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-200">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-200">Date</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-200">Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice: any) => (
                  <tr key={invoice.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="py-3 px-4 text-gray-800 dark:text-gray-300">{invoice.invoice_number || `INV-${invoice.id}`}</td>
                    <td className="py-3 px-4 text-gray-800 dark:text-gray-300">{invoice.user?.email || 'Unknown'}</td>
                    <td className="py-3 px-4 text-gray-800 dark:text-gray-300">${invoice.amount}</td>
                    <td className="py-3 px-4">
                      {editingInvoice === invoice.id ? (
                        <div className="flex items-center gap-2">
                          <select
                            value={editStatus}
                            onChange={(e) => setEditStatus(e.target.value)}
                            className="px-2 py-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm"
                          >
                            <option value="DRAFT">Draft</option>
                            <option value="SENT">Sent</option>
                            <option value="PAID">Paid</option>
                            <option value="OVERDUE">Overdue</option>
                            <option value="CANCELLED">Cancelled</option>
                          </select>
                          <button
                            onClick={() => updateInvoiceMutation.mutate({ id: invoice.id, status: editStatus })}
                            className="p-1 hover:bg-green-100 dark:hover:bg-green-900/30 rounded transition-colors text-green-600"
                            disabled={updateInvoiceMutation.isPending}
                          >
                            <FiCheck className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setEditingInvoice(null)}
                            className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors text-red-600"
                          >
                            <FiX className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          invoice.status === 'PAID' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                          invoice.status === 'SENT' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                          invoice.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                          invoice.status === 'OVERDUE' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                          'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                        }`}>
                          {invoice.status}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                      {new Date(invoice.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => {
                            setEditingInvoice(invoice.id);
                            setEditStatus(invoice.status);
                          }}
                          disabled={editingInvoice === invoice.id}
                          className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors text-blue-600 dark:text-blue-400 disabled:opacity-50"
                          title="Edit status"
                        >
                          <FiEdit2 className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => window.open(`/api/v1/erp/invoices/${invoice.id}/download`, '_blank')}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-600 dark:text-gray-400"
                          title="Download invoice"
                        >
                          <FiDownload className="w-5 h-5" />
                        </button>
                      </div>
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
