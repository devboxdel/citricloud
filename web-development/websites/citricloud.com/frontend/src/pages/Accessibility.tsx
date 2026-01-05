import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Topbar from '../components/Topbar';
import Footer from '../components/Footer';
import { useLanguage } from '../context/LanguageContext';

export default function AccessibilityPage() {
  const { t } = useLanguage();
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100 dark:from-gray-950 dark:via-slate-950 dark:to-black">
      <Topbar />
      <Navbar />

      <main className="flex-1">
        <section className="container mx-auto px-4 sm:px-6 pt-40 sm:pt-44 pb-16 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-5xl font-bold text-gray-800 dark:text-gray-100 mb-4">
              {t('accessibility')}
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
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-3">Our Commitment</h2>
              <p>
                CITRICLOUD is committed to ensuring digital accessibility for people with disabilities. 
                We are continually improving the user experience for everyone and applying the relevant 
                accessibility standards to ensure we provide equal access to all of our users.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-3">Conformance Status</h2>
              <p>
                We aim to conform to the Web Content Accessibility Guidelines (WCAG) 2.1 level AA standards. 
                These guidelines explain how to make web content more accessible for people with disabilities 
                and user-friendly for everyone.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-3">Accessibility Features</h2>
              <p className="mb-3">Our website includes the following accessibility features:</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Keyboard navigation support</li>
                <li>Screen reader compatibility</li>
                <li>Clear and consistent navigation structure</li>
                <li>Alternative text for images</li>
                <li>Color contrast compliance</li>
                <li>Resizable text without loss of functionality</li>
                <li>Dark mode for reduced eye strain</li>
                <li>Form labels and error messages</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-3">Assistive Technologies</h2>
              <p className="mb-3">Our website is designed to be compatible with:</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Screen readers (JAWS, NVDA, VoiceOver)</li>
                <li>Voice recognition software</li>
                <li>Keyboard-only navigation</li>
                <li>Screen magnification software</li>
                <li>Browser accessibility features</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-3">Known Limitations</h2>
              <p>
                Despite our best efforts to ensure accessibility, some limitations may be present. 
                We are actively working to remediate any issues and welcome feedback on areas where 
                we can improve.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-3">Third-Party Content</h2>
              <p>
                Some content on our website may be provided by third parties. While we encourage our 
                partners to maintain accessibility standards, we cannot guarantee the accessibility of 
                third-party content.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-3">Ongoing Efforts</h2>
              <p className="mb-3">We are committed to continuous improvement through:</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Regular accessibility audits and testing</li>
                <li>Staff training on accessibility best practices</li>
                <li>User feedback integration</li>
                <li>Updated guidelines implementation</li>
                <li>Collaboration with accessibility experts</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-3">Feedback and Contact</h2>
              <p className="mb-3">
                We welcome your feedback on the accessibility of CITRICLOUD. If you encounter any 
                accessibility barriers or have suggestions for improvement, please let us know:
              </p>
              <ul className="list-none ml-4 space-y-2">
                <li>
                  <strong>Email:</strong>{' '}
                  <a href="mailto:accessibility@citricloud.com" className="text-blue-500 hover:underline">
                    accessibility@citricloud.com
                  </a>
                </li>
                <li>
                  <strong>General Support:</strong>{' '}
                  <a href="mailto:support@citricloud.com" className="text-blue-500 hover:underline">
                    support@citricloud.com
                  </a>
                </li>
              </ul>
              <p className="mt-3">
                We aim to respond to accessibility feedback within 5 business days and will work with 
                you to provide the information or service in an accessible format.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-3">Technical Specifications</h2>
              <p>
                Accessibility of CITRICLOUD relies on the following technologies to work with the 
                particular combination of web browser and any assistive technologies installed on 
                your computer: HTML, CSS, JavaScript, and WAI-ARIA.
              </p>
            </section>
          </motion.div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
