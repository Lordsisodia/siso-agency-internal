import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wine, Plus, Minus, Flame, Target, Trophy, ChevronDown, ChevronUp, CheckCircle2, Beer, GlassWater } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { format, isToday, subDays } from 'date-fns';
import { useClerkUser } from '@/lib/hooks/auth/useClerkUser';
import { useSupabaseUserId } from '@/lib/services/supabase/clerk-integration';
import { alcoholService, AlcoholSnapshot } from '@/services/database/alcoholService';
import { calculateAlcoholXP } from '../../domain/xpCalculations';
import { GamificationService } from '@/domains/lifelock/_shared/services/gamificationService';
import { XPPill } from '@/domains/lifelock/1-daily/1-morning-routine/ui/components/xp/XPPill';
import useSWR from 'swr';
import { cn } from '@/lib/utils';

interface AlcoholTrackerProps {
  selectedDate: Date;
}

const fetchAlcoholData = (userId: string, dateKey: string) =>
  alcoholService.getAlcoholData(userId, dateKey);

interface WeekData {
  date: string;
  drinks: number;
  isDryDay: boolean;
}

export const AlcoholTracker: React.FC<AlcoholTrackerProps> = ({ selectedDate }) => {
  const { user } = useClerkUser();
  const internalUserId = useSupabaseUserId(user?.id || null);
  const dateKey = format(selectedDate, 'yyyy-MM-dd');
  const isTodayDate = isToday(selectedDate);

  const { data, error, isLoading, mutate } = useSWR<AlcoholSnapshot>(
    internalUserId ? ['alcohol-tracker', internalUserId, dateKey] : null,
    () => fetchAlcoholData(internalUserId!, dateKey),
    {
      revalidateOnFocus: true,
      keepPreviousData: true,
    }
  );

  const [isUpdating, setIsUpdating] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [weekData, setWeekData] = useState<WeekData[]>([]);
  const [isLoadingWeek, setIsLoadingWeek] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const alcoholXPRef = useRef(0);

  const alcoholData = data ?? {
    date: dateKey,
    drinks: 0,
    streakData: {
      currentDryDays: 0,
      longestDryStreak: 0,
      totalDrinksThisWeek: 0,
      totalDrinksThisMonth: 0,
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
          const dayData = await alcoholService.getAlcoholData(internalUserId, dk);
          days.push({
            date: dk,
            drinks: dayData.drinks,
            isDryDay: dayData.drinks === 0,
          });
        }
        setWeekData(days);
      } catch (error) {
        console.error('[AlcoholTracker] Failed to load week data:', error);
      } finally {
        setIsLoadingWeek(false);
      }
    };

    loadWeekData();
  }, [internalUserId, selectedDate]);

  // XP storage key
  const alcoholXPStorageKey = useMemo(() => {
    const userSuffix = internalUserId ?? 'anonymous';
    return `lifelock-${userSuffix}-${dateKey}-alcoholXP`;
  }, [internalUserId, dateKey]);

  // Load previous XP from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = window.localStorage.getItem(alcoholXPStorageKey);
    alcoholXPRef.current = stored ? Number(stored) || 0 : 0;
  }, [alcoholXPStorageKey]);

  // Calculate current XP
  const alcoholXP = useMemo(() => {
    return calculateAlcoholXP({
      drinksToday: alcoholData.drinks,
      dryDays: alcoholData.streakData?.currentDryDays ?? 0,
    });
  }, [alcoholData.drinks, alcoholData.streakData]);

  // Award XP when earned (only for today)
  useEffect(() => {
    if (!isTodayDate) return;

    if (alcoholXP.total > alcoholXPRef.current) {
      const diff = alcoholXP.total - alcoholXPRef.current;
      const multiplier = diff / 25;
      GamificationService.awardXP('alcohol_tracking', multiplier);
      alcoholXPRef.current = alcoholXP.total;
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(alcoholXPStorageKey, alcoholXP.total.toString());
      }
    } else if (alcoholXP.total < alcoholXPRef.current) {
      alcoholXPRef.current = alcoholXP.total;
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(alcoholXPStorageKey, alcoholXP.total.toString());
      }
    }
  }, [isTodayDate, alcoholXP.total, alcoholXPStorageKey]);

  const updateCount = useCallback(async (delta: number) => {
    if (isUpdating || !internalUserId) return;

    const currentValue = alcoholData.drinks;
    const newValue = Math.max(0, currentValue + delta);

    if (newValue === currentValue) return;

    try {
      setIsUpdating(true);
      setActionError(null);

      await mutate(
        async () => {
          return await alcoholService.updateAlcoholData(internalUserId!, dateKey, {
            drinks_today: newValue,
          });
        },
        {
          optimisticData: (current) => ({
            ...current!,
            drinks: newValue,
          }),
          rollbackOnError: true,
          populateCache: true,
          revalidate: true,
        }
      );
    } catch (error) {
      console.error('[AlcoholTracker] Failed to update count:', error);
      setActionError('Failed to update. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  }, [isUpdating, internalUserId, alcoholData.drinks, mutate, dateKey]);

  // Calculate weekly stats
  const weeklyStats = useMemo(() => {
    const total = weekData.reduce((sum, day) => sum + day.drinks, 0);
    const dryDays = weekData.filter(day => day.isDryDay).length;
    const average = Math.round(total / 7);
    return { total, dryDays, average };
  }, [weekData]);

  // Get status color based on drink count
  const getStatusColor = (drinks: number) => {
    if (drinks === 0) return 'green';
    if (drinks <= 2) return 'yellow';
    return 'red';
  };

  const statusColor = getStatusColor(alcoholData.drinks);
  const isDryDay = alcoholData.drinks === 0;

  // Get motivational message
  const getMotivationalMessage = () => {
    if (isDryDay) {
      if (alcoholData.streakData?.currentDryDays > 0) {
        const days = alcoholData.streakData.currentDryDays;
        if (days >= 90) return `Incredible! ${days} days alcohol-free!`;
        if (days >= 30) return `Amazing! ${days} days sober!`;
        if (days >= 7) return `Great job! ${days} days dry streak!`;
        return `Nice! ${days} days without alcohol!`;
      }
      return "Dry day! Your body thanks you!";
    }
    if (alcoholData.drinks <= 2) {
      return "Moderate drinking. Stay mindful!";
    }
    return "Consider pacing yourself. Hydrate!";
  };

  // Get drink type icon
  const getDrinkIcon = (type: 'beer' | 'wine' | 'spirits') => {
    switch (type) {
      case 'beer':
        return <Beer className="h-4 w-4" />;
      case 'wine':
        return <Wine className="h-4 w-4" />;
      case 'spirits':
        return <GlassWater className="h-4 w-4" />;
    }
  };

  return (
    <Card className="bg-emerald-900/20 border-emerald-700/40 overflow-hidden">
      {/* Clickable Header */}
      <div
        className="p-4 cursor-pointer hover:bg-emerald-900/10 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="p-1.5 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex-shrink-0">
              <Wine className="h-4 w-4 text-emerald-300" />
            </div>
            <h4 className="text-emerald-100 font-semibold text-base truncate">Alcohol</h4>
            {/* Green CheckCircle when dry day */}
            {isDryDay && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 10 }}
              >
                <CheckCircle2 className="h-5 w-5 text-green-400 flex-shrink-0" />
              </motion.div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <XPPill
              xp={alcoholXP.total}
              earned={isDryDay}
              showGlow={isDryDay}
            />
            {isExpanded ? (
              <ChevronUp className="h-5 w-5 text-emerald-400 flex-shrink-0" />
            ) : (
              <ChevronDown className="h-5 w-5 text-emerald-400 flex-shrink-0" />
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-2 mb-1">
          <div className="w-full bg-emerald-900/30 border border-emerald-600/20 rounded-full h-1.5">
            <motion.div
              className={cn(
                "h-1.5 rounded-full transition-all duration-500",
                statusColor === 'green' && "bg-gradient-to-r from-green-400 to-emerald-500",
                statusColor === 'yellow' && "bg-gradient-to-r from-yellow-400 to-amber-500",
                statusColor === 'red' && "bg-gradient-to-r from-orange-500 to-red-500"
              )}
              initial={{ width: 0 }}
              animate={{ width: `${isDryDay ? 100 : Math.max(0, 100 - (alcoholData.drinks * 15))}%` }}
            />
          </div>
          <div className="flex justify-between items-center mt-1">
            <span className="text-xs text-emerald-400/70 font-medium">
              {isDryDay ? 'Dry day - Great job!' : `${alcoholData.drinks} drinks today`}
            </span>
            {isDryDay && !isExpanded && (
              <span className="text-xs text-green-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" /> Complete
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Collapsible Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-4 space-y-3">
              {isLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-32 w-full bg-emerald-900/30" />
                  <Skeleton className="h-24 w-full bg-emerald-900/20" />
                  <Skeleton className="h-20 w-full bg-emerald-900/20" />
                </div>
              ) : (
                <>
                  {/* Drinks Today Counter */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className={cn(
                      "rounded-xl border p-4 transition-all duration-300",
                      isDryDay
                        ? "border-green-500/30 bg-green-950/20"
                        : statusColor === 'yellow'
                          ? "border-yellow-500/30 bg-yellow-950/20"
                          : statusColor === 'red'
                            ? "border-red-500/30 bg-red-950/20"
                            : "border-emerald-700/30 bg-emerald-900/30"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={cn(
                          "text-sm mb-1",
                          isDryDay ? "text-green-300" : statusColor === 'yellow' ? "text-yellow-300" : statusColor === 'red' ? "text-red-300" : "text-emerald-300"
                        )}>
                          Drinks Today
                        </p>
                        <motion.p
                          key={alcoholData.drinks}
                          initial={{ scale: 1.1, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className={cn(
                            "text-5xl font-bold",
                            isDryDay ? "text-green-400" : statusColor === 'yellow' ? "text-yellow-400" : statusColor === 'red' ? "text-red-400" : "text-white"
                          )}
                        >
                          {alcoholData.drinks}
                        </motion.p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            updateCount(-1);
                          }}
                          variant="outline"
                          size="icon"
                          className="h-12 w-12 rounded-full border-emerald-600/50 text-emerald-400 hover:bg-emerald-800/50 hover:text-emerald-200 transition-all duration-200"
                          disabled={alcoholData.drinks === 0 || isUpdating}
                        >
                          <Minus className="h-5 w-5" />
                        </Button>
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            updateCount(1);
                          }}
                          variant="outline"
                          size="icon"
                          className="h-12 w-12 rounded-full border-emerald-500/50 text-emerald-400 hover:bg-emerald-900/30 hover:text-emerald-300 transition-all duration-200"
                          disabled={isUpdating}
                        >
                          <Plus className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>

                    {/* Quick Add Buttons */}
                    <div className="flex gap-2 mt-3">
                      {[
                        { type: 'beer' as const, label: 'Beer', amount: 1 },
                        { type: 'wine' as const, label: 'Wine', amount: 1 },
                        { type: 'spirits' as const, label: 'Cocktail', amount: 1 },
                      ].map((drink) => (
                        <Button
                          key={drink.type}
                          type="button"
                          variant="outline"
                          size="sm"
                          className="flex-1 h-9 text-sm font-medium transition-all duration-200 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/20"
                          disabled={isUpdating}
                          onClick={(e) => {
                            e.stopPropagation();
                            updateCount(drink.amount);
                          }}
                        >
                          <span className="mr-1.5">{getDrinkIcon(drink.type)}</span>
                          {drink.label}
                        </Button>
                      ))}
                    </div>
                  </motion.div>

                  {/* 7-Day Trend Chart */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.18 }}
                    className="rounded-xl border border-emerald-700/30 bg-emerald-900/30 p-4"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-semibold text-emerald-200">7-Day Trend</span>
                      <span className="text-xs text-emerald-400">{weeklyStats.total} total</span>
                    </div>
                    <div className="flex items-end justify-between gap-1 h-24">
                      {isLoadingWeek ? (
                        Array.from({ length: 7 }).map((_, i) => (
                          <Skeleton key={i} className="flex-1 h-full bg-emerald-900/30" />
                        ))
                      ) : (
                        weekData.map((day) => {
                          const maxHeight = 80;
                          const height = Math.min((day.drinks / 5) * maxHeight, maxHeight);
                          const isTodayDay = day.date === dateKey;

                          return (
                            <div
                              key={day.date}
                              className="flex-1 flex flex-col items-center gap-1"
                            >
                              <div
                                className={cn(
                                  "w-full rounded-t-sm transition-all duration-300",
                                  day.isDryDay
                                    ? "bg-emerald-400/70"
                                    : day.drinks <= 2
                                      ? "bg-amber-500/70"
                                      : "bg-rose-500/70",
                                  isTodayDay && "ring-2 ring-white/30"
                                )}
                                style={{ height: `${Math.max(height, 4)}px` }}
                              />
                              <span
                                className={cn(
                                  "text-[10px] w-full text-center truncate",
                                  isTodayDay ? "text-white font-medium" : "text-emerald-300"
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

                  {/* Analytics Section */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="rounded-xl border border-emerald-700/30 bg-emerald-900/30 p-4"
                  >
                    <p className="text-sm font-semibold text-emerald-200 mb-3">Analytics</p>
                    <div className="grid grid-cols-3 gap-3">
                      {/* Current Streak */}
                      <div className="flex flex-col items-center gap-1">
                        <div className="flex items-center gap-1">
                          <Flame className={cn(
                            "h-4 w-4",
                            alcoholData.streakData?.currentDryDays > 0 ? "text-orange-400" : "text-slate-500"
                          )} />
                          <span className={cn(
                            "text-2xl font-bold",
                            alcoholData.streakData?.currentDryDays > 0 ? "text-orange-200" : "text-slate-500"
                          )}>
                            {alcoholData.streakData?.currentDryDays ?? 0}
                          </span>
                        </div>
                        <span className="text-xs text-emerald-300">Day Streak</span>
                      </div>

                      {/* Longest Streak */}
                      <div className="flex flex-col items-center gap-1">
                        <Trophy className="h-4 w-4 text-amber-400" />
                        <span className="text-2xl font-bold text-amber-200">
                          {alcoholData.streakData?.longestDryStreak ?? 0}
                        </span>
                        <span className="text-xs text-emerald-300">Best Streak</span>
                      </div>

                      {/* Dry Days This Week */}
                      <div className="flex flex-col items-center gap-1">
                        <Target className="h-4 w-4 text-emerald-400" />
                        <span className="text-2xl font-bold text-emerald-200">
                          {weeklyStats.dryDays}/7
                        </span>
                        <span className="text-xs text-emerald-300">Dry Days</span>
                      </div>
                    </div>

                    {/* Additional Stats */}
                    <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-emerald-700/20">
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-lg font-semibold text-emerald-200">{weeklyStats.average}/d</span>
                        <span className="text-xs text-emerald-300">Weekly Average</span>
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-lg font-semibold text-emerald-200">{alcoholData.streakData?.totalDrinksThisMonth ?? 0}</span>
                        <span className="text-xs text-emerald-300">This Month</span>
                      </div>
                    </div>

                    {/* Motivational Message */}
                    <div className="mt-3 pt-3 border-t border-emerald-700/20 text-center">
                      <p className="text-sm text-emerald-100">
                        {getMotivationalMessage()}
                      </p>
                    </div>
                  </motion.div>

                  {/* Milestone Celebration */}
                  {alcoholData.streakData?.currentDryDays > 0 && [7, 30, 90].includes(alcoholData.streakData.currentDryDays) && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-center"
                    >
                      <Trophy className="h-8 w-8 text-amber-400 mx-auto mb-2" />
                      <p className="text-lg font-bold text-amber-200">
                        {alcoholData.streakData.currentDryDays} Day Milestone!
                      </p>
                      <p className="text-sm text-amber-300/80">
                        Incredible dedication to your health!
                      </p>
                    </motion.div>
                  )}

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
                      Unable to load alcohol tracker. Pull to refresh or try again later.
                    </motion.div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
};
