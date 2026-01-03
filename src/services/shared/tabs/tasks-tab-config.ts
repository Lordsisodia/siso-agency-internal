import { TabConfig } from '../../types/tab-types';
import { ListChecks } from 'lucide-react';

// Minimal config for the Tasks tab (blank canvas for upcoming work)
const tasksTabConfig: TabConfig = {
  id: 'tasks',
  label: 'Tasks',
  icon: ListChecks,
  component: null as any, // Assigned at runtime
  order: 5,
  enabled: true,

  timeRange: {
    start: 8,
    end: 20,
    priority: 6,
  },

  theme: {
    primary: 'text-amber-400',
    background: 'bg-amber-400/10',
    border: 'border-amber-400/30',
    hover: 'hover:bg-amber-400/20',
    active: 'bg-amber-400/25',
    gradient: 'from-amber-400 to-orange-500',
  },

  accessibility: {
    ariaLabel: 'Tasks Tab',
    description: 'Daily task list and priorities',
    keyboardShortcut: 'Ctrl+6',
    role: 'tab',
    ariaAttributes: {
      'aria-controls': 'tasks-tabpanel',
    },
  },

  permissions: ['user', 'admin'],

  features: ['task-list', 'priorities'],

  environment: 'both',

  validation: {
    required: ['id', 'label', 'icon', 'component', 'theme', 'accessibility', 'permissions'],
    customValidators: [],
    errorMessages: {},
  },

  fallback: {
    label: 'Tasks (Safe Mode)',
    enabled: true,
    theme: {
      primary: 'text-gray-400',
      background: 'bg-gray-400/10',
      border: 'border-gray-400/30',
    },
    features: ['task-list'],
  },

  timeRelevance: [9, 12, 15, 18],
  color: 'from-amber-400 to-orange-500',
  description: 'Task list and daily priorities',
  componentPath: 'TasksSection',
};

export default tasksTabConfig;
