import { Client } from '@notionhq/client';
import { createClient } from '@supabase/supabase-js';

// Types for Notion integration
export interface NotionTask {
  id: string;
  title: string;
  status: 'Not Started' | 'In Progress' | 'Done';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  description: string;
  project?: string;
  assignee?: string;
  dueDate?: string;
  created: string;
  updated: string;
  source: 'Telegram' | 'WhatsApp' | 'Web App' | 'Voice';
  supabaseId?: string;
  url: string;
}

export interface NotionProject {
  id: string;
  name: string;
  client?: string;
  status: 'Planning' | 'Active' | 'Completed' | 'On Hold';
  progress: number;
  budget?: number;
  startDate?: string;
  endDate?: string;
  description: string;
  tasks: string[];
  url: string;
}

export interface NotionClient {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  status: 'Lead' | 'Active' | 'Completed' | 'Inactive';
  revenue: number;
  lastContact?: string;
  notes: string;
  projects: string[];
  url: string;
}

export interface NotionMetric {
  id: string;
  date: string;
  type: 'Revenue' | 'Expenses' | 'Tasks' | 'Clients';
  value: number;
  description: string;
  source: 'Manual' | 'Automated' | 'API';
  category: 'Financial' | 'Operational' | 'Growth';
}

export interface TaskData {
  title: string;
  description?: string;
  priority?: 'Low' | 'Medium' | 'High' | 'Urgent';
  project?: string;
  assignee?: string;
  dueDate?: string;
  source?: 'Telegram' | 'WhatsApp' | 'Web App' | 'Voice';
  supabaseId?: string;
}

export interface ProjectData {
  name: string;
  client?: string;
  budget?: number;
  startDate?: string;
  endDate?: string;
  description: string;
}

export interface ClientData {
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  notes?: string;
}

export interface MetricData {
  type: 'Revenue' | 'Expenses' | 'Tasks' | 'Clients';
  value: number;
  description: string;
  source?: 'Manual' | 'Automated' | 'API';
  category?: 'Financial' | 'Operational' | 'Growth';
}

export class NotionService {
  private notion: Client;
  private supabase: any;
  private databases = {
    tasks: process.env.NOTION_TASKS_DB_ID!,
    projects: process.env.NOTION_PROJECTS_DB_ID!,
    clients: process.env.NOTION_CLIENTS_DB_ID!,
    metrics: process.env.NOTION_METRICS_DB_ID!
  };

  constructor() {
    this.notion = new Client({
      auth: process.env.NOTION_API_KEY
    });

    // Initialize Supabase for sync
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY) {
      this.supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_KEY
      );
    }
  }

  // ===== TASK MANAGEMENT =====

  async createTask(taskData: TaskData): Promise<NotionTask> {
    try {
      console.log('📝 Creating Notion task:', taskData.title);

      const response = await this.notion.pages.create({
        parent: { database_id: this.databases.tasks },
        properties: {
          'Name': {
            title: [{ text: { content: taskData.title } }]
          },
          'Status': {
            select: { name: 'Not Started' }
          },
          'Priority': {
            select: { name: taskData.priority || 'Medium' }
          },
          'Description': {
            rich_text: [{ text: { content: taskData.description || '' } }]
          },
          'Project': taskData.project ? {
            rich_text: [{ text: { content: taskData.project } }]
          } : undefined,
          'Assignee': taskData.assignee ? {
            rich_text: [{ text: { content: taskData.assignee } }]
          } : undefined,
          'Due Date': taskData.dueDate ? {
            date: { start: taskData.dueDate }
          } : undefined,
          'Source': {
            select: { name: taskData.source || 'Web App' }
          },
          'Task ID': {
            rich_text: [{ text: { content: `task_${Date.now()}` } }]
          },
          'Supabase ID': taskData.supabaseId ? {
            rich_text: [{ text: { content: taskData.supabaseId } }]
          } : undefined
        }
      });

      const notionTask = this.parseNotionTask(response);

      // Sync to Supabase if available
      if (this.supabase) {
        await this.syncTaskToSupabase(notionTask);
      }

      console.log('✅ Notion task created:', notionTask.id);
      return notionTask;

    } catch (error) {
      console.error('❌ Failed to create Notion task:', error);
      throw error;
    }
  }

  async updateTask(taskId: string, updates: Partial<TaskData>): Promise<NotionTask> {
    try {
      console.log('📝 Updating Notion task:', taskId);

      const properties: any = {};

      if (updates.title) {
        properties['Name'] = {
          title: [{ text: { content: updates.title } }]
        };
      }

      if (updates.priority) {
        properties['Priority'] = {
          select: { name: updates.priority }
        };
      }

      if (updates.description) {
        properties['Description'] = {
          rich_text: [{ text: { content: updates.description } }]
        };
      }

      if (updates.project) {
        properties['Project'] = {
          rich_text: [{ text: { content: updates.project } }]
        };
      }

      if (updates.dueDate) {
        properties['Due Date'] = {
          date: { start: updates.dueDate }
        };
      }

      const response = await this.notion.pages.update({
        page_id: taskId,
        properties
      });

      const notionTask = this.parseNotionTask(response);

      // Sync to Supabase if available
      if (this.supabase) {
        await this.syncTaskToSupabase(notionTask);
      }

      console.log('✅ Notion task updated:', taskId);
      return notionTask;

    } catch (error) {
      console.error('❌ Failed to update Notion task:', error);
      throw error;
    }
  }

  async getTasks(filters?: { status?: string; project?: string; limit?: number }): Promise<NotionTask[]> {
    try {
      console.log('📝 Fetching Notion tasks...');

      const filter: any = {};
      
      if (filters?.status) {
        filter.and = filter.and || [];
        filter.and.push({
          property: 'Status',
          select: { equals: filters.status }
        });
      }

      if (filters?.project) {
        filter.and = filter.and || [];
        filter.and.push({
          property: 'Project',
          rich_text: { contains: filters.project }
        });
      }

      const response = await this.notion.databases.query({
        database_id: this.databases.tasks,
        filter: Object.keys(filter).length > 0 ? filter : undefined,
        sorts: [
          {
            property: 'Created',
            direction: 'descending'
          }
        ],
        page_size: filters?.limit || 50
      });

      const tasks = response.results.map(page => this.parseNotionTask(page));
      console.log(`✅ Fetched ${tasks.length} Notion tasks`);
      
      return tasks;

    } catch (error) {
      console.error('❌ Failed to fetch Notion tasks:', error);
      throw error;
    }
  }

  async deleteTask(taskId: string): Promise<void> {
    try {
      console.log('🗑️ Archiving Notion task:', taskId);

      await this.notion.pages.update({
        page_id: taskId,
        archived: true
      });

      console.log('✅ Notion task archived:', taskId);

    } catch (error) {
      console.error('❌ Failed to archive Notion task:', error);
      throw error;
    }
  }

  // ===== PROJECT MANAGEMENT =====

  async createProject(projectData: ProjectData): Promise<NotionProject> {
    try {
      console.log('🚀 Creating Notion project:', projectData.name);

      const response = await this.notion.pages.create({
        parent: { database_id: this.databases.projects },
        properties: {
          'Name': {
            title: [{ text: { content: projectData.name } }]
          },
          'Status': {
            select: { name: 'Planning' }
          },
          'Progress': {
            number: 0
          },
          'Budget': projectData.budget ? {
            number: projectData.budget
          } : undefined,
          'Start Date': projectData.startDate ? {
            date: { start: projectData.startDate }
          } : undefined,
          'End Date': projectData.endDate ? {
            date: { start: projectData.endDate }
          } : undefined,
          'Description': {
            rich_text: [{ text: { content: projectData.description } }]
          },
          'Client': projectData.client ? {
            rich_text: [{ text: { content: projectData.client } }]
          } : undefined
        }
      });

      const notionProject = this.parseNotionProject(response);
      console.log('✅ Notion project created:', notionProject.id);
      
      return notionProject;

    } catch (error) {
      console.error('❌ Failed to create Notion project:', error);
      throw error;
    }
  }

  async getProjects(filters?: { status?: string; client?: string }): Promise<NotionProject[]> {
    try {
      console.log('🚀 Fetching Notion projects...');

      const filter: any = {};
      
      if (filters?.status) {
        filter.and = filter.and || [];
        filter.and.push({
          property: 'Status',
          select: { equals: filters.status }
        });
      }

      if (filters?.client) {
        filter.and = filter.and || [];
        filter.and.push({
          property: 'Client',
          rich_text: { contains: filters.client }
        });
      }

      const response = await this.notion.databases.query({
        database_id: this.databases.projects,
        filter: Object.keys(filter).length > 0 ? filter : undefined,
        sorts: [
          {
            property: 'Start Date',
            direction: 'descending'
          }
        ]
      });

      const projects = response.results.map(page => this.parseNotionProject(page));
      console.log(`✅ Fetched ${projects.length} Notion projects`);
      
      return projects;

    } catch (error) {
      console.error('❌ Failed to fetch Notion projects:', error);
      throw error;
    }
  }

  // ===== CLIENT MANAGEMENT =====

  async createClient(clientData: ClientData): Promise<NotionClient> {
    try {
      console.log('👥 Creating Notion client:', clientData.name);

      const response = await this.notion.pages.create({
        parent: { database_id: this.databases.clients },
        properties: {
          'Name': {
            title: [{ text: { content: clientData.name } }]
          },
          'Email': clientData.email ? {
            email: clientData.email
          } : undefined,
          'Phone': clientData.phone ? {
            phone_number: clientData.phone
          } : undefined,
          'Company': clientData.company ? {
            rich_text: [{ text: { content: clientData.company } }]
          } : undefined,
          'Status': {
            select: { name: 'Lead' }
          },
          'Revenue': {
            number: 0
          },
          'Notes': {
            rich_text: [{ text: { content: clientData.notes || '' } }]
          }
        }
      });

      const notionClient = this.parseNotionClient(response);
      console.log('✅ Notion client created:', notionClient.id);
      
      return notionClient;

    } catch (error) {
      console.error('❌ Failed to create Notion client:', error);
      throw error;
    }
  }

  async getClients(filters?: { status?: string }): Promise<NotionClient[]> {
    try {
      console.log('👥 Fetching Notion clients...');

      const filter: any = {};
      
      if (filters?.status) {
        filter.property = 'Status';
        filter.select = { equals: filters.status };
      }

      const response = await this.notion.databases.query({
        database_id: this.databases.clients,
        filter: Object.keys(filter).length > 0 ? filter : undefined,
        sorts: [
          {
            property: 'Last Contact',
            direction: 'descending'
          }
        ]
      });

      const clients = response.results.map(page => this.parseNotionClient(page));
      console.log(`✅ Fetched ${clients.length} Notion clients`);
      
      return clients;

    } catch (error) {
      console.error('❌ Failed to fetch Notion clients:', error);
      throw error;
    }
  }

  // ===== METRICS & ANALYTICS =====

  async recordMetric(metricData: MetricData): Promise<NotionMetric> {
    try {
      console.log('📈 Recording Notion metric:', metricData.type);

      const response = await this.notion.pages.create({
        parent: { database_id: this.databases.metrics },
        properties: {
          'Date': {
            date: { start: new Date().toISOString().split('T')[0] }
          },
          'Type': {
            select: { name: metricData.type }
          },
          'Value': {
            number: metricData.value
          },
          'Description': {
            rich_text: [{ text: { content: metricData.description } }]
          },
          'Source': {
            select: { name: metricData.source || 'API' }
          },
          'Category': {
            select: { name: metricData.category || 'Operational' }
          }
        }
      });

      const notionMetric = this.parseNotionMetric(response);
      console.log('✅ Notion metric recorded:', notionMetric.id);
      
      return notionMetric;

    } catch (error) {
      console.error('❌ Failed to record Notion metric:', error);
      throw error;
    }
  }

  async getMetrics(dateRange?: { start?: string; end?: string; days?: number }): Promise<NotionMetric[]> {
    try {
      console.log('📈 Fetching Notion metrics...');

      let filter: any = {};

      if (dateRange) {
        const endDate = dateRange.end || new Date().toISOString().split('T')[0];
        let startDate = dateRange.start;
        
        if (dateRange.days && !startDate) {
          const start = new Date();
          start.setDate(start.getDate() - dateRange.days);
          startDate = start.toISOString().split('T')[0];
        }

        if (startDate) {
          filter = {
            property: 'Date',
            date: {
              on_or_after: startDate,
              on_or_before: endDate
            }
          };
        }
      }

      const response = await this.notion.databases.query({
        database_id: this.databases.metrics,
        filter: Object.keys(filter).length > 0 ? filter : undefined,
        sorts: [
          {
            property: 'Date',
            direction: 'descending'
          }
        ]
      });

      const metrics = response.results.map(page => this.parseNotionMetric(page));
      console.log(`✅ Fetched ${metrics.length} Notion metrics`);
      
      return metrics;

    } catch (error) {
      console.error('❌ Failed to fetch Notion metrics:', error);
      throw error;
    }
  }

  // ===== UTILITY METHODS =====

  private parseNotionTask(page: any): NotionTask {
    const props = page.properties;
    
    return {
      id: page.id,
      title: props.Name?.title?.[0]?.text?.content || 'Untitled',
      status: props.Status?.select?.name || 'Not Started',
      priority: props.Priority?.select?.name || 'Medium',
      description: props.Description?.rich_text?.[0]?.text?.content || '',
      project: props.Project?.rich_text?.[0]?.text?.content,
      assignee: props.Assignee?.rich_text?.[0]?.text?.content,
      dueDate: props['Due Date']?.date?.start,
      created: props.Created?.date?.start || page.created_time,
      updated: page.last_edited_time,
      source: props.Source?.select?.name || 'Web App',
      supabaseId: props['Supabase ID']?.rich_text?.[0]?.text?.content,
      url: page.url
    } as NotionTask;
  }

  private parseNotionProject(page: any): NotionProject {
    const props = page.properties;
    
    return {
      id: page.id,
      name: props.Name?.title?.[0]?.text?.content || 'Untitled',
      client: props.Client?.rich_text?.[0]?.text?.content,
      status: props.Status?.select?.name || 'Planning',
      progress: props.Progress?.number || 0,
      budget: props.Budget?.number,
      startDate: props['Start Date']?.date?.start,
      endDate: props['End Date']?.date?.start,
      description: props.Description?.rich_text?.[0]?.text?.content || '',
      tasks: [], // Relations would need separate query
      url: page.url
    };
  }

  private parseNotionClient(page: any): NotionClient {
    const props = page.properties;
    
    return {
      id: page.id,
      name: props.Name?.title?.[0]?.text?.content || 'Untitled',
      email: props.Email?.email,
      phone: props.Phone?.phone_number,
      company: props.Company?.rich_text?.[0]?.text?.content,
      status: props.Status?.select?.name || 'Lead',
      revenue: props.Revenue?.number || 0,
      lastContact: props['Last Contact']?.date?.start,
      notes: props.Notes?.rich_text?.[0]?.text?.content || '',
      projects: [], // Relations would need separate query
      url: page.url
    };
  }

  private parseNotionMetric(page: any): NotionMetric {
    const props = page.properties;
    
    return {
      id: page.id,
      date: props.Date?.date?.start || new Date().toISOString().split('T')[0],
      type: props.Type?.select?.name || 'Tasks',
      value: props.Value?.number || 0,
      description: props.Description?.rich_text?.[0]?.text?.content || '',
      source: props.Source?.select?.name || 'API',
      category: props.Category?.select?.name || 'Operational'
    };
  }

  private async syncTaskToSupabase(notionTask: NotionTask): Promise<void> {
    if (!this.supabase) return;

    try {
      const supabaseTask = {
        notion_id: notionTask.id,
        title: notionTask.title,
        status: notionTask.status.toLowerCase().replace(' ', '_'),
        priority: notionTask.priority.toLowerCase(),
        description: notionTask.description,
        due_date: notionTask.dueDate,
        created_at: notionTask.created,
        updated_at: notionTask.updated,
        metadata: {
          notion_url: notionTask.url,
          source: notionTask.source,
          project: notionTask.project,
          assignee: notionTask.assignee
        }
      };

      await this.supabase
        .from('tasks')
        .upsert(supabaseTask, { onConflict: 'notion_id' });

      console.log('✅ Task synced to Supabase:', notionTask.id);

    } catch (error) {
      console.error('❌ Failed to sync task to Supabase:', error);
    }
  }

  // ===== HEALTH CHECK =====

  async healthCheck(): Promise<{ status: string; databases: Record<string, boolean> }> {
    const health = {
      status: 'healthy',
      databases: {
        tasks: false,
        projects: false,
        clients: false,
        metrics: false
      }
    };

    try {
      // Test each database
      for (const [name, dbId] of Object.entries(this.databases)) {
        try {
          await this.notion.databases.retrieve({ database_id: dbId });
          health.databases[name] = true;
        } catch (error) {
          console.error(`❌ Database ${name} not accessible:`, error);
          health.status = 'degraded';
        }
      }

      console.log('🏥 Notion health check:', health);
      return health;

    } catch (error) {
      console.error('❌ Notion health check failed:', error);
      return {
        status: 'unhealthy',
        databases: health.databases
      };
    }
  }
}

// Export singleton instance
export const notionService = new NotionService(); 