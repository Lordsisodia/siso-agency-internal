import { useEffect, useState } from 'react';
import { format, subDays } from 'date-fns';
import { offlineDb } from '@/services/offline/offlineDb';

/**
 * Hook to fetch completion percentages for the last 14 days
 * Used by BevelDateHeader to show completion dots in the date picker dropdown
 */
export function useDateCompletionMap(userId: string | undefined) {
  const [completionMap, setCompletionMap] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompletionData = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const map: Record<string, number> = {};

        // Fetch completion data for the last 14 days
        for (let i = 0; i < 14; i++) {
          const date = subDays(new Date(), i);
          const dateKey = format(date, 'yyyy-MM-dd');

          try {
            const routines = await offlineDb.getMorningRoutines(dateKey);
            const morningRoutine = routines.find(r => r.routine_type === 'morning');
            const percentage = morningRoutine?.completion_percentage ?? 0;

            map[dateKey] = percentage;
          } catch (error) {
            console.warn(`Failed to fetch completion for ${dateKey}:`, error);
            map[dateKey] = 0;
          }
        }

        setCompletionMap(map);
      } catch (error) {
        console.error('Failed to fetch date completion map:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCompletionData();
  }, [userId]);

  return { completionMap, loading };
}
