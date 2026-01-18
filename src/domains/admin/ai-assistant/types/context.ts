/**
 * AI Context types
 */

export interface AIContext {
  // Current tasks
  tasks?: Array<{
    id: string;
    title: string;
    status: string;
    domain?: string;
  }>;

  // User stats
  stats?: {
    tasksCompleted?: number;
    focusTime?: number;
    streak?: number;
    mostProductiveTime?: string;
  };

  // Recent activity
  recentActivity?: string[];

  // Current domain (lifelock, work, personal)
  domain?: 'lifelock' | 'work' | 'personal' | 'general';

  // Current section (morning-routine, deep-work, light-work, etc.)
  section?: string;

  // User preferences
  preferences?: {
    focusTime?: string;
    workStyle?: string;
    goals?: string[];
  };
}

export interface AIRequest {
  query: string;
  context?: AIContext;
  actionType?: string;
}

export interface AIResponse {
  content: string;
  suggestions?: string[];
  analysis?: string;
  actions?: Array<{
    type: string;
    label: string;
    data?: any;
  }>;
}
