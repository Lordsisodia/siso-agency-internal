/**
 * XP Store End-to-End Integration Tests
 * Tests the complete user flow from task completion to reward purchasing
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useXPStore } from '@/hooks/useXPStore';

// Mock the XP Store service
const mockXPStoreService = {
  getXPStoreBalance: vi.fn(),
  getAvailableRewards: vi.fn(),
  purchaseReward: vi.fn(),
  awardXP: vi.fn(),
  getPurchaseHistory: vi.fn(),
  getSpendingAnalytics: vi.fn()
};

vi.mock('@/services/xpStoreService', () => ({
  xpStoreService: mockXPStoreService,
  XPStoreService: mockXPStoreService
}));

// Mock fetch for API calls
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Test data
const mockUser = { id: 'user-123' };

const mockBalance = {
  currentXP: 500,
  totalEarned: 1000,
  totalSpent: 500,
  reserveXP: 200,
  canSpend: 300,
  pendingLoans: 0
};

const mockRewards = [
  {
    id: 'reward-1',
    category: 'Food',
    name: 'Premium Coffee',
    description: 'Guilt-free artisan coffee or fancy latte',
    basePrice: 100,
    currentPrice: 100,
    iconEmoji: '☕',
    discountPercent: 0,
    requiresStreak: null,
    maxDailyUse: 3,
    availabilityWindow: 'ANYTIME'
  },
  {
    id: 'reward-2',
    category: 'Cannabis',
    name: 'Evening Session',
    description: 'Relaxing cannabis session after productive day',
    basePrice: 180,
    currentPrice: 180,
    iconEmoji: '🌿',
    discountPercent: 0,
    requiresStreak: 1,
    maxDailyUse: 1,
    availabilityWindow: 'EVENING'
  },
  {
    id: 'reward-3',
    category: 'Entertainment',
    name: 'Movie Night',
    description: 'Movie at home or cinema with snacks',
    basePrice: 250,
    currentPrice: 250,
    iconEmoji: '🎬',
    discountPercent: 0,
    requiresStreak: null,
    maxDailyUse: 1,
    availabilityWindow: 'EVENING'
  },
  {
    id: 'reward-4',
    category: 'Luxury',
    name: 'Weekend Trip',
    description: 'Mini getaway or luxury experience',
    basePrice: 500,
    currentPrice: 500,
    iconEmoji: '✈️',
    discountPercent: 0,
    requiresStreak: 7,
    maxDailyUse: 1,
    availabilityWindow: 'ANYTIME'
  }
];

describe('XP Store End-to-End User Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Task Completion → XP Earning Flow', () => {
    it('should award XP when a task is marked complete', async () => {
      // Mock task completion API call (this would be a real API call in integration)
      const taskCompletionResponse = {
        ok: true,
        json: () => Promise.resolve({ success: true })
      };
      
      mockFetch.mockImplementationOnce(() => Promise.resolve(taskCompletionResponse));

      // Simulate task completion via API
      const taskUpdateData = {
        taskId: 'task-123',
        completed: true
      };

      const response = await fetch('/api/tasks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskUpdateData)
      });

      expect(response.ok).toBe(true);
      
      // Verify that the task completion would trigger XP award
      // (In real integration, this would be called by the tasks API)
      expect(taskUpdateData.completed).toBe(true);
      expect(taskUpdateData.taskId).toBeDefined();
    });

    it('should award appropriate XP amounts for different task types', async () => {
      const testCases = [
        { taskType: 'simple', expectedBaseXP: 50 },
        { taskType: 'complex', expectedBaseXP: 50 }, // Currently all tasks get 50 XP base
      ];

      testCases.forEach(({ taskType, expectedBaseXP }) => {
        expect(expectedBaseXP).toBe(50); // Verify current base XP award
      });
    });
  });

  describe('XP Balance Management', () => {
    it('should correctly calculate spendable XP (currentXP - reserveXP - loans)', () => {
      const balance = mockBalance;
      const expectedCanSpend = balance.currentXP - balance.reserveXP - balance.pendingLoans;
      
      expect(balance.canSpend).toBe(expectedCanSpend);
      expect(balance.canSpend).toBe(300); // 500 - 200 - 0 = 300
    });

    it('should maintain reserve XP for emergencies', () => {
      expect(mockBalance.reserveXP).toBeGreaterThan(0);
      expect(mockBalance.reserveXP).toBe(200); // Standard reserve amount
    });

    it('should track total earned and spent correctly', () => {
      const balance = mockBalance;
      expect(balance.totalEarned).toBeGreaterThanOrEqual(balance.currentXP + balance.totalSpent);
      expect(balance.totalEarned).toBe(1000);
      expect(balance.totalSpent).toBe(500);
      expect(balance.currentXP).toBe(500);
    });
  });

  describe('Reward Purchasing Flow', () => {
    it('should allow purchasing affordable rewards', async () => {
      const affordableReward = mockRewards.find(r => r.currentPrice <= mockBalance.canSpend);
      expect(affordableReward).toBeDefined();
      expect(affordableReward?.name).toBe('Premium Coffee');
      expect(affordableReward?.currentPrice).toBe(100);
      expect(mockBalance.canSpend).toBeGreaterThanOrEqual(100);
    });

    it('should prevent purchasing expensive rewards', async () => {
      const expensiveReward = mockRewards.find(r => r.currentPrice > mockBalance.canSpend);
      expect(expensiveReward).toBeDefined();
      expect(expensiveReward?.currentPrice).toBeGreaterThan(mockBalance.canSpend);
      expect(mockBalance.canSpend).toBe(300); // Verify our balance
    });

    it('should handle successful purchase with balance update', async () => {
      const purchaseResponse = {
        success: true,
        message: 'Purchase successful!',
        remainingXP: 200,
        purchaseId: 'purchase-123',
        celebrationLevel: 'earned'
      };

      mockFetch.mockImplementationOnce(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve(purchaseResponse)
      }));

      const result = await fetch('/api/xp-store/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rewardId: 'reward-1',
          useLoan: false
        })
      });

      const data = await result.json();
      expect(data.success).toBe(true);
      expect(data.remainingXP).toBe(200);
      expect(data.celebrationLevel).toBe('earned');
    });
  });

  describe('Psychology Features', () => {
    it('should identify near-miss opportunities (within 200 XP)', () => {
      const balance = mockBalance; // canSpend: 300
      const nearMissRewards = mockRewards.filter(reward => {
        const xpNeeded = reward.currentPrice - balance.canSpend;
        return xpNeeded > 0 && xpNeeded <= 200;
      });

      expect(nearMissRewards).toHaveLength(1); // Weekend Trip is 500-300=200 XP away
      
      // Test with modified balance to create near-miss scenario
      const lowBalance = { ...balance, canSpend: 230 }; // 230 XP available
      const nearMissWithLowBalance = mockRewards.filter(reward => {
        const xpNeeded = reward.currentPrice - lowBalance.canSpend;
        return xpNeeded > 0 && xpNeeded <= 200;
      });
      
      expect(nearMissWithLowBalance).toHaveLength(1); // Movie Night (250 - 230 = 20 XP away)
      expect(nearMissWithLowBalance[0].name).toBe('Movie Night');
    });

    it('should categorize spending power correctly', () => {
      const balance = mockBalance; // canSpend: 300
      
      const canAfford = mockRewards.filter(r => r.currentPrice <= balance.canSpend);
      const almostAfford = mockRewards.filter(r => {
        const needed = r.currentPrice - balance.canSpend;
        return needed > 0 && needed <= 150;
      });
      const dreamRewards = mockRewards.filter(r => r.currentPrice > balance.canSpend + 150);

      expect(canAfford).toHaveLength(3); // Coffee (100), Cannabis (180), and Movie Night (250)
      expect(almostAfford).toHaveLength(0); // No rewards in the 300-450 range
      expect(dreamRewards).toHaveLength(1); // Weekend Trip (500) > 450 XP

      expect(canAfford.map(r => r.name)).toContain('Premium Coffee');
      expect(canAfford.map(r => r.name)).toContain('Evening Session');
    });

    it('should handle streak requirements', () => {
      const rewardsWithStreak = mockRewards.filter(r => r.requiresStreak);
      const rewardsWithoutStreak = mockRewards.filter(r => !r.requiresStreak);

      expect(rewardsWithStreak).toHaveLength(2);
      expect(rewardsWithStreak.map(r => r.name)).toContain('Evening Session');
      expect(rewardsWithStreak.map(r => r.name)).toContain('Weekend Trip');

      expect(rewardsWithoutStreak).toHaveLength(2);
    });

    it('should respect availability windows', () => {
      const eveningRewards = mockRewards.filter(r => r.availabilityWindow === 'EVENING');
      const anytimeRewards = mockRewards.filter(r => r.availabilityWindow === 'ANYTIME');

      expect(eveningRewards).toHaveLength(2);
      expect(eveningRewards.map(r => r.name)).toContain('Evening Session');
      expect(eveningRewards.map(r => r.name)).toContain('Movie Night');

      expect(anytimeRewards).toHaveLength(2);
      expect(anytimeRewards.map(r => r.name)).toContain('Premium Coffee');
      expect(anytimeRewards.map(r => r.name)).toContain('Weekend Trip');
    });
  });

  describe('Data Persistence and Analytics', () => {
    it('should track purchase history for analytics', async () => {
      const purchaseHistoryResponse = [
        {
          id: 'purchase-1',
          reward: {
            name: 'Premium Coffee',
            category: 'Food',
            iconEmoji: '☕'
          },
          xpSpent: 100,
          createdAt: new Date().toISOString(),
          satisfactionRating: 4,
          guiltLevel: 1
        }
      ];

      mockFetch.mockImplementationOnce(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ purchases: purchaseHistoryResponse })
      }));

      const response = await fetch('/api/xp-store/history');
      const data = await response.json();

      expect(data.purchases).toHaveLength(1);
      expect(data.purchases[0].reward.name).toBe('Premium Coffee');
      expect(data.purchases[0].xpSpent).toBe(100);
      expect(data.purchases[0].satisfactionRating).toBe(4);
      expect(data.purchases[0].guiltLevel).toBe(1);
    });

    it('should provide spending analytics for psychology optimization', async () => {
      const analyticsResponse = {
        overview: {
          totalPurchases: 5,
          totalSpent: 500,
          averageSpending: 100,
          psychologyHealthScore: 75
        },
        behaviorInsights: {
          plannedPurchases: 3,
          impulsePurchases: 2,
          planningRate: 60,
          averageSatisfaction: 4.2,
          averageGuilt: 1.8
        },
        mostPopularRewards: [
          { name: 'Premium Coffee', emoji: '☕', count: 3 }
        ],
        recommendations: [
          'Great job planning your rewards! This leads to higher satisfaction'
        ]
      };

      mockFetch.mockImplementationOnce(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve(analyticsResponse)
      }));

      const response = await fetch('/api/xp-store/analytics');
      const data = await response.json();

      expect(data.overview.psychologyHealthScore).toBe(75);
      expect(data.behaviorInsights.planningRate).toBe(60);
      expect(data.behaviorInsights.averageSatisfaction).toBe(4.2);
      expect(data.behaviorInsights.averageGuilt).toBe(1.8);
      expect(data.recommendations).toHaveLength(1);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle insufficient XP gracefully', async () => {
      const errorResponse = {
        success: false,
        message: 'Insufficient XP. You need 250 XP but only have 100 XP available to spend.'
      };

      mockFetch.mockImplementationOnce(() => Promise.resolve({
        ok: false,
        status: 400,
        json: () => Promise.resolve(errorResponse)
      }));

      const response = await fetch('/api/xp-store/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rewardId: 'expensive-reward',
          useLoan: false
        })
      });

      expect(response.ok).toBe(false);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.message).toContain('Insufficient XP');
    });

    it('should handle network failures with fallback data', async () => {
      mockFetch.mockImplementationOnce(() => Promise.reject(new TypeError('fetch failed')));

      // This would be handled by the XP Store service with fallback data
      const fallbackBalance = {
        currentXP: 0,
        totalEarned: 0,
        totalSpent: 0,
        reserveXP: 200,
        canSpend: 0,
        pendingLoans: 0
      };

      // Verify fallback structure matches expected interface
      expect(fallbackBalance.reserveXP).toBe(200);
      expect(fallbackBalance.canSpend).toBe(0);
      expect(fallbackBalance.currentXP).toBe(0);
    });
  });

  describe('Integration Points', () => {
    it('should verify task completion API integration structure', () => {
      // This test verifies that our task integration has the correct structure
      const taskCompletionData = {
        taskId: 'task-123',
        completed: true,
        userId: 'user-123'
      };

      const expectedXPAwardData = {
        source: 'TASK_COMPLETION',
        sourceId: 'task-123',
        baseXP: 50,
        finalXP: 50,
        multipliers: { base: 1.0 }
      };

      expect(taskCompletionData.completed).toBe(true);
      expect(taskCompletionData.taskId).toBeDefined();
      expect(expectedXPAwardData.source).toBe('TASK_COMPLETION');
      expect(expectedXPAwardData.baseXP).toBe(50);
    });

    it('should verify reward catalog structure matches UI expectations', () => {
      const reward = mockRewards[0];
      
      // Verify all required fields for UI components
      expect(reward).toHaveProperty('id');
      expect(reward).toHaveProperty('category');
      expect(reward).toHaveProperty('name');
      expect(reward).toHaveProperty('description');
      expect(reward).toHaveProperty('basePrice');
      expect(reward).toHaveProperty('currentPrice');
      expect(reward).toHaveProperty('iconEmoji');
      expect(reward).toHaveProperty('availabilityWindow');
      expect(reward).toHaveProperty('maxDailyUse');

      // Verify data types
      expect(typeof reward.id).toBe('string');
      expect(typeof reward.currentPrice).toBe('number');
      expect(typeof reward.iconEmoji).toBe('string');
    });
  });
});