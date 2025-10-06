/**
 * XP Store Purchase API Endpoint
 * POST /api/xp-store/purchase
 * Handles reward purchases with XP
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@/generated/prisma';
import { auth } from '@clerk/nextjs';
import { z } from 'zod';

const prisma = new PrismaClient();

// Validation schema
const purchaseSchema = z.object({
  rewardId: z.string(),
  useLoan: z.boolean().default(false),
  notes: z.string().optional()
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
    const { rewardId, useLoan, notes } = purchaseSchema.parse(req.body);

    // Get reward
    const reward = await prisma.rewardDefinition.findUnique({
      where: { id: rewardId }
    });

    if (!reward || !reward.isActive) {
      return res.status(404).json({ error: 'Reward not found or inactive' });
    }

    // Get user balance
    const xpBalance = await prisma.xPBalance.findUnique({
      where: { userId }
    });

    if (!xpBalance) {
      return res.status(404).json({ error: 'User XP balance not found' });
    }

    const canSpend = Math.max(0, xpBalance.currentXP - xpBalance.reserveXP - xpBalance.pendingLoans);

    // Check if user can afford
    if (canSpend >= reward.basePrice) {
      // Direct purchase
      const result = await processDirectPurchase(userId, reward, notes);
      res.status(200).json(result);
    } else if (useLoan && (canSpend + 1000) >= reward.basePrice) {
      // Loan purchase
      const result = await processLoanPurchase(userId, reward, notes);
      res.status(200).json(result);
    } else {
      // Cannot afford
      const needed = reward.basePrice - canSpend;
      res.status(400).json({
        success: false,
        message: `Need ${needed} more XP for ${reward.name}. Complete ${Math.ceil(needed / 50)} more tasks!`,
        xpNeeded: needed,
        tasksNeeded: Math.ceil(needed / 50)
      });
    }

  } catch (error) {
    console.error('XP Store purchase error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Invalid request data',
        details: error.issues 
      });
    }

    res.status(500).json({ 
      error: 'Purchase failed',
      details: process.env.NODE_ENV === 'development' ? String(error) : undefined
    });
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Process direct XP purchase (user has enough XP)
 */
async function processDirectPurchase(userId: string, reward: any, notes?: string) {
  return await prisma.$transaction(async (tx) => {
    // Get current balance
    const balance = await tx.xPBalance.findUnique({
      where: { userId }
    });

    if (!balance) {
      throw new Error('User balance not found');
    }

    // Update balance
    await tx.xPBalance.update({
      where: { userId },
      data: {
        currentXP: balance.currentXP - reward.basePrice,
        totalSpent: balance.totalSpent + reward.basePrice
      }
    });

    // Create purchase record
    const purchase = await tx.xPPurchase.create({
      data: {
        userId,
        rewardId: reward.id,
        xpSpent: reward.basePrice,
        actualPrice: reward.basePrice,
        purchaseType: 'DIRECT',
        notes,
        celebrationLevel: reward.basePrice >= 500 ? 'deserved' : 'earned'
      }
    });

    return {
      success: true,
      message: `🎉 You earned ${reward.name}! Enjoy your reward - you worked for this!`,
      remainingXP: balance.currentXP - reward.basePrice,
      purchaseId: purchase.id,
      celebrationLevel: purchase.celebrationLevel
    };
  });
}

/**
 * Process loan purchase (user needs to borrow XP)
 */
async function processLoanPurchase(userId: string, reward: any, notes?: string) {
  return await prisma.$transaction(async (tx) => {
    const loanAmount = reward.basePrice;
    const interestRate = 0.2; // 20% interest
    const totalOwed = Math.round(loanAmount * (1 + interestRate));

    // Create loan record
    const loan = await tx.xPLoan.create({
      data: {
        userId,
        amount: loanAmount,
        interestRate,
        totalOwed,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        status: 'ACTIVE'
      }
    });

    // Update balance to reflect pending loan
    await tx.xPBalance.update({
      where: { userId },
      data: {
        pendingLoans: { increment: totalOwed }
      }
    });

    // Create purchase record
    const purchase = await tx.xPPurchase.create({
      data: {
        userId,
        rewardId: reward.id,
        xpSpent: 0, // No XP spent immediately for loan
        actualPrice: reward.basePrice,
        purchaseType: 'LOAN',
        notes,
        celebrationLevel: 'earned'
      }
    });

    return {
      success: true,
      message: `💳 Loan approved! Enjoy ${reward.name} now, pay back ${totalOwed} XP within 7 days.`,
      remainingXP: 0, // Balance unchanged for loan
      purchaseId: purchase.id,
      loanId: loan.id,
      totalOwed,
      dueDate: loan.dueDate,
      celebrationLevel: 'earned'
    };
  });
}