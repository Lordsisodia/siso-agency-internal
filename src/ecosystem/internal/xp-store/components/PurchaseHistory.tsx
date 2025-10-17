/**
 * Purchase History Component
 * Displays user's XP spending history with satisfaction tracking
 */

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Input } from '@/shared/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select';
import { Calendar } from '@/ecosystem/internal/calendar/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover';
import { 
  Search,
  Calendar as CalendarIcon,
  Star,
  TrendingUp,
  TrendingDown,
  Filter,
  Clock,
  Gift,
  CreditCard,
  Heart,
  BarChart3,
  Smile,
  Meh,
  Frown
} from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { format } from 'date-fns';
import { useXPStoreContext } from '@/ecosystem/internal/xp-store/context/XPStoreContext';

interface PurchaseHistoryProps {
  className?: string;
}

export const PurchaseHistory = ({ className }: PurchaseHistoryProps) => {
  const { purchaseHistory, loading, error } = useXPStoreContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'price' | 'satisfaction'>('date');
  const [dateRange, setDateRange] = useState<any>(null);
  const [showCalendar, setShowCalendar] = useState(false);

  // Filter and sort purchase history
  const filteredHistory = useMemo(() => {
    if (!purchaseHistory) return [];

    const filtered = purchaseHistory.filter(purchase => {
      // Search filter
      if (searchTerm && !purchase.rewardName.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }

      // Category filter
      if (selectedCategory !== 'all' && purchase.category !== selectedCategory.toUpperCase()) {
        return false;
      }

      // Date range filter
      if (dateRange?.from && dateRange?.to) {
        const purchaseDate = new Date(purchase.purchasedAt);
        if (purchaseDate < dateRange.from || purchaseDate > dateRange.to) {
          return false;
        }
      }

      return true;
    });

    // Sort purchases
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.purchasedAt).getTime() - new Date(a.purchasedAt).getTime();
        case 'price':
          return b.xpCost - a.xpCost;
        case 'satisfaction':
          return (b.satisfactionRating || 0) - (a.satisfactionRating || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [purchaseHistory, searchTerm, selectedCategory, sortBy, dateRange]);

  // Get unique categories
  const categories = useMemo(() => {
    if (!purchaseHistory) return [];
    const uniqueCategories = [...new Set(purchaseHistory.map(p => p.category))];
    return uniqueCategories.map(category => ({
      value: category.toLowerCase(),
      label: category.charAt(0) + category.slice(1).toLowerCase(),
      count: purchaseHistory.filter(p => p.category === category).length
    }));
  }, [purchaseHistory]);

  // Calculate summary stats
  const summaryStats = useMemo(() => {
    if (!filteredHistory.length) return null;

    const totalSpent = filteredHistory.reduce((sum, p) => sum + p.xpCost, 0);
    const avgSatisfaction = filteredHistory
      .filter(p => p.satisfactionRating)
      .reduce((sum, p, _, arr) => sum + (p.satisfactionRating || 0) / arr.length, 0);
    
    const mostExpensive = filteredHistory.reduce((max, p) => 
      p.xpCost > max.xpCost ? p : max, filteredHistory[0]);
    
    const favoriteCategory = categories.reduce((max, cat) => 
      cat.count > max.count ? cat : max, { count: 0, label: 'None' });

    return {
      totalSpent,
      avgSatisfaction,
      mostExpensive,
      favoriteCategory: favoriteCategory.label
    };
  }, [filteredHistory, categories]);

  const getSatisfactionIcon = (rating?: number) => {
    if (!rating) return <Meh className="h-4 w-4 text-gray-400" />;
    if (rating >= 8) return <Smile className="h-4 w-4 text-green-400" />;
    if (rating >= 6) return <Meh className="h-4 w-4 text-yellow-400" />;
    return <Frown className="h-4 w-4 text-red-400" />;
  };

  const getSatisfactionColor = (rating?: number) => {
    if (!rating) return 'text-gray-400';
    if (rating >= 8) return 'text-green-400';
    if (rating >= 6) return 'text-yellow-400';
    return 'text-red-400';
  };

  if (loading) {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-siso-bg-alt rounded-lg h-24"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !purchaseHistory) {
    return (
      <Card className={cn("w-full border-red-500/20", className)}>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 text-red-400">
            <Gift className="h-5 w-5" />
            <span>Unable to load purchase history</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Summary Stats */}
      {summaryStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Gift className="h-5 w-5 text-blue-400" />
                <div>
                  <div className="text-lg font-bold text-blue-400">
                    {filteredHistory.length}
                  </div>
                  <div className="text-xs text-blue-400/70">Rewards Enjoyed</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border-orange-500/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-orange-400" />
                <div>
                  <div className="text-lg font-bold text-orange-400">
                    {summaryStats.totalSpent.toLocaleString()}
                  </div>
                  <div className="text-xs text-orange-400/70">XP Spent</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-green-400" />
                <div>
                  <div className="text-lg font-bold text-green-400">
                    {summaryStats.avgSatisfaction.toFixed(1)}/10
                  </div>
                  <div className="text-xs text-green-400/70">Avg Satisfaction</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-purple-400" />
                <div>
                  <div className="text-lg font-bold text-purple-400">
                    {summaryStats.favoriteCategory}
                  </div>
                  <div className="text-xs text-purple-400/70">Favorite Category</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card className="bg-siso-bg border-siso-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-siso-text-bold">Purchase History</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-siso-text-muted h-4 w-4" />
              <Input
                placeholder="Search purchases..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-siso-bg-alt border-siso-border"
              />
            </div>

            {/* Category Filter */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="bg-siso-bg-alt border-siso-border">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label} ({category.count})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger className="bg-siso-bg-alt border-siso-border">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Most Recent</SelectItem>
                <SelectItem value="price">Highest Cost</SelectItem>
                <SelectItem value="satisfaction">Most Satisfying</SelectItem>
              </SelectContent>
            </Select>

            {/* Date Range */}
            <Popover open={showCalendar} onOpenChange={setShowCalendar}>
              <PopoverTrigger asChild>
                <Button 
                  variant="outline" 
                  className="bg-siso-bg-alt border-siso-border justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "LLL dd")} -{" "}
                        {format(dateRange.to, "LLL dd")}
                      </>
                    ) : (
                      format(dateRange.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Pick a date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Clear Filters */}
          {(searchTerm || selectedCategory !== 'all' || dateRange) && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
                setDateRange(null);
              }}
              className="border-siso-border"
            >
              Clear Filters
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Purchase List */}
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {filteredHistory.map((purchase, index) => (
            <motion.div
              key={purchase.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="bg-gradient-to-r from-siso-bg to-siso-bg-alt border-siso-border hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      {/* Reward Info */}
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{purchase.iconEmoji}</span>
                        <div>
                          <h3 className="font-semibold text-siso-text-bold">
                            {purchase.rewardName}
                          </h3>
                          <p className="text-sm text-siso-text-muted">
                            {purchase.category.charAt(0) + purchase.category.slice(1).toLowerCase()}
                          </p>
                          {purchase.notes && (
                            <p className="text-xs text-siso-text-muted italic mt-1">
                              "{purchase.notes}"
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Purchase Details */}
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Cost */}
                        <div>
                          <div className="text-lg font-bold text-siso-orange">
                            {purchase.xpCost.toLocaleString()} XP
                          </div>
                          {purchase.usedLoan && (
                            <Badge variant="outline" className="border-orange-500/30 text-orange-400 text-xs">
                              <CreditCard className="h-3 w-3 mr-1" />
                              Loan Used
                            </Badge>
                          )}
                        </div>

                        {/* Date */}
                        <div>
                          <div className="text-sm text-siso-text">
                            {format(new Date(purchase.purchasedAt), 'MMM d, yyyy')}
                          </div>
                          <div className="text-xs text-siso-text-muted flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {format(new Date(purchase.purchasedAt), 'h:mm a')}
                          </div>
                        </div>

                        {/* Satisfaction */}
                        <div className="flex items-center gap-2">
                          {getSatisfactionIcon(purchase.satisfactionRating)}
                          {purchase.satisfactionRating ? (
                            <div>
                              <div className={cn("text-sm font-medium", getSatisfactionColor(purchase.satisfactionRating))}>
                                {purchase.satisfactionRating}/10
                              </div>
                              <div className="text-xs text-siso-text-muted">Satisfaction</div>
                            </div>
                          ) : (
                            <div className="text-xs text-siso-text-muted">Not rated</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Additional Purchase Metadata */}
                  {(purchase.purchaseMethod || purchase.timeOfDay) && (
                    <div className="mt-3 pt-3 border-t border-siso-border text-xs text-siso-text-muted">
                      <div className="flex items-center gap-4">
                        {purchase.purchaseMethod && (
                          <span>Purchase: {purchase.purchaseMethod}</span>
                        )}
                        {purchase.timeOfDay && (
                          <span>Time of day: {purchase.timeOfDay}</span>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {filteredHistory.length === 0 && (
        <Card className="bg-siso-bg border-siso-border">
          <CardContent className="p-8 text-center">
            <Gift className="h-12 w-12 text-siso-text-muted mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-siso-text-bold mb-2">
              {purchaseHistory.length === 0 ? 'No purchases yet' : 'No purchases found'}
            </h3>
            <p className="text-siso-text-muted mb-4">
              {purchaseHistory.length === 0 
                ? 'Start earning XP and treat yourself to your first reward!' 
                : 'Try adjusting your filters to see more results'}
            </p>
            {purchaseHistory.length === 0 && (
              <Button 
                onClick={() => {/* Navigate to store */}}
                className="bg-siso-orange hover:bg-siso-red"
              >
                Browse Rewards
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
