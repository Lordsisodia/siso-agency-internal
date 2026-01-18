/**
 * Projects Domain
 *
 * Project management, wireframes, and app plans
 */

// 1-discover: Browse and discover projects
export { ProjectCard } from './1-discover/ui/components/ProjectCard';
export { ProjectDirectoryCard } from './1-discover/ui/components/ProjectDirectoryCard';
export { ProjectOnboarding } from './1-discover/ui/components/ProjectOnboarding';

// 2-plan: Plan projects and app plans
export { AppPlanSection } from './2-plan/ui/components/AppPlanSection';
export { PhaseSection } from './2-plan/ui/components/PhaseSection';
export { PhasesNavigation } from './2-plan/ui/components/PhasesNavigation';
export { PlanHeader } from './2-plan/ui/components/PlanHeader';
export { SubsectionContent } from './2-plan/ui/components/SubsectionContent';

// 3-build: Build and develop projects
export { WireframeCard } from './3-build/ui/components/WireframeCard';
export { WireframeNavigation } from './3-build/ui/components/WireframeNavigation';
export { UserFlowDiagram } from './3-build/ui/components/UserFlowDiagram';
export { UserFlowNavigation } from './3-build/ui/components/UserFlowNavigation';
export { UserFlowToolbar } from './3-build/ui/components/UserFlowToolbar';
export { NodeDetailsSidebar } from './3-build/ui/components/NodeDetailsSidebar';
export { ReactFlowImplementation } from './3-build/ui/components/ReactFlowImplementation';

// 4-review: Review and feedback
export { FeatureCard } from './4-review/ui/components/FeatureCard';
export { FeatureControls } from './4-review/ui/components/FeatureControls';
export { FeatureDetailsModal } from './4-review/ui/components/FeatureDetailsModal';
export { FeatureLoadingState } from './4-review/ui/components/FeatureLoadingState';
export { FeatureRequestInput } from './4-review/ui/components/FeatureRequestInput';
export { ActiveTasksSection } from './4-review/ui/components/ActiveTasksSection';
export { FeatureRequestsSection } from './4-review/ui/components/FeatureRequestsSection';

// Pages
export { ActiveTasksView } from './4-review/ui/pages/ActiveTasksView';
export { UserFlowPage } from './3-build/ui/pages/UserFlowPage';

// Shared components
export { TaskDetailsDialog } from './_shared/ui/components/TaskDetailsDialog';
export { TaskDetailsSheet } from './_shared/ui/components/TaskDetailsSheet';
export { TasksList } from './_shared/ui/components/TasksList';

// Types
export type { AppPlan } from './_shared/domain/appPlan.types';
export type { Client } from './_shared/domain/client.types';
