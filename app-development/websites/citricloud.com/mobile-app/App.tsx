import { useState, useEffect } from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, Modal, Pressable, StyleSheet, Animated } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useKeepAwake } from 'expo-keep-awake';
import HomeScreen from './src/screens/HomeScreen';
import ServicesScreen from './src/screens/ServicesScreen';
import BlogScreen from './src/screens/BlogScreen';
import BlogDetailScreen from './src/screens/BlogDetailScreen';
import ShopScreen from './src/screens/ShopScreen';
import ProductDetailScreen from './src/screens/ProductDetailScreen';
import CheckoutScreen from './src/screens/CheckoutScreen';
import CartScreen from './src/screens/CartScreen';
import AccountScreen from './src/screens/AccountScreen';
import NotificationsScreen from './src/screens/NotificationsScreen';
import ContactScreen from './src/screens/ContactScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import WorkspaceScreen from './src/screens/WorkspaceScreen';
import StatusScreen from './src/screens/StatusScreen';
import WelcomeScreen from './src/screens/WelcomeScreen';
import { AccountHeader } from './src/components/AccountHeader';
import { useColors, useEffectiveScheme } from './src/theme/colors';
import { useThemeStore } from './src/store/themeStore';
import { useAuthStore } from './src/store/authStore';

const Tab = createBottomTabNavigator();
const ShopStack = createNativeStackNavigator();
const BlogStack = createNativeStackNavigator();
const AccountStack = createNativeStackNavigator();

function DevelopmentPopup() {
  const colors = useColors();
  const [isVisible, setIsVisible] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];
  const scaleAnim = useState(new Animated.Value(0.9))[0];

  useEffect(() => {
    checkPopupStatus();
  }, []);

  const checkPopupStatus = async () => {
    try {
      const dismissed = await AsyncStorage.getItem('devPopupDismissed');
      const dismissTime = await AsyncStorage.getItem('devPopupDismissTime');

      // Show popup again after 24 hours
      if (dismissed === 'true' && dismissTime) {
        const hoursSinceDismiss = (Date.now() - parseInt(dismissTime)) / (1000 * 60 * 60);
        if (hoursSinceDismiss < 24) {
          return;
        }
      }

      setIsVisible(true);
      // Animate in
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start();
    } catch (error) {
      console.error('Error checking popup status:', error);
    }
  };

  const handleDismiss = async () => {
    // Animate out
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsVisible(false);
    });

    try {
      await AsyncStorage.setItem('devPopupDismissed', 'true');
      await AsyncStorage.setItem('devPopupDismissTime', Date.now().toString());
    } catch (error) {
      console.error('Error saving popup dismiss state:', error);
    }
  };

  if (!isVisible) return null;

  return (
    <Modal transparent visible={isVisible} animationType="none">
      {/* Backdrop */}
      <Animated.View
        style={[
          popupStyles.backdrop,
          { opacity: fadeAnim }
        ]}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={handleDismiss} />
      </Animated.View>

      {/* Modal Content */}
      <View style={popupStyles.container}>
        <Animated.View
          style={[
            popupStyles.modal,
            { backgroundColor: colors.surface },
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }]
            }
          ]}
        >
          {/* Close button */}
          <Pressable
            onPress={handleDismiss}
            style={popupStyles.closeButton}
          >
            <Ionicons name="close" size={24} color={colors.textSecondary} />
          </Pressable>

          {/* Icon */}
          <View style={popupStyles.iconContainer}>
            <View style={[popupStyles.iconCircle, { backgroundColor: '#0ea5e9' }]}>
              <Ionicons name="construct" size={32} color="#fff" />
            </View>
          </View>

          {/* Title */}
          <Text style={[popupStyles.title, { color: colors.textPrimary }]}>
            🚧 App Under Development
          </Text>

          {/* Message */}
          <Text style={[popupStyles.message, { color: colors.textSecondary }]}>
            This mobile app is currently in active development. Some features may not work as expected. We appreciate your patience!
          </Text>

          {/* Features Notice */}
          <View style={[popupStyles.noticeBox, { backgroundColor: colors.accent + '15' }]}>
            <View style={popupStyles.noticeItem}>
              <Text style={popupStyles.warningIcon}>⚠️</Text>
              <Text style={[popupStyles.noticeText, { color: colors.textPrimary }]}>
                Some features may be incomplete
              </Text>
            </View>
            <View style={popupStyles.noticeItem}>
              <Text style={popupStyles.warningIcon}>⚠️</Text>
              <Text style={[popupStyles.noticeText, { color: colors.textPrimary }]}>
                Features are being actively tested
              </Text>
            </View>
            <View style={popupStyles.noticeItem}>
              <Text style={popupStyles.warningIcon}>⚠️</Text>
              <Text style={[popupStyles.noticeText, { color: colors.textPrimary }]}>
                Please report any issues you find
              </Text>
            </View>
          </View>

          {/* Buttons */}
          <Pressable
            onPress={handleDismiss}
            style={[popupStyles.button, { backgroundColor: '#0ea5e9' }]}
          >
            <Text style={popupStyles.buttonText}>I Understand</Text>
          </Pressable>

          <Pressable onPress={handleDismiss}>
            <Text style={[popupStyles.dismissText, { color: colors.textSecondary }]}>
              Dismiss for 24 hours
            </Text>
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
}

const popupStyles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 8,
    zIndex: 1,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
  },
  message: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  noticeBox: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  noticeItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  warningIcon: {
    fontSize: 16,
    marginRight: 8,
    marginTop: 2,
  },
  noticeText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  dismissText: {
    fontSize: 14,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
});

export default function App() {
  useKeepAwake();
  const colors = useColors();
  const scheme = useEffectiveScheme();
  const [showWelcome, setShowWelcome] = useState<boolean | null>(null);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const loadFromStorage = useAuthStore((s) => s.loadFromStorage);
  const defaultPrimaryColor = '#0ea5e9';

  // Load auth state on mount
  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  // Enforce default color for non-authenticated users (only when auth state changes)
  // TEMPORARILY DISABLED FOR DEBUGGING
  /*
  useEffect(() => {
    const setPrimaryColor = useThemeStore.getState().setPrimaryColor;
    const primaryColor = useThemeStore.getState().primaryColor;
    
    console.log('[APP] Auth state changed - isAuthenticated:', isAuthenticated, 'primaryColor:', primaryColor);
    
    if (!isAuthenticated && primaryColor !== defaultPrimaryColor) {
      console.log('[APP] User not authenticated, resetting to default color');
      setPrimaryColor(defaultPrimaryColor);
    } else {
      console.log('[APP] User authenticated or color is already default - no reset needed');
    }
  }, [isAuthenticated]); // Only run when authentication status changes
  */

  useEffect(() => {
    checkWelcomeStatus();
  }, []);

  const checkWelcomeStatus = async () => {
    try {
      const hasSeenWelcome = await AsyncStorage.getItem('hasSeenWelcome');
      setShowWelcome(hasSeenWelcome !== 'true');
    } catch (error) {
      console.error('Error checking welcome status:', error);
      setShowWelcome(false);
    }
  };

  const handleWelcomeComplete = () => {
    setShowWelcome(false);
  };

  // Wait for welcome status check
  if (showWelcome === null) {
    return null;
  }

  // Show welcome screen on first launch
  if (showWelcome) {
    return <WelcomeScreen onComplete={handleWelcomeComplete} />;
  }
  
  const navigationTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: colors.background,
      card: colors.surface,
      text: colors.textPrimary,
      border: colors.border,
      primary: colors.accent
    }
  };

  function ShopStackScreen() {
    return (
      <ShopStack.Navigator screenOptions={{ headerShown: false }}>
        <ShopStack.Screen name="ShopList" component={ShopScreen} />
        <ShopStack.Screen name="ProductDetail" component={ProductDetailScreen} />
        <ShopStack.Screen name="Cart" component={CartScreen} />
        <ShopStack.Screen name="Checkout" component={CheckoutScreen} />
      </ShopStack.Navigator>
    );
  }

  function BlogStackScreen() {
    return (
      <BlogStack.Navigator screenOptions={{ headerShown: false }}>
        <BlogStack.Screen name="BlogList" component={BlogScreen} />
        <BlogStack.Screen name="BlogDetail" component={BlogDetailScreen} />
      </BlogStack.Navigator>
    );
  }

  function AccountStackScreen() {
    return (
      <AccountStack.Navigator screenOptions={{ headerShown: false }}>
        <AccountStack.Screen 
          name="AccountMain" 
          component={AccountScreen}
          options={{
            headerShown: true,
            header: () => <AccountHeader />,
          }}
        />
        <AccountStack.Screen name="Notifications" component={NotificationsScreen} />
        <AccountStack.Screen name="Settings" component={SettingsScreen} />
        <AccountStack.Screen name="Workspace" component={WorkspaceScreen} />
        <AccountStack.Screen name="Status" component={StatusScreen} />
      </AccountStack.Navigator>
    );
  }

  return (
    <>
      <NavigationContainer theme={navigationTheme}>
        <StatusBar
          key={scheme}
          style={scheme === 'dark' ? 'light' : 'dark'}
          backgroundColor="transparent"
          translucent={false}
        />
        <Tab.Navigator
          screenOptions={({ route }) => ({
            headerShown: false,
            tabBarActiveTintColor: colors.accent,
            tabBarInactiveTintColor: colors.muted,
            tabBarStyle: {
              backgroundColor: colors.surface,
              borderTopColor: colors.border
            },
            tabBarIcon: ({ color, size }) => {
              const icons: Record<string, string> = {
                Home: 'sparkles-outline',
                Services: 'layers-outline',
                News: 'newspaper-outline',
                Shop: 'cart-outline',
                Contact: 'mail-outline',
                Account: 'person-circle-outline'
              };
              const name = icons[route.name] || 'ellipse-outline';
              return <Ionicons name={name as any} size={size} color={color} />;
            }
          })}
        >
          <Tab.Screen name="Home" component={HomeScreen} />
          <Tab.Screen name="Services" component={ServicesScreen} />
          <Tab.Screen name="News" component={BlogStackScreen} />
          <Tab.Screen name="Shop" component={ShopStackScreen} />
          <Tab.Screen name="Contact" component={ContactScreen} />
          <Tab.Screen name="Account" component={AccountStackScreen} />
        </Tab.Navigator>
      </NavigationContainer>
      
      {/* Development Popup */}
      <DevelopmentPopup />
    </>
  );
}
