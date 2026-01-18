import { useState, useEffect } from 'react';
import { supabase } from '@/lib/services/supabase/client';

export interface WorkoutItem {
  id: string;
  name: string;
  completed: boolean;
  notes?: string;
}

export interface DailyWorkout {
  id?: string;
  user_id: string;
  date: string;
  workout_items: WorkoutItem[];
  total_duration?: number;
  workout_type?: string;
  intensity_level?: number;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export function useWorkoutSupabase(userId: string, date: string) {
  const [workout, setWorkout] = useState<DailyWorkout | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load workout for the given date
  useEffect(() => {
    if (!userId || !date) return;
    loadWorkout();
  }, [userId, date]);

  const loadWorkout = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('daily_workouts')
        .select('*')
        .eq('user_id', userId)
        .eq('date', date)
        .single();

      if (data && !error) {
        setWorkout({
          id: data.id,
          user_id: data.user_id,
          date: data.date,
          workout_items: data.workout_items || [],
          total_duration: data.total_duration,
          workout_type: data.workout_type,
          intensity_level: data.intensity_level,
          notes: data.notes || '',
          created_at: data.created_at,
          updated_at: data.updated_at
        });
      } else {
        // Create default workout if none exists
        const defaultWorkout: DailyWorkout = {
          user_id: userId,
          date,
          workout_items: [
            { id: 'morning-stretch', name: '🧘‍♂️ Morning Stretch (10 min)', completed: false },
            { id: 'cardio', name: '🏃‍♂️ Cardio (20 min)', completed: false },
            { id: 'strength', name: '💪 Strength Training (30 min)', completed: false },
            { id: 'cool-down', name: '🧊 Cool Down (5 min)', completed: false }
          ],
          workout_type: 'mixed',
          intensity_level: 5,
          notes: ''
        };
        setWorkout(defaultWorkout);
      }
    } catch (err) {
      console.error('Error loading workout:', err);
      setError(err instanceof Error ? err.message : 'Failed to load workout');
    } finally {
      setLoading(false);
    }
  };

  const saveWorkout = async (updatedWorkout: Partial<DailyWorkout>) => {
    try {
      setError(null);
      const newWorkout = { ...workout, ...updatedWorkout };

      if (workout?.id) {
        // Update existing workout
        const { data, error } = await supabase
          .from('daily_workouts')
          .update({
            workout_items: newWorkout.workout_items,
            total_duration: newWorkout.total_duration,
            workout_type: newWorkout.workout_type,
            intensity_level: newWorkout.intensity_level,
            notes: newWorkout.notes,
            updated_at: new Date().toISOString()
          })
          .eq('id', workout.id)
          .select()
          .single();

        if (data && !error) {
          setWorkout({
            ...newWorkout,
            id: data.id,
            created_at: data.created_at,
            updated_at: data.updated_at
          });
        }
      } else {
        // Create new workout
        const { data, error } = await supabase
          .from('daily_workouts')
          .insert({
            user_id: userId,
            date: date,
            workout_items: newWorkout.workout_items,
            total_duration: newWorkout.total_duration,
            workout_type: newWorkout.workout_type,
            intensity_level: newWorkout.intensity_level,
            notes: newWorkout.notes
          })
          .select()
          .single();

        if (data && !error) {
          setWorkout({
            ...newWorkout,
            id: data.id,
            created_at: data.created_at,
            updated_at: data.updated_at
          });
        }
      }
    } catch (err) {
      console.error('Error saving workout:', err);
      setError(err instanceof Error ? err.message : 'Failed to save workout');
    }
  };

  const updateField = (field: keyof DailyWorkout, value: any) => {
    if (!workout) return;
    const updated = { ...workout, [field]: value };
    setWorkout(updated);
    saveWorkout({ [field]: value });
  };

  const toggleWorkoutItem = (itemId: string) => {
    if (!workout) return;
    const updatedItems = workout.workout_items.map(item =>
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );
    updateField('workout_items', updatedItems);
  };

  const addWorkoutItem = (name: string) => {
    if (!workout || !name.trim()) return;
    const newItem: WorkoutItem = {
      id: `workout-${Date.now()}`,
      name: name.trim(),
      completed: false
    };
    const updatedItems = [...workout.workout_items, newItem];
    updateField('workout_items', updatedItems);
  };

  const removeWorkoutItem = (itemId: string) => {
    if (!workout) return;
    const updatedItems = workout.workout_items.filter(item => item.id !== itemId);
    updateField('workout_items', updatedItems);
  };

  const getCompletionPercentage = () => {
    if (!workout || workout.workout_items.length === 0) return 0;
    const completedCount = workout.workout_items.filter(item => item.completed).length;
    return Math.round((completedCount / workout.workout_items.length) * 100);
  };

  return {
    workout,
    loading,
    error,
    saveWorkout,
    updateField,
    toggleWorkoutItem,
    addWorkoutItem,
    removeWorkoutItem,
    getCompletionPercentage,
    reload: loadWorkout
  };
}