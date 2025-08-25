import React from 'react';
import { TabProps } from './DayTabContainer';
import { DeepFocusWorkSection } from '../../tasks/components/DeepFocusWorkSection';

export const DeepFocusTab: React.FC<TabProps> = ({ selectedDate }) => {
  return <DeepFocusWorkSection selectedDate={selectedDate} />;
};