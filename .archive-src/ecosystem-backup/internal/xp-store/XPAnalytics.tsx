/**
 * XP Analytics Component
 * Displays spending patterns, psychology insights, and behavioral analytics
 */

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Progress } from '@/shared/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select';
import { 
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Target,
  Brain,
  Heart,
  Zap,
  Clock,
  Calendar,
  Award,
  AlertCircle,
  CheckCircle,
  Info
} from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { useXPStore } from '@/shared/hooks/useXPStore';

interface XPAnalyticsProps {
  userId: string;
  className?: string;
}

export const XPAnalytics = ({ userId, className }: XPAnalyticsProps) => {
  const { purchaseHistory, balance, analytics, loading } = useXPStore(userId);
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const [selectedTab, setSelectedTab] = useState('overview');

  // Calculate analytics data
  const analyticsData = useMemo(() => {
    if (!purchaseHistory || !balance) return null;

    const now = new Date();
    const periodDays = selectedPeriod === '7d' ? 7 : 
                     selectedPeriod === '30d' ? 30 :
                     selectedPeriod === '90d' ? 90 : Infinity;
    
    const cutoffDate = selectedPeriod !== 'all' 
      ? new Date(now.getTime() - periodDays * 24 * 60 * 60 * 1000)
      : new Date(0);

    const periodPurchases = purchaseHistory.filter(p => 
      new Date(p.purchasedAt) >= cutoffDate
    );

    // Spending patterns
    const totalSpent = periodPurchases.reduce((sum, p) => sum + p.xpCost, 0);
    const avgPurchaseSize = totalSpent / (periodPurchases.length || 1);
    const spendingEfficiency = balance.totalEarned > 0 ? (balance.totalSpent / balance.totalEarned) * 100 : 0;

    // Category breakdown
    const categorySpending = periodPurchases.reduce((acc, p) => {
      acc[p.category] = (acc[p.category] || 0) + p.xpCost;
      return acc;
    }, {} as Record<string, number>);

    const topCategories = Object.entries(categorySpending)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);

    // Satisfaction analysis
    const satisfactionRatings = periodPurchases
      .filter(p => p.satisfactionRating)
      .map(p => p.satisfactionRating!);
    
    const avgSatisfaction = satisfactionRatings.length > 0 
      ? satisfactionRatings.reduce((sum, rating) => sum + rating, 0) / satisfactionRatings.length
      : 0;

    // Purchase timing patterns
    const hourlyPurchases = periodPurchases.reduce((acc, p) => {
      const hour = new Date(p.purchasedAt).getHours();
      acc[hour] = (acc[hour] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    const peakHour = Object.entries(hourlyPurchases)
      .sort(([,a], [,b]) => b - a)[0]?.[0];

    // Psychology insights
    const impulsePurchases = periodPurchases.filter(p => !p.notes || p.notes.length < 10).length;
    const plannedPurchases = periodPurchases.length - impulsePurchases;
    const plannedRatio = periodPurchases.length > 0 ? (plannedPurchases / periodPurchases.length) * 100 : 0;

    // Trends
    const thisWeekPurchases = purchaseHistory.filter(p => 
      new Date(p.purchasedAt) >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    ).length;
    
    const lastWeekPurchases = purchaseHistory.filter(p => {
      const date = new Date(p.purchasedAt);
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
      return date >= twoWeeksAgo && date < weekAgo;
    }).length;

    const purchasesTrend = lastWeekPurchases > 0 
      ? ((thisWeekPurchases - lastWeekPurchases) / lastWeekPurchases) * 100 
      : 0;

    return {
      totalSpent,
      avgPurchaseSize,
      spendingEfficiency,
      categorySpending: topCategories,
      avgSatisfaction,
      peakHour: peakHour ? parseInt(peakHour) : null,
      plannedRatio,
      purchasesTrend,
      purchaseCount: periodPurchases.length,
      satisfactionCount: satisfactionRatings.length
    };
  }, [purchaseHistory, balance, selectedPeriod]);

  const getHealthScore = () => {
    if (!analyticsData) return 0;
    
    let score = 0;
    
    // Planned purchases (good)
    if (analyticsData.plannedRatio >= 70) score += 25;
    else if (analyticsData.plannedRatio >= 50) score += 15;
    else if (analyticsData.plannedRatio >= 30) score += 10;
    
    // Satisfaction levels (good)
    if (analyticsData.avgSatisfaction >= 8) score += 25;
    else if (analyticsData.avgSatisfaction >= 6) score += 15;
    else if (analyticsData.avgSatisfaction >= 4) score += 10;
    
    // Spending efficiency (balanced is good)
    if (analyticsData.spendingEfficiency >= 30 && analyticsData.spendingEfficiency <= 70) score += 25;
    else if (analyticsData.spendingEfficiency >= 20 && analyticsData.spendingEfficiency <= 80) score += 15;
    
    // Category diversity (good)
    if (analyticsData.categorySpending.length >= 3) score += 25;
    else if (analyticsData.categorySpending.length >= 2) score += 15;
    
    return Math.min(score, 100);
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getHealthScoreIcon = (score: number) => {
    if (score >= 80) return <CheckCircle className="h-5 w-5 text-green-400" />;
    if (score >= 60) return <Info className="h-5 w-5 text-yellow-400" />;
    return <AlertCircle className="h-5 w-5 text-red-400" />;
  };

  if (loading || !analyticsData) {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="animate-pulse grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-siso-bg-alt rounded-lg h-32"></div>
          ))}
        </div>
      </div>
    );
  }

  const healthScore = getHealthScore();

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header with Period Selector */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-siso-text-bold">XP Analytics</h2>
          <p className="text-siso-text-muted">Insights into your spending psychology</p>
        </div>
        
        <Select value={selectedPeriod} onValueChange={(value: any) => setSelectedPeriod(value)}>
          <SelectTrigger className="w-32 bg-siso-bg-alt border-siso-border">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
            <SelectItem value="all">All time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-blue-400">
                    {analyticsData.totalSpent.toLocaleString()}
                  </div>
                  <div className="text-sm text-blue-400/70">XP Spent</div>
                </div>
                <BarChart3 className="h-8 w-8 text-blue-400/50" />
              </div>
              {analyticsData.purchasesTrend !== 0 && (
                <div className="flex items-center gap-1 mt-2 text-xs">
                  {analyticsData.purchasesTrend > 0 ? (
                    <TrendingUp className="h-3 w-3 text-green-400" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-400" />
                  )}
                  <span className={analyticsData.purchasesTrend > 0 ? 'text-green-400' : 'text-red-400'}>
                    {Math.abs(analyticsData.purchasesTrend).toFixed(1)}% vs last period
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-green-400">
                    {analyticsData.avgSatisfaction.toFixed(1)}
                  </div>
                  <div className="text-sm text-green-400/70">Avg Satisfaction</div>
                </div>
                <Heart className="h-8 w-8 text-green-400/50" />
              </div>
              <div className="text-xs text-green-400/70 mt-2">
                Based on {analyticsData.satisfactionCount} ratings
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border-orange-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-orange-400">
                    {analyticsData.plannedRatio.toFixed(0)}%
                  </div>
                  <div className="text-sm text-orange-400/70">Planned Purchases</div>
                </div>
                <Target className="h-8 w-8 text-orange-400/50" />
              </div>
              <div className="text-xs text-orange-400/70 mt-2">
                {analyticsData.purchaseCount - Math.round(analyticsData.purchaseCount * analyticsData.plannedRatio / 100)} impulse purchases
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className={cn(
            "bg-gradient-to-br border-2",
            healthScore >= 80 ? "from-green-500/10 to-green-600/5 border-green-500/20" :
            healthScore >= 60 ? "from-yellow-500/10 to-yellow-600/5 border-yellow-500/20" :
            "from-red-500/10 to-red-600/5 border-red-500/20"
          )}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className={cn("text-2xl font-bold", getHealthScoreColor(healthScore))}>
                    {healthScore}
                  </div>
                  <div className={cn("text-sm opacity-70", getHealthScoreColor(healthScore))}>
                    Health Score
                  </div>
                </div>
                {getHealthScoreIcon(healthScore)}
              </div>
              <div className={cn("text-xs mt-2 opacity-70", getHealthScoreColor(healthScore))}>
                {healthScore >= 80 ? 'Excellent psychology!' :
                 healthScore >= 60 ? 'Good balance' : 'Needs attention'}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Detailed Analytics Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-siso-bg-alt border border-siso-border">
          <TabsTrigger 
            value="overview"
            className="data-[state=active]:bg-siso-orange data-[state=active]:text-white"
          >
            <PieChart className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger 
            value="psychology"
            className="data-[state=active]:bg-siso-orange data-[state=active]:text-white"
          >
            <Brain className="h-4 w-4 mr-2" />
            Psychology
          </TabsTrigger>
          <TabsTrigger 
            value="patterns"
            className="data-[state=active]:bg-siso-orange data-[state=active]:text-white"
          >
            <Clock className="h-4 w-4 mr-2" />
            Patterns
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="overview" className="mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Category Spending */}
              <Card className="bg-siso-bg border-siso-border">
                <CardHeader>
                  <CardTitle className="text-siso-text-bold">Spending by Category</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {analyticsData.categorySpending.map(([category, amount], index) => {
                    const percentage = (amount / analyticsData.totalSpent) * 100;
                    return (
                      <div key={category} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-siso-text capitalize">
                            {category.toLowerCase()}
                          </span>
                          <div className="text-right">
                            <div className="text-sm font-medium text-siso-orange">
                              {amount.toLocaleString()} XP
                            </div>
                            <div className="text-xs text-siso-text-muted">
                              {percentage.toFixed(1)}%
                            </div>
                          </div>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              {/* Spending Efficiency */}
              <Card className="bg-siso-bg border-siso-border">
                <CardHeader>
                  <CardTitle className="text-siso-text-bold">Spending Efficiency</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-siso-text">Overall Efficiency</span>
                        <span className="text-sm font-medium text-siso-orange">
                          {analyticsData.spendingEfficiency.toFixed(1)}%
                        </span>
                      </div>
                      <Progress value={analyticsData.spendingEfficiency} className="h-2" />
                      <div className="text-xs text-siso-text-muted mt-1">
                        {balance?.totalSpent.toLocaleString()} spent of {balance?.totalEarned.toLocaleString()} earned
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div className="bg-siso-bg-alt rounded p-3">
                        <div className="text-lg font-bold text-siso-text">
                          {analyticsData.avgPurchaseSize.toLocaleString()}
                        </div>
                        <div className="text-xs text-siso-text-muted">Avg Purchase</div>
                      </div>
                      <div className="bg-siso-bg-alt rounded p-3">
                        <div className="text-lg font-bold text-siso-text">
                          {analyticsData.purchaseCount}
                        </div>
                        <div className="text-xs text-siso-text-muted">Total Purchases</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="psychology" className="mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Decision Quality */}
              <Card className="bg-siso-bg border-siso-border">
                <CardHeader>
                  <CardTitle className="text-siso-text-bold flex items-center gap-2">
                    <Brain className="h-5 w-5 text-siso-orange" />
                    Decision Quality
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-siso-text">Planned Purchases</span>
                        <Badge className={cn(
                          analyticsData.plannedRatio >= 70 ? 'bg-green-500/20 text-green-400 border-green-500/20' :
                          analyticsData.plannedRatio >= 50 ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/20' :
                          'bg-red-500/20 text-red-400 border-red-500/20'
                        )}>
                          {analyticsData.plannedRatio.toFixed(0)}%
                        </Badge>
                      </div>
                      <Progress value={analyticsData.plannedRatio} className="h-2" />
                      <div className="text-xs text-siso-text-muted mt-1">
                        {Math.round(analyticsData.purchaseCount * analyticsData.plannedRatio / 100)} planned, {" "}
                        {analyticsData.purchaseCount - Math.round(analyticsData.purchaseCount * analyticsData.plannedRatio / 100)} impulse
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-siso-text-bold">Psychology Insights:</h4>
                      <div className="space-y-1 text-xs text-siso-text-muted">
                        {analyticsData.plannedRatio >= 70 && (
                          <div className="flex items-center gap-2 text-green-400">
                            <CheckCircle className="h-3 w-3" />
                            Excellent impulse control - you think before you spend
                          </div>
                        )}
                        {analyticsData.avgSatisfaction >= 8 && (
                          <div className="flex items-center gap-2 text-green-400">
                            <CheckCircle className="h-3 w-3" />
                            High satisfaction shows good reward selection
                          </div>
                        )}
                        {analyticsData.plannedRatio < 50 && (
                          <div className="flex items-center gap-2 text-yellow-400">
                            <AlertCircle className="h-3 w-3" />
                            Consider pausing before purchases to increase satisfaction
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Satisfaction Analysis */}
              <Card className="bg-siso-bg border-siso-border">
                <CardHeader>
                  <CardTitle className="text-siso-text-bold flex items-center gap-2">
                    <Heart className="h-5 w-5 text-siso-orange" />
                    Satisfaction Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-400 mb-1">
                      {analyticsData.avgSatisfaction.toFixed(1)}/10
                    </div>
                    <div className="text-sm text-siso-text-muted">
                      Average satisfaction rating
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-siso-text-bold">Satisfaction Insights:</h4>
                    <div className="space-y-1 text-xs">
                      {analyticsData.avgSatisfaction >= 8 && (
                        <div className="text-green-400">
                          ✓ Excellent - You're choosing rewards that truly satisfy you
                        </div>
                      )}
                      {analyticsData.avgSatisfaction >= 6 && analyticsData.avgSatisfaction < 8 && (
                        <div className="text-yellow-400">
                          ⚠ Good but could improve - Consider which rewards bring most joy
                        </div>
                      )}
                      {analyticsData.avgSatisfaction < 6 && (
                        <div className="text-red-400">
                          ⚠ Low satisfaction - Try different reward categories or timing
                        </div>
                      )}
                      <div className="text-siso-text-muted">
                        Based on {analyticsData.satisfactionCount} rated purchases
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="patterns" className="mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Time Patterns */}
              <Card className="bg-siso-bg border-siso-border">
                <CardHeader>
                  <CardTitle className="text-siso-text-bold flex items-center gap-2">
                    <Clock className="h-5 w-5 text-siso-orange" />
                    Purchase Timing
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {analyticsData.peakHour !== null && (
                    <div>
                      <div className="text-lg font-bold text-siso-text mb-1">
                        {analyticsData.peakHour}:00
                      </div>
                      <div className="text-sm text-siso-text-muted">
                        Most common purchase time
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-siso-text-bold">Pattern Insights:</h4>
                    <div className="text-xs text-siso-text-muted space-y-1">
                      {analyticsData.peakHour && (
                        <div>
                          You tend to purchase rewards around {analyticsData.peakHour}:00
                        </div>
                      )}
                      <div>
                        Consider timing rewards for maximum satisfaction
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Health Recommendations */}
              <Card className="bg-siso-bg border-siso-border">
                <CardHeader>
                  <CardTitle className="text-siso-text-bold flex items-center gap-2">
                    <Zap className="h-5 w-5 text-siso-orange" />
                    Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    {healthScore < 60 && (
                      <div className="bg-red-500/10 border border-red-500/20 rounded p-2">
                        <div className="text-sm font-medium text-red-400 mb-1">
                          Psychology Health Needs Attention
                        </div>
                        <div className="text-xs text-red-400/70">
                          Consider more planned purchases and diversify reward categories
                        </div>
                      </div>
                    )}
                    
                    {analyticsData.plannedRatio < 50 && (
                      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded p-2">
                        <div className="text-sm font-medium text-yellow-400 mb-1">
                          Try Planned Purchases
                        </div>
                        <div className="text-xs text-yellow-400/70">
                          Add notes to purchases explaining why you earned them
                        </div>
                      </div>
                    )}

                    {analyticsData.categorySpending.length < 2 && (
                      <div className="bg-blue-500/10 border border-blue-500/20 rounded p-2">
                        <div className="text-sm font-medium text-blue-400 mb-1">
                          Diversify Rewards
                        </div>
                        <div className="text-xs text-blue-400/70">
                          Try different reward categories for better balance
                        </div>
                      </div>
                    )}

                    {healthScore >= 80 && (
                      <div className="bg-green-500/10 border border-green-500/20 rounded p-2">
                        <div className="text-sm font-medium text-green-400 mb-1">
                          Excellent Psychology!
                        </div>
                        <div className="text-xs text-green-400/70">
                          You're using the XP system optimally for sustainable motivation
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};