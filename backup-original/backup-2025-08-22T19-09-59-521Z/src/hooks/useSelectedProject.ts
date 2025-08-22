import { useState, useEffect } from 'react';
import { useProjects } from './useProjects';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuthSession } from '@/hooks/useAuthSession';

export interface Project {
  id: string;
  name: string;
  status: 'active' | 'paused' | 'completed';
  logo?: string;
}

export function useSelectedProject() {
  const { data: currentProject } = useProjects();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isNewUser, setIsNewUser] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthSession();

  // Check if user has any real projects
  useEffect(() => {
    const checkForProjects = async () => {
      if (!user) return;
      
      try {
        // Check if user has any projects in the database
        const { data: userProjects, error } = await supabase
          .from('projects')
          .select('id')
          .eq('user_id', user.id)
          .limit(1);
          
        if (error) throw error;
        
        const hasProjects = userProjects && userProjects.length > 0;
        setIsNewUser(!hasProjects);
        
        // Only set mock projects if the user is not new
        if (!hasProjects) {
          setProjects([]);
        } else {
          setProjects([
            { 
              id: "ubahcrypt", 
              name: "UbahCrypt Project", 
              status: "active",
              logo: "/lovable-uploads/c5921a2f-8856-42f4-bec5-2d08b81c5691.png"
            }
          ]);
        }
      } catch (error) {
        console.error('Error checking for projects:', error);
        // Default to new user in case of error
        setIsNewUser(true);
        setProjects([]);
      }
    };
    
    checkForProjects();
  }, [user]);

  // Parse the current project ID from the URL
  useEffect(() => {
    if (isNewUser) {
      setSelectedProject(null);
      return;
    }
    
    const pathParts = location.pathname.split('/');
    const projectIdIndex = pathParts.indexOf('projects') + 1;
    
    if (projectIdIndex > 0 && projectIdIndex < pathParts.length) {
      const projectId = pathParts[projectIdIndex];
      const found = projects.find(p => p.id === projectId);
      
      if (found) {
        setSelectedProject(found);
      }
    } else if (currentProject && !isNewUser) {
      // Fallback to the current project from useProjects hook
      setSelectedProject({
        id: currentProject.id || 'ubahcrypt',
        name: currentProject.name || 'UbahCrypt Project',
        status: 'active',
        logo: "/lovable-uploads/c5921a2f-8856-42f4-bec5-2d08b81c5691.png"
      });
    } else if (projects.length > 0) {
      // Default to first project if nothing is selected
      setSelectedProject(projects[0]);
    } else {
      setSelectedProject(null);
    }
  }, [location.pathname, currentProject, projects, isNewUser]);

  // Function to select a project and navigate to it
  const selectProject = (projectId: string) => {
    navigate(`/projects/${projectId}`);
  };

  return {
    selectedProject,
    projects,
    selectProject,
    isNewUser
  };
}
