/**
 * 🎮 Gamification Initialization Hook
 *
 * Loads XP progress from Supabase on user login
 * Sets up the user ID for background sync
 *
 * Usage: Add to any authenticated page/component
 * ```tsx
 * useGamificationInit();
 * ```
 */

import { useEffect } from 'react';
import { useClerkUser } from './useClerkUser';
import { useSupabaseUserId } from '@/lib/supabase-clerk';
import { GamificationService } from '@/domains/lifelock/_shared/services/gamificationService';

export function useGamificationInit(): void {
  const { user } = useClerkUser();
  const internalUserId = useSupabaseUserId(user?.id || null);

  useEffect(() => {
    if (!internalUserId) return;

    // Set user ID for background sync
    GamificationService.setUserId(internalUserId);

    // Load XP progress from Supabase (async, non-blocking)
    GamificationService.loadFromSupabase(internalUserId).catch(error => {
      console.error('Failed to load XP progress:', error);
      // Continue anyway - will use localStorage
    });

    // Cleanup on unmount
    return () => {
      GamificationService.setUserId(null);
    };
  }, [internalUserId]);
}
