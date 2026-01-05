import { FiPhone, FiMail, FiClock, FiAlertCircle } from 'react-icons/fi';
import { FaFacebook, FaTwitter, FaLinkedin, FaInstagram } from 'react-icons/fa';

export default function Topbar() {
  return (
    <>
      {/* Development Notice Marquee */}
      <div className="fixed top-0 left-0 right-0 w-full z-[61] bg-yellow-500 dark:bg-yellow-600 text-gray-900 dark:text-gray-100 overflow-hidden h-[32px]">
        <div className="flex h-full">
          <div className="animate-marquee whitespace-nowrap py-1.5 text-sm font-medium flex items-center">
            <span className="inline-flex items-center gap-2 px-4">
              <FiAlertCircle className="w-4 h-4" />
              ⚠️ DEVELOPMENT MODE: This website is currently under development. Some features may not work properly.
            </span>
            <span className="inline-flex items-center gap-2 px-4">
              <FiAlertCircle className="w-4 h-4" />
              ⚠️ DEVELOPMENT MODE: This website is currently under development. Some features may not work properly.
            </span>
            <span className="inline-flex items-center gap-2 px-4">
              <FiAlertCircle className="w-4 h-4" />
              ⚠️ DEVELOPMENT MODE: This website is currently under development. Some features may not work properly.
            </span>
            <span className="inline-flex items-center gap-2 px-4">
              <FiAlertCircle className="w-4 h-4" />
              ⚠️ DEVELOPMENT MODE: This website is currently under development. Some features may not work properly.
            </span>
          </div>
          <div className="animate-marquee whitespace-nowrap py-1.5 text-sm font-medium flex items-center">
            <span className="inline-flex items-center gap-2 px-4">
              <FiAlertCircle className="w-4 h-4" />
              ⚠️ DEVELOPMENT MODE: This website is currently under development. Some features may not work properly.
            </span>
            <span className="inline-flex items-center gap-2 px-4">
              <FiAlertCircle className="w-4 h-4" />
              ⚠️ DEVELOPMENT MODE: This website is currently under development. Some features may not work properly.
            </span>
            <span className="inline-flex items-center gap-2 px-4">
              <FiAlertCircle className="w-4 h-4" />
              ⚠️ DEVELOPMENT MODE: This website is currently under development. Some features may not work properly.
            </span>
            <span className="inline-flex items-center gap-2 px-4">
              <FiAlertCircle className="w-4 h-4" />
              ⚠️ DEVELOPMENT MODE: This website is currently under development. Some features may not work properly.
            </span>
          </div>
        </div>
      </div>

      {/* Original Topbar - positioned directly after marquee */}
      <div className="fixed top-[32px] left-0 right-0 w-full z-[60] bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-black dark:via-gray-950 dark:to-black text-gray-100 border-b border-gray-700/50 dark:border-gray-800/50">
        <div className="container mx-auto px-2 sm:px-4 md:px-6 lg:px-8 max-w-7xl">
        {/* Mobile & Tablet: Compact single-line layout */}
        <div className="flex items-center justify-between py-1.5 sm:py-2 gap-2 sm:gap-3 md:hidden text-[11px] sm:text-xs">
          {/* Contact icons on mobile */}
          <div className="flex items-center gap-2 sm:gap-3">
            <a 
              href="tel:+31612345678" 
              className="flex items-center gap-1 hover:text-primary-400 transition-colors"
              title="+31 6 1234 5678"
            >
              <FiPhone className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Call</span>
            </a>
            <a 
              href="mailto:info@citricloud.com" 
              className="flex items-center gap-1 hover:text-primary-400 transition-colors"
              title="info@citricloud.com"
            >
              <FiMail className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Email</span>
            </a>
          </div>

          {/* Social media on mobile */}
          <div className="flex items-center gap-2 sm:gap-3">
            <a 
              href="https://facebook.com/citricloud" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-blue-400 transition-colors"
              aria-label="Facebook"
            >
              <FaFacebook className="w-3.5 h-3.5" />
            </a>
            <a 
              href="https://twitter.com/citricloud" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-sky-400 transition-colors"
              aria-label="Twitter"
            >
              <FaTwitter className="w-3.5 h-3.5" />
            </a>
            <a 
              href="https://linkedin.com/company/citricloud" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-blue-500 transition-colors"
              aria-label="LinkedIn"
            >
              <FaLinkedin className="w-3.5 h-3.5" />
            </a>
            <a 
              href="https://instagram.com/citricloud" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-pink-400 transition-colors"
              aria-label="Instagram"
            >
              <FaInstagram className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Desktop: Full layout with all details */}
        <div className="hidden md:flex items-center justify-between py-2.5 gap-6 text-sm">
          {/* Left side - Contact info */}
          <div className="flex items-center gap-6 font-medium">
            <a 
              href="tel:+31612345678" 
              className="flex items-center gap-2 hover:text-primary-400 transition-colors"
            >
              <FiPhone className="w-4 h-4" />
              <span>+31 6 1234 5678</span>
            </a>
            <a 
              href="mailto:info@citricloud.com" 
              className="flex items-center gap-2 hover:text-primary-400 transition-colors"
            >
              <FiMail className="w-4 h-4" />
              <span>info@citricloud.com</span>
            </a>
            <div className="flex items-center gap-2 text-gray-300">
              <FiClock className="w-4 h-4" />
              <span>Mon-Fri: 9:00 AM - 6:00 PM</span>
            </div>
          </div>

          {/* Right side - Social media */}
          <div className="flex items-center gap-4">
            <span className="text-xs text-gray-400 uppercase tracking-wider">Follow Us</span>
            <div className="flex items-center gap-3">
              <a 
                href="https://facebook.com/citricloud" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-blue-400 hover:scale-110 transition-all"
                aria-label="Facebook"
              >
                <FaFacebook className="w-4 h-4" />
              </a>
              <a 
                href="https://twitter.com/citricloud" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-sky-400 hover:scale-110 transition-all"
                aria-label="Twitter"
              >
                <FaTwitter className="w-4 h-4" />
              </a>
              <a 
                href="https://linkedin.com/company/citricloud" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-blue-500 hover:scale-110 transition-all"
                aria-label="LinkedIn"
              >
                <FaLinkedin className="w-4 h-4" />
              </a>
              <a 
                href="https://instagram.com/citricloud" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-pink-400 hover:scale-110 transition-all"
                aria-label="Instagram"
              >
                <FaInstagram className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
      </div>
    </>
  );
}
