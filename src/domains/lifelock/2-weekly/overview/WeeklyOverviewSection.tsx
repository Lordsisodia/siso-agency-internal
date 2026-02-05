import React from 'react';
import { format } from 'date-fns';
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  Flame,
  HeartPulse,
  TrendingUp,
  AlertTriangle,
  Brain,
  Sun,
  Activity,
  Timer,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import type { WeeklyData } from '../_shared/types';
import { WeeklyDayStrip } from '../_shared/WeeklyDayStrip';

interface WeeklyOverviewSectionProps {
  weeklyData: WeeklyData;
  onNavigateToDaily?: () => void;
}

const MetricTile: React.FC<{
  label: string;
  value: string;
  icon: React.ReactNode;
  tone?: 'positive' | 'warning' | 'neutral';
  helper?: string;
}> = ({ label, value, icon, tone = 'neutral', helper }) => {
  const toneStyles = {
    positive: 'border-emerald-400/40 bg-emerald-500/10 text-emerald-200',
    warning: 'border-amber-400/40 bg-amber-500/10 text-amber-200',
    neutral: 'border-white/10 bg-white/5 text-slate-100',
  };

  return (
    <div
      className={cn(
        'rounded-xl border px-4 py-3 transition-all duration-200',
        toneStyles[tone],
      )}
    >
      <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-slate-400">
        <span className="opacity-70">{icon}</span>
        <span>{label}</span>
      </div>
      <div className="mt-2 text-2xl font-semibold">{value}</div>
      {helper && (
        <p className="mt-1 text-xs text-slate-300/70">{helper}</p>
      )}
    </div>
  );
};

const ListCallout: React.FC<{
  title: string;
  icon: React.ReactNode;
  items: string[];
  tone?: 'positive' | 'negative';
}> = ({ title, icon, items, tone = 'positive' }) => {
  const toneStyles =
    tone === 'positive'
      ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-100'
      : 'border-rose-500/30 bg-rose-500/10 text-rose-100';

  return (
    <div
      className={cn(
        'rounded-2xl border p-4 sm:p-5 backdrop-blur',
        toneStyles,
      )}
    >
      <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-white/80">
        {icon}
        {title}
      </p>
      <ul className="mt-3 space-y-2 text-sm">
        {items.length === 0 ? (
          <li className="text-white/70">Nothing logged yet.</li>
        ) : (
          items.slice(0, 4).map((item, idx) => (
            <li key={`${title}-${idx}`} className="flex gap-2">
              <span>•</span>
              <span className="text-white/80">{item}</span>
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export const WeeklyOverviewSection: React.FC<WeeklyOverviewSectionProps> = ({
  weeklyData,
  onNavigateToDaily,
}) => {
  if (!weeklyData) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400">
        Loading weekly data...
      </div>
    );
  }

  const { weekStart, weekEnd, dailyData, summary } = weeklyData;

  const totalDeepWorkHours = dailyData.reduce(
    (acc, day) => acc + (day.deepWorkHours || 0),
    0,
  );
  const totalLightTasks = dailyData.reduce(
    (acc, day) => acc + (day.lightWorkTasks || 0),
    0,
  );
  const morningRoutineDays = dailyData.filter(
    (day) => day.morningRoutine,
  ).length;
  const workoutsDone = dailyData.filter((day) => day.workout).length;
  const checkoutsDone = dailyData.filter((day) => day.checkout).length;

  const avgSleepHours =
    dailyData.length > 0
      ? (dailyData.reduce((acc, day) => acc + (day.sleepHours || 0), 0) /
        dailyData.length)
          .toFixed(1)
      : '0';

  const avgXpPerDay =
    dailyData.length > 0 ? Math.round(summary.totalXP / dailyData.length) : 0;

  const consistencyScore = Math.round(
    (morningRoutineDays / (dailyData.length || 1)) * 100,
  );

  const issues = summary?.worstDay?.issues ?? [];

  return (
    <div className="relative min-h-screen pb-28">
      <div className="mx-auto w-full max-w-5xl px-4 pb-8 pt-4 sm:px-6 lg:px-8">
        <Card className="border border-white/10 bg-gradient-to-br from-slate-950 via-slate-900/80 to-slate-950 shadow-2xl shadow-blue-500/10">
          <CardHeader className="space-y-6 pb-0">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-2">
                <Badge
                  className="w-fit bg-blue-500/20 text-blue-100"
                  variant="secondary"
                >
                  Week Snapshot
                </Badge>
                <CardTitle className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                  {format(weekStart, 'MMM d')} – {format(weekEnd, 'd, yyyy')}
                </CardTitle>
                <p className="max-w-xl text-sm text-slate-300/80">
                  Am I on track? Did I have a good week? What should I improve?
                  Are the weeks getting better? This card answers those four
                  questions at a glance.
                </p>
              </div>

              <div className="flex flex-col items-start gap-3 text-left lg:text-right">
                <div className="flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-sm font-medium text-blue-200 shadow-inner">
                  <CheckCircle2 className="h-4 w-4" />
                  Week Health: {summary.completionPercentage}%
                </div>
                <div className="text-4xl font-black text-blue-200">
                  {summary.averageGrade}
                </div>
                {onNavigateToDaily && (
                  <Button
                    onClick={onNavigateToDaily}
                    size="sm"
                    variant="secondary"
                    className="bg-orange-500/20 text-orange-100 hover:bg-orange-500/30"
                  >
                    Open Daily View
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <MetricTile
                label="Total XP"
                value={`${summary.totalXP}`}
                helper={`${avgXpPerDay} avg / day`}
                icon={<Flame className="h-4 w-4" />}
                tone="positive"
              />
              <MetricTile
                label="Deep Work"
                value={`${totalDeepWorkHours}h`}
                helper={`${summary.streaks.deepWork}-day streak`}
                icon={<Brain className="h-4 w-4" />}
              />
              <MetricTile
                label="Light Tasks"
                value={`${totalLightTasks}`}
                helper="Logged this week"
                icon={<Activity className="h-4 w-4" />}
              />
              <MetricTile
                label="Consistency"
                value={`${consistencyScore}%`}
                helper={`${morningRoutineDays}/${dailyData.length} morning routines`}
                icon={<Sun className="h-4 w-4" />}
                tone={consistencyScore >= 85 ? 'positive' : 'warning'}
              />
            </div>
          </CardHeader>

          <CardContent className="space-y-8 pt-6">
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-300">
                  7-Day Timeline
                </h3>
                <Badge className="bg-white/10 text-xs text-slate-200">
                  Tap a day to drill into daily view
                </Badge>
              </div>
              <WeeklyDayStrip
                dailyData={dailyData}
                onDaySelect={
                  onNavigateToDaily
                    ? (_date) => onNavigateToDaily()
                    : undefined
                }
              />
            </section>

            <Separator className="bg-white/10" />

            <section className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-5 backdrop-blur">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-blue-100/80">
                  <Timer className="h-4 w-4" />
                  Output Report
                </div>
                <div className="mt-4 space-y-3 text-sm text-blue-100">
                  <div className="flex justify-between border-b border-blue-500/20 pb-2">
                    <span>Deep Work Hours</span>
                    <span className="font-semibold">{totalDeepWorkHours}h</span>
                  </div>
                  <div className="flex justify-between border-b border-blue-500/20 pb-2">
                    <span>Light Work Tasks</span>
                    <span className="font-semibold">{totalLightTasks}</span>
                  </div>
                  <div className="flex justify-between border-b border-blue-500/20 pb-2">
                    <span>Best Day</span>
                    <span className="font-semibold">
                      {format(summary.bestDay.date, 'EEEE')} · {summary.bestDay.xp} XP
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Checkout Completion</span>
                    <span className="font-semibold">
                      {checkoutsDone}/{dailyData.length}
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-5 backdrop-blur">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-emerald-100/80">
                  <HeartPulse className="h-4 w-4" />
                  Recovery & Discipline
                </div>
                <div className="mt-4 space-y-3 text-sm text-emerald-100">
                  <div className="flex justify-between border-b border-emerald-500/20 pb-2">
                    <span>Average Sleep</span>
                    <span className="font-semibold">{avgSleepHours} hrs</span>
                  </div>
                  <div className="flex justify-between border-b border-emerald-500/20 pb-2">
                    <span>Workouts Completed</span>
                    <span className="font-semibold">
                      {workoutsDone}/{dailyData.length}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-emerald-500/20 pb-2">
                    <span>Morning Routine Streak</span>
                    <span className="font-semibold">
                      {summary.streaks.morningRoutine} days
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Wake Consistency</span>
                    <span className="font-semibold">{consistencyScore}%</span>
                  </div>
                </div>
              </div>
            </section>

            <Separator className="bg-white/10" />

            <section className="grid gap-4 lg:grid-cols-2">
              <ListCallout
                title="Wins & Highlights"
                icon={<TrendingUp className="h-4 w-4" />}
                items={[
                  `Best day on ${format(summary.bestDay.date, 'EEEE')} (${summary.bestDay.xp} XP)`,
                  `${summary.streaks.deepWork}-day deep work streak`,
                  `${workoutsDone} workouts completed`,
                ]}
                tone="positive"
              />
              <ListCallout
                title="Breakdowns & Fixes"
                icon={<AlertTriangle className="h-4 w-4" />}
                items={
                  issues.length
                    ? issues
                    : ['No issues logged yet. Capture problems in checkout.']
                }
                tone="negative"
              />
            </section>
          </CardContent>

          <CardFooter className="flex flex-col gap-3 border-t border-white/10 bg-black/40 px-6 py-5 text-sm text-slate-300/80 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-blue-200" />
              <span>
                Review the week, then run the weekly checkout to capture lessons
                and set next week&apos;s focus.
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="border border-white/10 bg-white/5 text-white hover:bg-white/10"
            >
              Start Weekly Checkout
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};
