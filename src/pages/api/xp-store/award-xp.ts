/**
 * XP Store Award XP API Endpoint
 * POST /api/xp-store/award-xp
 * Awards XP to user's store balance when tasks are completed
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@/generated/prisma';
import { auth } from '@clerk/nextjs';
import { z } from 'zod';

const prisma = new PrismaClient();

// Validation schema
const awardSchema = z.object({
  source: z.string(), // "TASK_COMPLETION", "ROUTINE_BONUS", etc.
  sourceId: z.string().optional(), // ID of task, routine, etc.
  baseXP: z.number().min(1),
  finalXP: z.number().min(1),
  multipliers: z.record(z.number()).default({})
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get authenticated user
    const { userId } = auth();
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Validate request body
    const { source, sourceId, baseXP, finalXP, multipliers } = awardSchema.parse(req.body);

    // Award XP in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Get or create XP balance
      let xpBalance = await tx.xPBalance.findUnique({
        where: { userId }
      });

      if (!xpBalance) {
        // Create initial balance for new user
        xpBalance = await tx.xPBalance.create({
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

      // Update balance with new XP
      const updatedBalance = await tx.xPBalance.update({
        where: { userId },
        data: {
          currentXP: xpBalance.currentXP + finalXP,
          totalEarned: xpBalance.totalEarned + finalXP
        }
      });

      // Log the earning
      await tx.xPEarningLog.create({
        data: {
          userId,
          source,
          sourceId: sourceId || null,
          baseXP,
          finalXP,
          multipliers
        }
      });

      return {
        previousXP: xpBalance.currentXP,
        awardedXP: finalXP,
        newXP: updatedBalance.currentXP,
        newTotal: updatedBalance.totalEarned,
        canSpend: Math.max(0, updatedBalance.currentXP - updatedBalance.reserveXP - updatedBalance.pendingLoans)
      };
    });

    res.status(200).json({
      success: true,
      ...result,
      message: `Earned ${finalXP} XP! ${result.newXP} total XP, ${result.canSpend} available to spend.`
    });

  } catch (error) {
    console.error('XP Store award error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Invalid request data',
        details: error.issues 
      });
    }

    res.status(500).json({ 
      error: 'Failed to award XP',
      details: process.env.NODE_ENV === 'development' ? String(error) : undefined
    });
  } finally {
    await prisma.$disconnect();
  }
}