import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '../../../components/DashboardLayout';
import { 
  FiUsers, FiShare2, FiLink, FiMail, FiEye, FiDownload, 
  FiClock, FiFile, FiFolder, FiTrash2, FiMoreVertical, FiX
} from 'react-icons/fi';
import { workspaceAPI } from '../../../lib/workspaceApi';

interface DriveItem {
  id: string;
  name: string;
  type: 'folder' | 'file';
  sizeBytes?: number;
  modifiedISO: string;
  owner: string;
  isPrivate: boolean;
  parentId?: string | null;
  favorite?: boolean;
  mime?: string;
}

export default function DMSShared() {
  const [activeTab, setActiveTab] = useState<'shared-with-me' | 'shared-by-me'>('shared-with-me');
  const [showShareModal, setShowShareModal] = useState(false);
  const [items, setItems] = useState<DriveItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [shareEmail, setShareEmail] = useState('');
  const [sharePermission, setSharePermission] = useState<'view' | 'edit' | 'full'>('view');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await workspaceAPI.getItems('drive', 'items');
      const list = res.data as Array<{ id: number; data: any }>;
      if (list.length > 0) {
        setItems(list[0].data as DriveItem[]);
      }
    } catch (error) {
      console.error('Failed to load files:', error);
    } finally {
      setLoading(false);
    }
  };

  // Shared items are those marked as not private
  const sharedWithMe = items.filter(i => !i.isPrivate && i.owner !== 'You');
  const sharedByMe = items.filter(i => !i.isPrivate && i.owner === 'You');
  
  const currentItems = activeTab === 'shared-with-me' ? sharedWithMe : sharedByMe;

  const stats = [
    { label: 'Shared With Me', value: sharedWithMe.length, color: 'blue', icon: <FiUsers /> },
    { label: 'Shared By Me', value: sharedByMe.length, color: 'green', icon: <FiShare2 /> },
    { label: 'Total Views', value: sharedWithMe.length * 12 + sharedByMe.length * 8, color: 'purple', icon: <FiEye /> },
    { label: 'Downloads', value: sharedWithMe.length * 3 + sharedByMe.length * 5, color: 'orange', icon: <FiDownload /> }
  ];

  const formatSize = (bytes?: number) => {
    if (!bytes) return '0 B';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
  };

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleDateString();
  };

  const handleShare = async () => {
    if (!shareEmail) return;
    
    // In a real implementation, this would call an API
    console.log('Sharing with:', shareEmail, 'permission:', sharePermission);
    setShowShareModal(false);
    setShareEmail('');
    setSharePermission('view');
  };

  const getPermissionBadge = (permission: 'view' | 'edit' | 'full') => {
    const colors = {
      view: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      edit: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      full: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
    };
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${colors[permission]}`}>
        {permission}
      </span>
    );
  };

  if (loading) {
    return (
      <DashboardLayout title="Shared Files">
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Shared Files">
      <div className="p-4 sm:p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Shared Files</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Manage files shared with you and by you</p>
          </div>
          <button
            onClick={() => setShowShareModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <FiShare2 className="w-4 h-4" />
            Share File
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800"
            >
              <div className="flex items-center gap-3 mb-2">
                <span className={`p-2 rounded-lg bg-${stat.color}-100 dark:bg-${stat.color}-900/30 text-${stat.color}-600 dark:text-${stat.color}-400`}>
                  {stat.icon}
                </span>
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Tabs and Table */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
          {/* Tabs */}
          <div className="flex border-b border-gray-200 dark:border-gray-800">
            <button
              onClick={() => setActiveTab('shared-with-me')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === 'shared-with-me'
                  ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              Shared With Me
            </button>
            <button
              onClick={() => setActiveTab('shared-by-me')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === 'shared-by-me'
                  ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              Shared By Me
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    {activeTab === 'shared-with-me' ? 'Shared By' : 'Shared With'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Permission</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Date</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {currentItems.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                      No shared files found
                    </td>
                  </tr>
                ) : (
                  currentItems.map((item, index) => (
                    <motion.tr
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {item.type === 'folder' ? (
                            <FiFolder className="w-5 h-5 text-yellow-500" />
                          ) : (
                            <FiFile className="w-5 h-5 text-blue-500" />
                          )}
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{item.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{formatSize(item.sizeBytes)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        {activeTab === 'shared-with-me' ? item.owner : 'Multiple users'}
                      </td>
                      <td className="px-6 py-4">
                        {getPermissionBadge('edit')}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        {formatDate(item.modifiedISO)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                          <FiMoreVertical className="w-5 h-5" />
                        </button>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Share Modal */}
        {showShareModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-gray-900 rounded-xl p-6 max-w-md w-full border border-gray-200 dark:border-gray-800"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Share File</h3>
                <button
                  onClick={() => setShowShareModal(false)}
                  className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={shareEmail}
                    onChange={(e) => setShareEmail(e.target.value)}
                    placeholder="user@example.com"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Permission
                  </label>
                  <select
                    value={sharePermission}
                    onChange={(e) => setSharePermission(e.target.value as 'view' | 'edit' | 'full')}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="view">View only</option>
                    <option value="edit">Can edit</option>
                    <option value="full">Full access</option>
                  </select>
                </div>
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setShowShareModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleShare}
                    className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    Share
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
