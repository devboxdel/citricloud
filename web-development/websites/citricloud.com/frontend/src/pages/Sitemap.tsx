import { motion } from 'framer-motion';
import { useMemo, useState } from 'react';
import Navbar from '../components/Navbar';
import Topbar from '../components/Topbar';
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';
import { FiChevronRight, FiGlobe, FiLock, FiCode, FiFileText, FiAlertCircle } from 'react-icons/fi';
import { useLanguage } from '../context/LanguageContext';

interface SitemapLink {
  label: string;
  to: string;
  external?: boolean;
  desc?: string;
}

interface SitemapSection {
  title: string;
  icon: any;
  desc: string;
  links: SitemapLink[];
}

export default function SitemapPage() {
  const { t } = useLanguage();
  const [expandedSections, setExpandedSections] = useState<string[]>(['General']);
  const [searchTerm, setSearchTerm] = useState('');

  const sections: SitemapSection[] = [
    {
      title: 'General',
      icon: FiGlobe,
      desc: 'Main pages and core features',
      links: [
        { label: 'Homepage', to: '/', desc: 'Welcome to CITRICLOUD' },
        { label: 'About', to: '/about', desc: 'Learn about our company' },
        { label: 'Services', to: '/services', desc: 'Explore our services' },
        { label: 'Blog', to: '/blog', desc: 'Latest news and updates' },
        { label: 'Shop', to: '/shop', desc: 'Browse products' },
        { label: 'Contact', to: '/contact', desc: 'Get in touch' },
        { label: 'FAQ', to: '/faq', desc: 'Frequently asked questions' }
      ]
    },
    {
      title: 'Support & Resources',
      icon: FiFileText,
      desc: 'Help and documentation',
      links: [
        { label: 'Help Center', to: '/help-center', desc: 'Support articles and guides' },
        { label: 'Documentation', to: '/documentation', desc: 'Technical documentation' },
        { label: 'API Reference', to: '/api-reference', desc: 'REST API reference' },
        { label: 'Status Page', to: '/status', desc: 'System status & monitoring' },
        { label: 'Logs', to: '/log', desc: 'Development logs' }
      ]
    },
    {
      title: 'Developers',
      icon: FiCode,
      desc: 'Developer tools and resources',
      links: [
        { label: 'Error Pages', to: '/error-pages', desc: 'Error handling guides' },
        { label: 'Sitemap', to: '/sitemap', desc: 'Complete site structure' },
        { label: 'API Reference', to: '/api-reference', desc: 'API documentation' },
        { label: 'Status', to: '/status', desc: 'Service status' }
      ]
    },
    {
      title: 'Accounts & Workspace',
      icon: FiLock,
      desc: 'User access, auth, and workspace entry points',
      links: [
        { label: 'Login', to: '/login', desc: 'Sign in to your account' },
        { label: 'Register', to: '/register', desc: 'Create a new account' },
        { label: 'Profile', to: '/profile', desc: 'Manage your profile' },
        { label: 'Workspace', to: '/workspace', desc: 'Workspace home' },
        { label: 'Email Workspace', to: '/workspace/email', desc: 'Email & comms hub' }
      ]
    },
    {
      title: 'Legal & Policies',
      icon: FiLock,
      desc: 'Legal information and policies',
      links: [
        { label: 'Terms and Conditions', to: '/terms', desc: 'Terms of service' },
        { label: 'Privacy Policy', to: '/privacy', desc: 'Privacy statement' },
        { label: 'Cookie Policy', to: '/cookies', desc: 'Cookie usage' },
        { label: 'Disclaimer', to: '/disclaimer', desc: 'Liability disclaimer' },
        { label: 'Accessibility', to: '/accessibility', desc: 'Accessibility statement' },
        { label: 'Fair Use Policy', to: '/fair-use', desc: 'Fair use guidelines' },
        { label: 'Responsible Disclosure', to: '/responsible-disclosure', desc: 'Security disclosure' },
        { label: 'Withdrawal Policy', to: '/withdrawal-policy', desc: 'Withdrawal information' }
      ]
    },
    {
      title: 'Special Pages',
      icon: FiAlertCircle,
      desc: 'Special and feature pages',
      links: [
        { label: 'Landing Page', to: '/landing', desc: 'Landing page' },
        { label: 'Coming Soon', to: '/coming-soon', desc: 'Coming soon page' },
        { label: 'Maintenance', to: '/maintenance', desc: 'Maintenance page' },
        { label: 'Thank You', to: '/thank-you', desc: 'Thank you page' }
      ]
    }
  ];

  const filteredSections = useMemo(() => {
    if (!searchTerm.trim()) return sections;
    const term = searchTerm.toLowerCase();
    return sections
      .map((section) => ({
        ...section,
        links: section.links.filter((link) =>
          link.label.toLowerCase().includes(term) || link.desc?.toLowerCase().includes(term)
        )
      }))
      .filter((section) => section.links.length > 0 || section.title.toLowerCase().includes(term));
  }, [sections, searchTerm]);

  const toggleSection = (title: string) => {
    setExpandedSections((prev) =>
      prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]
    );
  };

  const expandAll = () => setExpandedSections(sections.map((s) => s.title));
  const collapseAll = () => setExpandedSections([]);

  const stats = useMemo(() => {
    const totalLinks = sections.reduce((sum, s) => sum + s.links.length, 0);
    return [
      { label: 'Sections', count: sections.length },
      { label: 'Total Links', count: totalLinks },
      { label: 'Categories', count: sections.length },
      { label: 'Pages', count: totalLinks }
    ];
  }, [sections]);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100 dark:from-gray-950 dark:via-slate-950 dark:to-black">
      <Topbar />
      <Navbar />
      <main className="flex-1">
        <section className="container mx-auto px-4 sm:px-6 pt-24 sm:pt-28 pb-16 max-w-7xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 sm:mb-12"
          >
            <h1 className="text-3xl sm:text-5xl font-bold text-gray-800 dark:text-gray-100 mb-4">
              Sitemap
            </h1>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-3xl">
              Complete structure of all pages and resources available on CITRICLOUD
            </p>
          </motion.div>

          {/* Controls */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="glass-card p-4 sm:p-5 rounded-xl border border-white/30 dark:border-gray-700/30 mb-6 flex flex-wrap items-center gap-3"
          >
            <input
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search pages..."
              className="flex-1 min-w-[220px] px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white/70 dark:bg-gray-900/50 text-sm text-gray-800 dark:text-gray-100"
            />
            <div className="flex items-center gap-2">
              <button
                onClick={expandAll}
                className="px-3 py-2 rounded-lg bg-blue-500 text-white text-xs sm:text-sm font-semibold hover:bg-blue-600 transition-colors"
              >
                Expand all
              </button>
              <button
                onClick={collapseAll}
                className="px-3 py-2 rounded-lg bg-gray-200 dark:bg-gray-800 text-xs sm:text-sm font-semibold text-gray-800 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
              >
                Collapse all
              </button>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 sm:mb-12"
          >
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.15 + i * 0.05 }}
                className="glass-card p-4 sm:p-6 rounded-xl text-center"
              >
                <div className="text-2xl sm:text-3xl font-bold text-blue-500 mb-1">
                  {stat.count}+
                </div>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </motion.div>

          {/* Sections Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4 sm:space-y-6"
          >
            {filteredSections.map((section, sectionIdx) => {
              const Icon = section.icon;
              const isExpanded = expandedSections.includes(section.title);
              
              return (
                <motion.div
                  key={section.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 + sectionIdx * 0.05 }}
                  className="glass-card rounded-2xl border border-white/30 dark:border-gray-700/30 overflow-hidden"
                >
                  {/* Section Header */}
                  <button
                    onClick={() => toggleSection(section.title)}
                    className="w-full p-5 sm:p-6 flex items-center justify-between hover:bg-white/50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <div className="flex items-center gap-4 text-left flex-1">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />
                      </div>
                      <div>
                        <h2 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-100">
                          {section.title}
                        </h2>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                          {section.desc}
                          <span className="text-[11px] text-blue-500">{section.links.length} links</span>
                        </p>
                      </div>
                    </div>
                    <FiChevronRight
                      className={`w-5 h-5 text-gray-600 dark:text-gray-400 transition-transform flex-shrink-0 ${
                        isExpanded ? 'rotate-90' : ''
                      }`}
                    />
                  </button>

                  {/* Links Grid */}
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="border-t border-white/30 dark:border-gray-700/30 p-5 sm:p-6 bg-white/20 dark:bg-gray-900/20"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                        {section.links.map((link, linkIdx) => (
                          <motion.div
                            key={link.to}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.05 + linkIdx * 0.02 }}
                          >
                            {link.external ? (
                              <a
                                href={link.to}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-start gap-3 p-3 rounded-lg hover:bg-white/50 dark:hover:bg-gray-800/50 transition-colors group"
                              >
                                <FiChevronRight className="w-4 h-4 text-blue-500 flex-shrink-0 mt-1 group-hover:translate-x-1 transition-transform" />
                                <div className="flex-1">
                                  <p className="font-medium text-gray-800 dark:text-gray-100 text-sm group-hover:text-blue-500 transition-colors">
                                    {link.label}
                                  </p>
                                  {link.desc && (
                                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                                      {link.desc}
                                    </p>
                                  )}
                                </div>
                              </a>
                            ) : (
                              <Link
                                to={link.to}
                                className="flex items-start gap-3 p-3 rounded-lg hover:bg-white/50 dark:hover:bg-gray-800/50 transition-colors group"
                              >
                                <FiChevronRight className="w-4 h-4 text-blue-500 flex-shrink-0 mt-1 group-hover:translate-x-1 transition-transform" />
                                <div className="flex-1">
                                  <p className="font-medium text-gray-800 dark:text-gray-100 text-sm group-hover:text-blue-500 transition-colors">
                                    {link.label}
                                  </p>
                                  {link.desc && (
                                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                                      {link.desc}
                                    </p>
                                  )}
                                </div>
                              </Link>
                            )}
                          </motion.div>
                        ))}
                        {section.links.length === 0 && (
                          <div className="col-span-full text-sm text-gray-600 dark:text-gray-400">No links match your search.</div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </motion.div>

          {/* Footer Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-12 glass-card p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20"
          >
            <h3 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-100 mb-3">
              Website Structure
            </h3>
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 mb-4">
              This sitemap provides a complete overview of all pages and resources available on CITRICLOUD. 
              Use it to navigate the site or for SEO purposes.
            </p>
            <div className="flex flex-wrap gap-3">
              <a href="/api-reference" className="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors text-sm">
                API Reference
              </a>
              <a href="/documentation" className="px-4 py-2 glass-card border border-white/30 dark:border-gray-700/30 text-gray-800 dark:text-gray-100 rounded-lg font-medium hover:bg-white/50 dark:hover:bg-gray-800/50 transition-colors text-sm">
                Documentation
              </a>
            </div>
          </motion.div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
