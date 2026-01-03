import { ReactNode, useEffect } from 'react';
import { useThemeStore } from '../store/themeStore';
import { applyThemeClass, initThemeOnLoad, scheduleNextSwitch } from '../lib/theme';

export default function ThemeProvider({ children }: { children: ReactNode }) {
  const { mode, autoSource, sunTimes } = useThemeStore();

  useEffect(() => {
    initThemeOnLoad();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Whenever mode or source changes, apply immediately
    if (mode === 'auto') applyThemeClass('auto');
    else applyThemeClass(mode);
    scheduleNextSwitch(autoSource, sunTimes);
  }, [mode, autoSource, sunTimes]);

  return <>{children}</>;
}
