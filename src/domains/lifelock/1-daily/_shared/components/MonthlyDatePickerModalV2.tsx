/**
 * MonthlyDatePickerModal V2 - Premium Edition
 *
 * Enhanced second-generation date picker with:
 * - Glassmorphism design with subtle gradients
 * - Animated stats with counters
 * - Heat map style calendar with intensity indicators
 * - Haptic feedback animations
 * - Streak visualization with fire icons
 * - Best day highlighting with crown badge
 * - Week performance mini-bars
 * - Smooth micro-interactions
 */

import React, { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X, Crown, Flame, TrendingUp, Award, Zap } from 'lucide-react';
import { format, startOfMonth, endOfMonth, startOfWeek, addDays, addMonths, subMonths, isSameDay, isToday, isSameMonth, eachDayOfInterval } from 'date-fns';
import { cn } from '@/lib/utils';

export interface MonthlyDatePickerModalV2Props {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  isOpen: boolean;
  onClose: () => void;
  className?: string;
  dateCompletionMap?: Record<string, number>;
  dateXPMap?: Record<string, number>;
  dateScreenTimeMap?: Record<string, number>;
}

// Animated counter component for stats
const AnimatedCounter: React.FC<{ value: number; duration?: number }> = ({ value, duration = 0.5 }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    const animate = () => {
      const elapsed = (Date.now() - startTime) / 1000;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // Ease out cubic
      setCount(Math.round(value * eased));
      if (progress < 1) requestAnimationFrame(animate);
    };
    animate();
  }, [value, duration]);

  return <span>{count.toLocaleString()}</span>;
};

export const MonthlyDatePickerModalV2: React.FC<MonthlyDatePickerModalV2Props> = ({
  selectedDate,
  onDateChange,
  isOpen,
  onClose,
  className = '',
  dateCompletionMap = {},
  dateXPMap = {},
  dateScreenTimeMap = {}
}) => {
  const [currentMonth, setCurrentMonth] = useState(() => startOfMonth(selectedDate));
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && !isSameMonth(selectedDate, currentMonth)) {
      setCurrentMonth(startOfMonth(selectedDate));
    }
  }, [selectedDate, currentMonth, isOpen]);

  const dayHeaders = useMemo(() => ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], []);

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const days = [];
    for (let i = 0; i < 42; i++) {
      days.push(addDays(calendarStart, i));
    }
    return days;
  }, [currentMonth]);

  const monthStats = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

    let totalXP = 0;
    let daysWithData = 0;
    let totalScreenTime = 0;
    let bestDayXP = 0;
    let bestDay = '';
    let currentStreak = 0;
    let maxStreak = 0;
    let tempStreak = 0;

    daysInMonth.forEach(day => {
      const dateKey = format(day, 'yyyy-MM-dd');
      const xp = dateXPMap[dateKey] || 0;
      const screenTime = dateScreenTimeMap[dateKey] || 0;

      if (xp > 0) {
        totalXP += xp;
        daysWithData++;
        tempStreak++;
        maxStreak = Math.max(maxStreak, tempStreak);

        if (xp > bestDayXP) {
          bestDayXP = xp;
          bestDay = dateKey;
        }
      } else {
        tempStreak = 0;
      }
      totalScreenTime += screenTime;
    });

    const avgXPPerDay = daysWithData > 0 ? Math.round(totalXP / daysWithData) : 0;
    const daysWithScreenTime = daysInMonth.filter(day => {
      const dateKey = format(day, 'yyyy-MM-dd');
      return (dateScreenTimeMap[dateKey] || 0) > 0;
    }).length;
    const avgScreenTime = daysWithScreenTime > 0 ? Math.round(totalScreenTime / daysWithScreenTime) : 0;

    return {
      totalXP,
      avgXPPerDay,
      daysWithData,
      totalDays: daysInMonth.length,
      avgScreenTime,
      bestDayXP,
      bestDay,
      maxStreak
    };
  }, [currentMonth, dateXPMap, dateScreenTimeMap]);

  const handlePreviousMonth = () => setCurrentMonth(prev => subMonths(prev, 1));
  const handleNextMonth = () => setCurrentMonth(prev => addMonths(prev, 1));
  const handleDateSelect = (date: Date) => { onDateChange(date); onClose(); };
  const handleToday = () => { setCurrentMonth(startOfMonth(new Date())); onDateChange(new Date()); onClose(); };

  const formatScreenTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const getXPIntensity = (xp: number) => {
    if (xp >= 1000) return { level: 'legendary', color: 'from-yellow-400/40 to-amber-500/30', border: 'border-yellow-400/50', text: 'text-yellow-300' };
    if (xp >= 500) return { level: 'epic', color: 'from-purple-400/30 to-violet-500/20', border: 'border-purple-400/40', text: 'text-purple-300' };
    if (xp >= 250) return { level: 'rare', color: 'from-blue-400/25 to-cyan-500/15', border: 'border-blue-400/30', text: 'text-blue-300' };
    if (xp >= 100) return { level: 'uncommon', color: 'from-green-400/20 to-emerald-500/10', border: 'border-green-400/30', text: 'text-green-300' };
    if (xp > 0) return { level: 'common', color: 'from-gray-400/15 to-slate-500/10', border: 'border-gray-400/20', text: 'text-gray-300' };
    return { level: 'empty', color: 'bg-transparent', border: 'border-white/5', text: 'text-white/20' };
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Glassmorphism backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-md z-[60]"
            onClick={onClose}
          />

          <div className="fixed inset-0 z-[70] flex items-end justify-center pointer-events-none">
            <motion.div
              initial={{ opacity: 0, y: '100%', scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: '100%', scale: 0.95, transition: { duration: 0.25, ease: 'easeIn' } }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className={cn(
                'pointer-events-auto bg-gradient-to-b from-[#1a1a1a] to-[#0f0f0f] border-t border-x border-white/10 rounded-t-[2.5rem] shadow-2xl w-full h-[92vh] flex flex-col overflow-hidden',
                className
              )}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Animated header with gradient glow */}
              <div className="relative">
                {/* Top gradient accent */}
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50" />

                <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
                  <motion.button
                    onClick={handlePreviousMonth}
                    className="w-11 h-11 rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] hover:from-white/10 hover:to-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white transition-all shadow-lg"
                    whileHover={{ scale: 1.05, rotate: -5 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </motion.button>

                  <div className="flex-1 text-center">
                    <motion.h2
                      key={format(currentMonth, 'MMMM yyyy')}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-2xl font-bold bg-gradient-to-r from-white via-white to-white/70 bg-clip-text text-transparent"
                    >
                      {format(currentMonth, 'MMMM yyyy')}
                    </motion.h2>
                  </div>

                  <motion.button
                    onClick={handleNextMonth}
                    className="w-11 h-11 rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] hover:from-white/10 hover:to-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white transition-all shadow-lg"
                    whileHover={{ scale: 1.05, rotate: 5 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <ChevronRight className="h-5 w-5" />
                  </motion.button>

                  <motion.button
                    onClick={onClose}
                    className="w-11 h-11 rounded-2xl hover:bg-white/5 flex items-center justify-center text-white/50 hover:text-white transition-all ml-3"
                    whileHover={{ scale: 1.05, rotate: 90 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <X className="h-5 w-5" />
                  </motion.button>
                </div>
              </div>

              {/* Premium Stats Section with Glass Cards */}
              <div className="px-4 py-4 space-y-3">
                {/* Main Hero Stats */}
                <div className="grid grid-cols-3 gap-3">
                  {/* Total XP - Hero */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className="relative col-span-2 bg-gradient-to-br from-blue-500/20 via-purple-500/10 to-pink-500/20 rounded-3xl p-4 border border-white/10 shadow-xl overflow-hidden"
                  >
                    {/* Animated background glow */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 animate-pulse" />

                    <div className="relative flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-blue-300/80 mb-1 flex items-center gap-1">
                          <Zap className="h-3 w-3" />
                          Total XP
                        </p>
                        <p className="text-3xl font-black text-white">
                          <AnimatedCounter value={monthStats.totalXP} />
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-white/40">Best Day</p>
                        <p className="text-lg font-bold text-yellow-300 flex items-center justify-end gap-1">
                          <Crown className="h-4 w-4" />
                          {monthStats.bestDayXP.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Streak Counter */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.15 }}
                    className="bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-3xl p-4 border border-white/10 shadow-xl flex flex-col items-center justify-center"
                  >
                    <Flame className="h-6 w-6 text-orange-400 mb-1" />
                    <p className="text-2xl font-black text-white">{monthStats.maxStreak}</p>
                    <p className="text-[10px] font-medium text-orange-300/80">Day Streak</p>
                  </motion.div>
                </div>

                {/* Secondary Stats Row */}
                <div className="grid grid-cols-4 gap-2">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white/5 backdrop-blur-sm rounded-2xl p-3 border border-white/5 text-center"
                  >
                    <Award className="h-4 w-4 text-emerald-400 mx-auto mb-1" />
                    <p className="text-lg font-bold text-white">{monthStats.avgXPPerDay}</p>
                    <p className="text-[10px] text-white/40">Avg/Day</p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.22 }}
                    className="bg-white/5 backdrop-blur-sm rounded-2xl p-3 border border-white/5 text-center"
                  >
                    <TrendingUp className="h-4 w-4 text-purple-400 mx-auto mb-1" />
                    <p className="text-lg font-bold text-white">{monthStats.daysWithData}/{monthStats.totalDays}</p>
                    <p className="text-[10px] text-white/40">Active</p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.24 }}
                    className="bg-white/5 backdrop-blur-sm rounded-2xl p-3 border border-white/5 text-center"
                  >
                    <p className="text-lg font-bold text-cyan-400">{formatScreenTime(monthStats.avgScreenTime)}</p>
                    <p className="text-[10px] text-white/40">Screen</p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.26 }}
                    className="bg-white/5 backdrop-blur-sm rounded-2xl p-3 border border-white/5 text-center"
                  >
                    <p className="text-lg font-bold text-rose-400">
                      {monthStats.totalDays > 0 ? Math.round((monthStats.daysWithData / monthStats.totalDays) * 100) : 0}%
                    </p>
                    <p className="text-[10px] text-white/40">Complete</p>
                  </motion.div>
                </div>
              </div>

              {/* Calendar Grid */}
              <div className="flex-1 overflow-y-auto px-4 pb-4">
                {/* Day Headers */}
                <div className="grid grid-cols-7 gap-2 mb-3">
                  {dayHeaders.map((day) => (
                    <div key={day} className="text-center">
                      <span className="text-xs font-bold text-white/30 tracking-wider">{day}</span>
                    </div>
                  ))}
                </div>

                {/* Calendar Days with Premium Styling */}
                <div className="grid grid-cols-7 gap-2">
                  {calendarDays.map((date, index) => {
                    const dateKey = format(date, 'yyyy-MM-dd');
                    const isSelected = isSameDay(date, selectedDate);
                    const isDayToday = isToday(date);
                    const isInMonth = isSameMonth(date, currentMonth);
                    const xp = dateXPMap[dateKey] || 0;
                    const intensity = getXPIntensity(xp);
                    const isBestDay = dateKey === monthStats.bestDay && monthStats.bestDayXP > 0;

                    const today = new Date();
                    const startOfTodayWeek = startOfWeek(today, { weekStartsOn: 1 });
                    const endOfTodayWeek = addDays(startOfTodayWeek, 6);
                    const isInCurrentWeek = date >= startOfTodayWeek && date <= endOfTodayWeek;

                    return (
                      <motion.button
                        key={dateKey}
                        onClick={() => isInMonth && handleDateSelect(date)}
                        disabled={!isInMonth}
                        onMouseEnter={() => setHoveredDate(dateKey)}
                        onMouseLeave={() => setHoveredDate(null)}
                        className={cn(
                          'relative flex flex-col items-center justify-center py-3 px-2 rounded-2xl transition-all min-h-[4.5rem] overflow-hidden',
                          intensity.color,
                          intensity.border,
                          'border',
                          isSelected && 'ring-2 ring-blue-400 ring-offset-2 ring-offset-[#1a1a1a] scale-105',
                          isDayToday && isInMonth && 'ring-2 ring-orange-400 ring-offset-2 ring-offset-[#1a1a1a]',
                          isBestDay && 'ring-2 ring-yellow-400 ring-offset-2 ring-offset-[#1a1a1a]',
                          isInCurrentWeek && isInMonth && !isSelected && !isDayToday && 'bg-white/15',
                          !isInMonth && 'opacity-20',
                          isInMonth && !isSelected && !isDayToday && 'hover:scale-105 hover:shadow-lg'
                        )}
                        whileHover={isInMonth && !isSelected && !isDayToday ? { scale: 1.05, y: -2 } : {}}
                        whileTap={isInMonth ? { scale: 0.97 } : {}}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.01, duration: 0.2 }}
                      >
                        {/* Crown for best day */}
                        {isBestDay && (
                          <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ delay: 0.5 + index * 0.01, type: 'spring', stiffness: 200 }}
                            className="absolute -top-1 -right-1"
                          >
                            <Crown className="h-4 w-4 text-yellow-400" fill="currentColor" />
                          </motion.div>
                        )}

                        <span className={cn(
                          'text-lg font-bold',
                          intensity.text,
                          (isSelected || isDayToday) && 'text-white'
                        )}>
                          {format(date, 'd')}
                        </span>

                        {isInMonth && (
                          <>
                            {xp > 0 ? (
                              <span className={cn('text-xs font-medium mt-1', intensity.text)}>
                                {xp >= 1000 ? `${(xp / 1000).toFixed(1)}k` : xp}
                              </span>
                            ) : (
                              <span className="text-xs text-white/15 mt-1">
                                {format(date, 'MMM').slice(0, 3)}
                              </span>
                            )}
                          </>
                        )}

                        {(isSelected || isDayToday) && isInMonth && (
                          <span className="text-xs font-medium text-white/80 mt-1">
                            {isDayToday ? 'Today' : format(date, 'MMM').slice(0, 3)}
                          </span>
                        )}

                        {/* Hover tooltip */}
                        {hoveredDate === dateKey && xp > 0 && (
                          <motion.div
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="absolute bottom-full mb-2 px-2 py-1 bg-black/90 backdrop-blur-sm rounded-lg text-xs text-white whitespace-nowrap z-10"
                          >
                            {xp} XP • {intensity.level}
                          </motion.div>
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Bottom Action Bar */}
              <div className="px-4 pb-8 pt-4 border-t border-white/5 bg-gradient-to-t from-black/20 to-transparent">
                <div className="flex items-center justify-between">
                  <motion.button
                    onClick={handleToday}
                    className="flex items-center gap-2 text-blue-400 font-semibold hover:text-blue-300 transition-colors px-4 py-2 rounded-xl hover:bg-blue-500/10"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Zap className="h-4 w-4" />
                    Today
                  </motion.button>

                  <motion.button
                    onClick={onClose}
                    className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 rounded-2xl text-white font-bold transition-all shadow-lg shadow-blue-500/25"
                    whileHover={{ scale: 1.02, boxShadow: '0 10px 40px -10px rgba(59, 130, 246, 0.5)' }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Done
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

MonthlyDatePickerModalV2.displayName = 'MonthlyDatePickerModalV2';
