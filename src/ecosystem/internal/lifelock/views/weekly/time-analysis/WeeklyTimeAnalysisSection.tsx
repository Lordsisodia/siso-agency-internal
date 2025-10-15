/**
 * Weekly Time Analysis Section
 * 
 * Time audit - sleep, work hours, wake time, utilization
 */

import React from 'react';
import { format } from 'date-fns';
import { Clock, Moon, Sun, PieChart, Brain, CheckSquare } from 'lucide-react';
// Card components removed - using standard divs instead
import { WeeklyStatsCard } from '../_shared/WeeklyStatsCard';
import { motion } from 'framer-motion';
import { cn } from '@/shared/lib/utils';
import type { TimeAnalysisData } from '../_shared/types';

interface WeeklyTimeAnalysisSectionProps {
  timeData: TimeAnalysisData;
}

export const WeeklyTimeAnalysisSection: React.FC<WeeklyTimeAnalysisSectionProps> = ({ timeData }) => {
  const { sleep, work, wakeTime, utilization } = timeData;

  return (
    <div className="min-h-screen w-full relative pb-24">
      <div className="w-full max-w-none p-2 sm:p-3 md:p-4 lg:p-6 space-y-6">
        
        {/* Page Header */}
        <section className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-blue-500/5 rounded-2xl blur-sm" />
          <div className="relative bg-gray-900/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-cyan-500/20 shadow-lg shadow-cyan-500/10">
            <div>
              <h3 className="text-cyan-400 flex items-center font-semibold text-2xl">
                <Clock className="h-6 w-6 mr-2" />
                ⏰ Time Analysis
              </h3>
              <p className="text-gray-400 text-sm mt-2">
                Where did my time actually go this week?
              </p>
            </div>
          </div>
        </section>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <WeeklyStatsCard
            title="Avg Sleep"
            icon={Moon}
            value={`${sleep.averageHours.toFixed(1)}h`}
            subtitle={`Quality: ${sleep.quality}/10`}
          />
          <WeeklyStatsCard
            title="Work Hours"
            icon={Brain}
            value={`${work.totalHours}h`}
            subtitle={`${work.deepWorkHours}h deep + ${work.lightWorkHours}h light`}
          />
          <WeeklyStatsCard
            title="Wake Time"
            icon={Sun}
            value={wakeTime.averageTime}
            subtitle={`${wakeTime.onTimeRate}% on-time`}
          />
          <WeeklyStatsCard
            title="Utilization"
            icon={PieChart}
            value={`${utilization.productivePercentage}%`}
            subtitle={`${utilization.trackedHours}h tracked`}
          />
        </div>

        {/* Sleep Analysis */}
        <section className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 rounded-2xl blur-sm" />
          <div className="relative bg-gray-900/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-indigo-500/20 shadow-lg shadow-indigo-500/10">
            <div className="mb-4">
              <h3 className="text-indigo-400 flex items-center font-semibold text-lg">
                <Moon className="h-5 w-5 mr-2" />
                😴 Sleep Analysis
              </h3>
            </div>
            <div>
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Average Sleep Duration</span>
                  <span className="text-2xl font-bold text-indigo-400">
                    {sleep.averageHours.toFixed(1)} hours
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Sleep Quality Score</span>
                  <span className="text-2xl font-bold text-indigo-400">
                    {sleep.quality}/10
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                {sleep.dailyHours.map((day, idx) => (
                  <motion.div
                    key={day.date.toISOString()}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3 flex-1">
                      <div className="text-sm font-medium text-gray-300 w-20">
                        {format(day.date, 'EEE, MMM d')}
                      </div>
                      <div className="flex-1 bg-gray-700/50 rounded-full h-2">
                        <div 
                          className={cn(
                            'h-2 rounded-full transition-all duration-500',
                            day.hours >= 7 ? 'bg-gradient-to-r from-green-400 to-emerald-500' :
                            day.hours >= 6 ? 'bg-gradient-to-r from-yellow-400 to-orange-500' :
                            'bg-gradient-to-r from-red-400 to-rose-500'
                          )}
                          style={{ width: `${(day.hours / 10) * 100}%` }}
                        />
                      </div>
                    </div>
                    <div className={cn(
                      'text-sm font-bold ml-4 w-16 text-right',
                      day.hours >= 7 ? 'text-green-400' :
                      day.hours >= 6 ? 'text-yellow-400' : 'text-red-400'
                    )}>
                      {day.hours.toFixed(1)}h
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Work Hours Breakdown */}
        <section className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-cyan-500/5 rounded-2xl blur-sm" />
          <div className="relative bg-gray-900/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-blue-500/20 shadow-lg shadow-blue-500/10">
            <div className="mb-4">
              <h3 className="text-blue-400 flex items-center font-semibold text-lg">
                <Brain className="h-5 w-5 mr-2" />
                💼 Work Hours Breakdown
              </h3>
            </div>
            <div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <div className="text-sm text-gray-400 mb-1">Deep Work</div>
                  <div className="text-3xl font-bold text-blue-400">{work.deepWorkHours}h</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {Math.round((work.deepWorkHours / work.totalHours) * 100)}% of total
                  </div>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <div className="text-sm text-gray-400 mb-1">Light Work</div>
                  <div className="text-3xl font-bold text-cyan-400">{work.lightWorkHours}h</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {Math.round((work.lightWorkHours / work.totalHours) * 100)}% of total
                  </div>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <div className="text-sm text-gray-400 mb-1">Total Work</div>
                  <div className="text-3xl font-bold text-white">{work.totalHours}h</div>
                  <div className="text-xs text-gray-500 mt-1">This week</div>
                </div>
              </div>

              {/* Visual Breakdown */}
              <div className="flex rounded-full overflow-hidden h-6">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-xs font-bold text-white"
                  style={{ width: `${(work.deepWorkHours / work.totalHours) * 100}%` }}
                >
                  Deep
                </div>
                <div 
                  className="bg-gradient-to-r from-cyan-500 to-cyan-600 flex items-center justify-center text-xs font-bold text-white"
                  style={{ width: `${(work.lightWorkHours / work.totalHours) * 100}%` }}
                >
                  Light
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Wake Time Analysis */}
        <section className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 to-orange-500/5 rounded-2xl blur-sm" />
          <div className="relative bg-gray-900/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-yellow-500/20 shadow-lg shadow-yellow-500/10">
            <div className="mb-4">
              <h3 className="text-yellow-400 flex items-center font-semibold text-lg">
                <Sun className="h-5 w-5 mr-2" />
                🌅 Wake Time Analysis
              </h3>
            </div>
            <div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <div className="text-sm text-gray-400 mb-1">Average Wake Time</div>
                  <div className="text-3xl font-bold text-yellow-400">{wakeTime.averageTime}</div>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <div className="text-sm text-gray-400 mb-1">On-Time Rate</div>
                  <div className="text-3xl font-bold text-green-400">{wakeTime.onTimeRate}%</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {Math.round((wakeTime.onTimeRate / 100) * 7)}/7 days on time
                  </div>
                </div>
              </div>

              {wakeTime.justifications.length > 0 && (
                <div className="mt-4 space-y-2">
                  <div className="text-sm font-semibold text-gray-300">Late Wake-Ups</div>
                  {wakeTime.justifications.map((justification, idx) => (
                    <div key={idx} className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-3 text-sm text-gray-300">
                      {justification}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Time Utilization */}
        <section className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5 rounded-2xl blur-sm" />
          <div className="relative bg-gray-900/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-purple-500/20 shadow-lg shadow-purple-500/10">
            <div className="mb-4">
              <h3 className="text-purple-400 flex items-center font-semibold text-lg">
                <PieChart className="h-5 w-5 mr-2" />
                📊 Time Utilization
              </h3>
            </div>
            <div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <div className="text-sm text-gray-400 mb-1">Tracked Hours</div>
                  <div className="text-3xl font-bold text-purple-400">{utilization.trackedHours}h</div>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <div className="text-sm text-gray-400 mb-1">Untracked Hours</div>
                  <div className="text-3xl font-bold text-gray-400">{utilization.untrackedHours}h</div>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <div className="text-sm text-gray-400 mb-1">Productive %</div>
                  <div className="text-3xl font-bold text-green-400">{utilization.productivePercentage}%</div>
                </div>
              </div>

              {/* Visual Breakdown */}
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-400">Productive Time</span>
                    <span className="text-sm font-bold text-purple-400">{utilization.trackedHours}h</span>
                  </div>
                  <div className="w-full bg-gray-700/50 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-purple-400 to-pink-500 h-3 rounded-full"
                      style={{ width: `${utilization.productivePercentage}%` }}
                    />
                  </div>
                </div>

                <div className="bg-gray-800/30 rounded-lg p-4">
                  <div className="text-sm text-gray-400 mb-2">Total Waking Hours (Avg 16h/day)</div>
                  <div className="text-2xl font-bold text-white mb-2">112h</div>
                  <div className="text-xs text-gray-500">
                    {utilization.trackedHours}h tracked ({Math.round((utilization.trackedHours / 112) * 100)}%) + 
                    {' '}{utilization.untrackedHours}h untracked ({Math.round((utilization.untrackedHours / 112) * 100)}%)
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};
