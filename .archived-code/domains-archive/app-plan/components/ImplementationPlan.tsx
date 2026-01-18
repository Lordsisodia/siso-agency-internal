import React from 'react';

type Props = { title?: string; steps?: string[] };

export const ImplementationPlan: React.FC<Props> = ({ title = 'Implementation Plan', steps }) => (
  <div className="p-4 border rounded bg-muted text-muted-foreground text-sm">
    <div className="font-semibold mb-2">{title}</div>
    <ul className="list-disc pl-4 space-y-1">
      {(steps || ['Define scope', 'Assign owners', 'Timeline']).map((s, i) => <li key={i}>{s}</li>)}
    </ul>
  </div>
);

export default ImplementationPlan;
