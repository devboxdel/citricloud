import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../components/Card';
import { Screen } from '../components/Screen';
import { useAuthStore } from '../store/authStore';
import { useColors, colors } from '../theme/colors';
import { LoginSheet } from './LoginSheet';
import { ProfileSheet } from './ProfileSheet';

export default function AccountScreen({ navigation }: any) {
  const colors = useColors();
  const [showLogin, setShowLogin] = useState(false);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const loadFromStorage = useAuthStore((s) => s.loadFromStorage);

  useEffect(() => {
    loadFromStorage();
  }, []);

  if (isAuthenticated && user) {
    return <ProfileSheet navigation={navigation} />;
  }

  if (showLogin) {
    return <LoginSheet onSuccess={() => setShowLogin(false)} />;
  }

  return (
    <Screen>
      <Card style={styles.authCard}>
        <View style={styles.authHeader}>
          <Ionicons name="person-circle-outline" size={30} color={colors.accent} />
          <View style={styles.authTextWrap}>
            <Text style={[styles.authTitle, { color: colors.textPrimary }]}>Sign in to continue</Text>
            <Text style={[styles.authCopy, { color: colors.textSecondary }]}>Use your CitriCloud account to access workspace.</Text>
          </View>
          <Pressable 
            onPress={() => navigation.navigate('Notifications')} 
            style={styles.notificationButton}
          >
            <Ionicons name="notifications-outline" size={22} color={colors.textPrimary} />
          </Pressable>
        </View>
        <Pressable style={[styles.primaryButton, { backgroundColor: colors.accent }]} onPress={() => setShowLogin(true)}>
          <Text style={[styles.primaryButtonLabel, { color: colors.background }]}>Sign in</Text>
        </Pressable>
      </Card>

      <Card style={styles.settingsCard}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Features</Text>
        <View style={styles.inlineRow}>
          <Ionicons name="mail-outline" size={18} color={colors.accent} />
          <View style={styles.textWrap}>
            <Text style={[styles.featureTitle, { color: colors.textPrimary }]}>Email & Workspace</Text>
            <Text style={[styles.featureCopy, { color: colors.textSecondary }]}>Sign in to access shared inboxes and files.</Text>
          </View>
        </View>
        <View style={styles.inlineRow}>
          <Ionicons name="pulse-outline" size={18} color={colors.accent} />
          <View style={styles.textWrap}>
            <Text style={[styles.featureTitle, { color: colors.textPrimary }]}>Status & Monitoring</Text>
            <Text style={[styles.featureCopy, { color: colors.textSecondary }]}>Track uptime and service health on mobile.</Text>
          </View>
        </View>
        <View style={styles.inlineRow}>
          <Ionicons name="shield-outline" size={18} color={colors.accent} />
          <View style={styles.textWrap}>
            <Text style={[styles.featureTitle, { color: colors.textPrimary }]}>Secure Sessions</Text>
            <Text style={[styles.featureCopy, { color: colors.textSecondary }]}>Biometric unlock and device binding included.</Text>
          </View>
        </View>
      </Card>

      <Card style={styles.supportCard}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Support</Text>
        <View style={styles.inlineRow}>
          <Ionicons name="headset-outline" size={18} color={colors.textPrimary} />
          <Text style={[styles.inlineText, { color: colors.textSecondary }]}>24/7 live chat</Text>
        </View>
        <View style={styles.inlineRow}>
          <Ionicons name="shield-outline" size={18} color={colors.textPrimary} />
          <Text style={[styles.inlineText, { color: colors.textSecondary }]}>Security desk</Text>
        </View>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  notificationButton: {
    padding: 8,
  },
  authCard: {
    marginBottom: 16,
  },
  authHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authTextWrap: {
    marginLeft: 10,
    flex: 1,
  },
  authTitle: {
    fontWeight: '800',
    fontSize: 16,
  },
  authCopy: {
    marginTop: 4,
    lineHeight: 18,
  },
  primaryButton: {
    marginTop: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
  },
  primaryButtonLabel: {
    fontWeight: '800',
  },
  settingsCard: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontWeight: '800',
    marginBottom: 12,
  },
  inlineRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  textWrap: {
    marginLeft: 12,
    flex: 1,
  },
  featureTitle: {
    fontWeight: '700',
  },
  featureCopy: {
    marginTop: 4,
    lineHeight: 18,
  },
  supportCard: {
    marginBottom: 20,
  },
  inlineText: {
    marginLeft: 8,
  },
});
