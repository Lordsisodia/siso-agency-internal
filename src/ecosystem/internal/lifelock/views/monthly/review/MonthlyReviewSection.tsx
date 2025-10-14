/**
 * Monthly Review Section
 * 
 * Monthly wins, areas for improvement, reflection, next month prep
 */

import React, { useState } from 'react';
import { Trophy, AlertTriangle, Lightbulb, ArrowRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/ui/card';
import { Textarea } from '@/shared/ui/textarea';
import { Button } from '@/shared/ui/button';
import { motion } from 'framer-motion';
import type { MonthlyReflection } from '../_shared/types';

interface MonthlyReviewSectionProps {
  reflectionData: MonthlyReflection;
}

export const MonthlyReviewSection: React.FC<MonthlyReviewSectionProps> = ({ reflectionData }) => {
  const { wins, improvements } = reflectionData;
  
  const [reflection, setReflection] = useState(reflectionData.reflection);
  const [nextMonthFocus, setNextMonthFocus] = useState(reflectionData.nextMonthFocus);

  return (
    <div className="min-h-screen w-full relative pb-24">
      <div className="w-full max-w-none p-2 sm:p-3 md:p-4 lg:p-6 space-y-6">
        
        {/* Page Header */}
        <section className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5 rounded-2xl blur-sm" />
          <div className="relative bg-gray-900/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-purple-500/20 shadow-lg shadow-purple-500/10">
            <CardHeader className="p-0">
              <CardTitle className="text-purple-400 flex items-center text-2xl">
                <Lightbulb className="h-6 w-6 mr-2" />
                💭 Monthly Review
              </CardTitle>
              <p className="text-gray-400 text-sm mt-2">
                Reflect on the month and plan ahead
              </p>
            </CardHeader>
          </div>
        </section>

        {/* Monthly Wins */}
        <section className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-emerald-500/5 rounded-2xl blur-sm" />
          <div className="relative bg-gray-900/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-green-500/20 shadow-lg shadow-green-500/10">
            <CardHeader className="p-0 mb-4">
              <CardTitle className="text-green-400 flex items-center">
                <Trophy className="h-5 w-5 mr-2" />
                🏆 Monthly Wins & Achievements
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
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
                      <Trophy className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 text-gray-200">{win}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </div>
        </section>

        {/* Areas for Improvement */}
        <section className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 to-orange-500/5 rounded-2xl blur-sm" />
          <div className="relative bg-gray-900/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-yellow-500/20 shadow-lg shadow-yellow-500/10">
            <CardHeader className="p-0 mb-4">
              <CardTitle className="text-yellow-400 flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2" />
                ⚠️ Areas for Improvement
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-3">
                {improvements.map((improvement, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4"
                  >
                    <div className="flex items-start space-x-3">
                      <AlertTriangle className="h-5 w-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 text-gray-200">{improvement}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </div>
        </section>

        {/* Monthly Reflection */}
        <section className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5 rounded-2xl blur-sm" />
          <div className="relative bg-gray-900/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-purple-500/20 shadow-lg shadow-purple-500/10">
            <CardHeader className="p-0 mb-4">
              <CardTitle className="text-purple-400 flex items-center">
                <Lightbulb className="h-5 w-5 mr-2" />
                💭 Monthly Reflection
              </CardTitle>
              <p className="text-sm text-gray-400 mt-2">
                Take time to reflect on what you learned this month
              </p>
            </CardHeader>
            <CardContent className="p-0 space-y-6">
              {/* Key Learnings */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  What did I learn this month?
                </label>
                <Textarea
                  value={reflection}
                  onChange={(e) => setReflection(e.target.value)}
                  placeholder="Reflect on your biggest learnings, insights, and discoveries..."
                  className="bg-gray-800/50 border-purple-500/30 text-white placeholder:text-gray-500 min-h-[120px] focus:border-purple-400 focus:ring-purple-400/20"
                />
              </div>

              {/* Next Month Focus */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  What's my focus for next month?
                </label>
                <Textarea
                  value={nextMonthFocus}
                  onChange={(e) => setNextMonthFocus(e.target.value)}
                  placeholder="Set your intentions, priorities, and goals for the upcoming month..."
                  className="bg-gray-800/50 border-purple-500/30 text-white placeholder:text-gray-500 min-h-[120px] focus:border-purple-400 focus:ring-purple-400/20"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold"
                  onClick={() => {
                    console.log('Saving monthly review:', { reflection, nextMonthFocus });
                  }}
                >
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Save & Close Month
                </Button>
                <Button
                  variant="outline"
                  className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
                  onClick={() => {
                    setReflection('');
                    setNextMonthFocus('');
                  }}
                >
                  Clear
                </Button>
              </div>
            </CardContent>
          </div>
        </section>

        {/* Motivational Quote */}
        <section className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 rounded-2xl blur-sm" />
          <div className="relative bg-gray-900/60 backdrop-blur-sm rounded-2xl p-6 border border-indigo-500/20 shadow-lg shadow-indigo-500/10 text-center">
            <div className="text-2xl mb-2">🌟</div>
            <p className="text-gray-200 italic mb-2">
              "Success is the sum of small efforts repeated day in and day out."
            </p>
            <p className="text-sm text-gray-400">— Robert Collier</p>
          </div>
        </section>

      </div>
    </div>
  );
};
