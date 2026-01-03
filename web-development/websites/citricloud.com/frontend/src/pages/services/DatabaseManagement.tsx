import ServiceTemplate from './ServiceTemplate';
import { FiDatabase } from 'react-icons/fi';

export default function DatabaseManagement() {
  return (
    <ServiceTemplate
      title="Database Management"
      subtitle="Reliable database design, optimization, and administration"
      description="Ensure your data is secure, accessible, and performant. We design, implement, and maintain databases that scale with your business while maintaining data integrity and compliance."
      icon={<FiDatabase className="w-7 h-7" />}
      bullets={[
        'Database architecture design and modeling',
        'SQL and NoSQL database solutions (PostgreSQL, MongoDB, MySQL)',
        'Query optimization and performance tuning',
        'Data migration and ETL processes',
        'Automated backup and disaster recovery',
        'Database security and access control',
        'Replication and high availability setup',
        '24/7 monitoring and maintenance',
      ]}
    />
  );
}
