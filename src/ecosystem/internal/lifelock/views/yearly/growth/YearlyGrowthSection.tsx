/**
 * Yearly Growth Section
 * 
 * Year-over-year comparison, performance trends, biggest wins, lessons learned
 */

import React from 'react';
import { TrendingUp, TrendingDown, Trophy, Lightbulb, BarChart3 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/ui/card';
import { motion } from 'framer-motion';
import { cn } from '@/shared/lib/utils';
import type { YearOverYearMetric } from '../_shared/types';

interface YearlyGrowthSectionProps {
  yearOverYear: YearOverYearMetric[];
  currentYear: number;
}

export const YearlyGrowthSection: React.FC<YearlyGrowthSectionProps> = ({
  yearOverYear,
  currentYear
}) => {
  const lastYear = currentYear - 1;

  const biggestWins = [
    { title: '🚀 892 hours deep work (+24% vs 2024)', category: 'Productivity' },
    { title: '📚 38 books read (+58% vs 2024)', category: 'Learning' },
    { title: '💪 156 workouts (+10% vs 2024)', category: 'Health' },
    { title: '💰 Revenue increased 12% year-over-year', category: 'Financial' },
  ];

  const lessonsLearned = [
    'Consistency beats intensity - daily habits compound exponentially',
    'Morning routine is the keystone habit that unlocks everything else',
    'Deep work sessions 9-11 AM are 3x more productive than afternoon',
    'Relationships need deliberate scheduling - won\'t happen by accident',
    'Monthly reviews keep me on track better than quarterly alone',
  ];

  return (
    <div className="min-h-screen w-full relative pb-24">
      <div className="w-full max-w-none p-2 sm:p-3 md:p-4 lg:p-6 space-y-6">
        
        {/* Page Header */}
        <section className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-emerald-500/5 rounded-2xl blur-sm" />
          <div className="relative bg-gray-900/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-green-500/20 shadow-lg shadow-green-500/10">
            <CardHeader className="p-0">
              <CardTitle className="text-green-400 flex items-center text-2xl">
                <TrendingUp className="h-6 w-6 mr-2" />
                📈 Growth & Trends
              </CardTitle>
              <p className="text-gray-400 text-sm mt-2">
                Year-over-year progress and insights
              </p>
            </CardHeader>
          </div>
        </section>

        {/* Year-over-Year Comparison */}
        <section className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 rounded-2xl blur-sm" />
          <div className="relative bg-gray-900/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-blue-500/20 shadow-lg shadow-blue-500/10">
            <CardHeader className="p-0 mb-4">
              <CardTitle className="text-blue-400 flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                📊 {currentYear} vs {lastYear}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {yearOverYear.map((metric, idx) => (
                  <motion.div
                    key={metric.metric}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    className={cn(
                      'rounded-lg p-4 border',
                      metric.trend === 'up' && 'bg-green-900/20 border-green-500/30',
                      metric.trend === 'down' && 'bg-red-900/20 border-red-500/30',
                      metric.trend === 'stable' && 'bg-gray-800/50 border-gray-500/30'
                    )}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-sm text-gray-300 font-medium">{metric.metric}</div>
                      <div className={cn(
                        'flex items-center space-x-1',
                        metric.trend === 'up' && 'text-green-400',
                        metric.trend === 'down' && 'text-red-400',
                        metric.trend === 'stable' && 'text-gray-400'
                      )}>
                        {metric.trend === 'up' && <TrendingUp className="h-4 w-4" />}
                        {metric.trend === 'down' && <TrendingDown className="h-4 w-4" />}
                        {metric.trend === 'stable' && <span>→</span>}
                      </div>
                    </div>

                    <div className="space-y-2 mb-3">
                      <div className="flex items-baseline justify-between">
                        <span className="text-xs text-gray-400">{currentYear}:</span>
                        <span className="text-xl font-bold text-white">
                          {metric.currentYear.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-baseline justify-between">
                        <span className="text-xs text-gray-400">{lastYear}:</span>
                        <span className="text-sm text-gray-500">
                          {metric.lastYear.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className={cn(
                      'text-center py-2 rounded-lg font-bold text-sm',
                      metric.trend === 'up' && 'bg-green-500/20 text-green-400',
                      metric.trend === 'down' && 'bg-red-500/20 text-red-400',
                      metric.trend === 'stable' && 'bg-gray-700/50 text-gray-400'
                    )}>
                      {metric.change > 0 && '+'}{metric.change}%
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </div>
        </section>

        {/* Biggest Wins */}
        <section className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 to-orange-500/5 rounded-2xl blur-sm" />
          <div className="relative bg-gray-900/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-yellow-500/20 shadow-lg shadow-yellow-500/10">
            <CardHeader className="p-0 mb-4">
              <CardTitle className="text-yellow-400 flex items-center">
                <Trophy className="h-5 w-5 mr-2" />
                🏆 Biggest Wins of {currentYear}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-3">
                {biggestWins.map((win, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4"
                  >
                    <div className="flex items-start space-x-3">
                      <Trophy className="h-5 w-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="font-semibold text-yellow-300 mb-1">{win.title}</div>
                        <div className="text-xs text-gray-400">{win.category}</div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </div>
        </section>

        {/* Lessons Learned */}
        <section className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 rounded-2xl blur-sm" />
          <div className="relative bg-gray-900/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-indigo-500/20 shadow-lg shadow-indigo-500/10">
            <CardHeader className="p-0 mb-4">
              <CardTitle className="text-indigo-400 flex items-center">
                <Lightbulb className="h-5 w-5 mr-2" />
                💡 Key Lessons Learned
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-3">
                {lessonsLearned.map((lesson, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-indigo-900/20 border border-indigo-500/30 rounded-lg p-4"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-500/30 border-2 border-indigo-500/50 flex items-center justify-center">
                        <span className="text-indigo-300 font-bold text-xs">{idx + 1}</span>
                      </div>
                      <div className="flex-1 text-gray-200">{lesson}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </div>
        </section>

      </div>
    </div>
  );
};
