/**
 * Life Legacy Section
 * 
 * Lifetime achievements, all-time records, financial legacy, impact
 */

import React from 'react';
import { format } from 'date-fns';
import { Trophy, Zap, TrendingUp, DollarSign, Users } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/ui/card';
import { LifeStatsCard } from '../_shared/LifeStatsCard';
import { motion } from 'framer-motion';
import type { LifetimeStats, AllTimeBests, FinancialLegacy, ImpactMetrics } from '../_shared/types';

interface LifeLegacySectionProps {
  lifetimeStats: LifetimeStats;
  allTimeBests: AllTimeBests;
  financialLegacy: FinancialLegacy;
  impactMetrics: ImpactMetrics;
}

export const LifeLegacySection: React.FC<LifeLegacySectionProps> = ({
  lifetimeStats,
  allTimeBests,
  financialLegacy,
  impactMetrics
}) => {
  return (
    <div className="min-h-screen w-full relative pb-24">
      <div className="w-full max-w-none p-2 sm:p-3 md:p-4 lg:p-6 space-y-6">
        
        {/* Page Header */}
        <section className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-yellow-500/5 rounded-2xl blur-sm" />
          <div className="relative bg-gray-900/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-amber-500/20 shadow-lg shadow-amber-500/10">
            <CardHeader className="p-0">
              <CardTitle className="text-amber-400 flex items-center text-2xl">
                <Trophy className="h-6 w-6 mr-2" />
                🏆 Legacy & Stats
              </CardTitle>
              <p className="text-gray-400 text-sm mt-2">
                Your lifetime achievements and all-time records
              </p>
            </CardHeader>
          </div>
        </section>

        {/* Lifetime Performance */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          <LifeStatsCard
            title="Days Tracked"
            icon={Calendar}
            value={lifetimeStats.totalDaysTracked.toLocaleString()}
            subtitle="Lifetime"
            gradientFrom="blue-500"
            gradientTo="indigo-500"
            borderColor="blue-500"
            textColor="blue-400"
          />
          <LifeStatsCard
            title="Lifetime XP"
            icon={Zap}
            value={lifetimeStats.lifetimeXP.toLocaleString()}
            subtitle="All time"
            gradientFrom="yellow-500"
            gradientTo="amber-500"
            borderColor="yellow-500"
            textColor="yellow-400"
          />
          <LifeStatsCard
            title="Workouts"
            icon={TrendingUp}
            value={lifetimeStats.totalWorkouts}
            subtitle="Total sessions"
            gradientFrom="pink-500"
            gradientTo="rose-500"
            borderColor="pink-500"
            textColor="pink-400"
          />
          <LifeStatsCard
            title="Deep Work"
            icon={Trophy}
            value={`${lifetimeStats.totalDeepWorkHours.toLocaleString()}h`}
            subtitle="All time"
            gradientFrom="purple-500"
            gradientTo="violet-500"
            borderColor="purple-500"
            textColor="purple-400"
          />
        </div>

        {/* All-Time Bests */}
        <section className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-gold-500/5 to-yellow-500/5 rounded-2xl blur-sm" />
          <div className="relative bg-gray-900/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-yellow-500/20 shadow-lg shadow-yellow-500/10">
            <CardHeader className="p-0 mb-4">
              <CardTitle className="text-yellow-400 flex items-center">
                <Trophy className="h-5 w-5 mr-2" />
                🥇 All-Time Records
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <div className="text-sm text-gray-400 mb-1">Longest Streak</div>
                  <div className="text-3xl font-bold text-orange-400">{allTimeBests.longestStreak} days</div>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <div className="text-sm text-gray-400 mb-1">Most XP (Day)</div>
                  <div className="text-3xl font-bold text-yellow-400">{allTimeBests.mostXPInDay} XP</div>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <div className="text-sm text-gray-400 mb-1">Most XP (Week)</div>
                  <div className="text-3xl font-bold text-blue-400">{allTimeBests.mostXPInWeek.toLocaleString()} XP</div>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <div className="text-sm text-gray-400 mb-1">Best Year</div>
                  <div className="text-3xl font-bold text-green-400">
                    {allTimeBests.bestYear.year}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {allTimeBests.bestYear.averageGrade} ({allTimeBests.bestYear.totalXP.toLocaleString()} XP)
                  </div>
                </div>
              </div>
            </CardContent>
          </div>
        </section>

        {/* Financial Legacy */}
        <section className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-emerald-500/5 rounded-2xl blur-sm" />
          <div className="relative bg-gray-900/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-green-500/20 shadow-lg shadow-green-500/10">
            <CardHeader className="p-0 mb-4">
              <CardTitle className="text-green-400 flex items-center">
                <DollarSign className="h-5 w-5 mr-2" />
                💰 Financial Legacy
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <div className="text-sm text-gray-400 mb-1">Total Revenue</div>
                  <div className="text-2xl font-bold text-green-400">
                    ${financialLegacy.totalRevenue.toLocaleString()}
                  </div>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <div className="text-sm text-gray-400 mb-1">Total Saved</div>
                  <div className="text-2xl font-bold text-blue-400">
                    ${financialLegacy.totalSaved.toLocaleString()}
                  </div>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <div className="text-sm text-gray-400 mb-1">Total Invested</div>
                  <div className="text-2xl font-bold text-purple-400">
                    ${financialLegacy.totalInvested.toLocaleString()}
                  </div>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <div className="text-sm text-gray-400 mb-1">Net Worth</div>
                  <div className="text-2xl font-bold text-yellow-400">
                    ${financialLegacy.netWorth.toLocaleString()}
                  </div>
                </div>
              </div>
            </CardContent>
          </div>
        </section>

        {/* Impact Metrics */}
        <section className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5 rounded-2xl blur-sm" />
          <div className="relative bg-gray-900/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-purple-500/20 shadow-lg shadow-purple-500/10">
            <CardHeader className="p-0 mb-4">
              <CardTitle className="text-purple-400 flex items-center">
                <Users className="h-5 w-5 mr-2" />
                🌍 Impact Metrics
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="text-center bg-gray-800/30 rounded-lg p-4">
                  <div className="text-3xl font-bold text-blue-400 mb-1">{impactMetrics.projectsShipped}</div>
                  <div className="text-xs text-gray-400">Projects Shipped</div>
                </div>
                <div className="text-center bg-gray-800/30 rounded-lg p-4">
                  <div className="text-3xl font-bold text-green-400 mb-1">{impactMetrics.clientsHelped}</div>
                  <div className="text-xs text-gray-400">Clients Helped</div>
                </div>
                <div className="text-center bg-gray-800/30 rounded-lg p-4">
                  <div className="text-3xl font-bold text-purple-400 mb-1">{impactMetrics.peopleMentored}</div>
                  <div className="text-xs text-gray-400">People Mentored</div>
                </div>
                <div className="text-center bg-gray-800/30 rounded-lg p-4">
                  <div className="text-3xl font-bold text-orange-400 mb-1">{impactMetrics.contentCreated}</div>
                  <div className="text-xs text-gray-400">Content Created</div>
                </div>
              </div>
            </CardContent>
          </div>
        </section>

      </div>
    </div>
  );
};
