import React from 'react';

export const ProfileSkeleton: React.FC = () => (
  <div className="animate-pulse space-y-2">
    <div className="h-6 bg-muted rounded"></div>
    <div className="h-4 bg-muted rounded"></div>
  </div>
);

export default ProfileSkeleton;
