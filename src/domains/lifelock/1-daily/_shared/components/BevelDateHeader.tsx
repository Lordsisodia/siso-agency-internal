import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { format, isToday, isTomorrow, isYesterday, subDays, addDays } from 'date-fns';
import { cn } from '@/lib/utils';
import { useClerkUser } from '@/lib/hooks/auth/useClerkUser';
import { MonthlyDatePickerModal } from './MonthlyDatePickerModal';

interface BevelDateHeaderProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  completionPercentage?: number;
  activeTab?: string;
  totalXP?: number;
  className?: string;
  // Optional: Map of dates to completion percentages for the dropdown dots
  dateCompletionMap?: Record<string, number>;
  // Callback for when picker opens/closes (to hide bottom nav)
  onPickerOpenChange?: (isOpen: boolean) => void;
}

export const BevelDateHeader: React.FC<BevelDateHeaderProps> = ({
  selectedDate,
  onDateChange,
  completionPercentage = 0,
  activeTab = 'timebox',
  totalXP = 0,
  className = '',
  dateCompletionMap = {},
  onPickerOpenChange
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { user } = useClerkUser();

  // Notify parent when picker state changes
  React.useEffect(() => {
    onPickerOpenChange?.(isDropdownOpen);
  }, [isDropdownOpen, onPickerOpenChange]);

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
          primary: 'text-blue-400',
          bg: 'bg-blue-400',
          gradient: 'from-blue-500 to-cyan-400'
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
      // Health section
      case 'stats':
        return {
          primary: 'text-emerald-400',
          bg: 'bg-emerald-400',
          gradient: 'from-emerald-500 to-green-400'
        };
      case 'fitness':
        return {
          primary: 'text-rose-400',
          bg: 'bg-rose-400',
          gradient: 'from-rose-500 to-orange-400'
        };
      case 'nutrition':
        return {
          primary: 'text-amber-400',
          bg: 'bg-amber-400',
          gradient: 'from-amber-500 to-orange-400'
        };
      default:
        return {
          primary: 'text-blue-400',
          bg: 'bg-blue-400',
          gradient: 'from-blue-500 to-cyan-400'
        };
    }
  }, [activeTab]);

  // Smart date display logic
  const dateInfo = useMemo(() => {
    let relativeDay = '';

    if (isToday(selectedDate)) {
      relativeDay = 'Today';
    } else if (isTomorrow(selectedDate)) {
      relativeDay = 'Tomorrow';
    } else if (isYesterday(selectedDate)) {
      relativeDay = 'Yesterday';
    } else {
      relativeDay = format(selectedDate, 'EEEE');
    }

    const formattedDate = format(selectedDate, 'MMM d');
    const fullDate = format(selectedDate, 'MMMM d, yyyy');

    return { relativeDay, formattedDate, fullDate };
  }, [selectedDate]);

  const handlePreviousDay = () => {
    onDateChange(subDays(selectedDate, 1));
  };

  const handleNextDay = () => {
    onDateChange(addDays(selectedDate, 1));
  };

  const handleDateSelect = (date: Date) => {
    onDateChange(date);
  };

  const handleOpenPicker = () => {
    setIsDropdownOpen(true);
  };

  const handleClosePicker = () => {
    setIsDropdownOpen(false);
  };

  return (
    <div className={cn('relative', className)}>
      {/* Main Header */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-lg">
        <div className="flex items-center justify-between">
          {/* Left: Empty space (profile will go here if we want it on left) */}
          <div className="w-10" />

          {/* Center/Right: Date Display with Navigation */}
          <div className="flex-1 flex items-center justify-end gap-2">
            {/* Date Display - Clickable to open dropdown */}
            <motion.button
              onClick={handleOpenPicker}
              className="text-right hover:bg-white/5 rounded-xl px-4 py-2 transition-all duration-200"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <h1 className={cn('text-2xl font-bold mb-0.5', getTabColors.primary)}>
                {dateInfo.relativeDay}
              </h1>
              <p className="text-gray-400 text-sm flex items-center justify-end gap-1.5">
                {dateInfo.formattedDate}
                <Calendar className="h-3.5 w-3.5" />
              </p>
            </motion.button>

            {/* Navigation Arrows */}
            <div className="flex items-center gap-1">
              <motion.button
                onClick={handlePreviousDay}
                className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ChevronLeft className="h-5 w-5" />
              </motion.button>

              <motion.button
                onClick={handleNextDay}
                className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ChevronRight className="h-5 w-5" />
              </motion.button>
            </div>

            {/* Clerk Profile Icon */}
            {user?.imageUrl ? (
              <div className="w-10 h-10 rounded-xl overflow-hidden border border-white/10 ml-2">
                <img
                  src={user.imageUrl}
                  alt={user.fullName || 'Profile'}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-siso-primary/20 to-siso-secondary/20 border border-white/10 ml-2 flex items-center justify-center">
                <span className="text-lg font-bold text-siso-text">
                  {user?.firstName?.[0] || user?.email?.[0] || '?'}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Monthly Date Picker Modal */}
      <MonthlyDatePickerModal
        selectedDate={selectedDate}
        onDateChange={handleDateSelect}
        isOpen={isDropdownOpen}
        onClose={handleClosePicker}
        dateCompletionMap={dateCompletionMap}
      />
    </div>
  );
};

BevelDateHeader.displayName = 'BevelDateHeader';
