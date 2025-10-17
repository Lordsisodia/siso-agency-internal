/**
 * 🤖 useAutoTimeblocks Hook
 *
 * Automatically creates and manages timeboxes based on wake-up time.
 * Monitors wake-up time changes and syncs auto-timeboxes accordingly.
 *
 * Usage:
 * ```tsx
 * useAutoTimeblocks({
 *   wakeUpTime: '8:00 AM',
 *   userId: 'user-123',
 *   selectedDate: new Date(),
 *   enabled: true
 * });
 * ```
 *
 * Features:
 * - Auto-creates morning routine and nightly checkout timeboxes
 * - Updates existing timeboxes when wake-up time changes
 * - Debounced to avoid excessive API calls
 * - Error handling with toast notifications
 */

import { useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { createOrUpdateAutoTimeboxes } from '@/services/autoTimeblockService';

export interface UseAutoTimeblocksOptions {
  /** Wake-up time in 12-hour format (e.g., "8:00 AM") */
  wakeUpTime: string;
  /** User ID (Supabase UUID) */
  userId: string | null;
  /** Selected date */
  selectedDate: Date;
  /** Enable/disable auto-timebox creation */
  enabled?: boolean;
  /** Debounce delay in milliseconds (default: 1000) */
  debounceMs?: number;
  /** Callback when auto timeboxes are successfully created/updated */
  onAutoBlocksUpdated?: () => void;
}

/**
 * Hook to automatically create and manage timeboxes based on wake-up time
 */
export function useAutoTimeblocks(options: UseAutoTimeblocksOptions): void {
  const {
    wakeUpTime,
    userId,
    selectedDate,
    enabled = true,
    debounceMs = 1000,
    onAutoBlocksUpdated
  } = options;

  // Refs to track previous values and prevent duplicate calls
  const previousWakeUpTimeRef = useRef<string>('');
  const debounceTimerRef = useRef<NodeJS.Timeout>();
  const isCreatingRef = useRef<boolean>(false);

  useEffect(() => {
    // Don't proceed if:
    // - Not enabled
    // - No user ID
    // - No wake-up time set
    // - Already creating (prevent race conditions)
    if (!enabled || !userId || !wakeUpTime || isCreatingRef.current) {
      return;
    }

    // Don't proceed if wake-up time hasn't changed
    if (previousWakeUpTimeRef.current === wakeUpTime) {
      return;
    }

    // Clear any existing debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Debounce the auto-timebox creation
    debounceTimerRef.current = setTimeout(async () => {
      try {
        isCreatingRef.current = true;
        const dateKey = format(selectedDate, 'yyyy-MM-dd');

        console.log('🤖 Auto-creating timeboxes for wake-up time:', wakeUpTime);

        const result = await createOrUpdateAutoTimeboxes(wakeUpTime, userId, dateKey);

        if (result.success) {
          // Success! Update previous wake-up time
          previousWakeUpTimeRef.current = wakeUpTime;

          // Show success toast (subtle, not intrusive)
          toast.success('Auto-timeboxes created', {
            description: 'Morning routine and nightly checkout added to your schedule',
            duration: 3000
          });

          if (onAutoBlocksUpdated) {
            onAutoBlocksUpdated();
          }
        } else {
          // Partial or full failure
          console.error('Auto-timebox creation failed:', result);

          // Show error details
          if (result.morningRoutineResult?.error || result.nightlyCheckoutResult?.error) {
            toast.error('Failed to create auto-timeboxes', {
              description: result.morningRoutineResult?.error || result.nightlyCheckoutResult?.error
            });
          }
        }
      } catch (error) {
        console.error('Error in useAutoTimeblocks:', error);
        toast.error('Failed to create auto-timeboxes', {
          description: error instanceof Error ? error.message : 'Unknown error'
        });
      } finally {
        isCreatingRef.current = false;
      }
    }, debounceMs);

    // Cleanup on unmount
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [wakeUpTime, userId, selectedDate, enabled, debounceMs, onAutoBlocksUpdated]);

  // Sync previous wake-up time when component mounts or date changes
  useEffect(() => {
    // Reset previous wake-up time when date changes
    previousWakeUpTimeRef.current = '';
  }, [selectedDate]);
}
