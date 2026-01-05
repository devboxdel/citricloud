import { useState, useEffect } from 'react';
import { FiMail, FiFileText, FiGrid as FiExcel, FiPieChart, FiEdit3, FiCloud, FiUsers, FiCalendar, FiCheckSquare, FiList, FiBook, FiMessageSquare, FiPhone, FiFolder, FiLayout, FiBarChart2, FiMap, FiTrello, FiZap, FiLock, FiAlertCircle } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import Navbar from '../components/Navbar';
import Topbar from '../components/Topbar';
import Footer from '../components/Footer';

export default function Workspace() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('Productivity');
  const [showAllApps, setShowAllApps] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Check if user has Workspace access
  const hasWorkspaceAccess = ['system_admin', 'administrator', 'developer'].includes(user?.role || '');

  useEffect(() => {
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };
    checkDarkMode();
    
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    // If user doesn't have access, they can still view the page but apps will be locked
    // This allows them to see what's available
  }, [user]);

  const apps = [
    { name: 'Email', icon: FiMail, color: 'bg-blue-500', href: '/workspace/email', desc: 'Send, receive and manage email' },
    { name: 'Words', icon: FiFileText, color: 'bg-purple-600', href: '/workspace/words', desc: 'Create and edit documents' },
    { name: 'Sheets', icon: FiExcel, color: 'bg-green-600', href: '/workspace/sheets', desc: 'Create and edit spreadsheets' },
    { name: 'Drive', icon: FiCloud, color: 'bg-cyan-600', href: '/workspace/drive', desc: 'Cloud file storage' },
  ];

  const usedInApps = [
    { name: 'Bookings', icon: FiCalendar, color: 'bg-orange-600', href: '/workspace/bookings', desc: 'Simplify scheduling appointments' },
    { name: 'Contacts', icon: FiUsers, color: 'bg-teal-500', href: '/workspace/contacts', desc: 'Manage your contacts' },
    { name: 'Todo', icon: FiCheckSquare, color: 'bg-indigo-500', href: '/workspace/todo', desc: 'Task management' },
  ];

  const categories = ['Productivity', 'Communication', 'Planning', 'Content', 'More'];

  const categoryApps: Record<string, any[]> = {
    Productivity: [
      { name: 'Bookings', icon: FiCalendar, color: 'bg-orange-600', href: '/workspace/bookings', desc: 'Simplify scheduling appointments' },
      { name: 'Forms', icon: FiFileText, color: 'bg-purple-600', href: '/workspace/forms', desc: 'Create surveys and forms' },
      { name: 'Teams', icon: FiUsers, color: 'bg-teal-700', href: '/workspace/teams', desc: 'Manage teams and members' },
      { name: 'Lists', icon: FiList, color: 'bg-red-500', href: '/workspace/lists', desc: 'Track information and organize work' },
      { name: 'Todo', icon: FiCheckSquare, color: 'bg-indigo-500', href: '/workspace/todo', desc: 'Task management' },
      { name: 'Courses', icon: FiBook, color: 'bg-amber-500', href: '/workspace/courses', desc: 'Learn apps with guided lessons' },
    ],
    Communication: [
      { name: 'Email', icon: FiMail, color: 'bg-blue-500', href: '/workspace/email', desc: 'Send and receive messages' },
      { name: 'Contacts', icon: FiUsers, color: 'bg-teal-500', href: '/workspace/contacts', desc: 'Manage contacts' },
    ],
    Planning: [
      { name: 'Planner', icon: FiCalendar, color: 'bg-pink-500', href: '/workspace/planner', desc: 'Plan and organize' },
      { name: 'Projects', icon: FiFolder, color: 'bg-orange-500', href: '/workspace/projects', desc: 'Project management' },
    ],
    Content: [
      { name: 'Words', icon: FiFileText, color: 'bg-purple-600', href: '/workspace/words', desc: 'Create documents' },
      { name: 'Sheets', icon: FiExcel, color: 'bg-green-600', href: '/workspace/sheets', desc: 'Create spreadsheets' },
      { name: 'Visio', icon: FiMap, color: 'bg-violet-500', href: '/workspace/visio', desc: 'Create diagrams' },
      { name: 'Whiteboard', icon: FiEdit3, color: 'bg-rose-500', href: '/workspace/whiteboard', desc: 'Visual collaboration' },
    ],
    More: [
      { name: 'Drive', icon: FiCloud, color: 'bg-cyan-600', href: '/workspace/drive', desc: 'Cloud storage' },
    ],
  };

  // Get all unique apps
  const allApps = Object.values(categoryApps).flat().filter((app, index, self) => 
    index === self.findIndex((a) => a.name === app.name)
  );

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Topbar />
      <Navbar />
      <main className="flex-1 pt-28 sm:pt-32 pb-12">
        <div className="max-w-7xl mx-auto px-6">
          {/* License Warning Banner */}
          {!hasWorkspaceAccess && (
            <div className="mb-8 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-yellow-500/10 dark:bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
                  <FiLock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Workspace License Required</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                    {['manager', 'user'].includes(user?.role || '') 
                      ? 'Workspace licensing for your role is coming soon. You will be notified once licenses become available.'
                      : 'You need a valid Workspace license to access these apps. Please contact your administrator or upgrade your account.'}
                  </p>
                  <button
                    onClick={() => navigate('/account/profile')}
                    className="px-4 py-2 rounded-lg bg-yellow-500 hover:bg-yellow-600 text-white font-medium transition-all text-sm"
                  >
                    View License Details
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="mb-12">
            <h1 className="text-3xl font-semibold text-gray-900 dark:text-white mb-8">Apps</h1>
            
            {/* Most Frequently Used Apps */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Most frequently used</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {apps.map((app) => (
                  hasWorkspaceAccess ? (
                    <a
                      key={app.name}
                      href={app.href}
                      className="group bg-white dark:bg-gray-800 rounded-lg p-4 hover:shadow-md transition-all border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                    >
                      <div className={`w-12 h-12 ${app.color} rounded-lg flex items-center justify-center text-white mb-3`}>
                        <app.icon className="w-6 h-6" />
                      </div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white mb-1">{app.name}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">{app.desc}</div>
                    </a>
                  ) : (
                    <div
                      key={app.name}
                      className="relative group bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 opacity-60 cursor-not-allowed"
                    >
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-900/5 dark:bg-gray-900/20 rounded-lg">
                        <FiLock className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                      </div>
                      <div className={`w-12 h-12 ${app.color} rounded-lg flex items-center justify-center text-white mb-3`}>
                        <app.icon className="w-6 h-6" />
                      </div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white mb-1">{app.name}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">{app.desc}</div>
                    </div>
                  )
                ))}
              </div>
            </div>

            <div className="text-right mb-6">
              <button 
                onClick={() => setShowAllApps(!showAllApps)}
                className="text-blue-600 hover:text-blue-700 dark:text-blue-400 text-sm font-medium"
              >
                {showAllApps ? 'Show less ↑' : 'All apps →'}
              </button>
            </div>

            {/* All Apps Expanded Section */}
            {showAllApps && (
              <div className="mb-12 animate-in fade-in slide-in-from-top-4 duration-300">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">All apps</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {allApps.map((app) => (
                    hasWorkspaceAccess ? (
                      <a
                        key={app.name}
                        href={app.href}
                        className="group bg-white dark:bg-gray-800 rounded-lg p-4 hover:shadow-md transition-all border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                      >
                        <div className={`w-12 h-12 ${app.color} rounded-lg flex items-center justify-center text-white mb-3`}>
                          <app.icon className="w-6 h-6" />
                        </div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white mb-1">{app.name}</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">{app.desc}</div>
                      </a>
                    ) : (
                      <div
                        key={app.name}
                        className="relative group bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 opacity-60 cursor-not-allowed"
                      >
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-900/5 dark:bg-gray-900/20 rounded-lg">
                          <FiLock className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                        </div>
                        <div className={`w-12 h-12 ${app.color} rounded-lg flex items-center justify-center text-white mb-3`}>
                          <app.icon className="w-6 h-6" />
                        </div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white mb-1">{app.name}</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">{app.desc}</div>
                      </div>
                    )
                  ))}
                </div>
              </div>
            )}
          </div>
          {/* Used in Teams, Outlook and Microsoft 365 Copilot */}
          <div className="mb-12">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Used in Teams, Email and CITRICLOUD Copilot</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {usedInApps.map((app) => (
                hasWorkspaceAccess ? (
                  <a
                    key={app.name}
                    href={app.href}
                    className="group bg-white dark:bg-gray-800 rounded-lg p-4 hover:shadow-md transition-all border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                  >
                    <div className={`w-10 h-10 ${app.color} rounded-lg flex items-center justify-center text-white mb-3`}>
                      <app.icon className="w-5 h-5" />
                    </div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white mb-1">{app.name}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">{app.desc}</div>
                  </a>
                ) : (
                  <div
                    key={app.name}
                    className="relative group bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 opacity-60 cursor-not-allowed"
                  >
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-900/5 dark:bg-gray-900/20 rounded-lg">
                      <FiLock className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    </div>
                    <div className={`w-10 h-10 ${app.color} rounded-lg flex items-center justify-center text-white mb-3`}>
                      <app.icon className="w-5 h-5" />
                    </div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white mb-1">{app.name}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">{app.desc}</div>
                  </div>
                )
              ))}
            </div>
          </div>

          {/* Explore by category */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Explore by category</h2>
            
            {/* Category Tabs */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    selectedCategory === cat
                      ? 'bg-blue-600 text-white'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Category Apps Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {categoryApps[selectedCategory]?.map((app) => (
                hasWorkspaceAccess ? (
                  <a
                    key={app.name}
                    href={app.href}
                    className="group bg-white dark:bg-gray-800 rounded-lg p-4 hover:shadow-md transition-all border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                  >
                    <div className={`w-10 h-10 ${app.color} rounded-lg flex items-center justify-center text-white mb-3`}>
                      <app.icon className="w-5 h-5" />
                    </div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white mb-1">{app.name}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">{app.desc}</div>
                  </a>
                ) : (
                  <div
                    key={app.name}
                    className="relative group bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 opacity-60 cursor-not-allowed"
                  >
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-900/5 dark:bg-gray-900/20 rounded-lg">
                      <FiLock className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    </div>
                    <div className={`w-10 h-10 ${app.color} rounded-lg flex items-center justify-center text-white mb-3`}>
                      <app.icon className="w-5 h-5" />
                    </div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white mb-1">{app.name}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">{app.desc}</div>
                  </div>
                )
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
