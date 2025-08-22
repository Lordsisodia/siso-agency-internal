
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useParams } from 'react-router-dom';

export interface PlanDataType {
  id: string;
  username: string;
  company_name: string | null;
  app_name: string | null;
  description: string | null; // Added description property
  features: string[] | null;
  branding: {
    logo?: string;
    primary_color?: string;
    secondary_color?: string;
  } | null;
  estimated_cost: number | null;
  estimated_days: number | null;
  status: string | null;
  industry_type?: string;
}

export interface PlanSubsection {
  id: string;
  title: string;
  content: string;
  action_steps: string[] | null;
  expected_outcomes: string[] | null;
  best_practices: string[] | null;
  order_index: number;
  notion_url?: string;
}

export interface PlanPhase {
  id: string;
  title: string;
  description: string;
  order_index: number;
  subsections: PlanSubsection[];
}

export interface ProjectPlan {
  id: string;
  name: string;
  description: string | null;
  phases: PlanPhase[];
}

export function usePlanData(username: string | undefined) {
  const [loading, setLoading] = useState<boolean>(true);
  const [planData, setPlanData] = useState<PlanDataType | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const isMounted = useRef(true);
  
  useEffect(() => {
    // Set up cleanup function to prevent state updates after unmounting
    return () => {
      isMounted.current = false;
    };
  }, []);
  
  useEffect(() => {
    const fetchPlanData = async () => {
      if (!username) {
        if (isMounted.current) {
          setLoading(false);
          setError(new Error("No username provided"));
        }
        return;
      }
      
      try {
        if (isMounted.current) {
          setLoading(true);
          setError(null);
        }
        
        // Fetch plan data from Supabase
        const { data, error } = await supabase
          .from('plans')
          .select('*')
          .eq('username', username)
          .single();
        
        if (error) {
          console.error('Error fetching plan:', error);
          
          // If no plan found in database, fall back to mock data
          const mockData: PlanDataType = {
            id: '123',
            username: username,
            company_name: username === 'decora' ? 'Decora Agency' : 'Siso Agency',
            app_name: 'OnlyFans Management Suite',
            description: 'A comprehensive platform to manage OnlyFans content, analytics, and client relationships.',
            features: ['Content Management', 'Analytics Dashboard', 'Client Portal', 'Messaging System'],
            branding: {
              primary_color: '#3182CE',
              secondary_color: '#805AD5'
            },
            estimated_cost: 4997,
            estimated_days: 14,
            status: 'draft',
            industry_type: username === 'decora' ? 'onlyfans-management' : 'digital-marketing'
          };
          
          if (isMounted.current) {
            setPlanData(mockData);
            setLoading(false);
          }
        } else {
          if (isMounted.current) {
            // Convert the branding to the correct format if needed
            const formattedData: PlanDataType = {
              ...data,
              description: data.description || null,
              branding: typeof data.branding === 'string' 
                ? JSON.parse(data.branding) 
                : data.branding
            };
            
            setPlanData(formattedData);
            setLoading(false);
          }
        }
        
      } catch (error) {
        console.error('Error in fetchPlanData:', error);
        if (isMounted.current) {
          setError(error instanceof Error ? error : new Error(String(error)));
          setLoading(false);
        }
      }
    };
    
    fetchPlanData();
  }, [username]);
  
  return { loading, planData, error };
}

export function useProjectPlan(projectId?: string) {
  const { toast } = useToast();
  const params = useParams();
  const id = projectId || params.id || 'ubahcrypt';

  return useQuery({
    queryKey: ['project-plan', id],
    queryFn: async (): Promise<ProjectPlan | null> => {
      try {
        // First, check if the user has an assigned plan for this project
        const { data: clientPlan, error: clientPlanError } = await supabase
          .from('client_plans')
          .select('project_plan_id')
          .eq('client_id', id)
          .maybeSingle();

        if (clientPlanError) {
          console.error('Error fetching client plan:', clientPlanError);
        }

        // If no specific client plan, use the default UbahCrypt plan
        const planId = clientPlan?.project_plan_id;
        
        // Fetch the plan details
        let plan;
        const { data: planData, error: planError } = await supabase
          .from('project_plans')
          .select('*')
          .eq('id', planId || '')
          .maybeSingle();

        if (planError) {
          if (planError.code !== 'PGRST116') { // No rows found isn't a real error
            console.error('Error fetching project plan:', planError);
            toast({
              title: 'Failed to load project plan',
              description: 'Please try again later.',
              variant: 'destructive',
            });
          }
          
          // If no plan found, fetch the default UbahCrypt plan
          const { data: defaultPlan, error: defaultPlanError } = await supabase
            .from('project_plans')
            .select('*')
            .eq('name', 'UbahCrypt Development Plan')
            .maybeSingle();
            
          if (defaultPlanError) {
            console.error('Error fetching default plan:', defaultPlanError);
            return null;
          }
          
          if (!defaultPlan) return null;
          plan = defaultPlan;
        } else {
          plan = planData;
        }

        if (!plan) return null;

        // Fetch the phases for this plan
        const { data: phases, error: phasesError } = await supabase
          .from('plan_phases')
          .select('*')
          .eq('plan_id', plan.id)
          .order('order_index');

        if (phasesError) {
          console.error('Error fetching plan phases:', phasesError);
          return null;
        }

        // For each phase, fetch its subsections
        const phasesWithSubsections: PlanPhase[] = await Promise.all(
          phases.map(async (phase) => {
            const { data: subsections, error: subsectionsError } = await supabase
              .from('plan_subsections')
              .select('*')
              .eq('phase_id', phase.id)
              .order('order_index');

            if (subsectionsError) {
              console.error('Error fetching subsections for phase:', subsectionsError);
              return {
                ...phase,
                subsections: [],
              };
            }

            return {
              ...phase,
              subsections: subsections || [],
            };
          })
        );

        return {
          id: plan.id,
          name: plan.name,
          description: plan.description,
          phases: phasesWithSubsections,
        };
      } catch (error) {
        console.error('Error in useProjectPlan:', error);
        toast({
          title: 'Failed to load project plan',
          description: 'An unexpected error occurred.',
          variant: 'destructive',
        });
        return null;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
