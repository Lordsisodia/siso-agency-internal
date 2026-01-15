import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { format, isToday, isTomorrow, isYesterday } from 'date-fns';
import { cn } from '@/lib/utils';
import { useClerkUser } from '@/lib/hooks/useClerkUser';
import { DayProgressPill } from './DayProgressPill';
import { XPPill } from './XPPill';
import { MonthlyDatePickerModalV2 as MonthlyDatePickerModal } from './MonthlyDatePickerModalV2';

interface UnifiedTopNavProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  completionPercentage?: number;
  activeTab?: string;
  totalXP?: number;
  className?: string;
  dateCompletionMap?: Record<string, number>;
  dateXPMap?: Record<string, number>;
  dateScreenTimeMap?: Record<string, number>;
  onPickerOpenChange?: (isOpen: boolean) => void;
}

export const UnifiedTopNav: React.FC<UnifiedTopNavProps> = ({
  selectedDate,
  onDateChange,
  completionPercentage = 0,
  activeTab = 'timebox',
  totalXP = 0,
  className = '',
  dateCompletionMap = {},
  dateXPMap = {},
  dateScreenTimeMap = {},
  onPickerOpenChange
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { user } = useClerkUser();

  // Notify parent when picker state changes
  React.useEffect(() => {
    onPickerOpenChange?.(isDropdownOpen);
  }, [isDropdownOpen, onPickerOpenChange]);

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

  const handleDateSelect = (date: Date) => {
    onDateChange(date);
    setIsDropdownOpen(false);
  };

  const handleOpenPicker = () => {
    setIsDropdownOpen(true);
  };

  const handleClosePicker = () => {
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
              onClick={handleOpenPicker}
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

      {/* Monthly Date Picker Modal */}
      <MonthlyDatePickerModal
        selectedDate={selectedDate}
        onDateChange={handleDateSelect}
        isOpen={isDropdownOpen}
        onClose={handleClosePicker}
        dateCompletionMap={dateCompletionMap}
        dateXPMap={dateXPMap}
        dateScreenTimeMap={dateScreenTimeMap}
      />
    </div>
  );
};

UnifiedTopNav.displayName = 'UnifiedTopNav';
