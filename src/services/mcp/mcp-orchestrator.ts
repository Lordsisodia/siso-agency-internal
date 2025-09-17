import { EventEmitter } from 'events';
import { mcpMiddleware } from './mcp-middleware';

export interface MCPStep {
  id: string;
  mcp: string;
  action: string;
  params?: Record<string, any>;
  dependsOn?: string[];
  condition?: (previousResults: Record<string, any>) => boolean;
  retryConfig?: {
    maxRetries: number;
    backoffMs: number;
  };
}

export interface MCPWorkflow {
  id: string;
  name: string;
  description?: string;
  steps: MCPStep[];
  parallel?: boolean;
  onError?: 'continue' | 'stop' | 'rollback';
}

export interface MCPExecutionResult {
  stepId: string;
  status: 'success' | 'error' | 'skipped';
  result?: any;
  error?: Error;
  duration: number;
  retries?: number;
}

export interface WorkflowExecutionResult {
  workflowId: string;
  status: 'completed' | 'failed' | 'partial';
  results: MCPExecutionResult[];
  totalDuration: number;
  timestamp: Date;
}

export class MCPOrchestrator extends EventEmitter {
  private mcpClients: Map<string, any> = new Map();
  private executionHistory: WorkflowExecutionResult[] = [];
  private activeWorkflows: Map<string, AbortController> = new Map();

  constructor() {
    super();
  }

  /**
   * Register an MCP client for use in workflows
   */
  registerMCPClient(name: string, client: any): void {
    this.mcpClients.set(name, client);
    this.emit('mcp:registered', { name });
  }

  /**
   * Execute a workflow with intelligent dependency resolution
   */
  async executeWorkflow(workflow: MCPWorkflow): Promise<WorkflowExecutionResult> {
    const startTime = Date.now();
    const abortController = new AbortController();
    this.activeWorkflows.set(workflow.id, abortController);

    this.emit('workflow:start', { workflowId: workflow.id, name: workflow.name });

    const results: MCPExecutionResult[] = [];
    const executedSteps = new Map<string, any>();

    try {
      if (workflow.parallel) {
        // Execute independent steps in parallel
        const parallelGroups = this.groupStepsByDependencies(workflow.steps);
        
        for (const group of parallelGroups) {
          if (abortController.signal.aborted) break;
          
          const groupResults = await Promise.allSettled(
            group.map(step => this.executeStep(step, executedSteps, abortController.signal))
          );

          for (let i = 0; i < groupResults.length; i++) {
            const result = groupResults[i];
            const step = group[i];
            
            if (result.status === 'fulfilled') {
              results.push(result.value);
              executedSteps.set(step.id, result.value.result);
            } else {
              const errorResult = {
                stepId: step.id,
                status: 'error' as const,
                error: result.reason,
                duration: 0
              };
              results.push(errorResult);
              if (workflow.onError === 'stop') {
                throw result.reason;
              }
            }
          }
        }
      } else {
        // Sequential execution
        for (const step of workflow.steps) {
          if (abortController.signal.aborted) break;

          try {
            const result = await this.executeStep(step, executedSteps, abortController.signal);
            results.push(result);
            executedSteps.set(step.id, result.result);
          } catch (error) {
            const errorResult = {
              stepId: step.id,
              status: 'error' as const,
              error: error as Error,
              duration: 0
            };
            results.push(errorResult);
            if (workflow.onError === 'stop') {
              throw error;
            }
          }
        }
      }

      const status = results.every(r => r.status === 'success') ? 'completed' : 
                     results.some(r => r.status === 'success') ? 'partial' : 'failed';

      const executionResult: WorkflowExecutionResult = {
        workflowId: workflow.id,
        status,
        results,
        totalDuration: Date.now() - startTime,
        timestamp: new Date()
      };

      this.executionHistory.push(executionResult);
      this.emit('workflow:complete', executionResult);
      
      return executionResult;

    } catch (error) {
      const executionResult: WorkflowExecutionResult = {
        workflowId: workflow.id,
        status: 'failed',
        results,
        totalDuration: Date.now() - startTime,
        timestamp: new Date()
      };

      this.executionHistory.push(executionResult);
      this.emit('workflow:error', { workflowId: workflow.id, error });
      
      return executionResult;
    } finally {
      this.activeWorkflows.delete(workflow.id);
    }
  }

  /**
   * Execute a single step with retry logic
   */
  private async executeStep(
    step: MCPStep,
    previousResults: Map<string, any>,
    signal: AbortSignal
  ): Promise<MCPExecutionResult> {
    const startTime = Date.now();
    
    // Check if step should be executed based on condition
    if (step.condition && !step.condition(Object.fromEntries(previousResults))) {
      return {
        stepId: step.id,
        status: 'skipped',
        duration: Date.now() - startTime
      };
    }

    // Check dependencies
    if (step.dependsOn) {
      for (const depId of step.dependsOn) {
        if (!previousResults.has(depId)) {
          throw new Error(`Dependency ${depId} not found for step ${step.id}`);
        }
      }
    }

    const mcpClient = this.mcpClients.get(step.mcp);
    if (!mcpClient) {
      throw new Error(`MCP client ${step.mcp} not registered`);
    }

    let lastError: Error | undefined;
    let retries = 0;
    const maxRetries = step.retryConfig?.maxRetries || 0;
    const backoffMs = step.retryConfig?.backoffMs || 1000;

    while (retries <= maxRetries) {
      if (signal.aborted) {
        throw new Error('Workflow aborted');
      }

      try {
        this.emit('step:start', { stepId: step.id, mcp: step.mcp, action: step.action });

        // Pre-process params through middleware
        const processedParams = await mcpMiddleware.preProcess(step.mcp, step.action, step.params || {});

        // Execute the MCP method
        if (typeof mcpClient[step.action] !== 'function') {
          throw new Error(`Method ${step.action} not found on MCP client ${step.mcp}`);
        }

        const rawResult = await mcpClient[step.action](processedParams);

        // Post-process result
        const finalResult = await mcpMiddleware.postProcess(step.mcp, step.action, rawResult);
        
        const executionResult: MCPExecutionResult = {
          stepId: step.id,
          status: 'success',
          result: finalResult,
          duration: Date.now() - startTime,
          retries: retries > 0 ? retries : undefined
        };

        this.emit('step:complete', executionResult);
        return executionResult;

      } catch (error) {
        lastError = error as Error;
        retries++;
        
        if (retries <= maxRetries) {
          this.emit('step:retry', { stepId: step.id, attempt: retries, error });
          await this.delay(backoffMs * retries);
        }
      }
    }

    throw lastError;
  }

  /**
   * Group steps by their dependencies for parallel execution
   */
  private groupStepsByDependencies(steps: MCPStep[]): MCPStep[][] {
    const groups: MCPStep[][] = [];
    const processed = new Set<string>();

    while (processed.size < steps.length) {
      const group: MCPStep[] = [];
      
      for (const step of steps) {
        if (processed.has(step.id)) continue;
        
        const dependenciesMet = !step.dependsOn || 
          step.dependsOn.every(dep => processed.has(dep));
        
        if (dependenciesMet) {
          group.push(step);
        }
      }

      if (group.length === 0) {
        throw new Error('Circular dependency detected in workflow');
      }

      group.forEach(step => processed.add(step.id));
      groups.push(group);
    }

    return groups;
  }

  /**
   * Abort an active workflow
   */
  abortWorkflow(workflowId: string): boolean {
    const controller = this.activeWorkflows.get(workflowId);
    if (controller) {
      controller.abort();
      this.emit('workflow:aborted', { workflowId });
      return true;
    }
    return false;
  }

  /**
   * Get execution history with optional filtering
   */
  getExecutionHistory(filter?: {
    workflowId?: string;
    status?: WorkflowExecutionResult['status'];
    limit?: number;
  }): WorkflowExecutionResult[] {
    let history = [...this.executionHistory];

    if (filter?.workflowId) {
      history = history.filter(h => h.workflowId === filter.workflowId);
    }

    if (filter?.status) {
      history = history.filter(h => h.status === filter.status);
    }

    if (filter?.limit) {
      history = history.slice(-filter.limit);
    }

    return history;
  }

  /**
   * Aggregate results from multiple steps
   */
  aggregateResults(results: MCPExecutionResult[]): Record<string, any> {
    const aggregated: Record<string, any> = {};
    
    for (const result of results) {
      if (result.status === 'success' && result.result !== undefined) {
        aggregated[result.stepId] = result.result;
      }
    }

    return aggregated;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
