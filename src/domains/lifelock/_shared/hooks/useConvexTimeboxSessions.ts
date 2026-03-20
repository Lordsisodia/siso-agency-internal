/**
 * Convex Timebox Session Hooks - Track focus sessions in Convex
 */

import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useClerkUser } from '@/lib/hooks/auth/useClerkUser';
import { useCallback } from 'react';

// ============================================================================
// TYPES
// ============================================================================

export interface TimeboxSession {
  _id: string;
  userId: string;
  taskId?: string;
  startTime: string;
  endTime?: string;
  plannedDuration: number;
  actualDuration?: number;
  status: 'active' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: string;
}

export interface CreateSessionInput {
  taskId?: string;
  plannedDuration: number;
  notes?: string;
}

// ============================================================================
// HOOKS - QUERIES
// ============================================================================

/**
 * Get all sessions for current user
 */
export function useConvexTimeboxSessions() {
  const { user, isSignedIn } = useClerkUser();

  const sessions = useQuery(
    api.timebox.getSessions.list,
    isSignedIn && user?.id ? { userId: user.id } : 'skip'
  );

  return {
    sessions: sessions || [],
    isLoading: sessions === undefined,
  };
}

/**
 * Get sessions by status
 */
export function useConvexTimeboxSessionsByStatus(status: 'active' | 'completed' | 'cancelled') {
  const { user, isSignedIn } = useClerkUser();

  const sessions = useQuery(
    api.timebox.getSessions.listByStatus,
    isSignedIn && user?.id ? { userId: user.id, status } : 'skip'
  );

  return {
    sessions: sessions || [],
    isLoading: sessions === undefined,
  };
}

/**
 * Get active session for current user
 */
export function useActiveTimeboxSession() {
  const { user, isSignedIn } = useClerkUser();

  const activeSession = useQuery(
    api.timebox.getSessions.getActiveSession,
    isSignedIn && user?.id ? { userId: user.id } : 'skip'
  );

  return {
    activeSession: activeSession || null,
    isLoading: activeSession === undefined,
  };
}

/**
 * Get sessions by date range
 */
export function useConvexTimeboxSessionsByDateRange(startDate: string, endDate: string) {
  const { user, isSignedIn } = useClerkUser();

  const sessions = useQuery(
    api.timebox.getSessions.getByDateRange,
    isSignedIn && user?.id ? { userId: user.id, startDate, endDate } : 'skip'
  );

  return {
    sessions: sessions || [],
    isLoading: sessions === undefined,
  };
}

// ============================================================================
// HOOKS - MUTATIONS
// ============================================================================

/**
 * Start a new focus session
 */
export function useStartTimeboxSession() {
  const { user, isSignedIn } = useClerkUser();

  const createMutation = useMutation(api.timebox.createSession.create);

  const startSession = useCallback(
    async (input: CreateSessionInput) => {
      if (!isSignedIn || !user?.id) {
        throw new Error('Not authenticated');
      }
      return createMutation({
        userId: user.id,
        ...input,
      });
    },
    [createMutation, isSignedIn, user]
  );

  return { startSession };
}

/**
 * Start a quick focus session (no specific task)
 */
export function useStartQuickSession() {
  const { user, isSignedIn } = useClerkUser();

  const createMutation = useMutation(api.timebox.createSession.startQuick);

  const startQuickSession = useCallback(
    async (plannedDuration: number) => {
      if (!isSignedIn || !user?.id) {
        throw new Error('Not authenticated');
      }
      return createMutation({
        userId: user.id,
        plannedDuration,
      });
    },
    [createMutation, isSignedIn, user]
  );

  return { startQuickSession };
}

/**
 * Complete a focus session
 */
export function useCompleteTimeboxSession() {
  const completeMutation = useMutation(api.timebox.updateSession.complete);

  const completeSession = useCallback(
    async (sessionId: string, notes?: string) => {
      return completeMutation({
        sessionId: sessionId as any,
        notes,
      });
    },
    [completeMutation]
  );

  return { completeSession };
}

/**
 * Cancel a focus session
 */
export function useCancelTimeboxSession() {
  const cancelMutation = useMutation(api.timebox.updateSession.cancel);

  const cancelSession = useCallback(
    async (sessionId: string, notes?: string) => {
      return cancelMutation({
        sessionId: sessionId as any,
        notes,
      });
    },
    [cancelMutation]
  );

  return { cancelSession };
}

/**
 * Update session notes
 */
export function useUpdateSessionNotes() {
  const updateMutation = useMutation(api.timebox.updateSession.updateNotes);

  const updateNotes = useCallback(
    async (sessionId: string, notes: string) => {
      return updateMutation({
        sessionId: sessionId as any,
        notes,
      });
    },
    [updateMutation]
  );

  return { updateNotes };
}

/**
 * Delete a session
 */
export function useDeleteTimeboxSession() {
  const deleteMutation = useMutation(api.timebox.updateSession.deleteSession);

  const deleteSession = useCallback(
    async (sessionId: string) => {
      return deleteMutation({
        sessionId: sessionId as any,
      });
    },
    [deleteMutation]
  );

  return { deleteSession };
}
