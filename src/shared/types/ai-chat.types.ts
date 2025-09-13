// Enhanced types for AI Chat Assistant with backward compatibility

export interface ChatThread {
  id: string;
  userId: string;
  title: string;
  type: 'morning_routine' | 'task_planning' | 'general' | 'project_specific';
  createdAt: Date;
  updatedAt: Date;
  lastMessageAt: Date;
  messageCount: number;
  isArchived: boolean;
  metadata?: {
    projectId?: string;
    tags?: string[];
    priority?: 'low' | 'medium' | 'high';
    [key: string]: any;
  };
}

export interface ChatMessage {
  id: string;
  threadId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  type?: 'normal' | 'suggestion' | 'task' | 'timer' | 'analysis';
  metadata?: {
    voiceInput?: boolean;
    duration?: number;
    confidence?: number;
    taskIds?: string[];
    thoughtDumpId?: string;
    [key: string]: any;
  };
}

export interface ConversationInsight {
  id: string;
  threadId: string;
  type: 'pattern' | 'productivity' | 'communication_style' | 'routine_optimization' | 'goal_tracking';
  title: string;
  description: string;
  confidence: number; // 0-1 scale
  metadata: Record<string, any>;
  createdAt: Date;
}

export interface LearningPattern {
  id: string;
  type: 'time_preference' | 'topic_preference' | 'communication_style' | 'mood_pattern';
  description: string;
  confidence: number; // 0-1 scale
  data: Record<string, any>;
  createdAt: Date;
}

export interface UserPreference {
  id: string;
  type: 'communication' | 'timing' | 'content' | 'interaction';
  value: string;
  confidence: number; // 0-1 scale
  lastUpdated: Date;
};
  createdAt: Date;
  relevanceScore: number;
}

export interface MorningRoutineSession {
  id: string;
  userId: string;
  threadId: string;
  date: Date;
  duration: number; // in seconds
  planningPhase: {
    startTime: Date;
    endTime?: Date;
    goalsDiscussed: string[];
    prioritiesIdentified: string[];
  };
  timeboxingPhase: {
    startTime?: Date;
    endTime?: Date;
    tasksScheduled: number;
    timeBlocksCreated: number;
  };
  completionStatus: 'in_progress' | 'completed' | 'interrupted';
  taskIds: string[];
  insights: string[];
  satisfactionRating?: number; // 1-5
  notes?: string;
}

export interface AIPersonalityConfig {
  userId: string;
  personality: {
    tone: 'professional' | 'casual' | 'friendly' | 'motivational';
    verbosity: 'concise' | 'balanced' | 'detailed';
    formality: 'formal' | 'semi_formal' | 'informal';
    enthusiasm: 'low' | 'medium' | 'high';
  };
  preferences: {
    morningGreeting: string;
    taskSuggestionStyle: 'direct' | 'questioning' | 'collaborative';
    feedbackFrequency: 'minimal' | 'regular' | 'frequent';
    reminderStyle: 'gentle' | 'firm' | 'urgent';
  };
  learningData: {
    workPatterns: Record<string, any>;
    energyLevels: Record<string, any>;
    productivityTimes: string[];
    commonTasks: string[];
    successFactors: string[];
  };
  updatedAt: Date;
}

// Extended existing interfaces for backward compatibility
export interface EnhancedChatMessage extends ChatMessage {
  // Existing properties preserved
  taskCount?: number;
  
  // New optional properties
  threadTitle?: string;
  isPersonalMode?: boolean;
  aiPersonality?: 'default' | 'motivational' | 'analytical' | 'creative';
}

// Props for enhanced AI Assistant Tab
export interface EnhancedTabProps {
  // Preserve all existing TabProps
  user: any;
  selectedDate?: Date;
  todayCard: any;
  weekCards?: any[];
  refreshTrigger: number;
  onRefresh: () => void;
  onTaskToggle: (taskId: string) => void;
  onQuickAdd: () => void;
  onCustomTaskAdd: (task: { title: string; priority: 'low' | 'medium' | 'high' }) => void;
  onVoiceCommand: (command: string) => void;
  onCardClick?: (card: any) => void;
  onNavigateWeek?: (direction: 'prev' | 'next') => void;
  onOrganizeTasks?: () => void;
  isProcessingVoice: boolean;
  isAnalyzingTasks?: boolean;
  lastThoughtDumpResult: any;
  eisenhowerResult?: any;
  showEisenhowerModal?: boolean;
  onCloseEisenhowerModal?: () => void;
  onApplyOrganization?: () => void;
  onReanalyze?: () => void;
  
  // New optional enhanced features (all default to false)
  enablePersonalChatMode?: boolean;
  enableChatThreads?: boolean;
  enableConversationHistory?: boolean;
  enableMorningRoutineTimer?: boolean;
  enableAILearning?: boolean;
  
  // New enhanced callbacks
  onThreadSelect?: (threadId: string) => void;
  onThreadCreate?: (title: string, type: ChatThread['type']) => void;
  onMorningRoutineStart?: () => void;
  onPersonalityUpdate?: (config: Partial<AIPersonalityConfig>) => void;
}

// Service interfaces
export interface ChatThreadService {
  createThread(userId: string, title: string, type: ChatThread['type']): Promise<ChatThread>;
  getThreads(userId: string): Promise<ChatThread[]>;
  getThread(threadId: string): Promise<ChatThread | null>;
  updateThread(threadId: string, updates: Partial<ChatThread>): Promise<ChatThread>;
  deleteThread(threadId: string): Promise<void>;
  archiveThread(threadId: string): Promise<void>;
}

export interface ConversationService {
  saveMessage(message: Omit<ChatMessage, 'id' | 'timestamp'>): Promise<ChatMessage>;
  getMessages(threadId: string, limit?: number, offset?: number): Promise<ChatMessage[]>;
  deleteMessage(messageId: string): Promise<void>;
  
  // Conversation analysis
  analyzeConversation(threadId: string): Promise<ConversationInsight[]>;
  generateSummary(threadId: string): Promise<string>;
  extractPatterns(userId: string): Promise<ConversationInsight[]>;
}

export interface MorningRoutineService {
  startSession(userId: string, threadId: string): Promise<MorningRoutineSession>;
  updateSession(sessionId: string, updates: Partial<MorningRoutineSession>): Promise<MorningRoutineSession>;
  completeSession(sessionId: string, rating?: number, notes?: string): Promise<MorningRoutineSession>;
  getRecentSessions(userId: string, limit?: number): Promise<MorningRoutineSession[]>;
  getSessionStats(userId: string): Promise<{
    totalSessions: number;
    averageDuration: number;
    averageRating: number;
    streakDays: number;
  }>;
}

// API response types
export interface ChatThreadResponse {
  success: boolean;
  data?: ChatThread;
  error?: string;
}

export interface ChatMessageResponse {
  success: boolean;
  data?: ChatMessage;
  thoughtDumpResult?: any;
  insights?: ConversationInsight[];
  error?: string;
}

export interface ConversationHistoryResponse {
  success: boolean;
  data?: {
    messages: ChatMessage[];
    hasMore: boolean;
    totalCount: number;
  };
  error?: string;
}