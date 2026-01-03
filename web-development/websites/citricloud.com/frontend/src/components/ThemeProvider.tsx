import { ReactNode, useEffect } from 'react';
import { initThemeOnLoad } from '../lib/theme';

export default function ThemeProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    initThemeOnLoad();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <>{children}</>;
}
