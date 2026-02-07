/**
 * Monthly Goals Container
 *
 * Goals pill with sub-tabs: monthly-goals, performance, projects
 * Uses purple theme
 */

import React from 'react';
import { Target, TrendingUp, Briefcase } from 'lucide-react';
import { WeeklySectionSubNav, WeeklySubTab } from '@/domains/lifelock/2-weekly/_shared/WeeklySectionSubNav';
import { MonthlyGoalsSection } from '../../MonthlyGoalsSection';
import { MonthlyPerformanceSection } from '../../../performance/MonthlyPerformanceSection';
import type { MonthlyGoal, YearlyProgress, Project, MonthOverMonthMetric } from '../../../_shared/types';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

// Projects sub-tab content
interface ProjectsViewProps {
  projects: Project[];
}

const ProjectsView: React.FC<ProjectsViewProps> = ({ projects }) => {
  return (
    <div className="min-h-screen w-full relative pb-24">
      <div className="w-full max-w-none p-2 sm:p-3 md:p-4 lg:p-6 space-y-6">
        {/* Page Header */}
        <section className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-violet-500/5 rounded-2xl blur-sm" />
          <div className="relative bg-gray-900/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-purple-500/20 shadow-lg shadow-purple-500/10">
            <div className="flex items-center gap-2">
              <Briefcase className="h-6 w-6 text-purple-400" />
              <h2 className="text-2xl font-bold text-purple-400">💼 Ongoing Projects</h2>
            </div>
            <p className="text-gray-400 text-sm mt-2">
              Track progress on your active projects
            </p>
          </div>
        </section>

        {/* Projects List */}
        <section className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-amber-500/5 rounded-2xl blur-sm" />
          <div className="relative bg-gray-900/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-orange-500/20 shadow-lg shadow-orange-500/10">
            <div className="space-y-4">
              {projects.map((project, idx) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className={cn(
                    'border rounded-lg p-4',
                    project.status === 'on-track' && 'bg-green-900/20 border-green-500/30',
                    project.status === 'at-risk' && 'bg-yellow-900/20 border-yellow-500/30',
                    project.status === 'delayed' && 'bg-red-900/20 border-red-500/30',
                    project.status === 'completed' && 'bg-blue-900/20 border-blue-500/30'
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-semibold text-gray-200">{project.title}</div>
                    <div className={cn(
                      'px-2 py-1 rounded-full text-xs font-bold uppercase',
                      project.status === 'on-track' && 'bg-green-500/20 text-green-400',
                      project.status === 'at-risk' && 'bg-yellow-500/20 text-yellow-400',
                      project.status === 'delayed' && 'bg-red-500/20 text-red-400',
                      project.status === 'completed' && 'bg-blue-500/20 text-blue-400'
                    )}>
                      {project.status.replace('-', ' ')}
                    </div>
                  </div>
                  {project.deadline && (
                    <div className="text-xs text-gray-400 mb-3">
                      <span className="inline mr-1">📅</span>
                      Due: {format(project.deadline, 'MMM d, yyyy')}
                    </div>
                  )}
                  <div className="w-full bg-gray-700/50 rounded-full h-2">
                    <div
                      className={cn(
                        'h-2 rounded-full',
                        project.status === 'on-track' && 'bg-gradient-to-r from-green-400 to-emerald-500',
                        project.status === 'at-risk' && 'bg-gradient-to-r from-yellow-400 to-orange-500',
                        project.status === 'delayed' && 'bg-gradient-to-r from-red-400 to-rose-500',
                        project.status === 'completed' && 'bg-gradient-to-r from-blue-400 to-indigo-500'
                      )}
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-400 mt-1">{project.progress}% complete</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

interface MonthlyGoalsContainerProps {
  monthlyGoals: MonthlyGoal[];
  yearlyProgress: YearlyProgress[];
  projects: Project[];
  monthOverMonth: MonthOverMonthMetric[];
  activeSubTab?: string;
  onSubTabChange?: (tabId: string) => void;
}

const SUB_TABS: WeeklySubTab[] = [
  { id: 'monthly-goals', label: 'Monthly Goals', icon: Target },
  { id: 'performance', label: 'Performance', icon: TrendingUp },
  { id: 'projects', label: 'Projects', icon: Briefcase },
];

export const MonthlyGoalsContainer: React.FC<MonthlyGoalsContainerProps> = ({
  monthlyGoals,
  yearlyProgress,
  projects,
  monthOverMonth,
  activeSubTab = 'monthly-goals',
  onSubTabChange,
}) => {
  const handleTabChange = (tabId: string) => {
    onSubTabChange?.(tabId);
  };

  return (
    <div className="w-full">
      {/* Sub-tab Navigation */}
      <WeeklySectionSubNav
        tabs={SUB_TABS}
        activeTab={activeSubTab}
        onTabChange={handleTabChange}
        theme="work"
      />

      {/* Content Area */}
      <div className="w-full">
        {activeSubTab === 'monthly-goals' && (
          <MonthlyGoalsSection
            monthlyGoals={monthlyGoals}
            yearlyProgress={yearlyProgress}
            projects={projects}
          />
        )}
        {activeSubTab === 'performance' && (
          <MonthlyPerformanceSection monthOverMonth={monthOverMonth} />
        )}
        {activeSubTab === 'projects' && (
          <ProjectsView projects={projects} />
        )}
      </div>
    </div>
  );
};

export default MonthlyGoalsContainer;
