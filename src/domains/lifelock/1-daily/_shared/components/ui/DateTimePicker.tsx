/**
 * 📅 DateTimePicker Component
 *
 * Combines date selection with time picker
 * Used for setting deadlines with both date AND time
 */

import React, { useState } from 'react';
import { Clock, X } from 'lucide-react';

export interface DateTimePickerProps {
  initialDateTime?: Date | null;
  onDateTimeSelect: (date: Date | null) => void;
  onClose: () => void;
  theme?: 'SLATE' | 'GREEN' | 'BLUE';
}

export const DateTimePicker: React.FC<DateTimePickerProps> = ({
  initialDateTime,
  onDateTimeSelect,
  onClose,
  theme = 'SLATE'
}) => {
  const [viewDate, setViewDate] = useState(() => {
    const now = new Date();
    const currentDate = initialDateTime ? new Date(initialDateTime) : now;
    return new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  });

  const [selectedDate, setSelectedDate] = useState<Date | null>(initialDateTime ? new Date(initialDateTime) : null);
  const [selectedHour, setSelectedHour] = useState(() => {
    if (initialDateTime) {
      return new Date(initialDateTime).getHours();
    }
    return new Date().getHours();
  });
  const [selectedMinute, setSelectedMinute] = useState(() => {
    if (initialDateTime) {
      return new Date(initialDateTime).getMinutes();
    }
    return 0;
  });

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

  const dayNames = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

  const now = new Date();
  const firstDayOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
  const startDate = new Date(firstDayOfMonth);
  const dayOfWeek = (firstDayOfMonth.getDay() + 6) % 7;
  startDate.setDate(startDate.getDate() - dayOfWeek);

  const days = [];
  for (let i = 0; i < 35; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    days.push(date);
  }

  const isToday = (date: Date) => {
    return date.toDateString() === now.toDateString();
  };

  const isSelected = (date: Date) => {
    return selectedDate && date.toDateString() === selectedDate.toDateString();
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === viewDate.getMonth();
  };

  const themeStyles = {
    SLATE: {
      bg: 'bg-slate-900',
      border: 'border-slate-700',
      text: 'text-slate-100',
      textSecondary: 'text-slate-400',
      hoverBg: 'hover:bg-slate-700',
      selectedBg: 'bg-slate-600',
      todayBg: 'bg-slate-500/30'
    },
    GREEN: {
      bg: 'bg-green-900',
      border: 'border-green-700',
      text: 'text-green-100',
      textSecondary: 'text-green-400',
      hoverBg: 'hover:bg-green-700',
      selectedBg: 'bg-green-600',
      todayBg: 'bg-green-500/30'
    },
    BLUE: {
      bg: 'bg-blue-900',
      border: 'border-blue-700',
      text: 'text-blue-100',
      textSecondary: 'text-blue-400',
      hoverBg: 'hover:bg-blue-700',
      selectedBg: 'bg-blue-600',
      todayBg: 'bg-blue-500/30'
    }
  };

  const styles = themeStyles[theme];

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
  };

  const handleConfirm = () => {
    if (selectedDate) {
      const result = new Date(selectedDate);
      result.setHours(selectedHour);
      result.setMinutes(selectedMinute);
      result.setSeconds(0);
      result.setMilliseconds(0);
      onDateTimeSelect(result);
    }
    onClose();
  };

  const handleClear = () => {
    onDateTimeSelect(null);
    onClose();
  };

  return (
    <div className={`${styles.bg} ${styles.border} border rounded-2xl p-4 w-[320px] shadow-2xl backdrop-blur-sm`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))}
          className={`${styles.textSecondary} ${styles.hoverBg} p-2 rounded-lg text-xl font-bold transition-all duration-200`}
        >
          ‹
        </button>
        <div className={`${styles.text} font-semibold text-base`}>
          {monthNames[viewDate.getMonth()]} {viewDate.getFullYear()}
        </div>
        <button
          onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))}
          className={`${styles.textSecondary} ${styles.hoverBg} p-2 rounded-lg text-xl font-bold transition-all duration-200`}
        >
          ›
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map(day => (
          <div key={day} className="text-center text-xs font-medium text-slate-400 py-1">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1 mb-4">
        {days.map((date, index) => {
          const currentMonth = isCurrentMonth(date);
          const selected = isSelected(date);
          const today = isToday(date);

          return (
            <button
              key={index}
              onClick={() => handleDateClick(date)}
              className={`
                aspect-square rounded-lg text-sm font-medium transition-all duration-200
                ${currentMonth ? styles.text : 'text-slate-600'}
                ${selected ? `${styles.selectedBg} text-white shadow-lg` : styles.hoverBg}
                ${today && !selected ? styles.todayBg : ''}
                ${!currentMonth ? 'opacity-30' : ''}
              `}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>

      {/* Time picker */}
      <div className="border-t border-slate-700 pt-4">
        <div className="flex items-center gap-2 mb-3">
          <Clock className="h-4 w-4 text-slate-400" />
          <span className="text-sm font-medium text-slate-300">Set Time</span>
        </div>

        <div className="flex items-center gap-3">
          {/* Hour picker */}
          <div className="flex-1">
            <label className="text-xs text-slate-400 mb-1 block">Hour</label>
            <select
              value={selectedHour}
              onChange={(e) => setSelectedHour(parseInt(e.target.value))}
              className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-slate-500"
            >
              {Array.from({ length: 24 }, (_, i) => (
                <option key={i} value={i}>
                  {i.toString().padStart(2, '0')}
                </option>
              ))}
            </select>
          </div>

          <span className="text-slate-400 text-lg mt-4">:</span>

          {/* Minute picker */}
          <div className="flex-1">
            <label className="text-xs text-slate-400 mb-1 block">Minute</label>
            <select
              value={selectedMinute}
              onChange={(e) => setSelectedMinute(parseInt(e.target.value))}
              className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-slate-500"
            >
              {Array.from({ length: 60 }, (_, i) => (
                <option key={i} value={i}>
                  {i.toString().padStart(2, '0')}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Preview */}
        {selectedDate && (
          <div className="mt-3 text-center text-sm text-slate-300">
            {selectedDate.toLocaleDateString()} at {selectedHour.toString().padStart(2, '0')}:{selectedMinute.toString().padStart(2, '0')}
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-700">
        <button
          onClick={handleClear}
          className="flex-1 px-4 py-2 rounded-lg text-sm font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors"
        >
          Clear
        </button>
        <button
          onClick={handleConfirm}
          disabled={!selectedDate}
          className="flex-1 px-4 py-2 rounded-lg text-sm font-medium text-white bg-slate-600 hover:bg-slate-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Set Deadline
        </button>
      </div>

      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-2 right-2 text-slate-400 hover:text-white transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};
