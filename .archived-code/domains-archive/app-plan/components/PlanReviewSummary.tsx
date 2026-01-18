import React from 'react';

export const PlanReviewSummary: React.FC<{ summary?: string }> = ({ summary }) => (
  <div className="p-4 border rounded bg-muted text-muted-foreground text-sm">
    {summary || 'Plan review summary placeholder'}
  </div>
);

export default PlanReviewSummary;
