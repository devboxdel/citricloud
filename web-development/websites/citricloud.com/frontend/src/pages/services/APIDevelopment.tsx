import ServiceTemplate from './ServiceTemplate';
import { FiTool } from 'react-icons/fi';

export default function APIDevelopment() {
  return (
    <ServiceTemplate
      title="API Development"
      subtitle="Build robust RESTful and GraphQL APIs"
      description="Connect your applications and services with well-designed APIs. We create scalable, secure, and well-documented APIs that enable seamless integration and data exchange."
      icon={<FiTool className="w-7 h-7" />}
      bullets={[
        'RESTful API design and development',
        'GraphQL API implementation',
        'API authentication (OAuth2, JWT)',
        'Rate limiting and throttling',
        'Comprehensive API documentation (OpenAPI/Swagger)',
        'Versioning and backwards compatibility',
        'Webhook integration and event-driven architecture',
        'API testing and monitoring tools',
      ]}
    />
  );
}
