import { supabase } from '@/lib/services/supabase/client';
import { offlineDb } from '@/services/offline/offlineDb';

export interface AlcoholTrackerData {
  id?: string;
  user_id: string;
  date: string;
  drinks_today: number;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AlcoholSnapshot {
  date: string;
  drinks: number;
  streakData?: {
    currentDryDays: number;
    longestDryStreak: number;
    totalDrinksThisWeek: number;
    totalDrinksThisMonth: number;
  };
}

const isBrowser = typeof window !== 'undefined';
const isOnline = () => (isBrowser ? navigator.onLine : true);

const DEFAULT_ALCOHOL_DATA: AlcoholTrackerData = {
  drinks_today: 0,
  notes: '',
};

// Track if we've already attempted reinitialization
let hasAttemptedReinit = false;

class AlcoholService {
  private async persistOffline(data: AlcoholTrackerData, markForSync: boolean) {
    await offlineDb.saveAlcoholTracker(
      {
        id: data.id,
        user_id: data.user_id,
        date: data.date,
        drinks_today: data.drinks_today,
        notes: data.notes ?? '',
        created_at: data.created_at ?? new Date().toISOString(),
        updated_at: data.updated_at ?? new Date().toISOString(),
      },
      markForSync
    );
  }

  async getAlcoholData(userId: string, date: string): Promise<AlcoholSnapshot> {
    if (!userId) {
      return {
        date,
        drinks: 0,
      };
    }

    // Try offline first
    try {
      const offline = await offlineDb.getAlcoholTracker(date);
      if (offline && offline.user_id === userId) {
        // Fetch streak data separately even when using offline cache
        const streakData = isOnline() ? await this.getAlcoholStreaks(userId, 30) : undefined;
        return {
          date: offline.date,
          drinks: offline.drinks_today,
          streakData,
        };
      }
    } catch (error) {
      // Offline DB schema might be outdated - try to reinitialize once
      if (error.name === 'NotFoundError' && !hasAttemptedReinit) {
        hasAttemptedReinit = true;
        if (import.meta.env.DEV) {
          console.debug('[AlcoholService] Database schema outdated, reinitializing...');
        }
        await offlineDb.forceReinitialize();
        // Retry after reinit
        try {
          const offline = await offlineDb.getAlcoholTracker(date);
          if (offline && offline.user_id === userId) {
            const streakData = isOnline() ? await this.getAlcoholStreaks(userId, 30) : undefined;
            return {
              date: offline.date,
              drinks: offline.drinks_today,
              streakData,
            };
          }
        } catch (retryError) {
          // Reinit failed, fall through to Supabase
          if (import.meta.env.DEV) {
            console.debug('[AlcoholService] Reinit failed, using Supabase fallback');
          }
        }
      }
      // Fall through to Supabase if offline fails
    }

    if (!isOnline()) {
      return {
        date,
        drinks: 0,
      };
    }

    // Fetch from Supabase
    const { data, error } = await supabase
      .from('alcohol_tracker')
      .select('*')
      .eq('user_id', userId)
      .eq('date', date)
      .maybeSingle();

    if (error) {
      if (import.meta.env.DEV) {
        console.debug('[AlcoholService] Failed to fetch alcohol data:', error.message);
      }
      return {
        date,
        drinks: 0,
      };
    }

    if (data) {
      // Cache offline
      await this.persistOffline(data, false);
      // Fetch streak data
      const streakData = await this.getAlcoholStreaks(userId, 30);
      return {
        date: data.date,
        drinks: data.drinks_today,
        streakData,
      };
    }

    return {
      date,
      drinks: 0,
    };
  }

  async updateAlcoholData(
    userId: string,
    date: string,
    updates: Partial<Pick<AlcoholTrackerData, 'drinks_today' | 'notes'>>
  ): Promise<AlcoholSnapshot> {
    if (!userId) {
      throw new Error('User ID is required');
    }

    // Get current data first
    const current = await this.getAlcoholData(userId, date);

    const updatedData: AlcoholTrackerData = {
      user_id: userId,
      date,
      drinks_today: updates.drinks_today ?? current.drinks,
      notes: updates.notes ?? '',
    };

    // Save offline
    await this.persistOffline(updatedData, !isOnline());

    if (isOnline()) {
      // Sync to Supabase
      const { data, error } = await supabase
        .from('alcohol_tracker')
        .upsert(
          {
            user_id: userId,
            date,
            drinks_today: updatedData.drinks_today,
            notes: updatedData.notes,
          },
          { onConflict: 'user_id,date' }
        )
        .select()
        .maybeSingle();

      if (error) {
        if (import.meta.env.DEV) {
          console.debug('[AlcoholService] Failed to sync alcohol data:', error.message);
        }
      } else if (data) {
        // Update offline cache with server response
        await this.persistOffline(data, false);
        return {
          date: data.date,
          drinks: data.drinks_today,
        };
      }
    }

    return {
      date,
      drinks: updatedData.drinks_today,
    };
  }

  async getAlcoholStreaks(userId: string, lookbackDays: number = 30): Promise<{
    currentDryDays: number;
    longestDryStreak: number;
    totalDrinksThisWeek: number;
    totalDrinksThisMonth: number;
  }> {
    if (!userId || !isOnline()) {
      return {
        currentDryDays: 0,
        longestDryStreak: 0,
        totalDrinksThisWeek: 0,
        totalDrinksThisMonth: 0,
      };
    }

    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - lookbackDays);

    const { data, error } = await supabase
      .from('alcohol_tracker')
      .select('date, drinks_today')
      .eq('user_id', userId)
      .gte('date', startDate.toISOString().split('T')[0])
      .lte('date', today.toISOString().split('T')[0])
      .order('date', { ascending: true });

    if (error || !data) {
      if (import.meta.env.DEV) {
        console.debug('[AlcoholService] Failed to fetch streak data:', error?.message);
      }
      return {
        currentDryDays: 0,
        longestDryStreak: 0,
        totalDrinksThisWeek: 0,
        totalDrinksThisMonth: 0,
      };
    }

    // Create a map of dates to drink counts for easy lookup
    const dataMap = new Map<string, number>();
    data.forEach(entry => {
      dataMap.set(entry.date, entry.drinks_today);
    });

    // Calculate current streak (consecutive dry days backwards from today)
    let currentStreak = 0;
    for (let i = 0; i < lookbackDays; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      const dateKey = checkDate.toISOString().split('T')[0];
      const drinks = dataMap.get(dateKey);

      // If no data or dry day, count it
      if (drinks === undefined || drinks === 0) {
        currentStreak++;
      } else {
        break; // Streak broken
      }
    }

    // Calculate longest streak
    let longestStreak = 0;
    let tempStreak = 0;
    for (const entry of data) {
      if (entry.drinks_today === 0) {
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        tempStreak = 0;
      }
    }

    // Calculate weekly and monthly totals
    const weekAgo = new Date(today);
    weekAgo.setDate(today.getDate() - 7);
    const monthAgo = new Date(today);
    monthAgo.setDate(today.getDate() - 30);

    let weekTotal = 0;
    let monthTotal = 0;

    for (const entry of data) {
      const entryDate = new Date(entry.date);

      if (entryDate >= weekAgo) {
        weekTotal += entry.drinks_today;
      }
      if (entryDate >= monthAgo) {
        monthTotal += entry.drinks_today;
      }
    }

    return {
      currentDryDays: currentStreak,
      longestDryStreak: longestStreak,
      totalDrinksThisWeek: weekTotal,
      totalDrinksThisMonth: monthTotal,
    };
  }
}

export const alcoholService = new AlcoholService();
