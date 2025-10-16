// @ts-expect-error - Node.js imports only available in Electron
let spawn: typeof import('child_process')['spawn'] | undefined;

const loadChildProcessModule = async () => {
  if (typeof window !== 'undefined' || spawn) {
    return;
  }

  const childProcess = await import('child_process');
  spawn = childProcess.spawn;
};

export interface ClaudeExecutionRequest {
  prompt: string;
  allowedTools: string[];
  outputFormat?: 'json' | 'text';
  maxTokens?: number;
  temperature?: number;
  dangerouslySkipPermissions?: boolean;
  onProgress?: (progress: number, log: string) => void;
  onOutput?: (output: string) => void;
  onError?: (error: string) => void;
}

export interface ClaudeExecutionResult {
  success: boolean;
  output: any;
  tokenUsage: number;
  executionTimeMs: number;
  logs: string[];
  error?: string;
}

export interface ClaudeProcess {
  id: string;
  process: any; // ChildProcess type only available in Node.js
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  startTime: Date;
  endTime?: Date;
  logs: string[];
  pid: number;
}

export class ClaudeCodeIntegration {
  private activeProcesses: Map<string, ClaudeProcess> = new Map();
  private claudePath: string;

  constructor() {
    // Detect Claude Code installation
    this.claudePath = this.detectClaudePath();
  }

  /**
   * Execute a task with Claude Code
   */
  async executeTask(request: ClaudeExecutionRequest): Promise<ClaudeExecutionResult> {
    const startTime = Date.now();
    const processId = crypto.randomUUID();
    
    // In browser environment, we can't execute local Claude Code
    if (typeof window !== 'undefined') {
      return {
        success: false,
        output: '',
        errors: ['Claude Code execution not available in browser environment'],
        executionTime: 0,
        tokenUsage: 0,
        processId
      } as unknown as ClaudeExecutionResult;
    }

    await loadChildProcessModule();

    if (!spawn) {
      return {
        success: false,
        output: '',
        errors: ['spawn not available - Node.js environment required'],
        executionTime: 0,
        tokenUsage: 0,
        processId
      } as unknown as ClaudeExecutionResult;
    }
    
    return new Promise((resolve, reject) => {
      const args = this.buildClaudeArgs(request);
      const logs: string[] = [];
      let output = '';
      let error = '';

      // Spawn Claude Code process
      const childProcess = spawn(this.claudePath, args, {
        stdio: ['pipe', 'pipe', 'pipe'],
        env: {
          ...(process?.env || {}),
          ANTHROPIC_API_KEY: process?.env?.ANTHROPIC_API_KEY || ''
        }
      });

      const claudeProcess: ClaudeProcess = {
        id: processId,
        process: childProcess,
        status: 'running',
        startTime: new Date(),
        logs: [],
        pid: childProcess.pid || 0
      };

      this.activeProcesses.set(processId, claudeProcess);

      // Handle process output
      childProcess.stdout?.on('data', (data: Buffer) => {
        const text = data.toString();
        output += text;
        logs.push(`STDOUT: ${text}`);
        claudeProcess.logs.push(text);
        
        request.onOutput?.(text);
        
        // Try to extract progress information
        const progressMatch = text.match(/Progress: (\d+)%/);
        if (progressMatch) {
          const progress = parseInt(progressMatch[1]);
          request.onProgress?.(progress, text.trim());
        }
      });

      childProcess.stderr?.on('data', (data: Buffer) => {
        const text = data.toString();
        error += text;
        logs.push(`STDERR: ${text}`);
        claudeProcess.logs.push(`ERROR: ${text}`);
        
        request.onError?.(text);
      });

      // Send prompt to Claude
      if (childProcess.stdin) {
        childProcess.stdin.write(request.prompt);
        childProcess.stdin.end();
      }

      // Handle process completion
      childProcess.on('close', (code: number) => {
        const executionTimeMs = Date.now() - startTime;
        claudeProcess.endTime = new Date();
        
        if (code === 0) {
          claudeProcess.status = 'completed';
          
          const result: ClaudeExecutionResult = {
            success: true,
            output: this.parseOutput(output, request.outputFormat),
            tokenUsage: this.extractTokenUsage(output, logs),
            executionTimeMs,
            logs
          };
          
          logs.push(`✅ Claude Code execution completed in ${executionTimeMs}ms`);
          request.onProgress?.(100, 'Task completed successfully');
          
          resolve(result);
        } else {
          claudeProcess.status = 'failed';
          
          const result: ClaudeExecutionResult = {
            success: false,
            output: null,
            tokenUsage: this.extractTokenUsage(output, logs),
            executionTimeMs,
            logs,
            error: error || `Process exited with code ${code}`
          };
          
          logs.push(`❌ Claude Code execution failed with code ${code}`);
          reject(new Error(result.error));
        }
        
        // Clean up process after 5 minutes
        setTimeout(() => {
          this.activeProcesses.delete(processId);
        }, 5 * 60 * 1000);
      });

      // Handle process errors
      childProcess.on('error', (err: Error) => {
        claudeProcess.status = 'failed';
        claudeProcess.endTime = new Date();
        
        const result: ClaudeExecutionResult = {
          success: false,
          output: null,
          tokenUsage: 0,
          executionTimeMs: Date.now() - startTime,
          logs,
          error: err.message
        };
        
        logs.push(`❌ Process error: ${err.message}`);
        reject(err);
      });

      // Set timeout if specified
      if (request.maxTokens && request.maxTokens > 50000) {
        // Long operations get longer timeout
        setTimeout(() => {
          if (claudeProcess.status === 'running') {
            this.stopProcess(claudeProcess);
            reject(new Error('Claude Code execution timed out'));
          }
        }, 10 * 60 * 1000); // 10 minutes for large operations
      } else {
        setTimeout(() => {
          if (claudeProcess.status === 'running') {
            this.stopProcess(claudeProcess);
            reject(new Error('Claude Code execution timed out'));
          }
        }, 5 * 60 * 1000); // 5 minutes for normal operations
      }
    });
  }

  /**
   * Stop a running Claude process
   */
  async stopProcess(claudeProcess: ClaudeProcess): Promise<void> {
    if (claudeProcess.status === 'running') {
      claudeProcess.status = 'cancelled';
      claudeProcess.endTime = new Date();
      
      // Try graceful shutdown first
      claudeProcess.process.kill('SIGTERM');
      
      // Force kill after 5 seconds if still running
      setTimeout(() => {
        if (!claudeProcess.process.killed) {
          claudeProcess.process.kill('SIGKILL');
        }
      }, 5000);
      
      console.log(`🛑 Stopped Claude process ${claudeProcess.id}`);
    }
  }

  /**
   * Get status of all active processes
   */
  getActiveProcesses(): ClaudeProcess[] {
    return Array.from(this.activeProcesses.values());
  }

  /**
   * Get specific process by ID
   */
  getProcess(processId: string): ClaudeProcess | undefined {
    return this.activeProcesses.get(processId);
  }

  /**
   * Build Claude Code command arguments
   */
  private buildClaudeArgs(request: ClaudeExecutionRequest): string[] {
    const args: string[] = [];
    
    // Use headless mode
    args.push('-p');
    args.push(request.prompt);
    
    // Set output format
    if (request.outputFormat === 'json') {
      args.push('--output-format', 'json');
    }
    
    // Set allowed tools
    if (request.allowedTools.length > 0) {
      args.push('--allowedTools', request.allowedTools.join(','));
    }
    
    // Skip permissions if requested (dangerous)
    if (request.dangerouslySkipPermissions) {
      args.push('--dangerously-skip-permissions');
    }
    
    // Set max tokens
    if (request.maxTokens) {
      args.push('--max-tokens', request.maxTokens.toString());
    }
    
    // Set temperature
    if (request.temperature !== undefined) {
      args.push('--temperature', request.temperature.toString());
    }
    
    return args;
  }

  /**
   * Parse Claude output based on format
   */
  private parseOutput(output: string, format?: string): any {
    if (format === 'json') {
      try {
        // Look for JSON in the output
        const jsonMatch = output.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      } catch (error) {
        console.warn('Failed to parse JSON output:', error);
      }
    }
    
    return output.trim();
  }

  /**
   * Extract token usage from output or logs
   */
  private extractTokenUsage(output: string, logs: string[]): number {
    // Look for token usage in various formats
    const patterns = [
      /(\d+)\s+tokens?\s+used/i,
      /token[s]?\s*used:?\s*(\d+)/i,
      /consumed\s+(\d+)\s+token/i,
      /(\d+)\s+token[s]?\s+consumed/i
    ];
    
    const allText = [output, ...logs].join('\n');
    
    for (const pattern of patterns) {
      const match = allText.match(pattern);
      if (match) {
        return parseInt(match[1]);
      }
    }
    
    // If no explicit token count, estimate based on output length
    return Math.ceil(allText.length / 4); // Rough estimate: 4 chars per token
  }

  /**
   * Detect Claude Code installation path
   */
  private detectClaudePath(): string {
    // In browser environment, we can't access file system paths
    // This would need to be implemented differently for browser vs Node.js
    if (typeof window !== 'undefined') {
      // Browser environment - return default path
      return 'claude';
    }
    
    // Node.js environment
    const homeDir = process?.env?.HOME || '/home/user';
    const possiblePaths = [
      '/usr/local/bin/claude',
      '/opt/homebrew/bin/claude',
      'claude', // System PATH
      '/usr/bin/claude',
      `${homeDir}/.local/bin/claude`,
      `${homeDir}/bin/claude`
    ];
    
    // For now, assume it's in PATH
    // In production, you'd want to actually check these paths
    return 'claude';
  }

  /**
   * Test Claude Code installation
   */
  async testInstallation(): Promise<{ installed: boolean; version?: string; error?: string }> {
    // In browser environment, we can't test local installations
    if (typeof window !== 'undefined') {
      return {
        installed: false,
        error: 'Cannot test Claude Code installation in browser environment'
      };
    }

    if (!spawn) {
      return {
        installed: false,
        error: 'spawn not available - Node.js environment required'
      };
    }

    return new Promise((resolve) => {
      const process = spawn(this.claudePath, ['--version'], {
        stdio: ['pipe', 'pipe', 'pipe']
      });
      
      let output = '';
      let error = '';
      
      process.stdout?.on('data', (data: Buffer) => {
        output += data.toString();
      });
      
      process.stderr?.on('data', (data: Buffer) => {
        error += data.toString();
      });
      
      process.on('close', (code: number) => {
        if (code === 0) {
          const version = output.trim();
          resolve({ installed: true, version });
        } else {
          resolve({ 
            installed: false, 
            error: error || `Process exited with code ${code}` 
          });
        }
      });
      
      process.on('error', (err: Error) => {
        resolve({ 
          installed: false, 
          error: err.message 
        });
      });
      
      // Timeout after 10 seconds
      setTimeout(() => {
        process.kill();
        resolve({ 
          installed: false, 
          error: 'Installation check timed out' 
        });
      }, 10000);
    });
  }

  /**
   * Get Claude Code configuration
   */
  async getConfiguration(): Promise<any> {
    try {
      const result = await this.executeTask({
        prompt: 'Show current configuration and available tools',
        allowedTools: [],
        outputFormat: 'json',
        onProgress: () => {}, // No-op
      });
      
      return result.output;
    } catch (error) {
      console.error('Failed to get Claude configuration:', error);
      return null;
    }
  }

  /**
   * Validate Claude Code setup
   */
  async validateSetup(): Promise<{
    claudeInstalled: boolean;
    apiKeyConfigured: boolean;
    mcpServersAvailable: boolean;
    issues: string[];
  }> {
    const issues: string[] = [];
    
    // Check Claude installation
    const installation = await this.testInstallation();
    if (!installation.installed) {
      issues.push(`Claude Code not installed: ${installation.error}`);
    }
    
    // Check API key (only in Node.js environment)
    let hasApiKey = false;
    if (typeof window === 'undefined' && process?.env) {
      hasApiKey = !!process.env.ANTHROPIC_API_KEY;
    }
    if (!hasApiKey && typeof window === 'undefined') {
      issues.push('ANTHROPIC_API_KEY environment variable not set');
    }
    
    // Check MCP servers (simplified check)
    const mcpConfigExists = true; // You'd check for .claude/desktop/config.json
    if (!mcpConfigExists) {
      issues.push('MCP server configuration not found');
    }
    
    return {
      claudeInstalled: installation.installed,
      apiKeyConfigured: hasApiKey,
      mcpServersAvailable: mcpConfigExists,
      issues
    };
  }

  /**
   * Generate automation prompt templates
   */
  generatePromptTemplate(category: string, task: string): string {
    const templates: Record<string, string> = {
      development: `As a senior developer, please help me with the following development task:

${task}

Please:
1. Analyze the current codebase structure
2. Implement the requested changes following best practices
3. Ensure proper TypeScript typing
4. Add appropriate error handling
5. Update relevant documentation
6. Run tests to verify the changes

Use dark theme styling with Tailwind CSS and maintain consistency with the existing SISO design system.`,

      testing: `As a QA engineer, please help me create comprehensive tests for:

${task}

Please:
1. Analyze the code that needs testing
2. Create unit tests covering edge cases
3. Add integration tests if applicable
4. Ensure good test coverage
5. Follow testing best practices
6. Document test scenarios

Use Jest/Vitest and React Testing Library where applicable.`,

      deployment: `As a DevOps engineer, please help me with deployment:

${task}

Please:
1. Check current deployment configuration
2. Implement the requested deployment changes
3. Ensure proper environment variable management
4. Verify security best practices
5. Test the deployment process
6. Document any changes made

Consider containerization and CI/CD best practices.`,

      analysis: `As a data analyst, please analyze:

${task}

Please:
1. Examine the relevant data/code
2. Identify patterns and insights
3. Generate comprehensive analysis
4. Provide actionable recommendations
5. Create visualizations if helpful
6. Document findings clearly

Focus on performance, usage patterns, and optimization opportunities.`,

      maintenance: `As a system maintainer, please perform maintenance on:

${task}

Please:
1. Assess current system state
2. Identify maintenance needs
3. Perform necessary cleanup/updates
4. Optimize performance where possible
5. Update dependencies safely
6. Document maintenance performed

Prioritize system stability and backward compatibility.`
    };

    return templates[category] || `Please help me with: ${task}`;
  }
}
