import { format } from 'date-fns';
import { intelligentAgentCore, AgentInsight } from './intelligentAgentCore';

export interface SystemIntegration {
  id: string;
  name: string;
  status: 'online' | 'offline' | 'warning' | 'error';
  lastActivity: string;
  data?: any;
  capabilities: string[];
}

export interface LegacyAIAnalysis {
  summary: string;
  insights: string[];
  actionItems: string[];
  systemData: Record<string, any>;
  confidence: number;
}

export interface WhatsAppData {
  unreadCount: number;
  conversations: Array<{
    id: string;
    name: string;
    lastMessage: string;
    timestamp: Date;
    unreadCount: number;
    isGroup: boolean;
    priority: 'low' | 'medium' | 'high';
  }>;
  importantMessages: Array<{
    id: string;
    from: string;
    content: string;
    timestamp: Date;
    flagged: boolean;
  }>;
}

export interface TelegramData {
  channels: Array<{
    id: string;
    name: string;
    unreadCount: number;
    lastActivity: Date;
    category: string;
  }>;
  privateChats: Array<{
    id: string;
    name: string;
    lastMessage: string;
    timestamp: Date;
  }>;
  bots: Array<{
    id: string;
    name: string;
    status: string;
    notifications: number;
  }>;
}

export interface AgentSystemData {
  activeAgents: Array<{
    id: string;
    name: string;
    status: 'running' | 'idle' | 'error';
    lastActivity: Date;
    tasksCompleted: number;
    efficiency: number;
  }>;
  automations: Array<{
    id: string;
    name: string;
    status: 'active' | 'paused' | 'error';
    lastRun: Date;
    successRate: number;
    rateLimitHit: boolean;
  }>;
  performance: {
    overallEfficiency: number;
    tasksCompleted: number;
    errors: number;
    uptime: number;
  };
}

export interface SystemMonitorData {
  cpu: number;
  memory: number;
  disk: number;
  network: number;
  processes: Array<{
    name: string;
    cpu: number;
    memory: number;
    status: string;
  }>;
  alerts: Array<{
    id: string;
    type: 'warning' | 'error' | 'info';
    message: string;
    timestamp: Date;
  }>;
}

class LegacyAIService {
  private integrations: Map<string, SystemIntegration> = new Map();
  private lastSyncTime: Date = new Date();

  constructor() {
    this.initializeIntegrations();
  }

  private initializeIntegrations() {
    // Initialize system integrations
    this.integrations.set('whatsapp', {
      id: 'whatsapp',
      name: 'WhatsApp',
      status: 'online',
      lastActivity: '2 min ago',
      capabilities: ['read_messages', 'send_messages', 'analyze_conversations', 'backup_data']
    });

    this.integrations.set('telegram', {
      id: 'telegram',
      name: 'Telegram',
      status: 'online',
      lastActivity: '5 min ago',
      capabilities: ['read_channels', 'manage_bots', 'analyze_trends', 'moderate_groups']
    });

    this.integrations.set('agents', {
      id: 'agents',
      name: 'Agent System',
      status: 'online',
      lastActivity: '1 min ago',
      capabilities: ['monitor_agents', 'deploy_automations', 'analyze_performance', 'manage_workflows']
    });

    this.integrations.set('automation_dev', {
      id: 'automation_dev',
      name: 'Automation Dev',
      status: 'warning',
      lastActivity: '15 min ago',
      capabilities: ['dev_monitoring', 'deployment_tracking', 'error_analysis', 'performance_optimization']
    });

    this.integrations.set('database', {
      id: 'database',
      name: 'Database',
      status: 'online',
      lastActivity: 'Just now',
      capabilities: ['query_data', 'analyze_patterns', 'generate_reports', 'data_validation']
    });

    this.integrations.set('analytics', {
      id: 'analytics',
      name: 'Analytics',
      status: 'online',
      lastActivity: '3 min ago',
      capabilities: ['user_analytics', 'performance_metrics', 'trend_analysis', 'predictive_insights']
    });

    this.integrations.set('system_monitor', {
      id: 'system_monitor',
      name: 'System Monitor',
      status: 'online',
      lastActivity: 'Just now',
      capabilities: ['resource_monitoring', 'alert_management', 'performance_tracking', 'health_checks']
    });
  }

  async getSystemStatus(): Promise<SystemIntegration[]> {
    // Simulate real-time status updates
    const statuses = Array.from(this.integrations.values());
    
    // Update some statuses randomly for demo
    statuses.forEach(status => {
      if (Math.random() < 0.1) { // 10% chance to update
        status.lastActivity = this.getRandomActivity();
      }
    });

    return statuses;
  }

  async analyzeWhatsAppData(): Promise<WhatsAppData> {
    // Simulate WhatsApp data analysis
    const mockData: WhatsAppData = {
      unreadCount: Math.floor(Math.random() * 50) + 5,
      conversations: [
        {
          id: '1',
          name: 'Work Team',
          lastMessage: 'Meeting scheduled for tomorrow at 10 AM',
          timestamp: new Date(Date.now() - 10 * 60 * 1000),
          unreadCount: 3,
          isGroup: true,
          priority: 'high'
        },
        {
          id: '2',
          name: 'Project Client',
          lastMessage: 'When can we review the latest updates?',
          timestamp: new Date(Date.now() - 30 * 60 * 1000),
          unreadCount: 1,
          isGroup: false,
          priority: 'high'
        },
        {
          id: '3',
          name: 'Family Group',
          lastMessage: 'Dinner plans for this weekend?',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          unreadCount: 5,
          isGroup: true,
          priority: 'medium'
        }
      ],
      importantMessages: [
        {
          id: 'imp1',
          from: 'Project Client',
          content: 'URGENT: Need deployment approval by EOD',
          timestamp: new Date(Date.now() - 45 * 60 * 1000),
          flagged: true
        },
        {
          id: 'imp2',
          from: 'Boss',
          content: 'Great work on the last sprint. Team meeting tomorrow.',
          timestamp: new Date(Date.now() - 60 * 60 * 1000),
          flagged: true
        }
      ]
    };

    return mockData;
  }

  async analyzeTelegramData(): Promise<TelegramData> {
    const mockData: TelegramData = {
      channels: [
        {
          id: 'ch1',
          name: 'Tech News',
          unreadCount: 12,
          lastActivity: new Date(Date.now() - 15 * 60 * 1000),
          category: 'news'
        },
        {
          id: 'ch2',
          name: 'Project Updates',
          unreadCount: 3,
          lastActivity: new Date(Date.now() - 30 * 60 * 1000),
          category: 'work'
        },
        {
          id: 'ch3',
          name: 'Dev Community',
          unreadCount: 8,
          lastActivity: new Date(Date.now() - 45 * 60 * 1000),
          category: 'development'
        }
      ],
      privateChats: [
        {
          id: 'pc1',
          name: 'Development Partner',
          lastMessage: 'Code review looks good, ready to merge',
          timestamp: new Date(Date.now() - 20 * 60 * 1000)
        },
        {
          id: 'pc2',
          name: 'API Support',
          lastMessage: 'Rate limit increased for your account',
          timestamp: new Date(Date.now() - 60 * 60 * 1000)
        }
      ],
      bots: [
        {
          id: 'bot1',
          name: 'Deployment Bot',
          status: 'active',
          notifications: 2
        },
        {
          id: 'bot2',
          name: 'Analytics Bot',
          status: 'active',
          notifications: 1
        },
        {
          id: 'bot3',
          name: 'Backup Bot',
          status: 'idle',
          notifications: 0
        }
      ]
    };

    return mockData;
  }

  async analyzeAgentSystem(): Promise<AgentSystemData> {
    const mockData: AgentSystemData = {
      activeAgents: [
        {
          id: 'agent1',
          name: 'Task Processor',
          status: 'running',
          lastActivity: new Date(Date.now() - 5 * 60 * 1000),
          tasksCompleted: 47,
          efficiency: 96.2
        },
        {
          id: 'agent2',
          name: 'Data Collector',
          status: 'running',
          lastActivity: new Date(Date.now() - 2 * 60 * 1000),
          tasksCompleted: 23,
          efficiency: 89.1
        },
        {
          id: 'agent3',
          name: 'Report Generator',
          status: 'idle',
          lastActivity: new Date(Date.now() - 30 * 60 * 1000),
          tasksCompleted: 12,
          efficiency: 94.5
        }
      ],
      automations: [
        {
          id: 'auto1',
          name: 'Daily Sync',
          status: 'active',
          lastRun: new Date(Date.now() - 10 * 60 * 1000),
          successRate: 98.5,
          rateLimitHit: false
        },
        {
          id: 'auto2',
          name: 'API Monitor',
          status: 'active',
          lastRun: new Date(Date.now() - 5 * 60 * 1000),
          successRate: 92.1,
          rateLimitHit: true
        },
        {
          id: 'auto3',
          name: 'Backup Process',
          status: 'active',
          lastRun: new Date(Date.now() - 60 * 60 * 1000),
          successRate: 100,
          rateLimitHit: false
        }
      ],
      performance: {
        overallEfficiency: 94.2,
        tasksCompleted: 82,
        errors: 3,
        uptime: 99.8
      }
    };

    return mockData;
  }

  async getSystemMonitorData(): Promise<SystemMonitorData> {
    const mockData: SystemMonitorData = {
      cpu: Math.random() * 30 + 20, // 20-50%
      memory: Math.random() * 20 + 40, // 40-60%
      disk: Math.random() * 15 + 35, // 35-50%
      network: Math.random() * 50 + 10, // 10-60%
      processes: [
        { name: 'Claude Code Agent', cpu: 15.2, memory: 8.4, status: 'running' },
        { name: 'WhatsApp Connector', cpu: 2.1, memory: 3.2, status: 'running' },
        { name: 'Database Sync', cpu: 5.7, memory: 12.1, status: 'running' },
        { name: 'AI Processing', cpu: 22.3, memory: 18.9, status: 'running' }
      ],
      alerts: [
        {
          id: 'alert1',
          type: 'warning',
          message: 'API rate limit approaching for Automation Dev',
          timestamp: new Date(Date.now() - 15 * 60 * 1000)
        },
        {
          id: 'alert2',
          type: 'info',
          message: 'System backup completed successfully',
          timestamp: new Date(Date.now() - 60 * 60 * 1000)
        }
      ]
    };

    return mockData;
  }

  async generateIntelligentAnalysis(query: string): Promise<LegacyAIAnalysis> {
    // Try to get real data from GitHub first, fallback to mock data
    let systemData;
    
    try {
      const { githubDataStreamer } = await import('./githubDataStreamer');
      const realData = await githubDataStreamer.getLatestSystemData();
      
      if (realData) {
        console.log('🔄 Using real system data from GitHub');
        systemData = {
          whatsapp: realData.whatsapp,
          telegram: realData.telegram,
          agents: realData.agents,
          monitor: realData.system,
          integrations: await this.getSystemStatus(),
          dataSource: 'github_real',
          lastUpdate: realData.timestamp
        };
      } else {
        throw new Error('No real data available');
      }
    } catch (error) {
      console.log('📊 Using mock system data (GitHub data unavailable)');
      // Fallback to mock data
      systemData = {
        whatsapp: await this.analyzeWhatsAppData(),
        telegram: await this.analyzeTelegramData(),
        agents: await this.analyzeAgentSystem(),
        monitor: await this.getSystemMonitorData(),
        integrations: await this.getSystemStatus(),
        dataSource: 'mock',
        lastUpdate: new Date().toISOString()
      };
    }

    // Try to use Groq for intelligent analysis
    try {
      const { groqLegacyAI } = await import('./groqLegacyAI');
      console.log('🚀 Using Groq for intelligent analysis');
      return await groqLegacyAI.generateIntelligentAnalysis(query, systemData);
    } catch (error) {
      console.log('🧠 Groq unavailable, using local intelligence');
      // Fallback to local intelligence
      return this.generateLocalIntelligentAnalysis(query, systemData);
    }
  }

  private async generateLocalIntelligentAnalysis(query: string, systemData: any): Promise<LegacyAIAnalysis> {

    // Use intelligent agent core for context analysis
    const context = intelligentAgentCore.analyzeContext(query, systemData);
    
    // Generate AI insights based on current system state
    const aiInsights = intelligentAgentCore.generateInsights(systemData);
    
    // Check for proactive alerts
    const proactiveAlert = intelligentAgentCore.shouldSendProactiveAlert(systemData);
    
    let analysis: LegacyAIAnalysis;

    // Build intelligent response based on intent and context
    switch (context.intent) {
      case 'system_monitoring':
        analysis = await this.generateSystemMonitoringAnalysis(systemData, context, aiInsights);
        break;
      
      case 'communication_management':
        analysis = await this.generateCommunicationAnalysis(systemData, context, aiInsights);
        break;
      
      case 'agent_management':
        analysis = await this.generateAgentAnalysis(systemData, context, aiInsights);
        break;
      
      case 'optimization_request':
        analysis = await this.generateOptimizationAnalysis(systemData, context, aiInsights);
        break;
      
      default:
        analysis = await this.generateGeneralAnalysis(query, systemData, context, aiInsights);
    }

    // Add proactive alerts if needed
    if (proactiveAlert.send && proactiveAlert.message) {
      analysis.insights.unshift(`🚨 PROACTIVE ALERT: ${proactiveAlert.message}`);
    }

    // Store the interaction for learning
    intelligentAgentCore.storeMemory({
      type: 'conversation',
      content: { query, analysis, context },
      importance: context.priority === 'critical' ? 9 : context.priority === 'high' ? 7 : 5,
      context: { intent: context.intent, confidence: context.confidence },
      tags: ['query', context.intent, 'analysis']
    });

    return analysis;
  }

  private async generateSystemMonitoringAnalysis(
    systemData: any, 
    context: any, 
    aiInsights: AgentInsight[]
  ): Promise<LegacyAIAnalysis> {
    const { monitor, integrations, agents } = systemData;
    const onlineCount = integrations.filter((i: any) => i.status === 'online').length;
    const totalSystems = integrations.length;
    
    // Calculate overall health score
    const healthScore = this.calculateOverallHealthScore(systemData);
    
    const summary = `🎯 System Health Score: ${Math.round(healthScore * 100)}% | ${onlineCount}/${totalSystems} systems online | CPU: ${monitor.cpu.toFixed(1)}% | Memory: ${monitor.memory.toFixed(1)}% | ${agents.performance.tasksCompleted} tasks completed today`;

    const insights = [
      `Overall system efficiency: ${agents.performance.overallEfficiency}%`,
      `${monitor.alerts.length} active alerts requiring attention`,
      `Network utilization: ${monitor.network.toFixed(1)}%`,
      ...aiInsights.slice(0, 2).map(insight => `AI Insight: ${insight.description}`)
    ];

    const actionItems = [
      'Review and address active system alerts',
      'Monitor resource usage trends for optimization',
      'Validate all system integrations are functioning',
      ...aiInsights.filter(i => i.actionable).slice(0, 2).flatMap(i => i.recommendations)
    ];

    return {
      summary,
      insights,
      actionItems,
      systemData,
      confidence: Math.min(0.98, context.confidence + 0.05)
    };
  }

  private async generateCommunicationAnalysis(
    systemData: any, 
    context: any, 
    aiInsights: AgentInsight[]
  ): Promise<LegacyAIAnalysis> {
    const { whatsapp, telegram } = systemData;
    
    const totalUnread = whatsapp.unreadCount + telegram.channels.reduce((sum: number, ch: any) => sum + ch.unreadCount, 0);
    const importantMessages = whatsapp.importantMessages.length;
    
    const summary = `📱 Communication Overview: ${totalUnread} total unread messages | ${importantMessages} flagged as important | ${telegram.bots.filter((b: any) => b.status === 'active').length} Telegram bots active`;

    const insights = [
      `WhatsApp: ${whatsapp.conversations.filter((c: any) => c.priority === 'high').length} high-priority conversations`,
      `Telegram: Most active channel is "${telegram.channels[0]?.name}" with ${telegram.channels[0]?.unreadCount} messages`,
      `Communication pattern suggests ${this.predictOptimalResponseTime()} optimal response window`,
      ...aiInsights.filter(i => i.type === 'pattern').slice(0, 1).map(i => i.description)
    ];

    const actionItems = [
      'Respond to high-priority WhatsApp conversations first',
      `Review important messages: ${whatsapp.importantMessages.map((m: any) => m.from).join(', ')}`,
      'Check Telegram bot notifications for automated responses',
      'Consider setting up smart auto-replies for common queries'
    ];

    return {
      summary,
      insights,
      actionItems,
      systemData: { whatsapp, telegram },
      confidence: context.confidence
    };
  }

  private async generateAgentAnalysis(
    systemData: any, 
    context: any, 
    aiInsights: AgentInsight[]
  ): Promise<LegacyAIAnalysis> {
    const { agents } = systemData;
    const activeAgents = agents.activeAgents.filter((a: any) => a.status === 'running').length;
    const avgEfficiency = agents.activeAgents.reduce((sum: number, a: any) => sum + a.efficiency, 0) / agents.activeAgents.length;
    
    const summary = `🤖 Agent Performance: ${activeAgents}/${agents.activeAgents.length} agents running | Average efficiency: ${avgEfficiency.toFixed(1)}% | ${agents.performance.tasksCompleted} tasks completed | ${agents.performance.errors} errors today`;

    const insights = [
      `Top performer: ${agents.activeAgents.sort((a: any, b: any) => b.efficiency - a.efficiency)[0]?.name} (${agents.activeAgents[0]?.efficiency}%)`,
      `${agents.automations.filter((a: any) => a.rateLimitHit).length} automations hitting rate limits`,
      `System uptime: ${agents.performance.uptime}%`,
      ...aiInsights.filter(i => i.type === 'optimization').slice(0, 1).map(i => i.description)
    ];

    const actionItems = [
      'Review rate-limited automations for optimization',
      'Scale resources for high-performing agents',
      'Investigate and restart any idle agents',
      ...aiInsights.filter(i => i.actionable && i.type === 'optimization').slice(0, 1).flatMap(i => i.recommendations)
    ];

    return {
      summary,
      insights,
      actionItems,
      systemData: { agents },
      confidence: context.confidence
    };
  }

  private async generateOptimizationAnalysis(
    systemData: any, 
    context: any, 
    aiInsights: AgentInsight[]
  ): Promise<LegacyAIAnalysis> {
    const optimizationInsights = aiInsights.filter(i => i.type === 'optimization' || i.type === 'opportunity');
    const healthScore = this.calculateOverallHealthScore(systemData);
    
    const summary = `⚡ Optimization Analysis: Current efficiency ${Math.round(healthScore * 100)}% | ${optimizationInsights.length} optimization opportunities identified | Potential improvement: ${this.calculatePotentialImprovement(optimizationInsights)}%`;

    const insights = optimizationInsights.map(insight => 
      `${insight.title}: ${insight.description} (Confidence: ${Math.round(insight.confidence * 100)}%)`
    );

    const actionItems = optimizationInsights.flatMap(insight => insight.recommendations);

    return {
      summary,
      insights,
      actionItems,
      systemData: { optimizations: optimizationInsights, currentHealth: healthScore },
      confidence: Math.min(0.95, context.confidence)
    };
  }

  private async generateGeneralAnalysis(
    query: string, 
    systemData: any, 
    context: any, 
    aiInsights: AgentInsight[]
  ): Promise<LegacyAIAnalysis> {
    const relevantInsights = aiInsights.slice(0, 3);
    const healthScore = this.calculateOverallHealthScore(systemData);
    
    const summary = `🧠 Legacy AI Analysis: Understanding "${query}" | System health: ${Math.round(healthScore * 100)}% | ${relevantInsights.length} AI insights available | Ready to dive deeper`;

    const insights = [
      'All monitored systems are accessible and responsive',
      `${aiInsights.filter(i => i.actionable).length} actionable recommendations available`,
      'Context analysis suggests focusing on system optimization',
      ...relevantInsights.map(i => `AI detected: ${i.description}`)
    ];

    const actionItems = [
      'Specify which system or area you\'d like me to focus on',
      'Ask about specific metrics, alerts, or performance data',
      'Request detailed analysis of any connected system',
      ...context.suggestedActions
    ];

    return {
      summary,
      insights,
      actionItems,
      systemData,
      confidence: context.confidence
    };
  }

  private calculateOverallHealthScore(systemData: any): number {
    let score = 1.0;
    
    // System status factor
    const onlineRatio = systemData.integrations.filter((i: any) => i.status === 'online').length / systemData.integrations.length;
    score *= onlineRatio;
    
    // Resource utilization factor
    const resourceScore = 1 - Math.max(0, (systemData.monitor.cpu - 70) / 30) * 0.2 - Math.max(0, (systemData.monitor.memory - 80) / 20) * 0.15;
    score *= Math.max(0.5, resourceScore);
    
    // Agent performance factor
    score *= systemData.agents.performance.overallEfficiency / 100;
    
    // Alert factor
    const alertImpact = Math.min(0.2, systemData.monitor.alerts.length * 0.05);
    score *= (1 - alertImpact);
    
    return Math.max(0.1, Math.min(1.0, score));
  }

  private calculatePotentialImprovement(insights: AgentInsight[]): number {
    return insights.reduce((total, insight) => total + (insight.confidence * 10), 0);
  }

  private predictOptimalResponseTime(): string {
    const knowledge = intelligentAgentCore.getKnowledge();
    const peakHours = knowledge.productivityPeaks.filter(p => p.efficiency > 0.8).map(p => p.hour);
    
    if (peakHours.length > 0) {
      const nextPeak = peakHours.find(hour => hour > new Date().getHours());
      return nextPeak ? `${nextPeak}:00` : 'during next peak productivity window';
    }
    
    return 'within 2 hours';
  }

  private getRandomActivity(): string {
    const activities = [
      'Just now',
      '1 min ago',
      '2 min ago',
      '5 min ago',
      '10 min ago',
      '15 min ago'
    ];
    return activities[Math.floor(Math.random() * activities.length)];
  }

  async triggerSystemAction(action: string, systemId: string, params?: any): Promise<{ success: boolean; message: string }> {
    // Simulate system actions
    console.log(`Legacy AI: Triggering ${action} on ${systemId}`, params);
    
    // Add realistic delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    return {
      success: Math.random() > 0.1, // 90% success rate
      message: `Action "${action}" ${Math.random() > 0.1 ? 'completed successfully' : 'failed - retrying'} on ${systemId}`
    };
  }

  getLastSyncTime(): Date {
    return this.lastSyncTime;
  }

  async refreshAllSystems(): Promise<void> {
    console.log('Legacy AI: Refreshing all system connections...');
    this.lastSyncTime = new Date();
    
    // Simulate refresh of all integrations
    for (const [id, integration] of this.integrations) {
      integration.lastActivity = 'Just now';
      
      // Randomly update some statuses
      if (Math.random() < 0.2) {
        integration.status = Math.random() > 0.8 ? 'warning' : 'online';
      }
    }
  }
}

export const legacyAIService = new LegacyAIService();
export default legacyAIService;