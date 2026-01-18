import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dumbbell,
  Flame,
  Target,
  TrendingUp,
  Edit2,
  Check,
  ChevronDown,
  Trophy,
  Zap,
  Award,
  Activity,
  Arm,
  PersonStanding,
  Timer,
  Gauge
} from 'lucide-react';
import { format } from 'date-fns';
import { subDays } from 'date-fns';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

import { useClerkUser } from '@/lib/hooks/auth/useClerkUser';
import { useSupabaseUserId } from '@/lib/services/supabase/clerk-integration';
import { supabaseWorkoutService } from '@/domains/lifelock/_shared/services/supabaseWorkoutService';
import type { WorkoutSessionSummary } from '@/domains/lifelock/_shared/services/supabaseWorkoutService';
import type { Database } from '@/types/supabase';

import {
  HOME_WORKOUT_EXERCISES,
  HOME_WORKOUT_EXERCISE_ORDER,
  resolveExerciseConfig,
  type ExerciseConfig,
} from '../../domain/homeWorkout.types';
import { XPPill } from '@/domains/lifelock/1-daily/1-morning-routine/ui/components/XPPill';
import { calculateTotalWorkoutXP } from '@/domains/lifelock/1-daily/5-stats/features/wellness/domain/xpCalculations';
import { GamificationService } from '@/domains/lifelock/_shared/services/gamificationService';
import { WaterTrackerCard } from '../components/WaterTrackerCard';
import { WorkoutStatistics } from '../components/WorkoutStatistics';

type WorkoutItemRow = Database['public']['Tables']['workout_items']['Row'];

interface WorkoutItem {
  id: string;
  title: string;
  completed: boolean;
  target: string | null;
  logged: string | null;
}

const mapWorkoutRowToItem = (row: WorkoutItemRow): WorkoutItem => ({
  id: row.id,
  title: row.title,
  completed: row.completed,
  target: row.target,
  logged: row.logged,
});

const parseValueForUnit = (value: string | null | undefined, config: ExerciseConfig, fallback: number): number => {
  if (!value) return fallback;
  const trimmed = value.trim();
  if (!trimmed) return fallback;

  const numericMatch = trimmed.match(/-?\d+(\.\d+)?/);
  if (!numericMatch) return fallback;

  let numeric = Number(numericMatch[0]);
  if (!Number.isFinite(numeric)) return fallback;

  numeric = Math.abs(numeric);

  if (config.unit === 'seconds') {
    const lower = trimmed.toLowerCase();
    if ((lower.includes('minute') || lower.includes('min') || /\d+(\.\d+)?m\b/.test(lower)) && !lower.includes('sec')) {
      numeric *= 60;
    }
  }

  return Math.round(numeric);
};

const parseGoalValue = (value: string | null | undefined, config: ExerciseConfig): number =>
  Math.max(1, parseValueForUnit(value, config, config.defaultGoal));

const parseLoggedValue = (value: string | null | undefined, config: ExerciseConfig): number =>
  Math.max(0, parseValueForUnit(value, config, 0));

interface HomeWorkoutSectionProps {
  selectedDate: Date;
}

export const HomeWorkoutSection: React.FC<HomeWorkoutSectionProps> = ({ selectedDate }) => {
  const { user } = useClerkUser();
  const internalUserId = useSupabaseUserId(user?.id || null);
  const dateKey = format(selectedDate, 'yyyy-MM-dd');
  const readableDate = format(selectedDate, 'EEE, MMM d');

  const [workoutItems, setWorkoutItems] = useState<WorkoutItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [weeklySessions, setWeeklySessions] = useState<WorkoutSessionSummary[]>([]);
  const [streak, setStreak] = useState<{ current: number; best: number }>({ current: 0, best: 0 });
  const [isEditingGoals, setIsEditingGoals] = useState(false);
  const [expandedExercise, setExpandedExercise] = useState<string | null>(null);
  const [exerciseStatistics, setExerciseStatistics] = useState<Map<string, any>>(new Map());
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const workoutXPRef = useRef(0);

  const loadWorkoutItems = useCallback(async () => {
    setIsLoading(true);

    if (!internalUserId) {
      console.warn('🏋️ [WORKOUT] No internalUserId - using local state only');
      const timestamp = Date.now();
      setWorkoutItems(
        HOME_WORKOUT_EXERCISES.map((config, index) => ({
          id: `local-${timestamp}-${index}`,
          title: config.title,
          completed: false,
          target: config.defaultGoal.toString(),
          logged: '0',
        }))
      );
      setIsLoading(false);
      return;
    }

    try {
      console.log('🏋️ [WORKOUT] Loading items for user:', internalUserId, 'date:', dateKey);
      let items = await supabaseWorkoutService.getWorkoutItems(internalUserId, dateKey);
      console.log('🏋️ [WORKOUT] Loaded items:', items);

      if (items.length === 0) {
        console.log('🏋️ [WORKOUT] No items found, creating defaults...');
        items = await supabaseWorkoutService.createDefaultWorkoutItems(internalUserId, dateKey);
        console.log('🏋️ [WORKOUT] Created default items:', items);
      }

      setWorkoutItems(items.map(mapWorkoutRowToItem));
    } catch (error) {
      console.error('❌ [WORKOUT] Failed to load workout items:', error);
      const timestamp = Date.now();
      setWorkoutItems(
        HOME_WORKOUT_EXERCISES.map((config, index) => ({
          id: `temp-${timestamp}-${index}`,
          title: config.title,
          completed: false,
          target: config.defaultGoal.toString(),
          logged: '0',
        })),
      );
    } finally {
      setIsLoading(false);
    }
  }, [dateKey, internalUserId]);

  useEffect(() => {
    void loadWorkoutItems();
  }, [loadWorkoutItems]);

  useEffect(() => {
    const loadWeekly = async () => {
      if (!internalUserId) {
        setWeeklySessions([]);
        setStreak({ current: 0, best: 0 });
        return;
      }

      const endKey = format(selectedDate, 'yyyy-MM-dd');
      const startKey = format(subDays(selectedDate, 6), 'yyyy-MM-dd');

      const sessions = await supabaseWorkoutService.getWorkoutSessionsRange(internalUserId, startKey, endKey);
      setWeeklySessions(sessions);

      const streakResult = await supabaseWorkoutService.computeWorkoutStreak(internalUserId, 30, 90);
      setStreak(streakResult);
    };

    void loadWeekly();
  }, [internalUserId, selectedDate]);

  const updateItem = useCallback(async (id: string, updates: Partial<WorkoutItem>) => {
    console.log('🏋️ [WORKOUT] Updating item:', id, 'updates:', updates);

    if (!internalUserId) {
      console.warn('🏋️ [WORKOUT] No internalUserId - updating local state only');
      setWorkoutItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...updates } : item)));
      return;
    }

    // Optimistic update
    setWorkoutItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...updates } : item)));

    // Don't save temp/local items to Supabase
    if (id.startsWith('temp-') || id.startsWith('local-')) {
      console.log('🏋️ [WORKOUT] Skipping Supabase save for local item:', id);
      return;
    }

    try {
      console.log('🏋️ [WORKOUT] Saving to Supabase...');
      const updated = await supabaseWorkoutService.updateWorkoutItem(id, {
        ...updates,
        user_id: internalUserId,
        workout_date: dateKey,
      });
      console.log('🏋️ [WORKOUT] Successfully saved:', updated);
      setWorkoutItems((prev) =>
        prev.map((item) => (item.id === id ? mapWorkoutRowToItem(updated) : item)),
      );
    } catch (error) {
      console.error('❌ [WORKOUT] Failed to update workout item:', error);
    }
  }, [dateKey, internalUserId]);

  // Fetch exercise statistics when an exercise is expanded
  const fetchExerciseStatistics = useCallback(async (exerciseTitle: string) => {
    if (!internalUserId) return;

    setIsLoadingStats(true);
    try {
      const [previousDay, personalBest, last7Days] = await Promise.all([
        supabaseWorkoutService.getPreviousDayPerformance(internalUserId, exerciseTitle, dateKey),
        supabaseWorkoutService.getPersonalBest(internalUserId, exerciseTitle),
        supabaseWorkoutService.getLast7DaysStats(internalUserId, exerciseTitle, dateKey)
      ]);

      setExerciseStatistics(prev => {
        const newMap = new Map(prev);
        newMap.set(exerciseTitle, {
          previousDay: previousDay ? { ...previousDay, unit: 'reps' } : null,
          personalBest: personalBest ? { ...personalBest, unit: 'reps' } : null,
          last7Days: last7Days ? { ...last7Days, unit: 'reps' } : null
        });
        return newMap;
      });
    } catch (error) {
      console.error('Failed to fetch exercise statistics:', error);
    } finally {
      setIsLoadingStats(false);
    }
  }, [internalUserId, dateKey]);

  const normalizedItems = useMemo(() =>
    workoutItems
      .map((item) => {
        const config = resolveExerciseConfig(item.title);
        const goalValue = parseGoalValue(item.target, config);
        const loggedValue = parseLoggedValue(item.logged, config);
        const percentRaw = goalValue > 0 ? (loggedValue / goalValue) * 100 : 0;

        return {
          ...item,
          config,
          goalValue,
          loggedValue,
          progressPercent: Math.min(percentRaw, 100),
          isComplete: goalValue > 0 && loggedValue >= goalValue,
          order: HOME_WORKOUT_EXERCISE_ORDER.get(config.key) ?? Number.MAX_SAFE_INTEGER,
        };
      })
      .sort((a, b) => a.order - b.order),
    [workoutItems],
  );

  const totals = useMemo(() =>
    normalizedItems.reduce(
      (acc, item) => ({
        goal: acc.goal + item.goalValue,
        logged: acc.logged + item.loggedValue,
        completed: acc.completed + (item.isComplete ? 1 : 0),
      }),
      { goal: 0, logged: 0, completed: 0 },
    ),
    [normalizedItems],
  );

  const overallPercent = totals.goal > 0 ? Math.round((totals.logged / totals.goal) * 100) : 0;

  const totalWorkoutXP = useMemo(() => {
    const exercises = normalizedItems.map(item => ({
      completed: item.isComplete,
      logged: item.loggedValue,
      target: item.goalValue,
      isPB: false,
    }));
    return calculateTotalWorkoutXP(exercises).total;
  }, [normalizedItems]);

  const workoutXPStorageKey = useMemo(() => {
    const userSuffix = internalUserId ?? 'anonymous';
    return `lifelock-${userSuffix}-${dateKey}-workoutXP`;
  }, [internalUserId, dateKey]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = window.localStorage.getItem(workoutXPStorageKey);
    workoutXPRef.current = stored ? Number(stored) || 0 : 0;
  }, [workoutXPStorageKey]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const todayKey = format(new Date(), 'yyyy-MM-dd');
    if (dateKey !== todayKey) return;

    if (totalWorkoutXP > workoutXPRef.current) {
      const diff = totalWorkoutXP - workoutXPRef.current;
      GamificationService.awardXP('workout', diff / 40);
      workoutXPRef.current = totalWorkoutXP;
      window.localStorage.setItem(workoutXPStorageKey, totalWorkoutXP.toString());
    }
  }, [dateKey, totalWorkoutXP, workoutXPStorageKey]);

  if (isLoading) {
    return (
      <div className="w-full px-2 sm:px-4 md:px-6 lg:px-8 space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32 w-full bg-rose-900/20" />
        ))}
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      {/* Consolidated Stats Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        <Card className="bg-gradient-to-br from-rose-950/30 to-slate-950/30 border-rose-500/20">
          <CardContent className="p-3">
            <div className="flex items-center justify-around">
              <StatBarItem emoji="🔥" label="Streak" value={`${streak.current}d`} color="text-rose-400" />
              <div className="w-px h-8 bg-rose-500/20" />
              <StatBarItem emoji="🎯" label="Progress" value={`${overallPercent}%`} color="text-amber-400" />
              <div className="w-px h-8 bg-rose-500/20" />
              <StatBarItem emoji="✅" label="Done" value={`${totals.completed}/${normalizedItems.length}`} color="text-emerald-400" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Overall Progress Bar (Subtle) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12 }}
        className="flex items-center gap-3"
      >
        <span className="text-xs text-white/50 whitespace-nowrap">Daily Progress</span>
        <Progress
          value={overallPercent}
          className="h-1.5 flex-1 bg-rose-950/30"
          indicatorColor="bg-gradient-to-r from-rose-500 to-orange-500"
        />
        <span className="text-xs text-white/50 whitespace-nowrap">{overallPercent}%</span>
      </motion.div>

      {/* Separator Line */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-rose-500/30 to-transparent" />

      {/* Exercise List */}
      <div className="space-y-4">
        {normalizedItems.map((item, index) => (
          <ExerciseCard
            key={item.id}
            item={item}
            isEditingGoal={isEditingGoals}
            isExpanded={expandedExercise === item.id}
            onToggleExpand={() => setExpandedExercise(expandedExercise === item.id ? null : item.id)}
            onUpdate={(updates) => updateItem(item.id, updates)}
            index={index}
            fetchExerciseStatistics={fetchExerciseStatistics}
            exerciseStatistics={exerciseStatistics}
            isLoadingStats={isLoadingStats}
          />
        ))}
      </div>

      {/* Edit Goals Floating Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex justify-center"
      >
        <Button
          type="button"
          variant={isEditingGoals ? "default" : "outline"}
          onClick={() => setIsEditingGoals(!isEditingGoals)}
          className={cn(
            "rounded-full px-6",
            isEditingGoals
              ? "bg-rose-500 hover:bg-rose-600 text-white"
              : "border-rose-500/30 text-rose-300 hover:bg-rose-500/10"
          )}
        >
          <Edit2 className="h-4 w-4 mr-2" />
          {isEditingGoals ? 'Done Editing' : 'Edit Goals'}
        </Button>
      </motion.div>
    </div>
  );
};

// Stat Card Component (kept for backward compatibility)
interface StatCardProps {
  emoji?: string;
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: 'rose' | 'amber' | 'emerald' | 'purple';
}

const StatCard: React.FC<StatCardProps> = ({ emoji, icon, label, value, color }) => {
  const colorClasses = {
    rose: 'bg-rose-500/10 border-rose-500/30 text-rose-400',
    amber: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
    emerald: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
    purple: 'bg-purple-500/10 border-purple-500/30 text-purple-400',
  };

  return (
    <Card className={cn('border', colorClasses[color])}>
      <CardContent className="p-3">
        <div className="flex items-center gap-2 mb-1">
          {emoji && <span className="text-lg">{emoji}</span>}
          {icon}
          <span className="text-xs text-white/60">{label}</span>
        </div>
        <p className={cn('text-lg font-semibold', colorClasses[color])}>{value}</p>
      </CardContent>
    </Card>
  );
};

// Stat Bar Item Component (for consolidated stats bar)
interface StatBarItemProps {
  emoji: string;
  label: string;
  value: string;
  color: string;
}

const StatBarItem: React.FC<StatBarItemProps> = ({ emoji, label, value, color }) => (
  <div className="flex flex-col items-center gap-0.5">
    <span className="text-lg">{emoji}</span>
    <span className={cn('text-sm font-semibold', color)}>{value}</span>
    <span className="text-xs text-white/40">{label}</span>
  </div>
);

// Exercise Card Component
interface ExerciseCardProps {
  item: any;
  isEditingGoal: boolean;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onUpdate: (updates: any) => void;
  index: number;
  fetchExerciseStatistics: (title: string) => void;
  exerciseStatistics: Map<string, any>;
  isLoadingStats: boolean;
}

const ExerciseCard: React.FC<ExerciseCardProps> = ({
  item,
  isEditingGoal,
  isExpanded,
  onToggleExpand,
  onUpdate,
  index,
  fetchExerciseStatistics,
  exerciseStatistics,
  isLoadingStats,
}) => {
  const [goalInput, setGoalInput] = useState(item.goalValue.toString());
  const [loggedInput, setLoggedInput] = useState(item.loggedValue.toString());
  const [currentLogged, setCurrentLogged] = useState(item.loggedValue);

  // Update local state when item prop changes
  useEffect(() => {
    setCurrentLogged(item.loggedValue);
    setLoggedInput(item.loggedValue.toString());
  }, [item.loggedValue]);

  // Fetch statistics when exercise is expanded
  useEffect(() => {
    if (isExpanded && !exerciseStatistics.has(item.config.title)) {
      fetchExerciseStatistics(item.config.title);
    }
  }, [isExpanded, item.config.title, exerciseStatistics, fetchExerciseStatistics]);

  const isTimeBased = item.config.unit === 'seconds';
  const unitLabel = isTimeBased ? 'sec' : 'reps';
  const isComplete = item.isComplete;
  const progressPercent = Math.min(item.goalValue > 0 ? (item.loggedValue / item.goalValue) * 100 : 0, 100);

  // Calculate XP for this exercise (20 XP base per completed exercise)
  const exerciseXP = isComplete ? 20 : 0;

  // Get the icon component from the config
  const IconComponent = item.config.icon;

  // Get exercise type for badge
  const getExerciseType = () => {
    if (isTimeBased) return { label: 'Cardio', color: 'text-blue-400 bg-blue-500/20 border-blue-500/30' };
    return { label: 'Strength', color: 'text-rose-400 bg-rose-500/20 border-rose-500/30' };
  };
  const exerciseType = getExerciseType();

  // Get contextual quick actions based on exercise type
  const getQuickActions = (): { label: string; amount: number }[] => {
    if (isComplete) return [];

    if (isTimeBased) {
      // Time-based exercises: add 15s, 30s, or complete remaining
      const remaining = item.goalValue - item.loggedValue;
      if (remaining <= 30) {
        return [{ label: `Complete (${remaining}s)`, amount: remaining }];
      }
      return [
        { label: '+15 sec', amount: 15 },
        { label: '+30 sec', amount: 30 },
      ];
    } else {
      // Rep-based exercises: add 5, 10 reps or complete remaining
      const remaining = item.goalValue - item.loggedValue;
      if (remaining <= 10) {
        return [{ label: `Complete (${remaining})`, amount: remaining }];
      }
      return [
        { label: '+5 reps', amount: 5 },
        { label: '+10 reps', amount: 10 },
      ];
    }
  };

  const quickActions = getQuickActions();

  const handleQuickLog = (amount: number) => {
    const newValue = currentLogged + amount;
    if (newValue >= 0) {
      setCurrentLogged(newValue);
      setLoggedInput(newValue.toString());
      onUpdate({ logged: newValue.toString() });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card
        className={cn(
          'border transition-all duration-200',
          isComplete
            ? 'bg-emerald-950/20 border-emerald-500/30'
            : 'bg-slate-950/40 border-rose-500/20 hover:border-rose-500/40'
        )}
      >
        <CardContent className="p-4">
          {/* Header */}
          <div className="flex items-center gap-3 mb-3">
            <div
              className={cn(
                'flex h-14 w-14 items-center justify-center rounded-xl text-2xl relative shrink-0',
                isComplete ? 'bg-emerald-500/20 ring-2 ring-emerald-500/40' : 'bg-rose-500/10'
              )}
            >
              <span className="relative z-10">{item.config.emoji}</span>
              <div className="absolute inset-0 flex items-center justify-center opacity-20">
                <IconComponent className="h-8 w-8 text-white" />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className={cn('font-semibold text-base', isComplete ? 'text-emerald-300' : 'text-white')}>
                  {item.config.title}
                </h3>
                <span className={cn('text-xs px-2 py-0.5 rounded-full border font-medium', exerciseType.color)}>
                  {exerciseType.label}
                </span>
                {isComplete && (
                  <span className="text-xs text-emerald-400 font-medium ml-auto">+{exerciseXP} XP</span>
                )}
              </div>
              <p className={cn('text-sm', isComplete ? 'text-emerald-200/70' : 'text-white/60')}>
                {item.loggedValue} / {item.goalValue} {unitLabel}
              </p>
            </div>

            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="shrink-0"
            >
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={onToggleExpand}
                className="h-8 w-8 text-white/40 hover:text-white/60 hover:bg-white/5"
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
            </motion.div>
          </div>

          {/* Progress Bar - Always visible */}
          <div className="mb-3">
            <Progress
              value={progressPercent}
              className={cn(
                "h-2",
                isComplete
                  ? "bg-emerald-950/30"
                  : "bg-rose-950/30"
              )}
              indicatorColor={cn(
                "h-2 rounded-full transition-all duration-500",
                isComplete
                  ? "bg-gradient-to-r from-emerald-400 to-emerald-600"
                  : "bg-gradient-to-r from-rose-400 to-orange-500"
              )}
            />
          </div>

          {/* Quick Actions - Always visible when not editing goals */}
          {!isEditingGoal && quickActions.length > 0 && (
            <div className="mt-3 flex gap-2">
              {quickActions.map((action) => (
                <Button
                  key={action.label}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleQuickLog(action.amount);
                  }}
                  className={cn(
                    "flex-1 text-xs h-9 transition-all duration-200 font-medium",
                    isComplete
                      ? "border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10"
                      : "border-rose-500/30 text-rose-300 hover:bg-rose-500/10"
                  )}
                >
                  {action.label}
                </Button>
              ))}
            </div>
          )}

          {/* Progress Bar - Only show in expanded state */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="pt-4 space-y-4">
                  {/* Progress Bar */}
                  <div>
                    <Progress
                      value={progressPercent}
                      className={cn(
                        'h-2',
                        isComplete ? 'bg-emerald-950/50' : 'bg-rose-950/50'
                      )}
                      indicatorColor={isComplete ? 'bg-emerald-500' : 'bg-gradient-to-r from-rose-500 to-orange-500'}
                    />
                  </div>

                  {/* Workout Statistics - replaces redundant quick actions */}
                  <WorkoutStatistics
                    exerciseTitle={item.config.title}
                    exerciseKey={item.config.key}
                    currentValue={item.loggedValue}
                    unit={unitLabel}
                    history={exerciseStatistics.get(item.config.title)}
                    isLoading={isLoadingStats}
                  />

                  {/* Goal Input (Edit Mode) */}
                  {isEditingGoal && (
                    <div>
                      <label className="text-xs text-white/60 mb-2 block">Daily Goal ({unitLabel})</label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          value={goalInput}
                          onChange={(e) => setGoalInput(e.target.value)}
                          onBlur={() => onUpdate({ target: goalInput })}
                          className="flex-1 bg-rose-950/50 border border-rose-500/30 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-rose-500/60"
                        />
                        <Button
                          type="button"
                          onClick={() => onUpdate({ target: goalInput })}
                          className="bg-rose-500 hover:bg-rose-600"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Manual Log Input */}
                  <div>
                    <label className="text-xs text-white/60 mb-2 block">Log Amount ({unitLabel})</label>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          const newVal = Math.max(0, currentLogged - 1);
                          setCurrentLogged(newVal);
                          setLoggedInput(newVal.toString());
                          onUpdate({ logged: newVal.toString() });
                        }}
                        className="border-rose-500/30 text-rose-300 hover:bg-rose-500/20"
                      >
                        −
                      </Button>
                      <input
                        type="number"
                        value={loggedInput}
                        onChange={(e) => {
                          setLoggedInput(e.target.value);
                          const val = parseInt(e.target.value) || 0;
                          setCurrentLogged(val);
                        }}
                        onBlur={() => onUpdate({ logged: loggedInput })}
                        className="flex-1 bg-rose-950/50 border border-rose-500/30 rounded-lg px-3 py-2 text-sm text-white text-center focus:outline-none focus:border-rose-500/60"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          const newVal = currentLogged + 1;
                          setCurrentLogged(newVal);
                          setLoggedInput(newVal.toString());
                          onUpdate({ logged: newVal.toString() });
                        }}
                        className="border-rose-500/30 text-rose-300 hover:bg-rose-500/20"
                      >
                        +
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
};
