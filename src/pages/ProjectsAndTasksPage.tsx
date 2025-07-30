import { useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Home, Component, AlertCircle } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ProjectDirectoryCard } from '@/components/projects/ProjectDirectoryCard';
import { ActiveTasksView } from '@/components/projects/ActiveTasksView';
import { useProjects } from '@/hooks/useProjects';
import { useAuthSession } from '@/hooks/useAuthSession';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { useToast } from '@/hooks/use-toast';

export default function ProjectsAndTasksPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuthSession();
  const { data: project, isLoading, error, refetch } = useProjects();
  
  const isTasksView = location.pathname === '/projects/tasks';

  useEffect(() => {
    if (!authLoading && !user) {
      console.log('No authenticated user, redirecting to auth');
      toast({
        title: "Authentication Required",
        description: "Please sign in to view your projects",
        variant: "destructive"
      });
      navigate('/auth');
    }
  }, [user, authLoading, navigate, toast]);

  if (authLoading) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-32 bg-gray-200 rounded mb-4"></div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink 
                href="/home" 
                className="inline-flex items-center gap-1.5 text-siso-text hover:text-white"
              >
                <Home size={16} strokeWidth={2} aria-hidden="true" />
                Home
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            {isTasksView ? (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink 
                    href="/projects"
                    className="inline-flex items-center gap-1.5 text-siso-text hover:text-white"
                  >
                    Tasks
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Active Tasks</BreadcrumbPage>
                </BreadcrumbItem>
              </>
            ) : (
              <BreadcrumbItem>
                <BreadcrumbPage>Projects</BreadcrumbPage>
              </BreadcrumbItem>
            )}
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gradient-to-r from-[#9b87f5] to-[#6E59A5] mb-2">
              {isTasksView ? 'Tasks' : 'Projects'}
            </h1>
            <p className="text-siso-text">
              {isTasksView 
                ? "Track and manage your tasks efficiently"
                : "Monitor and manage your projects"
              }
            </p>
          </div>
        </div>

        {isTasksView ? (
          <ActiveTasksView />
        ) : (
          <div className="space-y-8">
            <Card className="p-6 bg-black/30 border border-siso-text/10">
              {isLoading ? (
                <div className="animate-pulse space-y-8">
                  <div className="h-64 bg-black/20 rounded-lg" />
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center p-8 text-center">
                  <AlertCircle className="h-12 w-12 text-[#9b87f5] mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Failed to Load Project
                  </h3>
                  <p className="text-siso-text mb-4 max-w-md">
                    {error instanceof Error ? error.message : 'There was an error loading your project'}
                  </p>
                  <Button 
                    onClick={() => refetch()}
                    className="bg-[#9b87f5] hover:bg-[#9b87f5]/80"
                  >
                    Retry
                  </Button>
                </div>
              ) : (
                <ProjectDirectoryCard
                  name={project?.name}
                  description={project?.description}
                  created_at={project?.created_at}
                  status={project?.status}
                  onSelect={() => navigate(`/projects/${project?.name?.toLowerCase()}`)}
                />
              )}
            </Card>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
