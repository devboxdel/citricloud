import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiSend, FiCheck } from 'react-icons/fi';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setStatus('loading');
    // Simulate API call
    setTimeout(() => {
      setStatus('success');
      setEmail('');
      setTimeout(() => setStatus('idle'), 3000);
    }, 1500);
  };

  return (
    <section className="relative py-12 overflow-hidden">
      {/* Immersive Gradient Background with Enhanced Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 dark:from-primary-900 dark:via-gray-900 dark:to-black">
        {/* Enhanced Abstract Shapes with More Movement */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-30">
          <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-white blur-3xl mix-blend-overlay animate-pulse" />
          <div className="absolute top-1/2 -right-12 w-80 h-80 rounded-full bg-primary-400 blur-3xl mix-blend-overlay animate-pulse" style={{ animationDelay: '1s', animationDuration: '3s' }} />
          <div className="absolute -bottom-24 left-1/4 w-96 h-96 rounded-full bg-indigo-500 blur-3xl mix-blend-overlay animate-pulse" style={{ animationDelay: '2s', animationDuration: '4s' }} />
        </div>
        
        {/* Enhanced Grid Pattern */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.15] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
        
        {/* Animated Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div 
          className="max-w-6xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {/* Horizontal Layout: Text on Left, Form on Right */}
          <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
            {/* Left Side: Text Content */}
            <div className="flex-1 text-center lg:text-left">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold mb-3 text-white tracking-tight leading-tight">
                Level Up Your Cloud Infrastructure
              </h2>
              <p className="text-base md:text-lg text-primary-100/90 leading-relaxed">
                Get weekly insights on scaling, security, and performance. 
                Join our community of engineering leaders.
              </p>
            </div>

            {/* Right Side: Form */}
            <div className="flex-1 w-full lg:max-w-md">
              <motion.form
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                onSubmit={handleSubmit}
                className="space-y-3"
              >
                <div className="relative group">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your work email"
                    className="w-full px-6 py-4 rounded-2xl bg-gray-900/90 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/30 focus:bg-gray-900 focus:border-white/30 transition-all backdrop-blur-xl shadow-xl group-hover:border-white/30 text-sm"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={status === 'loading' || status === 'success'}
                  className={`w-full px-6 py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 shadow-xl hover:shadow-2xl text-sm
                    ${status === 'success' 
                      ? 'bg-green-500 text-white cursor-default' 
                      : 'bg-white text-primary-900 hover:bg-gray-100 hover:scale-[1.02] active:scale-[0.98]'
                    }`}
                >
                  {status === 'loading' ? (
                    <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : status === 'success' ? (
                    <>
                      <FiCheck className="w-5 h-5" />
                      Joined!
                    </>
                  ) : (
                    <>
                      Subscribe
                      <FiSend className="w-5 h-5" />
                    </>
                  )}
                </button>
                
                <p className="text-xs text-primary-200/70 text-center">
                  Unsubscribe at any time. Read our <a href="/privacy" className="underline hover:text-white transition-colors">Privacy Policy</a>.
                </p>
              </motion.form>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
