import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiTrendingUp, FiShield, FiZap, FiCloud, FiCheck, FiUsers, FiLayout, FiAlertCircle, FiEye, FiEyeOff } from 'react-icons/fi';
import { authAPI } from '../lib/api';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';
import BrandLogo from '../components/BrandLogo';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [error, setError] = useState('');
  const [requires2FA, setRequires2FA] = useState(false);
  const [tempToken, setTempToken] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState(false);
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setIsDarkMode(isDark);
    const observer = new MutationObserver(() => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authAPI.login(email, password);
      const data = response.data;

      // Check if 2FA is required
      if (data.requires_2fa) {
        setRequires2FA(true);
        setTempToken(data.temp_token);
        setLoading(false);
        toast.success('Please enter your 2FA code');
        return;
      }

      // Normal login without 2FA
      const { access_token, refresh_token } = data;
      completeLogin(access_token, refresh_token);
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Login failed';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handle2FASubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authAPI.verify2FA(tempToken, twoFactorCode);
      const { access_token, refresh_token } = response.data;
      completeLogin(access_token, refresh_token);
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Invalid verification code';
      setError(errorMessage);
      toast.error(errorMessage);
      setTwoFactorCode('');
    } finally {
      setLoading(false);
    }
  };

  const completeLogin = (access_token: string, refresh_token: string) => {
    // Decode token to get user info (simple JWT decode)
    const payload = JSON.parse(atob(access_token.split('.')[1]));
    const user = {
      id: payload.sub,
      email: payload.email,
      username: payload.email.split('@')[0],
      role: payload.role,
      is_active: true,
    };

    // Persist in store/localStorage
    setAuth(user, access_token, refresh_token);
    // Additionally set cross-subdomain cookies for SSO
    const maxAgeAccess = 60 * 60 * 0.5; // 30 minutes
    const maxAgeRefresh = 60 * 60 * 24 * 7; // 7 days
    const domain = '.citricloud.com';
    document.cookie = `access_token=${access_token}; Path=/; Max-Age=${maxAgeAccess}; Domain=${domain}; Secure; SameSite=None`;
    document.cookie = `refresh_token=${refresh_token}; Path=/; Max-Age=${maxAgeRefresh}; Domain=${domain}; Secure; SameSite=None`;
    
    toast.success('Welcome back!');
    navigate('/profile');
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotPasswordEmail) {
      toast.error('Please enter your email');
      return;
    }

    setForgotPasswordLoading(true);
    try {
      await authAPI.forgotPassword(forgotPasswordEmail);
      setForgotPasswordSuccess(true);
      toast.success('Password reset link sent! Check your email.');
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Failed to send reset link';
      toast.error(errorMessage);
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  const closeForgotPasswordModal = () => {
    setShowForgotPasswordModal(false);
    setForgotPasswordEmail('');
    setForgotPasswordSuccess(false);
    setForgotPasswordLoading(false);
  };

  const features = [
    {
      icon: FiLayout,
      title: 'Unified Dashboard',
      description: 'Access all your tools from one place'
    },
    {
      icon: FiUsers,
      title: 'Team Collaboration',
      description: 'Work seamlessly with your team'
    },
    {
      icon: FiCloud,
      title: 'Cloud Storage',
      description: 'Secure file storage and sharing'
    },
    {
      icon: FiShield,
      title: 'Enterprise Security',
      description: 'Bank-level encryption & protection'
    },
    {
      icon: FiZap,
      title: 'Lightning Fast',
      description: 'Optimized performance & speed'
    },
    {
      icon: FiTrendingUp,
      title: 'Analytics & Insights',
      description: 'Real-time data and reporting'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100 dark:from-gray-950 dark:via-slate-950 dark:to-black flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-6xl">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left side - Features */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="hidden lg:block"
          >
            <Link to="/" className="inline-flex items-center mb-8">
              <img 
                src={isDarkMode ? "/darkmode-cc-logo.svg" : "/lightmode-cc-logo.svg"} 
                alt="CITRICLOUD" 
                className="h-14 w-auto"
              />
            </Link>
            
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Welcome Back to
              <span className="bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent"> CITRICLOUD</span>
            </h1>
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-8">
              Sign in to access your comprehensive business management platform
            </p>

            <div className="grid grid-cols-2 gap-4 mb-8">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl p-4 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg"
                  >
                    <Icon className="w-8 h-8 text-primary-600 dark:text-primary-400 mb-3" />
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {feature.description}
                    </p>
                  </motion.div>
                );
              })}
            </div>

            <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
              <FiCheck className="w-6 h-6 text-green-600 dark:text-green-400" />
              <span className="font-medium">Trusted by 50,000+ professionals worldwide</span>
            </div>
          </motion.div>

          {/* Right side - Login Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full"
          >
            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl p-8 sm:p-10 rounded-3xl border border-gray-200/50 dark:border-gray-700/50 shadow-2xl">
              <Link to="/" className="flex lg:hidden items-center justify-center mb-8">
                <img 
                  src={isDarkMode ? "/darkmode-cc-logo.svg" : "/lightmode-cc-logo.svg"} 
                  alt="CITRICLOUD" 
                  className="h-14 w-auto"
                />
              </Link>

              <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 dark:text-white mb-2">
                Welcome Back
              </h2>
              <p className="text-center text-gray-700 dark:text-gray-300 mb-8">
                Sign in to your account to continue
              </p>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 flex items-start gap-3"
                >
                  <FiAlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-red-900 dark:text-red-200">{requires2FA ? 'Invalid Code' : 'Invalid Credentials'}</p>
                    <p className="text-sm text-red-800 dark:text-red-300 mt-1">{error}</p>
                  </div>
                </motion.div>
              )}

              {requires2FA ? (
                <form onSubmit={handle2FASubmit} className="space-y-6">
                  <div className="text-center mb-6">
                    <FiShield className="w-16 h-16 text-primary-600 dark:text-primary-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      Two-Factor Authentication
                    </h3>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Enter the 6-digit code from your authenticator app
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                      Verification Code
                    </label>
                    <input
                      type="text"
                      value={twoFactorCode}
                      onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white text-center text-2xl tracking-widest placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-transparent transition-all"
                      placeholder="000000"
                      maxLength={6}
                      autoFocus
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading || twoFactorCode.length !== 6}
                    className="w-full py-3 px-4 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {loading ? 'Verifying...' : 'Verify & Continue'}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setRequires2FA(false);
                      setTempToken('');
                      setTwoFactorCode('');
                      setError('');
                    }}
                    className="w-full py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                  >
                    ← Back to login
                  </button>
                </form>
              ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-transparent transition-all"
                      placeholder="you@example.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-12 pr-12 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-transparent transition-all"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center text-gray-700 dark:text-gray-300">
                    <input type="checkbox" className="mr-2 rounded" />
                    Remember me
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotPasswordModal(true);
                      setForgotPasswordEmail(email);
                    }}
                    className="text-primary-600 dark:text-primary-400 hover:underline font-medium"
                  >
                    Forgot password?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </button>
              </form>
              )}

              <p className="mt-6 text-center text-gray-700 dark:text-gray-300">
                Don't have an account?{' '}
                <a href="https://my.citricloud.com/register" className="text-primary-600 dark:text-primary-400 font-semibold hover:underline">
                  Sign up
                </a>
              </p>

              <div className="mt-4 text-center">
                <a href="https://citricloud.com" className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  ← Back to website
                </a>
              </div>
            </div>

            {/* Mobile Features - Show on small screens */}
            <div className="lg:hidden mt-8 grid grid-cols-2 gap-4">
              {features.slice(0, 4).map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                    className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl p-4 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg text-center"
                  >
                    <Icon className="w-8 h-8 text-primary-600 dark:text-primary-400 mx-auto mb-2" />
                    <h3 className="font-semibold text-sm text-gray-900 dark:text-white mb-1">
                      {feature.title}
                    </h3>
                    <p className="text-xs text-gray-700 dark:text-gray-300">
                      {feature.description}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPasswordModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6"
          >
            {!forgotPasswordSuccess ? (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Forgot Password
                  </h2>
                  <button
                    onClick={closeForgotPasswordModal}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  >
                    <FiAlertCircle className="w-6 h-6" />
                  </button>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Enter your email address and we'll send you a link to reset your password.
                </p>
                <form onSubmit={handleForgotPassword}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        value={forgotPasswordEmail}
                        onChange={(e) => setForgotPasswordEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="your@email.com"
                        required
                      />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={closeForgotPasswordModal}
                      className="flex-1 py-3 px-4 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={forgotPasswordLoading}
                      className="flex-1 py-3 px-4 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {forgotPasswordLoading ? 'Sending...' : 'Send Reset Link'}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <>
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FiCheck className="w-8 h-8 text-green-600 dark:text-green-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Check Your Email
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    If an account exists with <strong>{forgotPasswordEmail}</strong>, you will receive a password reset link shortly.
                  </p>
                  <button
                    onClick={closeForgotPasswordModal}
                    className="w-full py-3 px-4 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all"
                  >
                    Close
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}
