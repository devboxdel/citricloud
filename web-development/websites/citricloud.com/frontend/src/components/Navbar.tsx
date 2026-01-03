import { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import { FiTrendingUp, FiUser, FiSettings, FiBriefcase, FiLogOut, FiMenu, FiX, FiChevronDown, FiShoppingCart } from 'react-icons/fi';
import ThemeToggle from './ThemeToggle';
import NotificationBell from './NotificationBell';
import { motion, AnimatePresence } from 'framer-motion';
import { cmsAPI, authAPI } from '../lib/api';

export default function Navbar() {
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

    if (profileDropdownOpen) {
      updatePosition();
      window.addEventListener('resize', updatePosition);
      window.addEventListener('scroll', updatePosition, true);
      const onKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setProfileDropdownOpen(false);
        }
      };
      document.addEventListener('keydown', onKeyDown);
      
      return () => {
        window.removeEventListener('resize', updatePosition);
        window.removeEventListener('scroll', updatePosition, true);
        document.removeEventListener('keydown', onKeyDown);
      };
    }
  }, [profileDropdownOpen]);

  // Portals handle their own click-outside via overlays

  // Default menu items - all absolute subdomain URLs
  const defaultMenuItems = [
    { id: 'home', title: 'Home', url: 'https://citricloud.com/', icon: null },
    { id: 'about', title: 'About', url: 'https://about.citricloud.com/', icon: null },
    { id: 'services', title: 'Services', url: 'https://services.citricloud.com/', icon: null },
    { id: 'blog', title: 'Blog', url: 'https://blog.citricloud.com/', icon: null },
    { id: 'shop', title: 'Shop', url: 'https://shop.citricloud.com/', icon: null },
    { id: 'contact', title: 'Contact', url: 'https://contact.citricloud.com/', icon: null },
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
  const getChildren = (parentId: number) => {
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
    <nav className="fixed top-0 left-0 right-0 w-full z-50 bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl shadow-lg border-b border-white/30 dark:border-gray-700/30">
      <div className="container mx-auto px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 max-w-7xl overflow-x-hidden">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center shrink-0">
            <img
              src={isDarkMode ? "/darkmode.svg?v=8" : "/lightmode.svg?v=8"}
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

              // Shop - simple link
              if (item.id === 'shop' || item.title === 'Shop') {
                return (
                  <a
                    key={item.id}
                    href={item.url}
                    className="px-4 py-2 rounded-lg text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-gray-800 font-medium transition-all"
                  >
                    Shop
                  </a>
                );
              }

              // Blog - simple link
              if (item.id === 'blog' || item.title === 'Blog') {
                return (
                  <a
                    key={item.id}
                    href={item.url}
                    className="px-4 py-2 rounded-lg text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-gray-800 font-medium transition-all"
                  >
                    Blog
                  </a>
                );
              }

              // Services - simple link
              if (item.id === 'services' || item.title === 'Services') {
                return (
                  <a
                    key={item.id}
                    href={item.url}
                    className="px-4 py-2 rounded-lg text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-gray-800 font-medium transition-all"
                  >
                    Services
                  </a>
                );
              }

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
                      className="px-4 py-2 rounded-lg text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-gray-800 font-medium transition-all flex items-center gap-1"
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
                          className="absolute left-0 top-full mt-2 min-w-[240px] bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 py-2 z-[9999] overflow-hidden"
                        >
                          {children.map((child: any, idx: number) => (
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
                          ))}
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
                  className="px-4 py-2 rounded-lg text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-gray-800 font-medium transition-all flex items-center gap-2"
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
              className="relative hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-medium transition-all"
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
                  className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-medium transition-all"
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
                <button className="px-4 py-2 rounded-lg text-white font-semibold bg-primary-700 hover:bg-primary-800 shadow-md transition-all text-sm sm:text-base">
                  Login
                </button>
              </a>
            )}

            {/* Mobile Menu Toggle */}
            <button
              title="Toggle Mobile Menu"
              aria-label="Toggle Mobile Menu"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
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
