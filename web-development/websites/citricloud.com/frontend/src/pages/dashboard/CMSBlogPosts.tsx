import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import DashboardLayout from '../../components/DashboardLayout';
import { cmsAPI } from '../../lib/api';
import { getImageUrl, handleImageError } from '../../lib/imageUtils';
import { motion, AnimatePresence } from 'framer-motion';
import { FiEdit, FiPlus, FiTrash2, FiEye, FiX, FiUpload, FiImage } from 'react-icons/fi';
import { useState } from 'react';

export default function CMSBlogPosts() {
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    category_id: null as number | null,
    featured_image: '',
    status: 'draft' as 'draft' | 'published',
    is_sticky: false,
    related_post_ids: [] as number[],
    meta_title: '',
    meta_description: ''
  });

  const queryClient = useQueryClient();

  const { data: postsData, isLoading } = useQuery({
    queryKey: ['cms-blog-posts', page],
    queryFn: async () => {
      const response = await cmsAPI.getBlogPosts({ page, page_size: pageSize });
      return response.data;
    },
  });

  const { data: categories } = useQuery({
    queryKey: ['blog-categories'],
    queryFn: async () => {
      const response = await cmsAPI.getBlogCategories();
      return response.data;
    },
  });

  const { data: mediaData } = useQuery({
    queryKey: ['media-files'],
    queryFn: async () => {
      const response = await cmsAPI.getMedia();
      return response.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => cmsAPI.createBlogPost(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms-blog-posts'] });
      queryClient.invalidateQueries({ queryKey: ['public-blog-posts'] });
      setIsModalOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      console.error('Create error:', error);
      console.error('Error response:', error.response);
      
      if (error.response?.status === 403 || error.response?.status === 401) {
        alert('Authentication error: Please log in again or check your permissions.');
        return;
      }
      
      const errorMessage = error.response?.data?.detail 
        ? (Array.isArray(error.response.data.detail) 
          ? error.response.data.detail.map((e: any) => e.msg).join(', ')
          : error.response.data.detail)
        : error.response?.data?.message || 'Failed to create blog post';
      alert(errorMessage);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => cmsAPI.updateBlogPost(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms-blog-posts'] });
      queryClient.invalidateQueries({ queryKey: ['public-blog-posts'] });
      setIsModalOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      console.error('Update error:', error);
      alert(error.response?.data?.detail || 'Failed to update blog post');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => cmsAPI.deleteBlogPost(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms-blog-posts'] });
      queryClient.invalidateQueries({ queryKey: ['public-blog-posts'] });
    },
    onError: (error: any) => {
      console.error('Delete error:', error);
      alert(error.response?.data?.detail || 'Failed to delete blog post');
    },
  });

  const toggleStickyMutation = useMutation({
    mutationFn: ({ id, is_sticky }: { id: number; is_sticky: boolean }) =>
      cmsAPI.updateBlogPost(id, { is_sticky }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms-blog-posts'] });
      queryClient.invalidateQueries({ queryKey: ['public-blog-posts'] });
    },
    onError: (error: any) => {
      console.error('Toggle sticky error:', error);
      alert(error.response?.data?.detail || 'Failed to toggle sticky status');
    },
  });

  const resetForm = () => {
    setFormData({
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      category_id: null,
      featured_image: '',
      status: 'draft',
      is_sticky: false,
      related_post_ids: [],
      meta_title: '',
      meta_description: ''
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const postId = (formData as any).id;
    if (postId) {
      updateMutation.mutate({ id: postId, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const response = await cmsAPI.uploadMedia(file);
      setFormData({ ...formData, featured_image: response.data.url });
      queryClient.invalidateQueries({ queryKey: ['media-files'] });
    } catch (error: any) {
      console.error('Upload failed:', error);
      console.error('Error response:', error.response?.data);
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.message || 
                          'Failed to upload image';
      alert(errorMessage);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSelectFromMedia = (url: string) => {
    setFormData({ ...formData, featured_image: url });
    setIsMediaModalOpen(false);
  };

  return (
    <DashboardLayout
      title="Blog Posts"
      breadcrumb={<div className="text-xs text-gray-500">CMS / Blog Posts</div>}
    >
      {/* Header Actions */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">All Blog Posts</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Manage your blog content
          </p>
        </div>
        <button 
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className="glass-button px-6 py-3 rounded-xl text-white font-medium flex items-center gap-2"
        >
          <FiPlus className="w-5 h-5" />
          Create Post
        </button>
      </div>

      {/* Posts Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6 rounded-2xl bg-white/80 dark:bg-gray-800/90 border border-white/30 dark:border-gray-700/50 shadow-sm dark:shadow-[0_0_0_1px_rgba(255,255,255,0.05)]"
      >
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
          </div>
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-200">Title</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-200">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-200">Featured</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-200">Views</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-200">Published</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-200">Actions</th>
                </tr>
              </thead>
              <tbody>
                {postsData?.items?.map((post: any) => (
                  <tr key={post.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-white/60 dark:hover:bg-gray-700/60 transition-all">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                          <FiEdit className="text-purple-500 dark:text-purple-400" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-800 dark:text-gray-100">{post.title}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">/{post.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-3 py-1 rounded-lg text-sm font-medium ${
                        post.status === 'published'
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                          : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                      }`}>
                        {post.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => toggleStickyMutation.mutate({ id: post.id, is_sticky: !post.is_sticky })}
                        disabled={toggleStickyMutation.isPending}
                        className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                          post.is_sticky
                            ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 hover:bg-amber-200 dark:hover:bg-amber-800/30'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                        } ${toggleStickyMutation.isPending ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                        title={post.is_sticky ? 'Click to unfeature' : 'Click to feature as sticky post'}
                      >
                        {toggleStickyMutation.isPending ? '...' : (post.is_sticky ? '⭐ Featured' : '☆ Feature')}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-300">
                      {post.views_count || 0}
                    </td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-300">
                      {post.published_at ? new Date(post.published_at).toLocaleDateString() : '-'}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => window.open(`/blog?post=${post.id}`, '_blank')}
                          className="p-2 rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all" 
                          title="View"
                        >
                          <FiEye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => {
                            const editData = {
                              ...post,
                              related_post_ids: post.related_posts?.map((rp: any) => rp.id) || []
                            };
                            setFormData(editData);
                            setIsModalOpen(true);
                          }}
                          className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all" 
                          title="Edit"
                        >
                          <FiEdit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this post?')) {
                              deleteMutation.mutate(post.id);
                            }
                          }}
                          className="p-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all" 
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
        )}

        {/* Pagination */}
        {postsData?.total > pageSize && (
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, postsData.total)} of {postsData.total} posts
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={page * pageSize >= postsData.total}
                className="px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </motion.div>

      {/* Blog Post Modal */}
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
              className="glass-card p-8 rounded-2xl bg-white dark:bg-gray-800 border border-white/30 dark:border-gray-700/50 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                  {(formData as any).id ? 'Edit Post' : 'Create Post'}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Title *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => {
                        const title = e.target.value;
                        setFormData({ 
                          ...formData, 
                          title,
                          slug: generateSlug(title)
                        });
                      }}
                      required
                      className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Post title"
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
                      placeholder="post-slug"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Category
                    </label>
                    <select
                      value={formData.category_id || ''}
                      onChange={(e) => setFormData({ ...formData, category_id: e.target.value ? parseInt(e.target.value) : null })}
                      className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">Select category</option>
                      {categories?.map((cat: any) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Excerpt
                    </label>
                    <textarea
                      value={formData.excerpt}
                      onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                      rows={2}
                      className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Brief excerpt..."
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Content *
                    </label>
                    <textarea
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      required
                      rows={8}
                      className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Post content..."
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Featured Image
                    </label>
                    
                    {formData.featured_image && (
                      <div className="mb-3 relative rounded-xl overflow-hidden">
                        <img 
                          src={getImageUrl(formData.featured_image)} 
                          alt="Preview" 
                          className="w-full h-48 object-cover"
                          onError={(e) => handleImageError(e, 'w-full h-48 object-contain p-4 bg-gray-200')}
                        />
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, featured_image: '' })}
                          className="absolute top-2 right-2 p-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-all"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}

                    <div className="flex gap-3">
                      <input
                        type="text"
                        value={formData.featured_image}
                        onChange={(e) => setFormData({ ...formData, featured_image: e.target.value })}
                        className="flex-1 px-4 py-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="Image URL (upload, select from media, or paste URL)"
                        disabled={uploadingImage}
                      />
                      <label className="px-4 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 cursor-pointer transition-all flex items-center gap-2 whitespace-nowrap">
                        <FiUpload className="w-4 h-4" />
                        {uploadingImage ? 'Uploading...' : 'Upload'}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          disabled={uploadingImage}
                          className="hidden"
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => setIsMediaModalOpen(true)}
                        className="px-4 py-3 rounded-xl bg-purple-600 text-white hover:bg-purple-700 transition-all flex items-center gap-2 whitespace-nowrap"
                      >
                        <FiImage className="w-4 h-4" />
                        Media
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Status *
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as 'draft' | 'published' })}
                      className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                    </select>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="is_sticky"
                      checked={formData.is_sticky}
                      onChange={(e) => setFormData({ ...formData, is_sticky: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-300 text-primary-500 focus:ring-2 focus:ring-primary-500 cursor-pointer"
                    />
                    <label htmlFor="is_sticky" className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                      Mark as Featured/Sticky Post
                    </label>
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Related Posts
                    </label>
                    <select
                      multiple
                      value={formData.related_post_ids.map(String)}
                      onChange={(e) => {
                        const selectedOptions = Array.from(e.target.selectedOptions);
                        const selectedIds = selectedOptions.map(option => parseInt(option.value));
                        setFormData({ ...formData, related_post_ids: selectedIds });
                      }}
                      className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      size={5}
                    >
                      {postsData?.items?.filter((post: any) => post.id !== (formData as any).id).map((post: any) => (
                        <option key={post.id} value={post.id}>
                          {post.title}
                        </option>
                      ))}
                    </select>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Hold Ctrl/Cmd to select multiple posts
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Meta Title
                    </label>
                    <input
                      type="text"
                      value={formData.meta_title}
                      onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="SEO title"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Meta Description
                    </label>
                    <textarea
                      value={formData.meta_description}
                      onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                      rows={2}
                      className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="SEO description..."
                    />
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
                    {(createMutation.isPending || updateMutation.isPending) ? 'Saving...' : (formData as any).id ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Media Selection Modal */}
      <AnimatePresence>
        {isMediaModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setIsMediaModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card p-8 rounded-2xl bg-white dark:bg-gray-800 border border-white/30 dark:border-gray-700/50 w-full max-w-5xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Select Image</h3>
                <button
                  onClick={() => setIsMediaModalOpen(false)}
                  className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {mediaData?.items?.map((media: any) => (
                  <motion.div
                    key={media.filename}
                    whileHover={{ scale: 1.05 }}
                    onClick={() => handleSelectFromMedia(media.url)}
                    className="aspect-video rounded-xl overflow-hidden cursor-pointer border-2 border-transparent hover:border-primary-500 transition-all"
                  >
                    <img
                      src={media.url}
                      alt={media.filename}
                      className="w-full h-full object-cover"
                    />
                  </motion.div>
                ))}
              </div>

              {(!mediaData?.items || mediaData.items.length === 0) && (
                <div className="text-center py-12">
                  <p className="text-gray-600 dark:text-gray-400">No images uploaded yet</p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
