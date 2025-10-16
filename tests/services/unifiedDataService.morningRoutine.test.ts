import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { unifiedDataService } from '@/shared/services/unified-data.service';
import { offlineDb } from '@/shared/offline/offlineDb';
import { supabaseAnon } from '@/shared/lib/supabase-clerk';

function setNavigatorOnlineState(state: boolean) {
  Object.defineProperty(window.navigator, 'onLine', {
    configurable: true,
    value: state,
  });
}

describe('unifiedDataService - morning routines', () => {
  beforeEach(async () => {
    await offlineDb.clear();
    setNavigatorOnlineState(false);
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(async () => {
    await offlineDb.clear();
    vi.restoreAllMocks();
    setNavigatorOnlineState(true);
  });

  it('stores toggled habits offline and queues sync actions when offline', async () => {
    const result = await unifiedDataService.toggleMorningRoutineHabit(
      'user-1',
      '2024-05-01',
      'Hydrate',
      true,
    );

    expect(result).toBeTruthy();
    expect(result?.items).toEqual([
      { name: 'Hydrate', completed: true },
    ]);
    expect(result?.completedCount).toBe(1);
    expect(result?.totalCount).toBe(1);
    expect(result?.completionPercentage).toBe(100);

    const stored = await offlineDb.getMorningRoutines('2024-05-01');
    expect(stored).toHaveLength(1);
    expect(stored[0]._needs_sync).toBe(true);
    expect(stored[0]._sync_status).toBe('pending');
    expect(stored[0].items).toEqual([
      { name: 'Hydrate', completed: true },
    ]);

    const queued = await offlineDb.getPendingActions();
    expect(queued.some(action => action.table === 'morningRoutines')).toBe(true);
  });

  it('syncs toggled habits to Supabase when online', async () => {
    setNavigatorOnlineState(true);
    await offlineDb.clear();

    const supabaseRecord = {
      id: 'remote-1',
      user_id: 'user-2',
      date: '2024-05-01',
      routine_type: 'morning',
      items: [{ name: 'Stretch', completed: true }],
      metadata: { wakeUpTime: '06:00' },
      completed_count: 1,
      total_count: 1,
      completion_percentage: 100,
      created_at: '2024-05-01T00:00:00.000Z',
      updated_at: '2024-05-01T00:05:00.000Z',
    };

    const singleSpy = vi.fn().mockResolvedValue({ data: supabaseRecord, error: null });
    const selectAfterUpsertSpy = vi.fn(() => ({ single: singleSpy }));
    const upsertSpy = vi.fn(() => ({ select: selectAfterUpsertSpy }));
    const maybeSingleSpy = vi.fn().mockResolvedValue({ data: null, error: null });

    vi.spyOn(supabaseAnon, 'from').mockImplementation((table: string) => {
      if (table !== 'daily_routines') {
        throw new Error(`Unexpected table: ${table}`);
      }

      const queryChain: any = {
        select: vi.fn(() => queryChain),
        eq: vi.fn(() => queryChain),
        maybeSingle: maybeSingleSpy,
        upsert: upsertSpy,
      };

      return queryChain;
    });

    const result = await unifiedDataService.toggleMorningRoutineHabit(
      'user-2',
      '2024-05-01',
      'Stretch',
      true,
    );

    expect(maybeSingleSpy).toHaveBeenCalled();
    expect(upsertSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: 'user-2',
        date: '2024-05-01',
        routine_type: 'morning',
      }),
      expect.objectContaining({ onConflict: 'user_id,date,routine_type' }),
    );
    expect(singleSpy).toHaveBeenCalled();
    expect(result).toEqual({
      id: 'remote-1',
      userId: 'user-2',
      date: '2024-05-01',
      routineType: 'morning',
      items: [{ name: 'Stretch', completed: true }],
      metadata: { wakeUpTime: '06:00' },
      completedCount: 1,
      totalCount: 1,
      completionPercentage: 100,
      createdAt: '2024-05-01T00:00:00.000Z',
      updatedAt: '2024-05-01T00:05:00.000Z',
    });

    const stored = await offlineDb.getMorningRoutines('2024-05-01');
    expect(stored).not.toHaveLength(0);
    expect(stored.every(record => record._needs_sync === false)).toBe(true);
    expect(stored.some(record => record.id === 'remote-1')).toBe(true);

    const queued = await offlineDb.getPendingActions();
    expect(queued.filter(action => action.table === 'morningRoutines')).toHaveLength(0);
  });
});
