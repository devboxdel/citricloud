import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useColors } from '../theme/colors';

type SectionHeaderProps = {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function SectionHeader({ title, subtitle, actionLabel, onAction }: SectionHeaderProps) {
  const colors = useColors();
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  
  return (
    <View style={styles.container}>
      <View style={styles.textGroup}>
        <Text style={[styles.title, { color: colors.textPrimary, fontSize: isTablet ? 28 : 18 }]}>{title}</Text>
        {subtitle ? <Text style={[styles.subtitle, { color: colors.textSecondary, fontSize: isTablet ? 16 : 14 }]}>{subtitle}</Text> : null}
      </View>
      {actionLabel && onAction ? (
        <Pressable style={styles.action} onPress={onAction}>
          <Text style={[styles.actionLabel, { color: colors.accent, fontSize: isTablet ? 16 : 14 }]}>{actionLabel}</Text>
          <Ionicons name="chevron-forward" size={isTablet ? 22 : 18} color={colors.textSecondary} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  textGroup: {
    flex: 1
  },
  title: {
    fontSize: 18,
    fontWeight: '700'
  },
  subtitle: {
    marginTop: 4
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#1f2a44'
  },
  actionLabel: {
    marginRight: 4,
    fontWeight: '600'
  }
});
