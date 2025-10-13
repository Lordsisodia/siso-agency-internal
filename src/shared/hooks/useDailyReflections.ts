/**
 * 🌙 Daily Reflections Hook - OFFLINE-FIRST PWA VERSION
 *
 * Architecture:
 * 1. IndexedDB (offlineDb) - Primary storage, works offline
 * 2. Supabase - Cloud sync when online
 * 3. Auto-sync queue when offline
 */

import { useState, useCallback, useEffect } from 'react';
import { useClerkUser } from './useClerkUser';
import { useSupabaseClient, useSupabaseUserId } from '@/shared/lib/supabase-clerk';
import { unifiedDataService } from '@/shared/services/unified-data.service';

export interface DailyReflection {
  id: string;
  userId: string;
  date: string;
  winOfDay?: string; // NEW: Biggest win of the day
  mood?: string; // NEW: Quick mood selector
  wentWell: string[];
  evenBetterIf: string[];
  dailyAnalysis: string;
  actionItems: string;
  overallRating?: number;
  energyLevel?: number; // NEW: 1-10 energy rating
  keyLearnings?: string;
  tomorrowFocus?: string;
  tomorrowTopTasks?: string[]; // NEW: Top 3 specific tasks
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

  // Load daily reflection - OFFLINE-FIRST
  const loadReflection = useCallback(async () => {
    if (!isSignedIn || !internalUserId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log(`🌙 Loading daily reflection (offline-first) for ${dateString}...`);

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

        console.log(`✅ Loaded daily reflection (${navigator.onLine ? 'online' : 'offline'}) for ${dateString}`);
        setReflection(transformedReflection);
      } else {
        console.log(`📝 No reflection found for ${dateString}, will create on save`);
        setReflection(null);
      }

    } catch (error) {
      console.error('❌ Error loading daily reflection:', error);
      setError(error instanceof Error ? error.message : 'Failed to load reflection');
    } finally {
      setLoading(false);
    }
  }, [isSignedIn, internalUserId, dateString]);

  // Save daily reflection - OFFLINE-FIRST
  const saveReflection = useCallback(async (reflectionData: Partial<DailyReflection>) => {
    if (!internalUserId) return null;

    try {
      setSaving(true);
      setError(null);
      console.log(`🌙 Saving daily reflection (offline-first) for ${dateString}...`);

      // Use unified data service (saves to IndexedDB + syncs to Supabase if online)
      await unifiedDataService.saveDailyReflection({
        user_id: internalUserId,
        date: dateString,
        winOfDay: reflectionData.winOfDay || '',
        mood: reflectionData.mood || '',
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

      console.log(`✅ Saved daily reflection (${navigator.onLine ? 'online' : 'offline'}) for ${dateString}`);
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
    loading,
    saving,
    error,
    saveReflection,
    refreshReflection: loadReflection
  };
}