import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar,
  Clock,
  BarChart3,
  TrendingUp,
  Target,
  Play,
  Pause,
  CheckCircle2,
  RotateCcw,
  Zap
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { StatisticalWeekView } from '../ui/StatisticalWeekView';
import { TabProps } from '../DayTabContainer';
import FunctionalTimeBox from '@/components/timebox/FunctionalTimeBox';
import { TimeBoxAIAssistant } from '@/shared/components/TimeBoxAIAssistant';
import { timeboxApi, DaySchedule, TimeBoxTask, TimeBoxStats } from '@/api/timeboxApi';
import { format } from 'date-fns';

export const TimeBoxTab: React.FC<TabProps> = ({
  user,
  todayCard,
  weekCards,
  refreshTrigger,
  onNavigateWeek,
  onCardClick
}) => {
  const [timeBoxRefreshTrigger, setTimeBoxRefreshTrigger] = useState(0);
  const weekStart = weekCards[0]?.date || new Date();
  const weekEnd = weekCards[6]?.date || new Date();
  
  // Calculate week stats
  const totalTasks = weekCards.reduce((acc, card) => acc + card.tasks.length, 0);
  const completedTasks = weekCards.reduce((acc, card) => 
    acc + card.tasks.filter((task: any) => task.completed).length, 0
  );
  const weekCompletion = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  return (
    <div className="p-4 space-y-6 bg-gradient-to-br from-black via-gray-900 to-black min-h-full">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <div className="flex items-center justify-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
            <Calendar className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Time Box</h1>
            <p className="text-gray-400 text-sm">Schedule & calendar overview</p>
          </div>
        </div>
        
        {/* Week Stats */}
        <div className="flex items-center justify-center space-x-6 text-sm text-gray-300">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-purple-400" />
            <span>{format(new Date(), 'EEEE, MMM d')}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Target className="h-4 w-4 text-green-400" />
            <span>{Math.round(weekCompletion)}% week complete</span>
          </div>
        </div>
      </motion.div>

      {/* Week Overview Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-3 gap-3"
      >
        <Card className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 border-purple-400/30">
          <CardContent className="p-4 text-center">
            <div className="text-xl font-bold text-purple-300">{totalTasks}</div>
            <div className="text-xs text-purple-400">Week Tasks</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-900/40 to-emerald-900/40 border-green-400/30">
          <CardContent className="p-4 text-center">
            <div className="text-xl font-bold text-green-300">{completedTasks}</div>
            <div className="text-xs text-green-400">Week Complete</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-blue-900/40 to-cyan-900/40 border-blue-400/30">
          <CardContent className="p-4 text-center">
            <div className="text-xl font-bold text-blue-300">{Math.round(weekCompletion)}%</div>
            <div className="text-xs text-blue-400">Week Progress</div>
          </CardContent>
        </Card>
      </motion.div>

      {/* This Week View */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="bg-gradient-to-br from-gray-900/80 via-gray-800/60 to-gray-900/80 border-purple-400/30 shadow-xl">
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-purple-400" />
              <h3 className="text-lg font-semibold text-white">This Week</h3>
              <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/40">
                {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d')}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <StatisticalWeekView
              weekCards={weekCards}
              weekStart={weekStart}
              weekEnd={weekEnd}
              onNavigateWeek={onNavigateWeek}
              onCardClick={onCardClick}
            />
          </CardContent>
        </Card>
      </motion.div>

      {/* Professional Functional TimeBox */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="col-span-full"
      >
        <FunctionalTimeBox />
      </motion.div>


      {/* Monthly Progress Dots */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="bg-gradient-to-br from-gray-900/80 via-gray-800/60 to-gray-900/80 border-orange-400/30 shadow-xl">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-orange-400" />
                <h3 className="text-lg font-semibold text-white">Monthly Progress</h3>
              </div>
              <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/40">
                {format(new Date(), 'MMMM yyyy')}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {/* Monthly Progress Dots */}
            <div className="grid grid-cols-7 gap-2 mb-4">
              {Array.from({ length: 31 }, (_, i) => {
                const day = i + 1;
                const dayDate = new Date(new Date().getFullYear(), new Date().getMonth(), day);
                const isToday = day === new Date().getDate();
                const isPast = dayDate < new Date() && !isToday;
                const isCurrentMonth = dayDate.getMonth() === new Date().getMonth();
                
                if (!isCurrentMonth) return null;
                
                const completionRate = isPast ? Math.random() * 100 : isToday ? 50 : 0;
                
                return (
                  <div key={day} className="flex flex-col items-center space-y-1">
                    <div className="text-xs text-gray-400 font-medium">{day}</div>
                    <button
                      className={`w-4 h-4 rounded-full border transition-all duration-200 hover:scale-110 ${
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
                      onClick={() => {
                        const targetDate = new Date(new Date().getFullYear(), new Date().getMonth(), day);
                        onCardClick?.({ 
                          id: `day-${day}`, 
                          date: targetDate, 
                          title: `${format(targetDate, 'MMM d, yyyy')}`, 
                          completed: completionRate >= 80, 
                          tasks: [] 
                        });
                      }}
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
          </CardContent>
        </Card>
      </motion.div>

      {/* Time Management Tips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="bg-gradient-to-r from-indigo-900/50 to-purple-900/50 border-indigo-500/50 shadow-xl">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-indigo-500/30 rounded-full flex items-center justify-center flex-shrink-0">
                <Clock className="h-4 w-4 text-indigo-400" />
              </div>
              <div>
                <h4 className="font-semibold text-indigo-300 mb-2">Time Boxing Tips</h4>
                <ul className="text-xs text-indigo-400/80 space-y-1">
                  <li>• Schedule deep work during your peak energy hours</li>
                  <li>• Block similar tasks together to reduce context switching</li>
                  <li>• Leave buffer time between meetings for transitions</li>
                  <li>• Review and adjust your schedule weekly</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* TimeBox AI Assistant */}
      <TimeBoxAIAssistant
        context="timebox"
        onTaskScheduled={(taskId) => {
          console.log('✅ Task scheduled via AI:', taskId);
          setTimeBoxRefreshTrigger(prev => prev + 1);
        }}
        onScheduleChanged={() => {
          console.log('📅 Schedule updated via AI');
          setTimeBoxRefreshTrigger(prev => prev + 1);
        }}
      />
    </div>
  );
};