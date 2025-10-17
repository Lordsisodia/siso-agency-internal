import React, { useMemo, useState } from 'react';
import { format } from 'date-fns';
import { Plus, Target, CheckCircle2, RotateCcw, Trash2 } from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Textarea } from '@/shared/ui/textarea';
import { Separator } from '@/shared/ui/separator';
import { cn } from '@/shared/lib/utils';

type GoalStatus = 'planned' | 'in_progress' | 'completed';

interface WeeklyGoal {
  id: string;
  title: string;
  description: string;
  status: GoalStatus;
  category: 'work' | 'health' | 'life';
  createdAt: Date;
}

const statusConfig: Record<
  GoalStatus,
  { label: string; badgeClass: string; next: GoalStatus }
> = {
  planned: {
    label: 'Planned',
    badgeClass: 'bg-blue-500/20 text-blue-100 border border-blue-400/40',
    next: 'in_progress',
  },
  in_progress: {
    label: 'In Progress',
    badgeClass: 'bg-amber-500/20 text-amber-100 border border-amber-400/40',
    next: 'completed',
  },
  completed: {
    label: 'Completed',
    badgeClass: 'bg-emerald-500/20 text-emerald-100 border border-emerald-400/40',
    next: 'planned',
  },
};

const categoryConfig: Record<
  WeeklyGoal['category'],
  { label: string; badgeClass: string }
> = {
  work: {
    label: 'Work',
    badgeClass: 'bg-indigo-500/20 text-indigo-100 border border-indigo-400/40',
  },
  health: {
    label: 'Health',
    badgeClass: 'bg-rose-500/20 text-rose-100 border border-rose-400/40',
  },
  life: {
    label: 'Life',
    badgeClass: 'bg-sky-500/20 text-sky-100 border border-sky-400/40',
  },
};

interface WeeklyGoalsSectionProps {
  selectedWeek: Date;
}

const defaultGoals: WeeklyGoal[] = [
  {
    id: 'goal-1',
    title: 'Ship client project sprint deliverables',
    description:
      'Complete landing page build + QA handoff by Thursday to keep client timeline on track.',
    status: 'in_progress',
    category: 'work',
    createdAt: new Date(),
  },
  {
    id: 'goal-2',
    title: 'Hit 4 deep workouts',
    description:
      'Schedule workouts on Mon/Wed/Fri/Sat. Track progress in Wellness tab and avoid skipping.',
    status: 'planned',
    category: 'health',
    createdAt: new Date(),
  },
  {
    id: 'goal-3',
    title: 'Complete weekly financial review',
    description:
      'Segregate personal vs business spend, reconcile Stripe payouts, and prep Monday cash report.',
    status: 'completed',
    category: 'life',
    createdAt: new Date(),
  },
];

export const WeeklyGoalsSection: React.FC<WeeklyGoalsSectionProps> = ({
  selectedWeek,
}) => {
  const [goals, setGoals] = useState<WeeklyGoal[]>(defaultGoals);
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalDescription, setNewGoalDescription] = useState('');
  const [newGoalCategory, setNewGoalCategory] = useState<WeeklyGoal['category']>(
    'work',
  );

  const weekLabel = useMemo(
    () => `${format(selectedWeek, 'MMM d')} – ${format(selectedWeek, 'd, yyyy')}`,
    [selectedWeek],
  );

  const handleAddGoal = () => {
    const trimmedTitle = newGoalTitle.trim();
    if (!trimmedTitle) return;

    setGoals((prev) => [
      {
        id: `goal-${Date.now()}`,
        title: trimmedTitle,
        description: newGoalDescription.trim(),
        status: 'planned',
        category: newGoalCategory,
        createdAt: new Date(),
      },
      ...prev,
    ]);

    setNewGoalTitle('');
    setNewGoalDescription('');
    setNewGoalCategory('work');
  };

  const handleCycleStatus = (id: string) => {
    setGoals((prev) =>
      prev.map((goal) =>
        goal.id === id
          ? {
              ...goal,
              status: statusConfig[goal.status].next,
            }
          : goal,
      ),
    );
  };

  const handleResetStatus = (id: string) => {
    setGoals((prev) =>
      prev.map((goal) =>
        goal.id === id
          ? {
              ...goal,
              status: 'planned',
            }
          : goal,
      ),
    );
  };

  const handleRemoveGoal = (id: string) => {
    setGoals((prev) => prev.filter((goal) => goal.id !== id));
  };

  return (
    <div className="min-h-screen w-full pb-28">
      <div className="mx-auto w-full max-w-5xl px-4 pb-8 pt-4 sm:px-6 lg:px-8">
        <Card className="border border-white/10 bg-gradient-to-br from-slate-950 via-slate-900/80 to-slate-950 shadow-2xl shadow-indigo-500/10">
          <CardHeader className="space-y-4">
            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
              <div className="space-y-2">
                <Badge className="w-fit bg-indigo-500/20 text-indigo-100" variant="secondary">
                  Weekly Goals
                </Badge>
                <CardTitle className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                  Focus for {weekLabel}
                </CardTitle>
                <p className="max-w-2xl text-sm text-slate-300/80">
                  Declare the outcomes that actually matter this week. These goals sync
                  with your daily execution plan and weekly checkout reflection.
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/70 shadow-inner">
                <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-white/60">
                  <Target className="h-4 w-4" />
                  Weekly Cadence
                </p>
                <ul className="mt-3 space-y-2">
                  <li>• Set goals on Monday morning (or Sunday evening).</li>
                  <li>• Review progress during the week.</li>
                  <li>• Close the loop in the Weekly Checkout page.</li>
                </ul>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.25em] text-slate-200">
                <Plus className="h-4 w-4" />
                Add a Weekly Goal
              </h3>
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                <Input
                  placeholder="Goal title (e.g. Ship client sprint)"
                  value={newGoalTitle}
                  onChange={(event) => setNewGoalTitle(event.target.value)}
                  className="md:col-span-2 bg-slate-900/60 border-white/10 text-white placeholder:text-slate-500"
                />
                <select
                  value={newGoalCategory}
                  onChange={(event) =>
                    setNewGoalCategory(event.target.value as WeeklyGoal['category'])
                  }
                  className="rounded-lg border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-300/40"
                >
                  <option value="work">Work</option>
                  <option value="health">Health</option>
                  <option value="life">Life</option>
                </select>
              </div>
              <Textarea
                placeholder="Why this matters / key milestones…"
                value={newGoalDescription}
                onChange={(event) => setNewGoalDescription(event.target.value)}
                className="mt-3 bg-slate-900/60 border-white/10 text-white placeholder:text-slate-500"
              />
              <div className="mt-4 flex justify-end">
                <Button
                  onClick={handleAddGoal}
                  className="bg-indigo-500 text-white hover:bg-indigo-500/80"
                >
                  Add Goal
                </Button>
              </div>
            </section>

            <Separator className="bg-white/10" />

            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-300">
                  Active Goals
                </h3>
                <Badge className="bg-white/10 text-xs text-slate-200">
                  {goals.length} goals tracked
                </Badge>
              </div>

              {goals.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/20 bg-white/5 p-8 text-center text-sm text-slate-300/80">
                  No goals logged for this week yet. Add your focus areas above to keep them
                  front and center.
                </div>
              ) : (
                <div className="grid gap-4">
                  {goals.map((goal) => {
                    const statusMeta = statusConfig[goal.status];
                    const categoryMeta = categoryConfig[goal.category];

                    return (
                      <Card
                        key={goal.id}
                        className={cn(
                          'border border-white/10 bg-slate-900/60 backdrop-blur',
                          goal.status === 'completed' && 'border-emerald-500/30 bg-emerald-500/5',
                        )}
                      >
                        <CardHeader className="space-y-3 pb-3">
                          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                            <CardTitle className="text-xl font-semibold text-white">
                              {goal.title}
                            </CardTitle>
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge className={categoryMeta.badgeClass}>
                                {categoryMeta.label}
                              </Badge>
                              <Badge className={statusMeta.badgeClass}>
                                {statusMeta.label}
                              </Badge>
                            </div>
                          </div>
                          {goal.description && (
                            <p className="text-sm text-slate-300/80">{goal.description}</p>
                          )}
                        </CardHeader>

                        <CardContent className="pt-0">
                          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                            <span className="uppercase tracking-[0.18em]">
                              Logged {format(goal.createdAt, 'MMM d, yyyy')}
                            </span>
                            {goal.status === 'completed' && (
                              <span className="flex items-center gap-1 text-emerald-200">
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                Locked In
                              </span>
                            )}
                          </div>
                        </CardContent>

                        <CardFooter className="flex flex-wrap items-center justify-end gap-2 border-t border-white/5 bg-black/20 px-6 py-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-slate-200 hover:bg-white/10"
                            onClick={() => handleCycleStatus(goal.id)}
                          >
                            Advance Status
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-slate-400 hover:bg-white/10"
                            onClick={() => handleResetStatus(goal.id)}
                          >
                            <RotateCcw className="mr-2 h-3.5 w-3.5" />
                            Reset
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-rose-300 hover:bg-rose-500/20"
                            onClick={() => handleRemoveGoal(goal.id)}
                          >
                            <Trash2 className="mr-2 h-3.5 w-3.5" />
                            Remove
                          </Button>
                        </CardFooter>
                      </Card>
                    );
                  })}
                </div>
              )}
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
