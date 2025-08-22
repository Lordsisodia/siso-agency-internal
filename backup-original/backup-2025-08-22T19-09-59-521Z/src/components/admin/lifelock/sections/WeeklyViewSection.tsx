import React from 'react';
import { StatisticalWeekView } from '../ui/StatisticalWeekView';

interface WeeklyViewSectionProps {
  weekCards: any[];
  weekStart: Date;
  onCardClick: (card: any) => void;
  onNavigateWeek: (direction: 'prev' | 'next') => void;
}

export const WeeklyViewSection: React.FC<WeeklyViewSectionProps> = ({
  weekCards,
  weekStart,
  onCardClick,
  onNavigateWeek
}) => {
  return (
    <StatisticalWeekView
      weekCards={weekCards}
      weekStart={weekStart}
      onCardClick={onCardClick}
      onNavigateWeek={onNavigateWeek}
    />
  );
};