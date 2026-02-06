import React, { useEffect, useMemo, useRef, useState } from 'react';
import useSWR from 'swr';
import { format, formatDistanceToNow, isToday } from 'date-fns';
import { Flame, Minus, Plus, Award, Droplets, ChevronDown, ChevronUp, CheckCircle2, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { waterService } from '@/services/database/waterService';
import { XPPill } from '@/domains/lifelock/1-daily/1-morning-routine/ui/components/xp/XPPill';
import type { WaterTrackerSnapshot } from '../../domain/types';

interface WaterTrackerCardProps {
  selectedDate: Date;
  userId?: string;
}


const fetchSnapshot = (userId: string, dateKey: string) =>
  waterService.getTrackerSnapshot(userId, dateKey);

export const WaterTrackerCard: React.FC<WaterTrackerCardProps> = ({ selectedDate, userId }) => {
  const dateKey = useMemo(() => format(selectedDate, 'yyyy-MM-dd'), [selectedDate]);
  const isSelectedDateToday = isToday(selectedDate);

  const localStorageKey = useMemo(() => `lifelock-water-${dateKey}`, [dateKey]);

  const defaultSnapshot: WaterTrackerSnapshot = {
    goalMl: 2000,
    dailyTotalMl: 0,
    percentage: 0,
    lastLogAt: null,
    streakCount: 0,
    entries: [],
    historyTotals: {},
  };

  const { data, error, isLoading, mutate, isValidating } = useSWR<WaterTrackerSnapshot>(
    userId ? ['water-tracker', userId, dateKey] : null,
    () => fetchSnapshot(userId!, dateKey),
    {
      revalidateOnFocus: true,
      keepPreviousData: true,
    }
  );

  const [actionError, setActionError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const lastRefreshKey = useRef(dateKey);
  const [localSnapshot, setLocalSnapshot] = useState<WaterTrackerSnapshot | null>(null);

  useEffect(() => {
    if (userId) return;
    try {
      const stored = localStorage.getItem(localStorageKey);
      if (stored) {
        setLocalSnapshot(JSON.parse(stored));
      }
    } catch (storageError) {
      console.warn('[WaterTrackerCard] Unable to read local snapshot', storageError);
    }
  }, [localStorageKey, userId]);

  useEffect(() => {
    lastRefreshKey.current = dateKey;
  }, [dateKey]);

  useEffect(() => {
    if (!isSelectedDateToday) {
      return;
    }

    const interval = setInterval(() => {
      const next = new Date();
      const nextKey = format(next, 'yyyy-MM-dd');

      if (nextKey !== lastRefreshKey.current) {
        lastRefreshKey.current = nextKey;
        mutate();
      }
    }, 60_000);

    return () => clearInterval(interval);
  }, [isSelectedDateToday, mutate]);

  const handleAmountChange = async (amount: number) => {
    if (isSubmitting) return;

    const current = (userId ? data : localSnapshot) ?? defaultSnapshot;
    const currentTotal = current.dailyTotalMl ?? 0;
    const targetTotal = Math.max(0, currentTotal + amount);
    const delta = targetTotal - currentTotal;

    if (delta === 0) {
      return;
    }

    // Check if goal will be reached
    const willReachGoal = currentTotal < (current.goalMl ?? 2000) && targetTotal >= (current.goalMl ?? 2000);

    // Local-only mode fallback
    if (!userId) {
      const timestamp = new Date().toISOString();
      const newPercentage = Math.min(100, Math.round((targetTotal / (current.goalMl ?? 2000)) * 100));
      const nextSnapshot: WaterTrackerSnapshot = {
        goalMl: current.goalMl ?? 2000,
        dailyTotalMl: targetTotal,
        percentage: newPercentage,
        lastLogAt: timestamp,
        streakCount: current.streakCount ?? 0,
        entries: [
          ...(current.entries ?? []),
          {
            id: `local-${timestamp}`,
            date: dateKey,
            amountMl: delta,
            timestamp,
          }
        ],
        historyTotals: current.historyTotals ?? {}
      };

      setLocalSnapshot(nextSnapshot);
      localStorage.setItem(localStorageKey, JSON.stringify(nextSnapshot));
      return;
    }

    try {
      setActionError(null);
      setIsSubmitting(true);
      const timestamp = new Date().toISOString();
      const newPercentage = Math.min(100, Math.round((targetTotal / (current.goalMl ?? 2000)) * 100));
      const optimisticSnapshot: WaterTrackerSnapshot = {
        ...current,
        dailyTotalMl: targetTotal,
        percentage: newPercentage,
        lastLogAt: timestamp,
        entries: [
          ...(current.entries ?? []),
          {
            id: `optimistic-${timestamp}`,
            date: dateKey,
            amountMl: delta,
            timestamp,
          }
        ],
      };

      await mutate(
        async () => {
          await waterService.logWaterIntake(userId!, delta, dateKey);
          return await fetchSnapshot(userId!, dateKey);
        },
        {
          optimisticData: optimisticSnapshot,
          rollbackOnError: true,
          populateCache: true,
          revalidate: true,
        }
      );
    } catch (mutationError) {
      console.error('[WaterTrackerCard] Failed to log water intake', mutationError);
      setActionError('Unable to update water intake. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const displaySnapshot = (userId ? data : localSnapshot) ?? defaultSnapshot;

  const progressPercentage = displaySnapshot.percentage;
  const isGoalReached = progressPercentage >= 100;

  const lastDrinkLabel = displaySnapshot.lastLogAt
    ? formatDistanceToNow(new Date(displaySnapshot.lastLogAt), { addSuffix: true })
        .replace('about ', '')
    : null;

  const [isExpanded, setIsExpanded] = useState(false);

  // XP value for hydration tracking
  const hydrationXP = 25;

  return (
    <Card className="bg-emerald-900/20 border-emerald-700/40 overflow-hidden backdrop-blur-sm">
      {/* Clickable Header */}
      <div
        className="p-4 sm:p-6 cursor-pointer hover:bg-emerald-900/10 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="p-1.5 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex-shrink-0">
              <Droplets className="h-4 w-4 text-emerald-300" />
            </div>
            <h4 className="text-emerald-100 font-semibold text-base truncate">Hydration</h4>
            {/* Green CheckCircle when goal reached */}
            {isGoalReached && (
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
              xp={hydrationXP}
              earned={isGoalReached}
              showGlow={isGoalReached}
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
              animate={{ width: `${Math.min(progressPercentage, 100)}%` }}
            />
          </div>
          <div className="flex justify-between items-center mt-1">
            <span className="text-xs text-emerald-400/70 font-medium">{displaySnapshot.dailyTotalMl}ml / {displaySnapshot.goalMl}ml</span>
            {isGoalReached && !isExpanded && (
              <span className="text-xs text-green-400 font-semibold flex items-center gap-1"><Check className="h-3 w-3" /> Complete</span>
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
            <div className="px-4 sm:px-6 pb-4 sm:pb-6">
              {/* Header with streak */}
              <div className="flex items-start justify-between mb-6">
                <div className="space-y-1">
                  {lastDrinkLabel && (
                    <p className="text-sm text-emerald-200/70">Last drink {lastDrinkLabel}</p>
                  )}
                </div>
                {displaySnapshot.streakCount > 0 && (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/30"
                  >
                    <Flame className="h-4 w-4 text-orange-400" />
                    <span className="text-sm font-semibold text-orange-300">{displaySnapshot.streakCount}</span>
                  </motion.div>
                )}
              </div>

              {/* Main progress display */}
              {isLoading ? (
                <Skeleton className="h-32 w-full bg-emerald-800/30 rounded-2xl" />
              ) : (
                <div className="relative mb-6">
                  {/* Circular progress */}
                  <div className="flex items-center justify-center">
                    <div className="relative">
                      <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 200 200">
                        <circle
                          cx="100"
                          cy="100"
                          r="90"
                          fill="none"
                          stroke="rgba(148, 163, 184, 0.1)"
                          strokeWidth="12"
                        />
                        <motion.circle
                          cx="100"
                          cy="100"
                          r="90"
                          fill="none"
                          stroke={isGoalReached ? "#10b981" : "#10b981"}
                          strokeWidth="12"
                          strokeLinecap="round"
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: progressPercentage / 100 }}
                          transition={{ duration: 0.6, ease: "easeOut" }}
                          style={{
                            strokeDasharray: "565.48",
                            strokeDashoffset: 565.48 * (1 - progressPercentage / 100)
                          }}
                        />
                      </svg>

                      {/* Center content */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-5xl font-bold text-white tracking-tight">{displaySnapshot.dailyTotalMl}</span>
                        <span className="text-lg text-slate-400 mt-1">of {displaySnapshot.goalMl}ml</span>
                        <span className="text-2xl font-semibold text-emerald-400 mt-2">{progressPercentage}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Award overlay on completion */}
                  <AnimatePresence>
                    {isGoalReached && (
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        exit={{ scale: 0, rotate: 180 }}
                        className="absolute inset-0 flex items-center justify-center pointer-events-none"
                      >
                        <div className="flex items-center justify-center w-20 h-20 rounded-full bg-green-500/20 backdrop-blur-sm border-2 border-green-500/50">
                          <Award className="h-10 w-10 text-green-400" />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Quick add buttons */}
              <div className="space-y-3 mb-4">
                <p className="text-xs font-semibold text-emerald-300/70 uppercase tracking-wider">Quick Add</p>
                <div className="grid grid-cols-2 gap-3">
                  {[250, 100].map((amount) => (
                    <Button
                      key={amount}
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => handleAmountChange(amount)}
                      className="h-14 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-lg transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
                    >
                      <Plus className="h-5 w-5" />
                      <span className="ml-2">{amount}ml</span>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Adjust buttons */}
              <div className="space-y-3">
                <p className="text-xs font-semibold text-emerald-300/70 uppercase tracking-wider">Adjust</p>
                <div className="grid grid-cols-2 gap-3">
                  {[-100, -250].map((amount) => (
                    <Button
                      key={amount}
                      type="button"
                      variant="outline"
                      disabled={isSubmitting}
                      onClick={() => handleAmountChange(amount)}
                      className="h-12 rounded-xl border-emerald-600/50 text-emerald-200 hover:bg-emerald-800/50 hover:text-white font-medium transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
                    >
                      <Minus className="h-4 w-4" />
                      <span className="ml-2">{amount}ml</span>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Error Messages */}
              {actionError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-lg border border-orange-400/40 bg-orange-500/10 px-4 py-3 text-sm text-orange-200 mt-4"
                >
                  {actionError}
                </motion.div>
              )}

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200 mt-4"
                >
                  Unable to load water tracker. Pull to refresh or try again later.
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
};
