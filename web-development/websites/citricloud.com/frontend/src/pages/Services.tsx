import { motion } from 'framer-motion';
import { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { FiSettings, FiLayout, FiZap, FiDatabase, FiLock, FiTrendingUp, FiCode, FiCloud, FiHeadphones, FiShoppingCart, FiFileText, FiUsers, FiMail, FiGrid, FiCalendar, FiCheckSquare } from 'react-icons/fi';
import { useLanguage } from '../context/LanguageContext';
import { Link } from 'react-router-dom';

export default function ServicesPage() {
  const { t } = useLanguage();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const coreServices = [
    { icon: <FiLayout className="w-6 h-6" />, titleKey: 'erp_dashboard', descKey: 'erp_dashboard_desc' },
    { icon: <FiUsers className="w-6 h-6" />, titleKey: 'crm_dashboard', descKey: 'crm_dashboard_desc' },
    { icon: <FiFileText className="w-6 h-6" />, titleKey: 'cms_dashboard', descKey: 'cms_dashboard_desc' },
    { icon: <FiShoppingCart className="w-6 h-6" />, titleKey: 'ecommerce_platform', descKey: 'ecommerce_platform_desc' },
    { icon: <FiDatabase className="w-6 h-6" />, titleKey: 'data_analytics', descKey: 'data_analytics_desc' },
    { icon: <FiTrendingUp className="w-6 h-6" />, titleKey: 'marketing_automation', descKey: 'marketing_automation_desc' },
  ];

  const technicalServices = [
    { icon: <FiCode className="w-6 h-6" />, titleKey: 'custom_development', descKey: 'custom_development_desc' },
    { icon: <FiSettings className="w-6 h-6" />, titleKey: 'api_integrations', descKey: 'api_integrations_desc' },
    { icon: <FiCloud className="w-6 h-6" />, titleKey: 'cloud_infrastructure', descKey: 'cloud_infrastructure_desc' },
    { icon: <FiLock className="w-6 h-6" />, titleKey: 'security_compliance', descKey: 'security_compliance_desc' },
    { icon: <FiZap className="w-6 h-6" />, titleKey: 'performance_optimization', descKey: 'performance_optimization_desc' },
    { icon: <FiHeadphones className="w-6 h-6" />, titleKey: 'support_training', descKey: 'support_training_desc' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100 dark:from-gray-950 dark:via-slate-950 dark:to-black">
      <Navbar />

      <main className="flex-1">
      <section className="container mx-auto px-4 sm:px-6 pt-24 sm:pt-28 pb-12 max-w-7xl">
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4"
        >
          {t('services')}
        </motion.h1>
        <p className="text-lg sm:text-xl text-gray-700 dark:text-gray-200 max-w-3xl leading-relaxed">
          {t('services_subtitle')}
        </p>
      </section>

      {/* Core Business Services */}
      <section className="container mx-auto px-4 sm:px-6 pb-12 max-w-7xl">
        <h2 className="text-3xl sm:text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-8">{t('core_business_solutions')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {coreServices.map((s, i) => (
          <motion.a key={i} href="/workspace" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} whileHover={{ y: -4 }} className="glass-card p-6 rounded-2xl bg-white/90 dark:bg-gray-900/90 border border-white/30 dark:border-gray-700/30 cursor-pointer transition-all hover:shadow-lg hover:border-primary-500/50 dark:hover:border-primary-400/50">
            <div className="w-14 h-14 rounded-xl bg-primary-500/10 dark:bg-primary-500/20 text-primary-600 dark:text-primary-400 flex items-center justify-center mb-4">{s.icon}</div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t(s.titleKey)}</h3>
            <p className="text-base text-gray-700 dark:text-gray-200 leading-relaxed">{t(s.descKey)}</p>
          </motion.a>
        ))}
        </div>
      </section>

      {/* Technical Services */}
      <section className="bg-gray-50 dark:bg-gray-900/50 py-12">
        <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
          <h2 className="text-3xl sm:text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-8">{t('technical_services_support')}  </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {technicalServices.map((s, i) => (
          <motion.a key={i} href="/workspace" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} whileHover={{ y: -4 }} className="glass-card p-6 rounded-2xl bg-white/90 dark:bg-gray-900/90 border border-white/30 dark:border-gray-700/30 cursor-pointer transition-all hover:shadow-lg hover:border-primary-500/50 dark:hover:border-primary-400/50">
            <div className="w-14 h-14 rounded-xl bg-primary-500/10 dark:bg-primary-500/20 text-primary-600 dark:text-primary-400 flex items-center justify-center mb-4">{s.icon}</div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t(s.titleKey)}</h3>
            <p className="text-base text-gray-700 dark:text-gray-200 leading-relaxed">{t(s.descKey)}</p>
          </motion.a>
        ))}
          </div>
        </div>
      </section>

      {/* Workspace Section */}
      <section className="container mx-auto px-4 sm:px-6 py-12 max-w-7xl">
        <div className="glass-card rounded-2xl overflow-hidden bg-gradient-to-br from-primary-500/20 to-purple-500/20 dark:from-primary-400/30 dark:to-purple-400/30 border-2 border-primary-600/30 dark:border-primary-400/30 backdrop-blur-xl">
          <div className="p-8 md:p-12">
            <div className="flex items-start justify-between flex-wrap gap-6 mb-6">
              <div className="flex-1 min-w-[280px]">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-16 h-16 rounded-xl bg-primary-600 dark:bg-primary-500 text-white flex items-center justify-center shadow-lg">
                    <FiGrid className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">{t('workspace')}</h2>
                    <p className="text-sm text-gray-700 dark:text-gray-200">{t('integrated_apps')}</p>
                  </div>
                </div>
                <p className="text-lg text-gray-800 dark:text-gray-100 leading-relaxed mb-6">
                  {t('workspace_description')}
                </p>
                <Link 
                  to="/workspace"
                  className="inline-flex items-center px-6 py-3 bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl"
                >
                  {t('explore_workspace_apps')}
                  <FiZap className="ml-2" />
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="glass-card p-4 rounded-xl bg-white/80 dark:bg-gray-900/80 border border-white/50 dark:border-gray-700/50 text-center">
                  <FiMail className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                  <div className="text-sm font-semibold text-gray-900 dark:text-white">Email</div>
                </div>
                <div className="glass-card p-4 rounded-xl bg-white/80 dark:bg-gray-900/80 border border-white/50 dark:border-gray-700/50 text-center">
                  <FiFileText className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <div className="text-sm font-semibold text-gray-900 dark:text-white">Words</div>
                </div>
                <div className="glass-card p-4 rounded-xl bg-white/80 dark:bg-gray-900/80 border border-white/50 dark:border-gray-700/50 text-center">
                  <FiGrid className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <div className="text-sm font-semibold text-gray-900 dark:text-white">Sheets</div>
                </div>
                <div className="glass-card p-4 rounded-xl bg-white/80 dark:bg-gray-900/80 border border-white/50 dark:border-gray-700/50 text-center">
                  <FiCalendar className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                  <div className="text-sm font-semibold text-gray-900 dark:text-white">Bookings</div>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {['Real-time Collaboration', 'Cloud Storage', 'Team Management', 'Mobile Apps', 'Offline Access', '24/7 Sync'].map((feature) => (
                <span key={feature} className="px-3 py-1 text-sm font-medium bg-white/60 dark:bg-gray-800/60 text-gray-800 dark:text-gray-200 rounded-full border border-white/50 dark:border-gray-700/50">
                  {feature}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Workspace Subscriptions (moved from Shop) */}
      <section className="container mx-auto px-4 sm:px-6 pb-12 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-2xl bg-gradient-to-br from-blue-50/80 to-purple-50/80 dark:from-blue-900/20 dark:to-purple-900/20 p-4 border-2 border-blue-200 dark:border-blue-700/50"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-0.5 flex items-center gap-2">
                <FiZap className="w-5 h-5 text-blue-500" />
                Workspace Subscriptions
              </h2>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Unlock all 15 workspace apps with unlimited access
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Billing:</span>
              <div className="inline-flex rounded-lg bg-white/80 dark:bg-gray-800 p-0.5">
                <button
                  onClick={() => setBillingCycle('monthly')}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                    billingCycle === 'monthly'
                      ? 'bg-blue-500 text-white shadow'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBillingCycle('yearly')}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                    billingCycle === 'yearly'
                      ? 'bg-blue-500 text-white shadow'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  Yearly
                </button>
              </div>
              {billingCycle === 'yearly' && (
                <span className="text-xs text-green-600 dark:text-green-400 font-semibold">Save 2 months!</span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Starter Plan */}
            <div className="glass-card rounded-xl bg-white/90 dark:bg-gray-800/90 p-4 border border-gray-200 dark:border-gray-700">
              <div className="mb-3">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Starter</h3>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    ${billingCycle === 'monthly' ? '12' : '120'}
                  </span>
                  <span className="text-xs text-gray-600 dark:text-gray-400">/user/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
                </div>
              </div>
              <button className="w-full px-3 py-1.5 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-medium transition-colors text-sm">
                Subscribe
              </button>
            </div>

            {/* Professional Plan - Solid primary background, no badge */}
            <div className="glass-card rounded-xl bg-blue-500 p-4 border-2 border-blue-400 shadow-lg transform scale-105 relative">
              <div className="mb-3">
                <h3 className="text-lg font-bold text-white">Professional</h3>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-2xl font-bold text-white">
                    ${billingCycle === 'monthly' ? '20' : '200'}
                  </span>
                  <span className="text-xs text-blue-100">/user/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
                </div>
              </div>
              <button className="w-full px-3 py-1.5 rounded-lg bg-white text-blue-600 hover:bg-blue-50 font-bold transition-colors text-sm">
                Subscribe
              </button>
            </div>

            {/* Enterprise Plan - no extra label */}
            <div className="glass-card rounded-xl bg-white/90 dark:bg-gray-800/90 p-4 border border-gray-200 dark:border-gray-700">
              <div className="mb-3">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Enterprise</h3>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">Custom</span>
                </div>
              </div>
              <button className="w-full px-3 py-1.5 rounded-lg bg-gray-700 hover:bg-gray-800 dark:bg-gray-600 dark:hover:bg-gray-700 text-white font-medium transition-colors text-sm">
                Contact Sales
              </button>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Service Packages */}
      <section className="container mx-auto px-4 sm:px-6 py-12 max-w-7xl">
        <h2 className="text-3xl sm:text-2xl sm:text-3xl lg:text-4xl font-bold text-center text-gray-900 dark:text-white mb-4">Service Packages</h2>
        <p className="text-center text-lg text-gray-700 dark:text-gray-200 mb-12 max-w-2xl mx-auto leading-relaxed">Choose a package that fits your needs, or contact us for a custom solution tailored to your business requirements.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="glass-card p-8 rounded-2xl bg-white/90 dark:bg-gray-900/90 border border-white/30 dark:border-gray-700/30">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Starter</h3>
            <p className="text-gray-700 dark:text-gray-200 mb-6">Perfect for small businesses and startups</p>
            <ul className="space-y-3 mb-8">
              <li className="flex items-start text-gray-700 dark:text-gray-200 text-base">
                <FiLayout className="w-5 h-5 mr-2 text-primary-600 flex-shrink-0 mt-0.5" />
                <span>1 Dashboard (CRM, ERP, or CMS)</span>
              </li>
              <li className="flex items-start text-gray-700 dark:text-gray-200 text-base">
                <FiDatabase className="w-5 h-5 mr-2 text-primary-600 flex-shrink-0 mt-0.5" />
                <span>Basic analytics & reporting</span>
              </li>
              <li className="flex items-start text-gray-700 dark:text-gray-200 text-base">
                <FiCloud className="w-5 h-5 mr-2 text-primary-600 flex-shrink-0 mt-0.5" />
                <span>Cloud hosting included</span>
              </li>
              <li className="flex items-start text-gray-700 dark:text-gray-200 text-base">
                <FiHeadphones className="w-5 h-5 mr-2 text-primary-600 flex-shrink-0 mt-0.5" />
                <span>Email support</span>
              </li>
            </ul>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="glass-card p-8 rounded-2xl bg-gradient-to-br from-primary-500/30 to-purple-500/30 dark:from-primary-400/40 dark:to-purple-400/40 border-2 border-primary-600 dark:border-primary-400 shadow-2xl backdrop-blur-xl relative overflow-hidden">
            {/* Background glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary-400/10 via-purple-400/10 to-blue-400/10 dark:from-primary-300/20 dark:via-purple-300/20 dark:to-blue-300/20"></div>
            
            <div className="relative z-10">
              <div className="text-xs font-bold text-white dark:text-white mb-3 bg-primary-600 dark:bg-primary-500 px-4 py-1.5 rounded-full inline-block shadow-lg">MOST POPULAR</div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Professional</h3>
              <p className="text-gray-800 dark:text-gray-100 mb-6 font-medium">For growing businesses that need more</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start text-gray-800 dark:text-white text-base font-medium">
                  <FiLayout className="w-5 h-5 mr-2 text-primary-700 dark:text-primary-300 flex-shrink-0 mt-0.5" />
                  <span>3 Dashboards + E-Commerce</span>
                </li>
                <li className="flex items-start text-gray-800 dark:text-white text-base font-medium">
                  <FiDatabase className="w-5 h-5 mr-2 text-primary-700 dark:text-primary-300 flex-shrink-0 mt-0.5" />
                  <span>Advanced analytics & AI insights</span>
                </li>
                <li className="flex items-start text-gray-800 dark:text-white text-base font-medium">
                  <FiSettings className="w-5 h-5 mr-2 text-primary-700 dark:text-primary-300 flex-shrink-0 mt-0.5" />
                  <span>API access & integrations</span>
                </li>
                <li className="flex items-start text-gray-800 dark:text-white text-base font-medium">
                  <FiCloud className="w-5 h-5 mr-2 text-primary-700 dark:text-primary-300 flex-shrink-0 mt-0.5" />
                  <span>Priority cloud hosting</span>
                </li>
                <li className="flex items-start text-gray-800 dark:text-white text-base font-medium">
                  <FiHeadphones className="w-5 h-5 mr-2 text-primary-700 dark:text-primary-300 flex-shrink-0 mt-0.5" />
                  <span>24/7 priority support</span>
                </li>
              </ul>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="glass-card p-8 rounded-2xl bg-white/90 dark:bg-gray-900/90 border border-white/30 dark:border-gray-700/30">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Enterprise</h3>
            <p className="text-gray-700 dark:text-gray-200 mb-6">Custom solutions for large organizations</p>
            <ul className="space-y-3 mb-8">
              <li className="flex items-start text-gray-700 dark:text-gray-200 text-base">
                <FiLayout className="w-5 h-5 mr-2 text-primary-600 flex-shrink-0 mt-0.5" />
                <span>Unlimited dashboards & modules</span>
              </li>
              <li className="flex items-start text-gray-700 dark:text-gray-200 text-base">
                <FiCode className="w-5 h-5 mr-2 text-primary-600 flex-shrink-0 mt-0.5" />
                <span>Custom development & features</span>
              </li>
              <li className="flex items-start text-gray-700 dark:text-gray-200 text-base">
                <FiLock className="w-5 h-5 mr-2 text-primary-600 flex-shrink-0 mt-0.5" />
                <span>Advanced security & compliance</span>
              </li>
              <li className="flex items-start text-gray-700 dark:text-gray-200 text-base">
                <FiCloud className="w-5 h-5 mr-2 text-primary-600 flex-shrink-0 mt-0.5" />
                <span>Dedicated infrastructure</span>
              </li>
              <li className="flex items-start text-gray-700 dark:text-gray-200 text-base">
                <FiHeadphones className="w-5 h-5 mr-2 text-primary-600 flex-shrink-0 mt-0.5" />
                <span>Dedicated account manager</span>
              </li>
            </ul>
          </motion.div>
        </div>
      </section>

      {/* Industries We Serve */}
      <section className="bg-gray-50 dark:bg-gray-900/50 py-12">
        <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
          <h2 className="text-3xl sm:text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-8">Industries We Serve</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {['Retail & D2C', 'SaaS & Tech', 'Healthcare', 'Finance', 'Manufacturing', 'Education'].map((name, i) => (
              <motion.div key={name} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }} className="glass-card p-6 rounded-2xl bg-white/90 dark:bg-gray-900/90 border border-white/30 dark:border-gray-700/30">
                <div className="text-lg font-semibold text-gray-900 dark:text-white">{name}</div>
                <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">Prebuilt templates, workflows, and integrations tailored for {name.toLowerCase()} organizations.</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="container mx-auto px-4 sm:px-6 py-12 max-w-7xl">
        <h2 className="text-3xl sm:text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-6">
          Frequently Asked Questions
          <a href="/faq" className="ml-4 text-lg sm:text-xl text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors">View more FAQ</a>
        </h2>
        <div className="space-y-4 max-w-3xl">
          {[
            { q: 'How long does implementation take?', a: 'Starter setups can be live within days. Professional and Enterprise timelines vary based on integrations and customizations.' },
            { q: 'Do you offer custom development?', a: 'Yes. Our team delivers bespoke features, workflows, and integrations aligned with your business goals.' },
            { q: 'Is my data secure?', a: 'We apply end-to-end encryption, regular audits, role-based access controls, and comply with ISO 27001.' },
          ].map((item, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }} className="glass-card p-5 rounded-xl bg-white/90 dark:bg-gray-900/90 border border-white/30 dark:border-gray-700/30">
              <div className="font-semibold text-gray-900 dark:text-white">{item.q}</div>
              <div className="text-sm text-gray-700 dark:text-gray-300 mt-1">{item.a}</div>
            </motion.div>
          ))}
        </div>
      </section>
      </main>

      <Footer />
    </div>
  );
}
