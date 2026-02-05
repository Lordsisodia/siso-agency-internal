import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Lock, Sparkles, Flame, Crown, ChevronDown } from 'lucide-react';
import { useXPStoreContext } from '@/domains/lifelock/habits/gamification/1-earn/hooks/XPStoreContext';
import { xpStoreService, RewardItem } from '@/domains/lifelock/habits/gamification/services/xpStoreService';
import { PurchaseConfirmationModal } from '../../../2-spend/ui/components/PurchaseConfirmationModal';
import { cn } from '@/lib/utils';

export const XPEconomyDashboard: React.FC = () => {
  const { balance } = useXPStoreContext();
  const [rewards, setRewards] = useState<RewardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [pendingPurchase, setPendingPurchase] = useState<RewardItem | null>(null);

  useEffect(() => {
    const loadRewards = async () => {
      try {
        const loadedRewards = await xpStoreService.getAvailableRewards('default');
        setRewards(loadedRewards);
      } catch (error) {
        console.error('Failed to load rewards:', error);
      } finally {
        setLoading(false);
      }
    };
    loadRewards();
  }, []);

  const categories = ['ALL', 'INDULGENCE', 'RECOVERY', 'SOCIAL', 'FOOD', 'ENTERTAINMENT', 'WELLNESS', 'REST', 'GROWTH'];

  const filteredRewards = selectedCategory === 'ALL'
    ? rewards
    : rewards.filter(reward => reward.category === selectedCategory);

  const canAfford = (price: number) => (balance?.canSpend || 0) >= price;

  const handlePurchaseClick = (reward: RewardItem) => {
    if (!canAfford(reward.currentPrice)) return;
    setPendingPurchase(reward);
  };

  const handleConfirmPurchase = async () => {
    if (!pendingPurchase) return;

    const result = await xpStoreService.purchaseReward({
      userId: 'default',
      rewardId: pendingPurchase.id,
    });

    if (result.success) {
      
    } else {
      console.error('Purchase failed:', result.message);
    }

    setPendingPurchase(null);
  };

  const handleCloseModal = () => {
    setPendingPurchase(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-siso-orange border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Category Filter - Mobile Dropdown */}
      <div className="relative">
        <button
          onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
          className="w-full flex items-center justify-between px-4 py-3 bg-siso-bg-alt border border-siso-border rounded-xl"
        >
          <span className="font-medium text-siso-text-bold">
            {selectedCategory === 'ALL' ? 'All Rewards' : selectedCategory}
          </span>
          <ChevronDown className={cn(
            "h-5 w-5 text-siso-text-muted transition-transform",
            showCategoryDropdown && "rotate-180"
          )} />
        </button>

        <AnimatePresence>
          {showCategoryDropdown && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 z-10"
                onClick={() => setShowCategoryDropdown(false)}
              />
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute z-20 w-full mt-2 bg-siso-bg border border-siso-border rounded-xl shadow-xl overflow-hidden"
              >
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => {
                      setSelectedCategory(category);
                      setShowCategoryDropdown(false);
                    }}
                    className={cn(
                      "w-full px-4 py-3 text-left font-medium transition-colors",
                      selectedCategory === category
                        ? "bg-siso-orange text-white"
                        : "text-siso-text hover:bg-siso-bg-alt"
                    )}
                  >
                    {category === 'ALL' ? 'All Rewards' : category}
                  </button>
                ))}
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Rewards List - Vertical Stack for Mobile */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {filteredRewards.map((reward, index) => {
            const affordable = canAfford(reward.currentPrice);
            const isHighValue = reward.currentPrice >= 5000;

            return (
              <motion.div
                key={reward.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ delay: index * 0.03 }}
                layout
              >
                <div
                  className={cn(
                    "relative overflow-hidden rounded-2xl border-2 transition-all",
                    affordable
                      ? "bg-siso-bg border-siso-orange/30 hover:border-siso-orange/50"
                      : "bg-siso-bg-alt border-siso-border opacity-60"
                  )}
                >
                  {/* Premium indicator for high-value items */}
                  {isHighValue && affordable && (
                    <div className="absolute top-0 right-0 px-3 py-1 bg-gradient-to-r from-yellow-500 to-amber-500 rounded-bl-xl">
                      <span className="text-xs font-bold text-black flex items-center gap-1">
                        <Crown className="h-3 w-3" />
                        PREMIUM
                      </span>
                    </div>
                  )}

                  <div className="p-4">
                    {/* Main Content */}
                    <div className="flex gap-4">
                      {/* Icon */}
                      <div className={cn(
                        "flex-shrink-0 w-16 h-16 rounded-xl flex items-center justify-center text-3xl",
                        affordable
                          ? "bg-siso-orange/10"
                          : "bg-siso-border"
                      )}>
                        {reward.iconEmoji}
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div className="flex-1 min-w-0">
                            <h3 className={cn(
                              "font-bold text-lg leading-tight",
                              affordable ? "text-siso-text-bold" : "text-siso-text-muted"
                            )}>
                              {reward.name}
                            </h3>
                            <p className="text-xs text-siso-text-muted mt-0.5 uppercase tracking-wide">
                              {reward.category}
                            </p>
                          </div>
                        </div>

                        <p className="text-sm text-siso-text-muted leading-relaxed line-clamp-2 mb-3">
                          {reward.description}
                        </p>

                        {/* Bottom Row: Price + Button */}
                        <div className="flex items-center justify-between gap-3">
                          {/* Price */}
                          <div className="flex items-center gap-2">
                            {affordable ? (
                              <Sparkles className="h-4 w-4 text-siso-orange" />
                            ) : (
                              <Lock className="h-4 w-4 text-siso-text-muted" />
                            )}
                            <div>
                              <div className={cn(
                                "text-xl font-bold leading-none",
                                affordable ? "text-siso-orange" : "text-siso-text-muted"
                              )}>
                                {reward.currentPrice.toLocaleString()}
                              </div>
                              <div className="text-[10px] text-siso-text-muted uppercase tracking-wide">
                                XP
                              </div>
                            </div>
                          </div>

                          {/* Redeem Button */}
                          <button
                            onClick={() => handlePurchaseClick(reward)}
                            disabled={!affordable}
                            className={cn(
                              "flex-shrink-0 px-6 py-3 rounded-xl font-bold text-sm transition-all",
                              affordable
                                ? "bg-siso-orange text-white hover:bg-siso-orange/90 active:scale-95"
                                : "bg-siso-border text-siso-text-muted cursor-not-allowed"
                            )}
                          >
                            {affordable ? 'Redeem' : <Lock className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Weekly Badge */}
                    {reward.availabilityWindow === 'weekly' && (
                      <div className="mt-3 pt-3 border-t border-siso-border">
                        <div className="flex items-center gap-1.5 text-xs text-siso-text-muted">
                          <Flame className="h-3 w-3 text-siso-orange" />
                          <span>Available once per week</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {filteredRewards.length === 0 && (
        <div className="text-center py-16 px-4">
          <ShoppingCart className="h-16 w-16 text-siso-text-muted/30 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-siso-text-muted mb-2">No rewards found</h3>
          <p className="text-sm text-siso-text-muted/60">Try selecting a different category</p>
        </div>
      )}

      {/* Purchase Confirmation Modal */}
      {pendingPurchase && (
        <PurchaseConfirmationModal
          isOpen={!!pendingPurchase}
          onClose={handleCloseModal}
          onConfirm={handleConfirmPurchase}
          rewardName={pendingPurchase.name}
          rewardCost={pendingPurchase.currentPrice}
          rewardEmoji={pendingPurchase.iconEmoji}
          isHighValue={pendingPurchase.currentPrice >= 5000}
        />
      )}
    </div>
  );
};

export default XPEconomyDashboard;
