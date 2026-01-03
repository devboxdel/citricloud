import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../components/Card';
import { Screen } from '../components/Screen';
import { useThemeStore } from '../store/themeStore';
import { useColors } from '../theme/colors';
import { colors as defaultColors } from '../theme/colors';

export default function SettingsScreen({ navigation }: any) {
  const mode = useThemeStore((s) => s.mode);
  const cycleMode = useThemeStore((s) => s.cycleMode);
  const colors = useColors();

  const getModeDisplay = () => {
    if (mode === 'auto') return { icon: 'phone-portrait', label: 'Auto (System)' };
    if (mode === 'dark') return { icon: 'moon', label: 'Dark Mode' };
    return { icon: 'sunny', label: 'Light Mode' };
  };

  const display = getModeDisplay();

  return (
    <Screen>
      <Card style={styles.header}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </Pressable>
          <View style={styles.headerTextContainer}>
            <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Settings</Text>
            <Text style={[styles.headerCopy, { color: colors.textSecondary }]}>
              Customize your app experience
            </Text>
          </View>
        </View>
      </Card>

      <Card style={styles.settingCard}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Appearance</Text>
        
        <Pressable 
          style={[styles.settingRow, { borderBottomColor: colors.border }]} 
          onPress={cycleMode}
        >
          <View style={styles.settingLeft}>
            <Ionicons 
              name={display.icon as any} 
              size={20} 
              color={colors.accent} 
            />
            <View style={styles.settingText}>
              <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>
                {display.label}
              </Text>
              <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                Tap to cycle: Auto → Light → Dark
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.muted} />
        </Pressable>

        <View style={styles.themePreview}>
          <Text style={[styles.previewLabel, { color: colors.textSecondary }]}>Current theme</Text>
          <View style={[styles.colorGrid, { backgroundColor: colors.surface }]}>
            <View style={[styles.colorSample, { backgroundColor: colors.accent }]} />
            <View style={[styles.colorSample, { backgroundColor: colors.accentSoft }]} />
            <View style={[styles.colorSample, { backgroundColor: colors.warning }]} />
            <View style={[styles.colorSample, { backgroundColor: colors.danger }]} />
          </View>
        </View>
      </Card>

      <Card style={styles.infoCard}>
        <Ionicons name="information-circle" size={20} color={colors.muted} />
        <Text style={[styles.infoText, { color: colors.textSecondary }]}>
          Your theme preference is saved automatically
        </Text>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    padding: 4,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 4,
  },
  headerCopy: {
    fontSize: 14,
    lineHeight: 20,
  },
  settingCard: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  settingLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingText: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 12,
  },
  themePreview: {
    marginTop: 16,
    paddingTop: 16,
  },
  previewLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  colorGrid: {
    flexDirection: 'row',
    gap: 8,
    padding: 12,
    borderRadius: 8,
  },
  colorSample: {
    flex: 1,
    height: 40,
    borderRadius: 6,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
});
