import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DeepWorkTimerService } from '@/services/deepWorkTimerService';

// simple localStorage mock for node environment
const createMockStorage = () => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    clear: () => {
      store = {};
    },
    removeItem: (key: string) => {
      delete store[key];
    },
  };
};

describe('DeepWorkTimerService', () => {
  const originalLocalStorage = globalThis.localStorage;

  beforeEach(() => {
    // @ts-expect-error override for tests
    globalThis.localStorage = createMockStorage();
    DeepWorkTimerService.reset();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-04T10:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
    // @ts-expect-error restore
    globalThis.localStorage = originalLocalStorage;
  });

  it('records elapsed time when starting and stopping a task', () => {
    DeepWorkTimerService.start('task-1', '2026-01-04');
    vi.advanceTimersByTime(60_000); // 1 minute
    DeepWorkTimerService.stop('task-1');

    const totals = DeepWorkTimerService.getDailyTotals('2026-01-04');
    expect(Math.round(totals.totalMs / 1000)).toBe(60);
  });

  it('switches tasks and closes previous session', () => {
    DeepWorkTimerService.start('task-1', '2026-01-04');
    vi.advanceTimersByTime(30_000);
    DeepWorkTimerService.start('task-2', '2026-01-04'); // switch
    vi.advanceTimersByTime(30_000);
    DeepWorkTimerService.stop('task-2');

    const totals = DeepWorkTimerService.getDailyTotals('2026-01-04');
    expect(Math.round(totals.totalsByTask['task-1'] / 1000)).toBe(30);
    expect(Math.round(totals.totalsByTask['task-2'] / 1000)).toBe(30);
  });

  it('handles pause and resume without losing accumulated time', () => {
    DeepWorkTimerService.start('task-3', '2026-01-04');
    vi.advanceTimersByTime(20_000);
    DeepWorkTimerService.pause('task-3');
    vi.advanceTimersByTime(40_000);
    DeepWorkTimerService.resume('task-3');
    vi.advanceTimersByTime(10_000);
    DeepWorkTimerService.stop('task-3');

    const totals = DeepWorkTimerService.getDailyTotals('2026-01-04');
    expect(Math.round(totals.totalMs / 1000)).toBe(30); // 20s + 10s
  });
});
