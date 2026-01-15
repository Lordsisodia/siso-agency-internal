/**
 * MonthlyDatePickerModal Component
 *
 * A clean, minimal date picker modal that slides up from bottom:
 * - Covers 90% of screen height
 * - Clean calendar with day pills
 * - Essential stats only
 * - Minimal clutter
 */

import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { format, startOfMonth, endOfMonth, startOfWeek, addDays, addMonths, subMonths, isSameDay, isToday, isSameMonth, eachDayOfInterval } from 'date-fns';
import { cn } from '@/lib/utils';

export interface MonthlyDatePickerModalProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  isOpen: boolean;
  onClose: () => void;
  className?: string;
  dateCompletionMap?: Record<string, number>;
  dateXPMap?: Record<string, number>;
  dateScreenTimeMap?: Record<string, number>;
}

export const MonthlyDatePickerModal: React.FC<MonthlyDatePickerModalProps> = ({
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

  React.useEffect(() => {
    if (isOpen && !isSameMonth(selectedDate, currentMonth)) {
      setCurrentMonth(startOfMonth(selectedDate));
    }
  }, [selectedDate, currentMonth, isOpen]);

  React.useEffect(() => {
    if (isOpen) {
      setCurrentMonth(startOfMonth(selectedDate));
    }
  }, [isOpen, selectedDate]);

  const dayHeaders = useMemo(() => {
    return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  }, []);

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

    daysInMonth.forEach(day => {
      const dateKey = format(day, 'yyyy-MM-dd');
      const xp = dateXPMap[dateKey] || 0;
      const screenTime = dateScreenTimeMap[dateKey] || 0;
      if (xp > 0) {
        totalXP += xp;
        daysWithData++;
      }
      totalScreenTime += screenTime;
    });

    const avgXPPerDay = daysWithData > 0 ? Math.round(totalXP / daysWithData) : 0;
    const daysWithScreenTime = daysInMonth.filter(day => {
      const dateKey = format(day, 'yyyy-MM-dd');
      return (dateScreenTimeMap[dateKey] || 0) > 0;
    }).length;
    const avgScreenTime = daysWithScreenTime > 0 ? Math.round(totalScreenTime / daysWithScreenTime) : 0;

    return { totalXP, avgXPPerDay, daysWithData, totalDays: daysInMonth.length, avgScreenTime };
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

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
            onClick={onClose}
          />

          <div className="fixed inset-0 z-[70] flex items-end justify-center pointer-events-none">
            <motion.div
              initial={{ opacity: 0, y: '100%' }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: '100%', transition: { duration: 0.2, ease: 'easeIn' } }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className={cn(
                'pointer-events-auto bg-[#1a1a1a] border-t border-x border-white/10 rounded-t-3xl shadow-2xl w-full h-[90vh] flex flex-col',
                className
              )}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                <motion.button
                  onClick={handlePreviousMonth}
                  className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white/70 hover:text-white transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ChevronLeft className="h-5 w-5" />
                </motion.button>

                <h2 className="text-xl font-bold text-white flex-1 text-center">
                  {format(currentMonth, 'MMMM yyyy')}
                </h2>

                <motion.button
                  onClick={handleNextMonth}
                  className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white/70 hover:text-white transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ChevronRight className="h-5 w-5" />
                </motion.button>

                <motion.button
                  onClick={onClose}
                  className="w-10 h-10 rounded-full hover:bg-white/5 flex items-center justify-center text-white/70 hover:text-white transition-all ml-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <X className="h-5 w-5" />
                </motion.button>
              </div>

              {/* Expanded Stats Section */}
              <div className="px-4 py-3 border-b border-white/5 bg-white/[0.02]">
                {/* Primary Stats Row */}
                <div className="flex items-center justify-around mb-3">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-white">{monthStats.totalXP.toLocaleString()}</p>
                    <p className="text-xs text-white/50 mt-0.5">Total XP</p>
                  </div>
                  <div className="w-px h-10 bg-white/10" />
                  <div className="text-center">
                    <p className="text-2xl font-bold text-emerald-400">{monthStats.avgXPPerDay.toLocaleString()}</p>
                    <p className="text-xs text-white/50 mt-0.5">Avg/Day</p>
                  </div>
                  <div className="w-px h-10 bg-white/10" />
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-400">{formatScreenTime(monthStats.avgScreenTime)}</p>
                    <p className="text-xs text-white/50 mt-0.5">Avg Screen</p>
                  </div>
                  <div className="w-px h-10 bg-white/10" />
                  <div className="text-center">
                    <p className="text-2xl font-bold text-amber-400">{monthStats.daysWithData}/{monthStats.totalDays}</p>
                    <p className="text-xs text-white/50 mt-0.5">Days Active</p>
                  </div>
                </div>

                {/* Secondary Stats Row */}
                <div className="grid grid-cols-4 gap-2">
                  <div className="text-center p-2 rounded-lg bg-white/5">
                    <p className="text-lg font-bold text-blue-400">{monthStats.totalDays}</p>
                    <p className="text-[10px] text-white/40 mt-0.5">Days in Month</p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-white/5">
                    <p className="text-lg font-bold text-cyan-400">{monthStats.avgXPPerDay > 0 ? Math.round(monthStats.avgXPPerDay * 7).toLocaleString() : 0}</p>
                    <p className="text-[10px] text-white/40 mt-0.5">Weekly Avg</p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-white/5">
                    <p className="text-lg font-bold text-rose-400">{monthStats.daysWithData > 0 ? Math.round((monthStats.daysWithData / monthStats.totalDays) * 100) : 0}%</p>
                    <p className="text-[10px] text-white/40 mt-0.5">Completion</p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-white/5">
                    <p className="text-lg font-bold text-indigo-400">{monthStats.totalDays - monthStats.daysWithData}</p>
                    <p className="text-[10px] text-white/40 mt-0.5">Days Left</p>
                  </div>
                </div>
              </div>

              {/* Calendar */}
              <div className="flex-1 overflow-y-auto p-4">
                <div className="grid grid-cols-7 gap-2 mb-2">
                  {dayHeaders.map((day) => (
                    <div key={day} className="text-center">
                      <span className="text-xs font-bold text-white/40 uppercase tracking-wider">{day}</span>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-2">
                  {calendarDays.map((date) => {
                    const dateKey = format(date, 'yyyy-MM-dd');
                    const isSelected = isSameDay(date, selectedDate);
                    const isDayToday = isToday(date);
                    const isInMonth = isSameMonth(date, currentMonth);
                    const xp = dateXPMap[dateKey] || 0;

                    const today = new Date();
                    const startOfTodayWeek = startOfWeek(today, { weekStartsOn: 1 });
                    const endOfTodayWeek = addDays(startOfTodayWeek, 6);
                    const isInCurrentWeek = date >= startOfTodayWeek && date <= endOfTodayWeek;

                    const getBackground = () => {
                      if (isSelected) return 'bg-blue-500 shadow-lg shadow-blue-500/30';
                      if (isDayToday && isInMonth) return 'bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg';
                      if (!isInMonth || xp === 0) return 'bg-transparent';
                      if (xp >= 1000) return 'bg-gradient-to-br from-yellow-500/30 to-amber-500/20';
                      if (xp >= 500) return 'bg-gradient-to-br from-emerald-500/25 to-green-500/15';
                      if (xp >= 100) return 'bg-gradient-to-br from-blue-500/20 to-cyan-500/10';
                      return 'bg-white/5';
                    };

                    return (
                      <motion.button
                        key={dateKey}
                        onClick={() => isInMonth && handleDateSelect(date)}
                        disabled={!isInMonth}
                        className={cn(
                          'relative flex flex-col items-center justify-center py-3 px-2 rounded-2xl transition-all min-h-[4rem]',
                          getBackground(),
                          isSelected && 'scale-105',
                          isDayToday && isInMonth && 'scale-105 ring-2 ring-orange-400/50',
                          isInCurrentWeek && isInMonth && !isSelected && !isDayToday && 'bg-white/10',
                          !isInMonth && 'opacity-25',
                          isInMonth && !isSelected && !isDayToday && 'hover:scale-102'
                        )}
                        whileHover={isInMonth && !isSelected && !isDayToday ? { scale: 1.03 } : {}}
                        whileTap={isInMonth ? { scale: 0.97 } : {}}
                      >
                        <span className={cn(
                          'text-lg font-bold',
                          isSelected || isDayToday ? 'text-white' : isInMonth ? 'text-white' : 'text-white/30'
                        )}>
                          {format(date, 'd')}
                        </span>

                        {isInMonth && !isSelected && !isDayToday && (
                          <>
                            {xp > 0 ? (
                              <span className={cn(
                                'text-xs font-medium mt-1',
                                xp >= 1000 ? 'text-yellow-300' :
                                xp >= 500 ? 'text-emerald-300' :
                                xp >= 100 ? 'text-blue-300' :
                                'text-white/60'
                              )}>
                                {xp >= 1000 ? `${(xp / 1000).toFixed(1)}k` : xp}
                              </span>
                            ) : (
                              <span className="text-xs text-white/25 mt-1">
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
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Bottom Bar */}
              <div className="px-4 pb-6 pt-3 border-t border-white/5">
                <div className="flex items-center justify-between">
                  <motion.button
                    onClick={handleToday}
                    className="text-blue-400 font-semibold hover:text-blue-300 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Today
                  </motion.button>

                  <motion.button
                    onClick={onClose}
                    className="px-6 py-2 bg-white/10 hover:bg-white/15 rounded-xl text-white font-medium transition-all"
                    whileHover={{ scale: 1.02 }}
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

MonthlyDatePickerModal.displayName = 'MonthlyDatePickerModal';
