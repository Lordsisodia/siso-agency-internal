import React, { useState } from 'react';
import {
  ArrowUpRight,
  CheckCircle2,
  Lightbulb,
  RotateCcw,
  Trophy,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  PenSquare,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Chip } from '@/components/ui/chip';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import type { InsightsData } from '../_shared/types';

interface WeeklyCheckoutSectionProps {
  insightsData: InsightsData;
}

const InsightList: React.FC<{
  title: string;
  icon: React.ReactNode;
  tone: 'positive' | 'negative';
  items: string[];
}> = ({ title, icon, tone, items }) => {
  const toneClasses =
    tone === 'positive'
      ? 'border-emerald-400/30 bg-emerald-500/10 text-emerald-100'
      : 'border-rose-400/30 bg-rose-500/10 text-rose-100';

  return (
    <div className={cn('rounded-2xl border p-4 sm:p-5', toneClasses)}>
      <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.25em]">
        {icon}
        {title}
      </p>
      <ul className="mt-3 space-y-2 text-sm text-white/80">
        {items.length === 0 && <li>No notes captured yet.</li>}
        {items.map((item, idx) => (
          <li key={`${title}-${idx}`} className="flex gap-2">
            <span>•</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

const TrendCard: React.FC<{
  metric: string;
  direction: 'up' | 'down' | 'stable';
  change: number;
}> = ({ metric, direction, change }) => {
  const isUp = direction === 'up';
  const isDown = direction === 'down';
  const toneClass = isUp
    ? 'border-emerald-400/40 bg-emerald-500/10 text-emerald-100'
    : isDown
      ? 'border-rose-400/40 bg-rose-500/10 text-rose-100'
      : 'border-white/10 bg-white/5 text-white/70';
  const Icon =
    direction === 'up' ? TrendingUp : direction === 'down' ? TrendingDown : ArrowUpRight;

  return (
    <div className={cn('rounded-2xl border p-4 backdrop-blur-sm', toneClass)}>
      <div className="flex items-center justify-between text-xs uppercase tracking-[0.18em]">
        <span>{metric}</span>
        <Icon className="h-4 w-4" />
      </div>
      <div className="mt-3 text-3xl font-semibold">
        {change > 0 && direction !== 'down' ? '+' : ''}
        {change}%
      </div>
      <p className="mt-1 text-xs text-white/60">vs last week</p>
    </div>
  );
};

export const WeeklyCheckoutSection: React.FC<WeeklyCheckoutSectionProps> = ({
  insightsData,
}) => {
  const { wins, problems, trends, checkout } = insightsData;

  const [reflection, setReflection] = useState(checkout.reflection);
  const [nextWeekFocus, setNextWeekFocus] = useState(checkout.nextWeekFocus);

  const positiveTrends = trends.filter((trend) => trend.direction === 'up');
  const negativeTrends = trends.filter((trend) => trend.direction === 'down');

  return (
    <div className="relative min-h-screen pb-28">
      <div className="mx-auto w-full max-w-5xl px-4 pb-8 pt-4 sm:px-6 lg:px-8">
        <Card className="border border-white/10 bg-gradient-to-br from-slate-950 via-slate-900/80 to-slate-950 shadow-2xl shadow-emerald-500/10">
          <CardHeader className="space-y-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-2">
                <Badge className="w-fit bg-emerald-500/20 text-emerald-100" variant="secondary">
                  Weekly Review
                </Badge>
                <CardTitle className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                  Lock in learnings before the next cycle
                </CardTitle>
                <p className="max-w-xl text-sm text-slate-300/80">
                  Capture the truth—what crushed, what collapsed, and how next week
                  improves. This review feeds straight into weekly planning.
                </p>
              </div>
              <Chip className="border border-white/15 bg-white/10 text-xs uppercase tracking-[0.18em] text-white/70">
                Takes 5 minutes. Do not skip.
              </Chip>
            </div>
          </CardHeader>

          <CardContent className="space-y-8">
            <section className="grid gap-4 lg:grid-cols-2">
              <InsightList
                title="Wins"
                icon={<Trophy className="h-4 w-4" />}
                tone="positive"
                items={wins}
              />
              <InsightList
                title="Breakdowns"
                icon={<AlertTriangle className="h-4 w-4" />}
                tone="negative"
                items={problems}
              />
            </section>

            <Separator className="bg-white/10" />

            <section className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-300">
                  Week-over-week trends
                </h3>
                <div className="flex flex-wrap gap-2">
                  <Chip className="border border-emerald-400/30 bg-emerald-500/10 text-xs uppercase tracking-[0.18em] text-emerald-100">
                    {positiveTrends.length} better
                  </Chip>
                  <Chip className="border border-rose-400/30 bg-rose-500/10 text-xs uppercase tracking-[0.18em] text-rose-100">
                    {negativeTrends.length} worse
                  </Chip>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {trends.map((trend) => (
                  <TrendCard
                    key={trend.metric}
                    metric={trend.metric}
                    direction={trend.direction}
                    change={trend.change}
                  />
                ))}
              </div>
            </section>

            <Separator className="bg-white/10" />

            <section className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-white/60">
                  <Lightbulb className="h-4 w-4" />
                  Reflection
                </div>
                <Textarea
                  value={reflection}
                  onChange={(event) => setReflection(event.target.value)}
                  placeholder="What did I learn? Where did I break down? What systems held?"
                  className="mt-3 min-h-[140px] bg-black/30 text-white placeholder:text-white/40"
                />
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-white/60">
                  <PenSquare className="h-4 w-4" />
                  Next week focus
                </div>
                <Textarea
                  value={nextWeekFocus}
                  onChange={(event) => setNextWeekFocus(event.target.value)}
                  placeholder="Define the non-negotiables, targets, and safeguard actions for next week."
                  className="mt-3 min-h-[140px] bg-black/30 text-white placeholder:text-white/40"
                />
              </div>
            </section>
          </CardContent>

          <CardFooter className="flex flex-col gap-3 border-t border-white/10 bg-black/40 px-6 py-5 text-sm text-slate-300/80 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-4 w-4 text-emerald-200" />
              <span>
                Drop these insights into the Goals tab before Monday so execution lines up
                with what you learned.
              </span>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" className="text-white/70 hover:bg-white/10">
                <RotateCcw className="mr-2 h-4 w-4" />
                Reset Fields
              </Button>
              <Button size="sm" className="bg-emerald-500 text-white hover:bg-emerald-500/80">
                Save Weekly Checkout
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};
