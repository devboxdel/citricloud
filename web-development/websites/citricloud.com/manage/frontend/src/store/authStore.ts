import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: number;
  email: string;
  full_name: string;
  role: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  clearAuth: () => void;
  updateUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      setAuth: (user, accessToken, refreshToken) => {
        // Also set cookies for cross-subdomain sharing
        document.cookie = `access_token=${accessToken}; domain=.citricloud.com; path=/; max-age=${30 * 60}; secure; samesite=lax`;
        document.cookie = `user=${encodeURIComponent(JSON.stringify(user))}; domain=.citricloud.com; path=/; max-age=${30 * 60}; secure; samesite=lax`;
        
        set({
          user,
          accessToken,
          refreshToken,
          isAuthenticated: true,
        });
      },
      clearAuth: () => {
        // Clear cookies
        document.cookie = 'access_token=; domain=.citricloud.com; path=/; max-age=0';
        document.cookie = 'user=; domain=.citricloud.com; path=/; max-age=0';
        
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        });
      },
      updateUser: (user) => set({ user }),
    }),
    {
      name: 'citricloud-auth',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
