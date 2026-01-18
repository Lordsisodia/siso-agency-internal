/**
 * AI Thought Dump Type Definitions
 */

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: number;
}

export interface ThoughtDumpResult {
  tasks: Array<{
    title: string;
    description?: string;
    priority?: 'high' | 'medium' | 'low';
    estimatedDuration?: string;
  }>;
  insights?: string[];
  summary?: string;
}

export interface ThoughtDumpContext {
  selectedDate: Date;
  userId?: string;
}
