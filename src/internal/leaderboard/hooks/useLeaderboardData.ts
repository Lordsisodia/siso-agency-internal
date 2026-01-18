/**
 * useLeaderboardData Hook
 *
 * Stub for leaderboard data fetching
 */

import { useState, useEffect } from 'react';

export const useLeaderboardData = () => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // TODO: Implement actual leaderboard data fetching
    setTimeout(() => {
      setData([
        { id: '1', name: 'User 1', xp: 1000, rank: 1 },
        { id: '2', name: 'User 2', xp: 900, rank: 2 },
        { id: '3', name: 'User 3', xp: 800, rank: 3 },
      ]);
      setIsLoading(false);
    }, 100);
  }, []);

  return { data, isLoading };
};
