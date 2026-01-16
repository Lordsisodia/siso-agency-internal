/**
 * 🔄 Supabase XP Sync Service
 *
 * Handles synchronization of XP/gamification data between localStorage and Supabase
 * - Offline-first: localStorage is source of truth
 * - Background sync: Automatically syncs to Supabase
 * - Conflict resolution: Supabase wins on load, localStorage wins on save
 */

import { format } from 'date-fns';
import { supabaseAnon as supabase } from '@/lib/supabase-clerk';
import type { UserProgress, DailyStats, Achievement, WeeklyChallenge } from '../gamificationService';

/**
 * Load user gamification progress from Supabase
 */
export async function loadProgressFromSupabase(userId: string): Promise<UserProgress | null> {
  try {
    // Load main progress
    const { data: progress, error: progressError } = await supabase
      .from('user_gamification_progress')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (progressError || !progress) {
      return null;
    }

    // Load daily stats
    const { data: dailyStats, error: statsError } = await supabase
      .from('daily_xp_stats')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    // Load achievements
    const { data: achievements, error: achError } = await supabase
      .from('user_achievements')
      .select('*')
      .eq('user_id', userId);

    // Load weekly challenge (avoid 406 by using maybeSingle)
    const { data: challenge, error: challengeError } = await supabase
      .from('weekly_challenges')
      .select('*')
      .eq('user_id', userId)
      .eq('completed', false)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    // Silently skip if no rows / other errors
    if (challengeError) {
      // Weekly challenge is optional; ignore errors to keep UX clean
    }

    // Transform to UserProgress format
    const dailyStatsMap: Record<string, DailyStats> = {};
    (dailyStats || []).forEach(stat => {
      dailyStatsMap[stat.date] = {
        date: stat.date,
        totalXP: stat.total_xp,
        activitiesCompleted: stat.activities_completed,
        streakCount: stat.streak_count,
        level: stat.level_at_day,
        achievements: stat.achievements_unlocked || [],
        categories: stat.category_breakdown
      };
    });

    const achievementsArray: Achievement[] = (achievements || []).map(ach => ({
      id: ach.achievement_id,
      name: ach.achievement_name,
      description: '', // Can add to schema if needed
      badge: ach.achievement_badge,
      requirement: ach.max_progress,
      category: ach.category as any,
      unlocked: ach.unlocked,
      unlockedAt: ach.unlocked_at ? new Date(ach.unlocked_at) : undefined,
      progress: ach.progress,
      maxProgress: ach.max_progress
    }));

    const weeklyChallenge: WeeklyChallenge | undefined = challenge ? {
      id: challenge.id,
      name: challenge.challenge_name,
      description: challenge.challenge_description,
      target: challenge.target,
      current: challenge.current_progress,
      reward: challenge.reward,
      startDate: new Date(challenge.start_date),
      endDate: new Date(challenge.end_date),
      completed: challenge.completed
    } : undefined;

    return {
      currentLevel: progress.current_level,
      totalXP: progress.total_xp,
      dailyXP: progress.daily_xp,
      currentStreak: progress.current_streak,
      bestStreak: progress.best_streak,
      achievements: achievementsArray,
      dailyStats: dailyStatsMap,
      weeklyChallenge
    };
  } catch (error) {
    console.error('Error loading gamification progress from Supabase:', error);
    return null;
  }
}

/**
 * Save user gamification progress to Supabase
 */
export async function saveProgressToSupabase(userId: string, progress: UserProgress): Promise<boolean> {
  try {
    // Save main progress (upsert)
    const { error: progressError } = await supabase
      .from('user_gamification_progress')
      .upsert({
        user_id: userId,
        current_level: progress.currentLevel,
        total_xp: progress.totalXP,
        daily_xp: progress.dailyXP,
        current_streak: progress.currentStreak,
        best_streak: progress.bestStreak,
        last_activity_date: format(new Date(), 'yyyy-MM-dd'),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      });

    if (progressError) {
      console.error('Error saving progress:', progressError);
      return false;
    }

    // Save today's daily stats
    const today = format(new Date(), 'yyyy-MM-dd');
    const todayStats = progress.dailyStats[today];

    if (todayStats) {
      const { error: statsError } = await supabase
        .from('daily_xp_stats')
        .upsert({
          user_id: userId,
          date: today,
          total_xp: todayStats.totalXP,
          activities_completed: todayStats.activitiesCompleted,
          streak_count: todayStats.streakCount,
          level_at_day: todayStats.level,
          category_breakdown: todayStats.categories,
          achievements_unlocked: todayStats.achievements,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,date'
        });

      if (statsError) {
        console.error('Error saving daily stats:', statsError);
      }
    }

    // Save achievements (only unlocked ones)
    const unlockedAchievements = progress.achievements.filter(a => a.unlocked);
    if (unlockedAchievements.length > 0) {
      const achData = unlockedAchievements.map(ach => ({
        user_id: userId,
        achievement_id: ach.id,
        achievement_name: ach.name,
        achievement_badge: ach.badge,
        category: ach.category,
        progress: ach.progress,
        max_progress: ach.maxProgress,
        unlocked: true,
        unlocked_at: ach.unlockedAt?.toISOString(),
        updated_at: new Date().toISOString()
      }));

      const { error: achError } = await supabase
        .from('user_achievements')
        .upsert(achData, {
          onConflict: 'user_id,achievement_id'
        });

      if (achError) {
        console.error('Error saving achievements:', achError);
      }
    }

    // Save weekly challenge (if exists and active)
    if (progress.weeklyChallenge && !progress.weeklyChallenge.completed) {
      const { error: challengeError } = await supabase
        .from('weekly_challenges')
        .upsert({
          id: progress.weeklyChallenge.id,
          user_id: userId,
          challenge_name: progress.weeklyChallenge.name,
          challenge_description: progress.weeklyChallenge.description,
          target: progress.weeklyChallenge.target,
          current_progress: progress.weeklyChallenge.current,
          reward: progress.weeklyChallenge.reward,
          start_date: progress.weeklyChallenge.startDate.toISOString().split('T')[0],
          end_date: progress.weeklyChallenge.endDate.toISOString().split('T')[0],
          completed: false,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'id'
        });

      if (challengeError) {
        console.error('Error saving weekly challenge:', challengeError);
      }
    }

    return true;
  } catch (error) {
    console.error('Error syncing gamification data to Supabase:', error);
    return false;
  }
}

/**
 * Sync XP data in background (debounced)
 */
let syncTimeout: NodeJS.Timeout | null = null;

export function scheduleSyncToSupabase(userId: string, progress: UserProgress, delayMs: number = 2000): void {
  if (syncTimeout) {
    clearTimeout(syncTimeout);
  }

  syncTimeout = setTimeout(() => {
    saveProgressToSupabase(userId, progress)
      .then(success => {
        if (success) {
        }
      })
      .catch(error => {
        console.error('❌ XP sync failed:', error);
      });
  }, delayMs);
}
