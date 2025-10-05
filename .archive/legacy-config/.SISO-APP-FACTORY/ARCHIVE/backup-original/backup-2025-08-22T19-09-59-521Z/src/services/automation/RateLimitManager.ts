import { supabase } from '@/integrations/supabase/client';

export interface RateLimit {
  category: string;
  maxTokensPerMinute: number;
  maxTokensPerHour: number;
  maxTokensPerDay: number;
  maxRequestsPerMinute: number;
  maxRequestsPerHour: number;
  currentUsage: {
    tokensThisMinute: number;
    tokensThisHour: number;
    tokensThisDay: number;
    requestsThisMinute: number;
    requestsThisHour: number;
    lastResetMinute: Date;
    lastResetHour: Date;
    lastResetDay: Date;
  };
}

export interface UsageWindow {
  minute: number;
  hour: number;
  day: string;
  tokens: number;
  requests: number;
}

export class RateLimitManager {
  private limits: Map<string, RateLimit> = new Map();
  private usageWindows: Map<string, UsageWindow[]> = new Map();

  constructor() {
    this.initializeDefaultLimits();
    this.startCleanupInterval();
  }

  /**
   * Initialize default rate limits for different categories
   */
  private initializeDefaultLimits() {
    const defaultLimits: Record<string, Omit<RateLimit, 'currentUsage'>> = {
      development: {
        category: 'development',
        maxTokensPerMinute: 1000,
        maxTokensPerHour: 15000,
        maxTokensPerDay: 100000,
        maxRequestsPerMinute: 5,
        maxRequestsPerHour: 50
      },
      testing: {
        category: 'testing',
        maxTokensPerMinute: 500,
        maxTokensPerHour: 8000,
        maxTokensPerDay: 50000,
        maxRequestsPerMinute: 3,
        maxRequestsPerHour: 30
      },
      deployment: {
        category: 'deployment',
        maxTokensPerMinute: 2000,
        maxTokensPerHour: 20000,
        maxTokensPerDay: 80000,
        maxRequestsPerMinute: 2,
        maxRequestsPerHour: 20
      },
      analysis: {
        category: 'analysis',
        maxTokensPerMinute: 800,
        maxTokensPerHour: 12000,
        maxTokensPerDay: 60000,
        maxRequestsPerMinute: 4,
        maxRequestsPerHour: 40
      },
      maintenance: {
        category: 'maintenance',
        maxTokensPerMinute: 300,
        maxTokensPerHour: 5000,
        maxTokensPerDay: 30000,
        maxRequestsPerMinute: 2,
        maxRequestsPerHour: 15
      }
    };

    Object.values(defaultLimits).forEach(limit => {
      this.limits.set(limit.category, {
        ...limit,
        currentUsage: {
          tokensThisMinute: 0,
          tokensThisHour: 0,
          tokensThisDay: 0,
          requestsThisMinute: 0,
          requestsThisHour: 0,
          lastResetMinute: new Date(),
          lastResetHour: new Date(),
          lastResetDay: new Date()
        }
      });
    });
  }

  /**
   * Check if a request can be executed within rate limits
   */
  async checkLimit(category: string, estimatedTokens: number = 1000): Promise<boolean> {
    const limit = this.limits.get(category);
    if (!limit) {
      console.warn(`No rate limit configured for category: ${category}`);
      return true;
    }

    // Reset counters if time windows have passed
    this.resetCountersIfNeeded(limit);

    // Check all rate limits
    const checks = [
      limit.currentUsage.tokensThisMinute + estimatedTokens <= limit.maxTokensPerMinute,
      limit.currentUsage.tokensThisHour + estimatedTokens <= limit.maxTokensPerHour,
      limit.currentUsage.tokensThisDay + estimatedTokens <= limit.maxTokensPerDay,
      limit.currentUsage.requestsThisMinute + 1 <= limit.maxRequestsPerMinute,
      limit.currentUsage.requestsThisHour + 1 <= limit.maxRequestsPerHour
    ];

    const canExecute = checks.every(check => check);

    if (!canExecute) {
      console.log(`🚫 Rate limit exceeded for ${category}:`, {
        tokensThisMinute: `${limit.currentUsage.tokensThisMinute}/${limit.maxTokensPerMinute}`,
        tokensThisHour: `${limit.currentUsage.tokensThisHour}/${limit.maxTokensPerHour}`,
        tokensThisDay: `${limit.currentUsage.tokensThisDay}/${limit.maxTokensPerDay}`,
        requestsThisMinute: `${limit.currentUsage.requestsThisMinute}/${limit.maxRequestsPerMinute}`,
        requestsThisHour: `${limit.currentUsage.requestsThisHour}/${limit.maxRequestsPerHour}`
      });
    }

    return canExecute;
  }

  /**
   * Record usage after a request is made
   */
  async recordUsage(category: string, tokensUsed: number): Promise<void> {
    const limit = this.limits.get(category);
    if (!limit) return;

    // Reset counters if needed
    this.resetCountersIfNeeded(limit);

    // Update current usage
    limit.currentUsage.tokensThisMinute += tokensUsed;
    limit.currentUsage.tokensThisHour += tokensUsed;
    limit.currentUsage.tokensThisDay += tokensUsed;
    limit.currentUsage.requestsThisMinute += 1;
    limit.currentUsage.requestsThisHour += 1;

    // Store in usage windows for analytics
    this.recordUsageWindow(category, tokensUsed);

    // Save to database for persistence
    await this.saveUsageToDatabase(category, tokensUsed);

    console.log(`📊 Usage recorded for ${category}: ${tokensUsed} tokens`);
  }

  /**
   * Get current rate limit status
   */
  getCurrentLimits(): Record<string, any> {
    const status: Record<string, any> = {};
    
    this.limits.forEach((limit, category) => {
      this.resetCountersIfNeeded(limit);
      
      status[category] = {
        limits: {
          tokensPerMinute: limit.maxTokensPerMinute,
          tokensPerHour: limit.maxTokensPerHour,
          tokensPerDay: limit.maxTokensPerDay,
          requestsPerMinute: limit.maxRequestsPerMinute,
          requestsPerHour: limit.maxRequestsPerHour
        },
        usage: {
          tokensThisMinute: limit.currentUsage.tokensThisMinute,
          tokensThisHour: limit.currentUsage.tokensThisHour,
          tokensThisDay: limit.currentUsage.tokensThisDay,
          requestsThisMinute: limit.currentUsage.requestsThisMinute,
          requestsThisHour: limit.currentUsage.requestsThisHour
        },
        percentUsed: {
          tokensPerMinute: Math.round((limit.currentUsage.tokensThisMinute / limit.maxTokensPerMinute) * 100),
          tokensPerHour: Math.round((limit.currentUsage.tokensThisHour / limit.maxTokensPerHour) * 100),
          tokensPerDay: Math.round((limit.currentUsage.tokensThisDay / limit.maxTokensPerDay) * 100),
          requestsPerMinute: Math.round((limit.currentUsage.requestsThisMinute / limit.maxRequestsPerMinute) * 100),
          requestsPerHour: Math.round((limit.currentUsage.requestsThisHour / limit.maxRequestsPerHour) * 100)
        },
        timeToReset: {
          minute: 60 - new Date().getSeconds(),
          hour: 60 - new Date().getMinutes(),
          day: 24 - new Date().getHours()
        }
      };
    });

    return status;
  }

  /**
   * Update rate limits for a category
   */
  async updateLimits(category: string, newLimits: Partial<Omit<RateLimit, 'currentUsage' | 'category'>>) {
    const currentLimit = this.limits.get(category);
    if (!currentLimit) {
      throw new Error(`Category ${category} not found`);
    }

    // Update the limits while preserving current usage
    this.limits.set(category, {
      ...currentLimit,
      ...newLimits
    });

    // Save to database
    await this.saveLimitsToDatabase(category, this.limits.get(category)!);
    
    console.log(`⚙️ Rate limits updated for ${category}:`, newLimits);
  }

  /**
   * Get usage analytics for a category
   */
  getUsageAnalytics(category: string, hoursBack: number = 24): any {
    const windows = this.usageWindows.get(category) || [];
    const now = new Date();
    const cutoff = new Date(now.getTime() - hoursBack * 60 * 60 * 1000);

    const recentWindows = windows.filter(window => {
      const windowTime = new Date(window.day);
      windowTime.setHours(Math.floor(window.hour), window.minute);
      return windowTime >= cutoff;
    });

    const totalTokens = recentWindows.reduce((sum, w) => sum + w.tokens, 0);
    const totalRequests = recentWindows.reduce((sum, w) => sum + w.requests, 0);
    const avgTokensPerRequest = totalRequests > 0 ? Math.round(totalTokens / totalRequests) : 0;

    return {
      totalTokens,
      totalRequests,
      avgTokensPerRequest,
      peakTokensPerMinute: Math.max(...recentWindows.map(w => w.tokens), 0),
      peakRequestsPerMinute: Math.max(...recentWindows.map(w => w.requests), 0),
      windowCount: recentWindows.length,
      timespan: `${hoursBack} hours`
    };
  }

  /**
   * Reset usage counters when time windows expire
   */
  private resetCountersIfNeeded(limit: RateLimit): void {
    const now = new Date();
    
    // Reset minute counter
    if (now.getMinutes() !== limit.currentUsage.lastResetMinute.getMinutes()) {
      limit.currentUsage.tokensThisMinute = 0;
      limit.currentUsage.requestsThisMinute = 0;
      limit.currentUsage.lastResetMinute = now;
    }
    
    // Reset hour counter
    if (now.getHours() !== limit.currentUsage.lastResetHour.getHours()) {
      limit.currentUsage.tokensThisHour = 0;
      limit.currentUsage.requestsThisHour = 0;
      limit.currentUsage.lastResetHour = now;
    }
    
    // Reset day counter
    const today = now.toDateString();
    if (today !== limit.currentUsage.lastResetDay.toDateString()) {
      limit.currentUsage.tokensThisDay = 0;
      limit.currentUsage.lastResetDay = now;
    }
  }

  /**
   * Record usage in sliding windows for analytics
   */
  private recordUsageWindow(category: string, tokensUsed: number): void {
    const now = new Date();
    const windowKey = `${now.getDate()}-${now.getHours()}-${now.getMinutes()}`;
    
    let windows = this.usageWindows.get(category) || [];
    
    // Find or create current minute window
    let currentWindow = windows.find(w => 
      w.day === now.toDateString() && 
      w.hour === now.getHours() && 
      w.minute === now.getMinutes()
    );
    
    if (!currentWindow) {
      currentWindow = {
        minute: now.getMinutes(),
        hour: now.getHours(),
        day: now.toDateString(),
        tokens: 0,
        requests: 0
      };
      windows.push(currentWindow);
    }
    
    currentWindow.tokens += tokensUsed;
    currentWindow.requests += 1;
    
    // Keep only last 24 hours of windows
    const cutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    windows = windows.filter(w => {
      const windowTime = new Date(w.day);
      windowTime.setHours(w.hour, w.minute);
      return windowTime >= cutoff;
    });
    
    this.usageWindows.set(category, windows);
  }

  /**
   * Save usage to database for persistence
   */
  private async saveUsageToDatabase(category: string, tokensUsed: number): Promise<void> {
    try {
      const { error } = await supabase
        .from('rate_limit_usage')
        .insert([{
          category,
          tokens_used: tokensUsed,
          timestamp: new Date().toISOString(),
          window_minute: new Date().getMinutes(),
          window_hour: new Date().getHours(),
          window_day: new Date().toDateString()
        }]);

      if (error) {
        console.error('Failed to save usage to database:', error);
      }
    } catch (error) {
      console.error('Database save error:', error);
    }
  }

  /**
   * Save rate limits configuration to database
   */
  private async saveLimitsToDatabase(category: string, limit: RateLimit): Promise<void> {
    try {
      const { error } = await supabase
        .from('rate_limit_config')
        .upsert([{
          category,
          max_tokens_per_minute: limit.maxTokensPerMinute,
          max_tokens_per_hour: limit.maxTokensPerHour,
          max_tokens_per_day: limit.maxTokensPerDay,
          max_requests_per_minute: limit.maxRequestsPerMinute,
          max_requests_per_hour: limit.maxRequestsPerHour,
          updated_at: new Date().toISOString()
        }], {
          onConflict: 'category'
        });

      if (error) {
        console.error('Failed to save limits to database:', error);
      }
    } catch (error) {
      console.error('Database save error:', error);
    }
  }

  /**
   * Start cleanup interval to remove old usage windows
   */
  private startCleanupInterval(): void {
    // Clean up old windows every 10 minutes
    setInterval(() => {
      const now = new Date();
      const cutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      
      this.usageWindows.forEach((windows, category) => {
        const filtered = windows.filter(w => {
          const windowTime = new Date(w.day);
          windowTime.setHours(w.hour, w.minute);
          return windowTime >= cutoff;
        });
        this.usageWindows.set(category, filtered);
      });
    }, 10 * 60 * 1000);
  }

  /**
   * Load configuration from database on startup
   */
  async loadConfigFromDatabase(): Promise<void> {
    try {
      const { data, error } = await supabase
        .from('rate_limit_config')
        .select('*');

      if (error) {
        console.error('Failed to load rate limit config:', error);
        return;
      }

      data?.forEach(config => {
        const currentLimit = this.limits.get(config.category);
        if (currentLimit) {
          this.limits.set(config.category, {
            ...currentLimit,
            maxTokensPerMinute: config.max_tokens_per_minute,
            maxTokensPerHour: config.max_tokens_per_hour,
            maxTokensPerDay: config.max_tokens_per_day,
            maxRequestsPerMinute: config.max_requests_per_minute,
            maxRequestsPerHour: config.max_requests_per_hour
          });
        }
      });

      console.log('✅ Rate limit configuration loaded from database');
    } catch (error) {
      console.error('Failed to load config from database:', error);
    }
  }
}