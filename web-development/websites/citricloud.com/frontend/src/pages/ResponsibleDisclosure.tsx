import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useLanguage } from '../context/LanguageContext';

export default function ResponsibleDisclosurePage() {
  const { t } = useLanguage();
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100 dark:from-gray-950 dark:via-slate-950 dark:to-black">
      <Navbar />
      <div className="flex-1 container mx-auto px-4 sm:px-6 pt-24 sm:pt-28 pb-16">
        <div className="max-w-4xl mx-auto glass-card p-8 sm:p-12 rounded-2xl bg-white/90 dark:bg-gray-950/90 border border-white/30 dark:border-gray-700/30">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-6">{t('responsible_disclosure')}</h1>
          <p className="text-gray-700 dark:text-gray-300 mb-4">We appreciate security research and encourage responsible disclosure of vulnerabilities. Please contact us with details and allow a reasonable remediation window before public disclosure.</p>
          <ul className="list-disc ml-6 space-y-2 text-gray-700 dark:text-gray-300">
            <li>Email: security@citricloud.com</li>
            <li>Include steps to reproduce and impacted systems</li>
            <li>We will acknowledge receipt and work on a fix</li>
          </ul>
        </div>
      </div>
      <Footer />
    </div>
  );
}
