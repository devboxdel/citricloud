import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ColorScheme, ThemeMode } from '../theme/themes';

interface ThemeState {
  mode: ThemeMode;
  primaryColor: string;
  setMode: (mode: ThemeMode) => void;
  setPrimaryColor: (color: string) => void;
  cycleMode: () => void;
}

// Manual AsyncStorage persistence (separate from store to avoid modal close issues)
const saveColorToStorage = async (color: string) => {
  try {
    await AsyncStorage.setItem('theme-primaryColor', color);
  } catch (error) {
    console.error('[THEME STORE] Failed to save color:', error);
  }
};

// Default color constant
export const DEFAULT_PRIMARY_COLOR = '#0ea5e9'; // CitriCloud blue

export const useThemeStore = create<ThemeState>()((set, get) => ({
    mode: 'auto',
    primaryColor: DEFAULT_PRIMARY_COLOR,
    setMode: (mode) => {
      console.log('[THEME STORE] setMode called with:', mode);
      set({ mode });
    },
    setPrimaryColor: (color) => {
      console.log('[THEME STORE] setPrimaryColor called with:', color);
      console.log('[THEME STORE] Current color:', get().primaryColor);
      set({ primaryColor: color });
      console.log('[THEME STORE] New color:', get().primaryColor);
      // Save to AsyncStorage manually (non-blocking)
      saveColorToStorage(color);
    },
    cycleMode: () => set((state) => ({
      mode: state.mode === 'auto' ? 'light' : state.mode === 'light' ? 'dark' : 'auto'
    })),
  })
);

// Load persisted color (only called when user is authenticated)
export const loadPersistedColor = async () => {
  try {
    const saved = await AsyncStorage.getItem('theme-primaryColor');
    if (saved) {
      console.log('[THEME STORE] Loading persisted color for authenticated user:', saved);
      useThemeStore.getState().setPrimaryColor(saved);
    } else {
      console.log('[THEME STORE] No persisted color found, using default');
    }
  } catch (error) {
    console.error('[THEME STORE] Failed to load persisted color:', error);
  }
};

// Clear persisted color (called on logout)
export const clearPersistedColor = async () => {
  try {
    await AsyncStorage.removeItem('theme-primaryColor');
    console.log('[THEME STORE] Cleared persisted color');
    useThemeStore.getState().setPrimaryColor(DEFAULT_PRIMARY_COLOR);
  } catch (error) {
    console.error('[THEME STORE] Failed to clear persisted color:', error);
  }
};

// Reset to default color (for guests/visitors)
export const resetToDefaultColor = () => {
  console.log('[THEME STORE] Resetting to default color for guest/visitor');
  useThemeStore.getState().setPrimaryColor(DEFAULT_PRIMARY_COLOR);
};
