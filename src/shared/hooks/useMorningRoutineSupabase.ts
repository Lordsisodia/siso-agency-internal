/**
 * 🌅 Morning Routine Supabase Hook
 * 
 * Hook for managing morning routine data with Supabase
 * Based on successful patterns from useLightWorkTasksSupabase.ts and useDeepWorkTasksSupabase.ts
 */

import { useState, useEffect } from 'react';
import { supabase } from '@/shared/lib/supabase';
import { useClerkUser } from './useClerkUser';
import { useSupabaseClient, useSupabaseUserId } from '@/shared/lib/supabase-clerk';
import { offlineDb } from '@/shared/offline/offlineDb';

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
  const { user, isSignedIn } = useClerkUser();
  const supabaseClient = useSupabaseClient();
  const internalUserId = useSupabaseUserId(user?.id || null);
  
  const [morningRoutine, setMorningRoutine] = useState<MorningRoutine | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const dateString = selectedDate.toISOString().split('T')[0]; // YYYY-MM-DD format

  // Load morning routine from Supabase
  useEffect(() => {
    loadMorningRoutine();
  }, [dateString, internalUserId]);

  const loadMorningRoutine = async () => {
    if (!isSignedIn || !internalUserId || !supabaseClient) {
      setIsLoading(false);
      return;
    }

    try {
      setError(null);
      
      // 🚀 STEP 1: Load from IndexedDB INSTANTLY (no loading state)
      const cachedRoutines = await offlineDb.getMorningRoutines(dateString);
      
      if (cachedRoutines && cachedRoutines.length > 0) {
        console.log(`⚡ INSTANT: Loaded morning routine from IndexedDB`);
        setMorningRoutine(cachedRoutines[0]);
        setIsLoading(false); // Instant load!
      } else {
        setIsLoading(false); // No cache, but don't block UI
      }

      // 🚀 STEP 2: Sync with Supabase in background (if online)
      if (navigator.onLine && supabaseClient) {
        const { data, error: queryError } = await supabaseClient
          .from('daily_routines')
          .select('*')
          .eq('user_id', internalUserId)
          .eq('date', dateString)
          .eq('routine_type', 'morning')
          .maybeSingle();

        if (queryError) {
          console.warn('⚠️ Supabase sync failed (using cached data):', queryError.message);
          return;
        }

        // If no routine exists in Supabase, create default one
        if (!data) {
          const defaultRoutine = {
            user_id: internalUserId,
            date: dateString,
            routine_type: 'morning' as const,
            items: DEFAULT_MORNING_ROUTINE_ITEMS,
            completed_count: 0,
            total_count: DEFAULT_MORNING_ROUTINE_ITEMS.length,
            completion_percentage: 0
          };

          const { data: createdData, error: insertError } = await supabaseClient
            .from('daily_routines')
            .insert(defaultRoutine)
            .select()
            .single();

          if (!insertError && createdData) {
            // Cache the newly created routine
            await offlineDb.saveMorningRoutine(createdData, false);
            setMorningRoutine(createdData);
          }
        } else {
          // Cache the fetched routine
          await offlineDb.saveMorningRoutine(data, false);
          setMorningRoutine(data);
        }
      }

    } catch (err) {
      console.error('❌ Failed to load morning routine:', err);
      setError(err instanceof Error ? err.message : 'Failed to load morning routine');
      setIsLoading(false);
    }
  };

  // Toggle habit completion
  const toggleHabit = async (habitName: string, completed: boolean) => {
    if (!morningRoutine) return;

    try {
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
        completion_percentage: completionPercentage,
        updated_at: new Date().toISOString()
      };
      
      setMorningRoutine(updatedRoutine);

      // 🚀 STEP 1: Save to cache immediately
      await offlineDb.saveMorningRoutine(updatedRoutine, true);

      // 🚀 STEP 2: Sync to Supabase if online
      if (navigator.onLine && supabaseClient) {
        const { error: updateError } = await supabaseClient
          .from('daily_routines')
          .update({
            items: updatedItems,
            completed_count: completedCount,
            completion_percentage: completionPercentage,
            updated_at: updatedRoutine.updated_at
          })
          .eq('id', morningRoutine.id);

        if (updateError) {
          console.warn('⚠️ Supabase sync failed (queued for retry):', updateError.message);
          // Don't revert - cache has it, will sync later
        } else {
          // Mark as synced
          await offlineDb.saveMorningRoutine(updatedRoutine, false);
        }
      }

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