import { useState, useEffect } from 'react';
import { supabase } from '@/shared/lib/supabase';

interface MealData {
  breakfast: string;
  lunch: string;
  dinner: string;
  snacks: string;
}

interface MacroData {
  calories: string;
  protein: string;
  carbs: string;
  fats: string;
}

interface NutritionData {
  meals: MealData;
  macros: MacroData;
}

export function useNutritionSupabase(userId: string, date: string) {
  const [nutrition, setNutrition] = useState<NutritionData>({
    meals: { breakfast: '', lunch: '', dinner: '', snacks: '' },
    macros: { calories: '', protein: '', carbs: '', fats: '' }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Load nutrition data for the given date
  useEffect(() => {
    if (!userId || !date) return;
    loadNutrition();
  }, [userId, date]);

  const loadNutrition = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('daily_health')
        .select('meals, macros')
        .eq('user_id', userId)
        .eq('date', date)
        .single();

      if (data && !error) {
        setNutrition({
          meals: data.meals || { breakfast: '', lunch: '', dinner: '', snacks: '' },
          macros: data.macros || { calories: '', protein: '', carbs: '', fats: '' }
        });
      } else {
        // Keep default values if no record exists
        setNutrition({
          meals: { breakfast: '', lunch: '', dinner: '', snacks: '' },
          macros: { calories: '', protein: '', carbs: '', fats: '' }
        });
      }
    } catch (err) {
      console.error('Error loading nutrition data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load nutrition data');
    } finally {
      setLoading(false);
    }
  };

  const saveNutrition = async (updatedNutrition: Partial<NutritionData>) => {
    try {
      setSaving(true);
      setError(null);
      
      const newNutrition = { ...nutrition, ...updatedNutrition };

      // Try to update existing record first
      const { data: existingData } = await supabase
        .from('daily_health')
        .select('id')
        .eq('user_id', userId)
        .eq('date', date)
        .single();

      if (existingData) {
        // Update existing record
        const { error } = await supabase
          .from('daily_health')
          .update({
            meals: newNutrition.meals,
            macros: newNutrition.macros,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId)
          .eq('date', date);

        if (error) throw error;
      } else {
        // Create new record
        const { error } = await supabase
          .from('daily_health')
          .insert({
            user_id: userId,
            date: date,
            meals: newNutrition.meals,
            macros: newNutrition.macros,
            health_checklist: []
          });

        if (error) throw error;
      }

      setNutrition(newNutrition);
    } catch (err) {
      console.error('Error saving nutrition data:', err);
      setError(err instanceof Error ? err.message : 'Failed to save nutrition data');
    } finally {
      setSaving(false);
    }
  };

  const updateMeals = (meals: MealData) => {
    setNutrition(prev => ({ ...prev, meals }));
    saveNutrition({ meals });
  };

  const updateMacros = (macros: MacroData) => {
    setNutrition(prev => ({ ...prev, macros }));
    saveNutrition({ macros });
  };

  return {
    nutrition,
    loading,
    saving,
    error,
    updateMeals,
    updateMacros,
    reload: loadNutrition
  };
}