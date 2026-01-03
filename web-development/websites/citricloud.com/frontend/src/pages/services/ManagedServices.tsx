import ServiceTemplate from './ServiceTemplate';
import { FiSettings } from 'react-icons/fi';

export default function ManagedServices() {
  return (
    <ServiceTemplate
      title="Managed Services"
      subtitle="24/7 infrastructure management and support"
      description="Focus on your business while we manage your IT infrastructure. Our managed services ensure your systems run smoothly with proactive monitoring, maintenance, and expert support."
      icon={<FiSettings className="w-7 h-7" />}
      bullets={[
        '24/7/365 monitoring and support',
        'Proactive system maintenance and updates',
        'Server and application management',
        'Performance optimization and tuning',
        'Security patches and vulnerability management',
        'Incident response and troubleshooting',
        'Capacity planning and scaling',
        'Monthly reporting and service review',
      ]}
    />
  );
}
