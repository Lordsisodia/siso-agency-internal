import React from 'react';

export const EnhancedNextSteps: React.FC<{ steps?: string[] }> = ({ steps }) => (
  <div className="p-4 border rounded bg-muted text-muted-foreground text-sm">
    <div className="font-semibold mb-2">Next Steps</div>
    <ul className="list-disc pl-4 space-y-1">
      {(steps || ['Follow up', 'Implement', 'Review']).map((step, idx) => (
        <li key={idx}>{step}</li>
      ))}
    </ul>
  </div>
);

export default EnhancedNextSteps;
