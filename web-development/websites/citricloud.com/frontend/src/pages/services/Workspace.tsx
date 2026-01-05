import { FiLayout, FiMail, FiFileText, FiGrid, FiHardDrive, FiCalendar, FiUsers, FiCheckSquare, FiClipboard, FiUserPlus, FiList, FiBookOpen, FiTrello, FiBriefcase, FiPenTool, FiSquare, FiCloud, FiClock, FiShield, FiHeadphones, FiCheck, FiChevronDown } from 'react-icons/fi';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { motion } from 'framer-motion';
import { useState } from 'react';

const workspaceApps = [
  {
    id: 'email',
    name: 'Email',
    category: 'Communication',
    icon: FiMail,
    description: 'Professional email with advanced features including conversation threading, powerful search, labels, and spam protection.',
    image: '/email.jpeg',
    features: ['Conversation view', 'Smart compose', 'Advanced search', 'Spam protection', 'Labels & filters', 'Email signatures'],
    color: 'from-blue-500 to-blue-600'
  },
  {
    id: 'words',
    name: 'Words',
    category: 'Content Creation',
    icon: FiFileText,
    description: 'Create and edit professional documents with rich formatting, collaboration tools, and version history.',
    image: '/words.jpeg',
    features: ['Rich text editor', 'Real-time collaboration', 'Version history', 'Templates', 'Export to PDF', 'Comments & suggestions'],
    color: 'from-indigo-500 to-indigo-600'
  },
  {
    id: 'sheets',
    name: 'Sheets',
    category: 'Content Creation',
    icon: FiGrid,
    description: 'Powerful spreadsheet application with formulas, charts, pivot tables, and data analysis tools.',
    image: '/sheets.jpeg',
    features: ['Formulas & functions', 'Charts & graphs', 'Pivot tables', 'Conditional formatting', 'Data validation', 'Import/Export'],
    color: 'from-green-500 to-green-600'
  },
  {
    id: 'drive',
    name: 'Drive',
    category: 'Storage',
    icon: FiHardDrive,
    description: 'Secure cloud storage for all your files with easy sharing, version control, and powerful search.',
    image: '/drive.jpeg',
    features: ['File storage', 'Folder organization', 'Share & permissions', 'Version history', 'Search files', 'Offline access'],
    color: 'from-yellow-500 to-yellow-600'
  },
  {
    id: 'bookings',
    name: 'Bookings',
    category: 'Productivity',
    icon: FiCalendar,
    description: 'Schedule and manage appointments with automatic reminders, calendar integration, and booking pages.',
    image: '/bookings.jpeg',
    features: ['Appointment scheduling', 'Calendar sync', 'Automatic reminders', 'Booking pages', 'Time zone support', 'Multiple calendars'],
    color: 'from-red-500 to-red-600'
  },
  {
    id: 'contacts',
    name: 'Contacts',
    category: 'Communication',
    icon: FiUsers,
    description: 'Organize and manage your contacts with custom fields, groups, and integration with other Workspace apps.',
    image: '/contacts.jpeg',
    features: ['Contact management', 'Custom fields', 'Groups & labels', 'Import/Export', 'Merge duplicates', 'Search & filter'],
    color: 'from-purple-500 to-purple-600'
  },
  {
    id: 'todo',
    name: 'Todo',
    category: 'Productivity',
    icon: FiCheckSquare,
    description: 'Stay organized with task management, subtasks, due dates, priorities, and project tracking.',
    image: '/todo.jpeg',
    features: ['Task lists', 'Subtasks', 'Due dates', 'Priorities', 'Projects', 'Recurring tasks'],
    color: 'from-pink-500 to-pink-600'
  },
  {
    id: 'forms',
    name: 'Forms',
    category: 'Productivity',
    icon: FiClipboard,
    description: 'Create surveys, quizzes, and forms with various question types, logic branching, and response analysis.',
    image: '/forms.jpeg',
    features: ['Multiple question types', 'Logic branching', 'Response collection', 'Analytics', 'Templates', 'File uploads'],
    color: 'from-orange-500 to-orange-600'
  },
  {
    id: 'teams',
    name: 'Teams',
    category: 'Productivity',
    icon: FiUserPlus,
    description: 'Manage teams and collaborate with shared workspaces, channels, and role-based permissions.',
    image: '/teams.jpeg',
    features: ['Team workspaces', 'Channels', 'Role permissions', 'Member management', 'Activity feed', 'Integrations'],
    color: 'from-teal-500 to-teal-600'
  },
  {
    id: 'lists',
    name: 'Lists',
    category: 'Productivity',
    icon: FiList,
    description: 'Track information and organize work with customizable lists, columns, and views.',
    image: '/lists.jpeg',
    features: ['Custom columns', 'Multiple views', 'Filters & sorting', 'Templates', 'Attachments', 'Comments'],
    color: 'from-cyan-500 to-cyan-600'
  },
  {
    id: 'courses',
    name: 'Courses',
    category: 'Productivity',
    icon: FiBookOpen,
    description: 'Learn Workspace apps with guided lessons, video tutorials, and interactive exercises.',
    image: '/courses.jpeg',
    features: ['Video lessons', 'Interactive tutorials', 'Progress tracking', 'Certificates', 'Quizzes', 'Practice projects'],
    color: 'from-lime-500 to-lime-600'
  },
  {
    id: 'planner',
    name: 'Planner',
    category: 'Planning',
    icon: FiTrello,
    description: 'Plan and organize your work with visual boards, timelines, and team collaboration.',
    image: '/planner.jpeg',
    features: ['Visual boards', 'Timeline view', 'Task assignments', 'Progress tracking', 'Team collaboration', 'Templates'],
    color: 'from-violet-500 to-violet-600'
  },
  {
    id: 'projects',
    name: 'Projects',
    category: 'Planning',
    icon: FiBriefcase,
    description: 'Comprehensive project management with milestones, dependencies, Gantt charts, and resource allocation.',
    image: '/projects.jpeg',
    features: ['Project timelines', 'Milestones', 'Dependencies', 'Gantt charts', 'Resource allocation', 'Reports'],
    color: 'from-amber-500 to-amber-600'
  },
  {
    id: 'visio',
    name: 'Visio',
    category: 'Content Creation',
    icon: FiPenTool,
    description: 'Create professional diagrams, flowcharts, and visual representations with drag-and-drop tools.',
    image: '/visio.jpeg',
    features: ['Flowcharts', 'Org charts', 'Network diagrams', 'Templates', 'Shape library', 'Export options'],
    color: 'from-rose-500 to-rose-600'
  },
  {
    id: 'whiteboard',
    name: 'Whiteboard',
    category: 'Content Creation',
    icon: FiSquare,
    description: 'Visual collaboration space for brainstorming, sketching, and real-time teamwork.',
    image: '/whiteboard.jpeg',
    features: ['Drawing tools', 'Sticky notes', 'Real-time collaboration', 'Templates', 'Infinite canvas', 'Export & share'],
    color: 'from-emerald-500 to-emerald-600'
  },
];

const categories = ['All', 'Productivity', 'Communication', 'Planning', 'Content Creation', 'Storage'];

const pricingPlans = [
  {
    name: 'Starter',
    price: '$12',
    period: '/user/mo',
    description: 'Billed annually',
    features: [
      'All 15 Workspace apps',
      '100GB storage per user',
      'Email support',
      'Mobile apps',
      'Basic integrations',
      'Version history (30 days)',
    ],
    cta: 'Get Started',
    popular: false,
  },
  {
    name: 'Professional',
    price: '$20',
    period: '/user/mo',
    description: 'Billed annually',
    features: [
      'Everything in Starter',
      'Unlimited storage',
      'Priority support',
      'Advanced integrations',
      'Version history (90 days)',
      'Admin console',
      'Custom branding',
      'Advanced security',
    ],
    cta: 'Get Started',
    popular: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'Contact for pricing',
    features: [
      'Everything in Professional',
      'Dedicated account manager',
      '24/7 phone support',
      'SLA guarantees',
      'Unlimited version history',
      'SSO & SAML',
      'Data residency options',
      'Custom contracts',
    ],
    cta: 'Contact Sales',
    popular: false,
  },
];

const stats = [
  { value: '15+', label: 'Integrated Apps', description: 'Work seamlessly together' },
  { value: '99.9%', label: 'Uptime SLA', description: 'Always available when you need it' },
  { value: '100GB+', label: 'Storage Per User', description: 'Expandable as you grow' },
  { value: '24/7', label: 'Support Available', description: 'Help when you need it' },
];

const testimonials = [
  {
    quote: "Workspace has completely transformed how our team collaborates. Having all our tools in one place saves us hours every week.",
    author: "Sarah Johnson",
    role: "CTO at TechCorp",
  },
  {
    quote: "The seamless integration between apps is incredible. We went from using 7 different tools to just Workspace.",
    author: "Michael Chen",
    role: "Product Manager at StartupXYZ",
  },
  {
    quote: "Best investment we've made this year. The ROI was immediate and our team productivity increased by 40%.",
    author: "Emily Rodriguez",
    role: "Operations Director at GlobalCo",
  },
];

const faqs = [
  {
    question: "Can I try Workspace before purchasing?",
    answer: "Yes! We offer a 30-day free trial with full access to all features. No credit card required.",
  },
  {
    question: "How does storage work?",
    answer: "Each user gets 100GB of storage on the Starter plan and unlimited storage on Professional and Enterprise plans. Storage is shared across all Workspace apps.",
  },
  {
    question: "Can I migrate my existing data?",
    answer: "Absolutely! We provide free migration assistance and tools to import data from Google Workspace, Microsoft 365, and other platforms.",
  },
  {
    question: "Is my data secure?",
    answer: "Yes. We use enterprise-grade encryption, maintain SOC 2 Type II compliance, and offer data residency options for Enterprise customers.",
  },
  {
    question: "What kind of support do you offer?",
    answer: "All plans include email support. Professional plans get priority support, and Enterprise customers receive 24/7 phone support with a dedicated account manager.",
  },
  {
    question: "Can I cancel anytime?",
    answer: "Yes, you can cancel your subscription at any time. Your data will remain accessible for 30 days after cancellation.",
  },
];

export default function Workspace() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const filteredApps = selectedCategory === 'All' 
    ? workspaceApps 
    : workspaceApps.filter(app => app.category === selectedCategory);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100 dark:from-gray-950 dark:via-slate-950 dark:to-black">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="container mx-auto px-6 pt-40 sm:pt-44 pb-16">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-sm font-semibold mb-6"
            >
              <FiLayout className="w-4 h-4" />
              All-in-One Platform
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-6"
            >
              Workspace
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-gray-700 dark:text-gray-300 mb-8 leading-relaxed"
            >
              A complete suite of productivity and collaboration apps designed to help you work smarter, not harder. 
              From email to project management, everything you need in one integrated platform.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <a
                href="https://my.citricloud.com/workspace"
                className="px-8 py-4 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                Open Workspace
              </a>
              <a
                href="https://contact.citricloud.com"
                className="px-8 py-4 rounded-xl bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-semibold border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all"
              >
                Get Started
              </a>
            </motion.div>
          </div>
        </section>

        {/* Features Overview */}
        <section className="py-16 bg-white/50 dark:bg-gray-900/50">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/40 dark:to-primary-800/40 flex items-center justify-center mx-auto mb-4">
                  <FiLayout className="w-8 h-8 text-primary-600 dark:text-primary-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">All-in-One Platform</h3>
                <p className="text-gray-600 dark:text-gray-400">15+ integrated apps working seamlessly together, eliminating the need for multiple subscriptions.</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-center"
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/40 dark:to-blue-800/40 flex items-center justify-center mx-auto mb-4">
                  <FiCloud className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Cloud-Based</h3>
                <p className="text-gray-600 dark:text-gray-400">Access your work from anywhere, on any device. Auto-save and sync keep your data secure and up-to-date.</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="text-center"
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/40 dark:to-green-800/40 flex items-center justify-center mx-auto mb-4">
                  <FiUsers className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Team Collaboration</h3>
                <p className="text-gray-600 dark:text-gray-400">Real-time collaboration, shared workspaces, and team management features built into every app.</p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Apps Section */}
        <section className="py-16">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">15+ Integrated Apps</h2>
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                Everything you need to run your business, all in one place
              </p>
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap justify-center gap-3 mb-12">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-6 py-2 rounded-full font-medium transition-all ${
                    selectedCategory === category
                      ? 'bg-primary-600 text-white shadow-lg'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Apps Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredApps.map((app, index) => {
                const IconComponent = app.icon;
                return (
                  <motion.div
                    key={app.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-2xl transition-all group"
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${app.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                          <IconComponent className="w-7 h-7 text-white" />
                        </div>
                        <span className="text-xs font-semibold text-primary-600 dark:text-primary-400 px-3 py-1 rounded-full bg-primary-50 dark:bg-primary-900/30">
                          {app.category}
                        </span>
                      </div>
                      
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{app.name}</h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">{app.description}</p>
                      
                      <div className="space-y-2 mb-6">
                        <h4 className="text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Key Features</h4>
                        <div className="grid grid-cols-2 gap-2">
                          {app.features.map((feature, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                              <FiCheck className="w-4 h-4 text-green-500 flex-shrink-0" />
                              <span>{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <a
                        href={`https://services.citricloud.com/workspace/${app.id}`}
                        className="block w-full py-3 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-primary-50 dark:hover:bg-primary-900/30 text-center text-gray-900 dark:text-white font-semibold transition-all group-hover:bg-primary-50 dark:group-hover:bg-primary-900/30"
                      >
                        Open {app.name}
                      </a>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-gradient-to-r from-primary-600 to-primary-700 dark:from-primary-700 dark:to-primary-800">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center text-white"
                >
                  <div className="text-5xl font-bold mb-2">{stat.value}</div>
                  <div className="text-xl font-semibold mb-1">{stat.label}</div>
                  <div className="text-primary-200">{stat.description}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-16">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Simple, Transparent Pricing</h2>
              <p className="text-xl text-gray-600 dark:text-gray-400">
                Choose the plan that fits your team's needs. All plans include access to all 15 apps.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {pricingPlans.map((plan, index) => (
                <motion.div
                  key={plan.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className={`relative rounded-2xl border-2 p-8 ${
                    plan.popular
                      ? 'border-primary-500 shadow-2xl scale-105'
                      : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-primary-500 text-white text-sm font-bold">
                      POPULAR
                    </div>
                  )}

                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{plan.name}</h3>
                  <div className="mb-6">
                    <span className="text-5xl font-bold text-gray-900 dark:text-white">{plan.price}</span>
                    {plan.period && <span className="text-gray-600 dark:text-gray-400">{plan.period}</span>}
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">{plan.description}</div>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <FiCheck className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <a
                    href="https://contact.citricloud.com"
                    className={`block w-full py-3 rounded-xl text-center font-semibold transition-all ${
                      plan.popular
                        ? 'bg-primary-600 hover:bg-primary-700 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white'
                    }`}
                  >
                    {plan.cta}
                  </a>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-16 bg-gray-50 dark:bg-gray-900/50">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Loved by Teams Worldwide</h2>
              <p className="text-xl text-gray-600 dark:text-gray-400">
                See what our customers have to say about Workspace
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 mb-6 italic">"{testimonial.quote}"</p>
                  <div>
                    <div className="font-bold text-gray-900 dark:text-white">{testimonial.author}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{testimonial.role}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16">
          <div className="container mx-auto px-6 max-w-4xl">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Frequently Asked Questions</h2>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <span className="font-semibold text-gray-900 dark:text-white">{faq.question}</span>
                    <FiChevronDown
                      className={`w-5 h-5 text-gray-500 transition-transform ${
                        openFaq === index ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {openFaq === index && (
                    <div className="px-6 pb-4 text-gray-600 dark:text-gray-400">
                      {faq.answer}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-primary-600 to-primary-700 dark:from-primary-700 dark:to-primary-800">
          <div className="container mx-auto px-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
                Ready to Transform Your Workflow?
              </h2>
              <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
                Join thousands of teams already using Workspace to collaborate, create, and get more done.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="https://my.citricloud.com/workspace"
                  className="px-8 py-4 rounded-xl bg-white hover:bg-gray-100 text-primary-600 font-semibold shadow-lg hover:shadow-xl transition-all"
                >
                  Start Using Workspace
                </a>
                <a
                  href="https://contact.citricloud.com"
                  className="px-8 py-4 rounded-xl bg-primary-500 hover:bg-primary-400 text-white font-semibold border-2 border-white/30 shadow-lg hover:shadow-xl transition-all"
                >
                  Contact Sales
                </a>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
