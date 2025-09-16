import { useState, useEffect } from 'react';
import { supabase } from '@/shared/lib/supabase';

export interface HealthItem {
  id: string;
  name: string;
  completed: boolean;
  value?: string | number;
  unit?: string;
  notes?: string;
}

export interface DailyHealth {
  id?: string;
  user_id: string;
  date: string;
  nutrition_items: HealthItem[];
  hydration_goal?: number;
  hydration_actual?: number;
  sleep_hours?: number;
  mood_rating?: number;
  energy_rating?: number;
  stress_level?: number;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export function useHealthSupabase(userId: string, date: string) {
  const [health, setHealth] = useState<DailyHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load health data for the given date
  useEffect(() => {
    if (!userId || !date) return;
    loadHealth();
  }, [userId, date]);

  const loadHealth = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('daily_health')
        .select('*')
        .eq('user_id', userId)
        .eq('date', date)
        .single();

      if (data && !error) {
        setHealth({
          id: data.id,
          user_id: data.user_id,
          date: data.date,
          nutrition_items: data.nutrition_items || [],
          hydration_goal: data.hydration_goal,
          hydration_actual: data.hydration_actual,
          sleep_hours: data.sleep_hours,
          mood_rating: data.mood_rating,
          energy_rating: data.energy_rating,
          stress_level: data.stress_level,
          notes: data.notes || '',
          created_at: data.created_at,
          updated_at: data.updated_at
        });
      } else {
        // Create default health tracking if none exists
        const defaultHealth: DailyHealth = {
          user_id: userId,
          date,
          nutrition_items: [
            { id: 'breakfast', name: '🍳 Healthy Breakfast', completed: false },
            { id: 'lunch', name: '🥗 Nutritious Lunch', completed: false },
            { id: 'dinner', name: '🍽️ Balanced Dinner', completed: false },
            { id: 'snacks', name: '🥜 Healthy Snacks', completed: false },
            { id: 'vitamins', name: '💊 Daily Vitamins', completed: false },
            { id: 'water', name: '💧 8 Glasses of Water', completed: false }
          ],
          hydration_goal: 8,
          hydration_actual: 0,
          mood_rating: 5,
          energy_rating: 5,
          stress_level: 5,
          notes: ''
        };
        setHealth(defaultHealth);
      }
    } catch (err) {
      console.error('Error loading health data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load health data');
    } finally {
      setLoading(false);
    }
  };

  const saveHealth = async (updatedHealth: Partial<DailyHealth>) => {
    try {
      setError(null);
      const newHealth = { ...health, ...updatedHealth };

      if (health?.id) {
        // Update existing health record
        const { data, error } = await supabase
          .from('daily_health')
          .update({
            nutrition_items: newHealth.nutrition_items,
            hydration_goal: newHealth.hydration_goal,
            hydration_actual: newHealth.hydration_actual,
            sleep_hours: newHealth.sleep_hours,
            mood_rating: newHealth.mood_rating,
            energy_rating: newHealth.energy_rating,
            stress_level: newHealth.stress_level,
            notes: newHealth.notes,
            updated_at: new Date().toISOString()
          })
          .eq('id', health.id)
          .select()
          .single();

        if (data && !error) {
          setHealth({
            ...newHealth,
            id: data.id,
            created_at: data.created_at,
            updated_at: data.updated_at
          });
        }
      } else {
        // Create new health record
        const { data, error } = await supabase
          .from('daily_health')
          .insert({
            user_id: userId,
            date: date,
            nutrition_items: newHealth.nutrition_items,
            hydration_goal: newHealth.hydration_goal,
            hydration_actual: newHealth.hydration_actual,
            sleep_hours: newHealth.sleep_hours,
            mood_rating: newHealth.mood_rating,
            energy_rating: newHealth.energy_rating,
            stress_level: newHealth.stress_level,
            notes: newHealth.notes
          })
          .select()
          .single();

        if (data && !error) {
          setHealth({
            ...newHealth,
            id: data.id,
            created_at: data.created_at,
            updated_at: data.updated_at
          });
        }
      }
    } catch (err) {
      console.error('Error saving health data:', err);
      setError(err instanceof Error ? err.message : 'Failed to save health data');
    }
  };

  const updateField = (field: keyof DailyHealth, value: any) => {
    if (!health) return;
    const updated = { ...health, [field]: value };
    setHealth(updated);
    saveHealth({ [field]: value });
  };

  const toggleNutritionItem = (itemId: string) => {
    if (!health) return;
    const updatedItems = health.nutrition_items.map(item =>
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );
    updateField('nutrition_items', updatedItems);
  };

  const addNutritionItem = (name: string) => {
    if (!health || !name.trim()) return;
    const newItem: HealthItem = {
      id: `nutrition-${Date.now()}`,
      name: name.trim(),
      completed: false
    };
    const updatedItems = [...health.nutrition_items, newItem];
    updateField('nutrition_items', updatedItems);
  };

  const removeNutritionItem = (itemId: string) => {
    if (!health) return;
    const updatedItems = health.nutrition_items.filter(item => item.id !== itemId);
    updateField('nutrition_items', updatedItems);
  };

  const getCompletionPercentage = () => {
    if (!health || health.nutrition_items.length === 0) return 0;
    const completedCount = health.nutrition_items.filter(item => item.completed).length;
    return Math.round((completedCount / health.nutrition_items.length) * 100);
  };

  const getHydrationPercentage = () => {
    if (!health || !health.hydration_goal) return 0;
    const actual = health.hydration_actual || 0;
    return Math.min(Math.round((actual / health.hydration_goal) * 100), 100);
  };

  return {
    health,
    loading,
    error,
    saveHealth,
    updateField,
    toggleNutritionItem,
    addNutritionItem,
    removeNutritionItem,
    getCompletionPercentage,
    getHydrationPercentage,
    reload: loadHealth
  };
}