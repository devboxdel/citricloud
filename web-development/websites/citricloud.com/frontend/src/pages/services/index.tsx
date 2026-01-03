import { FiCloud, FiDatabase, FiGlobe, FiServer, FiShield, FiCode } from 'react-icons/fi';
import ServiceTemplate from './ServiceTemplate';

export const CloudHosting = () => (
  <ServiceTemplate
    title="Cloud Hosting"
    subtitle="Reliable, scalable hosting for modern applications"
    description="Deploy your apps on our secure, globally distributed infrastructure with automatic scaling, high availability, and managed operations."
    bullets={[
      'Auto-scaling and load balancing',
      '99.99% uptime SLA',
      'Managed Kubernetes and Docker',
      'Global CDN integration',
    ]}
    icon={<FiCloud className="w-7 h-7" />}
  />
);

export const CloudStorage = () => (
  <ServiceTemplate
    title="Cloud Storage"
    subtitle="Durable, performant storage for files and data"
    description="Store and serve assets, backups, and large datasets with encryption, lifecycle policies, and edge delivery."
    bullets={[
      'S3-compatible object storage',
      'Encryption at rest and in transit',
      'Lifecycle management and tiering',
      'Edge caching for low latency',
    ]}
    icon={<FiCloud className="w-7 h-7" />}
  />
);

export const CloudBackup = () => (
  <ServiceTemplate
    title="Cloud Backup"
    subtitle="Automated, verifiable backups with fast restore"
    description="Protect your data with scheduled backups, retention policies, and disaster recovery runbooks."
    bullets={[
      'Policy-based scheduling and retention',
      'Point-in-time restore',
      'Cross-region replication',
      'DR testing and runbooks',
    ]}
    icon={<FiCloud className="w-7 h-7" />}
  />
);

export const WebDevelopment = () => (
  <ServiceTemplate
    title="Web Development"
    subtitle="High-performance websites and web apps"
    description="We build fast, accessible, SEO-friendly web experiences using React, TypeScript, and modern tooling."
    bullets={[
      'Design systems and component libraries',
      'SSR/SSG with modern frameworks',
      'Performance and Core Web Vitals optimization',
      'CI/CD and preview environments',
    ]}
    icon={<FiCode className="w-7 h-7" />}
  />
);

export const MobileApps = () => (
  <ServiceTemplate
    title="Mobile Apps"
    subtitle="Native and cross-platform mobile products"
    description="From MVPs to enterprise apps, we deliver robust mobile solutions with delightful UX."
    bullets={[
      'iOS and Android development',
      'Cross-platform with React Native',
      'Offline-first and sync strategies',
      'App Store/Play Store publishing',
    ]}
    icon={<FiCode className="w-7 h-7" />}
  />
);

export const CustomSoftware = () => (
  <ServiceTemplate
    title="Custom Software"
    subtitle="Tailored systems solving unique challenges"
    description="We design and implement bespoke software aligned to your workflows, integrations, and security needs."
    bullets={[
      'Discovery, architecture, and UX research',
      'API-first and integration readiness',
      'Security and compliance baked in',
      'Maintainability and documentation',
    ]}
    icon={<FiCode className="w-7 h-7" />}
  />
);

export const DedicatedServers = () => (
  <ServiceTemplate
    title="Dedicated Servers"
    subtitle="Single-tenant performance and isolation"
    description="Provision bare-metal servers for workloads requiring maximum performance, isolation, and control."
    bullets={[
      'Custom hardware profiles',
      'Root access and virtualization',
      'Proactive monitoring and support',
      'Redundant power and networking',
    ]}
    icon={<FiServer className="w-7 h-7" />}
  />
);

export const VPSHosting = () => (
  <ServiceTemplate
    title="VPS Hosting"
    subtitle="Flexible virtual private servers"
    description="Spin up secure VMs with dedicated resources, snapshots, and scaling as you grow."
    bullets={[
      'SSD-backed instances',
      'Snapshots and backups',
      'Private networking',
      'One-click images',
    ]}
    icon={<FiServer className="w-7 h-7" />}
  />
);

export const Colocation = () => (
  <ServiceTemplate
    title="Colocation"
    subtitle="Place your hardware in our facilities"
    description="Host your equipment in our Tier III+ data centers with redundant power, cooling, and connectivity."
    bullets={[
      'Secure cages and racks',
      'Remote hands and on-site support',
      'Carrier-neutral connectivity',
      '24/7 monitoring',
    ]}
    icon={<FiServer className="w-7 h-7" />}
  />
);

export const SSLCertificates = () => (
  <ServiceTemplate
    title="SSL Certificates"
    subtitle="Trust and encryption for your sites"
    description="Get DV/OV/EV certificates with automation, HSTS, and TLS best practices."
    bullets={[
      'DV/OV/EV options',
      'Automated issuance and renewal',
      'Modern TLS configuration',
      'Security headers (HSTS, CSP)',
    ]}
    icon={<FiShield className="w-7 h-7" />}
  />
);

export const DDoSProtection = () => (
  <ServiceTemplate
    title="DDoS Protection"
    subtitle="Shield infrastructure against attacks"
    description="Layered mitigation for volumetric and application-layer attacks, with real-time monitoring."
    bullets={[
      'L3/L4 scrubbing and WAF',
      'Rate limiting and bot management',
      'Always-on monitoring',
      'Incident response playbooks',
    ]}
    icon={<FiShield className="w-7 h-7" />}
  />
);

export const SecurityAudits = () => (
  <ServiceTemplate
    title="Security Audits"
    subtitle="Comprehensive reviews and hardening"
    description="Assess, prioritize, and remediate risks across apps, infra, and processes."
    bullets={[
      'Threat modeling and pentesting',
      'Configuration and code reviews',
      'Compliance guidance (GDPR, ISO)',
      'Actionable remediation plans',
    ]}
    icon={<FiShield className="w-7 h-7" />}
  />
);

export const MySQLService = () => (
  <ServiceTemplate
    title="MySQL"
    subtitle="Reliable relational database services"
    description="Managed MySQL instances with replication, backups, and tuning for performance."
    bullets={[
      'HA setups and replication',
      'Query tuning and indexing',
      'Backup and restore policies',
      'Migration assistance',
    ]}
    icon={<FiDatabase className="w-7 h-7" />}
  />
);

export const PostgreSQLService = () => (
  <ServiceTemplate
    title="PostgreSQL"
    subtitle="Advanced relational features and performance"
    description="Managed Postgres with extensions, scaling, and observability tooling."
    bullets={[
      'HA and read replicas',
      'Extensions (PostGIS, etc.)',
      'Vacuum and maintenance strategies',
      'Monitoring and alerting',
    ]}
    icon={<FiDatabase className="w-7 h-7" />}
  />
);

export const MongoDBService = () => (
  <ServiceTemplate
    title="MongoDB"
    subtitle="Document database for flexible schemas"
    description="Managed clusters with sharding, backups, and performance tuning for scale."
    bullets={[
      'Replica sets and sharding',
      'Schema design and indexing',
      'Backup and PITR',
      'Connection pooling and performance',
    ]}
    icon={<FiDatabase className="w-7 h-7" />}
  />
);

export const CDNServices = () => (
  <ServiceTemplate
    title="CDN Services"
    subtitle="Global edge delivery of content"
    description="Accelerate websites and APIs with edge caching, image optimization, and smart routing."
    bullets={[
      'Edge caching and purge APIs',
      'Image/video optimization',
      'Smart routing and DNS',
      'Real-time analytics',
    ]}
    icon={<FiGlobe className="w-7 h-7" />}
  />
);

export const LoadBalancing = () => (
  <ServiceTemplate
    title="Load Balancing"
    subtitle="Distribute traffic intelligently"
    description="Ensure reliability and performance with L4/L7 load balancing, health checks, and failover."
    bullets={[
      'L4/L7 strategies',
      'Health checks and failover',
      'Weighted and geo policies',
      'Blue/green and canary routing',
    ]}
    icon={<FiGlobe className="w-7 h-7" />}
  />
);

export const DNSManagement = () => (
  <ServiceTemplate
    title="DNS Management"
    subtitle="Fast, reliable domain name services"
    description="Manage zones, records, and advanced routing with automated workflows."
    bullets={[
      'Managed zones and records',
      'DNSSEC and security best practices',
      'Programmatic updates',
      'Monitoring and reporting',
    ]}
    icon={<FiGlobe className="w-7 h-7" />}
  />
);
