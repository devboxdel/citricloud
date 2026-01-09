import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Server, Shield, Globe, Globe2, Mail, FileCode, Layout, X } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import Navbar from './Navbar';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [selectedCategory, setSelectedCategory] = React.useState('servers');
  const location = useLocation();

  const navigation = [
    { id: 'dashboard', name: 'Dashboard', href: '/', icon: Layout },
    { id: 'servers', name: 'Servers', icon: Server },
    { id: 'vpn', name: 'VPN', icon: Shield },
    { id: 'domains', name: 'Domains', icon: Globe },
    { id: 'dns', name: 'DNS', icon: Globe2 },
    { id: 'email', name: 'Email', icon: Mail },
    { id: 'wordpress', name: 'WordPress', icon: FileCode },
    { id: 'control-panels', name: 'Control Panels', icon: Layout },
  ];

  const subPages: Record<string, Array<{ category?: string; name: string; href: string }>> = {
    dashboard: [
      { category: 'Overview', name: 'Dashboard', href: '/' },
      { name: 'Analytics', href: '/analytics' },
      { name: 'Reports', href: '/reports' },
      { category: 'Account', name: 'Activity Log', href: '/activity-log' },
      { name: 'Billing', href: '/billing' },
      { name: 'Billing History', href: '/billing-history' },
      { name: 'Usage Statistics', href: '/usage' },
    ],
    servers: [
      { category: 'Management', name: 'All Servers', href: '/servers' },
      { name: 'Deploy Server', href: '/servers/deploy' },
      { name: 'Monitoring', href: '/servers/monitoring' },
      { category: 'Backup & Recovery', name: 'Backups', href: '/servers/backups' },
      { name: 'Snapshots', href: '/servers/snapshots' },
      { category: 'Security', name: 'Firewalls', href: '/servers/firewalls' },
      { name: 'SSH Keys', href: '/servers/ssh-keys' },
      { category: 'Advanced', name: 'Load Balancers', href: '/servers/load-balancers' },
      { name: 'Auto Scaling', href: '/servers/auto-scaling' },
      { name: 'Server Logs', href: '/servers/logs' },
    ],
    vpn: [
      { category: 'Connections', name: 'VPN Connections', href: '/vpn' },
      { name: 'Create VPN', href: '/vpn/create' },
      { name: 'VPN Tunnels', href: '/vpn/tunnels' },
      { category: 'Access Management', name: 'VPN Users', href: '/vpn/users' },
      { name: 'Access Control', href: '/vpn/access-control' },
      { name: 'Certificates', href: '/vpn/certificates' },
      { category: 'Monitoring', name: 'Connection Logs', href: '/vpn/logs' },
      { name: 'VPN Settings', href: '/vpn/settings' },
    ],
    domains: [
      { category: 'Management', name: 'My Domains', href: '/domains' },
      { name: 'Subdomains', href: '/domains/subdomains' },
      { category: 'Registration', name: 'Register Domain', href: '/domains/register' },
      { name: 'Transfer Domain', href: '/domains/transfer' },
      { name: 'WHOIS Lookup', href: '/domains/whois' },
      { category: 'Settings', name: 'Domain Privacy', href: '/domains/privacy' },
      { name: 'Auto Renewal', href: '/domains/auto-renewal' },
      { name: 'Domain Settings', href: '/domains/settings' },
    ],
    dns: [
      { category: 'Zone Management', name: 'DNS Zones', href: '/dns' },
      { name: 'Add Zone', href: '/dns/add-zone' },
      { name: 'DNS Records', href: '/dns/records' },
      { category: 'Security', name: 'DNSSEC', href: '/dns/dnssec' },
      { name: 'Reverse DNS', href: '/dns/reverse-dns' },
      { category: 'Configuration', name: 'Nameservers', href: '/dns/nameservers' },
      { name: 'DNS Templates', href: '/dns/templates' },
      { name: 'DNS Analytics', href: '/dns/analytics' },
    ],
    email: [
      { category: 'Accounts', name: 'Email Accounts', href: '/email' },
      { name: 'Create Account', href: '/email/create' },
      { category: 'Routing', name: 'Forwarders', href: '/email/forwarders' },
      { name: 'Aliases', href: '/email/aliases' },
      { name: 'Mailing Lists', href: '/email/mailing-lists' },
      { category: 'Automation', name: 'Auto Responders', href: '/email/auto-responders' },
      { name: 'Spam Filters', href: '/email/spam-filters' },
      { category: 'Monitoring', name: 'Email Logs', href: '/email/logs' },
      { name: 'Email Settings', href: '/email/settings' },
    ],
    wordpress: [
      { category: 'Sites', name: 'WordPress Sites', href: '/wordpress' },
      { name: 'Install WordPress', href: '/wordpress/install' },
      { name: 'Staging Sites', href: '/wordpress/staging' },
      { category: 'Customization', name: 'Themes', href: '/wordpress/themes' },
      { name: 'Plugins', href: '/wordpress/plugins' },
      { category: 'Maintenance', name: 'Updates', href: '/wordpress/updates' },
      { name: 'Backups', href: '/wordpress/backups' },
      { name: 'Security', href: '/wordpress/security' },
      { name: 'Performance', href: '/wordpress/performance' },
    ],
    'control-panels': [
      { category: 'Management', name: 'Installed Panels', href: '/control-panels' },
      { name: 'Install Panel', href: '/control-panels/install' },
      { category: 'Panels', name: 'cPanel/WHM', href: '/control-panels/cpanel' },
      { name: 'Plesk', href: '/control-panels/plesk' },
      { name: 'DirectAdmin', href: '/control-panels/directadmin' },
      { name: 'Webmin', href: '/control-panels/webmin' },
      { category: 'Settings', name: 'Panel Licenses', href: '/control-panels/licenses' },
      { name: 'Panel Settings', href: '/control-panels/settings' },
    ],
  };

  // Determine selected category based on current path
  React.useEffect(() => {
    const path = location.pathname;
    if (path === '/') {
      setSelectedCategory('dashboard');
    } else if (path.startsWith('/servers')) {
      setSelectedCategory('servers');
    } else if (path.startsWith('/vpn')) {
      setSelectedCategory('vpn');
    } else if (path.startsWith('/domains')) {
      setSelectedCategory('domains');
    } else if (path.startsWith('/dns')) {
      setSelectedCategory('dns');
    } else if (path.startsWith('/email')) {
      setSelectedCategory('email');
    } else if (path.startsWith('/wordpress')) {
      setSelectedCategory('wordpress');
    } else if (path.startsWith('/control-panels')) {
      setSelectedCategory('control-panels');
    }
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-800">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Icon Sidebar - Always visible on desktop */}
      <aside className="hidden lg:block lg:fixed lg:top-0 lg:left-0 h-screen w-20 bg-gray-50 dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 shadow-sm z-50">
        <nav className="flex flex-col items-center py-4 space-y-4">
          {navigation.map((item) => {
            const isActive = selectedCategory === item.id;
            return (
              <div key={item.name} className="relative group">
                <button
                  onClick={() => setSelectedCategory(item.id)}
                  className={`p-3 rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-primary-600 text-white shadow-lg'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <item.icon size={24} />
                </button>
                {/* Popover */}
                <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none z-[100]">
                  <div className="bg-gray-900 dark:bg-gray-950 text-white px-3 py-2 rounded-lg shadow-2xl whitespace-nowrap text-sm font-medium border border-gray-700">
                    {item.name}
                    <div className="absolute right-full top-1/2 -translate-y-1/2 border-8 border-transparent border-r-gray-900 dark:border-r-gray-950"></div>
                  </div>
                </div>
              </div>
            );
          })}
        </nav>
      </aside>

      {/* Full Sidebar - Always visible on desktop, toggleable on mobile */}
      <aside
        className={`fixed lg:fixed inset-y-0 left-0 lg:left-20 z-40 w-64 h-screen bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl border-r border-gray-200 dark:border-gray-800 transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 transition-transform duration-300 ease-in-out shadow-xl overflow-y-auto`}
      >
        <div className="flex flex-col h-full px-6 pb-6 pt-6">
          {/* Mobile Close Button */}
          <div className="flex items-center justify-end mb-4 lg:hidden">
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X size={24} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2">
            <div className="mb-6">
              <h2 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-widest px-4">
                {navigation.find(n => n.id === selectedCategory)?.name}
              </h2>
            </div>
            {(() => {
              let lastCategory = '';
              return subPages[selectedCategory]?.map((page) => {
                const isActive = location.pathname === page.href;
                const showCategory = page.category && page.category !== lastCategory;
                if (page.category) lastCategory = page.category;
                
                return (
                  <React.Fragment key={page.name}>
                    {showCategory && (
                      <div className="px-4 pt-4 pb-2">
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          {page.category}
                        </p>
                      </div>
                    )}
                    <Link
                      to={page.href}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${showCategory ? '' : ''} ${
                        isActive
                          ? 'bg-primary-600 text-white shadow-lg'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100/80 dark:hover:bg-gray-800/80'
                      }`}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <span className="font-medium text-sm">{page.name}</span>
                    </Link>
                  </React.Fragment>
                );
              });
            })()}
          </nav>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen lg:ml-80">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />
        {/* Page content */}
        <main className="flex-1 p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
