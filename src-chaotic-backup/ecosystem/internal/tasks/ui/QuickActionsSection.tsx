import React from 'react';
import { SimpleFeedbackButton } from '@/ecosystem/internal/feedback/SimpleFeedbackButton';

interface QuickActionsSectionProps {
  handleQuickAdd?: () => void;
  handleOrganizeTasks?: () => void;
  isAnalyzingTasks?: boolean;
  todayCard?: any;
}

export const QuickActionsSection: React.FC<QuickActionsSectionProps> = () => {
  return (
    <section className="flex justify-center pt-6 sm:pt-8">
      <SimpleFeedbackButton />
    </section>
  );
};