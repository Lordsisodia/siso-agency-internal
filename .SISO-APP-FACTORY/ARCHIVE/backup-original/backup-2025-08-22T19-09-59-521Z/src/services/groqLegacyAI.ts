import { intelligentAgentCore, AgentInsight } from './intelligentAgentCore';

interface GroqMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface GroqResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface LegacyAIAnalysis {
  summary: string;
  insights: string[];
  actionItems: string[];
  systemData: Record<string, any>;
  confidence: number;
}

class GroqLegacyAIService {
  private apiKey: string;
  private baseUrl = 'https://api.groq.com/openai/v1';
  private model = 'mixtral-8x7b-32768'; // Fast and intelligent
  private systemPrompt = `You are Legacy AI, a hyper-intelligent system monitoring and management assistant. You have access to real-time data from multiple systems including WhatsApp, Telegram, automation agents, and system performance metrics.

Your role is to:
1. Analyze system data intelligently and provide actionable insights
2. Identify patterns, anomalies, and optimization opportunities
3. Provide specific, implementable recommendations
4. Maintain a professional but conversational tone
5. Always include confidence levels for your analysis
6. Prioritize the most critical information first

You should be proactive, insightful, and focus on helping the user manage their digital ecosystem efficiently.

Format your responses with:
- Clear summary with key metrics
- Bullet-pointed insights
- Actionable recommendations
- Confidence assessment

Use emojis sparingly but effectively for visual clarity.`;

  constructor() {
    this.apiKey = process.env.VITE_GROQ_API_KEY || process.env.GROQ_API_KEY || '';
    
    if (!this.apiKey) {
      console.warn('Groq API key not found. Please set VITE_GROQ_API_KEY or GROQ_API_KEY environment variable.');
    }
  }

  async generateIntelligentAnalysis(query: string, systemData?: Record<string, any>): Promise<LegacyAIAnalysis> {
    try {
      // Use intelligent agent core for context analysis
      const context = intelligentAgentCore.analyzeContext(query, systemData || {});
      
      // Generate AI insights based on current system state
      const aiInsights = intelligentAgentCore.generateInsights(systemData || {});
      
      // Check for proactive alerts
      const proactiveAlert = intelligentAgentCore.shouldSendProactiveAlert(systemData || {});
      
      // Build comprehensive context for Groq
      const contextualPrompt = this.buildContextualPrompt(query, systemData, context, aiInsights, proactiveAlert);
      
      const messages: GroqMessage[] = [
        { role: 'system', content: this.systemPrompt },
        { role: 'user', content: contextualPrompt }
      ];

      const response = await this.callGroqAPI(messages);
      
      if (!response || !response.choices || response.choices.length === 0) {
        throw new Error('Invalid response from Groq API');
      }

      const aiResponse = response.choices[0].message.content;
      
      // Parse the response into structured format
      const analysis = this.parseGroqResponse(aiResponse, systemData || {}, context.confidence);
      
      // Store the interaction for learning
      intelligentAgentCore.storeMemory({
        type: 'conversation',
        content: { query, analysis, context },
        importance: context.priority === 'critical' ? 9 : context.priority === 'high' ? 7 : 5,
        context: { intent: context.intent, confidence: context.confidence, model: 'groq' },
        tags: ['query', context.intent, 'groq', 'analysis']
      });

      return analysis;
      
    } catch (error) {
      console.error('Groq Legacy AI Error:', error);
      
      // Fallback to intelligent agent core
      return this.generateFallbackAnalysis(query, systemData || {});
    }
  }

  private buildContextualPrompt(
    query: string, 
    systemData: Record<string, any> | undefined,
    context: any,
    aiInsights: AgentInsight[],
    proactiveAlert: any
  ): string {
    let prompt = `User Query: "${query}"\n\n`;
    
    // Add intent and priority context
    prompt += `Intent Analysis: ${context.intent} (Priority: ${context.priority}, Confidence: ${Math.round(context.confidence * 100)}%)\n\n`;
    
    // Add system data if available
    if (systemData && Object.keys(systemData).length > 0) {
      prompt += `Current System Data:\n`;
      
      if (systemData.whatsapp) {
        prompt += `WhatsApp: ${systemData.whatsapp.unreadCount || 0} unread messages, ${systemData.whatsapp.conversations?.length || 0} conversations\n`;
      }
      
      if (systemData.telegram) {
        prompt += `Telegram: ${systemData.telegram.channels?.length || 0} channels, ${systemData.telegram.bots?.length || 0} bots\n`;
      }
      
      if (systemData.agents) {
        const activeAgents = systemData.agents.activeAgents?.filter((a: any) => a.status === 'running').length || 0;
        prompt += `Agents: ${activeAgents} active, ${systemData.agents.performance?.overallEfficiency || 0}% efficiency\n`;
      }
      
      if (systemData.monitor) {
        prompt += `System: CPU ${systemData.monitor.cpu?.toFixed(1) || 0}%, Memory ${systemData.monitor.memory?.toFixed(1) || 0}%, ${systemData.monitor.alerts?.length || 0} alerts\n`;
      }
      
      prompt += `\n`;
    }
    
    // Add AI insights
    if (aiInsights.length > 0) {
      prompt += `AI-Generated Insights:\n`;
      aiInsights.slice(0, 3).forEach((insight, i) => {
        prompt += `${i + 1}. ${insight.title}: ${insight.description} (${Math.round(insight.confidence * 100)}% confidence)\n`;
      });
      prompt += `\n`;
    }
    
    // Add proactive alerts
    if (proactiveAlert.send && proactiveAlert.message) {
      prompt += `🚨 PROACTIVE ALERT: ${proactiveAlert.message}\n\n`;
    }
    
    // Add suggested actions from context
    if (context.suggestedActions && context.suggestedActions.length > 0) {
      prompt += `Suggested Focus Areas:\n`;
      context.suggestedActions.forEach((action: string, i: number) => {
        prompt += `- ${action}\n`;
      });
      prompt += `\n`;
    }
    
    prompt += `Please provide a comprehensive analysis with:
1. A clear summary with key metrics and status
2. 3-5 actionable insights based on the data
3. Specific recommended actions
4. Your confidence level in the analysis

Focus on being helpful, specific, and actionable. Prioritize the most critical information first.`;

    return prompt;
  }

  private async callGroqAPI(messages: GroqMessage[]): Promise<GroqResponse> {
    if (!this.apiKey) {
      throw new Error('Groq API key not configured');
    }

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.model,
        messages,
        max_tokens: 1024,
        temperature: 0.7,
        top_p: 0.9,
        stream: false
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Groq API error: ${response.status} - ${errorText}`);
    }

    return await response.json();
  }

  private parseGroqResponse(response: string, systemData: Record<string, any>, baseConfidence: number): LegacyAIAnalysis {
    // Extract structured information from the response
    const lines = response.split('\n').filter(line => line.trim());
    
    let summary = '';
    const insights: string[] = [];
    const actionItems: string[] = [];
    let confidence = baseConfidence;
    
    let currentSection = 'summary';
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      if (trimmedLine.toLowerCase().includes('summary') || trimmedLine.toLowerCase().includes('overview')) {
        currentSection = 'summary';
        continue;
      } else if (trimmedLine.toLowerCase().includes('insight') || trimmedLine.toLowerCase().includes('analysis')) {
        currentSection = 'insights';
        continue;
      } else if (trimmedLine.toLowerCase().includes('action') || trimmedLine.toLowerCase().includes('recommend')) {
        currentSection = 'actions';
        continue;
      } else if (trimmedLine.toLowerCase().includes('confidence')) {
        const match = trimmedLine.match(/(\d+)%/);
        if (match) {
          confidence = Math.max(confidence, parseInt(match[1]) / 100);
        }
        continue;
      }
      
      if (trimmedLine.length === 0) continue;
      
      const cleanLine = trimmedLine.replace(/^[•\-*]\s*/, '').replace(/^\d+\.\s*/, '');
      
      if (currentSection === 'summary' && !summary) {
        summary = cleanLine;
      } else if (currentSection === 'insights' && cleanLine.length > 10) {
        insights.push(cleanLine);
      } else if (currentSection === 'actions' && cleanLine.length > 10) {
        actionItems.push(cleanLine);
      } else if (!summary && cleanLine.length > 20) {
        summary = cleanLine;
      }
    }
    
    // Fallback if parsing didn't work well
    if (!summary) {
      summary = response.split('\n')[0] || 'Analysis completed';
    }
    
    if (insights.length === 0) {
      insights.push('System analysis completed successfully');
    }
    
    if (actionItems.length === 0) {
      actionItems.push('Monitor system performance and check for updates');
    }

    return {
      summary,
      insights: insights.slice(0, 5), // Limit to 5 insights
      actionItems: actionItems.slice(0, 5), // Limit to 5 actions
      systemData,
      confidence: Math.min(0.98, confidence)
    };
  }

  private generateFallbackAnalysis(query: string, systemData: Record<string, any>): LegacyAIAnalysis {
    const context = intelligentAgentCore.analyzeContext(query, systemData);
    
    return {
      summary: `Analyzing "${query}" - Groq service temporarily unavailable, using local intelligence`,
      insights: [
        'Local analysis engine is functioning normally',
        'System monitoring capabilities remain active',
        'Intelligent agent core is processing your request'
      ],
      actionItems: [
        'Check Groq API configuration and key',
        'Verify network connectivity',
        'Consider using backup analysis methods'
      ],
      systemData,
      confidence: 0.75
    };
  }

  // Test Groq connection
  async testConnection(): Promise<{ success: boolean; model: string; error?: string }> {
    try {
      const messages: GroqMessage[] = [
        { role: 'system', content: 'You are a test assistant.' },
        { role: 'user', content: 'Say "Hello from Groq" to test the connection.' }
      ];

      const response = await this.callGroqAPI(messages);
      
      return {
        success: true,
        model: this.model,
        error: undefined
      };
    } catch (error) {
      return {
        success: false,
        model: this.model,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Get current model info
  getModelInfo(): { model: string; provider: string; features: string[] } {
    return {
      model: this.model,
      provider: 'Groq',
      features: [
        'Ultra-fast inference',
        'Contextual analysis',
        'System monitoring',
        'Pattern recognition',
        'Real-time insights'
      ]
    };
  }
}

export const groqLegacyAI = new GroqLegacyAIService();
export default groqLegacyAI;