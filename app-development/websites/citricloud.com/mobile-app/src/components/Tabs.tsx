import { Pressable, StyleSheet, Text, View, ScrollView } from 'react-native';
import { useColors } from '../theme/colors';

export type TabType = 'profile' | 'messages' | 'license' | 'usage' | 'email-aliases' | 'settings' | 'products' | 'orders' | 'invoices' | 'payments' | 'subscriptions' | 'tickets';

interface TabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const TAB_LABELS: Record<TabType, string> = {
  profile: 'Profile',
  messages: 'Messages',
  license: 'License',
  usage: 'Usage',
  'email-aliases': 'Email Alias',
  settings: 'Settings',
  products: 'Your Products',
  orders: 'Orders',
  invoices: 'Invoices',
  payments: 'Payment Methods',
  subscriptions: 'Subscription',
  tickets: 'Tickets'
};

export function Tabs({ activeTab, onTabChange }: TabsProps) {
  const colors = useColors();
  // Align with web profile tabs for parity
  const tabs: TabType[] = ['profile', 'messages', 'license', 'orders', 'invoices', 'tickets', 'settings'];

  return (
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
  );
}

const styles = StyleSheet.create({
  container: {
    height: 48,
    marginBottom: 16,
  },
  content: {
    paddingHorizontal: 16,
  },
  tab: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginRight: 8,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '600',
  }
});
