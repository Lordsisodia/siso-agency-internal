
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/services/integrations/supabase/client';
import { useToast } from '@/lib/hooks/ui/useToast';
import { useAuthSession } from '@/lib/hooks/auth/useAuthSession';

export interface Project {
  id: string;
  name: string;
  description?: string;
  logo?: string;
  status: string;
  created_at: string;
}

export function useProjects() {
  const { toast } = useToast();
  const { user } = useAuthSession();

  return useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      if (!user) {
        
        throw new Error('Authentication required');
      }

      
      
      const { data: project, error } = await supabase
        .from('plans')
        .select('*')
        .eq('app_name', 'Ubahcrypt')
        .single();

      if (error) {
        console.error('Error fetching project:', error);
        toast({
          title: 'Error fetching project',
          description: error.message,
          variant: 'destructive',
        });
        throw error;
      }

      if (!project) {
        
        return null;
      }

      

      // Transform project into Project format
      const transformedProject = {
        id: project.id,
        name: project.app_name,
        description: project.description || 'A secure and innovative cryptocurrency platform',
        logo: project.logo,
        status: project.status || 'pending',
        created_at: project.created_at
      };

      
      return transformedProject;
    },
    enabled: !!user
  });
}
