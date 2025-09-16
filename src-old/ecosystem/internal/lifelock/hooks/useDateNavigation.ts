import { useState, useCallback } from 'react';

export interface UseDateNavigationReturn {
  currentDate: Date;
  setCurrentDate: (date: Date) => void;
  previousDay: () => void;
  nextDay: () => void;
  goToToday: () => void;
  isToday: boolean;
  formatDate: (format?: 'short' | 'long' | 'iso') => string;
}

const useDateNavigation = (initialDate?: Date): UseDateNavigationReturn => {
  const [currentDate, setCurrentDate] = useState<Date>(initialDate || new Date());

  const previousDay = useCallback(() => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() - 1);
      return newDate;
    });
  }, []);

  const nextDay = useCallback(() => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() + 1);
      return newDate;
    });
  }, []);

  const goToToday = useCallback(() => {
    setCurrentDate(new Date());
  }, []);

  const isToday = (() => {
    const today = new Date();
    return (
      currentDate.getDate() === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  })();

  const formatDate = useCallback((format: 'short' | 'long' | 'iso' = 'long') => {
    switch (format) {
      case 'short':
        return currentDate.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });
      case 'long':
        return currentDate.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
      case 'iso':
        return currentDate.toISOString().split('T')[0];
      default:
        return currentDate.toLocaleDateString();
    }
  }, [currentDate]);

  return {
    currentDate,
    setCurrentDate,
    previousDay,
    nextDay,
    goToToday,
    isToday,
    formatDate,
  };
};

export default useDateNavigation;