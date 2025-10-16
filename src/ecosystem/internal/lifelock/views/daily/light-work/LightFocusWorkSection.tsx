/**
 * 🚀 Light Focus Work Section
 *
 * Simple wrapper that renders the pixel-perfect LightWorkTaskList
 * All functionality is in the component itself
 */

import React from 'react';
import { CleanDateNav } from '../_shared/components/CleanDateNav';
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
    <div className="space-y-6">
      <CleanDateNav
        selectedDate={selectedDate}
        onPreviousDate={onPreviousDate}
        onNextDate={onNextDate}
        activeTab="light-work"
      />

      <LightWorkTaskList
        selectedDate={selectedDate}
      />
    </div>
  );
};
