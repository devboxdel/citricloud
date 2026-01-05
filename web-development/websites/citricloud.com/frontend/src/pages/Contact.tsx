import { motion } from 'framer-motion';
import { useState } from 'react';
import Topbar from '../components/Topbar';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { FiMail, FiPhone, FiMapPin, FiClock, FiMessageCircle, FiSend, FiUsers } from 'react-icons/fi';
import { useLanguage } from '../context/LanguageContext';

export default function ContactPage() {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate form submission
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100 dark:from-gray-950 dark:via-slate-950 dark:to-black">
      <Topbar />
      <Navbar />

      <section className="container mx-auto px-4 sm:px-6 pt-40 sm:pt-44 pb-16 max-w-7xl">
        <motion.h1 initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="text-5xl font-bold text-gray-800 dark:text-gray-100 mb-4">{t('get_in_touch')}</motion.h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-12 max-w-2xl">{t('contact_description')}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12 lg:mb-16">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }} className="glass-card p-6 rounded-xl bg-white/70 dark:bg-gray-900/70 border border-white/30 dark:border-gray-700/30 text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-primary-500/10 dark:bg-primary-500/20 text-primary-500 dark:text-primary-400 flex items-center justify-center">
              <FiMail className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-2">{t('email_us')}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">{t('email_address')}</p>
            <p className="text-sm text-gray-600 dark:text-gray-300">{t('sales_email')}</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6 rounded-xl bg-white/70 dark:bg-gray-900/70 border border-white/30 dark:border-gray-700/30 text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-primary-500/10 dark:bg-primary-500/20 text-primary-500 dark:text-primary-400 flex items-center justify-center">
              <FiPhone className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-2">{t('call_us')}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">+1 (555) 123-4567</p>
            <p className="text-sm text-gray-600 dark:text-gray-300">+44 20 7123 4567</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6 rounded-xl bg-white/70 dark:bg-gray-900/70 border border-white/30 dark:border-gray-700/30 text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-primary-500/10 dark:bg-primary-500/20 text-primary-500 dark:text-primary-400 flex items-center justify-center">
              <FiMapPin className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-2">{t('visit_us')}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">123 Cloud Street</p>
            <p className="text-sm text-gray-600 dark:text-gray-300">San Francisco, CA 94102</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-6 rounded-xl bg-white/70 dark:bg-gray-900/70 border border-white/30 dark:border-gray-700/30 text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-primary-500/10 dark:bg-primary-500/20 text-primary-500 dark:text-primary-400 flex items-center justify-center">
              <FiUsers className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-2">Join Community</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">Connect with our community</p>
            <a 
              href="https://community.citricloud.com"
              className="block w-full px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-lg transition-all"
            >
              Visit Community →
            </a>
          </motion.div>
        </div>

        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
          {/* Contact Form */}
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">{t('send_message')}</h2>
            <form onSubmit={handleSubmit} className="glass-card p-6 rounded-2xl bg-white/70 dark:bg-gray-900/70 border border-white/30 dark:border-gray-700/30">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('name')} *</label>
                  <input
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="glass-input w-full dark:bg-gray-800/60 dark:border-gray-700 dark:text-gray-100 dark:placeholder-gray-400"
                    placeholder={t('placeholder_name')}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email *</label>
                  <input
                    required
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="glass-input w-full dark:bg-gray-800/60 dark:border-gray-700 dark:text-gray-100 dark:placeholder-gray-400"
                    placeholder={t('placeholder_email')}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('subject')} *</label>
                  <input
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="glass-input w-full dark:bg-gray-800/60 dark:border-gray-700 dark:text-gray-100 dark:placeholder-gray-400"
                    placeholder={t('placeholder_subject')}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('message')} *</label>
                  <textarea
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="glass-input w-full min-h-[140px] dark:bg-gray-800/60 dark:border-gray-700 dark:text-gray-100 dark:placeholder-gray-400"
                    placeholder={t('placeholder_message')}
                  />
                </div>
                <button type="submit" className="glass-button w-full px-6 py-3 rounded-xl text-white font-medium flex items-center justify-center gap-2">
                  {submitted ? (
                    <><FiSend className="w-5 h-5" /> {t('message_sent')}</>
                  ) : (
                    <><FiSend className="w-5 h-5" /> {t('send')}</>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Additional Info */}
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">{t('other_ways')}</h2>
            <div className="space-y-4">
              <div className="glass-card p-5 rounded-xl bg-white/70 dark:bg-gray-900/70 border border-white/30 dark:border-gray-700/30">
                <div className="flex items-start gap-3">
                  <FiMessageCircle className="w-6 h-6 text-primary-500 dark:text-primary-400 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-1">{t('live_chat')}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{t('instant_help')}</p>
                    <button className="text-sm text-primary-600 dark:text-primary-400 font-medium hover:underline">{t('start_chat')}</button>
                  </div>
                </div>
              </div>
              <div className="glass-card p-5 rounded-xl bg-white/70 dark:bg-gray-900/70 border border-white/30 dark:border-gray-700/30">
                <div className="flex items-start gap-3">
                  <FiPhone className="w-6 h-6 text-primary-500 dark:text-primary-400 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-1">{t('schedule_call')}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{t('book_consultation')}</p>
                    <button className="text-sm text-primary-600 dark:text-primary-400 font-medium hover:underline">{t('book_now')}</button>
                  </div>
                </div>
              </div>
              <div className="glass-card p-5 rounded-xl bg-white/70 dark:bg-gray-900/70 border border-white/30 dark:border-gray-700/30">
                <div className="flex items-start gap-3">
                  <FiMail className="w-6 h-6 text-primary-500 dark:text-primary-400 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-1">{t('enterprise_sales')}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{t('custom_enterprise')}</p>
                    <a href="mailto:sales@citricloud.com" className="text-sm text-primary-600 dark:text-primary-400 font-medium hover:underline">{t('sales_email')} →</a>
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-card p-5 rounded-xl bg-primary-500/10 dark:bg-primary-500/20 border border-primary-500/30 dark:border-primary-400/30 mt-6">
              <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-2">{t('frequently_asked')}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{t('find_answers')}</p>
              <a href="https://citricloud.com/faq" className="text-sm text-primary-600 dark:text-primary-400 font-medium hover:underline">{t('visit_faq')}</a>
            </div>
          </div>
        </div>
      </section>

      {/* Offices & SLA */}
      <section className="container mx-auto px-4 sm:px-6 pb-16 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          <div className="glass-card p-6 rounded-2xl bg-white/70 dark:bg-gray-900/70 border border-white/30 dark:border-gray-700/30">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-3">{t('global_offices')}</h2>
            <ul className="space-y-2 text-gray-700 dark:text-gray-300">
              <li>{t('offices_address_sf')}</li>
              <li>{t('offices_address_london')}</li>
              <li>{t('offices_address_tokyo')}</li>
            </ul>
            <div className="aspect-video mt-4 rounded-xl overflow-hidden relative">
              <picture>
                <source
                  media="(prefers-color-scheme: dark)"
                  srcSet="https://images.unsplash.com/photo-1518682804931-6e3c7c06a1a1?q=80&w=2600&auto=format&fit=crop"
                />
                <img
                  src="https://images.unsplash.com/photo-1549880338-65ddcdfd017b?q=80&w=2600&auto=format&fit=crop"
                  alt="World Map"
                  className="w-full h-full object-cover brightness-100 contrast-105 dark:brightness-75 dark:contrast-110 dark:saturate-75"
                />
              </picture>
              <span className="absolute inset-0 bg-white/10 dark:bg-black/30" aria-hidden="true" />
            </div>
          </div>
          <div className="glass-card p-6 rounded-2xl bg-white/70 dark:bg-gray-900/70 border border-white/30 dark:border-gray-700/30">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-3">{t('support_sla')}</h2>
            <ul className="space-y-2 text-gray-700 dark:text-gray-300">
              <li>{t('critical_response')}</li>
              <li>{t('high_priority')}</li>
              <li>{t('standard_response')}</li>
            </ul>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-3">{t('enterprise_account')}</p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
