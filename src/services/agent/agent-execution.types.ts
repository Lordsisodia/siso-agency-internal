// ============================================================================
// AGENT EXECUTION SYSTEM - Type Definitions
// Enables AI agents to manage tasks, plans, and context without code changes
// ============================================================================

export type PlanType = 
  | 'subtask_breakdown' 
  | 'implementation' 
  | 'research' 
  | 'testing' 
  | 'deployment'
  | 'refactoring'
  | 'feature_addition';

export type PlanStatus = 
  | 'pending' 
  | 'in_progress' 
  | 'completed' 
  | 'blocked' 
  | 'failed' 
  | 'cancelled';

export type ActionType = 
  | 'create_task'
  | 'update_task'
  | 'create_subtask'
  | 'update_subtask'
  | 'complete_step'
  | 'add_note'
  | 'block'
  | 'unblock'
  | 'add_context'
  | 'update_context';

export type ContextType = 
  | 'research'
  | 'decisions'
  | 'blockers'
  | 'dependencies'
  | 'notes'
  | 'files'
  | 'code_references'
  | 'api_endpoints';

// ============================================================================
// PLAN TYPES
// ============================================================================

export interface ExecutionStep {
  step: number;
  action: string;
  description: string;
  estimated_duration?: number; // in minutes
  dependencies?: number[]; // step numbers this depends on
  status?: 'pending' | 'in_progress' | 'completed' | 'skipped';
  metadata?: Record<string, any>;
}

export interface AgentExecutionPlan {
  id?: string;
  task_id: string;
  plan_type: PlanType;
  current_step: number;
  total_steps: number;
  status: PlanStatus;
  plan_json: {
    steps: ExecutionStep[];
    metadata?: Record<string, any>;
    reasoning?: string;
  };
  agent_reasoning?: string;
  created_by?: 'agent' | 'user';
  created_at?: string;
  updated_at?: string;
  completed_at?: string;
}

// ============================================================================
// LOG TYPES
// ============================================================================

export interface AgentExecutionLog {
  id?: string;
  plan_id: string;
  step_number: number;
  action_type: ActionType;
  entity_type?: 'task' | 'subtask' | 'plan' | 'context';
  entity_id?: string;
  description: string;
  before_state?: Record<string, any>;
  after_state?: Record<string, any>;
  agent_confidence?: number; // 0-1
  error_message?: string;
  timestamp?: string;
}

// ============================================================================
// CONTEXT MEMORY TYPES
// ============================================================================

export interface AgentContextMemory {
  id?: string;
  task_id?: string;
  plan_id?: string;
  context_type: ContextType;
  context_key: string;
  context_value: string;
  metadata?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface PlanWithLogs extends AgentExecutionPlan {
  logs?: AgentExecutionLog[];
  context?: AgentContextMemory[];
}

export interface CreatePlanInput {
  task_id: string;
  plan_type: PlanType;
  steps: ExecutionStep[];
  reasoning?: string;
  metadata?: Record<string, any>;
}

export interface UpdatePlanInput {
  plan_id: string;
  current_step?: number;
  status?: PlanStatus;
  agent_reasoning?: string;
}

export interface AddLogInput {
  plan_id: string;
  step_number: number;
  action_type: ActionType;
  entity_type?: string;
  entity_id?: string;
  description: string;
  before_state?: Record<string, any>;
  after_state?: Record<string, any>;
  agent_confidence?: number;
  error_message?: string;
}

export interface SetContextInput {
  task_id?: string;
  plan_id?: string;
  context_type: ContextType;
  context_key: string;
  context_value: string;
  metadata?: Record<string, any>;
}

// ============================================================================
// QUERY FILTERS
// ============================================================================

export interface PlanFilters {
  task_id?: string;
  plan_type?: PlanType;
  status?: PlanStatus;
  limit?: number;
  offset?: number;
}

export interface LogFilters {
  plan_id?: string;
  action_type?: ActionType;
  entity_type?: string;
  start_date?: string;
  end_date?: string;
  limit?: number;
}

export interface ContextFilters {
  task_id?: string;
  plan_id?: string;
  context_type?: ContextType;
  search_query?: string; // for semantic search
}
