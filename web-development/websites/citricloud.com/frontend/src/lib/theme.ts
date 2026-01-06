import SunCalc from 'suncalc';
import { SunTimes, useThemeStore } from '../store/themeStore';

// Version to force refresh when logic changes
const THEME_VERSION = 2;

export function applyThemeClass(isDark: boolean) {
  const root = document.documentElement;
  root.classList.toggle('dark', isDark);
  console.log('[Theme] Applied theme:', isDark ? 'dark' : 'light');
}

// Timezone to approximate coordinates mapping (major cities)
const TIMEZONE_COORDINATES: Record<string, { lat: number; lon: number }> = {
  'America/New_York': { lat: 40.7128, lon: -74.0060 },
  'America/Chicago': { lat: 41.8781, lon: -87.6298 },
  'America/Denver': { lat: 39.7392, lon: -104.9903 },
  'America/Los_Angeles': { lat: 34.0522, lon: -118.2437 },
  'America/Phoenix': { lat: 33.4484, lon: -112.0740 },
  'America/Toronto': { lat: 43.6532, lon: -79.3832 },
  'America/Vancouver': { lat: 49.2827, lon: -123.1207 },
  'America/Mexico_City': { lat: 19.4326, lon: -99.1332 },
  'America/Sao_Paulo': { lat: -23.5505, lon: -46.6333 },
  'America/Buenos_Aires': { lat: -34.6037, lon: -58.3816 },
  'Europe/London': { lat: 51.5074, lon: -0.1278 },
  'Europe/Paris': { lat: 48.8566, lon: 2.3522 },
  'Europe/Berlin': { lat: 52.5200, lon: 13.4050 },
  'Europe/Rome': { lat: 41.9028, lon: 12.4964 },
  'Europe/Madrid': { lat: 40.4168, lon: -3.7038 },
  'Europe/Amsterdam': { lat: 52.3676, lon: 4.9041 },
  'Europe/Brussels': { lat: 50.8503, lon: 4.3517 },
  'Europe/Vienna': { lat: 48.2082, lon: 16.3738 },
  'Europe/Stockholm': { lat: 59.3293, lon: 18.0686 },
  'Europe/Oslo': { lat: 59.9139, lon: 10.7522 },
  'Europe/Copenhagen': { lat: 55.6761, lon: 12.5683 },
  'Europe/Warsaw': { lat: 52.2297, lon: 21.0122 },
  'Europe/Prague': { lat: 50.0755, lon: 14.4378 },
  'Europe/Budapest': { lat: 47.4979, lon: 19.0402 },
  'Europe/Athens': { lat: 37.9838, lon: 23.7275 },
  'Europe/Istanbul': { lat: 41.0082, lon: 28.9784 },
  'Europe/Moscow': { lat: 55.7558, lon: 37.6173 },
  'Asia/Dubai': { lat: 25.2048, lon: 55.2708 },
  'Asia/Singapore': { lat: 1.3521, lon: 103.8198 },
  'Asia/Hong_Kong': { lat: 22.3193, lon: 114.1694 },
  'Asia/Shanghai': { lat: 31.2304, lon: 121.4737 },
  'Asia/Tokyo': { lat: 35.6762, lon: 139.6503 },
  'Asia/Seoul': { lat: 37.5665, lon: 126.9780 },
  'Asia/Bangkok': { lat: 13.7563, lon: 100.5018 },
  'Asia/Jakarta': { lat: -6.2088, lon: 106.8456 },
  'Asia/Manila': { lat: 14.5995, lon: 120.9842 },
  'Asia/Kolkata': { lat: 28.6139, lon: 77.2090 },
  'Asia/Karachi': { lat: 24.8607, lon: 67.0011 },
  'Asia/Tehran': { lat: 35.6892, lon: 51.3890 },
  'Australia/Sydney': { lat: -33.8688, lon: 151.2093 },
  'Australia/Melbourne': { lat: -37.8136, lon: 144.9631 },
  'Australia/Brisbane': { lat: -27.4698, lon: 153.0251 },
  'Australia/Perth': { lat: -31.9505, lon: 115.8605 },
  'Pacific/Auckland': { lat: -36.8485, lon: 174.7633 },
  'Pacific/Fiji': { lat: -18.1248, lon: 178.4501 },
  'Pacific/Honolulu': { lat: 21.3099, lon: -157.8581 },
  'Africa/Cairo': { lat: 30.0444, lon: 31.2357 },
  'Africa/Johannesburg': { lat: -26.2041, lon: 28.0473 },
  'Africa/Lagos': { lat: 6.5244, lon: 3.3792 },
  'Africa/Nairobi': { lat: -1.2864, lon: 36.8172 },
};

// Get coordinates from user's timezone
export function getCoordinatesFromTimezone(): { lat: number; lon: number } {
  try {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    console.log('[Theme] Detected timezone:', timezone);
    
    // Try exact match first
    if (TIMEZONE_COORDINATES[timezone]) {
      console.log('[Theme] Exact match found:', TIMEZONE_COORDINATES[timezone]);
      return TIMEZONE_COORDINATES[timezone];
    }
    
    // Try to find a match by region (e.g., America/Los_Angeles matches America/*)
    const region = timezone.split('/')[0];
    for (const [tz, coords] of Object.entries(TIMEZONE_COORDINATES)) {
      if (tz.startsWith(region + '/')) {
        console.log('[Theme] Regional match found:', tz, coords);
        return coords;
      }
    }
    
    // Fallback to UTC coordinates (London)
    console.log('[Theme] No match found, using fallback (London)');
    return { lat: 51.5074, lon: -0.1278 };
  } catch {
    // Ultimate fallback
    console.log('[Theme] Error detecting timezone, using fallback (London)');
    return { lat: 51.5074, lon: -0.1278 };
  }
}

export function computeSunTimes(lat: number, lon: number, date: Date = new Date()): SunTimes {
  // SunCalc.getTimes expects a date and interprets it in UTC, but we want local day
  // Pass the date directly without reconstruction to avoid timezone shifts
  const times = SunCalc.getTimes(date, lat, lon);
  
  console.log('[Theme] Computing sun times for:', { lat, lon, date: date.toISOString() });
  console.log('[Theme] Sunrise:', times.sunrise?.toISOString(), 'Sunset:', times.sunset?.toISOString());
  
  // Store times as timestamps (ms since epoch) which are already in local timezone
  return {
    sunrise: times.sunrise?.getTime().toString(),
    sunset: times.sunset?.getTime().toString(),
    lat,
    lon,
    computedAt: new Date().getTime().toString(),
  };
}

export function isDarkNow(sun: SunTimes | null, now: Date = new Date()): boolean {
  if (!sun?.sunrise || !sun?.sunset) return false;
  // Parse timestamps directly to avoid timezone issues
  const sunriseMs = parseInt(sun.sunrise, 10);
  const sunsetMs = parseInt(sun.sunset, 10);
  const nowMs = now.getTime();
  
  const isDark = nowMs < sunriseMs || nowMs >= sunsetMs;
  
  console.log('[Theme] Checking if dark:', {
    now: now.toLocaleString(),
    nowMs,
    sunrise: new Date(sunriseMs).toLocaleString(),
    sunriseMs,
    sunset: new Date(sunsetMs).toLocaleString(),
    sunsetMs,
    isDark
  });
  
  return isDark;
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
    const sunriseMs = parseInt(sun.sunrise, 10);
    const sunsetMs = parseInt(sun.sunset, 10);
    const nowMs = now.getTime();
    // Determine next boundary time in ms
    let nextMs: number;
    if (nowMs < sunriseMs) nextMs = sunriseMs;
    else if (nowMs < sunsetMs) nextMs = sunsetMs;
    else {
      // After sunset: schedule for tomorrow sunrise (recompute tomorrow in local timezone)
      const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      const tomorrowTimes = SunCalc.getTimes(tomorrow, sun.lat!, sun.lon!);
      nextMs = tomorrowTimes.sunrise.getTime();
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

export function initThemeOnLoad() {
  try {
    // Get coordinates based on device timezone (no location permission needed)
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const coords = getCoordinatesFromTimezone();
    const stored = useThemeStore.getState().sunTimes;
    let sun = stored;
    
    // Check version and force refresh if version changed
    const storedVersion = localStorage.getItem('theme-version');
    const versionChanged = storedVersion !== THEME_VERSION.toString();
    
    // Store debug info in localStorage for troubleshooting
    localStorage.setItem('theme-debug-tz', timezone);
    localStorage.setItem('theme-debug-coords', JSON.stringify(coords));
    
    if (versionChanged) {
      console.log('[Theme] Version changed, forcing refresh');
      localStorage.setItem('theme-version', THEME_VERSION.toString());
    }
    
    // Check if we need to recompute (daily or if coordinates changed significantly or version changed)
    const needsRefresh = versionChanged ||
      !stored?.computedAt || 
      (new Date().getTime() - parseInt(stored.computedAt, 10) > 24 * 60 * 60 * 1000) ||
      !stored?.lat || !stored?.lon ||
      Math.abs(stored.lat - coords.lat) > 1 || Math.abs(stored.lon - coords.lon) > 1;
    
    console.log('[Theme] Need refresh?', needsRefresh, {
      versionChanged,
      hasStoredTime: !!stored?.computedAt,
      age: stored?.computedAt ? (new Date().getTime() - parseInt(stored.computedAt, 10)) / 1000 / 60 / 60 : 0,
      storedCoords: stored ? { lat: stored.lat, lon: stored.lon } : null,
      newCoords: coords
    });
    
    if (needsRefresh) {
      sun = computeSunTimes(coords.lat, coords.lon);
      useThemeStore.setState({ sunTimes: sun });
      localStorage.setItem('theme-debug-sun', JSON.stringify(sun));
    }
    
    // Apply theme based on sunrise/sunset
    if (sun) {
      const dark = isDarkNow(sun);
      const now = new Date();
      
      // Store decision details
      localStorage.setItem('theme-debug-decision', JSON.stringify({
        dark,
        now: now.toISOString(),
        nowMs: now.getTime(),
        sunrise: sun.sunrise ? new Date(parseInt(sun.sunrise, 10)).toISOString() : null,
        sunriseMs: sun.sunrise,
        sunset: sun.sunset ? new Date(parseInt(sun.sunset, 10)).toISOString() : null,
        sunsetMs: sun.sunset
      }));
      
      applyThemeClass(dark);
      scheduleNextSwitch(sun);
    } else {
      // Fallback to system preference
      const systemPrefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
      console.log('[Theme] No sun data, using system preference:', systemPrefersDark);
      applyThemeClass(systemPrefersDark);
    }
  } catch (error) {
    console.error('[Theme] Error initializing theme:', error);
    // Final fallback to system preference
    const systemPrefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
    applyThemeClass(systemPrefersDark);
  }
}
