import { useState, useEffect } from 'react';

export interface DashboardStats {
  totalEarnings: number;
  monthlyEarnings: number;
  activeReferrals: number;
  conversionRate: number;
  nextTierProgress: number;
  completedReferrals: number;
}

export interface UsePartnerStatsReturn {
  stats: DashboardStats;
  isLoading: boolean;
  error: string | null;
  refreshStats: () => Promise<void>;
}

const usePartnerStats = (): UsePartnerStatsReturn => {
  const [stats, setStats] = useState<DashboardStats>({
    totalEarnings: 8750,
    monthlyEarnings: 1247,
    activeReferrals: 18,
    conversionRate: 12.5,
    nextTierProgress: 72,
    completedReferrals: 8
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // In a real implementation, this would fetch from an API
      // For now, we'll simulate API response
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate some randomness in stats
      const randomVariation = () => Math.random() * 0.1 - 0.05; // ±5% variation
      
      setStats(prevStats => ({
        totalEarnings: Math.round(prevStats.totalEarnings * (1 + randomVariation())),
        monthlyEarnings: Math.round(prevStats.monthlyEarnings * (1 + randomVariation())),
        activeReferrals: Math.max(1, Math.round(prevStats.activeReferrals * (1 + randomVariation()))),
        conversionRate: Math.max(1, Math.round((prevStats.conversionRate * (1 + randomVariation())) * 10) / 10),
        nextTierProgress: Math.min(100, Math.max(0, Math.round(prevStats.nextTierProgress * (1 + randomVariation())))),
        completedReferrals: Math.max(0, Math.round(prevStats.completedReferrals * (1 + randomVariation())))
      }));
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch stats');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshStats = async () => {
    await fetchStats();
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return {
    stats,
    isLoading,
    error,
    refreshStats
  };
};

export default usePartnerStats;