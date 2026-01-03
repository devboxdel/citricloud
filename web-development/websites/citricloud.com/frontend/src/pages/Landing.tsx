import { useNavigate } from 'react-router-dom';
import { 
  Cloud, 
  Zap, 
  Shield, 
  Users, 
  TrendingUp, 
  CheckCircle, 
  ArrowRight, 
  Star,
  Play,
  Smartphone,
  Globe,
  Lock,
  Sparkles
} from 'lucide-react';
import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
// Standalone landing page without global header/footer

export default function Landing() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');

  const handleGetStarted = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/register');
  };

  const features = [
    {
      icon: <Cloud className="w-8 h-8" />,
      title: 'Cloud-Based',
      description: 'Access your data from anywhere, anytime with our secure cloud infrastructure'
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: 'Lightning Fast',
      description: 'Optimized performance ensures your applications run at peak speed'
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Enterprise Security',
      description: 'Bank-level encryption and security measures to protect your data'
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: 'Team Collaboration',
      description: 'Work seamlessly with your team with real-time collaboration tools'
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: 'Analytics & Insights',
      description: 'Powerful analytics to help you make data-driven decisions'
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: 'Global CDN',
      description: 'Lightning-fast content delivery with our worldwide network'
    }
  ];

  const benefits = [
    'No credit card required',
    'Free 30-day trial',
    '99.9% uptime guarantee',
    '24/7 customer support'
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'CEO, TechStart',
      content: 'CITRICLOUD transformed how we manage our business. The platform is intuitive and powerful.',
      rating: 5
    },
    {
      name: 'Michael Chen',
      role: 'Developer, InnovateLab',
      content: 'Best cloud platform I\'ve used. The API is clean and the documentation is excellent.',
      rating: 5
    },
    {
      name: 'Emily Rodriguez',
      role: 'Product Manager, DigitalCo',
      content: 'Our team productivity increased by 40% after switching to CITRICLOUD. Highly recommend!',
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100 dark:from-gray-950 dark:via-slate-950 dark:to-black">
      {/* Standalone hero without global navbar/footer */}
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100 dark:from-gray-950 dark:via-slate-950 dark:to-black">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-400/30 dark:bg-blue-500/20 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-60 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-400/30 dark:bg-purple-500/20 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-60 animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-400/30 dark:bg-indigo-500/20 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-60 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 glass-card rounded-full text-blue-600 dark:text-blue-400 font-medium text-sm mb-6">
                <Sparkles className="w-4 h-4" />
                <span>The Future of Cloud Computing</span>
              </div>
              
              <h1 className="text-5xl lg:text-7xl font-black text-gray-900 dark:text-white mb-6 leading-tight">
                Build Your
                <span className="block text-primary-600 dark:text-primary-400">
                  Dream Product
                </span>
              </h1>
              
              <p className="text-xl text-gray-700 dark:text-gray-300 mb-8 leading-relaxed">
                The all-in-one cloud platform for modern businesses. CRM, ERP, CMS, Projects, Email, and more—secure, fast, and scalable.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
                <div className="glass-card rounded-xl p-4">
                  <div className="text-sm font-semibold text-gray-800 dark:text-gray-200">CRM & Contacts</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Manage customers and pipelines</div>
                </div>
                <div className="glass-card rounded-xl p-4">
                  <div className="text-sm font-semibold text-gray-800 dark:text-gray-200">ERP & Finance</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Invoices, orders, analytics</div>
                </div>
                <div className="glass-card rounded-xl p-4">
                  <div className="text-sm font-semibold text-gray-800 dark:text-gray-200">Workspace Apps</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Email, Drive, Projects, Planner</div>
                </div>
                <div className="glass-card rounded-xl p-4">
                  <div className="text-sm font-semibold text-gray-800 dark:text-gray-200">CMS & Blog</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Content management made simple</div>
                </div>
                <div className="glass-card rounded-xl p-4">
                  <div className="text-sm font-semibold text-gray-800 dark:text-gray-200">Security</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">OAuth, cookies, rate-limits</div>
                </div>
                <div className="glass-card rounded-xl p-4">
                  <div className="text-sm font-semibold text-gray-800 dark:text-gray-200">API</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">FastAPI + React Query</div>
                </div>
              </div>

              <form onSubmit={handleGetStarted} className="flex flex-col sm:flex-row gap-4 mb-6">
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 px-6 py-4 rounded-xl glass-card border border-white/30 dark:border-gray-700/30 focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none text-gray-900 dark:text-white"
                  required
                />
                <button
                  type="submit"
                  className="px-8 py-4 glass-button text-white font-bold rounded-xl shadow-lg transform hover:scale-105 transition-all flex items-center justify-center gap-2"
                >
                  Get Started Free
                  <ArrowRight className="w-5 h-5" />
                </button>
              </form>

              <div className="flex flex-wrap gap-6">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-sm font-medium">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="relative glass-card rounded-3xl shadow-2xl p-8">
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl transform rotate-12">
                  <Cloud className="w-12 h-12 text-white" />
                </div>
                
                <div className="space-y-4">
                  <div className="h-48 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-2xl flex items-center justify-center">
                    <div className="grid grid-cols-3 gap-3 w-full px-6">
                      <div className="glass-card rounded-xl p-3 text-center">
                        <Smartphone className="w-6 h-6 mx-auto text-blue-600 dark:text-blue-400" />
                        <div className="text-xs mt-1 text-gray-700 dark:text-gray-300">Responsive</div>
                      </div>
                      <div className="glass-card rounded-xl p-3 text-center">
                        <Lock className="w-6 h-6 mx-auto text-purple-600 dark:text-purple-400" />
                        <div className="text-xs mt-1 text-gray-700 dark:text-gray-300">Secure</div>
                      </div>
                      <div className="glass-card rounded-xl p-3 text-center">
                        <Globe className="w-6 h-6 mx-auto text-pink-600 dark:text-pink-400" />
                        <div className="text-xs mt-1 text-gray-700 dark:text-gray-300">Global</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div className="h-20 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/30 rounded-xl"></div>
                    <div className="h-20 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-900/30 rounded-xl"></div>
                    <div className="h-20 bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-900/30 rounded-xl"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-black text-gray-900 dark:text-white mb-4">
              Everything You Need
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Powerful features designed to help your business grow and succeed
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="glass-card rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
              >
                <div className="w-16 h-16 glass-button rounded-xl flex items-center justify-center mb-6 text-white">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 glass-button">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
            <div>
              <div className="text-5xl font-black mb-2">10K+</div>
              <div className="text-blue-100">Active Users</div>
            </div>
            <div>
              <div className="text-5xl font-black mb-2">99.9%</div>
              <div className="text-blue-100">Uptime</div>
            </div>
            <div>
              <div className="text-5xl font-black mb-2">50+</div>
              <div className="text-blue-100">Countries</div>
            </div>
            <div>
              <div className="text-5xl font-black mb-2">24/7</div>
              <div className="text-blue-100">Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-black text-gray-900 dark:text-white mb-4">
              Loved by Teams Worldwide
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              See what our customers have to say
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="glass-card rounded-2xl p-8"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 dark:text-gray-300 mb-6 italic">
                  "{testimonial.content}"
                </p>
                <div>
                  <div className="font-bold text-gray-900 dark:text-white">
                    {testimonial.name}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {testimonial.role}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl lg:text-5xl font-black text-gray-900 dark:text-white mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-gray-700 dark:text-gray-300 mb-8">
            Join thousands of teams already using CITRICLOUD to power their business
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/register')}
              className="px-8 py-4 glass-button text-white font-bold rounded-xl shadow-lg transform hover:scale-105 transition-all"
            >
              Start Free Trial
            </button>
            <button
              onClick={() => navigate('/contact')}
              className="px-8 py-4 glass-card text-gray-900 dark:text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
            >
              Contact Sales
            </button>
          </div>
        </div>
      </section>

      {/* Standalone footer removed for immersive landing experience */}

      <style>{`
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
