import ServiceTemplate from './ServiceTemplate';
import { FiGitBranch } from 'react-icons/fi';

export default function DevOps() {
  return (
    <ServiceTemplate
      title="DevOps & CI/CD"
      subtitle="Automate your deployment pipeline and infrastructure"
      description="Streamline your development workflow with automated testing, continuous integration, and deployment pipelines. We help teams deliver software faster and more reliably."
      icon={<FiGitBranch className="w-7 h-7" />}
      bullets={[
        'CI/CD pipeline setup (GitHub Actions, GitLab CI, Jenkins)',
        'Infrastructure as Code (Terraform, CloudFormation)',
        'Container orchestration (Docker, Kubernetes)',
        'Automated testing and quality gates',
        'Environment provisioning and configuration management',
        'Monitoring and alerting setup (Prometheus, Grafana)',
        'Blue-green and canary deployments',
        'DevOps consulting and workflow optimization',
      ]}
    />
  );
}
