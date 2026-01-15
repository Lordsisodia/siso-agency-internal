import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Calendar, X } from 'lucide-react';
import { format, isToday, isTomorrow, isYesterday, subDays } from 'date-fns';
import { cn } from '@/lib/utils';
import { useClerkUser } from '@/lib/hooks/useClerkUser';
import { DayProgressPill } from './DayProgressPill';
import { XPPill } from './XPPill';

interface UnifiedTopNavProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  completionPercentage?: number;
  activeTab?: string;
  totalXP?: number;
  className?: string;
  dateCompletionMap?: Record<string, number>;
}

export const UnifiedTopNav: React.FC<UnifiedTopNavProps> = ({
  selectedDate,
  onDateChange,
  completionPercentage = 0,
  activeTab = 'timebox',
  totalXP = 0,
  className = '',
  dateCompletionMap = {}
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { user } = useClerkUser();

  // Date formatting for display
  const formatDateDisplay = useMemo(() => {
    let dayName: string;

    if (isToday(selectedDate)) {
      dayName = 'Today';
    } else if (isTomorrow(selectedDate)) {
      dayName = 'Tomorrow';
    } else if (isYesterday(selectedDate)) {
      dayName = 'Yesterday';
    } else {
      dayName = format(selectedDate, 'EEEE');
    }

    const dayOfMonth = format(selectedDate, 'd');
    const monthName = format(selectedDate, 'MMMM');
    return `${dayName}, ${dayOfMonth} ${monthName}`;
  }, [selectedDate]);

  // Dynamic color system based on active tab
  const getTabColors = useMemo(() => {
    switch (activeTab) {
      case 'morning':
        return {
          primary: 'text-orange-400',
          bg: 'bg-orange-400',
          gradient: 'from-orange-500 to-amber-400'
        };
      case 'work':
        return {
          primary: 'text-blue-400',
          bg: 'bg-blue-400',
          gradient: 'from-blue-500 to-cyan-400'
        };
      case 'light-work':
        return {
          primary: 'text-emerald-400',
          bg: 'bg-emerald-400',
          gradient: 'from-emerald-500 to-teal-400'
        };
      case 'timebox':
        return {
          primary: 'text-sky-400',
          bg: 'bg-sky-400',
          gradient: 'from-indigo-500 to-cyan-400'
        };
      case 'wellness':
        return {
          primary: 'text-rose-400',
          bg: 'bg-rose-400',
          gradient: 'from-rose-500 to-pink-400'
        };
      case 'checkout':
        return {
          primary: 'text-purple-400',
          bg: 'bg-purple-400',
          gradient: 'from-purple-500 to-pink-400'
        };
      default:
        return {
          primary: 'text-sky-400',
          bg: 'bg-sky-400',
          gradient: 'from-indigo-500 to-cyan-400'
        };
    }
  }, [activeTab]);

  // Generate last 14 days for dropdown
  const recentDates = useMemo(() => {
    const dates = [];
    for (let i = 13; i >= 0; i--) {
      const date = subDays(new Date(), i);
      dates.push(date);
    }
    return dates;
  }, []);

  const handleDateSelect = (date: Date) => {
    onDateChange(date);
    setIsDropdownOpen(false);
  };

  return (
    <div className={cn('relative', className)}>
      {/* Main Header Bar */}
      <div className="bg-[#121212] border-b border-white/10">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Left: Date + Dropdown */}
            <motion.button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-1 hover:bg-white/5 rounded-lg px-3 py-2 transition-all"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="text-white font-semibold text-lg">
                {formatDateDisplay}
              </span>
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </motion.button>

            {/* Right: Profile Avatar */}
            <img
              src={user?.imageUrl || ''}
              alt={user?.fullName || 'Profile'}
              className="w-8 h-8 rounded-lg object-cover"
            />
          </div>
        </div>

        {/* Day Completion Progress Bar and XP */}
        <div className="px-4 pb-3">
          <div className="flex items-center justify-between gap-3">
            {/* Day Progress Pill - 60% width */}
            <div className="w-[60%]">
              <DayProgressPill
                percentage={completionPercentage}
                activeTab={activeTab}
                showIcon={true}
              />
            </div>

            {/* XP Pill - 40% width */}
            <div className="w-[40%]">
              <XPPill
                xp={totalXP}
                activeTab={activeTab}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Date Picker Dropdown */}
      <AnimatePresence>
        {isDropdownOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
              onClick={() => setIsDropdownOpen(false)}
            />

            {/* Dropdown Content */}
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="absolute top-full left-0 right-0 mt-2 z-50 bg-[#1a1a1a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
            >
              {/* Header with close button */}
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                <h3 className="text-sm font-semibold text-gray-300">Select Date</h3>
                <button
                  onClick={() => setIsDropdownOpen(false)}
                  className="w-8 h-8 rounded-lg hover:bg-white/5 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Dates Grid */}
              <div className="p-4 grid grid-cols-7 gap-2">
                {recentDates.map((date, index) => {
                  const dateKey = format(date, 'yyyy-MM-dd');
                  const isSelected = format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
                  const completion = dateCompletionMap[dateKey] || 0;
                  const isDayToday = isToday(date);

                  return (
                    <motion.button
                      key={dateKey}
                      onClick={() => handleDateSelect(date)}
                      className={cn(
                        'relative flex flex-col items-center justify-center p-3 rounded-xl transition-all duration-200',
                        isSelected
                          ? cn('bg-gradient-to-br', getTabColors.gradient, 'scale-105 shadow-lg')
                          : 'hover:bg-white/5'
                      )}
                      whileHover={{ scale: isSelected ? 1.05 : 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {/* Day name */}
                      <span className={cn(
                        'text-xs font-medium mb-1',
                        isSelected ? 'text-white' : 'text-gray-400'
                      )}>
                        {format(date, 'EEE')}
                      </span>

                      {/* Date number */}
                      <span className={cn(
                        'text-lg font-bold',
                        isSelected ? 'text-white' : 'text-gray-300'
                      )}>
                        {format(date, 'd')}
                      </span>

                      {/* Completion dot indicator */}
                      <div className="mt-2 flex gap-0.5">
                        {completion > 0 && (
                          <div
                            className={cn(
                              'w-1.5 h-1.5 rounded-full',
                              completion >= 100
                                ? cn(getTabColors.bg)
                                : isSelected
                                  ? 'bg-white/70'
                                  : 'bg-gray-500'
                            )}
                          />
                        )}
                        {completion >= 50 && completion < 100 && (
                          <div
                            className={cn(
                              'w-1.5 h-1.5 rounded-full',
                              isSelected ? 'bg-white/70' : 'bg-gray-500'
                            )}
                          />
                        )}
                      </div>

                      {/* Today indicator */}
                      {isDayToday && (
                        <div className={cn(
                          'absolute -top-1 -right-1 w-2 h-2 rounded-full',
                          getTabColors.bg,
                          'shadow-lg'
                        )} />
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

UnifiedTopNav.displayName = 'UnifiedTopNav';
