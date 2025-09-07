import { format, differenceInMinutes, differenceInHours, differenceInDays } from 'date-fns';

export interface AgentMemory {
  id: string;
  type: 'conversation' | 'pattern' | 'insight' | 'action' | 'system_state';
  content: any;
  importance: number; // 1-10 scale
  timestamp: Date;
  context: Record<string, any>;
  tags: string[];
  expiry?: Date;
}

export interface AgentInsight {
  id: string;
  type: 'optimization' | 'pattern' | 'prediction' | 'anomaly' | 'opportunity';
  title: string;
  description: string;
  confidence: number;
  actionable: boolean;
  recommendations: string[];
  data: any;
  timestamp: Date;
}

export interface UserBehaviorPattern {
  id: string;
  pattern: string;
  frequency: number;
  lastOccurrence: Date;
  predictedNext?: Date;
  confidence: number;
  context: Record<string, any>;
}

export interface ContextualKnowledge {
  userPreferences: Record<string, any>;
  workingHours: { start: string; end: string };
  communicationPatterns: Record<string, any>;
  systemUsagePatterns: Record<string, any>;
  productivityPeaks: Array<{ hour: number; efficiency: number }>;
  commonRequests: Array<{ query: string; frequency: number; satisfaction: number }>;
}

class IntelligentAgentCore {
  private memory: Map<string, AgentMemory> = new Map();
  private insights: Map<string, AgentInsight> = new Map();
  private patterns: Map<string, UserBehaviorPattern> = new Map();
  private contextualKnowledge: ContextualKnowledge;
  private learningEnabled = true;

  constructor() {
    this.contextualKnowledge = this.initializeDefaultKnowledge();
    this.loadPersistedData();
  }

  private initializeDefaultKnowledge(): ContextualKnowledge {
    return {
      userPreferences: {
        communicationStyle: 'professional', // professional, casual, technical
        detailLevel: 'balanced', // brief, balanced, detailed
        proactiveAlerts: true,
        autoOptimize: true,
        preferredSystems: ['whatsapp', 'agents', 'telegram'],
        responseTime: 'immediate' // immediate, batched, scheduled
      },
      workingHours: { start: '09:00', end: '17:00' },
      communicationPatterns: {
        peakWhatsAppHours: [9, 10, 14, 15, 16],
        telegramActiveChannels: ['tech-news', 'project-updates'],
        agentInteractionFrequency: 'high'
      },
      systemUsagePatterns: {
        mostUsedFeatures: ['system_status', 'whatsapp_summary', 'agent_monitoring'],
        sessionDuration: 15, // minutes average
        preferredTimeOfDay: 'morning'
      },
      productivityPeaks: [
        { hour: 9, efficiency: 0.9 },
        { hour: 10, efficiency: 0.95 },
        { hour: 14, efficiency: 0.8 },
        { hour: 15, efficiency: 0.85 }
      ],
      commonRequests: [
        { query: 'system status', frequency: 45, satisfaction: 0.92 },
        { query: 'whatsapp summary', frequency: 38, satisfaction: 0.88 },
        { query: 'agent performance', frequency: 32, satisfaction: 0.94 }
      ]
    };
  }

  // MEMORY MANAGEMENT
  storeMemory(memory: Omit<AgentMemory, 'id' | 'timestamp'>): void {
    const id = `mem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newMemory: AgentMemory = {
      ...memory,
      id,
      timestamp: new Date()
    };

    this.memory.set(id, newMemory);
    this.persistData();

    // Auto-cleanup old low-importance memories
    this.cleanupMemory();
  }

  private cleanupMemory(): void {
    const now = new Date();
    const memories = Array.from(this.memory.values());
    
    // Remove expired memories
    memories.forEach(memory => {
      if (memory.expiry && memory.expiry < now) {
        this.memory.delete(memory.id);
      }
    });

    // Keep only top 1000 most important recent memories
    const sortedMemories = memories
      .filter(m => !m.expiry || m.expiry > now)
      .sort((a, b) => {
        const recencyScore = (m: AgentMemory) => {
          const hoursAgo = differenceInHours(now, m.timestamp);
          return Math.max(0, 100 - hoursAgo); // Recent = higher score
        };
        
        const aScore = a.importance * 10 + recencyScore(a);
        const bScore = b.importance * 10 + recencyScore(b);
        return bScore - aScore;
      });

    if (sortedMemories.length > 1000) {
      const toRemove = sortedMemories.slice(1000);
      toRemove.forEach(memory => this.memory.delete(memory.id));
    }
  }

  getRelevantMemories(context: string, limit = 10): AgentMemory[] {
    const contextLower = context.toLowerCase();
    const relevantMemories = Array.from(this.memory.values())
      .filter(memory => {
        // Check if memory is relevant to current context
        const contentStr = JSON.stringify(memory.content).toLowerCase();
        const tagsStr = memory.tags.join(' ').toLowerCase();
        
        return contentStr.includes(contextLower) || 
               tagsStr.includes(contextLower) ||
               Object.keys(memory.context).some(key => 
                 key.toLowerCase().includes(contextLower)
               );
      })
      .sort((a, b) => {
        // Sort by importance and recency
        const now = new Date();
        const aScore = a.importance + (100 - differenceInHours(now, a.timestamp));
        const bScore = b.importance + (100 - differenceInHours(now, b.timestamp));
        return bScore - aScore;
      })
      .slice(0, limit);

    return relevantMemories;
  }

  // PATTERN RECOGNITION
  analyzeUserBehavior(interactions: Array<{ query: string; timestamp: Date; satisfaction?: number }>): void {
    // Analyze request patterns
    const requestCounts: Record<string, number> = {};
    const timePatterns: Record<number, number> = {}; // hour -> frequency

    interactions.forEach(interaction => {
      const normalizedQuery = this.normalizeQuery(interaction.query);
      requestCounts[normalizedQuery] = (requestCounts[normalizedQuery] || 0) + 1;
      
      const hour = interaction.timestamp.getHours();
      timePatterns[hour] = (timePatterns[hour] || 0) + 1;
    });

    // Update common requests
    Object.entries(requestCounts).forEach(([query, count]) => {
      const existing = this.contextualKnowledge.commonRequests.find(r => r.query === query);
      if (existing) {
        existing.frequency = Math.round((existing.frequency + count) / 2);
      } else {
        this.contextualKnowledge.commonRequests.push({
          query,
          frequency: count,
          satisfaction: 0.85 // default satisfaction
        });
      }
    });

    // Update productivity peaks based on usage patterns
    Object.entries(timePatterns).forEach(([hourStr, frequency]) => {
      const hour = parseInt(hourStr);
      const existing = this.contextualKnowledge.productivityPeaks.find(p => p.hour === hour);
      if (existing) {
        existing.efficiency = Math.min(1.0, existing.efficiency + frequency * 0.01);
      } else {
        this.contextualKnowledge.productivityPeaks.push({
          hour,
          efficiency: Math.min(1.0, 0.5 + frequency * 0.01)
        });
      }
    });

    this.persistData();
  }

  private normalizeQuery(query: string): string {
    const normalized = query.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    // Group similar queries
    if (normalized.includes('status') || normalized.includes('overview')) return 'system status';
    if (normalized.includes('whatsapp') || normalized.includes('message')) return 'whatsapp summary';
    if (normalized.includes('telegram')) return 'telegram analysis';
    if (normalized.includes('agent') || normalized.includes('automation')) return 'agent performance';
    if (normalized.includes('alert') || normalized.includes('warning')) return 'alerts review';
    
    return normalized;
  }

  // INTELLIGENT INSIGHTS
  generateInsights(systemData: Record<string, any>): AgentInsight[] {
    const insights: AgentInsight[] = [];
    const now = new Date();

    // Performance optimization insights
    if (systemData.agents) {
      const agents = systemData.agents.activeAgents || [];
      const lowEfficiencyAgents = agents.filter((agent: any) => agent.efficiency < 0.8);
      
      if (lowEfficiencyAgents.length > 0) {
        insights.push({
          id: `insight_perf_${Date.now()}`,
          type: 'optimization',
          title: 'Agent Performance Optimization Opportunity',
          description: `${lowEfficiencyAgents.length} agents showing sub-optimal performance. Consider reviewing configurations or resource allocation.`,
          confidence: 0.85,
          actionable: true,
          recommendations: [
            'Review agent configurations for optimal settings',
            'Check system resources and scaling requirements',
            'Analyze task distribution patterns'
          ],
          data: { agents: lowEfficiencyAgents },
          timestamp: now
        });
      }
    }

    // Communication pattern insights
    if (systemData.whatsapp) {
      const unreadCount = systemData.whatsapp.unreadCount || 0;
      const avgResponse = this.calculateAverageResponseTime();
      
      if (unreadCount > 20) {
        insights.push({
          id: `insight_comm_${Date.now()}`,
          type: 'pattern',
          title: 'High Message Volume Detected',
          description: `${unreadCount} unread messages. Consider batching responses or setting up auto-replies.`,
          confidence: 0.92,
          actionable: true,
          recommendations: [
            'Set up auto-reply for common queries',
            'Schedule dedicated communication windows',
            'Implement message prioritization system'
          ],
          data: { unreadCount, avgResponse },
          timestamp: now
        });
      }
    }

    // System anomaly detection
    const systemHealth = this.analyzeSystemHealth(systemData);
    if (systemHealth.score < 0.8) {
      insights.push({
        id: `insight_anomaly_${Date.now()}`,
        type: 'anomaly',
        title: 'System Health Anomaly Detected',
        description: `Overall system health score: ${Math.round(systemHealth.score * 100)}%. ${systemHealth.issues.join(', ')}.`,
        confidence: 0.88,
        actionable: true,
        recommendations: systemHealth.recommendations,
        data: systemHealth,
        timestamp: now
      });
    }

    // Predictive insights
    const predictions = this.generatePredictions(systemData);
    insights.push(...predictions);

    // Store insights in memory
    insights.forEach(insight => {
      this.insights.set(insight.id, insight);
      this.storeMemory({
        type: 'insight',
        content: insight,
        importance: Math.round(insight.confidence * 10),
        context: { generated: true, systemState: systemData },
        tags: ['insight', insight.type, 'auto-generated']
      });
    });

    return insights;
  }

  private calculateAverageResponseTime(): number {
    // Mock calculation - in real implementation, analyze actual response times
    return 5.5; // minutes
  }

  private analyzeSystemHealth(systemData: Record<string, any>): { score: number; issues: string[]; recommendations: string[] } {
    let score = 1.0;
    const issues: string[] = [];
    const recommendations: string[] = [];

    // Check various system health indicators
    if (systemData.monitor) {
      const { cpu, memory, alerts } = systemData.monitor;
      
      if (cpu > 80) {
        score -= 0.2;
        issues.push('High CPU usage');
        recommendations.push('Optimize high-CPU processes');
      }
      
      if (memory > 85) {
        score -= 0.15;
        issues.push('High memory usage');
        recommendations.push('Review memory-intensive applications');
      }
      
      if (alerts && alerts.length > 5) {
        score -= 0.1;
        issues.push('Multiple active alerts');
        recommendations.push('Address pending alerts');
      }
    }

    return { score: Math.max(0, score), issues, recommendations };
  }

  private generatePredictions(systemData: Record<string, any>): AgentInsight[] {
    const predictions: AgentInsight[] = [];
    const now = new Date();

    // Predict busy periods based on patterns
    const currentHour = now.getHours();
    const peakHours = this.contextualKnowledge.productivityPeaks
      .filter(p => p.efficiency > 0.8)
      .map(p => p.hour);

    if (peakHours.includes(currentHour + 1) || peakHours.includes(currentHour + 2)) {
      predictions.push({
        id: `pred_busy_${Date.now()}`,
        type: 'prediction',
        title: 'High Activity Period Predicted',
        description: 'Based on your patterns, expect increased system activity in the next 1-2 hours.',
        confidence: 0.78,
        actionable: true,
        recommendations: [
          'Pre-process routine tasks now',
          'Clear message queues',
          'Monitor system resources'
        ],
        data: { predictedPeakHours: peakHours },
        timestamp: now
      });
    }

    return predictions;
  }

  // CONTEXTUAL REASONING
  analyzeContext(query: string, systemData: Record<string, any>): {
    intent: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    suggestedActions: string[];
    relevantData: any;
    confidence: number;
  } {
    const queryLower = query.toLowerCase();
    const relevantMemories = this.getRelevantMemories(query, 5);
    
    // Intent recognition
    let intent = 'general_inquiry';
    let priority: 'low' | 'medium' | 'high' | 'critical' = 'medium';
    let suggestedActions: string[] = [];
    let relevantData: any = {};
    let confidence = 0.7;

    // Analyze query patterns
    if (queryLower.includes('urgent') || queryLower.includes('critical') || queryLower.includes('emergency')) {
      priority = 'critical';
      confidence = 0.95;
    }

    if (queryLower.includes('status') || queryLower.includes('health') || queryLower.includes('overview')) {
      intent = 'system_monitoring';
      relevantData = {
        systemStatuses: systemData,
        recentAlerts: this.getRecentAlerts(),
        performanceMetrics: this.getPerformanceMetrics(systemData)
      };
      suggestedActions = [
        'Show comprehensive system dashboard',
        'Highlight any anomalies or issues',
        'Provide performance recommendations'
      ];
      confidence = 0.92;
    }

    if (queryLower.includes('whatsapp') || queryLower.includes('message')) {
      intent = 'communication_management';
      relevantData = systemData.whatsapp || {};
      suggestedActions = [
        'Summarize important messages',
        'Show unread message count by conversation',
        'Suggest response priorities'
      ];
      confidence = 0.89;
    }

    if (queryLower.includes('agent') || queryLower.includes('automation')) {
      intent = 'agent_management';
      relevantData = systemData.agents || {};
      suggestedActions = [
        'Display agent performance metrics',
        'Show task completion rates',
        'Highlight any inefficiencies'
      ];
      confidence = 0.91;
    }

    if (queryLower.includes('optimize') || queryLower.includes('improve')) {
      intent = 'optimization_request';
      priority = 'high';
      const insights = Array.from(this.insights.values())
        .filter(i => i.type === 'optimization' && i.actionable)
        .slice(0, 3);
      
      relevantData = { insights, systemData };
      suggestedActions = [
        'Analyze current performance bottlenecks',
        'Provide specific optimization recommendations',
        'Suggest implementation priorities'
      ];
      confidence = 0.87;
    }

    // Use memory to enhance context
    if (relevantMemories.length > 0) {
      const memoryContext = relevantMemories.map(m => m.context).reduce((acc, ctx) => ({ ...acc, ...ctx }), {});
      relevantData = { ...relevantData, memoryContext, relevantMemories };
      confidence = Math.min(0.98, confidence + 0.05); // Slight boost for context
    }

    return {
      intent,
      priority,
      suggestedActions,
      relevantData,
      confidence
    };
  }

  private getRecentAlerts(): any[] {
    return Array.from(this.memory.values())
      .filter(m => m.type === 'system_state' && m.tags.includes('alert'))
      .slice(0, 10);
  }

  private getPerformanceMetrics(systemData: Record<string, any>): any {
    return {
      uptime: systemData.monitor?.uptime || 99.5,
      responseTime: this.calculateAverageResponseTime(),
      efficiency: systemData.agents?.performance?.overallEfficiency || 94.2,
      errorRate: systemData.agents?.performance?.errors || 0.02
    };
  }

  // PROACTIVE CAPABILITIES
  shouldSendProactiveAlert(systemData: Record<string, any>): { send: boolean; message?: string; priority?: string } {
    if (!this.contextualKnowledge.userPreferences.proactiveAlerts) {
      return { send: false };
    }

    const now = new Date();
    const currentHour = now.getHours();
    
    // Don't send alerts outside working hours unless critical
    const workStart = parseInt(this.contextualKnowledge.workingHours.start.split(':')[0]);
    const workEnd = parseInt(this.contextualKnowledge.workingHours.end.split(':')[0]);
    const isWorkingHours = currentHour >= workStart && currentHour <= workEnd;

    // Check for critical issues
    const criticalIssues = this.detectCriticalIssues(systemData);
    if (criticalIssues.length > 0) {
      return {
        send: true,
        message: `🚨 Critical Alert: ${criticalIssues.join(', ')}`,
        priority: 'critical'
      };
    }

    // Check for opportunities during working hours
    if (isWorkingHours) {
      const opportunities = this.detectOpportunities(systemData);
      if (opportunities.length > 0) {
        return {
          send: true,
          message: `💡 Opportunity Detected: ${opportunities[0]}`,
          priority: 'medium'
        };
      }
    }

    return { send: false };
  }

  private detectCriticalIssues(systemData: Record<string, any>): string[] {
    const issues: string[] = [];

    // Check system health
    if (systemData.monitor) {
      if (systemData.monitor.cpu > 90) issues.push('CPU usage critically high (>90%)');
      if (systemData.monitor.memory > 95) issues.push('Memory usage critically high (>95%)');
    }

    // Check agent failures
    if (systemData.agents) {
      const failedAgents = systemData.agents.activeAgents?.filter((a: any) => a.status === 'error') || [];
      if (failedAgents.length > 0) {
        issues.push(`${failedAgents.length} agents in error state`);
      }
    }

    return issues;
  }

  private detectOpportunities(systemData: Record<string, any>): string[] {
    const opportunities: string[] = [];

    // Check for optimization opportunities
    if (systemData.agents?.performance?.overallEfficiency < 0.85) {
      opportunities.push('Agent efficiency below 85% - optimization recommended');
    }

    // Check for unused resources
    if (systemData.monitor?.cpu < 30 && systemData.monitor?.memory < 50) {
      opportunities.push('Low resource usage - consider scaling down or adding workloads');
    }

    return opportunities;
  }

  // LEARNING AND ADAPTATION
  learnFromInteraction(query: string, response: any, userFeedback?: 'positive' | 'negative' | 'neutral'): void {
    if (!this.learningEnabled) return;

    const satisfaction = userFeedback === 'positive' ? 1.0 : userFeedback === 'negative' ? 0.0 : 0.5;
    
    // Update common requests with satisfaction feedback
    const normalizedQuery = this.normalizeQuery(query);
    const existing = this.contextualKnowledge.commonRequests.find(r => r.query === normalizedQuery);
    
    if (existing) {
      existing.satisfaction = (existing.satisfaction + satisfaction) / 2;
    }

    // Store interaction in memory
    this.storeMemory({
      type: 'conversation',
      content: { query, response, feedback: userFeedback },
      importance: userFeedback === 'negative' ? 8 : userFeedback === 'positive' ? 6 : 4,
      context: { satisfaction, queryType: normalizedQuery },
      tags: ['interaction', 'learning', normalizedQuery]
    });

    // Adapt response strategy based on feedback
    if (userFeedback === 'negative') {
      this.adaptResponseStrategy(normalizedQuery, 'decrease_confidence');
    } else if (userFeedback === 'positive') {
      this.adaptResponseStrategy(normalizedQuery, 'increase_confidence');
    }
  }

  private adaptResponseStrategy(queryType: string, adaptation: 'increase_confidence' | 'decrease_confidence'): void {
    // Adjust confidence levels for similar query types
    const relatedMemories = this.getRelevantMemories(queryType, 20);
    
    relatedMemories.forEach(memory => {
      if (memory.type === 'conversation') {
        const adjustment = adaptation === 'increase_confidence' ? 0.05 : -0.05;
        memory.importance = Math.max(1, Math.min(10, memory.importance + adjustment));
      }
    });
  }

  // DATA PERSISTENCE
  private persistData(): void {
    try {
      const data = {
        contextualKnowledge: this.contextualKnowledge,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem('legacyAI_knowledge', JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to persist Legacy AI data:', error);
    }
  }

  private loadPersistedData(): void {
    try {
      const stored = localStorage.getItem('legacyAI_knowledge');
      if (stored) {
        const data = JSON.parse(stored);
        this.contextualKnowledge = { ...this.contextualKnowledge, ...data.contextualKnowledge };
      }
    } catch (error) {
      console.warn('Failed to load persisted Legacy AI data:', error);
    }
  }

  // PUBLIC API
  getKnowledge(): ContextualKnowledge {
    return { ...this.contextualKnowledge };
  }

  getAllInsights(): AgentInsight[] {
    return Array.from(this.insights.values()).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  enableLearning(enabled: boolean): void {
    this.learningEnabled = enabled;
  }

  reset(): void {
    this.memory.clear();
    this.insights.clear();
    this.patterns.clear();
    this.contextualKnowledge = this.initializeDefaultKnowledge();
    localStorage.removeItem('legacyAI_knowledge');
  }
}

export const intelligentAgentCore = new IntelligentAgentCore();
export default intelligentAgentCore;