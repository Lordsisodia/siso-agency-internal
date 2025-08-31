/**
 * 📅 CustomCalendar Component
 * 
 * Extracted from UnifiedWorkSection.tsx (Phase 4A Refactoring)
 * Reusable calendar component for date selection
 * 
 * Benefits:
 * - Reusable across the application
 * - Focused component with single responsibility
 * - Easy to test and maintain
 * - Clean separation of calendar logic
 */

import React, { useState } from 'react';

export interface CustomCalendarProps {
  subtask: any;
  onDateSelect: (date: Date | null) => void;
  onClose: () => void;
}

export const CustomCalendar: React.FC<CustomCalendarProps> = ({ 
  subtask, 
  onDateSelect, 
  onClose 
}) => {
  const [viewDate, setViewDate] = useState(() => {
    const now = new Date();
    const currentDate = subtask.dueDate ? new Date(subtask.dueDate) : now;
    return new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  });

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  
  const dayNames = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
  
  const now = new Date();
  const firstDayOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
  const startDate = new Date(firstDayOfMonth);
  const dayOfWeek = (firstDayOfMonth.getDay() + 6) % 7; // Convert Sunday=0 to Monday=0
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
    return subtask.dueDate && date.toDateString() === new Date(subtask.dueDate).toDateString();
  };
  
  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === viewDate.getMonth();
  };
  
  const isPastDate = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    return checkDate < today;
  };
  
  return (
    <div className="bg-gray-800 rounded-lg p-3 w-64">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <button 
          onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))}
          className="text-gray-400 hover:text-white p-1 text-lg font-bold"
        >
          ‹
        </button>
        <div className="text-white font-medium text-sm">
          {monthNames[viewDate.getMonth()]} {viewDate.getFullYear()}
        </div>
        <button 
          onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))}
          className="text-gray-400 hover:text-white p-1 text-lg font-bold"
        >
          ›
        </button>
      </div>
      
      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map(day => (
          <div key={day} className="text-center text-xs text-gray-400 py-1">
            {day}
          </div>
        ))}
      </div>
      
      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map(date => (
          <button
            key={date.toISOString()}
            onClick={() => onDateSelect(date)}
            disabled={isPastDate(date)}
            className={`
              w-8 h-8 text-xs rounded-full flex items-center justify-center transition-colors
              ${!isCurrentMonth(date) ? 'text-gray-600' : 'text-gray-300'}
              ${isToday(date) ? 'bg-white text-black font-medium' : ''}
              ${isSelected(date) ? 'bg-gray-600 text-white' : ''}
              ${!isPastDate(date) ? 'hover:bg-gray-700' : 'opacity-50 cursor-not-allowed'}
            `}
          >
            {date.getDate()}
          </button>
        ))}
      </div>
      
      {/* Actions */}
      <div className="flex gap-2 mt-3">
        <button
          onClick={() => onDateSelect(null)}
          className="flex-1 px-3 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-white rounded"
        >
          Clear Date
        </button>
        <button
          onClick={onClose}
          className="flex-1 px-3 py-1 text-xs bg-gray-600 hover:bg-gray-500 text-white rounded"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};