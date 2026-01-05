import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Topbar from '../components/Topbar';
import Footer from '../components/Footer';
import * as React from 'react';
import { useLanguage } from '../context/LanguageContext';

type FAQItem = { id: string; q: string; a: React.ReactNode; category: string };

const FAQ_DATA: FAQItem[] = [
  { id: 'getting-started', category: 'Getting Started', q: 'What is CITRICLOUD?', a: 'An integrated platform for dashboards, CMS, CRM, ERP, and e‑commerce with a modern, glass-inspired UI.' },
  { id: 'trial', category: 'Billing', q: 'Is there a free trial?', a: 'Yes. Our Starter plan includes a free trial. Upgrade anytime for more features and capacity.' },
  { id: 'start', category: 'Getting Started', q: 'How do I get started?', a: 'Create an account, choose a starter template, invite teammates, and connect integrations as needed.' },
  { id: 'integrations', category: 'Integrations', q: 'Do you support custom integrations?', a: 'Absolutely. We provide secure REST APIs, webhooks, and prebuilt connectors for popular services.' },
  { id: 'security', category: 'Security', q: 'How do you handle security?', a: 'We use end‑to‑end encryption, RBAC, audits, and adhere to ISO 27001 best practices.' },
  { id: 'data', category: 'Security', q: 'Where is my data stored?', a: 'Data is hosted on secure cloud infrastructure with multi‑region redundancy and regular backups.' },
  { id: 'support', category: 'Support', q: 'What support options are available?', a: '24/7 support via email and chat. Enterprise plans include a dedicated account manager and SLA.' },
];

export default function FAQPage() {
  const { t } = useLanguage();
  const [query, setQuery] = React.useState('');
  const [category, setCategory] = React.useState<'All' | string>('All');

  const categories = React.useMemo(() => ['All', ...Array.from(new Set(FAQ_DATA.map(f => f.category)))], []);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return FAQ_DATA.filter(item =>
      (category === 'All' || item.category === category) &&
      (q === '' || item.q.toLowerCase().includes(q) || String(item.a).toLowerCase().includes(q))
    );
  }, [query, category]);

  // Allow deep linking to a question: /faq#security
  React.useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    if (hash) {
      const el = document.getElementById(hash);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        // Open <details> if present
        if (el.tagName.toLowerCase() === 'details') {
          (el as HTMLDetailsElement).open = true;
        }
      }
    }
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100 dark:from-gray-950 dark:via-slate-950 dark:to-black">
      <Topbar />
      <Navbar />

      <main className="flex-1">
        {/* Header */}
        <section className="container mx-auto px-4 sm:px-6 pt-32 sm:pt-36 pb-8 sm:pb-12 max-w-7xl">
          <motion.h1 initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="text-3xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">{t('faq_title')}</motion.h1>
          <p className="text-base sm:text-lg text-gray-700 dark:text-gray-300 max-w-3xl">{t('faq_subtitle')}</p>
        </section>

        {/* Search Bar */}
        <section className="container mx-auto px-4 sm:px-6 pb-8 max-w-7xl">
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={t('search')}
            className="w-full px-4 py-3 sm:py-4 text-sm sm:text-base rounded-xl glass-card bg-white/80 dark:bg-gray-900/70 border border-white/30 dark:border-gray-700/30 dark:text-gray-100 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </section>

        {/* Main Content: Sidebar + FAQ List */}
        <section className="container mx-auto px-4 sm:px-6 pb-24 max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Sidebar: Category Filter */}
            <div className="md:col-span-1">
              <div className="glass-card p-6 rounded-xl bg-white/80 dark:bg-gray-900/70 border border-white/30 dark:border-gray-700/30 sticky top-28">
                <h3 className="font-bold text-gray-900 dark:text-white mb-4 text-sm uppercase tracking-wider">{t('categories')}</h3>
                <div className="space-y-2">
                  {categories.map((c) => (
                    <button
                      key={c}
                      onClick={() => setCategory(c)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                        category === c
                          ? 'bg-primary-500 text-white font-semibold'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/50'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Main Content: FAQ List */}
            <div className="md:col-span-3">
              <div className="space-y-4">
                {filtered.map((item, i) => (
                  <motion.details
                    id={item.id}
                    key={item.id}
                    initial={{ opacity: 0, y: 8 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                    className="glass-card rounded-xl bg-white/80 dark:bg-gray-900/70 border border-white/30 dark:border-gray-700/30 group"
                  >
                    <summary className="p-5 sm:p-6 font-semibold text-gray-900 dark:text-white cursor-pointer flex items-center justify-between text-base sm:text-lg hover:bg-gray-50/50 dark:hover:bg-gray-800/30 rounded-xl transition-colors">
                      <span className="flex-1">{item.q}</span>
                      <span className="ml-4 text-xs px-3 py-1 rounded-full bg-primary-500/10 text-primary-700 dark:bg-primary-500/20 dark:text-primary-300 font-medium flex-shrink-0">{item.category}</span>
                    </summary>
                    <div className="px-5 sm:px-6 pb-5 sm:pb-6 pt-2 border-t border-gray-200 dark:border-gray-700/50 text-sm sm:text-base text-gray-700 dark:text-gray-300">
                      {item.a}
                    </div>
                  </motion.details>
                ))}
                {filtered.length === 0 && (
                  <div className="text-center text-gray-700 dark:text-gray-300 py-12 text-sm sm:text-base">No results. Try a different search or category.</div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Help CTA */}
        <section className="container mx-auto px-4 sm:px-6 pb-24 max-w-7xl">
          <div className="glass-card p-8 sm:p-10 rounded-2xl bg-gradient-to-r from-primary-600 to-primary-700 text-white text-center">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">{t('help_center')}</h2>
            <p className="text-white/90 mb-6 text-sm sm:text-base max-w-2xl mx-auto">{t('send_ticket')}</p>
            <div className="flex gap-3 justify-center flex-wrap">
              <a href="/contact" className="px-6 py-3 bg-white text-primary-600 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-shadow text-sm sm:text-base">{t('contact')}</a>
              <a href="mailto:support@citricloud.com" className="px-6 py-3 bg-white/20 text-white rounded-xl font-semibold hover:bg-white/30 transition-colors text-sm sm:text-base">{t('email_us')}</a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
