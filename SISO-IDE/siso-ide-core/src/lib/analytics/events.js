import { EventName, sanitizeString, sanitizeFilePath, sanitizeErrorMessage } from './types';

export const ANALYTICS_EVENTS = {
  // Session events
  SESSION_CREATED: EventName.SESSION_CREATED,
  SESSION_COMPLETED: EventName.SESSION_COMPLETED,
  SESSION_RESUMED: EventName.SESSION_RESUMED,
  PROMPT_SUBMITTED: EventName.PROMPT_SUBMITTED,
  SESSION_STOPPED: EventName.SESSION_STOPPED,
  CHECKPOINT_CREATED: EventName.CHECKPOINT_CREATED,
  CHECKPOINT_RESTORED: EventName.CHECKPOINT_RESTORED,
  TOOL_EXECUTED: EventName.TOOL_EXECUTED,
  
  // Feature usage events
  FEATURE_USED: EventName.FEATURE_USED,
  MODEL_SELECTED: EventName.MODEL_SELECTED,
  TAB_CREATED: EventName.TAB_CREATED,
  TAB_CLOSED: EventName.TAB_CLOSED,
  FILE_OPENED: EventName.FILE_OPENED,
  FILE_EDITED: EventName.FILE_EDITED,
  FILE_SAVED: EventName.FILE_SAVED,
  
  // Agent events
  AGENT_EXECUTED: EventName.AGENT_EXECUTED,
  AGENT_STARTED: EventName.AGENT_STARTED,
  AGENT_PROGRESS: EventName.AGENT_PROGRESS,
  AGENT_ERROR: EventName.AGENT_ERROR,
  
  // MCP events
  MCP_SERVER_CONNECTED: EventName.MCP_SERVER_CONNECTED,
  MCP_SERVER_DISCONNECTED: EventName.MCP_SERVER_DISCONNECTED,
  MCP_SERVER_ADDED: EventName.MCP_SERVER_ADDED,
  MCP_SERVER_REMOVED: EventName.MCP_SERVER_REMOVED,
  MCP_TOOL_INVOKED: EventName.MCP_TOOL_INVOKED,
  MCP_CONNECTION_ERROR: EventName.MCP_CONNECTION_ERROR,
  
  // Slash command events
  SLASH_COMMAND_USED: EventName.SLASH_COMMAND_USED,
  SLASH_COMMAND_SELECTED: EventName.SLASH_COMMAND_SELECTED,
  SLASH_COMMAND_EXECUTED: EventName.SLASH_COMMAND_EXECUTED,
  SLASH_COMMAND_CREATED: EventName.SLASH_COMMAND_CREATED,
  
  // Settings and system events
  SETTINGS_CHANGED: EventName.SETTINGS_CHANGED,
  APP_STARTED: EventName.APP_STARTED,
  APP_CLOSED: EventName.APP_CLOSED,
  
  // Error and performance events
  ERROR_OCCURRED: EventName.ERROR_OCCURRED,
  API_ERROR: EventName.API_ERROR,
  UI_ERROR: EventName.UI_ERROR,
  PERFORMANCE_BOTTLENECK: EventName.PERFORMANCE_BOTTLENECK,
  MEMORY_WARNING: EventName.MEMORY_WARNING,
  
  // User journey events
  JOURNEY_MILESTONE: EventName.JOURNEY_MILESTONE,
  USER_RETENTION: EventName.USER_RETENTION,
  
  // AI interaction events
  AI_INTERACTION: EventName.AI_INTERACTION,
  PROMPT_PATTERN: EventName.PROMPT_PATTERN,
  
  // Quality events
  OUTPUT_REGENERATED: EventName.OUTPUT_REGENERATED,
  CONVERSATION_ABANDONED: EventName.CONVERSATION_ABANDONED,
  SUGGESTION_ACCEPTED: EventName.SUGGESTION_ACCEPTED,
  SUGGESTION_REJECTED: EventName.SUGGESTION_REJECTED,
  
  // Workflow events
  WORKFLOW_STARTED: EventName.WORKFLOW_STARTED,
  WORKFLOW_COMPLETED: EventName.WORKFLOW_COMPLETED,
  WORKFLOW_ABANDONED: EventName.WORKFLOW_ABANDONED,
  
  // Feature adoption events
  FEATURE_DISCOVERED: EventName.FEATURE_DISCOVERED,
  FEATURE_ADOPTED: EventName.FEATURE_ADOPTED,
  FEATURE_COMBINATION: EventName.FEATURE_COMBINATION,
  
  // Resource usage events
  RESOURCE_USAGE_HIGH: EventName.RESOURCE_USAGE_HIGH,
  RESOURCE_USAGE_SAMPLED: EventName.RESOURCE_USAGE_SAMPLED,
  
  // Network performance events
  NETWORK_PERFORMANCE: EventName.NETWORK_PERFORMANCE,
  NETWORK_FAILURE: EventName.NETWORK_FAILURE,
  
  // Engagement events
  SESSION_ENGAGEMENT: EventName.SESSION_ENGAGEMENT,
};

// Event property builders - help ensure consistent event structure
export const eventBuilders = {
  session: (props) => ({
    event: ANALYTICS_EVENTS.SESSION_CREATED,
    properties: {
      category: 'session',
      ...props,
    },
  }),
  
  feature: (feature, subfeature, metadata = {}) => ({
    event: ANALYTICS_EVENTS.FEATURE_USED,
    properties: {
      category: 'feature',
      feature,
      subfeature,
      ...metadata,
    },
  }),
  
  error: (errorType, errorCode, context) => ({
    event: ANALYTICS_EVENTS.ERROR_OCCURRED,
    properties: {
      category: 'error',
      error_type: errorType,
      error_code: errorCode,
      context,
    },
  }),
  
  model: (newModel, previousModel, source) => ({
    event: ANALYTICS_EVENTS.MODEL_SELECTED,
    properties: {
      category: 'model',
      new_model: newModel,
      previous_model: previousModel,
      source,
    },
  }),
  
  agent: (agentType, success, agentName, durationMs) => ({
    event: ANALYTICS_EVENTS.AGENT_EXECUTED,
    properties: {
      category: 'agent',
      agent_type: agentType,
      agent_name: agentName,
      success,
      duration_ms: durationMs,
    },
  }),
  
  mcp: (serverName, success, serverType) => ({
    event: ANALYTICS_EVENTS.MCP_SERVER_CONNECTED,
    properties: {
      category: 'mcp',
      server_name: serverName,
      server_type: serverType,
      success,
    },
  }),
  
  slashCommand: (command, success) => ({
    event: ANALYTICS_EVENTS.SLASH_COMMAND_USED,
    properties: {
      category: 'slash_command',
      command,
      success,
    },
  }),
  
  performance: (metrics) => ({
    event: ANALYTICS_EVENTS.FEATURE_USED,
    properties: {
      category: 'performance',
      feature: 'system_metrics',
      ...metrics,
    },
  }),
  
  // SISO IDE specific event builders
  promptSubmitted: (props) => ({
    event: ANALYTICS_EVENTS.PROMPT_SUBMITTED,
    properties: {
      category: 'session',
      ...props,
    },
  }),
  
  sessionStopped: (props) => ({
    event: ANALYTICS_EVENTS.SESSION_STOPPED,
    properties: {
      category: 'session',
      ...props,
    },
  }),
  
  checkpointCreated: (props) => ({
    event: ANALYTICS_EVENTS.CHECKPOINT_CREATED,
    properties: {
      category: 'session',
      ...props,
    },
  }),
  
  checkpointRestored: (props) => ({
    event: ANALYTICS_EVENTS.CHECKPOINT_RESTORED,
    properties: {
      category: 'session',
      ...props,
    },
  }),
  
  toolExecuted: (props) => ({
    event: ANALYTICS_EVENTS.TOOL_EXECUTED,
    properties: {
      category: 'session',
      tool_name: sanitizers.sanitizeToolName(props.tool_name),
      execution_time_ms: props.execution_time_ms,
      success: props.success,
      error_message: props.error_message ? sanitizers.sanitizeErrorMessage(props.error_message) : undefined,
    },
  }),
  
  // Enhanced Agent event builders
  agentStarted: (props) => ({
    event: ANALYTICS_EVENTS.AGENT_STARTED,
    properties: {
      category: 'agent',
      agent_type: props.agent_type,
      agent_name: props.agent_name ? sanitizers.sanitizeAgentName(props.agent_name) : undefined,
      has_custom_prompt: props.has_custom_prompt,
    },
  }),
  
  agentProgress: (props) => ({
    event: ANALYTICS_EVENTS.AGENT_PROGRESS,
    properties: {
      category: 'agent',
      ...props,
    },
  }),
  
  agentError: (props) => ({
    event: ANALYTICS_EVENTS.AGENT_ERROR,
    properties: {
      category: 'agent',
      ...props,
    },
  }),
  
  // MCP event builders
  mcpServerAdded: (props) => ({
    event: ANALYTICS_EVENTS.MCP_SERVER_ADDED,
    properties: {
      category: 'mcp',
      ...props,
    },
  }),
  
  mcpServerRemoved: (props) => ({
    event: ANALYTICS_EVENTS.MCP_SERVER_REMOVED,
    properties: {
      category: 'mcp',
      server_name: sanitizers.sanitizeServerName(props.server_name),
      was_connected: props.was_connected,
    },
  }),
  
  mcpToolInvoked: (props) => ({
    event: ANALYTICS_EVENTS.MCP_TOOL_INVOKED,
    properties: {
      category: 'mcp',
      server_name: sanitizers.sanitizeServerName(props.server_name),
      tool_name: sanitizers.sanitizeToolName(props.tool_name),
      invocation_source: props.invocation_source,
    },
  }),
  
  mcpConnectionError: (props) => ({
    event: ANALYTICS_EVENTS.MCP_CONNECTION_ERROR,
    properties: {
      category: 'mcp',
      server_name: sanitizers.sanitizeServerName(props.server_name),
      error_type: props.error_type,
      retry_attempt: props.retry_attempt,
    },
  }),
  
  // Error and Performance event builders
  apiError: (props) => ({
    event: ANALYTICS_EVENTS.API_ERROR,
    properties: {
      category: 'error',
      endpoint: sanitizers.sanitizeEndpoint(props.endpoint),
      error_code: props.error_code,
      retry_count: props.retry_count,
      response_time_ms: props.response_time_ms,
    },
  }),
  
  uiError: (props) => ({
    event: ANALYTICS_EVENTS.UI_ERROR,
    properties: {
      category: 'error',
      ...props,
    },
  }),
  
  performanceBottleneck: (props) => ({
    event: ANALYTICS_EVENTS.PERFORMANCE_BOTTLENECK,
    properties: {
      category: 'performance',
      ...props,
    },
  }),
  
  memoryWarning: (props) => ({
    event: ANALYTICS_EVENTS.MEMORY_WARNING,
    properties: {
      category: 'performance',
      ...props,
    },
  }),
  
  // Resource usage
  resourceUsageHigh: (props) => ({
    event: ANALYTICS_EVENTS.RESOURCE_USAGE_HIGH,
    properties: {
      category: 'performance',
      ...props,
    },
  }),
  
  resourceUsageSampled: (props) => ({
    event: ANALYTICS_EVENTS.RESOURCE_USAGE_SAMPLED,
    properties: {
      category: 'performance',
      ...props,
    },
  }),
  
  // AI interactions for SISO IDE
  aiInteraction: (props) => ({
    event: ANALYTICS_EVENTS.AI_INTERACTION,
    properties: {
      category: 'ai',
      ...props,
    },
  }),
  
  // Network performance
  networkPerformance: (props) => ({
    event: ANALYTICS_EVENTS.NETWORK_PERFORMANCE,
    properties: {
      category: 'network',
      endpoint_type: props.endpoint_type,
      latency_ms: props.latency_ms,
      payload_size_bytes: props.payload_size_bytes,
      connection_quality: props.connection_quality,
      retry_count: props.retry_count,
      circuit_breaker_triggered: props.circuit_breaker_triggered,
    },
  }),
};

// Sanitization helpers to remove PII - adapted from Claudia-GUI
export const sanitizers = {
  // Remove file paths, keeping only extension
  sanitizeFilePath: (path) => {
    if (!path) return 'unknown';
    const ext = path.split('.').pop();
    return ext ? `*.${ext}` : 'unknown';
  },
  
  // Remove project names and paths
  sanitizeProjectPath: (path) => {
    return 'project';
  },
  
  // Sanitize error messages that might contain sensitive info
  sanitizeErrorMessage: (message) => {
    if (!message) return '';
    // Remove file paths
    message = message.replace(/\/[\w\-\/\.]+/g, '/***');
    // Remove potential API keys or tokens
    message = message.replace(/[a-zA-Z0-9]{20,}/g, '***');
    // Remove email addresses
    message = message.replace(/[\w\.-]+@[\w\.-]+\.\w+/g, '***@***.***');
    return message;
  },
  
  // Sanitize agent names that might contain user info
  sanitizeAgentName: (name) => {
    if (!name) return 'custom';
    // Only keep the type, remove custom names
    return name.split('-')[0] || 'custom';
  },
  
  // Sanitize tool names to remove any user-specific info
  sanitizeToolName: (name) => {
    if (!name) return 'unknown';
    // Remove any path-like structures
    return name.replace(/\/[\w\-\/\.]+/g, '').toLowerCase();
  },
  
  // Sanitize server names to remove any user-specific info
  sanitizeServerName: (name) => {
    if (!name) return 'custom';
    // Keep only the type or first part
    return name.split(/[\-_]/)[0] || 'custom';
  },
  
  // Sanitize command names
  sanitizeCommandName: (name) => {
    if (!name) return 'custom';
    // Remove any custom prefixes or user-specific parts
    return name.replace(/^custom-/, '').split('-')[0] || 'custom';
  },
  
  // Sanitize API endpoints
  sanitizeEndpoint: (endpoint) => {
    if (!endpoint) return '/unknown';
    // Remove any dynamic IDs or user-specific parts
    return endpoint.replace(/\/\d+/g, '/:id').replace(/\/[\w\-]{20,}/g, '/:id');
  },
};