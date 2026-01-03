/**
 * Yearly Planning Section
 * 
 * Year-end reflection, wins, improvements, next year vision
 */

import React, { useState } from 'react';
import { Trophy, AlertTriangle, Lightbulb, ArrowRight, Rocket } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import type { YearlyReflection } from '../_shared/types';

interface YearlyPlanningSectionProps {
  reflectionData: YearlyReflection;
  currentYear: number;
}

export const YearlyPlanningSection: React.FC<YearlyPlanningSectionProps> = ({
  reflectionData,
  currentYear
}) => {
  const { wins, improvements, learnings } = reflectionData;
  
  const [reflection, setReflection] = useState(reflectionData.reflection);
  const [nextYearVision, setNextYearVision] = useState(reflectionData.nextYearVision);

  return (
    <div className="min-h-screen w-full relative pb-24">
      <div className="w-full max-w-none p-2 sm:p-3 md:p-4 lg:p-6 space-y-6">
        
        {/* Page Header */}
        <section className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 rounded-2xl blur-sm" />
          <div className="relative bg-gray-900/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-indigo-500/20 shadow-lg shadow-indigo-500/10">
            <CardHeader className="p-0">
              <CardTitle className="text-indigo-400 flex items-center text-2xl">
                <Rocket className="h-6 w-6 mr-2" />
                🚀 Planning & Vision
              </CardTitle>
              <p className="text-gray-400 text-sm mt-2">
                Reflect on {currentYear} and envision {currentYear + 1}
              </p>
            </CardHeader>
          </div>
        </section>

        {/* Yearly Wins */}
        <section className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-emerald-500/5 rounded-2xl blur-sm" />
          <div className="relative bg-gray-900/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-green-500/20 shadow-lg shadow-green-500/10">
            <CardHeader className="p-0 mb-4">
              <CardTitle className="text-green-400 flex items-center">
                <Trophy className="h-5 w-5 mr-2" />
                🏆 Yearly Wins & Achievements
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

        {/* Key Learnings */}
        <section className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-cyan-500/5 rounded-2xl blur-sm" />
          <div className="relative bg-gray-900/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-blue-500/20 shadow-lg shadow-blue-500/10">
            <CardHeader className="p-0 mb-4">
              <CardTitle className="text-blue-400 flex items-center">
                <Lightbulb className="h-5 w-5 mr-2" />
                💡 Key Learnings
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-3">
                {learnings.map((learning, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500/30 border-2 border-blue-500/50 flex items-center justify-center">
                        <span className="text-blue-300 font-bold text-xs">{idx + 1}</span>
                      </div>
                      <div className="flex-1 text-gray-200">{learning}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </div>
        </section>

        {/* Yearly Reflection */}
        <section className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5 rounded-2xl blur-sm" />
          <div className="relative bg-gray-900/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-purple-500/20 shadow-lg shadow-purple-500/10">
            <CardHeader className="p-0 mb-4">
              <CardTitle className="text-purple-400 flex items-center">
                <Lightbulb className="h-5 w-5 mr-2" />
                💭 {currentYear} Reflection
              </CardTitle>
              <p className="text-sm text-gray-400 mt-2">
                Take time to deeply reflect on your entire year
              </p>
            </CardHeader>
            <CardContent className="p-0 space-y-6">
              {/* What I Learned */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  What did I learn about myself this year?
                </label>
                <Textarea
                  value={reflection}
                  onChange={(e) => setReflection(e.target.value)}
                  placeholder="Reflect on your biggest insights, personal growth, and self-discoveries..."
                  className="bg-gray-800/50 border-purple-500/30 text-white placeholder:text-gray-500 min-h-[150px] focus:border-purple-400 focus:ring-purple-400/20"
                />
              </div>

              {/* Next Year Vision */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  What's my vision for {currentYear + 1}?
                </label>
                <Textarea
                  value={nextYearVision}
                  onChange={(e) => setNextYearVision(e.target.value)}
                  placeholder="Paint a vivid picture of your ideal year ahead - goals, aspirations, and dreams..."
                  className="bg-gray-800/50 border-purple-500/30 text-white placeholder:text-gray-500 min-h-[150px] focus:border-purple-400 focus:ring-purple-400/20"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold"
                  onClick={() => {
                    console.log('Saving yearly reflection:', { reflection, nextYearVision });
                  }}
                >
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Save & Close Year
                </Button>
                <Button
                  variant="outline"
                  className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
                  onClick={() => {
                    setReflection('');
                    setNextYearVision('');
                  }}
                >
                  Clear
                </Button>
              </div>
            </CardContent>
          </div>
        </section>

        {/* Inspirational Quote */}
        <section className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-amber-500/5 rounded-2xl blur-sm" />
          <div className="relative bg-gray-900/60 backdrop-blur-sm rounded-2xl p-6 border border-orange-500/20 shadow-lg shadow-orange-500/10 text-center">
            <div className="text-3xl mb-3">✨</div>
            <p className="text-xl text-gray-200 italic mb-3">
              "The best time to plant a tree was 20 years ago. The second best time is now."
            </p>
            <p className="text-sm text-gray-400">— Chinese Proverb</p>
          </div>
        </section>

      </div>
    </div>
  );
};
