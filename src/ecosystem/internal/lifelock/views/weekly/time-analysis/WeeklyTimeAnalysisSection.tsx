import React, { useMemo } from 'react';
import { format } from 'date-fns';
import {
  Badge,
} from '@/shared/ui/badge';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card';
import { Chip } from '@/shared/ui/chip';
import { Progress } from '@/shared/ui/progress';
import { Separator } from '@/shared/ui/separator';
import {
  Clock,
  Moon,
  PieChart,
  Sun,
  Timer,
  Zap,
} from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import type { TimeAnalysisData } from '../_shared/types';

interface WeeklyTimeAnalysisSectionProps {
  timeData: TimeAnalysisData;
}

const StatTile: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
  helper?: string;
}> = ({ icon, label, value, helper }) => (
  <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 shadow-inner backdrop-blur-sm">
    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
      {icon}
      {label}
    </div>
    <div className="mt-2 text-3xl font-semibold text-white">{value}</div>
    {helper && <p className="mt-2 text-xs text-white/70">{helper}</p>}
  </div>
);

const SleepRow: React.FC<{ date: Date; hours: number }> = ({ date, hours }) => {
  const tone =
    hours >= 7 ? 'from-emerald-400 to-emerald-500' : hours >= 6 ? 'from-amber-400 to-amber-500' : 'from-rose-400 to-rose-500';
  return (
    <div className="rounded-2xl border border-white/5 bg-white/5 px-4 py-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Badge className="rounded-full bg-indigo-500/15 text-xs font-semibold uppercase tracking-[0.2em] text-indigo-100">
            {format(date, 'EEE')}
          </Badge>
          <span className="text-sm font-medium text-white/80">
            {format(date, 'MMM d')}
          </span>
        </div>
        <Chip className="border border-white/15 bg-white/10 text-[0.7rem] uppercase tracking-[0.18em] text-white/70">
          {hours.toFixed(1)}h
        </Chip>
      </div>
      <Progress
        value={Math.min(100, (hours / 10) * 100)}
        indicatorColor={`bg-gradient-to-r ${tone}`}
        className="mt-3 h-2 rounded-full bg-white/10"
      />
    </div>
  );
};

const UtilizationCard: React.FC<{
  tracked: number;
  untracked: number;
  productivePercentage: number;
}> = ({ tracked, untracked, productivePercentage }) => {
  const total = tracked + untracked;
  const trackedPercent = total ? Math.round((tracked / total) * 100) : 0;
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-white/60">
        <PieChart className="h-4 w-4" />
        Utilization
      </div>
      <div className="mt-4 space-y-3 text-sm text-white/80">
        <div className="flex justify-between">
          <span>Productive %</span>
          <span className="font-semibold">{productivePercentage}%</span>
        </div>
        <div className="flex justify-between">
          <span>Tracked Hours</span>
          <span className="font-semibold">{tracked}h</span>
        </div>
        <div className="flex justify-between">
          <span>Untracked Hours</span>
          <span className="font-semibold">{untracked}h</span>
        </div>
      </div>
      <div className="mt-4 flex h-6 overflow-hidden rounded-full">
        <div
          className="flex items-center justify-center bg-gradient-to-r from-sky-400 to-blue-500 text-xs font-semibold text-white"
          style={{ width: `${trackedPercent}%` }}
        >
          Logged
        </div>
        <div
          className="flex flex-1 items-center justify-center bg-white/10 text-xs font-semibold text-white/70"
          style={{ width: `${100 - trackedPercent}%` }}
        >
          Unlogged
        </div>
      </div>
    </div>
  );
};

export const WeeklyTimeAnalysisSection: React.FC<
  WeeklyTimeAnalysisSectionProps
> = ({ timeData }) => {
  const { sleep, work, wakeTime, utilization } = timeData;

  const wakeJustifications = wakeTime.justifications ?? [];

  const sleepRows = useMemo(
    () =>
      sleep.dailyHours.map((entry) => (
        <SleepRow key={entry.date.toISOString()} date={entry.date} hours={entry.hours} />
      )),
    [sleep.dailyHours],
  );

  return (
    <div className="relative min-h-screen pb-28">
      <div className="mx-auto w-full max-w-5xl px-4 pb-8 pt-4 sm:px-6 lg:px-8">
        <Card className="border border-white/10 bg-gradient-to-br from-slate-950 via-slate-900/80 to-slate-950 shadow-2xl shadow-cyan-500/10">
          <CardHeader className="space-y-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-2">
                <Badge className="w-fit bg-cyan-500/20 text-cyan-100" variant="secondary">
                  Weekly Time Audit
                </Badge>
                <CardTitle className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                  Where did my hours actually go?
                </CardTitle>
                <p className="max-w-xl text-sm text-slate-300/80">
                  Sleep, deep focus, admin, downtime—see the breakdown so you can
                  recalibrate the schedule instead of guessing.
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/70 shadow-inner">
                <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-white/60">
                  <Clock className="h-4 w-4" />
                  Weekly cadence
                </p>
                <ul className="mt-3 space-y-2">
                  <li>• Sleep tracked from nightly checkout → morning wake.</li>
                  <li>• Deep vs light hours logged when finishing tasks.</li>
                  <li>• Utilization highlights where hours leak.</li>
                </ul>
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
              <StatTile
                icon={<Moon className="h-4 w-4" />}
                label="Average Sleep"
                value={`${sleep.averageHours.toFixed(1)}h`}
                helper={`Quality ${sleep.quality}/10`}
              />
              <StatTile
                icon={<Timer className="h-4 w-4" />}
                label="Work Logged"
                value={`${work.totalHours}h`}
                helper={`${work.deepWorkHours}h deep • ${work.lightWorkHours}h light`}
              />
              <StatTile
                icon={<Sun className="h-4 w-4" />}
                label="Average Wake"
                value={wakeTime.averageTime}
                helper={`${wakeTime.onTimeRate}% on-time`}
              />
              <StatTile
                icon={<PieChart className="h-4 w-4" />}
                label="Productive Utilization"
                value={`${utilization.productivePercentage}%`}
                helper={`${utilization.trackedHours}h tracked`}
              />
            </div>
          </CardHeader>

          <CardContent className="space-y-8">
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-300">
                  Sleep & recovery
                </h3>
                <Chip className="border border-white/15 bg-white/10 text-xs uppercase tracking-[0.18em] text-white/70">
                  Target · 7h+
                </Chip>
              </div>
              <div className="grid gap-3">{sleepRows}</div>
            </section>

            <Separator className="bg-white/10" />

            <section className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-white/60">
                  <Timer className="h-4 w-4" />
                  Work hours mix
                </div>
                <div className="mt-4 space-y-3 text-sm text-white/80">
                  <div className="flex justify-between">
                    <span>Deep Work</span>
                    <span className="font-semibold">
                      {work.deepWorkHours}h (
                      {Math.round((work.deepWorkHours / (work.totalHours || 1)) * 100)}%)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Light Work</span>
                    <span className="font-semibold">
                      {work.lightWorkHours}h (
                      {Math.round((work.lightWorkHours / (work.totalHours || 1)) * 100)}%)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Logged</span>
                    <span className="font-semibold">{work.totalHours} hours</span>
                  </div>
                </div>
                <div className="mt-4 flex h-6 overflow-hidden rounded-full">
                  <div
                    className="flex items-center justify-center bg-gradient-to-r from-sky-400 to-blue-500 text-xs font-semibold text-white"
                    style={{
                      width: `${Math.round(
                        (work.deepWorkHours / (work.totalHours || 1)) * 100,
                      )}%`,
                    }}
                  >
                    Deep
                  </div>
                  <div
                    className="flex flex-1 items-center justify-center bg-gradient-to-r from-indigo-400 to-purple-500 text-xs font-semibold text-white"
                    style={{
                      width: `${Math.round(
                        (work.lightWorkHours / (work.totalHours || 1)) * 100,
                      )}%`,
                    }}
                  >
                    Light
                  </div>
                </div>
              </div>
              <UtilizationCard
                tracked={utilization.trackedHours}
                untracked={utilization.untrackedHours}
                productivePercentage={utilization.productivePercentage}
              />
            </section>

            <Separator className="bg-white/10" />

            <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-white/60">
                <Sun className="h-4 w-4" />
                Wake discipline
              </div>
              <div className="mt-4 grid gap-3 text-sm text-white/80 md:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-white/60">
                    On-time rate
                  </p>
                  <p className="mt-2 text-3xl font-semibold text-white">
                    {wakeTime.onTimeRate}%
                  </p>
                  <p className="mt-1 text-xs text-white/60">
                    Goal ≥ 85% (5/7 days minimum)
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-white/60">
                    Average wake time
                  </p>
                  <p className="mt-2 text-3xl font-semibold text-white">
                    {wakeTime.averageTime}
                  </p>
                  <p className="mt-1 text-xs text-white/60">
                    Keep within ±15m of target.
                  </p>
                </div>
              </div>
              {wakeJustifications.length > 0 && (
                <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-white/80">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/60">
                    Notes & excuses
                  </p>
                  <ul className="mt-2 space-y-2">
                    {wakeJustifications.map((item, idx) => (
                      <li key={`wake-note-${idx}`} className="flex gap-2">
                        <span>•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
          </CardContent>

          <CardFooter className="flex flex-col gap-3 border-t border-white/10 bg-black/40 px-6 py-5 text-sm text-slate-300/80 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <Zap className="h-4 w-4 text-cyan-200" />
              <span>
                Spot time leaks? Schedule fixes directly in the Daily tab or add
                them to next week’s goals.
              </span>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};
