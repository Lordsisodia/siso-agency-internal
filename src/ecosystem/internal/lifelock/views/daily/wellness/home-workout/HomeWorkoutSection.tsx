import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Dumbbell, Settings } from 'lucide-react';
import { format } from 'date-fns';

import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Progress } from '@/shared/ui/progress';
import { Badge } from '@/shared/ui/badge';
import { Skeleton } from '@/shared/ui/skeleton';

import { useClerkUser } from '@/shared/hooks/useClerkUser';
import { useSupabaseUserId } from '@/shared/lib/supabase-clerk';
import { supabaseWorkoutService } from '@/services/supabaseWorkoutService';
import type { Database } from '@/types/supabase';

import {
  HOME_WORKOUT_EXERCISES,
  HOME_WORKOUT_EXERCISE_ORDER,
  resolveExerciseConfig,
  type ExerciseConfig,
} from './homeWorkout.types';
import {
  WorkoutItemCard,
  type WorkoutExerciseDisplay,
  formatSecondsToReadable,
  getPercentColorClass,
  getProgressGradient,
} from './components/WorkoutItemCard';
import { XPPill } from '@/ecosystem/internal/lifelock/views/daily/morning-routine/components/XPPill';
import { calculateTotalWorkoutXP } from '@/ecosystem/internal/lifelock/views/daily/wellness/xpCalculations';

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

const parseTimeFromColon = (value: string): number | null => {
  const segments = value.split(':');
  if (segments.length !== 2) {
    return null;
  }

  const minutes = Number(segments[0]);
  const seconds = Number(segments[1]);

  if (!Number.isFinite(minutes) || !Number.isFinite(seconds)) {
    return null;
  }

  return Math.max(0, Math.round(minutes * 60 + seconds));
};

const hasMinuteKeyword = (value: string): boolean => {
  const lower = value.toLowerCase();

  if (lower.includes('minute') || lower.includes('minutes') || lower.includes('min')) {
    return true;
  }

  if (/\d+(\.\d+)?m\b/.test(lower)) {
    return true;
  }

  return lower.endsWith('m');
};

const parseValueForUnit = (value: string | null | undefined, config: ExerciseConfig, fallback: number): number => {
  if (!value) {
    return fallback;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return fallback;
  }

  if (config.unit === 'seconds') {
    const colonValue = parseTimeFromColon(trimmed);
    if (colonValue !== null) {
      return colonValue;
    }
  }

  const numericMatch = trimmed.match(/-?\d+(\.\d+)?/);
  if (!numericMatch) {
    return fallback;
  }

  let numeric = Number(numericMatch[0]);
  if (!Number.isFinite(numeric)) {
    return fallback;
  }

  numeric = Math.abs(numeric);

  if (config.unit === 'seconds') {
    const lower = trimmed.toLowerCase();
    if (hasMinuteKeyword(lower) && !lower.includes('sec')) {
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
  const [isEditingGoals, setIsEditingGoals] = useState(false);
  const [goalDrafts, setGoalDrafts] = useState<Record<string, string>>({});
  const [loggedDrafts, setLoggedDrafts] = useState<Record<string, string>>({});

  const loadWorkoutItems = useCallback(async () => {
    setIsLoading(true);

    if (!internalUserId) {
      setWorkoutItems([]);
      setGoalDrafts({});
      setLoggedDrafts({});
      setIsLoading(false);
      return;
    }

    try {
      let items = await supabaseWorkoutService.getWorkoutItems(internalUserId, dateKey);

      if (items.length === 0) {
        items = await supabaseWorkoutService.createDefaultWorkoutItems(internalUserId, dateKey);
      } else {
        const missingConfigs = HOME_WORKOUT_EXERCISES.filter(
          (config) => !items.some((item) => resolveExerciseConfig(item.title).key === config.key),
        );

        if (missingConfigs.length > 0) {
          const itemsToPersist = [
            ...items.map((item) => {
              const config = resolveExerciseConfig(item.title);
              const goalValue = parseGoalValue(item.target, config);
              const loggedValue = parseLoggedValue(item.logged, config);

              return {
                title: config.title,
                completed: loggedValue >= goalValue && goalValue > 0,
                target: goalValue.toString(),
                logged: loggedValue.toString(),
              };
            }),
            ...missingConfigs.map((config) => ({
              title: config.title,
              completed: false,
              target: config.defaultGoal.toString(),
              logged: '0',
            })),
          ];

          items = await supabaseWorkoutService.upsertWorkoutItems(internalUserId, dateKey, itemsToPersist);
        }
      }

      setWorkoutItems(items.map(mapWorkoutRowToItem));
      setGoalDrafts({});
      setLoggedDrafts({});
    } catch (error) {
      console.error('Failed to load workout items:', error);
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
      setGoalDrafts({});
      setLoggedDrafts({});
    } finally {
      setIsLoading(false);
    }
  }, [dateKey, internalUserId]);

  useEffect(() => {
    void loadWorkoutItems();
  }, [loadWorkoutItems]);

  const updateItem = useCallback(async (id: string, updates: Partial<WorkoutItem>) => {
    if (!internalUserId) return;

    setWorkoutItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...updates } : item)));

    if (id.startsWith('temp-')) {
      return;
    }

    try {
      const updated = await supabaseWorkoutService.updateWorkoutItem(id, {
        ...updates,
        user_id: internalUserId,
        workout_date: dateKey,
      });
      setWorkoutItems((prev) =>
        prev.map((item) => (item.id === id ? mapWorkoutRowToItem(updated) : item)),
      );
    } catch (error) {
      console.error('Failed to update workout item:', error);
    }
  }, [dateKey, internalUserId]);

  const normalizedItems = useMemo<WorkoutExerciseDisplay[]>(
    () =>
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
            percentRounded: Math.round(percentRaw),
            isComplete: goalValue > 0 && loggedValue >= goalValue,
            order: HOME_WORKOUT_EXERCISE_ORDER.get(config.key) ?? Number.MAX_SAFE_INTEGER,
          };
        })
        .sort((a, b) => a.order - b.order),
    [workoutItems],
  );

  const normalizedLookup = useMemo(
    () => new Map(normalizedItems.map((item) => [item.id, item])),
    [normalizedItems],
  );

  const totals = useMemo(
    () =>
      normalizedItems.reduce(
        (acc, item) => {
          acc.goal += item.goalValue;
          acc.logged += item.loggedValue;

          if (item.config.unit === 'seconds') {
            acc.secondsGoal += item.goalValue;
            acc.secondsLogged += item.loggedValue;
          } else {
            acc.repsGoal += item.goalValue;
            acc.repsLogged += item.loggedValue;
          }

          return acc;
        },
        {
          goal: 0,
          logged: 0,
          repsGoal: 0,
          repsLogged: 0,
          secondsGoal: 0,
          secondsLogged: 0,
        },
      ),
    [normalizedItems],
  );

  const overallPercentRaw = totals.goal > 0 ? (totals.logged / totals.goal) * 100 : 0;
  const overallPercent = Math.round(overallPercentRaw);
  const overallProgressValue = Math.min(overallPercentRaw, 100);
  const remainingTotal = Math.max(totals.goal - totals.logged, 0);
  const overallPercentColor = getPercentColorClass(overallPercent);
  const overallProgressGradient = getProgressGradient(overallPercent);

  const applyGoalValue = useCallback(
    async (item: WorkoutExerciseDisplay, nextGoal: number) => {
      const sanitizedGoal = Math.max(1, Math.round(nextGoal));
      const completed = item.loggedValue >= sanitizedGoal;

      await updateItem(item.id, {
        target: sanitizedGoal.toString(),
        completed,
      });

      setGoalDrafts((prev) => {
        const next = { ...prev };
        delete next[item.id];
        return next;
      });
    },
    [updateItem],
  );

  const applyLoggedValue = useCallback(
    async (item: WorkoutExerciseDisplay, nextLogged: number) => {
      const sanitizedLogged = Math.max(0, Math.round(nextLogged));
      const completed = item.goalValue > 0 && sanitizedLogged >= item.goalValue;

      await updateItem(item.id, {
        logged: sanitizedLogged.toString(),
        completed,
      });

      setLoggedDrafts((prev) => {
        const next = { ...prev };
        delete next[item.id];
        return next;
      });
    },
    [updateItem],
  );

  const handleGoalDraftChange = useCallback((itemId: string, value: string) => {
    setGoalDrafts((prev) => ({ ...prev, [itemId]: value }));
  }, []);

  const handleLoggedDraftChange = useCallback((itemId: string, value: string) => {
    setLoggedDrafts((prev) => ({ ...prev, [itemId]: value }));
  }, []);

  const commitGoalValue = useCallback(
    async (itemId: string) => {
      const item = normalizedLookup.get(itemId);
      if (!item) {
        return;
      }

      const draftValue = goalDrafts[itemId];
      if (draftValue === undefined) {
        return;
      }

      const trimmed = draftValue.trim();
      if (!trimmed) {
        setGoalDrafts((prev) => {
          const next = { ...prev };
          delete next[itemId];
          return next;
        });
        return;
      }

      const parsed = Number(trimmed);
      if (!Number.isFinite(parsed)) {
        setGoalDrafts((prev) => {
          const next = { ...prev };
          delete next[itemId];
          return next;
        });
        return;
      }

      await applyGoalValue(item, parsed);
    },
    [applyGoalValue, goalDrafts, normalizedLookup],
  );

  const commitLoggedValue = useCallback(
    async (itemId: string) => {
      const item = normalizedLookup.get(itemId);
      if (!item) {
        return;
      }

      const draftValue = loggedDrafts[itemId];
      if (draftValue === undefined) {
        return;
      }

      const trimmed = draftValue.trim();
      if (!trimmed) {
        setLoggedDrafts((prev) => {
          const next = { ...prev };
          delete next[itemId];
          return next;
        });
        return;
      }

      const parsed = Number(trimmed);
      if (!Number.isFinite(parsed)) {
        setLoggedDrafts((prev) => {
          const next = { ...prev };
          delete next[itemId];
          return next;
        });
        return;
      }

      await applyLoggedValue(item, parsed);
    },
    [applyLoggedValue, loggedDrafts, normalizedLookup],
  );

  const cancelGoalEdit = useCallback((itemId: string) => {
    setGoalDrafts((prev) => {
      const next = { ...prev };
      delete next[itemId];
      return next;
    });
  }, []);

  const cancelLoggedEdit = useCallback((itemId: string) => {
    setLoggedDrafts((prev) => {
      const next = { ...prev };
      delete next[itemId];
      return next;
    });
  }, []);

  const handleIncrement = useCallback(
    (itemId: string) => {
      const item = normalizedLookup.get(itemId);
      if (!item) {
        return;
      }

      void applyLoggedValue(item, item.loggedValue + 1);
    },
    [applyLoggedValue, normalizedLookup],
  );

  const handleDecrement = useCallback(
    (itemId: string) => {
      const item = normalizedLookup.get(itemId);
      if (!item) {
        return;
      }

      const nextValue = Math.max(item.loggedValue - 1, 0);
      void applyLoggedValue(item, nextValue);
    },
    [applyLoggedValue, normalizedLookup],
  );

  const toggleGoalEditing = useCallback(() => {
    if (isEditingGoals) {
      setGoalDrafts({});
    }

    setIsEditingGoals((prev) => !prev);
  }, [isEditingGoals]);

  if (isLoading) {
    return (
      <div className="w-full">
        <div className="mx-auto max-w-7xl space-y-6 p-2 sm:p-3 md:p-4 lg:p-6">
          <Card className="mb-24 border border-rose-900/40 bg-rose-950/40">
            <CardHeader className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-14 w-14 rounded-2xl bg-rose-500/30" />
                  <div className="space-y-3">
                    <Skeleton className="h-5 w-48 bg-rose-400/30" />
                    <Skeleton className="h-4 w-36 bg-rose-400/20" />
                  </div>
                </div>
                <Skeleton className="h-9 w-32 rounded-lg bg-rose-400/20" />
              </div>
              <div className="space-y-3">
                <Skeleton className="h-3 w-full rounded-full bg-rose-400/20" />
                <Skeleton className="h-3 w-2/3 rounded-full bg-rose-400/10" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pb-24">
              {HOME_WORKOUT_EXERCISES.map((config) => (
                <div
                  key={config.key}
                  className="space-y-4 rounded-2xl border border-rose-900/50 bg-rose-950/30 p-4"
                >
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-12 w-12 rounded-xl bg-rose-500/20" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-40 bg-rose-400/20" />
                      <Skeleton className="h-3 w-32 bg-rose-400/10" />
                    </div>
                  </div>
                  <Skeleton className="h-2 w-full rounded-full bg-rose-400/10" />
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Skeleton className="h-10 rounded-xl bg-rose-400/10" />
                    <Skeleton className="h-10 rounded-xl bg-rose-400/10" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mx-auto max-w-7xl space-y-6 p-2 sm:p-3 md:p-4 lg:p-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Card className="relative overflow-hidden border border-rose-500/30 bg-gradient-to-br from-rose-950/80 via-slate-950/70 to-rose-900/40 shadow-[0_0_25px_rgba(244,63,94,0.25)]">
            <CardHeader className="space-y-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/25 text-2xl">
                    <span>🏋️</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <CardTitle className="flex items-center gap-2 text-2xl font-semibold text-rose-100">
                        <Dumbbell className="h-5 w-5 text-rose-300" />
                        Home Workout Objective
                      </CardTitle>
                      <XPPill
                        xp={(() => {
                          const exercises = normalizedItems.map(item => ({
                            completed: item.completed,
                            logged: item.loggedValue,
                            target: item.goalValue,
                            isPB: false // TODO: Track PBs per exercise
                          }));
                          const result = calculateTotalWorkoutXP(exercises);
                          return result.total;
                        })()}
                        earned={normalizedItems.every(item => item.completed)}
                        showGlow={normalizedItems.every(item => item.completed)}
                      />
                    </div>
                    <p className="text-sm text-rose-200/70">Daily targets for {readableDate}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {isEditingGoals && (
                    <Badge variant="warning" className="uppercase tracking-wide">
                      Goal editing active
                    </Badge>
                  )}
                  <Button
                    variant={isEditingGoals ? 'secondary' : 'outline'}
                    onClick={toggleGoalEditing}
                    className={
                      isEditingGoals
                        ? 'border-rose-400/40 bg-rose-500/20 text-rose-100 hover:bg-rose-500/30'
                        : 'border-rose-500/40 text-rose-100 hover:bg-rose-500/20'
                    }
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    {isEditingGoals ? 'Done Editing' : 'Edit Goals'}
                  </Button>
                </div>
              </div>

              <div className="space-y-3 rounded-2xl border border-rose-500/30 bg-black/30 p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="text-sm text-rose-200/80">Total progress</div>
                  <div className={`text-base font-semibold ${overallPercentColor}`}>
                    {overallPercent}% complete
                  </div>
                </div>
                <Progress
                  value={overallProgressValue}
                  className="h-3 bg-white/10"
                  indicatorColor={`bg-gradient-to-r ${overallProgressGradient}`}
                />
                <div className="flex flex-wrap items-center gap-4 text-xs text-rose-100/70 sm:text-sm">
                  <span>Logged {Math.round(totals.logged)}/{Math.round(totals.goal)} total units</span>
                  <span>Reps: {Math.round(totals.repsLogged)}/{Math.round(totals.repsGoal)}</span>
                  <span>
                    Planks: {formatSecondsToReadable(totals.secondsLogged)} / {formatSecondsToReadable(totals.secondsGoal)}
                  </span>
                  <span className="text-rose-200/60">Remaining: {Math.round(remainingTotal)} units</span>
                </div>
                <p className="text-xs text-rose-200/50">
                  Goals update on blur or Enter. Seconds are tracked as total seconds held.
                </p>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pb-24">
              {normalizedItems.map((item) => (
                <WorkoutItemCard
                  key={item.id}
                  item={item}
                  isEditingGoal={isEditingGoals}
                  goalDraftValue={goalDrafts[item.id] ?? item.goalValue.toString()}
                  loggedDraftValue={loggedDrafts[item.id] ?? item.loggedValue.toString()}
                  onGoalDraftChange={(value) => handleGoalDraftChange(item.id, value)}
                  onGoalCommit={() => void commitGoalValue(item.id)}
                  onGoalCancel={() => cancelGoalEdit(item.id)}
                  onLoggedDraftChange={(value) => handleLoggedDraftChange(item.id, value)}
                  onLoggedCommit={() => void commitLoggedValue(item.id)}
                  onLoggedCancel={() => cancelLoggedEdit(item.id)}
                  onIncrement={() => handleIncrement(item.id)}
                  onDecrement={() => handleDecrement(item.id)}
                />
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};
