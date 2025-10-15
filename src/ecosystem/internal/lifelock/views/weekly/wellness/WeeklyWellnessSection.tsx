/**
 * Weekly Wellness Section
 * 
 * Health tracking - workouts, health habits, energy/sleep, nutrition
 */

import React from 'react';
import { Dumbbell, Heart, Moon, Droplets, Utensils, Activity } from 'lucide-react';
// Card components removed - using standard divs instead
import { WeeklyStatsCard } from '../_shared/WeeklyStatsCard';
import { motion } from 'framer-motion';
import { cn } from '@/shared/lib/utils';
import type { WellnessData } from '../_shared/types';

interface WeeklyWellnessSectionProps {
  wellnessData: WellnessData;
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const HABITS = [
  { key: 'morningRoutine', label: 'Morning Routine', emoji: '🌅' },
  { key: 'checkout', label: 'Checkout', emoji: '✅' },
  { key: 'water', label: 'Water', emoji: '💧' },
  { key: 'meditation', label: 'Meditation', emoji: '🧘' },
  { key: 'sleep', label: 'Sleep', emoji: '😴' },
];

export const WeeklyWellnessSection: React.FC<WeeklyWellnessSectionProps> = ({ wellnessData }) => {
  const { workouts, healthHabits, energySleep, nutrition } = wellnessData;

  return (
    <div className="min-h-screen w-full relative pb-24">
      <div className="w-full max-w-none p-2 sm:p-3 md:p-4 lg:p-6 space-y-6">
        
        {/* Page Header */}
        <section className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-pink-500/5 to-rose-500/5 rounded-2xl blur-sm" />
          <div className="relative bg-gray-900/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-pink-500/20 shadow-lg shadow-pink-500/10">
            <div>
              <h3 className="text-pink-400 flex items-center font-semibold text-2xl">
                <Heart className="h-6 w-6 mr-2" />
                ❤️ Wellness Analysis
              </h3>
              <p className="text-gray-400 text-sm mt-2">
                Did I take care of myself this week?
              </p>
            </div>
          </div>
        </section>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <WeeklyStatsCard
            title="Workouts"
            icon={Dumbbell}
            value={workouts.total}
            subtitle={`${workouts.totalMinutes} minutes`}
          />
          <WeeklyStatsCard
            title="Avg Energy"
            icon={Activity}
            value={energySleep.averageEnergy.toFixed(1)}
            subtitle="Out of 10"
          />
          <WeeklyStatsCard
            title="Avg Sleep"
            icon={Moon}
            value={`${energySleep.averageSleep.toFixed(1)}h`}
            subtitle={`Quality: ${energySleep.sleepQuality}/10`}
          />
          <WeeklyStatsCard
            title="Weight"
            icon={Utensils}
            value={`${nutrition.weightChange > 0 ? '+' : ''}${nutrition.weightChange}kg`}
            subtitle={`${nutrition.averageCalories} cal/day`}
            trend={{ 
              direction: nutrition.weightChange < 0 ? 'down' : nutrition.weightChange > 0 ? 'up' : 'stable',
              value: `${Math.abs(nutrition.weightChange)}kg`
            }}
          />
        </div>

        {/* Workout Summary */}
        <section className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-red-500/5 rounded-2xl blur-sm" />
          <div className="relative bg-gray-900/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-orange-500/20 shadow-lg shadow-orange-500/10">
            <div className="mb-4">
              <h3 className="text-orange-400 flex items-center font-semibold text-lg">
                <Dumbbell className="h-5 w-5 mr-2" />
                💪 Workout Summary
              </h3>
            </div>
            <div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <div className="text-sm text-gray-400 mb-1">Total Workouts</div>
                  <div className="text-3xl font-bold text-orange-400">{workouts.total}</div>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <div className="text-sm text-gray-400 mb-1">Total Time</div>
                  <div className="text-3xl font-bold text-orange-400">{workouts.totalMinutes} min</div>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <div className="text-sm text-gray-400 mb-1">Avg Duration</div>
                  <div className="text-3xl font-bold text-orange-400">
                    {Math.round(workouts.totalMinutes / workouts.total)} min
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="text-sm font-semibold text-gray-300 mb-3">Workout Types</div>
                {workouts.types.map((type, idx) => (
                  <motion.div
                    key={type.type}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex items-center justify-between bg-gray-800/30 rounded-lg p-3"
                  >
                    <span className="text-gray-300 font-medium">{type.type}</span>
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-gray-400">{type.count}x</span>
                      <div className="w-24 bg-gray-700/50 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-orange-400 to-red-500 h-2 rounded-full"
                          style={{ width: `${(type.count / workouts.total) * 100}%` }}
                        />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Health Habits Grid */}
        <section className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-emerald-500/5 rounded-2xl blur-sm" />
          <div className="relative bg-gray-900/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-green-500/20 shadow-lg shadow-green-500/10">
            <div className="mb-4">
              <h3 className="text-green-400 flex items-center font-semibold text-lg">
                <Heart className="h-5 w-5 mr-2" />
                ✅ Health Habits Checklist
              </h3>
            </div>
            <div>
              {/* Desktop Grid */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="text-left text-sm font-semibold text-gray-300 pb-3">Habit</th>
                      {DAYS.map(day => (
                        <th key={day} className="text-center text-sm font-semibold text-gray-300 pb-3 px-2">
                          {day}
                        </th>
                      ))}
                      <th className="text-right text-sm font-semibold text-gray-300 pb-3">Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {HABITS.map((habit, habitIdx) => {
                      const completedDays = healthHabits[habit.key as keyof typeof healthHabits].filter(Boolean).length;
                      const rate = Math.round((completedDays / 7) * 100);
                      
                      return (
                        <motion.tr
                          key={habit.key}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: habitIdx * 0.05 }}
                          className="border-t border-gray-700/50"
                        >
                          <td className="py-3 text-sm text-gray-300 font-medium">
                            <span className="mr-2">{habit.emoji}</span>
                            {habit.label}
                          </td>
                          {healthHabits[habit.key as keyof typeof healthHabits].map((completed, dayIdx) => (
                            <td key={dayIdx} className="py-3 text-center px-2">
                              <div className={cn(
                                'w-8 h-8 rounded-lg flex items-center justify-center mx-auto',
                                completed 
                                  ? 'bg-green-500/20 border-2 border-green-500' 
                                  : 'bg-gray-700/30 border-2 border-gray-600/50'
                              )}>
                                {completed ? (
                                  <span className="text-green-400 text-lg">✓</span>
                                ) : (
                                  <span className="text-gray-500 text-lg">−</span>
                                )}
                              </div>
                            </td>
                          ))}
                          <td className="py-3 text-right">
                            <span className={cn(
                              'text-sm font-bold',
                              rate >= 90 ? 'text-green-400' :
                              rate >= 70 ? 'text-blue-400' :
                              rate >= 50 ? 'text-yellow-400' : 'text-red-400'
                            )}>
                              {rate}%
                            </span>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Grid */}
              <div className="lg:hidden space-y-4">
                {HABITS.map((habit, habitIdx) => {
                  const completedDays = healthHabits[habit.key as keyof typeof healthHabits].filter(Boolean).length;
                  const rate = Math.round((completedDays / 7) * 100);
                  
                  return (
                    <motion.div
                      key={habit.key}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: habitIdx * 0.05 }}
                      className="bg-gray-800/30 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <span className="mr-2 text-lg">{habit.emoji}</span>
                          <span className="text-sm font-medium text-gray-300">{habit.label}</span>
                        </div>
                        <span className={cn(
                          'text-sm font-bold',
                          rate >= 90 ? 'text-green-400' :
                          rate >= 70 ? 'text-blue-400' :
                          rate >= 50 ? 'text-yellow-400' : 'text-red-400'
                        )}>
                          {rate}%
                        </span>
                      </div>
                      <div className="grid grid-cols-7 gap-2">
                        {healthHabits[habit.key as keyof typeof healthHabits].map((completed, dayIdx) => (
                          <div key={dayIdx} className="flex flex-col items-center">
                            <div className="text-xs text-gray-400 mb-1">{DAYS[dayIdx]}</div>
                            <div className={cn(
                              'w-8 h-8 rounded-lg flex items-center justify-center',
                              completed 
                                ? 'bg-green-500/20 border-2 border-green-500' 
                                : 'bg-gray-700/30 border-2 border-gray-600/50'
                            )}>
                              {completed ? (
                                <span className="text-green-400">✓</span>
                              ) : (
                                <span className="text-gray-500">−</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Energy & Sleep Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <section className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 to-orange-500/5 rounded-2xl blur-sm" />
            <div className="relative bg-gray-900/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-yellow-500/20 shadow-lg shadow-yellow-500/10">
              <div className="mb-4">
                <h3 className="text-yellow-400 flex items-center font-semibold text-lg">
                  <Activity className="h-5 w-5 mr-2" />
                  ⚡ Energy Levels
                </h3>
              </div>
              <div>
                <div className="text-5xl font-bold text-yellow-400 mb-2">
                  {energySleep.averageEnergy.toFixed(1)}/10
                </div>
                <div className="text-sm text-gray-400">Average energy level</div>
                <div className="mt-4 w-full bg-gray-700/50 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-yellow-400 to-orange-500 h-3 rounded-full"
                    style={{ width: `${(energySleep.averageEnergy / 10) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 rounded-2xl blur-sm" />
            <div className="relative bg-gray-900/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-indigo-500/20 shadow-lg shadow-indigo-500/10">
              <div className="mb-4">
                <h3 className="text-indigo-400 flex items-center font-semibold text-lg">
                  <Moon className="h-5 w-5 mr-2" />
                  😴 Sleep Quality
                </h3>
              </div>
              <div>
                <div className="text-5xl font-bold text-indigo-400 mb-2">
                  {energySleep.sleepQuality}/10
                </div>
                <div className="text-sm text-gray-400">
                  {energySleep.averageSleep.toFixed(1)}h average per night
                </div>
                <div className="mt-4 w-full bg-gray-700/50 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-indigo-400 to-purple-500 h-3 rounded-full"
                    style={{ width: `${(energySleep.sleepQuality / 10) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </section>
        </div>

      </div>
    </div>
  );
};
