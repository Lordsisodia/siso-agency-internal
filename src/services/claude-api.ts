import Anthropic from '@anthropic-ai/sdk';
import { trackUsage } from '@/lib/claudia-api';

// Initialize Anthropic client
// Note: In production, the API key should be handled server-side
const getAnthropicClient = () => {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY || localStorage.getItem('anthropic_api_key');
  
  if (!apiKey) {
    throw new Error('Anthropic API key not found. Please set it in Settings.');
  }
  
  return new Anthropic({
    apiKey,
    dangerouslyAllowBrowser: true // This is required for client-side usage
  });
};

export interface ClaudeMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ClaudeSessionOptions {
  model?: string;
  maxTokens?: number;
  temperature?: number;
  systemPrompt?: string;
}

export class ClaudeService {
  private messages: ClaudeMessage[] = [];
  private systemPrompt: string;
  private sessionId: string;
  
  constructor(systemPrompt?: string) {
    this.systemPrompt = systemPrompt || `You are Claude, an AI assistant helping with software development tasks. 
You have access to a project workspace and can help with coding, debugging, and answering questions.
Be concise and helpful in your responses.`;
    this.sessionId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }
  
  async sendMessage(
    message: string, 
    options: ClaudeSessionOptions = {}
  ): Promise<string> {
    const client = getAnthropicClient();
    
    // Add user message to history
    this.messages.push({ role: 'user', content: message });
    
    try {
      const model = options.model || 'claude-3-sonnet-20240229';
      const response = await client.messages.create({
        model,
        max_tokens: options.maxTokens || 1024,
        temperature: options.temperature || 0.7,
        system: options.systemPrompt || this.systemPrompt,
        messages: this.messages
      });
      
      // Extract the assistant's response
      const assistantMessage = response.content[0].type === 'text' 
        ? response.content[0].text 
        : '';
      
      // Add assistant response to history
      this.messages.push({ role: 'assistant', content: assistantMessage });
      
      // Track usage for real statistics
      if (response.usage) {
        const inputTokens = response.usage.input_tokens || 0;
        const outputTokens = response.usage.output_tokens || 0;
        const cacheCreationTokens = response.usage.cache_creation_input_tokens || 0;
        const cacheReadTokens = response.usage.cache_read_input_tokens || 0;
        
        // Calculate cost based on model pricing
        const cost = this.calculateCost(model, inputTokens, outputTokens, cacheCreationTokens, cacheReadTokens);
        
        trackUsage({
          timestamp: new Date().toISOString(),
          model,
          input_tokens: inputTokens,
          output_tokens: outputTokens,
          cache_creation_tokens: cacheCreationTokens,
          cache_read_tokens: cacheReadTokens,
          cost,
          project_path: window.location.pathname.includes('admin') ? '/admin/dev-tools' : window.location.pathname,
          session_id: this.sessionId
        });
      }
      
      return assistantMessage;
    } catch (error) {
      console.error('Claude API error:', error);
      throw new Error(`Failed to get response from Claude: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  // Continue conversation with context
  async continueConversation(message: string, options: ClaudeSessionOptions = {}): Promise<string> {
    return this.sendMessage(message, options);
  }
  
  // Clear conversation history
  clearHistory() {
    this.messages = [];
  }
  
  // Get conversation history
  getHistory(): ClaudeMessage[] {
    return [...this.messages];
  }
  
  // Set system prompt
  setSystemPrompt(prompt: string) {
    this.systemPrompt = prompt;
  }
  
  // Calculate cost based on model pricing (in USD per 1K tokens)
  private calculateCost(model: string, inputTokens: number, outputTokens: number, cacheCreationTokens = 0, cacheReadTokens = 0): number {
    const pricing: Record<string, { input: number; output: number; cacheWrite: number; cacheRead: number }> = {
      'claude-3-haiku': { input: 0.00025, output: 0.00125, cacheWrite: 0.0003, cacheRead: 0.000003 },
      'claude-3-sonnet': { input: 0.003, output: 0.015, cacheWrite: 0.0037, cacheRead: 0.000003 },
      'claude-3-sonnet-20240229': { input: 0.003, output: 0.015, cacheWrite: 0.0037, cacheRead: 0.000003 },
      'claude-3.5-sonnet': { input: 0.003, output: 0.015, cacheWrite: 0.0037, cacheRead: 0.000003 },
      'claude-3-opus': { input: 0.015, output: 0.075, cacheWrite: 0.0187, cacheRead: 0.000015 },
      'claude-4-opus': { input: 0.015, output: 0.075, cacheWrite: 0.0187, cacheRead: 0.000015 },
      'claude-4-sonnet': { input: 0.003, output: 0.015, cacheWrite: 0.0037, cacheRead: 0.000003 }
    };
    
    const modelPricing = pricing[model] || pricing['claude-3.5-sonnet'];
    
    return (
      (inputTokens / 1000) * modelPricing.input +
      (outputTokens / 1000) * modelPricing.output +
      (cacheCreationTokens / 1000) * modelPricing.cacheWrite +
      (cacheReadTokens / 1000) * modelPricing.cacheRead
    );
  }
  
  // Check if API key is available
  static isConfigured(): boolean {
    const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY || localStorage.getItem('anthropic_api_key');
    return !!apiKey;
  }
  
  // Save API key to localStorage
  static saveApiKey(apiKey: string) {
    localStorage.setItem('anthropic_api_key', apiKey);
  }
  
  // Remove API key from localStorage
  static removeApiKey() {
    localStorage.removeItem('anthropic_api_key');
  }
}

// Singleton instance for the current session
let currentSession: ClaudeService | null = null;

export const getCurrentSession = (): ClaudeService => {
  if (!currentSession) {
    currentSession = new ClaudeService();
  }
  return currentSession;
};

export const createNewSession = (systemPrompt?: string): ClaudeService => {
  currentSession = new ClaudeService(systemPrompt);
  return currentSession;
};