import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface SunTimes {
  sunrise?: string; // ISO string
  sunset?: string;  // ISO string
  lat?: number;
  lon?: number;
  computedAt?: string; // ISO string
}

interface ThemeState {
  sunTimes: SunTimes | null;
  setSunTimes: (sun: SunTimes | null) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      sunTimes: null,
      setSunTimes: (sun) => set({ sunTimes: sun }),
    }),
    { name: 'theme-storage' }
  )
);
