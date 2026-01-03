import ServiceTemplate from './ServiceTemplate';
import { FiShield } from 'react-icons/fi';

export default function SecurityServices() {
  return (
    <ServiceTemplate
      title="Security Services"
      subtitle="Comprehensive cybersecurity and compliance solutions"
      description="Protect your business from cyber threats with our security services. From vulnerability assessments to compliance audits, we help you maintain a strong security posture."
      icon={<FiShield className="w-7 h-7" />}
      bullets={[
        'Security audits and vulnerability assessments',
        'Penetration testing and ethical hacking',
        'Web application firewall (WAF) setup',
        'DDoS protection and mitigation',
        'SSL/TLS certificate management',
        'Security information and event management (SIEM)',
        'Compliance consulting (GDPR, HIPAA, SOC 2)',
        'Incident response and forensics',
      ]}
    />
  );
}
