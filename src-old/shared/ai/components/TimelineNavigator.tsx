import React from 'react';
import { Button } from '@/shared/ui/button';
import { ArrowLeft, ArrowRight, RotateCcw } from 'lucide-react';

interface TimelineNavigatorProps {
  onPrevious?: () => void;
  onNext?: () => void;
  onReset?: () => void;
  canGoPrevious?: boolean;
  canGoNext?: boolean;
  currentStep?: number;
  totalSteps?: number;
}

export const TimelineNavigator: React.FC<TimelineNavigatorProps> = ({
  onPrevious,
  onNext,
  onReset,
  canGoPrevious = false,
  canGoNext = false,
  currentStep = 0,
  totalSteps = 0,
}) => {
  return (
    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
      <Button
        variant="outline"
        size="sm"
        onClick={onPrevious}
        disabled={!canGoPrevious}
      >
        <ArrowLeft className="h-4 w-4" />
      </Button>
      
      <span className="text-sm text-gray-600 px-2">
        {totalSteps > 0 ? `${currentStep} / ${totalSteps}` : 'No timeline'}
      </span>
      
      <Button
        variant="outline"
        size="sm"
        onClick={onNext}
        disabled={!canGoNext}
      >
        <ArrowRight className="h-4 w-4" />
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={onReset}
        disabled={totalSteps === 0}
      >
        <RotateCcw className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default TimelineNavigator;