import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type Task = Database['public']['Tables']['tasks']['Row'];
type TaskInsert = Database['public']['Tables']['tasks']['Insert'];
type TaskCategory = Database['public']['Enums']['task_category'];
type TaskPriority = Database['public']['Enums']['task_priority'];

export interface ProjectConfig {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  category: TaskCategory;
  isActive: boolean;
}

export interface WorkTypeConfig {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  estimatedDuration: number; // minutes
  focusLevel: 'light' | 'deep';
}

export interface ProjectTaskSummary {
  project: ProjectConfig;
  tasks: Task[];
  totalTasks: number;
  completedTasks: number;
  highPriorityTasks: number;
  estimatedTime: number; // total minutes
  completionPercentage: number;
}

export interface WorkTypeTaskSummary {
  workType: WorkTypeConfig;
  tasks: Task[];
  totalTasks: number;
  estimatedTime: number;
  recommendedTimeBlock: string;
}

export class ProjectBasedTaskAgent {
  private userId: string | null = null;

  // Predefined project configurations
  private projects: ProjectConfig[] = [
    {
      id: 'ubahcrypt',
      name: 'Ubahcrypt',
      description: 'Cryptocurrency and blockchain project development',
      color: 'bg-purple-500',
      icon: '🔐',
      category: 'siso_app_dev',
      isActive: true
    },
    {
      id: 'siso-agency-app',
      name: 'SISO Agency App',
      description: 'Main agency onboarding platform development',
      color: 'bg-orange-500',
      icon: '🏢',
      category: 'onboarding_app',
      isActive: true
    },
    {
      id: 'we-are-excusions',
      name: 'We Are Excusions',
      description: 'Client project for excursion and travel platform',
      color: 'bg-blue-500',
      icon: '🏝️',
      category: 'main',
      isActive: true
    },
    {
      id: 'instagram-marketing',
      name: 'Instagram Marketing',
      description: 'Social media marketing and lead generation',
      color: 'bg-pink-500',
      icon: '📱',
      category: 'instagram',
      isActive: true
    },
    {
      id: 'business-operations',
      name: 'Business Operations',
      description: 'General business tasks and client management',
      color: 'bg-green-500',
      icon: '💼',
      category: 'main',
      isActive: true
    }
  ];

  // Work type configurations
  private workTypes: WorkTypeConfig[] = [
    {
      id: 'light-work',
      name: 'Light Work',
      description: 'Quick tasks, emails, admin, light coding, reviews',
      color: 'bg-yellow-100 text-yellow-800',
      icon: '☀️',
      estimatedDuration: 30,
      focusLevel: 'light'
    },
    {
      id: 'deep-work',
      name: 'Deep Work',
      description: 'Complex development, strategy, planning, creative work',
      color: 'bg-indigo-100 text-indigo-800',
      icon: '🧠',
      estimatedDuration: 120,
      focusLevel: 'deep'
    },
    {
      id: 'client-communication',
      name: 'Client Communication',
      description: 'Calls, meetings, presentations, client updates',
      color: 'bg-blue-100 text-blue-800',
      icon: '🗣️',
      estimatedDuration: 45,
      focusLevel: 'light'
    },
    {
      id: 'creative-work',
      name: 'Creative Work',
      description: 'Design, content creation, brainstorming, innovation',
      color: 'bg-purple-100 text-purple-800',
      icon: '🎨',
      estimatedDuration: 90,
      focusLevel: 'deep'
    },
    {
      id: 'maintenance',
      name: 'Maintenance',
      description: 'Bug fixes, updates, system maintenance, routine tasks',
      color: 'bg-gray-100 text-gray-800',
      icon: '🔧',
      estimatedDuration: 45,
      focusLevel: 'light'
    }
  ];

  constructor(userId?: string) {
    this.userId = userId || null;
  }

  /**
   * Get all project configurations
   */
  getProjects(): ProjectConfig[] {
    return this.projects.filter(p => p.isActive);
  }

  /**
   * Get all work type configurations
   */
  getWorkTypes(): WorkTypeConfig[] {
    return this.workTypes;
  }

  /**
   * Add a new custom project
   */
  addCustomProject(project: Omit<ProjectConfig, 'id'>): ProjectConfig {
    const newProject: ProjectConfig = {
      ...project,
      id: project.name.toLowerCase().replace(/\s+/g, '-')
    };
    
    this.projects.push(newProject);
    return newProject;
  }

  /**
   * Get tasks organized by projects
   */
  async getTasksByProjects(): Promise<ProjectTaskSummary[]> {
    try {
      const { data: allTasks } = await supabase
        .from('tasks')
        .select('*')
        .neq('status', 'completed')
        .order('priority', { ascending: false });

      const projectSummaries: ProjectTaskSummary[] = [];

      for (const project of this.getProjects()) {
        // Filter tasks by project based on category or custom logic
        const projectTasks = this.filterTasksByProject(allTasks || [], project);
        
        const completedProjectTasks = projectTasks.filter(t => t.status === 'completed');
        const highPriorityTasks = projectTasks.filter(t => t.priority === 'high' || t.priority === 'urgent');
        const estimatedTime = projectTasks.reduce((sum, task) => sum + (task.duration || 60), 0);

        projectSummaries.push({
          project,
          tasks: projectTasks,
          totalTasks: projectTasks.length,
          completedTasks: completedProjectTasks.length,
          highPriorityTasks: highPriorityTasks.length,
          estimatedTime,
          completionPercentage: projectTasks.length > 0 
            ? Math.round((completedProjectTasks.length / projectTasks.length) * 100) 
            : 0
        });
      }

      return projectSummaries.sort((a, b) => b.totalTasks - a.totalTasks);
    } catch (error) {
      console.error('Error getting tasks by projects:', error);
      throw new Error('Failed to get tasks by projects');
    }
  }

  /**
   * Get tasks organized by work types
   */
  async getTasksByWorkTypes(): Promise<WorkTypeTaskSummary[]> {
    try {
      const { data: allTasks } = await supabase
        .from('tasks')
        .select('*')
        .neq('status', 'completed')
        .order('priority', { ascending: false });

      const workTypeSummaries: WorkTypeTaskSummary[] = [];

      for (const workType of this.getWorkTypes()) {
        const workTypeTasks = this.categorizeTasksByWorkType(allTasks || [], workType);
        const estimatedTime = workTypeTasks.reduce((sum, task) => sum + (task.duration || workType.estimatedDuration), 0);

        workTypeSummaries.push({
          workType,
          tasks: workTypeTasks,
          totalTasks: workTypeTasks.length,
          estimatedTime,
          recommendedTimeBlock: this.getRecommendedTimeBlock(workType, estimatedTime)
        });
      }

      return workTypeSummaries.filter(summary => summary.totalTasks > 0);
    } catch (error) {
      console.error('Error getting tasks by work types:', error);
      throw new Error('Failed to get tasks by work types');
    }
  }

  /**
   * Filter tasks by project based on category and keywords
   */
  private filterTasksByProject(tasks: Task[], project: ProjectConfig): Task[] {
    return tasks.filter(task => {
      // First, match by category
      if (task.category === project.category) {
        // For more specific filtering within categories
        const title = task.title.toLowerCase();
        const description = (task.description || '').toLowerCase();
        
        switch (project.id) {
          case 'ubahcrypt':
            return title.includes('ubah') || title.includes('crypt') || 
                   description.includes('ubah') || description.includes('crypto');
          
          case 'siso-agency-app':
            return title.includes('siso') || title.includes('agency') || 
                   title.includes('onboarding') || description.includes('siso');
          
          case 'we-are-excusions':
            return title.includes('excusions') || title.includes('excursion') || 
                   title.includes('travel') || description.includes('excusions');
          
          case 'instagram-marketing':
            return task.category === 'instagram';
          
          case 'business-operations':
            // General business tasks that don't fit specific projects
            return !title.includes('ubah') && !title.includes('excusions') && 
                   !title.includes('siso') && task.category === 'main';
          
          default:
            return true;
        }
      }
      
      return false;
    });
  }

  /**
   * Categorize tasks by work type based on content analysis
   */
  private categorizeTasksByWorkType(tasks: Task[], workType: WorkTypeConfig): Task[] {
    return tasks.filter(task => {
      const title = task.title.toLowerCase();
      const description = (task.description || '').toLowerCase();
      const content = `${title} ${description}`;

      switch (workType.id) {
        case 'light-work':
          return content.includes('quick') || content.includes('check') || 
                 content.includes('review') || content.includes('email') ||
                 content.includes('update') || content.includes('admin') ||
                 (task.duration && task.duration <= 45);

        case 'deep-work':
          return content.includes('develop') || content.includes('build') || 
                 content.includes('architect') || content.includes('design') ||
                 content.includes('strategy') || content.includes('plan') ||
                 content.includes('complex') || 
                 (task.duration && task.duration >= 90);

        case 'client-communication':
          return content.includes('call') || content.includes('meeting') || 
                 content.includes('client') || content.includes('presentation') ||
                 content.includes('demo') || content.includes('discuss');

        case 'creative-work':
          return content.includes('design') || content.includes('creative') || 
                 content.includes('brainstorm') || content.includes('concept') ||
                 content.includes('wireframe') || content.includes('mockup');

        case 'maintenance':
          return content.includes('fix') || content.includes('bug') || 
                 content.includes('maintain') || content.includes('update') ||
                 content.includes('clean') || task.category === 'daily';

        default:
          return false;
      }
    });
  }

  /**
   * Get recommended time block for work type
   */
  private getRecommendedTimeBlock(workType: WorkTypeConfig, totalMinutes: number): string {
    const hours = Math.ceil(totalMinutes / 60);
    
    switch (workType.focusLevel) {
      case 'deep':
        if (hours <= 2) return 'Morning (2-hour block)';
        if (hours <= 4) return 'Morning + Afternoon (4-hour blocks)';
        return 'Full day focus sessions';
      
      case 'light':
        if (hours <= 1) return 'Between meetings (30-60 min)';
        if (hours <= 2) return 'End of day (1-2 hours)';
        return 'Multiple short sessions';
      
      default:
        return 'Flexible scheduling';
    }
  }

  /**
   * Create task with project and work type assignment
   */
  async createProjectTask(
    title: string,
    description: string,
    projectId: string,
    workTypeId: string,
    priority: TaskPriority = 'medium'
  ): Promise<TaskInsert> {
    const project = this.projects.find(p => p.id === projectId);
    const workType = this.workTypes.find(w => w.id === workTypeId);

    if (!project) {
      throw new Error(`Project ${projectId} not found`);
    }

    if (!workType) {
      throw new Error(`Work type ${workTypeId} not found`);
    }

    const taskData: TaskInsert = {
      title: `[${project.name}] ${title}`,
      description: `${description}\n\nProject: ${project.name}\nWork Type: ${workType.name}`,
      category: project.category,
      priority,
      status: 'pending',
      created_by: this.userId,
      assigned_to: this.userId,
      created_at: new Date().toISOString(),
      due_date: this.calculateDueDate(workType, priority),
      duration: workType.estimatedDuration
    };

    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert([taskData])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating project task:', error);
      throw new Error('Failed to create project task');
    }
  }

  /**
   * Calculate due date based on work type and priority
   */
  private calculateDueDate(workType: WorkTypeConfig, priority: TaskPriority): string {
    const now = new Date();
    let daysToAdd = 3; // default

    // Adjust based on priority
    switch (priority) {
      case 'urgent':
        daysToAdd = 1;
        break;
      case 'high':
        daysToAdd = 2;
        break;
      case 'medium':
        daysToAdd = 3;
        break;
      case 'low':
        daysToAdd = 7;
        break;
    }

    // Adjust based on work type
    if (workType.focusLevel === 'deep') {
      daysToAdd += 1; // Deep work needs more planning time
    }

    const dueDate = new Date(now.getTime() + daysToAdd * 24 * 60 * 60 * 1000);
    return dueDate.toISOString().split('T')[0];
  }

  /**
   * Get project task insights and recommendations
   */
  async getProjectInsights(): Promise<{
    projectRecommendations: string[];
    workTypeRecommendations: string[];
    timeManagementTips: string[];
  }> {
    try {
      const [projectSummaries, workTypeSummaries] = await Promise.all([
        this.getTasksByProjects(),
        this.getTasksByWorkTypes()
      ]);

      const projectRecommendations: string[] = [];
      const workTypeRecommendations: string[] = [];
      const timeManagementTips: string[] = [];

      // Project insights
      const overloadedProjects = projectSummaries.filter(p => p.totalTasks > 10);
      const stalledProjects = projectSummaries.filter(p => p.completionPercentage < 20 && p.totalTasks > 3);

      if (overloadedProjects.length > 0) {
        projectRecommendations.push(
          `🚨 ${overloadedProjects.map(p => p.project.name).join(', ')} have high task counts. Consider breaking down tasks or delegating.`
        );
      }

      if (stalledProjects.length > 0) {
        projectRecommendations.push(
          `⚠️ ${stalledProjects.map(p => p.project.name).join(', ')} have low completion rates. Review blockers and priorities.`
        );
      }

      // Work type insights
      const deepWorkTasks = workTypeSummaries.find(w => w.workType.id === 'deep-work');
      const lightWorkTasks = workTypeSummaries.find(w => w.workType.id === 'light-work');

      if (deepWorkTasks && deepWorkTasks.estimatedTime > 240) {
        workTypeRecommendations.push(
          `🧠 ${Math.round(deepWorkTasks.estimatedTime / 60)} hours of deep work scheduled. Block focused time slots.`
        );
      }

      if (lightWorkTasks && lightWorkTasks.totalTasks > 15) {
        workTypeRecommendations.push(
          `⚡ ${lightWorkTasks.totalTasks} light work tasks. Consider batching these for efficiency.`
        );
      }

      // Time management tips
      const totalWorkTime = workTypeSummaries.reduce((sum, w) => sum + w.estimatedTime, 0);
      const workHours = Math.round(totalWorkTime / 60);

      if (workHours > 40) {
        timeManagementTips.push(`📅 ${workHours} hours of work scheduled. Consider prioritizing or delegating tasks.`);
      }

      if (deepWorkTasks && lightWorkTasks) {
        timeManagementTips.push('🔄 Mix deep work sessions with light work for optimal productivity.');
      }

      return {
        projectRecommendations,
        workTypeRecommendations,
        timeManagementTips
      };
    } catch (error) {
      console.error('Error getting project insights:', error);
      return {
        projectRecommendations: [],
        workTypeRecommendations: [],
        timeManagementTips: []
      };
    }
  }

  /**
   * Suggest optimal daily schedule based on work types
   */
  suggestDailySchedule(workTypeSummaries: WorkTypeTaskSummary[]): {
    morning: WorkTypeTaskSummary[];
    afternoon: WorkTypeTaskSummary[];
    evening: WorkTypeTaskSummary[];
  } {
    const deepWork = workTypeSummaries.filter(w => w.workType.focusLevel === 'deep');
    const lightWork = workTypeSummaries.filter(w => w.workType.focusLevel === 'light');

    return {
      morning: deepWork, // Deep work when energy is highest
      afternoon: lightWork.filter(w => w.workType.id === 'client-communication'), // Client calls in afternoon
      evening: lightWork.filter(w => w.workType.id !== 'client-communication') // Admin and light tasks in evening
    };
  }
}

export default ProjectBasedTaskAgent;