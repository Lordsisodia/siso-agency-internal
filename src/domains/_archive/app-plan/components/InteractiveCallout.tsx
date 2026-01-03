import React from 'react';

type Props = { title?: string; body?: string };

export const InteractiveCallout: React.FC<Props> = ({ title = 'Interactive Callout', body }) => (
  <div className="p-4 border rounded bg-muted text-muted-foreground text-sm">
    <div className="font-semibold">{title}</div>
    {body && <div>{body}</div>}
  </div>
);

export default InteractiveCallout;
