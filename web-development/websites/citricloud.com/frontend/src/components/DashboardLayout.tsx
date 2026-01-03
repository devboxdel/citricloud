import { ReactNode, useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { useLanguage } from '../context/LanguageContext';
import {
  FiHome, FiUsers, FiFileText, FiShoppingCart, FiTrendingUp,
  FiLogOut, FiUser, FiBriefcase, FiSettings, FiSearch, FiBell,
  FiGlobe, FiMaximize, FiMinimize, FiX, FiChevronLeft, FiChevronRight, FiBarChart2,
  FiGrid, FiPackage, FiDatabase, FiLayers, FiHelpCircle, FiServer, FiHardDrive, FiCpu,
  FiDownload, FiCamera, FiGitBranch, FiTerminal, FiWifi, FiShield, FiZap, FiTrendingDown, FiDisc,
  FiShare2, FiClock, FiTag, FiMessageSquare, FiAlertTriangle, FiMessageCircle
} from 'react-icons/fi';
import ThemeToggle from './ThemeToggle';
import { getVersionInfo } from '../utils/version';

type DashboardLayoutProps = {
  children: ReactNode;
  title: string;
  breadcrumb?: ReactNode;
  showSampleGrid?: boolean; // optional placeholder grid
};

export default function DashboardLayout({ children, title, breadcrumb, showSampleGrid = false }: DashboardLayoutProps) {
  const { user, logout } = useAuthStore();
  // Language functionality removed
  const navigate = useNavigate();
  const location = useLocation();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [hoveredModule, setHoveredModule] = useState<string | null>(null);
  const moduleRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Track dark mode
  useEffect(() => {
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };
    
    checkDarkMode();
    
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    
    return () => observer.disconnect();
  }, []);

  // Handle ESC key to close search modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isSearchOpen) {
        setIsSearchOpen(false);
      }
      // Ctrl+K or Cmd+K to open search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen]);

  // Derive active module from current route so selection persists across navigation
  const deriveActiveModule = (path: string) => {
    if (path.startsWith('/dashboard/erp')) return 'ERP';
    if (path.startsWith('/dashboard/crm')) return 'CRM';
    if (path.startsWith('/dashboard/cms')) return 'CMS';
    if (path.startsWith('/dashboard/dms')) return 'DMS';
    if (path.startsWith('/dashboard/srm')) return 'SRM';
    return 'Main';
  };

  const [activeModule, setActiveModule] = useState<string>(deriveActiveModule(location.pathname));

  useEffect(() => {
    const derived = deriveActiveModule(location.pathname);
    if (derived !== activeModule) {
      setActiveModule(derived);
    }
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    window.location.href = 'https://my.citricloud.com/login';
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    // Determine where to search based on search query
    // For now, navigate to a generic search results page or the most relevant module
    
    // Check if query matches common terms
    const query = searchQuery.toLowerCase();
    
    if (query.includes('order')) {
      navigate('/dashboard/erp/orders');
      setIsSearchOpen(false);
      setSearchQuery('');
    } else if (query.includes('invoice')) {
      navigate('/dashboard/erp/invoices');
      setIsSearchOpen(false);
      setSearchQuery('');
    } else if (query.includes('product')) {
      navigate('/dashboard/erp/products');
      setIsSearchOpen(false);
      setSearchQuery('');
    } else if (query.includes('page') || query.includes('blog')) {
      navigate('/dashboard/cms');
      setIsSearchOpen(false);
      setSearchQuery('');
    } else if (query.includes('user') || query.includes('customer')) {
      navigate('/dashboard/crm');
      setIsSearchOpen(false);
      setSearchQuery('');
    } else if (query.includes('ticket')) {
      navigate('/dashboard/crm/tickets');
      setIsSearchOpen(false);
      setSearchQuery('');
    } else if (query.includes('supplier')) {
      navigate('/dashboard/erp/suppliers');
      setIsSearchOpen(false);
      setSearchQuery('');
    } else {
      // Default: go to analytics/dashboard with search parameter
      navigate(`/dashboard?search=${encodeURIComponent(searchQuery)}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  const notifications = [
    { id: 1, text: t('new_order_received'), time: `5 ${t('min_ago')}`, unread: true },
    { id: 2, text: t('user_registration_completed'), time: `15 ${t('min_ago')}`, unread: true },
    { id: 3, text: t('system_update_available'), time: `1 ${t('hour_ago')}`, unread: false },
  ];



  // Unread badge state
  const [unreadOrders, setUnreadOrders] = useState(false);
  const [unreadInvoices, setUnreadInvoices] = useState(false);
  const [unreadProducts, setUnreadProducts] = useState(false);
  const [unreadSubscription, setUnreadSubscription] = useState(false);

  useEffect(() => {
    // Example: fetch unread status from API (replace with real endpoints)
    // setUnreadOrders(true/false), setUnreadInvoices(true/false), etc.
    // For demo, set to true if there are unread notifications of type/order/invoice/subscription
    // You should fetch from notificationAPI or ERP API
  }, [user]);

  // Check if user can access advanced modules
  const canAccessModules = user && ['system_admin', 'developer', 'administrator', 'manager'].includes(user.role?.toLowerCase());

  // Module descriptions for popovers
  const moduleDescriptions: Record<string, { title: string; description: string }> = {
    Main: { 
      title: t('main_dashboard'), 
      description: t('main_dashboard_desc') 
    },
    ERP: { 
      title: t('enterprise_resource_planning'), 
      description: t('erp_desc') 
    },
    CRM: { 
      title: t('customer_relationship'), 
      description: t('crm_desc') 
    },
    CMS: { 
      title: t('content_management'), 
      description: t('cms_desc') 
    },
    DMS: { 
      title: t('document_management'), 
      description: t('dms_desc') 
    },
    SRM: { 
      title: t('system_resource'), 
      description: t('srm_desc') 
    },
  };

  const modules = [
    { key: 'Main', label: 'Main Dashboard', icon: <FiHome /> },
    ...(canAccessModules
      ? [
          { key: 'ERP', label: 'ERP', icon: <FiPackage /> },
          { key: 'CRM', label: 'CRM', icon: <FiUsers /> },
          { key: 'CMS', label: 'CMS', icon: <FiLayers /> },
          { key: 'DMS', label: 'DMS', icon: <FiDatabase /> },
          { key: 'SRM', label: 'SRM', icon: <FiServer /> },
        ]
      : []),
  ];

  // Sidebar menu items based on active module
  const sidebarMenus: Record<string, Array<{ icon: JSX.Element; label: string; path?: string; isCategory?: boolean; badge?: boolean }>> = {
    Main: [
      { icon: <FiHome />, label: 'Dashboard', path: '/dashboard' },
      { icon: <FiBarChart2 />, label: 'Analytics', path: '/dashboard/analytics' },
    ],
    ERP: [
      { icon: <FiPackage />, label: 'Products', isCategory: true },
      { icon: <FiUsers />, label: 'Suppliers', path: '/dashboard/erp/suppliers', isPadded: true },
      { icon: <FiShoppingCart />, label: 'Orders', path: '/dashboard/erp/orders', isPadded: true, badge: unreadOrders },
      { icon: <FiPackage />, label: 'Products', path: '/dashboard/erp/products', isPadded: true },
      { icon: <FiTag />, label: 'Categories', path: '/dashboard/erp/categories', isPadded: true },
      { icon: <FiLayers />, label: 'Stock Management', path: '/dashboard/erp/stock', isPadded: true },
      
      { icon: <FiFileText />, label: 'Invoice Management', isCategory: true },
      { icon: <FiFileText />, label: 'Invoices', path: '/dashboard/erp/invoices', isPadded: true, badge: unreadInvoices },
      
      { icon: <FiBarChart2 />, label: 'Analystic & Reports', isCategory: true },
      { icon: <FiBarChart2 />, label: 'Reports', path: '/dashboard/erp/reports', isPadded: true },
    ],
    CRM: [
      { icon: <FiUsers />, label: 'User Management', isCategory: true },
      { icon: <FiUsers />, label: 'Users', path: '/dashboard/crm', isPadded: true },
      { icon: <FiMessageSquare />, label: 'Messages', path: '/dashboard/crm/messages', isPadded: true },
      
      { icon: <FiShield />, label: 'Roles Management', isCategory: true },
      { icon: <FiShield />, label: 'Roles', path: '/dashboard/crm/roles', isPadded: true },
      
      { icon: <FiFileText />, label: 'Tickets Management', isCategory: true },
      { icon: <FiFileText />, label: 'Tickets', path: '/dashboard/crm/tickets', isPadded: true },
      
      { icon: <FiBriefcase />, label: 'Reports & Campaigns', isCategory: true },
      { icon: <FiBriefcase />, label: 'Campaigns', path: '/dashboard/crm/campaigns', isPadded: true },
      { icon: <FiBarChart2 />, label: 'Reports', path: '/dashboard/crm/reports', isPadded: true },
      
      { icon: <FiZap />, label: 'Marketing', isCategory: true },
      { icon: <FiFileText />, label: 'Template Builder', path: '/dashboard/crm/marketing-template-builder', isPadded: true },
      
      { icon: <FiHelpCircle />, label: 'Support', isCategory: true },
      { icon: <FiMessageCircle />, label: 'Chat Support', path: '/dashboard/crm/chat-support', isPadded: true },
    ],
    CMS: [
      { icon: <FiFileText />, label: 'Blog', isCategory: true },
      { icon: <FiUsers />, label: 'Categories', path: '/dashboard/cms/categories' },
      { icon: <FiFileText />, label: 'Blog Posts', path: '/dashboard/cms/posts' },
      { icon: <FiMessageSquare />, label: 'Comments', path: '/dashboard/cms/comments' },
      { icon: <FiAlertTriangle />, label: 'Reports & Violations', path: '/dashboard/cms/reports' },
      { icon: <FiTrendingUp />, label: 'Files', isCategory: true },
      { icon: <FiTrendingUp />, label: 'Media Library', path: '/dashboard/cms/media' },
      { icon: <FiGlobe />, label: 'Header', isCategory: true },
      { icon: <FiSettings />, label: 'Menus', path: '/dashboard/cms/menus' },
      { icon: <FiFileText />, label: 'Pages', path: '/dashboard/cms' },
      { icon: <FiGlobe />, label: 'Footer', isCategory: true },
      { icon: <FiZap />, label: 'Frontend Settings', path: '/dashboard/cms/frontend-settings' },
    ],
    DMS: [
      { icon: <FiDatabase />, label: 'DMS', isCategory: true },
      { icon: <FiGrid />, label: 'Overview', path: '/dashboard/dms' },
      { icon: <FiUsers />, label: 'Shared', isCategory: true },
      { icon: <FiShare2 />, label: 'Shared Files', path: '/dashboard/dms/shared' },
      { icon: <FiTrendingUp />, label: 'Activity\'s', isCategory: true },
      { icon: <FiClock />, label: 'Recent', path: '/dashboard/dms/recent' },
      { icon: <FiHardDrive />, label: 'Storage', isCategory: true },
      { icon: <FiDatabase />, label: 'Storage', path: '/dashboard/dms/storage' },
    ],
    SRM: [
      { icon: <FiServer />, label: 'Overview', path: '/dashboard/srm' },
      { icon: <FiCpu />, label: 'CPU', isCategory: true },
      { icon: <FiCpu />, label: 'CPU Usage', path: '/dashboard/srm/cpu' },
      { icon: <FiHardDrive />, label: 'Storages', isCategory: true },
      { icon: <FiHardDrive />, label: 'Storage', path: '/dashboard/srm/storage' },
      { icon: <FiBarChart2 />, label: 'Network', isCategory: true },
      { icon: <FiBarChart2 />, label: 'Network', path: '/dashboard/srm/network' },
      { icon: <FiDownload />, label: 'Backup & Snapshots', isCategory: true },
      { icon: <FiDownload />, label: 'Backups', path: '/dashboard/srm/backups' },
      { icon: <FiCamera />, label: 'Snapshots', path: '/dashboard/srm/snapshots' },
      { icon: <FiDatabase />, label: 'Databases', isCategory: true },
      { icon: <FiDatabase />, label: 'Databases', path: '/dashboard/srm/databases' },
      { icon: <FiGitBranch />, label: 'API\'s', isCategory: true },
      { icon: <FiGitBranch />, label: 'API Endpoints', path: '/dashboard/srm/api-endpoints' },
      { icon: <FiTerminal />, label: 'Terminal/Shells', isCategory: true },
      { icon: <FiTerminal />, label: 'Terminal', path: '/dashboard/srm/terminal' },
      { icon: <FiDisc />, label: 'Caches', isCategory: true },
      { icon: <FiDisc />, label: 'Caches', path: '/dashboard/srm/caches' },
      { icon: <FiBarChart2 />, label: 'CDN', path: '/dashboard/srm/cdn' },
      { icon: <FiGlobe />, label: 'Domains', isCategory: true },
      { icon: <FiGlobe />, label: 'Domains', path: '/dashboard/srm/domains' },
      { icon: <FiWifi />, label: 'IP Address', isCategory: true },
      { icon: <FiWifi />, label: 'IP Address', path: '/dashboard/srm/ipaddress' },
      { icon: <FiShield />, label: 'SSL/TLS Certificates', isCategory: true },
      { icon: <FiShield />, label: 'SSL/TLS', path: '/dashboard/srm/ssl-tls' },
      { icon: <FiZap />, label: 'Speed & Performance', isCategory: true },
      { icon: <FiZap />, label: 'Performance', path: '/dashboard/srm/performance' },
      { icon: <FiTrendingDown />, label: 'Traffic & Blacklists', isCategory: true },
      { icon: <FiTrendingDown />, label: 'Traffic', path: '/dashboard/srm/traffic' },
      { icon: <FiShield />, label: 'Whitelist', path: '/dashboard/srm/whitelist' },
      { icon: <FiShield />, label: 'Blacklist', path: '/dashboard/srm/blacklist' },
    ],
  };

  const currentSidebarMenu = sidebarMenus[activeModule] || sidebarMenus.Main;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100 dark:from-gray-950 dark:via-slate-950 dark:to-black">
      {/* Navbar - full width, sticky */}
      <nav className="sticky top-0 z-50 w-full bg-white/95 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 shadow-md">
        <div className="flex items-center justify-between px-2 sm:px-3 md:px-4 py-2">
            <div className="flex items-center space-x-1 sm:space-x-2">
            {/* Mobile sidebar toggle */}
            <button
              className="md:hidden p-1.5 sm:p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              title="Toggle menu"
            >
              <FiGrid className="w-5 h-5" />
            </button>
            {/* Sidebar collapse button - hidden on mobile */}
            <button
              className="hidden md:block p-1.5 sm:p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
              onClick={() => setSidebarCollapsed((v) => !v)}
              title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {sidebarCollapsed ? <FiChevronRight /> : <FiChevronLeft />}
            </button>
            {/* Home */}
            <Link
              to="/"
              className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
              title="Home"
            >
              <FiHome className="w-5 h-5" />
            </Link>
            {/* Logo */}
            <Link to="/dashboard" className="flex items-center space-x-2">
              <img 
                src={isDarkMode ? "/darkmode.svg?v=8" : "/lightmode.svg?v=8"}
                alt="CITRICLOUD" 
                className="h-3 sm:h-4 w-auto"
              />
            </Link>
          </div>
          {/* Module Switcher - hidden on mobile, shown on tablet+ */}
          <div className="flex-1 hidden md:flex justify-center">
            <div className="flex items-center space-x-1 sm:space-x-2 bg-gray-100 dark:bg-gray-800 rounded-xl px-2 py-1">
              {modules.map((mod) => (
                <div key={mod.key} ref={(el) => { moduleRefs.current[mod.key] = el; }} className="relative">
                  <button
                    onMouseEnter={() => setHoveredModule(mod.key)}
                    onMouseLeave={() => setHoveredModule(null)}
                    className={`flex items-center justify-center p-2 rounded-lg font-semibold text-base transition-all ${activeModule === mod.key ? 'bg-primary-500 text-white shadow' : 'text-gray-700 dark:text-gray-200 hover:bg-primary-100 dark:hover:bg-primary-900/30'}`}
                    onClick={() => setActiveModule(mod.key)}
                    title={mod.label}
                  >
                    {mod.icon}
                  </button>
                </div>
              ))}
            </div>
          </div>
          {/* Right Side Actions */}
            <div className="flex items-center space-x-2">
            {/* Search Button */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
              title="Search"
            >
              <FiSearch className="w-5 h-5" />
            </button>
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
                title="Notifications"
              >
                <FiBell className="w-5 h-5" />
                {notifications.some(n => n.unread) && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </button>
              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 top-full mt-2 w-72 bg-white dark:bg-gray-900 rounded-xl p-3 shadow-lg border border-gray-200 dark:border-gray-800"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-800 dark:text-gray-100">Notifications</h3>
                      <button onClick={() => setShowNotifications(false)}>
                        <FiX className="w-4 h-4 text-gray-500" />
                      </button>
                    </div>
                    <div className="space-y-2">
                      {notifications.map((notif) => (
                        <div
                          key={notif.id}
                          className={`p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all cursor-pointer ${notif.unread ? 'bg-blue-50/60 dark:bg-blue-500/10' : ''}`}
                        >
                          <p className="text-sm text-gray-800 dark:text-gray-200">{notif.text}</p>
                          <p className="text-xs text-gray-500 mt-1">{notif.time}</p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            {/* Fullscreen Toggle */}
            <button
              onClick={toggleFullscreen}
              className="hidden md:flex w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 items-center justify-center text-gray-600 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <FiMinimize className="w-5 h-5" /> : <FiMaximize className="w-5 h-5" />}
            </button>
            {/* User Menu */}
            <div className="relative group">
              <button className="w-9 h-9 rounded-full bg-primary-500/10 flex items-center justify-center text-primary-500 hover:bg-primary-500/20 transition-all">
                <FiUser className="w-5 h-5" />
              </button>
              <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-900 rounded-xl p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all border border-gray-200 dark:border-gray-800 shadow-lg">
                <div className="px-3 py-2 border-b border-gray-200 mb-2">
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{user?.username}</p>
                  <p className="text-xs text-gray-500 capitalize">{user?.role.replace('_', ' ')}</p>
                </div>
                <a
                  href="https://my.citricloud.com/profile"
                  className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 transition-all"
                >
                  <FiUser className="w-4 h-4" />
                  <span className="text-sm">My Profile</span>
                </a>
                <a
                  href="https://my.citricloud.com/workspace"
                  className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 transition-all"
                >
                  <FiBriefcase className="w-4 h-4" />
                  <span className="text-sm">Workspace</span>
                </a>
                {/* My Profile is only available on website at /profile */}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-red-50 text-red-600 transition-all mt-2 border-t border-gray-200 pt-2"
                >
                  <FiLogOut className="w-4 h-4" />
                  <span className="text-sm">Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Module Switcher - shows below navbar on mobile */}
      <div className="md:hidden bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 overflow-x-auto">
        <div className="flex items-center space-x-1 px-2 py-2">
          {modules.map((mod) => (
            <div key={mod.key} ref={(el) => { moduleRefs.current[`mobile-${mod.key}`] = el; }} className="relative">
              <button
                onClick={() => setActiveModule(mod.key)}
                onMouseEnter={() => setHoveredModule(`mobile-${mod.key}`)}
                onMouseLeave={() => setHoveredModule(null)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${activeModule === mod.key ? 'bg-primary-500 text-white shadow-md' : 'text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800'}`}
              >
                <span>{mod.icon}</span>
                <span>{mod.label}</span>
              </button>
              {/* Mobile Popover */}
              <AnimatePresence>
                {hoveredModule === `mobile-${mod.key}` && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full mt-2 left-0 z-[60] pointer-events-none"
                  >
                    <div className="bg-gray-900 dark:bg-gray-950 text-white rounded-lg px-3 py-2 shadow-xl border border-gray-700 whitespace-nowrap">
                      <div className="text-sm font-semibold mb-1">{moduleDescriptions[mod.key]?.title || mod.label}</div>
                      <div className="text-xs text-gray-300">{moduleDescriptions[mod.key]?.description}</div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile Sidebar Drawer */}
      {mobileSidebarOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setMobileSidebarOpen(false)}>
          <aside 
            className="absolute left-0 top-0 bottom-0 w-64 bg-white dark:bg-gray-900 shadow-2xl overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200 dark:border-gray-800">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">{activeModule}</h2>
              <button
                onClick={() => setMobileSidebarOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
          <div className="flex-1 flex flex-col mt-2 space-y-1 px-2 pb-4">
              {currentSidebarMenu.map((item, index) => 
                item.isCategory ? (
                  <div
                    key={`category-${index}`}
                    className="px-3 pt-4 pb-2 text-xs text-gray-800 dark:text-gray-400 uppercase font-bold tracking-wider"
                  >
                    {item.label}
                  </div>
                ) : (
                  <Link
                    key={item.path}
                    to={item.path!}
                    onClick={() => setMobileSidebarOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${item.isPadded ? 'ml-2' : ''} ${location.pathname === item.path ? 'bg-primary-500 text-white font-semibold shadow-sm' : 'text-gray-900 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                  >
                    <span className="text-lg">{item.icon}</span>
                    <span className="text-sm">{item.label}</span>
                    {/* Badge for unread notifications */}
                    {item.badge && (
                      <span className="ml-auto text-xs rounded-full h-5 w-5 flex items-center justify-center bg-red-500 text-white">
                        •
                      </span>
                    )}
                  </Link>
                )
              )}
            </div>
          </aside>
        </div>
      )}

      {/* Main area: sidebar + content */}
      <div className="flex flex-1 w-full">
        {/* Sidebar - hidden on mobile unless explicitly shown */}
        <aside className={`transition-all duration-200 bg-white/80 dark:bg-gray-900/80 border-r border-gray-200 dark:border-gray-800 shadow-sm min-h-full ${sidebarCollapsed ? 'hidden md:block md:w-16' : 'hidden md:flex md:w-56 lg:w-64'} flex-col`}>
          {/* Sidebar categories */}
          <div className="flex-1 flex flex-col mt-4 space-y-1 px-2">
            {!sidebarCollapsed && (
              <div className="px-2 text-xs text-gray-400 uppercase mb-2 font-semibold">{activeModule}</div>
            )}
            {currentSidebarMenu.map((item, index) => 
              item.isCategory ? (
                <div
                  key={`category-${index}`}
                  className={`px-3 pt-4 pb-2 text-xs uppercase font-bold tracking-wider ${sidebarCollapsed ? 'text-center' : 'text-gray-800 dark:text-gray-400'}`}
                  title={sidebarCollapsed ? item.label : undefined}
                >
                  {!sidebarCollapsed && item.label}
                  {sidebarCollapsed && <span className="text-lg block">{item.icon}</span>}
                </div>
              ) : (
                <Link
                  key={item.path}
                  to={item.path!}
                  className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all ${item.isPadded ? 'ml-4' : ''} ${location.pathname === item.path ? 'bg-primary-500 text-white font-semibold shadow-sm' : 'text-gray-900 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                  title={sidebarCollapsed ? item.label : undefined}
                >
                  <span className="text-lg">{item.icon}</span>
                  {!sidebarCollapsed && <span className="text-sm">{item.label}</span>}
                  {/* Badge for unread notifications */}
                  {item.badge && (
                    <span className="ml-auto text-xs rounded-full h-5 w-5 flex items-center justify-center bg-red-500 text-white">
                      •
                    </span>
                  )}
                </Link>
              )
            )}
          </div>
        </aside>
        {/* Main Content */}
        <main className="flex-1 flex flex-col min-h-screen w-full max-w-7xl mx-auto">
          {/* Breadcrumb and Page Title */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between px-3 sm:px-4 pt-4 sm:pt-6 pb-2">
            <div className="flex items-center space-x-2 mb-2 sm:mb-0">
              <span className="text-xs text-gray-400">Home</span>
              <span className="text-xs text-gray-400">/</span>
              <span className="text-xs text-gray-600 dark:text-gray-300 font-semibold">{title}</span>
            </div>
            <div>{breadcrumb}</div>
          </div>
          {/* Page Title */}
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100 px-3 sm:px-4 mb-3 sm:mb-4">{title}</h1>
          <div className="flex-1 px-3 sm:px-4 pb-4 sm:pb-6">
            {showSampleGrid && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                <div className="bg-white dark:bg-gray-900 rounded-xl shadow p-4 min-h-[120px] flex items-center justify-center">Content</div>
                <div className="bg-white dark:bg-gray-900 rounded-xl shadow p-4 min-h-[120px] flex items-center justify-center">Content</div>
                <div className="bg-white dark:bg-gray-900 rounded-xl shadow p-4 min-h-[120px] flex items-center justify-center">Content</div>
                <div className="bg-white dark:bg-gray-900 rounded-xl shadow p-4 min-h-[120px] flex items-center justify-center col-span-1 md:col-span-2">Content</div>
                <div className="bg-white dark:bg-gray-900 rounded-xl shadow p-4 min-h-[120px] flex items-center justify-center">Content</div>
              </div>
            )}
            <div className="w-full">{children}</div>
          </div>
        </main>
      </div>

      {/* Module Popovers Portal */}
      {hoveredModule && (hoveredModule.startsWith('mobile-') ? moduleRefs.current[`mobile-${hoveredModule.split('-')[1]}`] : moduleRefs.current[hoveredModule]) && createPortal(
        <AnimatePresence>
          {hoveredModule && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              style={{
                position: 'fixed',
                top: (hoveredModule.startsWith('mobile-') ? moduleRefs.current[`mobile-${hoveredModule.split('-')[1]}`] : moduleRefs.current[hoveredModule])?.getBoundingClientRect().bottom || 0,
                left: ((hoveredModule.startsWith('mobile-') ? moduleRefs.current[`mobile-${hoveredModule.split('-')[1]}`] : moduleRefs.current[hoveredModule])?.getBoundingClientRect().left || 0) + ((hoveredModule.startsWith('mobile-') ? moduleRefs.current[`mobile-${hoveredModule.split('-')[1]}`] : moduleRefs.current[hoveredModule])?.offsetWidth || 0) / 2,
                transform: 'translateX(-50%)',
                zIndex: 9999,
              }}
              className="pointer-events-none"
            >
              <div className="bg-gray-900 dark:bg-gray-950 text-white rounded-lg px-4 py-2 shadow-2xl border border-gray-700 whitespace-nowrap mt-2">
                <div className="text-sm font-semibold mb-1">{moduleDescriptions[hoveredModule.startsWith('mobile-') ? hoveredModule.split('-')[1] : hoveredModule]?.title}</div>
                <div className="text-xs text-gray-300">{moduleDescriptions[hoveredModule.startsWith('mobile-') ? hoveredModule.split('-')[1] : hoveredModule]?.description}</div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Search Modal */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-start justify-center pt-20 px-4"
            onClick={() => setIsSearchOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="w-full max-w-2xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <form onSubmit={handleSearch} className="p-4 border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-3">
                  <FiSearch className="w-6 h-6 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search orders, invoices, products, pages..."
                    className="flex-1 bg-transparent text-lg outline-none text-gray-900 dark:text-gray-100 placeholder-gray-400"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setIsSearchOpen(false)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <FiX className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
              </form>
              <div className="p-4 max-h-96 overflow-y-auto">
                {searchQuery ? (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Search results for "{searchQuery}"</p>
                    {/* Search results would go here - implement based on your needs */}
                    <div className="text-center py-8 text-gray-500">
                      <FiSearch className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>Press Enter to search</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Quick Links</p>
                    <Link
                      to="/dashboard/erp/orders"
                      onClick={() => setIsSearchOpen(false)}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      <FiShoppingCart className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Orders</p>
                        <p className="text-xs text-gray-500">View and manage orders</p>
                      </div>
                    </Link>
                    <Link
                      to="/dashboard/erp/invoices"
                      onClick={() => setIsSearchOpen(false)}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      <FiFileText className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Invoices</p>
                        <p className="text-xs text-gray-500">View and manage invoices</p>
                      </div>
                    </Link>
                    <Link
                      to="/dashboard/erp/products"
                      onClick={() => setIsSearchOpen(false)}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      <FiPackage className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Products</p>
                        <p className="text-xs text-gray-500">Manage product catalog</p>
                      </div>
                    </Link>
                    <Link
                      to="/dashboard/cms"
                      onClick={() => setIsSearchOpen(false)}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      <FiLayers className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Pages</p>
                        <p className="text-xs text-gray-500">Manage website pages</p>
                      </div>
                    </Link>
                  </div>
                )}
              </div>
              <div className="p-3 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Type to search across all modules</span>
                  <span className="flex items-center gap-2">
                    <kbd className="px-2 py-1 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded">ESC</kbd>
                    to close
                  </span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer - full width, not fixed */}
      <footer className="glass-footer relative overflow-hidden w-full text-center py-5 bg-white/90 dark:bg-gray-900/90 border-t border-gray-200/60 dark:border-gray-800/70 text-gray-700 dark:text-gray-200">
        <span className="glass-blob blob-a" aria-hidden="true" />
        <span className="glass-blob blob-b" aria-hidden="true" />

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-3 px-4 max-w-5xl mx-auto">
          <div className="flex items-center gap-3 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800/70 border border-gray-200 dark:border-gray-700">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" aria-hidden="true" />
              <span>Operational</span>
            </span>
            <span className="hidden sm:inline">System Uptime</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-sm font-medium">
            <Link to="/status" className="hover:text-primary-500 transition-colors">Status</Link>
            <Link to="/help-center" className="hover:text-primary-500 transition-colors">Help Center</Link>
            <a href="mailto:support@citricloud.com" className="hover:text-primary-500 transition-colors">support@citricloud.com</a>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2 text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300">
            <span>© 2025 CitriCloud — All rights reserved.</span>
            <span className="hidden sm:inline text-gray-400 dark:text-gray-600">•</span>
            <a 
              href={getVersionInfo().githubUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-[10px] sm:text-xs"
              title="View on GitHub"
            >
              <span className="font-mono">v{getVersionInfo().version}</span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
