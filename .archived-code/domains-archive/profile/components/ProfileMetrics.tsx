import React from 'react';

export const ProfileMetrics: React.FC<{ points?: number }> = ({ points = 0 }) => (
  <div className="p-4 border rounded bg-muted text-muted-foreground text-sm">
    Profile metrics placeholder (points: {points}).
  </div>
);

export default ProfileMetrics;
