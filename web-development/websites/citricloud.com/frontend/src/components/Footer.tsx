import { useEffect, useState } from 'react';
import { FaXTwitter, FaGithub, FaLinkedin } from "react-icons/fa6";
import { Cloud } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useLanguage } from '../context/LanguageContext';
import Newsletter from './Newsletter';
import { getVersionInfo, fetchGitHubReleases, GitHubRelease } from '../utils/version';

export default function Footer() {
  const { user } = useAuthStore();
  const { t } = useLanguage();
  const isAdmin = user && (user.role === 'system_admin' || user.role === 'administrator');
  const isSystemAdmin = user && user.role === 'system_admin';
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showReleases, setShowReleases] = useState(false);
  const [releases, setReleases] = useState<GitHubRelease[]>([]);
  const [loadingReleases, setLoadingReleases] = useState(false);

  // Track dark mode
  useEffect(() => {
    const checkDarkMode = () => {
      const isDark = document.documentElement.classList.contains('dark');
      setIsDarkMode(prev => prev !== isDark ? isDark : prev);
    };
    
    checkDarkMode();
    
    // Watch for theme changes
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    
    return () => observer.disconnect();
  }, []);

  // Load releases when modal opens
  useEffect(() => {
    if (showReleases && releases.length === 0 && !loadingReleases) {
      setLoadingReleases(true);
      fetchGitHubReleases(10).then(data => {
        setReleases(data);
        setLoadingReleases(false);
      });
    }
  }, [showReleases]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  return (
    <>
      <Newsletter />
      <footer className="glass-footer relative overflow-hidden text-gray-700 dark:text-gray-300 bg-gradient-to-br from-white via-primary-50/30 to-blue-50/40 dark:from-gray-900 dark:via-gray-900/95 dark:to-gray-900 backdrop-blur-xl">
        {/* Top divider line */}
        <div className="border-t border-gray-200/50 dark:border-gray-700/50"></div>
        
        {/* Enhanced Immersive Background Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
          {/* Animated Gradient Orbs */}
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-gradient-to-br from-primary-400/30 to-blue-500/30 dark:from-primary-600/20 dark:to-blue-600/20 rounded-full blur-3xl animate-pulse mix-blend-overlay" />
          <div className="absolute top-1/2 -right-12 w-80 h-80 bg-gradient-to-br from-indigo-400/25 to-primary-500/25 dark:from-indigo-600/15 dark:to-primary-700/15 rounded-full blur-3xl animate-pulse mix-blend-overlay" style={{ animationDelay: '1s', animationDuration: '3s' } as React.CSSProperties} />
          <div className="absolute -bottom-24 left-1/4 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-indigo-500/20 dark:from-blue-600/15 dark:to-indigo-700/15 rounded-full blur-3xl animate-pulse mix-blend-overlay" style={{ animationDelay: '2s', animationDuration: '4s' } as React.CSSProperties} />
          
          {/* Floating Geometric Shapes */}
          <div className="absolute top-1/4 left-1/3 w-40 h-40 bg-primary-300/20 dark:bg-primary-500/10 rotate-45 blur-2xl animate-pulse" style={{ animationDuration: '5s' } as React.CSSProperties} />
          <div className="absolute bottom-1/3 right-1/3 w-32 h-32 bg-blue-300/25 dark:bg-blue-500/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1.5s', animationDuration: '4s' } as React.CSSProperties} />
          <div className="absolute top-1/2 left-1/4 w-48 h-48 bg-indigo-300/15 dark:bg-indigo-500/8 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '3s', animationDuration: '6s' } as React.CSSProperties} />
          
          {/* Grid Pattern Overlay */}
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.08] dark:opacity-[0.05] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0.3))]" />
          
          {/* Shimmer Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 dark:via-white/5 to-transparent animate-shimmer" />
          
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-primary-50/15 via-transparent to-transparent dark:from-primary-900/10" />
        </div>
        
        {/* Glass blob effects for dark mode */}
        <span className="glass-blob blob-a" aria-hidden="true" />
        <span className="glass-blob blob-b" aria-hidden="true" />
        
      <div className="relative z-10 max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-8 sm:py-10 md:py-12 lg:py-16">
        <div className={`grid grid-cols-2 sm:grid-cols-3 ${isSystemAdmin ? 'md:grid-cols-4 lg:grid-cols-6' : 'md:grid-cols-4 lg:grid-cols-5'} gap-6 sm:gap-8 md:gap-10`}>
          {/* Logo, description, social icons */}
          <div className="col-span-2 sm:col-span-3 md:col-span-1">
            <div className="mb-3 sm:mb-4">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white tracking-tight leading-none">
                citricloud.com
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1 font-medium tracking-wide">
                Code delivered. Projects accelerated.
              </p>
            </div>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-4 sm:mb-5 leading-relaxed max-w-xs">
              CITRICLOUD is an enterprise-grade cloud platform delivering integrated CRM, CMS, ERP, and email workspace solutions. Built for scalability and performance, we empower businesses to streamline operations and accelerate digital transformation.
            </p>
            <div className="flex gap-3 sm:gap-4">
              <a 
                href="https://twitter.com/citricloud" 
                title="X (Twitter)" 
                aria-label="X (Twitter)" 
                className="flex items-center justify-center w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-blue-500 hover:text-white dark:hover:bg-blue-500 transition-all duration-300 hover:scale-110 hover:shadow-lg"
              >
                <FaXTwitter size={16} />
              </a>
              <a 
                href="https://github.com/devboxdel/citricloud" 
                title="GitHub" 
                aria-label="GitHub" 
                className="flex items-center justify-center w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-900 hover:text-white dark:hover:bg-gray-700 transition-all duration-300 hover:scale-110 hover:shadow-lg"
              >
                <FaGithub size={16} />
              </a>
              <a 
                href="https://linkedin.com/company/citricloud" 
                title="LinkedIn" 
                aria-label="LinkedIn" 
                className="flex items-center justify-center w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-blue-700 hover:text-white dark:hover:bg-blue-700 transition-all duration-300 hover:scale-110 hover:shadow-lg"
              >
                <FaLinkedin size={16} />
              </a>
            </div>
          </div>
          {/* Menu */}
          <div>
            <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-3 sm:mb-4 text-sm sm:text-base tracking-wide uppercase">{t('footer_company')}</h3>
            <ul className="space-y-2.5 sm:space-y-3 text-xs sm:text-sm">
              <li><a className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:translate-x-1 transition-all duration-200 py-1 block inline-flex items-center gap-2" href="https://citricloud.com"><span>→</span> {t('home')}</a></li>
              <li><a className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:translate-x-1 transition-all duration-200 py-1 block inline-flex items-center gap-2" href="https://about.citricloud.com"><span>→</span> {t('about')}</a></li>
              <li><a className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:translate-x-1 transition-all duration-200 py-1 block inline-flex items-center gap-2" href="https://services.citricloud.com"><span>→</span> {t('services')}</a></li>
              <li><a className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:translate-x-1 transition-all duration-200 py-1 block inline-flex items-center gap-2" href="https://blog.citricloud.com"><span>→</span> {t('blog')}</a></li>
              <li><a className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:translate-x-1 transition-all duration-200 py-1 block inline-flex items-center gap-2" href="https://shop.citricloud.com"><span>→</span> {t('shop')}</a></li>
            </ul>
          </div>
          {/* Backend */}
          <div>
              <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-3 sm:mb-4 text-sm sm:text-base tracking-wide uppercase">{t('backend')}</h3>
            <ul className="space-y-2.5 sm:space-y-3 text-xs sm:text-sm">
              <li><a className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:translate-x-1 transition-all duration-200 py-1 block inline-flex items-center gap-2" href="https://my.citricloud.com/workspace"><span>→</span> Workspace</a></li>
              {/* Only show Dashboard for admins */}
              {isAdmin && (
                <li><a className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:translate-x-1 transition-all duration-200 py-1 block inline-flex items-center gap-2" href="https://my.citricloud.com/dashboard"><span>→</span> Dashboard</a></li>
              )}
            </ul>
          </div>
          {/* Developers */}
          <div>
            <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-3 sm:mb-4 text-sm sm:text-base tracking-wide uppercase">{t('footer_support')}</h3>
            <ul className="space-y-2.5 sm:space-y-3 text-xs sm:text-sm">
              <li><a className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:translate-x-1 transition-all duration-200 py-1 block inline-flex items-center gap-2" href="https://citricloud.com/status"><span>→</span> {t('status_page')}</a></li>
              <li><a className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:translate-x-1 transition-all duration-200 py-1 block inline-flex items-center gap-2" href="https://citricloud.com/log"><span>→</span> {t('activity_log')}</a></li>
              <li><a className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:translate-x-1 transition-all duration-200 py-1 block inline-flex items-center gap-2" href="https://citricloud.com/sitemap"><span>→</span> {t('site_map')}</a></li>
              {isSystemAdmin && (
                <>
                  <li><a className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:translate-x-1 transition-all duration-200 py-1 block inline-flex items-center gap-2" href="https://citricloud.com/api-reference"><span>→</span> {t('api_reference')}</a></li>
                  <li><a className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:translate-x-1 transition-all duration-200 py-1 block inline-flex items-center gap-2" href="https://citricloud.com/error-pages"><span>→</span> {t('error_pages')}</a></li>
                </>
              )}
            </ul>
          </div>
          {/* Resources - Only for System Admin */}
          {isSystemAdmin && (
            <div>
              <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-3 sm:mb-4 text-sm sm:text-base tracking-wide uppercase">{t('resources')}</h3>
              <ul className="space-y-2.5 sm:space-y-3 text-xs sm:text-sm">
                <li><a className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:translate-x-1 transition-all duration-200 py-1 block inline-flex items-center gap-2" href="https://citricloud.com/landing"><span>→</span> {t('landing_page')}</a></li>
                <li><a className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:translate-x-1 transition-all duration-200 py-1 block inline-flex items-center gap-2" href="https://citricloud.com/coming-soon"><span>→</span> {t('coming_soon')}</a></li>
                <li><a className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:translate-x-1 transition-all duration-200 py-1 block inline-flex items-center gap-2" href="https://citricloud.com/maintenance"><span>→</span> {t('maintenance_mode')}</a></li>
              </ul>
            </div>
          )}
          {/* Contact */}
          <div>
            <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-3 sm:mb-4 text-sm sm:text-base tracking-wide uppercase">{t('footer_legal')}</h3>
            <ul className="space-y-2.5 sm:space-y-3 text-xs sm:text-sm">
              <li>
                <a className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:translate-x-1 transition-all duration-200 py-1 block inline-flex items-center gap-2" href="https://contact.citricloud.com"><span>→</span> {t('contact')}</a>
              </li>
              <li>
                <a className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:translate-x-1 transition-all duration-200 py-1 block inline-flex items-center gap-2" href="https://citricloud.com/careers"><span>→</span> Careers</a>
              </li>
              <li>
                <a className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:translate-x-1 transition-all duration-200 py-1 block inline-flex items-center gap-2" href="https://citricloud.com/faq"><span>→</span> {t('faq')}</a>
              </li>
              <li>
                <a className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:translate-x-1 transition-all duration-200 py-1 block inline-flex items-center gap-2" href="https://help.citricloud.com"><span>→</span> {t('help_center')}</a>
              </li>
              <li>
                <a className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:translate-x-1 transition-all duration-200 py-1 block inline-flex items-center gap-2" href="https://documentation.citricloud.com"><span>→</span> {t('documentation')}</a>
              </li>
              <li>
                <a className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:translate-x-1 transition-all duration-200 py-1 block inline-flex items-center gap-2" href="https://my.citricloud.com/profile"><span>→</span> {t('send_ticket')}</a>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Divider */}
        <div className="mt-10 sm:mt-12 mb-6 sm:mb-8 border-t border-gray-200/50 dark:border-gray-700/50"></div>
        
        <div className="text-center">
          <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-3 sm:mb-4 font-medium">{t('footer_copyright')}</div>
          <div className="flex items-center justify-center gap-2 mb-4 sm:mb-5 text-[10px] sm:text-xs">
            <button
              onClick={() => setShowReleases(true)}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100/80 dark:bg-gray-800/80 border border-gray-300/50 dark:border-gray-700/50 hover:bg-gray-200 dark:hover:bg-gray-700 hover:border-primary-400 dark:hover:border-primary-500 transition-all duration-300 hover:scale-105 hover:shadow-md cursor-pointer"
              title="View releases"
            >
              <FaGithub size={14} />
              <span className="font-mono font-semibold">v{getVersionInfo().version}</span>
            </button>
          </div>
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3 text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
            <a href="/terms" className="hover:text-primary-600 dark:hover:text-primary-400 hover:underline transition-colors">{t('terms_conditions')}</a>
            <span className="text-gray-400 dark:text-gray-600 hidden sm:inline">•</span>
            <a href="/privacy" className="hover:text-primary-600 dark:hover:text-primary-400 hover:underline transition-colors">{t('privacy_policy')}</a>
            <span className="text-gray-400 dark:text-gray-600 hidden sm:inline">•</span>
            <a href="/cookies" className="hover:text-primary-600 dark:hover:text-primary-400 hover:underline transition-colors">{t('cookie_policy')}</a>
            <span className="text-gray-400 dark:text-gray-600 hidden sm:inline">•</span>
            <a href="/disclaimer" className="hover:text-primary-600 dark:hover:text-primary-400 hover:underline transition-colors">{t('disclaimer')}</a>
            <span className="text-gray-400 dark:text-gray-600 hidden sm:inline">•</span>
            <a href="/accessibility" className="hover:text-primary-600 dark:hover:text-primary-400 hover:underline transition-colors">{t('accessibility')}</a>
            <span className="text-gray-400 dark:text-gray-600 hidden sm:inline">•</span>
            <a href="/fair-use" className="hover:text-primary-600 dark:hover:text-primary-400 hover:underline transition-colors">{t('fair_use')}</a>
            <span className="text-gray-400 dark:text-gray-600 hidden sm:inline">•</span>
            <a href="/responsible-disclosure" className="hover:text-primary-600 dark:hover:text-primary-400 hover:underline transition-colors">{t('responsible_disclosure')}</a>
            <span className="text-gray-400 dark:text-gray-600 hidden sm:inline">•</span>
            <a href="/withdrawal-policy" className="hover:text-primary-600 dark:hover:text-primary-400 hover:underline transition-colors">{t('withdrawal_policy')}</a>
          </div>
        </div>
      </div>
      </footer>

      {/* Releases Modal */}
      {showReleases && (
        <>
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998]"
            onClick={() => setShowReleases(false)}
          />
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <div 
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[80vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FaGithub size={24} />
                  <div>
                    <h2 className="text-xl font-bold">GitHub Releases</h2>
                    <p className="text-sm text-blue-100">Version History & Updates</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowReleases(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Content */}
              <div className="overflow-y-auto max-h-[calc(80vh-80px)] p-6">
                {loadingReleases ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                  </div>
                ) : releases.length === 0 ? (
                  <div className="text-center py-12">
                    <FaGithub size={48} className="mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600 dark:text-gray-400">No releases found</p>
                    <a 
                      href={getVersionInfo().releasesUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-block text-blue-500 hover:underline"
                    >
                      View on GitHub
                    </a>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {releases.map((release, index) => (
                      <div 
                        key={release.id}
                        className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <span className="font-mono text-sm font-semibold text-gray-800 dark:text-gray-200 flex-shrink-0">
                              {release.tag_name}
                            </span>
                            {index === 0 && (
                              <span className="px-1.5 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-[10px] rounded font-medium flex-shrink-0">
                                Latest
                              </span>
                            )}
                            {release.prerelease && (
                              <span className="px-1.5 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 text-[10px] rounded font-medium flex-shrink-0">
                                Pre-release
                              </span>
                            )}
                            <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                              {release.name || release.tag_name}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="text-xs text-gray-500 dark:text-gray-400 hidden sm:inline">
                              {formatDate(release.published_at)}
                            </span>
                            <a
                              href={release.html_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded transition-colors"
                              title="View on GitHub"
                            >
                              <FaGithub size={16} />
                            </a>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* View All Link */}
                {releases.length > 0 && (
                  <div className="mt-6 text-center">
                    <a
                      href={getVersionInfo().releasesUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all"
                    >
                      <FaGithub size={16} />
                      <span>View All Releases on GitHub</span>
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
