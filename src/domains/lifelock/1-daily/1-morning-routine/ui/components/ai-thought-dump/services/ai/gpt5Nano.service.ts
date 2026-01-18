/**
 * GPT-5 Nano Service - Function Calling for Morning Routine AI
 * Provides intelligent, tool-based task organization
 */

interface Message {
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  tool_calls?: ToolCall[];
  tool_call_id?: string;
  name?: string;
}

interface ToolCall {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string;
  };
}

interface ChatCompletionOptions {
  messages: Message[];
  tools?: Tool[];
  temperature?: number;
  max_tokens?: number;
}

interface Tool {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: any;
  };
}

class GPT5NanoService {
  private apiKey: string;
  private baseURL = 'https://api.openai.com/v1/chat/completions';

  constructor() {
    this.apiKey = import.meta.env.VITE_OPENAI_API_KEY || '';
    if (!this.apiKey) {
      console.warn('⚠️ OpenAI API key not found. Set VITE_OPENAI_API_KEY in .env.local');
    }
  }

  /**
   * Chat with GPT-5 Nano with optional tool calling
   */
  async chat(options: ChatCompletionOptions): Promise<any> {
    if (!this.apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    try {
      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini', // GPT-5 Nano equivalent
          messages: options.messages,
          tools: options.tools,
          temperature: options.temperature || 0.7,
          max_tokens: options.max_tokens || 500
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`OpenAI API error: ${error.error?.message || response.statusText}`);
      }

      const data = await response.json();
      return data;

    } catch (error) {
      console.error('❌ [GPT-5 NANO] Chat error:', error);
      throw error;
    }
  }

  /**
   * Simple chat without tools (for quick responses)
   */
  async simpleChat(userMessage: string, systemPrompt?: string): Promise<string> {
    const messages: Message[] = [];

    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt });
    }

    messages.push({ role: 'user', content: userMessage });

    const response = await this.chat({ messages });
    return response.choices[0]?.message?.content || 'No response';
  }

  /**
   * Check if API key is configured
   */
  isConfigured(): boolean {
    return !!this.apiKey && this.apiKey.length > 0;
  }
}

// Export singleton
export const gpt5NanoService = new GPT5NanoService();
