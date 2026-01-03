import { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import { FiTrendingUp, FiUser, FiSettings, FiBriefcase, FiLogOut, FiMenu, FiX, FiChevronDown, FiShoppingCart, FiCloud, FiCode, FiSmartphone, FiShoppingBag, FiDatabase, FiAperture, FiGitBranch, FiUploadCloud, FiHelpCircle, FiServer, FiShield, FiHardDrive, FiArrowRight, FiLayout, FiMail, FiMessageCircle, FiPhone, FiMapPin, FiClock } from 'react-icons/fi';
import ThemeToggle from './ThemeToggle';
import NotificationBell from './NotificationBell';
import { motion, AnimatePresence } from 'framer-motion';
import { cmsAPI, authAPI, shopAPI } from '../lib/api';

type NavbarProps = {
  transparent?: boolean; // Transparent header for hero sections
};

export default function Navbar({ transparent = false }: NavbarProps) {
  const authStore = useAuthStore();
  // Subscribe directly to cart items so the badge updates as soon as the store rehydrates
  const cartItemCount = useCartStore((state) =>
    state.items.reduce((total, item) => total + item.quantity, 0)
  );
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openSubMenus, setOpenSubMenus] = useState<{ [key: string | number]: boolean }>({});
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [profileDropdownPosition, setProfileDropdownPosition] = useState({ top: 0, left: 0 });
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [latestBlogPosts, setLatestBlogPosts] = useState<any[]>([]);
  const isDashboardDomain = typeof window !== 'undefined' && window.location.hostname === 'my.citricloud.com';
  
  const profileRef = useRef<HTMLDivElement>(null);
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  const menuDropdownRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});
  const PROFILE_DROPDOWN_WIDTH = 240;
  
  // Get fresh auth state on every render
  const isAuthenticated = authStore.isAuthenticated;
  const user = authStore.user;
  
  // Check if user has Workspace access
  const hasWorkspaceAccess = ['system_admin', 'administrator', 'developer'].includes(user?.role || '');
  
  // Auth is loaded synchronously on store init, no need for useEffect
  
  // Check if we're on login/register pages to disable API queries
  const isAuthPage = typeof window !== 'undefined' && (
    window.location.pathname === '/login' || 
    window.location.pathname === '/register'
  );

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

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      // Close other menu dropdowns
      Object.keys(openSubMenus).forEach((key) => {
        const menuRef = menuDropdownRefs.current[key as any];
        if (menuRef && !menuRef.contains(target)) {
          setOpenSubMenus((prev) => ({ ...prev, [key]: false }));
        }
      });
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openSubMenus]);

  // Track profile dropdown position for portal rendering
  useEffect(() => {
    const updatePosition = () => {
      if (profileRef.current) {
        const rect = profileRef.current.getBoundingClientRect();
        const dropdownWidth = 224; // w-56 = 14rem = 224px
        const left = rect.right - dropdownWidth; // Align right edge with button
        setProfileDropdownPosition({
          top: rect.bottom + 8,
          left: Math.max(16, left), // Ensure 16px minimum padding from left edge
        });
      }
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition);
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition);
    };
  }, [profileDropdownOpen]);

  // Fetch latest blog posts
  useEffect(() => {
    // Temporarily disabled - just show empty list
    // TODO: Re-enable when API is stable
    setLatestBlogPosts([]);
    return;
    
    /* DISABLED FOR NOW
    // Skip fetching on auth pages
    if (isAuthPage) return;
    
    // Only fetch in browser context
    if (typeof window === 'undefined') return;
    
    const fetchBlogPosts = async () => {
      try {
        const response = await cmsAPI.getBlogPosts({ page: 1, page_size: 3, status: 'published' });
        if (response && response.data && response.data.items) {
          setLatestBlogPosts(response.data.items);
        }
      } catch (error) {
        // Silently fail - just don't show blog posts in menu
        setLatestBlogPosts([]);
      }
    };

    // Add small delay to ensure API client is ready
    const timer = setTimeout(() => {
      fetchBlogPosts();
    }, 100);

    return () => clearTimeout(timer);
    */
  }, []);

  // Portals handle their own click-outside via overlays

  // Default menu items - all absolute subdomain URLs
  const defaultMenuItems = [
    { id: 'home', title: 'Home', url: 'https://citricloud.com/', icon: null },
    { id: 'about', title: 'About', url: 'https://about.citricloud.com/', icon: null },
    { 
      id: 'services', 
      title: 'Services', 
      url: '/services', 
      icon: null,
      hasSubmenu: true,
      isMegaMenu: true,
      isServicesMenu: true,
      submenu: [
        {
          category: 'Cloud & Infrastructure',
          items: [
            { id: 'cloud-hosting', title: 'Cloud Hosting', url: '/services/cloud-hosting', icon: FiCloud, description: 'Scalable cloud infrastructure' },
            { id: 'cloud-migration', title: 'Cloud Migration', url: '/services/cloud-migration', icon: FiUploadCloud, description: 'Seamless cloud transition' },
            { id: 'database-management', title: 'Database Management', url: '/services/database-management', icon: FiDatabase, description: 'Database design & admin' },
          ]
        },
        {
          category: 'Development',
          items: [
            { id: 'web-development', title: 'Web Development', url: '/services/web-development', icon: FiCode, description: 'Custom web applications' },
            { id: 'app-development', title: 'App Development', url: '/services/app-development', icon: FiSmartphone, description: 'Mobile & desktop apps' },
            { id: 'api-development', title: 'API Development', url: '/services/api-development', icon: FiAperture, description: 'RESTful & GraphQL APIs' },
          ]
        },
        {
          category: 'DevOps & Operations',
          items: [
            { id: 'devops', title: 'DevOps & CI/CD', url: '/services/devops', icon: FiGitBranch, description: 'Automated pipelines' },
            { id: 'managed-services', title: 'Managed Services', url: '/services/managed-services', icon: FiServer, description: '24/7 infrastructure support' },
          ]
        },
        {
          category: 'Security & Backup',
          items: [
            { id: 'security', title: 'Security Services', url: '/services/security', icon: FiShield, description: 'Cybersecurity & compliance' },
            { id: 'backup-recovery', title: 'Backup & Recovery', url: '/services/backup-recovery', icon: FiHardDrive, description: 'Data protection solutions' },
          ]
        },
        {
          category: 'Business Solutions',
          items: [
            { id: 'workspace', title: 'Workspace', url: '/services/workspace', icon: FiLayout, description: 'Collaborative workspace platform' },
            { id: 'e-commerce', title: 'E-commerce Solutions', url: '/services/e-commerce', icon: FiShoppingBag, description: 'Online stores & marketplaces' },
            { id: 'consulting', title: 'IT Consulting', url: '/services/consulting', icon: FiHelpCircle, description: 'Expert technology guidance' },
          ]
        },
      ]
    },
    { 
      id: 'blog', 
      title: 'Blog', 
      url: 'https://blog.citricloud.com/', 
      icon: null,
      hasSubmenu: true,
      isMegaMenu: true,
      isBlogMenu: true,
      submenu: [
        { id: 'latest-posts', title: 'Latest Posts', url: 'https://blog.citricloud.com/', icon: null, description: 'Recent articles and updates' },
        { id: 'tutorials', title: 'Tutorials', url: 'https://blog.citricloud.com/category/tutorials', icon: null, description: 'Step-by-step guides' },
        { id: 'news', title: 'News', url: 'https://blog.citricloud.com/category/news', icon: null, description: 'Industry news and insights' },
        { id: 'case-studies', title: 'Case Studies', url: 'https://blog.citricloud.com/category/case-studies', icon: null, description: 'Success stories' },
      ]
    },
    { 
      id: 'shop', 
      title: 'Shop', 
      url: 'https://shop.citricloud.com/', 
      icon: null,
      hasSubmenu: true,
      isMegaMenu: true,
      isShopMenu: true,
      submenu: [
        { id: 'all-products', title: 'All Products', url: 'https://shop.citricloud.com/catalog', icon: null, description: 'Browse our catalog', featured: true },
        { id: 'hosting-plans', title: 'Hosting Plans', url: 'https://shop.citricloud.com/hosting-plans', icon: null, description: 'Web and cloud hosting', category: 'products' },
        { id: 'software', title: 'Software', url: 'https://shop.citricloud.com/software', icon: null, description: 'Software licenses', category: 'products' },
        { id: 'domains', title: 'Domains', url: 'https://shop.citricloud.com/domains', icon: null, description: 'Register domains', category: 'products' },
        { id: 'ssl-certificates', title: 'SSL Certificates', url: 'https://shop.citricloud.com/ssl', icon: null, description: 'Secure your website', category: 'services' },
        { id: 'control-panels', title: 'Control Panels', url: 'https://shop.citricloud.com/control-panels', icon: null, description: 'cPanel, Plesk & more', category: 'services' },
        { id: 'special-offers', title: 'Special Offers', url: 'https://shop.citricloud.com/special-offers', icon: null, description: 'Deals and discounts', category: 'offers' },
      ]
    },
    { 
      id: 'contact', 
      title: 'Contact', 
      url: 'https://contact.citricloud.com/', 
      icon: null,
      hasSubmenu: true,
      isMegaMenu: true,
      isContactMenu: true,
      submenu: [
        { 
          id: 'contact-form', 
          title: 'Contact Form', 
          url: 'https://contact.citricloud.com/', 
          icon: FiMail, 
          description: 'Get in touch with us',
          info: 'Fill out our contact form and we\'ll respond within 24 hours'
        },
        { 
          id: 'support', 
          title: 'Support Center', 
          url: 'https://help.citricloud.com/', 
          icon: FiHelpCircle, 
          description: 'Get help and support',
          info: 'Browse our knowledge base and FAQs'
        },
        { 
          id: 'sales', 
          title: 'Sales Inquiry', 
          url: 'mailto:sales@citricloud.com', 
          icon: FiMessageCircle, 
          description: 'Talk to our sales team',
          info: 'sales@citricloud.com'
        },
        { 
          id: 'phone', 
          title: 'Phone Support', 
          url: 'tel:+1-800-123-4567', 
          icon: FiPhone, 
          description: 'Call us directly',
          info: '+1 (800) 123-4567'
        },
        { 
          id: 'office', 
          title: 'Office Location', 
          url: 'https://maps.google.com', 
          icon: FiMapPin, 
          description: 'Visit our office',
          info: '123 Cloud Street, San Francisco, CA 94105'
        },
        { 
          id: 'hours', 
          title: 'Business Hours', 
          url: '#', 
          icon: FiClock, 
          description: 'When we\'re available',
          info: 'Mon-Fri: 9AM-6PM PST'
        },
      ]
    },
  ];

  // Fetch header menu from CMS (optional override)
  const { data: headerMenus } = useQuery({
    queryKey: ['header-menu'],
    queryFn: async () => {
      const response = await cmsAPI.getMenus();
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    enabled: false, // Disabled by default, can be enabled later
  });

  // Find the active header menu
  const headerMenu = headerMenus?.find((menu: any) => 
    menu.location === 'header' && menu.is_active
  );

  // Get top-level menu items (no parent) - use CMS menu if available, otherwise use default
  const topLevelItems = headerMenu?.menu_items?.length > 0
    ? headerMenu.menu_items.filter((item: any) => !item.parent_id && item.is_active).sort((a: any, b: any) => a.order_index - b.order_index)
    : defaultMenuItems;

  // Get children for a menu item
  const getChildren = (parentId: number | string) => {
    // First check if item has submenu property (for default menu items)
    const parentItem = topLevelItems.find((item: any) => item.id === parentId);
    if (parentItem?.submenu) {
      return parentItem.submenu;
    }
    // Otherwise get children from CMS menu
    return headerMenu?.menu_items?.filter((item: any) => 
      item.parent_id === parentId && item.is_active
    ).sort((a: any, b: any) => a.order_index - b.order_index) || [];
  };

  const toggleSubMenu = (itemId: number | string) => {
    setOpenSubMenus(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  return (
    <>
    <nav className={`fixed top-0 left-0 right-0 w-full z-50 ${
      transparent 
        ? 'bg-transparent' 
        : 'bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl shadow-lg border-b border-white/30 dark:border-gray-700/30'
    }`}>
      <div className="container mx-auto px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 max-w-7xl overflow-x-hidden overflow-y-visible">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center shrink-0">
            <img
              src={transparent ? "/darkmode.svg?v=8" : (isDarkMode ? "/darkmode.svg?v=8" : "/lightmode.svg?v=8")}
              alt="CITRICLOUD"
              width="667"
              height="60"
              className={`${isDashboardDomain ? 'h-4 sm:h-4 md:h-5' : 'h-4 sm:h-4 md:h-5'} w-auto transition-all max-w-[120px] sm:max-w-none`}
            />
          </div>

          <div className="hidden lg:flex items-center space-x-1">
            {topLevelItems.map((item: any) => {
              const children = getChildren(item.id);
              const hasChildren = children.length > 0 || item.hasSubmenu;

              // Other items with dropdowns
              if (hasChildren) {
                return (
                  <div
                    key={item.id}
                    ref={(el) => menuDropdownRefs.current[item.id] = el}
                    className="relative menu-dropdown-container"
                  >
                    <button 
                      title={item.title}
                      aria-label={item.title}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        const newState = !openSubMenus[item.id];
                        console.log('Menu dropdown', item.id, 'clicked, new state:', newState);
                        setOpenSubMenus({ ...openSubMenus, [item.id]: newState });
                        if (newState) {
                          setProfileDropdownOpen(false);
                          setNotificationOpen(false);
                        }
                      }}
                      className={`px-4 py-2 rounded-lg ${
                        transparent 
                          ? 'text-white hover:text-primary-300 hover:bg-white/10' 
                          : 'text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                      } font-medium transition-all flex items-center gap-1`}
                    >
                      {item.icon && <i className={`${item.icon} w-4 h-4`}></i>}
                      {item.title}
                      <FiChevronDown className={`w-4 h-4 transition-transform duration-300 ${openSubMenus[item.id] ? 'rotate-180' : ''}`} />
                    </button>
                    
                    <AnimatePresence>
                      {openSubMenus[item.id] && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          transition={{ duration: 0.2 }}
                          className={item.isMegaMenu 
                            ? "fixed left-0 right-0 top-[72px] mx-auto max-w-7xl px-4 z-[9999]" 
                            : "absolute left-0 top-full mt-2 min-w-[240px] bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 py-2 z-[9999] overflow-hidden"
                          }
                        >
                          {item.isMegaMenu ? (
                            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6">
                              {item.isShopMenu ? (
                                // Shop menu layout - Products left, Services & Offers right
                                <div className="space-y-4">
                                  {/* Featured Item */}
                                  {children.filter((child: any) => child.featured).map((child: any) => (
                                    <a
                                      key={child.id}
                                      href={child.url}
                                      target={child.target}
                                      className="group block p-4 rounded-lg bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 border-2 border-primary-200 dark:border-primary-700 hover:border-primary-400 dark:hover:border-primary-500 transition-all"
                                    >
                                      <div className="flex items-center justify-between">
                                        <div>
                                          <h3 className="text-base font-bold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                                            {child.title}
                                          </h3>
                                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                                            {child.description}
                                          </p>
                                        </div>
                                        <FiShoppingCart className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                                      </div>
                                    </a>
                                  ))}

                                  {/* Two Column Layout */}
                                  <div className="grid grid-cols-2 gap-6">
                                    {/* Left Column - Products */}
                                    <div>
                                      <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3 px-2">
                                        Products
                                      </h4>
                                      <div className="space-y-2">
                                        {children.filter((child: any) => child.category === 'products').map((child: any) => (
                                          <a
                                            key={child.id}
                                            href={child.url}
                                            target={child.target}
                                            className="group block p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
                                          >
                                            <div className="flex flex-col gap-1">
                                              <span className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                                                {child.title}
                                              </span>
                                              <p className="text-xs text-gray-600 dark:text-gray-400">
                                                {child.description}
                                              </p>
                                            </div>
                                          </a>
                                        ))}
                                      </div>
                                    </div>

                                    {/* Right Column - Services & Offers */}
                                    <div>
                                      <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3 px-2">
                                        Services & Offers
                                      </h4>
                                      <div className="space-y-2">
                                        {/* Services */}
                                        {children.filter((child: any) => child.category === 'services').map((child: any) => (
                                          <a
                                            key={child.id}
                                            href={child.url}
                                            target={child.target}
                                            className="group block p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
                                          >
                                            <div className="flex flex-col gap-1">
                                              <span className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                                                {child.title}
                                              </span>
                                              <p className="text-xs text-gray-600 dark:text-gray-400">
                                                {child.description}
                                              </p>
                                            </div>
                                          </a>
                                        ))}
                                        {/* Offers */}
                                        {children.filter((child: any) => child.category === 'offers').map((child: any) => (
                                          <a
                                            key={child.id}
                                            href={child.url}
                                            target={child.target}
                                            className="group block p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/30 transition-all"
                                          >
                                            <div className="flex items-start justify-between gap-2">
                                              <div className="flex flex-col gap-1">
                                                <span className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                                                  {child.title}
                                                </span>
                                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                                  {child.description}
                                                </p>
                                              </div>
                                              <span className="text-[10px] bg-red-500 text-white px-2 py-0.5 rounded-full font-bold whitespace-nowrap">
                                                SALE
                                              </span>
                                            </div>
                                          </a>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ) : item.isBlogMenu ? (
                                // Blog menu layout - Featured top, 2 columns below
                                <div className="space-y-6">
                                  {/* Featured Post Section */}
                                  <div>
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3 px-2">
                                      Featured Posts
                                    </h4>
                                    <a
                                      href={children[0].url}
                                      target={children[0].target}
                                      className="group block p-5 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 hover:border-blue-400 dark:hover:border-blue-600 transition-all"
                                    >
                                      <div className="flex items-center justify-between">
                                        <div>
                                          <h3 className="text-base font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                            {children[0].title}
                                          </h3>
                                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                            {children[0].description}
                                          </p>
                                        </div>
                                        <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                      </div>
                                    </a>
                                  </div>

                                  {/* Two Column Layout */}
                                  <div className="grid grid-cols-2 gap-6">
                                    {/* Left Column - Categories */}
                                    <div>
                                      <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3 px-2">
                                        Categories
                                      </h4>
                                      <div className="space-y-1">
                                        {children.slice(1).map((child: any) => (
                                          <a
                                            key={child.id}
                                            href={child.url}
                                            target={child.target}
                                            className="group flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                                          >
                                            <div>
                                              <div className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                                                {child.title}
                                              </div>
                                              <p className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">
                                                {child.description}
                                              </p>
                                            </div>
                                            <svg className="w-4 h-4 text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                          </a>
                                        ))}
                                      </div>
                                    </div>

                                    {/* Right Column - Latest Posts */}
                                    <div>
                                      <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3 px-2">
                                        Latest Posts
                                      </h4>
                                      <div className="space-y-3">
                                        {latestBlogPosts.length > 0 ? (
                                          latestBlogPosts.map((post: any, index: number) => {
                                            const colors = [
                                              { from: 'from-primary-100', to: 'to-primary-200', darkFrom: 'dark:from-primary-900/30', darkTo: 'dark:to-primary-800/30', iconColor: 'text-primary-600', darkIconColor: 'dark:text-primary-400' },
                                              { from: 'from-indigo-100', to: 'to-indigo-200', darkFrom: 'dark:from-indigo-900/30', darkTo: 'dark:to-indigo-800/30', iconColor: 'text-indigo-600', darkIconColor: 'dark:text-indigo-400' },
                                              { from: 'from-purple-100', to: 'to-purple-200', darkFrom: 'dark:from-purple-900/30', darkTo: 'dark:to-purple-800/30', iconColor: 'text-purple-600', darkIconColor: 'dark:text-purple-400' },
                                            ];
                                            const color = colors[index % colors.length];
                                            const postDate = new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                                            const postUrl = `https://blog.citricloud.com/${post.slug}`;

                                            return (
                                              <a
                                                key={post.id}
                                                href={postUrl}
                                                className="group flex gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                                              >
                                                {post.featured_image_url ? (
                                                  <img 
                                                    src={post.featured_image_url} 
                                                    alt={post.title}
                                                    className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                                                  />
                                                ) : (
                                                  <div className={`w-16 h-16 rounded-lg bg-gradient-to-br ${color.from} ${color.to} ${color.darkFrom} ${color.darkTo} flex-shrink-0 flex items-center justify-center`}>
                                                    <svg className={`w-6 h-6 ${color.iconColor} ${color.darkIconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                                                    </svg>
                                                  </div>
                                                )}
                                                <div className="flex-1 min-w-0">
                                                  <h5 className="font-semibold text-sm text-gray-900 dark:text-gray-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-2">
                                                    {post.title}
                                                  </h5>
                                                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                                    {postDate}
                                                  </p>
                                                </div>
                                              </a>
                                            );
                                          })
                                        ) : (
                                          <p className="text-sm text-gray-500 dark:text-gray-400 px-2">No posts available</p>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ) : item.isServicesMenu ? (
                                // Services menu with categories
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                  {children.map((category: any, catIndex: number) => (
                                    <div key={catIndex} className="space-y-3">
                                      {/* Category Header */}
                                      <div className="border-b border-gray-200 dark:border-gray-700 pb-2">
                                        <h3 className="text-sm font-bold uppercase tracking-wider text-primary-600 dark:text-primary-400">
                                          {category.category}
                                        </h3>
                                      </div>
                                      
                                      {/* Category Items */}
                                      <div className="space-y-2">
                                        {category.items.map((service: any) => {
                                          const IconComponent = service.icon;
                                          return (
                                            <a
                                              key={service.id}
                                              href={service.url}
                                              className="group relative block p-3 rounded-lg hover:bg-gradient-to-r hover:from-primary-50 hover:to-transparent dark:hover:from-primary-900/20 dark:hover:to-transparent transition-all duration-200"
                                            >
                                              <div className="flex items-start gap-3">
                                                {/* Icon */}
                                                {IconComponent && (
                                                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center group-hover:from-primary-100 group-hover:to-primary-200 dark:group-hover:from-primary-900/40 dark:group-hover:to-primary-800/40 transition-all duration-200">
                                                    <IconComponent className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors" />
                                                  </div>
                                                )}
                                                
                                                {/* Content */}
                                                <div className="flex-1 min-w-0">
                                                  <div className="flex items-center justify-between gap-2">
                                                    <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                                                      {service.title}
                                                    </h4>
                                                    <FiArrowRight className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200" />
                                                  </div>
                                                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5 leading-snug">
                                                    {service.description}
                                                  </p>
                                                </div>
                                              </div>
                                            </a>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : item.isContactMenu ? (
                                // Contact menu with two-column layout
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                  {/* Left Column - Featured Contact */}
                                  <div className="space-y-4">
                                    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 dark:from-primary-600 dark:to-primary-900 p-8">
                                      {/* Background decoration */}
                                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                                      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
                                      
                                      <div className="relative">
                                        <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4">
                                          <FiMail className="w-8 h-8 text-white" />
                                        </div>
                                        <h3 className="text-2xl font-bold text-white mb-2">Get in Touch</h3>
                                        <p className="text-primary-100 mb-6 leading-relaxed">
                                          Have a question or need assistance? We're here to help. Fill out our contact form and we'll respond within 24 hours.
                                        </p>
                                        <a
                                          href={children[0]?.url}
                                          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white hover:bg-gray-50 text-primary-600 font-semibold shadow-lg hover:shadow-xl transition-all group"
                                        >
                                          <span>Contact Us</span>
                                          <FiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                        </a>
                                      </div>
                                    </div>

                                    {/* Quick Stats */}
                                    <div className="grid grid-cols-2 gap-3">
                                      <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-200 dark:border-blue-800">
                                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">24h</div>
                                        <div className="text-sm text-gray-700 dark:text-gray-300">Response Time</div>
                                      </div>
                                      <div className="p-4 rounded-xl bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border border-green-200 dark:border-green-800">
                                        <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">24/7</div>
                                        <div className="text-sm text-gray-700 dark:text-gray-300">Support Available</div>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Right Column - Contact Methods */}
                                  <div className="space-y-3">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-4">Contact Methods</h4>
                                    {children.map((contact: any, idx: number) => {
                                      const IconComponent = contact.icon;
                                      return (
                                        <a
                                          key={contact.id}
                                          href={contact.url}
                                          className="group flex items-center gap-4 p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600 hover:shadow-md transition-all duration-200"
                                        >
                                          {IconComponent && (
                                            <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center group-hover:from-primary-100 group-hover:to-primary-200 dark:group-hover:from-primary-900/40 dark:group-hover:to-primary-800/40 transition-all">
                                              <IconComponent className="w-6 h-6 text-gray-600 dark:text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors" />
                                            </div>
                                          )}
                                          <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                              <h5 className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                                                {contact.title}
                                              </h5>
                                              {idx === 0 && (
                                                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400">
                                                  Recommended
                                                </span>
                                              )}
                                            </div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                              {contact.info}
                                            </p>
                                          </div>
                                          <FiArrowRight className="w-5 h-5 text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                                        </a>
                                      );
                                    })}
                                  </div>
                                </div>
                              ) : (
                                // Default megamenu layout for other menus
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                  {children.map((child: any) => {
                                    const IconComponent = child.icon;
                                    return (
                                      <a
                                        key={child.id}
                                        href={child.url}
                                        target={child.target}
                                        className="group relative p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-primary-400 dark:hover:border-primary-500 bg-white dark:bg-gray-800 hover:shadow-lg transition-all duration-300 overflow-hidden"
                                      >
                                        {/* Gradient overlay on hover */}
                                        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 to-transparent dark:from-primary-900/20 dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                        
                                        <div className="relative flex items-start gap-4">
                                          {/* Icon container */}
                                          {IconComponent && (
                                            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/40 dark:to-primary-800/40 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                              <IconComponent className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                                            </div>
                                          )}
                                          
                                          {/* Content */}
                                          <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2 mb-2">
                                              <h3 className="font-bold text-gray-900 dark:text-gray-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                                                {child.title}
                                              </h3>
                                              <FiArrowRight className="w-4 h-4 text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 group-hover:translate-x-1 transition-all duration-300" />
                                            </div>
                                            {child.description && (
                                              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                                                {child.description}
                                              </p>
                                            )}
                                          </div>
                                        </div>
                                      </a>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          ) : (
                            children.map((child: any, idx: number) => (
                              <a
                                key={child.id}
                                href={child.url}
                                target={child.target}
                                className="block px-4 py-2 text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                              >
                                <div className="flex items-center gap-2">
                                  {child.icon && <i className={`${child.icon} w-4 h-4`}></i>}
                                  <span>{child.title}</span>
                                </div>
                              </a>
                            ))
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              }

              return (
                <a 
                  key={item.id}
                  href={item.url}
                  className={`px-4 py-2 rounded-lg ${
                    transparent 
                      ? 'text-white hover:text-primary-300 hover:bg-white/10' 
                      : 'text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                  } font-medium transition-all flex items-center gap-2`}
                >
                  {item.icon && <i className={`${item.icon} w-4 h-4`}></i>}
                  {item.title}
                </a>
              );
            })}
          </div>

          <div className="flex items-center gap-1 sm:gap-2 md:gap-4 shrink-0">
            {/* Cart Button */}
            <Link
              to="/cart"
              className={`relative hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl ${
                transparent
                  ? 'bg-white/10 hover:bg-white/20 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white'
              } font-medium transition-all`}
            >
              <FiShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden md:inline text-sm">Cart</span>
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-600 text-white text-xs font-bold flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </Link>
            
            {/* Notification Bell */}
            {isAuthenticated && (
              <div ref={notificationRef} className="hidden sm:block">
                <NotificationBell />
              </div>
            )}

            {/* Profile Dropdown */}
            {isAuthenticated && (
              <div ref={profileRef} className="relative">
                <button
                  title="Profile Menu"
                  aria-label="Profile Menu"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    // Calculate position immediately before opening
                    if (!profileDropdownOpen && profileRef.current) {
                      const rect = profileRef.current.getBoundingClientRect();
                      const dropdownWidth = 224;
                      const left = rect.right - dropdownWidth;
                      setProfileDropdownPosition({
                        top: rect.bottom + 8,
                        left: Math.max(16, left),
                      });
                    }
                    setProfileDropdownOpen(!profileDropdownOpen);
                    setNotificationOpen(false);
                  }}
                  className={`hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl ${
                    transparent
                      ? 'bg-white/10 hover:bg-white/20 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white'
                  } font-medium transition-all`}
                >
                  <FiUser className="w-4 h-4 sm:w-5 sm:h-5" />
                  <FiChevronDown className={`w-4 h-4 transition-transform duration-300 ${profileDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {createPortal(
                  <AnimatePresence>
                    {profileDropdownOpen && (
                      <>
                        {/* Overlay to capture outside clicks */}
                        <div
                          className="fixed inset-0 z-[9998]"
                          onMouseDown={() => setProfileDropdownOpen(false)}
                          aria-hidden="true"
                        />
                        <motion.div
                          ref={profileDropdownRef}
                          initial={{ opacity: 0, y: -10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: 0.95 }}
                          transition={{ duration: 0.15 }}
                          className="fixed w-56 bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 py-2 z-[9999]"
                          style={{
                            top: `${profileDropdownPosition.top}px`,
                            left: `${profileDropdownPosition.left}px`,
                          }}
                          onMouseDown={(e) => e.stopPropagation()}
                        >
                          <a 
                            href="https://my.citricloud.com/profile"
                            className="flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                            onClick={() => setProfileDropdownOpen(false)}
                          >
                            <FiUser className="w-4 h-4" />
                            <span className="text-sm font-medium">My Profile</span>
                          </a>
                          <a 
                            href={hasWorkspaceAccess ? "https://my.citricloud.com/workspace" : "https://services.citricloud.com/workspace"}
                            className="flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                            onClick={() => setProfileDropdownOpen(false)}
                          >
                            <FiBriefcase className="w-4 h-4" />
                            <span className="text-sm font-medium">Workspace</span>
                          </a>
                          <hr className="my-2 border-gray-200 dark:border-gray-700" />
                          <button
                            onClick={async () => {
                              try {
                                await authAPI.logout();
                              } catch {}
                              useAuthStore.getState().logout();
                              window.location.assign('https://my.citricloud.com/login');
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all text-left"
                          >
                            <FiLogOut className="w-4 h-4" />
                            <span className="text-sm font-medium">Logout</span>
                          </button>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>,
                  document.body
                )}
              </div>
            )}

            {/* Login Button */}
            {!isAuthenticated && (
              <a href="https://my.citricloud.com/login" className="hidden sm:inline-block">
                <button className={`px-4 py-2 rounded-lg font-semibold shadow-md transition-all text-sm sm:text-base ${
                  transparent
                    ? 'text-white bg-white/20 hover:bg-white/30 border border-white/30'
                    : 'text-white bg-primary-700 hover:bg-primary-800'
                }`}>
                  Login
                </button>
              </a>
            )}

            {/* Mobile Menu Toggle */}
            <button
              title="Toggle Mobile Menu"
              aria-label="Toggle Mobile Menu"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`lg:hidden p-2 rounded-lg transition-all ${
                transparent
                  ? 'text-white hover:bg-white/10'
                  : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              {mobileMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>
    </nav>

    {/* Mobile Menu */}
    {createPortal(
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            key="mobile-menu-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 z-[60] lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-white dark:bg-gray-900 shadow-2xl overflow-y-auto"
            >
              <div className="p-4 space-y-3">
                <button
                  title="Close Mobile Menu"
                  aria-label="Close Mobile Menu"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex justify-end p-2 text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white"
                >
                  <FiX className="w-6 h-6" />
                </button>

                {topLevelItems.map((item: any) => {
                  const children = getChildren(item.id);
                  const hasChildren = children.length > 0 || item.hasSubmenu;

                  // Handle submenu items
                  if (hasChildren && (item.id !== 'shop' && item.id !== 'blog')) {
                    return (
                      <div key={item.id}>
                        <button
                          onClick={() => toggleSubMenu(item.id)}
                          className="w-full flex items-center justify-between px-4 py-3 rounded-lg text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-50 dark:hover:bg-gray-800 font-medium transition-all"
                        >
                          <div className="flex items-center gap-2">
                            {item.icon && <i className={`${item.icon} w-4 h-4`}></i>}
                            <span>{item.title}</span>
                          </div>
                          <FiChevronDown className={`w-4 h-4 transition-transform duration-300 ${openSubMenus[item.id] ? 'rotate-180' : ''}`} />
                        </button>
                        <AnimatePresence>
                          {openSubMenus[item.id] && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="pl-4 space-y-2">
                                {children.map((child: any) => (
                                  <a
                                    key={child.id}
                                    href={child.url}
                                    target={child.target}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="block px-4 py-2 text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-all"
                                  >
                                    <div className="flex items-center gap-2">
                                      {child.icon && <i className={`${child.icon} w-4 h-4`}></i>}
                                      <span>{child.title}</span>
                                    </div>
                                  </a>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  }

                  return (
                    <a 
                      key={item.id}
                      href={item.url}
                      target={item.target || '_self'}
                      onClick={() => setMobileMenuOpen(false)} 
                      className="block py-3 sm:py-4 text-base sm:text-lg font-medium text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl px-3 sm:px-4 border-b border-gray-200 dark:border-gray-800 transition-all"
                    >
                      <div className="flex items-center gap-2">
                        {item.icon && <i className={`${item.icon} w-4 h-4 sm:w-5 sm:h-5`}></i>}
                        {item.title}
                      </div>
                    </a>
                  );
                })}
                {!isAuthenticated && (
                  <div className="pt-3 sm:pt-4 px-3 sm:px-4">
                    <a href="https://my.citricloud.com/login" onClick={() => setMobileMenuOpen(false)}>
                      <button className="w-full px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-base rounded-xl text-white font-semibold bg-primary-700 hover:bg-primary-800 shadow-md transition-all">
                        Login
                      </button>
                    </a>
                  </div>
                )}
                {isAuthenticated && (
                  <div className="pt-3 sm:pt-4 px-3 sm:px-4 sm:hidden">
                    <div className="space-y-2">
                      <Link to="/profile" onClick={() => setMobileMenuOpen(false)} className="flex items-center space-x-2 px-3 py-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">
                        <FiUser className="w-4 h-4" />
                        <span className="text-sm font-medium">My Profile</span>
                      </Link>
                      <a href={hasWorkspaceAccess ? "https://my.citricloud.com/workspace" : "https://services.citricloud.com/workspace"} onClick={() => setMobileMenuOpen(false)} className="flex items-center space-x-2 px-3 py-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">
                        <FiBriefcase className="w-4 h-4" />
                        <span className="text-sm font-medium">Workspace</span>
                      </a>
                      <a href="https://my.citricloud.com/settings" onClick={() => setMobileMenuOpen(false)} className="flex items-center space-x-2 px-3 py-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">
                        <FiSettings className="w-4 h-4" />
                        <span className="text-sm font-medium">Settings</span>
                      </a>
                      <button
                        onClick={async () => {
                          try {
                            await authAPI.logout();
                          } catch {}
                          useAuthStore.getState().logout();
                          window.location.assign('https://my.citricloud.com/login');
                          setMobileMenuOpen(false);
                        }}
                        className="w-full flex items-center space-x-2 px-3 py-2.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-red-600 transition-all"
                      >
                        <FiLogOut className="w-4 h-4" />
                        <span className="text-sm font-medium">Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>,
      document.body
    )}
    </>
  );
}
