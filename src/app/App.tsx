import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { ClerkAuthGuard } from '@/domains/auth/ClerkAuthGuard';
import { AuthGuard } from '@/domains/auth/AuthGuard';
import { PageLoader } from '@/components/ui/PageLoader';

// Critical pages loaded immediately (landing, auth, home)
import Index from '@/pages/home/Index';
import Auth from '@/domains/auth/pages/Auth';
import { AdminAutoLogin } from '@/domains/admin/auth/AdminAutoLogin';
import { AdminLayout } from '@/domains/admin/layout/AdminLayout';

// Lazy load all other pages for super-fast initial load
const XPStorePage = lazy(() => import('@/domains/xp-store/1-storefront/ui/pages/XPStorePage'));
const XPDashboardPage = lazy(() => import('@/components/ui/dashboard/pages/XPDashboardPage'));

// Admin pages - heavy bundle, lazy load all
const AdminDashboard = lazy(() => import('@/domains/admin/pages/AdminDashboard'));
const AdminTasks = lazy(() => import('@/domains/admin/pages/AdminTasks'));
const AdminFeedback = lazy(() => import('@/domains/admin/pages/AdminFeedback'));
const AdminLightWork = lazy(() => import('@/domains/task-ui/components/shared-tabs/LightWorkTab.tsx').then(m => ({ default: m.LightWorkTab })));
const AdminDeepWork = lazy(() => import('@/domains/task-ui/components/shared-tabs/DeepWorkTab.tsx').then(m => ({ default: m.DeepWorkTab })));
const AdminLifeLock = lazy(() => import('@/domains/lifelock/_shared/shell/AdminLifeLock'));
const AdminLifeLockDay = lazy(() => import('@/domains/lifelock/_shared/shell/AdminLifeLockDay'));
const AdminLifeLockOverview = lazy(() => import('@/domains/admin/dashboard/pages/AdminLifeLockOverview'));
const WeeklyView = lazy(() => import('@/domains/lifelock/2-weekly/WeeklyView').then(m => ({ default: m.WeeklyView })));
const MonthlyView = lazy(() => import('@/domains/lifelock/3-monthly/MonthlyView'));
const YearlyView = lazy(() => import('@/domains/lifelock/4-yearly/YearlyView'));
const AdminIndustriesViewLazy = lazy(() => import('@/domains/admin/industries/AdminIndustriesView').then(m => ({ default: m.AdminIndustriesView })));
const AdminSettings = lazy(() => import('@/domains/admin/pages/AdminSettings'));
const AdminClients = lazy(() => import('@/domains/admin/pages/AdminClients'));
const AdminPartnershipDashboard = lazy(() => import('@/domains/admin/pages/AdminPartnershipDashboard'));
const TeamMemberTasksPage = lazy(() => import('@/domains/task-ui/pages/TeamMemberTasksPage'));
const AIAssistantPage = lazy(() => import('@/domains/admin/ai-assistant/ui/pages/AIAssistantPage').then(m => ({ default: m.AIAssistantPage })));

// Resources pages
const DocumentLibraryPage = lazy(() => import('@/pages/resources/DocumentLibraryPage'));
const ResourcesPage = lazy(() => import('@/pages/resources/ResourcesPage'));

// Automation & Dev Tools removed for core app

const AdminIndustriesPage = () => (
  <ClerkAuthGuard>
    <AdminLayout>
      <AdminIndustriesViewLazy />
    </AdminLayout>
  </ClerkAuthGuard>
);


function ErrorFallback({error, resetErrorBoundary}: {error: Error, resetErrorBoundary: () => void}) {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold text-white">Something went wrong</h2>
        <p className="text-gray-400">There was an error loading this page</p>
        <button 
          onClick={resetErrorBoundary}
          className="px-4 py-2 bg-[#ea384c] text-white rounded hover:bg-[#d42c47]"
        >
          Try again
        </button>
        <div className="mt-4">
          <a 
            href="/testing" 
            className="text-[#ea384c] hover:underline"
          >
            🧪 Access AI Testing Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <>
      <Toaster />
      <ErrorBoundary 
        FallbackComponent={ErrorFallback}
        onReset={() => window.location.reload()}
      >
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public routes - redirect root to LifeLock */}
            <Route path="/" element={<Navigate to="/admin/life-lock-overview" replace />} />
            <Route path="/index" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/admin-login" element={<AdminAutoLogin />} />

            {/* Admin core */}
            <Route path="/admin" element={<ClerkAuthGuard><AdminDashboard /></ClerkAuthGuard>} />
            <Route path="/admin/dashboard" element={<ClerkAuthGuard><AdminDashboard /></ClerkAuthGuard>} />
            <Route path="/admin/industries" element={<ClerkAuthGuard><AdminIndustriesPage /></ClerkAuthGuard>} />
            <Route path="/admin/clients" element={<ClerkAuthGuard><AdminClients /></ClerkAuthGuard>} />
            <Route path="/admin/partners" element={<ClerkAuthGuard><AdminPartnershipDashboard /></ClerkAuthGuard>} />

            {/* LifeLock */}
            <Route path="/admin/life-lock-overview" element={<ClerkAuthGuard><AdminLifeLockOverview /></ClerkAuthGuard>} />
            <Route path="/admin/lifelock" element={<ClerkAuthGuard><AdminLifeLock /></ClerkAuthGuard>} />
            <Route path="/admin/life-lock" element={<ClerkAuthGuard><AdminLifeLock /></ClerkAuthGuard>} />
            <Route path="/admin/lifelock/daily" element={<AdminLifeLockDay />} />
            <Route path="/admin/lifelock/weekly" element={<ClerkAuthGuard><WeeklyView /></ClerkAuthGuard>} />
            <Route path="/admin/lifelock/monthly" element={<ClerkAuthGuard><MonthlyView /></ClerkAuthGuard>} />
            <Route path="/admin/lifelock/yearly" element={<ClerkAuthGuard><YearlyView /></ClerkAuthGuard>} />
            <Route path="/weekly" element={<Navigate to="/admin/lifelock/weekly" replace />} />
            <Route path="/admin/life-lock/daily" element={<Navigate to="/admin/lifelock/daily" replace />} />
            <Route path="/admin/lifelock/daily/:date" element={<Navigate to="/admin/lifelock/daily" replace />} />
            <Route path="/admin/life-lock/daily/:date" element={<Navigate to="/admin/lifelock/daily" replace />} />
            <Route path="/admin/lifelock/day/:date" element={<Navigate to="/admin/lifelock/daily" replace />} />
            <Route path="/admin/life-lock/day/:date" element={<Navigate to="/admin/lifelock/daily" replace />} />

            {/* Admin productivity */}
            <Route path="/admin/light-work" element={<ClerkAuthGuard><AdminLightWork /></ClerkAuthGuard>} />
            <Route path="/admin/deep-work" element={<ClerkAuthGuard><AdminDeepWork /></ClerkAuthGuard>} />
            <Route path="/admin/tasks" element={<ClerkAuthGuard><AdminTasks /></ClerkAuthGuard>} />
            <Route path="/admin/tasks/:memberId" element={<ClerkAuthGuard><TeamMemberTasksPage /></ClerkAuthGuard>} />
            <Route path="/admin/feedback" element={<ClerkAuthGuard><AdminFeedback /></ClerkAuthGuard>} />
            <Route path="/admin/settings" element={<ClerkAuthGuard><AdminSettings /></ClerkAuthGuard>} />

            {/* AI Assistant */}
            <Route path="/admin/ai-assistant" element={<ClerkAuthGuard><AIAssistantPage /></ClerkAuthGuard>} />

            {/* XP Store */}
            <Route path="/xp-store" element={<ClerkAuthGuard><XPStorePage /></ClerkAuthGuard>} />
            <Route path="/xp-store/:section" element={<ClerkAuthGuard><XPStorePage /></ClerkAuthGuard>} />
            <Route path="/xp-dashboard" element={<ClerkAuthGuard><XPDashboardPage /></ClerkAuthGuard>} />

            {/* Resources */}
            <Route path="/resources" element={<AuthGuard><ResourcesPage /></AuthGuard>} />
            <Route path="/resources/documents" element={<AuthGuard><DocumentLibraryPage /></AuthGuard>} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </>
  );
}

export default App;
