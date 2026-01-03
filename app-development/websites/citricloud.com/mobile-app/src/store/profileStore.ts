import { create } from 'zustand';

export type UserProfile = {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
  company?: string;
  phone?: string;
  bio?: string;
  createdAt: string;
};

export type ProfileStore = {
  user: UserProfile | null;
  isAuthenticated: boolean;
  setUser: (user: UserProfile) => void;
  logout: () => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
};

export const useProfileStore = create<ProfileStore>((set) => ({
  user: null,
  isAuthenticated: false,
  
  setUser: (user: UserProfile) => 
    set({ user, isAuthenticated: true }),
  
  logout: () => 
    set({ user: null, isAuthenticated: false }),
  
  updateProfile: (updates: Partial<UserProfile>) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...updates } : null,
    })),
}));
