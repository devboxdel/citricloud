import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { FiShield, FiCheck, FiLock, FiAward, FiTrendingUp } from 'react-icons/fi';

const SSL = () => {
  const sslProducts = [
    {
      name: 'Domain Validation',
      price: 49.99,
      period: 'year',
      level: 'Basic',
      features: [
        'Domain validation only',
        'Issued in minutes',
        'Up to 256-bit encryption',
        '$10,000 warranty',
        'Secure site seal',
        'Unlimited servers'
      ]
    },
    {
      name: 'Organization Validation',
      price: 199.99,
      period: 'year',
      level: 'Business',
      recommended: true,
      features: [
        'Organization validation',
        'Issued in 1-3 days',
        'Up to 256-bit encryption',
        '$250,000 warranty',
        'Dynamic site seal',
        'Unlimited servers',
        'Company name display'
      ]
    },
    {
      name: 'Extended Validation',
      price: 399.99,
      period: 'year',
      level: 'Enterprise',
      features: [
        'Extended validation',
        'Issued in 3-7 days',
        'Up to 256-bit encryption',
        '$1,000,000 warranty',
        'Green address bar',
        'Dynamic site seal',
        'Unlimited servers',
        'Maximum trust display'
      ]
    }
  ];

  const features = [
    {
      icon: FiLock,
      title: '256-bit Encryption',
      description: 'Industry-standard encryption protects all data transfers'
    },
    {
      icon: FiAward,
      title: 'Trust Seals',
      description: 'Display trust seals to increase customer confidence'
    },
    {
      icon: FiTrendingUp,
      title: 'SEO Benefits',
      description: 'Improve search rankings with HTTPS protocol'
    },
    {
      icon: FiShield,
      title: 'Warranty Protection',
      description: 'Coverage up to $1M depending on certificate type'
    }
  ];

  const benefits = [
    'Encrypt sensitive data like passwords and credit cards',
    'Authenticate your website identity',
    'Improve search engine rankings',
    'Meet PCI compliance requirements',
    'Increase customer trust and conversions',
    'Protect against phishing attacks'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
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
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-gray-900 dark:text-white">
              SSL Certificates
            </h1>
            <p className="text-xl text-gray-700 dark:text-gray-200 mb-8">
              Boost SEO rankings and customer trust with validated SSL certificates and green padlock security
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

      {/* SSL Products */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Choose Your SSL Certificate
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              From basic encryption to extended validation
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {sslProducts.map((product, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 ${
                  product.recommended 
                    ? 'border-primary-600 dark:border-primary-400' 
                    : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                {product.recommended && (
                  <div className="absolute top-0 right-0 bg-primary-600 text-white px-4 py-1 text-sm font-semibold rounded-bl-lg">
                    Recommended
                  </div>
                )}
                <div className="p-8">
                  <div className="mb-4">
                    <div className="text-sm font-semibold text-primary-600 dark:text-primary-400 uppercase">
                      {product.level}
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                      {product.name}
                    </h3>
                  </div>
                  <div className="mb-6">
                    <span className="text-5xl font-bold text-primary-600 dark:text-primary-400">
                      ${product.price}
                    </span>
                    <span className="text-gray-600 dark:text-gray-400">/{product.period}</span>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {product.features.map((feature, i) => (
                      <li key={i} className="flex items-start">
                        <FiCheck className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-600 dark:text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    to="/catalog"
                    className={`block w-full py-3 px-6 rounded-lg font-semibold text-center transition-colors ${
                      product.recommended
                        ? 'bg-primary-600 text-white hover:bg-primary-700'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    Get Certificate
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why SSL Section */}
      <section className="py-20 bg-white dark:bg-gray-800/50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-8 text-center">
              Why You Need SSL
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start"
                >
                  <FiCheck className="w-6 h-6 text-green-500 mr-3 mt-1 flex-shrink-0" />
                  <span className="text-lg text-gray-700 dark:text-gray-200">{benefit}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600/10 dark:bg-primary-600/20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Ready to Secure Your Website?
          </h2>
          <p className="text-xl text-gray-700 dark:text-gray-200 mb-8 max-w-2xl mx-auto">
            Get your SSL certificate installed and activated today
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/catalog"
              className="inline-block bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
            >
              Browse SSL Options
            </Link>
            <Link
              to="/contact"
              className="inline-block bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Get Help
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default SSL;
