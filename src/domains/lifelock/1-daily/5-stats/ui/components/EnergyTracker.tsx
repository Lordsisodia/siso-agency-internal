import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, ChevronDown, ChevronUp, CheckCircle2, Sun, Sunset, Moon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { format, isToday } from 'date-fns';
import { useClerkUser } from '@/lib/hooks/auth/useClerkUser';
import { useSupabaseUserId } from '@/lib/services/supabase/clerk-integration';
import { XPPill } from '@/domains/lifelock/1-daily/1-morning-routine/ui/components/xp/XPPill';
import { GamificationService } from '@/domains/lifelock/_shared/services/gamificationService';
import { cn } from '@/lib/utils';

interface EnergyTrackerProps {
  selectedDate: Date;
}

interface EnergyData {
  morning?: number;
  afternoon?: number;
  evening?: number;
}

interface EnergyLog {
  period: 'morning' | 'afternoon' | 'evening';
  level: number;
  timestamp: string;
}

const ENERGY_LEVELS = [
  { value: 1, label: '1', color: 'bg-red-500', emoji: '😴' },
  { value: 2, label: '2', color: 'bg-red-400', emoji: '😴' },
  { value: 3, label: '3', color: 'bg-orange-500', emoji: '😴' },
  { value: 4, label: '4', color: 'bg-orange-400', emoji: '😴' },
  { value: 5, label: '5', color: 'bg-yellow-500', emoji: '😐' },
  { value: 6, label: '6', color: 'bg-yellow-400', emoji: '😐' },
  { value: 7, label: '7', color: 'bg-lime-500', emoji: '😐' },
  { value: 8, label: '8', color: 'bg-green-500', emoji: '⚡' },
  { value: 9, label: '9', color: 'bg-green-400', emoji: '⚡' },
  { value: 10, label: '10', color: 'bg-emerald-400', emoji: '⚡' },
];

const getEnergyColor = (level: number): string => {
  if (level <= 4) return 'text-red-400';
  if (level <= 7) return 'text-yellow-400';
  return 'text-green-400';
};

const getEnergyLabel = (level: number): string => {
  if (level <= 4) return 'Low';
  if (level <= 7) return 'Medium';
  return 'High';
};

const getEnergyEmoji = (level: number): string => {
  if (level <= 4) return '😴';
  if (level <= 7) return '😐';
  return '⚡';
};

export const EnergyTracker: React.FC<EnergyTrackerProps> = ({ selectedDate }) => {
  const { user } = useClerkUser();
  const internalUserId = useSupabaseUserId(user?.id || null);
  const dateKey = format(selectedDate, 'yyyy-MM-dd');
  const isTodayDate = isToday(selectedDate);

  const [energyData, setEnergyData] = useState<EnergyData>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [streak, setStreak] = useState(0);
  const energyXPRef = useRef(0);

  // Storage key for energy data
  const energyStorageKey = useMemo(() => {
    const userSuffix = internalUserId ?? 'anonymous';
    return `lifelock-${userSuffix}-energy-${dateKey}`;
  }, [internalUserId, dateKey]);

  // XP storage key
  const energyXPStorageKey = useMemo(() => {
    const userSuffix = internalUserId ?? 'anonymous';
    return `lifelock-${userSuffix}-${dateKey}-energyXP`;
  }, [internalUserId, dateKey]);

  // Streak storage key
  const streakStorageKey = useMemo(() => {
    const userSuffix = internalUserId ?? 'anonymous';
    return `lifelock-${userSuffix}-energy-streak`;
  }, [internalUserId]);

  // Load energy data from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;

    setIsLoading(true);
    try {
      const stored = window.localStorage.getItem(energyStorageKey);
      if (stored) {
        setEnergyData(JSON.parse(stored));
      } else {
        setEnergyData({});
      }

      const storedStreak = window.localStorage.getItem(streakStorageKey);
      if (storedStreak) {
        setStreak(Number(storedStreak) || 0);
      }
    } catch (error) {
      console.error('[EnergyTracker] Failed to load data:', error);
      setEnergyData({});
    } finally {
      setIsLoading(false);
    }
  }, [energyStorageKey, streakStorageKey]);

  // Load previous XP from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = window.localStorage.getItem(energyXPStorageKey);
    energyXPRef.current = stored ? Number(stored) || 0 : 0;
  }, [energyXPStorageKey]);

  // Calculate current XP
  const energyXP = useMemo(() => {
    const logsCount = [
      energyData.morning,
      energyData.afternoon,
      energyData.evening,
    ].filter((v) => v !== undefined).length;
    return logsCount * 5; // 5 XP per log
  }, [energyData]);

  // Calculate if all 3 periods are logged
  const isComplete = useMemo(() => {
    return (
      energyData.morning !== undefined &&
      energyData.afternoon !== undefined &&
      energyData.evening !== undefined
    );
  }, [energyData]);

  // Calculate average energy
  const averageEnergy = useMemo(() => {
    const values = [
      energyData.morning,
      energyData.afternoon,
      energyData.evening,
    ].filter((v): v is number => v !== undefined);

    if (values.length === 0) return 0;
    return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
  }, [energyData]);

  // Award XP when earned (only for today)
  useEffect(() => {
    if (!isTodayDate) return;

    if (energyXP > energyXPRef.current) {
      const diff = energyXP - energyXPRef.current;
      const multiplier = diff / 5;
      GamificationService.awardXP('energy_tracking', multiplier);
      energyXPRef.current = energyXP;
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(energyXPStorageKey, energyXP.toString());
      }

      // Update streak if all 3 logged
      if (isComplete) {
        const newStreak = streak + 1;
        setStreak(newStreak);
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(streakStorageKey, newStreak.toString());
        }
      }
    } else if (energyXP < energyXPRef.current) {
      energyXPRef.current = energyXP;
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(energyXPStorageKey, energyXP.toString());
      }
    }
  }, [isTodayDate, energyXP, energyXPStorageKey, isComplete, streak, streakStorageKey]);

  // Update energy level
  const updateEnergy = useCallback(
    async (period: 'morning' | 'afternoon' | 'evening', level: number) => {
      if (isUpdating) return;

      try {
        setIsUpdating(true);

        const newData: EnergyData = {
          ...energyData,
          [period]: level,
        };

        setEnergyData(newData);

        if (typeof window !== 'undefined') {
          window.localStorage.setItem(energyStorageKey, JSON.stringify(newData));
        }
      } catch (error) {
        console.error('[EnergyTracker] Failed to update energy:', error);
      } finally {
        setIsUpdating(false);
      }
    },
    [isUpdating, energyData, energyStorageKey]
  );

  // Get motivational message
  const getMotivationalMessage = () => {
    if (isComplete) {
      return `Great job tracking all day! ${getEnergyEmoji(averageEnergy)} Average: ${averageEnergy}/10`;
    }
    const loggedCount = [
      energyData.morning,
      energyData.afternoon,
      energyData.evening,
    ].filter((v) => v !== undefined).length;
    if (loggedCount === 2) {
      return "Almost there! Log your last energy level.";
    }
    if (loggedCount === 1) {
      return "Good start! Keep tracking your energy.";
    }
    return "Track your energy 3x daily for better insights.";
  };

  // Period config
  const periods: Array<{
    key: 'morning' | 'afternoon' | 'evening';
    label: string;
    icon: React.ReactNode;
    timeRange: string;
  }> = [
    {
      key: 'morning',
      label: 'Morning',
      icon: <Sun className="h-4 w-4 text-amber-300" />,
      timeRange: '6AM - 12PM',
    },
    {
      key: 'afternoon',
      label: 'Afternoon',
      icon: <Sunset className="h-4 w-4 text-orange-300" />,
      timeRange: '12PM - 6PM',
    },
    {
      key: 'evening',
      label: 'Evening',
      icon: <Moon className="h-4 w-4 text-indigo-300" />,
      timeRange: '6PM - 12AM',
    },
  ];

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
              <Zap className="h-4 w-4 text-amber-300" />
            </div>
            <h4 className="text-amber-100 font-semibold text-base truncate">Energy</h4>
            {/* Green CheckCircle when complete */}
            {isComplete && (
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
              xp={energyXP}
              earned={energyXP > 0}
              showGlow={isComplete}
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
              className="bg-gradient-to-r from-amber-400 to-yellow-500 h-1.5 rounded-full transition-all duration-500"
              initial={{ width: 0 }}
              animate={{
                width: `${
                  isComplete
                    ? 100
                    : Math.max(
                        0,
                        (([
                          energyData.morning,
                          energyData.afternoon,
                          energyData.evening,
                        ].filter((v) => v !== undefined).length /
                          3) *
                          100)
                      )
                }%`,
              }}
            />
          </div>
          <div className="flex justify-between items-center mt-1">
            <span className="text-xs text-amber-400/70 font-medium">
              {isComplete
                ? `Average: ${averageEnergy}/10`
                : `${[
                    energyData.morning,
                    energyData.afternoon,
                    energyData.evening,
                  ].filter((v) => v !== undefined).length}/3 logged`}
            </span>
            {isComplete && !isExpanded && (
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
            <div className="px-4 pb-4 space-y-3">
              {isLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-32 w-full bg-amber-900/30" />
                  <Skeleton className="h-24 w-full bg-amber-900/20" />
                  <Skeleton className="h-20 w-full bg-amber-900/20" />
                </div>
              ) : (
                <>
                  {/* Energy Chart */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="rounded-xl border border-amber-700/30 bg-amber-900/30 p-4"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-semibold text-amber-200">
                        Today's Energy
                      </span>
                      {averageEnergy > 0 && (
                        <span
                          className={cn(
                            'text-xs font-medium',
                            getEnergyColor(averageEnergy)
                          )}
                        >
                          Avg: {averageEnergy}/10
                        </span>
                      )}
                    </div>

                    {/* Visual Bar Chart */}
                    <div className="flex items-end justify-between gap-2 h-28">
                      {periods.map((period) => {
                        const value = energyData[period.key];
                        const hasValue = value !== undefined;
                        const height = hasValue ? (value / 10) * 100 : 0;

                        return (
                          <div
                            key={period.key}
                            className="flex-1 flex flex-col items-center gap-2"
                          >
                            {/* Bar */}
                            <div className="w-full flex items-end justify-center h-20 bg-amber-950/30 rounded-lg overflow-hidden relative">
                              {hasValue ? (
                                <motion.div
                                  initial={{ height: 0 }}
                                  animate={{ height: `${height}%` }}
                                  transition={{ duration: 0.3 }}
                                  className={cn(
                                    'w-full rounded-t-sm',
                                    value! <= 4
                                      ? 'bg-gradient-to-t from-red-600 to-red-400'
                                      : value! <= 7
                                      ? 'bg-gradient-to-t from-yellow-600 to-yellow-400'
                                      : 'bg-gradient-to-t from-green-600 to-green-400'
                                  )}
                                />
                              ) : (
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <span className="text-amber-600/50 text-xs">
                                    -
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Label */}
                            <div className="flex flex-col items-center">
                              <div className="flex items-center gap-1">
                                {period.icon}
                                <span className="text-[10px] text-amber-300">
                                  {period.label}
                                </span>
                              </div>
                              {hasValue && (
                                <span
                                  className={cn(
                                    'text-xs font-bold',
                                    getEnergyColor(value!)
                                  )}
                                >
                                  {value}/10
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>

                  {/* Quick Input Sections */}
                  {periods.map((period, index) => {
                    const currentValue = energyData[period.key];
                    const isLogged = currentValue !== undefined;

                    return (
                      <motion.div
                        key={period.key}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 + index * 0.05 }}
                        className={cn(
                          'rounded-xl border p-4 transition-all duration-300',
                          isLogged
                            ? 'border-green-500/30 bg-green-950/20'
                            : 'border-amber-700/30 bg-amber-900/30'
                        )}
                      >
                        {/* Period Header */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-amber-500/20 border border-amber-400/30">
                              {period.icon}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-amber-200">
                                {period.label}
                              </p>
                              <p className="text-xs text-amber-400/60">
                                {period.timeRange}
                              </p>
                            </div>
                          </div>
                          {isLogged && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="flex items-center gap-1"
                            >
                              <span
                                className={cn(
                                  'text-lg font-bold',
                                  getEnergyColor(currentValue)
                                )}
                              >
                                {getEnergyEmoji(currentValue)} {currentValue}/10
                              </span>
                            </motion.div>
                          )}
                        </div>

                        {/* Quick Emoji Select */}
                        <div className="flex gap-2 mb-3">
                          {[
                            { emoji: '😴', label: 'Low', range: '1-4' },
                            { emoji: '😐', label: 'Medium', range: '5-7' },
                            { emoji: '⚡', label: 'High', range: '8-10' },
                          ].map((option) => (
                            <Button
                              key={option.label}
                              type="button"
                              variant="outline"
                              size="sm"
                              disabled={isUpdating}
                              onClick={(e) => {
                                e.stopPropagation();
                                // Set to middle of range
                                const value =
                                  option.label === 'Low'
                                    ? 3
                                    : option.label === 'Medium'
                                    ? 6
                                    : 9;
                                updateEnergy(period.key, value);
                              }}
                              className={cn(
                                'flex-1 h-10 text-sm font-medium transition-all duration-200',
                                option.label === 'Low' &&
                                  'border-red-500/40 text-red-300 hover:bg-red-500/20',
                                option.label === 'Medium' &&
                                  'border-yellow-500/40 text-yellow-300 hover:bg-yellow-500/20',
                                option.label === 'High' &&
                                  'border-green-500/40 text-green-300 hover:bg-green-500/20'
                              )}
                            >
                              <span className="mr-1">{option.emoji}</span>
                              <span className="text-xs">{option.label}</span>
                            </Button>
                          ))}
                        </div>

                        {/* 1-10 Scale Buttons */}
                        <div className="grid grid-cols-10 gap-1">
                          {ENERGY_LEVELS.map((level) => (
                            <button
                              key={level.value}
                              type="button"
                              disabled={isUpdating}
                              onClick={(e) => {
                                e.stopPropagation();
                                updateEnergy(period.key, level.value);
                              }}
                              className={cn(
                                'h-8 rounded text-xs font-bold transition-all duration-200',
                                currentValue === level.value
                                  ? 'bg-amber-500 text-amber-950 ring-2 ring-amber-300'
                                  : 'bg-amber-950/50 text-amber-400 hover:bg-amber-800/50',
                                level.value <= 4 && 'hover:bg-red-900/50',
                                level.value >= 5 &&
                                  level.value <= 7 &&
                                  'hover:bg-yellow-900/50',
                                level.value >= 8 && 'hover:bg-green-900/50'
                              )}
                            >
                              {level.value}
                            </button>
                          ))}
                        </div>

                        {/* Legend */}
                        <div className="flex justify-between mt-2 text-[10px] text-amber-400/60">
                          <span>1-4 Low</span>
                          <span>5-7 Medium</span>
                          <span>8-10 High</span>
                        </div>
                      </motion.div>
                    );
                  })}

                  {/* Analytics Section */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="rounded-xl border border-amber-700/30 bg-amber-900/30 p-4"
                  >
                    <p className="text-sm font-semibold text-amber-200 mb-3">
                      Analytics
                    </p>
                    <div className="grid grid-cols-3 gap-3">
                      {/* Logs Today */}
                      <div className="flex flex-col items-center gap-1">
                        <Zap className="h-4 w-4 text-amber-400" />
                        <span className="text-2xl font-bold text-amber-200">
                          {
                            [
                              energyData.morning,
                              energyData.afternoon,
                              energyData.evening,
                            ].filter((v) => v !== undefined).length
                          }
                          /3
                        </span>
                        <span className="text-xs text-amber-300">Logged</span>
                      </div>

                      {/* Average */}
                      <div className="flex flex-col items-center gap-1">
                        <span
                          className={cn(
                            'text-2xl font-bold',
                            averageEnergy > 0
                              ? getEnergyColor(averageEnergy)
                              : 'text-slate-500'
                          )}
                        >
                          {averageEnergy > 0 ? averageEnergy : '-'}
                        </span>
                        <span className="text-xs text-amber-300">Average</span>
                      </div>

                      {/* Streak */}
                      <div className="flex flex-col items-center gap-1">
                        <Zap className="h-4 w-4 text-yellow-400" />
                        <span className="text-2xl font-bold text-yellow-200">
                          {streak}
                        </span>
                        <span className="text-xs text-amber-300">Day Streak</span>
                      </div>
                    </div>

                    {/* Motivational Message */}
                    <div className="mt-3 pt-3 border-t border-amber-700/20 text-center">
                      <p className="text-sm text-amber-100">
                        {getMotivationalMessage()}
                      </p>
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
