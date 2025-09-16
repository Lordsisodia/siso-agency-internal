/**
 * Reward Catalog Component
 * Displays available rewards with dynamic pricing and psychology features
 */

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Input } from '@/shared/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select';
import { 
  Search,
  Filter,
  Clock,
  TrendingUp,
  TrendingDown,
  Star,
  Zap,
  Lock,
  Unlock,
  AlertTriangle
} from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { useXPStore } from '@/shared/hooks/useXPStore';

interface RewardCatalogProps {
  userId: string;
  onPurchase: (rewardId: string) => void;
  className?: string;
}

export const RewardCatalog = ({ userId, onPurchase, className }: RewardCatalogProps) => {
  const { rewards, balance, loading, error } = useXPStore(userId);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'price' | 'popularity' | 'satisfaction'>('price');
  const [priceFilter, setPriceFilter] = useState<'all' | 'affordable' | 'saving'>('all');

  // Filter and sort rewards
  const filteredRewards = useMemo(() => {
    if (!rewards) return [];

    const filtered = rewards.filter(reward => {
      // Search filter
      if (searchTerm && !reward.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !reward.description.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }

      // Category filter
      if (selectedCategory !== 'all' && reward.category !== selectedCategory.toUpperCase()) {
        return false;
      }

      // Price filter
      if (balance) {
        if (priceFilter === 'affordable' && reward.currentPrice > balance.canSpend) {
          return false;
        }
        if (priceFilter === 'saving' && reward.currentPrice <= balance.canSpend) {
          return false;
        }
      }

      return true;
    });

    // Sort rewards
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return a.currentPrice - b.currentPrice;
        case 'popularity':
          return (b.purchaseCount || 0) - (a.purchaseCount || 0);
        case 'satisfaction':
          return (b.avgSatisfaction || 0) - (a.avgSatisfaction || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [rewards, searchTerm, selectedCategory, sortBy, priceFilter, balance]);

  // Get unique categories
  const categories = useMemo(() => {
    if (!rewards) return [];
    const uniqueCategories = [...new Set(rewards.map(r => r.category))];
    return uniqueCategories.map(category => ({
      value: category.toLowerCase(),
      label: category.charAt(0) + category.slice(1).toLowerCase(),
      count: rewards.filter(r => r.category === category).length
    }));
  }, [rewards]);

  const getRewardAffordability = (reward: any) => {
    if (!balance) return 'unknown';
    if (reward.currentPrice <= balance.canSpend) return 'affordable';
    if (reward.currentPrice <= balance.canSpend + 200) return 'close';
    return 'saving';
  };

  const getPriceChangeIndicator = (reward: any) => {
    if (!reward.basePrice || reward.currentPrice === reward.basePrice) return null;
    
    const change = reward.currentPrice - reward.basePrice;
    const percentChange = (change / reward.basePrice) * 100;
    
    return {
      isIncrease: change > 0,
      amount: Math.abs(change),
      percent: Math.abs(percentChange),
      reason: change > 0 ? 'High demand' : 'Streak bonus'
    };
  };

  if (loading) {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="animate-pulse grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-siso-bg-alt rounded-lg h-48"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !rewards) {
    return (
      <Card className={cn("w-full border-red-500/20", className)}>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 text-red-400">
            <AlertTriangle className="h-5 w-5" />
            <span>Unable to load rewards</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Filters and Search */}
      <Card className="bg-siso-bg border-siso-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-siso-text-bold">Reward Store</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-siso-text-muted h-4 w-4" />
            <Input
              placeholder="Search rewards..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-siso-bg-alt border-siso-border"
            />
          </div>

          {/* Filter Controls */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="bg-siso-bg-alt border-siso-border">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories ({rewards.length})</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label} ({category.count})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger className="bg-siso-bg-alt border-siso-border">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="price">Price (Low to High)</SelectItem>
                <SelectItem value="popularity">Most Popular</SelectItem>
                <SelectItem value="satisfaction">Highest Rated</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priceFilter} onValueChange={(value: any) => setPriceFilter(value)}>
              <SelectTrigger className="bg-siso-bg-alt border-siso-border">
                <SelectValue placeholder="Affordability" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Rewards</SelectItem>
                <SelectItem value="affordable">Can Afford Now</SelectItem>
                <SelectItem value="saving">Saving Up For</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Rewards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence mode="popLayout">
          {filteredRewards.map((reward, index) => {
            const affordability = getRewardAffordability(reward);
            const priceChange = getPriceChangeIndicator(reward);
            
            return (
              <motion.div
                key={reward.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ 
                  duration: 0.3,
                  delay: index * 0.05,
                  layout: { type: "spring", stiffness: 300, damping: 30 }
                }}
              >
                <Card className={cn(
                  "h-full transition-all duration-200 hover:shadow-lg",
                  "bg-gradient-to-br from-siso-bg to-siso-bg-alt border-siso-border",
                  affordability === 'affordable' && "ring-2 ring-green-500/20",
                  affordability === 'close' && "ring-2 ring-orange-500/20"
                )}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{reward.iconEmoji}</span>
                        <div>
                          <h3 className="font-semibold text-siso-text-bold">{reward.name}</h3>
                          <p className="text-sm text-siso-text-muted">
                            {reward.category.charAt(0) + reward.category.slice(1).toLowerCase()}
                          </p>
                        </div>
                      </div>
                      
                      {/* Affordability Badge */}
                      {affordability === 'affordable' && (
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/20">
                          <Unlock className="h-3 w-3 mr-1" />
                          Available
                        </Badge>
                      )}
                      {affordability === 'close' && (
                        <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/20">
                          <Zap className="h-3 w-3 mr-1" />
                          Almost
                        </Badge>
                      )}
                      {affordability === 'saving' && (
                        <Badge variant="outline" className="border-siso-border">
                          <Lock className="h-3 w-3 mr-1" />
                          Saving
                        </Badge>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <p className="text-sm text-siso-text">{reward.description}</p>

                    {/* Price Information */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-siso-orange">
                            {reward.currentPrice.toLocaleString()} XP
                          </span>
                          {priceChange && (
                            <div className="flex items-center gap-1">
                              {priceChange.isIncrease ? (
                                <TrendingUp className="h-3 w-3 text-red-400" />
                              ) : (
                                <TrendingDown className="h-3 w-3 text-green-400" />
                              )}
                              <span className={cn(
                                "text-xs",
                                priceChange.isIncrease ? "text-red-400" : "text-green-400"
                              )}>
                                {priceChange.percent.toFixed(0)}%
                              </span>
                            </div>
                          )}
                        </div>
                        
                        {reward.avgSatisfaction && (
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 text-yellow-400" />
                            <span className="text-xs text-siso-text-muted">
                              {reward.avgSatisfaction.toFixed(1)}
                            </span>
                          </div>
                        )}
                      </div>

                      {priceChange && (
                        <div className="text-xs text-siso-text-muted">
                          {priceChange.reason} • Base: {reward.basePrice.toLocaleString()} XP
                        </div>
                      )}

                      {balance && affordability === 'saving' && (
                        <div className="text-xs text-orange-400">
                          Need {(reward.currentPrice - balance.canSpend).toLocaleString()} more XP
                        </div>
                      )}
                    </div>

                    {/* Availability & Restrictions */}
                    {reward.restrictions && (
                      <div className="text-xs text-siso-text-muted flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {reward.restrictions}
                      </div>
                    )}

                    {/* Purchase Button */}
                    <Button
                      onClick={() => onPurchase(reward.id)}
                      disabled={affordability === 'saving'}
                      className={cn(
                        "w-full transition-all duration-200",
                        affordability === 'affordable' && "bg-green-600 hover:bg-green-700",
                        affordability === 'close' && "bg-orange-600 hover:bg-orange-700"
                      )}
                    >
                      {affordability === 'affordable' && "Purchase Now"}
                      {affordability === 'close' && "Almost Affordable"}
                      {affordability === 'saving' && "Keep Earning"}
                    </Button>

                    {/* Usage Stats */}
                    {(reward.purchaseCount || reward.lastPurchased) && (
                      <div className="text-xs text-siso-text-muted space-y-1 pt-2 border-t border-siso-border">
                        {reward.purchaseCount && (
                          <div>Purchased {reward.purchaseCount} times</div>
                        )}
                        {reward.lastPurchased && (
                          <div>Last used: {new Date(reward.lastPurchased).toLocaleDateString()}</div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {filteredRewards.length === 0 && (
        <Card className="bg-siso-bg border-siso-border">
          <CardContent className="p-8 text-center">
            <div className="space-y-2">
              <Filter className="h-12 w-12 text-siso-text-muted mx-auto" />
              <h3 className="text-lg font-semibold text-siso-text-bold">No rewards found</h3>
              <p className="text-siso-text-muted">
                Try adjusting your filters or search terms
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                  setPriceFilter('all');
                }}
                className="mt-4"
              >
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};