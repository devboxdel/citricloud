import SunCalc from 'suncalc';
import { SunTimes, useThemeStore } from '../store/themeStore';

export function applyThemeClass(isDark: boolean) {
  const root = document.documentElement;
  root.classList.toggle('dark', isDark);
}

export async function getCurrentPosition(options?: PositionOptions): Promise<GeolocationPosition> {
  if (!('geolocation' in navigator)) throw new Error('geolocation_unavailable');
  return new Promise((resolve, reject) => navigator.geolocation.getCurrentPosition(resolve, reject, options));
}

export function computeSunTimes(lat: number, lon: number, date: Date = new Date()): SunTimes {
  const times = SunCalc.getTimes(date, lat, lon);
  return {
    sunrise: times.sunrise?.toISOString(),
    sunset: times.sunset?.toISOString(),
    lat,
    lon,
    computedAt: new Date().toISOString(),
  };
}

export function isDarkNow(sun: SunTimes | null, now: Date = new Date()): boolean {
  if (!sun?.sunrise || !sun?.sunset) return false;
  const sunrise = new Date(sun.sunrise);
  const sunset = new Date(sun.sunset);
  return now < sunrise || now >= sunset;
}

let nextSwitchTimer: number | null = null;

export function clearNextSwitchTimer() {
  if (nextSwitchTimer) {
    window.clearTimeout(nextSwitchTimer);
    nextSwitchTimer = null;
  }
}

export function scheduleNextSwitch(sun: SunTimes | null) {
  clearNextSwitchTimer();
  try {
    if (!sun?.sunrise || !sun?.sunset) return;
    const now = new Date();
    const sunrise = new Date(sun.sunrise).getTime();
    const sunset = new Date(sun.sunset).getTime();
    const nowMs = now.getTime();
    // Determine next boundary time in ms
    let nextMs: number;
    if (nowMs < sunrise) nextMs = sunrise;
    else if (nowMs < sunset) nextMs = sunset;
    else {
      // After sunset: schedule for tomorrow sunrise (recompute tomorrow)
      const tomorrow = new Date(now);
      tomorrow.setDate(now.getDate() + 1);
      nextMs = new Date(SunCalc.getTimes(tomorrow, sun.lat!, sun.lon!).sunrise).getTime();
    }
    const delay = Math.max(1000, nextMs - nowMs);
    nextSwitchTimer = window.setTimeout(() => {
      // Re-apply and recompute for the new day
      const dark = isDarkNow(sun);
      applyThemeClass(dark);
      scheduleNextSwitch(sun);
    }, delay);
  } catch (e) {
    // noop
  }
}

export async function initThemeOnLoad() {
  // Use system preference without geolocation
  const systemPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  applyThemeClass(systemPrefersDark);
  
  // Watch for system theme changes
  if (window.matchMedia) {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      applyThemeClass(e.matches);
    };
    
    // Use addEventListener for modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else if (mediaQuery.addListener) {
      // Fallback for older browsers
      mediaQuery.addListener(handleChange);
    }
  }
}
