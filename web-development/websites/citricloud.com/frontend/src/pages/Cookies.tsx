import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Topbar from '../components/Topbar';
import Footer from '../components/Footer';
import { useLanguage } from '../context/LanguageContext';

export default function CookiesPage() {
  const { t } = useLanguage();
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100 dark:from-gray-950 dark:via-slate-950 dark:to-black">
      <Topbar />
      <Navbar />

      <main className="flex-1">
        <section className="container mx-auto px-4 sm:px-6 pt-28 sm:pt-36 pb-16 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-5xl font-bold text-gray-800 dark:text-gray-100 mb-4">
              {t('cookie_policy')}
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Last updated: November 29, 2025
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-8 rounded-2xl space-y-6 text-gray-700 dark:text-gray-300"
          >
            <section>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-3">What Are Cookies</h2>
              <p>
                Cookies are small text files that are placed on your computer or mobile device when you 
                visit a website. Cookies are widely used to make websites work more efficiently and 
                provide information to the owners of the site.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-3">How We Use Cookies</h2>
              <p className="mb-3">CITRICLOUD uses cookies for the following purposes:</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li><strong>Essential cookies:</strong> Required for the operation of our website</li>
                <li><strong>Authentication cookies:</strong> To identify you when you sign in</li>
                <li><strong>Preference cookies:</strong> To remember your settings and preferences</li>
                <li><strong>Analytics cookies:</strong> To understand how visitors use our site</li>
                <li><strong>Security cookies:</strong> To protect your account and data</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-3">Types of Cookies We Use</h2>
              
              <div className="space-y-4 mt-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">Session Cookies</h3>
                  <p>
                    Temporary cookies that expire when you close your browser. They help us track your 
                    session and maintain your logged-in state.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">Persistent Cookies</h3>
                  <p>
                    Remain on your device for a set period or until you delete them. They help us 
                    remember your preferences and settings.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">First-Party Cookies</h3>
                  <p>
                    Set directly by CITRICLOUD to improve your experience on our website.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">Third-Party Cookies</h3>
                  <p>
                    Set by external services we use for analytics and functionality purposes.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-3">Managing Cookies</h2>
              <p className="mb-3">
                You can control and/or delete cookies as you wish. You can delete all cookies that are 
                already on your computer and you can set most browsers to prevent them from being placed.
              </p>
              <p>
                However, if you do this, you may have to manually adjust some preferences every time you 
                visit our site and some services and functionalities may not work.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-3">Browser Controls</h2>
              <p className="mb-3">Most browsers allow you to:</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>See what cookies you have and delete them individually</li>
                <li>Block third-party cookies</li>
                <li>Block cookies from specific sites</li>
                <li>Block all cookies</li>
                <li>Delete all cookies when you close your browser</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-3">Updates to This Policy</h2>
              <p>
                We may update this Cookie Policy from time to time to reflect changes in our practices 
                or for other operational, legal, or regulatory reasons.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-3">Contact Us</h2>
              <p>
                If you have questions about our use of cookies, please contact us at{' '}
                <a href="mailto:support@citricloud.com" className="text-blue-500 hover:underline">
                  support@citricloud.com
                </a>
              </p>
            </section>
          </motion.div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
