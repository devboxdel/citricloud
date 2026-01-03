import { useState, useCallback, useEffect, useRef } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { ActivityIndicator, Pressable, StyleSheet, Text, View, Alert, TextInput, Modal, ScrollView, KeyboardAvoidingView, Platform, useWindowDimensions, SafeAreaView, StatusBar, Dimensions, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import RenderHtml from 'react-native-render-html';
import { Card } from '../components/Card';
import { Screen } from '../components/Screen';
import { Tabs, TabType } from '../components/Tabs';
import { SettingsTabs, SettingsTabType } from '../components/SettingsTabs';
import { useAuthStore } from '../store/authStore';import { useThemeStore } from '../store/themeStore';import { useColors, colors } from '../theme/colors';
import { authAPI, profileAPI, crmAPI, securityAPI } from '../lib/api';
import { COUNTRIES, COUNTRY_CITIES } from '../data/countriesData';

const ROLE_COLORS: Record<string, string> = {
  blue: '#3B82F6',
  red: '#EF4444',
  green: '#10B981',
  purple: '#A855F7',
  yellow: '#F59E0B',
  pink: '#EC4899',
  indigo: '#6366F1',
  teal: '#14B8A6',
  cyan: '#06B6D4',
  orange: '#F97316',
  gray: '#6B7280',
  amber: '#F59E0B',
  lime: '#84CC16',
  emerald: '#059669',
  sky: '#0EA5E9',
  fuchsia: '#D946EF',
  violet: '#8B5CF6',
  rose: '#F43F5E',
};

export function ProfileSheet({ navigation }: any) {
  const colors = useColors();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const updateUser = useAuthStore((s) => s.updateUser);
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const [activeTab, setActiveTab] = useState<TabType | null>(null);
  const [settingsActive, setSettingsActive] = useState<SettingsTabType>('appearance');
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    full_name: user?.full_name || '',
    phone_number: user?.phone_number || '',
    address: user?.address || '',
    city: user?.city || '',
    country: user?.country || '',
    zip_code: user?.zip_code || '',
  });
  const [availableCities, setAvailableCities] = useState<string[]>([]);

  // Tab data state
  const [license, setLicense] = useState<any>(null);
  const [usage, setUsage] = useState<any>(null);
  const [emailAliases, setEmailAliases] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<any | null>(null);
  const [messageStatusFilter, setMessageStatusFilter] = useState('');
  const [messageSenderFilter, setMessageSenderFilter] = useState('');
  const [messageYearFilter, setMessageYearFilter] = useState('');
  const [messageMonthFilter, setMessageMonthFilter] = useState('');
  const [messagePriorityFilter, setMessagePriorityFilter] = useState('');
  const [expandedFilter, setExpandedFilter] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<{ orders: number; invoices: number; tickets: number }>({ orders: 0, invoices: 0, tickets: 0 });
  const [roles, setRoles] = useState<any[]>([]);

  // Password change state (to sync with web profile)
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordStatus, setPasswordStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Settings state to match web
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [orderNotifications, setOrderNotifications] = useState(true);
  const [language, setLanguage] = useState('en');
  
  // Enhanced Notifications settings
  const [marketingNotifications, setMarketingNotifications] = useState(false);
  const [accountActivityNotif, setAccountActivityNotif] = useState(true);
  const [messagesNotif, setMessagesNotif] = useState(true);
  const [billingNotif, setBillingNotif] = useState(true);
  const [productUpdatesNotif, setProductUpdatesNotif] = useState(false);
  const [maintenanceNotif, setMaintenanceNotif] = useState(true);
  const [dndEnabled, setDndEnabled] = useState(false);
  const [dndStartTime, setDndStartTime] = useState('22:00');
  const [dndEndTime, setDndEndTime] = useState('08:00');

  // Language & Region settings
  const [timezone, setTimezone] = useState('UTC');
  const [dateFormat, setDateFormat] = useState('MM/DD/YYYY');
  const [timeFormat, setTimeFormat] = useState('12');
  const [numberFormat, setNumberFormat] = useState('1,234.56');

  // Privacy settings
  const [profileVisibility, setProfileVisibility] = useState('public');
  const [activityVisibility, setActivityVisibility] = useState('friends');
  const [cookieAnalytics, setCookieAnalytics] = useState(true);
  const [cookieMarketing, setCookieMarketing] = useState(false);
  const [searchEngineIndexing, setSearchEngineIndexing] = useState(true);
  const [blockedUsers, setBlockedUsers] = useState<string[]>([]);

  // Accessibility settings
  const [textSize, setTextSize] = useState('Medium');
  const [highContrast, setHighContrast] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [screenReader, setScreenReader] = useState(false);
  const [colorVision, setColorVision] = useState('Normal');

  // Appearance settings - Primary Color & Fonts
  const globalPrimaryColor = useThemeStore ((s) => s.primaryColor);
  const setPrimaryColorGlobal = useThemeStore((s) => s.setPrimaryColor);
  const [localPrimaryColor, setLocalPrimaryColor] = useState(globalPrimaryColor);
  const defaultPrimaryColor = '#0ea5e9';
  const hasLoadedPreferences = useRef(false);
  
  // Initialize hasLoadedPreferences on mount
  useEffect(() => {
    hasLoadedPreferences.current = true;
  }, []);
  
  // Sync local color with global on mount and when global changes from backend (but not if we just changed it)
  useEffect(() => {
    const timeSinceLastChange = Date.now() - lastColorChangeRef.current;
    if (timeSinceLastChange < 3000) {
      // Skip syncing if user just changed the color
      return;
    }
    setLocalPrimaryColor(globalPrimaryColor);
  }, [globalPrimaryColor]);
  
  // Font preferences state
  const [fontH1, setFontH1] = useState('System');
  const [fontH2, setFontH2] = useState('System');
  const [fontH3, setFontH3] = useState('System');
  const [fontH4, setFontH4] = useState('System');
  const [fontBody, setFontBody] = useState('System');
  const defaultFonts = {
    h1: 'System',
    h2: 'System',
    h3: 'System',
    h4: 'System',
    body: 'System'
  };
  
  // Track when user is actively changing color to prevent polling override
  const lastColorChangeRef = useRef<number>(0);
  
  // Security state - 2FA and Sessions
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [show2FASetup, setShow2FASetup] = useState(false);
  const [show2FADisable, setShow2FADisable] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [twoFactorLoading, setTwoFactorLoading] = useState(false);
  const [twoFactorError, setTwoFactorError] = useState<string | null>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [showSessions, setShowSessions] = useState(false);
  const [sessionsLoading, setSessionsLoading] = useState(false);

  const getRoleColor = (roleKey: string) => {
    console.log('[PROFILE] getRoleColor called with:', roleKey, 'Roles array length:', roles.length);
    const role = roles.find((r: any) => r.role_key === roleKey);
    console.log('[PROFILE] Found role:', role);
    const color = role?.color || 'blue';
    console.log('[PROFILE] Role color:', color, 'Hex:', ROLE_COLORS[color] || ROLE_COLORS['blue'] || '#3B82F6');
    return ROLE_COLORS[color] || ROLE_COLORS['blue'] || '#3B82F6';
  };

  const getRoleName = (roleKey: string) => {
    const role = roles.find((r: any) => r.role_key === roleKey);
    return role ? role.name : roleKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  // Ticket creation state (subject/message/priority)
  const [showCreateTicket, setShowCreateTicket] = useState(false);
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');
  const [ticketPriority, setTicketPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [creatingTicket, setCreatingTicket] = useState(false);
  const [createTicketError, setCreateTicketError] = useState<string | null>(null);

  // Submenu modal state
  const [showSubmenu, setShowSubmenu] = useState(false);

  // Fetch tab data when tab changes
  useEffect(() => {
    const fetchTabData = async () => {
      setLoading(true);
      try {
        switch (activeTab) {
          case 'messages':
            try {
              console.log('[PROFILE] Fetching messages with filter:', messageStatusFilter);
              const msgs = await crmAPI.getMyMessages({ status_filter: messageStatusFilter || undefined });
              console.log('[PROFILE] Messages response:', JSON.stringify(msgs, null, 2));
              const messagesList = Array.isArray(msgs) ? msgs : msgs?.items || [];
              console.log('[PROFILE] Messages list length:', messagesList.length);
              setMessages(messagesList);
            } catch (error: any) {
              console.error('[PROFILE] Failed to fetch messages:', error);
              console.error('[PROFILE] Error details:', error.response?.data || error.message);
              setMessages([]);
            }
            break;
          case 'license':
            const licenseData = await profileAPI.getLicense();
            setLicense(licenseData);
            break;
          case 'usage':
            const usageData = await profileAPI.getUsage();
            setUsage(usageData);
            break;
          case 'email-aliases':
            const aliases = await profileAPI.getEmailAliases();
            setEmailAliases(Array.isArray(aliases) ? aliases : aliases?.aliases || []);
            break;
          case 'products':
            const prods = await profileAPI.getProducts();
            setProducts(Array.isArray(prods) ? prods : prods?.products || []);
            break;
          case 'orders':
            const ords = await profileAPI.getOrders();
            setOrders(Array.isArray(ords) ? ords : ords?.orders || []);
            break;
          case 'invoices':
            const invs = await profileAPI.getInvoices();
            setInvoices(Array.isArray(invs) ? invs : invs?.invoices || []);
            break;
          case 'payments':
            const pmts = await profileAPI.getPaymentMethods();
            setPaymentMethods(Array.isArray(pmts) ? pmts : pmts?.payment_methods || []);
            break;
          case 'subscriptions':
            const subs = await profileAPI.getSubscriptions();
            setSubscriptions(Array.isArray(subs) ? subs : subs?.subscriptions || []);
            break;
          case 'tickets':
            const tix = await profileAPI.getTickets();
            setTickets(Array.isArray(tix) ? tix : tix?.tickets || []);
            break;
        }
      } catch (error) {
        console.log('[PROFILE] Failed to fetch tab data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (activeTab !== 'profile' && activeTab !== 'settings') {
      fetchTabData();
    }
  }, [activeTab, messageStatusFilter]);

  // Auto-sync profile when screen is focused
  useFocusEffect(
    useCallback(() => {
      let mounted = true;
      (async () => {
        try {
          const res = await authAPI.getProfile();
          const freshUser = res?.user ?? res;
          if (mounted && freshUser) updateUser(freshUser);
          try {
            const s = await profileAPI.getStats();
            if (mounted && s) {
              const orders = (s?.orders_count ?? s?.orders ?? 0) as number;
              const invoices = (s?.invoices_count ?? s?.invoices ?? 0) as number;
              const tickets = (s?.tickets_count ?? s?.tickets ?? 0) as number;
              setStats({ orders, invoices, tickets });
            }
          } catch (_) {}
          // Fetch roles for role badge colors
          try {
            const rolesData = await crmAPI.getRoles({ page: 1, page_size: 100 });
            if (mounted && rolesData) {
              const rolesList = Array.isArray(rolesData) ? rolesData : (rolesData?.data?.items || rolesData?.items || []);
              setRoles(rolesList);
              console.log('[PROFILE] Loaded roles:', JSON.stringify(rolesList, null, 2));
            }
          } catch (error) {
            console.error('[PROFILE] Failed to fetch roles:', error);
          }
          // Refetch messages when screen is focused if on messages tab
          if (mounted && activeTab === 'messages') {
            try {
              console.log('[PROFILE] Refetching messages on focus');
              const msgs = await crmAPI.getMyMessages({ status_filter: messageStatusFilter || undefined });
              const messagesList = Array.isArray(msgs) ? msgs : msgs?.items || [];
              setMessages(messagesList);
            } catch (error) {
              console.error('[PROFILE] Failed to refetch messages on focus:', error);
            }
          }
        } catch (e) {
          // Endpoint might be unavailable; ignore quietly
        }
      })();
      return () => { mounted = false; };
    }, [updateUser, activeTab, messageStatusFilter])
  );

  // Background polling for unread messages count (always running)
  useEffect(() => {
    const pollUnreadCount = setInterval(async () => {
      try {
        console.log('[PROFILE] Background polling for unread messages');
        const msgs = await crmAPI.getMyMessages({ status_filter: 'unread', page: 1, page_size: 100 });
        const unreadList = Array.isArray(msgs) ? msgs : msgs?.items || [];
        
        // Update messages state if we're on messages tab, otherwise just keep the count updated
        if (activeTab === 'messages') {
          const allMsgs = await crmAPI.getMyMessages({ status_filter: messageStatusFilter || undefined });
          const messagesList = Array.isArray(allMsgs) ? allMsgs : allMsgs?.items || [];
          setMessages(messagesList);
        } else {
          // Just update the messages state with unread count for badge
          setMessages(prev => {
            // Merge unread messages with existing messages, avoiding duplicates
            const existingIds = new Set(prev.map(m => m.id));
            const newUnread = unreadList.filter(m => !existingIds.has(m.id));
            return [...prev.filter(m => m.status === 'unread'), ...newUnread];
          });
        }
      } catch (error: any) {
        // Silently handle 401 errors (user not authenticated for this feature)
        if (error?.response?.status !== 401) {
          console.error('[PROFILE] Failed to poll unread messages:', error);
        }
      }
    }, 10000); // Poll every 10 seconds

    return () => clearInterval(pollUnreadCount);
  }, [activeTab, messageStatusFilter]);

  // Real-time polling for messages when on messages tab
  useEffect(() => {
    if (activeTab !== 'messages') return;
    
    const pollInterval = setInterval(async () => {
      try {
        console.log('[PROFILE] Polling messages for real-time sync');
        const msgs = await crmAPI.getMyMessages({ status_filter: messageStatusFilter || undefined });
        const messagesList = Array.isArray(msgs) ? msgs : msgs?.items || [];
        setMessages(messagesList);
      } catch (error) {
        console.error('[PROFILE] Failed to poll messages:', error);
      }
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(pollInterval);
  }, [activeTab, messageStatusFilter]);

  // Load preferences from backend on mount
  // TEMPORARILY DISABLED FOR DEBUGGING
  /*
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        console.log('[PROFILE] Loading preferences from backend');
        const prefs = await profileAPI.getPreferences();
        
        // Load appearance settings
        if (prefs.primary_color) {
          console.log('[PROFILE] Loaded primary color:', prefs.primary_color);
          setPrimaryColorGlobal(prefs.primary_color);
        }
        if (prefs.font_h1) setFontH1(prefs.font_h1);
        if (prefs.font_h2) setFontH2(prefs.font_h2);
        if (prefs.font_h3) setFontH3(prefs.font_h3);
        if (prefs.font_h4) setFontH4(prefs.font_h4);
        if (prefs.font_body) setFontBody(prefs.font_body);
        
        hasLoadedPreferences.current = true;
        
        // Load notification settings
        if (prefs.email_notifications !== undefined) setEmailNotifications(prefs.email_notifications);
        if (prefs.push_notifications !== undefined) setPushNotifications(prefs.push_notifications);
        if (prefs.marketing_emails !== undefined) setMarketingNotifications(prefs.marketing_emails);
        
        // Load language settings
        if (prefs.language) setLanguage(prefs.language);
        if (prefs.timezone) setTimezone(prefs.timezone);
        if (prefs.date_format) setDateFormat(prefs.date_format);
        if (prefs.time_format) setTimeFormat(prefs.time_format);
        
        // Load privacy settings
        if (prefs.profile_visibility) setProfileVisibility(prefs.profile_visibility);
        if (prefs.activity_visibility) setActivityVisibility(prefs.activity_visibility);
        if (prefs.analytics_enabled !== undefined) setCookieAnalytics(prefs.analytics_enabled);
        
        // Load accessibility settings
        if (prefs.font_size) setTextSize(prefs.font_size);
        if (prefs.high_contrast !== undefined) setHighContrast(prefs.high_contrast);
        if (prefs.reduce_motion !== undefined) setReduceMotion(prefs.reduce_motion);
        if (prefs.screen_reader !== undefined) setScreenReader(prefs.screen_reader);
      } catch (error) {
        console.error('[PROFILE] Failed to load preferences:', error);
      }
    };
    
    if (user) {
      loadPreferences();
    }
  }, [user]);
  */

  // Auto-save primary color and fonts when they change (instant save)
  useEffect(() => {
    if (!user || !hasLoadedPreferences.current) {
      return;
    }

    // Mark that we're changing color locally
    lastColorChangeRef.current = Date.now();

    const timeoutId = setTimeout(async () => {
      try {
        console.log('[PROFILE] Saving appearance settings:', { primary_color: localPrimaryColor });
        await profileAPI.updatePreferences({
          primary_color: localPrimaryColor,
          font_h1: fontH1,
          font_h2: fontH2,
          font_h3: fontH3,
          font_h4: fontH4,
          font_body: fontBody,
        });
        console.log('[PROFILE] Appearance settings saved successfully');
        // Apply to global store immediately after save
        setPrimaryColorGlobal(localPrimaryColor);
      } catch (error) {
        console.error('[PROFILE] Failed to save appearance settings:', error);
      }
    }, 50);

    return () => clearTimeout(timeoutId);
  }, [localPrimaryColor, fontH1, fontH2, fontH3, fontH4, fontBody, user]);

  // Poll for preferences changes every 2 seconds to sync from web/other devices instantly
  useEffect(() => {
    const pollInterval = setInterval(async () => {
      try {
        // Don't override if user changed color in the last 3 seconds
        const timeSinceLastChange = Date.now() - lastColorChangeRef.current;
        if (timeSinceLastChange < 3000) {
          console.log('[PROFILE] Skipping poll - recent local color change');
          return;
        }

        const prefs = await profileAPI.getPreferences();
        const currentPrimaryColor = useThemeStore.getState().primaryColor;
        
        if (prefs.primary_color && prefs.primary_color !== currentPrimaryColor && prefs.primary_color !== localPrimaryColor) {
          console.log('[PROFILE] Detected primary color change from another device:', prefs.primary_color, 'current:', currentPrimaryColor);
          setPrimaryColorGlobal(prefs.primary_color);
          setLocalPrimaryColor(prefs.primary_color);
        }
      } catch (error: any) {
        // Silently handle errors to avoid console spam
        if (error?.response?.status !== 401) {
          console.error('[PROFILE] Failed to poll preferences:', error);
        }
      }
    }, 2000);

    return () => clearInterval(pollInterval);
  }, [localPrimaryColor]);

  // Auto-save billing information when changed (instant save to database)
  useEffect(() => {
    // Skip if not editing or initial mount
    if (!isEditing || !user) return;

    const timeoutId = setTimeout(async () => {
      try {
        console.log('[PROFILE] Auto-saving billing information:', editData);
        await authAPI.updateProfile({
          address: editData.address,
          city: editData.city,
          country: editData.country,
          zip_code: editData.zip_code,
        });
        console.log('[PROFILE] Billing information saved successfully');
      } catch (error) {
        console.error('[PROFILE] Failed to save billing information:', error);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [editData.address, editData.city, editData.country, editData.zip_code, isEditing, user]);

  // Handle country change - updates available cities
  const handleCountryChange = (selectedCountry: string) => {
    console.log('[PROFILE] Country changed to:', selectedCountry);
    setEditData({
      ...editData,
      country: selectedCountry,
      city: '', // Reset city when country changes
    });
    
    // Update available cities based on selected country
    const cities = COUNTRY_CITIES[selectedCountry] || [];
    setAvailableCities(cities);
    console.log('[PROFILE] Available cities for', selectedCountry, ':', cities.length);
  };

  // Initialize available cities when country is set
  useEffect(() => {
    if (editData.country && COUNTRY_CITIES[editData.country]) {
      setAvailableCities(COUNTRY_CITIES[editData.country]);
    }
  }, [editData.country]);
  
  // Fetch 2FA status and sessions on mount
  useEffect(() => {
    const fetchSecurityData = async () => {
      try {
        const status = await securityAPI.get2FAStatus();
        setTwoFactorEnabled(status?.enabled || false);
      } catch (error) {
        console.error('[PROFILE] Failed to fetch 2FA status:', error);
      }
    };
    
    if (user) {
      fetchSecurityData();
    }
  }, [user]);
  
  // 2FA handlers
  const handleEnable2FA = async () => {
    try {
      setTwoFactorLoading(true);
      setTwoFactorError(null);
      console.log('[2FA] Calling enable2FA API...');
      const response = await securityAPI.enable2FA();
      console.log('[2FA] API response received:', response ? 'Success' : 'No response');
      if (!response) {
        throw new Error('No response from server');
      }
      if (!response.qr_code || !response.secret) {
        console.error('[2FA] Invalid response structure:', response);
        throw new Error('Invalid response from server');
      }
      setQrCode(response.qr_code);
      setSecret(response.secret);
      setShow2FASetup(true);
      console.log('[2FA] Setup modal should now be visible');
    } catch (error: any) {
      console.error('[2FA] Enable error:', error);
      console.error('[2FA] Error response:', error?.response);
      console.error('[2FA] Error data:', error?.response?.data);
      const errorMsg = error?.response?.data?.detail || error?.message || 'Failed to enable 2FA';
      setTwoFactorError(errorMsg);
      Alert.alert('Error', `Failed to enable 2FA: ${errorMsg}`);
    } finally {
      setTwoFactorLoading(false);
    }
  };
  
  const handleVerify2FASetup = async () => {
    if (!twoFactorCode || twoFactorCode.length !== 6) {
      setTwoFactorError('Please enter a 6-digit code');
      return;
    }
    
    try {
      setTwoFactorLoading(true);
      setTwoFactorError(null);
      await securityAPI.verify2FASetup(twoFactorCode);
      setTwoFactorEnabled(true);
      setShow2FASetup(false);
      setTwoFactorCode('');
      Alert.alert('Success', 'Two-Factor Authentication enabled successfully!');
    } catch (error: any) {
      setTwoFactorError(error?.response?.data?.detail || 'Invalid code. Please try again.');
    } finally {
      setTwoFactorLoading(false);
    }
  };
  
  const handleDisable2FA = async () => {
    if (!twoFactorCode || twoFactorCode.length !== 6) {
      setTwoFactorError('Please enter a 6-digit code');
      return;
    }
    
    try {
      setTwoFactorLoading(true);
      setTwoFactorError(null);
      await securityAPI.disable2FA(twoFactorCode);
      setTwoFactorEnabled(false);
      setShow2FADisable(false);
      setTwoFactorCode('');
      Alert.alert('Success', 'Two-Factor Authentication disabled');
    } catch (error: any) {
      setTwoFactorError(error?.response?.data?.detail || 'Invalid code. Please try again.');
    } finally {
      setTwoFactorLoading(false);
    }
  };
  
  // Sessions handlers
  const handleViewSessions = async () => {
    try {
      setSessionsLoading(true);
      const sessionsData = await securityAPI.getSessions();
      setSessions(Array.isArray(sessionsData) ? sessionsData : sessionsData?.items || []);
      setShowSessions(true);
    } catch (error) {
      Alert.alert('Error', 'Failed to load sessions. Please try again.');
    } finally {
      setSessionsLoading(false);
    }
  };
  
  const handleRevokeSession = async (sessionId: string) => {
    Alert.alert(
      'Revoke Session',
      'Are you sure you want to revoke this session? The device will be logged out.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Revoke',
          style: 'destructive',
          onPress: async () => {
            try {
              await securityAPI.revokeSession(sessionId);
              // Refresh sessions list
              const sessionsData = await securityAPI.getSessions();
              setSessions(Array.isArray(sessionsData) ? sessionsData : sessionsData?.items || []);
              Alert.alert('Success', 'Session revoked successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to revoke session');
            }
          },
        },
      ]
    );
  };
  
  const handleRevokeAllSessions = async () => {
    Alert.alert(
      'Revoke All Sessions',
      'Are you sure you want to revoke all other sessions? All other devices will be logged out.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Revoke All',
          style: 'destructive',
          onPress: async () => {
            try {
              await securityAPI.revokeAllSessions();
              // Refresh sessions list
              const sessionsData = await securityAPI.getSessions();
              setSessions(Array.isArray(sessionsData) ? sessionsData : sessionsData?.items || []);
              Alert.alert('Success', 'All other sessions revoked successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to revoke sessions');
            }
          },
        },
      ]
    );
  };

  const handleLogout = async () => {
    // Reset primary color to default on logout
    setLocalPrimaryColor(defaultPrimaryColor);
    setPrimaryColorGlobal(defaultPrimaryColor);
    // Clear theme storage to ensure default color persists after logout
    await AsyncStorage.removeItem('theme-storage');
    await logout();
    Alert.alert('Success', 'Logged out');
  };

  const handleSaveProfile = async () => {
    try {
      const res = await authAPI.updateProfile(editData);
      const savedUser = res?.user ?? { ...user, ...editData };
      updateUser(savedUser);
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated');
    } catch (error: any) {
      console.error('[PROFILE] Save error:', error);
      Alert.alert('Error', error.message || 'Failed to update profile');
    }
  };

  const handleChangePassword = async () => {
    setPasswordError(null);
    setPasswordStatus('idle');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('Please complete all password fields.');
      setPasswordStatus('error');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirmation do not match.');
      setPasswordStatus('error');
      return;
    }
    try {
      setPasswordSaving(true);
      await authAPI.changePassword({ current_password: currentPassword, new_password: newPassword });
      setPasswordStatus('success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      Alert.alert('Success', 'Password changed');
    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      const message = typeof detail === 'string' ? detail : (err?.message || 'Failed to change password. Please try again.');
      setPasswordError(message);
      setPasswordStatus('error');
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleCreateTicket = async () => {
    setCreateTicketError(null);
    
    if (!ticketSubject.trim() || !ticketMessage.trim()) {
      setCreateTicketError('Please fill in both subject and message.');
      return;
    }

    if (ticketSubject.trim().length < 5) {
      setCreateTicketError('Subject must be at least 5 characters long.');
      return;
    }

    try {
      setCreatingTicket(true);
      await profileAPI.createTicket(ticketSubject, ticketMessage, ticketPriority);
      Alert.alert('Success', 'Ticket created successfully');
      setShowCreateTicket(false);
      setTicketSubject('');
      setTicketMessage('');
      setTicketPriority('medium');
      
      // Refresh tickets list
      const tix = await profileAPI.getTickets();
      setTickets(Array.isArray(tix) ? tix : tix?.tickets || []);
    } catch (err: any) {
      const message = err?.response?.data?.detail || err?.message || 'Failed to create ticket';
      setCreateTicketError(message);
      Alert.alert('Error', message);
    } finally {
      setCreatingTicket(false);
    }
  };

  if (!user) return null;

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <View style={styles.tabContent}>
            <View style={styles.profileEditHeader}>
              <Text style={[styles.tabTitle, { color: colors.textPrimary }]}>Profile Information</Text>
              <Pressable onPress={() => setIsEditing(!isEditing)}>
                <Ionicons name={isEditing ? "close" : "pencil"} size={20} color={colors.accent} />
              </Pressable>
            </View>

            {isEditing ? (
              <>
                <EditableField 
                  label="Full Name" 
                  value={editData.full_name} 
                  onChangeText={(text) => setEditData({...editData, full_name: text})}
                />
                <EditableField 
                  label="Phone" 
                  value={editData.phone_number} 
                  onChangeText={(text) => setEditData({...editData, phone_number: text})}
                />
              </>
            ) : (
              <>
                <InfoRow label="Username" value={user.username} />
                <InfoRow label="Email" value={user.email} />
                <InfoRow label="Full Name" value={editData.full_name || 'Not set'} />
                <InfoRow label="Phone" value={editData.phone_number || 'Not set'} />
              </>
            )}

            <View style={[styles.sectionDivider, { borderTopColor: colors.border, marginTop: 24, paddingTop: 24 }]}>
                <Text style={[styles.subSectionTitle, { color: colors.textPrimary, fontSize: 18, marginBottom: 16 }]}>Billing Information</Text>
              
                {isEditing ? (
                  <>
                    <EditableField 
                      label="Address" 
                      value={editData.address} 
                      onChangeText={(text) => setEditData({...editData, address: text})}
                    />
                    
                    <View style={{ marginBottom: 12 }}>
                      <Text style={[styles.label, { color: colors.textSecondary }]}>Country</Text>
                      <View style={[styles.pickerWrapper, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                      <Picker
                        selectedValue={editData.country}
                        onValueChange={(value) => handleCountryChange(value)}
                        style={{ flex: 1, height: Platform.OS === 'ios' ? 180 : 50 }}
                        itemStyle={{ height: 120, color: '#000000', fontSize: 20 }}
                      >
                        <Picker.Item label="Select Country" value="" color="#666666" />
                        {COUNTRIES.map((country) => (
                          <Picker.Item key={country} label={country} value={country} color="#000000" />
                        ))}
                      </Picker>
                      </View>
                    </View>

                    {editData.country && availableCities.length > 0 && (
                      <View style={{ marginBottom: 12 }}>
                      <Text style={[styles.label, { color: colors.textSecondary }]}>City</Text>
                      <View style={[styles.pickerWrapper, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <Picker
                          selectedValue={editData.city}
                          onValueChange={(value) => setEditData({...editData, city: value})}
                          style={{ flex: 1, height: Platform.OS === 'ios' ? 180 : 50 }}
                          itemStyle={{ height: 120, color: '#000000', fontSize: 20 }}
                        >
                          <Picker.Item label="Select City" value="" color="#666666" />
                          {availableCities.map((city) => (
                            <Picker.Item key={city} label={city} value={city} color="#000000" />
                          ))}
                        </Picker>
                        </View>
                      </View>
                    )}

                    {editData.country && availableCities.length === 0 && (
                      <EditableField 
                        label="City" 
                        value={editData.city} 
                        onChangeText={(text) => setEditData({...editData, city: text})}
                      />
                    )}

                    <EditableField 
                      label="Zip Code" 
                      value={editData.zip_code} 
                      onChangeText={(text) => setEditData({...editData, zip_code: text})}
                    />
                    <Pressable style={[styles.saveButton, { backgroundColor: colors.accent }]} onPress={handleSaveProfile}>
                      <Text style={[styles.saveButtonLabel, { color: colors.background }]}>Save Changes</Text>
                    </Pressable>
                  </>
                ) : (
                <>
                  <InfoRow label="Address" value={editData.address || 'Not set'} />
                  <InfoRow label="City" value={editData.city || 'Not set'} />
                  <InfoRow label="Country" value={editData.country || 'Not set'} />
                  <InfoRow label="Zip Code" value={editData.zip_code || 'Not set'} />
                </>
              )}
            </View>
          </View>
        );
      case 'messages':
        if (selectedMessage) {
          // Message Detail View
          return (
            <View style={styles.tabContent}>
              <View style={{ marginBottom: 16 }}>
                <Pressable
                  onPress={() => setSelectedMessage(null)}
                  style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}
                >
                  <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
                  <Text style={[{ marginLeft: 8, fontSize: 16, color: colors.textSecondary }]}>Back to Messages</Text>
                </Pressable>
                <Text style={[styles.tabTitle, { color: colors.textPrimary, fontSize: 20, marginBottom: 8 }]}>
                  {selectedMessage.subject}
                </Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 }}>
                  <View style={{
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    borderRadius: 12,
                    marginRight: 8,
                    backgroundColor: selectedMessage.priority === 'urgent' ? '#fee2e2' : 
                                     selectedMessage.priority === 'high' ? '#fed7aa' :
                                     selectedMessage.priority === 'medium' ? '#dbeafe' : '#f3f4f6'
                  }}>
                    <Text style={{
                      fontSize: 12,
                      fontWeight: '600',
                      textTransform: 'capitalize',
                      color: selectedMessage.priority === 'urgent' ? '#991b1b' :
                             selectedMessage.priority === 'high' ? '#9a3412' :
                             selectedMessage.priority === 'medium' ? '#1e40af' : '#374151'
                    }}>
                      {selectedMessage.priority}
                    </Text>
                  </View>
                  {selectedMessage.status === 'unread' && (
                    <View style={{ paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, backgroundColor: '#3b82f6' }}>
                      <Text style={{ fontSize: 12, fontWeight: '600', color: '#fff' }}>Unread</Text>
                    </View>
                  )}
                  {selectedMessage.status === 'archived' && (
                    <View style={{ paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, backgroundColor: '#6b7280' }}>
                      <Text style={{ fontSize: 12, fontWeight: '600', color: '#fff' }}>Archived</Text>
                    </View>
                  )}
                </View>
                <View style={{ marginBottom: 12 }}>
                  <Text style={[{ fontSize: 12, color: colors.textSecondary, marginBottom: 4 }]}>
                    <Text style={{ fontWeight: '600' }}>From:</Text> {selectedMessage.sender_name} ({selectedMessage.sender_email})
                  </Text>
                  <Text style={[{ fontSize: 12, color: colors.textSecondary }]}>
                    <Text style={{ fontWeight: '600' }}>Date:</Text> {new Date(selectedMessage.created_at).toLocaleString()}
                  </Text>
                </View>
              </View>
              <ScrollView style={{ maxHeight: 400, marginBottom: 16 }}>
                <RenderHtml
                  contentWidth={Dimensions.get('window').width - 64}
                  source={{ html: selectedMessage.content }}
                  baseStyle={{
                    fontSize: 14,
                    color: colors.textPrimary,
                    lineHeight: 22,
                  }}
                  tagsStyles={{
                    p: { marginTop: 0, marginBottom: 12, color: colors.textPrimary },
                    strong: { fontWeight: '700', color: colors.textPrimary },
                    b: { fontWeight: '700', color: colors.textPrimary },
                    em: { fontStyle: 'italic', color: colors.textPrimary },
                    i: { fontStyle: 'italic', color: colors.textPrimary },
                    u: { textDecorationLine: 'underline', color: colors.textPrimary },
                    a: { color: colors.accent, textDecorationLine: 'underline' },
                    h1: { fontSize: 24, fontWeight: '700', marginTop: 16, marginBottom: 12, color: colors.textPrimary },
                    h2: { fontSize: 20, fontWeight: '700', marginTop: 14, marginBottom: 10, color: colors.textPrimary },
                    h3: { fontSize: 18, fontWeight: '600', marginTop: 12, marginBottom: 8, color: colors.textPrimary },
                    h4: { fontSize: 16, fontWeight: '600', marginTop: 10, marginBottom: 8, color: colors.textPrimary },
                    ul: { marginTop: 8, marginBottom: 8, color: colors.textPrimary },
                    ol: { marginTop: 8, marginBottom: 8, color: colors.textPrimary },
                    li: { marginBottom: 4, color: colors.textPrimary },
                    blockquote: { 
                      borderLeftWidth: 4, 
                      borderLeftColor: colors.border, 
                      paddingLeft: 12, 
                      marginTop: 8, 
                      marginBottom: 8,
                      fontStyle: 'italic',
                      color: colors.textSecondary
                    },
                    code: { 
                      fontFamily: 'monospace', 
                      backgroundColor: colors.surface, 
                      paddingHorizontal: 4,
                      paddingVertical: 2,
                      borderRadius: 4,
                      color: colors.textPrimary
                    },
                    pre: { 
                      backgroundColor: colors.surface, 
                      padding: 12, 
                      borderRadius: 8,
                      marginTop: 8,
                      marginBottom: 8,
                      color: colors.textPrimary
                    },
                  }}
                />
              </ScrollView>
              {selectedMessage.status === 'archived' ? (
                <Pressable
                  onPress={async () => {
                    try {
                      await crmAPI.updateMessageStatus(selectedMessage.id, 'read');
                      Alert.alert('Success', 'Message unarchived successfully');
                      setSelectedMessage(null);
                      // Refetch messages
                      const msgs = await crmAPI.getMyMessages({ status_filter: messageStatusFilter || undefined });
                      setMessages(Array.isArray(msgs) ? msgs : msgs?.items || []);
                    } catch (error) {
                      Alert.alert('Error', 'Failed to unarchive message');
                    }
                  }}
                  style={({ pressed }) => [
                    {
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      paddingHorizontal: 20,
                      paddingVertical: 12,
                      borderRadius: 12,
                      backgroundColor: pressed ? '#0c4a6e' : '#0ea5e9',
                    }
                  ]}
                >
                  <Ionicons name="archive-outline" size={20} color="#fff" />
                  <Text style={{ color: '#fff', fontWeight: '600', fontSize: 16 }}>Unarchive</Text>
                </Pressable>
              ) : (
                <Pressable
                  onPress={async () => {
                    try {
                      await crmAPI.updateMessageStatus(selectedMessage.id, 'archived');
                      Alert.alert('Success', 'Message archived successfully');
                      setSelectedMessage(null);
                      // Refetch messages
                      const msgs = await crmAPI.getMyMessages({ status_filter: messageStatusFilter || undefined });
                      setMessages(Array.isArray(msgs) ? msgs : msgs?.items || []);
                    } catch (error) {
                      Alert.alert('Error', 'Failed to archive message');
                    }
                  }}
                  style={({ pressed }) => [
                    {
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      paddingHorizontal: 20,
                      paddingVertical: 12,
                      borderRadius: 12,
                      backgroundColor: pressed ? '#4b5563' : '#6b7280',
                    }
                  ]}
                >
                  <Ionicons name="archive-outline" size={20} color="#fff" />
                  <Text style={{ color: '#fff', fontWeight: '600', fontSize: 16 }}>Archive</Text>
                </Pressable>
              )}
            </View>
          );
        }
        // Messages List View
        return (
          <View style={styles.tabContent}>
            <>
              <Text style={[styles.tabTitle, { color: colors.textPrimary }]}>Messages</Text>
              <Text style={[styles.tabDescription, { color: colors.textSecondary, marginBottom: 12 }]}>
                View and manage your messages from administrators.
              </Text>
              
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={{ marginBottom: 16 }}
                contentContainerStyle={{ gap: 8, paddingHorizontal: 2 }}
              >
                <Pressable
                  onPress={() => setExpandedFilter(expandedFilter === 'status' ? null : 'status')}
                  style={[{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: 14,
                    paddingVertical: 10,
                    borderRadius: 20,
                    backgroundColor: messageStatusFilter ? colors.accent : colors.surface,
                    borderWidth: 1,
                    borderColor: messageStatusFilter ? colors.accent : colors.border,
                  }]}
                >
                  <Text style={{ color: messageStatusFilter ? '#fff' : colors.textPrimary, fontWeight: '600', fontSize: 13, marginRight: 4 }}>
                    Status: {messageStatusFilter ? messageStatusFilter.charAt(0).toUpperCase() + messageStatusFilter.slice(1) : 'All'}
                  </Text>
                  <Ionicons name={expandedFilter === 'status' ? 'chevron-up' : 'chevron-down'} size={16} color={messageStatusFilter ? '#fff' : colors.textSecondary} />
                </Pressable>

                <Pressable
                  onPress={() => setExpandedFilter(expandedFilter === 'priority' ? null : 'priority')}
                  style={[{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: 14,
                    paddingVertical: 10,
                    borderRadius: 20,
                    backgroundColor: messagePriorityFilter ? colors.accent : colors.surface,
                    borderWidth: 1,
                    borderColor: messagePriorityFilter ? colors.accent : colors.border,
                  }]}
                >
                  <Text style={{ color: messagePriorityFilter ? '#fff' : colors.textPrimary, fontWeight: '600', fontSize: 13, marginRight: 4 }}>
                    Priority: {messagePriorityFilter ? messagePriorityFilter.charAt(0).toUpperCase() + messagePriorityFilter.slice(1) : 'All'}
                  </Text>
                  <Ionicons name={expandedFilter === 'priority' ? 'chevron-up' : 'chevron-down'} size={16} color={messagePriorityFilter ? '#fff' : colors.textSecondary} />
                </Pressable>

                <Pressable
                  onPress={() => setExpandedFilter(expandedFilter === 'sender' ? null : 'sender')}
                  style={[{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: 14,
                    paddingVertical: 10,
                    borderRadius: 20,
                    backgroundColor: messageSenderFilter ? colors.accent : colors.surface,
                    borderWidth: 1,
                    borderColor: messageSenderFilter ? colors.accent : colors.border,
                  }]}
                >
                  <Text style={{ color: messageSenderFilter ? '#fff' : colors.textPrimary, fontWeight: '600', fontSize: 13, marginRight: 4 }}>
                    From: {messageSenderFilter || 'All'}
                  </Text>
                  <Ionicons name={expandedFilter === 'sender' ? 'chevron-up' : 'chevron-down'} size={16} color={messageSenderFilter ? '#fff' : colors.textSecondary} />
                </Pressable>

                <Pressable
                  onPress={() => setExpandedFilter(expandedFilter === 'date' ? null : 'date')}
                  style={[{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: 14,
                    paddingVertical: 10,
                    borderRadius: 20,
                    backgroundColor: (messageYearFilter || messageMonthFilter) ? colors.accent : colors.surface,
                    borderWidth: 1,
                    borderColor: (messageYearFilter || messageMonthFilter) ? colors.accent : colors.border,
                  }]}
                >
                  <Text style={{ color: (messageYearFilter || messageMonthFilter) ? '#fff' : colors.textPrimary, fontWeight: '600', fontSize: 13, marginRight: 4 }}>
                    Date: {messageMonthFilter ? new Date(2000, parseInt(messageMonthFilter) - 1).toLocaleString('default', { month: 'short' }) : ''}{messageMonthFilter && messageYearFilter ? ' ' : ''}{messageYearFilter || (!messageMonthFilter ? 'All' : '')}
                  </Text>
                  <Ionicons name={expandedFilter === 'date' ? 'chevron-up' : 'chevron-down'} size={16} color={(messageYearFilter || messageMonthFilter) ? '#fff' : colors.textSecondary} />
                </Pressable>
              </ScrollView>

              {/* Expanded Filter Options */}
              {expandedFilter === 'status' && (
                <View style={{ backgroundColor: colors.surface, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: colors.border, marginBottom: 12 }}>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      {['', 'unread', 'read', 'archived'].map((filter) => (
                        <Pressable
                          key={filter}
                          onPress={() => {
                            setMessageStatusFilter(filter);
                            setExpandedFilter(null);
                          }}
                          style={[{
                            paddingHorizontal: 16,
                            paddingVertical: 8,
                            borderRadius: 16,
                            backgroundColor: messageStatusFilter === filter ? colors.accent : colors.background,
                            borderWidth: 1,
                            borderColor: colors.border,
                          }]}
                        >
                          <Text style={{ color: messageStatusFilter === filter ? '#fff' : colors.textPrimary, fontWeight: '500', fontSize: 13, textTransform: 'capitalize' }}>
                            {filter || 'All'}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  </ScrollView>
                </View>
              )}

              {expandedFilter === 'priority' && (
                <View style={{ backgroundColor: colors.surface, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: colors.border, marginBottom: 12 }}>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      {['', 'low', 'medium', 'high', 'urgent'].map((filter) => (
                        <Pressable
                          key={filter}
                          onPress={() => {
                            setMessagePriorityFilter(filter);
                            setExpandedFilter(null);
                          }}
                          style={[{
                            paddingHorizontal: 16,
                            paddingVertical: 8,
                            borderRadius: 16,
                            backgroundColor: messagePriorityFilter === filter ? colors.accent : colors.background,
                            borderWidth: 1,
                            borderColor: colors.border,
                          }]}
                        >
                          <Text style={{ color: messagePriorityFilter === filter ? '#fff' : colors.textPrimary, fontWeight: '500', fontSize: 13, textTransform: 'capitalize' }}>
                            {filter || 'All'}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  </ScrollView>
                </View>
              )}

              {expandedFilter === 'sender' && (
                <View style={{ backgroundColor: colors.surface, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: colors.border, marginBottom: 12 }}>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      {['', ...Array.from(new Set(messages.map(m => m.sender_name).filter(Boolean)))].map((filter) => (
                        <Pressable
                          key={filter}
                          onPress={() => {
                            setMessageSenderFilter(filter);
                            setExpandedFilter(null);
                          }}
                          style={[{
                            paddingHorizontal: 16,
                            paddingVertical: 8,
                            borderRadius: 16,
                            backgroundColor: messageSenderFilter === filter ? colors.accent : colors.background,
                            borderWidth: 1,
                            borderColor: colors.border,
                          }]}
                        >
                          <Text style={{ color: messageSenderFilter === filter ? '#fff' : colors.textPrimary, fontWeight: '500', fontSize: 13 }}>
                            {filter || 'All'}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  </ScrollView>
                </View>
              )}

              {expandedFilter === 'date' && (
                <View style={{ backgroundColor: colors.surface, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: colors.border, marginBottom: 12 }}>
                  <Text style={{ fontSize: 12, fontWeight: '600', color: colors.textSecondary, marginBottom: 8 }}>Year</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      {['', ...Array.from(new Set(messages.map(m => new Date(m.created_at).getFullYear().toString())))].map((filter) => (
                        <Pressable
                          key={filter}
                          onPress={() => setMessageYearFilter(filter)}
                          style={[{
                            paddingHorizontal: 16,
                            paddingVertical: 8,
                            borderRadius: 16,
                            backgroundColor: messageYearFilter === filter ? colors.accent : colors.background,
                            borderWidth: 1,
                            borderColor: colors.border,
                          }]}
                        >
                          <Text style={{ color: messageYearFilter === filter ? '#fff' : colors.textPrimary, fontWeight: '500', fontSize: 13 }}>
                            {filter || 'All'}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  </ScrollView>
                  
                  <Text style={{ fontSize: 12, fontWeight: '600', color: colors.textSecondary, marginBottom: 8 }}>Month</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      {['', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'].map((filter) => (
                        <Pressable
                          key={filter}
                          onPress={() => setMessageMonthFilter(filter)}
                          style={[{
                            paddingHorizontal: 16,
                            paddingVertical: 8,
                            borderRadius: 16,
                            backgroundColor: messageMonthFilter === filter ? colors.accent : colors.background,
                            borderWidth: 1,
                            borderColor: colors.border,
                          }]}
                        >
                          <Text style={{ color: messageMonthFilter === filter ? '#fff' : colors.textPrimary, fontWeight: '500', fontSize: 13 }}>
                            {filter ? new Date(2000, parseInt(filter) - 1).toLocaleString('default', { month: 'short' }) : 'All'}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  </ScrollView>
                </View>
              )}
              
            {loading ? (
              <ActivityIndicator size="small" color={colors.accent} style={{ marginTop: 20 }} />
            ) : messages.length === 0 ? (
              <View style={{ alignItems: 'center', paddingVertical: 32 }}>
                <Ionicons name="mail-outline" size={48} color={colors.textSecondary} style={{ opacity: 0.5, marginBottom: 12 }} />
                <Text style={[styles.emptyMessage, { color: colors.textSecondary }]}>No messages found</Text>
              </View>
            ) : (
              <ScrollView style={{ maxHeight: 500 }}>
                {messages
                  .filter((message: any) => {
                    // Apply sender filter
                    if (messageSenderFilter && message.sender_name !== messageSenderFilter) return false;
                    // Apply priority filter
                    if (messagePriorityFilter && message.priority !== messagePriorityFilter) return false;
                    // Apply year filter
                    if (messageYearFilter && new Date(message.created_at).getFullYear().toString() !== messageYearFilter) return false;
                    // Apply month filter
                    if (messageMonthFilter) {
                      const messageMonth = (new Date(message.created_at).getMonth() + 1).toString().padStart(2, '0');
                      if (messageMonth !== messageMonthFilter) return false;
                    }
                    return true;
                  })
                  .map((message: any) => (
                  <Pressable
                    key={message.id}
                    onPress={async () => {
                      // Mark as read if unread
                      if (message.status === 'unread') {
                        try {
                          await crmAPI.updateMessageStatus(message.id, 'read');
                          // Refresh messages list after marking as read
                          const msgs = await crmAPI.getMyMessages({ status_filter: messageStatusFilter || undefined });
                          const messagesList = Array.isArray(msgs) ? msgs : msgs?.items || [];
                          setMessages(messagesList);
                        } catch (error) {
                          console.log('Failed to mark as read:', error);
                        }
                      }
                      setSelectedMessage(message);
                    }}
                    style={({ pressed }) => [
                      {
                        padding: 16,
                        marginBottom: 12,
                        borderRadius: 12,
                        borderWidth: 1,
                        borderColor: message.status === 'unread' ? '#3b82f6' : colors.border,
                        backgroundColor: message.status === 'unread' 
                          ? (pressed ? '#dbeafe' : '#eff6ff')
                          : (pressed ? colors.border : colors.surface),
                      }
                    ]}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
                      <View style={{ flex: 1, marginRight: 12 }}>
                        <Text 
                          style={[{ 
                            fontSize: 16, 
                            fontWeight: message.status === 'unread' ? '700' : '600', 
                            color: colors.textPrimary 
                          }]} 
                          numberOfLines={1}
                        >
                          {message.subject}
                        </Text>
                      </View>
                      <View style={{ alignItems: 'flex-end' }}>
                        {message.status === 'unread' && (
                          <View style={{
                            paddingHorizontal: 8,
                            paddingVertical: 2,
                            borderRadius: 10,
                            backgroundColor: colors.accent,
                            marginBottom: 4
                          }}>
                            <Text style={{ fontSize: 10, fontWeight: '700', color: '#fff' }}>New</Text>
                          </View>
                        )}
                        <Text style={{ fontSize: 12, color: colors.textSecondary, textAlign: 'right' }}>
                          {new Date(message.created_at).toLocaleDateString()}
                        </Text>
                      </View>
                    </View>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' }}>
                      <View style={{
                        paddingHorizontal: 8,
                        paddingVertical: 2,
                        borderRadius: 10,
                        marginRight: 8,
                        backgroundColor: message.priority === 'urgent' ? '#fee2e2' :
                                       message.priority === 'high' ? '#fed7aa' :
                                       message.priority === 'medium' ? '#dbeafe' : '#f3f4f6'
                      }}>
                        <Text style={{
                          fontSize: 10,
                          fontWeight: '700',
                          textTransform: 'capitalize',
                          color: message.priority === 'urgent' ? '#991b1b' :
                                 message.priority === 'high' ? '#9a3412' :
                                 message.priority === 'medium' ? '#1e40af' : '#374151'
                        }}>
                          {message.priority}
                        </Text>
                      </View>
                      <Text style={{ fontSize: 12, color: colors.textSecondary }}>
                        From: {message.sender_name}
                      </Text>
                    </View>
                  </Pressable>
                ))}
              </ScrollView>
            )}
            </>
          </View>
        );
      case 'license':
        return (
          <View style={styles.tabContent}>
            <Text style={[styles.tabTitle, { color: colors.textPrimary }]}>License</Text>
            <Text style={[styles.tabDescription, { color: colors.textSecondary }]}>Manage your workspace license and subscription details.</Text>
            {loading ? (
              <ActivityIndicator size="small" color={colors.accent} style={{ marginTop: 20 }} />
            ) : license ? (
              <>
                <View style={[styles.licenseRow, { borderTopColor: colors.border }]}>
                  <Text style={[styles.licenseLabel, { color: colors.textSecondary }]}>License Type</Text>
                  <Text style={[styles.licenseValue, { color: colors.accent }]}>{license.plan_name || license.type || 'Professional'}</Text>
                </View>
                <View style={[styles.licenseRow, { borderTopColor: colors.border }]}>
                  <Text style={[styles.licenseLabel, { color: colors.textSecondary }]}>Status</Text>
                  <Text style={[styles.licenseValue, { color: colors.textPrimary }]}>{license.status || 'Active'}</Text>
                </View>
                {license.expires_at && (
                  <View style={[styles.licenseRow, { borderTopColor: colors.border }]}>
                    <Text style={[styles.licenseLabel, { color: colors.textSecondary }]}>Expires</Text>
                    <Text style={[styles.licenseValue, { color: colors.textPrimary }]}>{new Date(license.expires_at).toLocaleDateString()}</Text>
                  </View>
                )}
              </>
            ) : (
              <Text style={[styles.emptyMessage, { color: colors.textSecondary }]}>No license information available</Text>
            )}
          </View>
        );
      case 'usage':
        return (
          <View style={styles.tabContent}>
            <Text style={[styles.tabTitle, { color: colors.textPrimary }]}>Usage</Text>
            <Text style={[styles.tabDescription, { color: colors.textSecondary }]}>View your current usage statistics.</Text>
            {loading ? (
              <ActivityIndicator size="small" color={colors.accent} style={{ marginTop: 20 }} />
            ) : usage ? (
              <>
                <View style={[styles.usageRow, { borderTopColor: colors.border }]}>
                  <Text style={[styles.usageLabel, { color: colors.textSecondary }]}>Storage Used</Text>
                  <Text style={[styles.usageValue, { color: colors.textPrimary }]}>
                    {usage.storage_used_gb || usage.storage_used || '0'} GB / {usage.storage_quota_gb || usage.storage_quota || '100'} GB
                  </Text>
                </View>
                <View style={[styles.usageRow, { borderTopColor: colors.border }]}>
                  <Text style={[styles.usageLabel, { color: colors.textSecondary }]}>Users</Text>
                  <Text style={[styles.usageValue, { color: colors.textPrimary }]}>
                    {usage.users_count || usage.users || '0'} / {usage.users_quota || usage.users_limit || '10'}
                  </Text>
                </View>
              </>
            ) : (
              <Text style={[styles.emptyMessage, { color: colors.textSecondary }]}>No usage data available</Text>
            )}
          </View>
        );
      case 'email-aliases':
        return (
          <View style={styles.tabContent}>
            <Text style={[styles.tabTitle, { color: colors.textPrimary }]}>Email Aliases</Text>
            <Text style={[styles.tabDescription, { color: colors.textSecondary }]}>Manage email aliases for your CitriCloud workspace.</Text>
            {loading ? (
              <ActivityIndicator size="small" color={colors.accent} style={{ marginTop: 20 }} />
            ) : emailAliases.length > 0 ? (
              <>
                {emailAliases.map((alias: any, idx: number) => (
                  <View key={alias.id || idx} style={[styles.aliasCard, { borderColor: colors.border }]}>
                    <View style={styles.aliasHeader}>
                      <View style={styles.aliasLeft}>
                        <Ionicons name="mail-outline" size={18} color={colors.accent} />
                        <Text style={[styles.aliasEmail, { color: colors.textPrimary }]}>{alias.alias || alias.email}</Text>
                      </View>
                      <View style={[styles.aliasBadge, { backgroundColor: alias.active ? colors.accent + '20' : colors.muted + '20' }]}>
                        <Text style={[styles.aliasBadgeText, { color: alias.active ? colors.accent : colors.muted }]}>
                          {alias.active ? 'Active' : 'Inactive'}
                        </Text>
                      </View>
                    </View>
                    {alias.forwarded_to && (
                      <View style={styles.aliasForward}>
                        <Ionicons name="arrow-forward-outline" size={14} color={colors.textSecondary} />
                        <Text style={[styles.aliasForwardText, { color: colors.textSecondary }]}>
                          Forwards to: {alias.forwarded_to || alias.forward_to}
                        </Text>
                      </View>
                    )}
                    {alias.created_at && (
                      <Text style={[styles.aliasDate, { color: colors.muted }]}>
                        {new Date(alias.created_at).toLocaleDateString()}
                      </Text>
                    )}
                  </View>
                ))}
              </>
            ) : (
              <Text style={[styles.emptyMessage, { color: colors.textSecondary }]}>No email aliases found</Text>
            )}

            <View style={[styles.sectionDivider, { borderTopColor: colors.border }]} />
            <Text style={[styles.subSectionTitle, { color: colors.textPrimary }]}>Security</Text>
            {!!passwordError && (
              <Text style={[styles.errorText, { color: colors.danger }]}>{passwordError}</Text>
            )}
            {passwordSuccess && (
              <Text style={[styles.successText, { color: colors.accent }]}>Password updated successfully</Text>
            )}
            <EditableField 
              label="Current Password"
              value={currentPassword}
              onChangeText={setCurrentPassword}
              secureTextEntry
            />
            <EditableField 
              label="New Password"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
            />
            <EditableField 
              label="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />
            <Pressable 
              style={[styles.saveButton, { backgroundColor: colors.accent, opacity: passwordSaving ? 0.7 : 1 }]}
              onPress={handleChangePassword}
              disabled={passwordSaving}
            >
              {passwordSaving ? (
                <ActivityIndicator size="small" color={colors.background} />
              ) : (
                <Text style={[styles.saveButtonLabel, { color: colors.background }]}>Change Password</Text>
              )}
            </Pressable>
          </View>
        );
      case 'settings':
        return (
          <View style={styles.tabContent}>
            <Text style={[styles.tabTitle, { color: colors.textPrimary }]}>Settings</Text>
            <SettingsTabs activeTab={settingsActive} onTabChange={setSettingsActive} />

            {settingsActive === 'appearance' && (
              <View>
                <>
                  <Text style={[styles.tabDescription, { color: colors.textSecondary }]}>Customize how CITRICLOUD looks on your device</Text>
                  <Text style={[styles.subSectionTitle, { color: colors.textPrimary }]}>Theme Mode</Text>
                  <View style={styles.themeGrid}>
                  <Pressable
                    onPress={() => useThemeStore.getState().setMode('light')}
                    style={[styles.themeOption, { 
                      borderColor: useThemeStore.getState().mode === 'light' ? colors.accent : colors.border,
                      backgroundColor: useThemeStore.getState().mode === 'light' ? colors.accent + '10' : 'transparent'
                    }]}
                  >
                    <Ionicons name="sunny" size={24} color={colors.textPrimary} />
                    <Text style={[styles.themeLabel, { color: colors.textPrimary }]}>Light</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => useThemeStore.getState().setMode('dark')}
                    style={[styles.themeOption, { 
                      borderColor: useThemeStore.getState().mode === 'dark' ? colors.accent : colors.border,
                      backgroundColor: useThemeStore.getState().mode === 'dark' ? colors.accent + '10' : 'transparent'
                    }]}
                  >
                    <Ionicons name="moon" size={24} color={colors.textPrimary} />
                    <Text style={[styles.themeLabel, { color: colors.textPrimary }]}>Dark</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => useThemeStore.getState().setMode('auto')}
                    style={[styles.themeOption, { 
                      borderColor: useThemeStore.getState().mode === 'auto' ? colors.accent : colors.border,
                      backgroundColor: useThemeStore.getState().mode === 'auto' ? colors.accent + '10' : 'transparent'
                    }]}
                  >
                    <Ionicons name="contrast" size={24} color={colors.textPrimary} />
                    <Text style={[styles.themeLabel, { color: colors.textPrimary }]}>Auto</Text>
                  </Pressable>
                </View>

                <Text style={[styles.subSectionTitle, { color: colors.textPrimary, marginTop: 20 }]}>Primary Color</Text>
                <Text style={[styles.tabDescription, { color: colors.textSecondary, marginBottom: 12 }]}>Choose your brand color</Text>

                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ gap: 12, paddingHorizontal: 2, paddingVertical: 4 }}
                  style={{ marginBottom: 16 }}
                >
                  {[
                    { name: 'Violet', color: '#8b5cf6' },
                    { name: 'Blue', color: '#3b82f6' },
                    { name: 'Cyan', color: '#06b6d4' },
                    { name: 'Teal', color: '#14b8a6' },
                    { name: 'Green', color: '#10b981' },
                    { name: 'Lime', color: '#84cc16' },
                    { name: 'Yellow', color: '#eab308' },
                    { name: 'Orange', color: '#f97316' },
                    { name: 'Red', color: '#ef4444' },
                    { name: 'Pink', color: '#ec4899' },
                    { name: 'Rose', color: '#f43f5e' },
                    { name: 'Indigo', color: '#6366f1' },
                    { name: 'Purple', color: '#a855f7' },
                    { name: 'Fuchsia', color: '#d946ef' },
                    { name: 'Amber', color: '#f59e0b' },
                    { name: 'Emerald', color: '#059669' },
                  ].map((colorOption) => (
                    <TouchableOpacity
                      key={colorOption.color}
                      activeOpacity={0.7}
                      onPress={() => {
                        setLocalPrimaryColor(colorOption.color);
                        useThemeStore.getState().setPrimaryColor(colorOption.color);
                      }}
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 12,
                        backgroundColor: colorOption.color,
                        borderWidth: localPrimaryColor === colorOption.color ? 3 : 0,
                        borderColor: colors.textPrimary,
                      }}
                    />
                  ))}
                </ScrollView>

                <View style={{ padding: 16, borderRadius: 12, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, marginBottom: 12 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <Text style={[{ fontSize: 14, fontWeight: '600', color: colors.textPrimary }]}>Preview</Text>
                    <Text style={[{ fontSize: 12, color: colors.textSecondary }]}>{localPrimaryColor}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <View style={{ flex: 1, padding: 12, borderRadius: 8, backgroundColor: localPrimaryColor, alignItems: 'center' }}>
                      <Text style={{ color: 'white', fontWeight: '600' }}>Primary</Text>
                    </View>
                    <View style={{ flex: 1, padding: 12, borderRadius: 8, backgroundColor: localPrimaryColor + '15', borderWidth: 1, borderColor: localPrimaryColor, alignItems: 'center' }}>
                      <Text style={{ color: localPrimaryColor, fontWeight: '600' }}>Secondary</Text>
                    </View>
                  </View>
                </View>

                <Pressable
                  onPress={() => {
                    setLocalPrimaryColor(defaultPrimaryColor);
                    setPrimaryColorGlobal(defaultPrimaryColor);
                  }}
                  style={[{ padding: 12, borderRadius: 8, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, alignItems: 'center' }]}
                >
                  <Text style={[{ color: colors.textPrimary, fontWeight: '600' }]}>Reset to Default</Text>
                </Pressable>

                <Text style={[styles.subSectionTitle, { color: colors.textPrimary, marginTop: 20 }]}>Typography</Text>
                <Text style={[styles.tabDescription, { color: colors.textSecondary, marginBottom: 12 }]}>Customize fonts for headings and body text</Text>
                
                <View style={{ gap: 12 }}>
                  <View>
                    <Text style={[{ fontSize: 12, color: colors.textSecondary, marginBottom: 6 }]}>Heading 1 (H1)</Text>
                    <View style={[{ borderWidth: 1, borderColor: colors.border, borderRadius: 8, backgroundColor: colors.surface }]}>
                      <Pressable
                        onPress={() => Alert.alert(
                          'Select H1 Font',
                          'Choose a font',
                          [
                            { text: 'System (Default)', onPress: () => setFontH1('System') },
                            { text: 'San Francisco', onPress: () => setFontH1('San Francisco') },
                            { text: 'Roboto', onPress: () => setFontH1('Roboto') },
                            { text: 'Helvetica', onPress: () => setFontH1('Helvetica') },
                            { text: 'Arial', onPress: () => setFontH1('Arial') },
                            { text: 'Georgia', onPress: () => setFontH1('Georgia') },
                            { text: 'Courier New', onPress: () => setFontH1('Courier New') },
                            { text: 'Cancel', style: 'cancel' }
                          ]
                        )}
                        style={{ padding: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
                      >
                        <Text style={[{ color: colors.textPrimary }]}>{fontH1}</Text>
                        <Ionicons name="chevron-down" size={20} color={colors.textSecondary} />
                      </Pressable>
                    </View>
                  </View>
                  <View>
                    <Text style={[{ fontSize: 12, color: colors.textSecondary, marginBottom: 6 }]}>Heading 2 (H2)</Text>
                    <View style={[{ borderWidth: 1, borderColor: colors.border, borderRadius: 8, backgroundColor: colors.surface }]}>
                      <Pressable
                        onPress={() => Alert.alert(
                          'Select H2 Font',
                          'Choose a font',
                          [
                            { text: 'System (Default)', onPress: () => setFontH2('System') },
                            { text: 'San Francisco', onPress: () => setFontH2('San Francisco') },
                            { text: 'Roboto', onPress: () => setFontH2('Roboto') },
                            { text: 'Helvetica', onPress: () => setFontH2('Helvetica') },
                            { text: 'Arial', onPress: () => setFontH2('Arial') },
                            { text: 'Georgia', onPress: () => setFontH2('Georgia') },
                            { text: 'Courier New', onPress: () => setFontH2('Courier New') },
                            { text: 'Cancel', style: 'cancel' }
                          ]
                        )}
                        style={{ padding: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
                      >
                        <Text style={[{ color: colors.textPrimary }]}>{fontH2}</Text>
                        <Ionicons name="chevron-down" size={20} color={colors.textSecondary} />
                      </Pressable>
                    </View>
                  </View>
                  <View>
                    <Text style={[{ fontSize: 12, color: colors.textSecondary, marginBottom: 6 }]}>Heading 3 (H3)</Text>
                    <View style={[{ borderWidth: 1, borderColor: colors.border, borderRadius: 8, backgroundColor: colors.surface }]}>
                      <Pressable
                        onPress={() => Alert.alert(
                          'Select H3 Font',
                          'Choose a font',
                          [
                            { text: 'System (Default)', onPress: () => setFontH3('System') },
                            { text: 'San Francisco', onPress: () => setFontH3('San Francisco') },
                            { text: 'Roboto', onPress: () => setFontH3('Roboto') },
                            { text: 'Helvetica', onPress: () => setFontH3('Helvetica') },
                            { text: 'Arial', onPress: () => setFontH3('Arial') },
                            { text: 'Georgia', onPress: () => setFontH3('Georgia') },
                            { text: 'Courier New', onPress: () => setFontH3('Courier New') },
                            { text: 'Cancel', style: 'cancel' }
                          ]
                        )}
                        style={{ padding: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
                      >
                        <Text style={[{ color: colors.textPrimary }]}>{fontH3}</Text>
                        <Ionicons name="chevron-down" size={20} color={colors.textSecondary} />
                      </Pressable>
                    </View>
                  </View>
                  <View>
                    <Text style={[{ fontSize: 12, color: colors.textSecondary, marginBottom: 6 }]}>Heading 4 (H4)</Text>
                    <View style={[{ borderWidth: 1, borderColor: colors.border, borderRadius: 8, backgroundColor: colors.surface }]}>
                      <Pressable
                        onPress={() => Alert.alert(
                          'Select H4 Font',
                          'Choose a font',
                          [
                            { text: 'System (Default)', onPress: () => setFontH4('System') },
                            { text: 'San Francisco', onPress: () => setFontH4('San Francisco') },
                            { text: 'Roboto', onPress: () => setFontH4('Roboto') },
                            { text: 'Helvetica', onPress: () => setFontH4('Helvetica') },
                            { text: 'Arial', onPress: () => setFontH4('Arial') },
                            { text: 'Georgia', onPress: () => setFontH4('Georgia') },
                            { text: 'Courier New', onPress: () => setFontH4('Courier New') },
                            { text: 'Cancel', style: 'cancel' }
                          ]
                        )}
                        style={{ padding: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
                      >
                        <Text style={[{ color: colors.textPrimary }]}>{fontH4}</Text>
                        <Ionicons name="chevron-down" size={20} color={colors.textSecondary} />
                      </Pressable>
                    </View>
                  </View>
                  <View>
                    <Text style={[{ fontSize: 12, color: colors.textSecondary, marginBottom: 6 }]}>Body Text</Text>
                    <View style={[{ borderWidth: 1, borderColor: colors.border, borderRadius: 8, backgroundColor: colors.surface }]}>
                      <Pressable
                        onPress={() => Alert.alert(
                          'Select Body Font',
                          'Choose a font',
                          [
                            { text: 'System (Default)', onPress: () => setFontBody('System') },
                            { text: 'San Francisco', onPress: () => setFontBody('San Francisco') },
                            { text: 'Roboto', onPress: () => setFontBody('Roboto') },
                            { text: 'Helvetica', onPress: () => setFontBody('Helvetica') },
                            { text: 'Arial', onPress: () => setFontBody('Arial') },
                            { text: 'Georgia', onPress: () => setFontBody('Georgia') },
                            { text: 'Courier New', onPress: () => setFontBody('Courier New') },
                            { text: 'Cancel', style: 'cancel' }
                          ]
                        )}
                        style={{ padding: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
                      >
                        <Text style={[{ color: colors.textPrimary }]}>{fontBody}</Text>
                        <Ionicons name="chevron-down" size={20} color={colors.textSecondary} />
                      </Pressable>
                    </View>
                  </View>
                </View>
                <Pressable
                  onPress={() => {
                    setFontH1(defaultFonts.h1);
                    setFontH2(defaultFonts.h2);
                    setFontH3(defaultFonts.h3);
                    setFontH4(defaultFonts.h4);
                    setFontBody(defaultFonts.body);
                  }}
                  style={[{ padding: 12, borderRadius: 8, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, alignItems: 'center', marginTop: 16 }]}
                >
                  <Text style={[{ color: colors.textPrimary, fontWeight: '600' }]}>Reset Fonts to Default</Text>
                </Pressable>

                <View style={{ padding: 16, borderRadius: 12, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, marginTop: 16, gap: 12 }}>
                  <View>
                    <Text style={[{ fontSize: 24, fontWeight: 'bold', color: colors.textPrimary }]}>Heading 1 Preview</Text>
                    <Text style={[{ fontSize: 11, color: colors.textSecondary }]}>{fontH1}</Text>
                  </View>
                  <View>
                    <Text style={[{ fontSize: 20, fontWeight: 'bold', color: colors.textPrimary }]}>Heading 2 Preview</Text>
                    <Text style={[{ fontSize: 11, color: colors.textSecondary }]}>{fontH2}</Text>
                  </View>
                  <View>
                    <Text style={[{ fontSize: 18, fontWeight: 'bold', color: colors.textPrimary }]}>Heading 3 Preview</Text>
                    <Text style={[{ fontSize: 11, color: colors.textSecondary }]}>{fontH3}</Text>
                  </View>
                  <View>
                    <Text style={[{ fontSize: 16, fontWeight: 'bold', color: colors.textPrimary }]}>Heading 4 Preview</Text>
                    <Text style={[{ fontSize: 11, color: colors.textSecondary }]}>{fontH4}</Text>
                  </View>
                  <View>
                    <Text style={[{ fontSize: 14, color: colors.textPrimary }]}>Body text preview: The quick brown fox jumps over the lazy dog.</Text>
                    <Text style={[{ fontSize: 11, color: colors.textSecondary }]}>{fontBody}</Text>
                  </View>
                </View>
                </>
              </View>
            )}

            {settingsActive === 'notifications' && (
              <View>
                <Text style={[styles.tabDescription, { color: colors.textSecondary }]}>Manage how you receive notifications</Text>
                
                <Text style={[styles.subSectionTitle, { color: colors.textPrimary }]}>Notification Channels</Text>
                <View style={[styles.checkboxRow, { borderTopColor: colors.border }]}>
                  <Pressable 
                    onPress={() => setEmailNotifications(!emailNotifications)}
                    style={styles.checkboxLeft}
                  >
                    <Ionicons 
                      name={emailNotifications ? 'checkbox' : 'square-outline'} 
                      size={24} 
                      color={emailNotifications ? colors.accent : colors.textSecondary} 
                    />
                    <View style={{ marginLeft: 12 }}>
                      <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>Email Notifications</Text>
                      <Text style={[styles.checkboxDesc, { color: colors.textSecondary }]}>Receive updates via email</Text>
                    </View>
                  </Pressable>
                </View>
                <View style={[styles.checkboxRow, { borderTopColor: colors.border }]}>
                  <Pressable 
                    onPress={() => setPushNotifications(!pushNotifications)}
                    style={styles.checkboxLeft}
                  >
                    <Ionicons 
                      name={pushNotifications ? 'checkbox' : 'square-outline'} 
                      size={24} 
                      color={pushNotifications ? colors.accent : colors.textSecondary} 
                    />
                    <View style={{ marginLeft: 12 }}>
                      <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>Push Notifications</Text>
                      <Text style={[styles.checkboxDesc, { color: colors.textSecondary }]}>Get alerts on your device</Text>
                    </View>
                  </Pressable>
                </View>
                <View style={[styles.checkboxRow, { borderTopColor: colors.border }]}>
                  <Pressable 
                    onPress={() => setMarketingNotifications(!marketingNotifications)}
                    style={styles.checkboxLeft}
                  >
                    <Ionicons 
                      name={marketingNotifications ? 'checkbox' : 'square-outline'} 
                      size={24} 
                      color={marketingNotifications ? colors.accent : colors.textSecondary} 
                    />
                    <View style={{ marginLeft: 12 }}>
                      <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>Marketing Communications</Text>
                      <Text style={[styles.checkboxDesc, { color: colors.textSecondary }]}>Receive product updates and offers</Text>
                    </View>
                  </Pressable>
                </View>

                <Text style={[styles.subSectionTitle, { color: colors.textPrimary, marginTop: 20 }]}>Notification Categories</Text>
                <View style={[styles.checkboxRow, { borderTopColor: colors.border }]}>
                  <Pressable 
                    onPress={() => setAccountActivityNotif(!accountActivityNotif)}
                    style={styles.checkboxLeft}
                  >
                    <Ionicons 
                      name={accountActivityNotif ? 'checkbox' : 'square-outline'} 
                      size={24} 
                      color={accountActivityNotif ? colors.accent : colors.textSecondary} 
                    />
                    <View style={{ marginLeft: 12 }}>
                      <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>Account Activity</Text>
                      <Text style={[styles.checkboxDesc, { color: colors.textSecondary }]}>Login, password changes</Text>
                    </View>
                  </Pressable>
                </View>
                <View style={[styles.checkboxRow, { borderTopColor: colors.border }]}>
                  <Pressable 
                    onPress={() => setMessagesNotif(!messagesNotif)}
                    style={styles.checkboxLeft}
                  >
                    <Ionicons 
                      name={messagesNotif ? 'checkbox' : 'square-outline'} 
                      size={24} 
                      color={messagesNotif ? colors.accent : colors.textSecondary} 
                    />
                    <View style={{ marginLeft: 12 }}>
                      <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>Messages</Text>
                      <Text style={[styles.checkboxDesc, { color: colors.textSecondary }]}>New messages and replies</Text>
                    </View>
                  </Pressable>
                </View>
                <View style={[styles.checkboxRow, { borderTopColor: colors.border }]}>
                  <Pressable 
                    onPress={() => setBillingNotif(!billingNotif)}
                    style={styles.checkboxLeft}
                  >
                    <Ionicons 
                      name={billingNotif ? 'checkbox' : 'square-outline'} 
                      size={24} 
                      color={billingNotif ? colors.accent : colors.textSecondary} 
                    />
                    <View style={{ marginLeft: 12 }}>
                      <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>Billing & Payments</Text>
                      <Text style={[styles.checkboxDesc, { color: colors.textSecondary }]}>Invoices, receipts, charges</Text>
                    </View>
                  </Pressable>
                </View>
                <View style={[styles.checkboxRow, { borderTopColor: colors.border }]}>
                  <Pressable 
                    onPress={() => setProductUpdatesNotif(!productUpdatesNotif)}
                    style={styles.checkboxLeft}
                  >
                    <Ionicons 
                      name={productUpdatesNotif ? 'checkbox' : 'square-outline'} 
                      size={24} 
                      color={productUpdatesNotif ? colors.accent : colors.textSecondary} 
                    />
                    <View style={{ marginLeft: 12 }}>
                      <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>Product Updates</Text>
                      <Text style={[styles.checkboxDesc, { color: colors.textSecondary }]}>New features and improvements</Text>
                    </View>
                  </Pressable>
                </View>
                <View style={[styles.checkboxRow, { borderTopColor: colors.border }]}>
                  <Pressable 
                    onPress={() => setMaintenanceNotif(!maintenanceNotif)}
                    style={styles.checkboxLeft}
                  >
                    <Ionicons 
                      name={maintenanceNotif ? 'checkbox' : 'square-outline'} 
                      size={24} 
                      color={maintenanceNotif ? colors.accent : colors.textSecondary} 
                    />
                    <View style={{ marginLeft: 12 }}>
                      <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>Maintenance & Downtime</Text>
                      <Text style={[styles.checkboxDesc, { color: colors.textSecondary }]}>Service interruptions</Text>
                    </View>
                  </Pressable>
                </View>

                <Text style={[styles.subSectionTitle, { color: colors.textPrimary, marginTop: 20 }]}>Do Not Disturb</Text>
                <View style={[styles.checkboxRow, { borderTopColor: colors.border }]}>
                  <Pressable 
                    onPress={() => setDndEnabled(!dndEnabled)}
                    style={styles.checkboxLeft}
                  >
                    <Ionicons 
                      name={dndEnabled ? 'checkbox' : 'square-outline'} 
                      size={24} 
                      color={dndEnabled ? colors.accent : colors.textSecondary} 
                    />
                    <View style={{ marginLeft: 12 }}>
                      <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>Enable Quiet Hours</Text>
                      <Text style={[styles.checkboxDesc, { color: colors.textSecondary }]}>Silence notifications during set hours</Text>
                    </View>
                  </Pressable>
                </View>
                {dndEnabled && (
                  <View style={{ paddingHorizontal: 12, marginTop: 8 }}>
                    <Text style={[styles.checkboxDesc, { color: colors.textSecondary }]}>From {dndStartTime} to {dndEndTime}</Text>
                  </View>
                )}
              </View>
            )}

            {settingsActive === 'language' && (
              <View>
                <Text style={[styles.tabDescription, { color: colors.textSecondary }]}>Set your language and regional preferences</Text>
                
                <Text style={[styles.subSectionTitle, { color: colors.textPrimary }]}>Display Language</Text>
                <Pressable 
                  onPress={() => Alert.alert(
                    'Select Language',
                    'Choose your preferred language',
                    [
                      { text: 'English', onPress: () => setLanguage('en') },
                      { text: 'Español', onPress: () => setLanguage('es') },
                      { text: 'Français', onPress: () => setLanguage('fr') },
                      { text: 'Deutsch', onPress: () => setLanguage('de') },
                      { text: 'Türkçe', onPress: () => setLanguage('tr') },
                      { text: 'Italiano', onPress: () => setLanguage('it') },
                      { text: 'Português', onPress: () => setLanguage('pt') },
                      { text: 'Русский', onPress: () => setLanguage('ru') },
                      { text: '中文', onPress: () => setLanguage('zh') },
                      { text: '日本語', onPress: () => setLanguage('ja') },
                      { text: 'العربية', onPress: () => setLanguage('ar') },
                      { text: 'Cancel', style: 'cancel' }
                    ]
                  )}
                  style={[styles.pickerContainer, { borderColor: colors.border, backgroundColor: colors.surface }]}
                >
                  <Ionicons name="language-outline" size={20} color={colors.textSecondary} style={{ marginRight: 8 }} />
                  <Text style={[styles.pickerValue, { color: colors.textPrimary }]}>
                    {language === 'en' ? 'English' : language === 'es' ? 'Español' : language === 'fr' ? 'Français' : language === 'de' ? 'Deutsch' : language === 'tr' ? 'Türkçe' : language === 'it' ? 'Italiano' : language === 'pt' ? 'Português' : language === 'ru' ? 'Русский' : language === 'zh' ? '中文' : language === 'ja' ? '日本語' : 'العربية'}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color={colors.textSecondary} />
                </Pressable>
                <Text style={[styles.helperText, { color: colors.textSecondary }]}>11 languages available</Text>

                <Text style={[styles.subSectionTitle, { color: colors.textPrimary, marginTop: 20 }]}>Timezone</Text>
                <Pressable 
                  onPress={() => Alert.alert(
                    'Select Timezone',
                    'Choose your timezone',
                    [
                      { text: 'UTC', onPress: () => setTimezone('UTC') },
                      { text: 'Eastern Time (ET)', onPress: () => setTimezone('America/New_York') },
                      { text: 'Central Time (CT)', onPress: () => setTimezone('America/Chicago') },
                      { text: 'Mountain Time (MT)', onPress: () => setTimezone('America/Denver') },
                      { text: 'Pacific Time (PT)', onPress: () => setTimezone('America/Los_Angeles') },
                      { text: 'London (GMT/BST)', onPress: () => setTimezone('Europe/London') },
                      { text: 'Paris (CET/CEST)', onPress: () => setTimezone('Europe/Paris') },
                      { text: 'Istanbul (TRT)', onPress: () => setTimezone('Europe/Istanbul') },
                      { text: 'Dubai (GST)', onPress: () => setTimezone('Asia/Dubai') },
                      { text: 'Tokyo (JST)', onPress: () => setTimezone('Asia/Tokyo') },
                      { text: 'Shanghai (CST)', onPress: () => setTimezone('Asia/Shanghai') },
                      { text: 'Sydney (AEST/AEDT)', onPress: () => setTimezone('Australia/Sydney') },
                      { text: 'Cancel', style: 'cancel' }
                    ]
                  )}
                  style={[styles.pickerContainer, { borderColor: colors.border, backgroundColor: colors.surface }]}
                >
                  <Ionicons name="time-outline" size={20} color={colors.textSecondary} style={{ marginRight: 8 }} />
                  <Text style={[styles.pickerValue, { color: colors.textPrimary }]}>
                    {timezone === 'UTC' ? 'UTC (Coordinated Universal Time)' : timezone === 'America/New_York' ? 'Eastern Time (ET)' : timezone === 'America/Chicago' ? 'Central Time (CT)' : timezone === 'America/Denver' ? 'Mountain Time (MT)' : timezone === 'America/Los_Angeles' ? 'Pacific Time (PT)' : timezone === 'Europe/London' ? 'London (GMT/BST)' : timezone === 'Europe/Paris' ? 'Paris (CET/CEST)' : timezone === 'Europe/Istanbul' ? 'Istanbul (TRT)' : timezone === 'Asia/Dubai' ? 'Dubai (GST)' : timezone === 'Asia/Tokyo' ? 'Tokyo (JST)' : timezone === 'Asia/Shanghai' ? 'Shanghai (CST)' : 'Sydney (AEST/AEDT)'}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color={colors.textSecondary} />
                </Pressable>

                <Text style={[styles.subSectionTitle, { color: colors.textPrimary, marginTop: 20 }]}>Date Format</Text>
                <Pressable 
                  onPress={() => Alert.alert(
                    'Select Date Format',
                    'Choose your preferred date format',
                    [
                      { text: 'MM/DD/YYYY', onPress: () => setDateFormat('MM/DD/YYYY') },
                      { text: 'DD/MM/YYYY', onPress: () => setDateFormat('DD/MM/YYYY') },
                      { text: 'YYYY-MM-DD', onPress: () => setDateFormat('YYYY-MM-DD') },
                      { text: 'DD.MM.YYYY', onPress: () => setDateFormat('DD.MM.YYYY') },
                      { text: 'Cancel', style: 'cancel' }
                    ]
                  )}
                  style={[styles.pickerContainer, { borderColor: colors.border, backgroundColor: colors.surface }]}
                >
                  <Ionicons name="calendar-outline" size={20} color={colors.textSecondary} style={{ marginRight: 8 }} />
                  <Text style={[styles.pickerValue, { color: colors.textPrimary }]}>
                    {dateFormat} ({new Date().toLocaleDateString()})
                  </Text>
                  <Ionicons name="chevron-down" size={20} color={colors.textSecondary} />
                </Pressable>

                <Text style={[styles.subSectionTitle, { color: colors.textPrimary, marginTop: 20 }]}>Time Format</Text>
                <View style={styles.themeGrid}>
                  <Pressable
                    onPress={() => setTimeFormat('12')}
                    style={[styles.themeOption, { 
                      borderColor: timeFormat === '12' ? colors.accent : colors.border,
                      backgroundColor: timeFormat === '12' ? colors.accent + '10' : 'transparent'
                    }]}
                  >
                    <Text style={[styles.themeLabel, { color: colors.textPrimary }]}>12-hour</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => setTimeFormat('24')}
                    style={[styles.themeOption, { 
                      borderColor: timeFormat === '24' ? colors.accent : colors.border,
                      backgroundColor: timeFormat === '24' ? colors.accent + '10' : 'transparent'
                    }]}
                  >
                    <Text style={[styles.themeLabel, { color: colors.textPrimary }]}>24-hour</Text>
                  </Pressable>
                </View>

                <Text style={[styles.subSectionTitle, { color: colors.textPrimary, marginTop: 20 }]}>Number Format</Text>
                <Pressable 
                  onPress={() => Alert.alert(
                    'Select Number Format',
                    'Choose your preferred number format',
                    [
                      { text: '1,234.56 (US)', onPress: () => setNumberFormat('1,234.56') },
                      { text: '1.234,56 (EU)', onPress: () => setNumberFormat('1.234,56') },
                      { text: '1 234,56 (FR)', onPress: () => setNumberFormat('1 234,56') },
                      { text: '1234.56 (Plain)', onPress: () => setNumberFormat('1234.56') },
                      { text: 'Cancel', style: 'cancel' }
                    ]
                  )}
                  style={[styles.pickerContainer, { borderColor: colors.border, backgroundColor: colors.surface }]}
                >
                  <Ionicons name="calculator-outline" size={20} color={colors.textSecondary} style={{ marginRight: 8 }} />
                  <Text style={[styles.pickerValue, { color: colors.textPrimary }]}>{numberFormat}</Text>
                  <Ionicons name="chevron-down" size={20} color={colors.textSecondary} />
                </Pressable>

                <Text style={[styles.subSectionTitle, { color: colors.textPrimary, marginTop: 20 }]}>Current Time</Text>
                <Text style={[styles.settingLabel, { color: colors.textPrimary, fontSize: 18, fontWeight: '700' }]}>
                  {new Date().toLocaleString()}
                </Text>
              </View>
            )}

            {settingsActive === 'security' && (
              <View>
                <Text style={[styles.tabDescription, { color: colors.textSecondary }]}>Manage your account security settings</Text>
                {passwordStatus !== 'idle' && (
                  <View style={[styles.statusBanner, { backgroundColor: passwordStatus === 'success' ? colors.success + '20' : colors.danger + '20' }]}>
                    <Ionicons name={passwordStatus === 'success' ? 'checkmark-circle' : 'close-circle'} size={16} color={passwordStatus === 'success' ? colors.success : colors.danger} />
                    <Text style={[styles.statusText, { color: passwordStatus === 'success' ? colors.success : colors.danger }]}>
                      {passwordStatus === 'success' ? 'Password updated successfully' : passwordError || 'Failed to change password'}
                    </Text>
                  </View>
                )}
                <Text style={[styles.subSectionTitle, { color: colors.textPrimary }]}>Change Password</Text>
                <EditableField 
                  label="Current Password" 
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                />
                <EditableField 
                  label="New Password" 
                  value={newPassword}
                  onChangeText={setNewPassword}
                />
                <EditableField 
                  label="Confirm Password" 
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
                <Pressable 
                  style={[styles.saveButton, { backgroundColor: colors.accent, opacity: passwordSaving ? 0.7 : 1 }]} 
                  onPress={handleChangePassword}
                  disabled={passwordSaving}
                >
                  {passwordSaving ? (
                    <ActivityIndicator size="small" color={colors.background} />
                  ) : (
                    <Text style={[styles.saveButtonLabel, { color: colors.background }]}>Update Password</Text>
                  )}
                </Pressable>
                <Text style={[styles.helperText, { color: colors.textSecondary }]}>Use a strong password you have not used elsewhere</Text>

                <View style={styles.securityGrid}>
                  <Pressable 
                    style={[styles.securityCard, { backgroundColor: colors.surface, borderColor: twoFactorEnabled ? colors.success + '40' : colors.accent + '40' }]}
                    onPress={twoFactorEnabled ? () => setShow2FADisable(true) : handleEnable2FA}
                    disabled={twoFactorLoading}
                  >
                    <View style={styles.securityCardHeader}>
                      <Text style={[styles.securityCardTitle, { color: colors.textPrimary }]}>Two-Factor Authentication</Text>
                      {twoFactorLoading ? (
                        <ActivityIndicator size="small" color={colors.accent} />
                      ) : (
                        <View style={[styles.comingSoonBadge, { backgroundColor: twoFactorEnabled ? colors.success + '20' : colors.accent + '20' }]}>
                          <Text style={[styles.comingSoonText, { color: twoFactorEnabled ? colors.success : colors.accent }]}>
                            {twoFactorEnabled ? 'Enabled' : 'Disabled'}
                          </Text>
                        </View>
                      )}
                    </View>
                    <Text style={[styles.securityCardDesc, { color: colors.textSecondary }]}>
                      {twoFactorEnabled ? 'Tap to disable extra protection' : 'Extra protection with one-time codes'}
                    </Text>
                  </Pressable>
                  
                  <Pressable 
                    style={[styles.securityCard, { backgroundColor: colors.surface, borderColor: colors.accent + '40' }]}
                    onPress={handleViewSessions}
                    disabled={sessionsLoading}
                  >
                    <View style={styles.securityCardHeader}>
                      <Text style={[styles.securityCardTitle, { color: colors.textPrimary }]}>Active Sessions</Text>
                      {sessionsLoading ? (
                        <ActivityIndicator size="small" color={colors.accent} />
                      ) : (
                        <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                      )}
                    </View>
                    <Text style={[styles.securityCardDesc, { color: colors.textSecondary }]}>Manage devices logged into your account</Text>
                  </Pressable>
                </View>
              </View>
            )}

            {settingsActive === 'subscriptions' && (
              <View>
                <Text style={[styles.tabDescription, { color: colors.textSecondary }]}>Manage your active subscriptions</Text>
                <View style={[styles.subscriptionCard, { backgroundColor: colors.accent + '10', borderColor: colors.accent + '30' }]}>
                  <View style={styles.subscriptionHeader}>
                    <Text style={[styles.subscriptionTitle, { color: colors.textPrimary }]}>Workspace Pro</Text>
                    <View style={[styles.activeBadge, { backgroundColor: colors.success + '20' }]}>
                      <Text style={[styles.activeBadgeText, { color: colors.success }]}>Active</Text>
                    </View>
                  </View>
                  <Text style={[styles.subscriptionDesc, { color: colors.textSecondary }]}>$10/month • Next billing: Jan 04, 2025</Text>
                  <Pressable style={styles.manageLink}>
                    <Text style={[styles.manageLinkText, { color: colors.accent }]}>Manage Subscription</Text>
                  </Pressable>
                </View>
              </View>
            )}

            {settingsActive === 'billing' && (
              <View>
                <Text style={[styles.tabDescription, { color: colors.textSecondary }]}>View invoices and manage refunds</Text>
                <Text style={[styles.subSectionTitle, { color: colors.textPrimary }]}>Recent Invoices</Text>
                {[
                  { id: 'INV-001', date: '2025-12-01', amount: '$99.99', status: 'paid' },
                  { id: 'INV-002', date: '2025-11-01', amount: '$99.99', status: 'paid' },
                  { id: 'INV-003', date: '2025-10-01', amount: '$99.99', status: 'paid' },
                ].map((invoice) => (
                  <View key={invoice.id} style={[styles.invoiceItem, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
                    <View>
                      <Text style={[styles.invoiceId, { color: colors.textPrimary }]}>{invoice.id}</Text>
                      <Text style={[styles.invoiceDate, { color: colors.textSecondary }]}>{invoice.date}</Text>
                    </View>
                    <View style={styles.invoiceRight}>
                      <Text style={[styles.invoiceAmount, { color: colors.textPrimary }]}>{invoice.amount}</Text>
                      <View style={[styles.paidBadge, { backgroundColor: colors.success + '20' }]}>
                        <Text style={[styles.paidBadgeText, { color: colors.success }]}>{invoice.status}</Text>
                      </View>
                    </View>
                  </View>
                ))}
                <Pressable style={[styles.downloadButton, { backgroundColor: colors.accent }]}>
                  <Ionicons name="download-outline" size={18} color={colors.background} />
                  <Text style={[styles.downloadButtonText, { color: colors.background }]}>Download Invoice</Text>
                </Pressable>
              </View>
            )}

            {settingsActive === 'privacy' && (
              <View>
                <Text style={[styles.tabDescription, { color: colors.textSecondary }]}>Control your privacy and data sharing preferences</Text>
                
                <Text style={[styles.subSectionTitle, { color: colors.textPrimary }]}>Profile Visibility</Text>
                <Pressable 
                  onPress={() => Alert.alert(
                    'Profile Visibility',
                    'Who can see your profile?',
                    [
                      { text: 'Public', onPress: () => setProfileVisibility('public') },
                      { text: 'Friends Only', onPress: () => setProfileVisibility('friends') },
                      { text: 'Private', onPress: () => setProfileVisibility('private') },
                      { text: 'Cancel', style: 'cancel' }
                    ]
                  )}
                  style={[styles.pickerContainer, { borderColor: colors.border, backgroundColor: colors.surface }]}
                >
                  <Ionicons name="eye-outline" size={20} color={colors.textSecondary} style={{ marginRight: 8 }} />
                  <Text style={[styles.pickerValue, { color: colors.textPrimary }]}>
                    {profileVisibility === 'public' ? 'Public' : profileVisibility === 'friends' ? 'Friends Only' : 'Private'}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color={colors.textSecondary} />
                </Pressable>

                <Text style={[styles.subSectionTitle, { color: colors.textPrimary, marginTop: 20 }]}>Activity Visibility</Text>
                <Pressable 
                  onPress={() => Alert.alert(
                    'Activity Visibility',
                    'Who can see your activity?',
                    [
                      { text: 'Public', onPress: () => setActivityVisibility('public') },
                      { text: 'Friends Only', onPress: () => setActivityVisibility('friends') },
                      { text: 'Private', onPress: () => setActivityVisibility('private') },
                      { text: 'Cancel', style: 'cancel' }
                    ]
                  )}
                  style={[styles.pickerContainer, { borderColor: colors.border, backgroundColor: colors.surface }]}
                >
                  <Ionicons name="pulse-outline" size={20} color={colors.textSecondary} style={{ marginRight: 8 }} />
                  <Text style={[styles.pickerValue, { color: colors.textPrimary }]}>
                    {activityVisibility === 'public' ? 'Public' : activityVisibility === 'friends' ? 'Friends Only' : 'Private'}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color={colors.textSecondary} />
                </Pressable>

                <Text style={[styles.subSectionTitle, { color: colors.textPrimary, marginTop: 20 }]}>Cookie Preferences</Text>
                <View style={[styles.checkboxRow, { borderTopColor: colors.border }]}>
                  <View style={styles.checkboxLeft}>
                    <Ionicons name="checkbox" size={24} color={colors.textSecondary} />
                    <View style={{ marginLeft: 12 }}>
                      <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>Essential Cookies</Text>
                      <Text style={[styles.checkboxDesc, { color: colors.textSecondary }]}>Required for basic functionality (Always On)</Text>
                    </View>
                  </View>
                </View>
                <View style={[styles.checkboxRow, { borderTopColor: colors.border }]}>
                  <Pressable 
                    onPress={() => setCookieAnalytics(!cookieAnalytics)}
                    style={styles.checkboxLeft}
                  >
                    <Ionicons 
                      name={cookieAnalytics ? 'checkbox' : 'square-outline'} 
                      size={24} 
                      color={cookieAnalytics ? colors.accent : colors.textSecondary} 
                    />
                    <View style={{ marginLeft: 12 }}>
                      <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>Analytics Cookies</Text>
                      <Text style={[styles.checkboxDesc, { color: colors.textSecondary }]}>Help us improve our services</Text>
                    </View>
                  </Pressable>
                </View>
                <View style={[styles.checkboxRow, { borderTopColor: colors.border }]}>
                  <Pressable 
                    onPress={() => setCookieMarketing(!cookieMarketing)}
                    style={styles.checkboxLeft}
                  >
                    <Ionicons 
                      name={cookieMarketing ? 'checkbox' : 'square-outline'} 
                      size={24} 
                      color={cookieMarketing ? colors.accent : colors.textSecondary} 
                    />
                    <View style={{ marginLeft: 12 }}>
                      <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>Marketing Cookies</Text>
                      <Text style={[styles.checkboxDesc, { color: colors.textSecondary }]}>Personalized content and ads</Text>
                    </View>
                  </Pressable>
                </View>

                <Text style={[styles.subSectionTitle, { color: colors.textPrimary, marginTop: 20 }]}>Blocked Users</Text>
                {blockedUsers.length === 0 ? (
                  <Text style={[styles.helperText, { color: colors.textSecondary }]}>No blocked users</Text>
                ) : (
                  blockedUsers.map((username, idx) => (
                    <View key={idx} style={[styles.checkboxRow, { borderTopColor: colors.border }]}>
                      <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>{username}</Text>
                      <Pressable onPress={() => setBlockedUsers(blockedUsers.filter(u => u !== username))}>
                        <Text style={{ color: colors.danger }}>Unblock</Text>
                      </Pressable>
                    </View>
                  ))
                )}

                <Text style={[styles.subSectionTitle, { color: colors.textPrimary, marginTop: 20 }]}>Search Engines</Text>
                <View style={[styles.checkboxRow, { borderTopColor: colors.border }]}>
                  <Pressable 
                    onPress={() => setSearchEngineIndexing(!searchEngineIndexing)}
                    style={styles.checkboxLeft}
                  >
                    <Ionicons 
                      name={searchEngineIndexing ? 'checkbox' : 'square-outline'} 
                      size={24} 
                      color={searchEngineIndexing ? colors.accent : colors.textSecondary} 
                    />
                    <View style={{ marginLeft: 12 }}>
                      <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>Allow Search Engine Indexing</Text>
                      <Text style={[styles.checkboxDesc, { color: colors.textSecondary }]}>Let search engines find your public profile</Text>
                    </View>
                  </Pressable>
                </View>

                <Text style={[styles.subSectionTitle, { color: colors.textPrimary, marginTop: 20 }]}>GDPR Compliance</Text>
                <Pressable style={[styles.downloadButton, { backgroundColor: colors.danger, marginTop: 8 }]}>
                  <Ionicons name="trash-outline" size={18} color={colors.background} />
                  <Text style={[styles.downloadButtonText, { color: colors.background }]}>Request Data Deletion</Text>
                </Pressable>
                <Text style={[styles.helperText, { color: colors.textSecondary }]}>Permanently delete all your data (irreversible)</Text>
              </View>
            )}

            {settingsActive === 'accessibility' && (
              <View>
                <Text style={[styles.tabDescription, { color: colors.textSecondary }]}>Customize accessibility features to improve your experience</Text>
                
                <Text style={[styles.subSectionTitle, { color: colors.textPrimary }]}>Text Size</Text>
                <View style={styles.themeGrid}>
                  {['Small', 'Medium', 'Large', 'X-Large'].map((size) => (
                    <Pressable
                      key={size}
                      onPress={() => setTextSize(size)}
                      style={[styles.themeOption, { 
                        borderColor: textSize === size ? colors.accent : colors.border,
                        backgroundColor: textSize === size ? colors.accent + '10' : 'transparent',
                        flex: 1,
                        marginRight: 8
                      }]}
                    >
                      <Text style={[styles.themeLabel, { color: colors.textPrimary }]}>{size}</Text>
                    </Pressable>
                  ))}
                </View>

                <Text style={[styles.subSectionTitle, { color: colors.textPrimary, marginTop: 20 }]}>Display Options</Text>
                <View style={[styles.checkboxRow, { borderTopColor: colors.border }]}>
                  <Pressable 
                    onPress={() => setHighContrast(!highContrast)}
                    style={styles.checkboxLeft}
                  >
                    <Ionicons 
                      name={highContrast ? 'checkbox' : 'square-outline'} 
                      size={24} 
                      color={highContrast ? colors.accent : colors.textSecondary} 
                    />
                    <View style={{ marginLeft: 12 }}>
                      <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>High Contrast Mode</Text>
                      <Text style={[styles.checkboxDesc, { color: colors.textSecondary }]}>Increase text and UI contrast</Text>
                    </View>
                  </Pressable>
                </View>
                <View style={[styles.checkboxRow, { borderTopColor: colors.border }]}>
                  <Pressable 
                    onPress={() => setReduceMotion(!reduceMotion)}
                    style={styles.checkboxLeft}
                  >
                    <Ionicons 
                      name={reduceMotion ? 'checkbox' : 'square-outline'} 
                      size={24} 
                      color={reduceMotion ? colors.accent : colors.textSecondary} 
                    />
                    <View style={{ marginLeft: 12 }}>
                      <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>Reduce Motion</Text>
                      <Text style={[styles.checkboxDesc, { color: colors.textSecondary }]}>Minimize animations and transitions</Text>
                    </View>
                  </Pressable>
                </View>
                <View style={[styles.checkboxRow, { borderTopColor: colors.border }]}>
                  <Pressable 
                    onPress={() => setScreenReader(!screenReader)}
                    style={styles.checkboxLeft}
                  >
                    <Ionicons 
                      name={screenReader ? 'checkbox' : 'square-outline'} 
                      size={24} 
                      color={screenReader ? colors.accent : colors.textSecondary} 
                    />
                    <View style={{ marginLeft: 12 }}>
                      <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>Screen Reader Optimized</Text>
                      <Text style={[styles.checkboxDesc, { color: colors.textSecondary }]}>Enhanced screen reader support</Text>
                    </View>
                  </Pressable>
                </View>

                <Text style={[styles.subSectionTitle, { color: colors.textPrimary, marginTop: 20 }]}>Keyboard Shortcuts</Text>
                <View style={[styles.checkboxRow, { borderTopColor: colors.border }]}>
                  <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>⌘K or Ctrl+K</Text>
                  <Text style={[styles.checkboxDesc, { color: colors.textSecondary }]}>Quick Search</Text>
                </View>
                <View style={[styles.checkboxRow, { borderTopColor: colors.border }]}>
                  <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>⌘⇧D or Ctrl+Shift+D</Text>
                  <Text style={[styles.checkboxDesc, { color: colors.textSecondary }]}>Toggle Dark Mode</Text>
                </View>
                <View style={[styles.checkboxRow, { borderTopColor: colors.border }]}>
                  <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>Tab</Text>
                  <Text style={[styles.checkboxDesc, { color: colors.textSecondary }]}>Navigate Between Elements</Text>
                </View>

                <Text style={[styles.subSectionTitle, { color: colors.textPrimary, marginTop: 20 }]}>Color Vision</Text>
                <Pressable 
                  onPress={() => Alert.alert(
                    'Color Vision',
                    'Select color vision mode',
                    [
                      { text: 'Normal', onPress: () => setColorVision('Normal') },
                      { text: 'Protanopia (Red-Blind)', onPress: () => setColorVision('Protanopia') },
                      { text: 'Deuteranopia (Green-Blind)', onPress: () => setColorVision('Deuteranopia') },
                      { text: 'Tritanopia (Blue-Blind)', onPress: () => setColorVision('Tritanopia') },
                      { text: 'Achromatopsia (Colorblind)', onPress: () => setColorVision('Achromatopsia') },
                      { text: 'Cancel', style: 'cancel' }
                    ]
                  )}
                  style={[styles.pickerContainer, { borderColor: colors.border, backgroundColor: colors.surface }]}
                >
                  <Ionicons name="color-palette-outline" size={20} color={colors.textSecondary} style={{ marginRight: 8 }} />
                  <Text style={[styles.pickerValue, { color: colors.textPrimary }]}>{colorVision}</Text>
                  <Ionicons name="chevron-down" size={20} color={colors.textSecondary} />
                </Pressable>
                <Text style={[styles.helperText, { color: colors.textSecondary }]}>Adjust colors for different types of color vision</Text>
              </View>
            )}

            {settingsActive === 'data' && (
              <View>
                <Text style={[styles.tabDescription, { color: colors.textSecondary }]}>Manage your storage and data usage</Text>
                
                <Text style={[styles.subSectionTitle, { color: colors.textPrimary }]}>Storage Overview</Text>
                <View style={[styles.storageCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <View style={styles.storageHeader}>
                    <Text style={[styles.storageLabel, { color: colors.textPrimary }]}>2.4 GB of 10 GB used</Text>
                    <Text style={[styles.storagePercent, { color: colors.textSecondary }]}>24%</Text>
                  </View>
                  <View style={[styles.storageBar, { backgroundColor: colors.border }]}>
                    <View style={[styles.storageBarFill, { width: '24%', backgroundColor: colors.accent }]} />
                  </View>
                </View>

                <Text style={[styles.subSectionTitle, { color: colors.textPrimary, marginTop: 20 }]}>Usage Breakdown</Text>
                {[
                  { label: 'Files', size: '1.8 GB', color: colors.accent },
                  { label: 'Messages', size: '350 MB', color: colors.success },
                  { label: 'Cache', size: '150 MB', color: colors.warning },
                  { label: 'Other', size: '100 MB', color: colors.textSecondary },
                ].map((item, idx) => (
                  <View key={idx} style={[styles.checkboxRow, { borderTopColor: colors.border }]}>
                    <View style={styles.checkboxLeft}>
                      <View style={[styles.colorDot, { backgroundColor: item.color }]} />
                      <Text style={[styles.settingLabel, { color: colors.textPrimary, marginLeft: 12 }]}>{item.label}</Text>
                    </View>
                    <Text style={[styles.checkboxDesc, { color: colors.textSecondary }]}>{item.size}</Text>
                  </View>
                ))}

                <Text style={[styles.subSectionTitle, { color: colors.textPrimary, marginTop: 20 }]}>Cache Management</Text>
                <Pressable style={[styles.downloadButton, { backgroundColor: colors.warning, marginTop: 8 }]}>
                  <Ionicons name="refresh-outline" size={18} color={colors.background} />
                  <Text style={[styles.downloadButtonText, { color: colors.background }]}>Clear Cache</Text>
                </Pressable>
                <Text style={[styles.helperText, { color: colors.textSecondary }]}>Free up space by clearing temporary files</Text>

                <Text style={[styles.subSectionTitle, { color: colors.textPrimary, marginTop: 20 }]}>Data Retention</Text>
                <View style={[styles.checkboxRow, { borderTopColor: colors.border }]}>
                  <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>Activity Logs</Text>
                  <Text style={[styles.checkboxDesc, { color: colors.textSecondary }]}>90 days</Text>
                </View>
                <View style={[styles.checkboxRow, { borderTopColor: colors.border }]}>
                  <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>Messages</Text>
                  <Text style={[styles.checkboxDesc, { color: colors.textSecondary }]}>1 year</Text>
                </View>
                <View style={[styles.checkboxRow, { borderTopColor: colors.border }]}>
                  <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>Files</Text>
                  <Text style={[styles.checkboxDesc, { color: colors.textSecondary }]}>Unlimited</Text>
                </View>

                <Text style={[styles.subSectionTitle, { color: colors.textPrimary, marginTop: 20 }]}>Data Export</Text>
                <Pressable style={[styles.downloadButton, { backgroundColor: colors.accent, marginTop: 8 }]}>
                  <Ionicons name="download-outline" size={18} color={colors.background} />
                  <Text style={[styles.downloadButtonText, { color: colors.background }]}>Export Your Data</Text>
                </Pressable>
                <Text style={[styles.helperText, { color: colors.textSecondary }]}>Download all your data in JSON format</Text>
              </View>
            )}
          </View>
        );
      case 'products':
        return (
          <View style={styles.tabContent}>
            <Text style={[styles.tabTitle, { color: colors.textPrimary }]}>Your Products</Text>
            <Text style={[styles.tabDescription, { color: colors.textSecondary }]}>View your active products and services.</Text>
            {loading ? (
              <ActivityIndicator size="small" color={colors.accent} style={{ marginTop: 20 }} />
            ) : products.length > 0 ? (
              products.map((product: any, idx: number) => (
                <View key={idx} style={[styles.productRow, { borderTopColor: colors.border }]}>
                  <Text style={[styles.productName, { color: colors.textPrimary }]}>{product.name || product.title}</Text>
                  <Text style={[styles.productStatus, { color: colors.accent }]}>{product.status || 'Active'}</Text>
                </View>
              ))
            ) : (
              <Text style={[styles.emptyMessage, { color: colors.textSecondary }]}>No products yet</Text>
            )}
          </View>
        );
      case 'orders':
        return (
          <View style={styles.tabContent}>
            <Text style={[styles.tabTitle, { color: colors.textPrimary }]}>Orders</Text>
            <Text style={[styles.tabDescription, { color: colors.textSecondary }]}>View your purchase history.</Text>
            {loading ? (
              <ActivityIndicator size="small" color={colors.accent} style={{ marginTop: 20 }} />
            ) : orders.length > 0 ? (
              orders.map((order: any, idx: number) => {
                const statusSteps = ['pending', 'processing', 'shipped', 'delivered'];
                const currentStatusIndex = statusSteps.indexOf((order.status || 'pending').toLowerCase());
                
                return (
                  <View key={idx} style={[styles.orderCard, { borderColor: colors.border }]}>
                    <View style={styles.orderHeader}>
                      <View>
                        <Text style={[styles.productName, { color: colors.textPrimary }]}>Order #{order.order_number || order.number || order.id}</Text>
                        <Text style={[styles.licenseLabel, { color: colors.textSecondary }]}>{order.total_amount || order.total || 0} {order.currency || 'USD'}</Text>
                      </View>
                      <View style={[styles.orderStatusBadge, { 
                        backgroundColor: currentStatusIndex === 3 ? colors.accent + '20' : 
                                       currentStatusIndex >= 2 ? colors.warning + '20' : 
                                       colors.muted + '20' 
                      }]}>
                        <Text style={[styles.orderStatusText, { 
                          color: currentStatusIndex === 3 ? colors.accent : 
                                 currentStatusIndex >= 2 ? colors.warning : 
                                 colors.muted 
                        }]}>
                          {(order.status || 'Pending').charAt(0).toUpperCase() + (order.status || 'Pending').slice(1)}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.progressContainer}>
                      <View style={styles.stepsRow}>
                        {statusSteps.map((step, stepIdx) => (
                          <View key={step} style={{ flex: 1, alignItems: 'center' }}>
                            <View style={[
                              styles.stepCircle,
                              {
                                backgroundColor: stepIdx <= currentStatusIndex ? colors.accent : colors.muted + '20',
                                borderColor: stepIdx <= currentStatusIndex ? colors.accent : colors.border
                              }
                            ]}>
                              <Ionicons 
                                name={stepIdx <= currentStatusIndex ? 'checkmark' : 'hourglass-outline'} 
                                size={10} 
                                color={stepIdx <= currentStatusIndex ? colors.background : colors.muted}
                              />
                            </View>
                            <Text style={[styles.stepLabel, { 
                              color: stepIdx <= currentStatusIndex ? colors.accent : colors.textSecondary,
                              fontWeight: stepIdx <= currentStatusIndex ? '700' : '400'
                            }]}>
                              {step.charAt(0).toUpperCase() + step.slice(1)}
                            </Text>
                          </View>
                        ))}
                      </View>
                      <View style={[styles.progressBarContainer, { backgroundColor: colors.border }]}>
                        {(() => {
                          const maxIndex = Math.max(statusSteps.length - 1, 1);
                          const safeIndex = Math.max(currentStatusIndex, 0);
                          const pct = (safeIndex / maxIndex) * 100;
                          return (
                            <View
                              style={[
                                styles.progressBar,
                                {
                                  width: `${pct}%`,
                                  backgroundColor: colors.accent,
                                },
                              ]}
                            />
                          );
                        })()}
                      </View>
                    </View>

                    {order.estimated_delivery && (
                      <Text style={[styles.estimatedDelivery, { color: colors.textSecondary }]}>
                        Estimated delivery: {new Date(order.estimated_delivery).toLocaleDateString()}
                      </Text>
                    )}
                  </View>
                );
              })
            ) : (
              <Text style={[styles.emptyMessage, { color: colors.textSecondary }]}>No orders yet</Text>
            )}
          </View>
        );
      case 'invoices':
        return (
          <View style={styles.tabContent}>
            <Text style={[styles.tabTitle, { color: colors.textPrimary }]}>Invoices</Text>
            <Text style={[styles.tabDescription, { color: colors.textSecondary }]}>View and download your invoices.</Text>
            {loading ? (
              <ActivityIndicator size="small" color={colors.accent} style={{ marginTop: 20 }} />
            ) : invoices.length > 0 ? (
              <>
                {invoices.map((invoice: any, idx: number) => (
                  <View key={invoice.id || idx} style={[styles.invoiceCard, { borderColor: colors.border }]}>
                    <View style={styles.invoiceHeader}>
                      <View style={styles.invoiceLeft}>
                        <Ionicons name="document-text-outline" size={18} color={colors.accent} />
                        <Text style={[styles.invoiceNumber, { color: colors.textPrimary }]}>
                          Invoice #{invoice.invoice_number || invoice.number || invoice.id}
                        </Text>
                      </View>
                      <View style={[styles.invoiceStatusBadge, { 
                        backgroundColor: invoice.status === 'paid' ? colors.accent + '20' : 
                                       invoice.status === 'pending' ? colors.muted + '20' : 
                                       colors.danger + '20' 
                      }]}>
                        <Text style={[styles.invoiceStatusText, { 
                          color: invoice.status === 'paid' ? colors.accent : 
                                 invoice.status === 'pending' ? colors.muted : 
                                 colors.danger 
                        }]}>
                          {invoice.status?.toUpperCase() || 'PENDING'}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.invoiceDetails}>
                      <View style={styles.invoiceRow}>
                        <Text style={[styles.invoiceLabel, { color: colors.textSecondary }]}>Amount</Text>
                        <Text style={[styles.invoiceAmount, { color: colors.textPrimary }]}>
                          {invoice.total_amount || invoice.amount_due || invoice.total || 0} {invoice.currency || 'USD'}
                        </Text>
                      </View>
                      {invoice.issued_at && (
                        <View style={styles.invoiceRow}>
                          <Text style={[styles.invoiceLabel, { color: colors.textSecondary }]}>Issued</Text>
                          <Text style={[styles.invoiceDate, { color: colors.textSecondary }]}>
                            {new Date(invoice.issued_at).toLocaleDateString()}
                          </Text>
                        </View>
                      )}
                    </View>
                    {invoice.pdf_url && (
                      <Pressable 
                        style={[styles.downloadButton, { borderColor: colors.border }]}
                        onPress={() => Alert.alert('Download', `Download invoice ${invoice.invoice_number || invoice.number || invoice.id}`)}
                      >
                        <Ionicons name="download-outline" size={16} color={colors.accent} />
                        <Text style={[styles.downloadButtonText, { color: colors.accent }]}>Download PDF</Text>
                      </Pressable>
                    )}
                  </View>
                ))}
              </>
            ) : (
              <Text style={[styles.emptyMessage, { color: colors.textSecondary }]}>No invoices yet</Text>
            )}
          </View>
        );
      case 'payments':
        return (
          <View style={styles.tabContent}>
            <Text style={[styles.tabTitle, { color: colors.textPrimary }]}>Payment Methods</Text>
            <Text style={[styles.tabDescription, { color: colors.textSecondary }]}>Payments are coming soon. This feature is not yet available.</Text>
            {loading ? (
              <ActivityIndicator size="small" color={colors.accent} style={{ marginTop: 20 }} />
            ) : paymentMethods.length > 0 ? (
              paymentMethods.map((method: any, idx: number) => (
                <View key={idx} style={[styles.productRow, { borderTopColor: colors.border }]}>
                  <Text style={[styles.productName, { color: colors.textPrimary }]}>
                    {method.brand || 'Card'} •••• {method.last4}
                  </Text>
                  <Text style={[styles.productStatus, { color: colors.textSecondary }]}>
                    {method.exp_month}/{method.exp_year}
                  </Text>
                </View>
              ))
            ) : (
              <Text style={[styles.emptyMessage, { color: colors.textSecondary }]}>No payment methods yet</Text>
            )}
            <View style={[styles.addButton, { backgroundColor: colors.surface, opacity: 0.6, borderWidth: 1, borderColor: colors.border }]}> 
              <Ionicons name="lock-closed-outline" size={20} color={colors.textSecondary} />
              <Text style={[styles.addButtonLabel, { color: colors.textSecondary }]}>Add Payment Method (soon)</Text>
            </View>
          </View>
        );
      case 'subscriptions':
        return (
          <View style={styles.tabContent}>
            <Text style={[styles.tabTitle, { color: colors.textPrimary }]}>Subscription</Text>
            <Text style={[styles.tabDescription, { color: colors.textSecondary }]}>Manage your subscription plan.</Text>
            {loading ? (
              <ActivityIndicator size="small" color={colors.accent} style={{ marginTop: 20 }} />
            ) : subscriptions.length > 0 ? (
              subscriptions.map((sub: any, idx: number) => (
                <View key={idx} style={[styles.subscriptionRow, { borderTopColor: colors.border }]}>
                  <View>
                    <Text style={[styles.subscriptionLabel, { color: colors.textSecondary }]}>{sub.plan_name || 'Plan'}</Text>
                    {sub.renews_at && (
                      <Text style={[styles.licenseLabel, { color: colors.textSecondary }]}>
                        Renews {new Date(sub.renews_at).toLocaleDateString()}
                      </Text>
                    )}
                  </View>
                  <Text style={[styles.subscriptionValue, { color: colors.accent }]}>{sub.status || 'Active'}</Text>
                </View>
              ))
            ) : (
              <Text style={[styles.emptyMessage, { color: colors.textSecondary }]}>No subscriptions yet</Text>
            )}
          </View>
        );
      case 'tickets':
        return (
          <View style={styles.tabContent}>
            <Text style={[styles.tabTitle, { color: colors.textPrimary }]}>Support Tickets</Text>
            <Text style={[styles.tabDescription, { color: colors.textSecondary }]}>
              View and manage your support tickets. Responses from our team will appear here.
            </Text>
            {loading ? (
              <ActivityIndicator size="small" color={colors.accent} style={{ marginTop: 20 }} />
            ) : tickets.length > 0 ? (
              <View style={{ marginTop: 16 }}>
                {tickets.map((ticket: any, idx: number) => {
                  const statusColor = 
                    ticket.status === 'open' ? colors.accent :
                    ticket.status === 'closed' ? colors.textSecondary :
                    ticket.status === 'pending' ? '#FFA500' :
                    ticket.status === 'resolved' ? '#10B981' :
                    colors.accent;
                  
                  const priorityColor =
                    ticket.priority === 'high' ? '#EF4444' :
                    ticket.priority === 'medium' ? '#FFA500' :
                    ticket.priority === 'low' ? '#10B981' :
                    colors.textSecondary;

                  return (
                    <View 
                      key={ticket.id || idx} 
                      style={[
                        styles.ticketCard, 
                        { 
                          backgroundColor: colors.surface, 
                          borderColor: colors.border,
                          marginBottom: 12
                        }
                      ]}
                    >
                      <View style={styles.ticketCardHeader}>
                        <Text style={[styles.ticketCardId, { color: colors.textSecondary }]}>
                          Ticket #{ticket.ticket_number || ticket.id}
                        </Text>
                        <Pressable 
                          style={[styles.deleteTicketButton, { backgroundColor: colors.danger + '20' }]}
                          onPress={() => handleDeleteTicket(ticket.id)}
                        >
                          <Ionicons name="trash-outline" size={16} color={colors.danger} />
                        </Pressable>
                      </View>
                      <Text style={[styles.ticketCardSubject, { color: colors.textPrimary }]}>
                        {ticket.subject}
                      </Text>
                      <View style={styles.ticketCardBadges}>
                        <View style={[styles.ticketBadge, { backgroundColor: statusColor + '20', borderColor: statusColor }]}>
                          <Text style={[styles.ticketBadgeText, { color: statusColor }]}>
                            {ticket.status || 'open'}
                          </Text>
                        </View>
                        <View style={[styles.ticketBadge, { backgroundColor: priorityColor + '20', borderColor: priorityColor }]}>
                          <Text style={[styles.ticketBadgeText, { color: priorityColor }]}>
                            {ticket.priority || 'medium'}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.ticketCardFooter}>
                        <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
                        <Text style={[styles.ticketCardDate, { color: colors.textSecondary }]}>
                          {new Date(ticket.created_at).toLocaleDateString('en-US', { 
                            year: 'numeric',
                            month: 'short', 
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            ) : (
              <Text style={[styles.emptyMessage, { color: colors.textSecondary }]}>
                No tickets yet. Create your first support ticket below.
              </Text>
            )}
            <Pressable 
              style={[styles.addButton, { backgroundColor: colors.accent }]}
              onPress={() => setShowCreateTicket(true)}
            >
              <Ionicons name="add" size={20} color={colors.background} />
              <Text style={[styles.addButtonLabel, { color: colors.background }]}>Create New Ticket</Text>
            </Pressable>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <Screen>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.statsCard}
        contentContainerStyle={styles.statsScrollContent}
      >
        <Card style={[
          styles.statCardItem, 
          isTablet && styles.statCardItemTablet,
          !isTablet && styles.statCardItemAndroid,
          { 
            backgroundColor: colors.cardBackground, 
            marginRight: 12,
            borderWidth: 1,
            borderColor: '#E0E0E0',
          }
        ]}>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>My Messages</Text>
          <Text style={[styles.statValue, { color: colors.textPrimary }]}>{messages.filter(m => m.status === 'unread').length}</Text>
        </Card>
        <Card style={[
          styles.statCardItem, 
          isTablet && styles.statCardItemTablet,
          !isTablet && styles.statCardItemAndroid,
          { 
            backgroundColor: colors.cardBackground, 
            marginRight: 12,
            borderWidth: 1,
            borderColor: '#E0E0E0',
          }
        ]}>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>My Orders</Text>
          <Text style={[styles.statValue, { color: colors.textPrimary }]}>{stats.orders}</Text>
        </Card>
        <Card style={[
          styles.statCardItem, 
          isTablet && styles.statCardItemTablet,
          !isTablet && styles.statCardItemAndroid,
          { 
            backgroundColor: colors.cardBackground, 
            marginRight: 12,
            borderWidth: 1,
            borderColor: '#E0E0E0',
          }
        ]}>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>My Invoices</Text>
          <Text style={[styles.statValue, { color: colors.textPrimary }]}>{stats.invoices}</Text>
        </Card>
        <Card style={[
          styles.statCardItem, 
          isTablet && styles.statCardItemTablet,
          !isTablet && styles.statCardItemAndroid,
          { 
            backgroundColor: colors.cardBackground,
            borderWidth: 1,
            borderColor: '#E0E0E0',
          }
        ]}>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>My Tickets</Text>
          <Text style={[styles.statValue, { color: colors.textPrimary }]}>{stats.tickets}</Text>
        </Card>
      </ScrollView>
      <View style={styles.menuCard}>
        <Text style={[styles.menuSectionTitle, { color: colors.textPrimary }]}>Account & Services</Text>
        
        <Pressable
          style={({ pressed }) => [
            styles.menuListItem,
            pressed && { backgroundColor: colors.border }
          ]}
          onPress={() => setActiveTab('profile')}
        >
          <View style={[styles.menuIcon, { backgroundColor: colors.accent + '15' }]}>
            <Ionicons name="person-outline" size={20} color={colors.accent} />
          </View>
          <View style={styles.menuTextContainer}>
            <Text style={[styles.menuItemTitle, { color: colors.textPrimary }]}>Profile</Text>
            <Text style={[styles.menuItemDesc, { color: colors.textSecondary }]}>Personal information & billing</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.menuListItem,
            pressed && { backgroundColor: colors.border }
          ]}
          onPress={() => setActiveTab('messages')}
        >
          <View style={[styles.menuIcon, { backgroundColor: '#8b5cf6' + '15' }]}>
            <Ionicons name="mail-outline" size={20} color="#8b5cf6" />
          </View>
          <View style={styles.menuTextContainer}>
            <Text style={[styles.menuItemTitle, { color: colors.textPrimary }]}>Messages</Text>
            <Text style={[styles.menuItemDesc, { color: colors.textSecondary }]}>Inbox & notifications</Text>
          </View>
          {messages.filter(m => m.status === 'unread').length > 0 && (
            <View style={[styles.badge, { backgroundColor: colors.accent }]}>
              <Text style={styles.badgeText}>{messages.filter(m => m.status === 'unread').length}</Text>
            </View>
          )}
          <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.menuListItem,
            pressed && { backgroundColor: colors.border }
          ]}
          onPress={() => setActiveTab('license')}
        >
          <View style={[styles.menuIcon, { backgroundColor: '#f59e0b' + '15' }]}>
            <Ionicons name="key-outline" size={20} color="#f59e0b" />
          </View>
          <View style={styles.menuTextContainer}>
            <Text style={[styles.menuItemTitle, { color: colors.textPrimary }]}>License</Text>
            <Text style={[styles.menuItemDesc, { color: colors.textSecondary }]}>Subscription & plan details</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.menuListItem,
            pressed && { backgroundColor: colors.border }
          ]}
          onPress={() => setActiveTab('orders')}
        >
          <View style={[styles.menuIcon, { backgroundColor: '#10b981' + '15' }]}>
            <Ionicons name="cart-outline" size={20} color="#10b981" />
          </View>
          <View style={styles.menuTextContainer}>
            <Text style={[styles.menuItemTitle, { color: colors.textPrimary }]}>Orders</Text>
            <Text style={[styles.menuItemDesc, { color: colors.textSecondary }]}>Purchase history & tracking</Text>
          </View>
          {stats.orders > 0 && (
            <Text style={[styles.countText, { color: colors.textSecondary }]}>{stats.orders}</Text>
          )}
          <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
        </Pressable>
      </View>

      <View style={styles.menuCard}>
        <Text style={[styles.menuSectionTitle, { color: colors.textPrimary }]}>Billing & Support</Text>
        
        <Pressable
          style={({ pressed }) => [
            styles.menuListItem,
            pressed && { backgroundColor: colors.border }
          ]}
          onPress={() => setActiveTab('invoices')}
        >
          <View style={[styles.menuIcon, { backgroundColor: '#3b82f6' + '15' }]}>
            <Ionicons name="document-text-outline" size={20} color="#3b82f6" />
          </View>
          <View style={styles.menuTextContainer}>
            <Text style={[styles.menuItemTitle, { color: colors.textPrimary }]}>Invoices</Text>
            <Text style={[styles.menuItemDesc, { color: colors.textSecondary }]}>Billing statements & receipts</Text>
          </View>
          {stats.invoices > 0 && (
            <Text style={[styles.countText, { color: colors.textSecondary }]}>{stats.invoices}</Text>
          )}
          <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.menuListItem,
            pressed && { backgroundColor: colors.border }
          ]}
          onPress={() => setActiveTab('tickets')}
        >
          <View style={[styles.menuIcon, { backgroundColor: '#ec4899' + '15' }]}>
            <Ionicons name="help-buoy-outline" size={20} color="#ec4899" />
          </View>
          <View style={styles.menuTextContainer}>
            <Text style={[styles.menuItemTitle, { color: colors.textPrimary }]}>Tickets</Text>
            <Text style={[styles.menuItemDesc, { color: colors.textSecondary }]}>Support requests & help</Text>
          </View>
          {stats.tickets > 0 && (
            <Text style={[styles.countText, { color: colors.textSecondary }]}>{stats.tickets}</Text>
          )}
          <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.menuListItem,
            pressed && { backgroundColor: colors.border }
          ]}
          onPress={() => setActiveTab('settings')}
        >
          <View style={[styles.menuIcon, { backgroundColor: '#6366f1' + '15' }]}>
            <Ionicons name="settings-outline" size={20} color="#6366f1" />
          </View>
          <View style={styles.menuTextContainer}>
            <Text style={[styles.menuItemTitle, { color: colors.textPrimary }]}>Settings</Text>
            <Text style={[styles.menuItemDesc, { color: colors.textSecondary }]}>Preferences & notifications</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
        </Pressable>
      </View>

      <View style={styles.menuCard}>
        <Text style={[styles.menuSectionTitle, { color: colors.textPrimary }]}>Quick Access</Text>
        
        <Pressable
          style={({ pressed }) => [
            styles.menuListItem,
            pressed && { backgroundColor: colors.border }
          ]}
          onPress={() => navigation.navigate('Workspace')}
        >
          <View style={[styles.menuIcon, { backgroundColor: colors.accent + '15' }]}>
            <Ionicons name="folder-outline" size={20} color={colors.accent} />
          </View>
          <View style={styles.menuTextContainer}>
            <Text style={[styles.menuItemTitle, { color: colors.textPrimary }]}>Workspace</Text>
            <Text style={[styles.menuItemDesc, { color: colors.textSecondary }]}>Files, emails & shared resources</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.menuListItem,
            pressed && { backgroundColor: colors.border }
          ]}
          onPress={() => navigation.navigate('Status')}
        >
          <View style={[styles.menuIcon, { backgroundColor: '#10b981' + '15' }]}>
            <Ionicons name="pulse-outline" size={20} color="#10b981" />
          </View>
          <View style={styles.menuTextContainer}>
            <Text style={[styles.menuItemTitle, { color: colors.textPrimary }]}>Status & Uptime</Text>
            <Text style={[styles.menuItemDesc, { color: colors.textSecondary }]}>Service health monitoring</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
        </Pressable>
      </View>
      <Modal
        visible={activeTab !== null}
        animationType="slide"
        onRequestClose={() => setActiveTab(null)}
        statusBarTranslucent={Platform.OS === 'android'}
      >
        <StatusBar
          backgroundColor={Platform.OS === 'android' ? 'transparent' : colors.accent}
          barStyle="light-content"
          translucent={Platform.OS === 'android'}
        />
        <View style={{ flex: 1, backgroundColor: colors.background }}>
          {Platform.OS === 'ios' ? (
            <SafeAreaView style={{ backgroundColor: colors.accent }} edges={['top']}>
              <View style={[
                styles.modalHeader, 
                { 
                  backgroundColor: colors.accent, 
                  borderBottomWidth: 0,
                  paddingTop: 12,
                }
              ]}>
                <Pressable onPress={() => setActiveTab(null)} style={styles.modalHeaderBackButton}>
                  <Ionicons name="arrow-back" size={24} color="white" />
                </Pressable>
                <Text style={styles.modalHeaderTitleText}>
                  {activeTab === 'profile' && 'Profile'}
                  {activeTab === 'messages' && 'Messages'}
                  {activeTab === 'license' && 'License'}
                  {activeTab === 'orders' && 'Orders'}
                  {activeTab === 'invoices' && 'Invoices'}
                  {activeTab === 'tickets' && 'Support Tickets'}
                  {activeTab === 'settings' && 'Settings'}
                </Text>
                <View style={{ width: 40 }} />
              </View>
            </SafeAreaView>
          ) : (
            <View style={[
              styles.modalHeader, 
              { 
                backgroundColor: colors.accent, 
                borderBottomWidth: 0,
                paddingTop: (StatusBar.currentHeight || 0) + 12,
              }
            ]}>
              <Pressable onPress={() => setActiveTab(null)} style={styles.modalHeaderBackButton}>
                <Ionicons name="arrow-back" size={24} color="white" />
              </Pressable>
              <Text style={styles.modalHeaderTitleText}>
                {activeTab === 'profile' && 'Profile'}
                {activeTab === 'messages' && 'Messages'}
                {activeTab === 'license' && 'License'}
                {activeTab === 'orders' && 'Orders'}
                {activeTab === 'invoices' && 'Invoices'}
                {activeTab === 'tickets' && 'Support Tickets'}
                {activeTab === 'settings' && 'Settings'}
              </Text>
              <View style={{ width: 40 }} />
            </View>
          )}
          <View style={{ flex: 1 }}>
            <Screen>
              {renderTabContent()}
            </Screen>
          </View>
        </View>
      </Modal>

      <View style={styles.actionsCard}>
        <Pressable style={[styles.actionButton, styles.logoutButton, { borderColor: colors.danger }]} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={18} color={colors.danger} />
          <Text style={[styles.actionLabel, styles.logoutLabel, { color: colors.danger }]}>Logout</Text>
        </Pressable>
      </View>
      <Modal
        visible={showCreateTicket}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCreateTicket(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Create Support Ticket</Text>
              <Pressable onPress={() => setShowCreateTicket(false)}>
                <Ionicons name="close" size={24} color={colors.textPrimary} />
              </Pressable>
            </View>
            
            <ScrollView style={styles.modalBody}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Subject</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]}
                placeholder="Describe your issue briefly"
                placeholderTextColor={colors.muted}
                value={ticketSubject}
                onChangeText={setTicketSubject}
              />

              <Text style={[styles.label, { color: colors.textSecondary, marginTop: 12 }]}>Priority</Text>
              <View style={styles.priorityRow}>
                {(['low', 'medium', 'high'] as const).map((priority) => (
                  <Pressable
                    key={priority}
                    style={[
                      styles.priorityChip,
                      {
                        backgroundColor: ticketPriority === priority ? colors.accent : colors.surface,
                        borderColor: ticketPriority === priority ? colors.accent : colors.border,
                      },
                    ]}
                    onPress={() => setTicketPriority(priority)}
                  >
                    <Text
                      style={[
                        styles.priorityText,
                        { color: ticketPriority === priority ? '#fff' : colors.textPrimary },
                      ]}
                    >
                      {priority.charAt(0).toUpperCase() + priority.slice(1)}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <Text style={[styles.label, { color: colors.textSecondary, marginTop: 12 }]}>Message</Text>
              <TextInput
                style={[styles.textArea, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]}
                placeholder="Provide detailed information about your issue"
                placeholderTextColor={colors.muted}
                value={ticketMessage}
                onChangeText={setTicketMessage}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
              />

              {createTicketError && (
                <Text style={[styles.errorText, { color: colors.danger }]}>{createTicketError}</Text>
              )}
            </ScrollView>

            <View style={[styles.modalFooter, { borderTopColor: colors.border }]}>
              <Pressable
                style={[styles.modalButton, styles.cancelButton, { borderColor: colors.border }]}
                onPress={() => setShowCreateTicket(false)}
              >
                <Text style={[styles.modalButtonText, { color: colors.textPrimary }]}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.submitButton, { backgroundColor: colors.accent }]}
                onPress={handleCreateTicket}
                disabled={creatingTicket}
              >
                {creatingTicket ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={[styles.modalButtonText, { color: '#fff' }]}>Submit Ticket</Text>
                )}
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
      
      {/* 2FA Setup Modal */}
      <Modal
        visible={show2FASetup}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShow2FASetup(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Enable Two-Factor Authentication</Text>
              <Pressable onPress={() => setShow2FASetup(false)}>
                <Ionicons name="close" size={24} color={colors.textPrimary} />
              </Pressable>
            </View>
            
            <ScrollView style={styles.modalBody}>
              <Text style={[{ color: colors.textSecondary, marginBottom: 16 }]}>
                Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
              </Text>
              
              {qrCode && (
                <View style={{ alignItems: 'center', marginBottom: 16 }}>
                  <Text style={[{ color: colors.textPrimary, marginBottom: 8, textAlign: 'center' }]}>
                    QR Code will be displayed here
                  </Text>
                  <Text style={[{ color: colors.textSecondary, fontSize: 12, marginTop: 8 }]}>
                    Secret Key: {secret}
                  </Text>
                </View>
              )}
              
              <Text style={[styles.label, { color: colors.textSecondary, marginTop: 16 }]}>Verification Code</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]}
                placeholder="Enter 6-digit code"
                placeholderTextColor={colors.muted}
                value={twoFactorCode}
                onChangeText={setTwoFactorCode}
                keyboardType="number-pad"
                maxLength={6}
              />
              
              {twoFactorError && (
                <Text style={[styles.errorText, { color: colors.danger, marginTop: 8 }]}>{twoFactorError}</Text>
              )}
            </ScrollView>

            <View style={[styles.modalFooter, { borderTopColor: colors.border }]}>
              <Pressable
                style={[styles.modalButton, styles.cancelButton, { borderColor: colors.border }]}
                onPress={() => {
                  setShow2FASetup(false);
                  setTwoFactorCode('');
                  setTwoFactorError(null);
                }}
              >
                <Text style={[styles.modalButtonText, { color: colors.textPrimary }]}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.submitButton, { backgroundColor: colors.accent }]}
                onPress={handleVerify2FASetup}
                disabled={twoFactorLoading}
              >
                {twoFactorLoading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={[styles.modalButtonText, { color: '#fff' }]}>Verify & Enable</Text>
                )}
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
      
      {/* 2FA Disable Modal */}
      <Modal
        visible={show2FADisable}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShow2FADisable(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Disable Two-Factor Authentication</Text>
              <Pressable onPress={() => setShow2FADisable(false)}>
                <Ionicons name="close" size={24} color={colors.textPrimary} />
              </Pressable>
            </View>
            
            <ScrollView style={styles.modalBody}>
              <Text style={[{ color: colors.textSecondary, marginBottom: 16 }]}>
                Enter your 6-digit authentication code to disable 2FA.
              </Text>
              
              <Text style={[styles.label, { color: colors.textSecondary }]}>Verification Code</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]}
                placeholder="Enter 6-digit code"
                placeholderTextColor={colors.muted}
                value={twoFactorCode}
                onChangeText={setTwoFactorCode}
                keyboardType="number-pad"
                maxLength={6}
              />
              
              {twoFactorError && (
                <Text style={[styles.errorText, { color: colors.danger, marginTop: 8 }]}>{twoFactorError}</Text>
              )}
            </ScrollView>

            <View style={[styles.modalFooter, { borderTopColor: colors.border }]}>
              <Pressable
                style={[styles.modalButton, styles.cancelButton, { borderColor: colors.border }]}
                onPress={() => {
                  setShow2FADisable(false);
                  setTwoFactorCode('');
                  setTwoFactorError(null);
                }}
              >
                <Text style={[styles.modalButtonText, { color: colors.textPrimary }]}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.submitButton, { backgroundColor: colors.danger }]}
                onPress={handleDisable2FA}
                disabled={twoFactorLoading}
              >
                {twoFactorLoading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={[styles.modalButtonText, { color: '#fff' }]}>Disable 2FA</Text>
                )}
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
      
      {/* Active Sessions Modal */}
      <Modal
        visible={showSessions}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowSessions(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Active Sessions</Text>
              <Pressable onPress={() => setShowSessions(false)}>
                <Ionicons name="close" size={24} color={colors.textPrimary} />
              </Pressable>
            </View>
            
            <ScrollView style={styles.modalBody}>
              <Text style={[{ color: colors.textSecondary, marginBottom: 16 }]}>
                Devices currently logged into your account
              </Text>
              
              {sessions.length > 0 ? (
                sessions.map((session, index) => (
                  <View 
                    key={session.id || index} 
                    style={[{
                      backgroundColor: session.is_current ? colors.accent + '10' : colors.surface,
                      padding: 16,
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: session.is_current ? colors.accent : colors.border,
                      marginBottom: 12,
                    }]}
                  >
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                      <View style={{ flex: 1 }}>
                        <Text style={[{ color: colors.textPrimary, fontWeight: '600', fontSize: 15 }]}>
                          {session.device || 'Unknown Device'}
                        </Text>
                        {session.is_current && (
                          <View style={[{ backgroundColor: colors.accent, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, alignSelf: 'flex-start', marginTop: 4 }]}>
                            <Text style={[{ color: '#fff', fontSize: 11, fontWeight: '700' }]}>CURRENT</Text>
                          </View>
                        )}
                      </View>
                      {!session.is_current && (
                        <Pressable
                          onPress={() => handleRevokeSession(session.id)}
                          style={[{ backgroundColor: colors.danger + '20', padding: 8, borderRadius: 8 }]}
                        >
                          <Ionicons name="trash-outline" size={16} color={colors.danger} />
                        </Pressable>
                      )}
                    </View>
                    <Text style={[{ color: colors.textSecondary, fontSize: 13, marginTop: 4 }]}>
                      <Ionicons name="location-outline" size={14} /> {session.ip_address || 'Unknown IP'}
                    </Text>
                    <Text style={[{ color: colors.textSecondary, fontSize: 13, marginTop: 4 }]}>
                      <Ionicons name="time-outline" size={14} /> Last active: {session.last_activity ? new Date(session.last_activity).toLocaleString() : 'Unknown'}
                    </Text>
                  </View>
                ))
              ) : (
                <Text style={[{ color: colors.textSecondary, textAlign: 'center', marginTop: 20 }]}>
                  No active sessions found
                </Text>
              )}
              
              {sessions.length > 1 && (
                <Pressable
                  style={[{ backgroundColor: colors.danger + '10', padding: 14, borderRadius: 12, marginTop: 8, alignItems: 'center' }]}
                  onPress={handleRevokeAllSessions}
                >
                  <Text style={[{ color: colors.danger, fontWeight: '600' }]}>Revoke All Other Sessions</Text>
                </Pressable>
              )}
            </ScrollView>

            <View style={[styles.modalFooter, { borderTopColor: colors.border }]}>
              <Pressable
                style={[styles.modalButton, { backgroundColor: colors.accent, flex: 1 }]}
                onPress={() => setShowSessions(false)}
              >
                <Text style={[styles.modalButtonText, { color: '#fff' }]}>Close</Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </Screen>
  );
}

function EditableField({ label, value, onChangeText }: { label: string; value: string; onChangeText: (text: string) => void }) {
  const colors = useColors();
  return (
    <View style={styles.editableFieldWrapper}>
      <Text style={[styles.editableLabel, { color: colors.textSecondary }]}>{label}</Text>
      <TextInput
        style={[styles.editableInput, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]}
        placeholder={`Enter ${label.toLowerCase()}`}
        placeholderTextColor={colors.muted}
        value={value}
        onChangeText={onChangeText}
      />
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string | undefined | null }) {
  const colors = useColors();
  return (
    <View style={[styles.infoRow, { borderBottomColor: colors.border }]}>
      <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>{label}</Text>
      <Text style={[styles.infoValue, { color: colors.textPrimary }]}>{value || 'Not set'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  
  profileHeader: {
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIconButton: {
    padding: 8,
    marginLeft: 6,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontWeight: '800',
    fontSize: 24,
  },
  headerText: {
    flex: 1,
  },
  displayName: {
    fontWeight: '800',
    fontSize: 18,
  },
  email: {
    marginTop: 2,
    fontSize: 14,
  },
  roleBadge: {
    marginTop: 8,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
  },
  roleLabel: {
    fontWeight: '700',
    fontSize: 12,
    letterSpacing: 0.2,
  },
  infoCard: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontWeight: '800',
    marginBottom: 12,
  },
  subSectionTitle: {
    fontWeight: '800',
    fontSize: 15,
    marginTop: 16,
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  editableRow: {
    flexDirection: 'column',
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  sectionDivider: {
    borderTopWidth: 1,
    marginTop: 16,
    paddingTop: 16,
  },
  infoLabel: {
    fontWeight: '600',
  },
  infoValue: {
    fontWeight: '700',
  },
  actionsCard: {
    marginBottom: 20,
  },
  statsCard: {
    marginTop: -12,
    marginBottom: 16,
    flexGrow: 0,
    paddingLeft: 16,
  },
  statsScrollContent: {
    paddingRight: 16,
  },
  statCardItem: {
    padding: 14,
    borderRadius: 12,
    width: 110,
    height: 85,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statCardItemAndroid: {
    width: 100,
    height: 78,
    padding: 12,
  },
  statCardItemTablet: {
    width: 135,
    height: 88,
    padding: 16,
    borderWidth: 0,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statBlock: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 10,
  },
  actionLabel: {
    fontWeight: '700',
    marginLeft: 10,
  },
  logoutButton: {
    backgroundColor: 'transparent',
  },
  logoutLabel: {
  },
  tabContent: {
    marginBottom: 16,
  },
  tabTitle: {
    fontWeight: '800',
    fontSize: 18,
    marginBottom: 8,
  },
  tabDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  licenseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderTopWidth: 1,
  },
  licenseLabel: {
    fontSize: 13,
  },
  licenseValue: {
    fontWeight: '700',
    fontSize: 13,
  },
  usageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderTopWidth: 1,
  },
  usageLabel: {
    fontSize: 13,
  },
  usageValue: {
    fontWeight: '700',
    fontSize: 13,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 12,
  },
  addButtonLabel: {
    fontWeight: '700',
  subSectionTitle: {
    fontWeight: '800',
    marginTop: 16,
    marginBottom: 8,
  },
  sectionDivider: {
    borderTopWidth: 1,
    marginTop: 16,
    marginBottom: 12,
  },
  errorText: {
    marginBottom: 8,
  },
  successText: {
    marginBottom: 8,
  },
  addButton: {
    marginTop: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    flexDirection: 'row',
    gap: 8,
  },
  addButtonLabel: {
    fontWeight: '800',
    marginLeft: 6,
  },
  priorityPill: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    borderWidth: 1,
    marginRight: 8,
  },
    marginLeft: 8,
  },
  productRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  productName: {
    fontWeight: '700',
  },
  productStatus: {
    fontWeight: '700',
    fontSize: 12,
  },
  emptyMessage: {
    textAlign: 'center',
    marginTop: 16,
    fontSize: 14,
  },
  subscriptionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  subscriptionLabel: {
    fontSize: 13,
  },
  subscriptionValue: {
    fontWeight: '700',
    fontSize: 13,
  },
  profileEditHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  editableFieldWrapper: {
    marginBottom: 12,
  },
  editableLabel: {
    fontWeight: '600',
    marginBottom: 8,
    fontSize: 13,
  },
  editableInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  saveButton: {
    borderRadius: 10,
    paddingVertical: 12,
    marginTop: 16,
    alignItems: 'center',
  },
  saveButtonLabel: {
    fontWeight: '700',
    fontSize: 16,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderTopWidth: 1,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  settingValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  aliasCard: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  aliasHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  aliasLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  aliasEmail: {
    fontSize: 15,
    fontWeight: '700',
  },
  aliasBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  aliasBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  aliasForward: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  aliasForwardText: {
    fontSize: 13,
  },
  aliasDate: {
    fontSize: 12,
    marginTop: 4,
  },
  invoiceCard: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  invoiceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  invoiceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  invoiceNumber: {
    fontSize: 15,
    fontWeight: '700',
  },
  invoiceStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  invoiceStatusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  invoiceDetails: {
    marginBottom: 12,
  },
  invoiceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  invoiceLabel: {
    fontSize: 13,
  },
  invoiceAmount: {
    fontSize: 15,
    fontWeight: '700',
  },
  invoiceDate: {
    fontSize: 13,
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderWidth: 1,
    borderRadius: 8,
  },
  downloadButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  orderCard: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  orderStatusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  orderStatusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  progressContainer: {
    marginVertical: 14,
  },
  stepsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  stepCircle: {
    width: 24,
    height: 24,
    borderRadius: 999,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepLabel: {
    fontSize: 10,
    marginTop: 4,
    textAlign: 'center',
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
  },
  estimatedDelivery: {
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 8,
  },
  themeGrid: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  themeOption: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    gap: 8,
  },
  themeLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  checkboxRow: {
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  checkboxLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkboxDesc: {
    fontSize: 12,
    marginTop: 2,
  },
  pickerWrapper: {
    borderRadius: 10,
    borderWidth: 1,
    overflow: 'hidden',
    marginTop: 8,
  },
  pickerValue: {
    fontSize: 15,
    fontWeight: '500',
  },
  helperText: {
    fontSize: 12,
    marginTop: 8,
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '500',
  },
  securityGrid: {
    marginTop: 16,
    gap: 12,
  },
  securityCard: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  securityCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  securityCardTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  comingSoonBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  comingSoonText: {
    fontSize: 10,
    fontWeight: '700',
  },
  securityCardDesc: {
    fontSize: 12,
  },
  subscriptionCard: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 12,
  },
  subscriptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  subscriptionTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  activeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  activeBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  subscriptionDesc: {
    fontSize: 13,
    marginBottom: 8,
  },
  manageLink: {
    marginTop: 4,
  },
  manageLinkText: {
    fontSize: 13,
    fontWeight: '600',
  },
  invoiceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    borderTopWidth: 1,
    marginBottom: 8,
  },
  invoiceId: {
    fontSize: 14,
    fontWeight: '600',
  },
  invoiceDate: {
    fontSize: 12,
    marginTop: 2,
  },
  invoiceRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  invoiceAmount: {
    fontSize: 15,
    fontWeight: '700',
  },
  paidBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  paidBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  modalBody: {
    padding: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    minHeight: 120,
  },
  priorityRow: {
    flexDirection: 'row',
    gap: 8,
  },
  priorityChip: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  priorityText: {
    fontSize: 13,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 13,
    marginTop: 12,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelButton: {
    borderWidth: 1,
  },
  submitButton: {
    // background color set dynamically
  },
  modalButtonText: {
    fontSize: 15,
    fontWeight: '700',
  },
  ticketCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
  },
  ticketCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  ticketCardId: {
    fontSize: 13,
    fontWeight: '600',
  },
  ticketCardSubject: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    lineHeight: 22,
  },
  ticketCardBadges: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  ticketBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
  },
  ticketBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  ticketCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ticketCardDate: {
    fontSize: 12,
  },
  menuCard: {
    marginBottom: 12,
  },
  menuSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  menuListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 12,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuTextContainer: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  menuItemDesc: {
    fontSize: 13,
    lineHeight: 18,
  },
  badge: {
    backgroundColor: '#ef4444',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginRight: 8,
    minWidth: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  countText: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 8,
  },
  modalHeaderCard: {
    marginBottom: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 0,
  },
  modalHeaderBackButton: {
    padding: 4,
    width: 40,
  },
  modalHeaderTitleText: {
    fontSize: 20,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
    color: 'white',
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 4,
    width: 40,
  },
  modalHeaderTitle: {
    fontSize: 20,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
  },
  menuButton: {
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  submenuContainer: {
    width: '100%',
    maxWidth: 400,
  },
  submenuCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  submenuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  submenuTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  submenuContent: {
    padding: 0,
  },
  submenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    gap: 12,
  },
  submenuIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submenuTextContainer: {
    flex: 1,
  },
  submenuItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  submenuItemDesc: {
    fontSize: 13,
    lineHeight: 18,
  },
  deleteTicketButton: {
    padding: 8,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  priorityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
  },
  priorityBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
  },
  roleBadgeIcon: {
    width: 24,
    height: 24,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  roleContainer: {
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E7EB',
  },
  roleValue: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  roleIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  roleText: {
    fontSize: 15,
    fontWeight: '600',
  },
  storageCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 12,
  },
  storageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  storageLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  storagePercent: {
    fontSize: 14,
    fontWeight: '600',
  },
  storageBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  storageBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 999,
  },
});
