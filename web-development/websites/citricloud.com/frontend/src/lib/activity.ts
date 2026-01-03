import api from './api';

export const activityAPI = {
  getRecentFilesAndActivity: () => api.get('/activity/recent-files-activity'),
  getLogs: () => api.get('/activity/logs'),
  getPublicLogs: () => api.get('/activity/logs/public'),
};
