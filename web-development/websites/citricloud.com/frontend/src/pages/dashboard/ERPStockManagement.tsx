import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { erpAPI } from '../../lib/api';
import { motion } from 'framer-motion';
import { FiSearch, FiFilter, FiAlertTriangle, FiPackage, FiTrendingUp, FiTrendingDown, FiEdit2, FiExternalLink, FiClock, FiUpload } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

interface StockItem {
  id: number;
  product_id: number;
  product: {
    id: number;
    name: string;
    sku: string;
    slug: string;
    category?: { name: string };
  };
  quantity: number;
  previous_quantity?: number;
  last_updated: string;
  updated_by?: { email: string };
}

export default function ERPStockManagement() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [stockFilter, setStockFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [editingStock, setEditingStock] = useState<number | null>(null);
  const [newQuantity, setNewQuantity] = useState<number>(0);
  const [movementPage, setMovementPage] = useState(1);
  const [bulkText, setBulkText] = useState('');
  const [bulkPreview, setBulkPreview] = useState<any[]>([]);
  const [bulkError, setBulkError] = useState('');

  const { data: stockData, isLoading } = useQuery({
    queryKey: ['stock-management', page, search, stockFilter, categoryFilter],
    queryFn: async () => {
      const response = await erpAPI.getStockLevels({ 
        page, 
        page_size: 10,
        search,
        stock_status: stockFilter,
        category_id: categoryFilter
      });
      return response.data;
    },
    refetchInterval: () => (document.visibilityState === 'visible' ? 2000 : 15000),
    placeholderData: (previousData) => previousData,
  });

  const { data: movementData, isLoading: isHistoryLoading } = useQuery({
    queryKey: ['stock-movements', movementPage, search, stockFilter, categoryFilter],
    queryFn: async () => {
      const response = await erpAPI.getStockMovements({
        page: movementPage,
        page_size: 10,
        search,
      });
      return response.data;
    },
    refetchInterval: () => (document.visibilityState === 'visible' ? 2000 : 15000),
    placeholderData: (previousData) => previousData,
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['product-categories'],
    queryFn: async () => {
      const response = await erpAPI.getCategories();
      return response.data;
    },
  });

  const updateStockMutation = useMutation({
    mutationFn: ({ productId, quantity }: { productId: number; quantity: number }) => 
      erpAPI.updateStock(productId, { quantity, reason: 'manual_adjustment' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock-management'] });
      queryClient.invalidateQueries({ queryKey: ['erp-products'] });
      setEditingStock(null);
    },
  });

  const items = (stockData as any)?.items || [];
  const totalPages = (stockData as any)?.total_pages || (stockData as any)?.pages || 1;
  const movements = (movementData as any)?.items || [];
  const movementTotalPages = (movementData as any)?.total_pages || (movementData as any)?.pages || 1;
  const categories = categoriesData?.items || [];

  const getStockStatus = (quantity: number) => {
    if (quantity === 0) {
      return { 
        label: 'Out of Stock', 
        color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
        icon: <FiAlertTriangle className="w-4 h-4" />
      };
    }
    if (quantity < 10) {
      return { 
        label: 'Low Stock', 
        color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
        icon: <FiAlertTriangle className="w-4 h-4" />
      };
    }
    return { 
      label: 'In Stock', 
      color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      icon: <FiPackage className="w-4 h-4" />
    };
  };

  const handleEditStock = (productId: number, currentQuantity: number) => {
    setEditingStock(productId);
    setNewQuantity(currentQuantity);
  };

  const handleSaveStock = async (productId: number) => {
    await updateStockMutation.mutateAsync({ productId, quantity: newQuantity });
  };

  const parseBulk = () => {
    setBulkError('');
    const lines = bulkText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    if (lines.length === 0) {
      setBulkPreview([]);
      return;
    }

    const parsed: any[] = [];
    for (const line of lines) {
      const parts = line.split(',').map(p => p.trim());
      if (parts.length < 2) {
        setBulkError('Each row must be "sku, delta, [reason], [note]"');
        return;
      }
      const [sku, deltaStr, reason, note] = parts;
      const delta = Number(deltaStr);
      if (Number.isNaN(delta)) {
        setBulkError(`Delta must be a number for SKU ${sku}`);
        return;
      }
      parsed.push({ sku, delta, reason, note });
    }
    setBulkPreview(parsed);
  };

  const bulkAdjustMutation = useMutation({
    mutationFn: (payload: any) => erpAPI.bulkAdjustStock(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock-management'] });
      queryClient.invalidateQueries({ queryKey: ['stock-movements'] });
      queryClient.invalidateQueries({ queryKey: ['erp-products'] });
      setBulkText('');
      setBulkPreview([]);
    },
  });

  const handleApplyBulk = async () => {
    if (!bulkPreview.length) {
      setBulkError('No rows to apply. Paste CSV and click Preview first.');
      return;
    }
    await bulkAdjustMutation.mutateAsync({ items: bulkPreview });
  };

  const handleCancelEdit = () => {
    setEditingStock(null);
    setNewQuantity(0);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6 rounded-2xl bg-white/80 dark:bg-gray-800/90 border border-white/30 dark:border-gray-700/50 shadow-sm"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-500/10 rounded-lg">
            <FiPackage className="w-6 h-6 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Stock Management</h2>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-red-50 to-red-100/50 dark:from-red-900/20 dark:to-red-800/10 p-4 rounded-xl border border-red-200 dark:border-red-800/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-600 dark:text-red-400 font-medium">Out of Stock</p>
              <p className="text-2xl font-bold text-red-700 dark:text-red-300 mt-1">
                {items.filter((item: any) => item.quantity === 0).length}
              </p>
            </div>
            <FiAlertTriangle className="w-8 h-8 text-red-500" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100/50 dark:from-yellow-900/20 dark:to-yellow-800/10 p-4 rounded-xl border border-yellow-200 dark:border-yellow-800/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-600 dark:text-yellow-400 font-medium">Low Stock</p>
              <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300 mt-1">
                {items.filter((item: any) => item.quantity > 0 && item.quantity < 10).length}
              </p>
            </div>
            <FiTrendingDown className="w-8 h-8 text-yellow-500" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-900/20 dark:to-green-800/10 p-4 rounded-xl border border-green-200 dark:border-green-800/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 dark:text-green-400 font-medium">In Stock</p>
              <p className="text-2xl font-bold text-green-700 dark:text-green-300 mt-1">
                {items.filter((item: any) => item.quantity >= 10).length}
              </p>
            </div>
            <FiTrendingUp className="w-8 h-8 text-green-500" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by product name or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-green-500 outline-none"
          />
        </div>
        
        <div className="relative">
          <FiFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="pl-10 pr-8 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-green-500 outline-none appearance-none min-w-[160px]"
          >
            <option value="">All Categories</option>
            {categories.map((cat: any) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        <div className="relative">
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-green-500 outline-none appearance-none min-w-[160px]"
          >
            <option value="">All Stock Levels</option>
            <option value="out">Out of Stock</option>
            <option value="low">Low Stock</option>
            <option value="in">In Stock</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-12">
          <FiPackage className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">No stock data found</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-200">Product</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-200">SKU</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-200">Category</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-200">Current Stock</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-200">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-200">Last Updated</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-200">Actions</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-200">Product</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item: any) => {
                  const stockStatus = getStockStatus(item.quantity || item.product?.stock_quantity || 0);
                  const quantity = item.quantity ?? item.product?.stock_quantity ?? 0;
                  const isEditing = editingStock === item.product_id || editingStock === item.id;

                  return (
                    <tr key={item.id || item.product_id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-medium text-gray-800 dark:text-gray-300">
                          {item.product?.name || 'Unknown Product'}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400 font-mono text-sm">
                        {item.product?.sku || '-'}
                      </td>
                      <td className="py-3 px-4 text-gray-800 dark:text-gray-300">
                        {item.product?.category?.name || 'Uncategorized'}
                      </td>
                      <td className="py-3 px-4">
                        {isEditing ? (
                          <input
                            type="number"
                            value={newQuantity}
                            onChange={(e) => setNewQuantity(parseInt(e.target.value) || 0)}
                            className="w-24 px-3 py-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-green-500 outline-none"
                            min="0"
                          />
                        ) : (
                          <span className="text-xl font-bold text-gray-800 dark:text-gray-200">
                            {quantity}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${stockStatus.color}`}>
                          {stockStatus.icon}
                          {stockStatus.label}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400 text-sm">
                        {item.last_updated || item.product?.updated_at 
                          ? new Date(item.last_updated || item.product.updated_at).toLocaleString()
                          : '-'}
                      </td>
                      <td className="py-3 px-4">
                        {isEditing ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleSaveStock(item.product_id || item.id)}
                              className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors"
                            >
                              Save
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="px-3 py-1 bg-gray-300 hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 text-sm rounded-lg transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleEditStock(item.product_id || item.id, quantity)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                            title="Edit Stock"
                          >
                            <FiEdit2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => navigate(`/dashboard/erp/products?productId=${item.product_id || item.id}`)}
                          className="inline-flex items-center gap-1 px-3 py-1 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                          title="Manage product"
                        >
                          <FiExternalLink className="w-4 h-4" />
                          Open Product
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-6">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Previous
              </button>
              <span className="text-gray-600 dark:text-gray-400">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Next
              </button>
            </div>
          )}

          {/* Bulk adjustments */}
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-4 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
              <div className="flex items-center gap-2 mb-3">
                <FiUpload className="w-5 h-5 text-blue-500" />
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Bulk Adjustments (CSV)</h3>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Format: sku, delta, [reason], [note]. Example: <span className="font-mono">SKU-123, -2, counted, damaged box</span></p>
              <textarea
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                rows={6}
                className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="SKU-123, 5, received shipment\nSKU-456, -2, audit, broken"
              />
              {bulkError && <p className="text-sm text-red-500 mt-2">{bulkError}</p>}
              <div className="flex gap-3 mt-3">
                <button
                  onClick={parseBulk}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  Preview
                </button>
                <button
                  onClick={handleApplyBulk}
                  disabled={!bulkPreview.length || bulkAdjustMutation.isPending}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg transition-colors"
                >
                  {bulkAdjustMutation.isPending ? 'Applying...' : 'Apply Adjustments'}
                </button>
              </div>

              {bulkPreview.length > 0 && (
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left py-2 pr-3">SKU</th>
                        <th className="text-left py-2 pr-3">Delta</th>
                        <th className="text-left py-2 pr-3">Reason</th>
                        <th className="text-left py-2 pr-3">Note</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bulkPreview.map((row, idx) => (
                        <tr key={`${row.sku}-${idx}`} className="border-b border-gray-100 dark:border-gray-800">
                          <td className="py-2 pr-3 font-mono">{row.sku}</td>
                          <td className={`py-2 pr-3 font-mono ${row.delta < 0 ? 'text-red-600' : 'text-green-600'}`}>{row.delta}</td>
                          <td className="py-2 pr-3 text-gray-700 dark:text-gray-300">{row.reason || '—'}</td>
                          <td className="py-2 pr-3 text-gray-500 dark:text-gray-400">{row.note || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Movement history */}
            <div className="p-4 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <FiClock className="w-5 h-5 text-amber-500" />
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Recent Movements</h3>
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Auto-refreshing</div>
              </div>

              {isHistoryLoading ? (
                <div className="flex justify-center py-6">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-amber-500"></div>
                </div>
              ) : movements.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">No movements yet</p>
              ) : (
                <div className="space-y-3">
                  {movements.map((mv: any) => (
                    <div key={mv.id} className="flex items-start justify-between p-3 rounded-xl border border-gray-100 dark:border-gray-800">
                      <div>
                        <div className="text-sm font-semibold text-gray-800 dark:text-gray-200">{mv.product_name || mv.sku}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">{mv.sku}</div>
                        <div className="text-sm text-gray-700 dark:text-gray-300 mt-1">{mv.reason || 'manual'}</div>
                        {mv.note && <div className="text-xs text-gray-500 dark:text-gray-400">{mv.note}</div>}
                      </div>
                      <div className="text-right">
                        <div className={`text-base font-bold ${mv.change < 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {mv.change > 0 ? `+${mv.change}` : mv.change}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{mv.quantity_before} → {mv.quantity_after}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{mv.created_at ? new Date(mv.created_at).toLocaleString() : ''}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {movementTotalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-4">
                  <button
                    onClick={() => setMovementPage(p => Math.max(1, p - 1))}
                    disabled={movementPage === 1}
                    className="px-3 py-1 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Prev
                  </button>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Page {movementPage} of {movementTotalPages}</span>
                  <button
                    onClick={() => setMovementPage(p => Math.min(movementTotalPages, p + 1))}
                    disabled={movementPage === movementTotalPages}
                    className="px-3 py-1 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
}
