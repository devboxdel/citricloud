import { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, Pressable, useWindowDimensions, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Constants from 'expo-constants';
import { Card } from '../components/Card';
import { useColors } from '../theme/colors';

// Note: We avoid importing 'expo-notifications' in Expo Go on Android to prevent the SDK 53 warning overlay.
// We'll dynamically import it only when supported (dev build / iOS / Android standalone/dev-client).

type AppNotification = {
  id: number;
  title: string;
  message: string;
  time: string;
  type: 'order' | 'system' | 'user' | 'info';
  unread: boolean;
};

export default function NotificationsScreen({ navigation }: any) {
  const colors = useColors();
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const isExpoGoAndroid = Platform.OS === 'android' && Constants.appOwnership === 'expo';

  const [unsupported, setUnsupported] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      if (isExpoGoAndroid) {
        // Expo Go on Android does not support expo-notifications (remote) and shows an overlay if imported.
        setUnsupported(true);
        return;
      }
    })();
  }, []);

  const registerForPushNotifications = async (Notifications: any) => {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.log('Notification permission not granted');
        return;
      }

      // Android: ensure a default notification channel exists
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          sound: 'default',
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }

      console.log('Notification permission granted');
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
    }
  };

  const sendTestNotification = async () => {
    if (isExpoGoAndroid) {
      Alert.alert(
        'Not supported in Expo Go',
        'Android push/notifications via expo-notifications require a development build. Use "npx expo run:android" or EAS development build to test. For now, this button is disabled on Expo Go (Android).'
      );
      return;
    }
    try {
      const Notifications = await import('expo-notifications');

      // Configure handler (once per session)
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
          shouldShowBanner: true,
          shouldShowList: true,
        }),
      });

      await registerForPushNotifications(Notifications);
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Test Notification 🔔',
          body: 'This is a test notification from CitriCloud!',
          data: { test: true },
          sound: true,
        },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: 2 },
      });
      
      Alert.alert('Success', 'Test notification will appear in 2 seconds!');
    } catch (error) {
      console.error('Error sending notification:', error);
      Alert.alert('Error', 'Failed to send test notification');
    }
  };

  const [notifications, setNotifications] = useState<AppNotification[]>([
    {
      id: 1,
      title: 'New order received',
      message: 'Order #12345 has been successfully placed',
      time: '5 min ago',
      type: 'order',
      unread: true,
    },
    {
      id: 2,
      title: 'User registration completed',
      message: 'Welcome to CitriCloud! Your account is now active',
      time: '15 min ago',
      type: 'user',
      unread: true,
    },
    {
      id: 3,
      title: 'System update available',
      message: 'A new version of the app is available for download',
      time: '1 hour ago',
      type: 'system',
      unread: false,
    },
    {
      id: 4,
      title: 'Special offer',
      message: 'Get 20% off on all premium plans this week',
      time: '2 hours ago',
      type: 'info',
      unread: false,
    },
  ]);

  const handleMarkAsRead = (id: number) => {
    setNotifications(prev =>
      prev.map(notif => (notif.id === id ? { ...notif, unread: false } : notif))
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, unread: false })));
  };

  const handleDelete = (id: number) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const getIconName = (type: string) => {
    switch (type) {
      case 'order':
        return 'cart-outline';
      case 'system':
        return 'settings-outline';
      case 'user':
        return 'person-outline';
      case 'info':
        return 'information-circle-outline';
      default:
        return 'notifications-outline';
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case 'order':
        return '#10b981';
      case 'system':
        return '#f59e0b';
      case 'user':
        return colors.accent;
      case 'info':
        return '#8b5cf6';
      default:
        return colors.textSecondary;
    }
  };

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <View style={styles.headerLeft}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </Pressable>
          <View>
            <Text style={[styles.headerTitle, { color: colors.textPrimary, fontSize: isTablet ? 28 : 20 }]}>
              Notifications
            </Text>
            {unreadCount > 0 && (
              <Text style={[styles.unreadBadge, { color: colors.textSecondary, fontSize: isTablet ? 14 : 12 }]}>
                {unreadCount} unread
              </Text>
            )}
          </View>
        </View>
        {unreadCount > 0 && (
          <Pressable onPress={handleMarkAllAsRead} style={styles.markAllButton}>
            <Text style={[styles.markAllText, { color: colors.accent, fontSize: isTablet ? 15 : 13 }]}>
              Mark all read
            </Text>
          </Pressable>
        )}
      </View>

      {unsupported && (
        <View style={[styles.banner, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
          <Ionicons name="alert-circle-outline" size={18} color={colors.accent} />
          <Text style={[styles.bannerText, { color: colors.textSecondary }]}>
            Android on Expo Go does not support expo-notifications. Use a development build to test.
          </Text>
        </View>
      )}

      {/* Test Notification Button */}
      <View style={[styles.testButtonContainer, { paddingHorizontal: isTablet ? 40 : 20 }]}>
        <Pressable 
          onPress={sendTestNotification}
          style={[styles.testButton, { backgroundColor: unsupported ? colors.muted : colors.accent }]}
          disabled={unsupported}
        >
          <Ionicons name="notifications" size={20} color="#fff" />
          <Text style={styles.testButtonText}>Send Test Notification</Text>
        </Pressable>
      </View>

      <ScrollView 
        contentContainerStyle={[
          styles.scrollContent,
          { paddingHorizontal: isTablet ? 40 : 20 }
        ]}
        showsVerticalScrollIndicator={false}
      >
        {notifications.length > 0 ? (
          notifications.map((notif) => (
            <Card key={notif.id} style={[styles.notificationCard, notif.unread && { borderLeftWidth: 4, borderLeftColor: colors.accent }]}>
              <View style={styles.notificationContent}>
                <View style={[styles.iconContainer, { backgroundColor: getIconColor(notif.type) + '20' }]}>
                  <Ionicons name={getIconName(notif.type) as any} size={isTablet ? 28 : 24} color={getIconColor(notif.type)} />
                </View>

                <View style={styles.textContainer}>
                  <View style={styles.titleRow}>
                    <Text style={[styles.title, { color: colors.textPrimary, fontSize: isTablet ? 17 : 15 }]} numberOfLines={1}>
                      {notif.title}
                    </Text>
                    {notif.unread && (
                      <View style={[styles.unreadDot, { backgroundColor: colors.accent }]} />
                    )}
                  </View>
                  <Text style={[styles.message, { color: colors.textSecondary, fontSize: isTablet ? 15 : 13 }]} numberOfLines={2}>
                    {notif.message}
                  </Text>
                  <Text style={[styles.time, { color: colors.muted, fontSize: isTablet ? 13 : 11 }]}>
                    {notif.time}
                  </Text>
                </View>

                <View style={styles.actions}>
                  {notif.unread && (
                    <Pressable
                      onPress={() => handleMarkAsRead(notif.id)}
                      style={[styles.actionButton, { backgroundColor: colors.surface }]}
                    >
                      <Ionicons name="checkmark" size={18} color={colors.accent} />
                    </Pressable>
                  )}
                  <Pressable
                    onPress={() => handleDelete(notif.id)}
                    style={[styles.actionButton, { backgroundColor: colors.surface }]}
                  >
                    <Ionicons name="trash-outline" size={18} color={colors.danger} />
                  </Pressable>
                </View>
              </View>
            </Card>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="notifications-off-outline" size={64} color={colors.muted} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No notifications
            </Text>
            <Text style={[styles.emptySubtext, { color: colors.muted }]}>
              You're all caught up!
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontWeight: '700',
  },
  unreadBadge: {
    marginTop: 2,
    fontWeight: '500',
  },
  markAllButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  markAllText: {
    fontWeight: '600',
  },
  banner: {
    marginHorizontal: 20,
    marginTop: 12,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bannerText: {
    flex: 1,
    fontSize: 13,
  },
  testButtonContainer: {
    paddingVertical: 12,
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  testButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  scrollContent: {
    paddingVertical: 16,
  },
  notificationCard: {
    marginBottom: 12,
  },
  notificationContent: {
    flexDirection: 'row',
    gap: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  title: {
    fontWeight: '700',
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  message: {
    marginBottom: 4,
    lineHeight: 18,
  },
  time: {
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 4,
  },
});
