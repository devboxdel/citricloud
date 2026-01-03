import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View, ScrollView } from 'react-native';
import { Card } from '../components/Card';
import { Screen } from '../components/Screen';
import { SectionHeader } from '../components/SectionHeader';
import { releaseNotes, quickActions } from '../constants/data';
import { useColors } from '../theme/colors';
import { useAuthStore } from '../store/authStore';

export default function HomeScreen() {
  const colors = useColors();
  const { isAuthenticated } = useAuthStore();
  
  const features = [
    {
      icon: 'layers-outline',
      title: 'Dashboard',
      description: 'Enterprise resource planning with inventory management and financial reporting.',
    },
    {
      icon: 'people-outline',
      title: 'CRM',
      description: 'Customer relationship management with lead tracking and sales pipeline visualization.',
    },
    {
      icon: 'document-text-outline',
      title: 'CMS',
      description: 'Content management system with visual editor and SEO tools.',
    },
    {
      icon: 'cart-outline',
      title: 'E-Commerce',
      description: 'Full-featured online store with product catalog and checkout.',
    },
    {
      icon: 'flash-outline',
      title: 'Performance',
      description: 'Sub-second load times with CDN delivery and caching strategies.',
    },
    {
      icon: 'shield-checkmark-outline',
      title: 'Security',
      description: 'End-to-end encryption, regular audits, and GDPR compliance.',
    },
  ];

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    hero: {
      marginBottom: 20
    },
    heroHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between'
    },
    kicker: {
      color: colors.accent,
      fontSize: 12,
      fontWeight: '700',
      letterSpacing: 1.2
    },
    title: {
      color: colors.textPrimary,
      fontSize: 24,
      fontWeight: '800',
      marginTop: 8,
      lineHeight: 32
    },
    subtitle: {
      color: colors.textSecondary,
      marginTop: 6,
      lineHeight: 20,
      fontSize: 14
    },
    heroBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: colors.border
    },
    badgeText: {
      color: colors.textPrimary,
      marginLeft: 6,
      fontWeight: '700',
      fontSize: 12
    },
    heroPills: {
      flexDirection: 'row',
      marginTop: 16,
      gap: 8
    },
    pill: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      backgroundColor: colors.surface,
      paddingHorizontal: 10,
      paddingVertical: 8,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border
    },
    pillText: {
      color: colors.textPrimary,
      fontSize: 12,
      fontWeight: '600',
      marginLeft: 6
    },
    section: {
      marginBottom: 20
    },
    featuresGrid: {
      gap: 12,
    },
    featureCard: {
      padding: 14,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      marginBottom: 12
    },
    featureIconWrap: {
      width: 40,
      height: 40,
      borderRadius: 10,
      backgroundColor: colors.accent + '15',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 8
    },
    featureTitle: {
      color: colors.textPrimary,
      fontWeight: '700',
      fontSize: 14,
      marginBottom: 4
    },
    featureDesc: {
      color: colors.textSecondary,
      fontSize: 12,
      lineHeight: 16
    },
    quickCard: {
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderWidth: 1,
      borderRadius: 14,
      padding: 14,
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12
    },
    quickIconWrap: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 10,
      marginRight: 12,
      borderWidth: 1,
      borderColor: colors.border
    },
    quickTextWrap: {
      flex: 1
    },
    quickTitle: {
      color: colors.textPrimary,
      fontWeight: '700',
      fontSize: 14
    },
    quickCopy: {
      color: colors.textSecondary,
      marginTop: 4,
      fontSize: 12
    },
    noteCard: {
      marginBottom: 12
    },
    noteHeader: {
      flexDirection: 'row',
      alignItems: 'center'
    },
    noteTitle: {
      color: colors.textPrimary,
      fontWeight: '700',
      marginLeft: 8,
      fontSize: 14
    },
    noteBody: {
      color: colors.textSecondary,
      marginTop: 6,
      lineHeight: 20,
      fontSize: 12
    },
    supportCard: {
      marginBottom: 24,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    supportText: {
      flex: 1,
      marginRight: 12
    },
    supportTitle: {
      color: colors.textPrimary,
      fontWeight: '800',
      fontSize: 16
    },
    supportCopy: {
      color: colors.textSecondary,
      marginTop: 6,
      lineHeight: 18,
      fontSize: 12
    },
    supportButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.accent,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 10
    },
    supportButtonLabel: {
      color: colors.background,
      fontWeight: '700',
      marginLeft: 6,
      fontSize: 12
    },
    ctaButton: {
      backgroundColor: colors.accent,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 12,
      alignItems: 'center',
      marginVertical: 12
    },
    ctaButtonText: {
      color: colors.background,
      fontWeight: '700',
      fontSize: 14
    }
  });
  
  return (
    <Screen>
      <Card style={styles.hero}>
        <View style={styles.heroHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.kicker}>CITRICLOUD</Text>
            <Text style={styles.title}>Workspace, hosting, and support in one place.</Text>
            <Text style={styles.subtitle}>Built for teams that need reliable cloud + productivity on the go.</Text>
          </View>
          <View style={styles.heroBadge}>
            <Ionicons name="shield-checkmark" size={16} color={colors.accent} />
            <Text style={styles.badgeText}>Secure</Text>
          </View>
        </View>
        <View style={styles.heroPills}>
          <View style={styles.pill}>
            <Ionicons name="cloud-outline" size={14} color={colors.accent} />
            <Text style={styles.pillText}>Cloud</Text>
          </View>
          <View style={styles.pill}>
            <Ionicons name="mail-unread-outline" size={14} color={colors.accent} />
            <Text style={styles.pillText}>Workspace</Text>
          </View>
          <View style={styles.pill}>
            <Ionicons name="chatbubbles-outline" size={14} color={colors.accent} />
            <Text style={styles.pillText}>Support</Text>
          </View>
        </View>
        
        {!isAuthenticated && (
          <Pressable style={styles.ctaButton}>
            <Text style={styles.ctaButtonText}>Start Free →</Text>
          </Pressable>
        )}
      </Card>

      {/* Features Section */}
      <View style={styles.section}>
        <SectionHeader title="Features" subtitle="What makes us different" />
        <View style={styles.featuresGrid}>
          {features.map((feature) => (
            <View key={feature.title} style={styles.featureCard}>
              <View style={styles.featureIconWrap}>
                <Ionicons name={feature.icon as any} size={20} color={colors.accent} />
              </View>
              <Text style={styles.featureTitle}>{feature.title}</Text>
              <Text style={styles.featureDesc}>{feature.description}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <SectionHeader title="Quick actions" subtitle="Jump straight to what matters" />
        <View>
          {quickActions.map(action => (
            <Pressable key={action.title} style={styles.quickCard}>
              <View style={styles.quickIconWrap}>
                <Ionicons name={action.icon as any} size={18} color={colors.accent} />
              </View>
              <View style={styles.quickTextWrap}>
                <Text style={styles.quickTitle}>{action.title}</Text>
                <Text style={styles.quickCopy}>{action.description}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <SectionHeader title="Latest" subtitle="Mobile-friendly updates" />
        {releaseNotes.map(note => (
          <Card key={note.title} style={styles.noteCard}>
            <View style={styles.noteHeader}>
              <Ionicons name="sparkles-outline" size={16} color={colors.accent} />
              <Text style={styles.noteTitle}>{note.title}</Text>
            </View>
            <Text style={styles.noteBody}>{note.body}</Text>
          </Card>
        ))}
      </View>

      <Card style={styles.supportCard}>
        <View style={styles.supportText}>
          <Text style={styles.supportTitle}>Need help?</Text>
          <Text style={styles.supportCopy}>Message our team or open a ticket. We respond in under 15 minutes on average.</Text>
        </View>
        <Pressable style={styles.supportButton}>
          <Ionicons name="chatbubbles" size={16} color={colors.background} />
          <Text style={styles.supportButtonLabel}>Chat</Text>
        </Pressable>
      </Card>
    </Screen>
  );
}
