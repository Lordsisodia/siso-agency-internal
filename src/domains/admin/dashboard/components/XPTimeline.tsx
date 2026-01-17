/**
 * XP Timeline - Main Timeline Component for History Tab
 *
 * Fetches and displays daily XP history from daily_xp_stats table
 * Shows expandable timeline entries grouped by time period
 * Supports pagination with "Load More" functionality
 */

import { useState, useEffect } from 'react';
import { Loader2, ChevronDown, Filter } from 'lucide-react';
import { supabaseAnon as supabase } from '@/lib/supabase-clerk';
import { useUser } from '@clerk/clerk-react';
import { TimelineEntry, TimelineEntryData } from './TimelineEntry';
import { cn } from '@/lib/utils';
import { format, subDays, differenceInDays, startOfWeek } from 'date-fns';

interface XPTimelineProps {
  className?: string;
  limit?: number;
}

interface TimelineGroup {
  label: string;
  entries: TimelineEntryData[];
}

export function XPTimeline({ className, limit = 20 }: XPTimelineProps) {
  const { user } = useUser();
  const [entries, setEntries] = useState<TimelineEntryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['Today', 'Yesterday', 'This Week']));
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);

  // Fetch timeline data
  const fetchTimeline = async (loadMore = false) => {
    if (!user?.id) return;

    try {
      if (loadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      // Get the last date we already have (for pagination)
      const lastDate = entries.length > 0 ? entries[entries.length - 1].date : undefined;

      // Build query
      let query = supabase
        .from('daily_xp_stats')
        .select('date, total_xp, activities_completed, category_breakdown, achievements_unlocked, streak_count')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(limit);

      // Add pagination filter if loading more
      if (lastDate) {
        query = query.lt('date', lastDate);
      }

      const { data, error } = await query;

      if (error) throw error;

      if (!data || data.length === 0) {
        setHasMore(false);
        return;
      }

      // Transform data to TimelineEntry format
      const newEntries: TimelineEntryData[] = data.map(stat => ({
        date: stat.date,
        totalXP: stat.total_xp || 0,
        activities: stat.activities_completed || 0,
        categories: {
          task: (stat.category_breakdown?.task || 0) as number,
          focus: (stat.category_breakdown?.focus || 0) as number,
          habit: (stat.category_breakdown?.habit || 0) as number,
          health: (stat.category_breakdown?.health || 0) as number,
          routine: (stat.category_breakdown?.routine || 0) as number,
        },
        achievements: stat.achievements_unlocked || [],
        streak: stat.streak_count || 0,
      }));

      if (loadMore) {
        setEntries(prev => [...prev, ...newEntries]);
      } else {
        setEntries(newEntries);
      }

      // Check if there might be more data
      setHasMore(data.length === limit);
    } catch (error) {
      console.error('Error fetching timeline:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    if (user?.id) {
      fetchTimeline();
    }
  }, [user?.id]);

  // Group entries by time period
  const groupEntries = (): TimelineGroup[] => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');
    const weekStart = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');

    const groups: TimelineGroup[] = [];

    // Today
    const todayEntries = entries.filter(e => e.date === today);
    if (todayEntries.length > 0) {
      groups.push({ label: 'Today', entries: todayEntries });
    }

    // Yesterday
    const yesterdayEntries = entries.filter(e => e.date === yesterday);
    if (yesterdayEntries.length > 0) {
      groups.push({ label: 'Yesterday', entries: yesterdayEntries });
    }

    // This Week (excluding today and yesterday)
    const thisWeekEntries = entries.filter(e => {
      const diff = differenceInDays(new Date(today), new Date(e.date));
      return diff >= 2 && diff <= 6 && e.date >= weekStart;
    });
    if (thisWeekEntries.length > 0) {
      groups.push({ label: 'This Week', entries: thisWeekEntries });
    }

    // Older
    const olderEntries = entries.filter(e => {
      const diff = differenceInDays(new Date(today), new Date(e.date));
      return diff > 6 || e.date < weekStart;
    });
    if (olderEntries.length > 0) {
      groups.push({ label: 'Older', entries: olderEntries });
    }

    return groups;
  };

  const groupedEntries = groupEntries();

  // Toggle group expansion
  const toggleGroup = (label: string) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(label)) {
        newSet.delete(label);
      } else {
        newSet.add(label);
      }
      return newSet;
    });
  };

  // Check if group should be expanded
  const isGroupExpanded = (label: string) => {
    return expandedGroups.has(label);
  };

  // Filter entries by category
  const filteredGroups = categoryFilter
    ? groupedEntries.map(group => ({
        ...group,
        entries: group.entries.filter(entry => {
          const catXP = entry.categories[categoryFilter as keyof typeof entry.categories];
          return catXP && catXP > 0;
        }),
      })).filter(group => group.entries.length > 0)
    : groupedEntries;

  // Loading state
  if (loading) {
    return (
      <div className={cn('bg-gray-900 border border-gray-800 rounded-2xl p-8', className)}>
        <div className="flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
          <span className="ml-3 text-gray-400">Loading timeline...</span>
        </div>
      </div>
    );
  }

  // Empty state
  if (entries.length === 0) {
    return (
      <div className={cn('bg-gray-900 border border-gray-800 rounded-2xl p-8', className)}>
        <div className="text-center">
          <p className="text-gray-400">No XP history yet</p>
          <p className="text-sm text-gray-500 mt-1">Start completing activities to see your timeline!</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header with Filter */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white">Timeline</h3>
        <button
          onClick={() => setCategoryFilter(categoryFilter === null ? 'task' : null)}
          className={cn(
            'flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm transition-colors',
            categoryFilter
              ? 'bg-blue-500/20 border-blue-500/50 text-blue-400'
              : 'bg-white/5 border-gray-700 text-gray-400 hover:bg-white/10'
          )}
        >
          <Filter className="w-4 h-4" />
          <span>Filter</span>
        </button>
      </div>

      {/* Timeline Groups */}
      <div className="space-y-4">
        {filteredGroups.map(group => (
          <div key={group.label}>
            {/* Group Header */}
            <motion.div
              className="flex items-center justify-between mb-3 cursor-pointer"
              onClick={() => toggleGroup(group.label)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">
                {group.label}
              </h4>
              <motion.div
                animate={{ rotate: isGroupExpanded(group.label) ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </motion.div>
            </motion.div>

            {/* Group Entries */}
            {isGroupExpanded(group.label) && (
              <motion.div
                className="space-y-3"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                {group.entries.map((entry, index) => (
                  <TimelineEntry
                    key={entry.date}
                    entry={entry}
                    isToday={entry.date === format(new Date(), 'yyyy-MM-dd')}
                    isYesterday={entry.date === format(subDays(new Date(), 1), 'yyyy-MM-dd')}
                  />
                ))}
              </motion.div>
            )}
          </div>
        ))}
      </div>

      {/* Load More Button */}
      {hasMore && (
        <motion.button
          className="w-full py-3 bg-white/5 border border-gray-800 rounded-xl text-gray-400 text-sm font-medium hover:bg-white/10 transition-colors"
          onClick={() => fetchTimeline(true)}
          disabled={loadingMore}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {loadingMore ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading...
            </span>
          ) : (
            'Load More...'
          )}
        </motion.button>
      )}
    </div>
  );
}
