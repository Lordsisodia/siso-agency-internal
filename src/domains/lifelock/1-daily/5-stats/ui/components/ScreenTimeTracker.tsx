import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Smartphone, Plus, Minus, Flame, Moon, Target, ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';
import { format, isToday, subDays } from 'date-fns';
import { useClerkUser } from '@/lib/hooks/auth/useClerkUser';
import { useSupabaseUserId } from '@/lib/services/supabase/clerk-integration';
import { XPPill } from '@/domains/lifelock/1-daily/1-morning-routine/ui/components/xp/XPPill';
import { GamificationService } from '@/domains/lifelock/_shared/services/gamificationService';
import useSWR from 'swr';
import { cn } from '@/lib/utils';

interface ScreenTimeTrackerProps {
  selectedDate: Date;
}

interface ScreenTimeData {
  date: string;
  totalHours: number;
  socialMediaHours: number;
  workHours: number;
  digitalSunset: boolean;
  digitalSunsetStreak: number;
}

interface WeekData {
  date: string;
  totalHours: number;
  digitalSunset: boolean;
}

// XP Calculation for Screen Time
const calculateScreenTimeXP = (data: {
  totalHours: number;
  digitalSunset: boolean;
  digitalSunsetStreak: number;
}): { total: number; baseXP: number; sunsetBonus: number; streakBonus: number } => {
  let baseXP = 5; // +5 XP for logging
  let sunsetBonus = 0;
  let streakBonus = 0;

  // Bonus for low screen time
  if (data.totalHours < 4) {
    baseXP += 15; // +15 XP for <4 hours
  }

  // Digital sunset bonus
  if (data.digitalSunset) {
    sunsetBonus = 10;
  }

  // Streak bonus for digital sunset
  if (data.digitalSunsetStreak >= 7) {
    streakBonus = 25; // +25 XP for week streak
  } else if (data.digitalSunsetStreak >= 3) {
    streakBonus = 15; // +15 XP for 3+ day streak
  } else if (data.digitalSunsetStreak >= 1) {
    streakBonus = 5; // +5 XP for maintaining streak
  }

  return {
    total: baseXP + sunsetBonus + streakBonus,
    baseXP,
    sunsetBonus,
    streakBonus
  };
};

// Color coding based on screen time
const getScreenTimeColor = (hours: number): { bg: string; text: string; border: string; label: string } => {
  if (hours < 4) {
    return {
      bg: 'bg-emerald-500/20',
      text: 'text-emerald-300',
      border: 'border-emerald-500/40',
      label: 'Excellent'
    };
  } else if (hours < 6) {
    return {
      bg: 'bg-amber-500/20',
      text: 'text-amber-300',
      border: 'border-amber-500/40',
      label: 'Moderate'
    };
  } else {
    return {
      bg: 'bg-rose-500/20',
      text: 'text-rose-300',
      border: 'border-rose-500/40',
      label: 'High'
    };
  }
};

const PRESET_HOURS = [2, 4, 6, 8];

// Simulated service for now - can be replaced with actual service later
const screenTimeService = {
  getScreenTimeData: async (userId: string, date: string): Promise<ScreenTimeData> => {
    // Placeholder - in real implementation, fetch from Supabase
    return {
      date,
      totalHours: 0,
      socialMediaHours: 0,
      workHours: 0,
      digitalSunset: false,
      digitalSunsetStreak: 0
    };
  },
  updateScreenTimeData: async (userId: string, date: string, updates: Partial<ScreenTimeData>): Promise<ScreenTimeData> => {
    // Placeholder - in real implementation, update Supabase
    return {
      date,
      totalHours: updates.totalHours ?? 0,
      socialMediaHours: updates.socialMediaHours ?? 0,
      workHours: updates.workHours ?? 0,
      digitalSunset: updates.digitalSunset ?? false,
      digitalSunsetStreak: updates.digitalSunsetStreak ?? 0
    };
  }
};

const fetchScreenTimeData = (userId: string, dateKey: string) =>
  screenTimeService.getScreenTimeData(userId, dateKey);

export const ScreenTimeTracker: React.FC<ScreenTimeTrackerProps> = ({ selectedDate }) => {
  const { user } = useClerkUser();
  const internalUserId = useSupabaseUserId(user?.id || null);
  const dateKey = format(selectedDate, 'yyyy-MM-dd');
  const isTodayDate = isToday(selectedDate);

  const { data, error, isLoading, mutate } = useSWR<ScreenTimeData>(
    internalUserId ? ['screen-time-tracker', internalUserId, dateKey] : null,
    () => fetchScreenTimeData(internalUserId!, dateKey),
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
  const screenTimeXPRef = useRef(0);

  const screenTimeData = data ?? {
    date: dateKey,
    totalHours: 0,
    socialMediaHours: 0,
    workHours: 0,
    digitalSunset: false,
    digitalSunsetStreak: 0
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
          const dayData = await screenTimeService.getScreenTimeData(internalUserId, dk);
          days.push({
            date: dk,
            totalHours: dayData.totalHours,
            digitalSunset: dayData.digitalSunset
          });
        }
        setWeekData(days);
      } catch (error) {
        console.error('[ScreenTimeTracker] Failed to load week data:', error);
      } finally {
        setIsLoadingWeek(false);
      }
    };

    loadWeekData();
  }, [internalUserId, selectedDate]);

  // XP storage key
  const screenTimeXPStorageKey = useMemo(() => {
    const userSuffix = internalUserId ?? 'anonymous';
    return `lifelock-${userSuffix}-${dateKey}-screenTimeXP`;
  }, [internalUserId, dateKey]);

  // Load previous XP from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = window.localStorage.getItem(screenTimeXPStorageKey);
    screenTimeXPRef.current = stored ? Number(stored) || 0 : 0;
  }, [screenTimeXPStorageKey]);

  // Calculate current XP
  const screenTimeXP = useMemo(() => {
    return calculateScreenTimeXP({
      totalHours: screenTimeData.totalHours,
      digitalSunset: screenTimeData.digitalSunset,
      digitalSunsetStreak: screenTimeData.digitalSunsetStreak
    });
  }, [screenTimeData.totalHours, screenTimeData.digitalSunset, screenTimeData.digitalSunsetStreak]);

  // Award XP when earned (only for today)
  useEffect(() => {
    if (!isTodayDate) return;

    if (screenTimeXP.total > screenTimeXPRef.current) {
      const diff = screenTimeXP.total - screenTimeXPRef.current;
      const multiplier = diff / 20;
      GamificationService.awardXP('digital_wellness', multiplier);
      screenTimeXPRef.current = screenTimeXP.total;
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(screenTimeXPStorageKey, screenTimeXP.total.toString());
      }
    } else if (screenTimeXP.total < screenTimeXPRef.current) {
      screenTimeXPRef.current = screenTimeXP.total;
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(screenTimeXPStorageKey, screenTimeXP.total.toString());
      }
    }
  }, [isTodayDate, screenTimeXP.total, screenTimeXPStorageKey]);

  const updateHours = useCallback(async (delta: number) => {
    if (isUpdating || !internalUserId) return;

    const currentValue = screenTimeData.totalHours;
    const newValue = Math.max(0, Math.min(24, currentValue + delta));

    if (newValue === currentValue) return;

    try {
      setIsUpdating(true);
      setActionError(null);

      await mutate(
        async () => {
          return await screenTimeService.updateScreenTimeData(internalUserId!, dateKey, {
            totalHours: newValue
          });
        },
        {
          optimisticData: (current) => ({
            ...current!,
            totalHours: newValue
          }),
          rollbackOnError: true,
          populateCache: true,
          revalidate: true
        }
      );
    } catch (error) {
      console.error('[ScreenTimeTracker] Failed to update hours:', error);
      setActionError('Failed to update. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  }, [isUpdating, internalUserId, screenTimeData.totalHours, mutate, dateKey]);

  const setPresetHours = useCallback(async (hours: number) => {
    if (isUpdating || !internalUserId) return;

    try {
      setIsUpdating(true);
      setActionError(null);

      await mutate(
        async () => {
          return await screenTimeService.updateScreenTimeData(internalUserId!, dateKey, {
            totalHours: hours
          });
        },
        {
          optimisticData: (current) => ({
            ...current!,
            totalHours: hours
          }),
          rollbackOnError: true,
          populateCache: true,
          revalidate: true
        }
      );
    } catch (error) {
      console.error('[ScreenTimeTracker] Failed to set hours:', error);
      setActionError('Failed to update. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  }, [isUpdating, internalUserId, mutate, dateKey]);

  const toggleDigitalSunset = useCallback(async () => {
    if (isUpdating || !internalUserId) return;

    const newValue = !screenTimeData.digitalSunset;
    const newStreak = newValue ? screenTimeData.digitalSunsetStreak + 1 : Math.max(0, screenTimeData.digitalSunsetStreak - 1);

    try {
      setIsUpdating(true);
      setActionError(null);

      await mutate(
        async () => {
          return await screenTimeService.updateScreenTimeData(internalUserId!, dateKey, {
            digitalSunset: newValue,
            digitalSunsetStreak: newStreak
          });
        },
        {
          optimisticData: (current) => ({
            ...current!,
            digitalSunset: newValue,
            digitalSunsetStreak: newStreak
          }),
          rollbackOnError: true,
          populateCache: true,
          revalidate: true
        }
      );
    } catch (error) {
      console.error('[ScreenTimeTracker] Failed to toggle digital sunset:', error);
      setActionError('Failed to update. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  }, [isUpdating, internalUserId, screenTimeData.digitalSunset, screenTimeData.digitalSunsetStreak, mutate, dateKey]);

  // Calculate weekly stats
  const weeklyStats = useMemo(() => {
    const total = weekData.reduce((sum, day) => sum + day.totalHours, 0);
    const digitalSunsetDays = weekData.filter(day => day.digitalSunset).length;
    const average = weekData.length > 0 ? Math.round((total / weekData.length) * 10) / 10 : 0;
    return { total, digitalSunsetDays, average };
  }, [weekData]);

  // Get status color
  const statusColor = getScreenTimeColor(screenTimeData.totalHours);

  // Get motivational message
  const getMotivationalMessage = () => {
    if (screenTimeData.totalHours === 0) {
      return "Log your screen time to start tracking!";
    }
    if (screenTimeData.totalHours < 4) {
      return "Excellent! You're keeping screen time in check!";
    }
    if (screenTimeData.totalHours < 6) {
      return "Good job! Try to reduce it a bit more tomorrow.";
    }
    if (screenTimeData.digitalSunset) {
      return "Great digital sunset streak! Keep it up!";
    }
    return "Consider a digital sunset to improve sleep quality.";
  };

  const isGoalMet = screenTimeData.totalHours > 0 && screenTimeData.totalHours < 4;

  return (
    <Card className="bg-indigo-900/20 border-indigo-700/40 overflow-hidden">
      {/* Clickable Header */}
      <div
        className="p-4 cursor-pointer hover:bg-indigo-900/10 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="p-1.5 rounded-lg bg-indigo-500/20 border border-indigo-400/30 flex-shrink-0">
              <Smartphone className="h-4 w-4 text-indigo-300" />
            </div>
            <h4 className="text-indigo-100 font-semibold text-base truncate">Screen Time</h4>
            {/* Green CheckCircle when goal met */}
            {isGoalMet && (
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
              xp={screenTimeXP.total}
              earned={screenTimeData.totalHours > 0}
              showGlow={isGoalMet || screenTimeData.digitalSunset}
            />
            {isExpanded ? (
              <ChevronUp className="h-5 w-5 text-indigo-400 flex-shrink-0" />
            ) : (
              <ChevronDown className="h-5 w-5 text-indigo-400 flex-shrink-0" />
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-2 mb-1">
          <div className="w-full bg-indigo-900/30 border border-indigo-600/20 rounded-full h-1.5">
            <motion.div
              className={cn(
                "h-1.5 rounded-full transition-all duration-500",
                screenTimeData.totalHours < 4
                  ? "bg-gradient-to-r from-emerald-400 to-green-500"
                  : screenTimeData.totalHours < 6
                  ? "bg-gradient-to-r from-amber-400 to-yellow-500"
                  : "bg-gradient-to-r from-rose-400 to-red-500"
              )}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((screenTimeData.totalHours / 8) * 100, 100)}%` }}
            />
          </div>
          <div className="flex justify-between items-center mt-1">
            <span className="text-xs text-indigo-400/70 font-medium">
              {screenTimeData.totalHours > 0 ? `${screenTimeData.totalHours}h today` : 'No data logged'}
            </span>
            {isGoalMet && !isExpanded && (
              <span className="text-xs text-green-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" /> Excellent
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
                  <Skeleton className="h-32 w-full bg-indigo-900/30" />
                  <Skeleton className="h-24 w-full bg-indigo-900/20" />
                  <Skeleton className="h-20 w-full bg-indigo-900/20" />
                </div>
              ) : (
                <>
                  {/* 7-Day Trend Chart */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="rounded-xl border border-indigo-700/30 bg-indigo-900/30 p-4"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-semibold text-indigo-200">7-Day Trend</span>
                      <span className="text-xs text-indigo-400">{weeklyStats.average}h avg</span>
                    </div>
                    <div className="flex items-end justify-between gap-1 h-24">
                      {isLoadingWeek ? (
                        Array.from({ length: 7 }).map((_, i) => (
                          <Skeleton key={i} className="flex-1 h-full bg-indigo-900/30" />
                        ))
                      ) : (
                        weekData.map((day) => {
                          const maxHeight = 80;
                          const height = Math.min((day.totalHours / 12) * maxHeight, maxHeight);
                          const isTodayDay = day.date === dateKey;

                          return (
                            <div
                              key={day.date}
                              className="flex-1 flex flex-col items-center gap-1"
                            >
                              <div
                                className={cn(
                                  "w-full rounded-t-sm transition-all duration-300",
                                  day.totalHours < 4
                                    ? "bg-emerald-500/70"
                                    : day.totalHours < 6
                                    ? "bg-amber-500/70"
                                    : "bg-rose-500/70",
                                  isTodayDay && "ring-2 ring-white/30"
                                )}
                                style={{ height: `${Math.max(height, 4)}px` }}
                              />
                              <span
                                className={cn(
                                  "text-[10px] w-full text-center truncate",
                                  isTodayDay ? "text-white font-medium" : "text-indigo-300"
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

                  {/* Total Hours Counter */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className={cn(
                      "rounded-xl border p-4 transition-all duration-300",
                      screenTimeData.totalHours > 0 && screenTimeData.totalHours < 4
                        ? "border-emerald-500/30 bg-emerald-950/20"
                        : "border-indigo-700/30 bg-indigo-900/30"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={cn(
                          "text-sm mb-1",
                          screenTimeData.totalHours > 0 && screenTimeData.totalHours < 4
                            ? "text-emerald-300"
                            : "text-indigo-300"
                        )}>
                          Total Hours Today
                        </p>
                        <motion.p
                          key={screenTimeData.totalHours}
                          initial={{ scale: 1.1, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className={cn(
                            "text-5xl font-bold",
                            screenTimeData.totalHours > 0 && screenTimeData.totalHours < 4
                              ? "text-emerald-400"
                              : "text-white"
                          )}
                        >
                          {screenTimeData.totalHours}
                          <span className="text-2xl text-indigo-400 ml-1">h</span>
                        </motion.p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            updateHours(-0.5);
                          }}
                          variant="outline"
                          size="icon"
                          className="h-12 w-12 rounded-full border-indigo-600/50 text-indigo-400 hover:bg-indigo-800/50 hover:text-indigo-200 transition-all duration-200"
                          disabled={screenTimeData.totalHours === 0 || isUpdating}
                        >
                          <Minus className="h-5 w-5" />
                        </Button>
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            updateHours(0.5);
                          }}
                          variant="outline"
                          size="icon"
                          className="h-12 w-12 rounded-full border-indigo-500/50 text-indigo-400 hover:bg-indigo-900/30 hover:text-indigo-300 transition-all duration-200"
                          disabled={screenTimeData.totalHours >= 24 || isUpdating}
                        >
                          <Plus className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>

                    {/* Quick Preset Buttons */}
                    <div className="flex gap-2 mt-3">
                      {PRESET_HOURS.map((hours) => (
                        <Button
                          key={hours}
                          type="button"
                          variant="outline"
                          size="sm"
                          className={cn(
                            "flex-1 h-9 text-sm font-medium transition-all duration-200",
                            hours < 4
                              ? "border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/20"
                              : hours < 6
                              ? "border-amber-500/40 text-amber-300 hover:bg-amber-500/20"
                              : "border-rose-500/40 text-rose-300 hover:bg-rose-500/20"
                          )}
                          disabled={isUpdating}
                          onClick={(e) => {
                            e.stopPropagation();
                            setPresetHours(hours);
                          }}
                        >
                          {hours}h{hours === 8 ? '+' : ''}
                        </Button>
                      ))}
                    </div>
                  </motion.div>

                  {/* Digital Sunset Section */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className={cn(
                      "rounded-xl border p-4 transition-all duration-300",
                      screenTimeData.digitalSunset
                        ? "border-orange-500/30 bg-orange-950/20"
                        : "border-indigo-700/30 bg-indigo-900/30"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "p-2 rounded-lg transition-colors",
                          screenTimeData.digitalSunset
                            ? "bg-orange-500/20"
                            : "bg-indigo-500/20"
                        )}>
                          <Moon className={cn(
                            "h-5 w-5",
                            screenTimeData.digitalSunset
                              ? "text-orange-400"
                              : "text-indigo-400"
                          )} />
                        </div>
                        <div>
                          <p className={cn(
                            "text-sm font-medium",
                            screenTimeData.digitalSunset
                              ? "text-orange-300"
                              : "text-indigo-200"
                          )}>
                            Digital Sunset
                          </p>
                          <p className="text-xs text-indigo-400/70">
                            No screens 1hr before bed
                          </p>
                        </div>
                      </div>
                      <Checkbox
                        checked={screenTimeData.digitalSunset}
                        onCheckedChange={() => toggleDigitalSunset()}
                        disabled={isUpdating || !isTodayDate}
                        className={cn(
                          "h-6 w-6 border-2",
                          screenTimeData.digitalSunset
                            ? "border-orange-500 bg-orange-500"
                            : "border-indigo-500"
                        )}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>

                    {/* Streak Display */}
                    {screenTimeData.digitalSunsetStreak > 0 && (
                      <div className="mt-3 pt-3 border-t border-indigo-700/20">
                        <div className="flex items-center justify-center gap-2">
                          <Flame className={cn(
                            "h-5 w-5",
                            screenTimeData.digitalSunsetStreak >= 7
                              ? "text-orange-400"
                              : screenTimeData.digitalSunsetStreak >= 3
                              ? "text-amber-400"
                              : "text-yellow-400"
                          )} />
                          <span className="text-2xl font-bold text-white">
                            {screenTimeData.digitalSunsetStreak}
                          </span>
                          <span className="text-sm text-indigo-300">
                            day{screenTimeData.digitalSunsetStreak !== 1 ? 's' : ''} streak
                          </span>
                        </div>
                      </div>
                    )}
                  </motion.div>

                  {/* Analytics Section */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    className="rounded-xl border border-indigo-700/30 bg-indigo-900/30 p-4"
                  >
                    <p className="text-sm font-semibold text-indigo-200 mb-3">Analytics</p>
                    <div className="grid grid-cols-3 gap-3">
                      {/* Current Streak */}
                      <div className="flex flex-col items-center gap-1">
                        <div className="flex items-center gap-1">
                          <Flame className={cn(
                            "h-4 w-4",
                            screenTimeData.digitalSunsetStreak > 0 ? "text-orange-400" : "text-slate-500"
                          )} />
                          <span className={cn(
                            "text-2xl font-bold",
                            screenTimeData.digitalSunsetStreak > 0 ? "text-orange-200" : "text-slate-500"
                          )}>
                            {screenTimeData.digitalSunsetStreak}
                          </span>
                        </div>
                        <span className="text-xs text-indigo-300">Day Streak</span>
                      </div>

                      {/* Digital Sunset Days */}
                      <div className="flex flex-col items-center gap-1">
                        <Moon className={cn(
                          "h-4 w-4",
                          weeklyStats.digitalSunsetDays > 0 ? "text-amber-400" : "text-slate-500"
                        )} />
                        <span className={cn(
                          "text-2xl font-bold",
                          weeklyStats.digitalSunsetDays > 0 ? "text-amber-200" : "text-slate-500"
                        )}>
                          {weeklyStats.digitalSunsetDays}/7
                        </span>
                        <span className="text-xs text-indigo-300">This Week</span>
                      </div>

                      {/* Status */}
                      <div className="flex flex-col items-center gap-1">
                        <Target className={cn(
                          "h-4 w-4",
                          screenTimeData.totalHours > 0 ? statusColor.text.replace('text-', 'text-') : "text-slate-500"
                        )} />
                        <span className={cn(
                          "text-lg font-bold",
                          screenTimeData.totalHours > 0 ? statusColor.text : "text-slate-500"
                        )}>
                          {screenTimeData.totalHours > 0 ? statusColor.label : '-'}
                        </span>
                        <span className="text-xs text-indigo-300">Status</span>
                      </div>
                    </div>

                    {/* Weekly Total */}
                    <div className="mt-3 pt-3 border-t border-indigo-700/20">
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-sm text-indigo-300">Weekly Total:</span>
                        <span className="text-lg font-semibold text-white">{weeklyStats.total}h</span>
                      </div>
                    </div>

                    {/* Motivational Message */}
                    <div className="mt-3 pt-3 border-t border-indigo-700/20 text-center">
                      <p className="text-sm text-indigo-100">
                        {getMotivationalMessage()}
                      </p>
                    </div>
                  </motion.div>

                  {/* XP Breakdown */}
                  {screenTimeData.totalHours > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="rounded-xl border border-indigo-700/30 bg-indigo-900/30 p-4"
                    >
                      <p className="text-sm font-semibold text-indigo-200 mb-2">XP Breakdown</p>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-indigo-400">Base (logging)</span>
                          <span className="text-indigo-200">+{screenTimeXP.baseXP} XP</span>
                        </div>
                        {screenTimeXP.total > screenTimeXP.baseXP && (
                          <div className="flex justify-between">
                            <span className="text-emerald-400">Low screen time bonus</span>
                            <span className="text-emerald-200">+{screenTimeXP.baseXP - 5} XP</span>
                          </div>
                        )}
                        {screenTimeXP.sunsetBonus > 0 && (
                          <div className="flex justify-between">
                            <span className="text-amber-400">Digital sunset</span>
                            <span className="text-amber-200">+{screenTimeXP.sunsetBonus} XP</span>
                          </div>
                        )}
                        {screenTimeXP.streakBonus > 0 && (
                          <div className="flex justify-between">
                            <span className="text-orange-400">Streak bonus</span>
                            <span className="text-orange-200">+{screenTimeXP.streakBonus} XP</span>
                          </div>
                        )}
                        <div className="pt-1 mt-1 border-t border-indigo-700/20 flex justify-between">
                          <span className="text-indigo-300 font-medium">Total</span>
                          <span className="text-white font-bold">{screenTimeXP.total} XP</span>
                        </div>
                      </div>
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
                      Unable to load screen time tracker. Pull to refresh or try again later.
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
