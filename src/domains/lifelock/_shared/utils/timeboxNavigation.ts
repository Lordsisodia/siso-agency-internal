import { format } from 'date-fns';

/**
 * Smart navigation utility for Timebox section
 * Determines which subtab (morning/timebox/checkout) should be shown by default
 * based on morning routine completion status and time of day
 */

export interface TimeboxNavState {
  morningRoutineCompleted: boolean;
  selectedDate: Date;
  userId?: string | null;
}

/**
 * Determines the default subtab for the Timebox section based on:
 * 1. If morning routine is not completed → show 'morning'
 * 2. If morning routine is completed → show 'timebox'
 * 3. If it's past midnight (selected date is today and time > midnight) → show 'checkout'
 *
 * @param state - Current navigation state
 * @returns The subtab id that should be shown ('morning' | 'timebox' | 'checkout')
 */
export const getDefaultTimeboxSubtab = (state: TimeboxNavState): 'morning' | 'timebox' | 'checkout' => {
  const { morningRoutineCompleted, selectedDate } = state;

  // Check if we should show checkout (after midnight on the current day)
  const now = new Date();
  const isToday = format(selectedDate, 'yyyy-MM-dd') === format(now, 'yyyy-MM-dd');

  if (isToday) {
    const currentHour = now.getHours();
    // Show checkout after midnight (00:00) or you can adjust this threshold
    // For example, show checkout after 8 PM (20:00) or any time you prefer
    if (currentHour >= 0) {
      // You can make this configurable - for now showing checkout anytime after midnight
      // But only if morning routine is completed
      if (morningRoutineCompleted && currentHour >= 20) {
        return 'checkout';
      }
    }
  }

  // If morning routine is not completed, show morning tab by default
  if (!morningRoutineCompleted) {
    return 'morning';
  }

  // Default to timebox tab
  return 'timebox';
};

/**
 * Checks if morning routine is completed for a given date
 * NOTE: This function is deprecated. Use the useMorningRoutineSupabase hook instead.
 *
 * @param date - The date to check
 * @param userId - Optional user ID
 * @returns Promise<boolean> - Whether morning routine is completed
 * @deprecated Use useMorningRoutineSupabase hook for React components
 */
export const checkMorningRoutineCompletion = async (
  date: Date,
  userId?: string | null
): Promise<boolean> => {
  if (!userId) {
    return false;
  }

  // This function previously called /api/morning-routine which no longer exists
  // For non-React contexts, default to false - the React hooks handle the actual data fetching
  console.warn('checkMorningRoutineCompletion is deprecated. Use useMorningRoutineSupabase hook instead.');
  return false;
};

/**
 * Hook-friendly version that returns the default subtab
 * Can be used in React components
 */
export const useTimeboxNavigation = (state: TimeboxNavState) => {
  const defaultSubtab = getDefaultTimeboxSubtab(state);

  return {
    defaultSubtab,
    shouldShowMorning: defaultSubtab === 'morning',
    shouldShowTimebox: defaultSubtab === 'timebox',
    shouldShowCheckout: defaultSubtab === 'checkout',
  };
};
