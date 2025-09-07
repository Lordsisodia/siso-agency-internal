import React from 'react';
import { format } from 'date-fns';

interface MonthlyProgressSectionProps {
  selectedMonth: Date;
  selectedYear: number;
}

export const MonthlyProgressSection: React.FC<MonthlyProgressSectionProps> = ({
  selectedMonth,
  selectedYear
}) => {
  return (
    <section className="relative">
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-blue-500/5 rounded-2xl blur-sm"></div>
      <div className="relative bg-gray-900/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-purple-500/20 shadow-lg shadow-purple-500/10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">
              Monthly Progress
            </h2>
            <p className="text-purple-200/80 text-sm font-medium">
              {format(selectedMonth, 'MMMM yyyy')} • Day {format(new Date(), 'd')} of {format(new Date(), 'dd')}
            </p>
          </div>
        </div>
        
        {/* Monthly Progress Dots */}
        <div className="grid grid-cols-7 sm:grid-cols-10 lg:grid-cols-15 gap-2 mb-4">
          {Array.from({ length: 31 }, (_, i) => {
            const day = i + 1;
            const dayDate = new Date(selectedYear, selectedMonth.getMonth(), day);
            const isToday = day === new Date().getDate() && selectedMonth.getMonth() === new Date().getMonth();
            const isPast = dayDate < new Date() && !isToday;
            const isCurrentMonth = dayDate.getMonth() === selectedMonth.getMonth();
            
            if (!isCurrentMonth) return null;
            
            const completionRate = isPast ? Math.random() * 100 : isToday ? 50 : 0;
            
            return (
              <div key={day} className="flex flex-col items-center space-y-1">
                <div className="text-xs text-gray-400 font-medium">{day}</div>
                <div 
                  className={`w-3 h-3 rounded-full border transition-all duration-200 ${
                    isToday 
                      ? 'border-orange-400 bg-orange-400/50 shadow-md shadow-orange-500/30' 
                      : completionRate >= 80 
                        ? 'border-emerald-400 bg-emerald-400/80' 
                        : completionRate >= 50 
                          ? 'border-amber-400 bg-amber-400/80' 
                          : completionRate > 0 
                            ? 'border-orange-400 bg-orange-400/60' 
                            : 'border-gray-600 bg-gray-800/60'
                  }`}
                />
              </div>
            );
          })}
        </div>
        
        {/* Legend */}
        <div className="flex items-center justify-center space-x-6 text-xs text-gray-400">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
            <span>Excellent</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-amber-400"></div>
            <span>Good</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-orange-400"></div>
            <span>Started</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-orange-400/50 border border-orange-400"></div>
            <span>Today</span>
          </div>
        </div>
      </div>
    </section>
  );
};