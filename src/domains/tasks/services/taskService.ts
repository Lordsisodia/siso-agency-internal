// Basic task service replacement to unblock build
// This is a simplified version - the original ai-first service had more complex functionality

export interface ProjectTaskSummary {
  projectId: string;
  projectName: string;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  overdueTasks: number;
}

export interface WorkTypeTaskSummary {
  workType: string;
  taskCount: number;
  completedCount: number;
  averageCompletionTime: number;
}

export interface ProjectConfig {
  id: string;
  name: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  deadline?: Date;
}

export interface WorkTypeConfig {
  type: string;
  estimatedHours: number;
  complexity: 'low' | 'medium' | 'high';
  skills: string[];
}

export default class ProjectBasedTaskAgent {
  private userId: string | undefined;

  constructor(userId?: string) {
    this.userId = userId;
    console.log('ProjectBasedTaskAgent initialized for user:', userId);
  }

  async getProjectTaskSummaries(): Promise<ProjectTaskSummary[]> {
    console.log('Fetching project task summaries');
    // Return mock data for now
    return [
      {
        projectId: '1',
        projectName: 'Internal System Updates',
        totalTasks: 12,
        completedTasks: 8,
        pendingTasks: 3,
        overdueTasks: 1
      },
      {
        projectId: '2',
        projectName: 'LifeLock Implementation',
        totalTasks: 8,
        completedTasks: 5,
        pendingTasks: 2,
        overdueTasks: 1
      }
    ];
  }

  async getWorkTypeTaskSummaries(): Promise<WorkTypeTaskSummary[]> {
    console.log('Fetching work type task summaries');
    // Return mock data for now
    return [
      {
        workType: 'Development',
        taskCount: 15,
        completedCount: 10,
        averageCompletionTime: 4.5
      },
      {
        workType: 'Testing',
        taskCount: 8,
        completedCount: 6,
        averageCompletionTime: 2.1
      },
      {
        workType: 'Documentation',
        taskCount: 5,
        completedCount: 4,
        averageCompletionTime: 1.8
      }
    ];
  }

  async createProject(config: ProjectConfig): Promise<string> {
    console.log('Creating project:', config);
    // Return mock project ID
    return `project_${Date.now()}`;
  }

  async updateProject(projectId: string, updates: Partial<ProjectConfig>): Promise<void> {
    console.log('Updating project:', projectId, updates);
  }

  async deleteProject(projectId: string): Promise<void> {
    console.log('Deleting project:', projectId);
  }
}