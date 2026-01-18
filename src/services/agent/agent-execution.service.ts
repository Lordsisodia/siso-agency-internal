// ============================================================================
// AGENT EXECUTION SYSTEM - Service Layer
// Provides API for AI agents to manage tasks, plans, and context
// ============================================================================

import { supabase } from '@/lib/services/supabase/client';
import type {
  AgentExecutionPlan,
  AgentExecutionLog,
  AgentContextMemory,
  CreatePlanInput,
  UpdatePlanInput,
  AddLogInput,
  SetContextInput,
  PlanWithLogs,
  PlanFilters,
  LogFilters,
  ContextFilters,
} from './agent-execution.types';

export class AgentExecutionService {
  private readonly TABLES = {
    PLANS: 'agent_execution_plans',
    LOGS: 'agent_execution_logs',
    CONTEXT: 'agent_context_memory',
  } as const;

  // ============================================================================
  // PLAN MANAGEMENT
  // ============================================================================

  /**
   * Create a new execution plan for a task
   */
  async createPlan(input: CreatePlanInput): Promise<AgentExecutionPlan> {
    const { data, error } = await supabase
      .from(this.TABLES.PLANS)
      .insert({
        task_id: input.task_id,
        plan_type: input.plan_type,
        total_steps: input.steps.length,
        current_step: 1,
        status: 'pending',
        plan_json: {
          steps: input.steps,
          metadata: input.metadata || {},
          reasoning: input.reasoning,
        },
        agent_reasoning: input.reasoning,
        created_by: 'agent',
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create plan: ${error.message}`);
    return data;
  }

  /**
   * Get plan by ID with optional logs and context
   */
  async getPlan(
    planId: string,
    includeLogs = true,
    includeContext = true
  ): Promise<PlanWithLogs | null> {
    const { data: plan, error } = await supabase
      .from(this.TABLES.PLANS)
      .select('*')
      .eq('id', planId)
      .single();

    if (error || !plan) return null;

    const result: PlanWithLogs = plan;

    if (includeLogs) {
      const { data: logs } = await supabase
        .from(this.TABLES.LOGS)
        .select('*')
        .eq('plan_id', planId)
        .order('timestamp', { ascending: true });
      
      result.logs = logs || [];
    }

    if (includeContext) {
      const { data: context } = await supabase
        .from(this.TABLES.CONTEXT)
        .select('*')
        .eq('plan_id', planId)
        .order('created_at', { ascending: false });
      
      result.context = context || [];
    }

    return result;
  }

  /**
   * Query plans with filters
   */
  async queryPlans(filters: PlanFilters = {}): Promise<AgentExecutionPlan[]> {
    let query = supabase
      .from(this.TABLES.PLANS)
      .select('*')
      .order('created_at', { ascending: false });

    if (filters.task_id) {
      query = query.eq('task_id', filters.task_id);
    }
    if (filters.plan_type) {
      query = query.eq('plan_type', filters.plan_type);
    }
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    if (filters.limit) {
      query = query.limit(filters.limit);
    }
    if (filters.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
    }

    const { data, error } = await query;
    if (error) throw new Error(`Failed to query plans: ${error.message}`);
    return data || [];
  }

  /**
   * Update plan status and/or current step
   */
  async updatePlan(input: UpdatePlanInput): Promise<AgentExecutionPlan> {
    const updateData: any = {};
    
    if (input.current_step !== undefined) {
      updateData.current_step = input.current_step;
    }
    if (input.status !== undefined) {
      updateData.status = input.status;
      if (input.status === 'completed') {
        updateData.completed_at = new Date().toISOString();
      }
    }
    if (input.agent_reasoning !== undefined) {
      updateData.agent_reasoning = input.agent_reasoning;
    }

    const { data, error } = await supabase
      .from(this.TABLES.PLANS)
      .update(updateData)
      .eq('id', input.plan_id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update plan: ${error.message}`);
    return data;
  }

  /**
   * Delete a plan (cascades to logs and context)
   */
  async deletePlan(planId: string): Promise<void> {
    const { error } = await supabase
      .from(this.TABLES.PLANS)
      .delete()
      .eq('id', planId);

    if (error) throw new Error(`Failed to delete plan: ${error.message}`);
  }

  // ============================================================================
  // LOGGING
  // ============================================================================

  /**
   * Add a log entry for an action
   */
  async addLog(input: AddLogInput): Promise<AgentExecutionLog> {
    const { data, error } = await supabase
      .from(this.TABLES.LOGS)
      .insert({
        plan_id: input.plan_id,
        step_number: input.step_number,
        action_type: input.action_type,
        entity_type: input.entity_type,
        entity_id: input.entity_id,
        description: input.description,
        before_state: input.before_state,
        after_state: input.after_state,
        agent_confidence: input.agent_confidence,
        error_message: input.error_message,
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to add log: ${error.message}`);
    return data;
  }

  /**
   * Query logs with filters
   */
  async queryLogs(filters: LogFilters = {}): Promise<AgentExecutionLog[]> {
    let query = supabase
      .from(this.TABLES.LOGS)
      .select('*')
      .order('timestamp', { ascending: false });

    if (filters.plan_id) {
      query = query.eq('plan_id', filters.plan_id);
    }
    if (filters.action_type) {
      query = query.eq('action_type', filters.action_type);
    }
    if (filters.entity_type) {
      query = query.eq('entity_type', filters.entity_type);
    }
    if (filters.start_date) {
      query = query.gte('timestamp', filters.start_date);
    }
    if (filters.end_date) {
      query = query.lte('timestamp', filters.end_date);
    }
    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;
    if (error) throw new Error(`Failed to query logs: ${error.message}`);
    return data || [];
  }

  // ============================================================================
  // CONTEXT MANAGEMENT
  // ============================================================================

  /**
   * Set context (upsert - creates or updates)
   */
  async setContext(input: SetContextInput): Promise<AgentContextMemory> {
    const { data, error } = await supabase
      .from(this.TABLES.CONTEXT)
      .upsert({
        task_id: input.task_id,
        plan_id: input.plan_id,
        context_type: input.context_type,
        context_key: input.context_key,
        context_value: input.context_value,
        metadata: input.metadata || {},
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to set context: ${error.message}`);
    return data;
  }

  /**
   * Get context by key
   */
  async getContext(
    taskOrPlanId: string,
    contextType?: ContextType,
    contextKey?: string
  ): Promise<AgentContextMemory[]> {
    let query = supabase
      .from(this.TABLES.CONTEXT)
      .select('*')
      .order('created_at', { ascending: false });

    // Check if it's a task_id or plan_id
    const { data: planCheck } = await supabase
      .from(this.TABLES.PLANS)
      .select('id')
      .eq('id', taskOrPlanId)
      .single();

    if (planCheck) {
      query = query.eq('plan_id', taskOrPlanId);
    } else {
      query = query.eq('task_id', taskOrPlanId);
    }

    if (contextType) {
      query = query.eq('context_type', contextType);
    }
    if (contextKey) {
      query = query.eq('context_key', contextKey);
    }

    const { data, error } = await query;
    if (error) throw new Error(`Failed to get context: ${error.message}`);
    return data || [];
  }

  /**
   * Query context with filters
   */
  async queryContext(filters: ContextFilters = {}): Promise<AgentContextMemory[]> {
    let query = supabase
      .from(this.TABLES.CONTEXT)
      .select('*')
      .order('created_at', { ascending: false });

    if (filters.task_id) {
      query = query.eq('task_id', filters.task_id);
    }
    if (filters.plan_id) {
      query = query.eq('plan_id', filters.plan_id);
    }
    if (filters.context_type) {
      query = query.eq('context_type', filters.context_type);
    }
    if (filters.search_query) {
      query = query.ilike('context_value', `%${filters.search_query}%`);
    }

    const { data, error } = await query;
    if (error) throw new Error(`Failed to query context: ${error.message}`);
    return data || [];
  }

  /**
   * Delete context
   */
  async deleteContext(contextId: string): Promise<void> {
    const { error } = await supabase
      .from(this.TABLES.CONTEXT)
      .delete()
      .eq('id', contextId);

    if (error) throw new Error(`Failed to delete context: ${error.message}`);
  }

  // ============================================================================
  // HIGH-LEVEL WORKFLOWS
  // ============================================================================

  /**
   * Complete a workflow: create plan, execute steps, log progress
   */
  async executePlan(
    taskId: string,
    planType: string,
    steps: any[],
    executor: (step: any, planId: string) => Promise<any>
  ): Promise<AgentExecutionPlan> {
    // 1. Create plan
    const plan = await this.createPlan({
      task_id: taskId,
      plan_type: planType as any,
      steps,
      reasoning: `Auto-generated plan with ${steps.length} steps`,
    });

    // 2. Update status to in_progress
    await this.updatePlan({
      plan_id: plan.id!,
      status: 'in_progress',
    });

    // 3. Execute each step
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      const stepNumber = i + 1;

      try {
        // Log step start
        await this.addLog({
          plan_id: plan.id!,
          step_number: stepNumber,
          action_type: 'complete_step',
          description: `Starting: ${step.description}`,
          agent_confidence: 1.0,
        });

        // Execute step
        const result = await executor(step, plan.id!);

        // Log step completion
        await this.addLog({
          plan_id: plan.id!,
          step_number: stepNumber,
          action_type: 'complete_step',
          description: `Completed: ${step.description}`,
          after_state: result,
          agent_confidence: 1.0,
        });

        // Update current step
        await this.updatePlan({
          plan_id: plan.id!,
          current_step: stepNumber + 1,
        });
      } catch (error) {
        // Log failure
        await this.addLog({
          plan_id: plan.id!,
          step_number: stepNumber,
          action_type: 'block',
          description: `Failed: ${step.description}`,
          error_message: error instanceof Error ? error.message : String(error),
          agent_confidence: 0.0,
        });

        // Update plan status to blocked
        await this.updatePlan({
          plan_id: plan.id!,
          status: 'blocked',
          agent_reasoning: `Step ${stepNumber} failed: ${error}`,
        });

        throw error;
      }
    }

    // 4. Mark plan as completed
    const completedPlan = await this.updatePlan({
      plan_id: plan.id!,
      status: 'completed',
      agent_reasoning: 'All steps completed successfully',
    });

    return completedPlan;
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

export const agentExecution = new AgentExecutionService();
