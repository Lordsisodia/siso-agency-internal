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
  subtask?: any;
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
    const currentDate = subtask?.dueDate ? new Date(subtask.dueDate) : now;
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
    return subtask?.dueDate && date.toDateString() === new Date(subtask.dueDate).toDateString();
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
    <div className="bg-gray-800 border border-gray-600 rounded-lg shadow-2xl p-4 w-72">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button 
          onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))}
          className="text-gray-400 hover:text-white p-2 rounded-md hover:bg-gray-700 transition-colors"
        >
          <span className="text-lg font-bold">‹</span>
        </button>
        <div className="text-white font-semibold text-base">
          {monthNames[viewDate.getMonth()]} {viewDate.getFullYear()}
        </div>
        <button 
          onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))}
          className="text-gray-400 hover:text-white p-2 rounded-md hover:bg-gray-700 transition-colors"
        >
          <span className="text-lg font-bold">›</span>
        </button>
      </div>
      
      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 mb-3">
        {dayNames.map(day => (
          <div key={day} className="text-center text-xs text-gray-400 py-2 font-medium">
            {day}
          </div>
        ))}
      </div>
      
      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1 mb-4">
        {days.map(date => (
          <button
            key={date.toISOString()}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              
              try {
                // Call onDateSelect with proper error handling
                onDateSelect(date);
              } catch (error) {
                console.error('Error selecting date:', error);
              }
            }}
            disabled={isPastDate(date)}
            className={`
              w-9 h-9 text-sm rounded-lg flex items-center justify-center transition-all duration-200
              ${!isCurrentMonth(date) ? 'text-gray-600' : 'text-gray-300'}
              ${isToday(date) ? 'bg-blue-500 text-white font-semibold shadow-md' : ''}
              ${isSelected(date) ? 'bg-blue-600 text-white font-medium' : ''}
              ${!isPastDate(date) && !isToday(date) && !isSelected(date) ? 'hover:bg-gray-700 hover:text-white' : ''}
              ${isPastDate(date) ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            {date.getDate()}
          </button>
        ))}
      </div>
      
      {/* Actions */}
      <div className="flex gap-3 mt-4">
        <button
          onClick={() => onDateSelect(null)}
          className="flex-1 px-4 py-2 text-sm bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors font-medium"
        >
          Clear Date
        </button>
        <button
          onClick={onClose}
          className="flex-1 px-4 py-2 text-sm bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors font-medium"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};