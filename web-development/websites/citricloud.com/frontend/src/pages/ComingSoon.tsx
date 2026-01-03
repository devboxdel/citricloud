import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Mail, Bell, ArrowRight, Sparkles, Rocket } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
// Standalone Coming Soon page without global header/footer

export default function ComingSoon() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  // Set launch date (example: 30 days from now)
  const launchDate = new Date();
  launchDate.setDate(launchDate.getDate() + 30);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = launchDate.getTime() - now;

      if (distance < 0) {
        clearInterval(timer);
        return;
      }

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000)
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
      // Here you would typically send the email to your backend
      console.log('Email submitted:', email);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100 dark:from-gray-950 dark:via-slate-950 dark:to-black relative overflow-hidden">
      {/* No global navbar/footer for focused Coming Soon view */}
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-400/30 dark:bg-purple-500/20 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-xl opacity-60 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-400/30 dark:bg-blue-500/20 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-xl opacity-60 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-indigo-400/30 dark:bg-indigo-500/20 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-xl opacity-60 animate-blob animation-delay-4000"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl w-full text-center">
          {/* Icon */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="w-24 h-24 glass-button rounded-full flex items-center justify-center shadow-2xl transform hover:scale-110 transition-transform">
                <Rocket className="w-12 h-12 text-white" />
              </div>
              <Sparkles className="absolute -top-2 -right-2 w-8 h-8 text-yellow-400 animate-pulse" />
            </div>
          </div>

          {/* Heading */}
          <h1 className="text-5xl md:text-7xl font-black text-gray-900 dark:text-white mb-4">
            Coming Soon
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            Something amazing is on the way! We’re launching new Workspace apps, an optimized Shop, richer Documentation, and a faster API.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto mb-10">
            <div className="glass-card rounded-xl p-5">
              <h3 className="font-bold text-gray-900 dark:text-white mb-1">What’s Coming</h3>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• New licensing and subscription flows</li>
                <li>• Improved cross-subdomain authentication</li>
                <li>• Daily logs automation and caching</li>
                <li>• UI polish across pages</li>
              </ul>
            </div>
            <div className="glass-card rounded-xl p-5">
              <h3 className="font-bold text-gray-900 dark:text-white mb-1">Timeline</h3>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• Week 1: Workspace updates</li>
                <li>• Week 2: Shop & Docs</li>
                <li>• Week 3: Backend APIs</li>
                <li>• Week 4: Final QA & Launch</li>
              </ul>
            </div>
          </div>

          {/* Countdown Timer */}
          <div className="grid grid-cols-4 gap-4 md:gap-8 max-w-3xl mx-auto mb-12">
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl p-4 md:p-6 shadow-xl border border-gray-200 dark:border-gray-700">
              <div className="text-4xl md:text-5xl font-bold text-primary-600 dark:text-primary-400 mb-2">
                {timeLeft.days}
              </div>
              <div className="text-sm md:text-base text-gray-600 dark:text-gray-400 font-medium">
                Days
              </div>
            </div>
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl p-4 md:p-6 shadow-xl border border-gray-200 dark:border-gray-700">
              <div className="text-4xl md:text-5xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                {timeLeft.hours}
              </div>
              <div className="text-sm md:text-base text-gray-600 dark:text-gray-400 font-medium">
                Hours
              </div>
            </div>
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl p-4 md:p-6 shadow-xl border border-gray-200 dark:border-gray-700">
              <div className="text-4xl md:text-5xl font-bold text-pink-600 dark:text-pink-400 mb-2">
                {timeLeft.minutes}
              </div>
              <div className="text-sm md:text-base text-gray-600 dark:text-gray-400 font-medium">
                Minutes
              </div>
            </div>
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl p-4 md:p-6 shadow-xl border border-gray-200 dark:border-gray-700">
              <div className="text-4xl md:text-5xl font-bold text-orange-600 dark:text-orange-400 mb-2">
                {timeLeft.seconds}
              </div>
              <div className="text-sm md:text-base text-gray-600 dark:text-gray-400 font-medium">
                Seconds
              </div>
            </div>
          </div>

          {/* Email Notification Form */}
          <div className="max-w-md mx-auto mb-8">
            {!submitted ? (
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-12 pr-4 py-4 rounded-xl glass-card border border-white/30 dark:border-gray-700/30 focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none text-gray-900 dark:text-white"
                  />
                </div>
                <button
                  type="submit"
                  className="px-8 py-4 glass-button text-white font-semibold rounded-xl shadow-lg transform hover:scale-105 transition-all flex items-center justify-center gap-2"
                >
                  <Bell className="w-5 h-5" />
                  Notify Me
                </button>
              </form>
            ) : (
              <div className="bg-green-100 dark:bg-green-900/30 border-2 border-green-500 dark:border-green-700 rounded-xl p-6">
                <div className="flex items-center justify-center gap-2 text-green-800 dark:text-green-300 font-semibold">
                  <Bell className="w-5 h-5" />
                  <span>Thanks! We'll notify you when we launch.</span>
                </div>
              </div>
            )}
          </div>

          {/* Features Preview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-12 px-4 sm:px-6 lg:px-8">
            <div className="glass-card rounded-xl p-6 shadow-lg transform hover:scale-105 transition-transform">
              <div className="w-12 h-12 glass-card rounded-lg flex items-center justify-center mb-4 mx-auto">
                <Sparkles className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                Modern Design
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Beautiful, intuitive interface with glass morphism effects
              </p>
            </div>
            
            <div className="glass-card rounded-xl p-6 shadow-lg transform hover:scale-105 transition-transform">
              <div className="w-12 h-12 glass-card rounded-lg flex items-center justify-center mb-4 mx-auto">
                <Rocket className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                Fast Performance
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Lightning-fast load times and smooth interactions
              </p>
            </div>
            
            <div className="glass-card rounded-xl p-6 shadow-lg transform hover:scale-105 transition-transform">
              <div className="w-12 h-12 glass-card rounded-lg flex items-center justify-center mb-4 mx-auto">
                <Clock className="w-6 h-6 text-pink-600 dark:text-pink-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                Always Available
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                24/7 uptime with reliable cloud infrastructure
              </p>
            </div>
          </div>

          {/* Back Button */}
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 px-6 py-3 glass-card text-gray-900 dark:text-white rounded-xl hover:shadow-xl transition-all shadow-lg"
          >
            Back to Home
            <ArrowRight className="w-4 h-4" />
          </button>
          <div className="mt-8 text-xs text-gray-500 dark:text-gray-400">We’ll email you once we launch. No spam.</div>
        </div>
      </div>
      {/* Footer removed for standalone layout */}
    </div>
  );
}
