import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../../components/DashboardLayout';
import { 
  FiUpload, FiFolderPlus, FiShare2, FiStar, FiFile, FiFolder, 
  FiImage, FiMusic, FiVideo, FiFileText, FiClock
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

export default function DMSOverview() {
  const navigate = useNavigate();
  const [items, setItems] = useState<DriveItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

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

  const stats = {
    total_files: items.filter(i => i.type === 'file').length,
    total_folders: items.filter(i => i.type === 'folder').length,
    shared_files: items.filter(i => !i.isPrivate).length,
    recent_activity: items.filter(i => {
      const diff = Date.now() - new Date(i.modifiedISO).getTime();
      return diff < 24 * 60 * 60 * 1000; // Last 24 hours
    }).length
  };

  const totalBytes = items.reduce((sum, it) => sum + (it.sizeBytes || 0), 0);
  const storage = {
    used_gb: +(totalBytes / (1024 ** 3)).toFixed(2),
    total_gb: 100,
    percentage: (totalBytes / (100 * 1024 ** 3)) * 100
  };

  const fileTypeStats = {
    documents: items.filter(i => i.mime?.includes('document') || i.mime?.includes('pdf') || i.mime?.includes('text')).length,
    images: items.filter(i => i.mime?.startsWith('image/')).length,
    videos: items.filter(i => i.mime?.startsWith('video/')).length,
    audio: items.filter(i => i.mime?.startsWith('audio/')).length
  };

  const recentFiles = items
    .filter(i => i.type === 'file')
    .sort((a, b) => new Date(b.modifiedISO).getTime() - new Date(a.modifiedISO).getTime())
    .slice(0, 5);

  const formatSize = (bytes?: number) => {
    if (!bytes) return '0 B';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
  };

  const formatTime = (iso: string) => {
    const date = new Date(iso);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const getFileIcon = (mime?: string) => {
    if (!mime) return <FiFile className="w-5 h-5 text-gray-400" />;
    if (mime.startsWith('image/')) return <FiImage className="w-5 h-5 text-blue-500" />;
    if (mime.startsWith('video/')) return <FiVideo className="w-5 h-5 text-purple-500" />;
    if (mime.startsWith('audio/')) return <FiMusic className="w-5 h-5 text-green-500" />;
    if (mime.includes('document') || mime.includes('pdf')) return <FiFileText className="w-5 h-5 text-red-500" />;
    return <FiFile className="w-5 h-5 text-gray-400" />;
  };

  if (loading) {
    return (
      <DashboardLayout title="DMS Overview">
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Document Management System">
      <div className="p-4 sm:p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">DMS Overview</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your documents and files</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Files', value: stats.total_files, color: 'blue', icon: <FiFile /> },
            { label: 'Folders', value: stats.total_folders, color: 'yellow', icon: <FiFolder /> },
            { label: 'Shared Files', value: stats.shared_files, color: 'green', icon: <FiShare2 /> },
            { label: 'Recent Activity', value: stats.recent_activity, color: 'purple', icon: <FiClock /> }
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800"
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`p-2 rounded-lg bg-${stat.color}-100 dark:bg-${stat.color}-900/30 text-${stat.color}-600 dark:text-${stat.color}-400`}>
                  {stat.icon}
                </span>
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Storage Usage */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800"
        >
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Storage Usage</h2>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                {storage.used_gb} GB of {storage.total_gb} GB used
              </span>
              <span className="font-medium text-gray-900 dark:text-white">{storage.percentage.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(storage.percentage, 100)}%` }}
                transition={{ duration: 1, delay: 0.5 }}
                className={`h-full rounded-full ${
                  storage.percentage > 90 ? 'bg-red-500' : storage.percentage > 70 ? 'bg-yellow-500' : 'bg-primary-500'
                }`}
              />
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800"
        >
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={() => navigate('/workspace/drive')}
              className="flex flex-col items-center gap-2 p-4 rounded-lg bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors"
            >
              <FiUpload className="w-6 h-6" />
              <span className="text-sm font-medium">Upload Files</span>
            </button>
            <button
              onClick={() => navigate('/workspace/drive')}
              className="flex flex-col items-center gap-2 p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-colors"
            >
              <FiFolderPlus className="w-6 h-6" />
              <span className="text-sm font-medium">Create Folder</span>
            </button>
            <button
              onClick={() => navigate('/dashboard/dms/shared')}
              className="flex flex-col items-center gap-2 p-4 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
            >
              <FiShare2 className="w-6 h-6" />
              <span className="text-sm font-medium">Share Documents</span>
            </button>
            <button
              onClick={() => navigate('/workspace/drive')}
              className="flex flex-col items-center gap-2 p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
            >
              <FiStar className="w-6 h-6" />
              <span className="text-sm font-medium">View All Files</span>
            </button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Files */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800"
          >
            <div className="p-6 border-b border-gray-200 dark:border-gray-800">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Files</h2>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-800">
              {recentFiles.length === 0 ? (
                <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                  No recent files
                </div>
              ) : (
                recentFiles.map((file, index) => (
                  <motion.div
                    key={file.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + index * 0.05 }}
                    className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
                    onClick={() => navigate('/workspace/drive')}
                  >
                    <div className="flex items-center gap-3">
                      {file.type === 'folder' ? (
                        <FiFolder className="w-5 h-5 text-yellow-500" />
                      ) : (
                        getFileIcon(file.mime)
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{file.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {formatSize(file.sizeBytes)} • {formatTime(file.modifiedISO)}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>

          {/* File Types Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800"
          >
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">File Types</h2>
            <div className="space-y-4">
              {[
                { label: 'Documents', value: fileTypeStats.documents, color: 'blue', icon: <FiFileText /> },
                { label: 'Images', value: fileTypeStats.images, color: 'green', icon: <FiImage /> },
                { label: 'Videos', value: fileTypeStats.videos, color: 'purple', icon: <FiVideo /> },
                { label: 'Audio', value: fileTypeStats.audio, color: 'yellow', icon: <FiMusic /> }
              ].map((type, index) => {
                const total = Object.values(fileTypeStats).reduce((a, b) => a + b, 0);
                const percentage = total > 0 ? (type.value / total) * 100 : 0;
                return (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`text-${type.color}-600 dark:text-${type.color}-400`}>{type.icon}</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{type.label}</span>
                      </div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">{type.value}</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
                        className={`h-full rounded-full bg-${type.color}-500`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
}
