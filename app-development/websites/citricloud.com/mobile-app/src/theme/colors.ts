import { useColorScheme } from 'react-native';
import { getColors, darkColors } from './themes';
import { useThemeStore } from '../store/themeStore';

export const useColors = () => {
  const mode = useThemeStore((s) => s.mode);
  const primaryColor = useThemeStore((s) => s.primaryColor);
  const systemScheme = useColorScheme();
  const scheme = mode === 'auto' ? (systemScheme || 'dark') : mode;
  return getColors(scheme, primaryColor);
};

export const useEffectiveScheme = () => {
  const mode = useThemeStore((s) => s.mode);
  const systemScheme = useColorScheme();
  return mode === 'auto' ? (systemScheme || 'dark') : mode;
};

// For StyleSheet usage - will use dark colors but components will override with useColors()
export const colors = darkColors;
