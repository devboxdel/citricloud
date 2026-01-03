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
    <section className="relative py-16 overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 dark:from-primary-900 dark:via-gray-900 dark:to-black">
        {/* Abstract Shapes */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20">
          <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-white blur-3xl mix-blend-overlay animate-pulse" />
          <div className="absolute top-1/2 right-0 w-64 h-64 rounded-full bg-primary-400 blur-3xl mix-blend-overlay" />
          <div className="absolute -bottom-32 left-1/3 w-80 h-80 rounded-full bg-indigo-500 blur-3xl mix-blend-overlay" />
        </div>
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10 bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block py-1 px-3 rounded-full bg-white/10 border border-white/20 text-white/90 text-xs font-medium mb-4 backdrop-blur-sm">
              ✨ Join 10,000+ Developers
            </span>
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4 text-white tracking-tight">
              Level Up Your Cloud Infrastructure
            </h2>
            <p className="text-base md:text-lg text-primary-100 mb-8 max-w-xl mx-auto leading-relaxed">
              Get weekly insights on scaling, security, and performance. 
              <br className="hidden md:block" />
              Join our community of engineering leaders.
            </p>
          </motion.div>

          <motion.form
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto relative"
          >
            <div className="flex-grow relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your work email"
                className="relative w-full px-5 py-3 rounded-full bg-gray-900/90 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/20 focus:bg-gray-900 transition-all backdrop-blur-xl shadow-xl text-sm"
                required
              />
            </div>
            <button
              type="submit"
              disabled={status === 'loading' || status === 'success'}
              className={`relative px-6 py-3 rounded-full font-bold transition-all flex items-center justify-center gap-2 min-w-[140px] shadow-xl hover:shadow-2xl text-sm
                ${status === 'success' 
                  ? 'bg-green-500 text-white cursor-default' 
                  : 'bg-white text-primary-900 hover:bg-gray-100 active:scale-95'
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
          </motion.form>
          
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="mt-6 text-sm text-primary-200/80"
          >
            Unsubscribe at any time. Read our <a href="/privacy" className="underline hover:text-white transition-colors">Privacy Policy</a>.
          </motion.p>
        </div>
      </div>
    </section>
  );
}
