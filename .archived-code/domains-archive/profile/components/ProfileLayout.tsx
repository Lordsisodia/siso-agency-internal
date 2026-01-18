import React from 'react';

export const ProfileLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="max-w-6xl mx-auto px-4 py-8">{children}</div>
);

export default ProfileLayout;
