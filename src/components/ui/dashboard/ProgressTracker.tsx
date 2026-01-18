import React, { useEffect, useState } from 'react';
import { LucideIcon, CheckCircle, Circle, Clock, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ProgressStep {
  id: string;
  title: string;
  description?: string;
  status: 'completed' | 'current' | 'pending' | 'error';
  icon?: LucideIcon;
  date?: string;
}

export interface ProgressTrackerProps {
  steps: ProgressStep[];
  variant?: 'vertical' | 'horizontal' | 'circular';
  showLabels?: boolean;
  showDates?: boolean;
  animated?: boolean;
  isLoading?: boolean;
  className?: string;
  onStepClick?: (step: ProgressStep) => void;
}

const ProgressTracker: React.FC<ProgressTrackerProps> = ({
  steps,
  variant = 'vertical',
  showLabels = true,
  showDates = false,
  animated = true,
  isLoading = false,
  className,
  onStepClick
}) => {
  const [animatedProgress, setAnimatedProgress] = useState(0);

  const completedSteps = steps.filter(step => step.status === 'completed').length;
  const totalSteps = steps.length;
  const progressPercentage = (completedSteps / totalSteps) * 100;

  useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => {
        setAnimatedProgress(progressPercentage);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setAnimatedProgress(progressPercentage);
    }
  }, [progressPercentage, animated]);

  const getStepIcon = (step: ProgressStep) => {
    if (step.icon) return step.icon;
    
    switch (step.status) {
      case 'completed':
        return CheckCircle;
      case 'current':
        return Clock;
      case 'error':
        return AlertCircle;
      default:
        return Circle;
    }
  };

  const getStepStyles = (step: ProgressStep) => {
    const baseStyles = 'transition-all duration-300';
    
    switch (step.status) {
      case 'completed':
        return `${baseStyles} text-green-400 bg-green-900/20 border-green-600`;
      case 'current':
        return `${baseStyles} text-orange-400 bg-orange-900/20 border-orange-600`;
      case 'error':
        return `${baseStyles} text-red-400 bg-red-900/20 border-red-600`;
      default:
        return `${baseStyles} text-gray-400 bg-gray-800 border-gray-700`;
    }
  };

  if (isLoading) {
    return (
      <div className={cn('space-y-4 animate-pulse', className)}>
        {[...Array(3)].map((_, index) => (
          <div key={index} className="flex items-center space-x-4">
            <div className="h-8 w-8 bg-gray-700 rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-700 rounded w-32"></div>
              <div className="h-3 bg-gray-700 rounded w-48"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'circular') {
    const radius = 45;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (animatedProgress / 100) * circumference;

    return (
      <div className={cn('flex flex-col items-center space-y-4', className)}>
        <div className="relative">
          <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
            {/* Background circle */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              className="text-gray-700"
            />
            {/* Progress circle */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="text-orange-500 transition-all duration-1000 ease-out"
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">
                {Math.round(animatedProgress)}%
              </div>
              <div className="text-xs text-gray-400">
                {completedSteps}/{totalSteps}
              </div>
            </div>
          </div>
        </div>
        {showLabels && (
          <div className="text-center">
            <div className="text-sm font-medium text-white">Progress</div>
            <div className="text-xs text-gray-400">
              {completedSteps} of {totalSteps} completed
            </div>
          </div>
        )}
      </div>
    );
  }

  if (variant === 'horizontal') {
    return (
      <div className={cn('space-y-4', className)}>
        {/* Progress bar */}
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div
            className="bg-orange-500 h-2 rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${animatedProgress}%` }}
          />
        </div>
        
        {/* Steps */}
        <div className="flex justify-between">
          {steps.map((step, index) => {
            const StepIcon = getStepIcon(step);
            return (
              <div
                key={step.id}
                className={cn(
                  'flex flex-col items-center space-y-2 cursor-pointer',
                  onStepClick && 'hover:scale-105'
                )}
                onClick={() => onStepClick?.(step)}
              >
                <div className={cn(
                  'w-8 h-8 rounded-full border-2 flex items-center justify-center',
                  getStepStyles(step)
                )}>
                  <StepIcon className="w-4 h-4" />
                </div>
                {showLabels && (
                  <div className="text-center">
                    <div className="text-xs font-medium text-white">
                      {step.title}
                    </div>
                    {showDates && step.date && (
                      <div className="text-xs text-gray-400">
                        {step.date}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Vertical variant (default)
  return (
    <div className={cn('space-y-4', className)}>
      {/* Progress header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Progress</h3>
        <div className="text-sm text-gray-400">
          {completedSteps}/{totalSteps} completed
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-700 rounded-full h-2">
        <div
          className="bg-orange-500 h-2 rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${animatedProgress}%` }}
        />
      </div>

      {/* Steps */}
      <div className="space-y-4">
        {steps.map((step, index) => {
          const StepIcon = getStepIcon(step);
          const isLast = index === steps.length - 1;

          return (
            <div key={step.id} className="relative">
              <div
                className={cn(
                  'flex items-start space-x-4 cursor-pointer group',
                  onStepClick && 'hover:bg-gray-800/50 p-2 rounded-lg -m-2'
                )}
                onClick={() => onStepClick?.(step)}
              >
                {/* Step icon */}
                <div className={cn(
                  'w-8 h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0',
                  getStepStyles(step)
                )}>
                  <StepIcon className="w-4 h-4" />
                </div>

                {/* Step content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-white">
                      {step.title}
                    </h4>
                    {showDates && step.date && (
                      <span className="text-xs text-gray-400">
                        {step.date}
                      </span>
                    )}
                  </div>
                  {step.description && (
                    <p className="text-sm text-gray-400 mt-1">
                      {step.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Connecting line */}
              {!isLast && (
                <div className="absolute left-4 top-8 w-px h-6 bg-gray-700" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProgressTracker; 