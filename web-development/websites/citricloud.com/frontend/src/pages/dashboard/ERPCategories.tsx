import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { erpAPI } from '../../lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiPlus, FiEdit2, FiTrash2, FiTag, FiFolderPlus, FiX, FiUpload, FiImage } from 'react-icons/fi';
import toast from 'react-hot-toast';

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  parent_id: number | null;
  parent?: { id: number; name: string };
  image_url: string | null;
  order_index: number;
  is_active: boolean;
  created_at: string;
  product_count?: number;
}

interface CategoryForm {
  name: string;
  slug: string;
  description: string;
  parent_id: string;
  image_url: string;
  order_index: string;
  is_active: boolean;
}

const emptyCategoryForm: CategoryForm = {
  name: '',
  slug: '',
  description: '',
  parent_id: '',
  image_url: '',
  order_index: '0',
  is_active: true,
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

export default function ERPCategories() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryForm, setCategoryForm] = useState<CategoryForm>(emptyCategoryForm);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const { data: categoriesData, isLoading } = useQuery({
    queryKey: ['erp-categories', page, search, statusFilter],
    queryFn: async () => {
      const params: any = { 
        page, 
        page_size: 10
      };
      
      if (search) {
        params.search = search;
      }
      
      if (statusFilter) {
        params.is_active = statusFilter;
      }
      
      const response = await erpAPI.getCategories(params);
      return response.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => erpAPI.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['erp-categories'] });
      toast.success('Category deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail || 'Failed to delete category');
    },
  });

  const uploadImageMutation = useMutation({
    mutationFn: async (file: File) => {
      console.warn('🔵 UPLOAD START - file:', file.name, file.size, file.type);
      try {
        const result = await erpAPI.uploadImage(file);
        console.warn('✅ erpAPI returned:', result);
        return result;
      } catch (err: any) {
        console.warn('❌ erpAPI failed:', err.message);
        console.warn('Error details:', err.response?.status, err.response?.data);
        throw err;
      }
    },
    onSuccess: (response: any) => {
      console.warn('✅ onSuccess - imageUrl:', response.data?.image_url);
      const imageUrl = response.data?.image_url;
      if (imageUrl) {
        setCategoryForm((prev) => ({ ...prev, image_url: imageUrl }));
        setPreviewImage(imageUrl);
        toast.success('Image uploaded successfully');
      } else {
        console.error('❌ No image_url in:', response);
        toast.error('Upload successful but no image URL returned');
      }
    },
    onError: (error: any) => {
      console.warn('❌ onError:', error?.message || error);
      const errorMessage = error?.response?.data?.detail || error?.message || 'Failed to upload image';
      toast.error(errorMessage);
    },
  });

  const createMutation = useMutation({
    mutationFn: (payload: any) => erpAPI.createCategory(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['erp-categories'] });
      setShowModal(false);
      setEditingCategory(null);
      setCategoryForm(emptyCategoryForm);
      setPreviewImage(null);
      toast.success('Category created successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail || 'Failed to create category');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => erpAPI.updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['erp-categories'] });
      setShowModal(false);
      setEditingCategory(null);
      setCategoryForm(emptyCategoryForm);
      setPreviewImage(null);
      toast.success('Category updated successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail || 'Failed to update category');
    },
  });

  const categories = categoriesData?.items || [];
  const totalPages = categoriesData?.total_pages || categoriesData?.pages || 1;
  const isSaving = createMutation.isPending || updateMutation.isPending;

  const openCreateModal = () => {
    setEditingCategory(null);
    setCategoryForm(emptyCategoryForm);
    setPreviewImage(null);
    setShowModal(true);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setCategoryForm({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      parent_id: category.parent_id ? category.parent_id.toString() : '',
      image_url: category.image_url || '',
      order_index: category.order_index?.toString() ?? '0',
      is_active: category.is_active,
    });
    setPreviewImage(category.image_url);
    setShowModal(true);
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    console.warn('🔴 handleImageUpload called');
    const file = event.target.files?.[0];
    if (!file) {
      console.warn('❌ No file');
      return;
    }
    console.warn('✅ File:', file.name, '|', file.size, 'bytes |', file.type);
    
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error('File size must be less than 5MB');
      return;
    }
    
    const allowedTypes = new Set(['image/jpeg','image/jpg','image/pjpeg','image/png','image/x-png','image/gif','image/webp']);
    const allowedExts = ['.jpeg','.jpg','.png','.gif','.webp'];
    const name = file.name.toLowerCase();
    if (!(allowedTypes.has(file.type) || allowedExts.some(ext => name.endsWith(ext)))) {
      toast.error('Only JPEG, PNG, GIF, and WebP images are allowed');
      return;
    }
    
    console.warn('➡️ Calling uploadImageMutation.mutateAsync...');
    try {
      const result = await uploadImageMutation.mutateAsync(file);
      console.warn('✅ mutateAsync done:', result);
    } catch (error) {
      console.error('❌ mutateAsync threw:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this category? This may affect related products.')) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const payload = {
      name: categoryForm.name.trim(),
      slug: (categoryForm.slug || slugify(categoryForm.name)).trim(),
      description: categoryForm.description,
      parent_id: categoryForm.parent_id ? Number(categoryForm.parent_id) : null,
      image_url: categoryForm.image_url || null,
      order_index: Number(categoryForm.order_index || 0),
      is_active: categoryForm.is_active,
    };

    if (!payload.name || !payload.slug) {
      toast.error('Please provide a name and slug for the category');
      return;
    }

    try {
      if (editingCategory) {
        await updateMutation.mutateAsync({ id: editingCategory.id, data: payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
    } catch (error) {
      console.error('Submit error:', error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6 rounded-2xl bg-white/80 dark:bg-gray-800/90 border border-white/30 dark:border-gray-700/50 shadow-sm"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-500/10 rounded-lg">
            <FiTag className="w-6 h-6 text-purple-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Category Management</h2>
        </div>
        
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-colors"
        >
          <FiPlus /> Add Category
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search categories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-purple-500 outline-none"
          />
        </div>

        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-purple-500 outline-none appearance-none min-w-[140px]"
          >
            <option value="">All Status</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-12">
          <FiFolderPlus className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">No categories found</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-200">Category</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-200">Slug</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-200">Parent</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-200">Products</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-200">Order</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-200">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-200">Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((category: Category) => (
                  <tr key={category.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        {category.image_url ? (
                          <img 
                            src={category.image_url} 
                            alt={category.name}
                            className="w-10 h-10 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                            <FiTag className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                          </div>
                        )}
                        <div>
                          <div className="font-medium text-gray-800 dark:text-gray-300">{category.name}</div>
                          {category.description && (
                            <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                              {category.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400 font-mono text-sm">
                      {category.slug}
                    </td>
                    <td className="py-3 px-4 text-gray-800 dark:text-gray-300">
                      {category.parent?.name || '-'}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-medium text-sm">
                        {category.product_count || 0}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-800 dark:text-gray-300">
                      {category.order_index}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        category.is_active 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                      }`}>
                        {category.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleEdit(category)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <FiEdit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(category.id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
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

      {/* Add/Edit Category Modal - Rendered via Portal */}
      {createPortal(
        showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-4"
            onClick={() => {
              setShowModal(false);
              setEditingCategory(null);
              setCategoryForm(emptyCategoryForm);
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-2xl p-6 border border-gray-100 dark:border-gray-700"
            >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  {editingCategory ? 'Edit Category' : 'Add Category'}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Organize your catalog with categories.</p>
              </div>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingCategory(null);
                  setCategoryForm(emptyCategoryForm);
                }}
                className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                aria-label="Close"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name *</label>
                  <input
                    type="text"
                    value={categoryForm.name}
                    onChange={(e) => setCategoryForm((prev) => ({ ...prev, name: e.target.value, slug: prev.slug || slugify(e.target.value) }))}
                    className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 focus:ring-2 focus:ring-purple-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Slug *</label>
                  <input
                    type="text"
                    value={categoryForm.slug}
                    onChange={(e) => setCategoryForm((prev) => ({ ...prev, slug: slugify(e.target.value) }))}
                    className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 focus:ring-2 focus:ring-purple-500 outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Parent Category</label>
                  <select
                    value={categoryForm.parent_id}
                    onChange={(e) => setCategoryForm((prev) => ({ ...prev, parent_id: e.target.value }))}
                    className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 focus:ring-2 focus:ring-purple-500 outline-none"
                  >
                    <option value="">No parent</option>
                    {categories
                      .filter((cat: Category) => cat.id !== editingCategory?.id)
                      .map((cat: Category) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Display Order</label>
                  <input
                    type="number"
                    min="0"
                    value={categoryForm.order_index}
                    onChange={(e) => setCategoryForm((prev) => ({ ...prev, order_index: e.target.value }))}
                    className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm((prev) => ({ ...prev, description: e.target.value }))}
                  className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 focus:ring-2 focus:ring-purple-500 outline-none h-24"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category Image</label>
                <div className="space-y-3">
                  {previewImage && (
                    <div className="relative w-full h-48 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                      <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => {
                          setPreviewImage(null);
                          setCategoryForm((prev) => ({ ...prev, image_url: '' }));
                        }}
                        className="absolute top-2 right-2 p-1 rounded-lg bg-red-500 text-white hover:bg-red-600"
                      >
                        <FiX className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  <div className="relative border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center hover:border-purple-500 transition-colors">
                    <input
                      type="file"
                      accept=".jpeg,.jpg,.png,.gif,.webp,image/jpeg,image/jpg,image/pjpeg,image/png,image/x-png,image/gif,image/webp"
                      onChange={handleImageUpload}
                      disabled={uploadImageMutation.isPending}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                    />
                    <div className="flex flex-col items-center gap-2">
                      {uploadImageMutation.isPending ? (
                        <>
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500"></div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Uploading...</p>
                        </>
                      ) : (
                        <>
                          <FiUpload className="w-6 h-6 text-gray-400" />
                          <p className="text-sm text-gray-600 dark:text-gray-400">Click to upload or drag and drop</p>
                          <p className="text-xs text-gray-500 dark:text-gray-500">PNG, JPG, GIF, WebP (max. 5MB)</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  id="category_active"
                  type="checkbox"
                  checked={categoryForm.is_active}
                  onChange={(e) => setCategoryForm((prev) => ({ ...prev, is_active: e.target.checked }))}
                  className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <label htmlFor="category_active" className="text-sm text-gray-700 dark:text-gray-300">Active</label>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingCategory(null);
                    setCategoryForm(emptyCategoryForm);
                  }}
                  className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSaving ? 'Saving...' : editingCategory ? 'Update Category' : 'Create Category'}
                </button>
              </div>
            </form>
            </motion.div>
          </motion.div>
        ),
        document.body
      )}
    </motion.div>
  );
}
