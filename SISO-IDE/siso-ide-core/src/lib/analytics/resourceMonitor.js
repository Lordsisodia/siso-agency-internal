import { analytics, eventBuilders } from './index';

/**
 * Resource monitoring utility for tracking system resource usage and performance
 * Helps identify performance bottlenecks and resource-intensive operations
 * Adapted from Claudia-GUI for SISO IDE
 */
export class ResourceMonitor {
  constructor() {
    if (ResourceMonitor.instance) {
      return ResourceMonitor.instance;
    }
    
    this.monitoringInterval = null;
    this.isMonitoring = false;
    this.sampleCount = 0;
    this.highUsageThresholds = {
      memory: 500, // MB
      cpu: 80, // percent
      networkRequests: 50, // per interval
    };
    
    // SISO IDE specific tracking
    this.sisoSessionCount = 0;
    this.mcpServerCount = 0;
    this.activeFileCount = 0;
    
    ResourceMonitor.instance = this;
  }
  
  static getInstance() {
    if (!ResourceMonitor.instance) {
      ResourceMonitor.instance = new ResourceMonitor();
    }
    return ResourceMonitor.instance;
  }
  
  /**
   * Start monitoring resource usage with periodic sampling
   * @param intervalMs - Sampling interval in milliseconds (default: 120000ms = 2 minutes like Claudia-GUI)
   */
  startMonitoring(intervalMs = 120000) {
    if (this.isMonitoring) {
      console.warn('Resource monitoring is already active');
      return;
    }
    
    this.isMonitoring = true;
    this.sampleCount = 0;
    
    // Initial sample
    this.collectAndReportMetrics();
    
    // Set up periodic sampling
    this.monitoringInterval = setInterval(() => {
      this.collectAndReportMetrics();
    }, intervalMs);
    
    console.log(`SISO IDE Resource monitoring started with ${intervalMs}ms interval`);
  }
  
  /**
   * Stop resource monitoring
   */
  stopMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    this.isMonitoring = false;
    console.log('SISO IDE Resource monitoring stopped');
  }
  
  /**
   * Collect current resource metrics with SISO IDE specific data
   */
  collectResourceMetrics() {
    const metrics = {
      memory_usage_mb: this.getMemoryUsage(),
      network_requests_count: this.getNetworkRequestsCount(),
      active_connections: this.getActiveConnections(),
      // SISO IDE specific metrics
      active_claude_sessions: this.getActiveClaudeSessions(),
      mcp_servers_connected: this.getMCPServerCount(),
      open_files_count: this.getOpenFilesCount(),
      code_generation_rate: this.getCodeGenerationRate(),
      token_usage_rate: this.getTokenUsageRate(),
      productivity_score: this.calculateProductivityScore(),
    };
    
    // Add CPU usage if available
    const cpuUsage = this.getCPUUsage();
    if (cpuUsage !== null) {
      metrics.cpu_usage_percent = cpuUsage;
    }
    
    // Add cache hit rate if available
    const cacheHitRate = this.getCacheHitRate();
    if (cacheHitRate !== null) {
      metrics.cache_hit_rate = cacheHitRate;
    }
    
    return metrics;
  }
  
  /**
   * Collect metrics and report to analytics
   */
  collectAndReportMetrics() {
    try {
      const metrics = this.collectResourceMetrics();
      this.sampleCount++;
      
      // Always send sampled data every 10th sample for baseline tracking
      if (this.sampleCount % 10 === 0) {
        const event = eventBuilders.resourceUsageSampled(metrics);
        analytics.track(event.event, event.properties);
      }
      
      // Check for high usage conditions
      const isHighUsage = 
        metrics.memory_usage_mb > this.highUsageThresholds.memory ||
        (metrics.cpu_usage_percent && metrics.cpu_usage_percent > this.highUsageThresholds.cpu) ||
        metrics.network_requests_count > this.highUsageThresholds.networkRequests;
      
      if (isHighUsage) {
        const event = eventBuilders.resourceUsageHigh(metrics);
        analytics.track(event.event, event.properties);
      }
    } catch (error) {
      console.error('Failed to collect resource metrics:', error);
    }
  }
  
  /**
   * Get current memory usage in MB
   */
  getMemoryUsage() {
    if ('memory' in performance && performance.memory) {
      return performance.memory.usedJSHeapSize / (1024 * 1024);
    }
    
    // Fallback: estimate based on DOM size and other factors
    try {
      const estimatedMB = (document.querySelectorAll('*').length * 0.001) + 50;
      return Math.min(estimatedMB, 100); // Cap at reasonable estimate
    } catch {
      return 0;
    }
  }
  
  /**
   * Get CPU usage percentage (placeholder for SISO IDE)
   */
  getCPUUsage() {
    // This would require backend integration to get real CPU usage
    // For now, estimate based on activity
    const recentActivity = this.getRecentActivity();
    if (recentActivity > 10) return 70; // High activity
    if (recentActivity > 5) return 40;  // Medium activity
    return 20; // Low activity
  }
  
  /**
   * Get count of active network requests
   */
  getNetworkRequestsCount() {
    if ('PerformanceObserver' in window) {
      try {
        const entries = performance.getEntriesByType('resource');
        const recentEntries = entries.filter(entry => 
          entry.startTime > performance.now() - 60000 // Last minute
        );
        return recentEntries.length;
      } catch {
        return 0;
      }
    }
    return 0;
  }
  
  /**
   * Get number of active connections (WebSocket, SSE, etc.)
   */
  getActiveConnections() {
    // Count WebSocket connections and other active connections
    let connections = 0;
    
    // Check for SISO IDE WebSocket
    if (window.ws && window.ws.readyState === WebSocket.OPEN) {
      connections++;
    }
    
    // Add other connection counts as needed
    return connections;
  }
  
  /**
   * Get cache hit rate if available
   */
  getCacheHitRate() {
    // This would need to be calculated based on SISO's caching implementation
    return null;
  }
  
  // SISO IDE specific metrics
  
  /**
   * Get number of active Claude sessions
   */
  getActiveClaudeSessions() {
    try {
      // Try to get from global state or localStorage
      const activeSessions = JSON.parse(localStorage.getItem('activeSessions') || '[]');
      return activeSessions.length;
    } catch {
      return this.sisoSessionCount;
    }
  }
  
  /**
   * Get number of connected MCP servers
   */
  getMCPServerCount() {
    try {
      // This would integrate with SISO's MCP system
      // For now, estimate based on common configurations
      return this.mcpServerCount;
    } catch {
      return 0;
    }
  }
  
  /**
   * Get number of open files in the IDE
   */
  getOpenFilesCount() {
    try {
      // This would integrate with SISO's file management
      return this.activeFileCount;
    } catch {
      return 0;
    }
  }
  
  /**
   * Calculate code generation rate (lines per minute)
   */
  getCodeGenerationRate() {
    try {
      // This would track actual code generation
      // For now, return a placeholder
      return 0;
    } catch {
      return 0;
    }
  }
  
  /**
   * Calculate token usage rate (tokens per minute)
   */
  getTokenUsageRate() {
    try {
      // This would integrate with usage tracking
      return 0;
    } catch {
      return 0;
    }
  }
  
  /**
   * Calculate productivity score (0-100)
   */
  calculateProductivityScore() {
    try {
      const sessions = this.getActiveClaudeSessions();
      const files = this.getOpenFilesCount();
      const memory = this.getMemoryUsage();
      
      // Simple productivity calculation
      let score = 50; // Base score
      score += Math.min(sessions * 10, 30); // Active sessions boost
      score += Math.min(files * 5, 20); // Open files boost
      score -= Math.max((memory - 200) / 10, 0); // Memory penalty
      
      return Math.max(0, Math.min(100, score));
    } catch {
      return 50; // Default score
    }
  }
  
  /**
   * Get recent activity level (0-20 scale)
   */
  getRecentActivity() {
    try {
      const sessions = this.getActiveClaudeSessions();
      const networkRequests = this.getNetworkRequestsCount();
      return Math.min(sessions * 2 + networkRequests / 5, 20);
    } catch {
      return 5; // Default activity
    }
  }
  
  /**
   * Update SISO session count
   */
  updateSessionCount(count) {
    this.sisoSessionCount = count;
  }
  
  /**
   * Update MCP server count
   */
  updateMCPServerCount(count) {
    this.mcpServerCount = count;
  }
  
  /**
   * Update active file count
   */
  updateActiveFileCount(count) {
    this.activeFileCount = count;
  }
  
  /**
   * Set custom thresholds for high usage detection
   */
  setThresholds(thresholds) {
    this.highUsageThresholds = {
      ...this.highUsageThresholds,
      ...thresholds,
    };
  }
  
  /**
   * Get current thresholds
   */
  getThresholds() {
    return { ...this.highUsageThresholds };
  }
  
  /**
   * Force a single metric collection and report
   */
  collectOnce() {
    const metrics = this.collectResourceMetrics();
    
    // Check for high usage
    const isHighUsage = 
      metrics.memory_usage_mb > this.highUsageThresholds.memory ||
      (metrics.cpu_usage_percent && metrics.cpu_usage_percent > this.highUsageThresholds.cpu) ||
      metrics.network_requests_count > this.highUsageThresholds.networkRequests;
    
    if (isHighUsage) {
      const event = eventBuilders.resourceUsageHigh(metrics);
      analytics.track(event.event, event.properties);
    }
    
    return metrics;
  }
}

// Create and export singleton instance
ResourceMonitor.instance = null;
export const resourceMonitor = new ResourceMonitor();