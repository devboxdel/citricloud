import ServiceTemplate from './ServiceTemplate';
import { FiAward } from 'react-icons/fi';

export default function Consulting() {
  return (
    <ServiceTemplate
      title="IT Consulting"
      subtitle="Expert technology guidance for your business"
      description="Leverage our expertise to make informed technology decisions. We provide strategic consulting services to help you choose the right solutions, optimize your infrastructure, and achieve your business goals."
      icon={<FiAward className="w-7 h-7" />}
      bullets={[
        'Technology stack evaluation and recommendations',
        'Architecture review and optimization',
        'Digital transformation strategy',
        'Vendor selection and procurement guidance',
        'Project planning and roadmap development',
        'Code review and quality assessment',
        'Performance optimization consulting',
        'Best practices and team training',
      ]}
    />
  );
}
