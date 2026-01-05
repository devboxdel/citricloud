import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Topbar from '../components/Topbar';
import Footer from '../components/Footer';
import { FiGift, FiPercent, FiClock, FiCheck, FiStar, FiZap } from 'react-icons/fi';

const SpecialOffers = () => {
  const featuredDeals = [
    {
      title: 'New Customer Bundle',
      description: 'Get started with everything you need',
      discount: '50% OFF',
      includes: [
        'Premium Web Hosting (1 year)',
        'Free Domain Registration',
        'Free SSL Certificate',
        '24/7 Priority Support'
      ],
      originalPrice: 299.99,
      salePrice: 149.99,
      badge: 'Best Value',
      color: 'primary'
    },
    {
      title: 'Business Accelerator',
      description: 'Scale your business with enterprise tools',
      discount: '40% OFF',
      includes: [
        'Business Hosting (2 years)',
        '5 Premium Email Accounts',
        'Microsoft Office 365',
        'Free Website Migration'
      ],
      originalPrice: 599.99,
      salePrice: 359.99,
      badge: 'Popular',
      color: 'purple'
    },
    {
      title: 'Developer Package',
      description: 'Everything a developer needs',
      discount: '35% OFF',
      includes: [
        'Cloud VPS Hosting',
        'Unlimited Git Repositories',
        'Free Development Tools',
        'API Access & Documentation'
      ],
      originalPrice: 499.99,
      salePrice: 324.99,
      badge: 'Pro Choice',
      color: 'indigo'
    }
  ];

  const limitedTimeOffers = [
    {
      icon: FiGift,
      title: 'First Month Free',
      description: 'All premium hosting plans',
      validUntil: 'Limited time'
    },
    {
      icon: FiPercent,
      title: '60% OFF',
      description: 'Annual domain registrations',
      validUntil: 'This month only'
    },
    {
      icon: FiStar,
      title: 'Free Upgrades',
      description: 'Lifetime storage & bandwidth',
      validUntil: 'New customers'
    },
    {
      icon: FiZap,
      title: 'Extended Trials',
      description: '60-day money-back guarantee',
      validUntil: 'All plans'
    }
  ];

  const categories = [
    {
      name: 'Hosting Deals',
      savings: 'Up to 50% OFF',
      description: 'Premium hosting with free extras',
      color: 'bg-blue-600'
    },
    {
      name: 'Domain Savings',
      savings: 'Starting at $4.99',
      description: 'Register unlimited domains',
      color: 'bg-purple-600'
    },
    {
      name: 'Software Bundles',
      savings: 'Save $200+',
      description: 'Professional software packages',
      color: 'bg-orange-600'
    },
    {
      name: 'Security Packages',
      savings: '3 for 2 Deal',
      description: 'SSL, backups, and monitoring',
      color: 'bg-green-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Topbar />
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-primary-600/10 dark:bg-primary-600/20" />
        <div className="container mx-auto px-4 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="inline-block mb-4">
              <span className="bg-red-500 text-white px-4 py-2 rounded-full text-sm font-bold animate-pulse">
                ⚡ LIMITED TIME OFFERS
              </span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-gray-900 dark:text-white">
              Special Offers & Deals
            </h1>
            <p className="text-xl text-gray-700 dark:text-gray-200 mb-8">
              First-time customers enjoy massive discounts, free add-ons, and extended trial periods on select plans
            </p>
          </motion.div>
        </div>
      </section>

      {/* Limited Time Offers Banner */}
      <section className="py-12 bg-primary-600 text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {limitedTimeOffers.map((offer, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4">
                  <offer.icon className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold mb-2">{offer.title}</h3>
                <p className="text-white/90 mb-1">{offer.description}</p>
                <p className="text-sm text-white/70">{offer.validUntil}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Deals */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Featured Bundle Deals
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Save big with our curated packages
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {featuredDeals.map((deal, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 border-gray-200 dark:border-gray-700"
              >
                <div className="absolute top-0 right-0 bg-primary-600 text-white px-4 py-1 text-sm font-bold rounded-bl-lg">
                  {deal.badge}
                </div>
                <div className="p-8">
                  <div className="mb-6">
                    <div className="inline-block bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold mb-4">
                      {deal.discount}
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      {deal.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {deal.description}
                    </p>
                  </div>
                  
                  <div className="mb-6">
                    <div className="flex items-baseline gap-2 mb-2">
                      <span className="text-4xl font-bold text-primary-600 dark:text-primary-400">
                        ${deal.salePrice}
                      </span>
                      <span className="text-xl text-gray-400 line-through">
                        ${deal.originalPrice}
                      </span>
                    </div>
                    <p className="text-sm text-green-600 dark:text-green-400 font-semibold">
                      Save ${(deal.originalPrice - deal.salePrice).toFixed(2)}
                    </p>
                  </div>

                  <div className="mb-8">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Package Includes:</h4>
                    <ul className="space-y-2">
                      {deal.includes.map((item, i) => (
                        <li key={i} className="flex items-start">
                          <FiCheck className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-600 dark:text-gray-300">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Link
                    to="/catalog"
                    className="block w-full py-3 px-6 rounded-lg font-semibold text-center bg-primary-600 text-white hover:bg-primary-700 transition-colors"
                  >
                    Claim Offer
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Category Deals */}
      <section className="py-20 bg-white dark:bg-gray-800/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Deals by Category
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Find the perfect offer for your needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className="relative overflow-hidden rounded-xl shadow-lg cursor-pointer group"
              >
                <div className={`absolute inset-0 ${category.color} opacity-90 group-hover:opacity-100 transition-opacity`} />
                <div className="relative p-8 text-white">
                  <h3 className="text-2xl font-bold mb-2">{category.name}</h3>
                  <p className="text-3xl font-bold mb-4">{category.savings}</p>
                  <p className="text-white/90">{category.description}</p>
                  <div className="mt-6">
                    <span className="text-sm font-semibold underline">Explore Deals →</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Urgency Section */}
      <section className="py-20 bg-orange-50 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <FiClock className="w-16 h-16 text-red-600 dark:text-red-400 mx-auto mb-6" />
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Don't Miss Out!
            </h2>
            <p className="text-xl text-gray-700 dark:text-gray-200 mb-8">
              These special offers are only available for a limited time. First-time customers get the best deals—sign up today before they expire!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/catalog"
                className="inline-block bg-red-600 text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-red-700 transition-colors shadow-lg"
              >
                View All Offers
              </Link>
              <Link
                to="/contact"
                className="inline-block bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors shadow-lg"
              >
                Get Custom Quote
              </Link>
            </div>
            <p className="mt-6 text-sm text-gray-600 dark:text-gray-400">
              * Offers valid for new customers only. Terms and conditions apply.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default SpecialOffers;
