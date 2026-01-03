import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Card } from '../components/Card';
import { Screen } from '../components/Screen';
import { SectionHeader } from '../components/SectionHeader';
import { services } from '../constants/data';
import { useColors } from '../theme/colors';

export default function ServicesScreen() {
  const colors = useColors();

  const coreServices = [
    { icon: 'layers-outline', title: 'ERP Dashboard', desc: 'Complete enterprise resource planning with inventory management, supply chain tracking, financial reporting, and automated workflows.' },
    { icon: 'people-outline', title: 'CRM Dashboard', desc: 'Customer relationship management with lead tracking, sales pipeline visualization, contact management, and performance analytics.' },
    { icon: 'document-text-outline', title: 'CMS Dashboard', desc: 'Content management system with visual editor, media library, SEO tools, multi-language support, and version control.' },
    { icon: 'cart-outline', title: 'E-Commerce Platform', desc: 'Full-featured online store with product catalog, cart, checkout, payment gateways, order management, and analytics.' },
    { icon: 'bar-chart-outline', title: 'Data Analytics', desc: 'Real-time business intelligence with custom dashboards, KPI tracking, predictive analytics, and automated reporting.' },
    { icon: 'trending-up-outline', title: 'Marketing Automation', desc: 'Email campaigns, social media scheduling, lead scoring, A/B testing, and conversion tracking to maximize ROI.' },
  ];

  const technicalServices = [
    { icon: 'code-outline', title: 'Custom Development', desc: 'Tailored solutions with React, TypeScript, Node.js, Python FastAPI, PostgreSQL, and scalable architecture.' },
    { icon: 'git-network-outline', title: 'API & Integrations', desc: 'RESTful API with JWT auth, OAuth2, webhook support, and seamless integration with 100+ services.' },
    { icon: 'cloud-outline', title: 'Cloud Infrastructure', desc: 'Docker containerization, Kubernetes orchestration, CI/CD pipelines, automated scaling, and multi-region deployment.' },
    { icon: 'shield-checkmark-outline', title: 'Security & Compliance', desc: 'End-to-end encryption, regular audits, GDPR compliance, SOC 2 Type II, ISO 27001, and penetration testing.' },
    { icon: 'flash-outline', title: 'Performance Optimization', desc: 'Sub-second load times with CDN delivery, code splitting, lazy loading, server-side rendering, and caching.' },
    { icon: 'headset-outline', title: '24/7 Support & Training', desc: 'Dedicated support team, comprehensive documentation, video tutorials, live chat, email support, and onboarding.' },
  ];
  
  return (
    <Screen>
      <SectionHeader title="Services" subtitle="End-to-end solutions across dashboards, content, and commerce" />

      {/* Core Business Services */}
      <View style={styles.sectionContainer}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Core Business Solutions</Text>
        <View>
          {coreServices.map((service) => (
            <Card key={service.title} style={styles.serviceCard}>
              <View style={styles.serviceHeader}>
                <View style={[styles.iconBadge, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <Ionicons name={service.icon as any} size={18} color={colors.accent} />
                </View>
                <View style={styles.serviceText}>
                  <Text style={[styles.serviceTitle, { color: colors.textPrimary }]}>{service.title}</Text>
                  <Text style={[styles.serviceCopy, { color: colors.textSecondary }]}>{service.desc}</Text>
                </View>
              </View>
            </Card>
          ))}
        </View>
      </View>

      {/* Technical Services */}
      <View style={styles.sectionContainer}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Technical Services & Support</Text>
        <View>
          {technicalServices.map((service) => (
            <Card key={service.title} style={styles.serviceCard}>
              <View style={styles.serviceHeader}>
                <View style={[styles.iconBadge, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <Ionicons name={service.icon as any} size={18} color={colors.accent} />
                </View>
                <View style={styles.serviceText}>
                  <Text style={[styles.serviceTitle, { color: colors.textPrimary }]}>{service.title}</Text>
                  <Text style={[styles.serviceCopy, { color: colors.textSecondary }]}>{service.desc}</Text>
                </View>
              </View>
            </Card>
          ))}
        </View>
      </View>

      <Card style={styles.ctaCard}>
        <Text style={[styles.ctaCardTitle, { color: colors.textPrimary }]}>Need a custom solution?</Text>
        <Text style={[styles.ctaCardCopy, { color: colors.textSecondary }]}>Connect your apps to CitriCloud infrastructure without touching the web stack.</Text>
        <Pressable style={[styles.secondaryButton, { backgroundColor: colors.accent }]}>
          <Ionicons name="call" size={16} color={colors.background} />
          <Text style={[styles.secondaryButtonLabel, { color: colors.background }]}>Book a call</Text>
        </Pressable>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    marginBottom: 20
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 12
  },
  serviceCard: {
    marginBottom: 12
  },
  serviceHeader: {
    flexDirection: 'row'
  },
  iconBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    flexShrink: 0
  },
  serviceText: {
    flex: 1
  },
  serviceTitle: {
    fontWeight: '700',
    fontSize: 14
  },
  serviceCopy: {
    marginTop: 4,
    lineHeight: 18,
    fontSize: 12
  },
  cta: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    alignItems: 'center',
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10
  },
  ctaLabel: {
    fontWeight: '700',
    marginRight: 6,
    fontSize: 12
  },
  ctaCard: {
    marginBottom: 24
  },
  ctaCardTitle: {
    fontWeight: '800',
    fontSize: 16
  },
  ctaCardCopy: {
    marginTop: 6,
    lineHeight: 18,
    fontSize: 12
  },
  secondaryButton: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    alignSelf: 'flex-start'
  },
  secondaryButtonLabel: {
    fontWeight: '700',
    marginLeft: 6,
    fontSize: 12
  }
});
