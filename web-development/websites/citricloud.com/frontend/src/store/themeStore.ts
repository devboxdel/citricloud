import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ThemeMode = 'light' | 'dark' | 'auto';
export type AutoSource = 'sun' | 'system';

export interface SunTimes {
  sunrise?: string; // ISO string
  sunset?: string;  // ISO string
  lat?: number;
  lon?: number;
  computedAt?: string; // ISO string
}

interface ThemeState {
  mode: ThemeMode;
  autoSource: AutoSource;
  sunTimes: SunTimes | null;
  setMode: (mode: ThemeMode) => void;
  setAutoSource: (src: AutoSource) => void;
  setSunTimes: (sun: SunTimes | null) => void;
}

export const THEME_MODE_KEY = 'theme-mode';
export const THEME_AUTO_SOURCE_KEY = 'theme-auto-source';

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      mode: 'auto',
      autoSource: 'system',
      sunTimes: null,
      setMode: (mode) => {
        try { localStorage.setItem(THEME_MODE_KEY, mode); } catch {}
        set({ mode });
      },
      setAutoSource: (src) => {
        try { localStorage.setItem(THEME_AUTO_SOURCE_KEY, src); } catch {}
        set({ autoSource: src });
      },
      setSunTimes: (sun) => set({ sunTimes: sun }),
    }),
    { name: 'theme-storage' }
  )
);
