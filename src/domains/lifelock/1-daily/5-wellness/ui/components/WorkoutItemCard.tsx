import React from 'react';
import { motion } from 'framer-motion';
import { Minus, Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Badge, type BadgeProps } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

import { getExerciseUnitLabel, type ExerciseConfig } from '../../domain/homeWorkout.types';

export interface WorkoutExerciseDisplay {
  id: string;
  title: string;
  completed: boolean;
  target: string | null;
  logged: string | null;
  config: ExerciseConfig;
  goalValue: number;
  loggedValue: number;
  progressPercent: number;
  percentRounded: number;
  isComplete: boolean;
  order: number;
}

export const formatSecondsToReadable = (seconds: number): string => {
  const totalSeconds = Math.max(0, Math.round(seconds));
  const minutes = Math.floor(totalSeconds / 60);
  const remainingSeconds = totalSeconds % 60;

  if (minutes === 0) {
    return `${remainingSeconds}s`;
  }

  if (remainingSeconds === 0) {
    return `${minutes}m`;
  }

  return `${minutes}m ${remainingSeconds}s`;
};

export const getProgressGradient = (percent: number): string => {
  if (percent >= 66) {
    return 'from-emerald-400 via-emerald-500 to-teal-400';
  }

  if (percent >= 33) {
    return 'from-amber-400 via-yellow-400 to-orange-400';
  }

  return 'from-rose-500 via-rose-500 to-orange-500';
};

export const getPercentColorClass = (percent: number): string => {
  if (percent >= 100) {
    return 'text-emerald-300';
  }

  if (percent >= 66) {
    return 'text-emerald-300';
  }

  if (percent >= 33) {
    return 'text-amber-300';
  }

  return 'text-rose-300';
};

const getBadgeVariant = (percent: number): BadgeProps['variant'] => {
  if (percent >= 100) {
    return 'success';
  }

  if (percent >= 66) {
    return 'success';
  }

  if (percent >= 33) {
    return 'warning';
  }

  return 'destructive';
};

interface WorkoutItemCardProps {
  item: WorkoutExerciseDisplay;
  isEditingGoal: boolean;
  goalDraftValue: string;
  loggedDraftValue: string;
  onGoalDraftChange: (value: string) => void;
  onGoalCommit: () => void;
  onGoalCancel: () => void;
  onLoggedDraftChange: (value: string) => void;
  onLoggedCommit: () => void;
  onLoggedCancel: () => void;
  onIncrement: () => void;
  onDecrement: () => void;
}

export const WorkoutItemCard: React.FC<WorkoutItemCardProps> = ({
  item,
  isEditingGoal,
  goalDraftValue,
  loggedDraftValue,
  onGoalDraftChange,
  onGoalCommit,
  onGoalCancel,
  onLoggedDraftChange,
  onLoggedCommit,
  onLoggedCancel,
  onIncrement,
  onDecrement,
}) => {
  const unitLabel = getExerciseUnitLabel(item.config.unit);
  const unitShort = item.config.unit === 'seconds' ? 'sec' : 'reps';
  const progressValue = Math.min(item.progressPercent, 100);
  const percentColor = getPercentColorClass(item.percentRounded);
  const badgeVariant = getBadgeVariant(item.percentRounded);
  const remaining = Math.max(item.goalValue - item.loggedValue, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'rounded-2xl border p-4 sm:p-6 transition-all duration-300',
        item.isComplete
          ? 'border-emerald-500/50 bg-emerald-950/20 shadow-[0_0_20px_rgba(16,185,129,0.2)]'
          : 'border-rose-500/40 bg-rose-950/30 hover:border-rose-400/60 hover:shadow-[0_0_20px_rgba(244,63,94,0.18)]'
      )}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
        <div
          className={cn(
            'flex h-14 w-14 items-center justify-center rounded-2xl text-2xl font-semibold shadow-inner',
            item.isComplete ? 'bg-emerald-500/20 text-emerald-200' : 'bg-rose-500/20 text-rose-100'
          )}
        >
          <span>{item.config.icon}</span>
        </div>
        <div className="flex-1 space-y-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-semibold text-white sm:text-xl">{item.title}</h3>
                {item.isComplete && (
                  <Badge variant="success" className="hidden sm:flex">
                    Goal met
                  </Badge>
                )}
              </div>
              <p className={cn('text-sm sm:text-base', percentColor)}>
                {`${item.loggedValue}/${item.goalValue} ${unitShort} • ${item.percentRounded}%`}
              </p>
              {item.config.unit === 'seconds' && (
                <p className="text-xs text-rose-100/60 sm:text-sm">
                  ≈ {formatSecondsToReadable(item.loggedValue)} logged / {formatSecondsToReadable(item.goalValue)} goal
                </p>
              )}
            </div>
            <Badge variant={badgeVariant} className="w-fit">
              {item.percentRounded}% complete
            </Badge>
          </div>

          <Progress
            value={progressValue}
            className="h-2 bg-white/10"
            indicatorColor={`bg-gradient-to-r ${getProgressGradient(item.percentRounded)}`}
          />

          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <Button
                type="button"
                size="icon"
                variant="outline"
                aria-label={`Decrease ${item.title} progress`}
                disabled={item.loggedValue <= 0}
                onClick={onDecrement}
                className={cn(
                  'h-11 w-11 rounded-xl border-rose-500/40 bg-rose-500/10 text-rose-100 hover:bg-rose-500/25',
                  item.loggedValue <= 0 && 'opacity-50 hover:bg-rose-500/10'
                )}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Input
                value={loggedDraftValue}
                onChange={(event) => onLoggedDraftChange(event.target.value)}
                onBlur={onLoggedCommit}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    onLoggedCommit();
                  }
                  if (event.key === 'Escape') {
                    onLoggedCancel();
                  }
                }}
                type="number"
                inputMode="numeric"
                min={0}
                className="h-11 w-24 rounded-xl border border-rose-500/40 bg-black/50 text-center text-base font-semibold text-white focus-visible:ring-rose-400/50"
              />
              <Button
                type="button"
                size="icon"
                variant="outline"
                aria-label={`Increase ${item.title} progress`}
                onClick={onIncrement}
                className="h-11 w-11 rounded-xl border-emerald-500/40 bg-emerald-500/10 text-emerald-200 hover:bg-emerald-500/25"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex flex-col gap-1 text-sm text-rose-100/80 sm:flex-row sm:items-center sm:gap-3">
              <span className="text-xs uppercase tracking-wide text-rose-200/60">
                Goal ({unitLabel})
              </span>
              {isEditingGoal ? (
                <Input
                  value={goalDraftValue}
                  onChange={(event) => onGoalDraftChange(event.target.value)}
                  onBlur={onGoalCommit}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      onGoalCommit();
                    }
                    if (event.key === 'Escape') {
                      onGoalCancel();
                    }
                  }}
                  type="number"
                  inputMode="numeric"
                  min={1}
                  className="h-11 w-28 rounded-xl border border-rose-500/40 bg-black/50 text-center text-base font-semibold text-white focus-visible:ring-rose-400/50"
                />
              ) : (
                <div className="text-base font-semibold text-white">
                  {item.goalValue} {unitShort}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs text-rose-100/60 sm:text-sm">
            <span>
              Remaining: {remaining} {unitShort}
            </span>
            <span className={item.isComplete ? 'text-emerald-300' : 'text-rose-200/70'}>
              {item.isComplete ? 'Great work—goal achieved!' : "Keep pushing, you're close!"}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
