import { useState, useEffect } from 'react';
import { supabase } from '@/shared/lib/supabase';

export interface DailyReflection {
  id?: string;
  user_id: string;
  date: string;
  went_well: string[];
  even_better_if: string[];
  analysis: string[];
  patterns: string[];
  changes: string[];
  overall_rating?: number;
  key_learnings?: string;
  tomorrow_focus?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export function useNightlyCheckoutSupabase(userId: string, date: string) {
  const [reflection, setReflection] = useState<DailyReflection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load reflection for the given date
  useEffect(() => {
    if (!userId || !date) return;
    
    loadReflection();
  }, [userId, date]);

  const loadReflection = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('daily_reflections')
        .select('*')
        .eq('user_id', userId)
        .eq('date', date)
        .single();

      if (data && !error) {
        setReflection({
          id: data.id,
          user_id: data.user_id,
          date: data.date,
          went_well: data.went_well || ['', '', ''],
          even_better_if: data.even_better_if || ['', '', '', '', ''],
          analysis: data.analysis || ['', '', ''],
          patterns: data.patterns || ['', '', ''],
          changes: data.changes || ['', '', ''],
          overall_rating: data.overall_rating,
          key_learnings: data.key_learnings || '',
          tomorrow_focus: data.tomorrow_focus || '',
          notes: data.notes || '',
          created_at: data.created_at,
          updated_at: data.updated_at
        });
      } else {
        // Create default reflection if none exists
        const defaultReflection: DailyReflection = {
          user_id: userId,
          date,
          went_well: ['', '', ''],
          even_better_if: ['', '', '', '', ''],
          analysis: ['', '', ''],
          patterns: ['', '', ''],
          changes: ['', '', ''],
          overall_rating: undefined,
          key_learnings: '',
          tomorrow_focus: '',
          notes: ''
        };
        setReflection(defaultReflection);
      }
    } catch (err) {
      console.error('Error loading reflection:', err);
      setError(err instanceof Error ? err.message : 'Failed to load reflection');
    } finally {
      setLoading(false);
    }
  };

  const saveReflection = async (updatedReflection: Partial<DailyReflection>) => {
    try {
      setError(null);

      const newReflection = { ...reflection, ...updatedReflection };

      if (reflection?.id) {
        // Update existing reflection
        const { data, error } = await supabase
          .from('daily_reflections')
          .update({
            went_well: newReflection.went_well,
            even_better_if: newReflection.even_better_if,
            analysis: newReflection.analysis,
            patterns: newReflection.patterns,
            changes: newReflection.changes,
            overall_rating: newReflection.overall_rating,
            key_learnings: newReflection.key_learnings,
            tomorrow_focus: newReflection.tomorrow_focus,
            notes: newReflection.notes,
            updated_at: new Date().toISOString()
          })
          .eq('id', reflection.id)
          .select()
          .single();

        if (data && !error) {
          setReflection({
            ...newReflection,
            id: data.id,
            created_at: data.created_at,
            updated_at: data.updated_at
          });
        }
      } else {
        // Create new reflection
        const { data, error } = await supabase
          .from('daily_reflections')
          .insert({
            user_id: userId,
            date: date,
            went_well: newReflection.went_well,
            even_better_if: newReflection.even_better_if,
            analysis: newReflection.analysis,
            patterns: newReflection.patterns,
            changes: newReflection.changes,
            overall_rating: newReflection.overall_rating,
            key_learnings: newReflection.key_learnings,
            tomorrow_focus: newReflection.tomorrow_focus,
            notes: newReflection.notes
          })
          .select()
          .single();

        if (data && !error) {
          setReflection({
            ...newReflection,
            id: data.id,
            created_at: data.created_at,
            updated_at: data.updated_at
          });
        }
      }
    } catch (err) {
      console.error('Error saving reflection:', err);
      // Handle foreign key constraint error gracefully
      if (err && typeof err === 'object' && 'code' in err && err.code === '23503') {
        console.warn('User not found in users table, data will be saved locally only');
        // Don't set error for foreign key constraint - just skip database save
        return;
      }
      setError(err instanceof Error ? err.message : 'Failed to save reflection');
    }
  };

  const updateField = (field: keyof DailyReflection, value: any) => {
    if (!reflection) return;
    
    const updated = { ...reflection, [field]: value };
    setReflection(updated);
    
    // Auto-save after field update
    saveReflection({ [field]: value });
  };

  const addToArray = (field: 'went_well' | 'even_better_if' | 'analysis' | 'patterns' | 'changes', item: string) => {
    if (!reflection || !item.trim()) return;
    
    const currentArray = reflection[field] || [];
    const updatedArray = [...currentArray, item.trim()];
    updateField(field, updatedArray);
  };

  const removeFromArray = (field: 'went_well' | 'even_better_if' | 'analysis' | 'patterns' | 'changes', index: number) => {
    if (!reflection) return;
    
    const currentArray = reflection[field] || [];
    const updatedArray = currentArray.filter((_, i) => i !== index);
    updateField(field, updatedArray);
  };

  const updateArrayItem = (field: 'went_well' | 'even_better_if' | 'analysis' | 'patterns' | 'changes', index: number, value: string) => {
    if (!reflection) return;
    
    const currentArray = reflection[field] || [];
    const updatedArray = [...currentArray];
    updatedArray[index] = value;
    updateField(field, updatedArray);
  };

  return {
    reflection,
    loading,
    error,
    saveReflection,
    updateField,
    addToArray,
    removeFromArray,
    updateArrayItem,
    reload: loadReflection
  };
}