import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { FiAward, FiUsers, FiGlobe, FiTarget, FiHeart, FiShield } from 'react-icons/fi';
import { useLanguage } from '../context/LanguageContext';

export default function AboutPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100 dark:from-gray-950 dark:via-slate-950 dark:to-black">
      <Navbar />

      <main className="flex-1">
      <section className="container mx-auto px-4 sm:px-6 pt-24 sm:pt-28 pb-16 max-w-7xl">
        <motion.h1 initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="text-5xl font-bold text-gray-800 dark:text-gray-100 mb-4">{t('about')}</motion.h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl">{t('about_subtitle')}</p>
      </section>

      {/* Our Story */}
      <section className="container mx-auto px-4 sm:px-6 pb-16 max-w-7xl">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 dark:text-gray-100 mb-4">{t('company_story')}</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              {t('story_paragraph_1')}
            </p>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              {t('story_paragraph_2')}
            </p>
            <p className="text-gray-600 dark:text-gray-300">
              {t('story_paragraph_3')}
            </p>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="grid grid-cols-2 gap-4">
            <div className="glass-card p-6 rounded-2xl bg-white/70 dark:bg-gray-900/70 border border-white/30 dark:border-gray-700/30 text-center">
              <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary-500 dark:text-primary-400 mb-2">2020</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">{t('founded')}</div>
            </div>
            <div className="glass-card p-6 rounded-2xl bg-white/70 dark:bg-gray-900/70 border border-white/30 dark:border-gray-700/30 text-center">
              <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary-500 dark:text-primary-400 mb-2">10K+</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">{t('active_users')}</div>
            </div>
            <div className="glass-card p-6 rounded-2xl bg-white/70 dark:bg-gray-900/70 border border-white/30 dark:border-gray-700/30 text-center">
              <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary-500 dark:text-primary-400 mb-2">50+</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">{t('countries')}</div>
            </div>
            <div className="glass-card p-6 rounded-2xl bg-white/70 dark:bg-gray-900/70 border border-white/30 dark:border-gray-700/30 text-center">
              <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary-500 dark:text-primary-400 mb-2">99.9%</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">{t('uptime')}</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Core Values */}
      <section className="bg-gray-50 dark:bg-gray-900/50 py-16">
        <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-center text-gray-800 dark:text-gray-100 mb-12">{t('values')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0 }} className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-primary-500/10 dark:bg-primary-500/20 text-primary-500 dark:text-primary-400 flex items-center justify-center">
                <FiTarget className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">{t('innovation_first')}</h3>
              <p className="text-gray-600 dark:text-gray-300">{t('innovation_desc')}</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-primary-500/10 dark:bg-primary-500/20 text-primary-500 dark:text-primary-400 flex items-center justify-center">
                <FiHeart className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">{t('customer_success')}</h3>
              <p className="text-gray-600 dark:text-gray-300">{t('customer_success_desc')}</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-primary-500/10 dark:bg-primary-500/20 text-primary-500 dark:text-primary-400 flex items-center justify-center">
                <FiShield className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">{t('security_trust')}</h3>
              <p className="text-gray-600 dark:text-gray-300">{t('security_trust_desc')}</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mission, Vision, Values */}
      <section className="container mx-auto px-4 sm:px-6 py-16 grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 max-w-7xl">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }} className="glass-card p-6 rounded-2xl bg-white/70 dark:bg-gray-900/70 border border-white/30 dark:border-gray-700/30">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">{t('our_mission')}</h3>
          <p className="text-gray-600 dark:text-gray-300">{t('mission_content')}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="glass-card p-6 rounded-2xl bg-white/70 dark:bg-gray-900/70 border border-white/30 dark:border-gray-700/30">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">{t('our_vision')}</h3>
          <p className="text-gray-600 dark:text-gray-300">{t('vision_content')}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6 rounded-2xl bg-white/70 dark:bg-gray-900/70 border border-white/30 dark:border-gray-700/30">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">{t('values')}</h3>
          <p className="text-gray-600 dark:text-gray-300">{t('values_content')}</p>
        </motion.div>
      </section>

      {/* Achievements & Recognition */}
      <section className="container mx-auto px-4 sm:px-6 pb-24 max-w-7xl">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-center text-gray-800 dark:text-gray-100 mb-12">{t('recognition_achievements')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="glass-card p-6 rounded-2xl bg-white/70 dark:bg-gray-900/70 border border-white/30 dark:border-gray-700/30 text-center">
            <FiAward className="w-12 h-12 mx-auto mb-3 text-primary-500 dark:text-primary-400" />
            <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-1">{t('award_saas_2024')}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">{t('tech_innovation_awards')}</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="glass-card p-6 rounded-2xl bg-white/70 dark:bg-gray-900/70 border border-white/30 dark:border-gray-700/30 text-center">
            <FiUsers className="w-12 h-12 mx-auto mb-3 text-primary-500 dark:text-primary-400" />
            <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-1">{t('active_users_10k')}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">{t('growing_community')}</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="glass-card p-6 rounded-2xl bg-white/70 dark:bg-gray-900/70 border border-white/30 dark:border-gray-700/30 text-center">
            <FiGlobe className="w-12 h-12 mx-auto mb-3 text-primary-500 dark:text-primary-400" />
            <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-1">{t('countries_50_plus')}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">{t('global_reach')}</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.3 }} className="glass-card p-6 rounded-2xl bg-white/70 dark:bg-gray-900/70 border border-white/30 dark:border-gray-700/30 text-center">
            <FiShield className="w-12 h-12 mx-auto mb-3 text-primary-500 dark:text-primary-400" />
            <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-1">{t('iso_27001_certified')}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">{t('security_standard')}</p>
          </motion.div>
        </div>
      </section>

      {/* Team */}
      <section className="bg-gray-50 dark:bg-gray-900/50 py-16">
        <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-center text-gray-800 dark:text-gray-100 mb-12">{t('meet_team')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: 'Ava Thompson', role: 'CEO & Co‑Founder' },
              { name: 'Kenji Takahashi', role: 'Head of Engineering' },
              { name: 'Sofia Martinez', role: 'Design Lead' },
            ].map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-6 rounded-2xl bg-white/70 dark:bg-gray-900/70 border border-white/30 dark:border-gray-700/30 text-center"
              >
                <div className="w-20 h-20 mx-auto rounded-full bg-primary-500/20 dark:bg-primary-500/30 mb-3 flex items-center justify-center ring-1 ring-primary-500/40">
                  <FiUsers className="w-8 h-8 text-primary-600 dark:text-primary-300" />
                </div>
                <div className="font-semibold text-gray-800 dark:text-gray-100">{m.name}</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">{m.role}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="container mx-auto px-4 sm:px-6 pb-24 max-w-7xl">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-center text-gray-800 dark:text-gray-100 mb-12">{t('company_timeline')}</h2>
        <div className="space-y-6 max-w-3xl mx-auto">
          {[
            { year: '2020', event: t('timeline_2020') },
            { year: '2021', event: t('timeline_2021') },
            { year: '2022', event: t('timeline_2022') },
            { year: '2023', event: t('timeline_2023') },
            { year: '2024', event: t('timeline_2024') },
          ].map((item, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }} className="glass-card p-5 rounded-xl bg-white/70 dark:bg-gray-900/70 border border-white/30 dark:border-gray-700/30">
              <div className="flex items-center gap-4">
                <div className="text-primary-600 dark:text-primary-400 font-bold w-16">{item.year}</div>
                <div className="text-gray-700 dark:text-gray-300">{item.event}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
      </main>

      <Footer />
    </div>
  );
}
