import { useEffect, useState } from 'react';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';
import { supabaseAnon as supabase } from '@/lib/supabase-clerk';

/**
 * Hook to fetch screen time data for a range of dates
 * Calculates total duration from time_blocks table
 * Used by MonthlyDatePickerModal to show screen time stats
 */
export function useDateScreenTimeMap(userId: string | undefined, currentDate: Date = new Date()) {
  const [screenTimeMap, setScreenTimeMap] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchScreenTimeData = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Fetch time blocks for the current month plus padding
        const monthStart = startOfMonth(currentDate);
        const monthEnd = endOfMonth(currentDate);

        // Add padding to show some days from prev/next month
        const startDate = subDays(monthStart, 7);
        const endDate = new Date(monthEnd);
        endDate.setDate(endDate.getDate() + 7);

        const { data, error } = await supabase
          .from('time_blocks')
          .select('date, start_time, end_time')
          .eq('user_id', userId)
          .gte('date', format(startDate, 'yyyy-MM-dd'))
          .lte('date', format(endDate, 'yyyy-MM-dd'));

        if (error) {
          console.error('Error fetching screen time data:', error);
          setScreenTimeMap({});
          return;
        }

        // Calculate duration per date (in minutes)
        const map: Record<string, number> = {};
        (data || []).forEach(block => {
          if (!block.start_time || !block.end_time) return;

          // Parse time strings (HH:MM:SS format)
          const [startHours, startMinutes, startSeconds = 0] = block.start_time.split(':').map(Number);
          const [endHours, endMinutes, endSeconds = 0] = block.end_time.split(':').map(Number);

          let startTotalMinutes = startHours * 60 + startMinutes + startSeconds / 60;
          let endTotalMinutes = endHours * 60 + endMinutes + endSeconds / 60;

          let duration = endTotalMinutes - startTotalMinutes;

          // Handle overnight blocks (negative duration means block crosses midnight)
          // e.g., 23:45 to 00:00 = -1425 minutes, but actual duration is 15 minutes
          if (duration < 0) {
            // If it's a small negative value (likely crossing midnight)
            // Add 24 hours (1440 minutes) to get the actual duration
            if (duration > -1440) {
              duration += 1440; // Add 24 hours
            } else {
              // Skip truly invalid durations (less than -24 hours)
              return;
            }
          }

          // Skip zero duration blocks
          if (duration <= 0) return;

          // Accumulate duration for this date
          if (!map[block.date]) {
            map[block.date] = 0;
          }
          map[block.date] += duration;
        });

        setScreenTimeMap(map);
      } catch (error) {
        console.error('Failed to fetch date screen time map:', error);
        setScreenTimeMap({});
      } finally {
        setLoading(false);
      }
    };

    fetchScreenTimeData();
  }, [userId, currentDate]);

  return { screenTimeMap, loading };
}
