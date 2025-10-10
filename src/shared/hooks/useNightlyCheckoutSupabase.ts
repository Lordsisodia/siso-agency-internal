/**
 * 🌙 Nightly Checkout Supabase Hook
 * 
 * Hook for managing daily reflection and nightly checkout data with Supabase
 * Based on successful patterns from useMorningRoutineSupabase.ts
 */

import { useState, useEffect } from 'react';
import { supabase } from '@/shared/lib/supabase';
import { useClerkUser } from './useClerkUser';
import { useSupabaseClient, useSupabaseUserId } from '@/shared/lib/supabase-clerk';
import { offlineDb } from '@/shared/offline/offlineDb';

export interface NightlyCheckoutData {
  wentWell: string[];
  evenBetterIf: string[];
  analysis: string[];
  patterns: string[];
  changes: string[];
  overallRating?: number;
  keyLearnings: string;
  tomorrowFocus: string;
  bedTime?: string;
}

export interface NightlyCheckout {
  id: string;
  user_id: string;
  date: string;
  went_well: string[];
  even_better_if: string[];
  analysis: string[];
  patterns: string[];
  changes: string[];
  overall_rating?: number;
  key_learnings: string;
  tomorrow_focus: string;
  bed_time?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

const DEFAULT_NIGHTLY_CHECKOUT: NightlyCheckoutData = {
  wentWell: ['', '', ''],
  evenBetterIf: ['', '', '', '', ''],
  analysis: ['', '', ''],
  patterns: ['', '', ''],
  changes: ['', '', ''],
  overallRating: undefined,
  keyLearnings: '',
  tomorrowFocus: '',
  bedTime: ''
};

export function useNightlyCheckoutSupabase(selectedDate: Date) {
  const { user, isSignedIn } = useClerkUser();
  const supabaseClient = useSupabaseClient();
  const internalUserId = useSupabaseUserId(user?.id || null);
  
  const [nightlyCheckout, setNightlyCheckout] = useState<NightlyCheckoutData>(DEFAULT_NIGHTLY_CHECKOUT);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const dateKey = selectedDate.toISOString().split('T')[0];

  // Load nightly checkout data
  const loadNightlyCheckout = async () => {
    if (!internalUserId || !isSignedIn) {
      setIsLoading(false);
      return;
    }

    try {
      setError(null);

      // 🚀 STEP 1: Load from IndexedDB INSTANTLY
      const cachedCheckouts = await offlineDb.getNightlyCheckouts(dateKey);
      
      if (cachedCheckouts && cachedCheckouts.length > 0) {
        console.log(`⚡ INSTANT: Loaded nightly checkout from IndexedDB`);
        const cached = cachedCheckouts[0];
        setNightlyCheckout({
          wentWell: cached.wins || ['', '', ''],
          evenBetterIf: cached.improvements || ['', '', '', '', ''],
          analysis: [],
          patterns: [],
          changes: [],
          overallRating: undefined,
          keyLearnings: cached.reflection || '',
          tomorrowFocus: cached.tomorrow_focus || '',
          bedTime: ''
        });
        setIsLoading(false); // Instant load!
      } else {
        setNightlyCheckout(DEFAULT_NIGHTLY_CHECKOUT);
        setIsLoading(false); // No cache, but don't block UI
      }

      // 🚀 STEP 2: Sync with Supabase in background (if online)
      if (navigator.onLine && supabaseClient) {
        const { data, error: fetchError } = await supabaseClient
          .from('daily_reflections')
          .select('*')
          .eq('user_id', internalUserId)
          .eq('date', dateKey)
          .single();

        if (fetchError && fetchError.code !== 'PGRST116') {
          console.warn('⚠️ Supabase sync failed (using cached data):', fetchError.message);
          return;
        }

        if (data) {
          const checkoutData = {
            wentWell: data.went_well || ['', '', ''],
            evenBetterIf: data.even_better_if || ['', '', '', '', ''],
            analysis: data.analysis || ['', '', ''],
            patterns: data.patterns || ['', '', ''],
            changes: data.changes || ['', '', ''],
            overallRating: data.overall_rating,
            keyLearnings: data.key_learnings || '',
            tomorrowFocus: data.tomorrow_focus || '',
            bedTime: data.bed_time || ''
          };

          // Cache the fetched data
          await offlineDb.saveNightlyCheckout({
            id: data.id,
            user_id: data.user_id,
            checkout_date: data.date,
            reflection: data.key_learnings || '',
            wins: data.went_well || [],
            improvements: data.even_better_if || [],
            tomorrow_focus: data.tomorrow_focus || '',
            created_at: data.created_at,
            updated_at: data.updated_at
          }, false);
          
          setNightlyCheckout(checkoutData);
        }
      }
    } catch (err) {
      console.error('Error loading nightly checkout:', err);
      setError(err instanceof Error ? err.message : 'Failed to load nightly checkout data');
      setNightlyCheckout(DEFAULT_NIGHTLY_CHECKOUT);
      setIsLoading(false);
    }
  };

  // Save nightly checkout data
  const saveNightlyCheckout = async (data: Partial<NightlyCheckoutData>) => {
    if (!internalUserId || !isSignedIn) {
      throw new Error('User not authenticated');
    }

    try {
      setError(null);
      setIsSaving(true);

      const updateData = {
        user_id: internalUserId,
        date: dateKey,
        went_well: data.wentWell || nightlyCheckout.wentWell,
        even_better_if: data.evenBetterIf || nightlyCheckout.evenBetterIf,
        analysis: data.analysis || nightlyCheckout.analysis,
        patterns: data.patterns || nightlyCheckout.patterns,
        changes: data.changes || nightlyCheckout.changes,
        overall_rating: data.overallRating !== undefined ? data.overallRating : nightlyCheckout.overallRating,
        key_learnings: data.keyLearnings !== undefined ? data.keyLearnings : nightlyCheckout.keyLearnings,
        tomorrow_focus: data.tomorrowFocus !== undefined ? data.tomorrowFocus : nightlyCheckout.tomorrowFocus,
        bed_time: data.bedTime !== undefined ? data.bedTime : nightlyCheckout.bedTime,
        updated_at: new Date().toISOString()
      };

      // Update local state
      const newData = {
        wentWell: updateData.went_well,
        evenBetterIf: updateData.even_better_if,
        analysis: updateData.analysis,
        patterns: updateData.patterns,
        changes: updateData.changes,
        overallRating: updateData.overall_rating,
        keyLearnings: updateData.key_learnings,
        tomorrowFocus: updateData.tomorrow_focus,
        bedTime: updateData.bed_time
      };

      setNightlyCheckout(newData);

      // 🚀 STEP 1: Save to cache immediately
      const checkoutId = `checkout-${dateKey}-${internalUserId}`;
      await offlineDb.saveNightlyCheckout({
        id: checkoutId,
        user_id: internalUserId,
        checkout_date: dateKey,
        reflection: updateData.key_learnings,
        wins: updateData.went_well,
        improvements: updateData.even_better_if,
        tomorrow_focus: updateData.tomorrow_focus,
        created_at: new Date().toISOString(),
        updated_at: updateData.updated_at
      }, true);

      // 🚀 STEP 2: Sync to Supabase if online
      if (navigator.onLine && supabaseClient) {
        const { data: result, error: saveError } = await supabaseClient
          .from('daily_reflections')
          .upsert(updateData, {
            onConflict: 'user_id,date'
          })
          .select()
          .single();

        if (saveError) {
          console.warn('⚠️ Supabase sync failed (queued for retry):', saveError.message);
        } else {
          // Mark as synced
          await offlineDb.saveNightlyCheckout({
            id: result.id,
            user_id: result.user_id,
            checkout_date: result.date,
            reflection: result.key_learnings || '',
            wins: result.went_well || [],
            improvements: result.even_better_if || [],
            tomorrow_focus: result.tomorrow_focus || '',
            created_at: result.created_at,
            updated_at: result.updated_at
          }, false);
          return result;
        }
      }

    } catch (err) {
      console.error('Error saving nightly checkout:', err);
      setError(err instanceof Error ? err.message : 'Failed to save nightly checkout data');
      throw err;
    } finally {
      setIsSaving(false);
    }
  };

  // Update specific field
  const updateField = async (field: keyof NightlyCheckoutData, value: any) => {
    const updateData = { [field]: value };
    await saveNightlyCheckout(updateData);
  };

  // Update array field at specific index
  const updateArrayField = async (field: keyof NightlyCheckoutData, index: number, value: string) => {
    const currentArray = [...(nightlyCheckout[field] as string[])];
    currentArray[index] = value;
    const updateData = { [field]: currentArray };
    await saveNightlyCheckout(updateData);
  };

  // Add item to array field
  const addToArrayField = async (field: keyof NightlyCheckoutData) => {
    const currentArray = [...(nightlyCheckout[field] as string[])];
    currentArray.push('');
    const updateData = { [field]: currentArray };
    await saveNightlyCheckout(updateData);
  };

  // Remove item from array field
  const removeFromArrayField = async (field: keyof NightlyCheckoutData, index: number) => {
    const currentArray = [...(nightlyCheckout[field] as string[])];
    if (currentArray.length > 1) {
      currentArray.splice(index, 1);
      const updateData = { [field]: currentArray };
      await saveNightlyCheckout(updateData);
    }
  };

  // Apply voice analysis results
  const applyVoiceAnalysis = async (analysisResult: {
    wentWell: string[];
    evenBetterIf: string[];
    analysis: string[];
    patterns: string[];
    changes: string[];
  }) => {
    const updateData = {
      wentWell: [
        ...analysisResult.wentWell,
        ...Array(Math.max(0, 3 - analysisResult.wentWell.length)).fill('')
      ].slice(0, 3),
      evenBetterIf: [
        ...analysisResult.evenBetterIf,
        ...Array(Math.max(0, 5 - analysisResult.evenBetterIf.length)).fill('')
      ].slice(0, 5),
      analysis: [
        ...analysisResult.analysis,
        ...Array(Math.max(0, 3 - analysisResult.analysis.length)).fill('')
      ].slice(0, 3),
      patterns: [
        ...analysisResult.patterns,
        ...Array(Math.max(0, 3 - analysisResult.patterns.length)).fill('')
      ].slice(0, 3),
      changes: [
        ...analysisResult.changes,
        ...Array(Math.max(0, 3 - analysisResult.changes.length)).fill('')
      ].slice(0, 3)
    };

    await saveNightlyCheckout(updateData);
  };

  // Mark checkout as completed
  const markCompleted = async () => {
    try {
      await supabaseClient
        .from('daily_reflections')
        .update({ completed_at: new Date().toISOString() })
        .eq('user_id', internalUserId)
        .eq('date', dateKey);
    } catch (err) {
      console.error('Error marking checkout as completed:', err);
    }
  };

  // Calculate completion progress
  const getCompletionProgress = () => {
    const allInputs = [
      ...nightlyCheckout.wentWell,
      ...nightlyCheckout.evenBetterIf,
      ...nightlyCheckout.analysis,
      ...nightlyCheckout.patterns,
      ...nightlyCheckout.changes,
      nightlyCheckout.keyLearnings,
      nightlyCheckout.tomorrowFocus
    ];

    const completedInputs = allInputs.filter(input => 
      typeof input === 'string' ? input.trim() !== '' : input !== undefined
    ).length;

    const totalInputs = allInputs.length;
    return totalInputs > 0 ? (completedInputs / totalInputs) * 100 : 0;
  };

  // Load data when component mounts or date changes
  useEffect(() => {
    loadNightlyCheckout();
  }, [internalUserId, dateKey, isSignedIn]);

  // Auto-save when data changes (with debouncing)
  useEffect(() => {
    if (isLoading) return;

    const saveTimer = setTimeout(() => {
      if (internalUserId && isSignedIn) {
        saveNightlyCheckout(nightlyCheckout).catch(console.error);
      }
    }, 1000); // Debounce for 1 second

    return () => clearTimeout(saveTimer);
  }, [nightlyCheckout, internalUserId, isSignedIn, isLoading]);

  return {
    data: nightlyCheckout,
    isLoading,
    error,
    isSaving,
    updateField,
    updateArrayField,
    addToArrayField,
    removeFromArrayField,
    applyVoiceAnalysis,
    markCompleted,
    getCompletionProgress,
    refresh: loadNightlyCheckout
  };
}