/**
 * Admin Domain - Barrel Export
 *
 * Single source of truth for admin domain components.
 * Use: import { AdminTasks, AdminDashboard } from '@/ecosystem/internal/admin';
 */

// Dashboard Components
export { AdminTasks } from './dashboard/AdminTasks';
export { AdminDashboard } from './dashboard/dashboard.component';

// Page Components
export { default as AdminTasksPage } from './dashboard/pages/AdminTasks';

// UI Components
export { FocusSessionTimer as AdminFocusTimer } from './dashboard/ui/FocusSessionTimer';

// Types
export type * from './dashboard/types';
