import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Topbar from '../components/Topbar';
import Footer from '../components/Footer';
import { FiServer, FiCheck, FiCpu, FiHardDrive, FiZap, FiShield, FiClock, FiGlobe } from 'react-icons/fi';

const HostingPlans = () => {
  const plans = [
    {
      name: 'Starter',
      price: 9.99,
      features: [
        '10 GB SSD Storage',
        '100 GB Bandwidth',
        '1 Website',
        'Free SSL Certificate',
        'Daily Backups',
        '99.9% Uptime Guarantee',
        'Email Support'
      ],
      recommended: false
    },
    {
      name: 'Professional',
      price: 19.99,
      features: [
        '50 GB SSD Storage',
        'Unlimited Bandwidth',
        '5 Websites',
        'Free SSL Certificate',
        'Daily Backups',
        '99.9% Uptime Guarantee',
        'Priority Support',
        'Free Domain (1 Year)'
      ],
      recommended: true
    },
    {
      name: 'Business',
      price: 39.99,
      features: [
        '200 GB SSD Storage',
        'Unlimited Bandwidth',
        'Unlimited Websites',
        'Free SSL Certificate',
        'Hourly Backups',
        '99.99% Uptime Guarantee',
        '24/7 Phone Support',
        'Free Domain (1 Year)',
        'Dedicated IP',
        'Advanced Security'
      ],
      recommended: false
    }
  ];

  const features = [
    {
      icon: FiZap,
      title: 'Lightning Fast',
      description: 'SSD storage and optimized servers for maximum speed'
    },
    {
      icon: FiShield,
      title: 'Secure & Protected',
      description: 'Free SSL certificates and DDoS protection included'
    },
    {
      icon: FiClock,
      title: '99.9% Uptime',
      description: 'Reliable hosting with guaranteed uptime SLA'
    },
    {
      icon: FiGlobe,
      title: 'Global CDN',
      description: 'Content delivery network for faster global access'
    }
  ];

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
              Hosting Plans
            </h1>
            <p className="text-xl text-gray-700 dark:text-gray-200 mb-8">
              Scalable cloud infrastructure with unlimited bandwidth, automatic backups, and one-click deployments
            </p>
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

      {/* Pricing Plans */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Choose Your Perfect Plan
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              All plans include free SSL, daily backups, and 24/7 support
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 ${
                  plan.recommended 
                    ? 'border-primary-600 dark:border-primary-400' 
                    : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                {plan.recommended && (
                  <div className="absolute top-0 right-0 bg-primary-600 text-white px-4 py-1 text-sm font-semibold rounded-bl-lg">
                    Recommended
                  </div>
                )}
                <div className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    {plan.name}
                  </h3>
                  <div className="mb-6">
                    <span className="text-5xl font-bold text-primary-600 dark:text-primary-400">
                      ${plan.price}
                    </span>
                    <span className="text-gray-600 dark:text-gray-400">/month</span>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start">
                        <FiCheck className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-600 dark:text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    to="/catalog"
                    className={`block w-full py-3 px-6 rounded-lg font-semibold text-center transition-colors ${
                      plan.recommended
                        ? 'bg-primary-600 text-white hover:bg-primary-700'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    Get Started
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600/10 dark:bg-primary-600/20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Need a Custom Solution?
          </h2>
          <p className="text-xl text-gray-700 dark:text-gray-200 mb-8 max-w-2xl mx-auto">
            Contact our sales team for enterprise plans with custom resources and dedicated support
          </p>
          <Link
            to="/contact"
            className="inline-block bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
          >
            Contact Sales
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HostingPlans;
