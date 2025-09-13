/**
 * 💖 Health Non-Negotiables Supabase Hook
 * 
 * Hook for managing nutrition tracking data with Supabase
 * Follows successful patterns from useMorningRoutineSupabase.ts
 */

import { useState, useEffect } from 'react';
import { supabase } from '@/shared/lib/supabase';
import { useClerkUser } from './useClerkUser';
import { useSupabaseClient, useSupabaseUserId } from '@/shared/lib/supabase-clerk';

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
      setIsLoading(true);
      setError(null);
      
      console.log('💖 Loading health non-negotiables from Supabase...');

      // Query for existing health data
      const { data, error: queryError } = await supabaseClient
        .from('health_non_negotiables')
        .select('*')
        .eq('user_id', internalUserId)
        .eq('date', dateString)
        .maybeSingle();

      if (queryError) {
        throw queryError;
      }

      // If no data exists, create default entry
      if (!data) {
        console.log('📝 Creating default health non-negotiables...');
        
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

        if (insertError) {
          throw insertError;
        }

        setHealthData(createdData);
        console.log('✅ Created default health non-negotiables');
      } else {
        setHealthData(data);
        console.log('✅ Loaded existing health non-negotiables');
      }

    } catch (err) {
      console.error('❌ Failed to load health non-negotiables:', err);
      setError(err instanceof Error ? err.message : 'Failed to load health data');
    } finally {
      setIsLoading(false);
    }
  };

  // Update meal field
  const updateMeal = async (mealType: keyof MealPlan, value: string) => {
    if (!healthData) return;

    try {
      setIsSaving(true);
      console.log(`🔄 Updating meal ${mealType}`);
      
      // Update local state immediately for responsiveness
      const updatedMeals = {
        ...healthData.meals,
        [mealType]: value
      };
      
      const updatedHealthData = {
        ...healthData,
        meals: updatedMeals
      };
      
      setHealthData(updatedHealthData);

      // Update database with debounce (1000ms delay for text fields)
      setTimeout(async () => {
        try {
          const { error: updateError } = await supabaseClient
            .from('health_non_negotiables')
            .update({
              meals: updatedMeals,
              updated_at: new Date().toISOString()
            })
            .eq('id', healthData.id);

          if (updateError) {
            throw updateError;
          }

          console.log(`✅ Successfully updated meal ${mealType}`);
        } catch (err) {
          console.error('❌ Failed to update meal:', err);
          setError(err instanceof Error ? err.message : 'Failed to update meal');
        } finally {
          setIsSaving(false);
        }
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