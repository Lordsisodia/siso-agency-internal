import React from 'react';

type Props = { title?: string; description?: string };

export const FeatureSection: React.FC<Props> = ({ title = 'Feature Section', description }) => (
  <div className="p-4 border rounded bg-muted text-muted-foreground text-sm">
    <div className="font-semibold">{title}</div>
    {description && <div>{description}</div>}
  </div>
);

export default FeatureSection;
