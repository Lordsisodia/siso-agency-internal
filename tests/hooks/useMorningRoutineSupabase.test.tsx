import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useMorningRoutineSupabase } from '@/shared/hooks/useMorningRoutineSupabase';

const mocks = vi.hoisted(() => ({
  getMorningRoutineMock: vi.fn(),
  toggleMorningRoutineHabitMock: vi.fn(),
  updateMorningRoutineMetadataMock: vi.fn(),
}));

vi.mock('@/shared/hooks/useClerkUser', () => ({
  useClerkUser: () => ({
    user: { id: 'clerk-123' },
    isSignedIn: true,
    isLoaded: true,
  }),
}));

vi.mock('@/shared/lib/supabase-clerk', () => ({
  useSupabaseUserId: () => 'internal-123',
  supabaseAnon: { from: vi.fn() },
}));

vi.mock('@/shared/services/unified-data.service', () => ({
  unifiedDataService: {
    getMorningRoutine: mocks.getMorningRoutineMock,
    toggleMorningRoutineHabit: mocks.toggleMorningRoutineHabitMock,
    updateMorningRoutineMetadata: mocks.updateMorningRoutineMetadataMock,
  },
}));

describe('useMorningRoutineSupabase', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getMorningRoutineMock.mockReset();
    mocks.toggleMorningRoutineHabitMock.mockReset();
    mocks.updateMorningRoutineMetadataMock.mockReset();
  });

  it('loads routine data and exposes refresh helpers', async () => {
    const refreshedRoutine = {
      id: 'morning-internal-123-2024-01-01',
      userId: 'internal-123',
      date: '2024-01-01',
      routineType: 'morning',
      items: [{ name: 'Hydrate', completed: true }],
      metadata: { wakeUpTime: '06:00' },
      completedCount: 1,
      totalCount: 1,
      completionPercentage: 100,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:10:00.000Z',
    };

    mocks.getMorningRoutineMock.mockResolvedValueOnce(null);
    mocks.getMorningRoutineMock.mockResolvedValue(refreshedRoutine);

    const { result } = renderHook(() =>
      useMorningRoutineSupabase({ selectedDate: new Date('2024-01-01T00:00:00Z') })
    );

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.routine).toBeNull();

    await act(async () => {
      await result.current.refresh();
    });

    expect(mocks.getMorningRoutineMock).toHaveBeenCalledTimes(2);
    expect(result.current.routine).toEqual(refreshedRoutine);
    expect(result.current.items).toEqual(refreshedRoutine.items);
    expect(result.current.metadata).toEqual(refreshedRoutine.metadata);
  });

  it('optimistically toggles habits and resolves with synced data', async () => {
    mocks.getMorningRoutineMock.mockResolvedValue(null);

    const updatedRoutine = {
      id: 'morning-internal-123-2024-01-01',
      userId: 'internal-123',
      date: '2024-01-01',
      routineType: 'morning',
      items: [{ name: 'Stretch', completed: true }],
      metadata: {},
      completedCount: 1,
      totalCount: 1,
      completionPercentage: 100,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:05:00.000Z',
    };

    mocks.toggleMorningRoutineHabitMock.mockResolvedValue(updatedRoutine);

    const { result } = renderHook(() =>
      useMorningRoutineSupabase({ selectedDate: new Date('2024-01-01T00:00:00Z') })
    );

    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.toggleHabit('Stretch', true);
    });

    expect(mocks.toggleMorningRoutineHabitMock).toHaveBeenCalledWith(
      'internal-123',
      '2024-01-01',
      'Stretch',
      true,
    );
    expect(result.current.routine).toEqual(updatedRoutine);
    expect(result.current.saving).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('merges metadata updates from the service response', async () => {
    mocks.getMorningRoutineMock.mockResolvedValue(null);

    const routineWithMetadata = {
      id: 'morning-internal-123-2024-01-01',
      userId: 'internal-123',
      date: '2024-01-01',
      routineType: 'morning',
      items: [],
      metadata: { wakeUpTime: '05:45', dailyPriorities: ['Focus'] },
      completedCount: 0,
      totalCount: 0,
      completionPercentage: 0,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:15:00.000Z',
    };

    mocks.updateMorningRoutineMetadataMock.mockResolvedValue(routineWithMetadata);

    const { result } = renderHook(() =>
      useMorningRoutineSupabase({ selectedDate: new Date('2024-01-01T00:00:00Z') })
    );

    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.updateMetadata({ wakeUpTime: '05:45' });
    });

    expect(mocks.updateMorningRoutineMetadataMock).toHaveBeenCalledWith(
      'internal-123',
      '2024-01-01',
      { wakeUpTime: '05:45' },
    );
    expect(result.current.metadata).toEqual(routineWithMetadata.metadata);
    expect(result.current.routine).toEqual(routineWithMetadata);
  });
});
