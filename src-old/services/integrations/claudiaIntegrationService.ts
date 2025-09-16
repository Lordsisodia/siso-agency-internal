/**
 * SISO Claudia Integration Service
 * 
 * This service manages communication between the SISO app and the Claudia desktop application.
 * Since Claudia is a Tauri desktop app with real Claude Code integration, we interface with it
 * through process management and file-based communication.
 */

interface ClaudiaAgent {
  id: string;
  name: string;
  description: string;
  icon: string;
  created_at: string;
  status: 'active' | 'idle' | 'running';
  executions: number;
  model?: string;
  system_prompt?: string;
}

interface ClaudiaProject {
  id: string;
  name: string;
  path: string;
  status: 'active' | 'idle' | 'error';
  sessions: string[];
  created_at: number;
}

interface ClaudiaSession {
  id: string;
  project_id: string;
  project_path: string;
  created_at: number;
  first_message?: string;
  status: 'running' | 'completed' | 'failed';
}

export class ClaudiaIntegrationService {
  private claudiaPath: string;
  private isClaudiaRunning: boolean = false;
  private claudiaProcess: any = null;

  constructor() {
    // Default path to Claudia executable - this should be configurable
    this.claudiaPath = this.findClaudiaExecutable();
  }

  /**
   * Find the Claudia desktop application executable
   */
  private findClaudiaExecutable(): string {
    const possiblePaths = [
      // macOS paths
      '/Applications/Claudia.app/Contents/MacOS/claudia',
      '~/Applications/Claudia.app/Contents/MacOS/claudia',
      // Development paths
      './projects/claudia-desktop/target/debug/claudia',
      './projects/claudia-desktop/target/release/claudia',
      // Built executable paths
      '../claudia-desktop/target/debug/claudia',
      '../claudia-desktop/target/release/claudia',
    ];

    // For now, use the development path since we're in the same repo
    return '/Users/shaansisodia/Desktop/Cursor/siso-agency-onboarding-app-main-dev/projects/claudia-desktop';
  }

  /**
   * Check if Claudia executable exists and is accessible
   */
  async isClaudiaAvailable(): Promise<boolean> {
    try {
      // Check if the Claudia project directory exists
      const fs = await import('fs');
      const path = await import('path');
      
      const claudiaDir = this.claudiaPath;
      const packageJsonPath = path.join(claudiaDir, 'package.json');
      
      return fs.existsSync(packageJsonPath);
    } catch (error) {
      console.warn('Claudia availability check failed:', error);
      return false;
    }
  }

  /**
   * Launch Claudia desktop application
   */
  async launchClaudia(): Promise<boolean> {
    try {
      if (this.isClaudiaRunning) {
        console.log('Claudia is already running');
        return true;
      }

      // Check if we're in a browser environment
      if (typeof window !== 'undefined' && !window.require) {
        // Browser environment - try to open Claudia via URL or command
        console.log('Attempting to launch Claudia from browser environment...');
        
        // Try to open the Claudia app if it's installed
        try {
          // For development, we'll open the project directory
          const projectPath = this.claudiaPath;
          console.log('Opening Claudia project at:', projectPath);
          
          // Store the launch request in localStorage for potential pickup
          localStorage.setItem('claudia_launch_request', JSON.stringify({
            timestamp: Date.now(),
            projectPath: projectPath,
            action: 'launch'
          }));

          return true;
        } catch (error) {
          console.error('Failed to launch Claudia:', error);
          return false;
        }
      }

      // Node.js environment (if available)
      const { spawn } = await import('child_process');
      
      // Navigate to Claudia directory and start it
      const claudiaProcess = spawn('npm', ['run', 'tauri:dev'], {
        cwd: this.claudiaPath,
        stdio: 'pipe',
        detached: true
      });

      claudiaProcess.on('spawn', () => {
        console.log('Claudia desktop app launched successfully');
        this.isClaudiaRunning = true;
        this.claudiaProcess = claudiaProcess;
      });

      claudiaProcess.on('error', (error) => {
        console.error('Failed to launch Claudia:', error);
        this.isClaudiaRunning = false;
      });

      return true;
    } catch (error) {
      console.error('Error launching Claudia:', error);
      return false;
    }
  }

  /**
   * Get agents from Claudia (mock implementation for now)
   */
  async getAgents(): Promise<ClaudiaAgent[]> {
    // For now, return enhanced mock data that represents real Claudia agents
    // In a full implementation, this would read from Claudia's SQLite database
    // or communicate via IPC
    
    return [
      {
        id: 'claudia-1',
        name: 'Frontend Architect',
        description: 'Specialized in React, TypeScript, and modern frontend architecture',
        icon: 'code',
        created_at: new Date().toISOString(),
        status: 'active',
        executions: 15,
        model: 'sonnet',
        system_prompt: 'You are a senior frontend architect specializing in React and TypeScript...'
      },
      {
        id: 'claudia-2',
        name: 'Supabase Expert',
        description: 'Database schema design, RLS policies, and Supabase integration',
        icon: 'cpu',
        created_at: new Date().toISOString(),
        status: 'idle',
        executions: 8,
        model: 'sonnet',
        system_prompt: 'You are a Supabase expert who helps with database design...'
      },
      {
        id: 'claudia-3',
        name: 'Bug Hunter',
        description: 'Identifies and fixes bugs in React/TypeScript applications',
        icon: 'zap',
        created_at: new Date().toISOString(),
        status: 'active',
        executions: 22,
        model: 'sonnet',
        system_prompt: 'You are a debugging specialist focused on finding and fixing issues...'
      }
    ];
  }

  /**
   * Execute an agent in Claudia
   */
  async executeAgent(agentId: string, task: string, projectPath?: string): Promise<boolean> {
    try {
      console.log(`Executing agent ${agentId} with task: ${task}`);
      
      // Store execution request for potential pickup by Claudia
      const executionRequest = {
        agentId,
        task,
        projectPath: projectPath || process.cwd(),
        timestamp: Date.now(),
        status: 'pending'
      };

      localStorage.setItem(`claudia_execution_${agentId}`, JSON.stringify(executionRequest));
      
      // If Claudia is not running, try to launch it
      if (!this.isClaudiaRunning) {
        await this.launchClaudia();
      }

      return true;
    } catch (error) {
      console.error('Failed to execute agent:', error);
      return false;
    }
  }

  /**
   * Get projects from Claudia
   */
  async getProjects(): Promise<ClaudiaProject[]> {
    // Mock implementation - would read from ~/.claude/projects in real implementation
    return [
      {
        id: 'siso-main',
        name: 'SISO Agency Platform',
        path: '/Users/shaansisodia/Desktop/Cursor/siso-agency-onboarding-app-main-dev',
        status: 'active',
        sessions: ['session-1', 'session-2'],
        created_at: Date.now()
      }
    ];
  }

  /**
   * Get running sessions from Claudia
   */
  async getRunningSessions(): Promise<ClaudiaSession[]> {
    // Mock implementation
    return [];
  }

  /**
   * Create a new agent in Claudia
   */
  async createAgent(agent: Partial<ClaudiaAgent>): Promise<ClaudiaAgent | null> {
    try {
      const newAgent: ClaudiaAgent = {
        id: `agent-${Date.now()}`,
        name: agent.name || 'New Agent',
        description: agent.description || 'A new Claude Code agent',
        icon: agent.icon || 'bot',
        created_at: new Date().toISOString(),
        status: 'idle',
        executions: 0,
        model: agent.model || 'sonnet',
        system_prompt: agent.system_prompt || 'You are a helpful AI assistant.'
      };

      // Store agent creation request
      localStorage.setItem(`claudia_agent_create`, JSON.stringify(newAgent));
      
      return newAgent;
    } catch (error) {
      console.error('Failed to create agent:', error);
      return null;
    }
  }

  /**
   * Open Claudia CC Agents interface
   */
  async openClaudiaAgents(): Promise<boolean> {
    return this.launchClaudia();
  }

  /**
   * Get the status of Claudia integration
   */
  getIntegrationStatus(): {
    available: boolean;
    running: boolean;
    version?: string;
    path: string;
  } {
    return {
      available: true, // We know Claudia exists in the project
      running: this.isClaudiaRunning,
      version: '0.1.0',
      path: this.claudiaPath
    };
  }

  /**
   * Stop Claudia if running
   */
  async stopClaudia(): Promise<boolean> {
    try {
      if (this.claudiaProcess) {
        this.claudiaProcess.kill();
        this.claudiaProcess = null;
        this.isClaudiaRunning = false;
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to stop Claudia:', error);
      return false;
    }
  }
}

// Export singleton instance
export const claudiaService = new ClaudiaIntegrationService();