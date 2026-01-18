// API service for connecting to Mac Mini Autonomous Agent Server

const MAC_MINI_SERVER_URL = "http://localhost:8080";

export interface AutonomousAgent {
  id: string;
  name: string;
  type: string;
  status: "active" | "idle" | "error" | "offline";
  lastHeartbeat: string;
  tasksCompleted: number;
  researchCompleted: number;
  successRate: number;
  uptimeSeconds: number;
  claudeCalls: number;
  tokensUsed: number;
  lastClaudeExecution?: string;
  currentTask?: string;
  projectPath?: string;
}

export interface TaskItem {
  id: string;
  taskId: string;
  agentId: string;
  agentType: string;
  description: string;
  taskType: string;
  status: string;
  priority: string;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  claudeResponse?: string;
  tokensUsed?: number;
  executionTime?: number;
  errorMessage?: string;
  projectPath: string;
}

export interface ResearchSession {
  id: string;
  researchId: string;
  topic: string;
  scope: string;
  phase: string;
  status: string;
  qualityTargets: number;
  priority: string;
  requestedBy: string;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  claudeCalls: number;
  tokensUsed: number;
  sourcesFound: number;
  verificationRate: number;
  finalReportPath?: string;
}

export interface DatabaseStats {
  tasksTableSize: number;
  researchTableSize: number;
  agentsTableSize: number;
  logsTableSize: number;
  totalRecords: number;
}

export interface CreateTaskRequest {
  agentId: string;
  agentType: string;
  description: string;
  taskType: string;
  priority: string;
  projectPath: string;
}

export interface CreateResearchRequest {
  topic: string;
  scope: string;
  priority: string;
  requestedBy: string;
  qualityTargets: number;
}

class AutonomousAPI {
  private baseUrl: string;

  constructor(baseUrl: string = MAC_MINI_SERVER_URL) {
    this.baseUrl = baseUrl;
  }

  async checkConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/health`);
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  async getTasks(): Promise<TaskItem[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tasks`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
      throw error;
    }
  }

  async getResearchSessions(): Promise<ResearchSession[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/research`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch research sessions:', error);
      throw error;
    }
  }

  async getDatabaseStats(): Promise<DatabaseStats> {
    try {
      const response = await fetch(`${this.baseUrl}/api/database/stats`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch database stats:', error);
      throw error;
    }
  }

  async createTask(request: CreateTaskRequest): Promise<{ taskId: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Failed to create task:', error);
      throw error;
    }
  }

  async createResearchSession(request: CreateResearchRequest): Promise<{ researchId: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/research`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Failed to create research session:', error);
      throw error;
    }
  }

  async deleteTask(taskId: string): Promise<boolean> {
    try {
      // Import agent client for RLS-safe operations
      const { getAgentClient } = await import('@/services/integrations/supabase/agent-client');
      const agentClient = getAgentClient();
      
      const { error } = await agentClient
        .from('tasks')
        .delete()
        .eq('id', taskId);
      
      if (error) {
        console.error('Failed to delete task:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Failed to delete task:', error);
      return false;
    }
  }

  // Generate agent summaries from tasks (since our server doesn't have dedicated agent endpoints yet)
  generateAgentSummaries(tasks: TaskItem[]): AutonomousAgent[] {
    const agentMap = new Map<string, AutonomousAgent>();
    
    tasks.forEach((task) => {
      if (!agentMap.has(task.agentId)) {
        agentMap.set(task.agentId, {
          id: task.agentId,
          name: task.agentType,
          type: task.agentType,
          status: task.status === "running" ? "active" : 
                 task.status === "failed" ? "error" : "idle",
          lastHeartbeat: task.startedAt || task.createdAt,
          tasksCompleted: 0,
          researchCompleted: 0,
          successRate: 0,
          uptimeSeconds: 0,
          claudeCalls: 0,
          tokensUsed: 0,
          currentTask: task.status === "running" ? task.description : undefined,
          projectPath: task.projectPath
        });
      }

      const agent = agentMap.get(task.agentId)!;
      if (task.status === "completed") agent.tasksCompleted++;
      if (task.tokensUsed) agent.tokensUsed += task.tokensUsed;
      agent.claudeCalls++;
    });

    // Calculate success rates
    agentMap.forEach((agent) => {
      const agentTasks = tasks.filter(t => t.agentId === agent.id);
      const completed = agentTasks.filter(t => t.status === "completed").length;
      agent.successRate = agentTasks.length > 0 ? (completed / agentTasks.length) * 100 : 0;
    });

    return Array.from(agentMap.values());
  }

  // WebSocket connection for real-time updates
  connectWebSocket(onMessage: (data: any) => void): WebSocket | null {
    try {
      const wsUrl = this.baseUrl.replace('http', 'ws') + '/ws';
      const ws = new WebSocket(wsUrl);
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          onMessage(data);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };
      
      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
      
      return ws;
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
      return null;
    }
  }
}

export const autonomousAPI = new AutonomousAPI();
export default autonomousAPI;