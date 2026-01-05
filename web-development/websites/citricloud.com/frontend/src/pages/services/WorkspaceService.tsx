import { useState } from 'react';
import { motion } from 'framer-motion';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { FiMail, FiFileText, FiGrid as FiExcel, FiCloud, FiUsers, FiCalendar, FiCheckSquare, FiList, FiBook, FiFolder, FiMap, FiEdit3, FiCheck, FiArrowRight } from 'react-icons/fi';
import { Link } from 'react-router-dom';

export default function WorkspaceService() {
  const workspaceApps = [
    {
      name: 'Email',
      icon: FiMail,
      color: 'bg-blue-500',
      screenshot: '/email.jpeg',
      category: 'Communication',
      description: 'Professional email with advanced features including conversation threading, powerful search, labels, and spam protection.',
      features: ['Conversation view', 'Smart compose', 'Advanced search', 'Spam protection', 'Labels & filters', 'Email signatures']
    },
    {
      name: 'Words',
      icon: FiFileText,
      color: 'bg-purple-600',
      screenshot: '/words.jpeg',
      category: 'Content Creation',
      description: 'Create and edit professional documents with rich formatting, collaboration tools, and version history.',
      features: ['Rich text editor', 'Real-time collaboration', 'Version history', 'Templates', 'Export to PDF', 'Comments & suggestions']
    },
    {
      name: 'Sheets',
      icon: FiExcel,
      color: 'bg-green-600',
      screenshot: '/sheets.jpeg',
      category: 'Content Creation',
      description: 'Powerful spreadsheet application with formulas, charts, pivot tables, and data analysis tools.',
      features: ['Formulas & functions', 'Charts & graphs', 'Pivot tables', 'Conditional formatting', 'Data validation', 'Import/Export']
    },
    {
      name: 'Drive',
      icon: FiCloud,
      color: 'bg-cyan-600',
      screenshot: '/drive.jpeg',
      category: 'Storage',
      description: 'Secure cloud storage for all your files with easy sharing, version control, and powerful search.',
      features: ['File storage', 'Folder organization', 'Share & permissions', 'Version history', 'Search files', 'Offline access']
    },
    {
      name: 'Bookings',
      icon: FiCalendar,
      color: 'bg-orange-600',
      screenshot: '/bookings.jpeg',
      category: 'Productivity',
      description: 'Schedule and manage appointments with automatic reminders, calendar integration, and booking pages.',
      features: ['Appointment scheduling', 'Calendar sync', 'Automatic reminders', 'Booking pages', 'Time zone support', 'Multiple calendars']
    },
    {
      name: 'Contacts',
      icon: FiUsers,
      color: 'bg-teal-500',
      screenshot: '/contacts.jpeg',
      category: 'Communication',
      description: 'Organize and manage your contacts with custom fields, groups, and integration with other Workspace apps.',
      features: ['Contact management', 'Custom fields', 'Groups & labels', 'Import/Export', 'Merge duplicates', 'Search & filter']
    },
    {
      name: 'Todo',
      icon: FiCheckSquare,
      color: 'bg-indigo-500',
      screenshot: '/todo.jpeg',
      category: 'Productivity',
      description: 'Stay organized with task management, subtasks, due dates, priorities, and project tracking.',
      features: ['Task lists', 'Subtasks', 'Due dates', 'Priorities', 'Projects', 'Recurring tasks']
    },
    {
      name: 'Forms',
      icon: FiFileText,
      color: 'bg-purple-600',
      screenshot: '/forms.jpeg',
      category: 'Productivity',
      description: 'Create surveys, quizzes, and forms with various question types, logic branching, and response analysis.',
      features: ['Multiple question types', 'Logic branching', 'Response collection', 'Analytics', 'Templates', 'File uploads']
    },
    {
      name: 'Teams',
      icon: FiUsers,
      color: 'bg-teal-700',
      screenshot: '/teams.jpeg',
      category: 'Productivity',
      description: 'Manage teams and collaborate with shared workspaces, channels, and role-based permissions.',
      features: ['Team workspaces', 'Channels', 'Role permissions', 'Member management', 'Activity feed', 'Integrations']
    },
    {
      name: 'Lists',
      icon: FiList,
      color: 'bg-red-500',
      screenshot: '/lists.jpeg',
      category: 'Productivity',
      description: 'Track information and organize work with customizable lists, columns, and views.',
      features: ['Custom columns', 'Multiple views', 'Filters & sorting', 'Templates', 'Attachments', 'Comments']
    },
    {
      name: 'Courses',
      icon: FiBook,
      color: 'bg-amber-500',
      screenshot: '/courses.jpeg',
      category: 'Productivity',
      description: 'Learn Workspace apps with guided lessons, video tutorials, and interactive exercises.',
      features: ['Video lessons', 'Interactive tutorials', 'Progress tracking', 'Certificates', 'Quizzes', 'Practice projects']
    },
    {
      name: 'Planner',
      icon: FiCalendar,
      color: 'bg-pink-500',
      screenshot: '/planner.jpeg',
      category: 'Planning',
      description: 'Plan and organize your work with visual boards, timelines, and team collaboration.',
      features: ['Visual boards', 'Timeline view', 'Task assignments', 'Progress tracking', 'Team collaboration', 'Templates']
    },
    {
      name: 'Projects',
      icon: FiFolder,
      color: 'bg-orange-500',
      screenshot: '/projects.jpeg',
      category: 'Planning',
      description: 'Comprehensive project management with milestones, dependencies, Gantt charts, and resource allocation.',
      features: ['Project timelines', 'Milestones', 'Dependencies', 'Gantt charts', 'Resource allocation', 'Reports']
    },
    {
      name: 'Visio',
      icon: FiMap,
      color: 'bg-violet-500',
      screenshot: '/visio.jpeg',
      category: 'Content Creation',
      description: 'Create professional diagrams, flowcharts, and visual representations with drag-and-drop tools.',
      features: ['Flowcharts', 'Org charts', 'Network diagrams', 'Templates', 'Shape library', 'Export options']
    },
    {
      name: 'Whiteboard',
      icon: FiEdit3,
      color: 'bg-rose-500',
      screenshot: '/whiteboard.jpeg',
      category: 'Content Creation',
      description: 'Visual collaboration space for brainstorming, sketching, and real-time teamwork.',
      features: ['Drawing tools', 'Sticky notes', 'Real-time collaboration', 'Templates', 'Infinite canvas', 'Export & share']
    },
  ];

  const categories = ['All', 'Productivity', 'Communication', 'Planning', 'Content Creation', 'Storage'];
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredApps = selectedCategory === 'All' 
    ? workspaceApps 
    : workspaceApps.filter(app => app.category === selectedCategory);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100 dark:from-gray-950 dark:via-slate-950 dark:to-black">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="container mx-auto px-4 sm:px-6 pt-40 sm:pt-44 pb-12 max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              Workspace
            </h1>
            <p className="text-lg sm:text-xl text-gray-700 dark:text-gray-200 max-w-3xl mx-auto leading-relaxed mb-8">
              A complete suite of productivity and collaboration apps designed to help you work smarter, not harder. From email to project management, everything you need in one integrated platform.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link 
                to="/workspace" 
                className="inline-flex items-center px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl"
              >
                Open Workspace
                <FiArrowRight className="ml-2" />
              </Link>
              <Link 
                to="/contact" 
                className="inline-flex items-center px-8 py-3 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white rounded-xl font-semibold transition-all shadow-lg border border-gray-200 dark:border-gray-700"
              >
                Get Started
              </Link>
            </div>
          </motion.div>
        </section>

        {/* Key Benefits */}
        <section className="container mx-auto px-4 sm:px-6 pb-12 max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass-card p-6 rounded-2xl bg-white/90 dark:bg-gray-900/90 border border-white/30 dark:border-gray-700/30 text-center"
            >
              <div className="w-16 h-16 rounded-full bg-primary-500/10 dark:bg-primary-500/20 text-primary-600 dark:text-primary-400 flex items-center justify-center mx-auto mb-4">
                <FiCheck className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">All-in-One Platform</h3>
              <p className="text-gray-700 dark:text-gray-200">15+ integrated apps working seamlessly together, eliminating the need for multiple subscriptions.</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="glass-card p-6 rounded-2xl bg-white/90 dark:bg-gray-900/90 border border-white/30 dark:border-gray-700/30 text-center"
            >
              <div className="w-16 h-16 rounded-full bg-primary-500/10 dark:bg-primary-500/20 text-primary-600 dark:text-primary-400 flex items-center justify-center mx-auto mb-4">
                <FiCloud className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Cloud-Based</h3>
              <p className="text-gray-700 dark:text-gray-200">Access your work from anywhere, on any device. Auto-save and sync keep your data secure and up-to-date.</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="glass-card p-6 rounded-2xl bg-white/90 dark:bg-gray-900/90 border border-white/30 dark:border-gray-700/30 text-center"
            >
              <div className="w-16 h-16 rounded-full bg-primary-500/10 dark:bg-primary-500/20 text-primary-600 dark:text-primary-400 flex items-center justify-center mx-auto mb-4">
                <FiUsers className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Team Collaboration</h3>
              <p className="text-gray-700 dark:text-gray-200">Real-time collaboration, shared workspaces, and team management features built into every app.</p>
            </motion.div>
          </div>
        </section>

        {/* Category Filter */}
        <section className="container mx-auto px-4 sm:px-6 pb-8 max-w-7xl">
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-2 rounded-xl font-medium transition-all ${
                  selectedCategory === category
                    ? 'bg-primary-600 text-white shadow-lg'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </section>

        {/* Apps Grid with Screenshots */}
        <section className="container mx-auto px-4 sm:px-6 pb-16 max-w-7xl">
          <div className="grid grid-cols-1 gap-12">
            {filteredApps.map((app, index) => (
              <motion.div
                key={app.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`glass-card rounded-2xl overflow-hidden bg-white/90 dark:bg-gray-900/90 border border-white/30 dark:border-gray-700/30 ${
                  index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'
                } flex flex-col lg:flex`}
              >
                {/* Screenshot */}
                <div className="lg:w-1/2 relative overflow-hidden bg-gray-100 dark:bg-gray-800">
                  <img
                    src={app.screenshot}
                    alt={`${app.name} screenshot`}
                    className="w-full h-full object-cover"
                  />
                  <div className={`absolute top-4 ${index % 2 === 0 ? 'left-4' : 'right-4'}`}>
                    <div className={`${app.color} text-white p-3 rounded-xl shadow-lg`}>
                      <app.icon className="w-8 h-8" />
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="lg:w-1/2 p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{app.name}</h3>
                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300">
                      {app.category}
                    </span>
                  </div>
                  
                  <p className="text-lg text-gray-700 dark:text-gray-200 mb-6 leading-relaxed">
                    {app.description}
                  </p>

                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 uppercase tracking-wide">Key Features</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {app.features.map((feature) => (
                        <div key={feature} className="flex items-start gap-2">
                          <FiCheck className="w-5 h-5 text-primary-600 dark:text-primary-400 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-gray-700 dark:text-gray-200">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Link
                    to={`/workspace/${app.name.toLowerCase()}`}
                    className="inline-flex items-center text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-semibold transition-colors"
                  >
                    Open {app.name}
                    <FiArrowRight className="ml-2" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Statistics Section */}
        <section className="container mx-auto px-4 sm:px-6 py-16 max-w-7xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { number: '15+', label: 'Integrated Apps', sublabel: 'Work seamlessly together' },
              { number: '99.9%', label: 'Uptime SLA', sublabel: 'Always available when you need it' },
              { number: '100GB+', label: 'Storage Per User', sublabel: 'Expandable as you grow' },
              { number: '24/7', label: 'Support Available', sublabel: 'Help when you need it' }
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl sm:text-5xl font-bold text-primary-600 dark:text-primary-400 mb-2">{stat.number}</div>
                <div className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{stat.label}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{stat.sublabel}</div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Pricing Section */}
        <section className="bg-gray-50 dark:bg-gray-900/50 py-16">
          <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Simple, Transparent Pricing
              </h2>
              <p className="text-lg text-gray-700 dark:text-gray-200 max-w-2xl mx-auto">
                Choose the plan that fits your team's needs. All plans include access to all 15 apps.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {/* Starter Plan */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="glass-card p-8 rounded-2xl bg-white/90 dark:bg-gray-900/90 border border-white/30 dark:border-gray-700/30"
              >
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Starter</h3>
                  <div className="text-4xl font-bold text-gray-900 dark:text-white mb-1">
                    $12<span className="text-lg font-normal text-gray-600 dark:text-gray-400">/user/mo</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Billed annually</p>
                </div>
                <ul className="space-y-3 mb-8">
                  {['All 15 Workspace apps', '100GB storage per user', 'Email support', 'Mobile apps', 'Basic integrations', 'Version history (30 days)'].map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <FiCheck className="w-5 h-5 text-primary-600 dark:text-primary-400 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 dark:text-gray-200">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  to="/contact"
                  className="block w-full text-center px-6 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-900 dark:text-white rounded-xl font-semibold transition-all"
                >
                  Get Started
                </Link>
              </motion.div>

              {/* Professional Plan */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="glass-card p-8 rounded-2xl bg-gradient-to-br from-primary-500/20 to-purple-500/20 dark:from-primary-400/30 dark:to-purple-400/30 border-2 border-primary-600 dark:border-primary-400 shadow-2xl relative"
              >
                <div className="absolute top-4 right-4">
                  <span className="px-3 py-1 text-xs font-bold bg-primary-600 dark:bg-primary-500 text-white rounded-full shadow-lg">
                    POPULAR
                  </span>
                </div>
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Professional</h3>
                  <div className="text-4xl font-bold text-gray-900 dark:text-white mb-1">
                    $20<span className="text-lg font-normal text-gray-700 dark:text-gray-300">/user/mo</span>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">Billed annually</p>
                </div>
                <ul className="space-y-3 mb-8">
                  {['Everything in Starter', 'Unlimited storage', 'Priority support', 'Advanced integrations', 'Version history (90 days)', 'Admin console', 'Custom branding', 'Advanced security'].map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <FiCheck className="w-5 h-5 text-primary-700 dark:text-primary-300 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-800 dark:text-white font-medium">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  to="/contact"
                  className="block w-full text-center px-6 py-3 bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 text-white rounded-xl font-semibold transition-all shadow-lg"
                >
                  Get Started
                </Link>
              </motion.div>

              {/* Enterprise Plan */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="glass-card p-8 rounded-2xl bg-white/90 dark:bg-gray-900/90 border border-white/30 dark:border-gray-700/30"
              >
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Enterprise</h3>
                  <div className="text-4xl font-bold text-gray-900 dark:text-white mb-1">
                    Custom
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Contact for pricing</p>
                </div>
                <ul className="space-y-3 mb-8">
                  {['Everything in Professional', 'Dedicated account manager', '24/7 phone support', 'SLA guarantees', 'Unlimited version history', 'SSO & SAML', 'Data residency options', 'Custom contracts'].map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <FiCheck className="w-5 h-5 text-primary-600 dark:text-primary-400 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 dark:text-gray-200">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  to="/contact"
                  className="block w-full text-center px-6 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-900 dark:text-white rounded-xl font-semibold transition-all"
                >
                  Contact Sales
                </Link>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="container mx-auto px-4 sm:px-6 py-16 max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Loved by Teams Worldwide
            </h2>
            <p className="text-lg text-gray-700 dark:text-gray-200 max-w-2xl mx-auto">
              See what our customers have to say about Workspace
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                quote: "Workspace has completely transformed how our team collaborates. Having all our tools in one place saves us hours every week.",
                author: "Sarah Johnson",
                role: "CTO at TechCorp",
                rating: 5
              },
              {
                quote: "The seamless integration between apps is incredible. We went from using 7 different tools to just Workspace.",
                author: "Michael Chen",
                role: "Product Manager at StartupXYZ",
                rating: 5
              },
              {
                quote: "Best investment we've made this year. The ROI was immediate and our team productivity increased by 40%.",
                author: "Emily Rodriguez",
                role: "Operations Director at GlobalCo",
                rating: 5
              }
            ].map((testimonial, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-6 rounded-2xl bg-white/90 dark:bg-gray-900/90 border border-white/30 dark:border-gray-700/30"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-700 dark:text-gray-200 mb-4 leading-relaxed">"{testimonial.quote}"</p>
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white">{testimonial.author}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{testimonial.role}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Comparison Section */}
        <section className="bg-gray-50 dark:bg-gray-900/50 py-16">
          <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Why Choose Workspace?
              </h2>
              <p className="text-lg text-gray-700 dark:text-gray-200 max-w-2xl mx-auto">
                See how Workspace compares to managing multiple separate tools
              </p>
            </motion.div>

            <div className="max-w-4xl mx-auto">
              <div className="glass-card rounded-2xl overflow-hidden bg-white/90 dark:bg-gray-900/90 border border-white/30 dark:border-gray-700/30">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-800/50">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Feature</th>
                        <th className="px-6 py-4 text-center text-sm font-semibold text-primary-600 dark:text-primary-400">Workspace</th>
                        <th className="px-6 py-4 text-center text-sm font-semibold text-gray-600 dark:text-gray-400">Multiple Tools</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {[
                        { feature: 'Integrated Apps', workspace: true, others: false },
                        { feature: 'Single Sign-On', workspace: true, others: false },
                        { feature: 'Unified Search', workspace: true, others: false },
                        { feature: 'Real-time Collaboration', workspace: true, others: 'Limited' },
                        { feature: 'Cost per User/Month', workspace: '$12-20', others: '$40+' },
                        { feature: 'Setup Time', workspace: 'Minutes', others: 'Hours/Days' },
                        { feature: 'Data Sync', workspace: 'Automatic', others: 'Manual' },
                        { feature: 'Support', workspace: '24/7', others: 'Varies' }
                      ].map((row, i) => (
                        <tr key={i}>
                          <td className="px-6 py-4 text-sm text-gray-900 dark:text-white font-medium">{row.feature}</td>
                          <td className="px-6 py-4 text-center">
                            {row.workspace === true ? (
                              <FiCheck className="w-6 h-6 text-green-500 mx-auto" />
                            ) : row.workspace === false ? (
                              <span className="text-gray-400">—</span>
                            ) : (
                              <span className="text-sm font-semibold text-primary-600 dark:text-primary-400">{row.workspace}</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-center">
                            {row.others === true ? (
                              <FiCheck className="w-6 h-6 text-green-500 mx-auto" />
                            ) : row.others === false ? (
                              <span className="text-2xl text-red-500">✕</span>
                            ) : (
                              <span className="text-sm text-gray-600 dark:text-gray-400">{row.others}</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="container mx-auto px-4 sm:px-6 py-16 max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Frequently Asked Questions
            </h2>
          </motion.div>

          <div className="max-w-3xl mx-auto space-y-4">
            {[
              {
                q: 'Can I try Workspace before purchasing?',
                a: 'Yes! We offer a 30-day free trial with full access to all features. No credit card required.'
              },
              {
                q: 'How does storage work?',
                a: 'Each user gets 100GB of storage on the Starter plan and unlimited storage on Professional and Enterprise plans. Storage is shared across all Workspace apps.'
              },
              {
                q: 'Can I migrate my existing data?',
                a: 'Absolutely! We provide free migration assistance and tools to import data from Google Workspace, Microsoft 365, and other platforms.'
              },
              {
                q: 'Is my data secure?',
                a: 'Yes. We use enterprise-grade encryption, maintain SOC 2 Type II compliance, and offer data residency options for Enterprise customers.'
              },
              {
                q: 'What kind of support do you offer?',
                a: 'All plans include email support. Professional plans get priority support, and Enterprise customers receive 24/7 phone support with a dedicated account manager.'
              },
              {
                q: 'Can I cancel anytime?',
                a: 'Yes, you can cancel your subscription at any time. Your data will remain accessible for 30 days after cancellation.'
              }
            ].map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="glass-card p-6 rounded-xl bg-white/90 dark:bg-gray-900/90 border border-white/30 dark:border-gray-700/30"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{faq.q}</h3>
                <p className="text-gray-700 dark:text-gray-200">{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-to-br from-primary-600 to-purple-600 dark:from-primary-700 dark:to-purple-700 py-16">
          <div className="container mx-auto px-4 sm:px-6 max-w-4xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Ready to Transform Your Workflow?
              </h2>
              <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
                Join thousands of teams already using Workspace to collaborate, create, and get more done.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link
                  to="/workspace"
                  className="inline-flex items-center px-8 py-4 bg-white text-primary-600 rounded-xl font-semibold hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl"
                >
                  Start Using Workspace
                  <FiArrowRight className="ml-2" />
                </Link>
                <Link
                  to="/contact"
                  className="inline-flex items-center px-8 py-4 bg-white/10 backdrop-blur text-white rounded-xl font-semibold hover:bg-white/20 transition-all border border-white/30"
                >
                  Contact Sales
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
