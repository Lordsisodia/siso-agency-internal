import React from 'react';

export const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="min-h-screen bg-gray-900 text-white">{children}</div>
);

export const WelcomeHeader: React.FC = () => null;
export const StatsRow: React.FC = () => null;
export const MainProjectCard: React.FC = () => null;
export const EnhancedActivityFeed: React.FC = () => null;
export const HelpSupportCard: React.FC = () => null;
export const ProjectProgressCards: React.FC = () => null;
