/**
 * useTodayXP Hook
 *
 * Fetches today's XP breakdown from GamificationService
 * Maps XP categories to LifeLock sections and keeps the values
 * in sync with real-time gamification updates.
 */

import { useEffect, useMemo, useState } from 'react';
import { GamificationService } from '@/domains/lifelock/_shared/services/gamificationService';

export interface TodayXPBreakdown {
  total: number;
  morningXP: number;
  lightWorkXP: number;
  deepWorkXP: number;
  wellnessXP: number;
  checkoutXP: number;
}

const EMPTY_BREAKDOWN: TodayXPBreakdown = {
  total: 0,
  morningXP: 0,
  lightWorkXP: 0,
  deepWorkXP: 0,
  wellnessXP: 0,
  checkoutXP: 0
};

const GAMIFICATION_STORAGE_KEY = 'siso_gamification_data';
const GAMIFICATION_EVENT = 'sisoGamificationProgressUpdated';

function computeBreakdown(date: Date): TodayXPBreakdown {
  const dailyStats = GamificationService.getDailyXPBreakdown(date);

  if (!dailyStats) {
    return { ...EMPTY_BREAKDOWN };
  }

  const categories = dailyStats.categories ?? {
    routine: 0,
    task: 0,
    health: 0,
    focus: 0,
    habit: 0
  };

  return {
    total: dailyStats.totalXP,
    morningXP: categories.routine, // Morning routine XP
    lightWorkXP: Math.floor(categories.task * 0.3), // ~30% of tasks are light work
    deepWorkXP: Math.floor(categories.task * 0.7) + categories.focus, // ~70% of tasks + focus sessions
    wellnessXP: categories.health, // Water, workout, nutrition
    checkoutXP: categories.habit // Nightly reflection
  };
}

export function useTodayXP(date: Date): TodayXPBreakdown {
  const [breakdown, setBreakdown] = useState<TodayXPBreakdown>(() => computeBreakdown(date));

  // Normalize the date so effects rerun when the calendar day changes
  const dateKey = useMemo(() => {
    if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
      const today = new Date();
      return today.toISOString().split('T')[0];
    }
    return date.toISOString().split('T')[0];
  }, [date]);

  useEffect(() => {
    // Ensure we pick up the latest data on mount/date change
    setBreakdown(computeBreakdown(date));

    if (typeof window === 'undefined') {
      return;
    }

    const updateFromService = () => {
      setBreakdown(computeBreakdown(date));
    };

    const handleStorageUpdate = (event: StorageEvent) => {
      if (event.key && event.key !== GAMIFICATION_STORAGE_KEY) {
        return;
      }
      updateFromService();
    };

    window.addEventListener(GAMIFICATION_EVENT, updateFromService);
    window.addEventListener('storage', handleStorageUpdate);

    return () => {
      window.removeEventListener(GAMIFICATION_EVENT, updateFromService);
      window.removeEventListener('storage', handleStorageUpdate);
    };
  }, [date, dateKey]);

  return breakdown;
}
