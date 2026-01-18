/**
 * Deep Work Timer Service
 * Background-safe timestamp-based timers with localStorage persistence.
 * Mirrors flowStatsService style while focusing on deep work task sessions.
 */

export interface ActiveDeepWorkTimer {
  taskId: string;
  startedAt: number | null; // epoch ms; null when paused
  accumulatedMs: number;
  dateKey: string; // yyyy-MM-dd
}

export interface DeepWorkSession {
  taskId: string;
  startTime: number;
  endTime: number;
  durationMs: number;
  dateKey: string;
}

interface TimerState {
  activeTimer?: ActiveDeepWorkTimer;
  sessions: DeepWorkSession[];
}

const STORAGE_KEY = 'lifelock-deepwork-timers-v1';

// In-memory fallback for SSR/tests when localStorage is unavailable
let memoryState: TimerState = { sessions: [] };

const isBrowser = typeof window !== 'undefined' && typeof localStorage !== 'undefined';

const loadState = (): TimerState => {
  if (!isBrowser) return { ...memoryState, sessions: [...memoryState.sessions] };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { sessions: [] };
    const parsed = JSON.parse(raw) as TimerState;
    return {
      sessions: parsed.sessions || [],
      activeTimer: parsed.activeTimer,
    };
  } catch (error) {
    console.error('Failed to load deep work timer state', error);
    return { sessions: [] };
  }
};

const saveState = (state: TimerState) => {
  if (!isBrowser) {
    memoryState = { ...state, sessions: [...state.sessions] };
    return;
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Failed to save deep work timer state', error);
  }
};

const now = () => Date.now();

const finalizeActive = (state: TimerState, timestamp = now()): DeepWorkSession | null => {
  const active = state.activeTimer;
  if (!active) return null;

  const elapsed = active.startedAt ? Math.max(0, timestamp - active.startedAt) : 0;
  const durationMs = Math.max(0, active.accumulatedMs + elapsed);

  state.activeTimer = undefined;

  if (durationMs <= 0) return null;

  const session: DeepWorkSession = {
    taskId: active.taskId,
    startTime: active.startedAt ?? timestamp,
    endTime: timestamp,
    durationMs,
    dateKey: active.dateKey,
  };
  state.sessions.push(session);
  return session;
};

const clampDateKey = (dateKey?: string) => {
  if (dateKey && /^\d{4}-\d{2}-\d{2}$/.test(dateKey)) return dateKey;
  const d = new Date();
  const month = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  return `${d.getFullYear()}-${month}-${day}`;
};

export class DeepWorkTimerService {
  static getState(): TimerState {
    return loadState();
  }

  static getActiveElapsedMs(timestamp = now()): number {
    const state = loadState();
    if (!state.activeTimer) return 0;
    const { accumulatedMs, startedAt } = state.activeTimer;
    const runningMs = startedAt ? Math.max(0, timestamp - startedAt) : 0;
    return accumulatedMs + runningMs;
  }

  static getElapsedMsForTask(taskId: string, dateKey?: string, timestamp = now()): number {
    const targetDateKey = clampDateKey(dateKey);
    const state = loadState();

    const sessionsTotal = state.sessions
      .filter((s) => s.taskId === taskId && s.dateKey === targetDateKey)
      .reduce((sum, s) => sum + s.durationMs, 0);

    const active = state.activeTimer;
    const activeMs =
      active && active.taskId === taskId && active.dateKey === targetDateKey
        ? (active.startedAt ? Math.max(0, timestamp - active.startedAt) : 0) + active.accumulatedMs
        : 0;

    return sessionsTotal + activeMs;
  }

  static start(taskId: string, dateKey?: string) {
    const state = loadState();
    const targetDateKey = clampDateKey(dateKey);
    const currentTs = now();

    if (state.activeTimer?.taskId === taskId) {
      // Already running for this task; noop.
      return state;
    }

    finalizeActive(state, currentTs);

    state.activeTimer = {
      taskId,
      startedAt: currentTs,
      accumulatedMs: 0,
      dateKey: targetDateKey,
    };

    saveState(state);
    return state;
  }

  static pause(taskId: string) {
    const state = loadState();
    if (!state.activeTimer || state.activeTimer.taskId !== taskId) return state;

    const currentTs = now();
    const elapsed = state.activeTimer.startedAt ? Math.max(0, currentTs - state.activeTimer.startedAt) : 0;

    state.activeTimer = {
      ...state.activeTimer,
      startedAt: null,
      accumulatedMs: state.activeTimer.accumulatedMs + elapsed,
    };

    saveState(state);
    return state;
  }

  static resume(taskId: string) {
    const state = loadState();
    if (!state.activeTimer || state.activeTimer.taskId !== taskId) {
      return this.start(taskId, state.activeTimer?.dateKey);
    }

    if (state.activeTimer.startedAt === null) {
      state.activeTimer.startedAt = now();
      saveState(state);
    }
    return state;
  }

  static stop(taskId?: string) {
    const state = loadState();
    if (!state.activeTimer) return state;
    if (taskId && state.activeTimer.taskId !== taskId) return state;

    finalizeActive(state, now());
    saveState(state);
    return state;
  }

  static switchTo(taskId: string, dateKey?: string) {
    const targetDateKey = clampDateKey(dateKey);
    const state = loadState();
    const ts = now();
    finalizeActive(state, ts);
    state.activeTimer = {
      taskId,
      startedAt: ts,
      accumulatedMs: 0,
      dateKey: targetDateKey,
    };
    saveState(state);
    return state;
  }

  static getDailyTotals(dateKey?: string) {
    const targetDateKey = clampDateKey(dateKey);
    const state = loadState();
    const totals: Record<string, number> = {};

    state.sessions.forEach((session) => {
      if (session.dateKey !== targetDateKey) return;
      totals[session.taskId] = (totals[session.taskId] || 0) + session.durationMs;
    });

    const active = state.activeTimer;
    if (active && active.dateKey === targetDateKey) {
      const activeMs = active.accumulatedMs + (active.startedAt ? Math.max(0, now() - active.startedAt) : 0);
      totals[active.taskId] = (totals[active.taskId] || 0) + activeMs;
    }

    const totalMs = Object.values(totals).reduce((sum, val) => sum + val, 0);
    return { totalsByTask: totals, totalMs };
  }

  static prune(maxSessions = 200) {
    const state = loadState();
    if (state.sessions.length <= maxSessions) return state;
    state.sessions = state.sessions.slice(state.sessions.length - maxSessions);
    saveState(state);
    return state;
  }

  // For tests/debugging
  static reset() {
    const empty: TimerState = { sessions: [] };
    saveState(empty);
  }
}
