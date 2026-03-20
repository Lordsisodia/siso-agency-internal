/**
 * Convex Morning Routines Hook - Use Convex for morning routines
 */

import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../../../convex/_generated/api';
import { useClerkUser } from '@/lib/hooks/auth/useClerkUser';
import { useCallback, useMemo } from 'react';

// ============================================================================
// TYPES
// ============================================================================

export interface ConvexMorningRoutine {
  _id: string;
  userId: string;
  date: string;
  wakeTime?: string;
  meditationMinutes?: number;
  affirmations?: boolean;
  journalEntry?: string;
  exerciseCompleted?: boolean;
  waterIntake?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrUpdateMorningRoutineInput {
  date: string;
  wakeTime?: string;
  meditationMinutes?: number;
  affirmations?: boolean;
  journalEntry?: string;
  exerciseCompleted?: boolean;
  waterIntake?: number;
  notes?: string;
}

// ============================================================================
// HOOKS
// ============================================================================

/**
 * Get morning routine by date
 */
export function useConvexMorningRoutineByDate(date: string) {
  const { user, isSignedIn } = useClerkUser();

  const routine = useQuery(
    api.morningRoutines.getMorningRoutines.getByDate,
    isSignedIn && user?.id ? { userId: user.id, date } : 'skip'
  );

  return {
    routine: routine || null,
    isLoading: routine === undefined,
  };
}

/**
 * Get all morning routines for current user
 */
export function useConvexMorningRoutines() {
  const { user, isSignedIn } = useClerkUser();

  const routines = useQuery(
    api.morningRoutines.getMorningRoutines.list,
    isSignedIn && user?.id ? { userId: user.id } : 'skip'
  );

  return {
    routines: routines || [],
    isLoading: routines === undefined,
  };
}

/**
 * Create or update morning routine
 */
export function useConvexCreateOrUpdateMorningRoutine() {
  const { user, isSignedIn } = useClerkUser();

  const createOrUpdateMutation = useMutation(api.morningRoutines.createOrUpdateMorningRoutine.createOrUpdate);

  const createOrUpdate = useCallback(
    async (input: CreateOrUpdateMorningRoutineInput) => {
      if (!isSignedIn || !user?.id) {
        throw new Error('Not authenticated');
      }
      return createOrUpdateMutation({
        userId: user.id,
        ...input,
      });
    },
    [createOrUpdateMutation, isSignedIn, user]
  );

  return { createOrUpdate };
}
