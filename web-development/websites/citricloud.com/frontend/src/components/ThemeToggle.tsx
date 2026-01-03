import { useEffect, useState } from 'react';
import { FiMoon, FiSun, FiClock } from 'react-icons/fi';
import { useThemeStore, THEME_MODE_KEY, THEME_AUTO_SOURCE_KEY, ThemeMode, AutoSource } from '../store/themeStore';

export default function ThemeToggle({ compact = true }: { compact?: boolean }) {
  const { mode, autoSource, setMode, setAutoSource } = useThemeStore();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest('#theme-toggle')) setOpen(false);
    };
    window.addEventListener('click', onClick);
    return () => window.removeEventListener('click', onClick);
  }, []);

  const cycleMode = () => {
    const order: ThemeMode[] = ['light', 'dark', 'auto'];
    const next = order[(order.indexOf(mode) + 1) % order.length];
    setMode(next);
    try { localStorage.setItem(THEME_MODE_KEY, next); } catch {}
  };

  const selectAutoSource = (src: AutoSource) => {
    setAutoSource(src);
    try { localStorage.setItem(THEME_AUTO_SOURCE_KEY, src); } catch {}
  };

  const icon = mode === 'light' ? <FiSun className="w-5 h-5" /> : mode === 'dark' ? <FiMoon className="w-5 h-5" /> : <FiClock className="w-5 h-5" />;
  const label = mode === 'light' ? 'Light' : mode === 'dark' ? 'Dark' : 'Auto';

  if (compact) {
    return (
      <div id="theme-toggle" className="relative">
        <button
          aria-label="Toggle theme"
          title={`Theme: ${label}${mode==='auto' ? ` (${autoSource})` : ''}`}
          onClick={cycleMode}
          onContextMenu={(e) => { e.preventDefault(); setOpen((v) => !v); }}
          className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
        >
          {icon}
        </button>
        {open && (
          <div className="absolute right-0 top-full mt-2 w-44 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 rounded-xl p-2 shadow-lg border border-gray-200/60 dark:border-gray-700/60">
            <div className="px-2 py-1 text-xs uppercase text-gray-500 dark:text-gray-400">Auto source</div>
            <button onClick={() => selectAutoSource('sun')} className={`w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 ${autoSource==='sun' ? 'bg-primary-50/70 dark:bg-primary-500/10' : ''}`}>Sunrise/Sunset</button>
            <button onClick={() => selectAutoSource('system')} className={`w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 ${autoSource==='system' ? 'bg-primary-50/70 dark:bg-primary-500/10' : ''}`}>System Preference</button>
            <div className="px-2 pt-2 text-xs text-gray-500 dark:text-gray-400">Tip: right-click to open menu</div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div id="theme-toggle" className="relative">
      <button onClick={() => setOpen((v) => !v)} className="flex items-center space-x-2 px-3 h-9 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700">
        {icon}
        <span className="text-sm">{label}</span>
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 rounded-xl p-2 shadow-lg border border-gray-200/60 dark:border-gray-700/60">
          <div className="px-3 py-2 text-sm font-semibold">Theme</div>
          <div className="grid grid-cols-3 gap-2 px-2">
            <button onClick={() => setMode('light')} className={`px-3 py-2 rounded-lg border ${mode==='light' ? 'border-primary-500 bg-primary-50' : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>Light</button>
            <button onClick={() => setMode('dark')} className={`px-3 py-2 rounded-lg border ${mode==='dark' ? 'border-primary-500 bg-primary-50/50 dark:bg-primary-500/10' : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>Dark</button>
            <button onClick={() => setMode('auto')} className={`px-3 py-2 rounded-lg border ${mode==='auto' ? 'border-primary-500 bg-primary-50/50 dark:bg-primary-500/10' : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>Auto</button>
          </div>
          <div className="px-3 pt-2 text-xs uppercase text-gray-500 dark:text-gray-400">Auto source</div>
          <div className="px-2 pb-2 flex gap-2">
            <button onClick={() => selectAutoSource('sun')} className={`flex-1 px-3 py-2 rounded-lg border ${autoSource==='sun' ? 'border-primary-500 bg-primary-50/70 dark:bg-primary-500/10' : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>Sunrise/Sunset</button>
            <button onClick={() => selectAutoSource('system')} className={`flex-1 px-3 py-2 rounded-lg border ${autoSource==='system' ? 'border-primary-500 bg-primary-50/70 dark:bg-primary-500/10' : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>System</button>
          </div>
        </div>
      )}
    </div>
  );
}
