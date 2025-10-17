/**
 * useTodayXP Hook
 *
 * Fetches today's XP breakdown from GamificationService
 * Maps XP categories to LifeLock sections
 */

import { useMemo } from 'react';
import { GamificationService } from '@/services/gamificationService';

export interface TodayXPBreakdown {
  total: number;
  morningXP: number;
  lightWorkXP: number;
  deepWorkXP: number;
  wellnessXP: number;
  checkoutXP: number;
}

export function useTodayXP(date: Date): TodayXPBreakdown {
  return useMemo(() => {
    // Get today's XP stats from GamificationService
    const dailyStats = GamificationService.getDailyXPBreakdown(date);

    if (!dailyStats) {
      return {
        total: 0,
        morningXP: 0,
        lightWorkXP: 0,
        deepWorkXP: 0,
        wellnessXP: 0,
        checkoutXP: 0
      };
    }

    // Map XP categories to sections
    // Categories from GamificationService: routine, task, health, focus, habit
    const categories = dailyStats.categories;

    return {
      total: dailyStats.totalXP,
      morningXP: categories.routine, // Morning routine XP
      lightWorkXP: Math.floor(categories.task * 0.3), // ~30% of tasks are light work
      deepWorkXP: Math.floor(categories.task * 0.7) + categories.focus, // ~70% of tasks + focus sessions
      wellnessXP: categories.health, // Water, workout, nutrition
      checkoutXP: categories.habit // Nightly reflection
    };
  }, [date]);
}
