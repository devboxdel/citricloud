import Navbar from '../components/Navbar';
import Topbar from '../components/Topbar';
import Footer from '../components/Footer';
import { useLanguage } from '../context/LanguageContext';

export default function WithdrawalPolicyPage() {
  const { t } = useLanguage();
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100 dark:from-gray-950 dark:via-slate-950 dark:to-black">
      <Topbar />
      <Navbar />
      <div className="flex-1 container mx-auto px-4 sm:px-6 pt-40 sm:pt-44 pb-16">
        <div className="max-w-4xl mx-auto glass-card p-8 sm:p-12 rounded-2xl bg-white/90 dark:bg-gray-950/90 border border-white/30 dark:border-gray-700/30">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-6">{t('withdrawal_policy')}</h1>
          <p className="text-gray-700 dark:text-gray-300 mb-4">This policy explains conditions for order cancellations, refunds, and withdrawal timelines. We aim to provide fast resolutions while maintaining service integrity.</p>
          <ul className="list-disc ml-6 space-y-2 text-gray-700 dark:text-gray-300">
            <li>Eligible withdrawals within 14 days unless otherwise noted</li>
            <li>Digital goods may have limited refundability once accessed</li>
            <li>Contact support for case-specific assistance</li>
          </ul>
        </div>
      </div>
      <Footer />
    </div>
  );
}
