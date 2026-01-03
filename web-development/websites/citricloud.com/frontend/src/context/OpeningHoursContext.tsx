import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface OpeningTime {
  id: number;
  day: string;
  day_number: number; // 0 = Sunday, 1 = Monday, etc.
  open_time: string;
  close_time: string;
  is_open: boolean;
}

interface OpeningHoursContextType {
  openingHours: OpeningTime[];
  updateOpeningHours: (hours: OpeningTime[]) => void;
  isCurrentlyOpen: () => boolean;
  getCurrentDayHours: () => OpeningTime | undefined;
  getBusinessHoursText: () => string;
}

const OpeningHoursContext = createContext<OpeningHoursContextType | undefined>(undefined);

const DEFAULT_HOURS: OpeningTime[] = [
  { id: 1, day: 'Monday', day_number: 1, open_time: '09:00', close_time: '18:00', is_open: true },
  { id: 2, day: 'Tuesday', day_number: 2, open_time: '09:00', close_time: '18:00', is_open: true },
  { id: 3, day: 'Wednesday', day_number: 3, open_time: '09:00', close_time: '18:00', is_open: true },
  { id: 4, day: 'Thursday', day_number: 4, open_time: '09:00', close_time: '18:00', is_open: true },
  { id: 5, day: 'Friday', day_number: 5, open_time: '09:00', close_time: '18:00', is_open: true },
  { id: 6, day: 'Saturday', day_number: 6, open_time: '10:00', close_time: '16:00', is_open: true },
  { id: 7, day: 'Sunday', day_number: 0, open_time: '00:00', close_time: '00:00', is_open: false },
];

export function OpeningHoursProvider({ children }: { children: ReactNode }) {
  const [openingHours, setOpeningHours] = useState<OpeningTime[]>(() => {
    const stored = localStorage.getItem('opening-hours');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        return DEFAULT_HOURS;
      }
    }
    return DEFAULT_HOURS;
  });

  useEffect(() => {
    localStorage.setItem('opening-hours', JSON.stringify(openingHours));
  }, [openingHours]);

  const updateOpeningHours = (hours: OpeningTime[]) => {
    setOpeningHours(hours);
  };

  const getCurrentDayHours = () => {
    const now = new Date();
    const dayNumber = now.getDay();
    return openingHours.find(h => h.day_number === dayNumber);
  };

  const isCurrentlyOpen = () => {
    const todayHours = getCurrentDayHours();
    if (!todayHours || !todayHours.is_open) {
      return false;
    }

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    const [openHour, openMin] = todayHours.open_time.split(':').map(Number);
    const [closeHour, closeMin] = todayHours.close_time.split(':').map(Number);

    const openTime = openHour * 60 + openMin;
    const closeTime = closeHour * 60 + closeMin;

    return currentTime >= openTime && currentTime < closeTime;
  };

  const getBusinessHoursText = () => {
    const todayHours = getCurrentDayHours();
    if (!todayHours) return 'Hours not set';
    
    if (!todayHours.is_open) {
      return `${todayHours.day}: Closed`;
    }

    // Convert 24h to 12h format
    const formatTime = (time: string) => {
      const [hours, minutes] = time.split(':').map(Number);
      const period = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
      return `${displayHours}${minutes > 0 ? ':' + minutes.toString().padStart(2, '0') : ''}${period}`;
    };

    return `${todayHours.day}: ${formatTime(todayHours.open_time)}-${formatTime(todayHours.close_time)}`;
  };

  return (
    <OpeningHoursContext.Provider
      value={{
        openingHours,
        updateOpeningHours,
        isCurrentlyOpen,
        getCurrentDayHours,
        getBusinessHoursText,
      }}
    >
      {children}
    </OpeningHoursContext.Provider>
  );
}

export function useOpeningHours() {
  const context = useContext(OpeningHoursContext);
  if (!context) {
    throw new Error('useOpeningHours must be used within OpeningHoursProvider');
  }
  return context;
}
