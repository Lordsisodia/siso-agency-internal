import React from 'react';
import { LifeLockData } from '../../../types/shared/lifelock';
import { LifeLockDashboard } from '../tabs/LifeLockDashboard';
import { LifeLockDayPlanner } from '../tabs/LifeLockDayPlanner';
import { LifeLockMasterClass } from '../tabs/LifeLockMasterClass';
import { LifeLockTaskManager } from '../tabs/LifeLockTaskManager';
import { LifeLockHabits } from '../tabs/LifeLockHabits';
import { LifeLockWisdom } from '../tabs/LifeLockWisdom';
import { LifeLockMetrics } from '../tabs/LifeLockMetrics';
import { LifeLockGoals } from '../tabs/LifeLockGoals';
import { LifeLockJournal } from '../tabs/LifeLockJournal';
import { LifeLockSettings } from '../tabs/LifeLockSettings';
import { LifeLockMindfulness } from '../tabs/LifeLockMindfulness';
import { LifeLockAchievements } from '../tabs/LifeLockAchievements';
import { LifeLockDataVisualization } from '../tabs/LifeLockDataVisualization';

export interface LifeLockTabRendererProps {
  activeTab: string;
  currentDate: Date;
  lifeLockData: LifeLockData;
  refactoredLifeLockData: any;
  onDateChange: (date: Date) => void;
  onCreateTask: () => void;
  onCreateHabit: () => void;
  onCreateGoal: () => void;
  onCreateJournalEntry: () => void;
}

const LifeLockTabRenderer: React.FC<LifeLockTabRendererProps> = ({
  activeTab,
  currentDate,
  lifeLockData,
  refactoredLifeLockData,
  onDateChange,
  onCreateTask,
  onCreateHabit,
  onCreateGoal,
  onCreateJournalEntry,
}) => {
  const commonTabProps = {
    currentDate,
    lifeLockData,
    refactoredLifeLockData,
    onDateChange,
  };

  switch (activeTab) {
    case 'dashboard':
      return (
        <LifeLockDashboard
          {...commonTabProps}
          onCreateTask={onCreateTask}
          onCreateHabit={onCreateHabit}
          onCreateGoal={onCreateGoal}
        />
      );

    case 'day-planner':
      return (
        <LifeLockDayPlanner
          {...commonTabProps}
          onCreateTask={onCreateTask}
        />
      );

    case 'master-class':
      return <LifeLockMasterClass {...commonTabProps} />;

    case 'task-manager':
      return (
        <LifeLockTaskManager
          {...commonTabProps}
          onCreateTask={onCreateTask}
        />
      );

    case 'habits':
      return (
        <LifeLockHabits
          {...commonTabProps}
          onCreateHabit={onCreateHabit}
        />
      );

    case 'wisdom':
      return <LifeLockWisdom {...commonTabProps} />;

    case 'metrics':
      return <LifeLockMetrics {...commonTabProps} />;

    case 'goals':
      return (
        <LifeLockGoals
          {...commonTabProps}
          onCreateGoal={onCreateGoal}
        />
      );

    case 'journal':
      return (
        <LifeLockJournal
          {...commonTabProps}
          onCreateJournalEntry={onCreateJournalEntry}
        />
      );

    case 'settings':
      return <LifeLockSettings {...commonTabProps} />;

    case 'mindfulness':
      return <LifeLockMindfulness {...commonTabProps} />;

    case 'achievements':
      return <LifeLockAchievements {...commonTabProps} />;

    case 'data-visualization':
      return <LifeLockDataVisualization {...commonTabProps} />;

    default:
      return (
        <LifeLockDashboard
          {...commonTabProps}
          onCreateTask={onCreateTask}
          onCreateHabit={onCreateHabit}
          onCreateGoal={onCreateGoal}
        />
      );
  }
};

export default LifeLockTabRenderer;