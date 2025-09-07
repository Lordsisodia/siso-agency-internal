import { supabase } from '@/integrations/supabase/client';

export interface TokenUsage {
  id: string;
  service: 'claude-code' | 'anthropic-api' | 'openai' | 'custom';
  tokensUsed: number;
  category: string;
  operation: string;
  cost?: number;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface UsageSummary {
  totalTokens: number;
  totalCost: number;
  serviceBreakdown: Record<string, { tokens: number; cost: number; count: number }>;
  categoryBreakdown: Record<string, { tokens: number; cost: number; count: number }>;
  dailyUsage: { date: string; tokens: number; cost: number }[];
  hourlyUsage: { hour: number; tokens: number; cost: number }[];
}

export interface TokenLimits {
  daily: number;
  monthly: number;
  perOperation: number;
  emergencyBuffer: number;
}

export class TokenUsageTracker {
  private usageHistory: TokenUsage[] = [];
  private readonly TOKEN_COSTS = {
    'claude-code': 0.008, // $0.008 per 1K tokens (estimated)
    'anthropic-api': 0.008,
    'openai': 0.002, // $0.002 per 1K tokens (GPT-3.5)
    'custom': 0.005
  };

  private readonly DEFAULT_LIMITS: TokenLimits = {
    daily: 100000, // 100K tokens per day
    monthly: 2500000, // 2.5M tokens per month
    perOperation: 10000, // 10K tokens per operation
    emergencyBuffer: 50000 // Reserve 50K tokens for emergencies
  };

  constructor() {
    // Load usage asynchronously, don't block initialization
    this.loadUsageFromDatabase().catch(error => {
      console.warn('Token usage history table not available, running in memory mode:', error.message);
    });
    this.startDailyReset();
  }

  /**
   * Record token usage for an operation
   */
  async recordUsage(
    service: TokenUsage['service'],
    tokensUsed: number,
    category: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    const usage: TokenUsage = {
      id: crypto.randomUUID(),
      service,
      tokensUsed,
      category,
      operation: metadata?.operation || 'unknown',
      cost: this.calculateCost(service, tokensUsed),
      timestamp: new Date(),
      metadata
    };

    // Add to local history
    this.usageHistory.push(usage);

    // Save to database
    await this.saveUsageToDatabase(usage);

    // Check if approaching limits
    await this.checkUsageLimits();

    console.log(`💰 Token usage recorded: ${tokensUsed} tokens (${service}, $${usage.cost?.toFixed(4)})`);
  }

  /**
   * Get current usage summary
   */
  getCurrentUsage(timeRange: 'day' | 'week' | 'month' = 'day'): UsageSummary {
    const now = new Date();
    let startDate: Date;

    switch (timeRange) {
      case 'day':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
    }

    const filteredUsage = this.usageHistory.filter(u => u.timestamp >= startDate);
    
    return this.generateUsageSummary(filteredUsage);
  }

  /**
   * Check if an operation would exceed token limits
   */
  async canConsumeTokens(estimatedTokens: number, category?: string): Promise<{
    canProceed: boolean;
    reason?: string;
    currentUsage: any;
  }> {
    const todayUsage = this.getCurrentUsage('day');
    const monthlyUsage = this.getCurrentUsage('month');

    // Check daily limit
    if (todayUsage.totalTokens + estimatedTokens > this.DEFAULT_LIMITS.daily) {
      return {
        canProceed: false,
        reason: `Would exceed daily limit (${this.DEFAULT_LIMITS.daily} tokens)`,
        currentUsage: todayUsage
      };
    }

    // Check monthly limit
    if (monthlyUsage.totalTokens + estimatedTokens > this.DEFAULT_LIMITS.monthly) {
      return {
        canProceed: false,
        reason: `Would exceed monthly limit (${this.DEFAULT_LIMITS.monthly} tokens)`,
        currentUsage: monthlyUsage
      };
    }

    // Check per-operation limit
    if (estimatedTokens > this.DEFAULT_LIMITS.perOperation) {
      return {
        canProceed: false,
        reason: `Operation exceeds per-operation limit (${this.DEFAULT_LIMITS.perOperation} tokens)`,
        currentUsage: todayUsage
      };
    }

    // Check emergency buffer
    const remainingDaily = this.DEFAULT_LIMITS.daily - todayUsage.totalTokens;
    if (remainingDaily <= this.DEFAULT_LIMITS.emergencyBuffer && !category?.includes('emergency')) {
      return {
        canProceed: false,
        reason: `Emergency buffer protected (${this.DEFAULT_LIMITS.emergencyBuffer} tokens reserved)`,
        currentUsage: todayUsage
      };
    }

    return {
      canProceed: true,
      currentUsage: todayUsage
    };
  }

  /**
   * Get detailed token analytics
   */
  async getTokenAnalytics(days: number = 30): Promise<any> {
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    
    const { data, error } = await supabase
      .from('token_usage_history')
      .select('*')
      .gte('timestamp', cutoffDate.toISOString())
      .order('timestamp', { ascending: true });

    if (error) {
      console.error('Failed to fetch analytics:', error);
      return null;
    }

    const usage = data.map(this.mapDatabaseToUsage);
    const summary = this.generateUsageSummary(usage);

    return {
      ...summary,
      trends: this.calculateUsageTrends(usage),
      predictions: this.predictUsage(usage),
      efficiency: this.calculateEfficiencyMetrics(usage),
      recommendations: this.generateRecommendations(summary)
    };
  }

  /**
   * Get cost breakdown
   */
  getCostBreakdown(timeRange: 'day' | 'week' | 'month' = 'month'): any {
    const usage = this.getCurrentUsage(timeRange);
    
    return {
      totalCost: usage.totalCost,
      averageCostPerToken: usage.totalTokens > 0 ? usage.totalCost / usage.totalTokens : 0,
      serviceBreakdown: usage.serviceBreakdown,
      categoryBreakdown: usage.categoryBreakdown,
      projectedMonthlyCost: this.projectMonthlyCost(usage, timeRange),
      budgetStatus: this.getBudgetStatus(usage.totalCost, timeRange)
    };
  }

  /**
   * Update token limits
   */
  async updateLimits(newLimits: Partial<TokenLimits>): Promise<void> {
    Object.assign(this.DEFAULT_LIMITS, newLimits);
    
    // Save to database
    await supabase
      .from('token_limits_config')
      .upsert([{
        daily_limit: this.DEFAULT_LIMITS.daily,
        monthly_limit: this.DEFAULT_LIMITS.monthly,
        per_operation_limit: this.DEFAULT_LIMITS.perOperation,
        emergency_buffer: this.DEFAULT_LIMITS.emergencyBuffer,
        updated_at: new Date().toISOString()
      }], {
        onConflict: 'id'
      });

    console.log('💼 Token limits updated:', newLimits);
  }

  /**
   * Get usage alerts
   */
  getUsageAlerts(): Array<{ type: 'warning' | 'danger' | 'info'; message: string }> {
    const alerts: Array<{ type: 'warning' | 'danger' | 'info'; message: string }> = [];
    const todayUsage = this.getCurrentUsage('day');
    const monthlyUsage = this.getCurrentUsage('month');

    // Daily usage alerts
    const dailyPercent = (todayUsage.totalTokens / this.DEFAULT_LIMITS.daily) * 100;
    if (dailyPercent >= 90) {
      alerts.push({ type: 'danger', message: `Daily usage at ${dailyPercent.toFixed(1)}% of limit` });
    } else if (dailyPercent >= 75) {
      alerts.push({ type: 'warning', message: `Daily usage at ${dailyPercent.toFixed(1)}% of limit` });
    }

    // Monthly usage alerts
    const monthlyPercent = (monthlyUsage.totalTokens / this.DEFAULT_LIMITS.monthly) * 100;
    if (monthlyPercent >= 90) {
      alerts.push({ type: 'danger', message: `Monthly usage at ${monthlyPercent.toFixed(1)}% of limit` });
    } else if (monthlyPercent >= 75) {
      alerts.push({ type: 'warning', message: `Monthly usage at ${monthlyPercent.toFixed(1)}% of limit` });
    }

    // Cost alerts
    if (todayUsage.totalCost > 50) {
      alerts.push({ type: 'warning', message: `Daily cost exceeds $50 (${todayUsage.totalCost.toFixed(2)})` });
    }

    if (monthlyUsage.totalCost > 500) {
      alerts.push({ type: 'danger', message: `Monthly cost exceeds $500 (${monthlyUsage.totalCost.toFixed(2)})` });
    }

    return alerts;
  }

  /**
   * Calculate cost for tokens
   */
  private calculateCost(service: TokenUsage['service'], tokens: number): number {
    const costPer1K = this.TOKEN_COSTS[service] || this.TOKEN_COSTS.custom;
    return (tokens / 1000) * costPer1K;
  }

  /**
   * Generate usage summary from usage array
   */
  private generateUsageSummary(usage: TokenUsage[]): UsageSummary {
    const totalTokens = usage.reduce((sum, u) => sum + u.tokensUsed, 0);
    const totalCost = usage.reduce((sum, u) => sum + (u.cost || 0), 0);

    // Service breakdown
    const serviceBreakdown = usage.reduce((acc, u) => {
      if (!acc[u.service]) {
        acc[u.service] = { tokens: 0, cost: 0, count: 0 };
      }
      acc[u.service].tokens += u.tokensUsed;
      acc[u.service].cost += u.cost || 0;
      acc[u.service].count += 1;
      return acc;
    }, {} as Record<string, { tokens: number; cost: number; count: number }>);

    // Category breakdown
    const categoryBreakdown = usage.reduce((acc, u) => {
      if (!acc[u.category]) {
        acc[u.category] = { tokens: 0, cost: 0, count: 0 };
      }
      acc[u.category].tokens += u.tokensUsed;
      acc[u.category].cost += u.cost || 0;
      acc[u.category].count += 1;
      return acc;
    }, {} as Record<string, { tokens: number; cost: number; count: number }>);

    // Daily usage
    const dailyUsage = this.groupByDay(usage);
    
    // Hourly usage for today
    const today = new Date().toDateString();
    const todayUsage = usage.filter(u => u.timestamp.toDateString() === today);
    const hourlyUsage = this.groupByHour(todayUsage);

    return {
      totalTokens,
      totalCost,
      serviceBreakdown,
      categoryBreakdown,
      dailyUsage,
      hourlyUsage
    };
  }

  /**
   * Group usage by day
   */
  private groupByDay(usage: TokenUsage[]): { date: string; tokens: number; cost: number }[] {
    const grouped = usage.reduce((acc, u) => {
      const date = u.timestamp.toDateString();
      if (!acc[date]) {
        acc[date] = { tokens: 0, cost: 0 };
      }
      acc[date].tokens += u.tokensUsed;
      acc[date].cost += u.cost || 0;
      return acc;
    }, {} as Record<string, { tokens: number; cost: number }>);

    return Object.entries(grouped).map(([date, data]) => ({
      date,
      ...data
    }));
  }

  /**
   * Group usage by hour
   */
  private groupByHour(usage: TokenUsage[]): { hour: number; tokens: number; cost: number }[] {
    const grouped = usage.reduce((acc, u) => {
      const hour = u.timestamp.getHours();
      if (!acc[hour]) {
        acc[hour] = { tokens: 0, cost: 0 };
      }
      acc[hour].tokens += u.tokensUsed;
      acc[hour].cost += u.cost || 0;
      return acc;
    }, {} as Record<number, { tokens: number; cost: number }>);

    return Array.from({ length: 24 }, (_, hour) => ({
      hour,
      tokens: grouped[hour]?.tokens || 0,
      cost: grouped[hour]?.cost || 0
    }));
  }

  /**
   * Calculate usage trends
   */
  private calculateUsageTrends(usage: TokenUsage[]): any {
    const dailyUsage = this.groupByDay(usage);
    if (dailyUsage.length < 2) return null;

    const recent = dailyUsage.slice(-7);
    const previous = dailyUsage.slice(-14, -7);
    
    const recentAvg = recent.reduce((sum, d) => sum + d.tokens, 0) / recent.length;
    const previousAvg = previous.length > 0 ? previous.reduce((sum, d) => sum + d.tokens, 0) / previous.length : recentAvg;
    
    const trend = ((recentAvg - previousAvg) / previousAvg) * 100;
    
    return {
      direction: trend > 5 ? 'increasing' : trend < -5 ? 'decreasing' : 'stable',
      percentage: Math.abs(trend),
      recentAverage: recentAvg,
      previousAverage: previousAvg
    };
  }

  /**
   * Predict future usage
   */
  private predictUsage(usage: TokenUsage[]): any {
    const dailyUsage = this.groupByDay(usage);
    if (dailyUsage.length < 7) return null;

    const recent = dailyUsage.slice(-7);
    const avgDaily = recent.reduce((sum, d) => sum + d.tokens, 0) / recent.length;
    
    return {
      predictedDaily: Math.round(avgDaily),
      predictedWeekly: Math.round(avgDaily * 7),
      predictedMonthly: Math.round(avgDaily * 30),
      confidenceLevel: Math.min(recent.length / 7, 1) * 100
    };
  }

  /**
   * Calculate efficiency metrics
   */
  private calculateEfficiencyMetrics(usage: TokenUsage[]): any {
    const categoryStats = this.getCurrentUsage().categoryBreakdown;
    
    const efficiency = Object.entries(categoryStats).map(([category, stats]) => ({
      category,
      avgTokensPerOperation: stats.count > 0 ? Math.round(stats.tokens / stats.count) : 0,
      costPerOperation: stats.count > 0 ? stats.cost / stats.count : 0,
      operationCount: stats.count
    }));

    return efficiency;
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(summary: UsageSummary): string[] {
    const recommendations: string[] = [];
    
    // High usage categories
    const sortedCategories = Object.entries(summary.categoryBreakdown)
      .sort(([,a], [,b]) => b.tokens - a.tokens);
    
    if (sortedCategories.length > 0) {
      const [topCategory, topStats] = sortedCategories[0];
      if (topStats.tokens > summary.totalTokens * 0.5) {
        recommendations.push(`Consider optimizing "${topCategory}" operations - they consume ${Math.round((topStats.tokens/summary.totalTokens)*100)}% of tokens`);
      }
    }

    // Cost optimization
    if (summary.totalCost > 100) {
      recommendations.push('Consider implementing more aggressive rate limiting to reduce costs');
    }

    // Service optimization
    const expensiveServices = Object.entries(summary.serviceBreakdown)
      .filter(([,stats]) => stats.cost > summary.totalCost * 0.3);
    
    if (expensiveServices.length > 0) {
      expensiveServices.forEach(([service]) => {
        recommendations.push(`Review usage of ${service} service for cost optimization opportunities`);
      });
    }

    return recommendations;
  }

  /**
   * Project monthly cost
   */
  private projectMonthlyCost(usage: UsageSummary, timeRange: string): number {
    const multiplier = timeRange === 'day' ? 30 : timeRange === 'week' ? 4.3 : 1;
    return usage.totalCost * multiplier;
  }

  /**
   * Get budget status
   */
  private getBudgetStatus(currentCost: number, timeRange: string): any {
    const monthlyBudget = 1000; // $1000 monthly budget
    const projectedMonthlyCost = this.projectMonthlyCost({ totalCost: currentCost } as UsageSummary, timeRange);
    
    return {
      budget: monthlyBudget,
      projected: projectedMonthlyCost,
      percentUsed: (projectedMonthlyCost / monthlyBudget) * 100,
      remaining: monthlyBudget - projectedMonthlyCost,
      status: projectedMonthlyCost > monthlyBudget ? 'over' : projectedMonthlyCost > monthlyBudget * 0.8 ? 'warning' : 'good'
    };
  }

  /**
   * Check usage limits and send alerts
   */
  private async checkUsageLimits(): Promise<void> {
    const alerts = this.getUsageAlerts();
    
    if (alerts.length > 0) {
      console.warn('📊 Token usage alerts:', alerts);
      
      // Could send notifications, webhook calls, etc.
      await this.sendUsageAlert(alerts);
    }
  }

  /**
   * Send usage alert (placeholder for notification system)
   */
  private async sendUsageAlert(alerts: Array<{ type: string; message: string }>): Promise<void> {
    // Implement notification system (email, Slack, etc.)
    console.log('🚨 Sending usage alerts:', alerts);
  }

  /**
   * Save usage to database
   */
  private async saveUsageToDatabase(usage: TokenUsage): Promise<void> {
    try {
      // Skip database operations if table doesn't exist
      const { error } = await (supabase as any)
        .from('token_usage_history')
        .insert([{
          id: usage.id,
          service: usage.service,
          tokens_used: usage.tokensUsed,
          category: usage.category,
          operation: usage.operation,
          cost: usage.cost,
          timestamp: usage.timestamp.toISOString(),
          metadata: usage.metadata || {}
        }]);

      if (error) {
        // Silently handle missing table
        if (error.code === 'PGRST116' || error.message?.includes('relation')) {
          return; // Table doesn't exist, skip
        }
        console.error('Failed to save token usage:', error);
      }
    } catch (error) {
      console.error('Database save error:', error);
    }
  }

  /**
   * Load usage from database
   */
  private async loadUsageFromDatabase(): Promise<void> {
    try {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      
      // Skip database operations if table doesn't exist
      const { data, error } = await (supabase as any)
        .from('token_usage_history')
        .select('*')
        .gte('timestamp', sevenDaysAgo.toISOString())
        .order('timestamp', { ascending: false });

      if (error) {
        // Silently handle missing table - it's optional for development
        if (error.code === 'PGRST116' || error.message?.includes('relation') || error.message?.includes('404')) {
          console.log('📊 Token usage history table not available - running in memory mode');
        } else {
          console.error('Failed to load token usage:', error);
        }
        return;
      }

      this.usageHistory = data?.map(this.mapDatabaseToUsage) || [];
      console.log(`📊 Loaded ${this.usageHistory.length} token usage records`);
    } catch (error) {
      console.error('Failed to load usage from database:', error);
    }
  }

  /**
   * Map database record to TokenUsage
   */
  private mapDatabaseToUsage(data: any): TokenUsage {
    return {
      id: data.id,
      service: data.service,
      tokensUsed: data.tokens_used,
      category: data.category,
      operation: data.operation,
      cost: data.cost,
      timestamp: new Date(data.timestamp),
      metadata: data.metadata || {}
    };
  }

  /**
   * Start daily reset interval
   */
  private startDailyReset(): void {
    // Check every hour if we need to clean up old data
    setInterval(() => {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      this.usageHistory = this.usageHistory.filter(u => u.timestamp >= sevenDaysAgo);
    }, 60 * 60 * 1000);
  }
}