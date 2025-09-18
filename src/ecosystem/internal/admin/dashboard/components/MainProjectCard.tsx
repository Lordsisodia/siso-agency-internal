import { motion } from 'framer-motion';
import { Card, CardContent } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Plus, FolderPlus, GitBranch, Code, Server, Briefcase } from 'lucide-react';
import { Badge } from '@/shared/ui/badge';
import { Progress } from '@/shared/ui/progress';
import { useMainUserProject } from '@/ecosystem/internal/projects/hooks/useUserProjects';
import { useClientData } from '@/ecosystem/internal/projects/hooks/useClientData';
import { Skeleton } from '@/shared/ui/skeleton';

export function MainProjectCard() {
  const navigate = useNavigate();
  const { project, hasProjects, projectCount, loading } = useMainUserProject();
  const { data: clientData, isLoading: clientLoading } = useClientData();

  if (loading || clientLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="mb-6"
      >
        <Card className="border border-siso-border/20 bg-gradient-to-br from-black/40 to-siso-bg/10">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="md:w-1/4 flex-shrink-0 flex justify-center md:justify-start">
                <Skeleton className="h-24 w-24 rounded-full" />
              </div>
              <div className="md:w-3/4 space-y-4">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-32" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // If user has no projects, show create project card
  if (!hasProjects) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="mb-6"
      >
        <Card 
          className="bg-black/30 backdrop-blur-sm border border-white/10 shadow-lg hover:border-orange-500/40 cursor-pointer transition-all duration-300"
          onClick={() => navigate('/onboarding')}
        >
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6 items-center">
              <div className="md:w-1/4 flex-shrink-0 flex justify-center md:justify-start">
                <div className="h-24 w-24 rounded-full bg-gradient-to-br from-orange-500/20 to-red-500/10 flex items-center justify-center ring-4 ring-orange-500/20">
                  <FolderPlus size={42} className="text-orange-500" />
                </div>
              </div>
              
              <div className="md:w-3/4 space-y-4 text-center md:text-left">
                <div>
                  <h2 className="text-2xl font-bold text-white">Create Your First Project</h2>
                  <p className="text-gray-300 text-sm">
                    {clientData ? `Welcome ${clientData.company_name || clientData.contact_name}! ` : ''}
                    Get started by creating your first project with SISO Agency.
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button 
                    className="bg-orange-600 hover:bg-orange-700 text-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate('/onboarding');
                    }}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Start New Project
                  </Button>
                  {clientData && (
                    <Button 
                      variant="outline"
                      className="border-white/20 text-gray-300 hover:bg-white/10"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate('/client-dashboard');
                      }}
                    >
                      <Briefcase className="mr-2 h-4 w-4" />
                      Client Dashboard
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // Show user's main project
  const getStatusColor = (status: string) => {
    switch(status?.toLowerCase()) {
      case 'active': 
      case 'in_progress':
        return { 
          border: 'border-green-500/20', 
          bg: 'bg-gradient-to-br from-black/40 to-green-900/10',
          badgeColor: 'bg-green-500/20 text-green-300 border-green-500/40',
          icon: 'text-green-400'
        };
      case 'paused':
        return { 
          border: 'border-amber-500/20', 
          bg: 'bg-gradient-to-br from-black/40 to-amber-900/10',
          badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          icon: 'text-amber-400'
        };
      case 'completed':
        return { 
          border: 'border-blue-500/20', 
          bg: 'bg-gradient-to-br from-black/40 to-blue-900/10',
          badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
          icon: 'text-blue-400'
        };
      default:
        return { 
          border: 'border-siso-orange/20', 
          bg: 'bg-gradient-to-br from-black/40 to-siso-orange/5',
          badgeColor: 'bg-siso-orange/20 text-siso-orange border-siso-orange/40',
          icon: 'text-siso-orange'
        };
    }
  };

  const statusStyles = getStatusColor(project?.status || 'active');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="mb-6"
    >
      <Card 
        className={`${statusStyles.border} ${statusStyles.bg} hover:border-opacity-60 cursor-pointer transition-all duration-300`}
        onClick={() => navigate(`/projects/${project?.id}`)}
      >
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="md:w-1/4 flex-shrink-0 flex justify-center md:justify-start">
              <div className={`h-24 w-24 rounded-full bg-gradient-to-br from-siso-orange/20 to-siso-red/10 flex items-center justify-center ring-4 ring-siso-orange/20`}>
                <Briefcase size={42} className={statusStyles.icon} />
              </div>
            </div>
            
            <div className="md:w-3/4 space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-white">{project?.name || 'Untitled Project'}</h2>
                  <p className="text-siso-text-muted text-sm">
                    {project?.description || 'No description available'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className={statusStyles.badgeColor}>
                    {project?.status || 'Active'}
                  </Badge>
                  {projectCount > 1 && (
                    <Badge variant="outline" className="border-siso-border text-siso-text">
                      +{projectCount - 1} more
                    </Badge>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-siso-text-muted">
                    <Code size={16} />
                    <span>Development</span>
                  </div>
                  <Progress 
                    value={project?.completion_percentage || 0} 
                    className="h-2" 
                    indicatorClassName="bg-siso-orange" 
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-siso-text-muted">
                    <Server size={16} />
                    <span>Integration</span>
                  </div>
                  <Progress 
                    value={Math.max(0, (project?.completion_percentage || 0) - 20)} 
                    className="h-2" 
                    indicatorClassName="bg-siso-orange" 
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-siso-text-muted">
                    <GitBranch size={16} />
                    <span>Testing</span>
                  </div>
                  <Progress 
                    value={Math.max(0, (project?.completion_percentage || 0) - 40)} 
                    className="h-2" 
                    indicatorClassName="bg-siso-orange" 
                  />
                </div>
              </div>
              
              <div className="flex justify-between items-center pt-3">
                <div className="text-siso-text-muted text-sm">
                  <strong>Created:</strong> {project?.created_at ? new Date(project.created_at).toLocaleDateString() : 'Unknown'}
                </div>
                <div className="flex gap-2">
                  <Button 
                    size="sm"
                    variant="outline"
                    className="border-siso-border text-siso-text hover:bg-siso-bg-alt"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate('/my-projects');
                    }}
                  >
                    All Projects
                  </Button>
                  <Button 
                    size="sm"
                    className="bg-siso-orange hover:bg-siso-red text-white"
                  >
                    <span>View Details</span>
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
