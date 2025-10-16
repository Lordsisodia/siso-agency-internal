import { format, subDays } from 'date-fns';
import { supabase } from '@/shared/lib/supabase';
import type { Tables, TablesInsert } from '@/types/supabase';
import type {
  WaterGoalPreferences,
  WaterLogEntry,
  WaterTrackerSnapshot
} from '@/ecosystem/internal/lifelock/wellness/types';

const DEFAULT_GOAL_ML = 2000;
const WATER_HISTORY_LOOKBACK_DAYS = 30;

const mapRowToEntry = (row: Tables<'water_log'>): WaterLogEntry => ({
  id: row.id,
  date: row.date,
  amountMl: row.amount_ml,
  timestamp: row.timestamp,
});

class WaterService {
  async getOrCreatePreferences(userId: string): Promise<WaterGoalPreferences> {
    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        const insertPayload: TablesInsert<'user_preferences'> = {
          user_id: userId,
          water_goal_ml: DEFAULT_GOAL_ML,
        };

        const { data: inserted, error: insertError } = await supabase
          .from('user_preferences')
          .insert(insertPayload)
          .select('*')
          .single();

        if (insertError) {
          console.error('[WaterService] Failed to seed user preferences', insertError);
          throw insertError;
        }

        return {
          goalMl: inserted?.water_goal_ml ?? DEFAULT_GOAL_ML,
          preferencesId: inserted?.id ?? null,
        };
      }

      console.error('[WaterService] Failed to load preferences', error);
      throw error;
    }

    return {
      goalMl: data?.water_goal_ml ?? DEFAULT_GOAL_ML,
      preferencesId: data?.id ?? null,
    };
  }

  async getTrackerSnapshot(userId: string, date: string): Promise<WaterTrackerSnapshot> {
    const { goalMl } = await this.getOrCreatePreferences(userId);

    const lookbackStart = format(subDays(new Date(date), WATER_HISTORY_LOOKBACK_DAYS - 1), 'yyyy-MM-dd');

    const { data, error } = await supabase
      .from('water_log')
      .select('*')
      .eq('user_id', userId)
      .gte('date', lookbackStart)
      .lte('date', date)
      .order('timestamp', { ascending: true });

    if (error && error.code !== 'PGRST116') {
      console.error('[WaterService] Failed to fetch water logs', error);
      throw error;
    }

    const rows = data ?? [];
    const entries = rows.map(mapRowToEntry);

    const totalsMap = new Map<string, number>();

    for (const entry of entries) {
      const currentTotal = totalsMap.get(entry.date) ?? 0;
      const nextTotal = currentTotal + entry.amountMl;
      totalsMap.set(entry.date, Math.max(0, nextTotal));
    }

    const dailyTotalMl = totalsMap.get(date) ?? 0;
    const percentage = goalMl > 0
      ? Math.min(100, Math.round((dailyTotalMl / goalMl) * 100))
      : 0;

    const dailyEntries = entries.filter(entry => entry.date === date);
    const lastLogAt = dailyEntries.length > 0 ? dailyEntries[dailyEntries.length - 1].timestamp : null;

    const historyTotals: Record<string, number> = {};
    const targetDate = new Date(date);

    for (let i = 0; i < WATER_HISTORY_LOOKBACK_DAYS; i++) {
      const day = subDays(targetDate, i);
      const key = format(day, 'yyyy-MM-dd');
      historyTotals[key] = totalsMap.get(key) ?? 0;
    }

    let streakCount = 0;
    for (let i = 0; i < WATER_HISTORY_LOOKBACK_DAYS; i++) {
      const day = subDays(targetDate, i);
      const key = format(day, 'yyyy-MM-dd');
      const totalForDay = historyTotals[key] ?? 0;

      if (totalForDay >= goalMl) {
        streakCount += 1;
      } else {
        break;
      }
    }

    return {
      goalMl,
      dailyTotalMl,
      percentage,
      lastLogAt,
      streakCount,
      entries: dailyEntries,
      historyTotals,
    };
  }

  async logWaterIntake(userId: string, amountMl: number, date: string): Promise<void> {
    if (!amountMl) {
      return;
    }

    const payload: TablesInsert<'water_log'> = {
      user_id: userId,
      date,
      amount_ml: amountMl,
      timestamp: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('water_log')
      .insert(payload);

    if (error) {
      console.error('[WaterService] Failed to log water intake', error);
      throw error;
    }
  }
}

export const waterService = new WaterService();
