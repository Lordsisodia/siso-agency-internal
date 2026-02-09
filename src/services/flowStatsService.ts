/**
 * Flow Stats Service - Stub Implementation
 *
 * This is a minimal stub to prevent runtime errors.
 * The full implementation was removed and needs to be recreated.
 */

import { FlowSession } from '@/domains/tasks/components-from-shared/FlowStateTimer';

export interface FlowStats {
  totalSessions: number;
  totalFocusTime: number;
  averageSessionLength: number;
  currentStreak: number;
  longestStreak: number;
  contextSwitchPenalty: number;
  peakProductivityHour: number;
  favoriteContext: string;
}

const defaultStats: FlowStats = {
  totalSessions: 0,
  totalFocusTime: 0,
  averageSessionLength: 0,
  currentStreak: 0,
  longestStreak: 0,
  contextSwitchPenalty: 0,
  peakProductivityHour: 9,
  favoriteContext: 'coding'
};

export const FlowStatsService = {
  getSessionsForTask(taskId: string): FlowSession[] {
    // TODO: Implement proper session retrieval
    return [];
  },

  getFlowStats(): FlowStats {
    // TODO: Implement proper stats calculation
    return { ...defaultStats };
  },

  getAllSessions(): FlowSession[] {
    // TODO: Implement proper session retrieval
    return [];
  },

  saveSession(session: FlowSession): void {
    // TODO: Implement proper session saving
    console.log('Session saved (stub):', session);
  }
};
