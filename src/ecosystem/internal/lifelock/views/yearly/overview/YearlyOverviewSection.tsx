/**
 * Yearly Overview Section
 * 
 * 12-month grid, quarterly breakdown, year summary, best/worst months
 */

import React from 'react';
import { format } from 'date-fns';
import { Calendar, Trophy, TrendingUp, AlertTriangle, Zap, Target } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/ui/card';
import { MonthGrid } from '../_shared/MonthGrid';
import { QuarterCard } from '../_shared/QuarterCard';
import { YearlyStatsCard } from '../_shared/YearlyStatsCard';
import { motion } from 'framer-motion';
import type { YearlyData } from '../_shared/types';

interface YearlyOverviewSectionProps {
  yearlyData: YearlyData;
}

export const YearlyOverviewSection: React.FC<YearlyOverviewSectionProps> = ({ yearlyData }) => {
  const { year, months, quarters, yearSummary } = yearlyData;

  return (
    <div className="min-h-screen w-full relative pb-24">
      <div className="w-full max-w-none p-2 sm:p-3 md:p-4 lg:p-6 space-y-6">
        
        {/* Year Header */}
        <section className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-amber-500/5 rounded-2xl blur-sm" />
          <div className="relative bg-gray-900/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-orange-500/20 shadow-lg shadow-orange-500/10">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl sm:text-4xl font-bold text-orange-400">
                  {year} at a Glance
                </h2>
                <p className="text-gray-400 text-sm mt-1">
                  Your year in review
                </p>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold text-orange-400">
                  {yearSummary.averageGrade}
                </div>
                <div className="text-sm text-gray-400">
                  {yearSummary.yearCompletion}% Complete
                </div>
              </div>
            </div>

            {/* XP Progress Bar */}
            <div className="mt-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-300 font-medium">Total XP Earned</span>
                <span className="text-lg font-bold text-orange-400">
                  {yearSummary.totalXP.toLocaleString()} / {yearSummary.maxXP.toLocaleString()}
                </span>
              </div>
              <div className="w-full bg-orange-900/30 rounded-full h-4">
                <div 
                  className="bg-gradient-to-r from-orange-400 to-amber-500 h-4 rounded-full"
                  style={{ width: `${(yearSummary.totalXP / yearSummary.maxXP) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Year Summary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <YearlyStatsCard
            title="Best Month"
            icon={Trophy}
            value={format(yearSummary.bestMonth, 'MMMM')}
            subtitle="Highest performance"
          />
          <YearlyStatsCard
            title="Total XP"
            icon={Zap}
            value={yearSummary.totalXP.toLocaleString()}
            subtitle={`${Math.round((yearSummary.totalXP / yearSummary.maxXP) * 100)}% of max`}
          />
          <YearlyStatsCard
            title="Perfect Months"
            icon={Target}
            value={yearSummary.perfectMonths}
            subtitle="A-grade months"
          />
          <YearlyStatsCard
            title="Completion"
            icon={TrendingUp}
            value={`${yearSummary.yearCompletion}%`}
            subtitle="Yearly average"
          />
        </div>

        {/* 12-Month Performance Grid */}
        <section className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-amber-500/5 rounded-2xl blur-sm" />
          <div className="relative bg-gray-900/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-orange-500/20 shadow-lg shadow-orange-500/10">
            <CardHeader className="p-0 mb-4">
              <CardTitle className="text-orange-400 flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                📅 12-Month Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <MonthGrid
                months={months}
                onMonthClick={(month) => {
                  console.log('Navigate to month:', format(month, 'yyyy-MM'));
                }}
              />
            </CardContent>
          </div>
        </section>

        {/* Quarterly Breakdown */}
        <section className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 rounded-2xl blur-sm" />
          <div className="relative bg-gray-900/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-blue-500/20 shadow-lg shadow-blue-500/10">
            <CardHeader className="p-0 mb-4">
              <CardTitle className="text-blue-400 flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                📊 Quarterly Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {quarters.map((quarter, idx) => (
                  <QuarterCard key={quarter.quarter} quarter={quarter} index={idx} />
                ))}
              </div>
            </CardContent>
          </div>
        </section>

        {/* Best & Worst Months */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <section className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-emerald-500/5 rounded-2xl blur-sm" />
            <div className="relative bg-gray-900/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-green-500/20 shadow-lg shadow-green-500/10">
              <CardHeader className="p-0 mb-4">
                <CardTitle className="text-green-400 flex items-center">
                  <Trophy className="h-5 w-5 mr-2" />
                  🏆 Best Month
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="text-3xl font-bold text-green-400 mb-2">
                  {format(yearSummary.bestMonth, 'MMMM')}
                </div>
                <div className="text-sm text-gray-300">
                  Peak performance of the year
                </div>
              </CardContent>
            </div>
          </section>

          <section className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-rose-500/5 rounded-2xl blur-sm" />
            <div className="relative bg-gray-900/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-red-500/20 shadow-lg shadow-red-500/10">
              <CardHeader className="p-0 mb-4">
                <CardTitle className="text-red-400 flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  ⚠️ Worst Month
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="text-3xl font-bold text-red-400 mb-2">
                  {format(yearSummary.worstMonth, 'MMMM')}
                </div>
                <div className="text-sm text-gray-300">
                  Room for improvement
                </div>
              </CardContent>
            </div>
          </section>
        </div>

      </div>
    </div>
  );
};
