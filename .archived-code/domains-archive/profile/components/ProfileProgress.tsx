import React from 'react';

export const ProfileProgress: React.FC<{ progress?: number }> = ({ progress = 0 }) => (
  <div className="p-4 border rounded bg-muted text-muted-foreground text-sm">
    Profile progress: {progress}%
  </div>
);

export default ProfileProgress;
