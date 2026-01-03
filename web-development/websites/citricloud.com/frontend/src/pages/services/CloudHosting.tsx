import ServiceTemplate from './ServiceTemplate';
import { FiCloud } from 'react-icons/fi';

export default function CloudHosting() {
  return (
    <ServiceTemplate
      title="Cloud Hosting"
      subtitle="Enterprise-grade cloud infrastructure for your applications"
      description="Deploy your applications on our high-performance cloud infrastructure with guaranteed uptime, automatic scaling, and global CDN integration. Built for speed, reliability, and growth."
      icon={<FiCloud className="w-7 h-7" />}
      bullets={[
        '99.9% uptime SLA with redundant infrastructure',
        'Auto-scaling resources based on demand',
        'Global CDN for lightning-fast content delivery',
        'SSD storage with daily automated backups',
        'DDoS protection and web application firewall',
        'Free SSL certificates and domain management',
        'One-click deployment for popular frameworks',
        '24/7 technical support and monitoring',
      ]}
    />
  );
}
