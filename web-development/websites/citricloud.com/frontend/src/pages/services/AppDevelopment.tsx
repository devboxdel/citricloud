import ServiceTemplate from './ServiceTemplate';
import { FiSmartphone } from 'react-icons/fi';

export default function AppDevelopment() {
  return (
    <ServiceTemplate
      title="App Development"
      subtitle="Native and cross-platform mobile applications"
      description="Build powerful mobile and desktop applications that engage your users. We create intuitive, high-performance apps for iOS, Android, and desktop platforms using modern development frameworks."
      icon={<FiSmartphone className="w-7 h-7" />}
      bullets={[
        'Native iOS (Swift) and Android (Kotlin) development',
        'Cross-platform apps with React Native or Flutter',
        'Desktop applications with Electron',
        'Offline-first architecture and local storage',
        'Push notifications and real-time updates',
        'Payment gateway and subscription integration',
        'App Store and Google Play submission support',
        'Beta testing and continuous deployment',
      ]}
    />
  );
}
