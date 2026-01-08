import { useCallback, useEffect, useMemo, useState } from 'react';
import { DeepWorkTimerService, ActiveDeepWorkTimer, DeepWorkSession } from '@/services/deepWorkTimerService';

export interface UseDeepWorkTimersResult {
  activeTimer?: ActiveDeepWorkTimer;
  sessions: DeepWorkSession[];
  start: (taskId: string) => void;
  stop: (taskId?: string) => void;
  pause: (taskId: string) => void;
  resume: (taskId: string) => void;
  switchTo: (taskId: string) => void;
  getElapsedMsForTask: (taskId: string) => number;
  totalMsForDay: number;
}

export const useDeepWorkTimers = (dateKey: string): UseDeepWorkTimersResult => {
  const [state, setState] = useState(() => DeepWorkTimerService.getState());

  // heartbeat to keep elapsed time fresh while active
  useEffect(() => {
    setState(DeepWorkTimerService.getState());
    const interval = setInterval(() => {
      setState(DeepWorkTimerService.getState());
    }, state.activeTimer ? 1000 : 5000);
    return () => clearInterval(interval);
  }, [dateKey, state.activeTimer?.taskId]);

  const refresh = useCallback(() => {
    setState(DeepWorkTimerService.getState());
  }, []);

  const start = useCallback(
    (taskId: string) => {
      DeepWorkTimerService.start(taskId, dateKey);
      refresh();
    },
    [dateKey, refresh],
  );

  const stop = useCallback(
    (taskId?: string) => {
      DeepWorkTimerService.stop(taskId);
      refresh();
    },
    [refresh],
  );

  const pause = useCallback(
    (taskId: string) => {
      DeepWorkTimerService.pause(taskId);
      refresh();
    },
    [refresh],
  );

  const resume = useCallback(
    (taskId: string) => {
      DeepWorkTimerService.resume(taskId);
      refresh();
    },
    [refresh],
  );

  const switchTo = useCallback(
    (taskId: string) => {
      DeepWorkTimerService.switchTo(taskId, dateKey);
      refresh();
    },
    [dateKey, refresh],
  );

  const getElapsedMsForTask = useCallback(
    (taskId: string) => DeepWorkTimerService.getElapsedMsForTask(taskId, dateKey),
    [dateKey],
  );

  const { totalMs: totalMsForDay } = useMemo(() => DeepWorkTimerService.getDailyTotals(dateKey), [dateKey, state]);

  return {
    activeTimer: state.activeTimer,
    sessions: state.sessions,
    start,
    stop,
    pause,
    resume,
    switchTo,
    getElapsedMsForTask,
    totalMsForDay,
  };
};

export const formatMsAsClock = (ms: number) => {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) {
    return `${hours}h ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};
