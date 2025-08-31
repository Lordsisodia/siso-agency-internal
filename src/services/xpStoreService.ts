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
      return await this.makeApiRequest<XPStoreBalance>('/api/xp-store/balance', {
        method: 'GET'
      });
    } catch (error) {
      // Return fallback data on error (graceful degradation)
      console.warn('XP Store balance unavailable, using fallback data');
      return {
        currentXP: 0,
        totalEarned: 0,
        totalSpent: 0,
        reserveXP: 200,
        canSpend: 0,
        pendingLoans: 0
      };
    }
  }
  
  /**
   * Get user's XP balance with enhanced error reporting
   */
  static async getXPStoreBalanceWithErrors(userId: string): Promise<ServiceResponse<XPStoreBalance>> {
    try {
      const data = await this.makeApiRequest<XPStoreBalance>('/api/xp-store/balance', {
        method: 'GET'
      });
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
    try {
      const response = await fetch('/api/xp-store/rewards', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const rewards = await response.json();
      return rewards;
      
    } catch (error) {
      console.error('Error getting available rewards:', error);
      return [];
    }
  }

  /**
   * Purchase a reward with XP
   */
  static async purchaseReward(request: PurchaseRequest): Promise<PurchaseResult> {
    try {
      const result = await this.makeApiRequest<PurchaseResult>('/api/xp-store/purchase', {
        method: 'POST',
        body: JSON.stringify({
          rewardId: request.rewardId,
          useLoan: request.useLoan || false,
          notes: request.notes
        })
      });
      
      return result;
      
    } catch (error) {
      const xpError = this.handleApiError(error, 'purchase');
      return { 
        success: false, 
        message: xpError.message
      };
    }
  }

  /**
   * Get purchase history for analytics
   */
  static async getPurchaseHistory(userId: string, limit: number = 20) {
    try {
      const response = await fetch(`/api/xp-store/history?limit=${limit}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.purchases || [];
      
    } catch (error) {
      console.error('Error getting purchase history:', error);
      return [];
    }
  }

  /**
   * Get spending analytics for psychology optimization
   */
  static async getSpendingAnalytics(userId: string) {
    try {
      const response = await fetch('/api/xp-store/analytics', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const analytics = await response.json();
      return analytics;
      
    } catch (error) {
      console.error('Error getting spending analytics:', error);
      return null;
    }
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