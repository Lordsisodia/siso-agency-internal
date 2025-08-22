import React, { useState, useEffect } from 'react';
import { ProjectCard } from './ProjectCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@/hooks/useUser';
import { useToast } from '@/hooks/use-toast';
import { useUserProjects } from '@/hooks/useUserProjects';
import { Skeleton } from '@/components/ui/skeleton';

interface EnhancedProject {
  id: string;
  app_name: string;
  company_name: string | null;
  username: string;
  estimated_cost: number;
  estimated_days: number;
  features: string[];
  status: string;
  created_at: string;
  completion_percentage: number;
  due_date?: string;
  tasks?: Array<{
    title: string;
    due_date: string;
  }>;
  logo?: string;
}

export function ProjectsList() {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useUser();
  const { data: userProjects, isLoading, error } = useUserProjects();
  
  // Transform user projects to enhanced project format
  const enhancedProjects: EnhancedProject[] = (userProjects || []).map(project => ({
    id: project.id,
    app_name: project.name,
    company_name: "Your Project",
    username: user?.email?.split('@')[0] || "user",
    estimated_cost: 5000, // Default estimate
    estimated_days: 30, // Default estimate
    features: ["Custom App", "User Dashboard", "Admin Panel", "Mobile Responsive"],
    status: project.status,
    created_at: project.created_at,
    completion_percentage: project.completion_percentage,
    due_date: new Date(Date.now() + 86400000 * 30).toISOString(), // 30 days from now
    tasks: [
      {
        title: "Project Planning",
        due_date: new Date(Date.now() + 86400000 * 7).toISOString(), // 7 days from now
      },
      {
        title: "Development Phase",
        due_date: new Date(Date.now() + 86400000 * 21).toISOString(), // 21 days from now
      },
      {
        title: "Testing & Launch",
        due_date: new Date(Date.now() + 86400000 * 30).toISOString(), // 30 days from now
      }
    ],
    logo: "/images/siso-logo.svg"
  }));

  const handleCreateNew = () => {
    navigate('/onboarding-chat');
  };
  
  const filteredProjects = enhancedProjects.filter(project => 
    !searchQuery || 
    project.app_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (project.company_name && project.company_name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-10 w-40" />
        </div>
        <Skeleton className="h-10 w-full" />
        <div className="grid grid-cols-1 gap-4">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-semibold text-white mb-2">Error loading projects</h3>
        <p className="text-siso-text mb-6">There was an issue fetching your projects. Please try again.</p>
        <Button 
          onClick={handleCreateNew} 
          className="bg-siso-orange hover:bg-siso-orange/80 text-white"
        >
          <Plus className="mr-2 h-4 w-4" />
          Create New Project
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <h1 className="text-2xl font-bold text-white">My Projects</h1>
        <Button 
          className="w-full bg-gradient-to-r from-siso-red to-siso-orange text-white"
          onClick={() => {
            navigate('/onboarding-chat');
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Create New Project
        </Button>
      </div>
      
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          type="text"
          placeholder="Search projects..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-black/30 border-siso-text/20 text-white placeholder-gray-400"
        />
      </div>
      
      {filteredProjects.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-xl font-semibold text-white mb-2">
            {enhancedProjects.length === 0 ? "No projects yet" : "No projects found"}
          </h3>
          <p className="text-siso-text mb-6">
            {enhancedProjects.length === 0 
              ? "Create your first project to get started with SISO Agency."
              : "Try a different search term or create a new project."
            }
          </p>
          <Button 
            onClick={handleCreateNew} 
            className="bg-siso-orange hover:bg-siso-orange/80 text-white"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create New Project
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
          
          <div className="mt-8 border-t border-siso-text/10 pt-8">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-white mb-2">Ready to build something new?</h3>
              <p className="text-siso-text mb-6 max-w-md mx-auto">
                Create a new project and our SISO Assistant will help you bring your ideas to life.
              </p>
              <Button 
                className="w-full bg-gradient-to-r from-siso-red to-siso-orange text-white"
                onClick={() => {
                  navigate('/onboarding-chat');
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Create New Project
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
