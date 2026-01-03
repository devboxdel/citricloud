import ServiceTemplate from './ServiceTemplate';
import { FiHardDrive } from 'react-icons/fi';

export default function BackupRecovery() {
  return (
    <ServiceTemplate
      title="Backup & Recovery"
      subtitle="Reliable data protection and disaster recovery"
      description="Never lose critical data with our comprehensive backup and recovery solutions. We implement automated backup systems and disaster recovery plans to ensure business continuity."
      icon={<FiHardDrive className="w-7 h-7" />}
      bullets={[
        'Automated daily, weekly, and monthly backups',
        'Off-site and cloud backup storage',
        'Point-in-time recovery options',
        'Disaster recovery planning and testing',
        'Recovery Time Objective (RTO) optimization',
        'Data encryption at rest and in transit',
        'Backup monitoring and verification',
        'Quick restore procedures and testing',
      ]}
    />
  );
}
