import { useCallback, useEffect, useMemo, useState } from 'react';
import { validate as uuidValidate } from 'uuid';
import { useClerkUser } from './useClerkUser';
import { useSupabaseClient, useSupabaseUserId } from '@/shared/lib/supabase-clerk';
import { syncService } from '@/shared/offline/syncService';
import { offlineDb } from '@/shared/offline/offlineDb';
import { TABLES } from '@/shared/lib/supabase';

export interface MorningRoutineHabit {
  name: string;
  completed: boolean;
}

export interface MorningRoutineMetadata {
  wakeUpTime?: string;
  waterAmount?: number;
  meditationDuration?: string;
  pushupReps?: number;
  dailyPriorities?: string[];
  isPlanDayComplete?: boolean;
}

export interface MorningRoutineState {
  id: string;
  userId: string;
  date: string;
  items: MorningRoutineHabit[];
  completedCount: number;
  totalCount: number;
  completionPercentage: number;
  metadata: MorningRoutineMetadata;
  createdAt: string;
  updatedAt: string;
}

const DEFAULT_ITEMS: MorningRoutineHabit[] = [
  { name: 'wakeUp', completed: false },
  { name: 'freshenUp', completed: false },
  { name: 'getBloodFlowing', completed: false },
  { name: 'powerUpBrain', completed: false },
  { name: 'planDay', completed: false },
  { name: 'meditation', completed: false },
];

const DEFAULT_METADATA: MorningRoutineMetadata = {
  wakeUpTime: '',
  waterAmount: 0,
  meditationDuration: '',
  pushupReps: 0,
  dailyPriorities: ['', '', ''],
  isPlanDayComplete: false,
};

const isValidUuid = (value: string | null | undefined): value is string => {
  return typeof value === 'string' && uuidValidate(value);
};

interface UseMorningRoutineSupabaseResult {
  routine: MorningRoutineState | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  toggleHabit: (habitName: string, completed: boolean) => Promise<void>;
  updateMetadata: (metadata: Partial<MorningRoutineMetadata>) => Promise<void>;
}

export function useMorningRoutineSupabase(selectedDate: Date): UseMorningRoutineSupabaseResult {
  const { user, isSignedIn } = useClerkUser();
  const supabaseClient = useSupabaseClient();
  const internalUserId = useSupabaseUserId(user?.id || null);

  const [routine, setRoutine] = useState<MorningRoutineState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const dateKey = useMemo(() => selectedDate.toISOString().split('T')[0], [selectedDate]);

  const ensureRoutineShape = useCallback(
    (
      payload: Partial<MorningRoutineState> & {
        id?: string;
        user_id?: string;
        date?: string;
        items?: MorningRoutineHabit[];
        metadata?: MorningRoutineMetadata | null;
        created_at?: string;
        updated_at?: string;
        completed_count?: number;
        total_count?: number;
        completion_percentage?: number;
      },
    ): MorningRoutineState => {
      const items = payload.items ?? DEFAULT_ITEMS.map(item => ({ ...item }));
      const completedCount = payload.completed_count ?? items.filter(item => item.completed).length;
      const totalCount = payload.total_count ?? items.length;
      const completionPercentage = payload.completion_percentage ?? (totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0);

      return {
        id: payload.id ?? `morning-${internalUserId}-${dateKey}`,
        userId: payload.user_id ?? internalUserId ?? '',
        date: payload.date ?? dateKey,
        items,
        completedCount,
        totalCount,
        completionPercentage,
        metadata: {
          ...DEFAULT_METADATA,
          ...(payload.metadata ?? {}),
        },
        createdAt: payload.created_at ?? new Date().toISOString(),
        updatedAt: payload.updated_at ?? new Date().toISOString(),
      };
    },
    [internalUserId, dateKey],
  );

  const persistRoutineOffline = useCallback(
    async (state: MorningRoutineState, markForSync: boolean) => {
      await offlineDb.saveMorningRoutine(
        {
          id: state.id,
          user_id: state.userId,
          date: state.date,
          routine_type: 'morning',
          items: state.items,
          completed_count: state.completedCount,
          total_count: state.totalCount,
          completion_percentage: state.completionPercentage,
          metadata: state.metadata,
          created_at: state.createdAt,
          updated_at: state.updatedAt,
        },
        markForSync,
      );
    },
    [],
  );

  const syncToSupabase = useCallback(
    async (state: MorningRoutineState) => {
      if (!supabaseClient || !navigator.onLine) {
        return;
      }

      const basePayload = {
        user_id: state.userId,
        date: state.date,
        routine_type: 'morning',
        items: state.items,
        completed_count: state.completedCount,
        total_count: state.totalCount,
        completion_percentage: state.completionPercentage,
        metadata: state.metadata,
        created_at: state.createdAt,
        updated_at: state.updatedAt,
      };

      const payload = isValidUuid(state.id)
        ? { ...basePayload, id: state.id }
        : basePayload;

      const { error: upsertError } = await supabaseClient
        .from(TABLES.DAILY_ROUTINES ?? 'daily_routines')
        .upsert(payload, { onConflict: 'user_id,date,routine_type' });

      if (upsertError) {
        throw upsertError;
      }
    },
    [supabaseClient],
  );

  const loadRoutine = useCallback(async () => {
    if (!isSignedIn || !internalUserId) {
      setRoutine(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const cached = await offlineDb.getMorningRoutines(dateKey);
      const cachedRoutine = [...cached]
        .filter(r => r.routine_type === 'morning')
        .sort((a, b) => {
          const aValid = isValidUuid(a.id);
          const bValid = isValidUuid(b.id);

          if (aValid !== bValid) {
            return aValid ? -1 : 1;
          }

          const aUpdated = new Date(a.updated_at ?? a.created_at ?? 0).getTime();
          const bUpdated = new Date(b.updated_at ?? b.created_at ?? 0).getTime();

          return bUpdated - aUpdated;
        })[0];

      if (cachedRoutine) {
        setRoutine(
          ensureRoutineShape({
            id: cachedRoutine.id,
            user_id: cachedRoutine.user_id,
            date: cachedRoutine.date,
            items: cachedRoutine.items ?? [],
            metadata: (cachedRoutine as any).metadata ?? DEFAULT_METADATA,
            completed_count: cachedRoutine.completed_count ?? 0,
            total_count: cachedRoutine.total_count ?? (cachedRoutine.items?.length ?? DEFAULT_ITEMS.length),
            completion_percentage: cachedRoutine.completion_percentage ?? 0,
            created_at: cachedRoutine.created_at,
            updated_at: cachedRoutine.updated_at,
          }),
        );
        setLoading(false);
      }

      if (navigator.onLine && supabaseClient) {
        const { data, error: fetchError } = await supabaseClient
          .from(TABLES.DAILY_ROUTINES ?? 'daily_routines')
          .select('*')
          .eq('user_id', internalUserId)
          .eq('date', dateKey)
          .eq('routine_type', 'morning')
          .maybeSingle();

        if (fetchError) {
          console.warn('[MorningRoutine] Supabase fetch failed:', fetchError.message);
        } else if (data) {
          const shaped = ensureRoutineShape({
            id: data.id,
            user_id: data.user_id,
            date: data.date,
            items: data.items ?? [],
            metadata: data.metadata ?? DEFAULT_METADATA,
            completed_count: data.completed_count ?? 0,
            total_count: data.total_count ?? (data.items?.length ?? DEFAULT_ITEMS.length),
            completion_percentage: data.completion_percentage ?? 0,
            created_at: data.created_at,
            updated_at: data.updated_at,
          });

          setRoutine(shaped);
          await persistRoutineOffline(shaped, false);
        } else if (!cachedRoutine) {
          const shaped = ensureRoutineShape({ user_id: internalUserId, date: dateKey });
          setRoutine(shaped);
          await persistRoutineOffline(shaped, true);
        }
      } else if (!cachedRoutine) {
        const shaped = ensureRoutineShape({ user_id: internalUserId, date: dateKey });
        setRoutine(shaped);
        await persistRoutineOffline(shaped, true);
      }
    } catch (err) {
      console.error('[MorningRoutine] Failed to load routine:', err);
      setError(err instanceof Error ? err.message : 'Failed to load morning routine');
    } finally {
      setLoading(false);
    }
  }, [dateKey, ensureRoutineShape, internalUserId, isSignedIn, persistRoutineOffline, supabaseClient]);

  useEffect(() => {
    syncService.setActiveUser(internalUserId ?? null);
  }, [internalUserId]);

  useEffect(() => {
    void loadRoutine();
  }, [loadRoutine]);

  const toggleHabit = useCallback(
    async (habitName: string, completed: boolean) => {
      if (!routine || !internalUserId) return;

      const items = routine.items.map(item =>
        item.name === habitName ? { ...item, completed } : item,
      );

      const completedCount = items.filter(item => item.completed).length;
      const totalCount = items.length;
      const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

      const updated: MorningRoutineState = {
        ...routine,
        items,
        completedCount,
        totalCount,
        completionPercentage,
        updatedAt: new Date().toISOString(),
      };

      setRoutine(updated);
      await persistRoutineOffline(updated, true);

      try {
        await syncToSupabase(updated);
        await persistRoutineOffline({ ...updated, updatedAt: new Date().toISOString() }, false);
      } catch (syncError) {
        console.warn('[MorningRoutine] Failed to sync habit update:', syncError);
      }
    },
    [internalUserId, persistRoutineOffline, routine, syncToSupabase],
  );

  const updateMetadata = useCallback(
    async (metadata: Partial<MorningRoutineMetadata>) => {
      if (!routine) return;

      const updated: MorningRoutineState = {
        ...routine,
        metadata: {
          ...routine.metadata,
          ...metadata,
        },
        updatedAt: new Date().toISOString(),
      };

      setRoutine(updated);
      await persistRoutineOffline(updated, true);

      try {
        await syncToSupabase(updated);
        await persistRoutineOffline({ ...updated, updatedAt: new Date().toISOString() }, false);
      } catch (syncError) {
        console.warn('[MorningRoutine] Failed to sync metadata update:', syncError);
      }
    },
    [persistRoutineOffline, routine, syncToSupabase],
  );

  return {
    routine,
    loading,
    error,
    refresh: loadRoutine,
    toggleHabit,
    updateMetadata,
  };
}
