import type { Tables } from '@/types/supabase';

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
