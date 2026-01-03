import React, { useEffect, useMemo, useRef, useState } from 'react';
import useSWR from 'swr';
import { format, formatDistanceToNow, isToday } from 'date-fns';
import { Droplet, Droplets, Flame, Minus, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { waterService } from '@/services/database/waterService';
import type { WaterTrackerSnapshot } from '@/domains/lifelock/1-daily/5-wellness/domain/types';

interface WaterTrackerProps {
  selectedDate: Date;
  userId?: string;
}

const WATER_ACTION_AMOUNTS = [250, 100, -100, -250];

const fetchSnapshot = (userId: string, dateKey: string) =>
  waterService.getTrackerSnapshot(userId, dateKey);

export const WaterTracker: React.FC<WaterTrackerProps> = ({ selectedDate, userId }) => {
  const dateKey = useMemo(() => format(selectedDate, 'yyyy-MM-dd'), [selectedDate]);
  const isSelectedDateToday = isToday(selectedDate);

  const localStorageKey = useMemo(() => `lifelock-water-${dateKey}`, [dateKey]);

  const defaultSnapshot: WaterTrackerSnapshot = {
    goalMl: 2000,
    dailyTotalMl: 0,
    percentage: 0,
    lastLogAt: null,
    streakCount: 0,
    entries: [],
    historyTotals: {},
  };

  const { data, error, isLoading, mutate, isValidating } = useSWR<WaterTrackerSnapshot>(
    userId ? ['water-tracker', userId, dateKey] : null,
    () => fetchSnapshot(userId!, dateKey),
    {
      revalidateOnFocus: true,
      keepPreviousData: true,
    }
  );

  const [actionError, setActionError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const lastRefreshKey = useRef(dateKey);
  const [localSnapshot, setLocalSnapshot] = useState<WaterTrackerSnapshot | null>(null);

  useEffect(() => {
    if (userId) return;
    try {
      const stored = localStorage.getItem(localStorageKey);
      if (stored) {
        setLocalSnapshot(JSON.parse(stored));
      }
    } catch (storageError) {
      console.warn('[WaterTracker] Unable to read local snapshot', storageError);
    }
  }, [localStorageKey, userId]);

  useEffect(() => {
    lastRefreshKey.current = dateKey;
  }, [dateKey]);

  useEffect(() => {
    if (!isSelectedDateToday) {
      return;
    }

    const interval = setInterval(() => {
      const next = new Date();
      const nextKey = format(next, 'yyyy-MM-dd');

      if (nextKey !== lastRefreshKey.current) {
        lastRefreshKey.current = nextKey;
        mutate();
      }
    }, 60_000);

    return () => clearInterval(interval);
  }, [isSelectedDateToday, mutate]);

  const handleAmountChange = async (amount: number) => {
    if (isSubmitting) return;

    const current = (userId ? data : localSnapshot) ?? defaultSnapshot;
    const currentTotal = current.dailyTotalMl ?? 0;
    const targetTotal = Math.max(0, currentTotal + amount);
    const delta = targetTotal - currentTotal;

    if (delta === 0) {
      return;
    }

    // Local-only mode fallback
    if (!userId) {
        const timestamp = new Date().toISOString();
        const nextSnapshot: WaterTrackerSnapshot = {
          goalMl: current.goalMl ?? 2000,
          dailyTotalMl: targetTotal,
          percentage: Math.min(100, Math.round((targetTotal / (current.goalMl ?? 2000)) * 100)),
          lastLogAt: timestamp,
          streakCount: current.streakCount ?? 0,
          entries: [
            ...(current.entries ?? []),
            {
              id: `local-${timestamp}`,
              date: dateKey,
              amountMl: delta,
              timestamp,
            }
          ],
          historyTotals: current.historyTotals ?? {}
        };

      setLocalSnapshot(nextSnapshot);
      localStorage.setItem(localStorageKey, JSON.stringify(nextSnapshot));
      return;
    }

    try {
      setActionError(null);
      setIsSubmitting(true);
      const timestamp = new Date().toISOString();
      const optimisticSnapshot: WaterTrackerSnapshot = {
        ...current,
        dailyTotalMl: targetTotal,
        percentage: Math.min(100, Math.round((targetTotal / (current.goalMl ?? 2000)) * 100)),
        lastLogAt: timestamp,
        entries: [
          ...(current.entries ?? []),
          {
            id: `optimistic-${timestamp}`,
            date: dateKey,
            amountMl: delta,
            timestamp,
          }
        ],
      };

      await mutate(
        async () => {
          await waterService.logWaterIntake(userId!, delta, dateKey);
          return await fetchSnapshot(userId!, dateKey);
        },
        {
          optimisticData: optimisticSnapshot,
          rollbackOnError: true,
          populateCache: true,
          revalidate: true,
        }
      );
    } catch (mutationError) {
      console.error('[WaterTracker] Failed to log water intake', mutationError);
      setActionError('Unable to update water intake. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const displaySnapshot = (userId ? data : localSnapshot) ?? defaultSnapshot;

  const progressLabel = `${displaySnapshot.dailyTotalMl}ml / ${displaySnapshot.goalMl}ml - ${displaySnapshot.percentage}%`;

  const lastDrinkLabel = displaySnapshot.lastLogAt
    ? formatDistanceToNow(new Date(displaySnapshot.lastLogAt), { addSuffix: true })
        .replace('about ', '')
    : 'No drinks logged';

  const lastDrinkDisplay = displaySnapshot.lastLogAt
    ? isSelectedDateToday
      ? `Last drink ${lastDrinkLabel}`
      : `Last drink ${format(new Date(displaySnapshot.lastLogAt), 'MMM d, h:mm a')}`
    : 'No drinks logged yet';

  const bottleFill = Math.min(100, displaySnapshot.percentage);

  return (
    <Card className="bg-gradient-to-br from-slate-950/60 via-slate-900/60 to-slate-950/60 border border-cyan-500/40 shadow-xl">
      <CardHeader className="flex flex-col gap-3 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-cyan-200">
            <Droplets className="h-5 w-5" />
            <CardTitle className="text-lg font-semibold text-cyan-100">Water Tracker</CardTitle>
          </div>
          <div className="flex items-center gap-2 text-sm text-cyan-200/80">
            <Flame className="h-4 w-4 text-orange-300" />
            <span>{displaySnapshot.streakCount} day streak</span>
          </div>
        </div>

        <div className="space-y-2">
          {isLoading ? (
            <Skeleton className="h-3 w-full bg-cyan-500/20" />
          ) : (
            <Progress value={displaySnapshot.percentage} className="h-2 bg-cyan-500/15" />
          )}
          <div className="flex items-center justify-between text-sm">
            <span className="text-cyan-100 font-medium">{progressLabel}</span>
            <span className="text-cyan-200/80">{lastDrinkDisplay}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="flex items-center gap-6">
          <div className="relative h-32 w-20 rounded-b-[60%] rounded-t-[20%] border border-cyan-400/60 bg-slate-950/50 shadow-inner overflow-hidden">
            <div
              className={cn(
                'absolute inset-x-0 bottom-0 bg-gradient-to-t from-cyan-500/70 via-cyan-400/70 to-cyan-300/60 transition-all duration-700 ease-out',
                'backdrop-blur-[2px]'
              )}
              style={{ height: `${bottleFill}%` }}
            />
            <Droplet className="absolute inset-0 m-auto h-8 w-8 text-cyan-200/40" />
          </div>

          <div className="flex-1 space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {WATER_ACTION_AMOUNTS.map(amount => {
                const isPositive = amount > 0;
                const label = `${isPositive ? '+' : ''}${amount}ml`;
                const Icon = isPositive ? Plus : Minus;

                return (
                  <Button
                    key={amount}
                    type="button"
                    variant={isPositive ? 'default' : 'secondary'}
                    className={cn(
                      'h-12 rounded-xl border border-cyan-500/30 backdrop-blur-lg transition-all duration-300',
                      isPositive
                        ? 'bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-100'
                        : 'bg-slate-900/60 hover:bg-slate-900/80 text-cyan-200'
                    )}
                    disabled={isSubmitting}
                    onClick={() => handleAmountChange(amount)}
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    {label}
                  </Button>
                );
              })}
            </div>

            <div className="rounded-xl border border-cyan-500/20 bg-slate-950/40 p-4 text-sm text-cyan-100/90">
              <p className="font-medium text-cyan-100">Daily Hydration Goal</p>
              <p className="text-cyan-200/80">Stay on pace to hit {displaySnapshot.goalMl}ml today.</p>
              {isValidating && (
                <p className="mt-2 text-xs text-cyan-300/70">Syncing latest intake...</p>
              )}
            </div>

            {actionError && (
              <div className="rounded-lg border border-orange-400/40 bg-orange-500/10 px-3 py-2 text-xs text-orange-200">
                {actionError}
              </div>
            )}

            {error && (
              <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-200">
                Unable to load water tracker. Pull to refresh or try again later.
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
