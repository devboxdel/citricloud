export type ColorScheme = 'light' | 'dark';
export type ThemeMode = 'auto' | 'light' | 'dark';

export interface ThemeColors {
  background: string;
  surface: string;
  card: string;
  accent: string;
  accentSoft: string;
  textPrimary: string;
  textSecondary: string;
  border: string;
  muted: string;
  warning: string;
  danger: string;
  success: string;
}

export const getDarkColors = (primaryColor: string = '#0ea5e9'): ThemeColors => ({
  background: '#0b1220',
  surface: '#0f1b2d',
  card: '#12233b',
  accent: primaryColor,
  accentSoft: adjustColorBrightness(primaryColor, -30),
  textPrimary: '#e2e8f0',
  textSecondary: '#cbd5e1',
  border: '#1f2a44',
  muted: '#94a3b8',
  warning: '#f59e0b',
  danger: '#ef4444',
  success: '#10b981'
});

export const getLightColors = (primaryColor: string = '#0ea5e9'): ThemeColors => ({
  background: '#f8fafc',
  surface: '#f1f5f9',
  card: '#ffffff',
  accent: primaryColor,
  accentSoft: adjustColorBrightness(primaryColor, 40),
  textPrimary: '#0f172a',
  textSecondary: '#475569',
  border: '#e2e8f0',
  muted: '#64748b',
  warning: '#f59e0b',
  danger: '#ef4444',
  success: '#10b981'
});

// Helper function to adjust color brightness
function adjustColorBrightness(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = (num >> 8 & 0x00FF) + amt;
  const B = (num & 0x0000FF) + amt;
  return '#' + (
    0x1000000 +
    (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
    (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
    (B < 255 ? (B < 1 ? 0 : B) : 255)
  ).toString(16).slice(1).toUpperCase();
}

export const darkColors = getDarkColors();
export const lightColors = getLightColors();

export const getColors = (scheme: ColorScheme, primaryColor?: string): ThemeColors => {
  return scheme === 'light' ? getLightColors(primaryColor) : getDarkColors(primaryColor);
};
