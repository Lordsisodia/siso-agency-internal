import React from 'react';

export const WelcomeMessage: React.FC<{ title?: string; subtitle?: string }> = ({ title = 'Welcome', subtitle }) => (
  <div className="p-4 rounded bg-muted text-muted-foreground text-sm">
    <div className="font-semibold">{title}</div>
    {subtitle && <div>{subtitle}</div>}
  </div>
);

export default WelcomeMessage;
