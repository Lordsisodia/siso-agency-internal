
import React from 'react';
import { Progress } from '@/components/ui/progress';

interface ImportProgressProps {
  isProcessing: boolean;
  importProgress: number;
}

export const ImportProgress = ({ isProcessing, importProgress }: ImportProgressProps) => {
  if (!isProcessing) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span>Importing leads...</span>
        <span>{Math.round(importProgress)}%</span>
      </div>
      <Progress value={importProgress} className="h-2" />
    </div>
  );
};
