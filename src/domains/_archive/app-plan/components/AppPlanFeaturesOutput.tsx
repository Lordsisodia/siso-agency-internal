import React from 'react';

export const AppPlanFeaturesOutput: React.FC<{ features?: string[] }> = ({ features }) => (
  <div className="p-4 border rounded bg-muted text-muted-foreground text-sm">
    <div className="font-semibold mb-2">Feature Output</div>
    <ul className="list-disc pl-4 space-y-1">
      {(features || ['Feature A', 'Feature B']).map((f, i) => <li key={i}>{f}</li>)}
    </ul>
  </div>
);

export default AppPlanFeaturesOutput;
