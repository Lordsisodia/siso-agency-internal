/**
 * ⏱️ useTaskTimer Hook - Time Tracking for Tasks
 *
 * Tracks actual time spent on tasks with:
 * - Start/pause/stop functionality
 * - Persistence across page refreshes
 * - Supabase sync for analytics
 * - Interruption tracking
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabaseAnon } from '@/lib/services/supabase/clerk-integration';
import { format } from 'date-fns';

export interface TimerState {
  isActive: boolean;
  isPaused: boolean;
  elapsedSeconds: number;
  startedAt: Date | null;
  pausedAt: Date | null;
  interruptions: number;
}

export interface TimerSession {
  id: string;
  taskId: string;
  startedAt: Date;
  stoppedAt: Date;
  totalSeconds: number;
  interruptions: number;
}

interface UseTaskTimerOptions {
  taskId: string;
  userId: string;
  timeblockId?: string;
  onSessionComplete?: (session: TimerSession) => void;
}

export function useTaskTimer({ taskId, userId, timeblockId, onSessionComplete }: UseTaskTimerOptions) {
  const [state, setState] = useState<TimerState>({
    isActive: false,
    isPaused: false,
    elapsedSeconds: 0,
    startedAt: null,
    pausedAt: null,
    interruptions: 0
  });

  const intervalRef = useRef<NodeJS.Timeout>();
  const sessionIdRef = useRef<string | null>(null);

  // Format seconds to HH:MM:SS
  const formatTime = useCallback((seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Save timer state to localStorage
  const saveTimerState = useCallback((timerState: TimerState) => {
    try {
      const key = `timer:${taskId}`;
      localStorage.setItem(key, JSON.stringify({
        ...timerState,
        startedAt: timerState.startedAt?.toISOString(),
        pausedAt: timerState.pausedAt?.toISOString()
      }));
    } catch (error) {
      console.error('Failed to save timer state:', error);
    }
  }, [taskId]);

  // Load timer state from localStorage
  const loadTimerState = useCallback((): TimerState | null => {
    try {
      const key = `timer:${taskId}`;
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...parsed,
          startedAt: parsed.startedAt ? new Date(parsed.startedAt) : null,
          pausedAt: parsed.pausedAt ? new Date(parsed.pausedAt) : null
        };
      }
    } catch (error) {
      console.error('Failed to load timer state:', error);
    }
    return null;
  }, [taskId]);

  // Clear timer state from localStorage
  const clearTimerState = useCallback(() => {
    try {
      const key = `timer:${taskId}`;
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Failed to clear timer state:', error);
    }
  }, [taskId]);

  // Save session to Supabase
  const saveSessionToSupabase = useCallback(async (session: TimerSession) => {
    try {
      const { error } = await supabaseAnon
        .from('task_time_logs')
        .insert({
          id: session.id,
          user_id: userId,
          task_id: session.taskId,
          timeblock_id: timeblockId,
          started_at: session.startedAt.toISOString(),
          stopped_at: session.stoppedAt.toISOString(),
          total_seconds: session.totalSeconds,
          interruption_count: session.interruptions,
          date: format(new Date(), 'yyyy-MM-dd'),
          is_active: false
        });

      if (error) {
        console.error('Failed to save session to Supabase:', error);
      }
    } catch (error) {
      console.error('Failed to sync session:', error);
    }
  }, [userId, taskId, timeblockId]);

  // Start timer
  const startTimer = useCallback(() => {
    const now = new Date();
    const newSessionId = `session-${Date.now()}`;
    sessionIdRef.current = newSessionId;

    const newState: TimerState = {
      isActive: true,
      isPaused: false,
      elapsedSeconds: 0,
      startedAt: now,
      pausedAt: null,
      interruptions: 0
    };

    setState(newState);
    saveTimerState(newState);
  }, [saveTimerState]);

  // Pause timer
  const pauseTimer = useCallback(() => {
    if (!state.isActive || state.isPaused) return;

    const now = new Date();
    const newState: TimerState = {
      ...state,
      isPaused: true,
      pausedAt: now,
      interruptions: state.interruptions + 1
    };

    setState(newState);
    saveTimerState(newState);
  }, [state, saveTimerState]);

  // Resume timer
  const resumeTimer = useCallback(() => {
    if (!state.isPaused) return;

    const newState: TimerState = {
      ...state,
      isPaused: false,
      pausedAt: null
    };

    setState(newState);
    saveTimerState(newState);
  }, [state, saveTimerState]);

  // Stop timer and save session
  const stopTimer = useCallback(async () => {
    if (!state.isActive || !state.startedAt) return;

    const now = new Date();
    const session: TimerSession = {
      id: sessionIdRef.current || `session-${Date.now()}`,
      taskId,
      startedAt: state.startedAt,
      stoppedAt: now,
      totalSeconds: state.elapsedSeconds,
      interruptions: state.interruptions
    };

    // Reset state
    setState({
      isActive: false,
      isPaused: false,
      elapsedSeconds: 0,
      startedAt: null,
      pausedAt: null,
      interruptions: 0
    });

    // Clear localStorage
    clearTimerState();

    // Save to Supabase
    await saveSessionToSupabase(session);

    // Callback
    onSessionComplete?.(session);

    return session;
  }, [state, taskId, clearTimerState, saveSessionToSupabase, onSessionComplete]);

  // Tick timer every second
  useEffect(() => {
    if (state.isActive && !state.isPaused) {
      intervalRef.current = setInterval(() => {
        setState(prev => {
          const newState = {
            ...prev,
            elapsedSeconds: prev.elapsedSeconds + 1
          };

          // Save every 10 seconds to localStorage (for persistence)
          if (newState.elapsedSeconds % 10 === 0) {
            saveTimerState(newState);
          }

          return newState;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [state.isActive, state.isPaused, saveTimerState]);

  // Load timer state on mount
  useEffect(() => {
    const savedState = loadTimerState();
    if (savedState && savedState.isActive) {
      // Calculate elapsed time since last save
      const now = new Date();
      const startedAt = savedState.startedAt!;

      if (savedState.isPaused && savedState.pausedAt) {
        // Was paused - restore paused state
        setState(savedState);
      } else {
        // Was running - calculate elapsed time
        const elapsedSinceStart = Math.floor((now.getTime() - startedAt.getTime()) / 1000);
        setState({
          ...savedState,
          elapsedSeconds: elapsedSinceStart
        });
      }
    }
  }, [loadTimerState]);

  // Get total time spent on this task (from previous sessions)
  const getTotalTimeSpent = useCallback(async (): Promise<number> => {
    try {
      const { data, error } = await supabaseAnon
        .from('task_time_logs')
        .select('total_seconds')
        .eq('user_id', userId)
        .eq('task_id', taskId)
        .eq('is_active', false);

      if (!error && data) {
        return data.reduce((sum, log) => sum + (log.total_seconds || 0), 0);
      }
    } catch (error) {
      console.error('Failed to get total time spent:', error);
    }
    return 0;
  }, [userId, taskId]);

  return {
    // State
    ...state,
    formattedTime: formatTime(state.elapsedSeconds),

    // Actions
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    getTotalTimeSpent,

    // Helpers
    isRunning: state.isActive && !state.isPaused,
    canStart: !state.isActive,
    canPause: state.isActive && !state.isPaused,
    canResume: state.isActive && state.isPaused,
    canStop: state.isActive
  };
}
