/**
 * 🌙 Daily Reflections Hook - OFFLINE-FIRST PWA VERSION
 *
 * Architecture:
 * 1. IndexedDB (offlineDb) - Primary storage, works offline
 * 2. Supabase - Cloud sync when online
 * 3. Auto-sync queue when offline
 */

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useClerkUser } from './useClerkUser';
import { useSupabaseUserId } from '@/shared/lib/supabase-clerk';
import { unifiedDataService } from '@/shared/services/unified-data.service';

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
  createdAt: string;
  updatedAt: string;
}

export interface UseDailyReflectionsProps {
  selectedDate: Date;
  prefetchDates?: Date[];
}

type ReflectionsByDate = Record<string, DailyReflection | null>;

export function useDailyReflections({ selectedDate, prefetchDates = [] }: UseDailyReflectionsProps) {
  const { user, isSignedIn } = useClerkUser();
  const internalUserId = useSupabaseUserId(user?.id || null);
  const [reflection, setReflection] = useState<DailyReflection | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reflectionsByDate, setReflectionsByDate] = useState<ReflectionsByDate>({});

  const dateString = selectedDate?.toISOString()?.split('T')[0] || new Date().toISOString().split('T')[0];

  const prefetchDatesKey = useMemo(() => {
    return prefetchDates
      .map(date => date.getTime())
      .sort((a, b) => a - b)
      .join('|');
  }, [prefetchDates]);

  const requestedDates = useMemo(() => {
    const normalizedPrefetchDates = prefetchDates
      .map(date => date.toISOString().split('T')[0])
      .filter(Boolean);

    const uniqueDates = new Set<string>([dateString, ...normalizedPrefetchDates]);
    return Array.from(uniqueDates);
  }, [dateString, prefetchDatesKey]);

  // Load daily reflection - OFFLINE-FIRST
  const loadReflection = useCallback(async () => {
    if (!isSignedIn || !internalUserId) {
      setLoading(false);
      setReflectionsByDate({});
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log(`🌙 Loading daily reflection(s) (offline-first) for ${requestedDates.join(', ')}...`);

      const dataByDate = await unifiedDataService.getDailyReflectionsBatch(internalUserId, requestedDates);

      const normalizedResults = requestedDates.reduce<ReflectionsByDate>((acc, date) => {
        const record = dataByDate[date];

        if (record) {
          acc[date] = {
            id: record.id || '',
            userId: record.user_id,
            date: record.date,
            winOfDay: record.winOfDay || '',
            mood: record.mood || '',
            bedTime: record.bedTime || '',
            wentWell: record.wentWell || [],
            evenBetterIf: record.evenBetterIf || [],
            dailyAnalysis: record.dailyAnalysis || '',
            actionItems: record.actionItems || '',
            overallRating: record.overallRating,
            energyLevel: record.energyLevel,
            keyLearnings: record.keyLearnings || '',
            tomorrowFocus: record.tomorrowFocus || '',
            tomorrowTopTasks: record.tomorrowTopTasks || [],
            createdAt: record.created_at || new Date().toISOString(),
            updatedAt: record.updated_at || new Date().toISOString()
          };
        } else {
          acc[date] = null;
        }

        return acc;
      }, {});

      const selectedReflection = normalizedResults[dateString] ?? null;

      if (selectedReflection) {
        console.log(`✅ Loaded daily reflection (${navigator.onLine ? 'online' : 'offline'}) for ${dateString}`);
      } else {
        console.log(`📝 No reflection found for ${dateString}, will create on save`);
      }

      setReflection(selectedReflection);
      setReflectionsByDate(normalizedResults);
    } catch (error) {
      console.error('❌ Error loading daily reflection:', error);
      setError(error instanceof Error ? error.message : 'Failed to load reflection');
      setReflectionsByDate(prev => ({ ...prev, [dateString]: null }));
    } finally {
      setLoading(false);
    }
  }, [isSignedIn, internalUserId, dateString, requestedDates]);

  // Save daily reflection - OFFLINE-FIRST
  const saveReflection = useCallback(async (reflectionData: Partial<DailyReflection>) => {
    if (!internalUserId) return null;

    try {
      setSaving(true);
      setError(null);
      console.log(`🌙 Saving daily reflection (offline-first) for ${dateString}...`);

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

      console.log(`✅ Saved daily reflection (${navigator.onLine ? 'online' : 'offline'}) for ${dateString}`);
      setReflection(savedReflection);
      setReflectionsByDate(prev => ({
        ...prev,
        [dateString]: savedReflection
      }));
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
    refreshReflection: loadReflection,
    reflectionsByDate
  };
}
