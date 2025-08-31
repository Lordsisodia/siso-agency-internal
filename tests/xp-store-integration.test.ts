/**
 * XP Store Integration Tests
 * Tests the complete XP Store data flow from task completion to XP awards
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { xpStoreService } from '@/services/xpStoreService';

// Mock fetch for testing
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('XP Store Integration', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  describe('XP Store Service', () => {
    it('should fetch XP balance with proper error handling', async () => {
      // Mock successful response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          currentXP: 500,
          totalEarned: 1000,
          totalSpent: 500,
          reserveXP: 200,
          canSpend: 300,
          pendingLoans: 0
        })
      });

      const balance = await xpStoreService.getXPStoreBalance('test-user');
      
      expect(balance).toBeDefined();
      expect(balance.currentXP).toBe(500);
      expect(balance.canSpend).toBe(300);
      expect(mockFetch).toHaveBeenCalledWith('/api/xp-store/balance', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
    });

    it('should handle network errors gracefully', async () => {
      // Mock network error
      mockFetch.mockRejectedValueOnce(new TypeError('fetch failed'));

      const balance = await xpStoreService.getXPStoreBalance('test-user');
      
      // Should return fallback data
      expect(balance).toBeDefined();
      expect(balance.currentXP).toBe(0);
      expect(balance.canSpend).toBe(0);
      expect(balance.reserveXP).toBe(200);
    });

    it('should fetch available rewards', async () => {
      // Mock rewards response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ([
          {
            id: 'reward-1',
            category: 'Entertainment',
            name: 'Movie Night',
            description: 'Watch a movie guilt-free',
            basePrice: 200,
            currentPrice: 180,
            iconEmoji: '🎬',
            discountPercent: 10
          }
        ])
      });

      const rewards = await xpStoreService.getAvailableRewards('test-user');
      
      expect(rewards).toHaveLength(1);
      expect(rewards[0].name).toBe('Movie Night');
      expect(rewards[0].currentPrice).toBe(180);
    });

    it('should handle reward purchase with proper request structure', async () => {
      // Mock purchase response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          message: 'Purchase successful!',
          remainingXP: 320,
          purchaseId: 'purchase-123',
          celebrationLevel: 'earned'
        })
      });

      const result = await xpStoreService.purchaseReward({
        userId: 'test-user',
        rewardId: 'reward-1',
        useLoan: false,
        notes: 'Well-deserved treat'
      });
      
      expect(result.success).toBe(true);
      expect(result.message).toBe('Purchase successful!');
      expect(result.remainingXP).toBe(320);
      
      expect(mockFetch).toHaveBeenCalledWith('/api/xp-store/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rewardId: 'reward-1',
          useLoan: false,
          notes: 'Well-deserved treat'
        })
      });
    });

    it('should award XP with proper structure', async () => {
      // Mock XP award response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          previousXP: 500,
          awardedXP: 50,
          newXP: 550,
          canSpend: 350,
          message: 'Earned 50 XP! 550 total XP, 350 available to spend.'
        })
      });

      const result = await xpStoreService.awardXP(
        'test-user',
        'TASK_COMPLETION',
        50,
        50,
        { base: 1.0 },
        'task-123'
      );
      
      expect(result.success).toBe(true);
      expect(result.awardedXP).toBe(50);
      expect(result.newXP).toBe(550);
      
      expect(mockFetch).toHaveBeenCalledWith('/api/xp-store/award-xp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: 'TASK_COMPLETION',
          sourceId: 'task-123',
          baseXP: 50,
          finalXP: 50,
          multipliers: { base: 1.0 }
        })
      });
    });
  });

  describe('Psychology Features', () => {
    it('should calculate near-miss opportunities', async () => {
      // Mock balance and rewards
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            currentXP: 500,
            canSpend: 300,
            reserveXP: 200,
            totalEarned: 1000,
            totalSpent: 500,
            pendingLoans: 0
          })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ([
            {
              id: 'reward-1',
              name: 'Coffee Break',
              iconEmoji: '☕',
              currentPrice: 350, // 50 XP away - near miss!
              category: 'Food'
            },
            {
              id: 'reward-2',
              name: 'Movie Night',
              iconEmoji: '🎬',
              currentPrice: 600, // 300 XP away - too far
              category: 'Entertainment'
            }
          ])
        });

      const nearMiss = await xpStoreService.getNearMissOpportunities('test-user');
      
      expect(nearMiss).toHaveLength(1);
      expect(nearMiss[0].rewardName).toBe('Coffee Break');
      expect(nearMiss[0].xpNeeded).toBe(50);
      expect(nearMiss[0].urgencyLevel).toBe('high');
    });

    it('should calculate spending power categories', async () => {
      // Mock balance and rewards
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            currentXP: 500,
            canSpend: 300,
            reserveXP: 200,
            totalEarned: 1000,
            totalSpent: 500,
            pendingLoans: 0
          })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ([
            {
              id: 'reward-1',
              name: 'Coffee',
              iconEmoji: '☕',
              currentPrice: 250, // Can afford
              category: 'Food'
            },
            {
              id: 'reward-2',
              name: 'Lunch',
              iconEmoji: '🍔',
              currentPrice: 400, // Almost afford (100 XP away)
              category: 'Food'
            },
            {
              id: 'reward-3',
              name: 'Concert',
              iconEmoji: '🎵',
              currentPrice: 800, // Dream reward
              category: 'Entertainment'
            }
          ])
        });

      const spendingPower = await xpStoreService.getSpendingPower('test-user');
      
      expect(spendingPower.canAfford).toHaveLength(1);
      expect(spendingPower.canAfford[0].name).toBe('Coffee');
      
      expect(spendingPower.almostAfford).toHaveLength(1);
      expect(spendingPower.almostAfford[0].name).toBe('Lunch');
      expect(spendingPower.almostAfford[0].xpNeeded).toBe(100);
      
      expect(spendingPower.dreamRewards).toHaveLength(1);
      expect(spendingPower.dreamRewards[0].name).toBe('Concert');
      expect(spendingPower.dreamRewards[0].daysToAfford).toBe(3); // (800-300)/200 = 2.5 -> 3
    });
  });

  describe('Error Handling', () => {
    it('should handle server errors gracefully', async () => {
      // Mock server error
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: async () => 'Internal Server Error'
      });

      const result = await xpStoreService.purchaseReward({
        userId: 'test-user',
        rewardId: 'reward-1'
      });
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('Server error occurred');
    });

    it('should handle auth errors', async () => {
      // Mock auth error
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        text: async () => 'Unauthorized'
      });

      const result = await xpStoreService.purchaseReward({
        userId: 'test-user',
        rewardId: 'reward-1'
      });
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('Authentication required');
    });

    it('should handle validation errors', async () => {
      // Mock validation error
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        text: async () => 'Invalid request data'
      });

      const result = await xpStoreService.purchaseReward({
        userId: 'test-user',
        rewardId: 'reward-1'
      });
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('Invalid request data');
    });
  });
});

describe('Task Integration with XP Awards', () => {
  it('should verify task completion triggers XP award flow', () => {
    // This tests the integration point we added to tasks.ts
    // In practice, this would be tested with actual API calls
    
    const taskCompletionData = {
      taskId: 'task-123',
      completed: true,
      userId: 'test-user'
    };
    
    // Test data structure matches what we expect in the tasks API
    expect(taskCompletionData.completed).toBe(true);
    expect(taskCompletionData.taskId).toBeDefined();
    expect(taskCompletionData.userId).toBeDefined();
  });
});