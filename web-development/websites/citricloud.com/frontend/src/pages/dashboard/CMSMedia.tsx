import DashboardLayout from '../../components/DashboardLayout';
import { motion } from 'framer-motion';
import { FiImage, FiUpload, FiTrash2, FiDownload, FiFolder, FiFile } from 'react-icons/fi';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cmsAPI } from '../../lib/api';

export default function CMSMedia() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [uploading, setUploading] = useState(false);
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [folders, setFolders] = useState<string[]>(['Images', 'Documents', 'Videos']);
  const [deletingFile, setDeletingFile] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Helper function to resolve image URLs
  const getImageUrl = (url: string | null | undefined): string => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    if (url.startsWith('/')) return `https://my.citricloud.com${url}`;
    return url;
  };

  const { data: mediaData, isLoading } = useQuery({
    queryKey: ['media-files'],
    queryFn: async () => {
      const response = await cmsAPI.getMedia();
      return response.data;
    },
  });

  const mediaItems = mediaData?.items || [];

  // Delete media mutation
  const deleteMutation = useMutation({
    mutationFn: (filename: string) => {
      console.log('deleteMutation mutationFn called with:', filename);
      return cmsAPI.deleteMedia(filename);
    },
    onSuccess: () => {
      console.log('deleteMutation onSuccess');
      queryClient.invalidateQueries({ queryKey: ['media-files'] });
      setDeletingFile(null);
    },
    onError: (error: any) => {
      console.error('deleteMutation onError:', error);
      console.error('Error response:', error.response);
      alert('Failed to delete file: ' + (error.response?.data?.detail || error.message));
      setDeletingFile(null);
    },
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      await cmsAPI.uploadMedia(file);
      queryClient.invalidateQueries({ queryKey: ['media-files'] });
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const handleDeleteFile = (filename: string) => {
    const confirmed = confirm('Are you sure you want to delete this file? This cannot be undone.');
    if (confirmed) {
      setDeletingFile(filename);
      deleteMutation.mutate(filename);
    }
  };

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      setFolders([...folders, newFolderName.trim()]);
      setNewFolderName('');
      setShowNewFolderModal(false);
    }
  };

  return (
    <DashboardLayout
      title="Media Library"
      breadcrumb={<div className="text-xs text-gray-500">CMS / Media Library</div>}
    >
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Media Library</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Upload and manage your media files
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            className="px-4 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
          >
            {viewMode === 'grid' ? 'List View' : 'Grid View'}
          </button>
          <button
            onClick={() => setShowNewFolderModal(true)}
            className="px-4 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all flex items-center gap-2"
          >
            <FiFolder className="w-4 h-4" />
            New Folder
          </button>
          <label className="glass-button px-6 py-3 rounded-xl text-white font-medium flex items-center gap-2 cursor-pointer">
            <FiUpload className="w-5 h-5" />
            {uploading ? 'Uploading...' : 'Upload Files'}
            <input
              type="file"
              accept=".jpeg,.jpg,.png,.gif,.webp,image/*,video/*,application/pdf"
              onChange={handleFileUpload}
              disabled={uploading}
              className="hidden"
              multiple
            />
          </label>
        </div>
      </div>

      {/* Storage Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6 rounded-2xl mb-6 bg-white/80 dark:bg-gray-800/90 border border-white/30 dark:border-gray-700/50"
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-800 dark:text-gray-100">Storage Usage</h3>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {formatFileSize(mediaItems.reduce((acc: number, item: any) => acc + (item.size || 0), 0))} / 50 GB
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
          <div className="bg-gradient-to-r from-primary-500 to-blue-500 h-3 rounded-full" style={{ width: '2%' }}></div>
        </div>
      </motion.div>

      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 mb-4 text-sm">
        <button
          onClick={() => setCurrentFolder(null)}
          className={`px-3 py-1.5 rounded-lg transition-all ${!currentFolder ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 font-medium' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
        >
          All Files
        </button>
        {currentFolder && (
          <>
            <span className="text-gray-400">/</span>
            <span className="px-3 py-1.5 rounded-lg bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 font-medium">
              {currentFolder}
            </span>
          </>
        )}
      </div>

      {/* Folders Grid */}
      {!currentFolder && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Folders</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {folders.map((folder, index) => (
              <motion.button
                key={folder}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => setCurrentFolder(folder)}
                className="glass-card p-4 rounded-xl bg-white/80 dark:bg-gray-800/90 border border-white/30 dark:border-gray-700/50 hover:shadow-lg transition-all group"
              >
                <FiFolder className="w-12 h-12 mx-auto mb-2 text-primary-500 group-hover:scale-110 transition-transform" />
                <p className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">{folder}</p>
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Media Grid/List */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {mediaItems.map((item: any, index: number) => (
            <motion.div
              key={item.filename}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="glass-card rounded-2xl overflow-hidden bg-white/80 dark:bg-gray-800/90 border border-white/30 dark:border-gray-700/50 shadow-sm dark:shadow-[0_0_0_1px_rgba(255,255,255,0.05)] group"
            >
              <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center relative overflow-hidden">
                {item.type === 'image' ? (
                  <img 
                    src={getImageUrl(item.url)} 
                    alt={item.filename}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <FiFile className="w-12 h-12 text-gray-400" />
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <a
                    href={getImageUrl(item.url)}
                    download
                    className="p-2 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    title="Download"
                  >
                    <FiDownload className="w-4 h-4" />
                  </a>
                  <button 
                    onClick={() => handleDeleteFile(item.filename)}
                    disabled={deletingFile === item.filename}
                    className="p-2 rounded-lg bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed" 
                    title="Delete"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="p-4">
                <p className="font-medium text-gray-800 dark:text-gray-100 truncate" title={item.filename}>
                  {item.filename}
                </p>
                <div className="flex items-center justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
                  <span>{formatFileSize(item.size)}</span>
                  <span>{formatDate(item.created_at)}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-2xl bg-white/80 dark:bg-gray-800/90 border border-white/30 dark:border-gray-700/50 overflow-hidden"
        >
          {mediaItems.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead className="bg-gray-50 dark:bg-gray-900/50">
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-4 px-6 font-semibold text-sm text-gray-700 dark:text-gray-200">Name</th>
                    <th className="text-left py-4 px-6 font-semibold text-sm text-gray-700 dark:text-gray-200">Type</th>
                    <th className="text-left py-4 px-6 font-semibold text-sm text-gray-700 dark:text-gray-200">Size</th>
                    <th className="text-left py-4 px-6 font-semibold text-sm text-gray-700 dark:text-gray-200">Uploaded</th>
                    <th className="text-right py-4 px-6 font-semibold text-sm text-gray-700 dark:text-gray-200">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {mediaItems.map((item: any, index: number) => (
                    <motion.tr
                      key={item.filename}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-all"
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center overflow-hidden flex-shrink-0">
                            {item.type === 'image' ? (
                              <img src={getImageUrl(item.url)} alt={item.filename} className="w-full h-full object-cover" />
                            ) : (
                              <FiFile className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                            )}
                          </div>
                          <span className="font-medium text-gray-800 dark:text-gray-100 truncate max-w-xs" title={item.filename}>
                            {item.filename}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 capitalize">
                          {item.type}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">
                        {formatFileSize(item.size)}
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">
                        {formatDate(item.created_at)}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-end gap-2">
                          <a
                            href={getImageUrl(item.url)}
                            download
                            className="p-2 rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
                            title="Download"
                          >
                            <FiDownload className="w-4 h-4" />
                          </a>
                          <button 
                            onClick={() => handleDeleteFile(item.filename)}
                            disabled={deletingFile === item.filename}
                            className="p-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all" 
                            title="Delete"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center">
              <FiFile className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
              <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">No files to display</p>
              <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">Upload files to see them in list view</p>
            </div>
          )}
        </motion.div>
      )}

      {/* Empty State */}
      {mediaItems.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-12 rounded-2xl bg-white/80 dark:bg-gray-800/90 border border-white/30 dark:border-gray-700/50 text-center mt-8"
        >
          <div className="w-20 h-20 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
            <FiFolder className="w-10 h-10 text-gray-400 dark:text-gray-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">No media files yet</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">Upload your first file to get started</p>
          <label className="glass-button px-8 py-3 rounded-xl text-white font-medium inline-flex items-center gap-2 cursor-pointer">
            <FiUpload className="w-5 h-5" />
            Upload Files
            <input
              type="file"
              accept=".jpeg,.jpg,.png,.gif,.webp,image/*"
              onChange={handleFileUpload}
              disabled={uploading}
              className="hidden"
            />
          </label>
        </motion.div>
      )}

      {/* New Folder Modal */}
      {showNewFolderModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowNewFolderModal(false)}>
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="glass-card p-6 rounded-2xl bg-white dark:bg-gray-800 border border-white/30 dark:border-gray-700/50 w-full max-w-md"
          >
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Create New Folder</h3>
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleCreateFolder()}
              placeholder="Folder name"
              className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 mb-4"
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowNewFolderModal(false)}
                className="flex-1 px-6 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateFolder}
                disabled={!newFolderName.trim()}
                className="flex-1 px-6 py-3 rounded-xl bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Create
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </DashboardLayout>
  );
}
