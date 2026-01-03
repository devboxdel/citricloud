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
  try {
    // Get user's geolocation once and store it
    const stored = useThemeStore.getState().sunTimes;
    let sun = stored;
    
    // If no stored location or it's old (>24h), get fresh location
    const needsRefresh = !stored?.computedAt || 
      (new Date().getTime() - new Date(stored.computedAt).getTime() > 24 * 60 * 60 * 1000);
    
    if (needsRefresh) {
      try {
        const pos = await getCurrentPosition({ timeout: 5000, maximumAge: 24 * 60 * 60 * 1000 });
        sun = computeSunTimes(pos.coords.latitude, pos.coords.longitude);
        useThemeStore.setState({ sunTimes: sun });
      } catch (err) {
        // If geolocation fails, use stored data or fall back to system preference
        if (!stored) {
          const systemPrefersDark = window.matchMedia?.('(prefers-color-mark: dark)').matches;
          applyThemeClass(systemPrefersDark);
          return;
        }
      }
    }
    
    // Apply theme based on sunrise/sunset
    if (sun) {
      const dark = isDarkNow(sun);
      applyThemeClass(dark);
      scheduleNextSwitch(sun);
    } else {
      // Fallback to system preference
      const systemPrefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
      applyThemeClass(systemPrefersDark);
    }
  } catch (error) {
    // Final fallback to system preference
    const systemPrefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
    applyThemeClass(systemPrefersDark);
  }
}
