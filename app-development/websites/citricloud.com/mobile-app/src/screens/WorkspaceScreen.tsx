import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Card } from '../components/Card';
import { Screen } from '../components/Screen';
import { SectionHeader } from '../components/SectionHeader';
import { workspaceShortcuts } from '../constants/data';
import { useColors, colors } from '../theme/colors';

export default function WorkspaceScreen({ navigation }: any) {
  const colors = useColors();
  
  return (
    <Screen>
      <Card style={styles.heroCard}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </Pressable>
        <Text style={[styles.heroTitle, { color: colors.textPrimary }]}>Workspace on mobile</Text>
        <Text style={[styles.heroCopy, { color: colors.textSecondary }]}>Switch between email, lists, and projects without signing in again.</Text>
        <Pressable style={[styles.primaryButton, { backgroundColor: colors.accent }]}>
          <Ionicons name="arrow-forward" size={18} color={colors.background} />
          <Text style={[styles.primaryButtonLabel, { color: colors.background }]}>Open workspace</Text>
        </Pressable>
      </Card>

      <SectionHeader title="Apps" subtitle="Pick up where you left off" />
      {workspaceShortcuts.map(item => (
        <Card key={item.title} style={styles.appCard}>
          <View style={styles.appRow}>
            <View style={[styles.appIcon, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Ionicons name={item.icon as any} size={20} color={colors.accent} />
            </View>
            <View style={styles.appText}>
              <Text style={[styles.appTitle, { color: colors.textPrimary }]}>{item.title}</Text>
              <Text style={[styles.appCaption, { color: colors.textSecondary }]}>{item.caption}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
          </View>
        </Card>
      ))}

      <Card style={styles.securityCard}>
        <View style={styles.securityHeader}>
          <Ionicons name="lock-closed-outline" size={18} color={colors.accent} />
          <Text style={[styles.securityTitle, { color: colors.textPrimary }]}>Security</Text>
        </View>
        <Text style={[styles.securityCopy, { color: colors.textSecondary }]}>Face ID / biometrics, device binding, and quick remote sign-out are baked in.</Text>
        <View style={styles.securityRow}>
          <Text style={[styles.securityLabel, { color: colors.textSecondary }]}>Last policy refresh</Text>
          <Text style={[styles.securityValue, { color: colors.textPrimary }]}>12m ago</Text>
        </View>
        <View style={styles.securityRow}>
          <Text style={[styles.securityLabel, { color: colors.textSecondary }]}>Active devices</Text>
          <Text style={[styles.securityValue, { color: colors.textPrimary }]}>3</Text>
        </View>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    marginBottom: 16
  },  backButton: {
    marginBottom: 12,
    padding: 4,
    alignSelf: 'flex-start',
  },  heroTitle: {
    fontSize: 20,
    fontWeight: '800'
  },
  heroCopy: {
    marginTop: 8,
    lineHeight: 20
  },
  primaryButton: {
    marginTop: 12,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12
  },
  primaryButtonLabel: {
    fontWeight: '800',
    marginLeft: 6
  },
  appCard: {
    marginBottom: 10
  },
  appRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  appIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12
  },
  appText: {
    flex: 1
  },
  appTitle: {
    fontWeight: '800'
  },
  appCaption: {
    marginTop: 4
  },
  securityCard: {
    marginTop: 8,
    marginBottom: 20
  },
  securityHeader: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  securityTitle: {
    fontWeight: '800',
    marginLeft: 8
  },
  securityCopy: {
    marginTop: 6,
    lineHeight: 20
  },
  securityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10
  },
  securityLabel: {
  },
  securityValue: {
    fontWeight: '700'
  }
});
