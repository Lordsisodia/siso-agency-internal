/**
 * Stats Domain Types
 *
 * Consolidated tracking for Smoking and Water stats
 */

import type { Tables } from '@/types/supabase';

// Water Types (re-exported from wellness domain)
export type WaterLogRow = Tables<'water_log'>;

export interface WaterLogEntry {
  id: string;
  date: string;
  amountMl: number;
  timestamp: string;
}

export interface WaterTrackerSnapshot {
  goalMl: number;
  dailyTotalMl: number;
  percentage: number;
  lastLogAt: string | null;
  streakCount: number;
  entries: WaterLogEntry[];
  historyTotals: Record<string, number>;
}

export interface WaterGoalPreferences {
  goalMl: number;
  preferencesId: string | null;
}

// Smoking Types (re-exported from wellness domain)
export interface SmokingSnapshot {
  date: string;
  cigarettes: number;
  cravings: number;
  streakData: {
    currentSmokeFreeDays: number;
    longestSmokeFreeStreak: number;
    totalCigarettesThisWeek: number;
    totalCigarettesThisMonth: number;
  };
}

export interface SmokingLogEntry {
  id: string;
  date: string;
  cigarettes: number;
  cravings: number;
  timestamp: string;
}

// Combined Stats Types
export interface DailyStatsSnapshot {
  date: string;
  water: WaterTrackerSnapshot;
  smoking: SmokingSnapshot;
}

export interface StatsSummary {
  water: {
    dailyTotalMl: number;
    goalMl: number;
    percentage: number;
    streakDays: number;
  };
  smoking: {
    cigarettesToday: number;
    cravingsResisted: number;
    smokeFreeDays: number;
  };
}
