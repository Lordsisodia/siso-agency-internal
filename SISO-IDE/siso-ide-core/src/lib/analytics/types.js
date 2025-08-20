// Analytics types converted from TypeScript to JavaScript
// SISO IDE Analytics System - Based on Claudia-GUI implementation

// Event Names enum-like object
export const EventName = {
  SESSION_CREATED: 'session_created',
  SESSION_COMPLETED: 'session_completed',
  SESSION_RESUMED: 'session_resumed',
  FEATURE_USED: 'feature_used',
  ERROR_OCCURRED: 'error_occurred',
  MODEL_SELECTED: 'model_selected',
  TAB_CREATED: 'tab_created',
  TAB_CLOSED: 'tab_closed',
  FILE_OPENED: 'file_opened',
  FILE_EDITED: 'file_edited',
  FILE_SAVED: 'file_saved',
  AGENT_EXECUTED: 'agent_executed',
  MCP_SERVER_CONNECTED: 'mcp_server_connected',
  MCP_SERVER_DISCONNECTED: 'mcp_server_disconnected',
  SLASH_COMMAND_USED: 'slash_command_used',
  SETTINGS_CHANGED: 'settings_changed',
  APP_STARTED: 'app_started',
  APP_CLOSED: 'app_closed',
  // Session events
  PROMPT_SUBMITTED: 'prompt_submitted',
  SESSION_STOPPED: 'session_stopped',
  CHECKPOINT_CREATED: 'checkpoint_created',
  CHECKPOINT_RESTORED: 'checkpoint_restored',
  TOOL_EXECUTED: 'tool_executed',
  // Agent events
  AGENT_STARTED: 'agent_started',
  AGENT_PROGRESS: 'agent_progress',
  AGENT_ERROR: 'agent_error',
  // MCP events
  MCP_SERVER_ADDED: 'mcp_server_added',
  MCP_SERVER_REMOVED: 'mcp_server_removed',
  MCP_TOOL_INVOKED: 'mcp_tool_invoked',
  MCP_CONNECTION_ERROR: 'mcp_connection_error',
  // Slash command events
  SLASH_COMMAND_SELECTED: 'slash_command_selected',
  SLASH_COMMAND_EXECUTED: 'slash_command_executed',
  SLASH_COMMAND_CREATED: 'slash_command_created',
  // Error and performance events
  API_ERROR: 'api_error',
  UI_ERROR: 'ui_error',
  PERFORMANCE_BOTTLENECK: 'performance_bottleneck',
  MEMORY_WARNING: 'memory_warning',
  // User journey events
  JOURNEY_MILESTONE: 'journey_milestone',
  USER_RETENTION: 'user_retention',
  // AI interaction events
  AI_INTERACTION: 'ai_interaction',
  PROMPT_PATTERN: 'prompt_pattern',
  // Quality events
  OUTPUT_REGENERATED: 'output_regenerated',
  CONVERSATION_ABANDONED: 'conversation_abandoned',
  SUGGESTION_ACCEPTED: 'suggestion_accepted',
  SUGGESTION_REJECTED: 'suggestion_rejected',
  // Workflow events
  WORKFLOW_STARTED: 'workflow_started',
  WORKFLOW_COMPLETED: 'workflow_completed',
  WORKFLOW_ABANDONED: 'workflow_abandoned',
  // Feature adoption events
  FEATURE_DISCOVERED: 'feature_discovered',
  FEATURE_ADOPTED: 'feature_adopted',
  FEATURE_COMBINATION: 'feature_combination',
  // Resource usage events
  RESOURCE_USAGE_HIGH: 'resource_usage_high',
  RESOURCE_USAGE_SAMPLED: 'resource_usage_sampled',
  // Network performance events
  NETWORK_PERFORMANCE: 'network_performance',
  NETWORK_FAILURE: 'network_failure',
  // Engagement events
  SESSION_ENGAGEMENT: 'session_engagement'
};

// Default analytics settings
export const DEFAULT_ANALYTICS_SETTINGS = {
  enabled: false,
  hasConsented: false,
  consentDate: null,
  userId: null,
  sessionId: null
};

// Default analytics config
export const DEFAULT_ANALYTICS_CONFIG = {
  apiKey: '',
  apiHost: 'https://app.posthog.com',
  persistence: 'localStorage',
  autocapture: false,
  disable_session_recording: true,
  opt_out_capturing_by_default: true,
  loaded: null
};

// Performance thresholds
export const PERFORMANCE_THRESHOLDS = {
  MEMORY_WARNING_MB: 500,
  API_RESPONSE_SLOW_MS: 5000,
  RENDER_SLOW_MS: 100,
  NETWORK_SLOW_MS: 3000
};

// Feature categories
export const FEATURE_CATEGORIES = {
  CHAT: 'chat',
  FILES: 'files',
  TOOLS: 'tools',
  SETTINGS: 'settings',
  NAVIGATION: 'navigation',
  MCP: 'mcp',
  AGENTS: 'agents'
};

// Model types commonly used in SISO IDE
export const MODEL_TYPES = {
  CLAUDE_4_OPUS: 'claude-4-opus',
  CLAUDE_4_SONNET: 'claude-4-sonnet',
  CLAUDE_3_5_SONNET: 'claude-3.5-sonnet',
  CLAUDE_3_OPUS: 'claude-3-opus'
};

// Tool categories
export const TOOL_CATEGORIES = {
  FILE: 'file',
  SEARCH: 'search',
  SYSTEM: 'system',
  CUSTOM: 'custom',
  MCP: 'mcp'
};

// Session completion reasons
export const SESSION_COMPLETION_REASONS = {
  USER_STOPPED: 'user_stopped',
  ERROR: 'error',
  COMPLETED: 'completed',
  TIMEOUT: 'timeout'
};

// Engagement levels
export const ENGAGEMENT_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  POWER_USER: 'power_user'
};

// Helper functions for analytics properties validation
export const createPromptSubmittedProperties = (prompt, model, source = 'keyboard') => ({
  prompt_length: prompt.length,
  model: model,
  has_attachments: false, // SISO IDE will determine this
  source: source,
  word_count: prompt.split(' ').length,
  conversation_depth: 0, // Will be calculated by SISO
  prompt_complexity: prompt.length > 500 ? 'complex' : prompt.length > 100 ? 'moderate' : 'simple',
  contains_code: /```/.test(prompt),
  session_age_ms: 0 // Will be calculated by SISO
});

export const createSessionStoppedProperties = (duration, messageCount, reason = 'user_stopped') => ({
  duration_ms: duration,
  messages_count: messageCount,
  reason: reason,
  prompts_sent: messageCount,
  tools_executed: 0, // Will be tracked by SISO
  tools_failed: 0,
  files_created: 0,
  files_modified: 0,
  files_deleted: 0,
  errors_encountered: 0,
  has_checkpoints: false,
  was_resumed: false,
  stop_source: 'user_button',
  final_state: 'success',
  has_pending_prompts: false
});

export const createToolExecutedProperties = (toolName, executionTime, success, errorMessage = null) => ({
  tool_name: toolName,
  execution_time_ms: executionTime,
  success: success,
  error_message: errorMessage,
  tool_category: 'system', // Will be determined by SISO
  retry_attempted: false,
  input_size_bytes: 0,
  output_size_bytes: 0
});

export const createResourceUsageProperties = () => ({
  memory_usage_mb: 0, // Will be populated by resource monitor
  network_requests_count: 0,
  cache_hit_rate: 0,
  active_connections: 0
});

// Validation helpers
export const isValidEventName = (eventName) => {
  return Object.values(EventName).includes(eventName);
};

export const sanitizeString = (str) => {
  if (!str) return '';
  // Remove potential PII
  return str.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '***@***.***')
            .replace(/[a-zA-Z0-9]{20,}/g, '***')
            .replace(/\/Users\/[^\/]+/g, '/Users/***')
            .replace(/\/home\/[^\/]+/g, '/home/***');
};

export const sanitizeFilePath = (path) => {
  if (!path) return '';
  const ext = path.split('.').pop();
  return ext ? `*.${ext}` : 'unknown';
};

export const sanitizeErrorMessage = (message) => {
  if (!message) return '';
  return sanitizeString(message);
};