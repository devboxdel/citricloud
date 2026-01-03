import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Card } from '../components/Card';
import { Screen } from '../components/Screen';
import { SectionHeader } from '../components/SectionHeader';
import { statusHighlights } from '../constants/data';
import { useColors, colors } from '../theme/colors';

export default function StatusScreen({ navigation }: any) {
  const colors = useColors();
  
  return (
    <Screen>
      <Card style={styles.heroCard}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </Pressable>
        <View style={styles.heroRow}>
          <View style={[styles.statusDot, { backgroundColor: colors.accent }]} />
          <Text style={[styles.heroLabel, { color: colors.textSecondary }]}>All systems operational</Text>
        </View>
        <Text style={[styles.heroTitle, { color: colors.textPrimary }]}>Status across cloud, APIs, and workspace.</Text>
        <Text style={[styles.heroCopy, { color: colors.textSecondary }]}>See uptime, active deploys, and response times without opening the web dashboard.</Text>
      </Card>

      <SectionHeader title="Highlights" subtitle="Live health signals" />
      <View style={styles.highlightGrid}>
        {statusHighlights.map(item => (
          <View key={item.label} style={styles.highlightCard}>
            <Text style={[styles.highlightLabel, { color: colors.textSecondary }]}>{item.label}</Text>
            <Text style={[styles.highlightValue, { color: item.tone === 'success' ? colors.accent : colors.warning }]}>{item.value}</Text>
          </View>
        ))}
      </View>

      <Card style={styles.incidentCard}>
        <View style={styles.incidentHeader}>
          <Ionicons name="time-outline" size={18} color={colors.accent} />
          <Text style={[styles.incidentTitle, { color: colors.textPrimary }]}>Recent activity</Text>
        </View>
        <View style={styles.incidentRow}>
          <View style={[styles.incidentDot, { backgroundColor: colors.accent }]} />
          <View style={styles.incidentTextWrap}>
            <Text style={[styles.incidentLabel, { color: colors.textPrimary }]}>Deploy 3.18.0</Text>
            <Text style={[styles.incidentCopy, { color: colors.textSecondary }]}>API latency improved by 8% after cache rule update.</Text>
          </View>
          <Text style={[styles.incidentTime, { color: colors.muted }]}>28m</Text>
        </View>
        <View style={styles.incidentRow}>
          <View style={[styles.incidentDot, { backgroundColor: colors.accent }]} />
          <View style={styles.incidentTextWrap}>
            <Text style={[styles.incidentLabel, { color: colors.textPrimary }]}>Workspace sync</Text>
            <Text style={[styles.incidentCopy, { color: colors.textSecondary }]}>Background jobs cleared. No user impact.</Text>
          </View>
          <Text style={[styles.incidentTime, { color: colors.muted }]}>1h</Text>
        </View>
      </Card>

      <Card style={styles.metricsCard}>
        <View style={styles.metricsHeader}>
          <Ionicons name="cellular-outline" size={18} color={colors.accent} />
          <Text style={[styles.metricsTitle, { color: colors.textPrimary }]}>Observability</Text>
        </View>
        <View style={styles.metricRow}>
          <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Edge latency</Text>
          <Text style={[styles.metricValue, { color: colors.textPrimary }]}>42 ms</Text>
        </View>
        <View style={styles.metricRow}>
          <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Error rate</Text>
          <Text style={[styles.metricValue, { color: colors.danger }]}>0.06%</Text>
        </View>
        <View style={styles.metricRow}>
          <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Active regions</Text>
          <Text style={[styles.metricValue, { color: colors.textPrimary }]}>6</Text>
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
  },  heroRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    marginRight: 8
  },
  heroLabel: {
    fontWeight: '700'
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginTop: 8
  },
  heroCopy: {
    marginTop: 8,
    lineHeight: 20
  },
  highlightGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
    marginBottom: 12
  },
  highlightCard: {
    width: '50%',
    paddingHorizontal: 6,
    marginTop: 12
  },
  highlightLabel: {
  },
  highlightValue: {
    marginTop: 4,
    fontWeight: '800',
    fontSize: 18
  },
  incidentCard: {
    marginBottom: 12
  },
  incidentHeader: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  incidentTitle: {
    fontWeight: '800',
    marginLeft: 8
  },
  incidentRow: {
    flexDirection: 'row',
    marginTop: 12,
    alignItems: 'center'
  },
  incidentDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    marginRight: 10
  },
  incidentTextWrap: {
    flex: 1
  },
  incidentLabel: {
    fontWeight: '700'
  },
  incidentCopy: {
    marginTop: 4,
    lineHeight: 18
  },
  incidentTime: {
    marginLeft: 8,
    fontWeight: '700'
  },
  metricsCard: {
    marginBottom: 20
  },
  metricsHeader: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  metricsTitle: {
    fontWeight: '800',
    marginLeft: 8
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10
  },
  metricLabel: {
  },
  metricValue: {
    fontWeight: '700'
  }
});
