import { EventEmitter } from 'events';

export interface MCPMetric {
  mcp: string;
  method: string;
  timestamp: Date;
  duration: number;
  status: 'success' | 'error' | 'timeout';
  errorMessage?: string;
  tokenUsage?: {
    input: number;
    output: number;
    total: number;
  };
  metadata?: Record<string, any>;
}

export interface MCPStats {
  mcp: string;
  totalCalls: number;
  successCount: number;
  errorCount: number;
  timeoutCount: number;
  avgResponseTime: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
  errorRate: number;
  totalTokens?: number;
  estimatedCost?: number;
  lastError?: string;
  lastErrorTime?: Date;
}

export interface MCPHealthStatus {
  mcp: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  uptime: number;
  lastCheck: Date;
  issues: string[];
}

export interface MonitorConfig {
  metricsRetention: number; // How long to keep metrics (ms)
  healthCheckInterval: number; // Health check interval (ms)
  alertThresholds: {
    errorRate: number; // Alert if error rate exceeds this %
    responseTime: number; // Alert if avg response time exceeds this (ms)
    timeoutRate: number; // Alert if timeout rate exceeds this %
  };
  costEstimates?: {
    [mcp: string]: {
      perCall?: number;
      perToken?: number;
    };
  };
}

export class MCPMonitor extends EventEmitter {
  private metrics: MCPMetric[] = [];
  private config: MonitorConfig;
  private healthCheckTimer?: NodeJS.Timeout;
  private healthStatus: Map<string, MCPHealthStatus> = new Map();

  constructor(config: Partial<MonitorConfig> = {}) {
    super();
    this.config = {
      metricsRetention: 24 * 60 * 60 * 1000, // 24 hours default
      healthCheckInterval: 5 * 60 * 1000, // 5 minutes default
      alertThresholds: {
        errorRate: 10, // 10% error rate
        responseTime: 5000, // 5 seconds
        timeoutRate: 5 // 5% timeout rate
      },
      ...config
    };

    this.startHealthChecks();
    this.startMetricsCleanup();
  }

  /**
   * Record a metric for an MCP call
   */
  recordMetric(metric: MCPMetric): void {
    this.metrics.push(metric);
    
    // Check for alert conditions
    this.checkAlertConditions(metric);
    
    // Emit metric event
    this.emit('metric:recorded', metric);
  }

  /**
   * Get statistics for a specific MCP
   */
  getStats(mcp: string, timeWindow?: number): MCPStats {
    const windowStart = timeWindow ? Date.now() - timeWindow : 0;
    const relevantMetrics = this.metrics.filter(m => 
      m.mcp === mcp && m.timestamp.getTime() > windowStart
    );

    if (relevantMetrics.length === 0) {
      return {
        mcp,
        totalCalls: 0,
        successCount: 0,
        errorCount: 0,
        timeoutCount: 0,
        avgResponseTime: 0,
        p95ResponseTime: 0,
        p99ResponseTime: 0,
        errorRate: 0
      };
    }

    const successMetrics = relevantMetrics.filter(m => m.status === 'success');
    const errorMetrics = relevantMetrics.filter(m => m.status === 'error');
    const timeoutMetrics = relevantMetrics.filter(m => m.status === 'timeout');

    // Calculate response times
    const responseTimes = successMetrics.map(m => m.duration).sort((a, b) => a - b);
    const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length || 0;
    const p95ResponseTime = responseTimes[Math.floor(responseTimes.length * 0.95)] || 0;
    const p99ResponseTime = responseTimes[Math.floor(responseTimes.length * 0.99)] || 0;

    // Calculate token usage and cost
    let totalTokens = 0;
    let estimatedCost = 0;

    relevantMetrics.forEach(m => {
      if (m.tokenUsage) {
        totalTokens += m.tokenUsage.total;
      }
      
      if (this.config.costEstimates?.[mcp]) {
        const costConfig = this.config.costEstimates[mcp];
        if (costConfig.perCall) {
          estimatedCost += costConfig.perCall;
        }
        if (costConfig.perToken && m.tokenUsage) {
          estimatedCost += costConfig.perToken * m.tokenUsage.total;
        }
      }
    });

    const lastError = errorMetrics[errorMetrics.length - 1];

    return {
      mcp,
      totalCalls: relevantMetrics.length,
      successCount: successMetrics.length,
      errorCount: errorMetrics.length,
      timeoutCount: timeoutMetrics.length,
      avgResponseTime,
      p95ResponseTime,
      p99ResponseTime,
      errorRate: (errorMetrics.length / relevantMetrics.length) * 100,
      totalTokens,
      estimatedCost,
      lastError: lastError?.errorMessage,
      lastErrorTime: lastError?.timestamp
    };
  }

  /**
   * Get aggregated stats for all MCPs
   */
  getAllStats(timeWindow?: number): Record<string, MCPStats> {
    const mcps = [...new Set(this.metrics.map(m => m.mcp))];
    const stats: Record<string, MCPStats> = {};
    
    mcps.forEach(mcp => {
      stats[mcp] = this.getStats(mcp, timeWindow);
    });

    return stats;
  }

  /**
   * Get health status for all MCPs
   */
  getHealthStatus(): MCPHealthStatus[] {
    return Array.from(this.healthStatus.values());
  }

  /**
   * Get metrics for a specific time range
   */
  getMetrics(filter: {
    mcp?: string;
    method?: string;
    status?: MCPMetric['status'];
    startTime?: Date;
    endTime?: Date;
  }): MCPMetric[] {
    return this.metrics.filter(m => {
      if (filter.mcp && m.mcp !== filter.mcp) return false;
      if (filter.method && m.method !== filter.method) return false;
      if (filter.status && m.status !== filter.status) return false;
      if (filter.startTime && m.timestamp < filter.startTime) return false;
      if (filter.endTime && m.timestamp > filter.endTime) return false;
      return true;
    });
  }

  /**
   * Get performance report
   */
  getPerformanceReport(timeWindow?: number): {
    summary: {
      totalCalls: number;
      totalErrors: number;
      avgResponseTime: number;
      totalCost: number;
    };
    byMCP: Record<string, MCPStats>;
    topErrors: Array<{ mcp: string; error: string; count: number }>;
    slowestOperations: Array<{ mcp: string; method: string; avgTime: number }>;
  } {
    const stats = this.getAllStats(timeWindow);
    const windowStart = timeWindow ? Date.now() - timeWindow : 0;
    const relevantMetrics = this.metrics.filter(m => m.timestamp.getTime() > windowStart);

    // Calculate summary
    const summary = {
      totalCalls: relevantMetrics.length,
      totalErrors: relevantMetrics.filter(m => m.status === 'error').length,
      avgResponseTime: relevantMetrics
        .filter(m => m.status === 'success')
        .reduce((sum, m) => sum + m.duration, 0) / relevantMetrics.length || 0,
      totalCost: Object.values(stats).reduce((sum, s) => sum + (s.estimatedCost || 0), 0)
    };

    // Find top errors
    const errorCounts = new Map<string, number>();
    relevantMetrics
      .filter(m => m.status === 'error' && m.errorMessage)
      .forEach(m => {
        const key = `${m.mcp}:${m.errorMessage}`;
        errorCounts.set(key, (errorCounts.get(key) || 0) + 1);
      });

    const topErrors = Array.from(errorCounts.entries())
      .map(([key, count]) => {
        const [mcp, ...errorParts] = key.split(':');
        return { mcp, error: errorParts.join(':'), count };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Find slowest operations
    const operationTimes = new Map<string, number[]>();
    relevantMetrics
      .filter(m => m.status === 'success')
      .forEach(m => {
        const key = `${m.mcp}:${m.method}`;
        if (!operationTimes.has(key)) {
          operationTimes.set(key, []);
        }
        operationTimes.get(key)!.push(m.duration);
      });

    const slowestOperations = Array.from(operationTimes.entries())
      .map(([key, times]) => {
        const [mcp, method] = key.split(':');
        const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
        return { mcp, method, avgTime };
      })
      .sort((a, b) => b.avgTime - a.avgTime)
      .slice(0, 10);

    return {
      summary,
      byMCP: stats,
      topErrors,
      slowestOperations
    };
  }

  /**
   * Export metrics for analysis
   */
  exportMetrics(format: 'json' | 'csv' = 'json'): string {
    if (format === 'json') {
      return JSON.stringify(this.metrics, null, 2);
    }

    // CSV format
    const headers = [
      'timestamp', 'mcp', 'method', 'status', 'duration',
      'error_message', 'token_input', 'token_output', 'token_total'
    ];

    const rows = this.metrics.map(m => [
      m.timestamp.toISOString(),
      m.mcp,
      m.method,
      m.status,
      m.duration,
      m.errorMessage || '',
      m.tokenUsage?.input || '',
      m.tokenUsage?.output || '',
      m.tokenUsage?.total || ''
    ]);

    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  }

  /**
   * Check alert conditions
   */
  private checkAlertConditions(metric: MCPMetric): void {
    const recentMetrics = this.metrics.filter(m => 
      m.mcp === metric.mcp && 
      m.timestamp.getTime() > Date.now() - 5 * 60 * 1000 // Last 5 minutes
    );

    const errorRate = (recentMetrics.filter(m => m.status === 'error').length / recentMetrics.length) * 100;
    const timeoutRate = (recentMetrics.filter(m => m.status === 'timeout').length / recentMetrics.length) * 100;
    const avgResponseTime = recentMetrics
      .filter(m => m.status === 'success')
      .reduce((sum, m) => sum + m.duration, 0) / recentMetrics.length || 0;

    const alerts: string[] = [];

    if (errorRate > this.config.alertThresholds.errorRate) {
      alerts.push(`High error rate: ${errorRate.toFixed(2)}%`);
    }

    if (timeoutRate > this.config.alertThresholds.timeoutRate) {
      alerts.push(`High timeout rate: ${timeoutRate.toFixed(2)}%`);
    }

    if (avgResponseTime > this.config.alertThresholds.responseTime) {
      alerts.push(`High response time: ${avgResponseTime.toFixed(0)}ms`);
    }

    if (alerts.length > 0) {
      this.emit('alert', {
        mcp: metric.mcp,
        alerts,
        stats: {
          errorRate,
          timeoutRate,
          avgResponseTime
        }
      });
    }
  }

  /**
   * Perform health checks
   */
  private async performHealthCheck(mcp: string): Promise<void> {
    const stats = this.getStats(mcp, 5 * 60 * 1000); // Last 5 minutes
    const issues: string[] = [];

    if (stats.errorRate > 50) {
      issues.push('Error rate above 50%');
    }

    if (stats.totalCalls === 0) {
      issues.push('No recent activity');
    }

    if (stats.avgResponseTime > 10000) {
      issues.push('Very high response times');
    }

    const status: MCPHealthStatus['status'] = 
      issues.length === 0 ? 'healthy' :
      issues.length === 1 ? 'degraded' : 'unhealthy';

    this.healthStatus.set(mcp, {
      mcp,
      status,
      uptime: stats.successCount / stats.totalCalls || 0,
      lastCheck: new Date(),
      issues
    });
  }

  /**
   * Start health check timer
   */
  private startHealthChecks(): void {
    this.healthCheckTimer = setInterval(async () => {
      const mcps = [...new Set(this.metrics.map(m => m.mcp))];
      
      for (const mcp of mcps) {
        await this.performHealthCheck(mcp);
      }
    }, this.config.healthCheckInterval);
  }

  /**
   * Start metrics cleanup timer
   */
  private startMetricsCleanup(): void {
    setInterval(() => {
      const cutoff = Date.now() - this.config.metricsRetention;
      this.metrics = this.metrics.filter(m => m.timestamp.getTime() > cutoff);
    }, 60 * 60 * 1000); // Cleanup every hour
  }

  /**
   * Destroy monitor
   */
  destroy(): void {
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
    }
    this.removeAllListeners();
  }
}

// Global monitor instance
export const mcpMonitor = new MCPMonitor();