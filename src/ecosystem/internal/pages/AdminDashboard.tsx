
import { AdminLayout } from '@/ecosystem/internal/admin/layout/AdminLayout';
import { StatsOverview } from '@/ecosystem/internal/admin/dashboard/components/StatsOverview';
import { QuickActions } from '@/ecosystem/internal/admin/dashboard/ui/QuickActions';
import { ClientsList } from '@/ecosystem/internal/admin/dashboard/components/ClientsList';
import { AdminTasks } from '@/ecosystem/internal/admin/dashboard/AdminTasks';
import { AdminStats } from '@/ecosystem/internal/admin/dashboard/components/AdminStats';
import { useAdminCheck } from '@/ecosystem/internal/admin/hooks/useAdminCheck';
import { Loader2, Users, Target } from 'lucide-react';
import { useEffect, useState, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/shared/ui/use-toast';
import { useUser } from '@/shared/hooks/useUser';
import { AdminPageTitle } from '@/ecosystem/internal/admin/layout/AdminPageTitle';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';

// Lazy load heavy components
const ProjectBasedTaskDashboard = lazy(() => import('@/ecosystem/internal/admin/dashboard/components/ProjectBasedTaskDashboard').then(m => ({ default: m.ProjectBasedTaskDashboard })));
const AdvancedNormalizedIncidentReport = lazy(() => import('@/shared/ui/advanced-normalized-incident-report'));

export default function AdminDashboard() {
  const { isAdmin, isLoading } = useAdminCheck();
  const { user } = useUser();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: "You don't have admin privileges to access this page.",
      });
      navigate('/home');
    }
  }, [isAdmin, isLoading, navigate, toast]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500 mb-4" />
        <p className="text-gray-200">Verifying admin access...</p>
      </div>
    );
  }

  if (!isAdmin) return null;

  const LoadingSpinner = () => (
    <div className="flex items-center justify-center py-8">
      <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
    </div>
  );

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-6 space-y-6">
        <AdminPageTitle
          icon={Users}
          title="Admin Dashboard"
          subtitle="Welcome to your admin panel — view statistics, quick actions, and more"
        />
        
        {/* Dashboard Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="project-tasks">Project Tasks</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            <StatsOverview />
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <AdminTasks />
                <ClientsList />
              </div>
              <div className="space-y-6">
                <QuickActions />
                <AdminStats />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="project-tasks" className="space-y-6">
            <AdminPageTitle
              icon={Target}
              title="Project Task Organization"
              subtitle="Organize tasks by projects (Ubahcrypt, SISO Agency App, We are excusions) and work types (Light Work, Deep Work)"
            />
            <Suspense fallback={<LoadingSpinner />}>
              <ProjectBasedTaskDashboard />
            </Suspense>
          </TabsContent>
          
          <TabsContent value="reports" className="space-y-6">
            <div className="flex justify-center">
              <Suspense fallback={<LoadingSpinner />}>
                <AdvancedNormalizedIncidentReport />
              </Suspense>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}

