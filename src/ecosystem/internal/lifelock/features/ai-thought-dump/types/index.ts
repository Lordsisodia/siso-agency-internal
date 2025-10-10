/**
 * AI Thought Dump Feature Types
 * Centralized type definitions for the entire feature
 */

export interface Message {
  role: 'user' | 'assistant' | 'tool';
  content: string;
  timestamp: Date;
  tool_call_id?: string;
  name?: string;
}

export interface VoiceConfig {
  language?: string;
  continuous?: boolean;
  interimResults?: boolean;
  maxAlternatives?: number;
}

export interface TTSConfig {
  voice?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
}

export interface ThoughtDumpSession {
  id: string;
  userId: string;
  date: Date;
  messages: Message[];
  startedAt: Date;
  completedAt?: Date;
}

export interface AIToolCall {
  id: string;
  function: {
    name: string;
    arguments: string;
  };
}

export interface AIMessage {
  content: string | null;
  tool_calls?: AIToolCall[];
}

export interface ThoughtDumpResult {
  tasks: any[];
  summary: string;
  timestamp: Date;
}
