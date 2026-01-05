import { motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import Navbar from '../components/Navbar';
import Topbar from '../components/Topbar';
import Footer from '../components/Footer';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import {
  FiCode,
  FiLock,
  FiDatabase,
  FiShoppingCart,
  FiFileText,
  FiUser,
  FiCopy,
  FiCheck,
  FiSearch,
  FiFilter,
  FiGlobe,
  FiActivity,
  FiAlertCircle
} from 'react-icons/fi';
import { useLanguage } from '../context/LanguageContext';

interface APIEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  description: string;
  auth: boolean;
  params?: string[];
  body?: string[];
}

interface APICategory {
  title: string;
  icon: any;
  endpoints: APIEndpoint[];
}

export default function APIReferencePage() {
  const { t } = useLanguage();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string>('Authentication');
  const [searchTerm, setSearchTerm] = useState('');
  const [authOnly, setAuthOnly] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [selectedEndpointPath, setSelectedEndpointPath] = useState<string>('');

  // Role-based access control
  const requiredRoles = ['system_admin', 'administrator', 'developer'];
  const hasAccess = user && requiredRoles.includes(user.role);

  useEffect(() => {
    if (!hasAccess) {
      navigate('/error/403', { replace: true });
    }
  }, [hasAccess, navigate]);

  const baseUrl = 'https://citricloud.com';

  const apiCategories: APICategory[] = [
    {
      title: 'Authentication',
      icon: FiLock,
      endpoints: [
        {
          method: 'POST',
          path: '/api/v1/auth/register',
          description: 'Register a new user account',
          auth: false,
          body: ['username', 'email', 'password', 'full_name?']
        },
        {
          method: 'POST',
          path: '/api/v1/auth/login',
          description: 'Login and receive access tokens',
          auth: false,
          body: ['username', 'password']
        },
        {
          method: 'POST',
          path: '/api/v1/auth/refresh',
          description: 'Refresh access token',
          auth: true,
          body: ['refresh_token']
        }
      ]
    },
    {
      title: 'User Profile',
      icon: FiUser,
      endpoints: [
        {
          method: 'GET',
          path: '/api/v1/profile/me',
          description: 'Get current user profile',
          auth: true
        },
        {
          method: 'PUT',
          path: '/api/v1/profile/me',
          description: 'Update user profile',
          auth: true,
          body: ['full_name?', 'phone?', 'avatar_url?']
        }
      ]
    },
    {
      title: 'CMS - Blog',
      icon: FiFileText,
      endpoints: [
        {
          method: 'GET',
          path: '/api/v1/cms/categories',
          description: 'Get all categories',
          auth: false,
          params: ['type?']
        },
        {
          method: 'GET',
          path: '/api/v1/cms/posts',
          description: 'Get all blog posts',
          auth: false,
          params: ['category_id?']
        },
        {
          method: 'POST',
          path: '/api/v1/cms/posts',
          description: 'Create a new blog post',
          auth: true,
          body: ['title', 'content', 'category_id', 'featured_image?', 'status']
        },
        {
          method: 'GET',
          path: '/api/v1/cms/posts/{id}',
          description: 'Get a specific blog post',
          auth: false
        },
        {
          method: 'PUT',
          path: '/api/v1/cms/posts/{id}',
          description: 'Update a blog post',
          auth: true,
          body: ['title?', 'content?', 'category_id?', 'featured_image?', 'status?']
        },
        {
          method: 'DELETE',
          path: '/api/v1/cms/posts/{id}',
          description: 'Delete a blog post',
          auth: true
        }
      ]
    },
    {
      title: 'ERP & CRM',
      icon: FiDatabase,
      endpoints: [
        {
          method: 'GET',
          path: '/api/v1/erp/dashboard',
          description: 'Get ERP dashboard data',
          auth: true
        },
        {
          method: 'GET',
          path: '/api/v1/crm/dashboard',
          description: 'Get CRM dashboard data',
          auth: true
        }
      ]
    },
    {
      title: 'E-Commerce',
      icon: FiShoppingCart,
      endpoints: [
        {
          method: 'GET',
          path: '/api/v1/cms/products',
          description: 'Get all products',
          auth: false,
          params: ['category_id?']
        },
        {
          method: 'POST',
          path: '/api/v1/cms/products',
          description: 'Create a new product',
          auth: true,
          body: ['name', 'description', 'price', 'category_id', 'image_url?', 'stock?']
        }
      ]
    }
  ];

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET':
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
      case 'POST':
        return 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20';
      case 'PUT':
        return 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20';
      case 'DELETE':
        return 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20';
      default:
        return 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20';
    }
  };

  const totalEndpoints = apiCategories.reduce((count, cat) => count + cat.endpoints.length, 0);

  const filteredCategories = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return apiCategories
      .map((category) => ({
        ...category,
        endpoints: category.endpoints.filter((endpoint) => {
          const matchesTerm =
            endpoint.path.toLowerCase().includes(term) || endpoint.description.toLowerCase().includes(term);
          const matchesAuth = authOnly ? endpoint.auth : true;
          return matchesTerm && matchesAuth;
        })
      }))
      .filter((category) => category.endpoints.length > 0 || category.title === selectedCategory);
  }, [apiCategories, authOnly, searchTerm, selectedCategory]);

  const selectedCategoryData = filteredCategories.find(cat => cat.title === selectedCategory);

  useEffect(() => {
    if (selectedCategoryData?.endpoints[0]) {
      setSelectedEndpointPath(selectedCategoryData.endpoints[0].path);
    }
  }, [selectedCategory, searchTerm, authOnly, selectedCategoryData]);

  const selectedEndpoint = selectedCategoryData?.endpoints.find((endpoint) => endpoint.path === selectedEndpointPath);

  const handleCopy = (value: string, key: string) => {
    navigator.clipboard.writeText(value);
    setCopiedField(key);
    setTimeout(() => setCopiedField(null), 1400);
  };

  const buildSampleBody = (fields?: string[]) => {
    if (!fields || fields.length === 0) return '{}';
    const body: Record<string, string> = {};
    fields.forEach((field) => {
      const clean = field.replace('?', '');
      body[clean] = `<${clean}>`;
    });
    return JSON.stringify(body, null, 2);
  };

  const buildCurlSnippet = (endpoint?: APIEndpoint) => {
    if (!endpoint) return '';
    const bodyPart = endpoint.body && endpoint.body.length > 0 ? `\\
  -H "Content-Type: application/json" \\
  -d '${buildSampleBody(endpoint.body)}'` : '';
    return `curl -X ${endpoint.method} "${baseUrl}${endpoint.path}" \\
  -H "Authorization: Bearer <token>" ${bodyPart}`.trim();
  };

  const buildFetchSnippet = (endpoint?: APIEndpoint) => {
    if (!endpoint) return '';
    const hasBody = endpoint.body && endpoint.body.length > 0;
    return `fetch('${baseUrl}${endpoint.path}', {
  method: '${endpoint.method}',
  headers: {
    'Authorization': 'Bearer <token>',
    ${hasBody ? "'Content-Type': 'application/json'," : ''}
  },
  ${hasBody ? `body: JSON.stringify(${buildSampleBody(endpoint.body)}),` : ''}
}).then(res => res.json());`;
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100 dark:from-gray-950 dark:via-slate-950 dark:to-black">
      {!hasAccess ? (
        <>
          <Topbar />
          <Navbar />
          <main className="flex-1 flex items-center justify-center px-4">
            <div className="text-center max-w-md">
              <FiAlertCircle className="w-16 h-16 mx-auto text-red-500 mb-4" />
              <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">Access Denied</h1>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                The API Reference is only available to developers and administrators. Your current role does not have access to this resource.
              </p>
              <button
                onClick={() => navigate('/')}
                className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition"
              >
                Back to Home
              </button>
            </div>
          </main>
          <Footer />
        </>
      ) : (
        <>
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
              API Reference
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Complete reference for CITRICLOUD REST API
            </p>
          </motion.div>

          {/* Base URL */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-6 rounded-2xl mb-4 sm:mb-6 lg:mb-8 border border-primary-500/20 bg-primary-500/5"
          >
            <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Base URL</h3>
            <div className="flex items-center gap-3">
              <code className="text-lg font-mono text-gray-800 dark:text-gray-100">
                {baseUrl}
              </code>
              <button
                onClick={() => handleCopy(baseUrl, 'base')}
                className="flex items-center gap-1 text-sm px-3 py-1 rounded-lg border border-primary-500/30 text-primary-600 dark:text-primary-300 hover:bg-primary-500/10"
              >
                {copiedField === 'base' ? <FiCheck className="w-4 h-4" /> : <FiCopy className="w-4 h-4" />}
                {copiedField === 'base' ? 'Copied' : 'Copy'}
              </button>
            </div>
          </motion.div>

          {/* Quick stats & filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="grid gap-4 lg:grid-cols-4 mb-6"
          >
            <div className="glass-card rounded-2xl p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Endpoints</p>
                <p className="text-2xl font-semibold text-gray-800 dark:text-gray-100">{totalEndpoints}</p>
              </div>
              <FiCode className="w-6 h-6 text-primary-500" />
            </div>
            <div className="glass-card rounded-2xl p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Auth</p>
                <p className="text-lg font-medium text-gray-800 dark:text-gray-100">Bearer token</p>
              </div>
              <FiLock className="w-6 h-6 text-amber-500" />
            </div>
            <div className="glass-card rounded-2xl p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Version</p>
                <p className="text-lg font-medium text-gray-800 dark:text-gray-100">v1</p>
              </div>
              <FiGlobe className="w-6 h-6 text-emerald-500" />
            </div>
            <div className="glass-card rounded-2xl p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Health</p>
                <p className="text-lg font-medium text-gray-800 dark:text-gray-100">All regions live</p>
              </div>
              <FiActivity className="w-6 h-6 text-sky-500" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card rounded-2xl p-4 mb-6 flex flex-col lg:flex-row gap-4 items-start lg:items-center"
          >
            <div className="flex items-center gap-2 w-full lg:w-auto flex-1">
              <FiSearch className="w-5 h-5 text-gray-500" />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search path or description"
                className="w-full lg:w-96 bg-transparent outline-none text-gray-800 dark:text-gray-100 placeholder:text-gray-400"
              />
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setAuthOnly((prev) => !prev)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition ${
                  authOnly ? 'border-primary-500 bg-primary-500/10 text-primary-600 dark:text-primary-300' : 'border-gray-300/60 text-gray-700 dark:text-gray-300'
                }`}
              >
                <FiFilter className="w-4 h-4" />
                Auth only
              </button>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Showing {selectedCategoryData?.endpoints.length ?? 0} of {totalEndpoints}
              </span>
            </div>
          </motion.div>

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Sidebar */}
            <aside className="lg:w-64 shrink-0">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="glass-card rounded-2xl p-4 sticky top-24"
              >
                <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase mb-3">
                  Categories
                </h3>
                <nav className="space-y-1">
                  {apiCategories.map((category) => {
                    const Icon = category.icon;
                    return (
                      <button
                        key={category.title}
                        onClick={() => setSelectedCategory(category.title)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all text-left ${
                          selectedCategory === category.title
                            ? 'bg-primary-500 text-white shadow-lg'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span>{category.title}</span>
                      </button>
                    );
                  })}
                </nav>
              </motion.div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 min-w-0">
              {selectedEndpoint && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-card p-6 rounded-2xl mb-6"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                    <div>
                      <p className="text-xs uppercase font-semibold text-gray-500 dark:text-gray-400">Selected endpoint</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className={`px-3 py-1 rounded-lg text-sm font-mono font-semibold border ${getMethodColor(selectedEndpoint.method)}`}>
                          {selectedEndpoint.method}
                        </span>
                        <code className="text-base font-mono text-gray-800 dark:text-gray-100 break-all">
                          {selectedEndpoint.path}
                        </code>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleCopy(`${baseUrl}${selectedEndpoint.path}`, 'endpoint')}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300/60 text-gray-700 dark:text-gray-200 hover:bg-gray-100/70 dark:hover:bg-gray-800/60"
                      >
                        {copiedField === 'endpoint' ? <FiCheck className="w-4 h-4" /> : <FiCopy className="w-4 h-4" />}
                        {copiedField === 'endpoint' ? 'Copied' : 'Copy URL'}
                      </button>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="bg-gray-900 text-gray-100 rounded-xl p-4 font-mono text-sm overflow-auto">
                      <div className="flex items-center justify-between mb-2 text-gray-400">
                        <span>cURL</span>
                        <button
                          onClick={() => handleCopy(buildCurlSnippet(selectedEndpoint), 'curl')}
                          className="flex items-center gap-1 text-xs px-2 py-1 rounded border border-gray-700 hover:bg-gray-800"
                        >
                          {copiedField === 'curl' ? <FiCheck className="w-4 h-4" /> : <FiCopy className="w-4 h-4" />}
                          {copiedField === 'curl' ? 'Copied' : 'Copy'}
                        </button>
                      </div>
                      <pre className="whitespace-pre-wrap leading-relaxed">{buildCurlSnippet(selectedEndpoint)}</pre>
                    </div>
                    <div className="bg-gray-900 text-gray-100 rounded-xl p-4 font-mono text-sm overflow-auto">
                      <div className="flex items-center justify-between mb-2 text-gray-400">
                        <span>fetch</span>
                        <button
                          onClick={() => handleCopy(buildFetchSnippet(selectedEndpoint), 'fetch')}
                          className="flex items-center gap-1 text-xs px-2 py-1 rounded border border-gray-700 hover:bg-gray-800"
                        >
                          {copiedField === 'fetch' ? <FiCheck className="w-4 h-4" /> : <FiCopy className="w-4 h-4" />}
                          {copiedField === 'fetch' ? 'Copied' : 'Copy'}
                        </button>
                      </div>
                      <pre className="whitespace-pre-wrap leading-relaxed">{buildFetchSnippet(selectedEndpoint)}</pre>
                    </div>
                  </div>
                </motion.div>
              )}

              {selectedCategoryData && (
                <motion.div
                  key={selectedCategory}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  {selectedCategoryData.endpoints.map((endpoint, index) => (
                    <motion.div
                      key={`${endpoint.method}-${endpoint.path}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="glass-card p-6 rounded-2xl"
                      onClick={() => setSelectedEndpointPath(endpoint.path)}
                    >
                      <div className="flex items-start gap-4 mb-4">
                        <span className={`px-3 py-1 rounded-lg text-sm font-mono font-semibold border ${getMethodColor(endpoint.method)}`}>
                          {endpoint.method}
                        </span>
                        <div className="flex-1">
                          <code className="text-lg font-mono text-gray-800 dark:text-gray-100 break-all">
                            {endpoint.path}
                          </code>
                          <div className="flex flex-wrap items-center gap-3 mt-2">
                            {endpoint.auth && (
                              <span className="inline-flex items-center gap-1 text-xs font-semibold text-yellow-700 dark:text-yellow-300 px-2 py-1 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                                <FiLock className="w-4 h-4" />
                                Auth required
                              </span>
                            )}
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-gray-700 dark:text-gray-200 px-2 py-1 rounded-lg bg-gray-500/10 border border-gray-500/30">
                              v1
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopy(`${baseUrl}${endpoint.path}`, `copy-${endpoint.path}`);
                          }}
                          className="flex items-center gap-1 px-3 py-2 rounded-lg border border-gray-300/60 text-gray-600 dark:text-gray-300 hover:bg-gray-100/70 dark:hover:bg-gray-800/60"
                        >
                          {copiedField === `copy-${endpoint.path}` ? <FiCheck className="w-4 h-4" /> : <FiCopy className="w-4 h-4" />}
                          {copiedField === `copy-${endpoint.path}` ? 'Copied' : 'Copy'}
                        </button>
                      </div>
                      
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        {endpoint.description}
                      </p>

                      {endpoint.params && endpoint.params.length > 0 && (
                        <div className="mb-4">
                          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Query Parameters
                          </h4>
                          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
                            {endpoint.params.map(param => (
                              <code key={param} className="block text-sm font-mono text-gray-700 dark:text-gray-300">
                                {param}
                              </code>
                            ))}
                          </div>
                        </div>
                      )}

                      {endpoint.body && endpoint.body.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Request Body
                          </h4>
                          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
                            {endpoint.body.map(field => (
                              <code key={field} className="block text-sm font-mono text-gray-700 dark:text-gray-300">
                                {field}
                              </code>
                            ))}
                          </div>
                          <div className="mt-3 bg-gray-900 text-gray-100 rounded-lg p-3 font-mono text-xs overflow-auto">
                            <pre className="whitespace-pre-wrap">{buildSampleBody(endpoint.body)}</pre>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </motion.div>
              )}

              {!selectedCategoryData && (
                <div className="glass-card p-6 rounded-2xl text-center text-gray-500 dark:text-gray-400">
                  No endpoints match your filters. Clear search to see everything.
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
        </>
      )}
    </div>
  );
}
