import DashboardLayout from '../components/DashboardLayout';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import { useState } from 'react';
import { FiMoon, FiSun, FiClock, FiBell, FiLock, FiGlobe, FiMail, FiCheckCircle, FiXCircle, FiCreditCard, FiArrowRight, FiAlertCircle, FiDownload, FiTrendingDown, FiZap, FiRefreshCw } from 'react-icons/fi';

export default function Settings() {
  const { user } = useAuthStore();
  const { mode, autoSource, setMode, setAutoSource } = useThemeStore();
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);
  const [language, setLanguage] = useState('en');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [invoices] = useState([
    { id: 'INV-001', date: '2025-12-01', amount: '$99.99', status: 'paid', description: 'Pro Plan - Monthly' },
    { id: 'INV-002', date: '2025-11-01', amount: '$99.99', status: 'paid', description: 'Pro Plan - Monthly' },
    { id: 'INV-003', date: '2025-10-01', amount: '$99.99', status: 'paid', description: 'Pro Plan - Monthly' },
    { id: 'INV-004', date: '2025-09-15', amount: '$49.99', status: 'refunded', description: 'Starter Plan - Monthly' },
  ]);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [refundRequest, setRefundRequest] = useState('');
  const [refundReason, setRefundReason] = useState('');
  const [refundSubmitted, setRefundSubmitted] = useState(false);
  const [subscriptions] = useState([
    {
      id: 'workspace-pro',
      name: 'Workspace Pro',
      status: 'active',
      price: 10,
      cycle: 'monthly',
      nextBillingDate: '2025-01-04',
      features: ['Email with aliases', 'Documents & spreadsheets', 'Team collaboration', '100GB storage'],
      canCancel: true,
    }
  ]);
  const [cancelingSubscription, setCancelingSubscription] = useState<string | null>(null);
  const [showUnlimitedInfo] = useState(user?.role === 'system_admin');

  // Log for debugging
  console.log('Subscriptions:', subscriptions);
  console.log('showUnlimitedInfo:', showUnlimitedInfo);

  const handleSavePreferences = () => {
    setSaveStatus('success');
    setTimeout(() => setSaveStatus('idle'), 3000);
  };

  const handleRequestRefund = () => {
    if (refundReason.trim() && selectedInvoice) {
      setRefundSubmitted(true);
      setTimeout(() => {
        setRefundSubmitted(false);
        setRefundRequest('');
        setRefundReason('');
        setSelectedInvoice(null);
      }, 3000);
    }
  };

  return (
    <DashboardLayout title="Settings">
      {/* Theme Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8 rounded-2xl mb-6 bg-white/70 dark:bg-gray-900/70 border border-white/30 dark:border-gray-700/30"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary-500/10 dark:bg-primary-500/20 flex items-center justify-center text-primary-500 dark:text-primary-400">
            <FiMoon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Appearance</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">Customize how CITRICLOUD looks on your device</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Theme Mode</label>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setMode('light')}
                className={`p-4 rounded-xl border transition-all ${
                  mode === 'light'
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/10'
                    : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                <FiSun className="w-6 h-6 mx-auto mb-2 text-gray-800 dark:text-gray-200" />
                <div className="text-sm font-medium text-gray-800 dark:text-gray-100">Light</div>
              </button>
              <button
                onClick={() => setMode('dark')}
                className={`p-4 rounded-xl border transition-all ${
                  mode === 'dark'
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/10'
                    : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                <FiMoon className="w-6 h-6 mx-auto mb-2 text-gray-800 dark:text-gray-200" />
                <div className="text-sm font-medium text-gray-800 dark:text-gray-100">Dark</div>
              </button>
              <button
                onClick={() => setMode('auto')}
                className={`p-4 rounded-xl border transition-all ${
                  mode === 'auto'
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/10'
                    : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                <FiClock className="w-6 h-6 mx-auto mb-2 text-gray-800 dark:text-gray-200" />
                <div className="text-sm font-medium text-gray-800 dark:text-gray-100">Auto</div>
              </button>
            </div>
          </div>

          {mode === 'auto' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Auto Mode Source</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setAutoSource('sun')}
                  className={`p-4 rounded-xl border transition-all text-left ${
                    autoSource === 'sun'
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/10'
                      : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  <div className="text-sm font-medium text-gray-800 dark:text-gray-100 mb-1">Sunrise/Sunset</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Based on your location</div>
                </button>
                <button
                  onClick={() => setAutoSource('system')}
                  className={`p-4 rounded-xl border transition-all text-left ${
                    autoSource === 'system'
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/10'
                      : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  <div className="text-sm font-medium text-gray-800 dark:text-gray-100 mb-1">System Preference</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Follow device settings</div>
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Notification Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-8 rounded-2xl mb-6 bg-white/70 dark:bg-gray-900/70 border border-white/30 dark:border-gray-700/30"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 dark:bg-blue-500/20 flex items-center justify-center text-blue-500 dark:text-blue-400">
            <FiBell className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Notifications</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">Manage how you receive updates</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50">
            <div className="flex items-center gap-3">
              <FiMail className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <div>
                <div className="font-medium text-gray-800 dark:text-gray-100">Email Notifications</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Receive email updates about your account</div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={emailNotifications}
                onChange={(e) => setEmailNotifications(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-500"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50">
            <div className="flex items-center gap-3">
              <FiBell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <div>
                <div className="font-medium text-gray-800 dark:text-gray-100">Push Notifications</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Get push notifications in your browser</div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={pushNotifications}
                onChange={(e) => setPushNotifications(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-500"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50">
            <div className="flex items-center gap-3">
              <FiMail className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <div>
                <div className="font-medium text-gray-800 dark:text-gray-100">Marketing Emails</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Receive news, updates, and offers</div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={marketingEmails}
                onChange={(e) => setMarketingEmails(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-500"></div>
            </label>
          </div>
        </div>
      </motion.div>

      {/* Language & Region */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card p-8 rounded-2xl mb-6 bg-white/70 dark:bg-gray-900/70 border border-white/30 dark:border-gray-700/30"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-green-500/10 dark:bg-green-500/20 flex items-center justify-center text-green-500 dark:text-green-400">
            <FiGlobe className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Language & Region</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">Set your language and regional preferences</p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Display Language</label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-white/60 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="en">English</option>
            <option value="es">Español</option>
            <option value="fr">Français</option>
            <option value="de">Deutsch</option>
            <option value="tr">Türkçe</option>
          </select>
        </div>
      </motion.div>

      {/* Subscriptions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="glass-card p-8 rounded-2xl mb-6 bg-white/70 dark:bg-gray-900/70 border border-white/30 dark:border-gray-700/30"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 dark:bg-blue-500/20 flex items-center justify-center text-blue-500 dark:text-blue-400">
            <FiZap className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Subscriptions</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">Manage your active subscriptions</p>
          </div>
        </div>

        {subscriptions.length > 0 ? (
          <>
            <div className="mb-6 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                <strong>Active Workspace Subscription:</strong> You have {subscriptions.length} active subscription(s). You can manage or cancel them below.
              </p>
            </div>
            <div className="space-y-4">
            {subscriptions.map((sub, idx) => (
              <motion.div
                key={sub.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`p-6 rounded-xl border-2 ${
                  sub.status === 'active'
                    ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-700/50'
                    : 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{sub.name}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        sub.status === 'active'
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}>
                        {sub.status.toUpperCase()}
                      </span>
                    </div>
                    {sub.nextBillingDate && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">Next billing: {new Date(sub.nextBillingDate).toLocaleDateString()}</p>
                    )}
                  </div>
                  <div className="text-right">
                    {sub.price ? (
                      <div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">${sub.price}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">/{sub.cycle}</p>
                      </div>
                    ) : (
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">Unlimited</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-4">
                  {sub.features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <FiCheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button className="flex-1 px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-medium transition-colors flex items-center justify-center gap-2">
                    <FiRefreshCw className="w-4 h-4" />
                    Manage Subscription
                  </button>
                  {sub.canCancel && (
                    <button
                      onClick={() => setCancelingSubscription(sub.id)}
                      className="flex-1 px-4 py-2 rounded-lg bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 text-red-700 dark:text-red-400 font-medium transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                </div>

                {/* Cancel Confirmation */}
                {cancelingSubscription === sub.id && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mt-4 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
                  >
                    <p className="text-sm text-red-700 dark:text-red-300 mb-3">
                      Are you sure you want to cancel this subscription? You'll lose access to these features.
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setCancelingSubscription(null);
                          // Handle cancellation
                        }}
                        className="flex-1 px-3 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-colors"
                      >
                        Yes, Cancel Subscription
                      </button>
                      <button
                        onClick={() => setCancelingSubscription(null)}
                        className="flex-1 px-3 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-sm font-medium transition-colors"
                      >
                        Keep Subscription
                      </button>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))}
            </div>
          </>
        ) : (
          <div className="text-center p-8">
            <p className="text-gray-600 dark:text-gray-400 mb-4">No active subscriptions</p>
            <Link to="/shop" className="inline-block px-6 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-medium transition-colors">
              Browse Subscriptions
            </Link>
          </div>
        )}

        {/* Unlimited Workspace (System Admin) */}
        {showUnlimitedInfo && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-8 p-6 rounded-xl bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-2 border-purple-200 dark:border-purple-700/50"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
                  <FiZap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Unlimited Workspace</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Your premium subscription</p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-purple-500 to-blue-500 text-white">
                ACTIVE
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-4">
              {['Unlimited storage', 'All workspace apps', 'Priority support', 'Custom domains'].map((f, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <FiCheckCircle className="w-4 h-4 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300">{f}</span>
                </div>
              ))}
            </div>

            <button className="w-full px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 text-white font-medium transition-opacity hover:opacity-90">
              Manage Premium Account
            </button>
          </motion.div>
        )}
      </motion.div>

      {/* Security Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card p-8 rounded-2xl mb-6 bg-white/70 dark:bg-gray-900/70 border border-white/30 dark:border-gray-700/30"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 dark:bg-red-500/20 flex items-center justify-center text-red-500 dark:text-red-400">
            <FiLock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Security</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">Manage your account security settings</p>
          </div>
        </div>

        <div className="space-y-3">
          <button className="w-full text-left px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all">
            <div className="font-medium text-gray-800 dark:text-gray-100">Change Password</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Update your password regularly for security</div>
          </button>
          <button className="w-full text-left px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all">
            <div className="font-medium text-gray-800 dark:text-gray-100">Two-Factor Authentication</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Add an extra layer of security to your account</div>
          </button>
          <button className="w-full text-left px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all">
            <div className="font-medium text-gray-800 dark:text-gray-100">Active Sessions</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">View and manage your active login sessions</div>
          </button>
        </div>
      </motion.div>

      {/* Billing & Refunds Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-card p-8 rounded-2xl mb-6 bg-white/70 dark:bg-gray-900/70 border border-white/30 dark:border-gray-700/30"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-green-500/10 dark:bg-green-500/20 flex items-center justify-center text-green-500 dark:text-green-400">
            <FiCreditCard className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Billing & Refunds</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">Manage your invoices and refund requests</p>
          </div>
        </div>

        {/* Refund Policy Info */}
        <div className="mb-8 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50">
          <div className="flex gap-3">
            <FiAlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">Refund Policy</h4>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <li>✓ 30-day money-back guarantee on first purchase</li>
                <li>✓ Monthly plans can be cancelled anytime</li>
                <li>✓ Unused portion refunded on cancellation</li>
                <li>✓ Typically processed within 5-7 business days</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Invoices List */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Recent Invoices</h3>
          <div className="space-y-3">
            {invoices.map((invoice, idx) => (
              <motion.div
                key={invoice.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <FiDownload className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-800 dark:text-gray-100">{invoice.description}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{invoice.id} • {invoice.date}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-semibold text-gray-800 dark:text-gray-100">{invoice.amount}</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      invoice.status === 'paid' 
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}>
                      {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                    </span>
                    <button
                      onClick={() => setSelectedInvoice(invoice)}
                      className="text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 p-2 rounded-lg transition-colors"
                      title="Request Refund"
                    >
                      <FiArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Refund Request Modal */}
        {selectedInvoice && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-6 rounded-xl bg-gray-50 dark:bg-gray-800/50 border-2 border-blue-200 dark:border-blue-800/50 mb-8"
          >
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-gray-800 dark:text-gray-100">Request Refund</h4>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                <FiXCircle className="w-5 h-5" />
              </button>
            </div>

            {!refundSubmitted ? (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Invoice: <span className="font-medium text-gray-800 dark:text-gray-100">{selectedInvoice.id}</span> - {selectedInvoice.description}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Amount: <span className="font-medium text-gray-800 dark:text-gray-100">{selectedInvoice.amount}</span>
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Reason for Refund</label>
                  <select
                    value={refundReason}
                    onChange={(e) => setRefundReason(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a reason...</option>
                    <option value="no-longer-needed">No longer needed</option>
                    <option value="wrong-plan">Wrong plan purchased</option>
                    <option value="technical-issues">Technical issues</option>
                    <option value="duplicate-charge">Duplicate charge</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Additional Details (Optional)</label>
                  <textarea
                    value={refundRequest}
                    onChange={(e) => setRefundRequest(e.target.value)}
                    placeholder="Tell us more about your refund request..."
                    rows={3}
                    className="w-full px-4 py-2 rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={handleRequestRefund}
                    disabled={!refundReason.trim()}
                    className="flex-1 px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Submit Refund Request
                  </button>
                  <button
                    onClick={() => setSelectedInvoice(null)}
                    className="flex-1 px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-medium transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-4"
              >
                <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-3">
                  <FiCheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <p className="font-semibold text-gray-800 dark:text-gray-100 mb-1">Refund Request Submitted!</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">We'll respond within 5-7 business days</p>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Billing Support */}
        <div className="p-4 rounded-xl bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800/50">
          <div className="flex gap-3">
            <FiAlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-yellow-900 dark:text-yellow-300 mb-2">Having Billing Issues?</h4>
              <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-3">
                Contact our billing support team available 24/7
              </p>
              <a
                href="mailto:billing@citricloud.com"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-yellow-600 hover:bg-yellow-700 text-white text-sm font-medium transition-colors"
              >
                <FiMail className="w-4 h-4" />
                Email: billing@citricloud.com
              </a>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Save Button */}
      <div className="flex items-center justify-between">
        {saveStatus !== 'idle' && (
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm ${saveStatus === 'success' ? 'bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400' : 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400'}`}>
            {saveStatus === 'success' ? <FiCheckCircle /> : <FiXCircle />}
            <span>{saveStatus === 'success' ? 'Settings saved successfully' : 'Failed to save settings'}</span>
          </div>
        )}
        <button
          onClick={handleSavePreferences}
          className="ml-auto glass-button px-8 py-3 rounded-xl text-white font-medium"
        >
          Save Preferences
        </button>
      </div>
    </DashboardLayout>
  );
}
