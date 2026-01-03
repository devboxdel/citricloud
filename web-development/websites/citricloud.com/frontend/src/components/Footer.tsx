import { useEffect, useState } from 'react';
import { FaTwitter, FaGithub, FaLinkedin } from "react-icons/fa";
import { Cloud } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useLanguage } from '../context/LanguageContext';
import Newsletter from './Newsletter';
import { getVersionInfo } from '../utils/version';

export default function Footer() {
  const { user } = useAuthStore();
  const { t } = useLanguage();
  const isAdmin = user && (user.role === 'system_admin' || user.role === 'administrator');
  const isSystemAdmin = user && user.role === 'system_admin';
  const [isDarkMode, setIsDarkMode] = useState(false);

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
  
  return (
    <>
      <Newsletter />
      <footer className="glass-footer relative overflow-hidden text-gray-700 dark:text-gray-300 border-t border-white/30 dark:border-gray-700/30 bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl bg-gradient-to-br from-primary-50/60 via-white/40 to-primary-100/40 dark:from-transparent dark:via-transparent dark:to-transparent">
      <span className="glass-blob blob-a" aria-hidden="true" />
      <span className="glass-blob blob-b" aria-hidden="true" />
      {/* Light theme decorative glows */}
      <span className="absolute -left-24 -bottom-24 w-72 h-72 rounded-full bg-primary-400/20 blur-3xl dark:hidden" aria-hidden="true" />
      <span className="absolute -right-16 -top-20 w-56 h-56 rounded-full bg-primary-300/20 blur-2xl dark:hidden" aria-hidden="true" />
      <div className="relative z-10 max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-6 sm:py-8 md:py-10 lg:py-12">
        <div className={`grid grid-cols-2 sm:grid-cols-3 ${isSystemAdmin ? 'md:grid-cols-4 lg:grid-cols-6' : 'md:grid-cols-4 lg:grid-cols-5'} gap-4 sm:gap-6 md:gap-8`}>
          {/* Logo, description, social icons */}
          <div className="col-span-2 sm:col-span-3 md:col-span-1">
            <div className="flex items-center gap-2 mb-2 sm:mb-3">
              <img
                src={isDarkMode ? "/darkmode.svg?v=8" : "/lightmode.svg?v=8"}
                alt="CITRICLOUD"
                width="667"
                height="60"
                className="h-6 sm:h-7 md:h-8 w-auto"
              />
            </div>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-3 sm:mb-4 leading-relaxed">{t('footer_about')}</p>
            <div className="flex gap-4 sm:gap-5 mt-2">
              <a href="https://twitter.com/citricloud" title="Twitter" aria-label="Twitter" className="p-2 -m-2 hover:text-blue-500 transition-colors"><FaTwitter size={18} className="sm:w-5 sm:h-5" /></a>
              <a href="https://github.com/citricloud" title="GitHub" aria-label="GitHub" className="p-2 -m-2 hover:text-gray-900 dark:hover:text-white transition-colors"><FaGithub size={18} className="sm:w-5 sm:h-5" /></a>
              <a href="https://linkedin.com/company/citricloud" title="LinkedIn" aria-label="LinkedIn" className="p-2 -m-2 hover:text-blue-700 transition-colors"><FaLinkedin size={18} className="sm:w-5 sm:h-5" /></a>
            </div>
          </div>
          {/* Menu */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1.5 sm:mb-2 text-sm sm:text-base">{t('footer_company')}</h3>
            <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
              <li><a className="text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white hover:underline py-1 block" href="https://citricloud.com">{t('home')}</a></li>
              <li><a className="text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white hover:underline py-1 block" href="https://about.citricloud.com">{t('about')}</a></li>
              <li><a className="text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white hover:underline py-1 block" href="https://services.citricloud.com">{t('services')}</a></li>
              <li><a className="text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white hover:underline py-1 block" href="https://blog.citricloud.com">{t('blog')}</a></li>
              <li><a className="text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white hover:underline py-1 block" href="https://shop.citricloud.com">{t('shop')}</a></li>
            </ul>
          </div>
          {/* Backend */}
          <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1.5 sm:mb-2 text-sm sm:text-base">{t('backend')}</h3>
            <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
              <li><a className="text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white hover:underline py-1 block" href="https://my.citricloud.com/workspace">Workspace</a></li>
              {/* Only show Dashboard for admins */}
              {isAdmin && (
                <li><a className="text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white hover:underline py-1 block" href="https://my.citricloud.com/dashboard">Dashboard</a></li>
              )}
            </ul>
          </div>
          {/* Developers */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1.5 sm:mb-2 text-sm sm:text-base">{t('footer_support')}</h3>
            <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
              <li><a className="text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white hover:underline py-1 block" href="https://citricloud.com/status">{t('status_page')}</a></li>
              <li><a className="text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white hover:underline py-1 block" href="https://citricloud.com/log">{t('activity_log')}</a></li>
              <li><a className="text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white hover:underline py-1 block" href="https://citricloud.com/sitemap">{t('site_map')}</a></li>
              {isSystemAdmin && (
                <>
                  <li><a className="text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white hover:underline py-1 block" href="https://citricloud.com/api-reference">{t('api_reference')}</a></li>
                  <li><a className="text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white hover:underline py-1 block" href="https://citricloud.com/error-pages">{t('error_pages')}</a></li>
                </>
              )}
            </ul>
          </div>
          {/* Resources - Only for System Admin */}
          {isSystemAdmin && (
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1.5 sm:mb-2 text-sm sm:text-base">{t('resources')}</h3>
              <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
                <li><a className="text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white hover:underline py-1 block" href="https://citricloud.com/landing">{t('landing_page')}</a></li>
                <li><a className="text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white hover:underline py-1 block" href="https://citricloud.com/coming-soon">{t('coming_soon')}</a></li>
                <li><a className="text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white hover:underline py-1 block" href="https://citricloud.com/maintenance">{t('maintenance_mode')}</a></li>
              </ul>
            </div>
          )}
          {/* Contact */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1.5 sm:mb-2 text-sm sm:text-base">{t('footer_legal')}</h3>
            <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
              <li>
                <a className="text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white hover:underline py-1 block" href="https://contact.citricloud.com">{t('contact')}</a>
              </li>
              <li>
                <a className="text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white hover:underline py-1 block" href="https://citricloud.com/faq">{t('faq')}</a>
              </li>
              <li>
                <a className="text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white hover:underline py-1 block" href="https://help.citricloud.com">{t('help_center')}</a>
              </li>
              <li>
                <a className="text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white hover:underline py-1 block" href="https://documentation.citricloud.com">{t('documentation')}</a>
              </li>
              <li>
                <a className="text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white hover:underline py-1 block" href="https://my.citricloud.com/profile">{t('send_ticket')}</a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-6 sm:mt-8 text-center">
          <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-2 sm:mb-3">{t('footer_copyright')}</div>
          <div className="flex items-center justify-center gap-2 mb-2 sm:mb-3 text-[10px] sm:text-xs text-gray-500 dark:text-gray-500">
            <a 
              href={getVersionInfo().githubUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-gray-100/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50 hover:bg-gray-200/50 dark:hover:bg-gray-700/50 transition-colors"
              title="View on GitHub"
            >
              <FaGithub size={12} />
              <span className="font-mono">v{getVersionInfo().version}</span>
            </a>
          </div>
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3 md:gap-4 text-[10px] sm:text-xs text-gray-500 dark:text-gray-500">
            <a href="/terms" className="hover:text-gray-900 dark:hover:text-gray-300 hover:underline transition-colors">{t('terms_conditions')}</a>
            <span className="text-gray-400 dark:text-gray-600 hidden sm:inline">•</span>
            <a href="/privacy" className="hover:text-gray-900 dark:hover:text-gray-300 hover:underline transition-colors">{t('privacy_policy')}</a>
            <span className="text-gray-400 dark:text-gray-600 hidden sm:inline">•</span>
            <a href="/cookies" className="hover:text-gray-900 dark:hover:text-gray-300 hover:underline transition-colors">{t('cookie_policy')}</a>
            <span className="text-gray-400 dark:text-gray-600 hidden sm:inline">•</span>
            <a href="/disclaimer" className="hover:text-gray-900 dark:hover:text-gray-300 hover:underline transition-colors">{t('disclaimer')}</a>
            <span className="text-gray-400 dark:text-gray-600 hidden sm:inline">•</span>
            <a href="/accessibility" className="hover:text-gray-900 dark:hover:text-gray-300 hover:underline transition-colors">{t('accessibility')}</a>
            <span className="text-gray-400 dark:text-gray-600 hidden sm:inline">•</span>
            <a href="/fair-use" className="hover:text-gray-900 dark:hover:text-gray-300 hover:underline transition-colors">{t('fair_use')}</a>
            <span className="text-gray-400 dark:text-gray-600 hidden sm:inline">•</span>
            <a href="/responsible-disclosure" className="hover:text-gray-900 dark:hover:text-gray-300 hover:underline transition-colors">{t('responsible_disclosure')}</a>
            <span className="text-gray-400 dark:text-gray-600 hidden sm:inline">•</span>
            <a href="/withdrawal-policy" className="hover:text-gray-900 dark:hover:text-gray-300 hover:underline transition-colors">{t('withdrawal_policy')}</a>
          </div>
        </div>
      </div>
      </footer>
    </>
  );
}
