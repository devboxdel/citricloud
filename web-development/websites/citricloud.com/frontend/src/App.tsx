import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { lazy, Suspense, useEffect } from 'react';
import { Component } from 'react';
// Class-based error boundary for React 18+
class ErrorBoundary extends Component<{ children: React.ReactNode }, { error: Error | null }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  componentDidCatch(error: Error, info: any) {
    // You can log error here if needed
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{ background: 'red', color: 'white', padding: 24, fontWeight: 'bold', fontSize: 24, zIndex: 99999 }}>
          ERROR BOUNDARY: {this.state.error.message}
          <pre style={{ fontSize: 16, marginTop: 12 }}>{this.state.error.stack}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}
import * as React from 'react';
import { useAuthStore } from './store/authStore';
import { profileAPI } from './lib/api';
import { ToastProvider } from './components/Toast';
import CookieBanner from './components/CookieBanner';
import LiveChat from './components/LiveChat';
import { ChatProvider } from './context/ChatContext';
import { OpeningHoursProvider } from './context/OpeningHoursContext';
import { OperatorsProvider } from './context/OperatorsContext';

// Development Popup Modal Component
const DevelopmentPopup = () => {
  const [isVisible, setIsVisible] = React.useState(() => {
    const dismissed = localStorage.getItem('devPopupDismissed');
    const dismissTime = localStorage.getItem('devPopupDismissTime');
    
    // Show popup again after 24 hours
    if (dismissed === 'true' && dismissTime) {
      const hoursSinceDismiss = (Date.now() - parseInt(dismissTime)) / (1000 * 60 * 60);
      if (hoursSinceDismiss < 24) {
        return false;
      }
    }
    
    return true;
  });

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('devPopupDismissed', 'true');
    localStorage.setItem('devPopupDismissTime', Date.now().toString());
  };

  const handleUnderstood = () => {
    handleDismiss();
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[99998] animate-fade-in"
        onClick={handleDismiss}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 pointer-events-none">
        <div 
          className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full pointer-events-auto animate-scale-in overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Animated gradient border */}
          <div 
            className="absolute inset-0 opacity-75"
            style={{
              background: 'linear-gradient(135deg, #0ea5e9 0%, #06b6d4 25%, #0ea5e9 50%, #06b6d4 75%, #0ea5e9 100%)',
              backgroundSize: '400% 400%',
              animation: 'gradient-shift 8s ease infinite',
              padding: '3px',
              borderRadius: '1rem',
              WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
              WebkitMaskComposite: 'xor',
              maskComposite: 'exclude',
            }}
          />

          <style>{`
            @keyframes gradient-shift {
              0% { background-position: 0% 50%; }
              50% { background-position: 100% 50%; }
              100% { background-position: 0% 50%; }
            }
            @keyframes fade-in {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            @keyframes scale-in {
              from { opacity: 0; transform: scale(0.9); }
              to { opacity: 1; transform: scale(1); }
            }
            @keyframes pulse-icon {
              0%, 100% { transform: scale(1); }
              50% { transform: scale(1.1); }
            }
            .animate-fade-in { animation: fade-in 0.3s ease-out; }
            .animate-scale-in { animation: scale-in 0.3s ease-out; }
          `}</style>

          {/* Content */}
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl p-6 sm:p-8">
            {/* Close button */}
            <button
              onClick={handleDismiss}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors group"
              aria-label="Close"
            >
              <svg 
                className="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200 group-hover:rotate-90 transition-all" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Icon */}
            <div className="flex justify-center mb-4">
              <div className="relative">
                <div 
                  className="w-16 h-16 rounded-full bg-[#0ea5e9] flex items-center justify-center"
                  style={{ animation: 'pulse-icon 2s ease-in-out infinite' }}
                >
                  <svg 
                    className="w-8 h-8 text-white" 
                    fill="currentColor" 
                    viewBox="0 0 20 20"
                  >
                    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                  </svg>
                </div>
                <div className="absolute inset-0 bg-[#0ea5e9] rounded-full animate-ping opacity-75" />
              </div>
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-3">
              🚧 Site Under Development
            </h2>

            {/* Message */}
            <p className="text-center text-gray-600 dark:text-gray-300 mb-6">
              This website is currently in active development. Some features may not work as expected. We appreciate your patience as we continue to improve!
            </p>

            {/* Features Notice */}
            <div className="bg-sky-50 dark:bg-sky-900/20 rounded-lg p-4 mb-6">
              <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-[#0ea5e9] mt-0.5">⚠️</span>
                  <span>Some pages may be incomplete or under construction</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#0ea5e9] mt-0.5">⚠️</span>
                  <span>Features are being actively tested and improved</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#0ea5e9] mt-0.5">⚠️</span>
                  <span>Please report any issues you encounter</span>
                </li>
              </ul>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleUnderstood}
                className="flex-1 px-6 py-3 bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-semibold rounded-lg transition-all transform hover:scale-105 active:scale-95"
              >
                I Understand
              </button>
              <button
                onClick={handleDismiss}
                className="px-6 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-colors"
              >
                Close
              </button>
            </div>

            {/* Footer note */}
            <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-4">
              This message will appear once every 24 hours
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

// Lazy load pages

const HomePage = lazy(() => import('./pages/Home'));
const AboutPage = lazy(() => import('./pages/About'));
const ServicesPage = lazy(() => import('./pages/Services'));
const BlogPage = lazy(() => import('./pages/Blog'));
const BlogPostsPage = lazy(() => import('./pages/BlogPosts'));
const BlogPostPage = lazy(() => import('./pages/BlogPost'));
const ShopHome = lazy(() => import('./pages/ShopHome'));
const Catalog = lazy(() => import('./pages/Catalog'));
const HostingPlans = lazy(() => import('./pages/HostingPlans'));
const Software = lazy(() => import('./pages/Software'));
const Domains = lazy(() => import('./pages/Domains'));
const SSL = lazy(() => import('./pages/SSL'));
const SpecialOffers = lazy(() => import('./pages/SpecialOffers'));
const ControlPanels = lazy(() => import('./pages/ControlPanels'));
const ProductDetailPage = lazy(() => import('./pages/ProductDetail'));
const CartPage = lazy(() => import('./pages/Cart'));
const CheckoutPage = lazy(() => import('./pages/Checkout'));
const ThankYouPage = lazy(() => import('./pages/ThankYou'));
const ContactPage = lazy(() => import('./pages/Contact'));
const FAQPage = lazy(() => import('./pages/FAQ'));
const CareersPage = lazy(() => import('./pages/Careers'));
const LoginPage = lazy(() => import('./pages/Login'));
const RegisterPage = lazy(() => import('./pages/Register'));
const ResetPasswordPage = lazy(() => import('./pages/ResetPassword'));
const MainDashboard = lazy(() => import('./pages/dashboard/MainDashboard'));
const Teams = lazy(() => import('./pages/dashboard/Teams'));
const Messages = lazy(() => import('./pages/dashboard/Messages'));
const FileSharing = lazy(() => import('./pages/dashboard/FileSharing'));
const ActivityFeed = lazy(() => import('./pages/dashboard/ActivityFeed'));
const CRMDashboard = lazy(() => import('./pages/dashboard/CRMDashboard'));
const CRMRoles = lazy(() => import('./pages/dashboard/CRMRoles'));
const CMSDashboard = lazy(() => import('./pages/dashboard/CMSDashboard'));
const CMSPages = lazy(() => import('./pages/dashboard/CMSPages'));
const CMSBlogPosts = lazy(() => import('./pages/dashboard/CMSBlogPosts'));
const CMSComments = lazy(() => import('./pages/dashboard/CMSComments'));
const CMSReports = lazy(() => import('./pages/dashboard/CMSReports'));
const CMSCategories = lazy(() => import('./pages/dashboard/CMSCategories'));
const CMSMenus = lazy(() => import('./pages/dashboard/CMSMenus'));
const CMSMedia = lazy(() => import('./pages/dashboard/CMSMedia'));
const CMSFrontendSettings = lazy(() => import('./pages/dashboard/CMSFrontendSettings'));
const ERPDashboard = lazy(() => import('./pages/dashboard/ERPDashboard'));
const SRMDashboard = lazy(() => import('./pages/dashboard/SRMDashboard'));
const SRMOverview = lazy(() => import('./pages/dashboard/SRMOverview'));
const SRMCPUPage = lazy(() => import('./pages/dashboard/SRMCPUPage'));
const SRMStoragePage = lazy(() => import('./pages/dashboard/SRMStoragePage'));
const SRMNetworkPage = lazy(() => import('./pages/dashboard/SRMNetworkPage'));
const SRMBackupsPage = lazy(() => import('./pages/dashboard/SRMBackupsPage'));
const SRMSnapshotsPage = lazy(() => import('./pages/dashboard/SRMSnapshotsPage'));
const SRMDatabasesPage = lazy(() => import('./pages/dashboard/SRMDatabasesPage'));
const SRMAPIEndpointsPage = lazy(() => import('./pages/dashboard/SRMAPIEndpointsPage'));
const SRMTerminalPage = lazy(() => import('./pages/dashboard/SRMTerminalPage'));
const SRMCaches = lazy(() => import('./pages/dashboard/SRMCaches'));
const SRMDomains = lazy(() => import('./pages/dashboard/SRMDomains'));
const SRMIPAddress = lazy(() => import('./pages/dashboard/SRMIPAddress'));
const SRMSSLTLs = lazy(() => import('./pages/dashboard/SRMSSLTLs'));
const SRMPerformance = lazy(() => import('./pages/dashboard/SRMPerformance'));
const SRMTraffic = lazy(() => import('./pages/dashboard/SRMTraffic'));
const SRMCDN = lazy(() => import('./pages/dashboard/SRMCDN'));
const SRMWhitelist = lazy(() => import('./pages/dashboard/srm/SRMWhitelist'));
const SRMBlacklist = lazy(() => import('./pages/dashboard/srm/SRMBlacklist'));
const DMSOverview = lazy(() => import('./pages/dashboard/dms/DMSOverview'));
const DMSShared = lazy(() => import('./pages/dashboard/dms/DMSShared'));
const DMSRecent = lazy(() => import('./pages/dashboard/dms/DMSRecent'));
const WebsiteProfile = lazy(() => import('./pages/WebsiteProfile'));
const MessageView = lazy(() => import('./pages/MessageView'));
const Workspace = lazy(() => import('./pages/Workspace'));
const ProfilePage = lazy(() => import('./pages/Profile'));
const SharedEmailInbox = lazy(() => import('./pages/SharedEmailInbox'));
const EmailApp = lazy(() => import('./pages/workspace/Email'));
const SheetsApp = lazy(() => import('./pages/workspace/Sheets'));
const WordsApp = lazy(() => import('./pages/workspace/Words'));
const WordsEditor = lazy(() => import('./pages/workspace/WordsEditor'));
const ProjectsApp = lazy(() => import('./pages/workspace/Projects'));
const ListsApp = lazy(() => import('./pages/workspace/Lists'));
const DriveApp = lazy(() => import('./pages/workspace/Drive'));
const PlannerApp = lazy(() => import('./pages/workspace/Planner'));
const TodoApp = lazy(() => import('./pages/workspace/Todo'));
const ContactsApp = lazy(() => import('./pages/workspace/Contacts'));
const TeamsApp = lazy(() => import('./pages/workspace/Teams'));
const BookingsApp = lazy(() => import('./pages/workspace/Bookings'));
const WhiteboardApp = lazy(() => import('./pages/workspace/Whiteboard'));
const VisioApp = lazy(() => import('./pages/workspace/Visio'));
const FormsApp = lazy(() => import('./pages/workspace/Forms'));
const CoursesApp = lazy(() => import('./pages/workspace/Courses'));
const StatusPage = lazy(() => import('./pages/Status'));
const LogPage = lazy(() => import('./pages/Log'));
const APIReferencePage = lazy(() => import('./pages/APIReference'));
const DocumentationPage = lazy(() => import('./pages/Documentation'));
const ErrorPages = lazy(() => import('./pages/ErrorPages'));
const Error400 = lazy(() => import('./pages/errors/Error400'));
const Error401 = lazy(() => import('./pages/errors/Error401'));
const Error403 = lazy(() => import('./pages/errors/Error403'));
const Error404 = lazy(() => import('./pages/errors/Error404'));
const Error418 = lazy(() => import('./pages/errors/Error418'));
const Error429 = lazy(() => import('./pages/errors/Error429'));
const Error500 = lazy(() => import('./pages/errors/Error500'));
const Error502 = lazy(() => import('./pages/errors/Error502'));
const Error503 = lazy(() => import('./pages/errors/Error503'));
const Error504 = lazy(() => import('./pages/errors/Error504'));
const ComingSoon = lazy(() => import('./pages/ComingSoon'));
const Maintenance = lazy(() => import('./pages/Maintenance'));
const Landing = lazy(() => import('./pages/Landing'));
const TermsPage = lazy(() => import('./pages/Terms'));
// Lazy-load service detail pages
const ServicesPages = {
  WorkspaceService: lazy(() => import('./pages/services/WorkspaceService')),
  Workspace: lazy(() => import('./pages/services/Workspace')),
  CloudHosting: lazy(() => import('./pages/services/CloudHosting')),
  WebDevelopment: lazy(() => import('./pages/services/WebDevelopment')),
  AppDevelopment: lazy(() => import('./pages/services/AppDevelopment')),
  EcommerceSolutions: lazy(() => import('./pages/services/EcommerceSolutions')),
  DatabaseManagement: lazy(() => import('./pages/services/DatabaseManagement')),
  APIDevelopment: lazy(() => import('./pages/services/APIDevelopment')),
  DevOps: lazy(() => import('./pages/services/DevOps')),
  CloudMigration: lazy(() => import('./pages/services/CloudMigration')),
  Consulting: lazy(() => import('./pages/services/Consulting')),
  ManagedServices: lazy(() => import('./pages/services/ManagedServices')),
  SecurityServices: lazy(() => import('./pages/services/SecurityServices')),
  BackupRecovery: lazy(() => import('./pages/services/BackupRecovery')),
};
const PrivacyPage = lazy(() => import('./pages/Privacy'));
const CookiesPage = lazy(() => import('./pages/Cookies'));
const DisclaimerPage = lazy(() => import('./pages/Disclaimer'));
const AccessibilityPage = lazy(() => import('./pages/Accessibility'));
const FairUsePage = lazy(() => import('./pages/FairUse'));
const ResponsibleDisclosurePage = lazy(() => import('./pages/ResponsibleDisclosure'));
const WithdrawalPolicyPage = lazy(() => import('./pages/WithdrawalPolicy'));
const SitemapPage = lazy(() => import('./pages/Sitemap'));
const HelpCenterPage = lazy(() => import('./pages/HelpCenter'));
const CommunityPage = lazy(() => import('./pages/Community'));
const AdminCommunity = lazy(() => import('./pages/AdminCommunity'));

// Loading component
const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100">
    <div className="glass-card p-8 rounded-3xl">
      <div className="spinner mx-auto"></div>
      <p className="mt-4 text-gray-600 font-medium">Loading...</p>
    </div>
  </div>
);

// Error fallback component for lazy loading failures
const LazyLoadError = ({ error }: { error?: Error }) => {
  console.error('Lazy load error:', error);
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-orange-50 to-red-100">
      <div className="glass-card p-8 rounded-3xl max-w-md">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Page Load Error</h2>
        <p className="text-gray-700 mb-4">
          Failed to load the page component. This might be a routing or import issue.
        </p>
        {error && (
          <pre className="text-xs bg-gray-100 p-4 rounded overflow-auto max-h-40 mb-4">
            {error.message}
          </pre>
        )}
        <button 
          onClick={() => window.location.reload()} 
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Reload Page
        </button>
      </div>
    </div>
  );
};

const LoginRedirect = ({ isAuthenticated }: { isAuthenticated: boolean }) => {
  React.useEffect(() => {
    if (window.location.hostname !== 'my.citricloud.com') {
      window.location.href = 'https://my.citricloud.com/login';
    }
  }, []);
  return null;
};

function App() {
  const { isAuthenticated, loadFromStorage, user } = useAuthStore();
  const location = useLocation();

  // Auth is loaded synchronously on store init, no useEffect needed
  
  // Load user's primary color on app start
  useEffect(() => {
    const loadUserPrimaryColor = async () => {
      if (isAuthenticated && user) {
        try {
          const response = await profileAPI.getPreferences();
          const prefs = response.data;
          if (prefs.primary_color) {
            applyPrimaryColor(prefs.primary_color);
          } else {
            // Apply default sky color if not set
            applyPrimaryColor('#0ea5e9');
          }
        } catch (error) {
          console.error('Failed to load primary color:', error);
          // Apply default on error
          applyPrimaryColor('#0ea5e9');
        }
      } else {
        // Not logged in - apply default sky color
        applyPrimaryColor('#0ea5e9');
      }
    };
    
    loadUserPrimaryColor();
  }, [isAuthenticated, user]);
  
  // Helper function to apply primary color
  const applyPrimaryColor = (color: string) => {
    const root = document.documentElement;
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    // Calculate color shades
    const shades = [
      { key: '50', mix: 0.95 },
      { key: '100', mix: 0.9 },
      { key: '200', mix: 0.75 },
      { key: '300', mix: 0.6 },
      { key: '400', mix: 0.4 },
      { key: '500', mix: 0 },
      { key: '600', mix: -0.2 },
      { key: '700', mix: -0.4 },
      { key: '800', mix: -0.6 },
      { key: '900', mix: -0.75 },
    ];
    
    shades.forEach(({ key, mix }) => {
      let nr = r, ng = g, nb = b;
      if (mix > 0) {
        nr = Math.round(r + (255 - r) * mix);
        ng = Math.round(g + (255 - g) * mix);
        nb = Math.round(b + (255 - b) * mix);
      } else if (mix < 0) {
        nr = Math.round(r * (1 + mix));
        ng = Math.round(g * (1 + mix));
        nb = Math.round(b * (1 + mix));
      }
      root.style.setProperty(`--color-primary-${key}`, `${nr} ${ng} ${nb}`);
    });
  }

  // Subdomain routing: show appropriate page based on subdomain

  const SubdomainRouter = () => {
    const hostname = window.location.hostname;
    
    // Help Center subdomain routes
    if (hostname === 'help.citricloud.com') {
      if (location.pathname === '/' || location.pathname === '/center') {
        return <HelpCenterPage />;
      }
    }
    
    // Documentation subdomain routes
    if (hostname === 'documentation.citricloud.com') {
      if (location.pathname === '/' || location.pathname === '/docs') {
        return <DocumentationPage />;
      }
    }
    
    if (location.pathname === '/') {
      if (hostname === 'about.citricloud.com') return <AboutPage />;
      if (hostname === 'services.citricloud.com') return <ServicesPage />;
      if (hostname === 'blog.citricloud.com') return <BlogPage />;
      if (hostname === 'shop.citricloud.com') return <ShopHome />;
      if (hostname === 'contact.citricloud.com') return <ContactPage />;
      if (hostname === 'community.citricloud.com') return <CommunityPage />;
    }
    if ((location.pathname === '/community' || location.pathname === '/') && (hostname === 'contact.citricloud.com' || hostname === 'community.citricloud.com')) {
      return <CommunityPage />;
    }
    return <HomePage />;
  };

  return (
    <ToastProvider>
      <OpeningHoursProvider>
        <OperatorsProvider>
          <ChatProvider>
            <ErrorBoundary>
              <DevelopmentPopup />
              <CookieBanner />
              {!location.pathname.includes('/dashboard/crm/chat-support') && <LiveChat />}
          <Suspense fallback={<LoadingScreen />}>
            <Routes>
              <Route path="/debug-test" element={<div style={{background:'orange',color:'black',padding:24,fontWeight:'bold',fontSize:28}}>DEBUG: /debug-test route is rendering!</div>} />
              {/* Public routes */}
              <Route path="/" element={
                <ErrorBoundary>
                  <Suspense fallback={<LoadingScreen />}>
                    <SubdomainRouter />
                  </Suspense>
                </ErrorBoundary>
              } />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/services" element={<ServicesPage />} />
              {/* Service detail pages */}
              <Route path="/workspace" element={window.location.hostname === 'my.citricloud.com' ? <Workspace /> : <ServicesPages.WorkspaceService />} />
              <Route path="/services/workspace" element={<ServicesPages.Workspace />} />
              <Route path="/services/cloud-hosting" element={<ServicesPages.CloudHosting />} />
              <Route path="/services/web-development" element={<ServicesPages.WebDevelopment />} />
              <Route path="/services/app-development" element={<ServicesPages.AppDevelopment />} />
              <Route path="/services/e-commerce" element={<ServicesPages.EcommerceSolutions />} />
              <Route path="/services/database-management" element={<ServicesPages.DatabaseManagement />} />
              <Route path="/services/api-development" element={<ServicesPages.APIDevelopment />} />
              <Route path="/services/devops" element={<ServicesPages.DevOps />} />
              <Route path="/services/cloud-migration" element={<ServicesPages.CloudMigration />} />
              <Route path="/services/consulting" element={<ServicesPages.Consulting />} />
              <Route path="/services/managed-services" element={<ServicesPages.ManagedServices />} />
              <Route path="/services/security" element={<ServicesPages.SecurityServices />} />
              <Route path="/services/backup-recovery" element={<ServicesPages.BackupRecovery />} />
              <Route path="/blog" element={<BlogPage />} />
              <Route path="/blog-posts" element={<BlogPostsPage />} />
              <Route path="/blog/:categorySlug/:slug" element={<BlogPostPage />} />
              <Route path="/blog/:slug" element={<BlogPostPage />} />
              <Route path="/:categorySlug/:slug" element={<BlogPostPage />} />
              <Route path="/shop" element={<ShopHome />} />
              <Route path="/catalog" element={<Catalog />} />
              <Route path="/hosting-plans" element={<HostingPlans />} />
              <Route path="/software" element={<Software />} />
              <Route path="/domains" element={<Domains />} />
              <Route path="/ssl" element={<SSL />} />
              <Route path="/special-offers" element={<SpecialOffers />} />
              <Route path="/control-panels" element={<ControlPanels />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/thank-you" element={<ThankYouPage />} />
              {/* Product routes with category and optional subcategory */}
              <Route path="/catalog/:category/:subcategory/product/:slug" element={<ProductDetailPage />} />
              <Route path="/catalog/:category/product/:slug" element={<ProductDetailPage />} />
              <Route path="/:category/:subcategory/product/:slug" element={<ProductDetailPage />} />
              <Route path="/:category/product/:slug" element={<ProductDetailPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/faq" element={<FAQPage />} />
              <Route path="/careers" element={<CareersPage />} />
              <Route path="/status" element={<StatusPage />} />
              <Route path="/log" element={<LogPage />} />
              <Route path="/api-reference" element={isAuthenticated ? <APIReferencePage /> : <Navigate to="/error/403" replace />} />
              <Route path="/documentation" element={<DocumentationPage />} />
              <Route path="/docs" element={<DocumentationPage />} />
              <Route path="/error-pages" element={<ErrorPages />} />
              <Route path="/sitemap" element={<SitemapPage />} />
              <Route path="/help-center" element={<HelpCenterPage />} />
              <Route path="/center" element={<HelpCenterPage />} />
              <Route path="/contact/community" element={<CommunityPage />} />
              <Route path="/admin/community" element={<AdminCommunity />} />
              {/* Legal Pages */}
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/cookies" element={<CookiesPage />} />
              <Route path="/disclaimer" element={<DisclaimerPage />} />
              <Route path="/accessibility" element={<AccessibilityPage />} />
              <Route path="/fair-use" element={<FairUsePage />} />
              <Route path="/responsible-disclosure" element={<ResponsibleDisclosurePage />} />
              <Route path="/withdrawal-policy" element={<WithdrawalPolicyPage />} />
              {/* Special Pages */}
              <Route path="/coming-soon" element={<ComingSoon />} />
              <Route path="/maintenance" element={<Maintenance />} />
              <Route path="/landing" element={<Landing />} />
              {/* Error Pages */}
              <Route path="/error/400" element={<Error400 />} />
              <Route path="/error/401" element={<Error401 />} />
              <Route path="/error/403" element={<Error403 />} />
              <Route path="/error/404" element={<Error404 />} />
              <Route path="/error/418" element={<Error418 />} />
              <Route path="/error/429" element={<Error429 />} />
              <Route path="/error/500" element={<Error500 />} />
              <Route path="/error/502" element={<Error502 />} />
              <Route path="/error/503" element={<Error503 />} />
              <Route path="/error/504" element={<Error504 />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              {/* Protected routes */}
              <Route path="/profile" element={<WebsiteProfile />} />
              <Route path="/shared-inbox/:sharedEmailId" element={<SharedEmailInbox />} />
              <Route path="/message/:id" element={<MessageView />} />
              <Route path="/dashboard" element={<MainDashboard />} />
              <Route path="/dashboard/teams" element={<Teams />} />
              <Route path="/dashboard/messages" element={<Messages />} />
              <Route path="/dashboard/file-sharing" element={<FileSharing />} />
              <Route path="/dashboard/activity" element={<ActivityFeed />} />
              <Route path="/dashboard/crm/*" element={<CRMDashboard />} />
              <Route path="/dashboard/cms" element={<CMSPages />} />
              <Route path="/dashboard/cms/posts" element={<CMSBlogPosts />} />
              <Route path="/dashboard/cms/comments" element={<CMSComments />} />
              <Route path="/dashboard/cms/reports" element={<CMSReports />} />
              <Route path="/dashboard/cms/categories" element={<CMSCategories />} />
              <Route path="/dashboard/cms/menus" element={<CMSMenus />} />
              <Route path="/dashboard/cms/media" element={<CMSMedia />} />
              <Route path="/dashboard/cms/frontend-settings" element={<CMSFrontendSettings />} />
              <Route path="/dashboard/cms/*" element={<CMSDashboard />} />
              <Route path="/dashboard/erp/orders/:orderId" element={<ERPDashboard />} />
              <Route path="/dashboard/erp/*" element={<ERPDashboard />} />
              <Route path="/dashboard/srm" element={<SRMOverview />} />
              <Route path="/dashboard/srm/cpu" element={<SRMCPUPage />} />
              <Route path="/dashboard/srm/storage" element={<SRMStoragePage />} />
              <Route path="/dashboard/srm/network" element={<SRMNetworkPage />} />
              <Route path="/dashboard/srm/backups" element={<SRMBackupsPage />} />
              <Route path="/dashboard/srm/snapshots" element={<SRMSnapshotsPage />} />
              <Route path="/dashboard/srm/databases" element={<SRMDatabasesPage />} />
              <Route path="/dashboard/srm/api-endpoints" element={<SRMAPIEndpointsPage />} />
              <Route path="/dashboard/srm/terminal" element={<SRMTerminalPage />} />
              <Route path="/dashboard/srm/caches" element={<SRMCaches />} />
              <Route path="/dashboard/srm/domains" element={<SRMDomains />} />
              <Route path="/dashboard/srm/ipaddress" element={<SRMIPAddress />} />
              <Route path="/dashboard/srm/ssl-tls" element={<SRMSSLTLs />} />
              <Route path="/dashboard/srm/performance" element={<SRMPerformance />} />
              <Route path="/dashboard/srm/traffic" element={<SRMTraffic />} />
              <Route path="/dashboard/srm/whitelist" element={<SRMWhitelist />} />
              <Route path="/dashboard/srm/blacklist" element={<SRMBlacklist />} />
              <Route path="/dashboard/dms" element={<DMSOverview />} />
              <Route path="/dashboard/dms/shared" element={<DMSShared />} />
              <Route path="/dashboard/dms/recent" element={<DMSRecent />} />
              <Route path="/dashboard/dms/storage" element={<SRMStoragePage />} />
              <Route path="/dashboard/srm/cdn" element={<SRMCDN />} />
              <Route path="/dashboard/srm/*" element={<SRMDashboard />} />
              <Route path="/workspace/email" element={<EmailApp />} />
              <Route path="/workspace/sheets" element={<SheetsApp />} />
              <Route path="/workspace/words" element={<WordsApp />} />
              <Route path="/workspace/words/new" element={<WordsEditor />} />
              <Route path="/workspace/projects" element={<ProjectsApp />} />
              <Route path="/workspace/lists" element={<ListsApp />} />
              <Route path="/workspace/drive" element={<DriveApp />} />
              <Route path="/workspace/planner" element={<PlannerApp />} />
              <Route path="/workspace/todo" element={<TodoApp />} />
              <Route path="/workspace/contacts" element={<ContactsApp />} />
              <Route path="/workspace/teams" element={<TeamsApp />} />
              <Route path="/workspace/bookings" element={<BookingsApp />} />
              <Route path="/workspace/whiteboard" element={<WhiteboardApp />} />
              <Route path="/workspace/visio" element={<VisioApp />} />
              <Route path="/workspace/forms" element={<FormsApp />} />
              <Route path="/workspace/courses" element={<CoursesApp />} />
              {/* 404 */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Suspense>
      </ErrorBoundary>
          </ChatProvider>
        </OperatorsProvider>
      </OpeningHoursProvider>
    </ToastProvider>
  );
}

export default App;
