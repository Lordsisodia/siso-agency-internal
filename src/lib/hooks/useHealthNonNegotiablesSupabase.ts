/**
 * 💖 Health Non-Negotiables Supabase Hook
 * 
 * Hook for managing nutrition tracking data with Supabase
 * Follows successful patterns from useMorningRoutineSupabase.ts
 */

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useClerkUser } from './useClerkUser';
import { useSupabaseClient, useSupabaseUserId } from '@/lib/supabase-clerk';
import { offlineDb } from '@/services/offline/offlineDb';

interface MealPlan {
  breakfast: string;
  lunch: string;
  dinner: string;
  snacks: string;
}

interface MacroTotals {
  calories: string;
  protein: string;
  carbs: string;
  fats: string;
}

interface HealthNonNegotiables {
  id: string;
  user_id: string;
  date: string;
  meals: MealPlan;
  daily_totals: MacroTotals;
  created_at: string;
  updated_at: string;
}

const DEFAULT_MEALS: MealPlan = {
  breakfast: '',
  lunch: '',
  dinner: '',
  snacks: ''
};

const DEFAULT_DAILY_TOTALS: MacroTotals = {
  calories: '',
  protein: '',
  carbs: '',
  fats: ''
};

export function useHealthNonNegotiablesSupabase(selectedDate: Date) {
  const { user, isSignedIn } = useClerkUser();
  const supabaseClient = useSupabaseClient();
  const internalUserId = useSupabaseUserId(user?.id || null);
  
  const [healthData, setHealthData] = useState<HealthNonNegotiables | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const dateString = selectedDate.toISOString().split('T')[0]; // YYYY-MM-DD format

  // Load health data from Supabase
  useEffect(() => {
    loadHealthData();
  }, [dateString, internalUserId]);

  const loadHealthData = async () => {
    if (!isSignedIn || !internalUserId || !supabaseClient) {
      setIsLoading(false);
      return;
    }

    try {
      setError(null);
      
      // 🚀 STEP 1: Load from IndexedDB INSTANTLY
      const cachedHabits = await offlineDb.getHealthHabits(dateString);
      
      if (cachedHabits && cachedHabits.length > 0) {
        console.log(`⚡ INSTANT: Loaded health habits from IndexedDB`);
        const cached = cachedHabits[0];
        setHealthData({
          id: cached.id,
          user_id: cached.user_id,
          date: cached.habit_date,
          meals: cached.habits?.meals || DEFAULT_MEALS,
          daily_totals: cached.habits?.daily_totals || DEFAULT_DAILY_TOTALS,
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
          .from('health_non_negotiables')
          .select('*')
          .eq('user_id', internalUserId)
          .eq('date', dateString)
          .maybeSingle();

        if (queryError) {
          console.warn('⚠️ Supabase sync failed (using cached data):', queryError.message);
          return;
        }

        // If no data exists, create default entry
        if (!data) {
          const defaultHealthData = {
            user_id: internalUserId,
            date: dateString,
            meals: DEFAULT_MEALS,
            daily_totals: DEFAULT_DAILY_TOTALS
          };

          const { data: createdData, error: insertError } = await supabaseClient
            .from('health_non_negotiables')
            .insert(defaultHealthData)
            .select()
            .single();

          if (!insertError && createdData) {
            // Cache the newly created data
            await offlineDb.saveHealthHabit({
              id: createdData.id,
              user_id: createdData.user_id,
              habit_date: createdData.date,
              habits: { meals: createdData.meals, daily_totals: createdData.daily_totals },
              created_at: createdData.created_at,
              updated_at: createdData.updated_at
            }, false);
            setHealthData(createdData);
          }
        } else {
          // Cache the fetched data
          await offlineDb.saveHealthHabit({
            id: data.id,
            user_id: data.user_id,
            habit_date: data.date,
            habits: { meals: data.meals, daily_totals: data.daily_totals },
            created_at: data.created_at,
            updated_at: data.updated_at
          }, false);
          setHealthData(data);
        }
      }

    } catch (err) {
      console.error('❌ Failed to load health non-negotiables:', err);
      setError(err instanceof Error ? err.message : 'Failed to load health data');
      setIsLoading(false);
    }
  };

  // Update meal field
  const updateMeal = async (mealType: keyof MealPlan, value: string) => {
    if (!healthData) return;

    try {
      setIsSaving(true);
      
      // Update local state immediately for responsiveness
      const updatedMeals = {
        ...healthData.meals,
        [mealType]: value
      };
      
      const updatedHealthData = {
        ...healthData,
        meals: updatedMeals,
        updated_at: new Date().toISOString()
      };
      
      setHealthData(updatedHealthData);

      // 🚀 Save to cache immediately
      await offlineDb.saveHealthHabit({
        id: updatedHealthData.id,
        user_id: updatedHealthData.user_id,
        habit_date: updatedHealthData.date,
        habits: { meals: updatedHealthData.meals, daily_totals: updatedHealthData.daily_totals },
        created_at: updatedHealthData.created_at,
        updated_at: updatedHealthData.updated_at
      }, true);

      // 🚀 Sync to Supabase if online (with debounce)
      setTimeout(async () => {
        if (navigator.onLine && supabaseClient) {
          const { error: updateError } = await supabaseClient
            .from('health_non_negotiables')
            .update({
              meals: updatedMeals,
              updated_at: updatedHealthData.updated_at
            })
            .eq('id', healthData.id);

          if (!updateError) {
            await offlineDb.saveHealthHabit({
              id: updatedHealthData.id,
              user_id: updatedHealthData.user_id,
              habit_date: updatedHealthData.date,
              habits: { meals: updatedHealthData.meals, daily_totals: updatedHealthData.daily_totals },
              created_at: updatedHealthData.created_at,
              updated_at: updatedHealthData.updated_at
            }, false);
          }
        }
        setIsSaving(false);
      }, 1000);

    } catch (err) {
      console.error('❌ Failed to update meal:', err);
      setError(err instanceof Error ? err.message : 'Failed to update meal');
      setIsSaving(false);
    }
  };

  // Update macro total
  const updateMacroTotal = async (macroType: keyof MacroTotals, value: string) => {
    if (!healthData) return;

    try {
      setIsSaving(true);
      console.log(`🔄 Updating macro ${macroType} to ${value}`);
      
      // Update local state immediately for responsiveness
      const updatedTotals = {
        ...healthData.daily_totals,
        [macroType]: value
      };
      
      const updatedHealthData = {
        ...healthData,
        daily_totals: updatedTotals
      };
      
      setHealthData(updatedHealthData);

      // Update database with shorter debounce (300ms delay for numeric fields)
      setTimeout(async () => {
        try {
          const { error: updateError } = await supabaseClient
            .from('health_non_negotiables')
            .update({
              daily_totals: updatedTotals,
              updated_at: new Date().toISOString()
            })
            .eq('id', healthData.id);

          if (updateError) {
            throw updateError;
          }

          console.log(`✅ Successfully updated macro ${macroType}`);
        } catch (err) {
          console.error('❌ Failed to update macro:', err);
          setError(err instanceof Error ? err.message : 'Failed to update macro');
        } finally {
          setIsSaving(false);
        }
      }, 300);

    } catch (err) {
      console.error('❌ Failed to update macro:', err);
      setError(err instanceof Error ? err.message : 'Failed to update macro');
      setIsSaving(false);
    }
  };

  // Add to macro total (for quick add buttons)
  const addToMacroTotal = async (macroType: keyof MacroTotals, amount: number) => {
    if (!healthData) return;

    const currentValue = parseInt(healthData.daily_totals[macroType] || '0');
    const newValue = (currentValue + amount).toString();
    
    await updateMacroTotal(macroType, newValue);
  };

  // Get current meal plan
  const getMealPlan = (): MealPlan => {
    return healthData?.meals || DEFAULT_MEALS;
  };

  // Get current macro totals
  const getMacroTotals = (): MacroTotals => {
    return healthData?.daily_totals || DEFAULT_DAILY_TOTALS;
  };

  return {
    data: healthData,
    isLoading,
    error,
    isSaving,
    updateMeal,
    updateMacroTotal,
    addToMacroTotal,
    getMealPlan,
    getMacroTotals,
    refresh: loadHealthData
  };
}