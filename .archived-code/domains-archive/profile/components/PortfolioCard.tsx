import React from 'react';

type Props = {
  title?: string;
  description?: string;
};

export const PortfolioCard: React.FC<Props> = ({ title = 'Portfolio Item', description = '' }) => (
  <div className="rounded-lg border p-4 bg-card text-card-foreground">
    <h3 className="font-semibold mb-2">{title}</h3>
    <p className="text-sm text-muted-foreground">{description}</p>
  </div>
);

export default PortfolioCard;
