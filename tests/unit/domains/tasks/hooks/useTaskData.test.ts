import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { format } from 'date-fns';

import { useTaskData } from '../useTaskData';

const dataMocks = vi.hoisted(() => ({
  mockGetTasksForDate: vi.fn(),
}));

vi.mock('@/services/workTypeApiClient', () => ({
  personalTaskService: {
    getTasksForDate: dataMocks.mockGetTasksForDate,
  },
}));

const mockGetTasksForDate = dataMocks.mockGetTasksForDate;

const clerkUserMock = {
  user: { id: 'test-user-id' },
  isSignedIn: true,
  isLoaded: true,
};

vi.mock('@/lib/hooks/useClerkUser', () => ({
  useClerkUser: () => clerkUserMock,
}));

const setNavigatorOnline = (value: boolean) => {
  Object.defineProperty(window.navigator, 'onLine', {
    configurable: true,
    value,
  });
};

describe('useTaskData', () => {
  const selectedDate = new Date('2025-01-15T12:00:00.000Z');
  let consoleErrorSpy: ReturnType<typeof vi.spyOn> | undefined;

  beforeEach(() => {
    mockGetTasksForDate.mockReset();
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    setNavigatorOnline(true);
  });

  afterEach(() => {
    consoleErrorSpy?.mockRestore();
  });

  it('loads tasks for the selected day and week successfully', async () => {
    mockGetTasksForDate.mockImplementation(async (_userId: string, date: Date) => {
      const dayKey = format(date, 'yyyy-MM-dd');
      return [
        {
          id: `task-${dayKey}`,
          title: `Task for ${dayKey}`,
          completed: dayKey.endsWith('1'),
          workType: 'LIGHT',
          priority: 'HIGH',
        },
      ];
    });

    const { result } = renderHook(() => useTaskData(selectedDate));

    await waitFor(() => {
      expect(mockGetTasksForDate).toHaveBeenCalledTimes(8);
    });

    expect(result.current.isLoadingToday).toBe(false);
    expect(result.current.isLoadingWeek).toBe(false);
    expect(result.current.todayCard?.tasks).toHaveLength(1);
    expect(result.current.todayCard?.tasks[0].workType).toBe('LIGHT');
    expect(result.current.todayError).toBeNull();
    expect(result.current.weekCards).toHaveLength(7);
    expect(mockGetTasksForDate).toHaveBeenCalledTimes(8);

    act(() => {
      result.current.refresh();
    });

    await waitFor(() => {
      expect(mockGetTasksForDate).toHaveBeenCalledTimes(16);
    });
  });

  it('captures service errors for the selected day', async () => {
    const selectedKey = format(selectedDate, 'yyyy-MM-dd');
    mockGetTasksForDate.mockImplementation(async (_userId: string, date: Date) => {
      const dayKey = format(date, 'yyyy-MM-dd');
      if (dayKey === selectedKey) {
        throw new Error('Failed to load today');
      }
      return [];
    });

    const { result } = renderHook(() => useTaskData(selectedDate));

    await waitFor(() => {
      expect(mockGetTasksForDate).toHaveBeenCalled();
      expect(result.current.isLoadingToday).toBe(false);
    });

    await waitFor(() => {
      expect(result.current.todayError).toBe('Failed to load today');
    });

    expect(result.current.todayCard).toBeNull();
    expect(result.current.isLoadingToday).toBe(false);
    expect(result.current.weekCards).toHaveLength(7);
    expect(result.current.weekCards.every(card => card.tasks.length === 0)).toBe(true);
    expect(result.current.weekError).toBeNull();
  });

  it('provides offline-friendly fallbacks when the service is unreachable', async () => {
    setNavigatorOnline(false);
    mockGetTasksForDate.mockImplementation(async () => {
      throw new Error('Offline mode - showing cached data');
    });

    const { result } = renderHook(() => useTaskData(selectedDate));

    await waitFor(() => {
      expect(mockGetTasksForDate).toHaveBeenCalled();
      expect(result.current.isLoadingToday).toBe(false);
    });

    await waitFor(() => {
      expect(result.current.todayError).toBe('Offline mode - showing cached data');
    });

    expect(result.current.todayCard).toBeNull();
    expect(result.current.weekCards).toHaveLength(7);
    expect(result.current.weekCards.every(card => card.tasks.length === 0)).toBe(true);
    expect(result.current.isLoadingToday).toBe(false);
    expect(result.current.isLoadingWeek).toBe(false);
  });
});
