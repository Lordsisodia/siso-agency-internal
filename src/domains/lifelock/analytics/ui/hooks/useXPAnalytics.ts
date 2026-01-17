/**
 * React Hook for XP Analytics
 *
 * Custom hook to fetch and manage XP analytics data
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuthSession } from '@/lib/hooks/useAuthSession';
import { xpAnalyticsService } from '../services/xpAnalyticsService';
import type {
  XPAnalyticsData,
  TodayXPData,
  WeeklyXPData,
  MonthlyXPData,
  PersonalBests,
  StreakData,
  TrendData,
  PeakProductivityData,
  AchievementsData,
  LevelProgress,
} from '../types/xpAnalytics.types';

interface UseXPAnalyticsOptions {
  enabled?: boolean;
  refetchInterval?: number; // Auto-refetch interval in ms
}

interface UseXPAnalyticsReturn {
  data: XPAnalyticsData | null;
  today: TodayXPData | null;
  week: WeeklyXPData | null;
  month: MonthlyXPData | null;
  personalBests: PersonalBests | null;
  streaks: StreakData | null;
  trend: TrendData | null;
  peakProductivity: PeakProductivityData | null;
  achievements: AchievementsData | null;
  level: LevelProgress | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useXPAnalytics(options: UseXPAnalyticsOptions = {}): UseXPAnalyticsReturn {
  const { enabled = true, refetchInterval } = options;
  const { user, isLoaded: userLoaded } = useAuthSession();

  const [data, setData] = useState<XPAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    if (!user?.id || !enabled) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const analyticsData = await xpAnalyticsService.getAnalytics(user.id);
      setData(analyticsData);
    } catch (err) {
      console.error('Error fetching XP analytics:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  }, [user?.id, enabled]);

  useEffect(() => {
    if (userLoaded && user?.id && enabled) {
      fetchAnalytics();
    }
  }, [userLoaded, user?.id, enabled, fetchAnalytics]);

  // Auto-refetch
  useEffect(() => {
    if (!refetchInterval || !enabled) {
      return;
    }

    const interval = setInterval(() => {
      fetchAnalytics();
    }, refetchInterval);

    return () => clearInterval(interval);
  }, [refetchInterval, enabled, fetchAnalytics]);

  return {
    data,
    today: data?.today ?? null,
    week: data?.week ?? null,
    month: data?.month ?? null,
    personalBests: data?.personalBests ?? null,
    streaks: data?.streaks ?? null,
    trend: data?.trend ?? null,
    peakProductivity: data?.peakProductivity ?? null,
    achievements: data?.achievements ?? null,
    level: data?.level ?? null,
    loading,
    error,
    refetch: fetchAnalytics,
  };
}

// ============================================================================
// INDIVIDUAL HOOKS FOR SPECIFIC DATA
// ============================================================================

export function useTodayXP() {
  const { data, loading, error, refetch } = useXPAnalytics();
  return {
    data: data?.today ?? null,
    loading,
    error,
    refetch,
  };
}

export function useWeeklyXP() {
  const { data, loading, error, refetch } = useXPAnalytics();
  return {
    data: data?.week ?? null,
    loading,
    error,
    refetch,
  };
}

export function useMonthlyXP() {
  const { data, loading, error, refetch } = useXPAnalytics();
  return {
    data: data?.month ?? null,
    loading,
    error,
    refetch,
  };
}

export function usePersonalBests() {
  const { data, loading, error, refetch } = useXPAnalytics();
  return {
    data: data?.personalBests ?? null,
    loading,
    error,
    refetch,
  };
}

export function useStreaks() {
  const { data, loading, error, refetch } = useXPAnalytics();
  return {
    data: data?.streaks ?? null,
    loading,
    error,
    refetch,
  };
}

export function useTrendData(days: number = 30) {
  const { user } = useAuthSession();
  const [data, setData] = useState<TrendData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const trendData = await xpAnalyticsService.getTrendData(user.id, days);
        setData(trendData);
      } catch (err) {
        console.error('Error fetching trend data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch trend data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.id, days]);

  return { data, loading, error, refetch: () => fetchData() };
}

export function usePeakProductivity() {
  const { data, loading, error, refetch } = useXPAnalytics();
  return {
    data: data?.peakProductivity ?? null,
    loading,
    error,
    refetch,
  };
}

export function useAchievements() {
  const { data, loading, error, refetch } = useXPAnalytics();
  return {
    data: data?.achievements ?? null,
    loading,
    error,
    refetch,
  };
}

export function useLevelProgress() {
  const { data, loading, error, refetch } = useXPAnalytics();
  return {
    data: data?.level ?? null,
    loading,
    error,
    refetch,
  };
}
