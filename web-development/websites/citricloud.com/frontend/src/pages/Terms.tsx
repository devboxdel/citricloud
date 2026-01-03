import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useLanguage } from '../context/LanguageContext';

export default function TermsPage() {
  const { t } = useLanguage();
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100 dark:from-gray-950 dark:via-slate-950 dark:to-black">
      <Navbar />

      <main className="flex-1">
        <section className="container mx-auto px-4 sm:px-6 pt-28 sm:pt-36 pb-16 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-5xl font-bold text-gray-800 dark:text-gray-100 mb-4">
              {t('terms_conditions')}
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
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-3">1. Agreement to Terms</h2>
              <p>
                By accessing or using CITRICLOUD's services, you agree to be bound by these Terms and Conditions. 
                If you disagree with any part of these terms, you may not access our services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-3">2. Use License</h2>
              <p className="mb-3">
                Permission is granted to temporarily download one copy of the materials on CITRICLOUD's website 
                for personal, non-commercial transitory viewing only.
              </p>
              <p>This is the grant of a license, not a transfer of title, and under this license you may not:</p>
              <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                <li>Modify or copy the materials</li>
                <li>Use the materials for any commercial purpose</li>
                <li>Attempt to decompile or reverse engineer any software</li>
                <li>Remove any copyright or proprietary notations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-3">3. Account Responsibilities</h2>
              <p>
                You are responsible for maintaining the confidentiality of your account and password. 
                You agree to accept responsibility for all activities that occur under your account.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-3">4. Service Modifications</h2>
              <p>
                CITRICLOUD reserves the right to modify or discontinue, temporarily or permanently, 
                the service with or without notice. We shall not be liable to you or any third party 
                for any modification, suspension, or discontinuance of the service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-3">5. Limitation of Liability</h2>
              <p>
                In no event shall CITRICLOUD or its suppliers be liable for any damages arising out of 
                the use or inability to use the materials on our website, even if we have been notified 
                of the possibility of such damage.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-3">6. Governing Law</h2>
              <p>
                These terms and conditions are governed by and construed in accordance with applicable laws, 
                and you irrevocably submit to the exclusive jurisdiction of the courts.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-3">7. Contact Information</h2>
              <p>
                If you have any questions about these Terms and Conditions, please contact us at{' '}
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
