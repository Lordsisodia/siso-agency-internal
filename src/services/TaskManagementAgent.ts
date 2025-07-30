import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type Task = Database['public']['Tables']['tasks']['Row'];
type TaskInsert = Database['public']['Tables']['tasks']['Insert'];
type TaskCategory = Database['public']['Enums']['task_category'];
type TaskPriority = Database['public']['Enums']['task_priority'];
type ClientOnboarding = Database['public']['Tables']['client_onboarding']['Row'];
type InstagramLead = Database['public']['Tables']['instagram_leads']['Row'];

export interface TaskRecommendation {
  title: string;
  description: string;
  category: TaskCategory;
  priority: TaskPriority;
  estimatedDuration: number; // minutes
  reasoning: string;
  dueDate?: string;
  assignedTo?: string;
  clientContext?: string;
}

export interface DailyWorkflowSummary {
  totalTasks: number;
  highPriorityTasks: number;
  overdueTasks: number;
  completedToday: number;
  suggestions: TaskRecommendation[];
  focusAreas: string[];
  timeAllocation: Record<TaskCategory, number>;
}

export class TaskManagementAgent {
  private userId: string | null = null;

  constructor(userId?: string) {
    this.userId = userId || null;
  }

  /**
   * Analyze current task landscape and provide intelligent insights
   */
  async analyzeCurrentTasks(): Promise<{
    summary: DailyWorkflowSummary;
    insights: string[];
    recommendations: TaskRecommendation[];
  }> {
    try {
      // Get all active tasks
      const { data: tasks } = await supabase
        .from('tasks')
        .select('*')
        .neq('status', 'completed');

      // Get today's completed tasks
      const today = new Date().toISOString().split('T')[0];
      const { data: completedToday } = await supabase
        .from('tasks')
        .select('*')
        .eq('status', 'completed')
        .gte('completed_at', today);

      // Get client context
      const { data: clients } = await supabase
        .from('client_onboarding')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      // Get Instagram leads context
      const { data: leads } = await supabase
        .from('instagram_leads')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      const analysis = this.generateTaskAnalysis(tasks || [], completedToday || [], clients || [], leads || []);
      
      return analysis;
    } catch (error) {
      console.error('Error analyzing tasks:', error);
      throw new Error('Failed to analyze current tasks');
    }
  }

  /**
   * Generate intelligent task recommendations based on business context
   */
  private generateTaskAnalysis(
    activeTasks: Task[],
    completedToday: Task[],
    clients: ClientOnboarding[],
    leads: InstagramLead[]
  ): {
    summary: DailyWorkflowSummary;
    insights: string[];
    recommendations: TaskRecommendation[];
  } {
    const summary: DailyWorkflowSummary = {
      totalTasks: activeTasks.length,
      highPriorityTasks: activeTasks.filter(t => t.priority === 'high' || t.priority === 'urgent').length,
      overdueTasks: activeTasks.filter(t => t.due_date && new Date(t.due_date) < new Date()).length,
      completedToday: completedToday.length,
      suggestions: [],
      focusAreas: [],
      timeAllocation: this.calculateTimeAllocation(activeTasks)
    };

    const insights = this.generateInsights(activeTasks, clients, leads, summary);
    const recommendations = this.generateRecommendations(activeTasks, clients, leads);

    summary.suggestions = recommendations;
    summary.focusAreas = this.identifyFocusAreas(activeTasks, clients, leads);

    return { summary, insights, recommendations };
  }

  /**
   * Calculate time allocation across task categories
   */
  private calculateTimeAllocation(tasks: Task[]): Record<TaskCategory, number> {
    const allocation: Record<TaskCategory, number> = {
      main: 0,
      weekly: 0,
      daily: 0,
      siso_app_dev: 0,
      onboarding_app: 0,
      instagram: 0
    };

    tasks.forEach(task => {
      const duration = task.duration || 60; // Default 1 hour
      allocation[task.category] += duration;
    });

    return allocation;
  }

  /**
   * Generate actionable insights based on current state
   */
  private generateInsights(
    tasks: Task[],
    clients: ClientOnboarding[],
    leads: InstagramLead[],
    summary: DailyWorkflowSummary
  ): string[] {
    const insights: string[] = [];

    // Task distribution insights
    if (summary.highPriorityTasks > summary.totalTasks * 0.5) {
      insights.push("🚨 High workload alert: Over 50% of tasks are high priority. Consider delegating or reprioritizing.");
    }

    if (summary.overdueTasks > 0) {
      insights.push(`⏰ ${summary.overdueTasks} overdue tasks need immediate attention.`);
    }

    // Client insights
    const recentClients = clients.filter(c => {
      const daysAgo = (Date.now() - new Date(c.created_at).getTime()) / (1000 * 60 * 60 * 24);
      return daysAgo <= 7;
    });

    if (recentClients.length > 0) {
      insights.push(`👥 ${recentClients.length} new clients onboarded this week. Consider creating follow-up tasks.`);
    }

    // Instagram marketing insights
    const recentLeads = leads.filter(l => {
      const daysAgo = (Date.now() - new Date(l.created_at).getTime()) / (1000 * 60 * 60 * 24);
      return daysAgo <= 3;
    });

    if (recentLeads.length > 5) {
      insights.push(`📈 ${recentLeads.length} new Instagram leads in the last 3 days. Schedule outreach tasks.`);
    }

    // Productivity insights
    if (summary.completedToday >= 5) {
      insights.push("🔥 Great productivity today! You've completed multiple tasks.");
    } else if (summary.completedToday === 0 && new Date().getHours() > 12) {
      insights.push("📋 No tasks completed yet today. Consider tackling a quick win to build momentum.");
    }

    // Category balance insights
    const devTasks = tasks.filter(t => t.category === 'siso_app_dev' || t.category === 'onboarding_app').length;
    const businessTasks = tasks.filter(t => t.category === 'main' || t.category === 'instagram').length;

    if (devTasks > businessTasks * 2) {
      insights.push("⚖️ Task imbalance: Heavy focus on development. Consider balancing with business tasks.");
    }

    return insights;
  }

  /**
   * Generate intelligent task recommendations
   */
  private generateRecommendations(
    tasks: Task[],
    clients: ClientOnboarding[],
    leads: InstagramLead[]
  ): TaskRecommendation[] {
    const recommendations: TaskRecommendation[] = [];

    // Client follow-up recommendations
    clients.forEach(client => {
      if (client.step_completed < 10) {
        const nextSteps = this.getClientNextSteps(client);
        nextSteps.forEach(step => recommendations.push(step));
      }
    });

    // Instagram lead outreach recommendations
    const uncontactedLeads = leads.filter(lead => !lead.last_contact_date || lead.contact_attempts === 0);
    if (uncontactedLeads.length > 0) {
      recommendations.push({
        title: `Outreach to ${Math.min(uncontactedLeads.length, 10)} new Instagram leads`,
        description: `Contact fresh leads: ${uncontactedLeads.slice(0, 3).map(l => l.username).join(', ')}${uncontactedLeads.length > 3 ? ' and others' : ''}`,
        category: 'instagram',
        priority: 'medium',
        estimatedDuration: uncontactedLeads.length * 5,
        reasoning: 'Fresh leads have higher conversion rates when contacted quickly',
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      });
    }

    // Daily maintenance recommendations
    const hasMaintenanceTasks = tasks.some(t => t.category === 'daily' && t.title.toLowerCase().includes('maintenance'));
    if (!hasMaintenanceTasks) {
      recommendations.push({
        title: 'System maintenance check',
        description: 'Review app performance, check for errors, update dependencies',
        category: 'daily',
        priority: 'low',
        estimatedDuration: 30,
        reasoning: 'Regular maintenance prevents larger issues'
      });
    }

    // Development recommendations
    const urgentDevTasks = tasks.filter(t => 
      (t.category === 'siso_app_dev' || t.category === 'onboarding_app') && 
      t.priority === 'urgent'
    );

    if (urgentDevTasks.length === 0) {
      recommendations.push({
        title: 'Code review and optimization',
        description: 'Review recent changes, optimize performance, update documentation',
        category: 'siso_app_dev',
        priority: 'medium',
        estimatedDuration: 90,
        reasoning: 'Regular code reviews maintain quality and prevent technical debt'
      });
    }

    // Weekly planning recommendation
    const hasWeeklyPlanning = tasks.some(t => t.category === 'weekly' && t.title.toLowerCase().includes('planning'));
    if (!hasWeeklyPlanning && new Date().getDay() === 1) { // Monday
      recommendations.push({
        title: 'Weekly planning and goal setting',
        description: 'Review last week\'s progress, set this week\'s priorities, plan major tasks',
        category: 'weekly',
        priority: 'high',
        estimatedDuration: 60,
        reasoning: 'Weekly planning improves focus and productivity',
        dueDate: new Date().toISOString().split('T')[0]
      });
    }

    return recommendations.slice(0, 8); // Limit to top 8 recommendations
  }

  /**
   * Identify focus areas for the day/week
   */
  private identifyFocusAreas(tasks: Task[], clients: ClientOnboarding[], leads: InstagramLead[]): string[] {
    const focusAreas: string[] = [];

    // High priority task focus
    const urgentTasks = tasks.filter(t => t.priority === 'urgent');
    if (urgentTasks.length > 0) {
      focusAreas.push(`🚨 Urgent Tasks (${urgentTasks.length})`);
    }

    // Client onboarding focus
    const activeClients = clients.filter(c => c.status === 'active' && c.step_completed < 10);
    if (activeClients.length > 0) {
      focusAreas.push(`👥 Client Onboarding (${activeClients.length} active)`);
    }

    // Instagram marketing focus
    const recentLeads = leads.filter(l => {
      const daysAgo = (Date.now() - new Date(l.created_at).getTime()) / (1000 * 60 * 60 * 24);
      return daysAgo <= 7;
    });
    if (recentLeads.length > 10) {
      focusAreas.push(`📱 Instagram Marketing (${recentLeads.length} new leads)`);
    }

    // Development focus
    const devTasks = tasks.filter(t => t.category === 'siso_app_dev' || t.category === 'onboarding_app');
    if (devTasks.length > 5) {
      focusAreas.push(`💻 Development (${devTasks.length} tasks)`);
    }

    return focusAreas;
  }

  /**
   * Get next steps for client onboarding
   */
  private getClientNextSteps(client: ClientOnboarding): TaskRecommendation[] {
    const steps: TaskRecommendation[] = [];
    const stepMapping = {
      1: 'Complete business requirements gathering',
      2: 'Review and approve project scope',
      3: 'Set up project timeline and milestones',
      4: 'Begin initial design/wireframes',
      5: 'Client approval on designs',
      6: 'Start development phase',
      7: 'First development milestone review',
      8: 'Client testing and feedback',
      9: 'Final revisions and polish',
      10: 'Project delivery and handoff'
    };

    const nextStep = client.step_completed + 1;
    if (nextStep <= 10 && stepMapping[nextStep as keyof typeof stepMapping]) {
      steps.push({
        title: `${client.business_name}: ${stepMapping[nextStep as keyof typeof stepMapping]}`,
        description: `Continue onboarding process for ${client.business_name} - Step ${nextStep}/10`,
        category: 'main',
        priority: client.step_completed < 3 ? 'high' : 'medium',
        estimatedDuration: 60,
        reasoning: `Client is at step ${client.step_completed}, needs progression`,
        clientContext: client.business_name,
        dueDate: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString().split('T')[0]
      });
    }

    return steps;
  }

  /**
   * Create a new task with intelligent defaults
   */
  async createIntelligentTask(
    title: string,
    description?: string,
    context?: 'client' | 'development' | 'marketing' | 'maintenance'
  ): Promise<TaskInsert> {
    const taskData: TaskInsert = {
      title,
      description: description || `Automatically generated task: ${title}`,
      category: this.inferCategory(title, context),
      priority: this.inferPriority(title, context),
      status: 'pending',
      created_by: this.userId,
      assigned_to: this.userId,
      created_at: new Date().toISOString(),
      due_date: this.suggestDueDate(title, context),
      duration: this.estimateDuration(title, context)
    };

    return taskData;
  }

  /**
   * Infer task category from title and context
   */
  private inferCategory(title: string, context?: string): TaskCategory {
    const titleLower = title.toLowerCase();

    if (context === 'development' || titleLower.includes('code') || titleLower.includes('bug') || titleLower.includes('feature')) {
      return titleLower.includes('onboarding') ? 'onboarding_app' : 'siso_app_dev';
    }

    if (context === 'marketing' || titleLower.includes('instagram') || titleLower.includes('outreach') || titleLower.includes('lead')) {
      return 'instagram';
    }

    if (titleLower.includes('daily') || titleLower.includes('maintenance')) {
      return 'daily';
    }

    if (titleLower.includes('weekly') || titleLower.includes('planning')) {
      return 'weekly';
    }

    return 'main';
  }

  /**
   * Infer task priority from title and context
   */
  private inferPriority(title: string, context?: string): TaskPriority {
    const titleLower = title.toLowerCase();

    if (titleLower.includes('urgent') || titleLower.includes('critical') || titleLower.includes('emergency')) {
      return 'urgent';
    }

    if (titleLower.includes('important') || titleLower.includes('priority') || context === 'client') {
      return 'high';
    }

    if (titleLower.includes('maintenance') || titleLower.includes('routine')) {
      return 'low';
    }

    return 'medium';
  }

  /**
   * Suggest due date based on task characteristics
   */
  private suggestDueDate(title: string, context?: string): string {
    const titleLower = title.toLowerCase();
    const now = new Date();

    if (titleLower.includes('urgent') || titleLower.includes('today')) {
      return now.toISOString().split('T')[0];
    }

    if (context === 'client' || titleLower.includes('client')) {
      // Client tasks get 2-day deadline
      const dueDate = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
      return dueDate.toISOString().split('T')[0];
    }

    if (titleLower.includes('weekly')) {
      // Weekly tasks get 7-day deadline
      const dueDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      return dueDate.toISOString().split('T')[0];
    }

    // Default: 3 days
    const dueDate = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    return dueDate.toISOString().split('T')[0];
  }

  /**
   * Estimate task duration in minutes
   */
  private estimateDuration(title: string, context?: string): number {
    const titleLower = title.toLowerCase();

    if (titleLower.includes('quick') || titleLower.includes('check')) {
      return 15; // 15 minutes
    }

    if (titleLower.includes('call') || titleLower.includes('meeting')) {
      return 30; // 30 minutes
    }

    if (context === 'development' || titleLower.includes('code') || titleLower.includes('develop')) {
      return 120; // 2 hours
    }

    if (context === 'client' || titleLower.includes('client')) {
      return 60; // 1 hour
    }

    if (titleLower.includes('planning') || titleLower.includes('strategy')) {
      return 90; // 1.5 hours
    }

    return 60; // Default 1 hour
  }

  /**
   * Get today's priority tasks with intelligent ordering
   */
  async getTodaysPriorities(): Promise<{
    urgent: Task[];
    high: Task[];
    medium: Task[];
    suggestions: string[];
  }> {
    const { data: tasks } = await supabase
      .from('tasks')
      .select('*')
      .neq('status', 'completed')
      .order('priority', { ascending: false })
      .order('due_date', { ascending: true });

    const today = new Date().toISOString().split('T')[0];
    const todayTasks = tasks?.filter(task => 
      !task.due_date || task.due_date <= today
    ) || [];

    const urgent = todayTasks.filter(t => t.priority === 'urgent');
    const high = todayTasks.filter(t => t.priority === 'high');
    const medium = todayTasks.filter(t => t.priority === 'medium');

    const suggestions = this.generateDailySuggestions(urgent, high, medium);

    return { urgent, high, medium, suggestions };
  }

  /**
   * Generate daily workflow suggestions
   */
  private generateDailySuggestions(urgent: Task[], high: Task[], medium: Task[]): string[] {
    const suggestions: string[] = [];

    if (urgent.length > 0) {
      suggestions.push(`🚨 Start with ${urgent.length} urgent task${urgent.length > 1 ? 's' : ''} first`);
    }

    if (high.length > 3) {
      suggestions.push('📋 Consider breaking down high-priority tasks into smaller chunks');
    }

    if (urgent.length === 0 && high.length === 0) {
      suggestions.push('✨ Great! No urgent tasks. Focus on medium-priority items or plan ahead');
    }

    const totalEstimatedTime = [...urgent, ...high, ...medium].reduce((sum, task) => 
      sum + (task.duration || 60), 0
    );

    if (totalEstimatedTime > 480) { // 8 hours
      suggestions.push('⏰ Heavy workload today. Consider delegating or postponing some tasks');
    }

    return suggestions;
  }
}

export default TaskManagementAgent;