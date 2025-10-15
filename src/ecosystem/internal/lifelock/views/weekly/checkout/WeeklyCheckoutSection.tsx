/**
 * Weekly Checkout Section
 * 
 * Insights & Checkout - Weekly wins, problems, trends, reflection
 */

import React, { useState } from 'react';
import { Trophy, AlertTriangle, TrendingUp, TrendingDown, CheckCircle, Lightbulb } from 'lucide-react';
import { Textarea } from '@/shared/ui/textarea';
import { Button } from '@/shared/ui/button';
import { motion } from 'framer-motion';
import { cn } from '@/shared/lib/utils';
import type { InsightsData } from '../_shared/types';

interface WeeklyCheckoutSectionProps {
  insightsData: InsightsData;
}

export const WeeklyCheckoutSection: React.FC<WeeklyCheckoutSectionProps> = ({ insightsData }) => {
  const { wins, problems, trends, checkout } = insightsData;
  
  const [reflection, setReflection] = useState(checkout.reflection);
  const [nextWeekFocus, setNextWeekFocus] = useState(checkout.nextWeekFocus);

  return (
    <div className="min-h-screen w-full relative pb-24">
      <div className="w-full max-w-none p-2 sm:p-3 md:p-4 lg:p-6 space-y-6">
        
        {/* Page Header */}
        <section className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-teal-500/5 rounded-2xl blur-sm" />
          <div className="relative bg-gray-900/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-emerald-500/20 shadow-lg shadow-emerald-500/10">
            <div className="mb-4">
              <h2 className="text-emerald-400 flex items-center text-2xl font-semibold">
                <Lightbulb className="h-6 w-6 mr-2" />
                💡 Insights & Review
              </h2>
              <p className="text-gray-400 text-sm mt-2">
                What worked? What didn't? What's next?
              </p>
            </div>
          </div>
        </section>

        {/* Weekly Wins */}
        <section className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-emerald-500/5 rounded-2xl blur-sm" />
          <div className="relative bg-gray-900/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-green-500/20 shadow-lg shadow-green-500/10">
            <div className="mb-4">
              <h3 className="text-green-400 flex items-center font-semibold text-lg">
                <Trophy className="h-5 w-5 mr-2" />
                🏆 Weekly Wins
              </h3>
            </div>
            <div>
              <div className="space-y-3">
                {wins.map((win, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-green-900/20 border border-green-500/30 rounded-lg p-4"
                  >
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 text-gray-200">{win}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Problems & Red Flags */}
        <section className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-rose-500/5 rounded-2xl blur-sm" />
          <div className="relative bg-gray-900/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-red-500/20 shadow-lg shadow-red-500/10">
            <div className="mb-4">
              <h3 className="text-red-400 flex items-center font-semibold text-lg">
                <AlertTriangle className="h-5 w-5 mr-2" />
                ⚠️ Problems & Areas to Improve
              </h3>
            </div>
            <div>
              <div className="space-y-3">
                {problems.map((problem, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-red-900/20 border border-red-500/30 rounded-lg p-4"
                  >
                    <div className="flex items-start space-x-3">
                      <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 text-gray-200">{problem}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Week-over-Week Trends */}
        <section className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 rounded-2xl blur-sm" />
          <div className="relative bg-gray-900/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-blue-500/20 shadow-lg shadow-blue-500/10">
            <div className="mb-4">
              <h3 className="text-blue-400 flex items-center font-semibold text-lg">
                <TrendingUp className="h-5 w-5 mr-2" />
                📈 Week-over-Week Trends
              </h3>
            </div>
            <div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {trends.map((trend, idx) => (
                  <motion.div
                    key={trend.metric}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    className={cn(
                      'bg-gray-800/50 rounded-lg p-4 border',
                      trend.direction === 'up' ? 'border-green-500/30' :
                      trend.direction === 'down' ? 'border-red-500/30' :
                      'border-gray-500/30'
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-400">{trend.metric}</span>
                      <div className={cn(
                        'flex items-center space-x-1',
                        trend.direction === 'up' ? 'text-green-400' :
                        trend.direction === 'down' ? 'text-red-400' :
                        'text-gray-400'
                      )}>
                        {trend.direction === 'up' && <TrendingUp className="h-4 w-4" />}
                        {trend.direction === 'down' && <TrendingDown className="h-4 w-4" />}
                        {trend.direction === 'stable' && <span className="text-xs">→</span>}
                      </div>
                    </div>
                    <div className={cn(
                      'text-2xl font-bold',
                      trend.direction === 'up' ? 'text-green-400' :
                      trend.direction === 'down' ? 'text-red-400' :
                      'text-gray-400'
                    )}>
                      {trend.change > 0 ? '+' : ''}{trend.change}%
                    </div>
                    <div className="text-xs text-gray-500 mt-1">vs. last week</div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Weekly Checkout */}
        <section className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5 rounded-2xl blur-sm" />
          <div className="relative bg-gray-900/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-purple-500/20 shadow-lg shadow-purple-500/10">
            <div className="mb-4">
              <h3 className="text-purple-400 flex items-center font-semibold text-lg">
                <CheckCircle className="h-5 w-5 mr-2" />
                ✅ Weekly Checkout
              </h3>
              <p className="text-sm text-gray-400 mt-2">
                Take a moment to reflect on your week and plan for the next one.
              </p>
            </div>
            <div className="space-y-6">
              {/* Reflection Question */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  What did I learn this week?
                </label>
                <Textarea
                  value={reflection}
                  onChange={(e) => setReflection(e.target.value)}
                  placeholder="Reflect on your wins, challenges, and insights..."
                  className="bg-gray-800/50 border-purple-500/30 text-white placeholder:text-gray-500 min-h-[100px] focus:border-purple-400 focus:ring-purple-400/20"
                />
              </div>

              {/* Next Week Focus */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  What's my focus for next week?
                </label>
                <Textarea
                  value={nextWeekFocus}
                  onChange={(e) => setNextWeekFocus(e.target.value)}
                  placeholder="Set your intentions and priorities for the upcoming week..."
                  className="bg-gray-800/50 border-purple-500/30 text-white placeholder:text-gray-500 min-h-[100px] focus:border-purple-400 focus:ring-purple-400/20"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold"
                  onClick={() => {
                    // Save checkout data
                    console.log('Saving weekly checkout:', { reflection, nextWeekFocus });
                  }}
                >
                  Save Checkout
                </Button>
                <Button
                  variant="outline"
                  className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
                  onClick={() => {
                    setReflection('');
                    setNextWeekFocus('');
                  }}
                >
                  Clear
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Motivational Quote */}
        <section className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 to-orange-500/5 rounded-2xl blur-sm" />
          <div className="relative bg-gray-900/60 backdrop-blur-sm rounded-2xl p-6 border border-yellow-500/20 shadow-lg shadow-yellow-500/10 text-center">
            <div className="text-2xl mb-2">🚀</div>
            <p className="text-gray-200 italic mb-2">
              "The only way to do great work is to love what you do."
            </p>
            <p className="text-sm text-gray-400">— Steve Jobs</p>
          </div>
        </section>

      </div>
    </div>
  );
};
