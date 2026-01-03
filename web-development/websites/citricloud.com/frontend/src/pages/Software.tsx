import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { FiCode, FiCheck, FiPackage, FiDownload, FiRefreshCw, FiShield } from 'react-icons/fi';

const Software = () => {
  const categories = [
    {
      name: 'Productivity Suite',
      description: 'Office applications for documents, spreadsheets, and presentations',
      icon: FiPackage,
      products: ['Microsoft Office 365', 'Google Workspace', 'LibreOffice Premium']
    },
    {
      name: 'Design & Creative',
      description: 'Professional tools for graphic design, video editing, and content creation',
      icon: FiCode,
      products: ['Adobe Creative Cloud', 'CorelDRAW', 'Affinity Designer']
    },
    {
      name: 'Development Tools',
      description: 'IDEs, version control, and development environments',
      icon: FiCode,
      products: ['JetBrains Suite', 'Visual Studio', 'GitHub Enterprise']
    },
    {
      name: 'Security Software',
      description: 'Antivirus, firewall, and cybersecurity solutions',
      icon: FiShield,
      products: ['Norton 360', 'McAfee Total Protection', 'Kaspersky Enterprise']
    }
  ];

  const features = [
    {
      icon: FiDownload,
      title: 'Instant Delivery',
      description: 'Download and activate your software immediately after purchase'
    },
    {
      icon: FiRefreshCw,
      title: 'Lifetime Updates',
      description: 'Get all updates and new features included with your license'
    },
    {
      icon: FiShield,
      title: 'Genuine Licenses',
      description: '100% authentic software licenses from official vendors'
    },
    {
      icon: FiPackage,
      title: 'Flexible Licensing',
      description: 'Choose from single-user, multi-device, or enterprise licenses'
    }
  ];

  const popularSoftware = [
    {
      name: 'Microsoft Office 365',
      price: 99.99,
      period: 'year',
      features: [
        'Word, Excel, PowerPoint',
        '1TB OneDrive Storage',
        'Outlook Email',
        'Teams Collaboration',
        '5 Devices'
      ]
    },
    {
      name: 'Adobe Creative Cloud',
      price: 54.99,
      period: 'month',
      features: [
        'Photoshop, Illustrator, InDesign',
        'Premiere Pro, After Effects',
        '100GB Cloud Storage',
        'Adobe Fonts',
        'Portfolio Website'
      ]
    },
    {
      name: 'Windows 11 Pro',
      price: 199.99,
      period: 'lifetime',
      features: [
        'Full Windows 11 Features',
        'BitLocker Encryption',
        'Remote Desktop',
        'Hyper-V Virtualization',
        'Lifetime License'
      ]
    }
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
              Software
            </h1>
            <p className="text-xl text-gray-700 dark:text-gray-200 mb-8">
              Instant digital delivery of premium software with flexible licensing and lifetime updates included
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

      {/* Popular Software */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Popular Software Licenses
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Get instant access to the world's leading software
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
            {popularSoftware.map((software, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-700"
              >
                <div className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    {software.name}
                  </h3>
                  <div className="mb-6">
                    <span className="text-5xl font-bold text-primary-600 dark:text-primary-400">
                      ${software.price}
                    </span>
                    <span className="text-gray-600 dark:text-gray-400">/{software.period}</span>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {software.features.map((feature, i) => (
                      <li key={i} className="flex items-start">
                        <FiCheck className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-600 dark:text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    to="/catalog"
                    className="block w-full py-3 px-6 bg-primary-600 text-white rounded-lg font-semibold text-center hover:bg-primary-700 transition-colors"
                  >
                    Get License
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Software Categories */}
      <section className="py-20 bg-white dark:bg-gray-800/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Software Categories
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Browse by category to find the perfect software for your needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {categories.map((category, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-start">
                  <div className="bg-primary-600/10 dark:bg-primary-600/20 rounded-lg p-3 mr-4">
                    <category.icon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      {category.name}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-3">
                      {category.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {category.products.map((product, i) => (
                        <span
                          key={i}
                          className="inline-block bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full text-sm"
                        >
                          {product}
                        </span>
                      ))}
                    </div>
                  </div>
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
            Can't Find What You Need?
          </h2>
          <p className="text-xl text-gray-700 dark:text-gray-200 mb-8 max-w-2xl mx-auto">
            Browse our full catalog or contact us for enterprise licensing options
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/catalog"
              className="inline-block bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
            >
              Browse Catalog
            </Link>
            <Link
              to="/contact"
              className="inline-block bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Contact Sales
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Software;
