import { Pressable, StyleSheet, Text, View, ScrollView } from 'react-native';
import { useColors } from '../theme/colors';

export type SettingsTabType = 'appearance' | 'notifications' | 'language' | 'security' | 'privacy' | 'accessibility' | 'data' | 'subscriptions' | 'billing';

interface SettingsTabsProps {
  activeTab: SettingsTabType;
  onTabChange: (tab: SettingsTabType) => void;
}

const TAB_LABELS: Record<SettingsTabType, string> = {
  appearance: 'Appearance',
  notifications: 'Notifications',
  language: 'Language & Region',
  security: 'Security',
  privacy: 'Privacy',
  accessibility: 'Accessibility',
  data: 'Data & Storage',
  subscriptions: 'Subscriptions',
  billing: 'Billing',
};

export function SettingsTabs({ activeTab, onTabChange }: SettingsTabsProps) {
  const colors = useColors();
  const tabs: SettingsTabType[] = ['appearance', 'notifications', 'language', 'security', 'privacy', 'accessibility', 'data', 'subscriptions', 'billing'];

  return (
    <View style={[styles.cardContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        {tabs.map((tab) => (
          <Pressable 
            key={tab}
            onPress={() => onTabChange(tab)}
            style={[
              styles.tab,
              {
                backgroundColor: activeTab === tab ? colors.accent : 'transparent',
                borderWidth: activeTab === tab ? 0 : 1,
                borderColor: colors.border,
              }
            ]}
          >
            <Text 
              style={[
                styles.tabLabel,
                { color: activeTab === tab ? colors.background : colors.textSecondary }
              ]}
            >
              {TAB_LABELS[tab]}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginBottom: 16,
  },
  container: {
    height: 44,
  },
  content: {
    gap: 8,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: '600',
  }
});
