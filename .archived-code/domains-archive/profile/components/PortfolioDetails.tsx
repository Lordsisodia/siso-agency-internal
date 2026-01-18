import React from 'react';

export const PortfolioDetails: React.FC<{ description?: string }> = ({ description }) => (
  <div className="p-4 border rounded bg-muted text-muted-foreground text-sm">
    {description || 'Portfolio details placeholder'}
  </div>
);

export default PortfolioDetails;
