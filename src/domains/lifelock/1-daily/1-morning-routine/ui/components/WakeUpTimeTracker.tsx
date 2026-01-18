/**
 * Wake Up Time Tracker Component
 *
 * Enhanced wake-up time tracker with XP multiplier visualization,
 * quick time presets, celebration animations, and weekly pattern display.
 *
 * COLOR: Orange theme
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Clock, Flame, Sparkles, Zap, ChevronDown, ChevronUp, TrendingUp, Calendar, Award } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, subDays } from 'date-fns';

interface WakeUpTimeTrackerProps {
  time: string;
  onOpenPicker: () => void;
  onUseNow: () => void;
  selectedDate?: Date;
  onClear?: () => void;
}

interface WakeUpHistoryData {
  date: string;
  time: string;
  multiplier: number;
}

interface XPRewardTier {
  timeRange: string;
  multiplier: number;
  baseXP: number;
  maxXP: number;
  color: string;
  bgColor: string;
}

// XP reward tiers based on wake-up time
const XP_REWARD_TIERS: XPRewardTier[] = [
  { timeRange: 'Before 6:00 AM', multiplier: 1.5, baseXP: 100, maxXP: 150, color: 'text-emerald-400', bgColor: 'bg-emerald-500/20' },
  { timeRange: '6:00 - 6:30 AM', multiplier: 1.45, baseXP: 100, maxXP: 145, color: 'text-green-400', bgColor: 'bg-green-500/20' },
  { timeRange: '6:30 - 7:00 AM', multiplier: 1.35, baseXP: 100, maxXP: 135, color: 'text-lime-400', bgColor: 'bg-lime-500/20' },
  { timeRange: '7:00 - 7:30 AM', multiplier: 1.25, baseXP: 100, maxXP: 125, color: 'text-yellow-400', bgColor: 'bg-yellow-500/20' },
  { timeRange: '7:30 - 8:00 AM', multiplier: 1.15, baseXP: 100, maxXP: 115, color: 'text-amber-400', bgColor: 'bg-amber-500/20' },
  { timeRange: '8:00 - 9:00 AM', multiplier: 1.0, baseXP: 100, maxXP: 100, color: 'text-orange-400', bgColor: 'bg-orange-500/20' },
  { timeRange: '9:00 - 10:00 AM', multiplier: 0.85, baseXP: 100, maxXP: 85, color: 'text-orange-300', bgColor: 'bg-orange-500/20' },
  { timeRange: 'After 10:00 AM', multiplier: 0.7, baseXP: 100, maxXP: 70, color: 'text-gray-400', bgColor: 'bg-gray-500/20' },
];

// Calculate XP multiplier based on wake-up time
const getXPMultiplier = (timeStr: string) => {
  if (!timeStr) {
    return { multiplier: 1, color: 'gray', label: 'Not Set', icon: Clock, hex: '#6b7280' };
  }

  try {
    const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!match) return { multiplier: 1, color: 'gray', label: 'Not Set', icon: Clock, hex: '#6b7280' };

    let hour = parseInt(match[1]);
    const minute = parseInt(match[2]);
    const period = match[3].toUpperCase();

    if (period === 'PM' && hour !== 12) hour += 12;
    if (period === 'AM' && hour === 12) hour = 0;

    const totalMinutes = hour * 60 + minute;

    if (totalMinutes < 6 * 60) {
      return { multiplier: 1.5, color: 'emerald', label: 'Early Bird', icon: Flame, hex: '#10b981', bgColor: 'bg-emerald-500/20', textColor: 'text-emerald-400' };
    }
    if (totalMinutes < 7 * 60) {
      return { multiplier: 1.45, color: 'green', label: 'Early Riser', icon: Flame, hex: '#22c55e', bgColor: 'bg-green-500/20', textColor: 'text-green-400' };
    }
    if (totalMinutes < 8 * 60) {
      return { multiplier: 1.25, color: 'lime', label: 'Good Start', icon: Zap, hex: '#a3e635', bgColor: 'bg-lime-500/20', textColor: 'text-lime-400' };
    }
    if (totalMinutes < 9 * 60) {
      return { multiplier: 1.0, color: 'yellow', label: 'On Time', icon: Zap, hex: '#eab308', bgColor: 'bg-yellow-500/20', textColor: 'text-yellow-400' };
    }
    if (totalMinutes < 10 * 60) {
      return { multiplier: 0.85, color: 'amber', label: 'Late Start', icon: Sparkles, hex: '#f59e0b', bgColor: 'bg-amber-500/20', textColor: 'text-amber-400' };
    }
    return { multiplier: 0.7, color: 'gray', label: 'Better Late', icon: Clock, hex: '#94a3b8', bgColor: 'bg-gray-500/20', textColor: 'text-gray-400' };
  } catch {
    return { multiplier: 1, color: 'gray', label: 'Not Set', icon: Clock, hex: '#6b7280', bgColor: 'bg-gray-500/20', textColor: 'text-gray-400' };
  }
};

export const WakeUpTimeTracker: React.FC<WakeUpTimeTrackerProps> = ({
  time,
  onOpenPicker,
  onUseNow,
  selectedDate = new Date(),
  onClear
}) => {
  const [showPresets, setShowPresets] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showXPRewards, setShowXPRewards] = useState(false);
  const [celebrating, setCelebrating] = useState(false);

  const multiplierInfo = getXPMultiplier(time);
  const IconComponent = multiplierInfo.icon;

  // Generate mock weekly data (in real app, fetch from database)
  const weeklyData: WakeUpHistoryData[] = useMemo(() => {
    const data: WakeUpHistoryData[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = format(subDays(selectedDate, i), 'yyyy-MM-dd');
      // Mock data - some variation
      const mockTime = i % 3 === 0 ? '6:30 AM' : i % 2 === 0 ? '7:15 AM' : '8:00 AM';
      const multiplier = getXPMultiplier(mockTime);
      data.push({ date, time: mockTime, multiplier: multiplier.multiplier });
    }
    return data;
  }, [selectedDate]);

  // Trigger celebration on 3x XP
  React.useEffect(() => {
    if (multiplierInfo.multiplier === 3 && time) {
      setCelebrating(true);
      const timer = setTimeout(() => setCelebrating(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [multiplierInfo.multiplier, time]);

  // Calculate streak (mock - in real app, fetch from database)
  const streak = 12;

  // Quick time presets
  const timePresets = [
    { time: '6:00 AM', label: '6:00', multiplier: 3 },
    { time: '6:30 AM', label: '6:30', multiplier: 3 },
    { time: '7:00 AM', label: '7:00', multiplier: 2 },
    { time: '7:30 AM', label: '7:30', multiplier: 2 },
  ];

  const handlePresetClick = (presetTime: string) => {
    // In real app, this would call onTimeChange
    onOpenPicker(); // For now, just open picker
  };

  const getBarHeight = (multiplier: number) => {
    switch (multiplier) {
      case 3: return 100;
      case 2: return 75;
      case 1.5: return 50;
      default: return 30;
    }
  };

  const getBarColor = (multiplier: number) => {
    switch (multiplier) {
      case 3: return 'bg-gradient-to-t from-green-600 to-green-400';
      case 2: return 'bg-gradient-to-t from-yellow-600 to-yellow-400';
      case 1.5: return 'bg-gradient-to-t from-orange-600 to-orange-400';
      default: return 'bg-gradient-to-t from-gray-600 to-gray-400';
    }
  };

  const formatDayLetter = (dateStr: string) => {
    const date = new Date(dateStr);
    return format(date, 'EEEEE');
  };

  return (
    <div className="space-y-3">
      {/* XP Multiplier Badge */}
      {time && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className={cn(
            "flex items-center justify-between px-3 py-2 rounded-lg border transition-all duration-300",
            multiplierInfo.bgColor,
            `border-${multiplierInfo.color}-500/30`
          )}
        >
          <div className="flex items-center gap-2">
            <motion.div
              animate={celebrating ? {
                scale: [1, 1.2, 1],
                rotate: [0, 10, -10, 0],
              } : {}}
              transition={{ duration: 0.5 }}
            >
              <IconComponent className={cn("h-5 w-5", multiplierInfo.textColor)} />
            </motion.div>
            <div>
              <div className={cn("text-xs font-semibold uppercase tracking-wide", multiplierInfo.textColor)}>
                {multiplierInfo.label}
              </div>
              <div className="text-white/90 text-lg font-bold">{time}</div>
            </div>
          </div>
          <div className="text-right">
            <div className={cn("text-2xl font-black", multiplierInfo.textColor)}>
              {multiplierInfo.multiplier}x
            </div>
            <div className="text-xs text-white/60">XP Multiplier</div>
          </div>
        </motion.div>
      )}

      {/* Quick Actions */}
      <div className="space-y-2">
        {time ? (
          <>
            {/* Edit Button */}
            <Button
              onClick={() => {
                setShowPresets(!showPresets);
                setShowHistory(false);
                setShowXPRewards(false);
              }}
              variant="outline"
              className="w-full bg-orange-900/10 border-orange-700/30 text-orange-400 hover:bg-orange-900/20 h-10 flex items-center justify-between"
            >
              <span>Change Time</span>
              {showPresets ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>

            {/* Quick Time Presets */}
            <AnimatePresence>
              {showPresets && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="grid grid-cols-4 gap-2 p-2 bg-orange-900/20 rounded-lg border border-orange-700/30">
                    {timePresets.map((preset) => {
                      const presetMultiplier = getXPMultiplier(preset.time);
                      const PresetIcon = presetMultiplier.icon;
                      return (
                        <button
                          key={preset.time}
                          onClick={() => handlePresetClick(preset.time)}
                          className={cn(
                            "flex flex-col items-center justify-center p-2 rounded-lg border transition-all duration-200 hover:scale-105",
                            presetMultiplier.bgColor,
                            `border-${presetMultiplier.color}-500/30`
                          )}
                        >
                          <div className="text-xs font-bold text-white">{preset.label}</div>
                          <div className="flex items-center gap-1 mt-1">
                            <PresetIcon className={cn("h-3 w-3", presetMultiplier.textColor)} />
                            <span className={cn("text-[10px] font-bold", presetMultiplier.textColor)}>
                              {presetMultiplier.multiplier}x
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Weekly Pattern Toggle */}
            <Button
              onClick={() => {
                setShowHistory(!showHistory);
                setShowPresets(false);
                setShowXPRewards(false);
              }}
              variant="outline"
              className="w-full bg-orange-900/10 border-orange-700/30 text-orange-400 hover:bg-orange-900/20 h-10 flex items-center justify-between"
            >
              <span className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                This Week's Pattern
              </span>
              {showHistory ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>

            {/* XP Rewards Toggle */}
            <Button
              onClick={() => {
                setShowXPRewards(!showXPRewards);
                setShowPresets(false);
                setShowHistory(false);
              }}
              variant="outline"
              className="w-full bg-orange-900/10 border-orange-700/30 text-orange-400 hover:bg-orange-900/20 h-10 flex items-center justify-between"
            >
              <span className="flex items-center gap-2">
                <Award className="h-4 w-4" />
                XP Rewards by Time
              </span>
              {showXPRewards ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>

            {/* Weekly Chart */}
            <AnimatePresence>
              {showHistory && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="p-3 bg-orange-900/20 rounded-lg border border-orange-700/30 space-y-3">
                    {/* Enhanced Bar Chart with Times */}
                    <div className="space-y-2">
                      <div className="flex items-end justify-between gap-1 h-[60px] px-1">
                        {weeklyData.map((day, index) => (
                          <div key={index} className="flex-1 flex flex-col items-center justify-end h-full group relative">
                            <motion.div
                              initial={{ height: 0 }}
                              animate={{ height: `${getBarHeight(day.multiplier)}%` }}
                              transition={{ duration: 0.4, delay: index * 0.05 }}
                              className={cn(
                                "w-full max-w-[14px] rounded-t-sm transition-all duration-300",
                                day.time ? getBarColor(day.multiplier) : "bg-white/5"
                              )}
                            />
                            {/* Tooltip with exact time */}
                            {day.time && (
                              <div className="absolute bottom-full mb-1 opacity-0 group-hover:opacity-100 transition-opacity bg-black/90 text-[10px] text-white px-2 py-1 rounded pointer-events-none whitespace-nowrap z-10 shadow-lg">
                                <div className="font-semibold">{day.time}</div>
                                <div className="text-orange-300">{day.multiplier}x XP</div>
                              </div>
                            )}
                            <div className="text-[10px] text-orange-300/70 mt-1">{formatDayLetter(day.date)}</div>
                          </div>
                        ))}
                      </div>

                      {/* Time List - Exact times below the chart */}
                      <div className="grid grid-cols-7 gap-1 mt-2">
                        {weeklyData.map((day, index) => (
                          <div key={index} className="text-center">
                            <div className={cn(
                              "text-[9px] font-medium px-1 py-0.5 rounded",
                              day.time ? "bg-orange-900/40 text-orange-200" : "text-orange-400/40"
                            )}>
                              {day.time || '--:--'}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Streak Info */}
                    <div className="flex items-center justify-between pt-2 border-t border-orange-700/30">
                      <div className="flex items-center gap-2">
                        <Flame className="h-4 w-4 text-orange-400" />
                        <span className="text-sm text-orange-200">Current Streak</span>
                      </div>
                      <span className="text-lg font-bold text-orange-400">{streak} days</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* XP Rewards Graph */}
            <AnimatePresence>
              {showXPRewards && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="p-3 bg-orange-900/20 rounded-lg border border-orange-700/30 space-y-3">
                    <div className="text-xs text-orange-300/80 text-center mb-2">
                      XP rewards decrease as wake-up time gets later
                    </div>

                    {/* Visual Bar Graph */}
                    <div className="space-y-2">
                      {XP_REWARD_TIERS.map((tier, index) => {
                        const widthPercent = (tier.maxXP / 150) * 100;
                        return (
                          <div key={index} className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-orange-200/90 font-medium">{tier.timeRange}</span>
                              <span className={cn("font-bold", tier.color)}>
                                {tier.multiplier}x ({tier.maxXP} XP)
                              </span>
                            </div>
                            <div className="relative h-3 bg-orange-900/40 rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${widthPercent}%` }}
                                transition={{ duration: 0.5, delay: index * 0.05 }}
                                className={cn(
                                  "h-full rounded-full",
                                  tier.bgColor.replace('/20', '/60'),
                                  "border border-white/10"
                                )}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Current Time Indicator */}
                    {time && (
                      <div className="mt-3 pt-3 border-t border-orange-700/30">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-orange-300/70">Current Selection</span>
                          <span className={cn("text-sm font-bold", multiplierInfo.textColor)}>
                            {multiplierInfo.multiplier}x multiplier
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        ) : (
          <>
            {/* Empty State */}
            <div className="text-center py-4">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="mb-3"
              >
                <Clock className="h-8 w-8 text-orange-400 mx-auto mb-2" />
              </motion.div>
              <p className="text-orange-200 font-semibold mb-1">What time did you wake up today?</p>
              <p className="text-xs text-orange-300/70">Early risers earn 3x XP! 🌅</p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                onClick={onOpenPicker}
                className="flex-1 bg-orange-900/10 border border-orange-700/30 text-orange-400 hover:bg-orange-900/20 h-10"
              >
                <Clock className="h-4 w-4 mr-2" />
                Set Time
              </Button>
              <Button
                onClick={onUseNow}
                className="bg-orange-600 hover:bg-orange-700 text-white h-10 px-4 font-semibold"
              >
                Now
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
