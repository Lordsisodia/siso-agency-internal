import React from 'react';
import { UnifiedWorkSection } from '@/refactored/components/UnifiedWorkSection';

interface LightFocusWorkSectionProps {
  selectedDate: Date;
}

export const LightFocusWorkSection: React.FC<LightFocusWorkSectionProps> = ({
  selectedDate
}) => {
  return (
    <UnifiedWorkSection 
      selectedDate={selectedDate} 
      workType="LIGHT" 
    />
  );
};