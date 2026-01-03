import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { erpAPI } from '../../lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiFilter, FiPlus, FiEdit2, FiTrash2, FiPackage, FiX, FiUpload } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useLocation, useNavigate } from 'react-router-dom';
import { RichTextEditor } from '../../components/RichTextEditor';

interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  short_description: string;
  sku: string;
  price: number;
  sale_price: number | null;
  category_id: number | null;
  category?: { id: number; name: string };
  stock_quantity: number;
  is_active: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
  images?: string[];
  image_url?: string;
}

interface ProductForm {
  name: string;
  slug: string;
  sku: string;
  price: string;
  sale_price: string;
  category_id: string;
  description: string;
  short_description: string;
  stock_quantity: string;
  is_featured: boolean;
}

const emptyProductForm: ProductForm = {
  name: '',
  slug: '',
  sku: '',
  price: '',
  sale_price: '',
  category_id: '',
  description: '',
  short_description: '',
  stock_quantity: '0',
  is_featured: false,
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

export default function ERPProducts() {
  const queryClient = useQueryClient();
  const location = useLocation();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [view, setView] = useState<'list' | 'form'>('list'); // Changed from showModal
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState<ProductForm>(emptyProductForm);
  const [productImages, setProductImages] = useState<string[]>([]);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Suppress Chrome extension error events that interfere with form submission
  useEffect(() => {
    const suppressExtensionErrors = (event: ErrorEvent) => {
      if (event.message && event.message.includes('message port closed')) {
        console.warn('⚠️ Suppressed extension error:', event.message);
        event.preventDefault();
        return true;
      }
    };

    window.addEventListener('error', suppressExtensionErrors as any, true);
    return () => window.removeEventListener('error', suppressExtensionErrors as any, true);
  }, []);

  const { data: productsData, isLoading } = useQuery({
    queryKey: ['erp-products', page, search, categoryFilter, statusFilter],
    queryFn: async () => {
      const response = await erpAPI.getProducts({ 
        page, 
        page_size: 10,
        search,
        category_id: categoryFilter,
        is_active: statusFilter 
      });
      return response.data;
    },
    refetchInterval: 15000,
    placeholderData: (previousData) => previousData,
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['product-categories'],
    queryFn: async () => {
      const response = await erpAPI.getCategories();
      return response.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      console.log('🔵 Starting delete for product id:', id);
      try {
        const response = await erpAPI.deleteProduct(id);
        console.log('✅ Delete response:', response);
        return response.data;
      } catch (error: any) {
        console.error('❌ Delete error caught:', {
          status: error?.response?.status,
          detail: error?.response?.data?.detail,
          message: error?.message,
          fullError: error
        });
        throw error;
      }
    },
    onSuccess: () => {
      console.log('✅ Delete mutation onSuccess fired');
      // Invalidate all erp-products queries with any parameters
      queryClient.invalidateQueries({ queryKey: ['erp-products'] });
      queryClient.invalidateQueries({ queryKey: ['product-categories'] });
      queryClient.invalidateQueries({ queryKey: ['stock-management'] });
      toast.success('Product deleted successfully');
    },
    onError: (error: any) => {
      console.error('❌ Delete mutation onError fired:', error);
      const detail = error?.response?.data?.detail || error?.message || 'Failed to delete product';
      toast.error(detail);
    },
    onSettled: () => setDeletingId(null),
  });

  const uploadImageMutation = useMutation({
    mutationFn: (file: File) => {
      console.warn('🔵 uploadImageMutation.mutationFn START (products), file:', file.name, 'type:', file.type);
      console.warn('➡️ Calling erpAPI.uploadImage...');
      return erpAPI.uploadImage(file);
    },
    onSuccess: (response: any) => {
      console.warn('✅ uploadImageMutation.onSuccess FIRED (products)');
      console.warn('✅ erpAPI returned:', response);
      console.warn('✅ Full response data:', JSON.stringify(response.data, null, 2));
      const imageUrl = response.data?.image_url;
      if (imageUrl) {
        console.warn('✅ image_url extracted:', imageUrl);
        console.warn('✅ Image URL type:', typeof imageUrl);
        console.warn('✅ Image URL starts with:', imageUrl.substring(0, 50));
        setProductImages((prev) => {
          const newImages = [...prev, imageUrl];
          console.warn('✅ Adding image to productImages array, new length:', newImages.length);
          console.warn('✅ All images:', newImages);
          return newImages;
        });
        console.warn('✅ Showing success toast');
        toast.success('Image uploaded successfully');
      } else {
        console.warn('❌ No image_url in response:', response);
        toast.error('Upload successful but no image URL returned');
      }
    },
    onError: (error: any) => {
      console.warn('❌ uploadImageMutation.onError FIRED (products)');
      const errorMessage = error?.response?.data?.detail || error?.message || 'Failed to upload image';
      console.warn('❌ Error message:', errorMessage);
      console.warn('❌ Full error object:', error);
      console.warn('❌ HTTP status:', error?.response?.status);
      console.warn('❌ Error response:', error?.response?.data);
      toast.error(errorMessage);
    },
  });

  const createMutation = useMutation({
    mutationFn: (payload: any) => {
      console.log('[CREATE] Starting product create with payload:', payload);
      return erpAPI.createProduct(payload);
    },
    onSuccess: () => {
      console.log('[CREATE] ✅ Product created successfully');
      queryClient.invalidateQueries({ queryKey: ['erp-products'] });
      queryClient.invalidateQueries({ queryKey: ['stock-management'] });
      setView('list');
      setEditingProduct(null);
      setProductForm(emptyProductForm);
      setProductImages([]);
      toast.success('Product created successfully');
    },
    onError: (error: any) => {
      console.error('[CREATE] ❌ Create failed:', error);
      console.error('[CREATE] ❌ Response status:', error?.response?.status);
      console.error('[CREATE] ❌ Response data:', error?.response?.data);
      console.error('[CREATE] ❌ Error message:', error?.message);
      const detail = error?.response?.data?.detail || error?.message || 'Failed to create product';
      toast.error(detail);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => {
      console.log('[UPDATE] Starting product update:', { id, data });
      return erpAPI.updateProduct(id, data);
    },
    onSuccess: (response) => {
      console.log('[UPDATE] ✅ Product updated successfully:', response);
      queryClient.invalidateQueries({ queryKey: ['erp-products'] });
      queryClient.invalidateQueries({ queryKey: ['product-categories'] });
      queryClient.invalidateQueries({ queryKey: ['stock-management'] });
      setView('list');
      setEditingProduct(null);
      setProductForm(emptyProductForm);
      setProductImages([]);
      toast.success('Product updated successfully');
    },
    onError: (error: any) => {
      console.error('[UPDATE] ❌ Update failed:', error);
      console.error('[UPDATE] ❌ Response status:', error?.response?.status);
      console.error('[UPDATE] ❌ Response data:', error?.response?.data);
      console.error('[UPDATE] ❌ Error message:', error?.message);
      const detail = error?.response?.data?.detail || error?.message || 'Failed to update product';
      toast.error(detail);
    },
  });

  const products = (productsData as any)?.items || [];
  const totalPages = (productsData as any)?.total_pages || (productsData as any)?.pages || 1;
  const categories = categoriesData?.items || [];
  const isSaving = createMutation.isPending || updateMutation.isPending;

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const productIdParam = params.get('productId');

    if (productIdParam && products.length > 0) {
      const productId = Number(productIdParam);
      const productToEdit = products.find((p: Product) => p.id === productId);

      if (productToEdit) {
        handleEdit(productToEdit);
      }

      // Clear the query param so modal is not reopened repeatedly when navigating back
      params.delete('productId');
      navigate({ pathname: location.pathname, search: params.toString() }, { replace: true });
    }
  }, [location.search, location.pathname, navigate, products]);

  const openCreateForm = () => {
    setEditingProduct(null);
    setProductForm(emptyProductForm);
    setProductImages([]);
    setView('form');
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      slug: product.slug,
      sku: product.sku,
      price: product.price.toString(),
      sale_price: product.sale_price ? product.sale_price.toString() : '',
      category_id: product.category_id ? product.category_id.toString() : '',
      description: product.description || '',
      short_description: product.short_description || '',
      stock_quantity: product.stock_quantity?.toString() ?? '0',
      is_featured: product.is_featured,
    });
    setProductImages(product.images || []);
    setView('form');
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    console.warn('🔴 handleImageUpload ENTRY (products), file:', file);
    if (file) {
      console.warn('✅ File selected:', {
        name: file.name,
        size: file.size,
        type: file.type
      });
      
      // Validate file size client-side first
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        console.warn('❌ File size validation FAILED - size:', file.size);
        toast.error('File size must be less than 5MB');
        return;
      }
      console.warn('✅ File size validation PASSED');
      
      // Validate file type (include common aliases and extension fallback)
      const allowedTypes = new Set(['image/jpeg','image/jpg','image/pjpeg','image/png','image/x-png','image/gif','image/webp']);
      const allowedExts = ['.jpeg','.jpg','.png','.gif','.webp'];
      const name = file.name.toLowerCase();
      if (!(allowedTypes.has(file.type) || allowedExts.some(ext => name.endsWith(ext)))) {
        console.warn('❌ File type validation FAILED - type:', file.type, 'name:', name);
        toast.error('Only JPEG, PNG, GIF, and WebP images are allowed');
        return;
      }
      console.warn('✅ File type validation PASSED');
      
      console.warn('➡️ Calling uploadImageMutation.mutateAsync...');
      try {
        const result = await uploadImageMutation.mutateAsync(file);
        console.warn('✅ Upload completed:', result);
      } catch (error) {
        // Error is already handled by mutation's onError
        console.warn('❌ Upload threw exception:', error);
      }
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this product?')) {
      setDeletingId(id);
      await deleteMutation.mutateAsync(id);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    console.warn('🔵 handleSubmit FIRED - event.preventDefault() about to be called');
    event.preventDefault();
    console.warn('✅ handleSubmit - event.preventDefault() DONE');

    const payload = {
      name: productForm.name.trim(),
      slug: (productForm.slug || slugify(productForm.name)).trim(),
      sku: productForm.sku.trim(),
      price: Number(productForm.price || 0),
      sale_price: productForm.sale_price ? Number(productForm.sale_price) : null,
      category_id: productForm.category_id ? Number(productForm.category_id) : null,
      description: productForm.description,
      short_description: productForm.short_description,
      stock_quantity: Number(productForm.stock_quantity || 0),
      is_featured: productForm.is_featured,
      images: productImages.length > 0 ? productImages : null,
    };

    console.warn('✅ Payload constructed:', payload);

    if (!payload.name || !payload.slug || !payload.sku || payload.price === null || payload.price === undefined || payload.price === '') {
      console.warn('❌ Validation failed - missing required fields');
      toast.error('Please fill in name, slug, SKU, and price');
      return;
    }

    console.warn('✅ Validation passed');
    
    // Use a small delay to avoid extension interference
    await new Promise(resolve => setTimeout(resolve, 50));
    
    console.warn('✅ About to call mutation');
    try {
      if (editingProduct) {
        console.warn('🔵 Calling updateMutation.mutateAsync for product:', editingProduct.id);
        const result = await updateMutation.mutateAsync({ id: editingProduct.id, data: payload });
        console.warn('✅ updateMutation.mutateAsync completed:', result);
      } else {
        console.warn('🔵 Calling createMutation.mutateAsync');
        const result = await createMutation.mutateAsync(payload);
        console.warn('✅ createMutation.mutateAsync completed:', result);
      }
    } catch (error) {
      console.error('❌ Submit error caught:', error);
      console.error('❌ Error details:', {
        message: (error as any)?.message,
        response: (error as any)?.response?.data,
        status: (error as any)?.response?.status
      });
    }
  };

  const getStockStatus = (quantity: number) => {
    if (quantity === 0) return { label: 'Out of Stock', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' };
    if (quantity < 10) return { label: 'Low Stock', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' };
    return { label: 'In Stock', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' };
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6 rounded-2xl bg-white/80 dark:bg-gray-800/90 border border-white/30 dark:border-gray-700/50 shadow-sm"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <FiPackage className="w-6 h-6 text-blue-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            {view === 'form' ? (editingProduct ? 'Edit Product' : 'Add Product') : 'Products Management'}
          </h2>
        </div>
        
        {view === 'list' ? (
          <button
            onClick={openCreateForm}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors"
          >
            <FiPlus /> Add Product
          </button>
        ) : (
          <button
            onClick={() => {
              setView('list');
              setEditingProduct(null);
              setProductForm(emptyProductForm);
              setProductImages([]);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-xl transition-colors"
          >
            <FiX /> Cancel
          </button>
        )}
      </div>

      {/* Filters */}
      {view === 'list' && (
        <>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search products by name, SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
        
        <div className="relative">
          <FiFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="pl-10 pr-8 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 outline-none appearance-none min-w-[160px]"
          >
            <option value="">All Categories</option>
            {categories.map((cat: any) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 outline-none appearance-none min-w-[140px]"
          >
            <option value="">All Status</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-12">
          <FiPackage className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">No products found</p>
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
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-200">Price</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-200">Stock</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-200">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-200">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product: Product) => {
                  const stockStatus = getStockStatus(product.stock_quantity);
                  return (
                    <tr key={product.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-medium text-gray-800 dark:text-gray-300">{product.name}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{product.slug}</div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-800 dark:text-gray-300">{product.sku}</td>
                      <td className="py-3 px-4 text-gray-800 dark:text-gray-300">
                        {product.category?.name || 'Uncategorized'}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-gray-800 dark:text-gray-300">
                          ${product.price.toFixed(2)}
                        </div>
                        {product.sale_price && (
                          <div className="text-sm text-green-600 dark:text-green-400">
                            Sale: ${product.sale_price.toFixed(2)}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-gray-800 dark:text-gray-300">{product.stock_quantity}</div>
                        <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${stockStatus.color}`}>
                          {stockStatus.label}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          product.is_active 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                        }`}>
                          {product.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleEdit(product)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <FiEdit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(product.id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={deletingId === product.id || deleteMutation.isPending}
                            title="Delete"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>
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
        </>
      )}
        </>
      )}

      {/* Product Form View */}
      {view === 'form' && (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name *</label>
              <input
                type="text"
                value={productForm.name}
                onChange={(e) => setProductForm((prev) => ({ ...prev, name: e.target.value, slug: prev.slug || slugify(e.target.value) }))}
                className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Slug *</label>
              <input
                type="text"
                value={productForm.slug}
                onChange={(e) => setProductForm((prev) => ({ ...prev, slug: slugify(e.target.value) }))}
                className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">SKU *</label>
              <input
                type="text"
                value={productForm.sku}
                onChange={(e) => setProductForm((prev) => ({ ...prev, sku: e.target.value }))}
                className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Price *</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={productForm.price}
                  onChange={(e) => setProductForm((prev) => ({ ...prev, price: e.target.value }))}
                  className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sale Price</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={productForm.sale_price}
                  onChange={(e) => setProductForm((prev) => ({ ...prev, sale_price: e.target.value }))}
                  className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
              <select
                value={productForm.category_id}
                onChange={(e) => setProductForm((prev) => ({ ...prev, category_id: e.target.value }))}
                className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="">Uncategorized</option>
                {categories
                  .filter((cat: any) => !cat.parent_id)
                  .map((cat: any) => (
                    <optgroup key={cat.id} label={cat.name}>
                      <option value={cat.id}>{cat.name}</option>
                      {categories
                        .filter((subcat: any) => subcat.parent_id === cat.id)
                        .map((subcat: any) => (
                          <option key={subcat.id} value={subcat.id}>
                            └─ {subcat.name}
                          </option>
                        ))}
                    </optgroup>
                  ))
                }
                {/* Show categories without parents at the end */}
                {categories
                  .filter((cat: any) => cat.parent_id && !categories.find((c: any) => c.id === cat.parent_id))
                  .map((cat: any) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))
                }
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Stock Quantity</label>
              <input
                type="number"
                min="0"
                value={productForm.stock_quantity}
                onChange={(e) => setProductForm((prev) => ({ ...prev, stock_quantity: e.target.value }))}
                className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Short Description</label>
              <RichTextEditor
                value={productForm.short_description}
                onChange={(value) => setProductForm((prev) => ({ ...prev, short_description: value }))}
                placeholder="Brief product summary..."
                minHeight="150px"
                compact={true}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
              <RichTextEditor
                value={productForm.description}
                onChange={(value) => setProductForm((prev) => ({ ...prev, description: value }))}
                placeholder="Detailed product description..."
                minHeight="150px"
                compact={true}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Product Images</label>
            <div className="space-y-3">
              {productImages.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {productImages.map((img, index) => (
                    <div key={index} className="relative h-32 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 group">
                      <img 
                        src={img} 
                        alt={`Product ${index + 1}`} 
                        className="w-full h-full object-cover" 
                        onError={(e) => {
                          console.error('Failed to load image:', img);
                          e.currentTarget.src = '/placeholder-product.jpg';
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setProductImages((prev) => prev.filter((_, i) => i !== index))}
                        className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-lg transition-opacity"
                      >
                        <FiX className="w-6 h-6 text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div className="relative border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center hover:border-blue-500 transition-colors">
                <input
                  type="file"
                  accept=".jpeg,.jpg,.png,.gif,.webp,image/jpeg,image/jpg,image/pjpeg,image/png,image/x-png,image/gif,image/webp"
                  multiple
                  onChange={async (e) => {
                    const files = Array.from(e.target.files || []);
                    for (const file of files) {
                      const maxSize = 5 * 1024 * 1024;
                      if (file.size > maxSize) {
                        toast.error(`${file.name} is too large (max 5MB)`);
                        continue;
                      }
                      const allowedTypes = new Set(['image/jpeg','image/jpg','image/pjpeg','image/png','image/x-png','image/gif','image/webp']);
                      const allowedExts = ['.jpeg','.jpg','.png','.gif','.webp'];
                      const name = file.name.toLowerCase();
                      if (!(allowedTypes.has(file.type) || allowedExts.some(ext => name.endsWith(ext)))) {
                        toast.error(`${file.name} is not a valid image format`);
                        continue;
                      }
                      await uploadImageMutation.mutateAsync(file);
                    }
                  }}
                  disabled={uploadImageMutation.isPending}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                />
                <div className="flex flex-col items-center gap-2">
                  {uploadImageMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Uploading...</p>
                    </>
                  ) : (
                    <>
                      <FiUpload className="w-6 h-6 text-gray-400" />
                      <p className="text-sm text-gray-600 dark:text-gray-400">Click to upload or drag and drop</p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">PNG, JPG, GIF, WebP (max. 5MB each)</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              id="is_featured"
              type="checkbox"
              checked={productForm.is_featured}
              onChange={(e) => setProductForm((prev) => ({ ...prev, is_featured: e.target.checked }))}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="is_featured" className="text-sm text-gray-700 dark:text-gray-300">Mark as featured</label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={() => {
                setView('list');
                setEditingProduct(null);
                setProductForm(emptyProductForm);
                setProductImages([]);
              }}
              className="px-6 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Saving...' : editingProduct ? 'Update Product' : 'Create Product'}
            </button>
          </div>
        </form>
      )}
    </motion.div>
  );
}
