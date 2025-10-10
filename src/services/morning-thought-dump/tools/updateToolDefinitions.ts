/**
 * GPT-5 Nano Update Tool Definitions
 * Allows AI to modify tasks, set times, schedule to timebox
 */

export const MORNING_AI_UPDATE_TOOLS = [
  {
    type: 'function' as const,
    function: {
      name: 'update_task_duration',
      description: 'Set or update the estimated duration for a task in minutes. Use when user tells you how long a task will take.',
      parameters: {
        type: 'object',
        properties: {
          taskId: {
            type: 'string',
            description: 'The task ID to update'
          },
          durationMinutes: {
            type: 'number',
            description: 'Estimated duration in minutes'
          }
        },
        required: ['taskId', 'durationMinutes']
      }
    }
  },
  {
    type: 'function' as const,
    function: {
      name: 'set_task_due_date',
      description: 'Set a due date for a task. Use when user specifies when something needs to be done.',
      parameters: {
        type: 'object',
        properties: {
          taskId: {
            type: 'string',
            description: 'The task ID to update'
          },
          dueDate: {
            type: 'string',
            description: 'Due date in YYYY-MM-DD format'
          }
        },
        required: ['taskId', 'dueDate']
      }
    }
  },
  {
    type: 'function' as const,
    function: {
      name: 'update_task_priority',
      description: 'Change task priority level. Use when user indicates urgency or importance.',
      parameters: {
        type: 'object',
        properties: {
          taskId: {
            type: 'string',
            description: 'The task ID to update'
          },
          priority: {
            type: 'string',
            enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
            description: 'New priority level'
          }
        },
        required: ['taskId', 'priority']
      }
    }
  },
  {
    type: 'function' as const,
    function: {
      name: 'schedule_task_to_timebox',
      description: 'Schedule a task to a specific time in the timebox. Use when user says "schedule this at 10am" or "put this in morning".',
      parameters: {
        type: 'object',
        properties: {
          taskId: {
            type: 'string',
            description: 'The task ID to schedule'
          },
          startTime: {
            type: 'string',
            description: 'Start time in HH:MM format (e.g., "10:00")'
          },
          durationMinutes: {
            type: 'number',
            description: 'How long to block out in minutes'
          }
        },
        required: ['taskId', 'startTime', 'durationMinutes']
      }
    }
  },
  {
    type: 'function' as const,
    function: {
      name: 'bulk_schedule_tasks',
      description: 'Schedule multiple tasks at once with optimal time slots. Use when user says "schedule everything" or "organize my day".',
      parameters: {
        type: 'object',
        properties: {
          schedules: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                taskId: { type: 'string' },
                startTime: { type: 'string' },
                duration: { type: 'number' }
              },
              required: ['taskId', 'startTime', 'duration']
            },
            description: 'Array of task schedules'
          }
        },
        required: ['schedules']
      }
    }
  },
  {
    type: 'function' as const,
    function: {
      name: 'update_subtask_time',
      description: 'Set estimated time for a specific subtask. Use when breaking down task time estimates.',
      parameters: {
        type: 'object',
        properties: {
          subtaskId: {
            type: 'string',
            description: 'The subtask ID to update'
          },
          estimatedTime: {
            type: 'string',
            description: 'Estimated time (e.g., "30m", "1h", "45m")'
          }
        },
        required: ['subtaskId', 'estimatedTime']
      }
    }
  }
];

// Combine with read-only tools
import { MORNING_AI_TOOLS } from './toolDefinitions';

export const ALL_MORNING_AI_TOOLS = [
  ...MORNING_AI_TOOLS,
  ...MORNING_AI_UPDATE_TOOLS
];
