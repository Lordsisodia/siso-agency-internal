import React from 'react';

export const ProfileHeader: React.FC<{ name?: string; title?: string }> = ({ name = 'Profile', title }) => (
  <div className="mb-4">
    <h1 className="text-2xl font-bold">{name}</h1>
    {title && <p className="text-sm text-muted-foreground">{title}</p>}
  </div>
);

export default ProfileHeader;
