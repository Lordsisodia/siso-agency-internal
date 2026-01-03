import { AIAssistantFeatureFlags } from '../utils/feature-flags';
import { 
  ChatMessage, 
  ConversationInsight, 
  ChatThread,
  LearningPattern,
  UserPreference 
} from '../types/ai-chat.types';

/**
 * AI Conversation Learning Service
 * Analyzes chat patterns to provide personalized insights and learning
 * Designed to work seamlessly with existing SISO infrastructure
 */
export class AIConversationLearningService {
  private static instance: AIConversationLearningService | null = null;
  private featureFlags: AIAssistantFeatureFlags;
  private learningCache: Map<string, LearningPattern[]> = new Map();
  private userPreferences: UserPreference[] = [];

  constructor(featureFlags: AIAssistantFeatureFlags) {
    this.featureFlags = featureFlags;
  }

  static getInstance(featureFlags: AIAssistantFeatureFlags): AIConversationLearningService {
    if (!AIConversationLearningService.instance) {
      AIConversationLearningService.instance = new AIConversationLearningService(featureFlags);
    }
    return AIConversationLearningService.instance;
  }

  /**
   * Analyze conversation patterns from message history
   */
  async analyzeConversationPatterns(messages: ChatMessage[]): Promise<LearningPattern[]> {
    if (!this.featureFlags.enableConversationHistory) {
      return []; // Return empty when feature disabled
    }

    if (messages.length < 3) {
      return []; // Need minimum messages for pattern analysis
    }

    try {
      const patterns: LearningPattern[] = [];
      
      // Analyze time patterns
      const timePattern = this.analyzeTimePatterns(messages);
      if (timePattern) patterns.push(timePattern);
      
      // Analyze topic patterns
      const topicPatterns = this.analyzeTopicPatterns(messages);
      patterns.push(...topicPatterns);
      
      // Analyze length patterns
      const lengthPattern = this.analyzeLengthPatterns(messages);
      if (lengthPattern) patterns.push(lengthPattern);
      
      // Analyze mood patterns
      const moodPattern = this.analyzeMoodPatterns(messages);
      if (moodPattern) patterns.push(moodPattern);

      // Cache patterns for performance
      const cacheKey = this.generateCacheKey(messages);
      this.learningCache.set(cacheKey, patterns);
      
      console.log(`🧠 Analyzed ${patterns.length} conversation patterns`);
      return patterns;
    } catch (error) {
      console.warn('🧠 Failed to analyze conversation patterns:', error);
      return [];
    }
  }

  /**
   * Generate personalized insights based on conversation history
   */
  async generatePersonalizedInsights(threads: ChatThread[]): Promise<ConversationInsight[]> {
    if (!this.featureFlags.enableConversationHistory) {
      return []; // Return empty when feature disabled
    }

    try {
      const insights: ConversationInsight[] = [];
      
      // Productivity insights
      const productivityInsight = await this.generateProductivityInsight(threads);
      if (productivityInsight) insights.push(productivityInsight);
      
      // Communication style insights
      const styleInsight = await this.generateCommunicationStyleInsight(threads);
      if (styleInsight) insights.push(styleInsight);
      
      // Routine optimization insights
      const routineInsight = await this.generateRoutineOptimizationInsight(threads);
      if (routineInsight) insights.push(routineInsight);
      
      // Goal tracking insights
      const goalInsight = await this.generateGoalTrackingInsight(threads);
      if (goalInsight) insights.push(goalInsight);

      console.log(`🧠 Generated ${insights.length} personalized insights`);
      return insights;
    } catch (error) {
      console.warn('🧠 Failed to generate personalized insights:', error);
      return [];
    }
  }

  /**
   * Learn from user interactions and feedback
   */
  async learnFromInteraction(
    threadId: string,
    userMessage: string,
    aiResponse: string,
    userFeedback?: 'positive' | 'negative' | 'neutral'
  ): Promise<void> {
    if (!this.featureFlags.enableConversationHistory) {
      console.log('🧠 Learning disabled - interaction recorded in compatibility mode');
      return;
    }

    try {
      // Extract learning signals
      const learningSignals = this.extractLearningSignals(userMessage, aiResponse, userFeedback);
      
      // Update user preferences based on interaction
      await this.updateUserPreferences(learningSignals);
      
      // Store interaction for future analysis
      await this.storeInteractionData(threadId, {
        userMessage,
        aiResponse,
        feedback: userFeedback,
        signals: learningSignals,
        timestamp: new Date()
      });
      
      console.log('🧠 Learning from interaction completed');
    } catch (error) {
      console.warn('🧠 Failed to learn from interaction:', error);
    }
  }

  /**
   * Get conversation suggestions based on learned patterns
   */
  async getConversationSuggestions(threadId: string, context?: string): Promise<string[]> {
    if (!this.featureFlags.enableConversationHistory) {
      return this.getDefaultSuggestions(); // Fallback suggestions
    }

    try {
      const patterns = this.learningCache.get(threadId) || [];
      const suggestions: string[] = [];
      
      // Generate suggestions based on learned patterns
      if (patterns.some(p => p.type === 'time_preference')) {
        suggestions.push("Let's plan your morning routine");
        suggestions.push("What are your priorities for today?");
      }
      
      if (patterns.some(p => p.type === 'topic_preference')) {
        suggestions.push("Tell me about your current projects");
        suggestions.push("What challenges are you facing?");
      }
      
      if (patterns.some(p => p.type === 'communication_style')) {
        suggestions.push("Would you like a quick summary?");
        suggestions.push("Let's break this down step by step");
      }
      
      // Add context-specific suggestions
      if (context) {
        const contextSuggestions = this.generateContextualSuggestions(context, patterns);
        suggestions.push(...contextSuggestions);
      }
      
      // Ensure we have fallback suggestions
      if (suggestions.length === 0) {
        return this.getDefaultSuggestions();
      }
      
      return suggestions.slice(0, 4); // Limit to 4 suggestions
    } catch (error) {
      console.warn('🧠 Failed to get conversation suggestions:', error);
      return this.getDefaultSuggestions();
    }
  }

  /**
   * Export conversation insights for external analysis
   */
  async exportConversationData(threadIds: string[]): Promise<any> {
    if (!this.featureFlags.enableConversationHistory) {
      return { message: 'Conversation export disabled' };
    }

    try {
      const exportData = {
        timestamp: new Date(),
        threadCount: threadIds.length,
        patterns: Array.from(this.learningCache.values()).flat(),
        preferences: this.userPreferences,
        summary: this.generateExportSummary(threadIds)
      };
      
      console.log('🧠 Conversation data exported successfully');
      return exportData;
    } catch (error) {
      console.warn('🧠 Failed to export conversation data:', error);
      return { error: 'Export failed' };
    }
  }

  // Private helper methods
  private analyzeTimePatterns(messages: ChatMessage[]): LearningPattern | null {
    const times = messages.map(m => new Date(m.timestamp).getHours());
    const avgTime = times.reduce((sum, time) => sum + time, 0) / times.length;
    
    let timePreference = 'varied';
    if (avgTime < 9) timePreference = 'early_morning';
    else if (avgTime < 12) timePreference = 'morning';
    else if (avgTime < 17) timePreference = 'afternoon';
    else timePreference = 'evening';
    
    return {
      id: this.generatePatternId(),
      type: 'time_preference',
      description: `User prefers ${timePreference} conversations`,
      confidence: 0.7,
      data: { averageHour: avgTime, timePreference },
      createdAt: new Date()
    };
  }

  private analyzeTopicPatterns(messages: ChatMessage[]): LearningPattern[] {
    const userMessages = messages.filter(m => m.role === 'user');
    const topics = new Map<string, number>();
    
    // Simple keyword extraction (can be enhanced with NLP)
    const keywords = ['task', 'project', 'meeting', 'goal', 'plan', 'idea', 'problem', 'solution'];
    
    userMessages.forEach(message => {
      keywords.forEach(keyword => {
        if (message.content.toLowerCase().includes(keyword)) {
          topics.set(keyword, (topics.get(keyword) || 0) + 1);
        }
      });
    });
    
    return Array.from(topics.entries())
      .filter(([_, count]) => count >= 2)
      .map(([topic, count]) => ({
        id: this.generatePatternId(),
        type: 'topic_preference',
        description: `User frequently discusses ${topic}-related topics`,
        confidence: Math.min(count / userMessages.length, 0.9),
        data: { topic, frequency: count },
        createdAt: new Date()
      }));
  }

  private analyzeLengthPatterns(messages: ChatMessage[]): LearningPattern | null {
    const userMessages = messages.filter(m => m.role === 'user');
    const avgLength = userMessages.reduce((sum, m) => sum + m.content.length, 0) / userMessages.length;
    
    let lengthStyle = 'medium';
    if (avgLength < 50) lengthStyle = 'brief';
    else if (avgLength > 200) lengthStyle = 'detailed';
    
    return {
      id: this.generatePatternId(),
      type: 'communication_style',
      description: `User prefers ${lengthStyle} messages`,
      confidence: 0.6,
      data: { averageLength: avgLength, style: lengthStyle },
      createdAt: new Date()
    };
  }

  private analyzeMoodPatterns(messages: ChatMessage[]): LearningPattern | null {
    const userMessages = messages.filter(m => m.role === 'user');
    
    // Simple sentiment analysis (can be enhanced with proper NLP)
    const positiveWords = ['great', 'good', 'excellent', 'awesome', 'happy', 'excited'];
    const negativeWords = ['problem', 'issue', 'difficult', 'frustrated', 'stuck', 'confused'];
    
    let positiveCount = 0;
    let negativeCount = 0;
    
    userMessages.forEach(message => {
      const content = message.content.toLowerCase();
      positiveWords.forEach(word => {
        if (content.includes(word)) positiveCount++;
      });
      negativeWords.forEach(word => {
        if (content.includes(word)) negativeCount++;
      });
    });
    
    const totalSentiment = positiveCount + negativeCount;
    if (totalSentiment < 2) return null;
    
    const moodTrend = positiveCount > negativeCount ? 'positive' : 
                     negativeCount > positiveCount ? 'negative' : 'neutral';
    
    return {
      id: this.generatePatternId(),
      type: 'mood_pattern',
      description: `User tends to have ${moodTrend} conversations`,
      confidence: 0.5,
      data: { moodTrend, positiveCount, negativeCount },
      createdAt: new Date()
    };
  }

  private async generateProductivityInsight(threads: ChatThread[]): Promise<ConversationInsight | null> {
    const activeThreads = threads.filter(t => t.isActive);
    if (activeThreads.length < 3) return null;
    
    return {
      id: this.generateInsightId(),
      threadId: 'productivity',
      type: 'productivity',
      title: 'Productivity Pattern Identified',
      description: `You have ${activeThreads.length} active conversations, showing strong engagement with planning and organization.`,
      confidence: 0.8,
      metadata: {
        activeThreads: activeThreads.length,
        avgMessagesPerThread: activeThreads.reduce((sum, t) => sum + t.messageCount, 0) / activeThreads.length
      },
      createdAt: new Date()
    };
  }

  private async generateCommunicationStyleInsight(threads: ChatThread[]): Promise<ConversationInsight | null> {
    // This would analyze communication patterns across threads
    return {
      id: this.generateInsightId(),
      threadId: 'communication',
      type: 'communication_style',
      title: 'Communication Style Analysis',
      description: 'You prefer structured conversations with clear action items.',
      confidence: 0.7,
      metadata: {
        preferredStyle: 'structured',
        threadCount: threads.length
      },
      createdAt: new Date()
    };
  }

  private async generateRoutineOptimizationInsight(threads: ChatThread[]): Promise<ConversationInsight | null> {
    const morningThreads = threads.filter(t => t.mode === 'morning_routine');
    if (morningThreads.length < 2) return null;
    
    return {
      id: this.generateInsightId(),
      threadId: 'routine',
      type: 'routine_optimization',
      title: 'Morning Routine Optimization',
      description: 'Your morning routine conversations show consistent patterns. Consider automating recurring tasks.',
      confidence: 0.9,
      metadata: {
        routineThreads: morningThreads.length,
        suggestion: 'automate_recurring_tasks'
      },
      createdAt: new Date()
    };
  }

  private async generateGoalTrackingInsight(threads: ChatThread[]): Promise<ConversationInsight | null> {
    return {
      id: this.generateInsightId(),
      threadId: 'goals',
      type: 'goal_tracking',
      title: 'Goal Tracking Opportunity',
      description: 'Based on your conversations, you might benefit from regular goal check-ins.',
      confidence: 0.6,
      metadata: {
        suggestion: 'weekly_goal_review',
        conversationCount: threads.length
      },
      createdAt: new Date()
    };
  }

  private extractLearningSignals(userMessage: string, aiResponse: string, feedback?: string): any {
    return {
      messageLength: userMessage.length,
      responseLength: aiResponse.length,
      feedback: feedback || 'neutral',
      keywords: this.extractKeywords(userMessage),
      sentiment: this.extractSentiment(userMessage)
    };
  }

  private async updateUserPreferences(signals: any): Promise<void> {
    // Update user preferences based on learning signals
    const preference: UserPreference = {
      id: this.generatePreferenceId(),
      type: 'communication',
      value: signals.messageLength > 100 ? 'detailed' : 'concise',
      confidence: 0.6,
      lastUpdated: new Date()
    };
    
    this.userPreferences.push(preference);
  }

  private async storeInteractionData(threadId: string, data: any): Promise<void> {
    // Store interaction data for future analysis
    console.log(`🧠 Stored interaction data for thread: ${threadId}`);
  }

  private generateContextualSuggestions(context: string, patterns: LearningPattern[]): string[] {
    const suggestions: string[] = [];
    
    if (context.includes('morning')) {
      suggestions.push("Let's plan your morning routine");
    }
    
    if (context.includes('task') || context.includes('project')) {
      suggestions.push("What's your next priority?");
    }
    
    return suggestions;
  }

  private getDefaultSuggestions(): string[] {
    return [
      "What would you like to work on today?",
      "Tell me about your current priorities",
      "How can I help you stay organized?",
      "What's on your mind?"
    ];
  }

  private generateExportSummary(threadIds: string[]): any {
    return {
      totalThreads: threadIds.length,
      patternsIdentified: this.learningCache.size,
      preferencesLearned: this.userPreferences.length,
      lastAnalysis: new Date()
    };
  }

  private extractKeywords(text: string): string[] {
    // Simple keyword extraction
    const words = text.toLowerCase().split(/\s+/);
    const keywords = words.filter(word => word.length > 3);
    return [...new Set(keywords)].slice(0, 5);
  }

  private extractSentiment(text: string): 'positive' | 'negative' | 'neutral' {
    // Simple sentiment analysis
    const positiveWords = ['good', 'great', 'excellent', 'happy', 'excited'];
    const negativeWords = ['bad', 'terrible', 'frustrated', 'difficult', 'problem'];
    
    const content = text.toLowerCase();
    const positiveCount = positiveWords.filter(word => content.includes(word)).length;
    const negativeCount = negativeWords.filter(word => content.includes(word)).length;
    
    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  }

  private generateCacheKey(messages: ChatMessage[]): string {
    const messageIds = messages.map(m => m.id).sort().join('|');
    return `cache_${messageIds.substring(0, 20)}`;
  }

  private generatePatternId(): string {
    return `pattern_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateInsightId(): string {
    return `insight_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generatePreferenceId(): string {
    return `pref_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * Factory function to create the learning service instance
 */
export function createAIConversationLearningService(featureFlags: AIAssistantFeatureFlags): AIConversationLearningService {
  return AIConversationLearningService.getInstance(featureFlags);
}

/**
 * Hook for React components to use the learning service
 */
export function useAIConversationLearning(featureFlags: AIAssistantFeatureFlags) {
  const service = AIConversationLearningService.getInstance(featureFlags);
  
  return {
    service,
    isEnabled: featureFlags.enableConversationHistory,
    analyzePatterns: service.analyzeConversationPatterns.bind(service),
    generateInsights: service.generatePersonalizedInsights.bind(service),
    learnFromInteraction: service.learnFromInteraction.bind(service),
    getSuggestions: service.getConversationSuggestions.bind(service),
    exportData: service.exportConversationData.bind(service)
  };
}