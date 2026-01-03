/**
 * Admin Domain - Barrel Export
 *
 * Single source of truth for admin domain components.
 * Use: import { AdminTasks, AdminDashboard } from '@/domains/admin';
 */

// Dashboard Components
export { AdminTasks } from './dashboard/AdminTasks';
export { AdminDashboard } from './dashboard/dashboard.component';

// Page Components
export { default as AdminTasksPage } from './dashboard/domains/admin/pages/AdminTasks';

// UI Components
export { FocusSessionTimer as AdminFocusTimer } from './dashboard/ui/FocusSessionTimer';

// Types
export type * from './dashboard/types';
