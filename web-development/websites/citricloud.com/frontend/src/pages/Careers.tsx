import { motion } from 'framer-motion';
import Topbar from '../components/Topbar';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { FiBriefcase, FiMapPin, FiClock, FiUsers, FiHeart, FiTrendingUp, FiAward, FiGlobe } from 'react-icons/fi';

export default function Careers() {
  const openPositions = [
    {
      title: 'Senior Full-Stack Developer',
      location: 'Remote',
      type: 'Full-time',
      department: 'Engineering',
      description: 'Join our engineering team to build scalable cloud infrastructure and customer-facing applications.',
    },
    {
      title: 'DevOps Engineer',
      location: 'Remote',
      type: 'Full-time',
      department: 'Infrastructure',
      description: 'Help us maintain and scale our cloud infrastructure with cutting-edge DevOps practices.',
    },
    {
      title: 'Customer Success Manager',
      location: 'Remote',
      type: 'Full-time',
      department: 'Customer Support',
      description: 'Build lasting relationships with our customers and help them succeed with our platform.',
    },
  ];

  const benefits = [
    {
      icon: <FiGlobe className="w-8 h-8" />,
      title: 'Work Remotely',
      description: 'Work from anywhere in the world with flexible hours',
    },
    {
      icon: <FiTrendingUp className="w-8 h-8" />,
      title: 'Career Growth',
      description: 'Continuous learning opportunities and career advancement',
    },
    {
      icon: <FiHeart className="w-8 h-8" />,
      title: 'Health Benefits',
      description: 'Comprehensive health insurance for you and your family',
    },
    {
      icon: <FiAward className="w-8 h-8" />,
      title: 'Competitive Salary',
      description: 'Market-leading compensation and equity packages',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100 dark:from-gray-950 dark:via-slate-950 dark:to-black">
      <Topbar />
      <Navbar />

      <main className="flex-1 pt-10">
        <section className="container mx-auto px-4 sm:px-6 pt-40 sm:pt-44 pb-16 max-w-7xl">
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-bold text-gray-800 dark:text-gray-100 mb-4"
          >
            Work With Us
          </motion.h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl">
            Join our team of innovators building the future of cloud infrastructure
          </p>
        </section>

        {/* Why Join Us */}
        <section className="container mx-auto px-4 sm:px-6 pb-16 max-w-7xl">
          <div className="glass-card p-8 sm:p-12 rounded-2xl bg-white/80 dark:bg-gray-900/80 border border-white/30 dark:border-gray-700/30">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Why CITRICLOUD?</h2>
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-8">
              At CITRICLOUD, we're building more than just a cloud platform – we're creating an ecosystem that empowers businesses worldwide. 
              Our team is passionate about innovation, collaboration, and making a real impact.
            </p>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-primary-500/10 dark:bg-primary-500/20 text-primary-600 dark:text-primary-400 flex items-center justify-center">
                    {benefit.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{benefit.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{benefit.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Open Positions */}
        <section className="container mx-auto px-4 sm:px-6 pb-16 max-w-7xl">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Open Positions</h2>
          
          <div className="space-y-6">
            {openPositions.map((position, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="glass-card p-6 sm:p-8 rounded-2xl bg-white/80 dark:bg-gray-900/80 border border-white/30 dark:border-gray-700/30 hover:border-primary-300 dark:hover:border-primary-600 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{position.title}</h3>
                    <div className="flex flex-wrap gap-3 text-sm text-gray-600 dark:text-gray-400">
                      <span className="inline-flex items-center gap-1">
                        <FiMapPin className="w-4 h-4" />
                        {position.location}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <FiClock className="w-4 h-4" />
                        {position.type}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <FiUsers className="w-4 h-4" />
                        {position.department}
                      </span>
                    </div>
                  </div>
                  <a
                    href="https://contact.citricloud.com"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium transition-all whitespace-nowrap"
                  >
                    <FiBriefcase className="w-4 h-4" />
                    Apply Now
                  </a>
                </div>
                <p className="text-gray-700 dark:text-gray-300">{position.description}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Can't Find a Position */}
        <section className="container mx-auto px-4 sm:px-6 pb-16 max-w-7xl">
          <div className="glass-card p-8 sm:p-12 rounded-2xl bg-primary-500/10 dark:bg-primary-500/20 border border-primary-300/50 dark:border-primary-600/50 text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Don't See a Perfect Fit?</h2>
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
              We're always looking for talented people. Send us your resume and let us know how you'd like to contribute to CITRICLOUD.
            </p>
            <a
              href="https://contact.citricloud.com"
              className="inline-flex items-center gap-2 px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-semibold transition-all text-lg"
            >
              Get in Touch
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
