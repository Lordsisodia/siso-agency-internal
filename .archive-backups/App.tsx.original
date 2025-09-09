
import { Routes, Route, Navigate } from 'react-router-dom';
import Index from './pages/Index';
import Auth from './pages/Auth';
import Profile from './pages/Profile';
import OnboardingSocial from './pages/onboarding/social';
import { Toaster } from '@/components/ui/toaster';
import OnboardingChat from './pages/OnboardingChat';
import ThankYou from './pages/ThankYou';
import ThankYouPlan from './pages/ThankYou';
import Plan from './pages/Plan';
import DecoraPlan from './pages/DecoraPlan';
import Congratulations from './pages/onboarding/congratulations';
import Home from './pages/Home';
import CryptoExchange from './pages/CryptoExchange';
import HowToEarn from './pages/HowToEarn';
import LeaderboardPage from './pages/LeaderboardPage';
import { AuthGuard } from './components/auth/AuthGuard';
import MyProjects from './pages/MyProjects';
import AdminPlans from './pages/AdminPlans';
import AdminOutreach from './pages/AdminOutreach';
import AdminTemplates from './pages/AdminTemplates';
import AdminTeams from './pages/AdminTeams';
import Portfolio from './pages/Portfolio';
import AdminDashboard from './pages/AdminDashboard';
import AdminClients from './pages/AdminClients';
import AdminPayments from './pages/AdminPayments';
import AdminDailyPlanner from './pages/AdminDailyPlanner';
import ClientDetailPage from './pages/ClientDetailPage';
import AdminTasks from './pages/AdminTasks';
import AdminSettings from './pages/AdminSettings';
import { TeamMemberTasksView } from './components/admin/tasks/TeamMemberTasksView';
import TeamMemberTasksPage from './pages/TeamMemberTasksPage';
import ClientDashboard from "./pages/ClientDashboard";
import ClientDocumentsPage from "./pages/client/ClientDocumentsPage";
import ClientTasksPage from "./pages/client/ClientTasksPage";
import ClientStatusPage from "./pages/client/ClientStatusPage";
import ClientSupportPage from "./pages/client/ClientSupportPage";
import ProjectsAndTasksPage from './pages/ProjectsAndTasksPage';
import DocumentLibraryPage from './pages/resources/DocumentLibraryPage';
import ProjectDetailsPage from './pages/ProjectDetailsPage';
import ResourcesPage from './pages/resources/ResourcesPage';
import TimelinePage from './pages/TimelinePage';
import Communication from './pages/Communication';

// Financial & Account section
import PaymentsPage from './pages/financial/PaymentsPage';
import LeaderboardsPage from './pages/financial/LeaderboardsPage';
import FinancialProfilePage from './pages/financial/FinancialProfilePage';
import ClientAppDetailsPage from './pages/ClientAppDetailsPage';

function App() {
  return (
    <>
      <Toaster />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Index />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/onboarding-chat" element={<OnboardingChat />} />
        <Route path="/thankyou" element={<ThankYou />} />
        <Route path="/thankyou-plan" element={<ThankYouPlan />} />
        <Route path="/plan/:username" element={<Plan />} />
        <Route path="/decora-plan" element={<DecoraPlan />} />
        
        {/* Admin routes - using adminOnly prop to enforce admin access */}
        <Route path="/admin" element={<AuthGuard adminOnly={true}><AdminDashboard /></AuthGuard>} />
        <Route path="/admin/clients" element={<AuthGuard adminOnly={true}><AdminClients /></AuthGuard>} />
        <Route path="/admin/clients/:clientId" element={<AuthGuard adminOnly={true}><ClientDetailPage /></AuthGuard>} />
        <Route path="/admin/outreach" element={<AuthGuard adminOnly={true}><AdminOutreach /></AuthGuard>} />
        <Route path="/admin/templates" element={<AuthGuard adminOnly={true}><AdminTemplates /></AuthGuard>} />
        <Route path="/admin/teams" element={<AuthGuard adminOnly={true}><AdminTeams /></AuthGuard>} />
        <Route path="/admin/payments" element={<AuthGuard adminOnly={true}><AdminPayments /></AuthGuard>} />
        <Route path="/admin/daily-planner" element={<AuthGuard adminOnly={true}><AdminDailyPlanner /></AuthGuard>} />
        <Route path="/admin/tasks" element={<AuthGuard adminOnly={true}><AdminTasks /></AuthGuard>} />
        <Route path="/admin/tasks/:memberId" element={<AuthGuard adminOnly={true}><TeamMemberTasksPage /></AuthGuard>} />
        <Route path="/admin/settings" element={<AuthGuard adminOnly={true}><AdminSettings /></AuthGuard>} />
        <Route path="/admin/plans/create" element={<AuthGuard adminOnly={true}><AdminPlans /></AuthGuard>} />
        <Route path="/admin/plans/:planId/edit" element={<AuthGuard adminOnly={true}><AdminPlans /></AuthGuard>} />
        
        {/* Protected Dashboard Routes */}
        <Route path="/home" element={<AuthGuard><Home /></AuthGuard>} />
        <Route path="/dashboard" element={<AuthGuard><Home /></AuthGuard>} />
        
        {/* Protected Project Routes */}
        <Route path="/projects" element={<AuthGuard><ProjectsAndTasksPage /></AuthGuard>} />
        <Route path="/projects/:id" element={<AuthGuard><ProjectDetailsPage /></AuthGuard>} />
        <Route path="/projects/:id/:tab" element={<AuthGuard><ProjectDetailsPage /></AuthGuard>} />
        <Route path="/projects/tasks" element={<AuthGuard><ProjectsAndTasksPage /></AuthGuard>} />
        <Route path="/my-projects" element={<AuthGuard><MyProjects /></AuthGuard>} />
        <Route path="/plan-builder" element={<AuthGuard><Communication /></AuthGuard>} />
        <Route path="/portfolio" element={<AuthGuard><Portfolio /></AuthGuard>} />
        
        {/* Financial Routes */}
        <Route path="/financial/payments" element={<AuthGuard><PaymentsPage /></AuthGuard>} />
        <Route path="/financial/leaderboards" element={<AuthGuard><LeaderboardsPage /></AuthGuard>} />
        
        {/* Account & Resources Routes */}
        <Route path="/profile" element={<AuthGuard><FinancialProfilePage /></AuthGuard>} />
        <Route path="/resources" element={<AuthGuard><ResourcesPage /></AuthGuard>} />
        <Route path="/resources/documents" element={<AuthGuard><DocumentLibraryPage /></AuthGuard>} />
        
        {/* Redirect legacy routes */}
        <Route path="/financial/profile" element={<AuthGuard><Navigate to="/profile" replace /></AuthGuard>} />
        <Route path="/help" element={<AuthGuard><Navigate to="/resources" replace /></AuthGuard>} />
        <Route path="/settings" element={<AuthGuard><Navigate to="/profile" replace /></AuthGuard>} />
        <Route path="/resources/help" element={<AuthGuard><Navigate to="/resources" replace /></AuthGuard>} />
        <Route path="/resources/help/getting-started" element={<AuthGuard><ResourcesPage /></AuthGuard>} />
        <Route path="/resources/help/documentation" element={<AuthGuard><ResourcesPage /></AuthGuard>} />
        <Route path="/resources/help/faq" element={<AuthGuard><ResourcesPage /></AuthGuard>} />
        
        {/* Client App Details Route */}
        <Route path="/client-app/:clientId" element={<AuthGuard><ClientAppDetailsPage /></AuthGuard>} />
        
        {/* Legacy Financial Routes (redirected for backward compatibility) */}
        <Route path="/payments" element={<AuthGuard><PaymentsPage /></AuthGuard>} />
        <Route path="/economy/earn" element={<AuthGuard><HowToEarn /></AuthGuard>} />
        <Route path="/economy/leaderboards" element={<AuthGuard><LeaderboardPage /></AuthGuard>} />
        
        {/* Client Dashboard Routes - accessible to all authenticated users but with conditional content */}
        <Route path="/client-dashboard" element={<AuthGuard><ClientDashboard /></AuthGuard>} />
        <Route path="/client-dashboard/documents" element={<AuthGuard><ClientDocumentsPage /></AuthGuard>} />
        <Route path="/client-dashboard/tasks" element={<AuthGuard><ClientTasksPage /></AuthGuard>} />
        <Route path="/client-dashboard/status" element={<AuthGuard><ClientStatusPage /></AuthGuard>} />
        <Route path="/client-dashboard/support" element={<AuthGuard><ClientSupportPage /></AuthGuard>} />
      </Routes>
    </>
  );
}

export default App;
