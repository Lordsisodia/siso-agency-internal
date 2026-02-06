import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Coffee, Plus, Minus, Clock, AlertTriangle, ChevronDown, ChevronUp, CheckCircle2, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { format, isToday, subDays, parseISO, isAfter, setHours, setMinutes } from 'date-fns';
import { useClerkUser } from '@/lib/hooks/auth/useClerkUser';
import { useSupabaseUserId } from '@/lib/services/supabase/clerk-integration';
import { XPPill } from '@/domains/lifelock/1-daily/1-morning-routine/ui/components/xp/XPPill';
import { GamificationService } from '@/domains/lifelock/_shared/services/gamificationService';
import { cn } from '@/lib/utils';

interface CaffeineTrackerProps {
  selectedDate: Date;
}

interface CaffeineEntry {
  id: string;
  type: string;
  amountMg: number;
  timestamp: string;
}

interface CaffeineSnapshot {
  date: string;
  totalMg: number;
  entries: CaffeineEntry[];
  lastCaffeineAt: string | null;
  streakDays: number;
}

const CAFFEINE_TYPES = [
  { type: 'Coffee', amountMg: 95, icon: Coffee },
  { type: 'Espresso', amountMg: 64, icon: Coffee },
  { type: 'Tea', amountMg: 47, icon: Coffee },
  { type: 'Energy Drink', amountMg: 160, icon: Coffee },
  { type: 'Soda', amountMg: 40, icon: Coffee },
];

const CAFFEINE_MAX_DAILY = 400; // FDA recommended max
const CAFFEINE_LOW_THRESHOLD = 200; // Good limit for sleep
const CAFFEINE_CUTOFF_HOUR = 14; // 2 PM cutoff for sleep hygiene

// Calculate XP based on caffeine intake
const calculateCaffeineXP = (totalMg: number, entryCount: number, streakDays: number): { total: number; baseXP: number; bonusXP: number } => {
  // Base XP: +2 XP per log entry
  const baseXP = entryCount * 2;

  // Bonus XP for staying under 200mg
  let bonusXP = 0;
  if (totalMg > 0 && totalMg <= CAFFEINE_LOW_THRESHOLD) {
    bonusXP = 10; // Stayed under healthy limit
  }

  // Streak bonus
  if (streakDays >= 7) {
    bonusXP += 5;
  } else if (streakDays >= 3) {
    bonusXP += 3;
  }

  return {
    total: baseXP + bonusXP,
    baseXP,
    bonusXP
  };
};

// Get color based on caffeine amount
const getCaffeineColor = (totalMg: number): { bg: string; text: string; border: string; status: 'good' | 'moderate' | 'high' } => {
  if (totalMg <= CAFFEINE_LOW_THRESHOLD) {
    return {
      bg: 'bg-green-500/20',
      text: 'text-green-400',
      border: 'border-green-500/30',
      status: 'good'
    };
  } else if (totalMg <= CAFFEINE_MAX_DAILY) {
    return {
      bg: 'bg-amber-500/20',
      text: 'text-amber-400',
      border: 'border-amber-500/30',
      status: 'moderate'
    };
  } else {
    return {
      bg: 'bg-red-500/20',
      text: 'text-red-400',
      border: 'border-red-500/30',
      status: 'high'
    };
  }
};

// Check if last caffeine was after 2 PM
const isAfterCutoff = (timestamp: string | null): boolean => {
  if (!timestamp) return false;
  const date = parseISO(timestamp);
  const cutoffTime = setMinutes(setHours(date, CAFFEINE_CUTOFF_HOUR), 0);
  return isAfter(date, cutoffTime);
};

// Format time from timestamp
const formatTime = (timestamp: string): string => {
  return format(parseISO(timestamp), 'h:mm a');
};

export const CaffeineTracker: React.FC<CaffeineTrackerProps> = ({ selectedDate }) => {
  const { user } = useClerkUser();
  const internalUserId = useSupabaseUserId(user?.id || null);
  const dateKey = format(selectedDate, 'yyyy-MM-dd');
  const isTodayDate = isToday(selectedDate);

  // Local state for data (until backend is implemented)
  const [caffeineData, setCaffeineData] = useState<CaffeineSnapshot>({
    date: dateKey,
    totalMg: 0,
    entries: [],
    lastCaffeineAt: null,
    streakDays: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const caffeineXPRef = useRef(0);

  // Storage key for persistence
  const storageKey = useMemo(() => {
    const userSuffix = internalUserId ?? 'anonymous';
    return `lifelock-${userSuffix}-${dateKey}-caffeine`;
  }, [internalUserId, dateKey]);

  // Load data from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;

    setIsLoading(true);
    try {
      const stored = window.localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        setCaffeineData(parsed);
      } else {
        // Reset for new date
        setCaffeineData({
          date: dateKey,
          totalMg: 0,
          entries: [],
          lastCaffeineAt: null,
          streakDays: 0,
        });
      }
    } catch (error) {
      console.error('[CaffeineTracker] Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [storageKey, dateKey]);

  // Load previous XP from localStorage
  const xpStorageKey = useMemo(() => {
    const userSuffix = internalUserId ?? 'anonymous';
    return `lifelock-${userSuffix}-${dateKey}-caffeineXP`;
  }, [internalUserId, dateKey]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = window.localStorage.getItem(xpStorageKey);
    caffeineXPRef.current = stored ? Number(stored) || 0 : 0;
  }, [xpStorageKey]);

  // Calculate current XP
  const caffeineXP = useMemo(() => {
    return calculateCaffeineXP(
      caffeineData.totalMg,
      caffeineData.entries.length,
      caffeineData.streakDays
    );
  }, [caffeineData.totalMg, caffeineData.entries.length, caffeineData.streakDays]);

  // Award XP when earned (only for today)
  useEffect(() => {
    if (!isTodayDate) return;

    if (caffeineXP.total > caffeineXPRef.current) {
      const diff = caffeineXP.total - caffeineXPRef.current;
      const multiplier = diff / 10;
      GamificationService.awardXP('caffeine_tracking', multiplier);
      caffeineXPRef.current = caffeineXP.total;
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(xpStorageKey, caffeineXP.total.toString());
      }
    } else if (caffeineXP.total < caffeineXPRef.current) {
      caffeineXPRef.current = caffeineXP.total;
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(xpStorageKey, caffeineXP.total.toString());
      }
    }
  }, [isTodayDate, caffeineXP.total, xpStorageKey]);

  // Add caffeine entry
  const addEntry = useCallback(async (type: string, amountMg: number) => {
    if (isUpdating) return;

    try {
      setIsUpdating(true);
      const timestamp = new Date().toISOString();
      const newEntry: CaffeineEntry = {
        id: `local-${timestamp}`,
        type,
        amountMg,
        timestamp,
      };

      const updatedData: CaffeineSnapshot = {
        ...caffeineData,
        totalMg: caffeineData.totalMg + amountMg,
        entries: [...caffeineData.entries, newEntry],
        lastCaffeineAt: timestamp,
      };

      setCaffeineData(updatedData);

      if (typeof window !== 'undefined') {
        window.localStorage.setItem(storageKey, JSON.stringify(updatedData));
      }
    } catch (error) {
      console.error('[CaffeineTracker] Failed to add entry:', error);
    } finally {
      setIsUpdating(false);
    }
  }, [isUpdating, caffeineData, storageKey]);

  // Remove caffeine entry
  const removeEntry = useCallback(async (entryId: string) => {
    if (isUpdating) return;

    try {
      setIsUpdating(true);
      const entryToRemove = caffeineData.entries.find(e => e.id === entryId);
      if (!entryToRemove) return;

      const updatedEntries = caffeineData.entries.filter(e => e.id !== entryId);
      const newTotalMg = updatedEntries.reduce((sum, e) => sum + e.amountMg, 0);
      const newLastCaffeineAt = updatedEntries.length > 0
        ? updatedEntries[updatedEntries.length - 1].timestamp
        : null;

      const updatedData: CaffeineSnapshot = {
        ...caffeineData,
        totalMg: newTotalMg,
        entries: updatedEntries,
        lastCaffeineAt: newLastCaffeineAt,
      };

      setCaffeineData(updatedData);

      if (typeof window !== 'undefined') {
        window.localStorage.setItem(storageKey, JSON.stringify(updatedData));
      }
    } catch (error) {
      console.error('[CaffeineTracker] Failed to remove entry:', error);
    } finally {
      setIsUpdating(false);
    }
  }, [isUpdating, caffeineData, storageKey]);

  // Get color coding
  const colorStyles = getCaffeineColor(caffeineData.totalMg);
  const isUnderLowThreshold = caffeineData.totalMg <= CAFFEINE_LOW_THRESHOLD;
  const isOverMax = caffeineData.totalMg > CAFFEINE_MAX_DAILY;
  const afterCutoff = isAfterCutoff(caffeineData.lastCaffeineAt);

  // Progress percentage (capped at 100% for visual)
  const progressPercentage = Math.min((caffeineData.totalMg / CAFFEINE_MAX_DAILY) * 100, 100);

  // Get status message
  const getStatusMessage = () => {
    if (caffeineData.totalMg === 0) {
      return "No caffeine logged yet today";
    }
    if (isOverMax) {
      return "You've exceeded the recommended daily limit";
    }
    if (isUnderLowThreshold) {
      return "Great job staying under 200mg!";
    }
    return "Moderate caffeine intake";
  };

  return (
    <Card className="bg-amber-900/20 border-amber-700/40 overflow-hidden">
      {/* Clickable Header */}
      <div
        className="p-4 cursor-pointer hover:bg-amber-900/10 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="p-1.5 rounded-lg bg-amber-500/20 border border-amber-400/30 flex-shrink-0">
              <Coffee className="h-4 w-4 text-amber-300" />
            </div>
            <h4 className="text-amber-100 font-semibold text-base truncate">Caffeine</h4>
            {/* Green CheckCircle when under 200mg and has entries */}
            {caffeineData.totalMg > 0 && isUnderLowThreshold && (
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
              xp={caffeineXP.total}
              earned={caffeineData.entries.length > 0}
              showGlow={isUnderLowThreshold && caffeineData.entries.length > 0}
            />
            {isExpanded ? (
              <ChevronUp className="h-5 w-5 text-amber-400 flex-shrink-0" />
            ) : (
              <ChevronDown className="h-5 w-5 text-amber-400 flex-shrink-0" />
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-2 mb-1">
          <div className="w-full bg-amber-900/30 border border-amber-600/20 rounded-full h-1.5">
            <motion.div
              className={cn(
                "h-1.5 rounded-full transition-all duration-500",
                colorStyles.status === 'good' && "bg-gradient-to-r from-green-400 to-emerald-500",
                colorStyles.status === 'moderate' && "bg-gradient-to-r from-amber-400 to-orange-500",
                colorStyles.status === 'high' && "bg-gradient-to-r from-orange-500 to-red-500"
              )}
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
            />
          </div>
          <div className="flex justify-between items-center mt-1">
            <span className="text-xs text-amber-400/70 font-medium">
              {caffeineData.totalMg}mg / {CAFFEINE_MAX_DAILY}mg
            </span>
            {isUnderLowThreshold && caffeineData.entries.length > 0 && !isExpanded && (
              <span className="text-xs text-green-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" /> Healthy
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
                  <Skeleton className="h-32 w-full bg-amber-900/30" />
                  <Skeleton className="h-24 w-full bg-amber-900/20" />
                </div>
              ) : (
                <>
                  {/* Total Caffeine Counter */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className={cn(
                      "rounded-xl border p-4 transition-all duration-300",
                      colorStyles.border,
                      colorStyles.bg
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={cn("text-sm mb-1", colorStyles.text)}>
                          Total Caffeine Today
                        </p>
                        <motion.p
                          key={caffeineData.totalMg}
                          initial={{ scale: 1.1, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className={cn(
                            "text-5xl font-bold",
                            colorStyles.text
                          )}
                        >
                          {caffeineData.totalMg}
                          <span className="text-lg font-medium text-amber-400/70 ml-1">mg</span>
                        </motion.p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        {caffeineData.streakDays > 0 && (
                          <div className="flex items-center gap-1 text-orange-400">
                            <span className="text-lg font-bold">{caffeineData.streakDays}</span>
                            <span className="text-xs">day streak</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Status Message */}
                    <p className="text-sm text-amber-200/80 mt-2">{getStatusMessage()}</p>
                  </motion.div>

                  {/* Cutoff Time Warning */}
                  {afterCutoff && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-lg border border-orange-400/40 bg-orange-500/10 px-3 py-2 flex items-center gap-2"
                    >
                      <AlertTriangle className="h-4 w-4 text-orange-400 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-xs text-orange-300 font-medium">Late Caffeine Warning</p>
                        <p className="text-xs text-orange-200/70">
                          Last intake after 2 PM may affect sleep quality
                        </p>
                      </div>
                      <span className="text-xs text-orange-300 font-mono">
                        {caffeineData.lastCaffeineAt && formatTime(caffeineData.lastCaffeineAt)}
                      </span>
                    </motion.div>
                  )}

                  {/* Quick Add Buttons */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="rounded-xl border border-amber-700/30 bg-amber-900/30 p-4"
                  >
                    <p className="text-sm font-semibold text-amber-200 mb-3">Quick Add</p>
                    <div className="grid grid-cols-2 gap-2">
                      {CAFFEINE_TYPES.map((item) => (
                        <Button
                          key={item.type}
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={isUpdating}
                          onClick={(e) => {
                            e.stopPropagation();
                            addEntry(item.type, item.amountMg);
                          }}
                          className="h-12 rounded-xl border-amber-500/40 text-amber-200 hover:bg-amber-500/20 hover:text-amber-100 transition-all duration-200 flex flex-col items-center justify-center gap-0.5"
                        >
                          <span className="text-xs font-medium">{item.type}</span>
                          <span className="text-[10px] text-amber-400/70">{item.amountMg}mg</span>
                        </Button>
                      ))}
                    </div>
                  </motion.div>

                  {/* Today's Entries List */}
                  {caffeineData.entries.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="rounded-xl border border-amber-700/30 bg-amber-900/30 p-4"
                    >
                      <p className="text-sm font-semibold text-amber-200 mb-3">Today's Drinks</p>
                      <div className="space-y-2">
                        {caffeineData.entries.slice().reverse().map((entry, index) => (
                          <motion.div
                            key={entry.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="flex items-center justify-between py-2 px-3 rounded-lg bg-amber-950/30 border border-amber-700/20"
                          >
                            <div className="flex items-center gap-3">
                              <Coffee className="h-4 w-4 text-amber-400" />
                              <div>
                                <p className="text-sm text-amber-200">{entry.type}</p>
                                <p className="text-xs text-amber-400/60">{formatTime(entry.timestamp)}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-semibold text-amber-300">{entry.amountMg}mg</span>
                              {isTodayDate && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeEntry(entry.id);
                                  }}
                                  className="p-1.5 rounded-md hover:bg-red-500/20 text-amber-500/50 hover:text-red-400 transition-colors"
                                  disabled={isUpdating}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              )}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Analytics Section */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    className="rounded-xl border border-amber-700/30 bg-amber-900/30 p-4"
                  >
                    <p className="text-sm font-semibold text-amber-200 mb-3">Analytics</p>
                    <div className="grid grid-cols-3 gap-3">
                      {/* Entry Count */}
                      <div className="flex flex-col items-center gap-1">
                        <Coffee className="h-4 w-4 text-amber-400" />
                        <span className="text-2xl font-bold text-amber-200">
                          {caffeineData.entries.length}
                        </span>
                        <span className="text-xs text-amber-300/70">Drinks</span>
                      </div>

                      {/* Average per drink */}
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-2xl font-bold text-amber-200">
                          {caffeineData.entries.length > 0
                            ? Math.round(caffeineData.totalMg / caffeineData.entries.length)
                            : 0}
                        </span>
                        <span className="text-xs text-amber-300/70">Avg mg</span>
                      </div>

                      {/* Last Caffeine Time */}
                      <div className="flex flex-col items-center gap-1">
                        <Clock className="h-4 w-4 text-amber-400" />
                        <span className="text-lg font-bold text-amber-200">
                          {caffeineData.lastCaffeineAt
                            ? format(parseISO(caffeineData.lastCaffeineAt), 'h:mm a')
                            : '--'}
                        </span>
                        <span className="text-xs text-amber-300/70">Last</span>
                      </div>
                    </div>

                    {/* XP Breakdown */}
                    <div className="mt-3 pt-3 border-t border-amber-700/20">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-amber-300/70">XP Breakdown</span>
                        <span className="text-xs text-amber-300">+{caffeineXP.baseXP} base +{caffeineXP.bonusXP} bonus</span>
                      </div>
                    </div>
                  </motion.div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
};
