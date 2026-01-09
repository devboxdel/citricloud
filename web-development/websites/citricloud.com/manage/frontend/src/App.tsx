import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';

// Lazy load pages
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Servers = lazy(() => import('./pages/Servers'));
const VPN = lazy(() => import('./pages/VPN'));
const Domains = lazy(() => import('./pages/Domains'));
const DNS = lazy(() => import('./pages/DNS'));
const Email = lazy(() => import('./pages/Email'));
const WordPress = lazy(() => import('./pages/WordPress'));
const ControlPanels = lazy(() => import('./pages/ControlPanels'));
const ComingSoon = lazy(() => import('./pages/ComingSoon'));

// Specific pages
const DeployServer = lazy(() => import('./pages/servers/DeployServer'));
const ServerMonitoring = lazy(() => import('./pages/servers/Monitoring'));
const ServerBackups = lazy(() => import('./pages/servers/ServerBackups'));
const ServerFirewalls = lazy(() => import('./pages/servers/ServerFirewalls'));
const RegisterDomain = lazy(() => import('./pages/domains/RegisterDomain'));
const DomainTransfer = lazy(() => import('./pages/domains/DomainTransfer'));
const CreateVPN = lazy(() => import('./pages/vpn/CreateVPN'));
const DNSRecords = lazy(() => import('./pages/dns/DNSRecords'));
const EmailAccounts = lazy(() => import('./pages/email/EmailAccounts'));
const WordPressPlugins = lazy(() => import('./pages/wordpress/WordPressPlugins'));
const WordPressInstall = lazy(() => import('./pages/wordpress/WordPressInstall'));
const WordPressThemes = lazy(() => import('./pages/wordpress/WordPressThemes'));
const ControlPanelInstall = lazy(() => import('./pages/control-panels/ControlPanelInstall'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 30000,
    },
  },
});

const LoadingScreen = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
);

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, setAuth } = useAuthStore();
  const [checking, setChecking] = React.useState(true);
  
  React.useEffect(() => {
    const checkAuth = () => {
      // If already authenticated via localStorage, we're good
      if (isAuthenticated) {
        setChecking(false);
        return;
      }
      
      // Try to get auth from cookies (shared across subdomains)
      const getCookie = (name: string) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop()?.split(';').shift();
        return null;
      };
      
      const token = getCookie('access_token');
      const userStr = getCookie('user');
      
      if (token && userStr) {
        try {
          const user = JSON.parse(decodeURIComponent(userStr));
          setAuth(user, token, '');
          setChecking(false);
          return;
        } catch (e) {
          console.error('Failed to parse auth from cookies:', e);
        }
      }
      
      // Check URL params for auth data from redirect
      const params = new URLSearchParams(window.location.search);
      const urlToken = params.get('token');
      const userData = params.get('user');
      
      if (urlToken && userData) {
        try {
          const user = JSON.parse(decodeURIComponent(userData));
          setAuth(user, urlToken, '');
          // Clean URL
          window.history.replaceState({}, '', window.location.pathname);
          setChecking(false);
          return;
        } catch (e) {
          console.error('Failed to parse auth data from URL:', e);
        }
      }
      
      // No valid auth found - redirect to login
      window.location.href = 'https://my.citricloud.com/login?redirect=' + encodeURIComponent(window.location.href);
    };
    
    checkAuth();
  }, [isAuthenticated, setAuth]);
  
  if (checking) {
    return <LoadingScreen />;
  }
  
  return <>{children}</>;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Suspense fallback={<LoadingScreen />}>
          <Routes>
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/servers"
              element={
                <ProtectedRoute>
                  <Servers />
                </ProtectedRoute>
              }
            />
            <Route
              path="/vpn"
              element={
                <ProtectedRoute>
                  <VPN />
                </ProtectedRoute>
              }
            />
            <Route
              path="/domains"
              element={
                <ProtectedRoute>
                  <Domains />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dns"
              element={
                <ProtectedRoute>
                  <DNS />
                </ProtectedRoute>
              }
            />
            <Route
              path="/email"
              element={
                <ProtectedRoute>
                  <Email />
                </ProtectedRoute>
              }
            />
            <Route
              path="/wordpress"
              element={
                <ProtectedRoute>
                  <WordPress />
                </ProtectedRoute>
              }
            />
            <Route
              path="/control-panels"
              element={
                <ProtectedRoute>
                  <ControlPanels />
                </ProtectedRoute>
              }
            />
            
            {/* Dashboard Sub-routes */}
            <Route path="/analytics" element={<ProtectedRoute><ComingSoon /></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute><ComingSoon /></ProtectedRoute>} />
            <Route path="/activity-log" element={<ProtectedRoute><ComingSoon /></ProtectedRoute>} />
            <Route path="/billing" element={<ProtectedRoute><ComingSoon /></ProtectedRoute>} />
            <Route path="/billing-history" element={<ProtectedRoute><ComingSoon /></ProtectedRoute>} />
            <Route path="/usage" element={<ProtectedRoute><ComingSoon /></ProtectedRoute>} />

            {/* Servers Sub-routes */}
            <Route path="/servers/deploy" element={<ProtectedRoute><DeployServer /></ProtectedRoute>} />
            <Route path="/servers/monitoring" element={<ProtectedRoute><ServerMonitoring /></ProtectedRoute>} />
            <Route path="/servers/backups" element={<ProtectedRoute><ServerBackups /></ProtectedRoute>} />
            <Route path="/servers/snapshots" element={<ProtectedRoute><ComingSoon /></ProtectedRoute>} />
            <Route path="/servers/monitoring" element={<ProtectedRoute><ServerMonitoring /></ProtectedRoute>} />
            <Route path="/servers/firewalls" element={<ProtectedRoute><ServerFirewalls /></ProtectedRoute>} />
            <Route path="/servers/load-balancers" element={<ProtectedRoute><ComingSoon /></ProtectedRoute>} />
            <Route path="/servers/ssh-keys" element={<ProtectedRoute><ComingSoon /></ProtectedRoute>} />
            <Route path="/servers/logs" element={<ProtectedRoute><ComingSoon /></ProtectedRoute>} />
            <Route path="/servers/auto-scaling" element={<ProtectedRoute><ComingSoon /></ProtectedRoute>} />

            {/* VPN Sub-routes */}
            <Route path="/vpn/create" element={<ProtectedRoute><CreateVPN /></ProtectedRoute>} />
            <Route path="/vpn/users" element={<ProtectedRoute><ComingSoon /></ProtectedRoute>} />
            <Route path="/vpn/access-control" element={<ProtectedRoute><ComingSoon /></ProtectedRoute>} />
            <Route path="/vpn/tunnels" element={<ProtectedRoute><ComingSoon /></ProtectedRoute>} />
            <Route path="/vpn/certificates" element={<ProtectedRoute><ComingSoon /></ProtectedRoute>} />
            <Route path="/vpn/logs" element={<ProtectedRoute><ComingSoon /></ProtectedRoute>} />
            <Route path="/vpn/settings" element={<ProtectedRoute><ComingSoon /></ProtectedRoute>} />

            {/* Domains Sub-routes */}
            <Route path="/domains/register" element={<ProtectedRoute><RegisterDomain /></ProtectedRoute>} />
            <Route path="/domains/transfer" element={<ProtectedRoute><DomainTransfer /></ProtectedRoute>} />
            <Route path="/domains/privacy" element={<ProtectedRoute><ComingSoon /></ProtectedRoute>} />
            <Route path="/domains/auto-renewal" element={<ProtectedRoute><ComingSoon /></ProtectedRoute>} />
            <Route path="/domains/whois" element={<ProtectedRoute><ComingSoon /></ProtectedRoute>} />
            <Route path="/domains/subdomains" element={<ProtectedRoute><ComingSoon /></ProtectedRoute>} />
            <Route path="/domains/settings" element={<ProtectedRoute><ComingSoon /></ProtectedRoute>} />

            {/* DNS Sub-routes */}
            <Route path="/dns/add-zone" element={<ProtectedRoute><ComingSoon /></ProtectedRoute>} />
            <Route path="/dns/records" element={<ProtectedRoute><DNSRecords /></ProtectedRoute>} />
            <Route path="/dns/dnssec" element={<ProtectedRoute><ComingSoon /></ProtectedRoute>} />
            <Route path="/dns/nameservers" element={<ProtectedRoute><ComingSoon /></ProtectedRoute>} />
            <Route path="/dns/templates" element={<ProtectedRoute><ComingSoon /></ProtectedRoute>} />
            <Route path="/dns/reverse-dns" element={<ProtectedRoute><ComingSoon /></ProtectedRoute>} />
            <Route path="/dns/analytics" element={<ProtectedRoute><ComingSoon /></ProtectedRoute>} />

            {/* Email Sub-routes */}
            <Route path="/email/create" element={<ProtectedRoute><EmailAccounts /></ProtectedRoute>} />
            <Route path="/email/forwarders" element={<ProtectedRoute><ComingSoon /></ProtectedRoute>} />
            <Route path="/email/aliases" element={<ProtectedRoute><ComingSoon /></ProtectedRoute>} />
            <Route path="/email/mailing-lists" element={<ProtectedRoute><ComingSoon /></ProtectedRoute>} />
            <Route path="/email/auto-responders" element={<ProtectedRoute><ComingSoon /></ProtectedRoute>} />
            <Route path="/email/spam-filters" element={<ProtectedRoute><ComingSoon /></ProtectedRoute>} />
            <Route path="/email/logs" element={<ProtectedRoute><ComingSoon /></ProtectedRoute>} />
            <Route path="/email/settings" element={<ProtectedRoute><ComingSoon /></ProtectedRoute>} />

            {/* WordPress Sub-routes */}
            <Route path="/wordpress/install" element={<ProtectedRoute><WordPressInstall /></ProtectedRoute>} />
            <Route path="/wordpress/themes" element={<ProtectedRoute><WordPressThemes /></ProtectedRoute>} />
            <Route path="/wordpress/plugins" element={<ProtectedRoute><WordPressPlugins /></ProtectedRoute>} />
            <Route path="/wordpress/updates" element={<ProtectedRoute><ComingSoon /></ProtectedRoute>} />
            <Route path="/wordpress/backups" element={<ProtectedRoute><ComingSoon /></ProtectedRoute>} />
            <Route path="/wordpress/security" element={<ProtectedRoute><ComingSoon /></ProtectedRoute>} />
            <Route path="/wordpress/performance" element={<ProtectedRoute><ComingSoon /></ProtectedRoute>} />
            <Route path="/wordpress/staging" element={<ProtectedRoute><ComingSoon /></ProtectedRoute>} />

            {/* Control Panels Sub-routes */}
            <Route path="/control-panels/install" element={<ProtectedRoute><ControlPanelInstall /></ProtectedRoute>} />
            <Route path="/control-panels/cpanel" element={<ProtectedRoute><ComingSoon /></ProtectedRoute>} />
            <Route path="/control-panels/plesk" element={<ProtectedRoute><ComingSoon /></ProtectedRoute>} />
            <Route path="/control-panels/directadmin" element={<ProtectedRoute><ComingSoon /></ProtectedRoute>} />
            <Route path="/control-panels/webmin" element={<ProtectedRoute><ComingSoon /></ProtectedRoute>} />
            <Route path="/control-panels/licenses" element={<ProtectedRoute><ComingSoon /></ProtectedRoute>} />
            <Route path="/control-panels/settings" element={<ProtectedRoute><ComingSoon /></ProtectedRoute>} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </Router>
      <Toaster
        position="top-right"
        toastOptions={{
          className: 'glass-card',
          duration: 4000,
        }}
      />
    </QueryClientProvider>
  );
}

export default App;
