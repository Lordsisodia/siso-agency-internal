/**
 * 🏋️‍♂️ Home Workout Supabase Hook
 * 
 * Hook for managing home workout data with Supabase
 * Follows successful patterns from useMorningRoutineSupabase.ts
 */

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/services/supabase/client';
import { useClerkUser } from '@/lib/hooks/auth/useClerkUser';
import { useSupabaseClient, useSupabaseUserId } from '@/lib/services/supabase/clerk-integration';
import { offlineDb } from '@/services/offline/offlineDb';

interface WorkoutItem {
  id: string;
  title: string;
  completed: boolean;
  target?: string;
  logged?: string;
}

interface HomeWorkout {
  id: string;
  user_id: string;
  date: string;
  workout_items: WorkoutItem[];
  completed_count: number;
  total_count: number;
  completion_percentage: number;
  created_at: string;
  updated_at: string;
}

const DEFAULT_WORKOUT_ITEMS: WorkoutItem[] = [
  { id: '1', title: 'Push-ups', completed: false, target: '50 reps', logged: '' },
  { id: '2', title: 'Squats', completed: false, target: '100 reps', logged: '' },
  { id: '3', title: 'Plank', completed: false, target: '2 minutes', logged: '' },
  { id: '4', title: 'Burpees', completed: false, target: '20 reps', logged: '' },
  { id: '5', title: 'Mountain Climbers', completed: false, target: '50 reps', logged: '' }
];

export function useHomeWorkoutSupabase(selectedDate: Date) {
  const { user, isSignedIn } = useClerkUser();
  const supabaseClient = useSupabaseClient();
  const internalUserId = useSupabaseUserId(user?.id || null);
  
  const [workout, setWorkout] = useState<HomeWorkout | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const dateString = selectedDate.toISOString().split('T')[0]; // YYYY-MM-DD format

  // Load workout from Supabase
  useEffect(() => {
    loadWorkout();
  }, [dateString, internalUserId]);

  const loadWorkout = async () => {
    if (!isSignedIn || !internalUserId || !supabaseClient) {
      setIsLoading(false);
      return;
    }

    try {
      setError(null);
      
      // 🚀 STEP 1: Load from IndexedDB INSTANTLY
      const cachedWorkouts = await offlineDb.getWorkoutSessions(dateString);
      
      if (cachedWorkouts && cachedWorkouts.length > 0) {
        console.log(`⚡ INSTANT: Loaded workout from IndexedDB`);
        const cached = cachedWorkouts[0];
        setWorkout({
          id: cached.id,
          user_id: cached.user_id,
          date: cached.workout_date,
          workout_items: cached.items,
          completed_count: cached.completed_exercises,
          total_count: cached.total_exercises,
          completion_percentage: Math.round((cached.completed_exercises / cached.total_exercises) * 100),
          created_at: cached.created_at,
          updated_at: cached.updated_at
        });
        setIsLoading(false); // Instant load!
      } else {
        setIsLoading(false); // No cache, but don't block UI
      }

      // 🚀 STEP 2: Sync with Supabase in background (if online)
      if (navigator.onLine && supabaseClient) {
        const { data, error: queryError } = await supabaseClient
          .from('home_workouts')
          .select('*')
          .eq('user_id', internalUserId)
          .eq('date', dateString)
          .maybeSingle();

        if (queryError) {
          console.warn('⚠️ Supabase sync failed (using cached data):', queryError.message);
          return;
        }

        // If no workout exists, create default one
        if (!data) {
          const defaultWorkout = {
            user_id: internalUserId,
            date: dateString,
            workout_items: DEFAULT_WORKOUT_ITEMS,
            completed_count: 0,
            total_count: DEFAULT_WORKOUT_ITEMS.length,
            completion_percentage: 0
          };

          const { data: createdData, error: insertError } = await supabaseClient
            .from('home_workouts')
            .insert(defaultWorkout)
            .select()
            .single();

          if (!insertError && createdData) {
            // Cache the newly created workout
            await offlineDb.saveWorkoutSession({
              id: createdData.id,
              user_id: createdData.user_id,
              workout_date: createdData.date,
              items: createdData.workout_items,
              total_exercises: createdData.total_count,
              completed_exercises: createdData.completed_count,
              created_at: createdData.created_at,
              updated_at: createdData.updated_at
            }, false);
            setWorkout(createdData);
          }
        } else {
          // Cache the fetched workout
          await offlineDb.saveWorkoutSession({
            id: data.id,
            user_id: data.user_id,
            workout_date: data.date,
            items: data.workout_items,
            total_exercises: data.total_count,
            completed_exercises: data.completed_count,
            created_at: data.created_at,
            updated_at: data.updated_at
          }, false);
          setWorkout(data);
        }
      }

    } catch (err) {
      console.error('❌ Failed to load home workout:', err);
      setError(err instanceof Error ? err.message : 'Failed to load home workout');
      setIsLoading(false);
    }
  };

  // Toggle exercise completion
  const toggleExercise = async (exerciseId: string) => {
    if (!workout) return;

    try {
      setIsSaving(true);
      
      // Update local state immediately for responsiveness
      const updatedItems = workout.workout_items.map(item =>
        item.id === exerciseId ? { ...item, completed: !item.completed } : item
      );
      
      const completedCount = updatedItems.filter(item => item.completed).length;
      const completionPercentage = Math.round((completedCount / updatedItems.length) * 100);
      
      const updatedWorkout = {
        ...workout,
        workout_items: updatedItems,
        completed_count: completedCount,
        completion_percentage: completionPercentage,
        updated_at: new Date().toISOString()
      };
      
      setWorkout(updatedWorkout);

      // 🚀 STEP 1: Save to cache immediately
      await offlineDb.saveWorkoutSession({
        id: updatedWorkout.id,
        user_id: updatedWorkout.user_id,
        workout_date: updatedWorkout.date,
        items: updatedWorkout.workout_items,
        total_exercises: updatedWorkout.total_count,
        completed_exercises: updatedWorkout.completed_count,
        created_at: updatedWorkout.created_at,
        updated_at: updatedWorkout.updated_at
      }, true);

      // 🚀 STEP 2: Sync to Supabase if online
      if (navigator.onLine && supabaseClient) {
        const { error: updateError } = await supabaseClient
          .from('home_workouts')
          .update({
            workout_items: updatedItems,
            completed_count: completedCount,
            completion_percentage: completionPercentage,
            updated_at: updatedWorkout.updated_at
          })
          .eq('id', workout.id);

        if (updateError) {
          console.warn('⚠️ Supabase sync failed (queued for retry):', updateError.message);
        } else {
          await offlineDb.saveWorkoutSession({
            id: updatedWorkout.id,
            user_id: updatedWorkout.user_id,
            workout_date: updatedWorkout.date,
            items: updatedWorkout.workout_items,
            total_exercises: updatedWorkout.total_count,
            completed_exercises: updatedWorkout.completed_count,
            created_at: updatedWorkout.created_at,
            updated_at: updatedWorkout.updated_at
          }, false);
        }
      }

    } catch (err) {
      console.error('❌ Failed to toggle exercise:', err);
      setError(err instanceof Error ? err.message : 'Failed to update exercise');
      setWorkout(workout);
    } finally {
      setIsSaving(false);
    }
  };

  // Update exercise field (target, logged values)
  const updateExerciseField = async (exerciseId: string, field: string, value: string) => {
    if (!workout) return;

    try {
      setIsSaving(true);
      console.log(`🔄 Updating exercise ${exerciseId} field ${field} to ${value}`);
      
      // Update local state immediately for responsiveness
      const updatedItems = workout.workout_items.map(item =>
        item.id === exerciseId ? { ...item, [field]: value } : item
      );
      
      const updatedWorkout = {
        ...workout,
        workout_items: updatedItems
      };
      
      setWorkout(updatedWorkout);

      // Update database with debounce (500ms delay)
      setTimeout(async () => {
        try {
          const { error: updateError } = await supabaseClient
            .from('home_workouts')
            .update({
              workout_items: updatedItems,
              updated_at: new Date().toISOString()
            })
            .eq('id', workout.id);

          if (updateError) {
            throw updateError;
          }

          console.log(`✅ Successfully updated exercise ${exerciseId} field ${field}`);
        } catch (err) {
          console.error('❌ Failed to update exercise field:', err);
          setError(err instanceof Error ? err.message : 'Failed to update exercise');
        } finally {
          setIsSaving(false);
        }
      }, 500);

    } catch (err) {
      console.error('❌ Failed to update exercise field:', err);
      setError(err instanceof Error ? err.message : 'Failed to update exercise');
      setIsSaving(false);
    }
  };

  // Get completion progress for display
  const getCompletionProgress = () => {
    if (!workout) return { completed: 0, total: 0, percentage: 0 };
    
    return {
      completed: workout.completed_count,
      total: workout.total_count,
      percentage: workout.completion_percentage
    };
  };

  return {
    data: workout,
    isLoading,
    error,
    isSaving,
    toggleExercise,
    updateExerciseField,
    getCompletionProgress,
    refresh: loadWorkout
  };
}