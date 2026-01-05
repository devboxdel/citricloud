import { motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import Navbar from '../components/Navbar';
import Topbar from '../components/Topbar';
import Footer from '../components/Footer';
import { FiBook, FiCode, FiZap, FiLayers, FiSettings, FiShield, FiPackage, FiGitBranch } from 'react-icons/fi';
import { useLanguage } from '../context/LanguageContext';

interface DocSection {
  id: string;
  title: string;
  icon: any;
  content: string[];
}

export default function DocumentationPage() {
  const { t } = useLanguage();
  const [activeSection, setActiveSection] = useState('getting-started');
  const [searchTerm, setSearchTerm] = useState('');

  const sections: DocSection[] = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: FiZap,
      content: [
        'Welcome to CITRICLOUD documentation. This guide will help you get started with our platform.',
        'CITRICLOUD is a comprehensive platform that combines dashboards, websites, and e-commerce with beautiful iOS-inspired liquid glass design.',
        'To begin using CITRICLOUD, you\'ll need to create an account and familiarize yourself with the dashboard interface.'
      ]
    },
    {
      id: 'installation',
      title: 'Installation',
      icon: FiPackage,
      content: [
        'Backend Requirements:',
        '• Python 3.9+',
        '• PostgreSQL 14+',
        '• FastAPI framework',
        '',
        'Frontend Requirements:',
        '• Node.js 18+',
        '• React 18',
        '• TypeScript',
        '• Vite build tool',
        '',
        'Clone the repository and install dependencies:',
        '```bash',
        'git clone https://github.com/citricloud/citricloud.git',
        'cd citricloud',
        '```'
      ]
    },
    {
      id: 'architecture',
      title: 'Architecture',
      icon: FiLayers,
      content: [
        'CITRICLOUD follows a modern full-stack architecture:',
        '',
        'Backend Stack:',
        '• FastAPI for REST API',
        '• SQLAlchemy for ORM',
        '• PostgreSQL for database',
        '• JWT for authentication',
        '• Pydantic for validation',
        '',
        'Frontend Stack:',
        '• React 18 with TypeScript',
        '• TanStack Query for data fetching',
        '• Zustand for state management',
        '• Framer Motion for animations',
        '• Tailwind CSS for styling'
      ]
    },
    {
      id: 'authentication',
      title: 'Authentication',
      icon: FiShield,
      content: [
        'CITRICLOUD uses JWT (JSON Web Tokens) for authentication.',
        '',
        'Authentication Flow:',
        '1. User logs in with username and password',
        '2. Server validates credentials and returns access token',
        '3. Client stores token in localStorage',
        '4. Token is sent with each API request in Authorization header',
        '',
        'Token Types:',
        '• Access Token: Valid for 30 minutes',
        '• Refresh Token: Valid for 7 days',
        '',
        'Example:',
        '```javascript',
        'const response = await fetch("/api/v1/auth/login", {',
        '  method: "POST",',
        '  headers: { "Content-Type": "application/json" },',
        '  body: JSON.stringify({ username, password })',
        '});',
        '```'
      ]
    },
    {
      id: 'api-usage',
      title: 'API Usage',
      icon: FiCode,
      content: [
        'All API endpoints are prefixed with /api/v1/',
        '',
        'Making Requests:',
        '• Base URL: https://citricloud.com',
        '• Content-Type: application/json',
        '• Authorization: Bearer {token}',
        '',
        'Example GET Request:',
        '```javascript',
        'const posts = await fetch("/api/v1/cms/posts", {',
        '  headers: {',
        '    "Authorization": `Bearer ${accessToken}`',
        '  }',
        '});',
        '```',
        '',
        'Example POST Request:',
        '```javascript',
        'const newPost = await fetch("/api/v1/cms/posts", {',
        '  method: "POST",',
        '  headers: {',
        '    "Content-Type": "application/json",',
        '    "Authorization": `Bearer ${accessToken}`',
        '  },',
        '  body: JSON.stringify({',
        '    title: "My Post",',
        '    content: "Post content",',
        '    category_id: 1',
        '  })',
        '});',
        '```'
      ]
    },
    {
      id: 'cms',
      title: 'CMS Features',
      icon: FiBook,
      content: [
        'CITRICLOUD includes a powerful Content Management System:',
        '',
        'Blog Management:',
        '• Create, edit, and delete blog posts',
        '• Organize posts with categories',
        '• Rich text editor support',
        '• Featured images',
        '• Draft and published states',
        '',
        'Product Management:',
        '• E-commerce product catalog',
        '• Product categories',
        '• Inventory tracking',
        '• Pricing management',
        '',
        'Media Library:',
        '• Upload and organize media files',
        '• Folder structure',
        '• Image optimization',
        '• Grid and list views'
      ]
    },
    {
      id: 'deployment',
      title: 'Deployment',
      icon: FiGitBranch,
      content: [
        'Deploying CITRICLOUD to production:',
        '',
        'Backend Deployment:',
        '1. Set environment variables',
        '2. Configure PostgreSQL database',
        '3. Run migrations',
        '4. Start the FastAPI server with Uvicorn',
        '',
        'Frontend Deployment:',
        '1. Build the production bundle',
        '2. Configure API base URL',
        '3. Deploy to hosting service (Vercel, Netlify, etc.)',
        '',
        'Environment Variables:',
        '• DATABASE_URL',
        '• JWT_SECRET_KEY',
        '• CORS_ORIGINS',
        '• VITE_API_BASE_URL'
      ]
    },
    {
      id: 'configuration',
      title: 'Configuration',
      icon: FiSettings,
      content: [
        'Configuration options for CITRICLOUD:',
        '',
        'Backend Configuration (backend/app/core/config.py):',
        '• Database connection',
        '• JWT settings',
        '• CORS origins',
        '• Upload directories',
        '',
        'Frontend Configuration:',
        '• API base URL',
        '• Theme settings',
        '• Route configuration',
        '• Build optimization',
        '',
        'Theme Customization:',
        '• Light/Dark mode',
        '• Auto mode (system or sunrise/sunset)',
        '• Glass-morphism effects',
        '• Custom color schemes'
      ]
    },
    {
      id: 'monitoring',
      title: 'Monitoring & Status',
      icon: FiSettings,
      content: [
        'Observability stack and operational readiness:',
        '',
        'Metrics & Logging:',
        '• Cloudflare analytics for cache HIT ratio and WAF blocks',
        '• API latency and uptime from /status instrumentation',
        '• Structured logs shipped to your log backend',
        '',
        'Health & Status:',
        '• Public status page at /status',
        '• Health checks at /health and /healthz',
        '',
        'Alerting:',
        '• Configure alerts for elevated origin error rate',
        '• Watch cache HIT ratio drops to catch purge needs'
      ]
    },
    {
      id: 'changelog',
      title: 'Releases & Changelog',
      icon: FiPackage,
      content: [
        'How updates are shipped and what to expect:',
        '',
        'Release cadence:',
        '• Patch releases as needed; feature releases bundled weekly',
        '• Frontend builds are hash-versioned; HTML purged on deploy',
        '',
        'Verification steps after deploy:',
        '• Run npm run build and ensure status page shows new assets',
        '• Purge HTML at Cloudflare (keep assets cached)',
        '• Verify /status and /sitemap routes load from edge cache'
      ]
    }
  ];

  const filteredSections = useMemo(() => {
    if (!searchTerm.trim()) return sections;
    const term = searchTerm.toLowerCase();
    return sections.filter((s) =>
      s.title.toLowerCase().includes(term) || s.content.some((c) => c.toLowerCase().includes(term))
    );
  }, [searchTerm, sections]);

  useEffect(() => {
    if (filteredSections.length === 0) return;
    if (!filteredSections.find((s) => s.id === activeSection)) {
      setActiveSection(filteredSections[0].id);
    }
  }, [filteredSections, activeSection]);

  const activeDoc = filteredSections.find(s => s.id === activeSection);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100 dark:from-gray-950 dark:via-slate-950 dark:to-black">
      <Topbar />
      <Navbar />

      <main className="flex-1">
        <section className="container mx-auto px-4 sm:px-6 pt-24 sm:pt-28 pb-16 max-w-7xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <h1 className="text-5xl font-bold text-gray-800 dark:text-gray-100 mb-4">
              Documentation
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Everything you need to know about CITRICLOUD
            </p>
          </motion.div>

          {/* Quick actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8"
          >
            {[{ label: 'API Reference', to: '/api-reference', desc: 'Endpoints & schemas' },
              { label: 'Status Page', to: '/status', desc: 'Uptime & incidents' },
              { label: 'Sitemap', to: '/sitemap', desc: 'All pages index' },
              { label: 'Support', to: '/help-center', desc: 'Guides & FAQs' }].map((card) => (
              <a
                key={card.to}
                href={card.to}
                className="glass-card p-4 rounded-xl border border-white/30 dark:border-gray-700/30 hover:-translate-y-0.5 transition-transform"
              >
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{card.label}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">{card.desc}</p>
              </a>
            ))}
          </motion.div>

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Sidebar */}
            <aside className="lg:w-64 shrink-0">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="glass-card rounded-2xl p-4 sticky top-24 space-y-3"
              >
                <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase">
                  Contents
                </h3>
                <input
                  type="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search docs..."
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white/70 dark:bg-gray-900/50 text-sm text-gray-800 dark:text-gray-100"
                />
                <div className="flex gap-2 text-[11px] text-gray-600 dark:text-gray-400">
                  <span>API: https://citricloud.com/api/v1</span>
                  <span>Auth: Bearer JWT</span>
                </div>
                <nav className="space-y-1">
                  {filteredSections.map((section) => {
                    const Icon = section.icon;
                    return (
                      <button
                        key={section.id}
                        onClick={() => setActiveSection(section.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all text-left ${
                          activeSection === section.id
                            ? 'bg-primary-500 text-white shadow-lg'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span>{section.title}</span>
                      </button>
                    );
                  })}
                </nav>
              </motion.div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 min-w-0">
              {activeDoc && (
                <motion.div
                  key={activeSection}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-card p-8 rounded-2xl"
                >
                  <div className="flex items-center gap-3 mb-6">
                    {(() => {
                      const Icon = activeDoc.icon;
                      return <Icon className="w-8 h-8 text-primary-500" />;
                    })()}
                    <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 dark:text-gray-100">
                      {activeDoc.title}
                    </h2>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-6 text-xs">
                    <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-700 dark:text-blue-200 border border-blue-500/20">Base URL: https://citricloud.com</span>
                    <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-700 dark:text-green-200 border border-green-500/20">API Prefix: /api/v1</span>
                    <span className="px-3 py-1 rounded-full bg-purple-500/10 text-purple-700 dark:text-purple-200 border border-purple-500/20">Auth: Bearer JWT</span>
                  </div>

                  <div className="prose prose-gray dark:prose-invert max-w-none">
                    {activeDoc.content.map((paragraph, index) => {
                      // Handle code blocks
                      if (paragraph.startsWith('```')) {
                        const isStart = paragraph === '```bash' || paragraph === '```javascript';
                        const isEnd = paragraph === '```';
                        if (isStart || isEnd) return null;
                        return (
                          <pre key={index} className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 overflow-x-auto my-4">
                            <code className="text-sm font-mono text-gray-800 dark:text-gray-200">
                              {paragraph}
                            </code>
                          </pre>
                        );
                      }
                      
                      // Handle bullet points
                      if (paragraph.startsWith('•')) {
                        return (
                          <li key={index} className="text-gray-700 dark:text-gray-300 ml-4">
                            {paragraph.substring(2)}
                          </li>
                        );
                      }
                      
                      // Handle empty lines
                      if (paragraph === '') {
                        return <div key={index} className="h-4" />;
                      }
                      
                      // Regular paragraphs
                      return (
                        <p key={index} className="text-gray-700 dark:text-gray-300 mb-4">
                          {paragraph}
                        </p>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
