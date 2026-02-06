import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cigarette, Plus, Minus, Flame, Target, Trophy, ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { format, isToday } from 'date-fns';
import { useClerkUser } from '@/lib/hooks/auth/useClerkUser';
import { useSupabaseUserId } from '@/lib/services/supabase/clerk-integration';
import { smokingService, SmokingSnapshot } from '@/services/database/smokingService';
import { calculateSmokingXP } from '../../domain/xpCalculations';
import { GamificationService } from '@/domains/lifelock/_shared/services/gamificationService';
import { XPPill } from '@/domains/lifelock/1-daily/1-morning-routine/ui/components/xp/XPPill';
import useSWR from 'swr';
import { cn } from '@/lib/utils';

interface SmokingTrackerProps {
  selectedDate: Date;
}

const SMOKING_ACTION_AMOUNTS = [1, 5, -1];

const fetchSmokingData = (userId: string, dateKey: string) =>
  smokingService.getSmokingData(userId, dateKey);

export const SmokingTracker: React.FC<SmokingTrackerProps> = ({ selectedDate }) => {
  const { user } = useClerkUser();
  const internalUserId = useSupabaseUserId(user?.id || null);
  const dateKey = format(selectedDate, 'yyyy-MM-dd');
  const isTodayDate = isToday(selectedDate);

  const { data, error, isLoading, mutate } = useSWR<SmokingSnapshot>(
    internalUserId ? ['smoking-tracker', internalUserId, dateKey] : null,
    () => fetchSmokingData(internalUserId!, dateKey),
    {
      revalidateOnFocus: true,
      keepPreviousData: true,
    }
  );

  const [isUpdating, setIsUpdating] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);
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

  // Get motivational message
  const getMotivationalMessage = () => {
    if (smokingData.cigarettes === 0) {
      return smokingData.streakData?.currentSmokeFreeDays > 0
        ? `Amazing! ${smokingData.streakData.currentSmokeFreeDays} days smoke-free!`
        : "You're smoke-free today! Keep it up!";
    }
    if (smokingData.cravings > smokingData.cigarettes * 2) {
      return "Great job resisting those cravings!";
    }
    return "Every smoke-free day counts!";
  };

  const isSmokeFree = smokingData.cigarettes === 0;

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
              <Cigarette className="h-4 w-4 text-emerald-300" />
            </div>
            <h4 className="text-emerald-100 font-semibold text-base truncate">Smoking Tracker</h4>
            {/* Green CheckCircle when smoke-free */}
            {isSmokeFree && (
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
              xp={smokingXP.total}
              earned={isSmokeFree}
              showGlow={isSmokeFree}
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
              className="bg-gradient-to-r from-emerald-400 to-green-500 h-1.5 rounded-full transition-all duration-500"
              initial={{ width: 0 }}
              animate={{ width: `${isSmokeFree ? 100 : Math.max(0, 100 - (smokingData.cigarettes * 10))}%` }}
            />
          </div>
          <div className="flex justify-between items-center mt-1">
            <span className="text-xs text-emerald-400/70 font-medium">
              {isSmokeFree ? 'Smoke-free today' : `${smokingData.cigarettes} cigarettes today`}
            </span>
            {isSmokeFree && !isExpanded && (
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
                </div>
              ) : (
                <>
                  {/* Simplified Counter Section */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className={cn(
                      "rounded-xl border p-4 transition-all duration-300",
                      isSmokeFree
                        ? "border-green-500/30 bg-green-950/20"
                        : "border-emerald-700/30 bg-emerald-900/30"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={cn(
                          "text-sm mb-1",
                          isSmokeFree ? "text-green-300" : "text-emerald-300"
                        )}>
                          Cigarettes Today
                        </p>
                        <motion.p
                          key={smokingData.cigarettes}
                          initial={{ scale: 1.1, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className={cn(
                            "text-5xl font-bold",
                            isSmokeFree ? "text-green-400" : "text-white"
                          )}
                        >
                          {smokingData.cigarettes}
                        </motion.p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            updateCount('cigarettes', -1);
                          }}
                          variant="outline"
                          size="icon"
                          className="h-12 w-12 rounded-full border-emerald-600/50 text-emerald-400 hover:bg-emerald-800/50 hover:text-emerald-200 transition-all duration-200"
                          disabled={smokingData.cigarettes === 0 || isUpdating}
                        >
                          <Minus className="h-5 w-5" />
                        </Button>
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            updateCount('cigarettes', 1);
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
                                ? "border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/20"
                                : "border-emerald-600/40 text-emerald-400 hover:bg-emerald-800/50"
                            )}
                            disabled={isUpdating || (amount < 0 && smokingData.cigarettes === 0)}
                            onClick={(e) => {
                              e.stopPropagation();
                              updateCount('cigarettes', amount);
                            }}
                          >
                            {amount > 0 ? `+${amount}` : amount}
                          </Button>
                        );
                      })}
                    </div>
                  </motion.div>

                  {/* Simplified Stats Row */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="rounded-xl border border-emerald-700/30 bg-emerald-900/30 p-4"
                  >
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
                        <span className="text-xs text-emerald-300">Day Streak</span>
                      </div>

                      {/* Longest Streak */}
                      <div className="flex flex-col items-center gap-1">
                        <Trophy className="h-4 w-4 text-amber-400" />
                        <span className="text-2xl font-bold text-amber-200">
                          {smokingData.streakData?.longestSmokeFreeStreak ?? 0}
                        </span>
                        <span className="text-xs text-emerald-300">Best Streak</span>
                      </div>

                      {/* Monthly Total */}
                      <div className="flex flex-col items-center gap-1">
                        <Target className="h-4 w-4 text-emerald-400" />
                        <span className="text-2xl font-bold text-emerald-200">
                          {smokingData.streakData?.totalCigarettesThisMonth ?? 0}
                        </span>
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
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
};
