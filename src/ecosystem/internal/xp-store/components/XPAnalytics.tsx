/**
 * XP Analytics Component
 * Highlights recent XP momentum and habits using Supabase daily stats
 */

import type { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Progress } from '@/shared/ui/progress';
import {
  TrendingUp,
  TrendingDown,
  Clock,
  Calendar,
  Award,
  Activity,
} from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { useXPStoreContext } from '@/ecosystem/internal/xp-store/context/XPStoreContext';

interface XPAnalyticsProps {
  className?: string;
}

type DailyXPStat = {
  date: string;
  total_xp: number;
  activities_completed: number;
  streak_count: number;
};

const formatDate = (value: string) => {
  try {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
    }).format(new Date(value));
  } catch {
    return value;
  }
};

export const XPAnalytics = ({ className }: XPAnalyticsProps) => {
  const { analytics, balance } = useXPStoreContext();
  const stats: DailyXPStat[] = Array.isArray(analytics) ? analytics : [];

  if (!stats.length) {
    return (
      <Card className={cn('border-dashed border-siso-border/60 bg-siso-bg-alt/40', className)}>
        <CardContent className="py-12 text-center space-y-3">
          <Calendar className="h-6 w-6 text-siso-text-muted mx-auto" />
          <h3 className="text-lg font-semibold text-siso-text-bold">XP analytics coming online</h3>
          <p className="text-siso-text-muted text-sm">
            We’ll highlight your streak, weekly gains, and momentum once the first week of XP data is synced.
          </p>
        </CardContent>
      </Card>
    );
  }

  const weeklyStats = stats.slice(0, 7);
  const previousWeekStats = stats.slice(7, 14);

  const sumReducer = (acc: number, current: DailyXPStat) => acc + (current.total_xp || 0);
  const sumActivities = (acc: number, current: DailyXPStat) => acc + (current.activities_completed || 0);

  const totalWeeklyXP = weeklyStats.reduce(sumReducer, 0);
  const previousWeeklyXP = previousWeekStats.reduce(sumReducer, 0);
  const weeklyTrend = previousWeeklyXP > 0
    ? ((totalWeeklyXP - previousWeeklyXP) / previousWeeklyXP) * 100
    : totalWeeklyXP > 0 ? 100 : 0;

  const averageDailyXP = weeklyStats.length ? Math.round(totalWeeklyXP / weeklyStats.length) : 0;
  const averageActivities = weeklyStats.length ? (weeklyStats.reduce(sumActivities, 0) / weeklyStats.length) : 0;
  const currentStreak = weeklyStats[0]?.streak_count ?? 0;

  const bestDay = weeklyStats.reduce((best, stat) => {
    if (!best || stat.total_xp > best.total_xp) {
      return stat;
    }
    return best;
  }, weeklyStats[0]);

  const maxXPInWindow = weeklyStats.reduce((max, stat) => Math.max(max, stat.total_xp || 0), 0) || 1;
  const fiveDayWindow = stats.slice(0, 5);

  return (
    <div className={cn('space-y-6', className)}>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <SummaryCard
          title="Weekly XP"
          value={`${totalWeeklyXP.toLocaleString()} XP`}
          caption="Total earned in the last 7 days"
          trend={weeklyTrend}
        />

        <SummaryCard
          title="Avg. Daily XP"
          value={`${averageDailyXP.toLocaleString()} XP`}
          caption="Momentum averaged over the last week"
        />

        <SummaryCard
          title="Avg. Sessions"
          value={averageActivities.toFixed(1)}
          caption="Completed activities per day"
          icon={<Activity className="h-4 w-4 text-siso-text-muted" />}
        />

        <SummaryCard
          title="Active Streak"
          value={`${currentStreak} days`}
          caption={balance?.currentXP ? `${balance.currentXP.toLocaleString()} XP banked overall` : 'Streak updates with every sync'}
          icon={<Award className="h-4 w-4 text-siso-text-muted" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 border-siso-border bg-siso-bg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-siso-text-bold">Recent Daily XP</CardTitle>
            <Badge variant="outline" className="text-siso-text-muted border-siso-border">
              Last {fiveDayWindow.length} days
            </Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            {fiveDayWindow.map((day) => {
              const percentage = Math.round(((day.total_xp || 0) / maxXPInWindow) * 100);
              return (
                <div key={day.date} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-siso-text">{formatDate(day.date)}</span>
                    <span className="text-siso-text-muted">{day.total_xp.toLocaleString()} XP</span>
                  </div>
                  <Progress value={percentage} className="h-2 bg-siso-bg-alt" />
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card className="border-siso-border bg-siso-bg">
          <CardHeader className="pb-3">
            <CardTitle className="text-siso-text-bold flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Best Day Snapshot
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border border-siso-border/60 bg-siso-bg-alt p-4">
              <div className="text-sm text-siso-text-muted uppercase tracking-wide">{formatDate(bestDay?.date || stats[0].date)}</div>
              <div className="mt-2 text-3xl font-semibold text-siso-text">
                {(bestDay?.total_xp || 0).toLocaleString()} XP
              </div>
              <div className="mt-1 text-xs text-siso-text-muted">
                {(bestDay?.activities_completed || 0)} activities completed · streak {bestDay?.streak_count || 0}
              </div>
            </div>

            <div className="space-y-3 text-sm text-siso-text-muted">
              <div>
                Keep the streak alive by matching at least {averageDailyXP.toLocaleString()} XP tomorrow.
              </div>
              {weeklyTrend !== 0 && (
                <div className="flex items-center gap-2">
                  {weeklyTrend > 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-400" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-400" />
                  )}
                  <span>
                    Weekly momentum {weeklyTrend > 0 ? 'up' : 'down'} {Math.abs(weeklyTrend).toFixed(1)}%
                  </span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-siso-text-muted" />
                <span>New syncs appear automatically after each day closes.</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

interface SummaryCardProps {
  title: string;
  value: string;
  caption: string;
  trend?: number;
  icon?: ReactNode;
}

const SummaryCard = ({ title, value, caption, trend, icon }: SummaryCardProps) => {
  const showTrend = typeof trend === 'number' && trend !== 0;

  return (
    <Card className="border-siso-border bg-siso-bg">
      <CardContent className="p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-wide text-siso-text-muted">{title}</div>
            <div className="mt-2 text-2xl font-semibold text-siso-text">{value}</div>
          </div>
          {icon && (
            <div className="h-10 w-10 rounded-full bg-siso-bg-alt flex items-center justify-center">
              {icon}
            </div>
          )}
        </div>
        <div className="text-xs text-siso-text-muted flex items-center gap-2">
          <span>{caption}</span>
          {showTrend && (
            <Badge
              variant="outline"
              className={cn(
                'px-2 py-0.5 text-xs',
                trend! > 0 ? 'border-green-500/40 text-green-400' : 'border-red-500/40 text-red-400'
              )}
            >
              {trend! > 0 ? '+' : '-'}{Math.abs(trend!).toFixed(1)}%
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
