import { useCallback, useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import { useClerkUser } from './useClerkUser';
import { useSupabaseUserId } from '@/shared/lib/supabase-clerk';
import {
  MorningRoutine,
  MorningRoutineMetadata,
  MorningRoutineItem,
  unifiedDataService,
} from '@/shared/services/unified-data.service';

interface UseMorningRoutineSupabaseOptions {
  selectedDate: Date;
}

interface UseMorningRoutineSupabaseReturn {
  routine: MorningRoutine | null;
  loading: boolean;
  saving: boolean;
  error: string | null;
  toggleHabit: (habitName: string, completed: boolean) => Promise<void>;
  updateMetadata: (metadata: Partial<MorningRoutineMetadata>) => Promise<void>;
  refresh: () => Promise<void>;
  metadata: MorningRoutineMetadata;
  items: MorningRoutineItem[];
}

export function useMorningRoutineSupabase(
  options: UseMorningRoutineSupabaseOptions
): UseMorningRoutineSupabaseReturn {
  const { selectedDate } = options;
  const { user, isSignedIn } = useClerkUser();
  const internalUserId = useSupabaseUserId(user?.id || null);

  const dateKey = useMemo(() => format(selectedDate, 'yyyy-MM-dd'), [selectedDate]);

  const [routine, setRoutine] = useState<MorningRoutine | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const buildEmptyRoutine = useCallback((): MorningRoutine => {
    const timestamp = new Date().toISOString();
    return {
      id: `morning-${internalUserId ?? 'unknown'}-${dateKey}`,
      userId: internalUserId ?? '',
      date: dateKey,
      routineType: 'morning',
      items: [],
      completedCount: 0,
      totalCount: 0,
      completionPercentage: 0,
      metadata: {},
      createdAt: timestamp,
      updatedAt: timestamp,
    };
  }, [dateKey, internalUserId]);

  const loadRoutine = useCallback(async () => {
    if (!isSignedIn || !internalUserId) {
      setRoutine(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const data = await unifiedDataService.getMorningRoutine(internalUserId, dateKey);
      if (data) {
        setRoutine(data);
      } else {
        setRoutine(null);
      }
      setError(null);
    } catch (err) {
      console.error('Failed to load morning routine:', err);
      setError(err instanceof Error ? err.message : 'Failed to load morning routine');
    } finally {
      setLoading(false);
    }
  }, [dateKey, internalUserId, isSignedIn]);

  useEffect(() => {
    loadRoutine();
  }, [loadRoutine]);

  const toggleHabit = useCallback(
    async (habitName: string, completed: boolean) => {
      if (!internalUserId) return;

      setSaving(true);
      setRoutine(prev => {
        const base: MorningRoutine = prev ?? buildEmptyRoutine();

        const items = Array.isArray(base.items) ? [...base.items] : [];
        const index = items.findIndex(item => item.name === habitName);
        if (index >= 0) {
          items[index] = { ...items[index], completed };
        } else {
          items.push({ name: habitName, completed });
        }

        const completedCount = items.filter(item => item.completed).length;
        const totalCount = items.length;
        const completionPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

        return {
          ...base,
          items,
          completedCount,
          totalCount,
          completionPercentage,
          updatedAt: new Date().toISOString(),
        };
      });

      try {
        const updated = await unifiedDataService.toggleMorningRoutineHabit(
          internalUserId,
          dateKey,
          habitName,
          completed
        );
        if (updated) {
          setRoutine(updated);
        }
      } catch (err) {
        console.error('Failed to toggle morning routine habit:', err);
        setError(err instanceof Error ? err.message : 'Failed to update habit');
      } finally {
        setSaving(false);
      }
    },
    [buildEmptyRoutine, dateKey, internalUserId]
  );

  const updateMetadata = useCallback(
    async (metadata: Partial<MorningRoutineMetadata>) => {
      if (!internalUserId) return;

      setSaving(true);
      setRoutine(prev => {
        const base = prev ?? buildEmptyRoutine();
        return {
          ...base,
          metadata: { ...base.metadata, ...metadata },
          updatedAt: new Date().toISOString(),
        };
      });

      try {
        const updated = await unifiedDataService.updateMorningRoutineMetadata(
          internalUserId,
          dateKey,
          metadata
        );
        if (updated) {
          setRoutine(updated);
        }
      } catch (err) {
        console.error('Failed to update morning routine metadata:', err);
        setError(err instanceof Error ? err.message : 'Failed to update metadata');
      } finally {
        setSaving(false);
      }
    },
    [buildEmptyRoutine, dateKey, internalUserId]
  );

  const metadata = routine?.metadata ?? {};
  const items = Array.isArray(routine?.items) ? routine!.items : [];

  return {
    routine,
    loading,
    saving,
    error,
    toggleHabit,
    updateMetadata,
    refresh: loadRoutine,
    metadata,
    items,
  };
}
