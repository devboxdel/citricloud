import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuthStore } from '../../store/authStore';
import { FiFolder, FiFile, FiUpload, FiDownload, FiSearch, FiGrid, FiList, FiMoreVertical, FiShare2, FiTrash2, FiEye, FiStar, FiClock, FiUsers } from 'react-icons/fi';

interface Folder {
  id: number;
  name: string;
  icon: string;
  color: string;
  created_by: number;
  file_count?: number;
}

interface SharedFile {
  id: number;
  name: string;
  file_type: string;
  size: number;
  file_path: string;
  owner_id: number;
  owner?: {
    id: number;
    email: string;
    full_name: string;
  };
  uploaded_at: string;
  is_starred?: boolean;
}

export default function FileSharing() {
  const { user } = useAuthStore();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<number | null>(null);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [files, setFiles] = useState<SharedFile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFolders();
    fetchFiles();
  }, []);

  const fetchFolders = async () => {
    try {
      const response = await fetch('/api/v1/collaboration/folders', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      const data = await response.json();
      setFolders(data.folders || []);
    } catch (error) {
      console.error('Error fetching folders:', error);
    }
  };

  const fetchFiles = async () => {
    try {
      const response = await fetch('/api/v1/collaboration/files', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      const data = await response.json();
      setFiles(data.files || []);
    } catch (error) {
      console.error('Error fetching files:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileColor = (fileType: string): string => {
    const lowerType = fileType.toLowerCase();
    if (lowerType.includes('pdf')) return 'text-red-500';
    if (lowerType.includes('doc')) return 'text-blue-500';
    if (lowerType.includes('xls')) return 'text-green-500';
    if (lowerType.includes('ppt')) return 'text-orange-500';
    if (lowerType.includes('image') || lowerType.includes('png') || lowerType.includes('jpg')) return 'text-purple-500';
    return 'text-gray-500';
  };

  const filteredFiles = files.filter(file =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  return (
    <DashboardLayout
      title="File Sharing"
      breadcrumb={<div className="text-xs text-gray-500">Main / File Sharing</div>}
    >
      {/* Header */}
      <div className="glass-card rounded-2xl bg-white/90 dark:bg-gray-800/90 border border-gray-200/50 dark:border-gray-700/50 p-6 mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center space-x-2">
              <FiFolder className="text-primary-500" />
              <span>Shared Files</span>
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Collaborate and share files with your team
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search files..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white w-64"
              />
            </div>
            
            <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white dark:bg-gray-600 shadow' : ''}`}
              >
                <FiGrid className={viewMode === 'grid' ? 'text-primary-500' : 'text-gray-600 dark:text-gray-400'} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-white dark:bg-gray-600 shadow' : ''}`}
              >
                <FiList className={viewMode === 'list' ? 'text-primary-500' : 'text-gray-600 dark:text-gray-400'} />
              </button>
            </div>
            
            <button className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-all flex items-center space-x-2">
              <FiUpload />
              <span>Upload</span>
            </button>
          </div>
        </div>
      </div>

      {/* Folders */}
      <div className="mb-6">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
          <FiFolder className="text-primary-500" />
          <span>Shared Folders</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {folders.map((folder) => (
            <motion.button
              key={folder.id}
              onClick={() => setSelectedFolder(folder.id)}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className={`glass-card p-6 rounded-2xl text-left transition-all ${
                selectedFolder === folder.id
                  ? 'border-2 border-primary-500 bg-primary-50 dark:bg-primary-500/10'
                  : 'bg-white/90 dark:bg-gray-800/90 border border-gray-200/50 dark:border-gray-700/50'
              }`}
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${folder.color} flex items-center justify-center text-2xl mb-3 shadow-lg`}>
                {folder.icon}
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-1">{folder.name}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{folder.files} files</p>
              {folder.shared && (
                <div className="mt-2 flex items-center space-x-1 text-xs text-primary-600 dark:text-primary-400">
                  <FiUsers className="w-3 h-3" />
                  <span>Shared</span>
                </div>
              )}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Files */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
          <FiFile className="text-primary-500" />
          <span>Recent Files</span>
        </h2>
        
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredFiles.map((file, index) => (
              <motion.div
                key={file.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -4 }}
                className="glass-card p-6 rounded-2xl bg-white/90 dark:bg-gray-800/90 border border-gray-200/50 dark:border-gray-700/50 hover:border-primary-500 dark:hover:border-primary-400 transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center ${file.color} font-bold text-xs`}>
                    {file.type}
                  </div>
                  <div className="flex items-center space-x-1">
                    {file.isStarred && <FiStar className="w-4 h-4 fill-yellow-500 text-yellow-500" />}
                    <button className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
                      <FiMoreVertical className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    </button>
                  </div>
                </div>
                
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2 truncate">{file.name}</h3>
                
                <div className="flex items-center space-x-4 text-xs text-gray-600 dark:text-gray-400 mb-3">
                  <span>{file.size}</span>
                  <span>•</span>
                  <div className="flex items-center space-x-1">
                    <FiClock className="w-3 h-3" />
                    <span>{file.modified}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-2">
                    <span className="text-xl">{file.ownerAvatar}</span>
                    <span className="text-xs text-gray-600 dark:text-gray-400">{file.owner}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <button className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700" title="View">
                      <FiEye className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    </button>
                    <button className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700" title="Download">
                      <FiDownload className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    </button>
                    <button className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700" title="Share">
                      <FiShare2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="glass-card rounded-2xl bg-white/90 dark:bg-gray-800/90 border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Owner</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Size</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Modified</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredFiles.map((file) => (
                  <tr key={file.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center ${file.color} font-bold text-xs flex-shrink-0`}>
                          {file.type}
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-gray-900 dark:text-white">{file.name}</span>
                          {file.isStarred && <FiStar className="w-3 h-3 fill-yellow-500 text-yellow-500" />}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{file.ownerAvatar}</span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">{file.owner}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{file.size}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{file.modified}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-1">
                        <button className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700" title="View">
                          <FiEye className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        </button>
                        <button className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700" title="Download">
                          <FiDownload className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        </button>
                        <button className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700" title="Share">
                          <FiShare2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        </button>
                        <button className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700" title="Delete">
                          <FiTrash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
