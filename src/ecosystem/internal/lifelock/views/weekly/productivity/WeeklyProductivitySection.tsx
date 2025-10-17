import React, { useMemo } from 'react';
import { format } from 'date-fns';
import {
  ArrowDownRight,
  ArrowUpRight,
  Brain,
  Briefcase,
  CheckSquare,
  Target,
  TrendingUp,
} from 'lucide-react';
import { Badge } from '@/shared/ui/badge';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card';
import { Chip } from '@/shared/ui/chip';
import { Separator } from '@/shared/ui/separator';
import { Progress } from '@/shared/ui/progress';
import { cn } from '@/shared/lib/utils';
import type { ProductivityData } from '../_shared/types';

interface WeeklyProductivitySectionProps {
  productivityData: ProductivityData;
}

interface TimelineRow {
  date: Date;
  deepHours: number;
  lightTasks: number;
}

const StatTile: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
  helper?: string;
  tone?: 'neutral' | 'positive' | 'warning';
}> = ({ icon, label, value, helper, tone = 'neutral' }) => {
  const tones = {
    neutral: 'border-white/10 bg-white/5 text-slate-100',
    positive: 'border-emerald-400/40 bg-emerald-500/10 text-emerald-100',
    warning: 'border-amber-400/40 bg-amber-500/10 text-amber-100',
  };
  return (
    <div
      className={cn(
        'rounded-2xl border px-4 py-4 shadow-inner backdrop-blur-sm',
        tones[tone],
      )}
    >
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
        {icon}
        {label}
      </div>
      <div className="mt-2 text-3xl font-semibold">{value}</div>
      {helper && <p className="mt-2 text-xs text-white/70">{helper}</p>}
    </div>
  );
};

const TrendChip: React.FC<{ label: string; change: number }> = ({
  label,
  change,
}) => {
  const positive = change >= 0;
  const Icon = positive ? ArrowUpRight : ArrowDownRight;
  return (
    <Chip
      className={cn(
        'gap-2 border px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]',
        positive
          ? 'border-emerald-400/40 bg-emerald-500/10 text-emerald-100'
          : 'border-rose-400/40 bg-rose-500/10 text-rose-100',
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}: {positive ? '+' : '−'}
      {Math.abs(change)}%
    </Chip>
  );
};

const PriorityRow: React.FC<{
  label: string;
  completed: number;
  total: number;
  gradient: string;
}> = ({ label, completed, total, gradient }) => {
  const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold text-white">
          <div className={cn('rounded-full px-3 py-1 text-xs text-white', gradient)}>
            {label}
          </div>
          <span>
            {completed}/{total} complete
          </span>
        </div>
        <span className="text-sm font-bold text-blue-200">{rate}%</span>
      </div>
      <Progress
        value={rate}
        indicatorColor="bg-gradient-to-r from-sky-400 to-indigo-500"
        className="mt-3 h-2 rounded-full bg-white/10"
      />
    </div>
  );
};

const DayRow: React.FC<TimelineRow> = ({ date, deepHours, lightTasks }) => {
  return (
    <div className="rounded-2xl border border-white/5 bg-white/5 px-4 py-3 transition-colors duration-200 hover:border-white/15 hover:bg-white/10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Badge className="rounded-full bg-blue-500/15 text-xs font-semibold uppercase tracking-[0.2em] text-blue-100">
            {format(date, 'EEE')}
          </Badge>
          <span className="text-sm font-medium text-white/80">
            {format(date, 'MMM d')}
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          <Chip className="border border-emerald-400/40 bg-emerald-500/10 text-[0.7rem] uppercase tracking-[0.18em] text-emerald-100">
            Deep: {deepHours}h
          </Chip>
          <Chip className="border border-indigo-400/40 bg-indigo-500/10 text-[0.7rem] uppercase tracking-[0.18em] text-indigo-100">
            Light: {lightTasks} tasks
          </Chip>
        </div>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div>
          <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-slate-400">
            <span>Deep Work</span>
            <span>{deepHours}h</span>
          </div>
          <Progress
            value={Math.min(100, (deepHours / 8) * 100)}
            indicatorColor="bg-gradient-to-r from-emerald-400 to-blue-400"
            className="mt-2 h-2 rounded-full bg-white/10"
          />
        </div>
        <div>
          <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-slate-400">
            <span>Light Work</span>
            <span>{lightTasks}</span>
          </div>
          <Progress
            value={Math.min(100, (lightTasks / 12) * 100)}
            indicatorColor="bg-gradient-to-r from-indigo-400 to-purple-400"
            className="mt-2 h-2 rounded-full bg-white/10"
          />
        </div>
      </div>
    </div>
  );
};

export const WeeklyProductivitySection: React.FC<
  WeeklyProductivitySectionProps
> = ({ productivityData }) => {
  const { deepWork, lightWork, priorities, weekOverWeek } = productivityData;

  const completionRate =
    lightWork.totalTasks > 0
      ? Math.round((lightWork.completedTasks / lightWork.totalTasks) * 100)
      : 0;

  const timeline: TimelineRow[] = useMemo(
    () =>
      deepWork.dailyBreakdown.map((day, index) => ({
        date: day.date,
        deepHours: day.hours,
        lightTasks: lightWork.dailyBreakdown[index]?.tasks ?? 0,
      })),
    [deepWork.dailyBreakdown, lightWork.dailyBreakdown],
  );

  return (
    <div className="relative min-h-screen pb-28">
      <div className="mx-auto w-full max-w-5xl px-4 pb-8 pt-4 sm:px-6 lg:px-8">
        <Card className="border border-white/10 bg-gradient-to-br from-slate-950 via-slate-900/80 to-slate-950 shadow-2xl shadow-purple-500/10">
          <CardHeader className="space-y-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-2">
                <Badge className="w-fit bg-purple-500/20 text-purple-100" variant="secondary">
                  Weekly Work
                </Badge>
                <CardTitle className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                  What did I actually ship?
                </CardTitle>
                <p className="max-w-xl text-sm text-slate-300/80">
                  Track deep focus, admin throughput, and task priority mix to
                  keep the work cadence honest.
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/70 shadow-inner">
                <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-white/60">
                  <Briefcase className="h-4 w-4" />
                  Weekly cadence
                </p>
                <ul className="mt-3 space-y-2">
                  <li>• Deep work = client deliverables, heavy lifts.</li>
                  <li>• Light work = admin/life tasks that keep things moving.</li>
                  <li>• Review trends vs last week to adjust workload.</li>
                </ul>
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
              <StatTile
                icon={<Brain className="h-4 w-4" />}
                label="Deep Work Hours"
                value={`${deepWork.totalHours}h`}
                helper={`${deepWork.sessions} focused sessions`}
              />
              <StatTile
                icon={<CheckSquare className="h-4 w-4" />}
                label="Light Tasks Completed"
                value={`${lightWork.completedTasks}`}
                helper={`${lightWork.totalTasks} logged`}
              />
              <StatTile
                icon={<Target className="h-4 w-4" />}
                label="Completion Rate"
                value={`${completionRate}%`}
                helper="Across all logged tasks"
                tone={completionRate >= 90 ? 'positive' : completionRate >= 70 ? 'neutral' : 'warning'}
              />
              <StatTile
                icon={<TrendingUp className="h-4 w-4" />}
                label="Momentum"
                value={
                  weekOverWeek.deepWorkChange >= 0
                    ? `+${weekOverWeek.deepWorkChange}%`
                    : `${weekOverWeek.deepWorkChange}%`
                }
                helper="Deep work vs last week"
                tone={weekOverWeek.deepWorkChange >= 0 ? 'positive' : 'warning'}
              />
            </div>
          </CardHeader>

          <CardContent className="space-y-8">
            <section className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-300">
                  Weekly flow
                </h3>
                <div className="flex flex-wrap gap-2">
                  <TrendChip label="Deep work" change={weekOverWeek.deepWorkChange} />
                  <TrendChip label="Light work" change={weekOverWeek.lightWorkChange} />
                  <TrendChip label="Completion" change={weekOverWeek.completionChange} />
                </div>
              </div>
              <div className="space-y-3">
                {timeline.map((day) => (
                  <DayRow
                    key={day.date.toISOString()}
                    date={day.date}
                    deepHours={day.deepHours}
                    lightTasks={day.lightTasks}
                  />
                ))}
              </div>
            </section>

            <Separator className="bg-white/10" />

            <section className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-300">
                Priority mix
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <PriorityRow
                  label="P1 Critical"
                  completed={priorities.p1.completed}
                  total={priorities.p1.total}
                  gradient="bg-gradient-to-r from-rose-500 to-red-500"
                />
                <PriorityRow
                  label="P2 Important"
                  completed={priorities.p2.completed}
                  total={priorities.p2.total}
                  gradient="bg-gradient-to-r from-orange-500 to-amber-500"
                />
                <PriorityRow
                  label="P3 Useful"
                  completed={priorities.p3.completed}
                  total={priorities.p3.total}
                  gradient="bg-gradient-to-r from-yellow-500 to-lime-500"
                />
                <PriorityRow
                  label="P4 Admin"
                  completed={priorities.p4.completed}
                  total={priorities.p4.total}
                  gradient="bg-gradient-to-r from-sky-500 to-blue-500"
                />
              </div>
            </section>
          </CardContent>

          <CardFooter className="flex flex-col gap-3 border-t border-white/10 bg-black/40 px-6 py-5 text-sm text-slate-300/80 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-4 w-4 text-purple-200" />
              <span>
                Close the loop in the Review tab to capture what worked, what slipped,
                and the adjustments for next week.
              </span>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};
