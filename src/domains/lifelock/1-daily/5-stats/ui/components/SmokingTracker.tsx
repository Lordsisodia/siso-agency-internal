import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cigarette, Plus, Minus, TrendingDown, Award, Flame, Target, Calendar, Trophy, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { format, isToday, subDays, startOfWeek, endOfWeek } from 'date-fns';
import { useClerkUser } from '@/lib/hooks/useClerkUser';
import { useSupabaseUserId } from '@/lib/services/supabase/clerk-integration';
import { smokingService, SmokingSnapshot } from '@/services/database/smokingService';
import { calculateSmokingXP } from '../../domain/xpCalculations';
import { GamificationService } from '@/domains/lifelock/_shared/services/gamificationService';
import useSWR from 'swr';
import { cn } from '@/lib/utils';

interface SmokingTrackerProps {
  selectedDate: Date;
}

const SMOKING_ACTION_AMOUNTS = [1, 5, -1];
const CRAVING_ACTION_AMOUNTS = [1, 3, -1];

const fetchSmokingData = (userId: string, dateKey: string) =>
  smokingService.getSmokingData(userId, dateKey);

interface WeekData {
  date: string;
  cigarettes: number;
  isSmokeFree: boolean;
}

export const SmokingTracker: React.FC<SmokingTrackerProps> = ({ selectedDate }) => {
  const { user } = useClerkUser();
  const internalUserId = useSupabaseUserId(user?.id || null);
  const dateKey = format(selectedDate, 'yyyy-MM-dd');
  const isTodayDate = isToday(selectedDate);

  const { data, error, isLoading, mutate, isValidating } = useSWR<SmokingSnapshot>(
    internalUserId ? ['smoking-tracker', internalUserId, dateKey] : null,
    () => fetchSmokingData(internalUserId!, dateKey),
    {
      revalidateOnFocus: true,
      keepPreviousData: true,
    }
  );

  const [isUpdating, setIsUpdating] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [weekData, setWeekData] = useState<WeekData[]>([]);
  const [isLoadingWeek, setIsLoadingWeek] = useState(false);
  const [showTrendChart, setShowTrendChart] = useState(false);
  const smokingXPRef = useRef(0);

  const smokingData = data ?? {
    date: dateKey,
    cigarettes: 0,
    cravings: 0,
    streakData: {
      currentSmokeFreeDays: 0,
      longestSmokeFreeStreak: 0,
      totalCigarettesThisWeek: 0,
      totalCigarettesThisMonth: 0,
    },
  };

  // Load weekly trend data
  useEffect(() => {
    const loadWeekData = async () => {
      if (!internalUserId) {
        setWeekData([]);
        return;
      }

      setIsLoadingWeek(true);
      try {
        const days = [];
        for (let i = 6; i >= 0; i--) {
          const d = subDays(selectedDate, i);
          const dk = format(d, 'yyyy-MM-dd');
          const dayData = await smokingService.getSmokingData(internalUserId, dk);
          days.push({
            date: dk,
            cigarettes: dayData.cigarettes,
            isSmokeFree: dayData.cigarettes === 0,
          });
        }
        setWeekData(days);
      } catch (error) {
        console.error('[SmokingTracker] Failed to load week data:', error);
      } finally {
        setIsLoadingWeek(false);
      }
    };

    loadWeekData();
  }, [internalUserId, selectedDate]);

  // XP storage key
  const smokingXPStorageKey = useMemo(() => {
    const userSuffix = internalUserId ?? 'anonymous';
    return `lifelock-${userSuffix}-${dateKey}-smokingXP`;
  }, [internalUserId, dateKey]);

  // Load previous XP from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = window.localStorage.getItem(smokingXPStorageKey);
    smokingXPRef.current = stored ? Number(stored) || 0 : 0;
  }, [smokingXPStorageKey]);

  // Calculate current XP
  const smokingXP = useMemo(() => {
    return calculateSmokingXP({
      cigarettesToday: smokingData.cigarettes,
      cravingsResisted: smokingData.cravings,
      smokeFreeDays: smokingData.streakData?.currentSmokeFreeDays ?? 0,
    });
  }, [smokingData.cigarettes, smokingData.cravings, smokingData.streakData]);

  // Award XP when earned (only for today)
  useEffect(() => {
    if (!isTodayDate) return;

    if (smokingXP.total > smokingXPRef.current) {
      const diff = smokingXP.total - smokingXPRef.current;
      const multiplier = diff / 20;
      GamificationService.awardXP('smoking_cessation', multiplier);
      smokingXPRef.current = smokingXP.total;
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(smokingXPStorageKey, smokingXP.total.toString());
      }
    } else if (smokingXP.total < smokingXPRef.current) {
      smokingXPRef.current = smokingXP.total;
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(smokingXPStorageKey, smokingXP.total.toString());
      }
    }
  }, [isTodayDate, smokingXP.total, smokingXPStorageKey]);

  const updateCount = useCallback(async (field: 'cigarettes' | 'cravings', delta: number) => {
    if (isUpdating || !internalUserId) return;

    const currentValue = field === 'cigarettes' ? smokingData.cigarettes : smokingData.cravings;
    const newValue = Math.max(0, currentValue + delta);

    if (newValue === currentValue) return;

    try {
      setIsUpdating(true);
      setActionError(null);

      const updates: Partial<{ cigarettes_today: number; cravings_resisted: number }> = {};
      if (field === 'cigarettes') {
        updates.cigarettes_today = newValue;
      } else {
        updates.cravings_resisted = newValue;
      }

      await mutate(
        async () => {
          return await smokingService.updateSmokingData(internalUserId!, dateKey, updates);
        },
        {
          optimisticData: (current) => ({
            ...current!,
            [field]: newValue,
          }),
          rollbackOnError: true,
          populateCache: true,
          revalidate: true,
        }
      );
    } catch (error) {
      console.error('[SmokingTracker] Failed to update count:', error);
      setActionError('Failed to update. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  }, [isUpdating, internalUserId, smokingData.cigarettes, smokingData.cravings, mutate, dateKey]);

  // Calculate status
  const getCigarettesStatus = () => {
    if (smokingData.cigarettes === 0) return {
      text: 'Smoke-free!',
      color: 'text-emerald-300',
      bg: 'bg-emerald-500/20',
      borderColor: 'border-emerald-500/30'
    };
    if (smokingData.cigarettes <= 5) return {
      text: 'Low',
      color: 'text-amber-300',
      bg: 'bg-amber-500/20',
      borderColor: 'border-amber-500/30'
    };
    if (smokingData.cigarettes <= 10) return {
      text: 'Moderate',
      color: 'text-orange-300',
      bg: 'bg-orange-500/20',
      borderColor: 'border-orange-500/30'
    };
    return {
      text: 'High',
      color: 'text-red-300',
      bg: 'bg-red-500/20',
      borderColor: 'border-red-500/30'
    };
  };

  const status = getCigarettesStatus();

  // Calculate weekly stats
  const weeklyStats = useMemo(() => {
    const total = weekData.reduce((sum, day) => sum + day.cigarettes, 0);
    const smokeFreeDays = weekData.filter(day => day.isSmokeFree).length;
    const average = Math.round(total / 7);
    return { total, smokeFreeDays, average };
  }, [weekData]);

  // Get motivational message
  const getMotivationalMessage = () => {
    if (smokingData.cigarettes === 0) {
      return smokingData.streakData?.currentSmokeFreeDays > 0
        ? `Amazing! ${smokingData.streakData.currentSmokeFreeDays} days smoke-free! 🎉`
        : "You're smoke-free today! Keep it up! 🔥";
    }
    if (smokingData.cravings > smokingData.cigarettes * 2) {
      return "Great job resisting those cravings! 💪";
    }
    if (weeklyStats.smokeFreeDays >= 5) {
      return "You're doing great this week! ⭐";
    }
    return "Every smoke-free day counts! 🌟";
  };

  return (
    <Card className="bg-slate-950/40 border border-slate-700/30 shadow-lg overflow-hidden">
      <CardHeader className="relative pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={cn(
              "p-1.5 rounded-lg border transition-all duration-300",
              smokingData.cigarettes === 0
                ? "border-purple-400/30"
                : "border-purple-400/30"
            )}>
              <Cigarette className={cn(
                "h-4 w-4 transition-colors duration-300",
                smokingData.cigarettes === 0 ? "text-purple-300" : "text-purple-300"
              )} />
            </div>
            <CardTitle className="text-base font-semibold text-purple-100">Smoking Tracker</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={cn(status.bg, status.color, status.borderColor, "border")}>
              {status.text}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="relative pt-0 space-y-3">
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-32 w-full bg-purple-900/30" />
            <Skeleton className="h-24 w-full bg-purple-900/20" />
            <Skeleton className="h-20 w-full bg-purple-900/20" />
          </div>
        ) : (
          <>
            {/* 7-Day Trend Chart */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-xl border border-purple-500/30 bg-purple-950/20 p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-purple-200">7-Day Trend</span>
                <span className="text-xs text-purple-400">{weeklyStats.total} total</span>
              </div>
              <div className="flex items-end justify-between gap-1 h-24">
                {isLoadingWeek ? (
                  Array.from({ length: 7 }).map((_, i) => (
                    <Skeleton key={i} className="flex-1 h-full bg-purple-900/30" />
                  ))
                ) : (
                  weekData.map((day, index) => {
                    const maxHeight = 80;
                    const height = Math.min((day.cigarettes / 20) * maxHeight, maxHeight);
                    const isToday = day.date === dateKey;

                    return (
                      <div
                        key={day.date}
                        className="flex-1 flex flex-col items-center gap-1"
                      >
                        <div
                          className={cn(
                            "w-full rounded-t-sm transition-all duration-300",
                            day.isSmokeFree
                              ? "bg-purple-400/70"
                              : "bg-purple-600/70",
                            isToday && "ring-2 ring-white/30"
                          )}
                          style={{ height: `${Math.max(height, 4)}px` }}
                        />
                        <span
                          className={cn(
                            "text-[10px] w-full text-center truncate",
                            isToday ? "text-white font-medium" : "text-slate-400"
                          )}
                        >
                          {format(new Date(day.date), 'E')[0]}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </motion.div>

            {/* Cigarettes Today Counter */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="rounded-xl border border-purple-500/30 bg-purple-950/20 p-4 transition-all duration-300"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm mb-1 text-purple-300">
                    Cigarettes Today
                  </p>
                  <motion.p
                    key={smokingData.cigarettes}
                    initial={{ scale: 1.1, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-5xl font-bold text-white"
                  >
                    {smokingData.cigarettes}
                  </motion.p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => updateCount('cigarettes', -1)}
                    variant="outline"
                    size="icon"
                    className="h-12 w-12 rounded-full border-purple-500/50 text-purple-400 hover:bg-purple-900/30 transition-all duration-200"
                    disabled={smokingData.cigarettes === 0 || isUpdating}
                  >
                    <Minus className="h-5 w-5" />
                  </Button>
                  <Button
                    onClick={() => updateCount('cigarettes', 1)}
                    variant="outline"
                    size="icon"
                    className="h-12 w-12 rounded-full border-purple-500/50 text-purple-400 hover:bg-purple-900/30 transition-all duration-200"
                    disabled={isUpdating}
                  >
                    <Plus className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              {/* Quick Add Buttons */}
              <div className="flex gap-2 mt-3">
                {SMOKING_ACTION_AMOUNTS.map((amount) => {
                  const isPositive = amount > 0;
                  return (
                    <Button
                      key={amount}
                      type="button"
                      variant="outline"
                      size="sm"
                      className={cn(
                        "flex-1 h-9 text-sm font-medium transition-all duration-200",
                        isPositive
                          ? "border-purple-500/40 text-purple-300 hover:bg-purple-500/20"
                          : "border-slate-600/40 text-slate-400 hover:bg-slate-800/50"
                      )}
                      disabled={isUpdating || (amount < 0 && smokingData.cigarettes === 0)}
                      onClick={() => updateCount('cigarettes', amount)}
                    >
                      {amount > 0 ? `+${amount}` : amount}
                    </Button>
                  );
                })}
              </div>
            </motion.div>

            {/* Analytics Section */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-xl border border-purple-500/30 bg-purple-950/20 p-4"
            >
              <p className="text-sm font-semibold text-purple-200 mb-3">Analytics</p>
              <div className="grid grid-cols-3 gap-3">
                {/* Current Streak */}
                <div className="flex flex-col items-center gap-1">
                  <div className="flex items-center gap-1">
                    <Flame className={cn(
                      "h-4 w-4",
                      smokingData.streakData?.currentSmokeFreeDays > 0 ? "text-orange-400" : "text-slate-500"
                    )} />
                    <span className={cn(
                      "text-2xl font-bold",
                      smokingData.streakData?.currentSmokeFreeDays > 0 ? "text-orange-200" : "text-slate-500"
                    )}>
                      {smokingData.streakData?.currentSmokeFreeDays ?? 0}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400">Day Streak</span>
                </div>

                {/* Longest Streak */}
                <div className="flex flex-col items-center gap-1">
                  <Trophy className="h-4 w-4 text-amber-400" />
                  <span className="text-2xl font-bold text-amber-200">
                    {smokingData.streakData?.longestSmokeFreeStreak ?? 0}
                  </span>
                  <span className="text-xs text-slate-400">Best Streak</span>
                </div>

                {/* Smoke-Free Days This Week */}
                <div className="flex flex-col items-center gap-1">
                  <Target className="h-4 w-4 text-emerald-400" />
                  <span className="text-2xl font-bold text-emerald-200">
                    {weeklyStats.smokeFreeDays}/7
                  </span>
                  <span className="text-xs text-slate-400">Smoke-Free Days</span>
                </div>
              </div>

              {/* Additional Stats */}
              <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-purple-500/20">
                <div className="flex flex-col items-center gap-1">
                  <span className="text-lg font-semibold text-purple-200">{weeklyStats.average}/d</span>
                  <span className="text-xs text-slate-400">Weekly Average</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <span className="text-lg font-semibold text-purple-200">{smokingData.streakData?.totalCigarettesThisMonth ?? 0}</span>
                  <span className="text-xs text-slate-400">This Month</span>
                </div>
              </div>

              {/* Motivational Message */}
              <div className="mt-3 pt-3 border-t border-purple-500/20 text-center">
                <p className="text-sm text-purple-200">
                  {getMotivationalMessage()}
                </p>
              </div>
            </motion.div>

            {/* Error Messages */}
            {actionError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-lg border border-orange-400/40 bg-orange-500/10 px-3 py-2 text-xs text-orange-200"
              >
                {actionError}
              </motion.div>
            )}

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-200"
              >
                Unable to load smoking tracker. Pull to refresh or try again later.
              </motion.div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};
