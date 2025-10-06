/**
 * XP Store Rewards API Endpoint
 * GET /api/xp-store/rewards
 * Returns available rewards with dynamic pricing
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@/generated/prisma';
import { auth } from '@clerk/nextjs';

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get authenticated user
    const { userId } = auth();
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get rewards from database
    let rewards = await prisma.rewardDefinition.findMany({
      where: { isActive: true },
      orderBy: { basePrice: 'asc' }
    });

    // If no rewards exist, seed with initial catalog
    if (rewards.length === 0) {
      await seedRewards();
      rewards = await prisma.rewardDefinition.findMany({
        where: { isActive: true },
        orderBy: { basePrice: 'asc' }
      });
    }

    // Format rewards for frontend
    const formattedRewards = rewards.map(reward => ({
      id: reward.id,
      category: reward.category,
      name: reward.name,
      description: reward.description,
      basePrice: reward.basePrice,
      currentPrice: reward.basePrice, // TODO: Add dynamic pricing logic
      iconEmoji: reward.iconEmoji,
      discountPercent: 0, // TODO: Calculate based on user history
      requiresStreak: reward.requiresStreak,
      maxDailyUse: reward.maxDailyUse,
      availabilityWindow: reward.availabilityWindow
    }));

    res.status(200).json(formattedRewards);

  } catch (error) {
    console.error('XP Store rewards error:', error);
    res.status(500).json({ 
      error: 'Failed to get rewards',
      details: process.env.NODE_ENV === 'development' ? String(error) : undefined
    });
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Seed initial reward definitions
 */
async function seedRewards() {
  const rewards = [
    // Cannabis & Relaxation
    {
      category: 'CANNABIS',
      name: 'Micro Dose',
      description: '30min creative session',
      basePrice: 150,
      iconEmoji: '🌱'
    },
    {
      category: 'CANNABIS',
      name: 'Chill Session',
      description: '2-hour relaxation period',
      basePrice: 300,
      iconEmoji: '🔥'
    },
    {
      category: 'CANNABIS',
      name: 'Weekend Pass',
      description: 'Full weekend smoking permission',
      basePrice: 800,
      iconEmoji: '🏖️',
      availabilityWindow: 'weekends_only'
    },
    
    // Time Off & Breaks
    {
      category: 'TIME_OFF',
      name: 'Power Nap',
      description: '20min guilt-free nap',
      basePrice: 100,
      iconEmoji: '😴'
    },
    {
      category: 'TIME_OFF',
      name: 'Netflix Binge',
      description: '6-hour binge session',
      basePrice: 400,
      iconEmoji: '📺'
    },
    {
      category: 'TIME_OFF',
      name: 'Full Day Off',
      description: 'Complete day off work',
      basePrice: 1200,
      iconEmoji: '🏝️'
    },
    
    // Food & Treats
    {
      category: 'FOOD',
      name: 'Junk Food',
      description: 'Guilt-free fast food meal',
      basePrice: 100,
      iconEmoji: '🍟'
    },
    {
      category: 'FOOD',
      name: 'Expensive Meal',
      description: 'High-end restaurant visit',
      basePrice: 300,
      iconEmoji: '🍽️'
    },
    {
      category: 'FOOD',
      name: 'Cheat Day',
      description: 'Full day dietary freedom',
      basePrice: 500,
      iconEmoji: '🎂'
    },
    
    // Entertainment
    {
      category: 'ENTERTAINMENT',
      name: 'Gaming Marathon',
      description: '4-hour gaming session',
      basePrice: 300,
      iconEmoji: '🎮'
    },
    {
      category: 'ENTERTAINMENT',
      name: 'Movie Theater',
      description: 'Cinema experience',
      basePrice: 200,
      iconEmoji: '🎬'
    }
  ];

  await prisma.rewardDefinition.createMany({
    data: rewards
  });
}