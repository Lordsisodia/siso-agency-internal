/**
 * XP Store Purchase History API Endpoint
 * GET /api/xp-store/history
 * Returns user's purchase history with analytics
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

    // Get query parameters
    const { limit = '20', offset = '0' } = req.query;

    // Get purchase history
    const purchases = await prisma.xPPurchase.findMany({
      where: { userId },
      include: {
        reward: {
          select: {
            id: true,
            name: true,
            description: true,
            category: true,
            iconEmoji: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit as string),
      skip: parseInt(offset as string)
    });

    // Get total count for pagination
    const totalCount = await prisma.xPPurchase.count({
      where: { userId }
    });

    // Format response
    const formattedPurchases = purchases.map(purchase => ({
      id: purchase.id,
      reward: {
        id: purchase.reward.id,
        name: purchase.reward.name,
        description: purchase.reward.description,
        category: purchase.reward.category,
        iconEmoji: purchase.reward.iconEmoji
      },
      xpSpent: purchase.xpSpent,
      actualPrice: purchase.actualPrice,
      purchaseType: purchase.purchaseType,
      notes: purchase.notes,
      satisfactionRating: purchase.satisfactionRating,
      guiltLevel: purchase.guiltLevel,
      wasPlanned: purchase.wasPlanned,
      celebrationLevel: purchase.celebrationLevel,
      createdAt: purchase.createdAt,
      updatedAt: purchase.updatedAt
    }));

    res.status(200).json({
      purchases: formattedPurchases,
      pagination: {
        total: totalCount,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
        hasMore: (parseInt(offset as string) + formattedPurchases.length) < totalCount
      }
    });

  } catch (error) {
    console.error('XP Store history error:', error);
    res.status(500).json({ 
      error: 'Failed to get purchase history',
      details: process.env.NODE_ENV === 'development' ? String(error) : undefined
    });
  } finally {
    await prisma.$disconnect();
  }
}