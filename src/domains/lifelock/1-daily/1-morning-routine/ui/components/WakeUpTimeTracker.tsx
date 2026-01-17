/**
 * Wake Up Time Tracker Component
 *
 * Tracks wake-up time with historical data visualization from Supabase.
 * Shows XP multiplier, streak, and 7-day wake-up graph.
 */

import React, { useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Clock, X, Flame, Calendar, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabaseAnon } from '@/lib/supabase-clerk';
import { useAuth } from '@clerk/clerk-react';
import { format, subDays } from 'date-fns';

interface WakeUpTimeTrackerProps {
  time: string;
  onTimeChange: (time: string) => void;
  onOpenPicker: () => void;
  onUseNow: () => void;
  getCurrentTime: () => string;
  onClear?: () => void;
  selectedDate: Date;
}

interface WakeUpHistoryData {
  date: string;
  time: string;
  multiplier: number;
}

// XP Multiplier calculation
const getXPMultiplier = (timeStr: string): { multiplier: number; color: string; label: string; hex: string } => {
  if (!timeStr) {
    return { multiplier: 1, color: 'gray', label: '', hex: '#6b7280' };
  }

  try {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const hourNum = parseInt(hours.toString().padStart(2, '0'), 10);
    const minuteNum = parseInt(minutes.toString().padStart(2, '0'), 10);

    let hour24 = hourNum;
    if (timeStr.toLowerCase().includes('pm') && hourNum !== 12) {
      hour24 += 12;
    } else if (timeStr.toLowerCase().includes('am') && hourNum === 12) {
      hour24 = 0;
    }

    const totalMinutes = hour24 * 60 + minuteNum;

    if (totalMinutes < 7 * 60) {
      return { multiplier: 3, color: 'green', label: '🔥 3x XP', hex: '#22c55e' };
    }
    if (totalMinutes < 9 * 60) {
      return { multiplier: 2, color: 'yellow', label: '⚡ 2x XP', hex: '#eab308' };
    }
    if (totalMinutes < 11 * 60) {
      return { multiplier: 1.5, color: 'orange', label: '1.5x XP', hex: '#f97316' };
    }
    return { multiplier: 1, color: 'red', label: '1x XP', hex: '#ef4444' };
  } catch {
    return { multiplier: 1, color: 'gray', label: '', hex: '#6b7280' };
  }
};

const getMultiplierStyles = (color: string) => {
  const styles = {
    green: {
      bg: 'bg-green-900/30',
      border: 'border-green-600/50',
      text: 'text-green-400',
      icon: '🔥'
    },
    yellow: {
      bg: 'bg-yellow-900/30',
      border: 'border-yellow-600/50',
      text: 'text-yellow-400',
      icon: '⚡'
    },
    orange: {
      bg: 'bg-orange-900/30',
      border: 'border-orange-600/50',
      text: 'text-orange-400',
      icon: '✨'
    },
    red: {
      bg: 'bg-red-900/30',
      border: 'border-red-600/50',
      text: 'text-red-400',
      icon: '💪'
    },
    gray: {
      bg: 'bg-gray-900/30',
      border: 'border-gray-600/50',
      text: 'text-gray-400',
      icon: ''
    }
  };
  return styles[color as keyof typeof styles] || styles.gray;
};

// Mini Bar Chart Component
const WakeUpChart: React.FC<{ data: WakeUpHistoryData[] }> = ({ data }) => {
  const maxBarHeight = 36;

  // Calculate heights based on time (earlier = taller = better)
  const getBarHeight = (timeStr: string) => {
    if (!timeStr) return 8; // Minimal height for missing data

    const multiplier = getXPMultiplier(timeStr);
    // Height based on multiplier: 3x = 100%, 2x = 75%, 1.5x = 50%, 1x = 25%
    switch (multiplier.multiplier) {
      case 3: return maxBarHeight;
      case 2: return maxBarHeight * 0.75;
      case 1.5: return maxBarHeight * 0.5;
      default: return maxBarHeight * 0.35;
    }
  };

  const getBarColor = (timeStr: string) => {
    return getXPMultiplier(timeStr).hex;
  };

  const formatDayLetter = (dateStr: string) => {
    const date = new Date(dateStr);
    return format(date, 'EEEEEE'); // M T W T F S S
  };

  const formatTime = (timeStr: string) => {
    if (!timeStr) return '--:--';
    // Convert to 12-hour format without AM/PM
    const [hours, minutes] = timeStr.split(':');
    const hourNum = parseInt(hours, 10);
    const displayHour = hourNum === 0 ? 12 : hourNum > 12 ? hourNum - 12 : hourNum;
    return `${displayHour}:${minutes}`;
  };

  return (
    <div className="space-y-2">
      {/* Compact label */}
      <div className="flex items-center gap-1.5 text-xs text-yellow-400/60">
        <Calendar className="h-3 w-3" />
        <span>This week</span>
      </div>

      {/* Chart with times */}
      <div className="space-y-1.5">
        <div className="flex items-end justify-between gap-1.5 px-1">
          {data.map((day, index) => (
            <div key={index} className="flex-1 flex flex-col items-center">
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: getBarHeight(day.time) }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="w-full rounded-t-sm transition-all duration-200 hover:opacity-80"
                style={{
                  backgroundColor: day.time ? getBarColor(day.time) : '#374151',
                  minHeight: 8
                }}
                title={day.time ? `${day.time} - ${getXPMultiplier(day.time).label}` : 'No data'}
              />
              <span className="text-xs text-gray-500 mt-0.5">{formatDayLetter(day.date)}</span>
            </div>
          ))}
        </div>

        {/* Times row */}
        <div className="flex justify-between gap-1.5 px-1">
          {data.map((day, index) => (
            <div key={index} className="flex-1 text-center">
              <span className="text-xs text-gray-600 font-mono">{formatTime(day.time)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const WakeUpTimeTracker: React.FC<WakeUpTimeTrackerProps> = ({
  time,
  onTimeChange,
  onOpenPicker,
  onUseNow,
  getCurrentTime,
  onClear,
  selectedDate
}) => {
  const { userId } = useAuth();
  const [historyData, setHistoryData] = useState<WakeUpHistoryData[]>([]);
  const [streak, setStreak] = useState(0);
  const [yesterdayTime, setYesterdayTime] = useState<string>('');
  const [totalXP, setTotalXP] = useState(0);

  // Calculate XP multiplier for current time
  const { multiplier, color, label, hex } = useMemo(() => getXPMultiplier(time), [time]);
  const multiplierStyles = getMultiplierStyles(color);

  // Fetch historical data from Supabase
  useEffect(() => {
    const fetchWakeUpHistory = async () => {
      if (!userId) return;

      try {
        // Get last 7 days of data
        const sevenDaysAgo = format(subDays(selectedDate, 6), 'yyyy-MM-dd');
        const today = format(selectedDate, 'yyyy-MM-dd');

        const { data: routineData, error } = await supabaseAnon
          .from('morning_routines')
          .select('date, metadata')
          .eq('user_id', userId)
          .gte('date', sevenDaysAgo)
          .lte('date', today)
          .order('date', { ascending: true });

        if (error) throw error;

        // Process data
        const processed: WakeUpHistoryData[] = [];
        let currentStreak = 0;
        let foundYesterday = false;

        // Create array of last 7 days
        for (let i = 6; i >= 0; i--) {
          const date = format(subDays(selectedDate, i), 'yyyy-MM-dd');
          const dayData = routineData?.find(d => d.date === date);
          const wakeUpTime = dayData?.metadata?.wakeUpTime || '';

          const multiplierInfo = getXPMultiplier(wakeUpTime);
          processed.push({
            date,
            time: wakeUpTime,
            multiplier: multiplierInfo.multiplier
          });

          // Calculate streak
          if (wakeUpTime) {
            if (i === 1) foundYesterday = true;
            if (currentStreak === 0 || currentStreak > 0) {
              currentStreak++;
            }
          } else {
            currentStreak = 0;
          }

          // Get yesterday's time
          if (i === 1) {
            setYesterdayTime(wakeUpTime);
          }
        }

        setHistoryData(processed.reverse());

        // Only set streak if yesterday was tracked
        if (foundYesterday) {
          setStreak(currentStreak);
        }

        // Calculate total XP earned from wake-ups
        const wakeUpXP = processed.reduce((total, day) => {
          if (day.time) {
            return total + (10 * day.multiplier);
          }
          return total;
        }, 0);
        setTotalXP(wakeUpXP);

      } catch (error) {
        console.error('Failed to fetch wake-up history:', error);
      }
    };

    fetchWakeUpHistory();
  }, [userId, selectedDate]);

  const handleClear = () => {
    if (onClear) {
      onClear();
    } else {
      onTimeChange('');
    }
  };

  return (
    <div className="space-y-4">
      {/* Time Display Section */}
      {time ? (
        <div className="space-y-3">
          {/* Large Time Display with Multiplier */}
          <div className={cn(
            "rounded-xl p-4 border-2 transition-all duration-300",
            multiplierStyles.bg,
            multiplierStyles.border
          )}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <Clock className={cn("h-6 w-6", multiplierStyles.text)} />
                <div>
                  <div className={cn("text-3xl font-bold", multiplierStyles.text)}>
                    {time}
                  </div>
                  <div className={cn("text-sm font-medium", multiplierStyles.text)}>
                    {label}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className={cn("text-lg font-semibold", multiplierStyles.text)}>
                  +{Math.round(10 * multiplier)} XP
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={onOpenPicker}
                className="flex-1 border-white/20 text-white hover:bg-white/10"
              >
                Edit Time
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleClear}
                className="border-red-600/50 text-red-400 hover:bg-red-900/20 px-3"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* 3-Column Stats Row */}
          <div className="grid grid-cols-3 gap-2 px-2">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1">
                <Flame className={cn("h-3.5 w-3.5", streak > 0 ? "text-orange-400" : "text-gray-600")} />
                <span className={cn("text-xs font-medium", streak > 0 ? "text-orange-300" : "text-gray-600")}>
                  {streak} day
                </span>
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-400">
                Yesterday: <span className="text-gray-300">{yesterdayTime || '--:--'}</span>
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-400">
                Week: <span className="text-yellow-400 font-medium">+{totalXP} XP</span>
              </div>
            </div>
          </div>

          {/* 7-Day Chart */}
          <WakeUpChart data={historyData} />
        </div>
      ) : (
        /* Empty State */
        <div className="space-y-4">
          <div className="text-center py-6">
            <Clock className="h-12 w-12 mx-auto text-yellow-600/50 mb-3" />
            <p className="text-yellow-400/80 text-sm mb-1">No wake-up time tracked yet</p>
            <p className="text-yellow-400/50 text-xs">Track your wake-up time to see stats and earn XP</p>
          </div>

          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={onOpenPicker}
              className="flex-1 border-yellow-600 text-yellow-400 hover:bg-yellow-900/20"
            >
              <Clock className="h-4 w-4 mr-2" />
              Set Time
            </Button>
            <Button
              size="sm"
              onClick={onUseNow}
              className="bg-yellow-600 hover:bg-yellow-700 text-white"
            >
              Now ({getCurrentTime()})
            </Button>
          </div>

          {/* Show empty chart */}
          <WakeUpChart data={historyData} />
        </div>
      )}
    </div>
  );
};
