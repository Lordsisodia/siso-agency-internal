import React from 'react';
import { UnifiedWorkSection } from '@/refactored/components/UnifiedWorkSection';

interface DeepFocusWorkSectionProps {
  selectedDate: Date;
}

export const DeepFocusWorkSection: React.FC<DeepFocusWorkSectionProps> = ({
  selectedDate
}) => {
  return (
    <UnifiedWorkSection 
      selectedDate={selectedDate} 
      workType="DEEP" 
    />
  );
};