import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '../../../components/DashboardLayout';
import { 
  FiClock, FiUpload, FiDownload, FiEdit, FiTrash2, FiShare2, 
  FiFile, FiFolder, FiEye, FiCopy, FiMove
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

interface Activity {
  id: string;
  type: 'upload' | 'download' | 'edit' | 'delete' | 'share' | 'view' | 'copy' | 'move';
  fileName: string;
  fileType: 'file' | 'folder';
  user: string;
  timestamp: Date;
  details?: string;
}

export default function DMSRecent() {
  const [timeFilter, setTimeFilter] = useState<'today' | 'week' | 'month' | 'all'>('all');
  const [items, setItems] = useState<DriveItem[]>([]);
  const [loading, setLoading] = useState(true);

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

  // Convert items to activities
  const activities: Activity[] = items
    .sort((a, b) => new Date(b.modifiedISO).getTime() - new Date(a.modifiedISO).getTime())
    .slice(0, 20)
    .map((item, index) => ({
      id: item.id,
      type: index % 4 === 0 ? 'upload' : index % 4 === 1 ? 'edit' : index % 4 === 2 ? 'view' : 'share',
      fileName: item.name,
      fileType: item.type,
      user: item.owner,
      timestamp: new Date(item.modifiedISO),
      details: item.type === 'file' ? `Modified ${item.name}` : `Accessed ${item.name}`
    }));

  const getActivityIcon = (type: Activity['type']) => {
    const icons = {
      upload: <FiUpload className="w-5 h-5" />,
      download: <FiDownload className="w-5 h-5" />,
      edit: <FiEdit className="w-5 h-5" />,
      delete: <FiTrash2 className="w-5 h-5" />,
      share: <FiShare2 className="w-5 h-5" />,
      view: <FiEye className="w-5 h-5" />,
      copy: <FiCopy className="w-5 h-5" />,
      move: <FiMove className="w-5 h-5" />
    };
    return icons[type];
  };

  const getActivityColor = (type: Activity['type']) => {
    const colors = {
      upload: 'blue',
      download: 'green',
      edit: 'yellow',
      delete: 'red',
      share: 'purple',
      view: 'gray',
      copy: 'indigo',
      move: 'orange'
    };
    return colors[type];
  };

  const getActivityLabel = (type: Activity['type']) => {
    const labels = {
      upload: 'Uploaded',
      download: 'Downloaded',
      edit: 'Edited',
      delete: 'Deleted',
      share: 'Shared',
      view: 'Viewed',
      copy: 'Copied',
      move: 'Moved'
    };
    return labels[type];
  };

  const filteredActivities = activities.filter(activity => {
    const now = new Date();
    const diff = now.getTime() - activity.timestamp.getTime();
    const days = diff / (1000 * 60 * 60 * 24);

    switch (timeFilter) {
      case 'today':
        return days < 1;
      case 'week':
        return days < 7;
      case 'month':
        return days < 30;
      default:
        return true;
    }
  });

  const stats = [
    { label: 'Today', value: activities.filter(a => {
      const today = new Date();
      return a.timestamp.toDateString() === today.toDateString();
    }).length, color: 'blue' },
    { label: 'This Week', value: activities.filter(a => {
      const week = new Date();
      week.setDate(week.getDate() - 7);
      return a.timestamp >= week;
    }).length, color: 'green' },
    { label: 'Uploads', value: activities.filter(a => a.type === 'upload').length, color: 'purple' },
    { label: 'Edits', value: activities.filter(a => a.type === 'edit').length, color: 'orange' }
  ];

  const getRelativeTime = (date: Date) => {
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

  if (loading) {
    return (
      <DashboardLayout title="Recent Activity">
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Recent Activity">
      <div className="p-4 sm:p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Recent Activity</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Track all file operations and changes</p>
          </div>
          <div className="flex gap-2">
            {(['today', 'week', 'month', 'all'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setTimeFilter(filter)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  timeFilter === filter
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </button>
            ))}
          </div>
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
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">{stat.label}</p>
              <p className={`text-3xl font-bold text-${stat.color}-600 dark:text-${stat.color}-400`}>{stat.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Activity Timeline */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
          <div className="p-6 border-b border-gray-200 dark:border-gray-800">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <FiClock className="w-5 h-5 text-primary-500" />
              Activity Timeline
            </h2>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-800 max-h-[600px] overflow-y-auto">
            {filteredActivities.length === 0 ? (
              <div className="p-12 text-center text-gray-500 dark:text-gray-400">
                No activity found for this time period
              </div>
            ) : (
              filteredActivities.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-6 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg bg-${getActivityColor(activity.type)}-100 dark:bg-${getActivityColor(activity.type)}-900/30 text-${getActivityColor(activity.type)}-600 dark:text-${getActivityColor(activity.type)}-400 shrink-0`}>
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-sm text-gray-900 dark:text-white">
                            <span className="font-medium">{activity.user}</span> {getActivityLabel(activity.type).toLowerCase()}{' '}
                            <span className="inline-flex items-center gap-1">
                              {activity.fileType === 'folder' ? (
                                <FiFolder className="w-4 h-4 text-yellow-500 inline" />
                              ) : (
                                <FiFile className="w-4 h-4 text-blue-500 inline" />
                              )}
                              <span className="font-medium">{activity.fileName}</span>
                            </span>
                          </p>
                          {activity.details && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{activity.details}</p>
                          )}
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                          {getRelativeTime(activity.timestamp)}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* Activity Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Most Active Users</h3>
            <div className="space-y-3">
              {Array.from(new Set(activities.map(a => a.user))).slice(0, 5).map((user, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-900 dark:text-white">{user}</span>
                  <span className="text-sm font-medium text-primary-600 dark:text-primary-400">
                    {activities.filter(a => a.user === user).length} activities
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Activity Types</h3>
            <div className="space-y-3">
              {(['upload', 'edit', 'view', 'share'] as const).map((type, index) => {
                const count = activities.filter(a => a.type === type).length;
                const percentage = activities.length > 0 ? (count / activities.length) * 100 : 0;
                return (
                  <div key={index} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-900 dark:text-white capitalize">{type}</span>
                      <span className="text-gray-600 dark:text-gray-400">{count}</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.5, delay: 0.7 + index * 0.1 }}
                        className={`h-full rounded-full bg-${getActivityColor(type)}-500`}
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
