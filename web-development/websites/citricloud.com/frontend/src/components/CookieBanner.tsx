import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiX, FiCheck } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) setVisible(true);
  }, []);

  if (!visible) return null;

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    localStorage.setItem('cookie-consent-date', new Date().toISOString());
    setVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem('cookie-consent', 'declined');
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6"
        >
          <div className="max-w-4xl mx-auto glass-card rounded-2xl bg-gradient-to-r from-white/95 to-white/90 dark:from-gray-900/95 dark:to-gray-900/90 border border-white/30 dark:border-gray-700/30 shadow-2xl backdrop-blur-xl">
            <div className="p-6 sm:p-8">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                      <FiCheck className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Cookie Preferences</h3>
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                      We use cookies to enhance your experience, analyze traffic, and for essential site functionality. 
                      {' '}
                      <button
                        onClick={() => setShowDetails(!showDetails)}
                        className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                      >
                        Learn more
                      </button>
                      {' '}or visit our{' '}
                      <Link to="/cookies" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
                        cookie policy
                      </Link>
                      .
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleDecline}
                  className="flex-shrink-0 ml-4 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              <AnimatePresence>
                {showDetails && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="mb-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Essential</h4>
                        <p className="text-gray-600 dark:text-gray-400">Required for site functionality, security, and authentication.</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Analytical</h4>
                        <p className="text-gray-600 dark:text-gray-400">Help us understand how you use our site to improve experience.</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Preferences</h4>
                        <p className="text-gray-600 dark:text-gray-400">Remember your choices for a personalized experience.</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <button
                  onClick={handleAccept}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg"
                >
                  Accept All
                </button>
                <button
                  onClick={handleDecline}
                  className="px-6 py-2.5 rounded-xl bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-medium transition-all duration-200"
                >
                  Decline
                </button>
                <Link
                  to="/cookies"
                  className="px-6 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 font-medium transition-all duration-200"
                >
                  Cookie Settings
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
