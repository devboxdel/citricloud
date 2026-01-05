import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import Navbar from '../components/Navbar';
import Topbar from '../components/Topbar';
import Footer from '../components/Footer';
import { FiGlobe, FiCheck, FiSearch, FiShield, FiZap, FiUsers } from 'react-icons/fi';

const Domains = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const tlds = [
    { extension: '.com', price: 12.99, popular: true },
    { extension: '.net', price: 14.99, popular: true },
    { extension: '.org', price: 13.99, popular: false },
    { extension: '.io', price: 39.99, popular: true },
    { extension: '.ai', price: 79.99, popular: false },
    { extension: '.co', price: 29.99, popular: false },
    { extension: '.dev', price: 14.99, popular: false },
    { extension: '.app', price: 18.99, popular: false },
    { extension: '.tech', price: 49.99, popular: false },
    { extension: '.online', price: 39.99, popular: false },
    { extension: '.store', price: 59.99, popular: false },
    { extension: '.cloud', price: 24.99, popular: false }
  ];

  const features = [
    {
      icon: FiShield,
      title: 'Free WHOIS Privacy',
      description: 'Protect your personal information from public databases'
    },
    {
      icon: FiZap,
      title: 'Instant Activation',
      description: 'Your domain is active within minutes of registration'
    },
    {
      icon: FiUsers,
      title: 'Easy Management',
      description: 'User-friendly control panel for all domain settings'
    },
    {
      icon: FiGlobe,
      title: 'Free DNS Management',
      description: 'Advanced DNS tools and custom nameserver support'
    }
  ];

  const domainServices = [
    {
      name: 'Domain Transfer',
      description: 'Transfer your existing domains to CITRICLOUD with ease',
      features: [
        'Free 1-year extension',
        'No transfer fees',
        'Quick 5-day transfer',
        'Keep all your settings'
      ]
    },
    {
      name: 'Domain Privacy',
      description: 'Keep your contact information private and secure',
      features: [
        'Hide personal details',
        'Prevent spam emails',
        'Reduce identity theft risk',
        'Free with annual plans'
      ]
    },
    {
      name: 'Domain Forwarding',
      description: 'Redirect your domain to any URL instantly',
      features: [
        'Unlimited forwarding',
        'Path forwarding',
        'Masked forwarding',
        'Easy setup'
      ]
    }
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search functionality would be implemented here
    console.log('Searching for:', searchQuery);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Topbar />
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-40 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-primary-600/10 dark:bg-primary-600/20" />
        <div className="container mx-auto px-4 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-gray-900 dark:text-white">
              Domain Names
            </h1>
            <p className="text-xl text-gray-700 dark:text-gray-200 mb-8">
              Protect your brand with 500+ TLD options, free transfer assistance, and domain forwarding
            </p>

            {/* Domain Search */}
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for your perfect domain..."
                  className="w-full px-6 py-4 pr-32 rounded-full text-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-primary-600"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-2 bottom-2 px-6 bg-primary-600 text-white rounded-full font-semibold hover:bg-primary-700 transition-colors flex items-center gap-2"
                >
                  <FiSearch className="w-5 h-5" />
                  Search
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-12 bg-white dark:bg-gray-800/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600/10 dark:bg-primary-600/20 rounded-full mb-4">
                  <feature.icon className="w-8 h-8 text-primary-600 dark:text-primary-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular TLDs */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Popular Domain Extensions
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Choose from 500+ domain extensions
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {tlds.map((tld, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`relative bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all border-2 text-center ${
                  tld.popular 
                    ? 'border-primary-600 dark:border-primary-400' 
                    : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                {tld.popular && (
                  <div className="absolute top-0 right-0 bg-primary-600 text-white px-2 py-1 text-xs font-semibold rounded-bl-lg rounded-tr-lg">
                    Popular
                  </div>
                )}
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {tld.extension}
                </div>
                <div className="text-2xl font-bold text-primary-600 dark:text-primary-400 mb-3">
                  ${tld.price}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  per year
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Domain Services */}
      <section className="py-20 bg-white dark:bg-gray-800/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Domain Services
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Everything you need to manage your domains
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {domainServices.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg hover:shadow-xl transition-all border border-gray-200 dark:border-gray-700"
              >
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                  {service.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  {service.description}
                </p>
                <ul className="space-y-3">
                  {service.features.map((feature, i) => (
                    <li key={i} className="flex items-start">
                      <FiCheck className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600 dark:text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600/10 dark:bg-primary-600/20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Register Your Domain Today
          </h2>
          <p className="text-xl text-gray-700 dark:text-gray-200 mb-8 max-w-2xl mx-auto">
            Get started with your perfect domain name and build your online presence
          </p>
          <Link
            to="/catalog"
            className="inline-block bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
          >
            Browse All Domains
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Domains;
