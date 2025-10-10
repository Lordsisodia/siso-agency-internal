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
  theme?: 'DEEP' | 'LIGHT'; // Optional theme for color theming
}

export const CustomCalendar: React.FC<CustomCalendarProps> = ({ 
  subtask, 
  onDateSelect, 
  onClose,
  theme = 'DEEP' // Default to DEEP theme
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
  
  // Debug logging
  console.log('🎨 CustomCalendar received theme:', theme);
  console.log('🎨 Is Light Theme:', theme === 'LIGHT');
  
  const isLightTheme = theme === 'LIGHT';
  
  return (
    <div className={`${isLightTheme ? 'bg-[#1e3a2e] border-emerald-700/50' : 'bg-[#1a2942] border-blue-700/50'} rounded-2xl p-4 w-[280px] shadow-2xl border backdrop-blur-sm`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button 
          onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))}
          className="text-slate-400 hover:text-white hover:bg-slate-700/50 p-2 rounded-lg text-xl font-bold transition-all duration-200"
        >
          ‹
        </button>
        <div className="text-white font-semibold text-base">
          {monthNames[viewDate.getMonth()]} {viewDate.getFullYear()}
        </div>
        <button 
          onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))}
          className="text-slate-400 hover:text-white hover:bg-slate-700/50 p-2 rounded-lg text-xl font-bold transition-all duration-200"
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
      <div className="grid grid-cols-7 gap-1.5">
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
              w-9 h-9 text-sm rounded-xl flex items-center justify-center transition-all duration-200
              ${!isCurrentMonth(date) ? 'text-slate-600' : 'text-slate-200 font-medium'}
              ${isToday(date) && !isSelected(date) ? (isLightTheme 
                ? 'ring-2 ring-emerald-400 ring-offset-2 ring-offset-[#1e3a2e] text-white font-semibold' 
                : 'ring-2 ring-blue-400 ring-offset-2 ring-offset-[#1a2942] text-white font-semibold') : ''}
              ${isSelected(date) ? (isLightTheme 
                ? 'bg-emerald-500 text-white font-semibold shadow-lg shadow-emerald-500/50 scale-105' 
                : 'bg-blue-500 text-white font-semibold shadow-lg shadow-blue-500/50 scale-105') : ''}
              ${!isPastDate(date) && !isSelected(date) ? (isLightTheme 
                ? 'hover:bg-emerald-700/60 hover:scale-105 active:scale-95' 
                : 'hover:bg-blue-700/40 hover:scale-105 active:scale-95') : ''}
              ${isPastDate(date) ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            {date.getDate()}
          </button>
        ))}
      </div>
      
      {/* Actions */}
      <div className="flex gap-2 mt-4 pt-3 border-t border-slate-700/50">
        <button
          onClick={() => onDateSelect(null)}
          className="flex-1 px-3 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-700/30 rounded-lg transition-all duration-200"
        >
          Clear Date
        </button>
        <button
          onClick={onClose}
          className="flex-1 px-3 py-2 text-sm border border-slate-600 hover:border-slate-500 hover:bg-slate-700/30 text-white rounded-lg transition-all duration-200"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};