import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { FiPlus, FiX, FiEdit2, FiTrash2, FiCheck, FiAlertCircle } from 'react-icons/fi';
import axios from 'axios';

interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  created_at: string;
}

interface Topic {
  id: string;
  category_id: string;
  title: string;
  content: string;
  author_name: string;
  author_email: string;
  views: number;
  replies: number;
  created_at: string;
  updated_at: string;
}

const API_BASE = 'http://127.0.0.1:3100';
const ADMIN_PASSWORD = 'admin123'; // This should be checked on backend

export default function AdminCommunity() {
  const [activeTab, setActiveTab] = useState<'categories' | 'topics'>('categories');
  const [categories, setCategories] = useState<Category[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Modal states
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [showAddTopicModal, setShowAddTopicModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);

  // Form states
  const [categoryForm, setCategoryForm] = useState({ name: '', description: '', icon: '', color: '' });
  const [topicForm, setTopicForm] = useState({ title: '', content: '', category_id: '' });

  // Messages
  const [message, setMessage] = useState({ type: '', text: '' });

  // Auth check
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setPassword('');
      loadData();
    } else {
      setMessage({ type: 'error', text: 'Invalid password' });
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [catRes, topicRes] = await Promise.all([
        axios.get(`${API_BASE}/api/categories`),
        axios.get(`${API_BASE}/api/admin/topics`)
      ]);
      setCategories(catRes.data);
      setTopics(topicRes.data);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to load data' });
    } finally {
      setLoading(false);
    }
  };

  // Category operations
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryForm.name || !categoryForm.icon) {
      setMessage({ type: 'error', text: 'Name and icon are required' });
      return;
    }

    try {
      setLoading(true);
      if (editingCategory) {
        await axios.put(`${API_BASE}/api/admin/categories/${editingCategory.id}`, categoryForm);
        setMessage({ type: 'success', text: 'Category updated successfully' });
      } else {
        await axios.post(`${API_BASE}/api/admin/categories`, categoryForm);
        setMessage({ type: 'success', text: 'Category created successfully' });
      }
      setCategoryForm({ name: '', description: '', icon: '', color: '' });
      setEditingCategory(null);
      setShowAddCategoryModal(false);
      await loadData();
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save category' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;

    try {
      setLoading(true);
      await axios.delete(`${API_BASE}/api/admin/categories/${id}`);
      setMessage({ type: 'success', text: 'Category deleted successfully' });
      await loadData();
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to delete category' });
    } finally {
      setLoading(false);
    }
  };

  const handleEditCategory = (cat: Category) => {
    setEditingCategory(cat);
    setCategoryForm({ name: cat.name, description: cat.description, icon: cat.icon, color: cat.color });
    setShowAddCategoryModal(true);
  };

  // Topic operations
  const handleDeleteTopic = async (id: string) => {
    if (!confirm('Are you sure you want to delete this topic?')) return;

    try {
      setLoading(true);
      await axios.delete(`${API_BASE}/api/admin/topics/${id}`);
      setMessage({ type: 'success', text: 'Topic deleted successfully' });
      await loadData();
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to delete topic' });
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <Navbar />
        <div className="flex items-center justify-center min-h-[70vh]">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md"
          >
            <div className="glass-card p-8 rounded-2xl">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Admin Panel</h1>
              <p className="text-gray-600 dark:text-gray-300 mb-6">Community Forum Management</p>

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Admin Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Enter admin password"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-all"
                >
                  Login
                </button>
              </form>

              {message.text && (
                <motion.div
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className={`mt-4 p-3 rounded-lg text-sm font-medium flex items-center gap-2 ${
                    message.type === 'error'
                      ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                      : 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400'
                  }`}
                >
                  <FiAlertCircle className="w-4 h-4" />
                  {message.text}
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Navbar />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-7xl mx-auto px-4 py-12"
      >
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Community Admin</h1>
          <button
            onClick={() => setIsAuthenticated(false)}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700 transition-all"
          >
            Logout
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab('categories')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'categories'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
            }`}
          >
            Categories
          </button>
          <button
            onClick={() => setActiveTab('topics')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'topics'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
            }`}
          >
            Topics
          </button>
        </div>

        {/* Messages */}
        {message.text && (
          <motion.div
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className={`mb-6 p-4 rounded-lg text-sm font-medium flex items-center gap-2 ${
              message.type === 'error'
                ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                : 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400'
            }`}
          >
            {message.type === 'error' ? <FiAlertCircle /> : <FiCheck />}
            {message.text}
          </motion.div>
        )}

        {/* Categories Tab */}
        {activeTab === 'categories' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <button
              onClick={() => {
                setEditingCategory(null);
                setCategoryForm({ name: '', description: '', icon: '', color: '' });
                setShowAddCategoryModal(true);
              }}
              className="px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-all flex items-center gap-2"
            >
              <FiPlus className="w-5 h-5" />
              Add Category
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((cat) => (
                <motion.div
                  key={cat.id}
                  whileHover={{ translateY: -4 }}
                  className="glass-card p-6 rounded-xl"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{cat.icon}</span>
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-white">{cat.name}</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{cat.description}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditCategory(cat)}
                      className="flex-1 px-3 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-all flex items-center justify-center gap-2 text-sm"
                    >
                      <FiEdit2 className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(cat.id)}
                      className="flex-1 px-3 py-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded hover:bg-red-200 dark:hover:bg-red-900/50 transition-all flex items-center justify-center gap-2 text-sm"
                    >
                      <FiTrash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Topics Tab */}
        {activeTab === 'topics' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="glass-card rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100 dark:bg-gray-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Title</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Author</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Views</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Replies</th>
                      <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {topics.map((topic) => (
                      <tr key={topic.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300 font-medium">{topic.title}</td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{topic.author_name}</td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{topic.views}</td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{topic.replies}</td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => handleDeleteTopic(topic.id)}
                            className="inline-flex items-center gap-2 px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded hover:bg-red-200 dark:hover:bg-red-900/50 transition-all text-sm"
                          >
                            <FiTrash2 className="w-4 h-4" />
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Add Category Modal */}
      {showAddCategoryModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-gray-900 rounded-2xl max-w-md w-full p-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {editingCategory ? 'Edit Category' : 'Add Category'}
              </h2>
              <button
                onClick={() => {
                  setShowAddCategoryModal(false);
                  setEditingCategory(null);
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleAddCategory} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Category Name *
                </label>
                <input
                  type="text"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="e.g., Bug Reports"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Category description..."
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Icon *
                </label>
                <input
                  type="text"
                  value={categoryForm.icon}
                  onChange={(e) => setCategoryForm({ ...categoryForm, icon: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="e.g., 🐛"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Color
                </label>
                <input
                  type="color"
                  value={categoryForm.color || '#0066cc'}
                  onChange={(e) => setCategoryForm({ ...categoryForm, color: e.target.value })}
                  className="w-full h-10 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-all disabled:opacity-50"
                >
                  {loading ? 'Saving...' : editingCategory ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddCategoryModal(false);
                    setEditingCategory(null);
                  }}
                  className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-white rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-700 transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      <Footer />
    </div>
  );
}
