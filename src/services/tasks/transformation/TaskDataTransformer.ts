/**
 * 🔄 Task Data Transformer - Focused data transformation utilities
 * 
 * This module handles all data transformation operations for tasks across the system.
 * It provides conversion between different data formats, API response normalization,
 * and data shape transformations for both light work and deep work tasks.
 * 
 * Business Context:
 * Data transformation is essential for:
 * - Converting between database and UI formats
 * - Normalizing API responses from different sources
 * - Adapting data for different components and contexts
 * - Ensuring consistent data shapes across the application
 * 
 * Transformation Categories:
 * - Database row to Task object conversion
 * - API response normalization
 * - UI-specific data formatting
 * - Cross-context data adaptation
 * - Batch transformation operations
 */

import { Task } from '@/components/tasks/TaskCard';

// Transformation configuration
const TRANSFORMER_CONFIG = {
  DATE_FORMAT: 'YYYY-MM-DD HH:mm:ss',
  TIMEZONE: 'UTC',
  MAX_DESCRIPTION_LENGTH: 500,
  FALLBACK_PRIORITY: 'medium' as const,
  FALLBACK_STATUS: 'pending' as const
} as const;

// Raw database row interface
interface DatabaseTaskRow {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  task_type: string;
  level?: number;
  focus_intensity?: number;
  context?: string;
  estimated_duration?: number;
  actual_duration?: number;
  completion_progress?: number;
  dependencies?: string[] | string;
  subtasks?: any[] | string;
  tools?: string[] | string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
  due_date?: string;
  [key: string]: any;
}

// API response interfaces
interface ApiTaskResponse {
  data: DatabaseTaskRow[];
  meta?: {
    total: number;
    page: number;
    per_page: number;
  };
}

interface TransformationResult<T> {
  success: boolean;
  data?: T;
  errors: string[];
  warnings: string[];
}

interface TransformationOptions {
  includeSubtasks?: boolean;
  includeDependencies?: boolean;
  includeMetadata?: boolean;
  contextFormat?: 'ui' | 'api' | 'storage';
  validateOutput?: boolean;
}

/**
 * Task Data Transformer - Centralized data transformation for all task operations.
 * 
 * This class provides reliable, consistent transformation between different data formats
 * used throughout the task management system. All transformations include error handling
 * and data validation to ensure data integrity.
 */
export class TaskDataTransformer {

  /**
   * Transform a database row to a Task object.
   * Handles all data type conversions and normalization.
   */
  static transformDatabaseRowToTask(
    row: DatabaseTaskRow, 
    options: TransformationOptions = {}
  ): TransformationResult<Task> {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Handle JSON field parsing with error recovery
      let subtasks: Task['subtasks'] = [];
      if (row.subtasks && options.includeSubtasks !== false) {
        try {
          subtasks = typeof row.subtasks === 'string' 
            ? JSON.parse(row.subtasks) 
            : row.subtasks;
        } catch (e) {
          warnings.push('Failed to parse subtasks, using empty array');
          subtasks = [];
        }
      }

      let dependencies: string[] = [];
      if (row.dependencies && options.includeDependencies !== false) {
        try {
          dependencies = typeof row.dependencies === 'string'
            ? JSON.parse(row.dependencies)
            : Array.isArray(row.dependencies) 
              ? row.dependencies 
              : [];
        } catch (e) {
          warnings.push('Failed to parse dependencies, using empty array');
          dependencies = [];
        }
      }

      let tools: string[] = [];
      if (row.tools) {
        try {
          tools = typeof row.tools === 'string'
            ? JSON.parse(row.tools)
            : Array.isArray(row.tools)
              ? row.tools
              : [];
        } catch (e) {
          warnings.push('Failed to parse tools, using empty array');
          tools = [];
        }
      }

      // Validate and normalize status
      const validStatuses = ['pending', 'in-progress', 'completed', 'blocked'] as const;
      const status = validStatuses.includes(row.status as any) 
        ? row.status as Task['status']
        : TRANSFORMER_CONFIG.FALLBACK_STATUS;
      
      if (row.status !== status) {
        warnings.push(`Invalid status '${row.status}', using '${status}'`);
      }

      // Validate and normalize priority
      const validPriorities = ['low', 'medium', 'high', 'critical'] as const;
      const priority = validPriorities.includes(row.priority as any)
        ? row.priority as Task['priority']
        : TRANSFORMER_CONFIG.FALLBACK_PRIORITY;

      if (row.priority !== priority) {
        warnings.push(`Invalid priority '${row.priority}', using '${priority}'`);
      }

      // Transform the task object
      const task: Task = {
        id: row.id,
        title: row.title?.trim() || '',
        description: row.description?.trim() || '',
        status,
        priority,
        level: row.level || 0,
        dependencies,
        focusIntensity: row.focus_intensity || 1,
        context: row.context || 'general',
        ...(subtasks.length > 0 && { subtasks }),
        ...(tools.length > 0 && { tools })
      };

      // Add optional metadata based on context
      if (options.includeMetadata) {
        const metadata = {
          createdAt: row.created_at,
          updatedAt: row.updated_at,
          ...(row.completed_at && { completedAt: row.completed_at }),
          ...(row.due_date && { dueDate: row.due_date }),
          ...(row.estimated_duration && { estimatedDuration: row.estimated_duration }),
          ...(row.actual_duration && { actualDuration: row.actual_duration }),
          ...(row.completion_progress && { completionProgress: row.completion_progress })
        };
        
        (task as any).metadata = metadata;
      }

      // Validate required fields
      if (!task.id) {
        errors.push('Task ID is required');
      }
      if (!task.title) {
        errors.push('Task title is required');
      }

      // Context-specific formatting
      if (options.contextFormat === 'ui') {
        task.title = this.formatTitleForUI(task.title);
        task.description = this.formatDescriptionForUI(task.description);
      }

      return {
        success: errors.length === 0,
        data: errors.length === 0 ? task : undefined,
        errors,
        warnings
      };

    } catch (error) {
      console.error('❌ Task transformation failed:', error);
      return {
        success: false,
        errors: [`Transformation failed: ${(error as Error).message}`],
        warnings
      };
    }
  }

  /**
   * Transform multiple database rows to Task objects.
   * Includes batch error handling and progress tracking.
   */
  static transformDatabaseRowsToTasks(
    rows: DatabaseTaskRow[],
    options: TransformationOptions = {}
  ): TransformationResult<Task[]> {
    const tasks: Task[] = [];
    const allErrors: string[] = [];
    const allWarnings: string[] = [];
    let successCount = 0;

    for (let i = 0; i < rows.length; i++) {
      const result = this.transformDatabaseRowToTask(rows[i], options);
      
      if (result.success && result.data) {
        tasks.push(result.data);
        successCount++;
      } else {
        allErrors.push(`Row ${i + 1}: ${result.errors.join(', ')}`);
      }

      allWarnings.push(...result.warnings.map(w => `Row ${i + 1}: ${w}`));
    }

    console.log(`🔄 Transformed ${successCount}/${rows.length} tasks successfully`);

    return {
      success: successCount > 0,
      data: tasks,
      errors: allErrors,
      warnings: allWarnings
    };
  }

  /**
   * Transform Task object to database row format.
   * Prepares data for database insertion or update.
   */
  static transformTaskToDatabaseRow(
    task: Task,
    options: TransformationOptions = {}
  ): TransformationResult<DatabaseTaskRow> {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Validate required fields
      if (!task.id) {
        errors.push('Task ID is required for database storage');
      }
      if (!task.title?.trim()) {
        errors.push('Task title is required for database storage');
      }

      // Prepare the database row
      const row: DatabaseTaskRow = {
        id: task.id,
        title: task.title.trim(),
        description: task.description?.trim() || '',
        status: task.status,
        priority: task.priority,
        task_type: this.inferTaskTypeFromTask(task),
        level: task.level || 0,
        focus_intensity: task.focusIntensity || 1,
        context: task.context || 'general',
        updated_at: new Date().toISOString(),
        created_at: (task as any).metadata?.createdAt || new Date().toISOString()
      };

      // Handle JSON fields with validation
      if (task.subtasks && task.subtasks.length > 0) {
        try {
          row.subtasks = JSON.stringify(task.subtasks);
        } catch (e) {
          warnings.push('Failed to serialize subtasks');
        }
      }

      if (task.dependencies && task.dependencies.length > 0) {
        try {
          row.dependencies = JSON.stringify(task.dependencies);
        } catch (e) {
          warnings.push('Failed to serialize dependencies');
        }
      }

      if (task.tools && task.tools.length > 0) {
        try {
          row.tools = JSON.stringify(task.tools);
        } catch (e) {
          warnings.push('Failed to serialize tools');
        }
      }

      // Add optional metadata
      const metadata = (task as any).metadata;
      if (metadata) {
        row.estimated_duration = metadata.estimatedDuration;
        row.actual_duration = metadata.actualDuration;
        row.completion_progress = metadata.completionProgress;
        row.due_date = metadata.dueDate;
        row.completed_at = metadata.completedAt;
      }

      return {
        success: errors.length === 0,
        data: errors.length === 0 ? row : undefined,
        errors,
        warnings
      };

    } catch (error) {
      console.error('❌ Task to database transformation failed:', error);
      return {
        success: false,
        errors: [`Database transformation failed: ${(error as Error).message}`],
        warnings
      };
    }
  }

  /**
   * Transform API response to normalized task data.
   * Handles different API response formats and structures.
   */
  static transformApiResponseToTasks(
    response: ApiTaskResponse,
    options: TransformationOptions = {}
  ): TransformationResult<{ tasks: Task[]; meta?: any }> {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      if (!response.data || !Array.isArray(response.data)) {
        errors.push('API response must contain data array');
        return { success: false, errors, warnings };
      }

      const transformResult = this.transformDatabaseRowsToTasks(response.data, options);
      
      if (!transformResult.success) {
        errors.push(...transformResult.errors);
      }
      
      warnings.push(...transformResult.warnings);

      return {
        success: transformResult.success,
        data: {
          tasks: transformResult.data || [],
          meta: response.meta
        },
        errors,
        warnings
      };

    } catch (error) {
      console.error('❌ API response transformation failed:', error);
      return {
        success: false,
        errors: [`API transformation failed: ${(error as Error).message}`],
        warnings
      };
    }
  }

  /**
   * Transform tasks for specific UI contexts.
   * Adapts data format for different UI components.
   */
  static transformTasksForUI(
    tasks: Task[],
    uiContext: 'list' | 'card' | 'detail' | 'calendar'
  ): TransformationResult<Task[]> {
    const transformedTasks = tasks.map(task => {
      const uiTask = { ...task };

      switch (uiContext) {
        case 'list':
          // Truncate descriptions for list view
          if (uiTask.description && uiTask.description.length > 100) {
            uiTask.description = uiTask.description.substring(0, 97) + '...';
          }
          break;

        case 'card':
          // Format for card display
          uiTask.title = this.formatTitleForUI(uiTask.title);
          break;

        case 'detail':
          // Full data for detail view
          uiTask.description = this.formatDescriptionForUI(uiTask.description);
          break;

        case 'calendar':
          // Calendar-specific formatting
          if ((uiTask as any).metadata?.dueDate) {
            (uiTask as any).displayDate = this.formatDateForCalendar((uiTask as any).metadata.dueDate);
          }
          break;
      }

      return uiTask;
    });

    return {
      success: true,
      data: transformedTasks,
      errors: [],
      warnings: []
    };
  }

  /**
   * Batch transform tasks for export operations.
   * Prepares data for CSV, JSON, or other export formats.
   */
  static transformTasksForExport(
    tasks: Task[],
    exportFormat: 'csv' | 'json' | 'xml'
  ): TransformationResult<any> {
    try {
      switch (exportFormat) {
        case 'csv':
          return this.transformTasksToCSV(tasks);
        case 'json':
          return this.transformTasksToJSON(tasks);
        case 'xml':
          return this.transformTasksToXML(tasks);
        default:
          return {
            success: false,
            errors: [`Unsupported export format: ${exportFormat}`],
            warnings: []
          };
      }
    } catch (error) {
      return {
        success: false,
        errors: [`Export transformation failed: ${(error as Error).message}`],
        warnings: []
      };
    }
  }

  // Private utility methods

  private static formatTitleForUI(title: string): string {
    return title.charAt(0).toUpperCase() + title.slice(1);
  }

  private static formatDescriptionForUI(description: string): string {
    if (!description) return '';
    return description.length > TRANSFORMER_CONFIG.MAX_DESCRIPTION_LENGTH
      ? description.substring(0, TRANSFORMER_CONFIG.MAX_DESCRIPTION_LENGTH - 3) + '...'
      : description;
  }

  private static formatDateForCalendar(dateString: string): string {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch {
      return dateString;
    }
  }

  private static inferTaskTypeFromTask(task: Task): string {
    // Infer task type based on characteristics
    if (task.focusIntensity && task.focusIntensity >= 2) {
      return 'deep_work';
    }
    return 'light_work';
  }

  private static transformTasksToCSV(tasks: Task[]): TransformationResult<string> {
    const headers = ['ID', 'Title', 'Description', 'Status', 'Priority', 'Focus Intensity', 'Context'];
    const rows = tasks.map(task => [
      task.id,
      task.title,
      task.description || '',
      task.status,
      task.priority,
      task.focusIntensity?.toString() || '1',
      task.context || 'general'
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    return { success: true, data: csvContent, errors: [], warnings: [] };
  }

  private static transformTasksToJSON(tasks: Task[]): TransformationResult<string> {
    try {
      const jsonContent = JSON.stringify(tasks, null, 2);
      return { success: true, data: jsonContent, errors: [], warnings: [] };
    } catch (error) {
      return {
        success: false,
        errors: [`JSON serialization failed: ${(error as Error).message}`],
        warnings: []
      };
    }
  }

  private static transformTasksToXML(tasks: Task[]): TransformationResult<string> {
    const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<tasks>
${tasks.map(task => `  <task id="${task.id}">
    <title>${this.escapeXML(task.title)}</title>
    <description>${this.escapeXML(task.description || '')}</description>
    <status>${task.status}</status>
    <priority>${task.priority}</priority>
    <focusIntensity>${task.focusIntensity || 1}</focusIntensity>
    <context>${task.context || 'general'}</context>
  </task>`).join('\n')}
</tasks>`;

    return { success: true, data: xmlContent, errors: [], warnings: [] };
  }

  private static escapeXML(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
}