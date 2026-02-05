import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Leaf, Plus, Minus, Flame, Target, Trophy, ChevronDown, ChevronUp, CheckCircle2, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { format, isToday, subDays } from 'date-fns';
import { useClerkUser } from '@/lib/hooks/auth/useClerkUser';
import { useSupabaseUserId } from '@/lib/services/supabase/clerk-integration';
import { XPPill } from '@/domains/lifelock/1-daily/1-morning-routine/ui/components/xp/XPPill';
import useSWR from 'swr';
import { cn } from '@/lib/utils';

interface CannabisTrackerProps {
  selectedDate: Date;
}

// Consumption methods
const CONSUMPTION_METHODS = ['Smoke', 'Vape', 'Edible', 'Tincture'] as const;
type ConsumptionMethod = typeof CONSUMPTION_METHODS[number];

// Quick add amounts
const CANNABIS_ACTION_AMOUNTS = [1, 0.5];

// T-break milestones
const TBREAK_MILESTONES = [3, 7, 14, 30];

interface WeekData {
  date: string;
  sessions: number;
  isTBreakDay: boolean;
}

interface CannabisData {
  date: string;
  sessions: number;
  method?: ConsumptionMethod;
  notes?: string;
  streakData?: {
    currentTBreakDays: number;
    longestTBreakStreak: number;
    totalSessionsThisWeek: number;
    totalSessionsThisMonth: number;
  };
}

/**
 * Calculate Cannabis XP
 * +5 XP for logging a session
 * +50 XP for T-break milestones (3, 7, 14, 30 days)
 * +10 XP for moderation (keeping sessions low)
 */
function calculateCannabisXP(data: {
  sessionsToday: number;
  tBreakDays: number;
  isModerationDay: boolean;
}): { total: number; loggingBonus: number; tBreakBonus: number; moderationBonus: number } {
  let loggingBonus = 0;
  let tBreakBonus = 0;
  let moderationBonus = 0;

  // Logging bonus: 5 XP per session logged (encourages tracking)
  if (data.sessionsToday > 0) {
    loggingBonus = Math.min(data.sessionsToday * 5, 20); // Cap at 20 XP
  }

  // T-break bonus: 50 XP for milestone days
  if (data.tBreakDays > 0) {
    if (TBREAK_MILESTONES.includes(data.tBreakDays)) {
      tBreakBonus = 50;
    } else if (data.tBreakDays >= 30) {
      tBreakBonus = 50; // Continue getting bonus after 30 days
    }
  }

  // Moderation bonus: 10 XP for keeping sessions <= 1
  if (data.isModerationDay && data.sessionsToday <= 1 && data.sessionsToday > 0) {
    moderationBonus = 10;
  }

  return {
    total: loggingBonus + tBreakBonus + moderationBonus,
    loggingBonus,
    tBreakBonus,
    moderationBonus
  };
}

// Mock service for cannabis data (until backend is implemented)
const cannabisService = {
  getCannabisData: async (userId: string, date: string): Promise<CannabisData> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 100));
    return {
      date,
      sessions: 0,
      streakData: {
        currentTBreakDays: 0,
        longestTBreakStreak: 0,
        totalSessionsThisWeek: 0,
        totalSessionsThisMonth: 0,
      },
    };
  },
  updateCannabisData: async (userId: string, date: string, updates: Partial<CannabisData>): Promise<CannabisData> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    return {
      date,
      sessions: updates.sessions ?? 0,
      method: updates.method,
      notes: updates.notes,
    };
  },
};

const fetchCannabisData = (userId: string, dateKey: string) =>
  cannabisService.getCannabisData(userId, dateKey);

export const CannabisTracker: React.FC<CannabisTrackerProps> = ({ selectedDate }) => {
  const { user } = useClerkUser();
  const internalUserId = useSupabaseUserId(user?.id || null);
  const dateKey = format(selectedDate, 'yyyy-MM-dd');
  const isTodayDate = isToday(selectedDate);

  const { data, error, isLoading, mutate } = useSWR<CannabisData>(
    internalUserId ? ['cannabis-tracker', internalUserId, dateKey] : null,
    () => fetchCannabisData(internalUserId!, dateKey),
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
  const [selectedMethod, setSelectedMethod] = useState<ConsumptionMethod | undefined>(undefined);
  const cannabisXPRef = useRef(0);

  const cannabisData = data ?? {
    date: dateKey,
    sessions: 0,
    streakData: {
      currentTBreakDays: 0,
      longestTBreakStreak: 0,
      totalSessionsThisWeek: 0,
      totalSessionsThisMonth: 0,
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
          const dayData = await cannabisService.getCannabisData(internalUserId, dk);
          days.push({
            date: dk,
            sessions: dayData.sessions,
            isTBreakDay: dayData.sessions === 0,
          });
        }
        setWeekData(days);
      } catch (error) {
        console.error('[CannabisTracker] Failed to load week data:', error);
      } finally {
        setIsLoadingWeek(false);
      }
    };

    loadWeekData();
  }, [internalUserId, selectedDate]);

  // XP storage key
  const cannabisXPStorageKey = useMemo(() => {
    const userSuffix = internalUserId ?? 'anonymous';
    return `lifelock-${userSuffix}-${dateKey}-cannabisXP`;
  }, [internalUserId, dateKey]);

  // Load previous XP from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = window.localStorage.getItem(cannabisXPStorageKey);
    cannabisXPRef.current = stored ? Number(stored) || 0 : 0;
  }, [cannabisXPStorageKey]);

  // Calculate current XP
  const cannabisXP = useMemo(() => {
    return calculateCannabisXP({
      sessionsToday: cannabisData.sessions,
      tBreakDays: cannabisData.streakData?.currentTBreakDays ?? 0,
      isModerationDay: cannabisData.sessions <= 1,
    });
  }, [cannabisData.sessions, cannabisData.streakData?.currentTBreakDays]);

  // Award XP when earned (only for today)
  useEffect(() => {
    if (!isTodayDate) return;

    if (cannabisXP.total > cannabisXPRef.current) {
      cannabisXPRef.current = cannabisXP.total;
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(cannabisXPStorageKey, cannabisXP.total.toString());
      }
    } else if (cannabisXP.total < cannabisXPRef.current) {
      cannabisXPRef.current = cannabisXP.total;
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(cannabisXPStorageKey, cannabisXP.total.toString());
      }
    }
  }, [isTodayDate, cannabisXP.total, cannabisXPStorageKey]);

  const updateSessions = useCallback(async (delta: number) => {
    if (isUpdating || !internalUserId) return;

    const currentValue = cannabisData.sessions;
    const newValue = Math.max(0, currentValue + delta);

    if (newValue === currentValue) return;

    try {
      setIsUpdating(true);
      setActionError(null);

      await mutate(
        async () => {
          return await cannabisService.updateCannabisData(internalUserId!, dateKey, {
            sessions: newValue,
            method: selectedMethod,
          });
        },
        {
          optimisticData: (current) => ({
            ...current!,
            sessions: newValue,
          }),
          rollbackOnError: true,
          populateCache: true,
          revalidate: true,
        }
      );
    } catch (error) {
      console.error('[CannabisTracker] Failed to update sessions:', error);
      setActionError('Failed to update. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  }, [isUpdating, internalUserId, cannabisData.sessions, mutate, dateKey, selectedMethod]);

  // Calculate weekly stats
  const weeklyStats = useMemo(() => {
    const total = weekData.reduce((sum, day) => sum + day.sessions, 0);
    const tBreakDays = weekData.filter(day => day.isTBreakDay).length;
    const average = Math.round((total / 7) * 10) / 10;
    return { total, tBreakDays, average };
  }, [weekData]);

  // Get motivational message
  const getMotivationalMessage = () => {
    const tBreakDays = cannabisData.streakData?.currentTBreakDays ?? 0;

    if (cannabisData.sessions === 0) {
      if (tBreakDays > 0) {
        if (TBREAK_MILESTONES.includes(tBreakDays)) {
          return `🎉 Milestone! ${tBreakDays} day T-break! Amazing discipline!`;
        }
        return `${tBreakDays} day T-break! Your tolerance will thank you!`;
      }
      return "T-break day! Your endocannabinoid system is resetting!";
    }

    if (cannabisData.sessions === 1) {
      return "Perfect moderation! One and done!";
    }

    if (weeklyStats.tBreakDays >= 3) {
      return "Great balance this week! Moderation is key!";
    }

    return "Track honestly, consume mindfully!";
  };

  // Check if on T-break
  const isTBreak = cannabisData.sessions === 0;

  // Check if milestone day
  const isMilestoneDay = cannabisData.streakData?.currentTBreakDays
    ? TBREAK_MILESTONES.includes(cannabisData.streakData.currentTBreakDays)
    : false;

  return (
    <Card className="bg-green-900/20 border-green-700/40 overflow-hidden">
      {/* Clickable Header */}
      <div
        className="p-4 cursor-pointer hover:bg-green-900/10 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="p-1.5 rounded-lg bg-green-500/20 border border-green-400/30 flex-shrink-0">
              <Leaf className="h-4 w-4 text-green-300" />
            </div>
            <h4 className="text-green-100 font-semibold text-base truncate">Cannabis</h4>
            {/* CheckCircle when on T-break */}
            {isTBreak && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 10 }}
              >
                <CheckCircle2 className="h-5 w-5 text-emerald-400 flex-shrink-0" />
              </motion.div>
            )}
            {/* Sparkles on milestone */}
            {isMilestoneDay && (
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 10, delay: 0.1 }}
              >
                <Sparkles className="h-4 w-4 text-yellow-400 flex-shrink-0" />
              </motion.div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <XPPill
              xp={cannabisXP.total}
              earned={cannabisXP.total > 0 || isTBreak}
              showGlow={isMilestoneDay}
            />
            {isExpanded ? (
              <ChevronUp className="h-5 w-5 text-green-400 flex-shrink-0" />
            ) : (
              <ChevronDown className="h-5 w-5 text-green-400 flex-shrink-0" />
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-2 mb-1">
          <div className="w-full bg-green-900/30 border border-green-600/20 rounded-full h-1.5">
            <motion.div
              className={cn(
                "h-1.5 rounded-full transition-all duration-500",
                isTBreak
                  ? "bg-gradient-to-r from-emerald-400 to-green-500"
                  : "bg-gradient-to-r from-green-400 to-emerald-500"
              )}
              initial={{ width: 0 }}
              animate={{ width: `${isTBreak ? 100 : Math.min((cannabisData.sessions / 5) * 100, 100)}%` }}
            />
          </div>
          <div className="flex justify-between items-center mt-1">
            <span className="text-xs text-green-400/70 font-medium">
              {isTBreak
                ? `T-break day ${cannabisData.streakData?.currentTBreakDays ? `(${cannabisData.streakData.currentTBreakDays})` : ''}`
                : `${cannabisData.sessions} session${cannabisData.sessions !== 1 ? 's' : ''} today`}
            </span>
            {isTBreak && !isExpanded && (
              <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" /> T-Break
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
            <div className="px-4 pb-4 space-y-3">
              {isLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-32 w-full bg-green-900/30" />
                  <Skeleton className="h-24 w-full bg-green-900/20" />
                  <Skeleton className="h-20 w-full bg-green-900/20" />
                </div>
              ) : (
                <>
                  {/* 7-Day Trend Chart */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="rounded-xl border border-green-700/30 bg-green-900/30 p-4"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-semibold text-green-200">7-Day Trend</span>
                      <span className="text-xs text-green-400">{weeklyStats.total} total</span>
                    </div>
                    <div className="flex items-end justify-between gap-1 h-24">
                      {isLoadingWeek ? (
                        Array.from({ length: 7 }).map((_, i) => (
                          <Skeleton key={i} className="flex-1 h-full bg-green-900/30" />
                        ))
                      ) : (
                        weekData.map((day) => {
                          const maxHeight = 80;
                          const height = Math.min((day.sessions / 5) * maxHeight, maxHeight);
                          const isTodayDay = day.date === dateKey;

                          return (
                            <div
                              key={day.date}
                              className="flex-1 flex flex-col items-center gap-1"
                            >
                              <div
                                className={cn(
                                  "w-full rounded-t-sm transition-all duration-300",
                                  day.isTBreakDay
                                    ? "bg-emerald-400/70"
                                    : "bg-green-600/70",
                                  isTodayDay && "ring-2 ring-white/30"
                                )}
                                style={{ height: `${Math.max(height, 4)}px` }}
                              />
                              <span
                                className={cn(
                                  "text-[10px] w-full text-center truncate",
                                  isTodayDay ? "text-white font-medium" : "text-green-300"
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

                  {/* Sessions Today Counter */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className={cn(
                      "rounded-xl border p-4 transition-all duration-300",
                      isTBreak
                        ? "border-emerald-500/30 bg-emerald-950/20"
                        : "border-green-700/30 bg-green-900/30"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={cn(
                          "text-sm mb-1",
                          isTBreak ? "text-emerald-300" : "text-green-300"
                        )}>
                          Sessions Today
                        </p>
                        <motion.p
                          key={cannabisData.sessions}
                          initial={{ scale: 1.1, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className={cn(
                            "text-5xl font-bold",
                            isTBreak ? "text-emerald-400" : "text-white"
                          )}
                        >
                          {cannabisData.sessions}
                        </motion.p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            updateSessions(-1);
                          }}
                          variant="outline"
                          size="icon"
                          className="h-12 w-12 rounded-full border-green-600/50 text-green-400 hover:bg-green-800/50 hover:text-green-200 transition-all duration-200"
                          disabled={cannabisData.sessions === 0 || isUpdating}
                        >
                          <Minus className="h-5 w-5" />
                        </Button>
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            updateSessions(1);
                          }}
                          variant="outline"
                          size="icon"
                          className="h-12 w-12 rounded-full border-green-500/50 text-green-400 hover:bg-green-900/30 hover:text-green-300 transition-all duration-200"
                          disabled={isUpdating}
                        >
                          <Plus className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>

                    {/* Quick Add Buttons */}
                    <div className="flex gap-2 mt-3">
                      {CANNABIS_ACTION_AMOUNTS.map((amount) => (
                        <Button
                          key={amount}
                          type="button"
                          variant="outline"
                          size="sm"
                          className={cn(
                            "flex-1 h-9 text-sm font-medium transition-all duration-200",
                            amount === 0.5
                              ? "border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/20"
                              : "border-green-500/40 text-green-300 hover:bg-green-500/20"
                          )}
                          disabled={isUpdating}
                          onClick={(e) => {
                            e.stopPropagation();
                            updateSessions(amount);
                          }}
                        >
                          {amount === 0.5 ? 'Microdose' : `+${amount} Session`}
                        </Button>
                      ))}
                    </div>
                  </motion.div>

                  {/* Consumption Method Tags */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.18 }}
                    className="rounded-xl border border-green-700/30 bg-green-900/30 p-4"
                  >
                    <p className="text-sm font-semibold text-green-200 mb-3">Method (Optional)</p>
                    <div className="flex flex-wrap gap-2">
                      {CONSUMPTION_METHODS.map((method) => (
                        <button
                          key={method}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedMethod(selectedMethod === method ? undefined : method);
                          }}
                          className={cn(
                            "px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200",
                            selectedMethod === method
                              ? "bg-green-500/40 text-green-100 border border-green-400/50"
                              : "bg-green-900/30 text-green-400 border border-green-700/30 hover:bg-green-800/40"
                          )}
                        >
                          {method}
                        </button>
                      ))}
                    </div>
                  </motion.div>

                  {/* Analytics Section */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="rounded-xl border border-green-700/30 bg-green-900/30 p-4"
                  >
                    <p className="text-sm font-semibold text-emerald-200 mb-3">Analytics</p>
                    <div className="grid grid-cols-3 gap-3">
                      {/* Current T-Break Streak */}
                      <div className="flex flex-col items-center gap-1">
                        <div className="flex items-center gap-1">
                          <Flame className={cn(
                            "h-4 w-4",
                            cannabisData.streakData?.currentTBreakDays > 0 ? "text-orange-400" : "text-slate-500"
                          )} />
                          <span className={cn(
                            "text-2xl font-bold",
                            cannabisData.streakData?.currentTBreakDays > 0 ? "text-orange-200" : "text-slate-500"
                          )}>
                            {cannabisData.streakData?.currentTBreakDays ?? 0}
                          </span>
                        </div>
                        <span className="text-xs text-green-300">T-Break Days</span>
                      </div>

                      {/* Longest T-Break */}
                      <div className="flex flex-col items-center gap-1">
                        <Trophy className="h-4 w-4 text-amber-400" />
                        <span className="text-2xl font-bold text-amber-200">
                          {cannabisData.streakData?.longestTBreakStreak ?? 0}
                        </span>
                        <span className="text-xs text-green-300">Best T-Break</span>
                      </div>

                      {/* T-Break Days This Week */}
                      <div className="flex flex-col items-center gap-1">
                        <Target className="h-4 w-4 text-emerald-400" />
                        <span className="text-2xl font-bold text-emerald-200">
                          {weeklyStats.tBreakDays}/7
                        </span>
                        <span className="text-xs text-green-300">T-Break Days</span>
                      </div>
                    </div>

                    {/* Additional Stats */}
                    <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-green-700/20">
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-lg font-semibold text-green-200">{weeklyStats.average}/d</span>
                        <span className="text-xs text-green-300">Weekly Average</span>
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-lg font-semibold text-green-200">{cannabisData.streakData?.totalSessionsThisMonth ?? 0}</span>
                        <span className="text-xs text-green-300">This Month</span>
                      </div>
                    </div>

                    {/* T-Break Milestones */}
                    <div className="mt-3 pt-3 border-t border-green-700/20">
                      <p className="text-xs text-green-400 mb-2">T-Break Milestones</p>
                      <div className="flex justify-between">
                        {TBREAK_MILESTONES.map((milestone) => {
                          const currentDays = cannabisData.streakData?.currentTBreakDays ?? 0;
                          const isReached = currentDays >= milestone;
                          const isNext = !isReached && currentDays < milestone && (currentDays > milestone - 3 || milestone === 3);

                          return (
                            <div
                              key={milestone}
                              className={cn(
                                "flex flex-col items-center gap-1 px-2 py-1 rounded-lg transition-all duration-200",
                                isReached && "bg-emerald-500/20",
                                isNext && "bg-green-500/10 ring-1 ring-green-400/30"
                              )}
                            >
                              <span className={cn(
                                "text-xs font-bold",
                                isReached ? "text-emerald-300" : isNext ? "text-green-300" : "text-slate-500"
                              )}>
                                {milestone}d
                              </span>
                              {isReached && (
                                <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Motivational Message */}
                    <div className="mt-3 pt-3 border-t border-green-700/20 text-center">
                      <p className="text-sm text-green-100">
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
                      Unable to load cannabis tracker. Pull to refresh or try again later.
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
