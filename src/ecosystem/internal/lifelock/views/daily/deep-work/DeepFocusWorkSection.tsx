/**
 * 🚀 Deep Focus Work Section
 *
 * Simple wrapper that renders the pixel-perfect DeepWorkTaskList
 * All functionality is in the component itself
 */

import React from 'react';
import { CleanDateNav } from '../_shared/components/CleanDateNav';
import DeepWorkTaskList from './components/DeepWorkTaskList';

interface DeepFocusWorkSectionProps {
  selectedDate: Date;
  onPreviousDate?: () => void;
  onNextDate?: () => void;
}

export const DeepFocusWorkSection: React.FC<DeepFocusWorkSectionProps> = ({
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
        activeTab="work"
      />

      <DeepWorkTaskList
        selectedDate={selectedDate}
      />
    </div>
  );
};
