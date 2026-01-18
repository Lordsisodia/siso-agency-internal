import React from 'react';

export const ClientDashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="min-h-screen bg-gray-50 text-gray-900">{children}</div>
);

export default ClientDashboardLayout;
