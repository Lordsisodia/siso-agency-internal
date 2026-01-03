import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Clock, Zap, Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { TimeboxTask, TodayStats } from '../../domain/types';

interface TimeboxStatsProps {
  validTasks: TimeboxTask[];
  todayStats: TodayStats;
  yesterdayStats: TodayStats;
  showComparison: boolean;
  setShowComparison: (show: boolean) => void;
}

export const TimeboxStats: React.FC<TimeboxStatsProps> = ({
  validTasks,
  todayStats,
  yesterdayStats,
  showComparison,
  setShowComparison
}) => {
  return (
    <>
      {/* Today's Focus Stats Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mx-2 mb-2"
      >
        <Card className="bg-transparent border-gray-800/30 rounded-2xl">
          <CardContent className="p-3">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center shadow-md">
                <Target className="h-4 w-4 text-white" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-white">Today's Focus</h3>
                <div className="flex items-center space-x-3 text-xs text-gray-300">
                  <span className="flex items-center space-x-1">
                    <Target className="h-3 w-3 text-blue-400" />
                    <span>{validTasks.length} tasks</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Clock className="h-3 w-3 text-purple-400" />
                    <span>{Math.round(validTasks.reduce((acc, task) => acc + task.duration, 0) / 60)}h planned</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Zap className="h-3 w-3 text-orange-400" />
                    <span>{validTasks.filter(task => task.category === 'deep-work').length} deep</span>
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Today vs Yesterday Comparison Card */}
      {yesterdayStats.totalBlocks > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mx-2 mb-2"
        >
          <Card className="bg-transparent border-gray-800/30 rounded-2xl overflow-hidden">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center shadow-md">
                    <Calendar className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white flex items-center">
                      Progress vs Yesterday
                      <button
                        onClick={() => setShowComparison(!showComparison)}
                        className="ml-2 text-gray-400 hover:text-white transition-colors"
                      >
                        {showComparison ? '▼' : '▶'}
                      </button>
                    </h3>
                  </div>
                </div>
              </div>

              <AnimatePresence>
                {showComparison && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-3 grid grid-cols-3 gap-2 text-center overflow-hidden"
                  >
                    {/* Deep Work Comparison */}
                    <div className="bg-blue-900/20 border border-blue-700/30 rounded-lg p-2">
                      <div className="text-[10px] text-gray-400 mb-1">Deep Work</div>
                      <div className="text-sm font-bold text-blue-300">{todayStats.deepWorkHours}h</div>
                      {parseFloat(yesterdayStats.deepWorkHours) > 0 && (
                        <div className={cn(
                          "text-[9px] font-medium mt-1",
                          parseFloat(todayStats.deepWorkHours) > parseFloat(yesterdayStats.deepWorkHours)
                            ? "text-green-400"
                            : parseFloat(todayStats.deepWorkHours) < parseFloat(yesterdayStats.deepWorkHours)
                            ? "text-red-400"
                            : "text-gray-400"
                        )}>
                          {parseFloat(todayStats.deepWorkHours) > parseFloat(yesterdayStats.deepWorkHours) ? '↑' :
                           parseFloat(todayStats.deepWorkHours) < parseFloat(yesterdayStats.deepWorkHours) ? '↓' : '→'}
                          {Math.abs(parseFloat(todayStats.deepWorkHours) - parseFloat(yesterdayStats.deepWorkHours)).toFixed(1)}h
                        </div>
                      )}
                    </div>

                    {/* Light Work Comparison */}
                    <div className="bg-emerald-900/20 border border-emerald-700/30 rounded-lg p-2">
                      <div className="text-[10px] text-gray-400 mb-1">Light Work</div>
                      <div className="text-sm font-bold text-emerald-300">{todayStats.lightWorkHours}h</div>
                      {parseFloat(yesterdayStats.lightWorkHours) > 0 && (
                        <div className={cn(
                          "text-[9px] font-medium mt-1",
                          parseFloat(todayStats.lightWorkHours) > parseFloat(yesterdayStats.lightWorkHours)
                            ? "text-green-400"
                            : parseFloat(todayStats.lightWorkHours) < parseFloat(yesterdayStats.lightWorkHours)
                            ? "text-red-400"
                            : "text-gray-400"
                        )}>
                          {parseFloat(todayStats.lightWorkHours) > parseFloat(yesterdayStats.lightWorkHours) ? '↑' :
                           parseFloat(todayStats.lightWorkHours) < parseFloat(yesterdayStats.lightWorkHours) ? '↓' : '→'}
                          {Math.abs(parseFloat(todayStats.lightWorkHours) - parseFloat(yesterdayStats.lightWorkHours)).toFixed(1)}h
                        </div>
                      )}
                    </div>

                    {/* Completion Rate Comparison */}
                    <div className="bg-purple-900/20 border border-purple-700/30 rounded-lg p-2">
                      <div className="text-[10px] text-gray-400 mb-1">Completed</div>
                      <div className="text-sm font-bold text-purple-300">{todayStats.completionRate}%</div>
                      {yesterdayStats.completionRate > 0 && (
                        <div className={cn(
                          "text-[9px] font-medium mt-1",
                          todayStats.completionRate > yesterdayStats.completionRate
                            ? "text-green-400"
                            : todayStats.completionRate < yesterdayStats.completionRate
                            ? "text-red-400"
                            : "text-gray-400"
                        )}>
                          {todayStats.completionRate > yesterdayStats.completionRate ? '↑' :
                           todayStats.completionRate < yesterdayStats.completionRate ? '↓' : '→'}
                          {Math.abs(todayStats.completionRate - yesterdayStats.completionRate)}%
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </>
  );
};
