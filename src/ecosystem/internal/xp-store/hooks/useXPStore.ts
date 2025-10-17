/**
 * XP Store Hook - Safe React Integration
 * 
 * React hook for XP spending functionality.
 * Safe to develop and test without affecting existing gamification.
 */

import { useState, useEffect, useCallback } from 'react';
import { 
  xpStoreService, 
  XPStoreBalance, 
  RewardItem, 
  PurchaseResult,
  XPStoreError
} from '@/services/xpStoreService';
import { XPPsychologyUtils } from '@/shared/utils/xpPsychologyUtils';
import { supabaseAnon } from '@/shared/lib/supabase-clerk';

const userIdCache = new Map<string, string | null>();
const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

interface XPStoreState {
  balance: XPStoreBalance | null;
  rewards: RewardItem[];
  purchaseHistory: any[];
  analytics: any;
  loading: boolean;
  error: XPStoreError | null;
}

interface XPStoreActions {
  purchaseReward: (rewardId: string, useLoan?: boolean, notes?: string) => Promise<PurchaseResult>;
  refreshBalance: () => Promise<void>;
  refreshRewards: () => Promise<void>;
  getNearMissNotifications: () => any[];
  getSpendingPower: () => any;
  clearError: () => void;
}

/**
 * XP Store Hook
 * Manages XP spending economy state and actions
 */
export function useXPStore(userId: string): XPStoreState & XPStoreActions {
  const [resolvedUserId, setResolvedUserId] = useState<string | null>(() => (uuidRegex.test(userId) ? userId : null));
  const [resolvingUserId, setResolvingUserId] = useState<boolean>(() => {
    if (!userId) return false;
    return !uuidRegex.test(userId);
  });

  const [state, setState] = useState<XPStoreState>({
    balance: null,
    rewards: [],
    purchaseHistory: [],
    analytics: null,
    loading: false,
    error: null
  });

  useEffect(() => {
    let isMounted = true;

    if (!userId) {
      setResolvedUserId(null);
      setResolvingUserId(false);
      return () => {
        isMounted = false;
      };
    }

    if (uuidRegex.test(userId)) {
      setResolvedUserId(userId);
      setResolvingUserId(false);
      return () => {
        isMounted = false;
      };
    }

    const cachedId = userIdCache.get(userId);
    if (cachedId !== undefined) {
      setResolvedUserId(cachedId);
      setResolvingUserId(false);
      return () => {
        isMounted = false;
      };
    }

    setResolvingUserId(true);

    const resolveUserId = async () => {
      try {
        const { data, error } = await supabaseAnon
          .from('users')
          .select('id')
          .eq('supabase_id', userId)
          .maybeSingle();

        let resolvedId = data?.id ?? null;

        if (!resolvedId) {
          const { data: legacyData, error: legacyError } = await supabaseAnon
            .from('users')
            .select('id')
            .eq('supabase_id', `prisma-user-${userId}`)
            .maybeSingle();

          if (legacyError) {
            console.warn('Legacy user mapping lookup failed:', legacyError);
          }

          resolvedId = legacyData?.id ?? null;
        }

        userIdCache.set(userId, resolvedId);

        if (isMounted) {
          setResolvedUserId(resolvedId);
        }
      } catch (error) {
        console.error('Error mapping Clerk user to Supabase ID:', error);
        userIdCache.set(userId, null);
        if (isMounted) {
          setResolvedUserId(null);
        }
      } finally {
        if (isMounted) {
          setResolvingUserId(false);
        }
      }
    };

    resolveUserId();

    return () => {
      isMounted = false;
    };
  }, [userId]);

  /**
   * Refresh XP balance
   */
  const refreshBalance = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const effectiveUserId = resolvedUserId ?? '';
      const balance = await xpStoreService.getXPStoreBalance(effectiveUserId);
      const history = resolvedUserId
        ? await xpStoreService.getPurchaseHistory(resolvedUserId)
        : [];
      const analytics = resolvedUserId
        ? await xpStoreService.getSpendingAnalytics(resolvedUserId)
        : null;

      setState(prev => ({
        ...prev,
        balance,
        purchaseHistory: history,
        analytics,
        loading: false
      }));
      
    } catch (error) {
      console.error('Error refreshing balance:', error);
      setState(prev => ({
        ...prev,
        error: {
          type: 'unknown',
          message: 'Failed to load balance',
          details: error instanceof Error ? error.message : String(error)
        },
        loading: false
      }));
    }
  }, [resolvedUserId]);

  /**
   * Refresh available rewards
   */
  const refreshRewards = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true }));

      const rewards = await xpStoreService.getAvailableRewards(resolvedUserId ?? '');

      setState(prev => ({
        ...prev,
        rewards,
        loading: false
      }));
      
    } catch (error) {
      console.error('Error refreshing rewards:', error);
      setState(prev => ({
        ...prev,
        error: {
          type: 'unknown',
          message: 'Failed to load rewards',
          details: error instanceof Error ? error.message : String(error)
        },
        loading: false
      }));
    }
  }, [resolvedUserId]);

  /**
   * Purchase a reward
   */
  const purchaseReward = useCallback(async (
    rewardId: string,
    useLoan: boolean = false,
    notes?: string
  ): Promise<PurchaseResult> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      if (!resolvedUserId) {
        setState(prev => ({ ...prev, loading: false }));
        return {
          success: false,
          message: 'We need to sync your XP profile before purchases are available.'
        };
      }

      const result = await xpStoreService.purchaseReward({
        userId: resolvedUserId,
        rewardId,
        useLoan,
        notes
      });
      
      // Refresh data if purchase was successful
      if (result.success) {
        await refreshBalance();
        await refreshRewards();
      }
      
      setState(prev => ({ ...prev, loading: false }));
      
      return result;
      
    } catch (error) {
      console.error('Error purchasing reward:', error);
      setState(prev => ({
        ...prev,
        error: {
          type: 'unknown',
          message: 'Purchase failed',
          details: error instanceof Error ? error.message : String(error)
        },
        loading: false
      }));
      
      return {
        success: false,
        message: 'Purchase failed. Please try again.'
      };
    }
  }, [resolvedUserId, refreshBalance, refreshRewards]);

  /**
   * Get near-miss notifications for psychology
   */
  const getNearMissNotifications = useCallback(() => {
    if (!state.balance || !state.rewards) return [];
    
    const rewardData = state.rewards.map(r => ({
      name: r.name,
      emoji: r.iconEmoji,
      price: r.currentPrice
    }));
    
    return XPPsychologyUtils.generateNearMissNotifications(
      state.balance.canSpend,
      rewardData,
      50 // Average XP per task
    );
  }, [state.balance, state.rewards]);

  /**
   * Get spending power for motivation
   */
  const getSpendingPower = useCallback(() => {
    if (!state.balance || !state.rewards) {
      return { canAfford: [], almostAfford: [], dreamRewards: [] };
    }
    
    const canAfford = state.rewards
      .filter(r => r.currentPrice <= state.balance!.canSpend)
      .map(r => ({ name: r.name, emoji: r.iconEmoji, price: r.currentPrice }));
    
    const almostAfford = state.rewards
      .filter(r => {
        const needed = r.currentPrice - state.balance!.canSpend;
        return needed > 0 && needed <= 150;
      })
      .map(r => ({
        name: r.name,
        emoji: r.iconEmoji,
        price: r.currentPrice,
        xpNeeded: r.currentPrice - state.balance!.canSpend
      }));
    
    const dreamRewards = state.rewards
      .filter(r => r.currentPrice > state.balance!.canSpend + 150)
      .slice(0, 3)
      .map(r => ({
        name: r.name,
        emoji: r.iconEmoji,
        price: r.currentPrice,
        daysToAfford: Math.ceil((r.currentPrice - state.balance!.canSpend) / 200)
      }));
    
    return { canAfford, almostAfford, dreamRewards };
  }, [state.balance, state.rewards]);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  /**
   * Initial load effect
   */
  useEffect(() => {
    if (resolvingUserId) {
      setState(prev => ({ ...prev, loading: true }));
      return;
    }

    refreshBalance();
    refreshRewards();
  }, [resolvingUserId, resolvedUserId, refreshBalance, refreshRewards]);

  return {
    ...state,
    purchaseReward,
    refreshBalance,
    refreshRewards,
    getNearMissNotifications,
    getSpendingPower,
    clearError
  };
}

/**
 * XP Psychology Hook - For psychological features
 * Separate hook for psychology calculations and effects
 */
export function useXPPsychology(userId: string) {
  
  const [psychologyState, setPsychologyState] = useState({
    variableBonus: null as any,
    nearMissNotifications: [] as any[],
    celebrationQueue: [] as any[],
    lifeBonus: null as any
  });

  /**
   * Calculate variable bonus for task completion
   */
  const calculateVariableBonus = useCallback((
    recentTaskCount: number,
    consecutiveDays: number,
    hasHealthFocus: boolean = false
  ) => {
    const bonus = XPPsychologyUtils.calculateVariableBonus(
      recentTaskCount,
      consecutiveDays,
      hasHealthFocus
    );
    
    if (bonus.hasBonus) {
      setPsychologyState(prev => ({ ...prev, variableBonus: bonus }));
      
      // Clear bonus after showing
      setTimeout(() => {
        setPsychologyState(prev => ({ ...prev, variableBonus: null }));
      }, 5000);
    }
    
    return bonus;
  }, []);

  /**
   * Calculate life bonus from health data
   */
  const calculateLifeBonus = useCallback((healthData: {
    sleepHours?: number;
    energyLevel?: number;
    moodLevel?: number;
    workoutCompleted?: boolean;
    noWeedStreak?: number;
    noScrollingStreak?: number;
  }) => {
    const lifeBonus = XPPsychologyUtils.calculateLifeBonus(healthData);
    
    setPsychologyState(prev => ({ ...prev, lifeBonus }));
    
    return lifeBonus;
  }, []);

  /**
   * Queue celebration for XP earning
   */
  const queueCelebration = useCallback((
    xpEarned: number,
    hasBonus: boolean,
    bonusMultiplier: number = 1.0
  ) => {
    const celebration = XPPsychologyUtils.calculateCelebrationLevel(
      xpEarned,
      hasBonus,
      bonusMultiplier
    );
    
    setPsychologyState(prev => ({
      ...prev,
      celebrationQueue: [...prev.celebrationQueue, {
        id: Date.now(),
        ...celebration,
        timestamp: new Date()
      }]
    }));
    
    // Auto-remove celebration after duration
    setTimeout(() => {
      setPsychologyState(prev => ({
        ...prev,
        celebrationQueue: prev.celebrationQueue.slice(1)
      }));
    }, celebration.duration);
    
    return celebration;
  }, []);

  /**
   * Calculate spending psychology for purchase decisions
   */
  const calculateSpendingPsychology = useCallback((
    rewardPrice: number,
    userXP: number,
    rewardName: string
  ) => {
    const hoursToReEarn = Math.ceil(rewardPrice / 50); // Assume 50 XP/hour average
    
    return XPPsychologyUtils.calculateSpendingPsychology(
      rewardPrice,
      userXP,
      hoursToReEarn,
      rewardName
    );
  }, []);

  return {
    ...psychologyState,
    calculateVariableBonus,
    calculateLifeBonus,
    queueCelebration,
    calculateSpendingPsychology
  };
}

/**
 * Combined XP Hook - Full XP economy integration
 * Combines spending and psychology features
 */
export function useXPEconomy(userId: string) {
  const store = useXPStore(userId);
  const psychology = useXPPsychology(userId);
  
  /**
   * Enhanced task completion with psychology
   */
  const completeTaskWithPsychology = useCallback(async (
    baseXP: number,
    taskCount: number = 1,
    streakDays: number = 0,
    healthData: any = {}
  ) => {
    // Calculate life bonus
    const lifeBonus = psychology.calculateLifeBonus(healthData);
    
    // Calculate variable bonus
    const variableBonus = psychology.calculateVariableBonus(
      taskCount,
      streakDays,
      Boolean(healthData.workoutCompleted)
    );
    
    // Calculate final XP
    const finalXP = Math.round(
      baseXP * lifeBonus.totalMultiplier * (variableBonus.hasBonus ? variableBonus.multiplier : 1.0)
    );
    
    // Queue celebration
    const celebration = psychology.queueCelebration(
      baseXP,
      variableBonus.hasBonus,
      lifeBonus.totalMultiplier * (variableBonus.hasBonus ? variableBonus.multiplier : 1.0)
    );
    
    // Refresh store data (XP balance updated elsewhere)
    await store.refreshBalance();
    
    return {
      finalXP,
      lifeBonus,
      variableBonus,
      celebration,
      nearMissNotifications: store.getNearMissNotifications(),
      spendingPower: store.getSpendingPower()
    };
  }, [psychology, store]);

  return {
    ...store,
    ...psychology,
    completeTaskWithPsychology
  };
}
