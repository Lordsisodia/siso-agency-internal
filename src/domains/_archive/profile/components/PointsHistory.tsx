import React from 'react';

export const PointsHistory: React.FC<{ points?: number }> = ({ points = 0 }) => (
  <div className="p-4 border rounded bg-muted text-muted-foreground text-sm">
    Points history placeholder (total: {points}).
  </div>
);

export default PointsHistory;
