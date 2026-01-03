/**
 * GPT-5 Nano Tool Definitions - What AI can call
 */

export const MORNING_AI_TOOLS = [
  {
    type: 'function' as const,
    function: {
      name: 'get_todays_tasks',
      description: 'Fetch all deep work and light work tasks for today including subtasks. Use this when user asks what they need to do.',
      parameters: {
        type: 'object',
        properties: {
          includeCompleted: {
            type: 'boolean',
            description: 'Include completed tasks (default: false)'
          }
        }
      }
    }
  },
  {
    type: 'function' as const,
    function: {
      name: 'get_task_by_title',
      description: 'Find a specific task by its title or partial name. Use when user mentions a specific task.',
      parameters: {
        type: 'object',
        properties: {
          titleQuery: {
            type: 'string',
            description: 'Task title or keywords to search for'
          }
        },
        required: ['titleQuery']
      }
    }
  },
  {
    type: 'function' as const,
    function: {
      name: 'get_urgent_tasks',
      description: 'Get all HIGH and URGENT priority tasks. Use when user asks about priorities or urgent items.',
      parameters: {
        type: 'object',
        properties: {}
      }
    }
  },
  {
    type: 'function' as const,
    function: {
      name: 'get_deep_work_tasks_only',
      description: 'Get only deep work tasks that require focus. Use when planning focus time or deep work blocks.',
      parameters: {
        type: 'object',
        properties: {}
      }
    }
  },
  {
    type: 'function' as const,
    function: {
      name: 'get_light_work_tasks_only',
      description: 'Get only light work tasks for quick wins. Use when user talks about quick tasks or filling gaps.',
      parameters: {
        type: 'object',
        properties: {}
      }
    }
  },
  {
    type: 'function' as const,
    function: {
      name: 'get_task_subtasks',
      description: 'Get all subtasks for a specific task. Use when user asks to break down a task or see subtasks.',
      parameters: {
        type: 'object',
        properties: {
          taskId: {
            type: 'string',
            description: 'The task ID to get subtasks for'
          }
        },
        required: ['taskId']
      }
    }
  },
  {
    type: 'function' as const,
    function: {
      name: 'get_tasks_by_time',
      description: 'Find tasks within a time constraint. Use when user asks "what can I do in 30 minutes?"',
      parameters: {
        type: 'object',
        properties: {
          maxMinutes: {
            type: 'number',
            description: 'Maximum time in minutes'
          }
        },
        required: ['maxMinutes']
      }
    }
  },
  {
    type: 'function' as const,
    function: {
      name: 'search_tasks',
      description: 'Search tasks by keyword in title or description. Use when user mentions specific keywords like "email", "bug", "client".',
      parameters: {
        type: 'object',
        properties: {
          keyword: {
            type: 'string',
            description: 'Keyword to search for'
          }
        },
        required: ['keyword']
      }
    }
  },
  {
    type: 'function' as const,
    function: {
      name: 'check_upcoming_deadlines',
      description: 'Check for tasks with approaching deadlines. CALL THIS at the start of planning to warn user about urgent items.',
      parameters: {
        type: 'object',
        properties: {
          daysAhead: {
            type: 'number',
            description: 'How many days ahead to check (default: 3)'
          }
        }
      }
    }
  }
];
