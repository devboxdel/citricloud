import { FiPhone, FiMail, FiMapPin, FiClock, FiChevronDown } from 'react-icons/fi';
import { FaFacebook, FaTwitter, FaLinkedin, FaInstagram } from 'react-icons/fa';
import { useLanguage } from '../context/LanguageContext';
import { useState, useRef, useEffect } from 'react';

const FlagIcon = ({ code }: { code: string }) => {
  const flags: Record<string, string> = {
    en: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2MCAzMCI+PHJlY3Qgd2lkdGg9IjYwIiBoZWlnaHQ9IjMwIiBmaWxsPSIjMDEyMTY5Ii8+PHBhdGggZD0iTTAgMGw2MCAzME0wIDMwTDYwIDBNNjAgMGwtNjAgMzBNNjAgMzBMMCAwIiBzdHJva2U9IiNmZmYiIHN0cm9rZS13aWR0aD0iNiIvPjxwYXRoIGQ9Ik0wIDBsNjAgMzBNMCAzMEw2MCAwTTYwIDBsLTYwIDMwTTYwIDMwTDAgMCIgc3Ryb2tlPSIjQzgxMDJFIiBzdHJva2Utd2lkdGg9IjQiLz48cGF0aCBkPSJNMzAgMHYzME0wIDE1aDYwIiBzdHJva2U9IiNmZmYiIHN0cm9rZS13aWR0aD0iMTAiLz48cGF0aCBkPSJNMzAgMHYzME0wIDE1aDYwIiBzdHJva2U9IiNDODEwMkUiIHN0cm9rZS13aWR0aD0iNiIvPjwvc3ZnPg==',
    nl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA5IDYiPjxyZWN0IGZpbGw9IiNBRTFDMjgiIHdpZHRoPSI5IiBoZWlnaHQ9IjYiLz48cmVjdCBmaWxsPSIjZmZmIiB5PSIyIiB3aWR0aD0iOSIgaGVpZ2h0PSIyIi8+PHJlY3QgZmlsbD0iIzIxNDY4QiIgeT0iNCIgd2lkdGg9IjkiIGhlaWdodD0iMiIvPjwvc3ZnPg==',
    de: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1IDMiPjxyZWN0IHdpZHRoPSI1IiBoZWlnaHQ9IjMiLz48cmVjdCB5PSIxIiB3aWR0aD0iNSIgaGVpZ2h0PSIyIiBmaWxsPSIjRDAwIi8+PHJlY3QgeT0iMiIgd2lkdGg9IjUiIGhlaWdodD0iMSIgZmlsbD0iI0ZGQ0UwMCIvPjwvc3ZnPg==',
    fr: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzIDIiPjxyZWN0IHdpZHRoPSIzIiBoZWlnaHQ9IjIiIGZpbGw9IiNFRDI5MzkiLz48cmVjdCB3aWR0aD0iMiIgaGVpZ2h0PSIyIiBmaWxsPSIjZmZmIi8+PHJlY3Qgd2lkdGg9IjEiIGhlaWdodD0iMiIgZmlsbD0iIzAwMjM5NSIvPjwvc3ZnPg==',
    es: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA3NTAgNTAwIj48cmVjdCB3aWR0aD0iNzUwIiBoZWlnaHQ9IjUwMCIgZmlsbD0iI0FBMTUxQiIvPjxyZWN0IHk9IjEyNSIgd2lkdGg9Ijc1MCIgaGVpZ2h0PSIyNTAiIGZpbGw9IiNGMUJGMDAiLz48L3N2Zz4='
  };
  return <img src={flags[code]} alt={code} className="w-5 h-4 rounded-sm inline-block" />;
};

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'nl', label: 'Nederlands' },
  { code: 'de', label: 'Deutsch' },
  { code: 'fr', label: 'Français' },
  { code: 'es', label: 'Español' },
];

export default function Topbar() {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const currentLang = LANGUAGES.find(lang => lang.code === language) || LANGUAGES[0];
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  return (
    <div className="fixed top-0 left-0 right-0 w-full z-[60] bg-gradient-to-r from-primary-600 via-primary-700 to-primary-600 dark:from-black dark:via-gray-950 dark:to-black text-white dark:text-gray-200 shadow-md">
      <div className="container mx-auto px-2 sm:px-4 md:px-6 lg:px-8 max-w-7xl">
        {/* Mobile & Tablet: Compact single-line layout */}
        <div className="flex items-center justify-between py-1 sm:py-1.5 gap-0.5 sm:gap-2 md:hidden text-[10px] sm:text-xs">
          {/* Icons only on mobile */}
          <div className="flex items-center gap-0.5">
            <a 
              href="tel:+31612345678" 
              className="hover:text-primary-100 dark:hover:text-primary-300 transition-colors p-0.5"
              title="+31 6 1234 5678"
            >
              <FiPhone className="w-3 h-3" />
            </a>
            <a 
              href="mailto:info@citricloud.com" 
              className="hover:text-primary-100 dark:hover:text-primary-300 transition-colors p-0.5"
              title="info@citricloud.com"
            >
              <FiMail className="w-3 h-3" />
            </a>
          </div>

          {/* Social & Language on mobile */}
          <div className="flex items-center gap-1 sm:gap-2">
            <a 
              href="https://facebook.com/citricloud" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-primary-100 dark:hover:text-primary-300 hover:scale-110 transition-all"
              aria-label="Facebook"
            >
              <FaFacebook className="w-3 h-3" />
            </a>
            <a 
              href="https://twitter.com/citricloud" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-primary-100 dark:hover:text-primary-300 hover:scale-110 transition-all"
              aria-label="Twitter"
            >
              <FaTwitter className="w-3 h-3" />
            </a>
            <a 
              href="https://linkedin.com/company/citricloud" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-primary-100 dark:hover:text-primary-300 hover:scale-110 transition-all"
              aria-label="LinkedIn"
            >
              <FaLinkedin className="w-3 h-3" />
            </a>
            <a 
              href="https://instagram.com/citricloud" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-primary-100 dark:hover:text-primary-300 hover:scale-110 transition-all"
              aria-label="Instagram"
            >
              <FaInstagram className="w-3 h-3" />
            </a>
            <div className="w-px h-3 bg-white/30 dark:bg-gray-700/50"></div>
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-1.5 px-2 py-1 rounded-lg border border-white/30 bg-white/10 hover:bg-white/20 transition-all text-xs"
                aria-label="Select language"
              >
                <FlagIcon code={currentLang.code} />
                <FiChevronDown className="w-3 h-3" />
              </button>
              {isOpen && (
                <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-1 min-w-[160px] z-50">
                  {LANGUAGES.map((lng) => (
                    <button
                      key={lng.code}
                      onClick={() => {
                        setLanguage(lng.code as typeof language);
                        setIsOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                        language === lng.code ? 'bg-gray-50 dark:bg-gray-700/50' : ''
                      }`}
                    >
                      <FlagIcon code={lng.code} />
                      <span className="text-gray-900 dark:text-gray-100">{lng.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Desktop: Full layout with all details */}
        <div className="hidden md:flex items-center justify-between py-2 gap-4 text-sm">
          {/* Left side - Contact info */}
          <div className="flex items-center gap-4 font-medium">
            <a 
              href="tel:+31612345678" 
              className="flex items-center gap-1.5 hover:text-primary-100 dark:hover:text-primary-300 transition-colors"
            >
              <FiPhone className="w-4 h-4" />
              <span>+31 6 1234 5678</span>
            </a>
            <a 
              href="mailto:info@citricloud.com" 
              className="flex items-center gap-1.5 hover:text-primary-100 dark:hover:text-primary-300 transition-colors"
            >
              <FiMail className="w-4 h-4" />
              <span>info@citricloud.com</span>
            </a>
            <div className="flex items-center gap-1.5">
              <FiClock className="w-4 h-4" />
              <span>Mon-Fri: 9:00 AM - 6:00 PM</span>
            </div>
          </div>

          {/* Right side - Social media & Language */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <a 
                href="https://facebook.com/citricloud" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-primary-100 dark:hover:text-primary-300 hover:scale-110 transition-all"
                aria-label="Facebook"
              >
                <FaFacebook className="w-4 h-4" />
              </a>
              <a 
                href="https://twitter.com/citricloud" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-primary-100 dark:hover:text-primary-300 hover:scale-110 transition-all"
                aria-label="Twitter"
              >
                <FaTwitter className="w-4 h-4" />
              </a>
              <a 
                href="https://linkedin.com/company/citricloud" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-primary-100 dark:hover:text-primary-300 hover:scale-110 transition-all"
                aria-label="LinkedIn"
              >
                <FaLinkedin className="w-4 h-4" />
              </a>
              <a 
                href="https://instagram.com/citricloud" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-primary-100 dark:hover:text-primary-300 hover:scale-110 transition-all"
                aria-label="Instagram"
              >
                <FaInstagram className="w-4 h-4" />
              </a>
            </div>
            <div className="h-5 w-px bg-white/30 dark:bg-gray-700/50"></div>
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/30 bg-white/10 hover:bg-white/20 transition-all"
                aria-label="Select language"
              >
                <FlagIcon code={currentLang.code} />
                <FiChevronDown className="w-4 h-4" />
              </button>
              {isOpen && (
                <div className="absolute right-0 top-full mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-1 min-w-[200px] z-50">
                  {LANGUAGES.map((lng) => (
                    <button
                      key={lng.code}
                      onClick={() => {
                        setLanguage(lng.code as typeof language);
                        setIsOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                        language === lng.code ? 'bg-primary-50 dark:bg-primary-900/20' : ''
                      }`}
                    >
                      <FlagIcon code={lng.code} />
                      <span className="text-gray-900 dark:text-gray-100 font-medium">{lng.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
