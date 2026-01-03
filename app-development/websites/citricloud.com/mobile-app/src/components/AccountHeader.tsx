import { View, Text, StyleSheet, Platform, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../theme/colors';
import { useAuthStore } from '../store/authStore';
import { useEffect, useState } from 'react';
import { crmAPI } from '../lib/api';

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

export function AccountHeader() {
  const colors = useColors();
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [roles, setRoles] = useState<any[]>([]);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const rolesData = await crmAPI.getRoles({ page: 1, page_size: 100 });
        if (rolesData) {
          const rolesList = Array.isArray(rolesData) ? rolesData : (rolesData?.data?.items || rolesData?.items || []);
          setRoles(rolesList);
        }
      } catch (error: any) {
        // Silently ignore 401 and 404 errors
        // 401: user doesn't have permission to view roles
        // 404: endpoint might not be available or routing issue
        if (error?.response?.status !== 401 && error?.response?.status !== 404) {
          console.error('[ACCOUNT_HEADER] Failed to fetch roles:', error);
        }
      }
    };

    if (isAuthenticated && user) {
      fetchRoles();
    }
  }, [isAuthenticated, user]);

  const getGreeting = () => {
    const now = new Date();
    const hour = now.getHours();
    if (hour < 12) return { text: 'Good morning', icon: 'sunny', color: '#F59E0B' };
    if (hour < 18) return { text: 'Good afternoon', icon: 'partly-sunny', color: '#3B82F6' };
    if (hour < 22) return { text: 'Good evening', icon: 'moon', color: '#8B5CF6' };
    return { text: 'Good night', icon: 'moon', color: '#6366F1' };
  };

  const getUserInitials = () => {
    if (!user?.full_name) return user?.username?.charAt(0).toUpperCase() || '?';
    const names = user.full_name.split(' ');
    if (names.length >= 2) {
      return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
    }
    return names[0].charAt(0).toUpperCase();
  };

  const getRoleBadgeColor = (roleKey: any) => {
    if (!roleKey) return '#6B7280';
    
    // If roleKey is an object with color property, use it directly
    if (typeof roleKey === 'object' && roleKey.color) {
      return ROLE_COLORS[roleKey.color] || '#6B7280';
    }
    
    // Otherwise, look up the role in the roles array by role_key
    const roleKeyString = typeof roleKey === 'string' ? roleKey : roleKey?.role_key || roleKey?.name || '';
    const role = roles.find((r: any) => r.role_key === roleKeyString);
    const color = role?.color || 'blue';
    
    return ROLE_COLORS[color] || '#3B82F6';
  };

  const getRoleName = (roleKey: any) => {
    if (!roleKey) return 'Member';
    
    // If roleKey is an object with name property, format and return it
    if (typeof roleKey === 'object' && roleKey.name) {
      return roleKey.name
        .split('_')
        .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
    }
    
    // Otherwise, look up the role in the roles array
    const roleKeyString = typeof roleKey === 'string' ? roleKey : '';
    const role = roles.find((r: any) => r.role_key === roleKeyString);
    
    if (role) {
      return role.name;
    }
    
    // Fallback: format the role key string
    return roleKeyString
      .split('_')
      .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const greeting = getGreeting();

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <SafeAreaView edges={['top']} style={[styles.headerContainer, { backgroundColor: colors.surface }]}>
      <View style={styles.profileSection}>
        <View style={[styles.avatarCircle, { backgroundColor: colors.accent }]}>
          <Text style={[styles.avatarText, { color: colors.background }]}>{getUserInitials()}</Text>
        </View>
        <View style={styles.profileInfo}>
          <View style={[styles.greetingBadge, { backgroundColor: greeting.color + '20', borderColor: greeting.color }]}>
            <Ionicons name={greeting.icon as any} size={14} color={greeting.color} />
            <Text style={[styles.greetingText, { color: greeting.color, fontSize: 12 }]}>{greeting.text}</Text>
          </View>
          <Text style={[styles.userName, { color: colors.textPrimary }]}>
            {user.full_name || user.username}
          </Text>
          <Text style={[styles.userEmail, { color: colors.textSecondary }]}>{user.email}</Text>
        </View>
        {user.role && (
          <View style={[styles.roleBadgeContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={[styles.roleBadgeIcon, { backgroundColor: getRoleBadgeColor(user.role) }]}>
              <Ionicons name="shield" size={14} color="white" />
            </View>
            <Text style={[styles.roleBadgeText, { color: colors.textPrimary }]}>{getRoleName(user.role)}</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    // SafeAreaView handles the top padding automatically
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingBottom: 0,
  },
  loginImageContainer: {
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 12,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },
  avatarCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '700',
  },
  profileInfo: {
    flex: 1,
  },
  userInfo: {
    flex: 1,
  },
  greetingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  greetingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 6,
  },
  greetingText: {
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 6,
  },
  greeting: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 2,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
  roleBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  roleBadgeIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  roleBadgeText: {
    fontSize: 13,
    fontWeight: '600',
  },
  roleBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
});
