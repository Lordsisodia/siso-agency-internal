/**
 * 🌙 Daily Reflections Hook - DIRECT SUPABASE VERSION
 * 
 * Connects nightly checkout directly to Supabase daily_reflections table
 * Replaces broken Prisma API with direct Supabase implementation
 */

import { useState, useCallback, useEffect } from 'react';
import { useClerkUser } from './useClerkUser';
import { useSupabaseClient, useSupabaseUserId } from '@/shared/lib/supabase-clerk';

export interface DailyReflection {
  id: string;
  userId: string;
  date: string;
  wentWell: string[];
  evenBetterIf: string[];
  analysis: string[];
  patterns: string[];
  changes: string[];
  overallRating?: number;
  keyLearnings?: string;
  tomorrowFocus?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UseDailyReflectionsProps {
  selectedDate: Date;
}

export function useDailyReflections({ selectedDate }: UseDailyReflectionsProps) {
  const { user, isSignedIn } = useClerkUser();
  const supabase = useSupabaseClient();
  const internalUserId = useSupabaseUserId(user?.id || null);
  const [reflection, setReflection] = useState<DailyReflection | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dateString = selectedDate?.toISOString()?.split('T')[0] || new Date().toISOString().split('T')[0];

  // Load daily reflection from Supabase
  const loadReflection = useCallback(async () => {
    if (!isSignedIn || !internalUserId || !supabase) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log(`🌙 Loading daily reflection from Supabase for ${dateString}...`);

      // Query Supabase directly
      const { data, error: reflectionError } = await supabase
        .from('daily_reflections')
        .select('*')
        .eq('user_id', internalUserId)
        .eq('date', dateString)
        .single();

      if (reflectionError && reflectionError.code !== 'PGRST116') {
        // PGRST116 = no rows found, which is OK for new dates
        throw new Error(`Supabase error: ${reflectionError.message}`);
      }

      if (data) {
        // Transform Supabase data to match our interface
        const transformedReflection: DailyReflection = {
          id: data.id,
          userId: data.user_id,
          date: data.date,
          wentWell: data.went_well || [],
          evenBetterIf: data.even_better_if || [],
          analysis: data.analysis || [],
          patterns: data.patterns || [],
          changes: data.changes || [],
          overallRating: data.overall_rating,
          keyLearnings: data.key_learnings || '',
          tomorrowFocus: data.tomorrow_focus || '',
          createdAt: data.created_at,
          updatedAt: data.updated_at
        };

        console.log(`✅ Loaded daily reflection from Supabase for ${dateString}`);
        setReflection(transformedReflection);
      } else {
        console.log(`📝 No reflection found for ${dateString}, will create on save`);
        setReflection(null);
      }

    } catch (error) {
      console.error('❌ Error loading daily reflection from Supabase:', error);
      setError(error instanceof Error ? error.message : 'Failed to load reflection from Supabase');
    } finally {
      setLoading(false);
    }
  }, [isSignedIn, internalUserId, dateString, supabase]);

  // Save daily reflection to Supabase
  const saveReflection = useCallback(async (reflectionData: Partial<DailyReflection>) => {
    if (!internalUserId || !supabase) return null;

    try {
      setSaving(true);
      setError(null);
      console.log(`🌙 Saving daily reflection to Supabase for ${dateString}...`);

      const { data, error } = await supabase
        .from('daily_reflections')
        .upsert({
          user_id: internalUserId,
          date: dateString,
          went_well: reflectionData.wentWell || [],
          even_better_if: reflectionData.evenBetterIf || [],
          analysis: reflectionData.analysis || [],
          patterns: reflectionData.patterns || [],
          changes: reflectionData.changes || [],
          overall_rating: reflectionData.overallRating,
          key_learnings: reflectionData.keyLearnings || '',
          tomorrow_focus: reflectionData.tomorrowFocus || '',
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,date'
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Supabase error: ${error.message}`);
      }

      const savedReflection: DailyReflection = {
        id: data.id,
        userId: data.user_id,
        date: data.date,
        wentWell: data.went_well || [],
        evenBetterIf: data.even_better_if || [],
        analysis: data.analysis || [],
        patterns: data.patterns || [],
        changes: data.changes || [],
        overallRating: data.overall_rating,
        keyLearnings: data.key_learnings || '',
        tomorrowFocus: data.tomorrow_focus || '',
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };

      console.log(`✅ Saved daily reflection to Supabase for ${dateString}`);
      setReflection(savedReflection);
      return savedReflection;

    } catch (error) {
      console.error('❌ Error saving daily reflection to Supabase:', error);
      setError(error instanceof Error ? error.message : 'Failed to save reflection to Supabase');
      return null;
    } finally {
      setSaving(false);
    }
  }, [internalUserId, dateString, supabase]);

  // Load reflection when dependencies change
  useEffect(() => {
    loadReflection();
  }, [loadReflection]);

  return {
    reflection,
    loading,
    saving,
    error,
    saveReflection,
    refreshReflection: loadReflection
  };
}