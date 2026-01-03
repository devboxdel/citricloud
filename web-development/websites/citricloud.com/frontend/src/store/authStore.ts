import { create } from 'zustand';
import api, { profileAPI } from '../lib/api';

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
  province?: string;
  district?: string;
  block?: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  updateUser: (partial: Partial<User>) => void;
  logout: () => void;
  loadFromStorage: () => Promise<void>;
}

// Helper functions to interact with localStorage AND cookies
const saveToStorage = (user: User, accessToken: string, refreshToken: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
    localStorage.setItem('user', JSON.stringify(user));
    // Save to cookies for cross-subdomain access
    const hostname = window.location.hostname;
    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toUTCString(); // 7 days
    // Set cookies with .citricloud.com domain for cross-subdomain access
    if (typeof document !== 'undefined') {
      if (hostname.includes('citricloud.com')) {
        // Use SameSite=Lax for cross-subdomain navigation (allows document.cookie to read them)
        document.cookie = `access_token=${accessToken}; domain=.citricloud.com; path=/; expires=${expires}; Secure; SameSite=Lax`;
        document.cookie = `refresh_token=${refreshToken}; domain=.citricloud.com; path=/; expires=${expires}; Secure; SameSite=Lax`;
        document.cookie = `user=${encodeURIComponent(JSON.stringify(user))}; domain=.citricloud.com; path=/; expires=${expires}; Secure; SameSite=Lax`;
      } else {
        // For localhost/development
        document.cookie = `access_token=${accessToken}; path=/; expires=${expires}; SameSite=Lax`;
        document.cookie = `refresh_token=${refreshToken}; path=/; expires=${expires}; SameSite=Lax`;
        document.cookie = `user=${encodeURIComponent(JSON.stringify(user))}; path=/; expires=${expires}; SameSite=Lax`;
      }
    }
  }
};

const getCookie = (name: string): string | null => {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    const val = parts.pop()?.split(';').shift();
    return val ? decodeURIComponent(val) : null;
  }
  return null;
};

const loadFromStorage = () => {
  let accessToken = null;
  let refreshToken = null;
  let userStr = null;
  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    // Try cookies first (for cross-subdomain)
    accessToken = getCookie('access_token');
    refreshToken = getCookie('refresh_token');
    userStr = getCookie('user');
    // Fallback to localStorage (same subdomain)
    if (!accessToken) {
      accessToken = localStorage.getItem('access_token');
      refreshToken = localStorage.getItem('refresh_token');
      userStr = localStorage.getItem('user');
    }
  }
  if (accessToken && refreshToken && userStr) {
    try {
      const user = JSON.parse(userStr);
      return { user, accessToken, refreshToken, isAuthenticated: true };
    } catch (e) {
      if (typeof window !== 'undefined') {
        console.error('[AUTH] Failed to parse user:', e);
      }
    }
  }
  return { user: null, accessToken: null, refreshToken: null, isAuthenticated: false };
};

const clearStorage = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  }
  // Clear cookies
  if (typeof document !== 'undefined') {
    const domain = '.citricloud.com';
    document.cookie = `access_token=; domain=${domain}; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    document.cookie = `refresh_token=; domain=${domain}; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    document.cookie = `user=; domain=${domain}; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  }
};

export const useAuthStore = create<AuthState>((set) => ({
  // Initialize auth state from localStorage synchronously
  ...loadFromStorage(),
  
  setAuth: (user, accessToken, refreshToken) => {
    saveToStorage(user, accessToken, refreshToken);
    set({ user, accessToken, refreshToken, isAuthenticated: true });
  },
  
  updateUser: (partial) =>
    set((state) => {
      if (state.user) {
        const updatedUser = { ...state.user, ...partial };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        return { user: updatedUser };
      }
      return state;
    }),
  
  logout: () => {
    clearStorage();
    set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
    
    // Reset primary color to default sky on logout
    const root = document.documentElement;
    root.style.setProperty('--color-primary-50', '240 249 255');
    root.style.setProperty('--color-primary-100', '224 242 254');
    root.style.setProperty('--color-primary-200', '186 230 253');
    root.style.setProperty('--color-primary-300', '125 211 252');
    root.style.setProperty('--color-primary-400', '56 189 248');
    root.style.setProperty('--color-primary-500', '14 165 233');
    root.style.setProperty('--color-primary-600', '2 132 199');
    root.style.setProperty('--color-primary-700', '3 105 161');
    root.style.setProperty('--color-primary-800', '7 89 133');
    root.style.setProperty('--color-primary-900', '12 74 110');
  },
  
  loadFromStorage: async () => {
    // This method is now a no-op since we load synchronously on init
    // Kept for backward compatibility
  },
}));
