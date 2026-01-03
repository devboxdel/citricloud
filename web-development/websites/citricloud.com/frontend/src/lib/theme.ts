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
  const { sunTimes, setSunTimes } = useThemeStore.getState();
  
  // Check if we have recent sun times (within last 6 hours)
  if (sunTimes?.computedAt) {
    const computedTime = new Date(sunTimes.computedAt).getTime();
    const now = Date.now();
    const sixHours = 6 * 60 * 60 * 1000;
    
    if (now - computedTime < sixHours) {
      // Use cached sun times
      const dark = isDarkNow(sunTimes);
      applyThemeClass(dark);
      scheduleNextSwitch(sunTimes);
      return;
    }
  }
  
  // Always try to get geolocation for sunrise/sunset
  try {
    const pos = await getCurrentPosition({ enableHighAccuracy: false, timeout: 6000, maximumAge: 86400_000 }); // 24 hours cache
    const sun = computeSunTimes(pos.coords.latitude, pos.coords.longitude);
    setSunTimes(sun);
    const dark = isDarkNow(sun);
    applyThemeClass(dark);
    scheduleNextSwitch(sun);
  } catch {
    // Fallback: use system preference if geolocation fails
    const systemPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    applyThemeClass(systemPrefersDark);
    // Retry geolocation after 1 minute
    setTimeout(() => initThemeOnLoad(), 60000);
  }
}
