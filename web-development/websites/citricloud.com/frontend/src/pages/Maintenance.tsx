import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Construction, Wrench, Clock, Home, RefreshCw, AlertCircle, Lock } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
// Standalone Maintenance page without global header/footer

export default function Maintenance() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const isAuthorized = password === 'FBkolik07';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100 dark:from-gray-950 dark:via-slate-950 dark:to-black relative overflow-hidden">
      {/* Standalone maintenance view without global navbar/footer */}
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-64 h-64 bg-orange-400/30 dark:bg-orange-500/20 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-xl opacity-60 animate-blob"></div>
        <div className="absolute bottom-20 right-20 w-64 h-64 bg-yellow-400/30 dark:bg-yellow-500/20 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-xl opacity-60 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-amber-400/30 dark:bg-amber-500/20 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-xl opacity-60 animate-blob animation-delay-4000"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl w-full text-center">
          {/* Animated Icon */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="w-32 h-32 glass-button rounded-full flex items-center justify-center shadow-2xl animate-pulse">
                <Construction className="w-16 h-16 text-white" />
              </div>
              <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center animate-bounce">
                <Wrench className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          {/* Heading */}
          <h1 className="text-5xl md:text-7xl font-black text-gray-900 dark:text-white mb-4">
            Under Maintenance
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            We’re performing scheduled maintenance to enhance performance, security, and reliability across all services.
          </p>

          {/* Status Card */}
          <div className="max-w-3xl mx-auto mb-12">
            <div className="glass-card rounded-2xl p-8 shadow-2xl">
              {/* Status Info */}
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
                <span className="text-lg font-semibold text-gray-900 dark:text-white">
                  Maintenance in Progress
                </span>
              </div>

              {/* Details */}
              <div className="space-y-4 text-left">
                <div className="flex items-start gap-4 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl">
                  <Clock className="w-6 h-6 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                      Expected Duration
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      Approximately 2–4 hours (most features remain available)
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                  <AlertCircle className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                      What We're Doing
                    </h3>
                    <ul className="text-gray-600 dark:text-gray-400 text-sm space-y-1">
                      <li>• Upgrading server infrastructure</li>
                      <li>• Performance improvements and cache tuning</li>
                      <li>• Security patches and dependency updates</li>
                      <li>• Database optimization and backups</li>
                    </ul>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                  <Wrench className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                      Coming Soon
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      Faster load times, new features in Workspace, and improved API reliability
                    </p>
                  </div>
                </div>
              </div>
                <div className="flex items-start gap-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                  <AlertCircle className="w-6 h-6 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                      Impact & Availability
                    </h3>
                    <ul className="text-gray-600 dark:text-gray-400 text-sm space-y-1">
                      <li>• Static pages remain available</li>
                      <li>• API endpoints may be intermittently unavailable</li>
                      <li>• Workspace apps may be read-only temporarily</li>
                    </ul>
                  </div>
                </div>

            </div>
          </div>

          {/* Progress Bar */}
          <div className="max-w-lg mx-auto mb-8">
            <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
              <div className="bg-gradient-to-r from-orange-500 to-amber-500 h-full rounded-full animate-progress" style={{ width: '65%' }}>
                <div className="h-full w-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Maintenance Progress: ~65% Complete
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <button
              onClick={() => window.location.reload()}
              className="flex items-center gap-2 px-8 py-4 glass-button text-white font-semibold rounded-xl shadow-lg transform hover:scale-105 transition-all"
            >
              <RefreshCw className="w-5 h-5" />
              Check Again
            </button>
            
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 px-8 py-4 glass-card text-gray-900 dark:text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
            >
              <Home className="w-5 h-5" />
              Go Home
            </button>
          </div>

          {/* Developer Password Gate */}
          <div className="max-w-md mx-auto mb-8 glass-card rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-3">
              <Lock className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              <div className="font-semibold text-gray-900 dark:text-white">Developer Access</div>
            </div>
            <div className="flex gap-3">
              <input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="flex-1 px-4 py-2 rounded-xl glass-card border border-white/30 dark:border-gray-700/30 focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none text-gray-900 dark:text-white"
              />
              <div className={`px-3 py-2 rounded-xl text-xs font-semibold ${isAuthorized ? 'bg-green-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}>
                {isAuthorized ? 'Unlocked' : 'Locked'}
              </div>
            </div>
          </div>

          {isAuthorized && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto mb-8">
              <div className="glass-card rounded-2xl p-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Frontend</h3>
                <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                  <li>• SPA build path: <code className="text-xs">/frontend/dist</code></li>
                  <li>• Routes: <code className="text-xs">/landing, /coming-soon, /maintenance</code></li>
                  <li>• Assets served under: <code className="text-xs">/assets/</code></li>
                </ul>
              </div>
              <div className="glass-card rounded-2xl p-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Backend</h3>
                <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                  <li>• API upstream: <code className="text-xs">backend_api (127.0.0.1:8000)</code></li>
                  <li>• Key endpoints: <code className="text-xs">/api/v1/activity/logs, /api/v1/activity/logs/public</code></li>
                  <li>• Auth headers: <code className="text-xs">Authorization from access_token cookie</code></li>
                </ul>
              </div>
            </div>
          )}

          {/* Additional Info */}
          <div className="max-w-2xl mx-auto">
            <div className="bg-blue-100 dark:bg-blue-900/30 border-2 border-blue-500 dark:border-blue-700 rounded-xl p-6">
              <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
                Need Immediate Help?
              </h3>
              <p className="text-blue-800 dark:text-blue-400 text-sm mb-4">
                For urgent matters, please contact our support team
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <a
                  href="mailto:support@citricloud.com"
                  className="text-sm font-medium text-blue-700 dark:text-blue-300 hover:underline"
                >
                  support@citricloud.com
                </a>
                <span className="hidden sm:inline text-blue-700 dark:text-blue-300">•</span>
                <a
                  href="/status"
                  className="text-sm font-medium text-blue-700 dark:text-blue-300 hover:underline"
                >
                  View Status Page
                </a>
              </div>
              <div className="text-xs text-blue-700 dark:text-blue-300 mt-4">We’ll be back shortly. Thanks for your patience!</div>
            </div>
          </div>

          {/* Footer Note */}
          <p className="mt-12 text-sm text-gray-500 dark:text-gray-400">
            We apologize for any inconvenience. Thank you for your patience!
          </p>
        </div>
      </div>
  {/* Footer removed for standalone layout */}

      <style>{`
        @keyframes progress {
          0% { width: 0%; }
          100% { width: 65%; }
        }
        
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        .animate-progress {
          animation: progress 3s ease-out;
        }
        
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }

        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
