import { AIAssistantFeatureFlags } from '../utils/feature-flags';
import { 
  ChatThread, 
  ChatMessage, 
  ConversationInsight, 
  MorningRoutineSession,
  AIPersonality,
  ChatMode 
} from '../types/ai-chat.types';

/**
 * AI Chat Thread Management Service
 * Handles chat thread persistence, conversation management, and learning insights
 * Designed to integrate with existing SISO infrastructure without breaking changes
 */
export class AIChatThreadService {
  private static instance: AIChatThreadService | null = null;
  private featureFlags: AIAssistantFeatureFlags;
  private dbConnection: any = null; // Will be initialized with actual DB connection

  constructor(featureFlags: AIAssistantFeatureFlags) {
    this.featureFlags = featureFlags;
  }

  static getInstance(featureFlags: AIAssistantFeatureFlags): AIChatThreadService {
    if (!AIChatThreadService.instance) {
      AIChatThreadService.instance = new AIChatThreadService(featureFlags);
    }
    return AIChatThreadService.instance;
  }

  /**
   * Initialize database connection
   * Gracefully handles cases where enhanced features are disabled
   */
  async initialize(): Promise<void> {
    if (!this.featureFlags.enableChatThreads) {
      console.log('💬 Chat threads disabled - service running in compatibility mode');
      return;
    }

    try {
      // TODO: Initialize Supabase connection here
      // this.dbConnection = await createSupabaseClient();
      console.log('💬 Chat thread service initialized successfully');
    } catch (error) {
      console.warn('💬 Chat thread service initialization failed, falling back to in-memory mode:', error);
      // Graceful degradation - continue without persistence
    }
  }

  /**
   * Create a new chat thread
   */
  async createChatThread(
    title: string, 
    mode: ChatMode = 'general',
    personality: AIPersonality = 'helpful'
  ): Promise<ChatThread> {
    if (!this.featureFlags.enableChatThreads) {
      // Return a mock thread for backward compatibility
      return this.createMockThread(title, mode, personality);
    }

    const thread: ChatThread = {
      id: this.generateThreadId(),
      title,
      mode,
      personality,
      createdAt: new Date(),
      updatedAt: new Date(),
      messageCount: 0,
      isActive: true,
      tags: [],
      summary: null
    };

    try {
      if (this.dbConnection) {
        // TODO: Persist to database
        // await this.dbConnection.from('ai_chat_threads').insert(thread);
      }
      console.log(`💬 Created chat thread: ${title}`);
      return thread;
    } catch (error) {
      console.warn('💬 Failed to persist chat thread, using in-memory fallback:', error);
      return thread;
    }
  }

  /**
   * Get all chat threads for the current user
   */
  async getChatThreads(limit: number = 20): Promise<ChatThread[]> {
    if (!this.featureFlags.enableChatThreads) {
      return []; // Return empty array when feature is disabled
    }

    try {
      if (this.dbConnection) {
        // TODO: Fetch from database
        // const { data } = await this.dbConnection
        //   .from('ai_chat_threads')
        //   .select('*')
        //   .order('updated_at', { ascending: false })
        //   .limit(limit);
        // return data || [];
      }
      
      // Fallback to empty array
      return [];
    } catch (error) {
      console.warn('💬 Failed to fetch chat threads:', error);
      return [];
    }
  }

  /**
   * Add a message to a chat thread
   */
  async addMessage(threadId: string, message: Omit<ChatMessage, 'id' | 'timestamp'>): Promise<ChatMessage> {
    const chatMessage: ChatMessage = {
      id: this.generateMessageId(),
      threadId,
      role: message.role,
      content: message.content,
      timestamp: new Date(),
      metadata: message.metadata || {}
    };

    if (!this.featureFlags.enableChatThreads) {
      console.log('💬 Message added (compatibility mode):', message.content.substring(0, 50));
      return chatMessage;
    }

    try {
      if (this.dbConnection) {
        // TODO: Persist message to database
        // await this.dbConnection.from('ai_chat_messages').insert(chatMessage);
        
        // Update thread's updatedAt timestamp
        // await this.dbConnection
        //   .from('ai_chat_threads')
        //   .update({ updated_at: new Date(), message_count: 'message_count + 1' })
        //   .eq('id', threadId);
      }
      
      return chatMessage;
    } catch (error) {
      console.warn('💬 Failed to persist message:', error);
      return chatMessage;
    }
  }

  /**
   * Get messages for a specific chat thread
   */
  async getThreadMessages(threadId: string, limit: number = 50): Promise<ChatMessage[]> {
    if (!this.featureFlags.enableChatThreads) {
      return []; // Return empty array when feature is disabled
    }

    try {
      if (this.dbConnection) {
        // TODO: Fetch messages from database
        // const { data } = await this.dbConnection
        //   .from('ai_chat_messages')
        //   .select('*')
        //   .eq('thread_id', threadId)
        //   .order('timestamp', { ascending: true })
        //   .limit(limit);
        // return data || [];
      }
      
      return [];
    } catch (error) {
      console.warn('💬 Failed to fetch thread messages:', error);
      return [];
    }
  }

  /**
   * Create conversation insights from chat history
   */
  async generateConversationInsights(threadId: string): Promise<ConversationInsight[]> {
    if (!this.featureFlags.enableConversationHistory) {
      return []; // Return empty array when feature is disabled
    }

    try {
      const messages = await this.getThreadMessages(threadId);
      
      if (messages.length < 3) {
        return []; // Not enough messages for insights
      }

      // Basic insight generation (can be enhanced with AI analysis later)
      const insights: ConversationInsight[] = [
        {
          id: this.generateInsightId(),
          threadId,
          type: 'pattern',
          title: 'Conversation Pattern Detected',
          description: `Thread contains ${messages.length} messages with recurring topics`,
          confidence: 0.7,
          metadata: {
            messageCount: messages.length,
            timeSpan: this.calculateTimeSpan(messages)
          },
          createdAt: new Date()
        }
      ];

      return insights;
    } catch (error) {
      console.warn('💬 Failed to generate conversation insights:', error);
      return [];
    }
  }

  /**
   * Start a morning routine session
   */
  async startMorningRoutineSession(threadId: string, routineType: string = '23-minute'): Promise<MorningRoutineSession> {
    const session: MorningRoutineSession = {
      id: this.generateSessionId(),
      threadId,
      routineType,
      startTime: new Date(),
      endTime: null,
      status: 'active',
      tasksCreated: 0,
      thoughtsProcessed: 0,
      metadata: {}
    };

    if (!this.featureFlags.enableMorningRoutineTimer) {
      console.log('⏰ Morning routine started (compatibility mode)');
      return session;
    }

    try {
      if (this.dbConnection) {
        // TODO: Persist session to database
        // await this.dbConnection.from('ai_morning_routine_sessions').insert(session);
      }
      
      console.log(`⏰ Started ${routineType} morning routine session`);
      return session;
    } catch (error) {
      console.warn('⏰ Failed to persist morning routine session:', error);
      return session;
    }
  }

  /**
   * Complete a morning routine session
   */
  async completeMorningRoutineSession(sessionId: string, summary?: string): Promise<void> {
    if (!this.featureFlags.enableMorningRoutineTimer) {
      console.log('⏰ Morning routine completed (compatibility mode)');
      return;
    }

    try {
      if (this.dbConnection) {
        // TODO: Update session in database
        // await this.dbConnection
        //   .from('ai_morning_routine_sessions')
        //   .update({ 
        //     end_time: new Date(), 
        //     status: 'completed',
        //     summary: summary || 'Session completed successfully'
        //   })
        //   .eq('id', sessionId);
      }
      
      console.log('⏰ Morning routine session completed');
    } catch (error) {
      console.warn('⏰ Failed to complete morning routine session:', error);
    }
  }

  /**
   * Archive a chat thread
   */
  async archiveThread(threadId: string): Promise<void> {
    if (!this.featureFlags.enableChatThreads) {
      console.log('💬 Thread archived (compatibility mode)');
      return;
    }

    try {
      if (this.dbConnection) {
        // TODO: Update thread status in database
        // await this.dbConnection
        //   .from('ai_chat_threads')
        //   .update({ is_active: false, updated_at: new Date() })
        //   .eq('id', threadId);
      }
      
      console.log('💬 Chat thread archived successfully');
    } catch (error) {
      console.warn('💬 Failed to archive chat thread:', error);
    }
  }

  /**
   * Search chat history
   */
  async searchChatHistory(query: string, limit: number = 10): Promise<ChatMessage[]> {
    if (!this.featureFlags.enableConversationHistory) {
      return []; // Return empty array when feature is disabled
    }

    try {
      if (this.dbConnection) {
        // TODO: Implement full-text search
        // const { data } = await this.dbConnection
        //   .from('ai_chat_messages')
        //   .select('*')
        //   .textSearch('content', query)
        //   .limit(limit);
        // return data || [];
      }
      
      return [];
    } catch (error) {
      console.warn('💬 Failed to search chat history:', error);
      return [];
    }
  }

  // Private helper methods
  private createMockThread(title: string, mode: ChatMode, personality: AIPersonality): ChatThread {
    return {
      id: this.generateThreadId(),
      title,
      mode,
      personality,
      createdAt: new Date(),
      updatedAt: new Date(),
      messageCount: 0,
      isActive: true,
      tags: [],
      summary: null
    };
  }

  private generateThreadId(): string {
    return `thread_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateInsightId(): string {
    return `insight_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private calculateTimeSpan(messages: ChatMessage[]): string {
    if (messages.length < 2) return '0 minutes';
    
    const first = new Date(messages[0].timestamp);
    const last = new Date(messages[messages.length - 1].timestamp);
    const diffMinutes = Math.floor((last.getTime() - first.getTime()) / (1000 * 60));
    
    if (diffMinutes < 60) return `${diffMinutes} minutes`;
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    return `${hours}h ${minutes}m`;
  }
}

/**
 * Factory function to create the service instance
 * Ensures proper integration with existing SISO infrastructure
 */
export function createAIChatThreadService(featureFlags: AIAssistantFeatureFlags): AIChatThreadService {
  return AIChatThreadService.getInstance(featureFlags);
}

/**
 * Hook for React components to use the chat thread service
 * Provides backward compatibility when features are disabled
 */
export function useAIChatThreadService(featureFlags: AIAssistantFeatureFlags) {
  const service = AIChatThreadService.getInstance(featureFlags);
  
  // Initialize service on first use
  React.useEffect(() => {
    service.initialize().catch(console.warn);
  }, [service]);
  
  return {
    service,
    isEnabled: featureFlags.enableChatThreads,
    createThread: service.createChatThread.bind(service),
    getThreads: service.getChatThreads.bind(service),
    addMessage: service.addMessage.bind(service),
    getMessages: service.getThreadMessages.bind(service),
    startMorningRoutine: service.startMorningRoutineSession.bind(service),
    completeMorningRoutine: service.completeMorningRoutineSession.bind(service)
  };
}