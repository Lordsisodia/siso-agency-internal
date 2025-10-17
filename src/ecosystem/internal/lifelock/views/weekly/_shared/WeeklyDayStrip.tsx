import React from 'react';
import { format } from 'date-fns';
import { Badge } from '@/shared/ui/badge';
import { Chip } from '@/shared/ui/chip';
import { cn } from '@/shared/lib/utils';
import type { DailyData } from './types';

interface WeeklyDayStripProps {
  dailyData: DailyData[];
  onDaySelect?: (date: Date) => void;
}

const MetricChip: React.FC<{
  label: string;
  value: string;
  tone?: 'good' | 'bad' | 'neutral';
}> = ({ label, value, tone = 'neutral' }) => {
  const toneStyles = {
    good: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-100',
    bad: 'border-rose-500/40 bg-rose-500/10 text-rose-100',
    neutral: 'border-white/10 bg-white/5 text-slate-100',
  };

  return (
    <Chip
      className={cn(
        'justify-between gap-2 rounded-full border px-3 py-1 text-[11px] font-medium uppercase tracking-[0.12em]',
        toneStyles[tone],
      )}
      variant="outline"
    >
      <span className="text-xs">{label}</span>
      <span className="text-[0.72rem] font-semibold">{value}</span>
    </Chip>
  );
};

export const WeeklyDayStrip: React.FC<WeeklyDayStripProps> = ({
  dailyData,
  onDaySelect,
}) => {
  if (!dailyData.length) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-10 text-center text-sm text-white/60">
        Weekly data not available yet. Log daily entries to populate this view.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {dailyData.map((day) => {
        const wakeTime = day.wakeTime || '—';
        const deepWork = `${day.deepWorkHours ?? 0}h`;
        const lightWork = `${day.lightWorkTasks ?? 0} tasks`;
        const sleep = day.sleepHours ? `${day.sleepHours}h` : '—';
        const xp = `${day.xpEarned ?? 0} XP`;
        const morningTone = day.morningRoutine ? 'good' : 'bad';
        const workoutTone = day.workout ? 'good' : 'bad';

        return (
          <button
            key={day.date.toISOString()}
            type="button"
            onClick={() => onDaySelect?.(day.date)}
            className="group w-full rounded-2xl border border-white/5 bg-white/[0.04] px-4 py-3 text-left transition-colors duration-200 hover:border-white/15 hover:bg-white/[0.08]"
          >
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-3">
                <Badge className="rounded-full bg-blue-500/10 text-xs font-semibold uppercase tracking-[0.2em] text-blue-100">
                  {format(day.date, 'EEE')}
                </Badge>
                <span className="text-sm font-medium text-white/90">
                  {format(day.date, 'MMM d')}
                </span>
              </div>

              <div className="flex flex-wrap gap-2 md:justify-end">
                <MetricChip
                  label="Morning"
                  value={day.morningRoutine ? 'Done' : 'Missed'}
                  tone={morningTone}
                />
                <MetricChip label="Wake" value={wakeTime} />
                <MetricChip label="Sleep" value={sleep} />
                <MetricChip label="Deep Work" value={deepWork} />
                <MetricChip label="Light" value={lightWork} />
                <MetricChip label="XP" value={xp} />
                <MetricChip
                  label="Workout"
                  value={day.workout ? '✔' : '–'}
                  tone={workoutTone}
                />
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
};
