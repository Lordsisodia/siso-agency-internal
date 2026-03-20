/**
 * Convex Daily Reflections Hook - Use Convex for daily reflections
 */

import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { useClerkUser } from '@/lib/hooks/auth/useClerkUser';
import { useCallback } from 'react';

// ============================================================================
// TYPES
// ============================================================================

export interface ConvexDailyReflection {
  _id: string;
  userId: string;
  date: string;
  completedTasks: string[];
  tomorrowPlan?: string;
  gratitude?: string;
  dailyRating?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrUpdateDailyReflectionInput {
  date: string;
  completedTasks?: string[];
  tomorrowPlan?: string;
  gratitude?: string;
  dailyRating?: number;
  notes?: string;
}

// ============================================================================
// HOOKS
// ============================================================================

/**
 * Get daily reflection by date
 */
export function useConvexDailyReflectionByDate(date: string) {
  const { user, isSignedIn } = useClerkUser();

  const reflection = useQuery(
    api.dailyReflections.getDailyReflections.getByDate,
    isSignedIn && user?.id ? { userId: user.id, date } : 'skip'
  );

  return {
    reflection: reflection || null,
    isLoading: reflection === undefined,
  };
}

/**
 * Get all daily reflections for current user
 */
export function useConvexDailyReflections() {
  const { user, isSignedIn } = useClerkUser();

  const reflections = useQuery(
    api.dailyReflections.getDailyReflections.list,
    isSignedIn && user?.id ? { userId: user.id } : 'skip'
  );

  return {
    reflections: reflections || [],
    isLoading: reflections === undefined,
  };
}

/**
 * Create or update daily reflection
 */
export function useConvexCreateOrUpdateDailyReflection() {
  const { user, isSignedIn } = useClerkUser();

  const createOrUpdateMutation = useMutation(api.dailyReflections.createOrUpdateDailyReflection.createOrUpdate);

  const createOrUpdate = useCallback(
    async (input: CreateOrUpdateDailyReflectionInput) => {
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
