/**
 * Diet Section Page
 *
 * AI-powered nutrition tracking with photo analysis
 */

import { PhotoNutritionTracker } from '@/domains/lifelock/1-daily/5-stats/features/wellness/features/photo-nutrition/components';

interface DietSectionProps {
  selectedDate?: Date;
}

export const DietSection = ({ selectedDate = new Date() }: DietSectionProps) => {
  return <PhotoNutritionTracker selectedDate={selectedDate} />;
};

export default DietSection;
