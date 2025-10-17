/**
 * XP Store Balance Component
 * Displays user's current XP balance, spending power, and psychology insights
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Progress } from '@/shared/ui/progress';
import { Button } from '@/shared/ui/button';
import { 
  Coins, 
  TrendingUp, 
  Target, 
  Shield, 
  AlertCircle,
  Zap,
  Trophy,
  Flame
} from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { useXPStoreContext } from '@/ecosystem/internal/xp-store/context/XPStoreContext';

interface XPStoreBalanceProps {
  className?: string;
}

export const XPStoreBalance = ({ className }: XPStoreBalanceProps) => {
  const { 
    balance, 
    loading, 
    error, 
    getNearMissNotifications, 
    getSpendingPower 
  } = useXPStoreContext();

  const [showDetails, setShowDetails] = useState(false);
  const [celebrateBalance, setCelebrateBalance] = useState(false);

  const nearMissNotifications = getNearMissNotifications();
  const spendingPower = getSpendingPower();

  // Celebrate when balance increases
  useEffect(() => {
    if (balance?.currentXP) {
      setCelebrateBalance(true);
      const timer = setTimeout(() => setCelebrateBalance(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [balance?.currentXP]);

  if (loading) {
    return (
      <Card className={cn("w-full", className)}>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-siso-bg-alt rounded"></div>
            <div className="h-20 bg-siso-bg-alt rounded"></div>
            <div className="h-4 bg-siso-bg-alt rounded w-3/4"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !balance) {
    return (
      <Card className={cn("w-full border-red-500/20", className)}>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 text-red-400">
            <AlertCircle className="h-5 w-5" />
            <span>Unable to load XP balance</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const progressToNextMilestone = Math.min(100, (balance.currentXP % 1000) / 10);
  const nextMilestone = Math.ceil(balance.currentXP / 1000) * 1000;

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Main Balance Card */}
      <Card className="w-full bg-gradient-to-br from-siso-bg to-siso-bg-alt border-siso-border">
        <CardHeader className="pb-3">
          <CardTitle className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <motion.div
                animate={celebrateBalance ? { scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] } : {}}
                transition={{ duration: 0.5 }}
              >
                <Coins className="h-6 w-6 text-siso-orange" />
              </motion.div>
              <span className="text-siso-text-bold">XP Balance</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
              className="text-siso-text-muted hover:text-siso-text w-full sm:w-auto justify-start sm:justify-center"
            >
              {showDetails ? 'Hide Details' : 'Show Details'}
            </Button>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Current Balance Display */}
          <div className="text-center space-y-2">
            <motion.div 
              className="text-4xl font-bold text-siso-orange"
              animate={celebrateBalance ? { scale: [1, 1.1, 1] } : {}}
            >
              {balance.currentXP.toLocaleString()}
            </motion.div>
            <div className="text-sm text-siso-text-muted">
              Total XP Earned: {balance.totalEarned.toLocaleString()}
            </div>
          </div>

          {/* Spending Power */}
          <div className="bg-siso-bg-alt rounded-lg p-4 space-y-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-siso-text font-medium">Available to Spend</span>
              <Badge 
                variant="outline" 
                className="bg-green-500/20 text-green-400 border-green-500/20 w-max"
              >
                <Coins className="h-3 w-3 mr-1" />
                {balance.canSpend.toLocaleString()} XP
              </Badge>
            </div>
            
            {balance.reserveXP > 0 && (
              <div className="text-xs text-siso-text-muted flex items-center gap-1">
                <Shield className="h-3 w-3" />
                Reserve Fund: {balance.reserveXP.toLocaleString()} XP (protected)
              </div>
            )}
            
            {balance.pendingLoans > 0 && (
              <div className="text-xs text-red-400 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Outstanding Loans: {balance.pendingLoans.toLocaleString()} XP
              </div>
            )}
          </div>

          {/* Progress to Next Milestone */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-siso-text-muted">Next Milestone</span>
              <span className="text-siso-text font-medium">{nextMilestone.toLocaleString()} XP</span>
            </div>
            <Progress 
              value={progressToNextMilestone} 
              className="h-2 bg-siso-bg-alt"
            />
            <div className="text-xs text-siso-text-muted text-center">
              {nextMilestone - balance.currentXP} XP to go
            </div>
          </div>

          {/* Near Miss Notifications */}
          <AnimatePresence>
            {nearMissNotifications.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-lg p-3 border border-orange-500/20"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Flame className="h-4 w-4 text-orange-400" />
                  <span className="text-sm font-medium text-orange-400">So Close!</span>
                </div>
                {nearMissNotifications.slice(0, 2).map((notification, index) => (
                  <div key={index} className="text-sm text-siso-text">
                    {notification.emoji} Just <span className="font-bold text-orange-400">
                      {notification.xpNeeded} XP
                    </span> away from {notification.reward}!
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Spending Power Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
            <div className="bg-green-500/10 rounded p-2 text-center">
              <div className="font-bold text-green-400">{spendingPower.canAfford.length}</div>
              <div className="text-green-400/70">Can Afford</div>
            </div>
            <div className="bg-orange-500/10 rounded p-2 text-center">
              <div className="font-bold text-orange-400">{spendingPower.almostAfford.length}</div>
              <div className="text-orange-400/70">Almost There</div>
            </div>
            <div className="bg-purple-500/10 rounded p-2 text-center">
              <div className="font-bold text-purple-400">{spendingPower.dreamRewards.length}</div>
              <div className="text-purple-400/70">Dream Goals</div>
            </div>
          </div>

          {/* Detailed Breakdown */}
          <AnimatePresence>
            {showDetails && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3 pt-3 border-t border-siso-border"
              >
                <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
                  <div>
                    <div className="text-siso-text-muted">Total Earned</div>
                    <div className="font-bold text-green-400">
                      {balance.totalEarned.toLocaleString()} XP
                    </div>
                  </div>
                  <div>
                    <div className="text-siso-text-muted">Total Spent</div>
                    <div className="font-bold text-blue-400">
                      {balance.totalSpent.toLocaleString()} XP
                    </div>
                  </div>
                </div>

                {/* Spending Efficiency */}
                {balance.totalEarned > 0 && (
                  <div className="bg-siso-bg-alt rounded p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-siso-text-muted">Spending Efficiency</span>
                      <Trophy className="h-4 w-4 text-siso-orange" />
                    </div>
                    <div className="text-lg font-bold text-siso-text">
                      {((balance.totalSpent / balance.totalEarned) * 100).toFixed(1)}%
                    </div>
                    <div className="text-xs text-siso-text-muted">
                      You've spent {balance.totalSpent.toLocaleString()} of {balance.totalEarned.toLocaleString()} earned XP
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
};
