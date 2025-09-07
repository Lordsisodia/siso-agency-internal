import React from 'react';
import { TabProps } from './DayTabContainer';
import { MorningRoutineSection } from '../../tasks/components/MorningRoutineSection';

export const MorningRoutineTab: React.FC<TabProps> = ({ selectedDate }) => {
  return <MorningRoutineSection selectedDate={selectedDate} />;
};