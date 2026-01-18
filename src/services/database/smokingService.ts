import { supabase } from '@/lib/services/supabase/client';
import { offlineDb } from '@/services/offline/offlineDb';

export interface SmokingTrackerData {
  id?: string;
  user_id: string;
  date: string;
  cigarettes_today: number;
  cravings_resisted: number;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface SmokingSnapshot {
  date: string;
  cigarettes: number;
  cravings: number;
  streakData?: {
    currentSmokeFreeDays: number;
    longestSmokeFreeStreak: number;
    totalCigarettesThisWeek: number;
    totalCigarettesThisMonth: number;
  };
}

const isBrowser = typeof window !== 'undefined';
const isOnline = () => (isBrowser ? navigator.onLine : true);

const DEFAULT_SMOKING_DATA: SmokingTrackerData = {
  cigarettes_today: 0,
  cravings_resisted: 0,
  notes: '',
};

// Track if we've already attempted reinitialization
let hasAttemptedReinit = false;

class SmokingService {
  private async persistOffline(data: SmokingTrackerData, markForSync: boolean) {
    await offlineDb.saveSmokingTracker(
      {
        id: data.id,
        user_id: data.user_id,
        date: data.date,
        cigarettes_today: data.cigarettes_today,
        cravings_resisted: data.cravings_resisted,
        notes: data.notes ?? '',
        created_at: data.created_at ?? new Date().toISOString(),
        updated_at: data.updated_at ?? new Date().toISOString(),
      },
      markForSync
    );
  }

  async getSmokingData(userId: string, date: string): Promise<SmokingSnapshot> {
    if (!userId) {
      return {
        date,
        cigarettes: 0,
        cravings: 0,
      };
    }

    // Try offline first
    try {
      const offline = await offlineDb.getSmokingTracker(date);
      if (offline && offline.user_id === userId) {
        // Fetch streak data separately even when using offline cache
        const streakData = isOnline() ? await this.getSmokingStreaks(userId, 30) : undefined;
        return {
          date: offline.date,
          cigarettes: offline.cigarettes_today,
          cravings: offline.cravings_resisted,
          streakData,
        };
      }
    } catch (error) {
      // Offline DB schema might be outdated - try to reinitialize once
      if (error.name === 'NotFoundError' && !hasAttemptedReinit) {
        hasAttemptedReinit = true;
        if (import.meta.env.DEV) {
          console.debug('[SmokingService] Database schema outdated, reinitializing...');
        }
        await offlineDb.forceReinitialize();
        // Retry after reinit
        try {
          const offline = await offlineDb.getSmokingTracker(date);
          if (offline && offline.user_id === userId) {
            const streakData = isOnline() ? await this.getSmokingStreaks(userId, 30) : undefined;
            return {
              date: offline.date,
              cigarettes: offline.cigarettes_today,
              cravings: offline.cravings_resisted,
              streakData,
            };
          }
        } catch (retryError) {
          // Reinit failed, fall through to Supabase
          if (import.meta.env.DEV) {
            console.debug('[SmokingService] Reinit failed, using Supabase fallback');
          }
        }
      }
      // Fall through to Supabase if offline fails
    }

    if (!isOnline()) {
      return {
        date,
        cigarettes: 0,
        cravings: 0,
      };
    }

    // Fetch from Supabase
    const { data, error } = await supabase
      .from('smoking_tracker')
      .select('*')
      .eq('user_id', userId)
      .eq('date', date)
      .maybeSingle();

    if (error) {
      if (import.meta.env.DEV) {
        console.debug('[SmokingService] Failed to fetch smoking data:', error.message);
      }
      return {
        date,
        cigarettes: 0,
        cravings: 0,
      };
    }

    if (data) {
      // Cache offline
      await this.persistOffline(data, false);
      // Fetch streak data
      const streakData = await this.getSmokingStreaks(userId, 30);
      return {
        date: data.date,
        cigarettes: data.cigarettes_today,
        cravings: data.cravings_resisted,
        streakData,
      };
    }

    return {
      date,
      cigarettes: 0,
      cravings: 0,
    };
  }

  async updateSmokingData(
    userId: string,
    date: string,
    updates: Partial<Pick<SmokingTrackerData, 'cigarettes_today' | 'cravings_resisted' | 'notes'>>
  ): Promise<SmokingSnapshot> {
    if (!userId) {
      throw new Error('User ID is required');
    }

    // Get current data first
    const current = await this.getSmokingData(userId, date);

    const updatedData: SmokingTrackerData = {
      user_id: userId,
      date,
      cigarettes_today: updates.cigarettes_today ?? current.cigarettes,
      cravings_resisted: updates.cravings_resisted ?? current.cravings,
      notes: updates.notes ?? '',
    };

    // Save offline
    await this.persistOffline(updatedData, !isOnline());

    if (isOnline()) {
      // Sync to Supabase
      const { data, error } = await supabase
        .from('smoking_tracker')
        .upsert(
          {
            user_id: userId,
            date,
            cigarettes_today: updatedData.cigarettes_today,
            cravings_resisted: updatedData.cravings_resisted,
            notes: updatedData.notes,
          },
          { onConflict: 'user_id,date' }
        )
        .select()
        .maybeSingle();

      if (error) {
        if (import.meta.env.DEV) {
          console.debug('[SmokingService] Failed to sync smoking data:', error.message);
        }
      } else if (data) {
        // Update offline cache with server response
        await this.persistOffline(data, false);
        return {
          date: data.date,
          cigarettes: data.cigarettes_today,
          cravings: data.cravings_resisted,
        };
      }
    }

    return {
      date,
      cigarettes: updatedData.cigarettes_today,
      cravings: updatedData.cravings_resisted,
    };
  }

  async getSmokingStreaks(userId: string, lookbackDays: number = 30): Promise<{
    currentSmokeFreeDays: number;
    longestSmokeFreeStreak: number;
    totalCigarettesThisWeek: number;
    totalCigarettesThisMonth: number;
  }> {
    if (!userId || !isOnline()) {
      return {
        currentSmokeFreeDays: 0,
        longestSmokeFreeStreak: 0,
        totalCigarettesThisWeek: 0,
        totalCigarettesThisMonth: 0,
      };
    }

    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - lookbackDays);

    const { data, error } = await supabase
      .from('smoking_tracker')
      .select('date, cigarettes_today')
      .eq('user_id', userId)
      .gte('date', startDate.toISOString().split('T')[0])
      .lte('date', today.toISOString().split('T')[0])
      .order('date', { ascending: true });

    if (error || !data) {
      if (import.meta.env.DEV) {
        console.debug('[SmokingService] Failed to fetch streak data:', error?.message);
      }
      return {
        currentSmokeFreeDays: 0,
        longestSmokeFreeStreak: 0,
        totalCigarettesThisWeek: 0,
        totalCigarettesThisMonth: 0,
      };
    }

    // Create a map of dates to cigarette counts for easy lookup
    const dataMap = new Map<string, number>();
    data.forEach(entry => {
      dataMap.set(entry.date, entry.cigarettes_today);
    });

    // Calculate current streak (consecutive days backwards from today)
    let currentStreak = 0;
    for (let i = 0; i < lookbackDays; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      const dateKey = checkDate.toISOString().split('T')[0];
      const cigarettes = dataMap.get(dateKey);

      // If no data or smoke-free, count it
      if (cigarettes === undefined || cigarettes === 0) {
        currentStreak++;
      } else {
        break; // Streak broken
      }
    }

    // Calculate longest streak
    let longestStreak = 0;
    let tempStreak = 0;
    for (const entry of data) {
      if (entry.cigarettes_today === 0) {
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
        weekTotal += entry.cigarettes_today;
      }
      if (entryDate >= monthAgo) {
        monthTotal += entry.cigarettes_today;
      }
    }

    return {
      currentSmokeFreeDays: currentStreak,
      longestSmokeFreeStreak: longestStreak,
      totalCigarettesThisWeek: weekTotal,
      totalCigarettesThisMonth: monthTotal,
    };
  }
}

export const smokingService = new SmokingService();
