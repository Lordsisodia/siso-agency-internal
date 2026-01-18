import React from 'react';

type Props = {
  title?: string;
  subtitle?: string;
};

export const WelcomeLoader: React.FC<Props> = ({ title = 'Loading', subtitle }) => (
  <div className="p-6 border rounded bg-muted text-muted-foreground">
    <div className="font-semibold">{title}</div>
    {subtitle && <div className="text-sm">{subtitle}</div>}
  </div>
);

export default WelcomeLoader;
