/**
 * Workout Statistics Component
 *
 * Displays historical workout data including:
 * - Previous day's performance for each exercise
 * - All-time personal bests
 * - Recent performance trends
 */

import React, { useMemo } from 'react';
import { Trophy, TrendingUp, Calendar } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface ExerciseHistory {
  title: string;
  previousDay: {
    date: string;
    value: number;
    unit: string;
  } | null;
  personalBest: {
    value: number;
    unit: string;
    date: string;
  } | null;
  last7Days: {
    total: number;
    average: number;
    days: number;
  };
}

interface WorkoutStatisticsProps {
  exerciseTitle: string;
  exerciseKey: string;
  currentValue: number;
  unit: string;
  history?: ExerciseHistory;
  isLoading?: boolean;
}

export const WorkoutStatistics: React.FC<WorkoutStatisticsProps> = ({
  exerciseTitle,
  exerciseKey,
  currentValue,
  unit,
  history,
  isLoading = false
}) => {
  if (isLoading) {
    return (
      <div className="space-y-3 animate-pulse">
        <div className="h-20 bg-rose-950/20 rounded-lg" />
        <div className="h-20 bg-rose-950/20 rounded-lg" />
      </div>
    );
  }

  const formatValue = (val: number) => {
    if (val >= 1000) {
      return `${(val / 1000).toFixed(1)}k`;
    }
    return val.toString();
  };

  const getTrendIcon = (current: number, previous: number | null) => {
    if (previous === null) return null;
    if (current > previous) return <TrendingUp className="h-4 w-4 text-emerald-400" />;
    if (current < previous) return <TrendingUp className="h-4 w-4 text-rose-400 rotate-180" />;
    return null;
  };

  const getTrendColor = (current: number, previous: number | null) => {
    if (previous === null) return 'text-white/60';
    if (current > previous) return 'text-emerald-400';
    if (current < previous) return 'text-rose-400';
    return 'text-white/60';
  };

  return (
    <div className="space-y-3">
      {/* Previous Day's Performance */}
      {history?.previousDay && (
        <Card className="bg-gradient-to-br from-slate-950/40 to-rose-950/20 border-rose-500/20">
          <div className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="h-4 w-4 text-rose-400" />
              <h4 className="text-sm font-semibold text-white">Yesterday</h4>
              <span className="text-xs text-white/40 ml-auto">{history.previousDay.date}</span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-white">
                  {formatValue(history.previousDay.value)}
                  <span className="text-sm text-white/60 ml-1">{history.previousDay.unit}</span>
                </p>
              </div>
              {getTrendIcon(currentValue, history.previousDay.value)}
            </div>
          </div>
        </Card>
      )}

      {/* Personal Best */}
      {history?.personalBest && (
        <Card className="bg-gradient-to-br from-amber-950/30 to-yellow-950/20 border-amber-500/30">
          <div className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Trophy className="h-4 w-4 text-amber-400" />
              <h4 className="text-sm font-semibold text-white">Personal Best</h4>
              <span className="text-xs text-white/40 ml-auto">{history.personalBest.date}</span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-amber-300">
                  {formatValue(history.personalBest.value)}
                  <span className="text-sm text-amber-200/70 ml-1">{history.personalBest.unit}</span>
                </p>
              </div>
              {history.personalBest.value === currentValue && (
                <span className="text-xs px-2 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Today!
                </span>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* 7-Day Trend */}
      {history?.last7Days && history.last7Days.days > 0 && (
        <Card className="bg-gradient-to-br from-blue-950/30 to-cyan-950/20 border-blue-500/20">
          <div className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="h-4 w-4 text-blue-400" />
              <h4 className="text-sm font-semibold text-white">Last 7 Days</h4>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-white/60 mb-1">Total</p>
                <p className="text-lg font-semibold text-blue-300">
                  {formatValue(history.last7Days.total)}
                  <span className="text-sm text-blue-200/70 ml-1">{unit}</span>
                </p>
              </div>
              <div>
                <p className="text-xs text-white/60 mb-1">Average</p>
                <p className="text-lg font-semibold text-blue-300">
                  {formatValue(Math.round(history.last7Days.average))}
                  <span className="text-sm text-blue-200/70 ml-1">{unit}</span>
                </p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* No Data State */}
      {!history?.previousDay && !history?.personalBest && !history?.last7Days && (
        <Card className="bg-white/5 border-white/10">
          <div className="p-4 text-center">
            <Trophy className="h-8 w-8 text-white/20 mx-auto mb-2" />
            <p className="text-sm text-white/60">No history yet</p>
            <p className="text-xs text-white/40 mt-1">Complete workouts to track your progress</p>
          </div>
        </Card>
      )}
    </div>
  );
};

WorkoutStatistics.displayName = 'WorkoutStatistics';
