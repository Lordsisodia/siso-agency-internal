import React from 'react';

export const XPStoreBalance: React.FC<{ balance?: number }> = ({ balance = 0 }) => (
  <div className="p-4 border rounded bg-muted text-muted-foreground text-sm">
    XP Balance: {balance}
  </div>
);

export default XPStoreBalance;
