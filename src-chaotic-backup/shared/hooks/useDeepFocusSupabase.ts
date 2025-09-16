/**
 * 🔥 Deep Focus Work Supabase Hook
 * 
 * Hook for managing deep focus work sessions with Supabase
 * Based on successful patterns from useMorningRoutineSupabase.ts
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/shared/lib/supabase';
import { useClerkUser } from './useClerkUser';
import { useSupabaseClient, useSupabaseUserId } from '@/shared/lib/supabase-clerk';

interface DeepFocusSession {
  id: string;
  user_id: string;
  date: string;
  session_type: 'creative' | 'analytical' | 'learning' | 'planning' | 'coding';
  planned_duration_minutes: number;
  actual_duration_minutes?: number;
  completed: boolean;
  focus_quality_rating?: number; // 1-5 scale
  session_notes?: string;
  distractions_count: number;
  break_intervals?: any; // JSON data for break tracking
  created_at: string;
  updated_at: string;
}

interface DailyDeepWorkSummary {
  id: string;
  user_id: string;
  date: string;
  total_planned_minutes: number;
  total_actual_minutes: number;
  total_sessions: number;
  completed_sessions: number;
  average_focus_quality?: number;
  productivity_score?: number;
  created_at: string;
  updated_at: string;
}

interface DeepFocusData {
  sessions: DeepFocusSession[];
  summary: DailyDeepWorkSummary | null;
  totalSessions: number;
  completedSessions: number;
  totalPlannedMinutes: number;
  totalActualMinutes: number;
  averageFocusQuality: number;
  completionPercentage: number;
}

export function useDeepFocusSupabase(selectedDate: Date) {
  const { user, isSignedIn } = useClerkUser();
  const supabaseClient = useSupabaseClient();
  const internalUserId = useSupabaseUserId(user?.id || null);
  
  const [deepFocusData, setDeepFocusData] = useState<DeepFocusData>({
    sessions: [],
    summary: null,
    totalSessions: 0,
    completedSessions: 0,
    totalPlannedMinutes: 0,
    totalActualMinutes: 0,
    averageFocusQuality: 0,
    completionPercentage: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const dateString = selectedDate.toISOString().split('T')[0]; // YYYY-MM-DD format

  // Load deep focus data from Supabase
  useEffect(() => {
    loadDeepFocusData();
  }, [dateString, internalUserId]);

  const loadDeepFocusData = async () => {
    if (!isSignedIn || !internalUserId || !supabaseClient) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      console.log('🔥 Loading deep focus data from Supabase...');

      // Load sessions for the selected date
      const { data: sessions, error: sessionsError } = await supabaseClient
        .from('deep_focus_sessions')
        .select('*')
        .eq('user_id', internalUserId)
        .eq('date', dateString)
        .order('created_at', { ascending: true });

      if (sessionsError) {
        console.error('Error loading deep focus sessions:', sessionsError);
        throw sessionsError;
      }

      // Load daily summary for the selected date
      const { data: summary, error: summaryError } = await supabaseClient
        .from('daily_deep_work_summary')
        .select('*')
        .eq('user_id', internalUserId)
        .eq('date', dateString)
        .single();

      // Summary might not exist yet - that's OK
      if (summaryError && summaryError.code !== 'PGRST116') {
        console.error('Error loading deep work summary:', summaryError);
        throw summaryError;
      }

      const sessionsArray = sessions || [];
      const completedSessions = sessionsArray.filter(s => s.completed).length;
      const totalPlanned = sessionsArray.reduce((sum, s) => sum + s.planned_duration_minutes, 0);
      const totalActual = sessionsArray.reduce((sum, s) => sum + (s.actual_duration_minutes || 0), 0);
      const ratings = sessionsArray.filter(s => s.focus_quality_rating).map(s => s.focus_quality_rating);
      const avgQuality = ratings.length > 0 ? ratings.reduce((sum, r) => sum + r!, 0) / ratings.length : 0;

      const deepFocusData: DeepFocusData = {
        sessions: sessionsArray,
        summary: summary || null,
        totalSessions: sessionsArray.length,
        completedSessions,
        totalPlannedMinutes: totalPlanned,
        totalActualMinutes: totalActual,
        averageFocusQuality: avgQuality,
        completionPercentage: sessionsArray.length > 0 ? Math.round((completedSessions / sessionsArray.length) * 100) : 0
      };

      setDeepFocusData(deepFocusData);
      console.log('✅ Deep focus data loaded:', deepFocusData);

    } catch (err: any) {
      console.error('🚨 Error loading deep focus data:', err);
      setError(err.message || 'Failed to load deep focus data');
    } finally {
      setIsLoading(false);
    }
  };

  const createSession = useCallback(async (sessionData: Partial<DeepFocusSession>) => {
    if (!isSignedIn || !internalUserId || !supabaseClient) {
      throw new Error('Authentication required');
    }

    try {
      const newSession = {
        user_id: internalUserId,
        date: dateString,
        session_type: sessionData.session_type || 'analytical',
        planned_duration_minutes: sessionData.planned_duration_minutes || 25,
        completed: false,
        distractions_count: 0,
        ...sessionData
      };

      const { data, error } = await supabaseClient
        .from('deep_focus_sessions')
        .insert(newSession)
        .select()
        .single();

      if (error) throw error;

      // Reload data to get updated state
      await loadDeepFocusData();
      console.log('✅ Deep focus session created:', data);
      return data;

    } catch (err: any) {
      console.error('🚨 Error creating deep focus session:', err);
      setError(err.message || 'Failed to create session');
      throw err;
    }
  }, [isSignedIn, internalUserId, supabaseClient, dateString]);

  const updateSession = useCallback(async (sessionId: string, updates: Partial<DeepFocusSession>) => {
    if (!isSignedIn || !internalUserId || !supabaseClient) {
      throw new Error('Authentication required');
    }

    try {
      const { data, error } = await supabaseClient
        .from('deep_focus_sessions')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', sessionId)
        .eq('user_id', internalUserId)
        .select()
        .single();

      if (error) throw error;

      // Reload data to get updated state
      await loadDeepFocusData();
      console.log('✅ Deep focus session updated:', data);
      return data;

    } catch (err: any) {
      console.error('🚨 Error updating deep focus session:', err);
      setError(err.message || 'Failed to update session');
      throw err;
    }
  }, [isSignedIn, internalUserId, supabaseClient]);

  const toggleSessionCompletion = useCallback(async (sessionId: string) => {
    const session = deepFocusData.sessions.find(s => s.id === sessionId);
    if (!session) return;

    await updateSession(sessionId, {
      completed: !session.completed,
      actual_duration_minutes: !session.completed ? session.planned_duration_minutes : session.actual_duration_minutes
    });
  }, [deepFocusData.sessions, updateSession]);

  const deleteSession = useCallback(async (sessionId: string) => {
    if (!isSignedIn || !internalUserId || !supabaseClient) {
      throw new Error('Authentication required');
    }

    try {
      const { error } = await supabaseClient
        .from('deep_focus_sessions')
        .delete()
        .eq('id', sessionId)
        .eq('user_id', internalUserId);

      if (error) throw error;

      // Reload data to get updated state
      await loadDeepFocusData();
      console.log('✅ Deep focus session deleted');

    } catch (err: any) {
      console.error('🚨 Error deleting deep focus session:', err);
      setError(err.message || 'Failed to delete session');
      throw err;
    }
  }, [isSignedIn, internalUserId, supabaseClient]);

  const updateDailySummary = useCallback(async () => {
    if (!isSignedIn || !internalUserId || !supabaseClient) return;

    try {
      const summaryData: Partial<DailyDeepWorkSummary> = {
        user_id: internalUserId,
        date: dateString,
        total_planned_minutes: deepFocusData.totalPlannedMinutes,
        total_actual_minutes: deepFocusData.totalActualMinutes,
        total_sessions: deepFocusData.totalSessions,
        completed_sessions: deepFocusData.completedSessions,
        average_focus_quality: deepFocusData.averageFocusQuality || null,
        productivity_score: deepFocusData.completionPercentage || null,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabaseClient
        .from('daily_deep_work_summary')
        .upsert(summaryData);

      if (error) throw error;
      console.log('✅ Daily deep work summary updated');

    } catch (err: any) {
      console.error('🚨 Error updating daily summary:', err);
    }
  }, [isSignedIn, internalUserId, supabaseClient, dateString, deepFocusData]);

  // Auto-update daily summary when sessions change
  useEffect(() => {
    if (deepFocusData.sessions.length > 0) {
      updateDailySummary();
    }
  }, [deepFocusData.sessions.length, deepFocusData.completedSessions]);

  return {
    data: deepFocusData,
    isLoading,
    error,
    // CRUD operations
    refresh: loadDeepFocusData,
    createSession,
    updateSession,
    toggleSessionCompletion,
    deleteSession,
    // Summary operations
    updateDailySummary
  };
}