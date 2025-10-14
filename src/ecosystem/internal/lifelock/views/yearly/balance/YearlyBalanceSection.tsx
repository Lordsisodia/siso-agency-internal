/**
 * Yearly Balance Section
 * 
 * Life balance scorecard, area trends, insights
 */

import React from 'react';
import { Heart, Briefcase, DollarSign, Users, User, PieChart, TrendingUp } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/ui/card';
import { motion } from 'framer-motion';
import { cn } from '@/shared/lib/utils';
import type { LifeBalanceData } from '../_shared/types';

interface YearlyBalanceSectionProps {
  balanceData: LifeBalanceData;
}

const LIFE_AREAS = [
  { key: 'health', label: 'Health & Fitness', icon: Heart, color: 'from-pink-500 to-rose-600', emoji: '❤️' },
  { key: 'career', label: 'Career & Business', icon: Briefcase, color: 'from-blue-500 to-indigo-600', emoji: '💼' },
  { key: 'financial', label: 'Financial', icon: DollarSign, color: 'from-green-500 to-emerald-600', emoji: '💰' },
  { key: 'relationships', label: 'Relationships', icon: Users, color: 'from-purple-500 to-violet-600', emoji: '👥' },
  { key: 'personal', label: 'Personal Growth', icon: User, color: 'from-orange-500 to-amber-600', emoji: '🌱' },
];

export const YearlyBalanceSection: React.FC<YearlyBalanceSectionProps> = ({ balanceData }) => {
  return (
    <div className="min-h-screen w-full relative pb-24">
      <div className="w-full max-w-none p-2 sm:p-3 md:p-4 lg:p-6 space-y-6">
        
        {/* Page Header */}
        <section className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-teal-500/5 to-cyan-500/5 rounded-2xl blur-sm" />
          <div className="relative bg-gray-900/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-teal-500/20 shadow-lg shadow-teal-500/10">
            <CardHeader className="p-0">
              <CardTitle className="text-teal-400 flex items-center text-2xl">
                <PieChart className="h-6 w-6 mr-2" />
                ⚖️ Life Balance
              </CardTitle>
              <p className="text-gray-400 text-sm mt-2">
                How balanced is my life across all areas?
              </p>
            </CardHeader>
          </div>
        </section>

        {/* Overall Balance Score */}
        <section className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5 rounded-2xl blur-sm" />
          <div className="relative bg-gray-900/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-purple-500/20 shadow-lg shadow-purple-500/10">
            <CardHeader className="p-0 mb-4">
              <CardTitle className="text-purple-400 flex items-center">
                <PieChart className="h-5 w-5 mr-2" />
                🎯 Overall Balance Score
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="text-center mb-6">
                <div className="text-6xl font-bold text-purple-400 mb-2">
                  {balanceData.overall}/100
                </div>
                <div className="text-sm text-gray-400">Holistic life balance</div>
              </div>
              <div className="w-full bg-gray-700/50 rounded-full h-4">
                <div
                  className="bg-gradient-to-r from-purple-400 to-pink-500 h-4 rounded-full transition-all duration-500"
                  style={{ width: `${balanceData.overall}%` }}
                />
              </div>
            </CardContent>
          </div>
        </section>

        {/* Life Balance Scorecard */}
        <section className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 rounded-2xl blur-sm" />
          <div className="relative bg-gray-900/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-blue-500/20 shadow-lg shadow-blue-500/10">
            <CardHeader className="p-0 mb-4">
              <CardTitle className="text-blue-400 flex items-center">
                <Target className="h-5 w-5 mr-2" />
                📊 Life Areas Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-4">
                {LIFE_AREAS.map((area, idx) => {
                  const score = balanceData[area.key as keyof Omit<LifeBalanceData, 'overall' | 'trends'>];
                  const Icon = area.icon;
                  
                  return (
                    <motion.div
                      key={area.key}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="text-xl">{area.emoji}</span>
                          <div>
                            <div className="text-sm font-semibold text-gray-200">{area.label}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={cn(
                            'text-2xl font-bold',
                            score >= 80 ? 'text-green-400' :
                            score >= 70 ? 'text-blue-400' :
                            score >= 60 ? 'text-yellow-400' : 'text-red-400'
                          )}>
                            {score}/100
                          </div>
                        </div>
                      </div>
                      <div className="w-full bg-gray-700/50 rounded-full h-2.5">
                        <div
                          className={cn('h-2.5 rounded-full bg-gradient-to-r', area.color)}
                          style={{ width: `${score}%` }}
                        />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </div>
        </section>

        {/* Balance Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <section className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-emerald-500/5 rounded-2xl blur-sm" />
            <div className="relative bg-gray-900/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-green-500/20 shadow-lg shadow-green-500/10">
              <CardHeader className="p-0 mb-4">
                <CardTitle className="text-green-400 flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  💪 Strengths
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-2 text-sm text-gray-200">
                  {LIFE_AREAS.filter(a => balanceData[a.key as keyof Omit<LifeBalanceData, 'overall' | 'trends'>] >= 80)
                    .map(a => (
                      <div key={a.key} className="flex items-center space-x-2">
                        <span>{a.emoji}</span>
                        <span>{a.label} - {balanceData[a.key as keyof Omit<LifeBalanceData, 'overall' | 'trends'>]}/100</span>
                      </div>
                    ))}
                </div>
              </CardContent>
            </div>
          </section>

          <section className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 to-orange-500/5 rounded-2xl blur-sm" />
            <div className="relative bg-gray-900/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-yellow-500/20 shadow-lg shadow-yellow-500/10">
              <CardHeader className="p-0 mb-4">
                <CardTitle className="text-yellow-400 flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  ⚠️ Areas to Improve
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-2 text-sm text-gray-200">
                  {LIFE_AREAS.filter(a => balanceData[a.key as keyof Omit<LifeBalanceData, 'overall' | 'trends'>] < 80)
                    .map(a => (
                      <div key={a.key} className="flex items-center space-x-2">
                        <span>{a.emoji}</span>
                        <span>{a.label} - {balanceData[a.key as keyof Omit<LifeBalanceData, 'overall' | 'trends'>]}/100</span>
                      </div>
                    ))}
                </div>
              </CardContent>
            </div>
          </section>
        </div>

      </div>
    </div>
  );
};
