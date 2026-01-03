import ServiceTemplate from './ServiceTemplate';
import { FiCode } from 'react-icons/fi';

export default function WebDevelopment() {
  return (
    <ServiceTemplate
      title="Web Development"
      subtitle="Custom websites and web applications built for your business"
      description="From corporate websites to complex web applications, we build modern, responsive, and scalable solutions using the latest technologies. Every project is tailored to your specific needs and goals."
      icon={<FiCode className="w-7 h-7" />}
      bullets={[
        'Custom responsive design for all devices',
        'Modern frameworks: React, Vue, Next.js',
        'Progressive Web App (PWA) development',
        'SEO optimization and performance tuning',
        'Content Management System integration',
        'API development and third-party integrations',
        'Accessibility compliance (WCAG standards)',
        'Ongoing maintenance and support packages',
      ]}
    />
  );
}
