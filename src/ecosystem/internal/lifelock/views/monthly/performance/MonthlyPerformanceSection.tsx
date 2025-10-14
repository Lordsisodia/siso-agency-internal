/**
 * Monthly Performance Section
 * 
 * Month-over-month comparison, trends, best/worst weeks
 */

import React from 'react';
import { TrendingUp, TrendingDown, BarChart3, AlertTriangle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/ui/card';
import { motion } from 'framer-motion';
import { cn } from '@/shared/lib/utils';
import type { MonthOverMonthMetric } from '../_shared/types';

interface MonthlyPerformanceSectionProps {
  monthOverMonth: MonthOverMonthMetric[];
}

export const MonthlyPerformanceSection: React.FC<MonthlyPerformanceSectionProps> = ({
  monthOverMonth
}) => {
  return (
    <div className="min-h-screen w-full relative pb-24">
      <div className="w-full max-w-none p-2 sm:p-3 md:p-4 lg:p-6 space-y-6">
        
        {/* Page Header */}
        <section className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-cyan-500/5 rounded-2xl blur-sm" />
          <div className="relative bg-gray-900/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-blue-500/20 shadow-lg shadow-blue-500/10">
            <CardHeader className="p-0">
              <CardTitle className="text-blue-400 flex items-center text-2xl">
                <BarChart3 className="h-6 w-6 mr-2" />
                📊 Performance & Trends
              </CardTitle>
              <p className="text-gray-400 text-sm mt-2">
                Month-over-month comparison and insights
              </p>
            </CardHeader>
          </div>
        </section>

        {/* Month-over-Month Comparison */}
        <section className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5 rounded-2xl blur-sm" />
          <div className="relative bg-gray-900/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-purple-500/20 shadow-lg shadow-purple-500/10">
            <CardHeader className="p-0 mb-4">
              <CardTitle className="text-purple-400 flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                📈 Month-over-Month Comparison
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {monthOverMonth.map((metric, idx) => (
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
                    <div className="flex items-center justify-between mb-2">
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

                    <div className="space-y-1 mb-3">
                      <div className="flex items-baseline justify-between">
                        <span className="text-xs text-gray-400">This Month:</span>
                        <span className="text-lg font-bold text-white">
                          {metric.currentMonth.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-baseline justify-between">
                        <span className="text-xs text-gray-400">Last Month:</span>
                        <span className="text-sm text-gray-500">
                          {metric.lastMonth.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className={cn(
                      'text-center py-2 rounded-lg font-bold',
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

        {/* Performance Insights */}
        <section className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-emerald-500/5 rounded-2xl blur-sm" />
          <div className="relative bg-gray-900/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-green-500/20 shadow-lg shadow-green-500/10">
            <CardHeader className="p-0 mb-4">
              <CardTitle className="text-green-400 flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                ✅ What's Improving
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-3">
                {monthOverMonth.filter(m => m.trend === 'up').map((metric, idx) => (
                  <motion.div
                    key={metric.metric}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-green-900/20 border border-green-500/30 rounded-lg p-4"
                  >
                    <div className="flex items-start space-x-3">
                      <TrendingUp className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="font-semibold text-green-300 mb-1">
                          {metric.metric}
                        </div>
                        <div className="text-sm text-gray-200">
                          Up {metric.change}% from last month ({metric.lastMonth} → {metric.currentMonth})
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </div>
        </section>

        {/* Areas for Improvement */}
        <section className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-rose-500/5 rounded-2xl blur-sm" />
          <div className="relative bg-gray-900/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-red-500/20 shadow-lg shadow-red-500/10">
            <CardHeader className="p-0 mb-4">
              <CardTitle className="text-red-400 flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2" />
                ⚠️ Areas for Improvement
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {monthOverMonth.filter(m => m.trend === 'down').length > 0 ? (
                <div className="space-y-3">
                  {monthOverMonth.filter(m => m.trend === 'down').map((metric, idx) => (
                    <motion.div
                      key={metric.metric}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="bg-red-900/20 border border-red-500/30 rounded-lg p-4"
                    >
                      <div className="flex items-start space-x-3">
                        <TrendingDown className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <div className="font-semibold text-red-300 mb-1">
                            {metric.metric}
                          </div>
                          <div className="text-sm text-gray-200">
                            Down {Math.abs(metric.change)}% from last month ({metric.lastMonth} → {metric.currentMonth})
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  🎉 No declining metrics! Keep up the great work!
                </div>
              )}
            </CardContent>
          </div>
        </section>

      </div>
    </div>
  );
};
