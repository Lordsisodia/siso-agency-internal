import React, { useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Chip } from '@/components/ui/chip';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Activity,
  CheckCircle2,
  Dumbbell,
  Heart,
  Moon,
  Utensils,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { WellnessData } from '../_shared/types';

interface WeeklyWellnessSectionProps {
  wellnessData: WellnessData;
}

type HabitKey = keyof WellnessData['healthHabits'];

const HABIT_LABELS: Record<
  HabitKey,
  { label: string; emoji: string; color: string }
> = {
  morningRoutine: { label: 'Morning Routine', emoji: '🌅', color: 'text-emerald-100' },
  checkout: { label: 'Checkout', emoji: '✅', color: 'text-purple-100' },
  water: { label: 'Hydration', emoji: '💧', color: 'text-sky-100' },
  meditation: { label: 'Meditation', emoji: '🧘', color: 'text-amber-100' },
  sleep: { label: 'Sleep Quality', emoji: '😴', color: 'text-blue-100' },
};

const StatTile: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
  helper?: string;
  tone?: 'neutral' | 'positive';
}> = ({ icon, label, value, helper, tone = 'neutral' }) => {
  const tones = {
    neutral: 'border-white/10 bg-white/5 text-slate-100',
    positive: 'border-emerald-400/40 bg-emerald-500/10 text-emerald-100',
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

const HabitRow: React.FC<{
  habit: HabitKey;
  values: boolean[];
}> = ({ habit, values }) => {
  const meta = HABIT_LABELS[habit];
  const completedCount = values.filter(Boolean).length;
  const rate = Math.round((completedCount / values.length) * 100);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-lg">{meta.emoji}</span>
          <span className={cn('text-sm font-semibold text-white', meta.color)}>
            {meta.label}
          </span>
        </div>
        <Chip className="border border-white/15 bg-white/10 text-xs uppercase tracking-[0.18em] text-white/70">
          {completedCount}/7 · {rate}%
        </Chip>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {values.map((completed, idx) => (
          <div
            key={`${habit}-${idx}`}
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-lg border text-sm font-semibold',
              completed
                ? 'border-emerald-400/60 bg-emerald-500/15 text-emerald-100'
                : 'border-white/10 bg-white/5 text-white/40',
            )}
          >
            {completed ? '✓' : '–'}
          </div>
        ))}
      </div>
    </div>
  );
};

export const WeeklyWellnessSection: React.FC<
  WeeklyWellnessSectionProps
> = ({ wellnessData }) => {
  const { workouts, healthHabits, energySleep, nutrition } = wellnessData;

  const averageWorkoutDuration = workouts.total
    ? Math.round(workouts.totalMinutes / workouts.total)
    : 0;

  const habitsList = useMemo(
    () => Object.keys(healthHabits) as HabitKey[],
    [healthHabits],
  );

  return (
    <div className="relative min-h-screen pb-28">
      <div className="mx-auto w-full max-w-5xl px-4 pb-8 pt-4 sm:px-6 lg:px-8">
        <Card className="border border-white/10 bg-gradient-to-br from-slate-950 via-slate-900/80 to-slate-950 shadow-2xl shadow-rose-500/10">
          <CardHeader className="space-y-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-2">
                <Badge className="w-fit bg-rose-500/20 text-rose-100" variant="secondary">
                  Weekly Health
                </Badge>
                <CardTitle className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                  Did I look after my body and mind?
                </CardTitle>
                <p className="max-w-xl text-sm text-slate-300/80">
                  Wellness isn’t a vibe check—it’s a scoreboard. Track workouts, recovery,
                  discipline, and fueling so health doesn’t become an afterthought.
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/70 shadow-inner">
                <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-white/60">
                  <Heart className="h-4 w-4" />
                  Weekly cadence
                </p>
                <ul className="mt-3 space-y-2">
                  <li>• Aim for 4+ strong workouts (Mon/Wed/Fri/Sat).</li>
                  <li>• Morning + checkout habits keep discipline tight.</li>
                  <li>• Track sleep/energy to prevent burnout.</li>
                </ul>
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
              <StatTile
                icon={<Dumbbell className="h-4 w-4" />}
                label="Workouts Logged"
                value={`${workouts.total}`}
                helper={`${workouts.totalMinutes} total minutes`}
              />
              <StatTile
                icon={<Activity className="h-4 w-4" />}
                label="Average Energy"
                value={energySleep.averageEnergy.toFixed(1)}
                helper="Self-reported out of 10"
              />
              <StatTile
                icon={<Moon className="h-4 w-4" />}
                label="Average Sleep"
                value={`${energySleep.averageSleep.toFixed(1)}h`}
                helper={`Quality ${energySleep.sleepQuality}/10`}
              />
              <StatTile
                icon={<Utensils className="h-4 w-4" />}
                label="Calorie Intake"
                value={`${nutrition.averageCalories} cal`}
                helper={`Weight change ${nutrition.weightChange > 0 ? '+' : ''}${nutrition.weightChange}kg`}
                tone="positive"
              />
            </div>
          </CardHeader>

          <CardContent className="space-y-8">
            <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-300">
                  Workout breakdown
                </h3>
                <Chip className="border border-white/15 bg-white/10 text-xs uppercase tracking-[0.18em] text-white/70">
                  Avg duration · {averageWorkoutDuration} min
                </Chip>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {workouts.types.map((type) => (
                  <div
                    key={type.type}
                    className="rounded-2xl border border-white/10 bg-white/5 p-4"
                  >
                    <div className="flex items-center justify-between text-sm text-white/80">
                      <span className="font-semibold">{type.type}</span>
                      <span>{type.count}x</span>
                    </div>
                    <Progress
                      value={Math.min(100, (type.count / (workouts.total || 1)) * 100)}
                      indicatorColor="bg-gradient-to-r from-orange-400 to-red-500"
                      className="mt-3 h-2 rounded-full bg-white/10"
                    />
                  </div>
                ))}
              </div>
            </section>

            <Separator className="bg-white/10" />

            <section className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-300">
                Habit accountability
              </h3>
              <div className="grid gap-3">
                {habitsList.map((habit) => (
                  <HabitRow key={habit} habit={habit} values={healthHabits[habit]} />
                ))}
              </div>
            </section>

            <Separator className="bg-white/10" />

            <section className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-white/60">
                  <Moon className="h-4 w-4" />
                  Sleep & recovery
                </div>
                <div className="mt-4 space-y-3 text-sm text-white/80">
                  <div className="flex justify-between">
                    <span>Average Sleep</span>
                    <span className="font-semibold">
                      {energySleep.averageSleep.toFixed(1)}h
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sleep Quality</span>
                    <span className="font-semibold">
                      {energySleep.sleepQuality}/10
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Energy Score</span>
                    <span className="font-semibold">
                      {energySleep.averageEnergy.toFixed(1)}/10
                    </span>
                  </div>
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-white/60">
                  <Utensils className="h-4 w-4" />
                  Fuel & weight
                </div>
                <div className="mt-4 space-y-3 text-sm text-white/80">
                  <div className="flex justify-between">
                    <span>Average Calories</span>
                    <span className="font-semibold">
                      {nutrition.averageCalories} cal/day
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Weight Change</span>
                    <span className="font-semibold">
                      {nutrition.weightChange > 0 ? '+' : ''}
                      {nutrition.weightChange} kg
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Workouts Logged</span>
                    <span className="font-semibold">{workouts.total}</span>
                  </div>
                </div>
              </div>
            </section>
          </CardContent>

          <CardFooter className="flex flex-col gap-3 border-t border-white/10 bg-black/40 px-6 py-5 text-sm text-slate-300/80 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-4 w-4 text-emerald-200" />
              <span>
                Bring any breakdowns into the Review tab—call out missed workouts, late
                wake-ups, or low energy so next week’s plan fixes it.
              </span>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};
