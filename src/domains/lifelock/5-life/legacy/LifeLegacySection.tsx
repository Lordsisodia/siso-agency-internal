/**
 * LifeLegacySection - Legacy & Stats Page
 *
 * Displays lifetime achievements, all-time records, financial legacy, and impact metrics
 */

import React from 'react';
import { Trophy, TrendingUp, DollarSign, Users, Flame, Target, Calendar, Award } from 'lucide-react';
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
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-500/20 mb-4">
          <Trophy className="h-8 w-8 text-amber-400" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Legacy & Stats</h1>
        <p className="text-gray-400">Lifetime achievements and all-time records</p>
      </div>

      {/* Lifetime Stats Grid */}
      <section className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-yellow-500/5 rounded-2xl blur-sm" />
        <div className="relative bg-gray-900/60 backdrop-blur-sm rounded-2xl p-6 border border-amber-500/20">
          <div className="flex items-center mb-6">
            <Calendar className="h-5 w-5 text-amber-400 mr-2" />
            <h2 className="text-lg font-semibold text-amber-400">Lifetime Performance</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <LegacyStatCard
              icon={Calendar}
              value={lifetimeStats.totalDaysTracked.toLocaleString()}
              label="Days Tracked"
            />
            <LegacyStatCard
              icon={Target}
              value={lifetimeStats.totalTasksCompleted.toLocaleString()}
              label="Tasks Completed"
            />
            <LegacyStatCard
              icon={Flame}
              value={lifetimeStats.totalWorkouts.toLocaleString()}
              label="Workouts"
            />
            <LegacyStatCard
              icon={TrendingUp}
              value={Math.round(lifetimeStats.totalDeepWorkHours).toLocaleString()}
              label="Deep Work Hours"
            />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <LegacyStatCard
              icon={Award}
              value={lifetimeStats.lifetimeXP.toLocaleString()}
              label="Total XP"
              highlight
            />
            <LegacyStatCard
              icon={Flame}
              value={lifetimeStats.longestStreak.toString()}
              label="Longest Streak"
              highlight
            />
            <LegacyStatCard
              icon={Trophy}
              value={lifetimeStats.perfectDays.toString()}
              label="Perfect Days"
              highlight
            />
            <LegacyStatCard
              icon={Award}
              value={lifetimeStats.bestDay.grade}
              label="Best Day Grade"
              subvalue={`${lifetimeStats.bestDay.xp} XP`}
              highlight
            />
          </div>
        </div>
      </section>

      {/* All-Time Bests */}
      <section className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-yellow-500/5 rounded-2xl blur-sm" />
        <div className="relative bg-gray-900/60 backdrop-blur-sm rounded-2xl p-6 border border-amber-500/20">
          <div className="flex items-center mb-6">
            <Award className="h-5 w-5 text-amber-400 mr-2" />
            <h2 className="text-lg font-semibold text-amber-400">All-Time Bests</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <RecordCard
              title="Longest Streak"
              value={`${allTimeBests.longestStreak} days`}
              icon={Flame}
            />
            <RecordCard
              title="Most XP in a Day"
              value={allTimeBests.mostXPInDay.toLocaleString()}
              icon={Target}
            />
            <RecordCard
              title="Most XP in a Week"
              value={allTimeBests.mostXPInWeek.toLocaleString()}
              icon={TrendingUp}
            />
            <RecordCard
              title="Most XP in a Month"
              value={allTimeBests.mostXPInMonth.toLocaleString()}
              icon={Calendar}
            />
            <RecordCard
              title="Best Year"
              value={allTimeBests.bestYear.year.toString()}
              subvalue={`${allTimeBests.bestYear.totalXP.toLocaleString()} XP • ${allTimeBests.bestYear.averageGrade} avg`}
              icon={Trophy}
              wide
            />
          </div>
        </div>
      </section>

      {/* Financial Legacy */}
      <section className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-emerald-500/5 rounded-2xl blur-sm" />
        <div className="relative bg-gray-900/60 backdrop-blur-sm rounded-2xl p-6 border border-green-500/20">
          <div className="flex items-center mb-6">
            <DollarSign className="h-5 w-5 text-green-400 mr-2" />
            <h2 className="text-lg font-semibold text-green-400">Financial Legacy</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <FinancialCard
              title="Total Revenue"
              value={`$${financialLegacy.totalRevenue.toLocaleString()}`}
              color="green"
            />
            <FinancialCard
              title="Total Saved"
              value={`$${financialLegacy.totalSaved.toLocaleString()}`}
              color="blue"
            />
            <FinancialCard
              title="Total Invested"
              value={`$${financialLegacy.totalInvested.toLocaleString()}`}
              color="purple"
            />
            <FinancialCard
              title="Net Worth"
              value={`$${financialLegacy.netWorth.toLocaleString()}`}
              color="amber"
              highlight
            />
          </div>
        </div>
      </section>

      {/* Impact Metrics */}
      <section className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5 rounded-2xl blur-sm" />
        <div className="relative bg-gray-900/60 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/20">
          <div className="flex items-center mb-6">
            <Users className="h-5 w-5 text-purple-400 mr-2" />
            <h2 className="text-lg font-semibold text-purple-400">Impact Metrics</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <ImpactCard
              title="Projects Shipped"
              value={impactMetrics.projectsShipped.toString()}
              icon={Target}
            />
            <ImpactCard
              title="Clients Helped"
              value={impactMetrics.clientsHelped.toString()}
              icon={Users}
            />
            <ImpactCard
              title="People Mentored"
              value={impactMetrics.peopleMentored.toString()}
              icon={Award}
            />
            <ImpactCard
              title="Content Created"
              value={impactMetrics.contentCreated.toString()}
              icon={TrendingUp}
            />
          </div>
        </div>
      </section>
    </div>
  );
};

// Helper components
interface LegacyStatCardProps {
  icon: React.ElementType;
  value: string;
  label: string;
  subvalue?: string;
  highlight?: boolean;
}

const LegacyStatCard: React.FC<LegacyStatCardProps> = ({ icon: Icon, value, label, subvalue, highlight }) => (
  <div className={`rounded-xl p-4 ${highlight ? 'bg-amber-500/10 border border-amber-500/30' : 'bg-gray-800/50 border border-gray-700'}`}>
    <Icon className={`h-5 w-5 mb-2 ${highlight ? 'text-amber-400' : 'text-gray-400'}`} />
    <div className={`text-2xl font-bold ${highlight ? 'text-amber-400' : 'text-white'}`}>{value}</div>
    <div className="text-xs text-gray-400">{label}</div>
    {subvalue && <div className="text-xs text-gray-500 mt-1">{subvalue}</div>}
  </div>
);

interface RecordCardProps {
  title: string;
  value: string;
  subvalue?: string;
  icon: React.ElementType;
  wide?: boolean;
}

const RecordCard: React.FC<RecordCardProps> = ({ title, value, subvalue, icon: Icon, wide }) => (
  <div className={`bg-gray-800/50 rounded-xl p-4 border border-amber-500/20 ${wide ? 'col-span-2 md:col-span-1' : ''}`}>
    <div className="flex items-center gap-2 mb-2">
      <Icon className="h-4 w-4 text-amber-400" />
      <span className="text-xs text-gray-400">{title}</span>
    </div>
    <div className="text-xl font-bold text-white">{value}</div>
    {subvalue && <div className="text-xs text-gray-500 mt-1">{subvalue}</div>}
  </div>
);

interface FinancialCardProps {
  title: string;
  value: string;
  color: 'green' | 'blue' | 'purple' | 'amber';
  highlight?: boolean;
}

const FinancialCard: React.FC<FinancialCardProps> = ({ title, value, color, highlight }) => {
  const colorClasses = {
    green: { text: 'text-green-400', border: 'border-green-500/30', bg: 'bg-green-500/10' },
    blue: { text: 'text-blue-400', border: 'border-blue-500/30', bg: 'bg-blue-500/10' },
    purple: { text: 'text-purple-400', border: 'border-purple-500/30', bg: 'bg-purple-500/10' },
    amber: { text: 'text-amber-400', border: 'border-amber-500/30', bg: 'bg-amber-500/10' },
  };
  const colors = colorClasses[color];

  return (
    <div className={`rounded-xl p-4 border ${highlight ? colors.border : 'border-gray-700'} ${highlight ? colors.bg : 'bg-gray-800/50'}`}>
      <div className="text-xs text-gray-400 mb-1">{title}</div>
      <div className={`text-xl font-bold ${colors.text}`}>{value}</div>
    </div>
  );
};

interface ImpactCardProps {
  title: string;
  value: string;
  icon: React.ElementType;
}

const ImpactCard: React.FC<ImpactCardProps> = ({ title, value, icon: Icon }) => (
  <div className="bg-gray-800/50 rounded-xl p-4 border border-purple-500/20">
    <div className="flex items-center gap-2 mb-2">
      <Icon className="h-4 w-4 text-purple-400" />
      <span className="text-xs text-gray-400">{title}</span>
    </div>
    <div className="text-2xl font-bold text-white">{value}</div>
  </div>
);
