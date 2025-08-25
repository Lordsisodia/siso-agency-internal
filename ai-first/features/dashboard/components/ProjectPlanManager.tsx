
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';

export function ProjectPlanManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [newPlanName, setNewPlanName] = useState('');
  const [newPlanDescription, setNewPlanDescription] = useState('');
  
  // Fetch all project plans
  const { data: plans, isLoading: plansLoading } = useQuery({
    queryKey: ['admin-project-plans'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('project_plans')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error('Error fetching plans:', error);
        toast({
          title: 'Error loading plans',
          description: error.message,
          variant: 'destructive',
        });
        return [];
      }
      
      return data;
    },
  });
  
  // Create a new plan
  const createPlanMutation = useMutation({
    mutationFn: async () => {
      if (!newPlanName) {
        toast({
          title: 'Error',
          description: 'Plan name is required',
          variant: 'destructive',
        });
        return;
      }
      
      const { data, error } = await supabase
        .from('project_plans')
        .insert([
          {
            name: newPlanName,
            description: newPlanDescription,
          }
        ])
        .select()
        .single();
        
      if (error) {
        console.error('Error creating plan:', error);
        toast({
          title: 'Error creating plan',
          description: error.message,
          variant: 'destructive',
        });
        return null;
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-project-plans'] });
      toast({
        title: 'Success',
        description: 'Plan created successfully',
      });
      setNewPlanName('');
      setNewPlanDescription('');
    },
  });
  
  // Assign a plan to a client
  const assignPlanMutation = useMutation({
    mutationFn: async ({ clientId, planId }: { clientId: string, planId: string }) => {
      const { data, error } = await supabase
        .from('client_plans')
        .insert([
          {
            client_id: clientId,
            project_plan_id: planId,
            status: 'active',
          }
        ])
        .select();
        
      if (error) {
        console.error('Error assigning plan:', error);
        toast({
          title: 'Error assigning plan',
          description: error.message,
          variant: 'destructive',
        });
        return null;
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-plans'] });
      toast({
        title: 'Success',
        description: 'Plan assigned successfully',
      });
    },
  });
  
  // Delete a plan
  const deletePlanMutation = useMutation({
    mutationFn: async (planId: string) => {
      const { error } = await supabase
        .from('project_plans')
        .delete()
        .eq('id', planId);
        
      if (error) {
        console.error('Error deleting plan:', error);
        toast({
          title: 'Error deleting plan',
          description: error.message,
          variant: 'destructive',
        });
        return false;
      }
      
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-project-plans'] });
      toast({
        title: 'Success',
        description: 'Plan deleted successfully',
      });
    },
  });

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Create New Project Plan</CardTitle>
          <CardDescription>
            Create a new development plan template that can be assigned to clients.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="plan-name" className="text-sm font-medium">
              Plan Name
            </label>
            <Input
              id="plan-name"
              value={newPlanName}
              onChange={(e) => setNewPlanName(e.target.value)}
              placeholder="Enter plan name"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="plan-description" className="text-sm font-medium">
              Description
            </label>
            <Textarea
              id="plan-description"
              value={newPlanDescription}
              onChange={(e) => setNewPlanDescription(e.target.value)}
              placeholder="Enter plan description"
              rows={3}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={() => createPlanMutation.mutate()}
            disabled={createPlanMutation.isPending}
          >
            {createPlanMutation.isPending ? (
              <>
                <Spinner size="sm" className="mr-2" />
                Creating...
              </>
            ) : (
              'Create Plan'
            )}
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Manage Project Plans</CardTitle>
          <CardDescription>
            View, edit, and delete existing project plans. You can also assign plans to clients.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {plansLoading ? (
            <div className="flex justify-center py-8">
              <Spinner />
            </div>
          ) : plans && plans.length > 0 ? (
            <div className="space-y-4">
              {plans.map((plan) => (
                <Card key={plan.id} className="bg-black/20">
                  <CardHeader>
                    <CardTitle>{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                  </CardHeader>
                  <CardFooter className="flex justify-between">
                    <div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.location.href = `/admin/plans/${plan.id}/edit`}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="ml-2"
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this plan?')) {
                            deletePlanMutation.mutate(plan.id);
                          }
                        }}
                      >
                        Delete
                      </Button>
                    </div>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => {
                        setSelectedPlanId(plan.id);
                        // Open assign dialog or navigate to assign page
                      }}
                    >
                      Assign to Client
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-neutral-400">
              No project plans found. Create one above.
            </div>
          )}
        </CardContent>
      </Card>

      {/* TODO: Add assign plan to client UI */}
    </div>
  );
}
