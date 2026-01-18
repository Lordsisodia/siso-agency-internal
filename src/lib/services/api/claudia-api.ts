import { createApiUrl } from '../utils/api-config';

// Check if we're running in Tauri
const isTauri = () => {
  return typeof window !== 'undefined' && window.__TAURI__ !== undefined;
};

// Real usage tracking system
interface UsageRecord {
  timestamp: string;
  model: string;
  input_tokens: number;
  output_tokens: number;
  cache_creation_tokens: number;
  cache_read_tokens: number;
  cost: number;
  project_path: string;
  session_id: string;
}

const USAGE_STORAGE_KEY = 'claude_usage_history';

// Track a new API call
export const trackUsage = (record: UsageRecord) => {
  const existing = getStoredUsageData();
  existing.push(record);
  localStorage.setItem(USAGE_STORAGE_KEY, JSON.stringify(existing));
};

// Get stored usage data
const getStoredUsageData = (): UsageRecord[] => {
  try {
    const data = localStorage.getItem(USAGE_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

// Calculate token costs based on model
const calculateCost = (model: string, inputTokens: number, outputTokens: number, cacheCreationTokens = 0, cacheReadTokens = 0): number => {
  const pricing: Record<string, { input: number; output: number; cacheWrite: number; cacheRead: number }> = {
    'claude-3-haiku': { input: 0.00025, output: 0.00125, cacheWrite: 0.0003, cacheRead: 0.000003 },
    'claude-3-sonnet': { input: 0.003, output: 0.015, cacheWrite: 0.0037, cacheRead: 0.000003 },
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
};

// Get real usage statistics from Claude Code session files
const getClaudeCodeUsageStats = async (cmd: string, args?: any): Promise<any> => {
  try {
    
    // Try to connect to local Claude Code usage API server
    let endpoint = createApiUrl('/usage/stats');
    
    if (cmd === 'get_usage_by_date_range') {
      const { startDate, endDate } = args || {};
      if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        endpoint = createApiUrl(`/usage/date-range?days=${daysDiff}`);
      }
    } else if (cmd === 'get_session_stats') {
      endpoint = createApiUrl('/usage/sessions');
    }
    
    const response = await fetch(endpoint);
    
    if (!response.ok) {
      throw new Error(`Claude Code API server not running (${response.status})`);
    }
    
    const data = await response.json();
    console.log('✅ Successfully fetched real Claude Code usage data:', {
      total_cost: data.total_cost?.toFixed(2),
      total_sessions: data.total_sessions,
      total_tokens: data.total_tokens
    });
    
    if (data.error) {
      throw new Error(data.error);
    }
    
    return data;
    
  } catch (error) {
    console.warn('❌ Failed to connect to Claude Code usage API:', error.message);
    
    
    
    console.warn('⚠️ Falling back to localStorage tracking (limited data)');
    
    // Fallback to localStorage tracking if Claude Code API not accessible
    return getLocalUsageStats(cmd, args);
  }
};

// Get real local usage statistics
const getLocalUsageStats = async (cmd: string, args?: any): Promise<any> => {
  const usageData = getStoredUsageData();
  
  if (cmd === 'get_usage_stats') {
    if (usageData.length === 0) {
      throw new Error('No Claude usage data found. To see real usage statistics:\n\n1. Start the Claude Code usage API: node scripts/claude-usage-api.cjs\n2. Or use Claude through the integrated chat to build local usage data\n\nYour existing Claude Code sessions will be automatically detected when the API server is running.');
    }
    
    const totalCost = usageData.reduce((sum, record) => sum + record.cost, 0);
    const totalSessions = new Set(usageData.map(r => r.session_id)).size;
    const totalTokens = usageData.reduce((sum, record) => sum + record.input_tokens + record.output_tokens, 0);
    const totalInputTokens = usageData.reduce((sum, record) => sum + record.input_tokens, 0);
    const totalOutputTokens = usageData.reduce((sum, record) => sum + record.output_tokens, 0);
    const totalCacheCreationTokens = usageData.reduce((sum, record) => sum + record.cache_creation_tokens, 0);
    const totalCacheReadTokens = usageData.reduce((sum, record) => sum + record.cache_read_tokens, 0);
    
    // Group by model
    const byModel = Object.entries(
      usageData.reduce((acc, record) => {
        if (!acc[record.model]) {
          acc[record.model] = {
            model: record.model,
            total_cost: 0,
            total_tokens: 0,
            input_tokens: 0,
            output_tokens: 0,
            cache_creation_tokens: 0,
            cache_read_tokens: 0,
            session_count: new Set<string>()
          };
        }
        acc[record.model].total_cost += record.cost;
        acc[record.model].total_tokens += record.input_tokens + record.output_tokens;
        acc[record.model].input_tokens += record.input_tokens;
        acc[record.model].output_tokens += record.output_tokens;
        acc[record.model].cache_creation_tokens += record.cache_creation_tokens;
        acc[record.model].cache_read_tokens += record.cache_read_tokens;
        acc[record.model].session_count.add(record.session_id);
        return acc;
      }, {} as any)
    ).map(([_, data]) => ({
      ...data,
      session_count: data.session_count.size
    }));
    
    // Group by project
    const byProject = Object.entries(
      usageData.reduce((acc, record) => {
        if (!acc[record.project_path]) {
          acc[record.project_path] = {
            project_path: record.project_path,
            project_name: record.project_path.split('/').pop() || 'Unknown',
            total_cost: 0,
            total_tokens: 0,
            session_count: new Set<string>(),
            last_used: record.timestamp
          };
        }
        acc[record.project_path].total_cost += record.cost;
        acc[record.project_path].total_tokens += record.input_tokens + record.output_tokens;
        acc[record.project_path].session_count.add(record.session_id);
        if (record.timestamp > acc[record.project_path].last_used) {
          acc[record.project_path].last_used = record.timestamp;
        }
        return acc;
      }, {} as any)
    ).map(([_, data]) => ({
      ...data,
      session_count: data.session_count.size
    }));
    
    // Group by date
    const byDate = Object.entries(
      usageData.reduce((acc, record) => {
        const date = record.timestamp.split('T')[0];
        if (!acc[date]) {
          acc[date] = {
            date,
            total_cost: 0,
            total_tokens: 0,
            models_used: new Set<string>()
          };
        }
        acc[date].total_cost += record.cost;
        acc[date].total_tokens += record.input_tokens + record.output_tokens;
        acc[date].models_used.add(record.model);
        return acc;
      }, {} as any)
    ).map(([_, data]) => ({
      ...data,
      models_used: Array.from(data.models_used)
    })).sort((a, b) => a.date.localeCompare(b.date));
    
    return {
      total_cost: totalCost,
      total_sessions: totalSessions,
      total_tokens: totalTokens,
      total_input_tokens: totalInputTokens,
      total_output_tokens: totalOutputTokens,
      total_cache_creation_tokens: totalCacheCreationTokens,
      total_cache_read_tokens: totalCacheReadTokens,
      by_model: byModel,
      by_project: byProject,
      by_date: byDate
    };
  }
  
  if (cmd === 'get_session_stats') {
    return Object.entries(
      usageData.reduce((acc, record) => {
        if (!acc[record.project_path]) {
          acc[record.project_path] = {
            project_path: record.project_path,
            project_name: record.project_path.split('/').pop() || 'Unknown',
            total_cost: 0,
            total_tokens: 0,
            session_count: new Set<string>(),
            last_used: record.timestamp
          };
        }
        acc[record.project_path].total_cost += record.cost;
        acc[record.project_path].total_tokens += record.input_tokens + record.output_tokens;
        acc[record.project_path].session_count.add(record.session_id);
        if (record.timestamp > acc[record.project_path].last_used) {
          acc[record.project_path].last_used = record.timestamp;
        }
        return acc;
      }, {} as any)
    ).map(([_, data]) => ({
      ...data,
      session_count: data.session_count.size
    }));
  }
  
  if (cmd === 'get_usage_by_date_range') {
    const { startDate, endDate } = args || {};
    const start = startDate ? new Date(startDate) : new Date(0);
    const end = endDate ? new Date(endDate) : new Date();
    
    const filteredData = usageData.filter(record => {
      const recordDate = new Date(record.timestamp);
      return recordDate >= start && recordDate <= end;
    });
    
    return getLocalUsageStats('get_usage_stats', { data: filteredData });
  }
  
  return [];
};

// Dynamic import wrapper for Tauri API
const invoke = async <T>(cmd: string, args?: any): Promise<T> => {
  if (!isTauri()) {
    console.warn(`Tauri not available - trying to connect to Claudia at localhost:1420`);
    
    // For usage statistics commands, use real Claude Code data if available
    if (cmd === 'get_usage_stats' || cmd === 'get_usage_by_date_range' || cmd === 'get_session_stats') {
      return getClaudeCodeUsageStats(cmd, args);
    }
    
    // Try to connect to running Claudia instance at localhost:1420 for execution commands
    if (cmd === 'execute_claude_code' || cmd === 'continue_claude_code' || cmd === 'resume_claude_code') {
      try {
        const { projectPath, prompt, model } = args || {};
        
        
        
        // Different endpoints for different commands
        const endpoint = '/api/execute';
        const body: any = {
          command: cmd,
          projectPath: projectPath || process.cwd(),
          prompt,
          model: model || 'claude-3-sonnet'
        };
        
        // Try to send request to Claudia's API
        const response = await fetch(`http://localhost:1420${endpoint}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body)
        });
        
        if (response.ok) {
          const result = await response.text();
          return result as any;
        } else {
          throw new Error(`Claudia API error: ${response.status} ${response.statusText}`);
        }
      } catch (error) {
        console.error('Failed to connect to Claudia:', error);
        
        // Fall back to mock response if Claudia is not available
        return new Promise((resolve) => {
          setTimeout(() => {
            const mockResponse = `⚠️ Claudia Connection Failed

Attempted to connect to Claudia at localhost:1420 but failed.

Error: ${error instanceof Error ? error.message : 'Unknown error'}

Your prompt: "${args?.prompt}"

To fix this:
1. Make sure Claudia is running: cd projects/claudia-desktop && npm run dev
2. Check that Claudia is accessible at http://localhost:1420
3. Or use the Tauri desktop version for direct Claude Code integration

This is a fallback mock response.`;

            resolve(mockResponse as any);
          }, 1000);
        });
      }
    }
    
    // For other commands, throw error - no mock data
    throw new Error(`Command ${cmd} not available in browser mode. Please use real Claude API integration.`);
  }
  
  try {
    const { invoke: tauriInvoke } = await import("@tauri-apps/api/core");
    return tauriInvoke<T>(cmd, args);
  } catch (error) {
    console.error('Failed to import Tauri API:', error);
    throw new Error('This feature requires the desktop application');
  }
};

/**
 * Represents a project in the ~/.claude/projects directory
 */
export interface Project {
  /** The project ID (derived from the directory name) */
  id: string;
  /** The original project path (decoded from the directory name) */
  path: string;
  /** List of session IDs (JSONL file names without extension) */
  sessions: string[];
  /** Unix timestamp when the project directory was created */
  created_at: number;
}

/**
 * Represents a session with its metadata
 */
export interface Session {
  /** The session ID (UUID) */
  id: string;
  /** The project ID this session belongs to */
  project_id: string;
  /** The project path */
  project_path: string;
  /** Optional todo data associated with this session */
  todo_data?: any;
  /** Unix timestamp when the session file was created */
  created_at: number;
  /** First user message content (if available) */
  first_message?: string;
  /** Timestamp of the first user message (if available) */
  message_timestamp?: string;
}

/**
 * Represents the settings from ~/.claude/settings.json
 */
export interface ClaudeSettings {
  [key: string]: any;
}

/**
 * Represents the Claude Code version status
 */
export interface ClaudeVersionStatus {
  /** Whether Claude Code is installed and working */
  is_installed: boolean;
  /** The version string if available */
  version?: string;
  /** The full output from the command */
  output: string;
}

/**
 * Represents a CLAUDE.md file found in the project
 */
export interface ClaudeMdFile {
  /** Relative path from the project root */
  relative_path: string;
  /** Absolute path to the file */
  absolute_path: string;
  /** File size in bytes */
  size: number;
  /** Last modified timestamp */
  modified: number;
}

/**
 * Represents a file or directory entry
 */
export interface FileEntry {
  name: string;
  path: string;
  is_directory: boolean;
  size: number;
  extension?: string;
}

/**
 * Represents a Claude installation found on the system
 */
export interface ClaudeInstallation {
  /** Full path to the Claude binary */
  path: string;
  /** Version string if available */
  version?: string;
  /** Source of discovery (e.g., "nvm", "system", "homebrew", "which") */
  source: string;
}

/**
 * Represents a running process
 */
export interface ProcessInfo {
  /** Process ID */
  pid: number;
  /** Process name */
  name: string;
  /** Process status */
  status: string;
  /** CPU usage percentage */
  cpu?: number;
  /** Memory usage in bytes */
  memory?: number;
  /** Run ID */
  run_id?: number;
  /** Process type info */
  process_type: any;
  /** Project path */
  project_path: string;
  /** Started at timestamp */
  started_at: string;
  /** Model being used */
  model?: string;
  /** Task description */
  task?: string;
}

/**
 * Represents a slash command
 */
export interface SlashCommand {
  /** Command ID */
  id: string;
  /** Command name */
  name: string;
  /** Command description */
  description: string;
  /** Command arguments */
  args?: string[];
  /** Command script or action */
  action: string;
  /** Whether the command is enabled */
  enabled: boolean;
  /** Command category */
  category?: string;
  /** Full command string */
  full_command: string;
  /** Command namespace */
  namespace: string;
  /** Whether command accepts arguments */
  accepts_arguments: boolean;
  /** Allowed tools */
  allowed_tools: string[];
  /** Whether command has bash commands */
  has_bash_commands: boolean;
  /** Whether command has file references */
  has_file_references: boolean;
  /** Command scope */
  scope: string;
  /** Command content */
  content: string;
}

// Sandbox API types
export interface SandboxProfile {
  id?: number;
  name: string;
  description?: string;
  is_active: boolean;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface SandboxRule {
  id?: number;
  profile_id: number;
  operation_type: string;
  pattern_type: string;
  pattern_value: string;
  enabled: boolean;
  platform_support?: string;
  created_at: string;
}

export interface PlatformCapabilities {
  os: string;
  sandboxing_supported: boolean;
  operations: OperationSupport[];
  notes: string[];
}

export interface OperationSupport {
  operation: string;
  support_level: string;
  description: string;
}

// Sandbox violation types
export interface SandboxViolation {
  id?: number;
  profile_id?: number;
  agent_id?: number;
  agent_run_id?: number;
  operation_type: string;
  pattern_value?: string;
  process_name?: string;
  pid?: number;
  denied_at: string;
}

export interface SandboxViolationStats {
  total: number;
  recent_24h: number;
  by_operation: Array<{
    operation: string;
    count: number;
  }>;
}

// Import/Export types
export interface SandboxProfileExport {
  version: number;
  exported_at: string;
  platform: string;
  profiles: SandboxProfileWithRules[];
}

export interface SandboxProfileWithRules {
  profile: SandboxProfile;
  rules: SandboxRule[];
}

export interface ImportResult {
  profile_name: string;
  imported: boolean;
  reason?: string;
  new_name?: string;
}

// Agent API types
export interface Agent {
  id?: number;
  name: string;
  icon: string;
  system_prompt: string;
  default_task?: string;
  model: string;
  sandbox_enabled: boolean;
  enable_file_read: boolean;
  enable_file_write: boolean;
  enable_network: boolean;
  created_at: string;
  updated_at: string;
}

export interface AgentExport {
  version: number;
  exported_at: string;
  agent: {
    name: string;
    icon: string;
    system_prompt: string;
    default_task?: string;
    model: string;
    sandbox_enabled: boolean;
    enable_file_read: boolean;
    enable_file_write: boolean;
    enable_network: boolean;
  };
}

export interface GitHubAgentFile {
  name: string;
  path: string;
  download_url: string;
  size: number;
  sha: string;
}

export interface AgentRun {
  id?: number;
  agent_id: number;
  agent_name: string;
  agent_icon: string;
  task: string;
  model: string;
  project_path: string;
  session_id: string;
  status: string; // 'pending', 'running', 'completed', 'failed', 'cancelled'
  pid?: number;
  process_started_at?: string;
  created_at: string;
  completed_at?: string;
}

export interface AgentRunMetrics {
  duration_ms?: number;
  total_tokens?: number;
  cost_usd?: number;
  message_count?: number;
}

export interface AgentRunWithMetrics {
  id?: number;
  agent_id: number;
  agent_name: string;
  agent_icon: string;
  task: string;
  model: string;
  project_path: string;
  session_id: string;
  status: string; // 'pending', 'running', 'completed', 'failed', 'cancelled'
  pid?: number;
  process_started_at?: string;
  created_at: string;
  completed_at?: string;
  metrics?: AgentRunMetrics;
  output?: string; // Real-time JSONL content
}

// Usage Dashboard types
export interface UsageEntry {
  project: string;
  timestamp: string;
  model: string;
  input_tokens: number;
  output_tokens: number;
  cache_write_tokens: number;
  cache_read_tokens: number;
  cost: number;
}

export interface ModelUsage {
  model: string;
  total_cost: number;
  total_tokens: number;
  input_tokens: number;
  output_tokens: number;
  cache_creation_tokens: number;
  cache_read_tokens: number;
  session_count: number;
}

export interface DailyUsage {
  date: string;
  total_cost: number;
  total_tokens: number;
  models_used: string[];
}

export interface ProjectUsage {
  project_path: string;
  project_name: string;
  total_cost: number;
  total_tokens: number;
  session_count: number;
  last_used: string;
}

export interface UsageStats {
  total_cost: number;
  total_tokens: number;
  total_input_tokens: number;
  total_output_tokens: number;
  total_cache_creation_tokens: number;
  total_cache_read_tokens: number;
  total_sessions: number;
  by_model: ModelUsage[];
  by_date: DailyUsage[];
  by_project: ProjectUsage[];
}

/**
 * Represents a checkpoint in the session timeline
 */
export interface Checkpoint {
  id: string;
  sessionId: string;
  projectId: string;
  messageIndex: number;
  timestamp: string;
  description?: string;
  parentCheckpointId?: string;
  metadata: CheckpointMetadata;
}

/**
 * Metadata associated with a checkpoint
 */
export interface CheckpointMetadata {
  totalTokens: number;
  modelUsed: string;
  userPrompt: string;
  fileChanges: number;
  snapshotSize: number;
}

/**
 * Represents a file snapshot at a checkpoint
 */
export interface FileSnapshot {
  checkpointId: string;
  filePath: string;
  content: string;
  hash: string;
  isDeleted: boolean;
  permissions?: number;
  size: number;
}

/**
 * Represents a node in the timeline tree
 */
export interface TimelineNode {
  checkpoint: Checkpoint;
  children: TimelineNode[];
  fileSnapshotIds: string[];
}

/**
 * The complete timeline for a session
 */
export interface SessionTimeline {
  sessionId: string;
  rootNode?: TimelineNode;
  currentCheckpointId?: string;
  autoCheckpointEnabled: boolean;
  checkpointStrategy: CheckpointStrategy;
  totalCheckpoints: number;
}

/**
 * Strategy for automatic checkpoint creation
 */
export type CheckpointStrategy = 'manual' | 'per_prompt' | 'per_tool_use' | 'smart';

/**
 * Result of a checkpoint operation
 */
export interface CheckpointResult {
  checkpoint: Checkpoint;
  filesProcessed: number;
  warnings: string[];
}

/**
 * Diff between two checkpoints
 */
export interface CheckpointDiff {
  fromCheckpointId: string;
  toCheckpointId: string;
  modifiedFiles: FileDiff[];
  addedFiles: string[];
  deletedFiles: string[];
  tokenDelta: number;
}

/**
 * Diff for a single file
 */
export interface FileDiff {
  path: string;
  additions: number;
  deletions: number;
  diffContent?: string;
}

/**
 * Represents an MCP server configuration
 */
export interface MCPServer {
  /** Server name/identifier */
  name: string;
  /** Transport type: "stdio" or "sse" */
  transport: string;
  /** Command to execute (for stdio) */
  command?: string;
  /** Command arguments (for stdio) */
  args: string[];
  /** Environment variables */
  env: Record<string, string>;
  /** URL endpoint (for SSE) */
  url?: string;
  /** Configuration scope: "local", "project", or "user" */
  scope: string;
  /** Whether the server is currently active */
  is_active: boolean;
  /** Server status */
  status: ServerStatus;
}

/**
 * Server status information
 */
export interface ServerStatus {
  /** Whether the server is running */
  running: boolean;
  /** Last error message if any */
  error?: string;
  /** Last checked timestamp */
  last_checked?: number;
}

/**
 * MCP configuration for project scope (.mcp.json)
 */
export interface MCPProjectConfig {
  mcpServers: Record<string, MCPServerConfig>;
}

/**
 * Individual server configuration in .mcp.json
 */
export interface MCPServerConfig {
  command: string;
  args: string[];
  env: Record<string, string>;
}

/**
 * Result of adding a server
 */
export interface AddServerResult {
  success: boolean;
  message: string;
  server_name?: string;
}

/**
 * Import result for multiple servers
 */
export interface ImportResult {
  imported_count: number;
  failed_count: number;
  servers: ImportServerResult[];
}

/**
 * Result for individual server import
 */
export interface ImportServerResult {
  name: string;
  success: boolean;
  error?: string;
}

/**
 * API client for interacting with the Rust backend
 */
export const api = {
  /**
   * Lists all projects in the ~/.claude/projects directory
   * @returns Promise resolving to an array of projects
   */
  async listProjects(): Promise<Project[]> {
    try {
      return await invoke<Project[]>("list_projects");
    } catch (error) {
      console.error("Failed to list projects:", error);
      throw error;
    }
  },

  /**
   * Retrieves sessions for a specific project
   * @param projectId - The ID of the project to retrieve sessions for
   * @returns Promise resolving to an array of sessions
   */
  async getProjectSessions(projectId: string): Promise<Session[]> {
    try {
      return await invoke<Session[]>('get_project_sessions', { projectId });
    } catch (error) {
      console.error("Failed to get project sessions:", error);
      throw error;
    }
  },

  /**
   * Fetch list of agents from GitHub repository
   * @returns Promise resolving to list of available agents on GitHub
   */
  async fetchGitHubAgents(): Promise<GitHubAgentFile[]> {
    try {
      return await invoke<GitHubAgentFile[]>('fetch_github_agents');
    } catch (error) {
      console.error("Failed to fetch GitHub agents:", error);
      throw error;
    }
  },

  /**
   * Fetch and preview a specific agent from GitHub
   * @param downloadUrl - The download URL for the agent file
   * @returns Promise resolving to the agent export data
   */
  async fetchGitHubAgentContent(downloadUrl: string): Promise<AgentExport> {
    try {
      return await invoke<AgentExport>('fetch_github_agent_content', { downloadUrl });
    } catch (error) {
      console.error("Failed to fetch GitHub agent content:", error);
      throw error;
    }
  },

  /**
   * Import an agent directly from GitHub
   * @param downloadUrl - The download URL for the agent file
   * @returns Promise resolving to the imported agent
   */
  async importAgentFromGitHub(downloadUrl: string): Promise<Agent> {
    try {
      return await invoke<Agent>('import_agent_from_github', { downloadUrl });
    } catch (error) {
      console.error("Failed to import agent from GitHub:", error);
      throw error;
    }
  },

  /**
   * Reads the Claude settings file
   * @returns Promise resolving to the settings object
   */
  async getClaudeSettings(): Promise<ClaudeSettings> {
    try {
      const result = await invoke<{ data: ClaudeSettings }>("get_claude_settings");
      
      
      // The Rust backend returns ClaudeSettings { data: ... }
      // We need to extract the data field
      if (result && typeof result === 'object' && 'data' in result) {
        return result.data;
      }
      
      // If the result is already the settings object, return it
      return result as ClaudeSettings;
    } catch (error) {
      console.error("Failed to get Claude settings:", error);
      throw error;
    }
  },

  /**
   * Opens a new Claude Code session
   * @param path - Optional path to open the session in
   * @returns Promise resolving when the session is opened
   */
  async openNewSession(path?: string): Promise<string> {
    try {
      return await invoke<string>("open_new_session", { path });
    } catch (error) {
      console.error("Failed to open new session:", error);
      throw error;
    }
  },

  /**
   * Reads the CLAUDE.md system prompt file
   * @returns Promise resolving to the system prompt content
   */
  async getSystemPrompt(): Promise<string> {
    try {
      return await invoke<string>("get_system_prompt");
    } catch (error) {
      console.error("Failed to get system prompt:", error);
      throw error;
    }
  },

  /**
   * Checks if Claude Code is installed and gets its version
   * @returns Promise resolving to the version status
   */
  async checkClaudeVersion(): Promise<ClaudeVersionStatus> {
    try {
      return await invoke<ClaudeVersionStatus>("check_claude_version");
    } catch (error) {
      console.error("Failed to check Claude version:", error);
      throw error;
    }
  },

  /**
   * Saves the CLAUDE.md system prompt file
   * @param content - The new content for the system prompt
   * @returns Promise resolving when the file is saved
   */
  async saveSystemPrompt(content: string): Promise<string> {
    try {
      return await invoke<string>("save_system_prompt", { content });
    } catch (error) {
      console.error("Failed to save system prompt:", error);
      throw error;
    }
  },

  /**
   * Saves the Claude settings file
   * @param settings - The settings object to save
   * @returns Promise resolving when the settings are saved
   */
  async saveClaudeSettings(settings: ClaudeSettings): Promise<string> {
    try {
      return await invoke<string>("save_claude_settings", { settings });
    } catch (error) {
      console.error("Failed to save Claude settings:", error);
      throw error;
    }
  },

  /**
   * Finds all CLAUDE.md files in a project directory
   * @param projectPath - The absolute path to the project
   * @returns Promise resolving to an array of CLAUDE.md files
   */
  async findClaudeMdFiles(projectPath: string): Promise<ClaudeMdFile[]> {
    try {
      return await invoke<ClaudeMdFile[]>("find_claude_md_files", { projectPath });
    } catch (error) {
      console.error("Failed to find CLAUDE.md files:", error);
      throw error;
    }
  },

  /**
   * Reads a specific CLAUDE.md file
   * @param filePath - The absolute path to the file
   * @returns Promise resolving to the file content
   */
  async readClaudeMdFile(filePath: string): Promise<string> {
    try {
      return await invoke<string>("read_claude_md_file", { filePath });
    } catch (error) {
      console.error("Failed to read CLAUDE.md file:", error);
      throw error;
    }
  },

  /**
   * Saves a specific CLAUDE.md file
   * @param filePath - The absolute path to the file
   * @param content - The new content for the file
   * @returns Promise resolving when the file is saved
   */
  async saveClaudeMdFile(filePath: string, content: string): Promise<string> {
    try {
      return await invoke<string>("save_claude_md_file", { filePath, content });
    } catch (error) {
      console.error("Failed to save CLAUDE.md file:", error);
      throw error;
    }
  },

  // Agent API methods
  
  /**
   * Lists all CC agents
   * @returns Promise resolving to an array of agents
   */
  async listAgents(): Promise<Agent[]> {
    try {
      return await invoke<Agent[]>('list_agents');
    } catch (error) {
      console.error("Failed to list agents:", error);
      throw error;
    }
  },

  /**
   * Creates a new agent
   * @param name - The agent name
   * @param icon - The icon identifier
   * @param system_prompt - The system prompt for the agent
   * @param default_task - Optional default task
   * @param model - Optional model (defaults to 'sonnet')
   * @param sandbox_enabled - Optional sandbox enable flag
   * @param enable_file_read - Optional file read permission
   * @param enable_file_write - Optional file write permission
   * @param enable_network - Optional network permission
   * @returns Promise resolving to the created agent
   */
  async createAgent(
    name: string, 
    icon: string, 
    system_prompt: string, 
    default_task?: string, 
    model?: string, 
    sandbox_enabled?: boolean,
    enable_file_read?: boolean,
    enable_file_write?: boolean,
    enable_network?: boolean
  ): Promise<Agent> {
    try {
      return await invoke<Agent>('create_agent', { 
        name, 
        icon, 
        systemPrompt: system_prompt,
        defaultTask: default_task,
        model,
        sandboxEnabled: sandbox_enabled,
        enableFileRead: enable_file_read,
        enableFileWrite: enable_file_write,
        enableNetwork: enable_network
      });
    } catch (error) {
      console.error("Failed to create agent:", error);
      throw error;
    }
  },

  /**
   * Updates an existing agent
   * @param id - The agent ID
   * @param name - The updated name
   * @param icon - The updated icon
   * @param system_prompt - The updated system prompt
   * @param default_task - Optional default task
   * @param model - Optional model
   * @param sandbox_enabled - Optional sandbox enable flag
   * @param enable_file_read - Optional file read permission
   * @param enable_file_write - Optional file write permission
   * @param enable_network - Optional network permission
   * @returns Promise resolving to the updated agent
   */
  async updateAgent(
    id: number, 
    name: string, 
    icon: string, 
    system_prompt: string, 
    default_task?: string, 
    model?: string, 
    sandbox_enabled?: boolean,
    enable_file_read?: boolean,
    enable_file_write?: boolean,
    enable_network?: boolean
  ): Promise<Agent> {
    try {
      return await invoke<Agent>('update_agent', { 
        id, 
        name, 
        icon, 
        systemPrompt: system_prompt,
        defaultTask: default_task,
        model,
        sandboxEnabled: sandbox_enabled,
        enableFileRead: enable_file_read,
        enableFileWrite: enable_file_write,
        enableNetwork: enable_network
      });
    } catch (error) {
      console.error("Failed to update agent:", error);
      throw error;
    }
  },

  /**
   * Deletes an agent
   * @param id - The agent ID to delete
   * @returns Promise resolving when the agent is deleted
   */
  async deleteAgent(id: number): Promise<void> {
    try {
      return await invoke('delete_agent', { id });
    } catch (error) {
      console.error("Failed to delete agent:", error);
      throw error;
    }
  },

  /**
   * Gets a single agent by ID
   * @param id - The agent ID
   * @returns Promise resolving to the agent
   */
  async getAgent(id: number): Promise<Agent> {
    try {
      return await invoke<Agent>('get_agent', { id });
    } catch (error) {
      console.error("Failed to get agent:", error);
      throw error;
    }
  },

  /**
   * Exports a single agent to JSON format
   * @param id - The agent ID to export
   * @returns Promise resolving to the JSON string
   */
  async exportAgent(id: number): Promise<string> {
    try {
      return await invoke<string>('export_agent', { id });
    } catch (error) {
      console.error("Failed to export agent:", error);
      throw error;
    }
  },

  /**
   * Imports an agent from JSON data
   * @param jsonData - The JSON string containing the agent export
   * @returns Promise resolving to the imported agent
   */
  async importAgent(jsonData: string): Promise<Agent> {
    try {
      return await invoke<Agent>('import_agent', { jsonData });
    } catch (error) {
      console.error("Failed to import agent:", error);
      throw error;
    }
  },

  /**
   * Imports an agent from a file
   * @param filePath - The path to the JSON file
   * @returns Promise resolving to the imported agent
   */
  async importAgentFromFile(filePath: string): Promise<Agent> {
    try {
      return await invoke<Agent>('import_agent_from_file', { filePath });
    } catch (error) {
      console.error("Failed to import agent from file:", error);
      throw error;
    }
  },

  /**
   * Executes an agent
   * @param agentId - The agent ID to execute
   * @param projectPath - The project path to run the agent in
   * @param task - The task description
   * @param model - Optional model override
   * @returns Promise resolving to the run ID when execution starts
   */
  async executeAgent(agentId: number, projectPath: string, task: string, model?: string): Promise<number> {
    try {
      return await invoke<number>('execute_agent', { agentId, projectPath, task, model });
    } catch (error) {
      console.error("Failed to execute agent:", error);
      // Return a sentinel value to indicate error
      throw new Error(`Failed to execute agent: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  /**
   * Continues agent execution with a new prompt in the same session
   * @param agentId - The agent ID to continue
   * @param projectPath - The project path
   * @param sessionId - The session ID to continue
   * @param prompt - The continuation prompt
   * @param model - Optional model override
   * @returns Promise resolving to the run ID when continuation starts
   */
  async continueAgentExecution(
    agentId: number, 
    projectPath: string, 
    sessionId: string, 
    prompt: string, 
    model?: string
  ): Promise<number> {
    try {
      return await invoke<number>('continue_agent_execution', { 
        agentId, 
        projectPath, 
        sessionId, 
        prompt, 
        model 
      });
    } catch (error) {
      console.error("Failed to continue agent execution:", error);
      throw new Error(`Failed to continue agent execution: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  /**
   * Executes an agent with auto-continuation capability
   * @param agentId - The agent ID to execute
   * @param projectPath - The project path to run the agent in
   * @param task - The task description
   * @param autoContinue - Whether to enable auto-continuation
   * @param maxIterations - Maximum number of iterations
   * @param continuationStrategy - Strategy for continuation prompts
   * @param model - Optional model override
   * @returns Promise resolving to array of run IDs for all iterations
   */
  async executeAgentWithContinuation(
    agentId: number,
    projectPath: string,
    task: string,
    autoContinue: boolean,
    maxIterations?: number,
    continuationStrategy?: string,
    model?: string
  ): Promise<number[]> {
    try {
      return await invoke<number[]>('execute_agent_with_continuation', {
        agentId,
        projectPath,
        task,
        autoContinue,
        maxIterations,
        continuationStrategy,
        model
      });
    } catch (error) {
      console.error("Failed to execute agent with continuation:", error);
      throw new Error(`Failed to execute agent with continuation: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  /**
   * Lists agent runs with metrics
   * @param agentId - Optional agent ID to filter runs
   * @returns Promise resolving to an array of agent runs with metrics
   */
  async listAgentRuns(agentId?: number): Promise<AgentRunWithMetrics[]> {
    try {
      return await invoke<AgentRunWithMetrics[]>('list_agent_runs', { agentId });
    } catch (error) {
      console.error("Failed to list agent runs:", error);
      // Return empty array instead of throwing to prevent UI crashes
      return [];
    }
  },

  /**
   * Gets a single agent run by ID with metrics
   * @param id - The run ID
   * @returns Promise resolving to the agent run with metrics
   */
  async getAgentRun(id: number): Promise<AgentRunWithMetrics> {
    try {
      return await invoke<AgentRunWithMetrics>('get_agent_run', { id });
    } catch (error) {
      console.error("Failed to get agent run:", error);
      throw new Error(`Failed to get agent run: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  /**
   * Gets a single agent run by ID with real-time metrics from JSONL
   * @param id - The run ID
   * @returns Promise resolving to the agent run with metrics
   */
  async getAgentRunWithRealTimeMetrics(id: number): Promise<AgentRunWithMetrics> {
    try {
      return await invoke<AgentRunWithMetrics>('get_agent_run_with_real_time_metrics', { id });
    } catch (error) {
      console.error("Failed to get agent run with real-time metrics:", error);
      throw new Error(`Failed to get agent run with real-time metrics: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  /**
   * Lists all currently running agent sessions
   * @returns Promise resolving to list of running agent sessions
   */
  async listRunningAgentSessions(): Promise<AgentRun[]> {
    try {
      return await invoke<AgentRun[]>('list_running_sessions');
    } catch (error) {
      console.error("Failed to list running agent sessions:", error);
      throw new Error(`Failed to list running agent sessions: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  /**
   * Kills a running agent session
   * @param runId - The run ID to kill
   * @returns Promise resolving to whether the session was successfully killed
   */
  async killAgentSession(runId: number): Promise<boolean> {
    try {
      return await invoke<boolean>('kill_agent_session', { runId });
    } catch (error) {
      console.error("Failed to kill agent session:", error);
      throw new Error(`Failed to kill agent session: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  /**
   * Gets the status of a specific agent session
   * @param runId - The run ID to check
   * @returns Promise resolving to the session status or null if not found
   */
  async getSessionStatus(runId: number): Promise<string | null> {
    try {
      return await invoke<string | null>('get_session_status', { runId });
    } catch (error) {
      console.error("Failed to get session status:", error);
      throw new Error(`Failed to get session status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  /**
   * Cleanup finished processes and update their status
   * @returns Promise resolving to list of run IDs that were cleaned up
   */
  async cleanupFinishedProcesses(): Promise<number[]> {
    try {
      return await invoke<number[]>('cleanup_finished_processes');
    } catch (error) {
      console.error("Failed to cleanup finished processes:", error);
      throw new Error(`Failed to cleanup finished processes: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  /**
   * Get real-time output for a running session (with live output fallback)
   * @param runId - The run ID to get output for
   * @returns Promise resolving to the current session output (JSONL format)
   */
  async getSessionOutput(runId: number): Promise<string> {
    try {
      return await invoke<string>('get_session_output', { runId });
    } catch (error) {
      console.error("Failed to get session output:", error);
      throw new Error(`Failed to get session output: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  /**
   * Get live output directly from process stdout buffer
   * @param runId - The run ID to get live output for
   * @returns Promise resolving to the current live output
   */
  async getLiveSessionOutput(runId: number): Promise<string> {
    try {
      return await invoke<string>('get_live_session_output', { runId });
    } catch (error) {
      console.error("Failed to get live session output:", error);
      throw new Error(`Failed to get live session output: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  /**
   * Start streaming real-time output for a running session
   * @param runId - The run ID to stream output for
   * @returns Promise that resolves when streaming starts
   */
  async streamSessionOutput(runId: number): Promise<void> {
    try {
      return await invoke<void>('stream_session_output', { runId });
    } catch (error) {
      console.error("Failed to start streaming session output:", error);
      throw new Error(`Failed to start streaming session output: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  /**
   * Loads the JSONL history for a specific session
   */
  async loadSessionHistory(sessionId: string, projectId: string): Promise<any[]> {
    return invoke("load_session_history", { sessionId, projectId });
  },

  /**
   * Executes a new interactive Claude Code session with streaming output
   */
  async executeClaudeCode(projectPath: string, prompt: string, model: string): Promise<void> {
    return invoke("execute_claude_code", { projectPath, prompt, model });
  },

  /**
   * Continues an existing Claude Code conversation with streaming output
   */
  async continueClaudeCode(projectPath: string, prompt: string, model: string): Promise<void> {
    return invoke("continue_claude_code", { projectPath, prompt, model });
  },

  /**
   * Resumes an existing Claude Code session by ID with streaming output
   */
  async resumeClaudeCode(projectPath: string, sessionId: string, prompt: string, model: string): Promise<void> {
    return invoke("resume_claude_code", { projectPath, sessionId, prompt, model });
  },

  /**
   * Cancels the currently running Claude Code execution
   * @param sessionId - Optional session ID to cancel a specific session
   */
  async cancelClaudeExecution(sessionId?: string): Promise<void> {
    return invoke("cancel_claude_execution", { sessionId });
  },

  /**
   * Lists files and directories in a given path
   */
  async listDirectoryContents(directoryPath: string): Promise<FileEntry[]> {
    return invoke("list_directory_contents", { directoryPath });
  },

  /**
   * Searches for files and directories matching a pattern
   */
  async searchFiles(basePath: string, query: string): Promise<FileEntry[]> {
    return invoke("search_files", { basePath, query });
  },

  // Sandbox API methods

  /**
   * Lists all sandbox profiles
   * @returns Promise resolving to an array of sandbox profiles
   */
  async listSandboxProfiles(): Promise<SandboxProfile[]> {
    try {
      return await invoke<SandboxProfile[]>('list_sandbox_profiles');
    } catch (error) {
      console.error("Failed to list sandbox profiles:", error);
      throw error;
    }
  },

  /**
   * Creates a new sandbox profile
   * @param name - The profile name
   * @param description - Optional description
   * @returns Promise resolving to the created profile
   */
  async createSandboxProfile(name: string, description?: string): Promise<SandboxProfile> {
    try {
      return await invoke<SandboxProfile>('create_sandbox_profile', { name, description });
    } catch (error) {
      console.error("Failed to create sandbox profile:", error);
      throw error;
    }
  },

  /**
   * Updates a sandbox profile
   * @param id - The profile ID
   * @param name - The updated name
   * @param description - Optional description
   * @param is_active - Whether the profile is active
   * @param is_default - Whether the profile is the default
   * @returns Promise resolving to the updated profile
   */
  async updateSandboxProfile(
    id: number, 
    name: string, 
    description: string | undefined, 
    is_active: boolean, 
    is_default: boolean
  ): Promise<SandboxProfile> {
    try {
      return await invoke<SandboxProfile>('update_sandbox_profile', { 
        id, 
        name, 
        description, 
        is_active, 
        is_default 
      });
    } catch (error) {
      console.error("Failed to update sandbox profile:", error);
      throw error;
    }
  },

  /**
   * Deletes a sandbox profile
   * @param id - The profile ID to delete
   * @returns Promise resolving when the profile is deleted
   */
  async deleteSandboxProfile(id: number): Promise<void> {
    try {
      return await invoke('delete_sandbox_profile', { id });
    } catch (error) {
      console.error("Failed to delete sandbox profile:", error);
      throw error;
    }
  },

  /**
   * Gets a single sandbox profile by ID
   * @param id - The profile ID
   * @returns Promise resolving to the profile
   */
  async getSandboxProfile(id: number): Promise<SandboxProfile> {
    try {
      return await invoke<SandboxProfile>('get_sandbox_profile', { id });
    } catch (error) {
      console.error("Failed to get sandbox profile:", error);
      throw error;
    }
  },

  /**
   * Lists rules for a sandbox profile
   * @param profileId - The profile ID
   * @returns Promise resolving to an array of rules
   */
  async listSandboxRules(profileId: number): Promise<SandboxRule[]> {
    try {
      return await invoke<SandboxRule[]>('list_sandbox_rules', { profile_id: profileId });
    } catch (error) {
      console.error("Failed to list sandbox rules:", error);
      throw error;
    }
  },

  /**
   * Creates a new sandbox rule
   * @param profileId - The profile ID
   * @param operation_type - The operation type
   * @param pattern_type - The pattern type
   * @param pattern_value - The pattern value
   * @param enabled - Whether the rule is enabled
   * @param platform_support - Optional platform support JSON
   * @returns Promise resolving to the created rule
   */
  async createSandboxRule(
    profileId: number,
    operation_type: string,
    pattern_type: string,
    pattern_value: string,
    enabled: boolean,
    platform_support?: string
  ): Promise<SandboxRule> {
    try {
      return await invoke<SandboxRule>('create_sandbox_rule', { 
        profile_id: profileId,
        operation_type,
        pattern_type,
        pattern_value,
        enabled,
        platform_support
      });
    } catch (error) {
      console.error("Failed to create sandbox rule:", error);
      throw error;
    }
  },

  /**
   * Updates a sandbox rule
   * @param id - The rule ID
   * @param operation_type - The operation type
   * @param pattern_type - The pattern type
   * @param pattern_value - The pattern value
   * @param enabled - Whether the rule is enabled
   * @param platform_support - Optional platform support JSON
   * @returns Promise resolving to the updated rule
   */
  async updateSandboxRule(
    id: number,
    operation_type: string,
    pattern_type: string,
    pattern_value: string,
    enabled: boolean,
    platform_support?: string
  ): Promise<SandboxRule> {
    try {
      return await invoke<SandboxRule>('update_sandbox_rule', { 
        id,
        operation_type,
        pattern_type,
        pattern_value,
        enabled,
        platform_support
      });
    } catch (error) {
      console.error("Failed to update sandbox rule:", error);
      throw error;
    }
  },

  /**
   * Deletes a sandbox rule
   * @param id - The rule ID to delete
   * @returns Promise resolving when the rule is deleted
   */
  async deleteSandboxRule(id: number): Promise<void> {
    try {
      return await invoke('delete_sandbox_rule', { id });
    } catch (error) {
      console.error("Failed to delete sandbox rule:", error);
      throw error;
    }
  },

  /**
   * Gets platform capabilities for sandbox configuration
   * @returns Promise resolving to platform capabilities
   */
  async getPlatformCapabilities(): Promise<PlatformCapabilities> {
    try {
      return await invoke<PlatformCapabilities>('get_platform_capabilities');
    } catch (error) {
      console.error("Failed to get platform capabilities:", error);
      throw error;
    }
  },

  /**
   * Tests a sandbox profile
   * @param profileId - The profile ID to test
   * @returns Promise resolving to test result message
   */
  async testSandboxProfile(profileId: number): Promise<string> {
    try {
      return await invoke<string>('test_sandbox_profile', { profile_id: profileId });
    } catch (error) {
      console.error("Failed to test sandbox profile:", error);
      throw error;
    }
  },

  // Sandbox violation methods

  /**
   * Lists sandbox violations with optional filtering
   * @param profileId - Optional profile ID to filter by
   * @param agentId - Optional agent ID to filter by
   * @param limit - Optional limit on number of results
   * @returns Promise resolving to array of violations
   */
  async listSandboxViolations(profileId?: number, agentId?: number, limit?: number): Promise<SandboxViolation[]> {
    try {
      return await invoke<SandboxViolation[]>('list_sandbox_violations', { 
        profile_id: profileId, 
        agent_id: agentId, 
        limit 
      });
    } catch (error) {
      console.error("Failed to list sandbox violations:", error);
      throw error;
    }
  },

  /**
   * Logs a sandbox violation
   * @param violation - The violation details
   * @returns Promise resolving when logged
   */
  async logSandboxViolation(violation: {
    profileId?: number;
    agentId?: number;
    agentRunId?: number;
    operationType: string;
    patternValue?: string;
    processName?: string;
    pid?: number;
  }): Promise<void> {
    try {
      return await invoke('log_sandbox_violation', {
        profile_id: violation.profileId,
        agent_id: violation.agentId,
        agent_run_id: violation.agentRunId,
        operation_type: violation.operationType,
        pattern_value: violation.patternValue,
        process_name: violation.processName,
        pid: violation.pid
      });
    } catch (error) {
      console.error("Failed to log sandbox violation:", error);
      throw error;
    }
  },

  /**
   * Clears old sandbox violations
   * @param olderThanDays - Optional days to keep (clears all if not specified)
   * @returns Promise resolving to number of deleted violations
   */
  async clearSandboxViolations(olderThanDays?: number): Promise<number> {
    try {
      return await invoke<number>('clear_sandbox_violations', { older_than_days: olderThanDays });
    } catch (error) {
      console.error("Failed to clear sandbox violations:", error);
      throw error;
    }
  },

  /**
   * Gets sandbox violation statistics
   * @returns Promise resolving to violation stats
   */
  async getSandboxViolationStats(): Promise<SandboxViolationStats> {
    try {
      return await invoke<SandboxViolationStats>('get_sandbox_violation_stats');
    } catch (error) {
      console.error("Failed to get sandbox violation stats:", error);
      throw error;
    }
  },

  // Import/Export methods

  /**
   * Exports a single sandbox profile with its rules
   * @param profileId - The profile ID to export
   * @returns Promise resolving to export data
   */
  async exportSandboxProfile(profileId: number): Promise<SandboxProfileExport> {
    try {
      return await invoke<SandboxProfileExport>('export_sandbox_profile', { profile_id: profileId });
    } catch (error) {
      console.error("Failed to export sandbox profile:", error);
      throw error;
    }
  },

  /**
   * Exports all sandbox profiles
   * @returns Promise resolving to export data
   */
  async exportAllSandboxProfiles(): Promise<SandboxProfileExport> {
    try {
      return await invoke<SandboxProfileExport>('export_all_sandbox_profiles');
    } catch (error) {
      console.error("Failed to export all sandbox profiles:", error);
      throw error;
    }
  },

  /**
   * Imports sandbox profiles from export data
   * @param exportData - The export data to import
   * @returns Promise resolving to import results
   */
  async importSandboxProfiles(exportData: SandboxProfileExport): Promise<ImportResult[]> {
    try {
      return await invoke<ImportResult[]>('import_sandbox_profiles', { export_data: exportData });
    } catch (error) {
      console.error("Failed to import sandbox profiles:", error);
      throw error;
    }
  },

  /**
   * Gets overall usage statistics
   * @returns Promise resolving to usage statistics
   */
  async getUsageStats(): Promise<UsageStats> {
    try {
      return await invoke<UsageStats>("get_usage_stats");
    } catch (error) {
      console.error("Failed to get usage stats:", error);
      throw error;
    }
  },

  /**
   * Gets usage statistics filtered by date range
   * @param startDate - Start date (ISO format)
   * @param endDate - End date (ISO format)
   * @returns Promise resolving to usage statistics
   */
  async getUsageByDateRange(startDate: string, endDate: string): Promise<UsageStats> {
    try {
      return await invoke<UsageStats>("get_usage_by_date_range", { startDate, endDate });
    } catch (error) {
      console.error("Failed to get usage by date range:", error);
      throw error;
    }
  },

  /**
   * Gets usage statistics grouped by session
   * @param since - Optional start date (YYYYMMDD)
   * @param until - Optional end date (YYYYMMDD)
   * @param order - Optional sort order ('asc' or 'desc')
   * @returns Promise resolving to an array of session usage data
   */
  async getSessionStats(
    since?: string,
    until?: string,
    order?: "asc" | "desc"
  ): Promise<ProjectUsage[]> {
    try {
      return await invoke<ProjectUsage[]>("get_session_stats", {
        since,
        until,
        order,
      });
    } catch (error) {
      console.error("Failed to get session stats:", error);
      throw error;
    }
  },

  /**
   * Gets detailed usage entries with optional filtering
   * @param limit - Optional limit for number of entries
   * @returns Promise resolving to array of usage entries
   */
  async getUsageDetails(limit?: number): Promise<UsageEntry[]> {
    try {
      return await invoke<UsageEntry[]>("get_usage_details", { limit });
    } catch (error) {
      console.error("Failed to get usage details:", error);
      throw error;
    }
  },

  /**
   * Creates a checkpoint for the current session state
   */
  async createCheckpoint(
    sessionId: string,
    projectId: string,
    projectPath: string,
    messageIndex?: number,
    description?: string
  ): Promise<CheckpointResult> {
    return invoke("create_checkpoint", {
      sessionId,
      projectId,
      projectPath,
      messageIndex,
      description
    });
  },

  /**
   * Restores a session to a specific checkpoint
   */
  async restoreCheckpoint(
    checkpointId: string,
    sessionId: string,
    projectId: string,
    projectPath: string
  ): Promise<CheckpointResult> {
    return invoke("restore_checkpoint", {
      checkpointId,
      sessionId,
      projectId,
      projectPath
    });
  },

  /**
   * Lists all checkpoints for a session
   */
  async listCheckpoints(
    sessionId: string,
    projectId: string,
    projectPath: string
  ): Promise<Checkpoint[]> {
    return invoke("list_checkpoints", {
      sessionId,
      projectId,
      projectPath
    });
  },

  /**
   * Forks a new timeline branch from a checkpoint
   */
  async forkFromCheckpoint(
    checkpointId: string,
    sessionId: string,
    projectId: string,
    projectPath: string,
    newSessionId: string,
    description?: string
  ): Promise<CheckpointResult> {
    return invoke("fork_from_checkpoint", {
      checkpointId,
      sessionId,
      projectId,
      projectPath,
      newSessionId,
      description
    });
  },

  /**
   * Gets the timeline for a session
   */
  async getSessionTimeline(
    sessionId: string,
    projectId: string,
    projectPath: string
  ): Promise<SessionTimeline> {
    return invoke("get_session_timeline", {
      sessionId,
      projectId,
      projectPath
    });
  },

  /**
   * Updates checkpoint settings for a session
   */
  async updateCheckpointSettings(
    sessionId: string,
    projectId: string,
    projectPath: string,
    autoCheckpointEnabled: boolean,
    checkpointStrategy: CheckpointStrategy
  ): Promise<void> {
    return invoke("update_checkpoint_settings", {
      sessionId,
      projectId,
      projectPath,
      autoCheckpointEnabled,
      checkpointStrategy
    });
  },

  /**
   * Gets diff between two checkpoints
   */
  async getCheckpointDiff(
    fromCheckpointId: string,
    toCheckpointId: string,
    sessionId: string,
    projectId: string
  ): Promise<CheckpointDiff> {
    try {
      return await invoke<CheckpointDiff>("get_checkpoint_diff", {
        fromCheckpointId,
        toCheckpointId,
        sessionId,
        projectId
      });
    } catch (error) {
      console.error("Failed to get checkpoint diff:", error);
      throw error;
    }
  },

  /**
   * Tracks a message for checkpointing
   */
  async trackCheckpointMessage(
    sessionId: string,
    projectId: string,
    projectPath: string,
    message: string
  ): Promise<void> {
    try {
      await invoke("track_checkpoint_message", {
        sessionId,
        projectId,
        projectPath,
        message
      });
    } catch (error) {
      console.error("Failed to track checkpoint message:", error);
      throw error;
    }
  },

  /**
   * Checks if auto-checkpoint should be triggered
   */
  async checkAutoCheckpoint(
    sessionId: string,
    projectId: string,
    projectPath: string,
    message: string
  ): Promise<boolean> {
    try {
      return await invoke<boolean>("check_auto_checkpoint", {
        sessionId,
        projectId,
        projectPath,
        message
      });
    } catch (error) {
      console.error("Failed to check auto checkpoint:", error);
      throw error;
    }
  },

  /**
   * Triggers cleanup of old checkpoints
   */
  async cleanupOldCheckpoints(
    sessionId: string,
    projectId: string,
    projectPath: string,
    keepCount: number
  ): Promise<number> {
    try {
      return await invoke<number>("cleanup_old_checkpoints", {
        sessionId,
        projectId,
        projectPath,
        keepCount
      });
    } catch (error) {
      console.error("Failed to cleanup old checkpoints:", error);
      throw error;
    }
  },

  /**
   * Gets checkpoint settings for a session
   */
  async getCheckpointSettings(
    sessionId: string,
    projectId: string,
    projectPath: string
  ): Promise<{
    auto_checkpoint_enabled: boolean;
    checkpoint_strategy: CheckpointStrategy;
    total_checkpoints: number;
    current_checkpoint_id?: string;
  }> {
    try {
      return await invoke("get_checkpoint_settings", {
        sessionId,
        projectId,
        projectPath
      });
    } catch (error) {
      console.error("Failed to get checkpoint settings:", error);
      throw error;
    }
  },

  /**
   * Clears checkpoint manager for a session (cleanup on session end)
   */
  async clearCheckpointManager(sessionId: string): Promise<void> {
    try {
      await invoke("clear_checkpoint_manager", { sessionId });
    } catch (error) {
      console.error("Failed to clear checkpoint manager:", error);
      throw error;
    }
  },

  /**
   * Tracks a batch of messages for a session for checkpointing
   */
  trackSessionMessages: (
    sessionId: string, 
    projectId: string, 
    projectPath: string, 
    messages: string[]
  ): Promise<void> =>
    invoke("track_session_messages", { sessionId, projectId, projectPath, messages }),

  /**
   * Adds a new MCP server
   */
  async mcpAdd(
    name: string,
    transport: string,
    command?: string,
    args: string[] = [],
    env: Record<string, string> = {},
    url?: string,
    scope: string = "local"
  ): Promise<AddServerResult> {
    try {
      return await invoke<AddServerResult>("mcp_add", {
        name,
        transport,
        command,
        args,
        env,
        url,
        scope
      });
    } catch (error) {
      console.error("Failed to add MCP server:", error);
      throw error;
    }
  },

  /**
   * Lists all configured MCP servers
   */
  async mcpList(): Promise<MCPServer[]> {
    try {
      
      const result = await invoke<MCPServer[]>("mcp_list");
      
      return result;
    } catch (error) {
      console.error("API: Failed to list MCP servers:", error);
      throw error;
    }
  },

  /**
   * Gets details for a specific MCP server
   */
  async mcpGet(name: string): Promise<MCPServer> {
    try {
      return await invoke<MCPServer>("mcp_get", { name });
    } catch (error) {
      console.error("Failed to get MCP server:", error);
      throw error;
    }
  },

  /**
   * Removes an MCP server
   */
  async mcpRemove(name: string): Promise<string> {
    try {
      return await invoke<string>("mcp_remove", { name });
    } catch (error) {
      console.error("Failed to remove MCP server:", error);
      throw error;
    }
  },

  /**
   * Adds an MCP server from JSON configuration
   */
  async mcpAddJson(name: string, jsonConfig: string, scope: string = "local"): Promise<AddServerResult> {
    try {
      return await invoke<AddServerResult>("mcp_add_json", { name, jsonConfig, scope });
    } catch (error) {
      console.error("Failed to add MCP server from JSON:", error);
      throw error;
    }
  },

  /**
   * Imports MCP servers from Claude Desktop
   */
  async mcpAddFromClaudeDesktop(scope: string = "local"): Promise<ImportResult> {
    try {
      return await invoke<ImportResult>("mcp_add_from_claude_desktop", { scope });
    } catch (error) {
      console.error("Failed to import from Claude Desktop:", error);
      throw error;
    }
  },

  /**
   * Starts Claude Code as an MCP server
   */
  async mcpServe(): Promise<string> {
    try {
      return await invoke<string>("mcp_serve");
    } catch (error) {
      console.error("Failed to start MCP server:", error);
      throw error;
    }
  },

  /**
   * Tests connection to an MCP server
   */
  async mcpTestConnection(name: string): Promise<string> {
    try {
      return await invoke<string>("mcp_test_connection", { name });
    } catch (error) {
      console.error("Failed to test MCP connection:", error);
      throw error;
    }
  },

  /**
   * Resets project-scoped server approval choices
   */
  async mcpResetProjectChoices(): Promise<string> {
    try {
      return await invoke<string>("mcp_reset_project_choices");
    } catch (error) {
      console.error("Failed to reset project choices:", error);
      throw error;
    }
  },

  /**
   * Gets the status of MCP servers
   */
  async mcpGetServerStatus(): Promise<Record<string, ServerStatus>> {
    try {
      return await invoke<Record<string, ServerStatus>>("mcp_get_server_status");
    } catch (error) {
      console.error("Failed to get server status:", error);
      throw error;
    }
  },

  /**
   * Reads .mcp.json from the current project
   */
  async mcpReadProjectConfig(projectPath: string): Promise<MCPProjectConfig> {
    try {
      return await invoke<MCPProjectConfig>("mcp_read_project_config", { projectPath });
    } catch (error) {
      console.error("Failed to read project MCP config:", error);
      throw error;
    }
  },

  /**
   * Saves .mcp.json to the current project
   */
  async mcpSaveProjectConfig(projectPath: string, config: MCPProjectConfig): Promise<string> {
    try {
      return await invoke<string>("mcp_save_project_config", { projectPath, config });
    } catch (error) {
      console.error("Failed to save project MCP config:", error);
      throw error;
    }
  },

  /**
   * Get the stored Claude binary path from settings
   * @returns Promise resolving to the path if set, null otherwise
   */
  async getClaudeBinaryPath(): Promise<string | null> {
    try {
      return await invoke<string | null>("get_claude_binary_path");
    } catch (error) {
      console.error("Failed to get Claude binary path:", error);
      throw error;
    }
  },

  /**
   * Set the Claude binary path in settings
   * @param path - The absolute path to the Claude binary
   * @returns Promise resolving when the path is saved
   */
  async setClaudeBinaryPath(path: string): Promise<void> {
    try {
      return await invoke<void>("set_claude_binary_path", { path });
    } catch (error) {
      console.error("Failed to set Claude binary path:", error);
      throw error;
    }
  },

  /**
   * Captures a screenshot of a specific region in the window
   * @param url - The URL to capture
   * @param selector - Optional selector to capture
   * @param fullPage - Whether to capture the full page
   * @returns Promise resolving to the path of the saved screenshot
   */
  async captureUrlScreenshot(
    url: string,
    selector?: string | null,
    fullPage: boolean = false
  ): Promise<string> {
    return await invoke<string>("capture_url_screenshot", {
      url,
      selector,
      fullPage,
    });
  },

  /**
   * Cleans up old screenshot files from the temporary directory
   * @param olderThanMinutes - Remove files older than this many minutes (default: 60)
   * @returns Promise resolving to the number of files deleted
   */
  async cleanupScreenshotTempFiles(olderThanMinutes?: number): Promise<number> {
    try {
      return await invoke<number>("cleanup_screenshot_temp_files", { olderThanMinutes });
    } catch (error) {
      console.error("Failed to cleanup screenshot files:", error);
      throw error;
    }
  },

  /**
   * List all available Claude installations on the system
   * @returns Promise resolving to an array of Claude installations
   */
  async listClaudeInstallations(): Promise<ClaudeInstallation[]> {
    try {
      return await invoke<ClaudeInstallation[]>("list_claude_installations");
    } catch (error) {
      console.error("Failed to list Claude installations:", error);
      throw error;
    }
  },

  // Hooks Configuration API

  /**
   * Gets the hooks configuration
   * @param projectPath - Project path for hooks
   * @param scope - Scope for hooks
   * @returns Promise resolving to the hooks configuration
   */
  async getHooksConfig(projectPath?: string, scope?: string): Promise<any> {
    try {
      return await invoke<any>("get_hooks_config", { projectPath, scope });
    } catch (error) {
      console.error("Failed to get hooks config:", error);
      throw error;
    }
  },

  /**
   * Updates the hooks configuration
   * @param scope - Scope for hooks
   * @param config - The new hooks configuration
   * @param projectPath - Project path for hooks
   * @returns Promise resolving when the config is updated
   */
  async updateHooksConfig(scope: string, config: any, projectPath?: string): Promise<void> {
    try {
      return await invoke<void>("update_hooks_config", { scope, config, projectPath });
    } catch (error) {
      console.error("Failed to update hooks config:", error);
      throw error;
    }
  },

  // Slash Commands API

  /**
   * Lists all slash commands
   * @param projectPath - Optional project path to filter commands
   * @returns Promise resolving to an array of slash commands
   */
  async slashCommandsList(projectPath?: string): Promise<SlashCommand[]> {
    try {
      return await invoke<SlashCommand[]>("slash_commands_list", { projectPath });
    } catch (error) {
      console.error("Failed to list slash commands:", error);
      throw error;
    }
  },

  /**
   * Saves a slash command
   * @param scope - Command scope
   * @param name - Command name
   * @param namespace - Command namespace
   * @param content - Command content
   * @param description - Command description 
   * @param allowedTools - Allowed tools
   * @param projectPath - Project path
   * @returns Promise resolving when the command is saved
   */
  async slashCommandSave(
    scope: string,
    name: string,
    namespace: string | undefined,
    content: string,
    description: string | undefined,
    allowedTools: string[],
    projectPath?: string
  ): Promise<void> {
    try {
      return await invoke<void>("slash_command_save", {
        scope,
        name,
        namespace,
        content,
        description,
        allowedTools,
        projectPath
      });
    } catch (error) {
      console.error("Failed to save slash command:", error);
      throw error;
    }
  },

  /**
   * Deletes a slash command
   * @param id - The ID of the command to delete
   * @returns Promise resolving when the command is deleted
   */
  async slashCommandDelete(id: string): Promise<void> {
    try {
      return await invoke<void>("slash_command_delete", { id });
    } catch (error) {
      console.error("Failed to delete slash command:", error);
      throw error;
    }
  },

  // Storage API

  /**
   * Lists all tables in storage
   * @returns Promise resolving to an array of table info
   */
  async storageListTables(): Promise<any[]> {
    try {
      return await invoke<any[]>("storage_list_tables");
    } catch (error) {
      console.error("Failed to list storage tables:", error);
      throw error;
    }
  },

  /**
   * Reads data from a storage table
   * @param tableName - The name of the table to read
   * @param page - Page number
   * @param pageSize - Page size
   * @param searchQuery - Optional search query
   * @returns Promise resolving to the table data
   */
  async storageReadTable(
    tableName: string,
    page?: number,
    pageSize?: number,
    searchQuery?: string
  ): Promise<any> {
    try {
      return await invoke<any>("storage_read_table", {
        tableName,
        page,
        pageSize,
        searchQuery
      });
    } catch (error) {
      console.error("Failed to read storage table:", error);
      throw error;
    }
  },

  /**
   * Updates a row in a storage table
   * @param tableName - The name of the table
   * @param pkValues - Primary key values to identify the row
   * @param data - The new data for the row
   * @returns Promise resolving when the row is updated
   */
  async storageUpdateRow(tableName: string, pkValues: Record<string, any>, data: Record<string, any>): Promise<void> {
    try {
      return await invoke<void>("storage_update_row", { tableName, pkValues, data });
    } catch (error) {
      console.error("Failed to update storage row:", error);
      throw error;
    }
  },

  /**
   * Deletes a row from a storage table
   * @param tableName - The name of the table
   * @param data - The data for the row (includes ID)
   * @returns Promise resolving when the row is deleted
   */
  async storageDeleteRow(tableName: string, data: Record<string, any>): Promise<void> {
    try {
      return await invoke<void>("storage_delete_row", { tableName, data });
    } catch (error) {
      console.error("Failed to delete storage row:", error);
      throw error;
    }
  },

  /**
   * Inserts a new row into a storage table
   * @param tableName - The name of the table
   * @param data - The data for the new row
   * @returns Promise resolving when the row is inserted
   */
  async storageInsertRow(tableName: string, data: any): Promise<void> {
    try {
      return await invoke<void>("storage_insert_row", { tableName, data });
    } catch (error) {
      console.error("Failed to insert storage row:", error);
      throw error;
    }
  },

  /**
   * Executes a SQL query on the storage database
   * @param sql - The SQL query to execute
   * @returns Promise resolving to the query results
   */
  async storageExecuteSql(sql: string): Promise<any> {
    try {
      return await invoke<any>("storage_execute_sql", { sql });
    } catch (error) {
      console.error("Failed to execute SQL:", error);
      throw error;
    }
  },

  /**
   * Resets the storage database
   * @returns Promise resolving when the database is reset
   */
  async storageResetDatabase(): Promise<void> {
    try {
      return await invoke<void>("storage_reset_database");
    } catch (error) {
      console.error("Failed to reset storage database:", error);
      throw error;
    }
  },

  /**
   * Lists all running Claude sessions
   * @returns Promise resolving to an array of running sessions
   */
  async listRunningClaudeSessions(): Promise<ProcessInfo[]> {
    try {
      return await invoke<ProcessInfo[]>("list_running_claude_sessions");
    } catch (error) {
      console.error("Failed to list running Claude sessions:", error);
      throw error;
    }
  },

  // =====================================
  // SuperClaude Integration API
  // =====================================

  /**
   * Executes a SuperClaude command with specified flags and persona
   * @param command - SuperClaude command name (e.g., 'build', 'analyze', 'review')
   * @param flags - Array of command flags (e.g., ['--react', '--magic', '--tdd'])
   * @param persona - Optional persona flag (e.g., 'architect', 'frontend', 'security')
   * @param projectPath - Project path to execute command in
   * @param model - Optional model override
   * @returns Promise resolving to command execution result
   */
  async executeSuperClaudeCommand(
    command: string,
    flags: string[] = [],
    persona?: string,
    projectPath?: string,
    model?: string
  ): Promise<string> {
    try {
      // Build the SuperClaude command string
      const commandFlags = [...flags];
      
      // Add persona flag if specified
      if (persona) {
        commandFlags.push(`--persona-${persona}`);
      }
      
      // Create the full SuperClaude command
      const superClaudePrompt = `/${command} ${commandFlags.join(' ')}`.trim();
      
      
      
      // Execute through existing Claude Code integration
      return await invoke<string>("execute_claude_code", {
        projectPath: projectPath || process.cwd(),
        prompt: superClaudePrompt,
        model: model || 'claude-3.5-sonnet'
      });
    } catch (error) {
      console.error("Failed to execute SuperClaude command:", error);
      throw error;
    }
  },

  /**
   * Executes a SuperClaude workflow (multiple commands in sequence)
   * @param workflowId - Workflow identifier
   * @param projectPath - Project path to execute workflow in
   * @param model - Optional model override
   * @returns Promise resolving to workflow execution results
   */
  async executeSuperClaudeWorkflow(
    workflowId: string,
    projectPath?: string,
    model?: string
  ): Promise<string[]> {
    try {
      
      
      // Import workflow definitions
      const { SUPERCLAUDE_WORKFLOWS } = await import('@/types/superclaude');
      
      const workflow = SUPERCLAUDE_WORKFLOWS.find(w => w.id === workflowId);
      if (!workflow) {
        throw new Error(`Workflow not found: ${workflowId}`);
      }
      
      const results: string[] = [];
      
      // Execute workflow steps in sequence
      for (const step of workflow.steps.sort((a, b) => a.order - b.order)) {
        try {
          
          
          const result = await this.executeSuperClaudeCommand(
            step.command,
            step.flags,
            step.persona,
            projectPath,
            model
          );
          
          results.push(`Step ${step.order} (${step.description}): ${result}`);
        } catch (stepError) {
          console.error(`Workflow step ${step.order} failed:`, stepError);
          results.push(`Step ${step.order} FAILED: ${stepError instanceof Error ? stepError.message : 'Unknown error'}`);
          // Continue with remaining steps rather than failing the entire workflow
        }
      }
      
      return results;
    } catch (error) {
      console.error("Failed to execute SuperClaude workflow:", error);
      throw error;
    }
  },

  /**
   * Gets available SuperClaude commands
   * @returns Promise resolving to available commands
   */
  async getSuperClaudeCommands(): Promise<any[]> {
    try {
      const { SUPERCLAUDE_COMMANDS } = await import('@/types/superclaude');
      return SUPERCLAUDE_COMMANDS;
    } catch (error) {
      console.error("Failed to get SuperClaude commands:", error);
      throw error;
    }
  },

  /**
   * Gets available SuperClaude personas
   * @returns Promise resolving to available personas
   */
  async getSuperClaudePersonas(): Promise<any[]> {
    try {
      const { SUPERCLAUDE_PERSONAS } = await import('@/types/superclaude');
      return SUPERCLAUDE_PERSONAS;
    } catch (error) {
      console.error("Failed to get SuperClaude personas:", error);
      throw error;
    }
  },

  /**
   * Gets available SuperClaude workflows
   * @returns Promise resolving to available workflows
   */
  async getSuperClaudeWorkflows(): Promise<any[]> {
    try {
      const { SUPERCLAUDE_WORKFLOWS } = await import('@/types/superclaude');
      return SUPERCLAUDE_WORKFLOWS;
    } catch (error) {
      console.error("Failed to get SuperClaude workflows:", error);
      throw error;
    }
  },

  /**
   * Validates SuperClaude installation in ~/.claude directory
   * @returns Promise resolving to installation status
   */
  async validateSuperClaudeInstallation(): Promise<{
    installed: boolean;
    version?: string;
    commands_available: number;
    personas_available: number;
    message: string;
  }> {
    try {
      // Try to execute a simple SuperClaude command to validate installation
      const testResult = await invoke<string>("execute_claude_code", {
        projectPath: process.cwd(),
        prompt: "/load --help",
        model: 'claude-3.5-sonnet'
      });
      
      // Check if the response indicates SuperClaude is available
      const isInstalled = testResult.includes('/load') || testResult.includes('SuperClaude');
      
      const { SUPERCLAUDE_COMMANDS, SUPERCLAUDE_PERSONAS } = await import('@/types/superclaude');
      
      return {
        installed: isInstalled,
        version: isInstalled ? '2.0.1' : undefined,
        commands_available: SUPERCLAUDE_COMMANDS.length,
        personas_available: SUPERCLAUDE_PERSONAS.length,
        message: isInstalled 
          ? 'SuperClaude is properly installed and available'
          : 'SuperClaude may not be installed. Run: git clone https://github.com/NomenAK/SuperClaude.git && cd SuperClaude && ./install.sh'
      };
    } catch (error) {
      console.error("Failed to validate SuperClaude installation:", error);
      return {
        installed: false,
        commands_available: 0,
        personas_available: 0,
        message: `SuperClaude validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  },

  /**
   * Quick execution methods for common SuperClaude workflows
   */
  superClaude: {
    // Development workflows
    async buildWithAI(projectPath?: string, framework: 'react' | 'vue' | 'angular' = 'react') {
      return api.executeSuperClaudeCommand(
        'build',
        [`--${framework}`, '--magic', '--tdd'],
        'frontend',
        projectPath
      );
    },

    async setupDevelopment(projectPath?: string, includeCI = true) {
      const flags = includeCI ? ['--ci', '--monitor'] : ['--monitor'];
      return api.executeSuperClaudeCommand(
        'dev-setup',
        flags,
        'architect',
        projectPath
      );
    },

    async runTests(projectPath?: string, coverage = true, e2e = false) {
      const flags = ['--strict'];
      if (coverage) flags.push('--coverage');
      if (e2e) flags.push('--e2e', '--pup');
      
      return api.executeSuperClaudeCommand(
        'test',
        flags,
        'qa',
        projectPath
      );
    },

    // Analysis workflows
    async codeReview(projectPath?: string, includeEvidence = true) {
      const flags = ['--quality'];
      if (includeEvidence) flags.push('--evidence');
      
      return api.executeSuperClaudeCommand(
        'review',
        flags,
        'qa',
        projectPath
      );
    },

    async analyzeArchitecture(projectPath?: string) {
      return api.executeSuperClaudeCommand(
        'analyze',
        ['--architecture', '--seq'],
        'architect',
        projectPath
      );
    },

    async securityScan(projectPath?: string, includeOWASP = true) {
      const flags = ['--security', '--validate'];
      if (includeOWASP) flags.push('--owasp', '--deps');
      
      return api.executeSuperClaudeCommand(
        'scan',
        flags,
        'security',
        projectPath
      );
    },

    async troubleshootIssue(projectPath?: string, production = false) {
      const flags = ['--investigate'];
      if (production) flags.push('--prod', '--five-whys');
      
      return api.executeSuperClaudeCommand(
        'troubleshoot',
        flags,
        'analyzer',
        projectPath
      );
    },

    async optimizePerformance(projectPath?: string, threshold = '95%') {
      return api.executeSuperClaudeCommand(
        'improve',
        ['--performance', '--threshold', threshold],
        'performance',
        projectPath
      );
    },

    // Deployment workflows  
    async deployToEnvironment(environment: 'dev' | 'staging' | 'prod', projectPath?: string) {
      return api.executeSuperClaudeCommand(
        'deploy',
        ['--env', environment, '--plan'],
        undefined,
        projectPath
      );
    },

    // Team workflows
    async runCodeReviewWorkflow(projectPath?: string) {
      return api.executeSuperClaudeWorkflow('code-review', projectPath);
    },

    async runArchitectureReview(projectPath?: string) {
      return api.executeSuperClaudeWorkflow('architecture-review', projectPath);
    },

    async runSecurityAudit(projectPath?: string) {
      return api.executeSuperClaudeWorkflow('security-audit', projectPath);
    },

    async runPerformanceOptimization(projectPath?: string) {
      return api.executeSuperClaudeWorkflow('performance-optimization', projectPath);
    },

    async runDeploymentPipeline(projectPath?: string) {
      return api.executeSuperClaudeWorkflow('deployment-pipeline', projectPath);
    }
  }
};
