import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Topbar from '../components/Topbar';
import Footer from '../components/Footer';
import { useLanguage } from '../context/LanguageContext';

export default function DisclaimerPage() {
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
              {t('disclaimer')}
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
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-3">Website Disclaimer</h2>
              <p>
                The information provided by CITRICLOUD on our website is for general informational purposes 
                only. All information on the site is provided in good faith, however we make no representation 
                or warranty of any kind, express or implied, regarding the accuracy, adequacy, validity, 
                reliability, availability, or completeness of any information on the site.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-3">No Professional Advice</h2>
              <p>
                The content on our website does not constitute professional advice. Before taking any action 
                based upon such information, we encourage you to consult with appropriate professionals. 
                We will not be liable for any losses, injuries, or damages from the display or use of this 
                information.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-3">External Links Disclaimer</h2>
              <p>
                Our website may contain links to external websites that are not provided or maintained by 
                or in any way affiliated with CITRICLOUD. Please note that we do not guarantee the accuracy, 
                relevance, timeliness, or completeness of any information on these external websites.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-3">Service Availability</h2>
              <p>
                While we strive to provide uninterrupted service, CITRICLOUD makes no warranties or 
                representations about the accuracy or completeness of our services' content or the content 
                of any sites linked to this service. We will not be liable for:
              </p>
              <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                <li>Any errors or omissions in content</li>
                <li>Any service interruptions or technical issues</li>
                <li>Any losses or damages arising from the use of our service</li>
                <li>Any unauthorized access to or alteration of your data</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-3">Limitation of Liability</h2>
              <p>
                Under no circumstance shall CITRICLOUD have any liability to you for any loss or damage of 
                any kind incurred as a result of the use of the site or reliance on any information provided 
                on the site. Your use of the site and your reliance on any information on the site is solely 
                at your own risk.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-3">Changes and Updates</h2>
              <p>
                We reserve the right to modify this disclaimer at any time. Any changes will be effective 
                immediately upon posting on this page. Your continued use of the website following the 
                posting of changes constitutes your acceptance of such changes.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-3">Testimonials Disclaimer</h2>
              <p>
                Any testimonials or endorsements found on this website are the experiences of the individuals 
                who have used our services. Individual results may vary and are not guaranteed.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-3">Contact Us</h2>
              <p>
                If you have any questions about this Disclaimer, please contact us at{' '}
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
