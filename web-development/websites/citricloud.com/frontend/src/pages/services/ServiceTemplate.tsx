import Navbar from '../../components/Navbar';
import Topbar from '../../components/Topbar';
import Footer from '../../components/Footer';
import { motion } from 'framer-motion';
import { ReactNode } from 'react';

export default function ServiceTemplate({
  title,
  subtitle,
  description,
  bullets,
  icon,
}: {
  title: string;
  subtitle?: string;
  description: string;
  bullets?: string[];
  icon?: ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100 dark:from-gray-950 dark:via-slate-950 dark:to-black">
      <Topbar />
      <Navbar />
      <main className="flex-1">
        <section className="container mx-auto px-4 sm:px-6 pt-40 sm:pt-44 pb-12 max-w-7xl">
          <div className="flex items-start gap-4">
            {icon && (
              <div className="w-14 h-14 rounded-xl bg-primary-500/10 dark:bg-primary-500/20 text-primary-600 dark:text-primary-400 flex items-center justify-center">
                {icon}
              </div>
            )}
            <div>
              <motion.h1 initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                {title}
              </motion.h1>
              {subtitle && <p className="text-lg text-gray-700 dark:text-gray-300">{subtitle}</p>}
            </div>
          </div>
          <p className="mt-8 text-lg sm:text-xl text-gray-700 dark:text-gray-200 max-w-3xl leading-relaxed">{description}</p>
        </section>

        {bullets && bullets.length > 0 && (
          <section className="container mx-auto px-4 sm:px-6 pb-12 max-w-7xl">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-6">What You Get</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {bullets.map((b, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }} className="glass-card p-5 rounded-xl bg-white/90 dark:bg-gray-900/90 border border-white/30 dark:border-gray-700/30">
                  <div className="font-semibold text-gray-900 dark:text-white">{b}</div>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        <section className="bg-gray-50 dark:bg-gray-900/50 py-12">
          <div className="container mx-auto px-4 sm:px-6 text-center max-w-7xl">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Ready to get started?</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-6">Talk to our solutions team to tailor this service to your needs.</p>
            <a href="https://contact.citricloud.com">
              <button className="px-6 py-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-medium shadow-md transition-all">Contact Us</button>
            </a>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
