/**
 * 🏋️‍♂️ Home Workout Supabase Hook
 * 
 * Hook for managing home workout data with Supabase
 * Follows successful patterns from useMorningRoutineSupabase.ts
 */

import { useState, useEffect } from 'react';
import { supabase } from '@/shared/lib/supabase';
import { useClerkUser } from './useClerkUser';
import { useSupabaseClient, useSupabaseUserId } from '@/shared/lib/supabase-clerk';

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
      setIsLoading(true);
      setError(null);
      
      console.log('🏋️‍♂️ Loading home workout from Supabase...');

      // Query for existing workout
      const { data, error: queryError } = await supabaseClient
        .from('home_workouts')
        .select('*')
        .eq('user_id', internalUserId)
        .eq('date', dateString)
        .maybeSingle();

      if (queryError) {
        throw queryError;
      }

      // If no workout exists, create default one
      if (!data) {
        console.log('📝 Creating default home workout...');
        
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

        if (insertError) {
          throw insertError;
        }

        setWorkout(createdData);
        console.log('✅ Created default home workout');
      } else {
        setWorkout(data);
        console.log('✅ Loaded existing home workout');
      }

    } catch (err) {
      console.error('❌ Failed to load home workout:', err);
      setError(err instanceof Error ? err.message : 'Failed to load home workout');
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle exercise completion
  const toggleExercise = async (exerciseId: string) => {
    if (!workout) return;

    try {
      setIsSaving(true);
      console.log(`🔄 Toggling exercise ${exerciseId}`);
      
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
        completion_percentage: completionPercentage
      };
      
      setWorkout(updatedWorkout);

      // Update database
      const { error: updateError } = await supabaseClient
        .from('home_workouts')
        .update({
          workout_items: updatedItems,
          completed_count: completedCount,
          completion_percentage: completionPercentage,
          updated_at: new Date().toISOString()
        })
        .eq('id', workout.id);

      if (updateError) {
        // Revert local state on error
        setWorkout(workout);
        throw updateError;
      }

      console.log(`✅ Successfully toggled exercise ${exerciseId}`);

    } catch (err) {
      console.error('❌ Failed to toggle exercise:', err);
      setError(err instanceof Error ? err.message : 'Failed to update exercise');
      
      // Revert optimistic update on error
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