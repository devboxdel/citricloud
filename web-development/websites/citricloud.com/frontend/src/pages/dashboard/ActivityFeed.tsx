import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuthStore } from '../../store/authStore';
import { FiActivity, FiUsers, FiFile, FiMessageSquare, FiCheckCircle, FiStar, FiEdit, FiClock } from 'react-icons/fi';

interface Activity {
  id: number;
  user: {
    full_name?: string;
    email?: string;
  };
  activity_type: string;
  action: string;
  target: string;
  timestamp: string;
}

interface Stats {
  total_today: number;
  this_week: number;
  team_actions: number;
  new_users: number;
}

export default function ActivityFeed() {
  const { user } = useAuthStore();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [stats, setStats] = useState<Stats>({
    total_today: 0,
    this_week: 0,
    team_actions: 0,
    new_users: 0
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

  const getActivityIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'create':
      case 'upload':
        return { icon: <FiFile />, color: 'text-blue-500', bgColor: 'bg-blue-100 dark:bg-blue-500/20' };
      case 'message':
      case 'comment':
        return { icon: <FiMessageSquare />, color: 'text-green-500', bgColor: 'bg-green-100 dark:bg-green-500/20' };
      case 'join':
      case 'invite':
        return { icon: <FiUsers />, color: 'text-purple-500', bgColor: 'bg-purple-100 dark:bg-purple-500/20' };
      case 'complete':
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
  };

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
            <FiCheckCircle />
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">This Week</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.this_week}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          whileHover={{ scale: 1.02, y: -2 }}
          className="glass-card p-6 rounded-2xl bg-white/90 dark:bg-gray-800/90 border border-gray-200/50 dark:border-gray-700/50"
        >
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white mb-3 shadow-lg">
            <FiUsers />
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Team Actions</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.team_actions}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          whileHover={{ scale: 1.02, y: -2 }}
          className="glass-card p-6 rounded-2xl bg-white/90 dark:bg-gray-800/90 border border-gray-200/50 dark:border-gray-700/50"
        >
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white mb-3 shadow-lg">
            <FiStar />
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">New Users</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.new_users}</p>
        </motion.div>
      </div>

      {/* Activity Stream */}
      <div className="glass-card rounded-2xl bg-white/90 dark:bg-gray-800/90 border border-gray-200/50 dark:border-gray-700/50 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center space-x-2">
            <FiActivity className="text-primary-500" />
            <span>Recent Activity</span>
          </h2>
          <button className="text-sm text-primary-500 hover:text-primary-600 font-semibold">View All</button>
        </div>

        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">Loading...</div>
          ) : activities.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">No activities yet</div>
          ) : (
            activities.map((activity) => {
              const { icon, color, bgColor } = getActivityIcon(activity.activity_type);
              return (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  whileHover={{ scale: 1.01, x: 4 }}
                  className="flex items-start space-x-4 p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all cursor-pointer"
                >
                  <div className={`w-10 h-10 rounded-lg ${bgColor} ${color} flex items-center justify-center flex-shrink-0`}>
                    {icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between flex-wrap gap-2">
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
}
