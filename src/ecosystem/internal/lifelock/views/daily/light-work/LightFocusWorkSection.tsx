/**
 * 🚀 Light Focus Work Section
 *
 * Simple wrapper that renders the pixel-perfect LightWorkTaskList
 * All functionality is in the component itself
 */

import React from 'react';
import LightWorkTaskList from './components/LightWorkTaskList';

interface LightFocusWorkSectionProps {
  selectedDate: Date;
  onPreviousDate?: () => void;
  onNextDate?: () => void;
}

export const LightFocusWorkSection: React.FC<LightFocusWorkSectionProps> = ({
  selectedDate,
  onPreviousDate,
  onNextDate
}) => {
  return (
    <LightWorkTaskList
      selectedDate={selectedDate}
    />
  );
};
