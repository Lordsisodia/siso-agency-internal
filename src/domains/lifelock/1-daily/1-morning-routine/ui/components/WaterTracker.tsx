import React, { useEffect, useMemo, useState } from 'react';
import useSWR from 'swr';
import { format, subDays } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Minus, Plus } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { waterService } from '@/services/database/waterService';
import type { WaterTrackerSnapshot } from '@/domains/lifelock/1-daily/5-wellness/domain/types';

interface WaterTrackerProps {
  selectedDate: Date;
  userId?: string | null;
  onSnapshotChange?: (snapshot: WaterTrackerSnapshot) => void;
}

const AMOUNTS = [100, -100];

const defaultSnapshot: WaterTrackerSnapshot = {
  goalMl: 2000,
  dailyTotalMl: 0,
  percentage: 0,
  lastLogAt: null,
  streakCount: 0,
  entries: [],
  historyTotals: {},
};

export const WaterTracker: React.FC<WaterTrackerProps> = ({ selectedDate, userId, onSnapshotChange }) => {
  const dateKey = useMemo(() => format(selectedDate, 'yyyy-MM-dd'), [selectedDate]);

  const { data, mutate, isLoading } = useSWR<WaterTrackerSnapshot>(
    userId ? ['water-inline', userId, dateKey] : null,
    () => waterService.getTrackerSnapshot(userId!, dateKey),
    { keepPreviousData: true }
  );

  const snapshot = data ?? defaultSnapshot;

  useEffect(() => {
    if (onSnapshotChange && data) {
      onSnapshotChange(data);
    }
  }, [data, onSnapshotChange]);

  const handleChange = async (amount: number) => {
    if (!userId || amount === 0) return;

    const current = data ?? defaultSnapshot;
    const nextTotal = Math.max(0, current.dailyTotalMl + amount);
    const delta = nextTotal - current.dailyTotalMl;

    if (delta === 0) return;

    const optimistic: WaterTrackerSnapshot = {
      ...current,
      dailyTotalMl: nextTotal,
      percentage: current.goalMl > 0 ? Math.min(100, Math.round((nextTotal / current.goalMl) * 100)) : 0,
      lastLogAt: new Date().toISOString(),
      entries: [
        ...current.entries,
        {
          id: `optimistic-${Date.now()}`,
          date: dateKey,
          amountMl: delta,
          timestamp: new Date().toISOString(),
        },
      ],
    };

    await mutate(
      async () => {
        await waterService.logWaterIntake(userId, delta, dateKey);
        return await waterService.getTrackerSnapshot(userId, dateKey);
      },
      { optimisticData: optimistic, rollbackOnError: true, revalidate: true, populateCache: true }
    );
  };

  const weeklyBars = useMemo(() => {
    const list: { label: string; total: number }[] = [];
    const base = selectedDate;
    for (let i = 6; i >= 0; i--) {
      const day = subDays(base, i);
      const key = format(day, 'yyyy-MM-dd');
      list.push({ label: format(day, 'EEE'), total: snapshot.historyTotals[key] ?? 0 });
    }
    return list;
  }, [selectedDate, snapshot.historyTotals]);

  return (
    <div className="mt-2 mb-4 rounded-lg border border-yellow-700/40 bg-yellow-950/25 p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm text-yellow-200 font-semibold">Water</div>
        <div className="text-xs text-yellow-300/70">
          {snapshot.dailyTotalMl} / {snapshot.goalMl} ml
        </div>
      </div>

      {isLoading ? (
        <Skeleton className="h-2 w-full bg-yellow-700/30" />
      ) : (
        <Progress value={snapshot.percentage} className="h-2 bg-yellow-900/60" />
      )}

      <div className="mt-2 grid grid-cols-2 gap-2">
        {AMOUNTS.map((amt) => (
          <Button
            key={amt}
            variant="outline"
            size="sm"
            className="border-yellow-700 text-yellow-200 hover:bg-yellow-900/40"
            onClick={() => handleChange(amt)}
            disabled={!userId}
          >
            {amt > 0 ? <Plus className="mr-1 h-3 w-3" /> : <Minus className="mr-1 h-3 w-3" />}
            {amt > 0 ? `+${amt}ml` : `${amt}ml`}
          </Button>
        ))}
      </div>

      <div className="mt-3 text-[11px] text-yellow-300/70">Last 7 days</div>
      <div className="mt-1 grid grid-cols-7 gap-1">
        {weeklyBars.map((bar) => {
          const pct = snapshot.goalMl > 0 ? Math.min(100, Math.round((bar.total / snapshot.goalMl) * 100)) : 0;
          return (
            <div key={bar.label} className="flex flex-col items-center gap-1">
              <div className="h-10 w-full rounded-sm overflow-hidden border border-yellow-800/50 bg-yellow-950/60">
                <div
                  className="w-full bg-gradient-to-t from-yellow-500/70 to-amber-300/70"
                  style={{ height: `${pct}%` }}
                />
              </div>
              <span className="text-[9px] text-yellow-400/70">{bar.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
