// Partnership Statistics Hook
// Fetches and caches real-time statistics for landing page and dashboard

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { getPartnershipStats, getLeaderboardData } from '@/api/partnership';
import type { PartnershipStats, LeaderboardEntry } from '@/types/partnership';

interface UsePartnerStatsReturn {
  stats: PartnershipStats | null;
  leaderboard: LeaderboardEntry[];
  isLoading: boolean;
  isLeaderboardLoading: boolean;
  error: string | null;
  refreshStats: () => Promise<void>;
  refreshLeaderboard: (period?: 'monthly' | 'quarterly' | 'yearly') => Promise<void>;
}

export function usePartnerStats(): UsePartnerStatsReturn {
  const [stats, setStats] = useState<PartnershipStats | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLeaderboardLoading, setIsLeaderboardLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshStats = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await getPartnershipStats();

      if (response.success && response.data) {
        setStats(response.data);
      } else {
        throw new Error(response.error || 'Failed to fetch statistics');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load statistics';
      setError(errorMessage);
      console.error('Error fetching partnership stats:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshLeaderboard = async (
    period: 'monthly' | 'quarterly' | 'yearly' = 'monthly'
  ): Promise<void> => {
    setIsLeaderboardLoading(true);

    try {
      const response = await getLeaderboardData(period, 10);

      if (response.success && response.data) {
        setLeaderboard(response.data);
      } else {
        throw new Error(response.error || 'Failed to fetch leaderboard');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load leaderboard';
      console.error('Error fetching leaderboard:', err);
      // Don't show toast for leaderboard errors to avoid spam
    } finally {
      setIsLeaderboardLoading(false);
    }
  };

  // Load initial data
  useEffect(() => {
    refreshStats();
    refreshLeaderboard();
  }, []);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      refreshStats();
      refreshLeaderboard();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, []);

  return {
    stats,
    leaderboard,
    isLoading,
    isLeaderboardLoading,
    error,
    refreshStats,
    refreshLeaderboard
  };
}

// Hook for individual partner dashboard
interface UsePartnerDashboardReturn {
  partnerStats: any; // TODO: Define proper type
  commissions: any[]; // TODO: Define proper type
  leads: any[]; // TODO: Define proper type
  isLoading: boolean;
  error: string | null;
}

export function usePartnerDashboard(partnerId: string): UsePartnerDashboardReturn {
  const [partnerStats, setPartnerStats] = useState(null);
  const [commissions, setCommissions] = useState([]);
  const [leads, setLeads] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // TODO: Implement partner dashboard data fetching
  // This would use getPartnerStats, getPartnerCommissions, getPartnerLeads

  useEffect(() => {
    // Placeholder for partner dashboard data loading
    setIsLoading(false);
  }, [partnerId]);

  return {
    partnerStats,
    commissions,
    leads,
    isLoading,
    error
  };
}