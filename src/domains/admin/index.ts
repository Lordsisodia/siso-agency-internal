/**
 * Admin Domain
 *
 * Administrative dashboard and management
 */

// 1-overview: Admin dashboard and overview
export { AdminStats } from './1-overview/ui/components/AdminStats';
export { DashboardKPI } from './1-overview/ui/components/DashboardKPI';
export { QuickActions } from './1-overview/ui/components/QuickActions';
export { WelcomeBanner } from './1-overview/ui/components/WelcomeBanner';

// 2-clients: Client management
export { AdminClientsView } from './2-clients/ui/pages/AdminClientsView';
export { ClientsTable } from './2-clients/ui/components/ClientsTable';
export { ClientCard } from './2-clients/ui/components/ClientCard';

// 3-partners: Partner management
export { AdminPartnershipDashboard } from './3-partners/ui/pages/AdminPartnershipDashboard';
export { AirtablePartnersTable } from './3-partners/ui/components/AirtablePartnersTable';

// 4-financials: Financial management
export { FinancialsDashboard } from './4-financials/ui/components/FinancialsDashboard';
export { ExpensesTable } from './4-financials/ui/components/ExpensesTable';
export { RevenueTable } from './4-financials/ui/components/RevenueTable';

// 5-settings: Settings
export { AdminSettings } from './5-settings/ui/pages/AdminSettings';

// Shared components
export { AdminLayout } from './_shared/ui/components/AdminLayout';
export { AdminSidebar } from './_shared/ui/components/AdminSidebar';
export { AdminSidebarNavigation } from './_shared/ui/components/AdminSidebarNavigation';

// Hooks
export { useAdminCheck } from './_shared/hooks/useAdminCheck';
