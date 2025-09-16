
export type AgentCategory = 'ai-tools' | 'videos' | 'networking' | 'assistants' | 'educators' | 'news';

export type ProcessingStage = 'initial' | 'context' | 'agents' | 'synthesis';

export interface AgentResponse {
  category: AgentCategory;
  content: string;
  status: 'pending' | 'processing' | 'complete';
  relevance: number;
}

export interface ChatMessage {
  role: 'assistant' | 'user';
  content: string;
  loading?: boolean;
  processingStage?: {
    current: ProcessingStage;
    progress: number;
  };
  agentResponses?: Record<AgentCategory, AgentResponse>;
  steps?: {
    thinking?: string;
    searching?: string;
    processing?: string;
    response?: string;
  };
}
