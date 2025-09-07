import { invoke } from '@tauri-apps/api/core';

export interface AutoContinuationConfig {
  enabled: boolean;
  maxIterations: number;
  strategy: 'testing' | 'refinement' | 'documentation' | 'comprehensive';
  stopConditions: string[];
  iterationDelay?: number; // optional minimum delay between iterations (deprecated - now waits for completion)
}

export interface ContinuationResult {
  sessionId: string;
  iteration: number;
  result: string;
  shouldContinue: boolean;
  totalCost: number;
  duration: number;
}

export interface PromptStrategy {
  name: string;
  prompts: string[];
  condition: (result: string, iteration: number) => boolean;
}

export class AutoContinuationAgent {
  private sessionId: string | null = null;
  private currentIteration: number = 0;
  private continuationHistory: ContinuationResult[] = [];
  private promptStrategies: Map<string, PromptStrategy> = new Map();

  constructor(private config: AutoContinuationConfig) {
    this.initializeStrategies();
  }

  private initializeStrategies(): void {
    this.promptStrategies.set('testing', {
      name: 'Testing Strategy',
      prompts: [
        'Run all tests and report results. If tests fail, fix the issues.',
        'Create additional test cases to improve coverage.',
        'Add integration tests for the new functionality.',
        'Perform edge case testing and add robust error handling.',
        'Run performance tests and optimize if needed.'
      ],
      condition: (result, iteration) => 
        result.includes('test') || result.includes('spec') || iteration < 3
    });

    this.promptStrategies.set('refinement', {
      name: 'Code Refinement Strategy',
      prompts: [
        'Review the code for improvements and refactor for better maintainability.',
        'Optimize performance bottlenecks and memory usage.',
        'Add proper error handling and input validation.',
        'Improve code documentation and add inline comments.',
        'Ensure code follows best practices and design patterns.'
      ],
      condition: (result, iteration) => 
        result.includes('function') || result.includes('class') || iteration < 4
    });

    this.promptStrategies.set('documentation', {
      name: 'Documentation Strategy',
      prompts: [
        'Add comprehensive inline documentation and comments.',
        'Create or update README with usage examples.',
        'Generate API documentation for public interfaces.',
        'Add code examples and usage scenarios.',
        'Create troubleshooting guide for common issues.'
      ],
      condition: (result, iteration) => 
        result.includes('export') || result.includes('public') || iteration < 3
    });

    this.promptStrategies.set('comprehensive', {
      name: 'Comprehensive Strategy',
      prompts: [
        'Test the implementation thoroughly and fix any issues.',
        'Refactor and optimize the code for better performance.',
        'Add comprehensive error handling and edge case coverage.',
        'Document the code with clear comments and examples.',
        'Perform a final review and polish the implementation.'
      ],
      condition: (_result, iteration) => iteration < 5
    });
  }

  async execute(
    agentId: string,
    initialTask: string,
    projectPath: string
  ): Promise<ContinuationResult[]> {
    try {
      // Execute initial task
      const initialResult = await this.executeInitialTask(
        agentId,
        initialTask,
        projectPath
      );

      this.sessionId = initialResult.sessionId;
      this.continuationHistory.push(initialResult);

      // Auto-continuation loop
      while (this.shouldContinue(initialResult)) {
        // Delay removed - now waits for actual completion in Rust backend

        const nextPrompt = this.generateNextPrompt(
          this.continuationHistory[this.continuationHistory.length - 1]
        );

        const continuationResult = await this.continueExecution(
          agentId,
          nextPrompt,
          projectPath
        );

        this.continuationHistory.push(continuationResult);
        this.currentIteration++;

        if (!continuationResult.shouldContinue) {
          break;
        }
      }

      return this.continuationHistory;
    } catch (error) {
      console.error('Auto-continuation failed:', error);
      throw error;
    }
  }

  private async executeInitialTask(
    agentId: string,
    task: string,
    projectPath: string
  ): Promise<ContinuationResult> {
    const response = await invoke('execute_agent', {
      agentId,
      task,
      projectPath,
      outputFormat: 'json'
    }) as any;

    return {
      sessionId: response.session_id,
      iteration: 0,
      result: response.result,
      shouldContinue: true,
      totalCost: response.total_cost_usd || 0,
      duration: response.duration_ms || 0
    };
  }

  private async continueExecution(
    agentId: string,
    prompt: string,
    projectPath: string
  ): Promise<ContinuationResult> {
    const result = await invoke('continue_agent_execution', {
      agentId,
      prompt,
      projectPath,
      sessionId: this.sessionId,
      outputFormat: 'json'
    }) as any;

    return {
      sessionId: this.sessionId!,
      iteration: this.currentIteration + 1,
      result: result.result,
      shouldContinue: this.shouldContinue(result),
      totalCost: result.total_cost_usd || 0,
      duration: result.duration_ms || 0
    };
  }

  private shouldContinue(_result: ContinuationResult | any): boolean {
    // Check max iterations
    if (this.currentIteration >= this.config.maxIterations) {
      return false;
    }

    // Check stop conditions
    const resultText = typeof _result === 'string' ? _result : _result.result;
    for (const condition of this.config.stopConditions) {
      if (resultText.toLowerCase().includes(condition.toLowerCase())) {
        return false;
      }
    }

    // Check strategy-specific conditions
    const strategy = this.promptStrategies.get(this.config.strategy);
    if (strategy && !strategy.condition(resultText, this.currentIteration)) {
      return false;
    }

    return true;
  }

  private generateNextPrompt(lastResult: ContinuationResult): string {
    const strategy = this.promptStrategies.get(this.config.strategy);
    if (!strategy) {
      throw new Error(`Unknown strategy: ${this.config.strategy}`);
    }

    const basePrompt = strategy.prompts[
      this.currentIteration % strategy.prompts.length
    ];

    return this.addContextToPrompt(basePrompt, lastResult);
  }

  private addContextToPrompt(
    basePrompt: string,
    lastResult: ContinuationResult
  ): string {
    const context = this.analyzeResult(lastResult.result);
    
    if (context.hasErrors) {
      return `${basePrompt} Pay special attention to fixing the errors: ${context.errors.join(', ')}`;
    }
    
    if (context.hasTests) {
      return `${basePrompt} Focus on the test files and ensure they pass.`;
    }
    
    if (context.hasNewFiles) {
      return `${basePrompt} Consider the new files that were created.`;
    }

    return basePrompt;
  }

  private analyzeResult(result: string): {
    hasErrors: boolean;
    errors: string[];
    hasTests: boolean;
    hasNewFiles: boolean;
  } {
    const errors: string[] = [];
    const errorPatterns = [
      /error:/gi,
      /failed:/gi,
      /exception:/gi,
      /warning:/gi
    ];

    for (const pattern of errorPatterns) {
      const matches = result.match(pattern);
      if (matches) {
        errors.push(...matches);
      }
    }

    return {
      hasErrors: errors.length > 0,
      errors,
      hasTests: /test|spec|jest|mocha|vitest/gi.test(result),
      hasNewFiles: /created|wrote|generated/gi.test(result)
    };
  }

  // delay method removed - now using completion-based triggering in Rust backend

  // Getters for monitoring
  get currentSession(): string | null {
    return this.sessionId;
  }

  get iteration(): number {
    return this.currentIteration;
  }

  get history(): ContinuationResult[] {
    return [...this.continuationHistory];
  }

  get totalCost(): number {
    return this.continuationHistory.reduce((sum, result) => sum + result.totalCost, 0);
  }

  get totalDuration(): number {
    return this.continuationHistory.reduce((sum, result) => sum + result.duration, 0);
  }
}

// Default configurations
export const DEFAULT_CONFIGS: Record<string, AutoContinuationConfig> = {
  testing: {
    enabled: true,
    maxIterations: 5,
    strategy: 'testing',
    stopConditions: ['all tests pass', 'no errors found']
    // iterationDelay removed - now waits for actual completion
  },
  refinement: {
    enabled: true,
    maxIterations: 4,
    strategy: 'refinement',
    stopConditions: ['optimized', 'refactored', 'no improvements needed']
    // iterationDelay removed - now waits for actual completion
  },
  documentation: {
    enabled: true,
    maxIterations: 3,
    strategy: 'documentation',
    stopConditions: ['documented', 'readme updated']
    // iterationDelay removed - now waits for actual completion
  },
  comprehensive: {
    enabled: true,
    maxIterations: 7,
    strategy: 'comprehensive',
    stopConditions: ['completed', 'fully implemented', 'production ready']
    // iterationDelay removed - now waits for actual completion
  }
};