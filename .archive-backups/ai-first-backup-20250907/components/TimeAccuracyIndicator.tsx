/**
 * 📊 Time Accuracy Indicator Component
 * 
 * Shows visual feedback on AI time estimation accuracy
 */

import React from 'react';

interface TimeAccuracyIndicatorProps {
  actualTime?: number;
  aiEstimate?: {
    min: number;
    max: number;
    most_likely: number;
    confidence: number;
  };
  accuracy?: number; // 0-1 score
  className?: string;
}

export function TimeAccuracyIndicator({ 
  actualTime, 
  aiEstimate, 
  accuracy,
  className = "" 
}: TimeAccuracyIndicatorProps) {
  
  if (!actualTime || !aiEstimate) {
    return null;
  }

  const accuracyPercent = Math.round((accuracy || 0) * 100);
  const deviation = actualTime - aiEstimate.most_likely;
  const deviationPercent = Math.round((deviation / aiEstimate.most_likely) * 100);
  
  // Determine color based on accuracy
  const getAccuracyColor = (acc: number) => {
    if (acc >= 80) return 'text-green-400';
    if (acc >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getAccuracyIcon = (acc: number) => {
    if (acc >= 80) return '🎯';
    if (acc >= 60) return '📊';
    return '📈';
  };

  const isWithinRange = actualTime >= aiEstimate.min && actualTime <= aiEstimate.max;

  return (
    <div className={`flex items-center gap-2 text-xs ${className}`}>
      <div 
        className={`flex items-center gap-1 ${getAccuracyColor(accuracyPercent)}`}
        title={`AI Accuracy: ${accuracyPercent}% - Predicted: ${aiEstimate.most_likely}min, Actual: ${actualTime}min`}
      >
        <span>{getAccuracyIcon(accuracyPercent)}</span>
        <span>{accuracyPercent}%</span>
      </div>
      
      {!isWithinRange && (
        <div 
          className="text-orange-400"
          title={`Outside predicted range (${aiEstimate.min}-${aiEstimate.max}min)`}
        >
          ⚠️
        </div>
      )}
      
      {Math.abs(deviationPercent) > 50 && (
        <div 
          className="text-red-300 text-xs"
          title={`Large deviation: ${deviationPercent > 0 ? '+' : ''}${deviationPercent}%`}
        >
          {deviationPercent > 0 ? '📈' : '📉'}
        </div>
      )}
      
      <div 
        className="text-gray-400"
        title={`Actual: ${actualTime}min vs AI: ${aiEstimate.most_likely}min`}
      >
        {actualTime}m
      </div>
    </div>
  );
}

export default TimeAccuracyIndicator;