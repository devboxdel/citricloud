import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuthStore } from '../../store/authStore';
import { FiActivity, FiUser, FiFile, FiMessageSquare, FiUsers, FiCheckCircle, FiAlertCircle, FiUpload, FiDownload, FiEdit, FiTrash2, FiStar, FiClock } from 'react-icons/fi';

interface Activity {
  id: number;
  user_id: number;
  activity_type: string;
  action: string;
  target: string;
  timestamp: string;
  user?: {
    id: number;
    email: string;
    full_name: string;
  };
}

interface ActivityStats {
  total_today: number;
  total_week: number;
  active_users: number;
  files_shared: number;
}

export default function ActivityFeed() {
  const { user } = useAuthStore();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [stats, setStats] = useState<ActivityStats>({
    total_today: 0,
    total_week: 0,
    active_users: 0,
    files_shared: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivities();
    fetchStats();
  }, []);

  const fetchActivities = async () => {
    try {
      const response = await fetch('/api/v1/collaboration/activity', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      const data = await response.json();
      setActivities(data.activities || []);
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/v1/collaboration/activity/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const getActivityIcon = (activityType: string) => {
    switch (activityType.toLowerCase()) {
      case 'file_upload':
        return { icon: <FiUpload />, color: 'text-blue-500', bgColor: 'bg-blue-100 dark:bg-blue-500/20' };
      case 'file_download':
        return { icon: <FiDownload />, color: 'text-indigo-500', bgColor: 'bg-indigo-100 dark:bg-indigo-500/20' };
      case 'comment':
        return { icon: <FiMessageSquare />, color: 'text-green-500', bgColor: 'bg-green-100 dark:bg-green-500/20' };
      case 'team_create':
        return { icon: <FiUsers />, color: 'text-purple-500', bgColor: 'bg-purple-100 dark:bg-purple-500/20' };
      case 'task_complete':
        return { icon: <FiCheckCircle />, color: 'text-green-500', bgColor: 'bg-green-100 dark:bg-green-500/20' };
      case 'update':
        return { icon: <FiEdit />, color: 'text-orange-500', bgColor: 'bg-orange-100 dark:bg-orange-500/20' };
      case 'star':
        return { icon: <FiStar />, color: 'text-yellow-500', bgColor: 'bg-yellow-100 dark:bg-yellow-500/20' };
      case 'share':
        return { icon: <FiFile />, color: 'text-cyan-500', bgColor: 'bg-cyan-100 dark:bg-cyan-500/20' };
      default:
        return { icon: <FiActivity />, color: 'text-gray-500', bgColor: 'bg-gray-100 dark:bg-gray-500/20' };
    }
  };    {
      id: 10,
      user: { name: 'Sarah Williams', avatar: '👩‍🔬' },
      action: 'joined team',
      target: 'Product Development',

  return (
    <DashboardLayout
      title="Activity Feed"
      breadcrumb={<div className="text-xs text-gray-500">Main / Activity Feed</div>}
    >
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.02, y: -2 }}
          className="glass-card p-6 rounded-2xl bg-white/90 dark:bg-gray-800/90 border border-gray-200/50 dark:border-gray-700/50"
        >
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white mb-3 shadow-lg">
            <FiActivity />
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Today's Activities</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total_today}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          whileHover={{ scale: 1.02, y: -2 }}
          className="glass-card p-6 rounded-2xl bg-white/90 dark:bg-gray-800/90 border border-gray-200/50 dark:border-gray-700/50"
        >
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white mb-3 shadow-lg">
            <FiUsers />
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Active Users</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.active_users}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          whileHover={{ scale: 1.02, y: -2 }}
          className="glass-card p-6 rounded-2xl bg-white/90 dark:bg-gray-800/90 border border-gray-200/50 dark:border-gray-700/50"
        >
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white mb-3 shadow-lg">
            <FiFile />
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Files Shared</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.files_shared}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          whileHover={{ scale: 1.02, y: -2 }}
          className="glass-card p-6 rounded-2xl bg-white/90 dark:bg-gray-800/90 border border-gray-200/50 dark:border-gray-700/50"
        >
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white mb-3 shadow-lg">
            <FiClock />
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">This Week</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total_week}</p>
        </motion.div>
      </div>

      {/* Activity Feed */}
      <div className="glass-card rounded-2xl bg-white/90 dark:bg-gray-800/90 border border-gray-200/50 dark:border-gray-700/50 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center space-x-2">
            <FiActivity className="text-primary-500" />
            <span>Recent Activity</span>
          </h2>
          <button 
            onClick={fetchActivities}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
          >
            Refresh
          </button>
        </div>

        {/* Activity List */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">Loading activities...</div>
          ) : activities.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">No recent activity</div>
          ) : (            activities.map((activity, index) => {
              const { icon, color, bgColor } = getActivityIcon(activity.activity_type);
              return (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ x: 4 }}
                  className="flex items-start space-x-4 p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all cursor-pointer"
                >
                  {/* Icon */}
                  <div className={`w-10 h-10 rounded-full ${bgColor} flex items-center justify-center ${color} flex-shrink-0`}>
                    {icon}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-gray-900 dark:text-white">
                          <span className="font-semibold">{activity.user?.full_name || activity.user?.email || 'Unknown User'}</span>
                          <span className="text-gray-600 dark:text-gray-400"> {activity.action} </span>
                          <span className="font-semibold text-primary-600 dark:text-primary-400">{activity.target}</span>
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{activity.timestamp}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}                  </div>
                  <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400 flex-shrink-0 ml-2">
                    <FiClock className="w-3 h-3" />
                    <span>{activity.time}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Load More */}
        <div className="mt-6 text-center">
          <button className="px-6 py-3 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all">
            Load More Activities
          </button>
        </div>
      </div>

      {/* Activity Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <div className="glass-card rounded-2xl bg-white/90 dark:bg-gray-800/90 border border-gray-200/50 dark:border-gray-700/50 p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Most Active Users</h3>
          <div className="space-y-3">
            {[
              { name: 'John Doe', avatar: '👨‍💼', actions: 45 },
              { name: 'Jane Smith', avatar: '👩‍💻', actions: 38 },
              { name: 'Mike Johnson', avatar: '🎨', actions: 32 },
              { name: 'Sarah Williams', avatar: '👩‍🔬', actions: 28 },
              { name: 'Tom Brown', avatar: '👨‍💻', actions: 24 },
            ].map((user, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{user.avatar}</span>
                  <span className="font-medium text-gray-900 dark:text-white">{user.name}</span>
                </div>
                <span className="text-sm font-bold text-primary-600 dark:text-primary-400">{user.actions} actions</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card rounded-2xl bg-white/90 dark:bg-gray-800/90 border border-gray-200/50 dark:border-gray-700/50 p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Activity Types</h3>
          <div className="space-y-3">
            {[
              { type: 'File Uploads', count: 156, icon: <FiUpload />, color: 'text-blue-500', percentage: 32 },
              { type: 'Comments', count: 124, icon: <FiMessageSquare />, color: 'text-green-500', percentage: 26 },
              { type: 'Downloads', count: 98, icon: <FiDownload />, color: 'text-purple-500', percentage: 20 },
              { type: 'Edits', count: 87, icon: <FiEdit />, color: 'text-orange-500', percentage: 18 },
              { type: 'Team Actions', count: 21, icon: <FiUsers />, color: 'text-pink-500', percentage: 4 },
            ].map((type, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`${type.color}`}>{type.icon}</div>
                    <span className="font-medium text-gray-900 dark:text-white">{type.type}</span>
                  </div>
                  <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{type.count}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${type.percentage}%` }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    className={`h-2 rounded-full bg-gradient-to-r ${
                      type.color === 'text-blue-500' ? 'from-blue-500 to-indigo-500' :
                      type.color === 'text-green-500' ? 'from-green-500 to-emerald-500' :
                      type.color === 'text-purple-500' ? 'from-purple-500 to-pink-500' :
                      type.color === 'text-orange-500' ? 'from-orange-500 to-red-500' :
                      'from-pink-500 to-rose-500'
                    }`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
