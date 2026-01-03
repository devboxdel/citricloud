import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { FiServer, FiCheck, FiShield, FiSettings, FiPackage, FiKey } from 'react-icons/fi';

const ControlPanels = () => {
  const controlPanels = [
    {
      name: 'cPanel',
      description: 'Industry-leading web hosting control panel with intuitive interface',
      icon: FiServer,
      logo: '/cpanel.png',
      logoAlt: 'cPanel Logo',
      features: [
        'Easy website management',
        'One-click software installations',
        'Email account management',
        'File manager and FTP access',
        'Database administration',
        'Security and backup tools'
      ],
      popular: true,
      requiresLicense: true,
      licenseUrl: 'https://www.cpanel.net/pricing/'
    },
    {
      name: 'Plesk',
      description: 'Comprehensive hosting platform for managing websites and applications',
      icon: FiSettings,
      logo: '/Plesk_Logo.svg',
      logoAlt: 'Plesk Logo',
      features: [
        'Multi-server management',
        'WordPress toolkit included',
        'Git integration',
        'Docker support',
        'Security advisor',
        'Automated backups'
      ],
      popular: true,
      requiresLicense: true,
      licenseUrl: 'https://www.plesk.com/pricing/'
    },
    {
      name: 'DirectAdmin',
      description: 'Lightweight and fast control panel with powerful features',
      icon: FiPackage,
      logo: '/directadmin.webp',
      logoAlt: 'DirectAdmin Logo',
      features: [
        'Low resource usage',
        'Simple interface',
        'Multi-level user system',
        'Custom branding options',
        'Email management',
        'DNS management'
      ],
      popular: false,
      requiresLicense: true,
      licenseUrl: 'https://www.directadmin.com/pricing.php'
    },
    {
      name: 'CyberPanel',
      description: 'Open-source control panel powered by OpenLiteSpeed',
      icon: FiShield,
      logo: '/cyberpanel.png',
      logoAlt: 'CyberPanel Logo',
      features: [
        'Built-in LiteSpeed web server',
        'Free SSL certificates',
        'One-click WordPress',
        'Email server included',
        'DNS clustering',
        'Modern interface'
      ],
      popular: false,
      requiresLicense: true,
      licenseUrl: 'https://cyberpanel.net/litespeed-enterprise-get-started'
    },
    {
      name: 'Webmin/Virtualmin',
      description: 'Flexible server management with powerful domain hosting capabilities',
      icon: FiServer,
      logo: '/webminvirt.png',
      logoAlt: 'Webmin/Virtualmin Logo',
      features: [
        'Complete server control',
        'Virtual server management',
        'Command-line alternative',
        'Module extensibility',
        'Multi-domain hosting',
        'Advanced configuration'
      ],
      popular: false,
      requiresLicense: true,
      licenseUrl: 'https://www.virtualmin.com/shop/'
    }
  ];

  const benefits = [
    {
      icon: FiSettings,
      title: 'Easy Management',
      description: 'Intuitive interfaces make server management accessible to everyone'
    },
    {
      icon: FiKey,
      title: 'Licensed Software',
      description: 'All control panels include proper licenses for worry-free operation'
    },
    {
      icon: FiShield,
      title: 'Security Built-in',
      description: 'Advanced security features to protect your websites and data'
    },
    {
      icon: FiPackage,
      title: 'Quick Installation',
      description: 'Install your preferred control panel on your hosting environment'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
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
              Control Panels
            </h1>
            <p className="text-xl text-gray-700 dark:text-gray-200 mb-8">
              Professional server management tools with included licenses for seamless website hosting
            </p>
          </motion.div>
        </div>
      </section>

      {/* Benefits Grid */}
      <section className="py-12 bg-white dark:bg-gray-800/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600/10 dark:bg-primary-600/20 rounded-full mb-4">
                  <benefit.icon className="w-8 h-8 text-primary-600 dark:text-primary-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  {benefit.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {benefit.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* License Notice */}
      <section className="py-12 bg-blue-50 dark:bg-blue-900/20 border-y border-blue-200 dark:border-blue-800">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto flex items-start gap-4">
            <div className="flex-shrink-0">
              <FiKey className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Licensed Control Panels
              </h3>
              <p className="text-gray-700 dark:text-gray-200 mb-4">
                All control panels require valid licenses to operate. When you choose to install any of these control panels 
                on your hosting environment, you'll need an active license for full functionality. Each control panel includes 
                proper licensing for worry-free operation and ongoing updates.
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <strong>Note:</strong> Control panels are available for installation on compatible hosting plans. 
                License costs may vary depending on the control panel and your hosting configuration.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Control Panels Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Available Control Panels
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Choose the control panel that fits your needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {controlPanels.map((panel, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 ${
                  panel.popular 
                    ? 'border-primary-600 dark:border-primary-400' 
                    : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                {panel.popular && (
                  <div className="absolute top-0 right-0 bg-primary-600 text-white px-4 py-1 text-sm font-semibold rounded-bl-lg">
                    Popular
                  </div>
                )}
                <div className="p-8">
                  <div className="mb-6">
                    <div className="flex items-center justify-center h-32 mb-6 bg-white dark:bg-gray-700/50 rounded-lg p-6 border border-gray-200 dark:border-gray-600">
                      <img 
                        src={panel.logo} 
                        alt={panel.logoAlt}
                        className="max-h-full max-w-full w-auto object-contain"
                        loading="lazy"
                      />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      {panel.name}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {panel.description}
                    </p>
                  </div>
                  
                  {panel.requiresLicense && (
                    <a 
                      href={panel.licenseUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="block mb-6 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-colors"
                    >
                      <div className="flex items-center gap-2 text-sm text-yellow-800 dark:text-yellow-200">
                        <FiKey className="w-4 h-4 flex-shrink-0" />
                        <span className="font-semibold">License Required - View Pricing</span>
                      </div>
                    </a>
                  )}

                  <div className="mb-8">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Key Features:</h4>
                    <ul className="space-y-2">
                      {panel.features.map((feature, i) => (
                        <li key={i} className="flex items-start">
                          <FiCheck className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-600 dark:text-gray-300">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Link
                    to="/contact"
                    className="block w-full py-3 px-6 rounded-lg font-semibold text-center bg-primary-600 text-white hover:bg-primary-700 transition-colors"
                  >
                    Get Started
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white dark:bg-gray-800/50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-8 text-center">
              How Control Panels Work
            </h2>
            
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                className="flex items-start gap-4"
              >
                <div className="flex-shrink-0 w-10 h-10 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold">
                  1
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    Choose Your Hosting Plan
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Select a compatible hosting plan that supports control panel installation. Our team will help you 
                    choose the right configuration for your needs.
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="flex items-start gap-4"
              >
                <div className="flex-shrink-0 w-10 h-10 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold">
                  2
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    Select Your Control Panel
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Pick from cPanel, Plesk, DirectAdmin, CyberPanel, or Webmin/Virtualmin based on your experience 
                    level and requirements. Each comes with its own strengths and features.
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="flex items-start gap-4"
              >
                <div className="flex-shrink-0 w-10 h-10 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold">
                  3
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    Installation & License Activation
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    We'll install your chosen control panel on your hosting environment and activate the included 
                    license. The license ensures full functionality and regular updates.
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="flex items-start gap-4"
              >
                <div className="flex-shrink-0 w-10 h-10 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold">
                  4
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    Start Managing Your Websites
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Access your control panel dashboard and start managing domains, emails, databases, and files 
                    through an intuitive web interface. No command-line experience required!
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600/10 dark:bg-primary-600/20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Ready to Simplify Your Server Management?
          </h2>
          <p className="text-xl text-gray-700 dark:text-gray-200 mb-8 max-w-2xl mx-auto">
            Contact us to discuss which control panel is right for your hosting needs
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/contact"
              className="inline-block bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
            >
              Contact Sales
            </Link>
            <Link
              to="/hosting-plans"
              className="inline-block bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              View Hosting Plans
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ControlPanels;
