/**
 * Convex Habits Integration Hooks
 *
 * Provides React hooks for interacting with Convex habits/habitCompletions
 * to track wellness activities (Fitness, Nutrition, Health Stats)
 */

import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { useClerkUser } from '@/lib/hooks/auth/useClerkUser';
import { useCallback, useMemo } from 'react';

// ============================================================================
// TYPES
// ============================================================================

export interface ConvexHabit {
  _id: string;
  userId: string;
  name: string;
  description?: string;
  category: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  currentStreak: number;
  longestStreak: number;
  lastCompleted?: string;
  isActive: boolean;
  createdAt: string;
}

export interface ConvexHabitCompletion {
  _id: string;
  userId: string;
  habitId: string;
  completedAt: string;
  notes?: string;
}

// ============================================================================
// WELLNESS HABIT CATEGORIES
// ============================================================================

export const WELLNESS_HABIT_CATEGORIES = {
  FITNESS: 'fitness',
  NUTRITION: 'nutrition',
  HEALTH_STATS: 'health_stats',
} as const;

export type WellnessHabitCategory = typeof WELLNESS_HABIT_CATEGORIES[keyof typeof WELLNESS_HABIT_CATEGORIES];

// Default wellness habits
export const DEFAULT_WELLNESS_HABITS = [
  // Fitness
  { name: 'Daily Workout', category: WELLNESS_HABIT_CATEGORIES.FITNESS, description: 'Complete daily exercise routine', frequency: 'daily' as const },
  // Nutrition
  { name: 'Log Nutrition', category: WELLNESS_HABIT_CATEGORIES.NUTRITION, description: 'Track meals and macros', frequency: 'daily' as const },
  // Health Stats
  { name: 'Track Hydration', category: WELLNESS_HABIT_CATEGORIES.HEALTH_STATS, description: 'Log water intake', frequency: 'daily' as const },
  { name: 'No Smoking', category: WELLNESS_HABIT_CATEGORIES.HEALTH_STATS, description: 'Avoid smoking today', frequency: 'daily' as const },
];

// ============================================================================
// HOOKS
// ============================================================================

/**
 * Get all habits for current user
 */
export function useConvexHabits(category?: WellnessHabitCategory) {
  const { user, isSignedIn } = useClerkUser();

  const habits = useQuery(
    api.habits.getHabits.list,
    isSignedIn && user?.id ? { userId: user.id } : 'skip'
  );

  const filteredHabits = useMemo(() => {
    if (!habits) return [];
    if (!category) return habits;
    return habits.filter((h: ConvexHabit) => h.category === category);
  }, [habits, category]);

  return {
    habits: filteredHabits as ConvexHabit[],
    isLoading: habits === undefined,
  };
}

/**
 * Get habit completions for current user
 */
export function useConvexHabitCompletions(habitId?: string) {
  const { user, isSignedIn } = useClerkUser();

  const completions = useQuery(
    api.habits.getCompletions.list,
    isSignedIn && user?.id && habitId ? { userId: user.id, habitId } :
    isSignedIn && user?.id ? { userId: user.id } : 'skip'
  );

  return {
    completions: (completions || []) as ConvexHabitCompletion[],
    isLoading: completions === undefined,
  };
}

/**
 * Get or create a wellness habit by category
 * Creates the habit if it doesn't exist
 */
export function useGetOrCreateWellnessHabit() {
  const { user, isSignedIn } = useClerkUser();
  const createHabitMutation = useMutation(api.habits.createHabit.create);
  const { habits } = useConvexHabits();

  const getOrCreateHabit = useCallback(
    async (category: WellnessHabitCategory, name: string, description?: string) => {
      if (!isSignedIn || !user?.id) {
        throw new Error('Not authenticated');
      }

      // Check if habit already exists
      const existingHabit = habits.find(
        (h: ConvexHabit) => h.name === name && h.category === category && h.isActive
      );

      if (existingHabit) {
        return existingHabit._id;
      }

      // Create new habit
      return createHabitMutation({
        userId: user.id,
        name,
        description,
        category,
        frequency: 'daily',
      });
    },
    [createHabitMutation, habits, isSignedIn, user]
  );

  return { getOrCreateHabit };
}

/**
 * Complete a habit (records completion in Convex)
 */
export function useCompleteConvexHabit() {
  const completeMutation = useMutation(api.habits.completeHabit);

  const completeHabit = useCallback(
    async (habitId: string, notes?: string) => {
      const { user, isSignedIn } = useClerkUser();
      if (!isSignedIn || !user?.id) {
        throw new Error('Not authenticated');
      }

      return completeMutation({
        userId: user.id,
        habitId: habitId as any, // Convex ID type
        notes,
      });
    },
    [completeMutation]
  );

  return { completeHabit };
}

/**
 * Check if a habit was completed today
 */
export function useIsHabitCompletedToday(habitId?: string): boolean {
  const { completions } = useConvexHabitCompletions(habitId);

  const isCompletedToday = useMemo(() => {
    if (!habitId || !completions.length) return false;

    const today = new Date().toISOString().split('T')[0];
    return completions.some((c: ConvexHabitCompletion) =>
      c.completedAt.startsWith(today)
    );
  }, [completions, habitId]);

  return isCompletedToday;
}

/**
 * Initialize default wellness habits for a user
 * Call this once on first load to set up the habits
 */
export function useInitializeWellnessHabits() {
  const { user, isSignedIn } = useClerkUser();
  const { habits, isLoading } = useConvexHabits();
  const createHabitMutation = useMutation(api.habits.createHabit.create);

  const initializeHabits = useCallback(async () => {
    if (!isSignedIn || !user?.id || isLoading) return;

    // Check if habits already exist
    if (habits.length > 0) return;

    // Create default wellness habits
    for (const habit of DEFAULT_WELLNESS_HABITS) {
      try {
        await createHabitMutation({
          userId: user.id,
          name: habit.name,
          description: habit.description,
          category: habit.category,
          frequency: habit.frequency,
        });
      } catch (error) {
        console.error(`Failed to create habit ${habit.name}:`, error);
      }
    }
  }, [createHabitMutation, habits.length, isLoading, isSignedIn, user?.id]);

  return { initializeHabits, isLoading };
}
