/**
 * 🌙 Daily Reflections Hook - OFFLINE-FIRST PWA VERSION
 *
 * Architecture:
 * 1. IndexedDB (offlineDb) - Primary storage, works offline
 * 2. Supabase - Cloud sync when online
 * 3. Auto-sync queue when offline
 */

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useClerkUser } from '@/lib/hooks/auth/useClerkUser';
import { useSupabaseUserId } from '@/lib/services/supabase/clerk-integration';
import { unifiedDataService } from '@/services/shared/unified-data.service';

// Nightly Checkout Metrics Types
export interface MeditationMetrics {
  minutes?: number;
  quality?: number; // 1-100
}

export interface WorkoutMetrics {
  completed?: boolean;
  type?: string; // e.g., "strength", "cardio", "hiit", "yoga"
  duration?: number; // minutes
  intensity?: string; // e.g., "low", "medium", "high"
}

export interface NutritionMetrics {
  calories?: number;
  protein?: number; // grams
  carbs?: number; // grams
  fats?: number; // grams
  hit_goal?: boolean;
}

export interface DeepWorkMetrics {
  hours?: number;
  quality?: number; // 1-100
}

export interface ResearchMetrics {
  hours?: number;
  topic?: string;
  notes?: string;
}

export interface SleepMetrics {
  hours?: number;
  bed_time?: string; // ISO time string
  wake_time?: string; // ISO time string
  quality?: number; // 1-100
}

export interface NightlyCheckoutMetrics {
  meditation?: MeditationMetrics;
  workout?: WorkoutMetrics;
  nutrition?: NutritionMetrics;
  deep_work?: DeepWorkMetrics;
  research?: ResearchMetrics;
  sleep?: SleepMetrics;
}

export interface DailyReflection {
  id: string;
  userId: string;
  date: string;
  winOfDay?: string; // NEW: Biggest win of the day
  mood?: string; // NEW: Quick mood selector
  bedTime?: string; // ✅ FIXED: Added bedTime field
  wentWell: string[];
  evenBetterIf: string[];
  dailyAnalysis: string;
  actionItems: string;
  overallRating?: number;
  energyLevel?: number; // NEW: 1-10 energy rating
  keyLearnings?: string;
  tomorrowFocus?: string;
  tomorrowTopTasks?: string[]; // NEW: Top 3 specific tasks
  // NEW: Nightly checkout metrics
  meditation?: MeditationMetrics;
  workout?: WorkoutMetrics;
  nutrition?: NutritionMetrics;
  deep_work?: DeepWorkMetrics;
  research?: ResearchMetrics;
  sleep?: SleepMetrics;
  createdAt: string;
  updatedAt: string;
}

export interface UseDailyReflectionsProps {
  selectedDate: Date;
  includePreviousDay?: boolean;
}

export function useDailyReflections({ selectedDate, includePreviousDay = false }: UseDailyReflectionsProps) {
  const { user, isSignedIn } = useClerkUser();
  const internalUserId = useSupabaseUserId(user?.id || null);
  const [reflection, setReflection] = useState<DailyReflection | null>(null);
  const [previousReflection, setPreviousReflection] = useState<DailyReflection | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dateString = selectedDate?.toISOString()?.split('T')[0] || new Date().toISOString().split('T')[0];
  const previousDateString = useMemo(() => {
    if (!includePreviousDay) return null;
    const previousDate = new Date(selectedDate);
    previousDate.setDate(previousDate.getDate() - 1);
    return previousDate.toISOString().split('T')[0];
  }, [includePreviousDay, selectedDate]);

  // Load daily reflection - OFFLINE-FIRST
  const loadReflection = useCallback(async () => {
    if (!isSignedIn || !internalUserId) {
      setLoading(false);
      setReflection(null);
      setPreviousReflection(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      
      if (includePreviousDay && previousDateString) {
        const reflections = await unifiedDataService.getDailyReflections(internalUserId, [dateString, previousDateString]);
        const currentReflection = reflections[dateString] || null;
        const priorReflection = reflections[previousDateString] || null;

        if (currentReflection) {
          const transformedReflection: DailyReflection = {
            id: currentReflection.id || '',
            userId: currentReflection.user_id,
            date: currentReflection.date,
            winOfDay: currentReflection.winOfDay || '',
            mood: currentReflection.mood || '',
            bedTime: currentReflection.bedTime || '',
            wentWell: currentReflection.wentWell || [],
            evenBetterIf: currentReflection.evenBetterIf || [],
            dailyAnalysis: currentReflection.dailyAnalysis || '',
            actionItems: currentReflection.actionItems || '',
            overallRating: currentReflection.overallRating,
            energyLevel: currentReflection.energyLevel,
            keyLearnings: currentReflection.keyLearnings || '',
            tomorrowFocus: currentReflection.tomorrowFocus || '',
            tomorrowTopTasks: currentReflection.tomorrowTopTasks || [],
            createdAt: currentReflection.created_at || new Date().toISOString(),
            updatedAt: currentReflection.updated_at || new Date().toISOString()
          };

          
          setReflection(transformedReflection);
        } else {
          
          setReflection(null);
        }

        if (priorReflection) {
          const transformedPrevious: DailyReflection = {
            id: priorReflection.id || '',
            userId: priorReflection.user_id,
            date: priorReflection.date,
            winOfDay: priorReflection.winOfDay || '',
            mood: priorReflection.mood || '',
            bedTime: priorReflection.bedTime || '',
            wentWell: priorReflection.wentWell || [],
            evenBetterIf: priorReflection.evenBetterIf || [],
            dailyAnalysis: priorReflection.dailyAnalysis || '',
            actionItems: priorReflection.actionItems || '',
            overallRating: priorReflection.overallRating,
            energyLevel: priorReflection.energyLevel,
            keyLearnings: priorReflection.keyLearnings || '',
            tomorrowFocus: priorReflection.tomorrowFocus || '',
            tomorrowTopTasks: priorReflection.tomorrowTopTasks || [],
            createdAt: priorReflection.created_at || new Date().toISOString(),
            updatedAt: priorReflection.updated_at || new Date().toISOString()
          };

          setPreviousReflection(transformedPrevious);
        } else {
          setPreviousReflection(null);
        }
      } else {
        // Use unified data service (IndexedDB first, then Supabase if online)
        const data = await unifiedDataService.getDailyReflection(internalUserId, dateString);

        if (data) {
          // Transform to match our interface
          const transformedReflection: DailyReflection = {
            id: data.id || '',
            userId: data.user_id,
            date: data.date,
            winOfDay: data.winOfDay || '',
            mood: data.mood || '',
            bedTime: data.bedTime || '', // ✅ FIXED: Include bedTime when loading
            wentWell: data.wentWell || [],
            evenBetterIf: data.evenBetterIf || [],
            dailyAnalysis: data.dailyAnalysis || '',
            actionItems: data.actionItems || '',
            overallRating: data.overallRating,
            energyLevel: data.energyLevel,
            keyLearnings: data.keyLearnings || '',
            tomorrowFocus: data.tomorrowFocus || '',
            tomorrowTopTasks: data.tomorrowTopTasks || [],
            createdAt: data.created_at || new Date().toISOString(),
            updatedAt: data.updated_at || new Date().toISOString()
          };

          
          setReflection(transformedReflection);
        } else {
          
          setReflection(null);
        }

        setPreviousReflection(null);
      }

    } catch (error) {
      console.error('❌ Error loading daily reflection:', error);
      setError(error instanceof Error ? error.message : 'Failed to load reflection');
    } finally {
      setLoading(false);
    }
  }, [isSignedIn, internalUserId, dateString, includePreviousDay, previousDateString]);

  // Save daily reflection - OFFLINE-FIRST
  const saveReflection = useCallback(async (reflectionData: Partial<DailyReflection>) => {
    if (!internalUserId) return null;

    try {
      setSaving(true);
      setError(null);
      

      // Use unified data service (saves to IndexedDB + syncs to Supabase if online)
      // IMPORTANT: Use snake_case field names to match Supabase schema
      await unifiedDataService.saveDailyReflection({
        user_id: internalUserId,
        date: dateString,
        winOfDay: reflectionData.winOfDay || '',
        mood: reflectionData.mood || '',
        bedTime: reflectionData.bedTime || '', // ✅ FIXED: Include bedTime in save
        wentWell: reflectionData.wentWell || [],
        evenBetterIf: reflectionData.evenBetterIf || [],
        dailyAnalysis: reflectionData.dailyAnalysis || '',
        actionItems: reflectionData.actionItems || '',
        overallRating: reflectionData.overallRating,
        energyLevel: reflectionData.energyLevel,
        keyLearnings: reflectionData.keyLearnings || '',
        tomorrowFocus: reflectionData.tomorrowFocus || '',
        tomorrowTopTasks: reflectionData.tomorrowTopTasks || []
      });

      const savedReflection: DailyReflection = {
        id: reflection?.id || '',
        userId: internalUserId,
        date: dateString,
        winOfDay: reflectionData.winOfDay || '',
        mood: reflectionData.mood || '',
        bedTime: reflectionData.bedTime || '', // ✅ FIXED: Include bedTime in return
        wentWell: reflectionData.wentWell || [],
        evenBetterIf: reflectionData.evenBetterIf || [],
        dailyAnalysis: reflectionData.dailyAnalysis || '',
        actionItems: reflectionData.actionItems || '',
        overallRating: reflectionData.overallRating,
        energyLevel: reflectionData.energyLevel,
        keyLearnings: reflectionData.keyLearnings || '',
        tomorrowFocus: reflectionData.tomorrowFocus || '',
        tomorrowTopTasks: reflectionData.tomorrowTopTasks || [],
        createdAt: reflection?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      
      setReflection(savedReflection);
      return savedReflection;

    } catch (error) {
      console.error('❌ Error saving daily reflection:', error);
      setError(error instanceof Error ? error.message : 'Failed to save reflection');
      return null;
    } finally {
      setSaving(false);
    }
  }, [internalUserId, dateString, reflection]);

  // Load reflection when dependencies change
  useEffect(() => {
    loadReflection();
  }, [loadReflection]);

  return {
    reflection,
    previousReflection,
    loading,
    saving,
    error,
    saveReflection,
    refreshReflection: loadReflection
  };
}