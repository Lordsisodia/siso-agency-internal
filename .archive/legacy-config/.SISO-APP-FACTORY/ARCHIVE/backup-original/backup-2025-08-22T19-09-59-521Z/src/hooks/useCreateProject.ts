import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthSession } from '@/hooks/useAuthSession';
import { useToast } from '@/hooks/use-toast';

export interface ProjectCreationData {
  name: string;
  description: string;
  project_type: string;
  target_audience: string;
  key_features: string[];
  budget_range: string;
  timeline: string;
  business_goals: string;
  technical_requirements?: string;
  design_preferences?: string;
}

export interface CreatedProject {
  id: string;
  name: string;
  description: string;
  status: string;
  completion_percentage: number;
  created_at: string;
  updated_at: string;
  user_id: string;
  ai_generated_plan?: any;
}

/**
 * Hook to create a new project with AI-generated app plan
 */
export const useCreateProject = () => {
  const { user } = useAuthSession();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (projectData: ProjectCreationData): Promise<CreatedProject> => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      // Generate AI-powered app plan
      const aiPlan = generateAppPlan(projectData);

      // Create the project record with AI plan embedded
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .insert({
          name: projectData.name,
          description: projectData.description,
          status: 'planning',
          completion_percentage: 0,
          user_id: user.id,
          metadata: {
            project_type: projectData.project_type,
            target_audience: projectData.target_audience,
            budget_range: projectData.budget_range,
            timeline: projectData.timeline,
            business_goals: projectData.business_goals,
            technical_requirements: projectData.technical_requirements,
            design_preferences: projectData.design_preferences,
            ai_generated_plan: aiPlan
          }
        })
        .select()
        .single();

      if (projectError) {
        throw new Error(`Failed to create project: ${projectError.message}`);
      }

      return {
        ...project,
        ai_generated_plan: aiPlan
      } as CreatedProject;
    },
    onSuccess: (createdProject) => {
      toast({
        title: 'Project Created Successfully! 🎉',
        description: `${createdProject.name} has been created with an AI-generated development plan.`,
      });

      // Invalidate and refetch user projects
      queryClient.invalidateQueries({ queryKey: ['userProjects'] });
      queryClient.invalidateQueries({ queryKey: ['clientData'] });
    },
    onError: (error) => {
      toast({
        title: 'Failed to Create Project',
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        variant: 'destructive',
      });
    }
  });
};

/**
 * Generate AI-powered app development plan based on project requirements
 */
function generateAppPlan(projectData: ProjectCreationData) {
  const phases = [
    {
      phase: 1,
      name: 'Discovery & Planning',
      duration: '1-2 weeks',
      tasks: [
        'Requirements gathering and analysis',
        'User research and persona development',
        'Technical architecture planning',
        'Project timeline refinement'
      ]
    },
    {
      phase: 2,
      name: 'Design & Prototyping',
      duration: '2-3 weeks',
      tasks: [
        'UI/UX wireframe creation',
        'Interactive prototype development',
        'Design system creation',
        'User testing and feedback integration'
      ]
    },
    {
      phase: 3,
      name: 'Development',
      duration: getDevDuration(projectData.timeline),
      tasks: [
        'Frontend development',
        'Backend API development',
        'Database setup and integration',
        'Third-party service integration'
      ]
    },
    {
      phase: 4,
      name: 'Testing & Launch',
      duration: '1-2 weeks',
      tasks: [
        'Quality assurance testing',
        'Performance optimization',
        'Deployment and launch',
        'Post-launch monitoring setup'
      ]
    }
  ];

  return {
    project_type: projectData.project_type,
    target_audience: projectData.target_audience,
    key_features: projectData.key_features,
    business_goals: projectData.business_goals,
    development_phases: phases,
    estimated_budget: getBudgetEstimate(projectData.budget_range),
    timeline: projectData.timeline,
    tech_stack: generateTechStack(projectData.project_type),
    generated_at: new Date().toISOString(),
    milestones: generateProjectMilestones(projectData)
  };
}

/**
 * Generate project milestones based on the timeline
 */
function generateProjectMilestones(projectData: ProjectCreationData) {
  const timelineWeeks = getTimelineInWeeks(projectData.timeline);
  
  return [
    {
      name: 'Project Planning Complete',
      description: 'Requirements gathering and technical planning finalized',
      target_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week
      status: 'pending'
    },
    {
      name: 'Design & Prototypes Ready',
      description: 'UI/UX designs and interactive prototypes completed',
      target_date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(), // 3 weeks
      status: 'pending'
    },
    {
      name: 'Development Complete',
      description: 'Core application development finished',
      target_date: new Date(Date.now() + (21 + Math.floor(timelineWeeks * 0.6) * 7) * 24 * 60 * 60 * 1000).toISOString(),
      status: 'pending'
    },
    {
      name: 'Project Launch',
      description: 'Application tested, deployed, and launched',
      target_date: new Date(Date.now() + timelineWeeks * 7 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'pending'
    }
  ];
}

/**
 * Helper functions
 */
function getDevDuration(timeline: string): string {
  switch (timeline) {
    case '2-4 weeks': return '1-2 weeks';
    case '1-2 months': return '2-4 weeks';
    case '3-6 months': return '8-16 weeks';
    case '6+ months': return '16+ weeks';
    default: return '4-8 weeks';
  }
}

function getBudgetEstimate(budgetRange: string): string {
  switch (budgetRange) {
    case '£500-£2,000': return '£500-£2,000';
    case '£2,000-£5,000': return '£2,000-£5,000';
    case '£5,000-£10,000': return '£5,000-£10,000';
    case '£10,000+': return '£10,000+';
    default: return 'To be determined';
  }
}

function generateTechStack(projectType: string): string[] {
  const baseTech = ['React', 'TypeScript', 'Tailwind CSS'];
  
  switch (projectType.toLowerCase()) {
    case 'web application':
      return [...baseTech, 'Node.js', 'PostgreSQL', 'Vercel'];
    case 'mobile app':
      return [...baseTech, 'React Native', 'Expo', 'Firebase'];
    case 'e-commerce':
      return [...baseTech, 'Next.js', 'Stripe', 'PostgreSQL', 'Vercel'];
    case 'saas platform':
      return [...baseTech, 'Next.js', 'Supabase', 'Stripe', 'Vercel'];
    case 'api/backend':
      return ['Node.js', 'Express', 'PostgreSQL', 'JWT', 'AWS'];
    default:
      return [...baseTech, 'Node.js', 'PostgreSQL'];
  }
}

function getTimelineInWeeks(timeline: string): number {
  switch (timeline) {
    case '2-4 weeks': return 3;
    case '1-2 months': return 6;
    case '3-6 months': return 18;
    case '6+ months': return 26;
    default: return 8;
  }
} 