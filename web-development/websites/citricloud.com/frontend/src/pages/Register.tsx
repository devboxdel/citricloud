import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiUser, FiPhone, FiTrendingUp, FiShield, FiZap, FiCloud, FiCheck, FiUsers, FiLayout, FiFileText, FiShoppingCart } from 'react-icons/fi';
import { authAPI } from '../lib/api';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    full_name: '',
    phone: '',
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await authAPI.register(formData);
      
      // Auto login after registration
      const loginResponse = await authAPI.login(formData.email, formData.password);
      const { access_token, refresh_token } = loginResponse.data;

      const payload = JSON.parse(atob(access_token.split('.')[1]));
      const user = {
        id: payload.sub,
        email: payload.email,
        username: formData.username,
        role: payload.role,
        is_active: true,
      };

      setAuth(user, access_token, refresh_token);
      toast.success('Account created successfully!');
      navigate('/profile');
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const features = [
    { icon: <FiLayout className="w-5 h-5" />, title: 'Main Dashboard', desc: 'Centralized analytics and insights' },
    { icon: <FiUsers className="w-5 h-5" />, title: 'CRM System', desc: 'Comprehensive customer management' },
    { icon: <FiFileText className="w-5 h-5" />, title: 'CMS Platform', desc: 'Full-featured content management' },
    { icon: <FiShoppingCart className="w-5 h-5" />, title: 'ERP Solution', desc: 'Complete enterprise resources' },
    { icon: <FiZap className="w-5 h-5" />, title: 'Lightning Fast', desc: 'Built with Vite and React' },
    { icon: <FiShield className="w-5 h-5" />, title: 'Secure & Reliable', desc: 'Enterprise-grade security' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100 dark:from-gray-950 dark:via-slate-950 dark:to-black">
      <div className="container mx-auto px-4 py-8 lg:py-12">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center max-w-7xl mx-auto">
          {/* Left Side - Features */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="hidden lg:block"
          >
            <Link to="/" className="inline-block mb-8">
              <img src="/lightmode.svg?v=8" alt="CITRICLOUD" className="h-6 w-auto dark:hidden" />
              <img src="/darkmode.svg?v=8" alt="CITRICLOUD" className="h-6 w-auto hidden dark:inline" />
            </Link>

            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Welcome to <span className="text-primary-600 dark:text-primary-400">CITRICLOUD</span>
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
              Join thousands of businesses using our comprehensive platform for CRM, CMS, ERP, and more. 
              Get started today and transform your digital operations.
            </p>

            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-3 p-4 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50"
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">{feature.title}</h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{feature.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-primary-50 to-blue-50 dark:from-primary-900/20 dark:to-blue-900/20 border border-primary-200/50 dark:border-primary-800/50">
              <FiTrendingUp className="w-8 h-8 text-primary-600 dark:text-primary-400" />
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">Join 10,000+ users worldwide</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Trusted by businesses of all sizes</p>
              </div>
            </div>
          </motion.div>

          {/* Right Side - Registration Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full"
          >
            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 sm:p-8 lg:p-10">
              <Link to="/" className="flex items-center justify-center mb-6 lg:hidden">
                <img src="/lightmode.svg?v=8" alt="CITRICLOUD" className="h-5 sm:h-6 w-auto dark:hidden" />
                <img src="/darkmode.svg?v=8" alt="CITRICLOUD" className="h-5 sm:h-6 w-auto hidden dark:inline" />
              </Link>

              <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 dark:text-white mb-2">
                Create Account
              </h2>
              <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
                Join CITRICLOUD and start building today
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email Address *
                    </label>
                    <div className="relative">
                      <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-4 pl-12 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 transition-all"
                        placeholder="you@example.com"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Username *
                    </label>
                    <div className="relative">
                      <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                      <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        className="w-full px-4 pl-12 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 transition-all"
                        placeholder="johndoe"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                    <input
                      type="text"
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleChange}
                      className="w-full px-4 pl-12 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 transition-all"
                      placeholder="John Doe"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Phone (Optional)
                  </label>
                  <div className="relative">
                    <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 pl-12 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 transition-all"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Password *
                  </label>
                  <div className="relative">
                    <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full px-4 pl-12 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 transition-all"
                      placeholder="••••••••"
                      required
                      minLength={8}
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">Must be at least 8 characters</p>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Creating account...' : 'Create Account'}
                  </button>
                </div>
              </form>

              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <p className="text-center text-gray-600 dark:text-gray-400 text-sm">
                  Already have an account?{' '}
                  <a href="https://my.citricloud.com/login" className="text-primary-600 dark:text-primary-400 font-semibold hover:underline">
                    Sign in
                  </a>
                </p>
              </div>

              <div className="mt-6 lg:hidden">
                <div className="grid grid-cols-2 gap-3">
                  {features.slice(0, 4).map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 p-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                    >
                      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400">
                        {feature.icon}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-900 dark:text-white">{feature.title}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
