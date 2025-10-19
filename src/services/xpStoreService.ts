import { supabaseAnon } from '@/shared/lib/supabase-clerk';

/**
 * XP Store Service - Safe Backend Implementation
 * 
 * This service handles XP spending economy without touching existing gamification.
 * Can be safely developed and tested without breaking current functionality.
 */

// Types for XP Store (independent of existing types)
export interface XPStoreBalance {
  currentXP: number;
  totalEarned: number;
  totalSpent: number;
  reserveXP: number;
  canSpend: number;
  pendingLoans: number;
  isInDebt: boolean;
  debtAmount: number;
}

export interface RewardItem {
  id: string;
  category: string;
  name: string;
  description: string;
  basePrice: number;
  currentPrice: number;
  iconEmoji: string;
  discountPercent?: number;
  requiresStreak?: number;
  maxDailyUse?: number;
  availabilityWindow?: string;
  unlockAt?: number;
}

export interface PurchaseRequest {
  userId: string;
  rewardId: string;
  useLoan?: boolean;
  notes?: string;
}

export interface PurchaseResult {
  success: boolean;
  message: string;
  remainingXP?: number;
  purchaseId?: string;
  celebrationLevel?: 'normal' | 'earned' | 'deserved';
}

export interface XPStoreError {
  type: 'network' | 'server' | 'auth' | 'validation' | 'unknown';
  message: string;
  details?: any;
}

export interface ServiceResponse<T> {
  data?: T;
  error?: XPStoreError;
  loading: boolean;
}

/**
 * XP Store Service Class
 * Handles all XP spending economy logic safely
 */
export class XPStoreService {
  private static fallbackBalance: XPStoreBalance = {
    currentXP: 0,
    totalEarned: 0,
    totalSpent: 0,
    reserveXP: 0,
    canSpend: 0,
    pendingLoans: 0,
    isInDebt: false,
    debtAmount: 0
  };

  private static isValidUuid(value: string | null | undefined): value is string {
    if (!value) return false;
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
  }
  
  /**
   * Helper method to handle API errors consistently
   */
  private static handleApiError(error: any, operation: string): XPStoreError {
    console.error(`XP Store ${operation} error:`, error);
    
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return {
        type: 'network',
        message: 'Network connection failed. Please check your internet connection.',
        details: error.message
      };
    }
    
    if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
      return {
        type: 'auth',
        message: 'Authentication required. Please log in again.',
        details: error.message
      };
    }
    
    if (error.message?.includes('400') || error.message?.includes('validation')) {
      return {
        type: 'validation',
        message: 'Invalid request data. Please try again.',
        details: error.message
      };
    }
    
    if (error.message?.includes('500') || error.message?.includes('server')) {
      return {
        type: 'server',
        message: 'Server error occurred. Please try again later.',
        details: error.message
      };
    }
    
    return {
      type: 'unknown',
      message: 'An unexpected error occurred. Please try again.',
      details: error.message || String(error)
    };
  }
  
  /**
   * Helper method to make API requests with consistent error handling
   */
  private static async makeApiRequest<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };
    
    const response = await fetch(endpoint, defaultOptions);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    
    return response.json();
  }
  
  /**
   * Get user's XP spending balance (separate from existing gamification)
   */
  static async getXPStoreBalance(userId: string): Promise<XPStoreBalance> {
    try {
      if (!this.isValidUuid(userId)) {
        return { ...this.fallbackBalance };
      }

      // Fetch user's total earned XP
      const { data: progress, error: progressError } = await supabaseAnon
        .from('user_gamification_progress')
        .select('total_xp,current_level,daily_xp,current_streak,best_streak,updated_at')
        .eq('user_id', userId)
        .maybeSingle();

      if (progressError) {
        console.warn('XP Store progress fetch failed:', progressError);
      }

      const { data: recentStats, error: statsError } = await supabaseAnon
        .from('daily_xp_stats')
        .select('date,total_xp,activities_completed,streak_count')
        .eq('user_id', userId)
        .order('date', { ascending: false })
        .limit(14);

      if (statsError) {
        console.warn('XP Store daily stats fetch failed:', statsError);
      }

      // Fetch total spent XP from purchases
      const { data: purchases, error: purchasesError } = await supabaseAnon
        .from('xp_purchases')
        .select('xp_cost')
        .eq('user_id', userId);

      if (purchasesError) {
        console.warn('XP Store purchases fetch failed:', purchasesError);
      }

      const totalEarned = progress?.total_xp ?? recentStats?.[0]?.total_xp ?? 0;
      const totalSpent = purchases?.reduce((sum, p) => sum + p.xp_cost, 0) ?? 0;

      // Calculate current balance (can be negative!)
      const currentXP = totalEarned - totalSpent;
      const isInDebt = currentXP < 0;
      const debtAmount = isInDebt ? Math.abs(currentXP) : 0;

      // Reserve XP only if not in debt
      const reserveXP = isInDebt ? 0 : Math.round(totalEarned * 0.1);

      // Can spend = current balance (allows going into debt)
      const canSpend = currentXP;

      return {
        currentXP,
        totalEarned,
        totalSpent,
        reserveXP,
        canSpend,
        pendingLoans: 0,
        isInDebt,
        debtAmount
      };
    } catch (error) {
      // Return fallback data on error (graceful degradation)
      console.warn('XP Store balance unavailable, using fallback data', error);
      return { ...this.fallbackBalance };
    }
  }
  
  /**
   * Get user's XP balance with enhanced error reporting
   */
  static async getXPStoreBalanceWithErrors(userId: string): Promise<ServiceResponse<XPStoreBalance>> {
    try {
      const data = await this.getXPStoreBalance(userId);
      return { data, loading: false };
    } catch (error) {
      return { 
        error: this.handleApiError(error, 'balance fetch'), 
        loading: false 
      };
    }
  }

  /**
   * Get available rewards with dynamic pricing
   */
  static async getAvailableRewards(userId: string): Promise<RewardItem[]> {
    const defaultRewards: RewardItem[] = [
      {
        id: 'reward-risk-night',
        category: 'SOCIAL',
        name: 'Risk Night with the Crew',
        description: 'Full strategic board game session with the boys—no guilt, all snacks included.',
        basePrice: 1000,
        currentPrice: 1000,
        iconEmoji: '🎲',
        unlockAt: 1000,
      },
      {
        id: 'reward-nice-food',
        category: 'FOOD',
        name: 'Chef-Level Dinner Out',
        description: 'Book a reservation or splurge on premium ingredients for a 5-star meal.',
        basePrice: 1500,
        currentPrice: 1500,
        iconEmoji: '🍣',
        unlockAt: 1500,
      },
      {
        id: 'reward-movie-night',
        category: 'ENTERTAINMENT',
        name: 'Movie Night Upgrade',
        description: 'Theatre tickets or a full streaming setup with snacks and zero interruptions.',
        basePrice: 2000,
        currentPrice: 2000,
        iconEmoji: '🎬',
        unlockAt: 2000,
      },
      {
        id: 'reward-premium-coffee',
        category: 'INDULGENCE',
        name: 'Premium Coffee Ritual',
        description: 'Treat yourself to a high-end pour-over or latte from your favourite spot.',
        basePrice: 750,
        currentPrice: 700,
        iconEmoji: '☕️',
      },
      {
        id: 'reward-focus-break',
        category: 'WELLNESS',
        name: 'Focus Break Walk',
        description: '15 minute walk to reset your energy and protect momentum.',
        basePrice: 600,
        currentPrice: 500,
        iconEmoji: '🚶‍♂️',
      },
      {
        id: 'reward-spa-session',
        category: 'RECOVERY',
        name: 'Massage or Spa Reset',
        description: 'Book a massage, sauna, or spa day to reset your nervous system.',
        basePrice: 10000,
        currentPrice: 10000,
        iconEmoji: '💆‍♂️',
        unlockAt: 10000,
      },
      {
        id: 'reward-day-off',
        category: 'REST',
        name: 'Quarter Day Off',
        description: 'Block off three guilt-free hours for deep recovery or creative wandering.',
        basePrice: 3200,
        currentPrice: 3200,
        iconEmoji: '🌤️',
      },
      {
        id: 'reward-coaching',
        category: 'GROWTH',
        name: 'Coaching Session Upgrade',
        description: 'Invest in a specialised coaching or learning session.',
        basePrice: 4500,
        currentPrice: 4300,
        iconEmoji: '🧠',
      },
    ];

    return defaultRewards;
  }

  /**
   * Purchase a reward with XP
   */
  static async purchaseReward(request: PurchaseRequest): Promise<PurchaseResult> {
    console.info('XP Store purchase invoked without backend integration', request);
    return {
      success: false,
      message: 'Purchasing is coming soon. Earn XP now and you\'ll be ready when redemptions go live!'
    };
  }

  /**
   * Get purchase history for analytics
   */
  static async getPurchaseHistory(userId: string, limit: number = 20) {
    try {
      if (!this.isValidUuid(userId)) {
        return [];
      }

      const { data, error } = await supabaseAnon
        .from('xp_purchases')
        .select('*')
        .eq('user_id', userId)
        .order('purchased_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching purchase history:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error getting purchase history:', error);
      return [];
    }
  }

  /**
   * Get spending analytics for psychology optimization
   */
  static async getSpendingAnalytics(userId: string) {
    if (!this.isValidUuid(userId)) {
      return null;
    }

    const { data, error } = await supabaseAnon
      .from('daily_xp_stats')
      .select('date,total_xp,activities_completed,streak_count')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(30);

    if (error) {
      console.error('Error getting daily XP stats:', error);
      return null;
    }

    return data;
  }

  /**
   * Award XP to user's store balance (called when tasks are completed)
   */
  static async awardXP(userId: string, source: string, baseXP: number, finalXP: number, multipliers: Record<string, number> = {}, sourceId?: string) {
    try {
      const response = await fetch('/api/xp-store/award-xp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          source,
          sourceId,
          baseXP,
          finalXP,
          multipliers
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
      
    } catch (error) {
      console.error('Error awarding XP:', error);
      return {
        success: false,
        message: 'Failed to award XP'
      };
    }
  }

  /**
   * Check for near-miss notifications (psychology feature)
   */
  static async getNearMissOpportunities(userId: string) {
    try {
      const balance = await this.getXPStoreBalance(userId);
      const rewards = await this.getAvailableRewards(userId);
      
      const nearMissRewards = rewards
        .filter(reward => {
          const xpNeeded = reward.currentPrice - balance.canSpend;
          return xpNeeded > 0 && xpNeeded <= 200; // Within 200 XP
        })
        .map(reward => ({
          rewardName: reward.name,
          rewardEmoji: reward.iconEmoji,
          currentPrice: reward.currentPrice,
          xpNeeded: reward.currentPrice - balance.canSpend,
          urgencyLevel: reward.currentPrice - balance.canSpend <= 50 ? 'high' : 'medium',
          motivationMessage: reward.currentPrice - balance.canSpend <= 50 
            ? `🔥 SO CLOSE! Just ${reward.currentPrice - balance.canSpend} XP more for ${reward.name}!`
            : `🎯 Almost there! ${reward.currentPrice - balance.canSpend} XP away from ${reward.name}`
        }))
        .sort((a, b) => a.xpNeeded - b.xpNeeded);
      
      return nearMissRewards;
      
    } catch (error) {
      console.error('Error getting near-miss opportunities:', error);
      return [];
    }
  }

  /**
   * Calculate spending power for motivation
   */
  static async getSpendingPower(userId: string) {
    try {
      const balance = await this.getXPStoreBalance(userId);
      const rewards = await this.getAvailableRewards(userId);
      
      const canAfford = rewards
        .filter(r => r.currentPrice <= balance.canSpend)
        .map(r => ({ name: r.name, emoji: r.iconEmoji, price: r.currentPrice }));
      
      const almostAfford = rewards
        .filter(r => {
          const needed = r.currentPrice - balance.canSpend;
          return needed > 0 && needed <= 150;
        })
        .map(r => ({
          name: r.name,
          emoji: r.iconEmoji,
          price: r.currentPrice,
          xpNeeded: r.currentPrice - balance.canSpend
        }));
      
      const dreamRewards = rewards
        .filter(r => r.currentPrice > balance.canSpend + 150)
        .slice(0, 3) // Top 3 dream rewards
        .map(r => ({
          name: r.name,
          emoji: r.iconEmoji,
          price: r.currentPrice,
          daysToAfford: Math.ceil((r.currentPrice - balance.canSpend) / 200) // Assume 200 XP/day avg
        }));
      
      return {
        canAfford,
        almostAfford,
        dreamRewards
      };
      
    } catch (error) {
      console.error('Error calculating spending power:', error);
      return { canAfford: [], almostAfford: [], dreamRewards: [] };
    }
  }
}

// Export singleton for easy usage
export const xpStoreService = XPStoreService;
