import { useEffect, useState } from 'react';
import { format, subDays, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { supabaseAnon as supabase } from '@/lib/supabase-clerk';

/**
 * Hook to fetch XP data for a range of dates
 * Used by MonthlyDatePickerModal to show XP below each date
 */
export function useDateXPMap(userId: string | undefined, currentDate: Date = new Date()) {
  const [xpMap, setXPMap] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchXPData = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Fetch XP data for the current month plus padding
        const monthStart = startOfMonth(currentDate);
        const monthEnd = endOfMonth(currentDate);

        // Add padding to show some days from prev/next month
        const startDate = subDays(monthStart, 7);
        const endDate = new Date(monthEnd);
        endDate.setDate(endDate.getDate() + 7);

        const { data, error } = await supabase
          .from('daily_xp_stats')
          .select('date, total_xp')
          .eq('user_id', userId)
          .gte('date', format(startDate, 'yyyy-MM-dd'))
          .lte('date', format(endDate, 'yyyy-MM-dd'));

        if (error) {
          console.error('Error fetching XP data:', error);
          setXPMap({});
          return;
        }

        // Convert to date key map
        const map: Record<string, number> = {};
        (data || []).forEach(stat => {
          map[stat.date] = stat.total_xp || 0;
        });

        setXPMap(map);
      } catch (error) {
        console.error('Failed to fetch date XP map:', error);
        setXPMap({});
      } finally {
        setLoading(false);
      }
    };

    fetchXPData();
  }, [userId, currentDate]);

  return { xpMap, loading };
}
