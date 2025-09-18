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
  Gift,
  Calendar
} from 'lucide-react';
import { XPStoreBalance } from './XPStoreBalance';
import { RewardCatalog } from './RewardCatalog';
import { PurchaseDialog } from './PurchaseDialog';
import { PurchaseHistory } from './PurchaseHistory';
import { XPAnalytics } from './XPAnalytics';
import { useXPStore } from '@/ecosystem/internal/xp-store/hooks/useXPStore';
import { cn } from '@/shared/lib/utils';

interface XPEconomyDashboardProps {
  userId: string;
  className?: string;
}

export const XPEconomyDashboard = ({ userId, className }: XPEconomyDashboardProps) => {
  const [selectedTab, setSelectedTab] = useState('overview');
  const [selectedReward, setSelectedReward] = useState<any>(null);
  const [showPurchaseDialog, setShowPurchaseDialog] = useState(false);

  const { 
    balance, 
    rewards, 
    purchaseReward, 
    purchaseHistory,
    analytics,
    loading,
    error,
    getNearMissNotifications,
    getSpendingPower
  } = useXPStore(userId);

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-siso-text-bold">XP Store</h1>
          <p className="text-siso-text-muted">
            Your earned indulgence economy - transforming productivity into pleasure
          </p>
        </div>
        
        {balance && (
          <div className="text-right">
            <div className="text-2xl font-bold text-siso-orange">
              {balance.canSpend.toLocaleString()} XP
            </div>
            <div className="text-sm text-siso-text-muted">Available to spend</div>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      {balance && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-green-400" />
                  <div>
                    <div className="text-lg font-bold text-green-400">
                      {spendingPower.canAfford.length}
                    </div>
                    <div className="text-xs text-green-400/70">Can Afford</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border-orange-500/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-orange-400" />
                  <div>
                    <div className="text-lg font-bold text-orange-400">
                      {spendingPower.almostAfford.length}
                    </div>
                    <div className="text-xs text-orange-400/70">Almost There</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-purple-400" />
                  <div>
                    <div className="text-lg font-bold text-purple-400">
                      {balance.totalEarned.toLocaleString()}
                    </div>
                    <div className="text-xs text-purple-400/70">Total Earned</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Gift className="h-5 w-5 text-blue-400" />
                  <div>
                    <div className="text-lg font-bold text-blue-400">
                      {purchaseHistory?.length || 0}
                    </div>
                    <div className="text-xs text-blue-400/70">Rewards Enjoyed</div>
                  </div>
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
        <TabsList className="grid w-full grid-cols-4 bg-siso-bg-alt border border-siso-border">
          <TabsTrigger 
            value="overview" 
            className="data-[state=active]:bg-siso-orange data-[state=active]:text-white"
          >
            <Wallet className="h-4 w-4 mr-2" />
            Balance
          </TabsTrigger>
          <TabsTrigger 
            value="store" 
            className="data-[state=active]:bg-siso-orange data-[state=active]:text-white"
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Store
          </TabsTrigger>
          <TabsTrigger 
            value="history" 
            className="data-[state=active]:bg-siso-orange data-[state=active]:text-white"
          >
            <History className="h-4 w-4 mr-2" />
            History
          </TabsTrigger>
          <TabsTrigger 
            value="analytics" 
            className="data-[state=active]:bg-siso-orange data-[state=active]:text-white"
          >
            <TrendingUp className="h-4 w-4 mr-2" />
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
                <XPStoreBalance userId={userId} />
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
              <RewardCatalog userId={userId} onPurchase={handlePurchase} />
            </motion.div>
          </TabsContent>

          <TabsContent value="history" className="mt-0">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <PurchaseHistory userId={userId} />
            </motion.div>
          </TabsContent>

          <TabsContent value="analytics" className="mt-0">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <XPAnalytics userId={userId} />
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