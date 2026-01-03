import React from 'react';

export const PortfolioHero: React.FC<{ title?: string; subtitle?: string }> = ({ title = 'Portfolio', subtitle }) => (
  <div className="p-6 rounded-lg bg-gradient-to-r from-slate-800 to-slate-700 text-white">
    <h1 className="text-3xl font-bold">{title}</h1>
    {subtitle && <p className="text-sm opacity-80 mt-2">{subtitle}</p>}
  </div>
);

export default PortfolioHero;
