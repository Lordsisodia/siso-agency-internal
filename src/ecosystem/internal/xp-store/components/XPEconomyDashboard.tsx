/**
 * XP Economy Dashboard
 * Main interface combining all XP store functionality
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { 
  Wallet, 
  ShoppingCart, 
  History, 
  TrendingUp,
  Star,
  Target,
  Zap,
  Trophy,
  Gift
} from 'lucide-react';
import { XPStoreBalance } from './XPStoreBalance';
import { RewardCatalog } from './RewardCatalog';
import { PurchaseDialog } from './PurchaseDialog';
import { PurchaseHistory } from './PurchaseHistory';
import { XPAnalytics } from './XPAnalytics';
import { useXPStoreContext } from '@/ecosystem/internal/xp-store/context/XPStoreContext';
import { cn } from '@/shared/lib/utils';

interface XPEconomyDashboardProps {
  className?: string;
}

export const XPEconomyDashboard = ({ className }: XPEconomyDashboardProps) => {
  const [selectedTab, setSelectedTab] = useState('overview');
  const [selectedReward, setSelectedReward] = useState<any>(null);
  const [showPurchaseDialog, setShowPurchaseDialog] = useState(false);

  const {
    balance,
    rewards,
    purchaseReward,
    purchaseHistory,
    getNearMissNotifications,
    getSpendingPower
  } = useXPStoreContext();

  const handlePurchase = (rewardId: string) => {
    const reward = rewards?.find(r => r.id === rewardId);
    if (reward) {
      setSelectedReward(reward);
      setShowPurchaseDialog(true);
    }
  };

  const handlePurchaseConfirm = async (options: any) => {
    return await purchaseReward(selectedReward.id, options.useLoan, options.notes);
  };

  const nearMissNotifications = getNearMissNotifications();
  const spendingPower = getSpendingPower();

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-siso-text-bold md:text-4xl">XP Store</h1>
          <p className="text-siso-text-muted text-sm sm:text-base">
            Your earned indulgence economy - transforming productivity into pleasure
          </p>
        </div>
        
        {balance && (
          <div className="md:text-right">
            <div className="text-2xl font-bold text-siso-orange sm:text-3xl">
              {balance.canSpend.toLocaleString()} XP
            </div>
            <div className="text-sm text-siso-text-muted">Available to spend</div>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      {balance && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border border-siso-border bg-siso-bg">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <div className="text-xs uppercase tracking-wide text-siso-text-muted">Rewards Ready</div>
                  <div className="mt-2 text-2xl font-semibold text-siso-text">
                    {spendingPower.canAfford.length}
                  </div>
                  <div className="text-xs text-siso-text-muted mt-1">Redeemable right now</div>
                </div>
                <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
                  <Gift className="h-5 w-5 text-green-400" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border border-siso-border bg-siso-bg">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <div className="text-xs uppercase tracking-wide text-siso-text-muted">Spendable XP</div>
                  <div className="mt-2 text-2xl font-semibold text-siso-text">
                    {balance.canSpend.toLocaleString()}
                  </div>
                  <div className="text-xs text-siso-text-muted mt-1">Safe to trade without touching reserves</div>
                </div>
                <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                  <Wallet className="h-5 w-5 text-emerald-300" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border border-siso-border bg-siso-bg">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <div className="text-xs uppercase tracking-wide text-siso-text-muted">Almost Unlocked</div>
                  <div className="mt-2 text-2xl font-semibold text-siso-text">
                    {Math.min(nearMissNotifications.length, 3)}
                  </div>
                  <div className="text-xs text-siso-text-muted mt-1">Rewards within striking distance</div>
                </div>
                <div className="h-10 w-10 rounded-full bg-orange-500/10 flex items-center justify-center">
                  <Zap className="h-5 w-5 text-orange-400" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="border border-siso-border bg-siso-bg">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <div className="text-xs uppercase tracking-wide text-siso-text-muted">Lifetime XP</div>
                  <div className="mt-2 text-2xl font-semibold text-siso-text">
                    {balance.totalEarned.toLocaleString()}
                  </div>
                  <div className="text-xs text-siso-text-muted mt-1">
                    {purchaseHistory?.length || 0} rewards enjoyed so far
                  </div>
                </div>
                <div className="h-10 w-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                  <Trophy className="h-5 w-5 text-purple-300" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}

      {/* Near Miss Notifications */}
      {nearMissNotifications.length > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-lg p-4 border border-orange-500/20"
        >
          <div className="flex items-center gap-2 mb-3">
            <Zap className="h-5 w-5 text-orange-400" />
            <span className="font-semibold text-orange-400">You're So Close!</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {nearMissNotifications.slice(0, 2).map((notification, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <span className="text-siso-text">
                  {notification.emoji} {notification.reward}
                </span>
                <Badge variant="outline" className="border-orange-500/30 text-orange-400">
                  {notification.xpNeeded} XP away
                </Badge>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Main Content Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="flex w-full flex-wrap gap-2 bg-siso-bg-alt border border-siso-border p-2 sm:flex-nowrap sm:p-1">
          <TabsTrigger 
            value="overview" 
            className="flex-1 min-w-[48%] sm:min-w-0 flex items-center justify-center gap-1 rounded-md px-3 py-2 text-sm sm:text-base data-[state=active]:bg-siso-orange data-[state=active]:text-white"
          >
            <Wallet className="h-4 w-4 mr-1 sm:mr-2" />
            Balance
          </TabsTrigger>
          <TabsTrigger 
            value="store" 
            className="flex-1 min-w-[48%] sm:min-w-0 flex items-center justify-center gap-1 rounded-md px-3 py-2 text-sm sm:text-base data-[state=active]:bg-siso-orange data-[state=active]:text-white"
          >
            <ShoppingCart className="h-4 w-4 mr-1 sm:mr-2" />
            Store
          </TabsTrigger>
          <TabsTrigger 
            value="history" 
            className="flex-1 min-w-[48%] sm:min-w-0 flex items-center justify-center gap-1 rounded-md px-3 py-2 text-sm sm:text-base data-[state=active]:bg-siso-orange data-[state=active]:text-white"
          >
            <History className="h-4 w-4 mr-1 sm:mr-2" />
            History
          </TabsTrigger>
          <TabsTrigger 
            value="analytics" 
            className="flex-1 min-w-[48%] sm:min-w-0 flex items-center justify-center gap-1 rounded-md px-3 py-2 text-sm sm:text-base data-[state=active]:bg-siso-orange data-[state=active]:text-white"
          >
            <TrendingUp className="h-4 w-4 mr-1 sm:mr-2" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="overview" className="mt-0">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              {/* Balance Component */}
              <div className="lg:col-span-2">
                <XPStoreBalance />
              </div>

              {/* Quick Actions */}
              <div className="space-y-4">
                <Card className="bg-siso-bg border-siso-border">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-siso-text-bold">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button
                      onClick={() => setSelectedTab('store')}
                      className="w-full bg-siso-orange hover:bg-siso-red"
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Browse Rewards
                    </Button>
                    
                    <Button
                      variant="outline"
                      onClick={() => setSelectedTab('history')}
                      className="w-full border-siso-border"
                    >
                      <History className="h-4 w-4 mr-2" />
                      View History
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() => setSelectedTab('analytics')}
                      className="w-full border-siso-border"
                    >
                      <TrendingUp className="h-4 w-4 mr-2" />
                      View Analytics
                    </Button>
                  </CardContent>
                </Card>

                {/* Featured Reward */}
                {rewards && rewards.length > 0 && (
                  <Card className="bg-gradient-to-br from-siso-bg to-siso-bg-alt border-siso-border">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-siso-text-bold flex items-center gap-2">
                        <Star className="h-5 w-5 text-siso-orange" />
                        Featured Reward
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {(() => {
                        const featured = rewards[0]; // Get first reward as featured
                        const canAfford = balance && featured.currentPrice <= balance.canSpend;
                        
                        return (
                          <div className="space-y-3">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">{featured.iconEmoji}</span>
                              <div>
                                <h3 className="font-semibold text-siso-text-bold">{featured.name}</h3>
                                <p className="text-sm text-siso-text-muted">{featured.description}</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <span className="text-lg font-bold text-siso-orange">
                                {featured.currentPrice.toLocaleString()} XP
                              </span>
                              <Badge className={cn(
                                canAfford 
                                  ? "bg-green-500/20 text-green-400 border-green-500/20"
                                  : "bg-orange-500/20 text-orange-400 border-orange-500/20"
                              )}>
                                {canAfford ? "Available" : "Saving Up"}
                              </Badge>
                            </div>

                            <Button
                              onClick={() => handlePurchase(featured.id)}
                              disabled={!canAfford}
                              className="w-full"
                            >
                              {canAfford ? "Purchase Now" : "Keep Earning"}
                            </Button>
                          </div>
                        );
                      })()}
                    </CardContent>
                  </Card>
                )}
              </div>
            </motion.div>
          </TabsContent>

          <TabsContent value="store" className="mt-0">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <RewardCatalog onPurchase={handlePurchase} />
            </motion.div>
          </TabsContent>

          <TabsContent value="history" className="mt-0">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <PurchaseHistory />
            </motion.div>
          </TabsContent>

          <TabsContent value="analytics" className="mt-0">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <XPAnalytics />
            </motion.div>
          </TabsContent>
        </div>
      </Tabs>

      {/* Purchase Dialog */}
      <PurchaseDialog
        isOpen={showPurchaseDialog}
        onClose={() => {
          setShowPurchaseDialog(false);
          setSelectedReward(null);
        }}
        reward={selectedReward}
        userBalance={balance}
        onPurchase={handlePurchaseConfirm}
      />
    </div>
  );
};
