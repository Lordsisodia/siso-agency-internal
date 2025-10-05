import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthSession } from '@/hooks/useAuthSession';

export interface UserProject {
  id: string;
  name: string;
  description: string | null;
  status: string;
  completion_percentage: number;
  created_at: string;
  updated_at: string;
  user_id: string;
}

/**
 * Hook to fetch projects specific to the authenticated user
 * Returns user's projects from the projects table
 */
export const useUserProjects = () => {
  const { user } = useAuthSession();

  return useQuery({
    queryKey: ['userProjects', user?.id],
    queryFn: async () => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Error fetching user projects: ${error.message}`);
      }

      return (data || []) as UserProject[];
    },
    enabled: !!user?.id,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook to get the primary/main project for the user
 * Returns the most recently created or updated project
 */
export const useMainUserProject = () => {
  const { data: projects, isLoading, error } = useUserProjects();
  
  // Get the most recent project as the "main" project
  const mainProject = projects && projects.length > 0 ? projects[0] : null;
  
  return {
    project: mainProject,
    hasProjects: (projects?.length || 0) > 0,
    projectCount: projects?.length || 0,
    loading: isLoading,
    error
  };
};

/**
 * Hook to check if user has any projects
 */
export const useHasProjects = () => {
  const { data: projects, isLoading } = useUserProjects();
  
  return {
    hasProjects: (projects?.length || 0) > 0,
    projectCount: projects?.length || 0,
    loading: isLoading
  };
}; 