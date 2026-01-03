import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { clearPersistedColor, loadPersistedColor } from './themeStore';

export interface User {
  id: number;
  email: string;
  username: string;
  full_name?: string;
  role: string;
  is_active: boolean;
  avatar_url?: string;
  phone_number?: string;
  address?: string;
  city?: string;
  country?: string;
  zip_code?: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  setAuth: (user: User, accessToken: string, refreshToken: string) => Promise<void>;
  updateUser: (partial: Partial<User>) => void;
  logout: () => Promise<void>;
  loadFromStorage: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  loading: true,

  setAuth: async (user: User, accessToken: string, refreshToken?: string) => {
    try {
      // Validate required fields
      if (!user || !accessToken) {
        console.error('[AUTH] Missing required auth fields');
        return;
      }

      // Save tokens and user
      await AsyncStorage.setItem('access_token', accessToken);
      
      // Only save refreshToken if it exists
      if (refreshToken) {
        await AsyncStorage.setItem('refresh_token', refreshToken);
      } else {
        await AsyncStorage.removeItem('refresh_token');
      }
      
      await AsyncStorage.setItem('user', JSON.stringify(user));

      set({
        user,
        accessToken,
        refreshToken: refreshToken || null,
        isAuthenticated: true,
      });
      
      console.log('[AUTH] Login successful, loading user color preference');
      // Load persisted color for authenticated user
      await loadPersistedColor();
    } catch (error) {
      console.error('[AUTH] Failed to save auth state:', error);
    }
  },

  updateUser: (partial: Partial<User>) => {
    set((state) => ({
      user: state.user ? { ...state.user, ...partial } : null,
    }));
  },

  logout: async () => {
    try {
      await AsyncStorage.removeItem('access_token');
      await AsyncStorage.removeItem('refresh_token');
      await AsyncStorage.removeItem('user');
      // Clear persisted color and reset to default
      await clearPersistedColor();
      set({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
      });
      console.log('[AUTH] Logout complete, color reset to default');
    } catch (error) {
      console.error('[AUTH] Failed to logout:', error);
    }
  },

  loadFromStorage: async () => {
    try {
      const [accessToken, refreshToken, userStr] = await Promise.all([
        AsyncStorage.getItem('access_token'),
        AsyncStorage.getItem('refresh_token'),
        AsyncStorage.getItem('user'),
      ]);

      // Only require accessToken and user; refreshToken is optional
      if (accessToken && userStr) {
        const user = JSON.parse(userStr);
        set({
          user,
          accessToken,
          refreshToken: refreshToken || null,
          isAuthenticated: true,
          loading: false,
        });
        console.log('[AUTH] Loaded auth state from storage');
        // Load persisted color for authenticated user
        await loadPersistedColor();
      } else {
        console.log('[AUTH] No auth token in storage, user is guest');
        set({ loading: false });
      }
    } catch (error) {
      console.error('[AUTH] Failed to load from storage:', error);
      set({ loading: false });
    }
  },
}));
