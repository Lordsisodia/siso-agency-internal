import { prisma } from '@/lib/database/prisma';
import { RewardCategory, LoanStatus, PenaltyType } from '@prisma/client';

// Types for XP Store
interface RewardItem {
  id: string;
  category: RewardCategory;
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

interface PurchaseRequest {
  userId: string;
  rewardId: string;
  useLoan?: boolean;
  notes?: string;
}

interface XPStoreBalance {
  currentXP: number;
  totalEarned: number;
  totalSpent: number;
  pendingLoans: number;
  reserveXP: number;
  canSpend: number; // currentXP - reserveXP - pendingLoans
}

export class XPStoreService {
  
  // Get user's XP balance and spending power
  static async getBalance(userId: string): Promise<XPStoreBalance> {
    let balance = await prisma.xPBalance.findUnique({
      where: { userId },
      include: {
        loans: {
          where: { status: LoanStatus.ACTIVE }
        }
      }
    });

    if (!balance) {
      // Create initial balance
      balance = await prisma.xPBalance.create({
        data: {
          userId,
          currentXP: 0,
          totalEarned: 0,
          totalSpent: 0,
          reserveXP: 200 // Emergency fund
        },
        include: {
          loans: {
            where: { status: LoanStatus.ACTIVE }
          }
        }
      });
    }

    const pendingLoans = balance.loans.reduce((sum, loan) => sum + loan.totalOwed - loan.paidAmount, 0);

    return {
      currentXP: balance.currentXP,
      totalEarned: balance.totalEarned,
      totalSpent: balance.totalSpent,
      pendingLoans,
      reserveXP: balance.reserveXP,
      canSpend: Math.max(0, balance.currentXP - balance.reserveXP - pendingLoans)
    };
  }

  // Get available rewards with dynamic pricing
  static async getAvailableRewards(userId: string): Promise<RewardItem[]> {
    const userProgress = await prisma.userProgress.findUnique({
      where: { userId }
    });

    const currentStreak = userProgress?.currentStreak || 0;
    
    // Get recent purchase history for demand pricing
    const recentPurchases = await prisma.xPPurchase.findMany({
      where: {
        userId,
        purchasedAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
        }
      },
      select: { rewardType: true, rewardName: true }
    });

    const rewardDefinitions = await prisma.rewardDefinition.findMany({
      where: { isActive: true }
    });

    return rewardDefinitions.map(reward => {
      // Calculate dynamic pricing
      let currentPrice = reward.basePrice;

      // Demand multiplier - increase price if used frequently
      const recentUse = recentPurchases.filter(p => 
        p.rewardType === reward.category && p.rewardName === reward.name
      ).length;
      
      if (recentUse >= 3) currentPrice *= 1.5;
      else if (recentUse >= 2) currentPrice *= 1.2;

      // Streak discount
      if (reward.requiredStreak && currentStreak >= reward.requiredStreak) {
        currentPrice *= 0.8; // 20% discount for streak
      }

      // Weekend pricing for certain items
      const isWeekend = [0, 6].includes(new Date().getDay());
      if (reward.availabilityWindow === 'weekends_only' && !isWeekend) {
        currentPrice = -1; // Not available
      }

      // Seasonal multipliers (implement based on holidays, etc.)
      currentPrice *= reward.seasonalMultiplier;

      const discountPercent = currentPrice < reward.basePrice 
        ? Math.round((1 - currentPrice / reward.basePrice) * 100)
        : 0;

      return {
        id: reward.id,
        category: reward.category,
        name: reward.name,
        description: reward.description,
        basePrice: reward.basePrice,
        currentPrice: Math.round(currentPrice),
        iconEmoji: reward.iconEmoji,
        discountPercent: discountPercent > 0 ? discountPercent : undefined,
        requiresStreak: reward.requiredStreak,
        maxDailyUse: reward.maxDailyUse,
        availabilityWindow: reward.availabilityWindow
      };
    }).filter(reward => reward.currentPrice > 0); // Filter unavailable items
  }

  // Purchase reward
  static async purchaseReward(request: PurchaseRequest): Promise<{
    success: boolean;
    message: string;
    remainingXP?: number;
    purchaseId?: string;
  }> {
    try {
      const { userId, rewardId, useLoan = false, notes } = request;

      // Get reward definition
      const reward = await prisma.rewardDefinition.findUnique({
        where: { id: rewardId }
      });

      if (!reward) {
        return { success: false, message: 'Reward not found' };
      }

      // Get current balance
      const balance = await this.getBalance(userId);
      
      // Calculate current price (simplified version)
      const currentPrice = reward.basePrice; // TODO: Apply dynamic pricing

      // Check daily/weekly limits
      const today = new Date().toISOString().split('T')[0];
      const todayPurchases = await prisma.xPPurchase.count({
        where: {
          userId,
          rewardType: reward.category,
          rewardName: reward.name,
          purchasedAt: {
            gte: new Date(`${today}T00:00:00.000Z`)
          }
        }
      });

      if (reward.maxDailyUse && todayPurchases >= reward.maxDailyUse) {
        return { success: false, message: `Daily limit reached for ${reward.name}` };
      }

      // Check if can afford or needs loan
      if (balance.canSpend >= currentPrice) {
        // Direct purchase
        return await this.processPurchase(userId, reward, currentPrice, notes);
      } else if (useLoan && balance.canSpend + 1000 >= currentPrice) { // Allow loans up to 1000 XP
        // Loan purchase
        return await this.processLoanPurchase(userId, reward, currentPrice, notes);
      } else {
        return { 
          success: false, 
          message: `Insufficient XP. Need ${currentPrice}, have ${balance.canSpend} available` 
        };
      }

    } catch (error) {
      console.error('Purchase error:', error);
      return { success: false, message: 'Purchase failed. Please try again.' };
    }
  }

  // Process direct XP purchase
  private static async processPurchase(
    userId: string, 
    reward: any, 
    price: number, 
    notes?: string
  ) {
    return await prisma.$transaction(async (tx) => {
      // Deduct XP from balance
      const updatedBalance = await tx.xPBalance.update({
        where: { userId },
        data: {
          currentXP: { decrement: price },
          totalSpent: { increment: price }
        }
      });

      // Create purchase record
      const purchase = await tx.xPPurchase.create({
        data: {
          userId,
          balanceId: updatedBalance.id,
          rewardType: reward.category,
          rewardName: reward.name,
          rewardDescription: reward.description,
          xpCost: price,
          originalPrice: reward.basePrice,
          actualPrice: price,
          usageNotes: notes
        }
      });

      return {
        success: true,
        message: `Successfully purchased ${reward.name}!`,
        remainingXP: updatedBalance.currentXP,
        purchaseId: purchase.id
      };
    });
  }

  // Process loan purchase
  private static async processLoanPurchase(
    userId: string,
    reward: any,
    price: number,
    notes?: string
  ) {
    const loanAmount = price;
    const interestRate = 0.2; // 20% interest
    const totalOwed = Math.round(loanAmount * (1 + interestRate));
    const dueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    return await prisma.$transaction(async (tx) => {
      // Get balance
      const balance = await tx.xPBalance.findUnique({
        where: { userId }
      });

      // Create loan
      const loan = await tx.xPLoan.create({
        data: {
          userId,
          balanceId: balance!.id,
          amount: loanAmount,
          interestRate,
          totalOwed,
          dueDate,
          status: LoanStatus.ACTIVE
        }
      });

      // Create purchase record
      const purchase = await tx.xPPurchase.create({
        data: {
          userId,
          balanceId: balance!.id,
          rewardType: reward.category,
          rewardName: reward.name,
          rewardDescription: reward.description,
          xpCost: price,
          originalPrice: reward.basePrice,
          actualPrice: price,
          isLoan: true,
          loanId: loan.id,
          usageNotes: notes
        }
      });

      // Update pending loans in balance
      await tx.xPBalance.update({
        where: { userId },
        data: {
          pendingLoans: { increment: totalOwed },
          totalSpent: { increment: price }
        }
      });

      return {
        success: true,
        message: `Loan approved! You owe ${totalOwed} XP by ${dueDate.toLocaleDateString()}`,
        remainingXP: balance!.currentXP,
        purchaseId: purchase.id
      };
    });
  }

  // Mark reward as consumed
  static async consumeReward(userId: string, purchaseId: string, satisfaction?: number) {
    const purchase = await prisma.xPPurchase.update({
      where: { 
        id: purchaseId,
        userId // Ensure user owns this purchase
      },
      data: {
        consumed: true,
        consumedAt: new Date(),
        satisfaction
      }
    });

    return purchase;
  }

  // Get purchase history
  static async getPurchaseHistory(userId: string, limit = 50) {
    return await prisma.xPPurchase.findMany({
      where: { userId },
      orderBy: { purchasedAt: 'desc' },
      take: limit,
      include: {
        loan: true
      }
    });
  }

  // Get spending analytics
  static async getSpendingAnalytics(userId: string) {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    const purchases = await prisma.xPPurchase.findMany({
      where: {
        userId,
        purchasedAt: { gte: thirtyDaysAgo }
      }
    });

    const categorySpending = purchases.reduce((acc, purchase) => {
      acc[purchase.rewardType] = (acc[purchase.rewardType] || 0) + purchase.actualPrice;
      return acc;
    }, {} as Record<RewardCategory, number>);

    const totalSpent = purchases.reduce((sum, p) => sum + p.actualPrice, 0);
    const averageDaily = totalSpent / 30;
    const mostExpensive = Math.max(...purchases.map(p => p.actualPrice));
    const averageSatisfaction = purchases
      .filter(p => p.satisfaction)
      .reduce((sum, p) => sum + (p.satisfaction || 0), 0) / purchases.filter(p => p.satisfaction).length;

    return {
      totalSpent,
      averageDaily: Math.round(averageDaily),
      mostExpensive,
      categoryBreakdown: categorySpending,
      averageSatisfaction: isNaN(averageSatisfaction) ? null : Math.round(averageSatisfaction * 10) / 10,
      purchaseCount: purchases.length,
      uniqueRewards: new Set(purchases.map(p => p.rewardName)).size
    };
  }

  // Process loan repayment
  static async repayLoan(userId: string, loanId: string, amount: number) {
    return await prisma.$transaction(async (tx) => {
      const loan = await tx.xPLoan.findUnique({
        where: { id: loanId, userId }
      });

      if (!loan || loan.status !== LoanStatus.ACTIVE) {
        throw new Error('Loan not found or not active');
      }

      const remainingOwed = loan.totalOwed - loan.paidAmount;
      const paymentAmount = Math.min(amount, remainingOwed);

      // Update loan
      const updatedLoan = await tx.xPLoan.update({
        where: { id: loanId },
        data: {
          paidAmount: { increment: paymentAmount },
          status: remainingOwed <= paymentAmount ? LoanStatus.REPAID : LoanStatus.ACTIVE,
          repaidAt: remainingOwed <= paymentAmount ? new Date() : null
        }
      });

      // Update balance
      await tx.xPBalance.update({
        where: { userId },
        data: {
          currentXP: { decrement: paymentAmount },
          pendingLoans: { decrement: paymentAmount }
        }
      });

      return {
        success: true,
        paidAmount: paymentAmount,
        remainingOwed: Math.max(0, remainingOwed - paymentAmount),
        isFullyPaid: remainingOwed <= paymentAmount
      };
    });
  }
}

export default XPStoreService;