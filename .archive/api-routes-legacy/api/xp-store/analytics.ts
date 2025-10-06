/**
 * XP Store Analytics API Endpoint
 * GET /api/xp-store/analytics
 * Returns spending analytics and behavioral insights
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

    // Get time period (default to last 30 days)
    const { period = '30' } = req.query;
    const days = parseInt(period as string);
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    // Get purchases in period
    const purchases = await prisma.xPPurchase.findMany({
      where: {
        userId,
        createdAt: { gte: startDate }
      },
      include: {
        reward: {
          select: {
            name: true,
            category: true,
            iconEmoji: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Calculate analytics
    const totalSpent = purchases.reduce((sum, p) => sum + p.xpSpent, 0);
    const averageSpending = purchases.length > 0 ? Math.round(totalSpent / purchases.length) : 0;
    
    // Category breakdown
    const categorySpending = purchases.reduce((acc, p) => {
      const category = p.reward.category;
      acc[category] = (acc[category] || 0) + p.xpSpent;
      return acc;
    }, {} as Record<string, number>);

    // Psychology insights
    const plannedPurchases = purchases.filter(p => p.wasPlanned).length;
    const impulsePurchases = purchases.length - plannedPurchases;
    const planningRate = purchases.length > 0 ? Math.round((plannedPurchases / purchases.length) * 100) : 0;

    // Satisfaction analysis
    const satisfactionRatings = purchases
      .filter(p => p.satisfactionRating !== null)
      .map(p => p.satisfactionRating!);
    const averageSatisfaction = satisfactionRatings.length > 0 
      ? Math.round((satisfactionRatings.reduce((sum, r) => sum + r, 0) / satisfactionRatings.length) * 10) / 10
      : null;

    // Guilt analysis
    const guiltLevels = purchases
      .filter(p => p.guiltLevel !== null)
      .map(p => p.guiltLevel!);
    const averageGuilt = guiltLevels.length > 0
      ? Math.round((guiltLevels.reduce((sum, r) => sum + r, 0) / guiltLevels.length) * 10) / 10
      : null;

    // Most popular rewards
    const rewardCounts = purchases.reduce((acc, p) => {
      const key = `${p.reward.name}|${p.reward.iconEmoji}`;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const mostPopular = Object.entries(rewardCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([nameEmoji, count]) => {
        const [name, emoji] = nameEmoji.split('|');
        return { name, emoji, count };
      });

    // Spending frequency
    const spendingByDay = purchases.reduce((acc, p) => {
      const dayKey = p.createdAt.toISOString().split('T')[0];
      acc[dayKey] = (acc[dayKey] || 0) + p.xpSpent;
      return acc;
    }, {} as Record<string, number>);

    // Psychology health score (0-100)
    let psychologyScore = 50; // Base score
    if (planningRate > 70) psychologyScore += 20;
    if (averageSatisfaction && averageSatisfaction > 4) psychologyScore += 15;
    if (averageGuilt && averageGuilt < 2) psychologyScore += 15;
    psychologyScore = Math.min(100, Math.max(0, psychologyScore));

    const analytics = {
      period: {
        days,
        startDate,
        endDate: new Date()
      },
      overview: {
        totalPurchases: purchases.length,
        totalSpent,
        averageSpending,
        psychologyHealthScore: psychologyScore
      },
      categoryBreakdown: categorySpending,
      behaviorInsights: {
        plannedPurchases,
        impulsePurchases,
        planningRate,
        averageSatisfaction,
        averageGuilt
      },
      mostPopularRewards: mostPopular,
      spendingPattern: spendingByDay,
      recommendations: generateRecommendations({
        planningRate,
        averageSatisfaction,
        averageGuilt,
        categorySpending
      })
    };

    res.status(200).json(analytics);

  } catch (error) {
    console.error('XP Store analytics error:', error);
    res.status(500).json({ 
      error: 'Failed to get analytics',
      details: process.env.NODE_ENV === 'development' ? String(error) : undefined
    });
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Generate personalized recommendations based on analytics
 */
function generateRecommendations({
  planningRate,
  averageSatisfaction,
  averageGuilt,
  categorySpending
}: {
  planningRate: number;
  averageSatisfaction: number | null;
  averageGuilt: number | null;
  categorySpending: Record<string, number>;
}): string[] {
  const recommendations: string[] = [];

  // Planning recommendations
  if (planningRate < 30) {
    recommendations.push("Try planning your rewards in advance to reduce impulsive spending");
  } else if (planningRate > 80) {
    recommendations.push("Great job planning your rewards! This leads to higher satisfaction");
  }

  // Satisfaction recommendations
  if (averageSatisfaction && averageSatisfaction < 3) {
    recommendations.push("Consider choosing rewards that bring you more joy and satisfaction");
  }

  // Guilt recommendations
  if (averageGuilt && averageGuilt > 3) {
    recommendations.push("Remember: you earned these rewards! Focus on the work you completed");
  }

  // Category balance recommendations
  const topCategory = Object.entries(categorySpending)
    .sort(([,a], [,b]) => b - a)[0];

  if (topCategory && topCategory[1] > Object.values(categorySpending).reduce((sum, v) => sum + v, 0) * 0.6) {
    recommendations.push(`Consider diversifying your rewards beyond ${topCategory[0].toLowerCase()}`);
  }

  if (recommendations.length === 0) {
    recommendations.push("Your spending patterns look healthy! Keep enjoying your earned rewards");
  }

  return recommendations;
}