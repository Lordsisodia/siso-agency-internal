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
export { default as ProjectDetails } from './ProjectDetails';
export { default as TaskDetailsSheet } from './TaskDetailsSheet';

// Wireframes
export { default as WireframeCard } from './wireframes/WireframeCard';
export { default as WireframeNavigation } from './wireframes/WireframeNavigation';

// Features
export { default as FeatureLoadingState } from './features/FeatureLoadingState';
export { default as FeatureControls } from './features/FeatureControls';
export { default as TaskPreviewSection } from './TaskPreviewSection';
