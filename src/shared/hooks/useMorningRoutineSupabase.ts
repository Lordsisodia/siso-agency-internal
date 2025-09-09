/**
 * 🌅 Morning Routine Supabase Hook
 * 
 * Hook for managing morning routine data with Supabase
 * Based on successful patterns from useLightWorkTasksSupabase.ts and useDeepWorkTasksSupabase.ts
 */

import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';
import { supabaseClerkUserMapping } from '@/utils/supabase-clerk';

interface MorningRoutineItem {
  name: string;
  completed: boolean;
}

interface MorningRoutine {
  id: string;
  user_id: string;
  date: string;
  routine_type: 'morning' | 'evening';
  items: MorningRoutineItem[];
  completed_count: number;
  total_count: number;
  completion_percentage: number;
  created_at: string;
  updated_at: string;
}

const DEFAULT_MORNING_ROUTINE_ITEMS: MorningRoutineItem[] = [
  { name: 'wakeUp', completed: false },
  { name: 'getBloodFlowing', completed: false },
  { name: 'freshenUp', completed: false },
  { name: 'powerUpBrain', completed: false },
  { name: 'planDay', completed: false },
  { name: 'meditation', completed: false },
  { name: 'pushups', completed: false },
  { name: 'situps', completed: false },
  { name: 'pullups', completed: false },
  { name: 'bathroom', completed: false },
  { name: 'brushTeeth', completed: false },
  { name: 'coldShower', completed: false },
  { name: 'water', completed: false },
  { name: 'supplements', completed: false },
  { name: 'preworkout', completed: false },
  { name: 'thoughtDump', completed: false },
  { name: 'planDeepWork', completed: false },
  { name: 'planLightWork', completed: false },
  { name: 'setTimebox', completed: false }
];

export function useMorningRoutineSupabase(selectedDate: Date) {
  const [morningRoutine, setMorningRoutine] = useState<MorningRoutine | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const dateString = selectedDate.toISOString().split('T')[0]; // YYYY-MM-DD format

  // Load morning routine from Supabase
  useEffect(() => {
    loadMorningRoutine();
  }, [dateString]);

  const loadMorningRoutine = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('🌅 Loading morning routine from Supabase...');
      
      // Get internal user ID through Clerk mapping
      const internalUserId = await supabaseClerkUserMapping.getInternalUserId();
      if (!internalUserId) {
        throw new Error('Failed to get internal user ID');
      }

      // Query for existing routine
      const { data, error: queryError } = await supabase
        .from('daily_routines')
        .select('*')
        .eq('user_id', internalUserId)
        .eq('date', dateString)
        .eq('routine_type', 'morning')
        .maybeSingle(); // Use maybeSingle to handle no results gracefully

      if (queryError) {
        throw queryError;
      }

      // If no routine exists, create default one
      if (!data) {
        console.log('📝 Creating default morning routine...');
        
        const defaultRoutine = {
          user_id: internalUserId,
          date: dateString,
          routine_type: 'morning' as const,
          items: DEFAULT_MORNING_ROUTINE_ITEMS,
          completed_count: 0,
          total_count: DEFAULT_MORNING_ROUTINE_ITEMS.length,
          completion_percentage: 0
        };

        const { data: createdData, error: insertError } = await supabase
          .from('daily_routines')
          .insert(defaultRoutine)
          .select()
          .single();

        if (insertError) {
          throw insertError;
        }

        setMorningRoutine(createdData);
        console.log('✅ Created default morning routine');
      } else {
        setMorningRoutine(data);
        console.log('✅ Loaded existing morning routine');
      }

    } catch (err) {
      console.error('❌ Failed to load morning routine:', err);
      setError(err instanceof Error ? err.message : 'Failed to load morning routine');
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle habit completion
  const toggleHabit = async (habitName: string, completed: boolean) => {
    if (!morningRoutine) return;

    try {
      console.log(`🔄 Toggling habit ${habitName} to ${completed ? 'completed' : 'incomplete'}`);
      
      // Update local state immediately for responsiveness
      const updatedItems = morningRoutine.items.map(item =>
        item.name === habitName ? { ...item, completed } : item
      );
      
      const completedCount = updatedItems.filter(item => item.completed).length;
      const completionPercentage = Math.round((completedCount / updatedItems.length) * 100);
      
      const updatedRoutine = {
        ...morningRoutine,
        items: updatedItems,
        completed_count: completedCount,
        completion_percentage: completionPercentage
      };
      
      setMorningRoutine(updatedRoutine);

      // Update database - use snake_case column names to match schema
      const { error: updateError } = await supabase
        .from('daily_routines')
        .update({
          items: updatedItems,
          completed_count: completedCount,
          completion_percentage: completionPercentage,
          updated_at: new Date().toISOString()
        })
        .eq('id', morningRoutine.id);

      if (updateError) {
        // Revert local state on error
        setMorningRoutine(morningRoutine);
        throw updateError;
      }

      console.log(`✅ Successfully toggled habit ${habitName}`);

    } catch (err) {
      console.error('❌ Failed to toggle habit:', err);
      setError(err instanceof Error ? err.message : 'Failed to update habit');
      
      // Revert optimistic update on error
      setMorningRoutine(morningRoutine);
    }
  };

  return {
    morningRoutine,
    isLoading,
    error,
    toggleHabit,
    refresh: loadMorningRoutine
  };
}