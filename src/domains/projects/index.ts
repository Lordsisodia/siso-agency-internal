/**
 * Projects Domain
 *
 * Project management, wireframes, and app plans
 */

// Types
export type { AppPlan } from './types/appPlan.types';
export type { Client } from './types/client.types';

// Components
export { default as CollapsedProjectCard } from './types/CollapsedProjectCard';
export { default as ProjectCard } from './components/ProjectCard';
export { default as ProjectDetails } from './components/ProjectDetails';
export { default as ProjectDirectoryCard } from './components/ProjectDirectoryCard';
export { default as ProjectOnboarding } from './components/ProjectOnboarding';
export { default as TaskDetailsDialog } from './components/TaskDetailsDialog';
export { default as TaskDetailsSheet } from './components/TaskDetailsSheet';
export { default as TaskPreviewSection } from './components/TaskPreviewSection';
export { default as TasksList } from './components/TasksList';

// Pages
export { default as ActiveTasksView } from './pages/ActiveTasksView';

// Wireframes
export { default as WireframeCard } from './wireframes/WireframeCard';
export { default as WireframeNavigation } from './wireframes/WireframeNavigation';

// Features
export { default as FeatureLoadingState } from './features/FeatureLoadingState';
export { default as FeatureControls } from './features/FeatureControls';
