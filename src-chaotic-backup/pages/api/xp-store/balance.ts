/**
 * XP Store Balance API Endpoint
 * GET /api/xp-store/balance
 * Returns user's current XP balance and spending power
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

    // Get or create XP balance for user
    let xpBalance = await prisma.xPBalance.findUnique({
      where: { userId }
    });

    if (!xpBalance) {
      // Create initial XP balance for new user
      xpBalance = await prisma.xPBalance.create({
        data: {
          userId,
          currentXP: 0,
          totalEarned: 0,
          totalSpent: 0,
          reserveXP: 200,
          pendingLoans: 0
        }
      });
    }

    // Calculate spending power
    const canSpend = Math.max(0, xpBalance.currentXP - xpBalance.reserveXP - xpBalance.pendingLoans);

    // Format response
    const balance = {
      currentXP: xpBalance.currentXP,
      totalEarned: xpBalance.totalEarned,
      totalSpent: xpBalance.totalSpent,
      reserveXP: xpBalance.reserveXP,
      canSpend,
      pendingLoans: xpBalance.pendingLoans
    };

    res.status(200).json(balance);

  } catch (error) {
    console.error('XP Store balance error:', error);
    res.status(500).json({ 
      error: 'Failed to get XP balance',
      details: process.env.NODE_ENV === 'development' ? String(error) : undefined
    });
  } finally {
    await prisma.$disconnect();
  }
}