import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import DashboardLayout from '../../components/DashboardLayout';
import { cmsAPI } from '../../lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { FiTag, FiPlus, FiEdit, FiTrash2, FiX, FiSearch } from 'react-icons/fi';
import { iconMap } from '../../lib/iconMap';
import { useState } from 'react';
import { useToast } from '../../components/Toast';

export default function CMSCategories() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [iconSearch, setIconSearch] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    icon: 'pricetag',
    order_index: 0,
    is_active: true
  });

  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const { data: categories, isLoading } = useQuery({
    queryKey: ['blog-categories'],
    queryFn: async () => {
      const response = await cmsAPI.getBlogCategories();
      return response.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      console.log('Creating category with data:', data);
      try {
        const response = await cmsAPI.createBlogCategory(data);
        console.log('Create response:', response);
        return response;
      } catch (err) {
        console.error('Create request failed:', err);
        throw err;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog-categories'] });
      queryClient.invalidateQueries({ queryKey: ['public-blog-categories'] });
      setIsModalOpen(false);
      resetForm();
      showToast('Category created successfully!', 'success');
    },
    onError: (error: any) => {
      console.error('Create error:', error);
      console.error('Error response:', error.response);
      
      if (error.response?.status === 403 || error.response?.status === 401) {
        showToast('Authentication error: Please log in again or check your permissions.', 'error');
        return;
      }
      
      const errorMessage = error.response?.data?.detail 
        ? (Array.isArray(error.response.data.detail) 
          ? error.response.data.detail.map((e: any) => e.msg).join(', ')
          : error.response.data.detail)
        : error.response?.data?.message || 'Failed to create category. Please check console for details.';
      showToast(errorMessage, 'error');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => cmsAPI.updateBlogCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog-categories'] });
      queryClient.invalidateQueries({ queryKey: ['public-blog-categories'] });
      setIsModalOpen(false);
      resetForm();
      showToast('Category updated successfully!', 'success');
    },
    onError: (error: any) => {
      console.error('Update error:', error);
      showToast(error.response?.data?.detail || 'Failed to update category', 'error');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => cmsAPI.deleteBlogCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog-categories'] });
      queryClient.invalidateQueries({ queryKey: ['public-blog-categories'] });
      showToast('Category deleted successfully!', 'success');
    },
    onError: (error: any) => {
      console.error('Delete error:', error);
      showToast(error.response?.data?.detail || 'Failed to delete category', 'error');
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      description: '',
      icon: 'pricetag',
      order_index: 0,
      is_active: true
    });
    setEditingCategory(null);
    setIconSearch('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCategory) {
      updateMutation.mutate({ id: editingCategory.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const openModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const availableIcons = Object.keys(iconMap);
  const filteredIcons = availableIcons.filter(icon =>
    icon.toLowerCase().includes(iconSearch.toLowerCase())
  );

  const getIconComponent = (iconName: string) => {
    return iconMap[iconName] || FiTag;
  };

  return (
    <DashboardLayout
      title="Categories"
      breadcrumb={<div className="text-xs text-gray-500">CMS / Categories</div>}
    >
      {/* Header Actions */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Blog Categories</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Organize your blog posts with categories
          </p>
        </div>
        <button 
          onClick={openModal}
          className="glass-button px-6 py-3 rounded-xl text-white font-medium flex items-center gap-2"
        >
          <FiPlus className="w-5 h-5" />
          Add Category
        </button>
      </div>

      {/* Categories Grid */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories?.map((category: any, index: number) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="glass-card p-6 rounded-2xl bg-white/80 dark:bg-gray-800/90 border border-white/30 dark:border-gray-700/50 shadow-sm dark:shadow-[0_0_0_1px_rgba(255,255,255,0.05)]"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-blue-500 flex items-center justify-center text-white">
                    {(() => {
                      const IconComponent = getIconComponent(category.icon || 'pricetag');
                      return <IconComponent className="w-6 h-6" />;
                    })()}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">{category.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">/{category.slug}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                  category.is_active
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400'
                }`}>
                  {category.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>

              {category.description && (
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                  {category.description}
                </p>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Order: {category.order_index}
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      setEditingCategory(category);
                      setFormData(category);
                      setIsModalOpen(true);
                    }}
                    className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all" 
                    title="Edit"
                  >
                    <FiEdit className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this category?')) {
                        deleteMutation.mutate(category.id);
                      }
                    }}
                    className="p-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all" 
                    title="Delete"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {!isLoading && (!categories || categories.length === 0) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-12 rounded-2xl bg-white/80 dark:bg-gray-800/90 border border-white/30 dark:border-gray-700/50 text-center"
        >
          <div className="w-20 h-20 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
            <FiTag className="w-10 h-10 text-gray-400 dark:text-gray-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">No categories yet</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">Create your first category to organize blog posts</p>
          <button 
            onClick={openModal}
            className="glass-button px-8 py-3 rounded-xl text-white font-medium inline-flex items-center gap-2"
          >
            <FiPlus className="w-5 h-5" />
            Add Category
          </button>
        </motion.div>
      )}

      {/* Category Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card p-8 rounded-2xl bg-white dark:bg-gray-800 border border-white/30 dark:border-gray-700/50 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                  {editingCategory ? 'Edit Category' : 'Add Category'}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => {
                      const name = e.target.value;
                      setFormData({ 
                        ...formData, 
                        name,
                        slug: generateSlug(name)
                      });
                    }}
                    required
                    className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Category name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Slug *
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    required
                    className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="category-slug"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Brief description..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Icon (for category display)
                  </label>
                  <div className="mb-3">
                    <div className="relative">
                      <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        value={iconSearch}
                        onChange={(e) => setIconSearch(e.target.value)}
                        placeholder="Search icons..."
                        className="w-full pl-10 pr-4 py-2 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-8 gap-2 max-h-64 overflow-y-auto p-2 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
                    {filteredIcons.map((iconName) => {
                      const IconComponent = getIconComponent(iconName);
                      return (
                        <button
                          key={iconName}
                          type="button"
                          onClick={() => setFormData({ ...formData, icon: iconName })}
                          className={`p-3 rounded-lg flex flex-col items-center justify-center gap-1 transition-all ${
                            formData.icon === iconName
                              ? 'bg-primary-500 text-white shadow-lg'
                              : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                          }`}
                          title={iconName}
                        >
                          <IconComponent className="w-5 h-5" />
                        </button>
                      );
                    })}
                  </div>
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    {filteredIcons.length} icons available • Current: <span className="font-mono">{formData.icon}</span>
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Order Index
                    </label>
                    <input
                      type="number"
                      value={formData.order_index}
                      onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div className="flex items-end">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.is_active}
                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                        className="w-5 h-5 rounded border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Active</span>
                    </label>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-6 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createMutation.isPending || updateMutation.isPending}
                    className="flex-1 px-6 py-3 rounded-xl bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50 transition-all"
                  >
                    {(createMutation.isPending || updateMutation.isPending) ? 'Saving...' : editingCategory ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
