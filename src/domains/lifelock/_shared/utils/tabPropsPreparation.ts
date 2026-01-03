import type { LifeLockData } from '../../../types/shared/lifelock';

export interface CommonTabProps {
  currentDate: Date;
  lifeLockData: LifeLockData;
  refactoredLifeLockData: any;
  onDateChange: (date: Date) => void;
}

export interface TabPropsWithActions extends CommonTabProps {
  onCreateTask?: () => void;
  onCreateHabit?: () => void;
  onCreateGoal?: () => void;
  onCreateJournalEntry?: () => void;
}

export const prepareTabProps = (
  currentDate: Date,
  lifeLockData: LifeLockData,
  refactoredLifeLockData: any,
  onDateChange: (date: Date) => void
): CommonTabProps => {
  return {
    currentDate,
    lifeLockData,
    refactoredLifeLockData,
    onDateChange,
  };
};

export const prepareTabPropsWithActions = (
  commonProps: CommonTabProps,
  actions: {
    onCreateTask?: () => void;
    onCreateHabit?: () => void;
    onCreateGoal?: () => void;
    onCreateJournalEntry?: () => void;
  }
): TabPropsWithActions => {
  return {
    ...commonProps,
    ...actions,
  };
};
