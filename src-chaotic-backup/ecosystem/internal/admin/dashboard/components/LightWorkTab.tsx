import React from 'react';
import { TabProps } from './DayTabContainer';
import { LightFocusWorkSection } from '../../tasks/components/LightFocusWorkSection-v2';

export const LightWorkTab: React.FC<TabProps> = ({ selectedDate }) => {
  return <LightFocusWorkSection selectedDate={selectedDate} />;
};