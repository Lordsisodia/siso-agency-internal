import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

export interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
}

export interface ChatSession {
  id: string;
  userId: string;
  sessionKey: string;
  messages: ChatMessage[];
  context?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export class ChatMemoryService {
  private sessionKey: string;
  private userId: string | null = null;
  private conversationId: string | null = null;
  private memoryCache: ChatMessage[] = [];

  constructor(sessionKey: string = 'ai_task_chat') {
    this.sessionKey = sessionKey;
  }

  // Initialize the service with user context
  async initialize(): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        this.userId = user.id;
        await this.loadOrCreateConversation();
      } else {
        console.warn('🔍 [CHAT MEMORY] User not authenticated, using session-only memory');
      }
    } catch (error) {
      console.error('❌ [CHAT MEMORY] Failed to initialize:', error);
    }
  }

  // Load existing conversation or create new one
  private async loadOrCreateConversation(): Promise<void> {
    if (!this.userId) return;

    try {
      // Try to find existing conversation for this user and session
      const { data: existing } = await supabase
        .from('agent_conversations')
        .select('*')
        .eq('user_id', this.userId)
        .eq('telegram_chat_id', this.sessionKey.hashCode()) // Use hash of session key as chat_id
        .order('updated_at', { ascending: false })
        .limit(1);

      if (existing && existing.length > 0) {
        this.conversationId = existing[0].id;
        this.memoryCache = this.parseConversationHistory(existing[0].conversation_history);
        logger.debug('✅ [CHAT MEMORY] Loaded existing conversation:', this.conversationId);
      } else {
        // Create new conversation
        const { data: newConversation } = await supabase
          .from('agent_conversations')
          .insert({
            user_id: this.userId,
            telegram_chat_id: this.sessionKey.hashCode(),
            conversation_history: [],
            context: {}
          })
          .select()
          .single();

        if (newConversation) {
          this.conversationId = newConversation.id;
          logger.debug('✅ [CHAT MEMORY] Created new conversation:', this.conversationId);
        }
      }
    } catch (error) {
      console.error('❌ [CHAT MEMORY] Failed to load/create conversation:', error);
    }
  }

  // Save messages to persistent storage
  async saveMessage(message: ChatMessage): Promise<void> {
    // Always add to memory cache first
    this.memoryCache.push(message);
    
    // Keep only last 50 messages in cache
    if (this.memoryCache.length > 50) {
      this.memoryCache = this.memoryCache.slice(-50);
    }

    // Try to save to database if we have a conversation
    if (this.conversationId) {
      try {
        const conversationHistory = this.memoryCache.map(msg => ({
          id: msg.id,
          content: msg.content,
          sender: msg.sender,
          timestamp: msg.timestamp.toISOString()
        }));

        await supabase
          .from('agent_conversations')
          .update({
            conversation_history: conversationHistory,
            updated_at: new Date().toISOString()
          })
          .eq('id', this.conversationId);

        logger.debug('✅ [CHAT MEMORY] Saved message to database');
      } catch (error) {
        console.error('❌ [CHAT MEMORY] Failed to save message:', error);
      }
    }
  }

  // Get conversation context (recent messages)
  getConversationContext(limit: number = 10): string[] {
    return this.memoryCache
      .slice(-limit)
      .filter(msg => msg.sender === 'user')
      .map(msg => msg.content);
  }

  // Get all messages
  getAllMessages(): ChatMessage[] {
    return [...this.memoryCache];
  }

  // Get messages by sender
  getMessagesBySender(sender: 'user' | 'assistant', limit?: number): ChatMessage[] {
    const filtered = this.memoryCache.filter(msg => msg.sender === sender);
    return limit ? filtered.slice(-limit) : filtered;
  }

  // Clear conversation memory
  async clearConversation(): Promise<void> {
    this.memoryCache = [];
    
    if (this.conversationId) {
      try {
        await supabase
          .from('agent_conversations')
          .update({
            conversation_history: [],
            updated_at: new Date().toISOString()
          })
          .eq('id', this.conversationId);

        logger.debug('✅ [CHAT MEMORY] Cleared conversation');
      } catch (error) {
        console.error('❌ [CHAT MEMORY] Failed to clear conversation:', error);
      }
    }
  }

  // Parse conversation history from database
  private parseConversationHistory(history: unknown[]): ChatMessage[] {
    if (!Array.isArray(history)) return [];
    
    return history
      .filter((item): item is Record<string, unknown> => typeof item === 'object' && item !== null)
      .map((item) => ({
        id: (item.id as string) || Date.now().toString(),
        content: (item.content as string) || '',
        sender: ((item.sender as string) === 'assistant' ? 'assistant' : 'user'),
        timestamp: new Date((item.timestamp as string) || new Date())
      }));
  }

  // Get conversation summary for context
  getConversationSummary(): string {
    if (this.memoryCache.length === 0) return '';
    
    const userMessages = this.memoryCache.filter(msg => msg.sender === 'user');
    const recentTopics = userMessages.slice(-5).map(msg => msg.content);
    
    return `Recent conversation topics: ${recentTopics.join(', ')}`;
  }

  // Check if conversation has context about a topic
  hasContextAbout(topic: string): boolean {
    const lowerTopic = topic.toLowerCase();
    return this.memoryCache.some(msg => 
      msg.content.toLowerCase().includes(lowerTopic)
    );
  }

  // Get the last user message that contains specific keywords
  getLastMessageContaining(keywords: string[]): ChatMessage | null {
    const userMessages = this.memoryCache.filter(msg => msg.sender === 'user');
    
    for (let i = userMessages.length - 1; i >= 0; i--) {
      const message = userMessages[i];
      if (keywords.some(keyword => 
        message.content.toLowerCase().includes(keyword.toLowerCase())
      )) {
        return message;
      }
    }
    
    return null;
  }
}

// Helper extension for string hashing
declare global {
  interface String {
    hashCode(): number;
  }
}

String.prototype.hashCode = function() {
  let hash = 0;
  if (this.length === 0) return hash;
  for (let i = 0; i < this.length; i++) {
    const char = this.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
};

// Export singleton instance
export const chatMemoryService = new ChatMemoryService();