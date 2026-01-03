// New Settings Sections to be integrated into Profile.tsx

export const PrivacySection = `
{/* Privacy */}
{settingsTab === 'privacy' && (
<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-8 rounded-2xl mb-6 bg-white/85 dark:bg-gray-800/95 border border-white/30 dark:border-gray-700/60 shadow-sm dark:shadow-[0_0_0_1px_rgba(255,255,255,0.05)] backdrop-blur-xl">
  <div className="flex items-center gap-3 mb-6">
    <div className="w-10 h-10 rounded-xl bg-purple-500/10 dark:bg-purple-500/20 flex items-center justify-center text-purple-500 dark:text-purple-400">
      <FiShield className="w-5 h-5" />
    </div>
    <div>
      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Privacy & Data</h2>
      <p className="text-sm text-gray-600 dark:text-gray-400">Control who can see your information</p>
    </div>
  </div>

  <div className="space-y-6">
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Profile Visibility</label>
      <select
        value={profileVisibility}
        onChange={(e) => setProfileVisibility(e.target.value as 'public' | 'friends' | 'private')}
        className="w-full glass-input dark:bg-gray-700/70 dark:border-gray-600 dark:text-gray-100"
      >
        <option value="public">Public - Anyone can see</option>
        <option value="friends">Friends Only</option>
        <option value="private">Private - Only me</option>
      </select>
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Activity Visibility</label>
      <select
        value={activityVisibility}
        onChange={(e) => setActivityVisibility(e.target.value as 'public' | 'friends' | 'private')}
        className="w-full glass-input dark:bg-gray-700/70 dark:border-gray-600 dark:text-gray-100"
      >
        <option value="public">Public - Anyone can see</option>
        <option value="friends">Friends Only</option>
        <option value="private">Private - Only me</option>
      </select>
    </div>

    <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50">
      <div>
        <div className="font-medium text-gray-800 dark:text-gray-100">Data Sharing</div>
        <div className="text-sm text-gray-600 dark:text-gray-400">Share analytics to help improve CITRICLOUD</div>
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input type="checkbox" checked={dataSharing} onChange={(e) => setDataSharing(e.target.checked)} className="sr-only peer" />
        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-500"></div>
      </label>
    </div>

    <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50">
      <div>
        <div className="font-medium text-gray-800 dark:text-gray-100">Analytics</div>
        <div className="text-sm text-gray-600 dark:text-gray-400">Allow collection of usage data</div>
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input type="checkbox" checked={analyticsEnabled} onChange={(e) => setAnalyticsEnabled(e.target.checked)} className="sr-only peer" />
        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-500"></div>
      </label>
    </div>
  </div>
</motion.div>
)}
`;

export const AccessibilitySection = `
{/* Accessibility */}
{settingsTab === 'accessibility' && (
<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-8 rounded-2xl mb-6 bg-white/85 dark:bg-gray-800/95 border border-white/30 dark:border-gray-700/60 shadow-sm dark:shadow-[0_0_0_1px_rgba(255,255,255,0.05)] backdrop-blur-xl">
  <div className="flex items-center gap-3 mb-6">
    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 dark:bg-indigo-500/20 flex items-center justify-center text-indigo-500 dark:text-indigo-400">
      <FiUser className="w-5 h-5" />
    </div>
    <div>
      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Accessibility</h2>
      <p className="text-sm text-gray-600 dark:text-gray-400">Customize display and navigation options</p>
    </div>
  </div>

  <div className="space-y-6">
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Text Size</label>
      <div className="grid grid-cols-4 gap-3">
        <button
          onClick={() => setFontSize('small')}
          className={\`p-4 rounded-xl border transition-all \${fontSize === 'small' ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/10' : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'}\`}
        >
          <div className="text-xs font-medium text-gray-800 dark:text-gray-100">Small</div>
        </button>
        <button
          onClick={() => setFontSize('medium')}
          className={\`p-4 rounded-xl border transition-all \${fontSize === 'medium' ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/10' : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'}\`}
        >
          <div className="text-sm font-medium text-gray-800 dark:text-gray-100">Medium</div>
        </button>
        <button
          onClick={() => setFontSize('large')}
          className={\`p-4 rounded-xl border transition-all \${fontSize === 'large' ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/10' : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'}\`}
        >
          <div className="text-base font-medium text-gray-800 dark:text-gray-100">Large</div>
        </button>
        <button
          onClick={() => setFontSize('extra-large')}
          className={\`p-4 rounded-xl border transition-all \${fontSize === 'extra-large' ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/10' : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'}\`}
        >
          <div className="text-lg font-medium text-gray-800 dark:text-gray-100">X-Large</div>
        </button>
      </div>
    </div>

    <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50">
      <div>
        <div className="font-medium text-gray-800 dark:text-gray-100">High Contrast Mode</div>
        <div className="text-sm text-gray-600 dark:text-gray-400">Increase visual contrast for better readability</div>
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input type="checkbox" checked={highContrast} onChange={(e) => setHighContrast(e.target.checked)} className="sr-only peer" />
        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-500"></div>
      </label>
    </div>

    <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50">
      <div>
        <div className="font-medium text-gray-800 dark:text-gray-100">Reduce Motion</div>
        <div className="text-sm text-gray-600 dark:text-gray-400">Minimize animations and transitions</div>
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input type="checkbox" checked={reduceMotion} onChange={(e) => setReduceMotion(e.target.checked)} className="sr-only peer" />
        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-500"></div>
      </label>
    </div>

    <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50">
      <div>
        <div className="font-medium text-gray-800 dark:text-gray-100">Screen Reader Support</div>
        <div className="text-sm text-gray-600 dark:text-gray-400">Optimize for screen reader navigation</div>
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input type="checkbox" checked={screenReader} onChange={(e) => setScreenReader(e.target.checked)} className="sr-only peer" />
        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-500"></div>
      </label>
    </div>
  </div>
</motion.div>
)}
`;

export const DataStorageSection = `
{/* Data & Storage */}
{settingsTab === 'data' && (
<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-8 rounded-2xl mb-6 bg-white/85 dark:bg-gray-800/95 border border-white/30 dark:border-gray-700/60 shadow-sm dark:shadow-[0_0_0_1px_rgba(255,255,255,0.05)] backdrop-blur-xl">
  <div className="flex items-center gap-3 mb-6">
    <div className="w-10 h-10 rounded-xl bg-cyan-500/10 dark:bg-cyan-500/20 flex items-center justify-center text-cyan-500 dark:text-cyan-400">
      <FiActivity className="w-5 h-5" />
    </div>
    <div>
      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Data & Storage</h2>
      <p className="text-sm text-gray-600 dark:text-gray-400">Manage your data and storage usage</p>
    </div>
  </div>

  <div className="space-y-6">
    <div className="p-6 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Storage Usage</h3>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">Cache</span>
          <span className="text-sm font-medium text-gray-800 dark:text-gray-100">{cacheSize}</span>
        </div>
        <button
          onClick={async () => {
            try {
              await profileAPI.updatePreferences({ clear_cache: true });
              setCacheSize('0 MB');
              toast.success('Cache cleared successfully');
            } catch (error) {
              toast.error('Failed to clear cache');
            }
          }}
          className="w-full px-4 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 font-medium transition-all"
        >
          Clear Cache
        </button>
      </div>
    </div>

    <div className="p-6 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Download Your Data</h3>
      <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
        Export all your data including profile, messages, and activity history.
      </p>
      <button
        onClick={async () => {
          try {
            setDownloadingData(true);
            const response = await profileAPI.exportData();
            const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = \`citricloud-data-\${new Date().toISOString().split('T')[0]}.json\`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            toast.success('Data exported successfully');
          } catch (error) {
            toast.error('Failed to export data');
          } finally {
            setDownloadingData(false);
          }
        }}
        disabled={downloadingData}
        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium transition-all disabled:opacity-50"
      >
        <FiDownload className="w-5 h-5" />
        {downloadingData ? 'Exporting...' : 'Download Data'}
      </button>
    </div>
  </div>
</motion.div>
)}
`;

export const AccountSection = `
{/* Account Management */}
{settingsTab === 'account' && (
<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-8 rounded-2xl mb-6 bg-white/85 dark:bg-gray-800/95 border border-white/30 dark:border-gray-700/60 shadow-sm dark:shadow-[0_0_0_1px_rgba(255,255,255,0.05)] backdrop-blur-xl">
  <div className="flex items-center gap-3 mb-6">
    <div className="w-10 h-10 rounded-xl bg-red-500/10 dark:bg-red-500/20 flex items-center justify-center text-red-500 dark:text-red-400">
      <FiAlertCircle className="w-5 h-5" />
    </div>
    <div>
      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Account Management</h2>
      <p className="text-sm text-gray-600 dark:text-gray-400">Manage your account settings and preferences</p>
    </div>
  </div>

  <div className="space-y-6">
    <div className="p-6 rounded-xl bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
        <FiAlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
        Deactivate Account
      </h3>
      <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
        Temporarily deactivate your account. You can reactivate it anytime by logging in.
      </p>
      <button
        className="px-6 py-3 rounded-xl bg-yellow-600 hover:bg-yellow-700 text-white font-medium transition-all"
        onClick={() => toast.info('Account deactivation feature coming soon')}
      >
        Deactivate Account
      </button>
    </div>

    <div className="p-6 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
        <FiAlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
        Delete Account
      </h3>
      <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
        Permanently delete your account and all associated data. This action cannot be undone.
      </p>
      <button
        onClick={() => setShowDeleteModal(true)}
        className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium transition-all"
      >
        Delete Account
      </button>
    </div>
  </div>
</motion.div>
)}
`;
