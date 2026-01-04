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
      <footer className="glass-footer relative overflow-hidden text-gray-700 dark:text-gray-300 border-t border-gray-200/50 dark:border-gray-700/30 bg-gradient-to-br from-white via-primary-50/30 to-blue-50/40 dark:from-gray-900 dark:via-gray-900/95 dark:to-gray-900 backdrop-blur-xl">
        {/* Decorative background shapes for light mode */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
          {/* Large circle top-left */}
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-primary-100/40 dark:bg-transparent rounded-full blur-3xl" />
          {/* Medium circle bottom-right */}
          <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-blue-100/50 dark:bg-transparent rounded-full blur-3xl" />
          {/* Small accent top-right */}
          <div className="absolute top-20 right-1/4 w-64 h-64 bg-primary-200/30 dark:bg-transparent rounded-full blur-2xl" />
          {/* Floating geometric shapes */}
          <div className="absolute top-1/4 left-1/3 w-40 h-40 bg-primary-50/60 dark:bg-transparent rotate-45 blur-xl" />
          <div className="absolute bottom-1/3 right-1/3 w-32 h-32 bg-blue-50/70 dark:bg-transparent rounded-full blur-xl" />
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-primary-50/20 via-transparent to-transparent dark:from-transparent" />
        </div>
        
        {/* Glass blob effects for dark mode */}
        <span className="glass-blob blob-a" aria-hidden="true" />
        <span className="glass-blob blob-b" aria-hidden="true" />
        
      <div className="relative z-10 max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-8 sm:py-10 md:py-12 lg:py-16">
        <div className={`grid grid-cols-2 sm:grid-cols-3 ${isSystemAdmin ? 'md:grid-cols-4 lg:grid-cols-6' : 'md:grid-cols-4 lg:grid-cols-5'} gap-6 sm:gap-8 md:gap-10`}>
          {/* Logo, description, social icons */}
          <div className="col-span-2 sm:col-span-3 md:col-span-1">
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <img
                src={isDarkMode ? "/darkmode.svg?v=8" : "/lightmode.svg?v=8"}
                alt="CITRICLOUD"
                width="667"
                height="60"
                className="h-7 sm:h-8 md:h-9 w-auto"
              />
            </div>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-4 sm:mb-5 leading-relaxed max-w-xs">
              CITRICLOUD is an enterprise-grade cloud platform delivering integrated CRM, CMS, ERP, and email workspace solutions. Built for scalability and performance, we empower businesses to streamline operations and accelerate digital transformation.
            </p>
            <div className="flex gap-3 sm:gap-4">
              <a 
                href="https://twitter.com/citricloud" 
                title="Twitter" 
                aria-label="Twitter" 
                className="flex items-center justify-center w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-blue-500 hover:text-white dark:hover:bg-blue-500 transition-all duration-300 hover:scale-110 hover:shadow-lg"
              >
                <FaTwitter size={16} />
              </a>
              <a 
                href="https://github.com/citricloud" 
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
            <a 
              href={getVersionInfo().githubUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100/80 dark:bg-gray-800/80 border border-gray-300/50 dark:border-gray-700/50 hover:bg-gray-200 dark:hover:bg-gray-700 hover:border-primary-400 dark:hover:border-primary-500 transition-all duration-300 hover:scale-105 hover:shadow-md"
              title="View on GitHub"
            >
              <FaGithub size={14} />
              <span className="font-mono font-semibold">v{getVersionInfo().version}</span>
            </a>
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
    </>
  );
}
