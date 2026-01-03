import ServiceTemplate from './ServiceTemplate';
import { FiUploadCloud } from 'react-icons/fi';

export default function CloudMigration() {
  return (
    <ServiceTemplate
      title="Cloud Migration"
      subtitle="Seamless transition to cloud infrastructure"
      description="Move your applications and data to the cloud with minimal downtime and risk. We plan, execute, and optimize your cloud migration to ensure a smooth transition and immediate benefits."
      icon={<FiUploadCloud className="w-7 h-7" />}
      bullets={[
        'Comprehensive migration assessment and planning',
        'Application re-architecture for cloud-native benefits',
        'Data migration with validation and integrity checks',
        'Zero-downtime migration strategies',
        'Multi-cloud and hybrid cloud solutions',
        'Cost optimization and right-sizing',
        'Post-migration support and optimization',
        'Training and knowledge transfer',
      ]}
    />
  );
}
