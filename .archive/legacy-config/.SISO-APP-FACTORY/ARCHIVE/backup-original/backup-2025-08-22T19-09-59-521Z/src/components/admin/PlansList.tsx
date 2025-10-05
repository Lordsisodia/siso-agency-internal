import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { 
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Copy, EyeIcon, Pencil, Plus, Send, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BulkPlanCreation } from './BulkPlanCreation';

// Define the exact interface to match what comes from Supabase
interface PlanData {
  id: string;
  username: string;
  company_name: string | null;
  app_name: string | null;
  status: string | null;
  created_at: string;
  branding: any;
  estimated_cost: number | null;
  estimated_days: number | null;
  features: string[] | null;
  industry_type?: string | null; // Make industry_type optional since it might not exist in all records
}

// Use this interface for our component state
interface Plan {
  id: string;
  username: string;
  company_name: string | null;
  app_name: string | null;
  status: string | null;
  created_at: string;
  branding: any;
  estimated_cost: number | null;
  estimated_days: number | null;
  features: string[] | null;
  industry_type: string | null; // Required in our state
}

export const PlansList = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('plans')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      // Explicitly cast the data to PlanData[] before mapping
      const supabaseData = (data || []) as PlanData[];
      
      // Map the data to ensure all fields match our Plan interface
      const typedPlans: Plan[] = supabaseData.map(plan => ({
        ...plan,
        industry_type: plan.industry_type || null // Ensure industry_type is always present
      }));

      setPlans(typedPlans);
    } catch (error: any) {
      console.error('Error fetching plans:', error.message);
      toast({
        variant: "destructive",
        title: "Error fetching plans",
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlan = () => {
    navigate('/admin/plans/create');
  };

  const handleEditPlan = (id: string) => {
    navigate(`/admin/plans/${id}/edit`);
  };

  const handleViewPlan = (username: string) => {
    navigate(`/plan/${username}`);
  };

  const handleDuplicatePlan = async (planId: string) => {
    try {
      // Get the plan to duplicate
      const { data: planData, error: fetchError } = await supabase
        .from('plans')
        .select('*')
        .eq('id', planId)
        .single();

      if (fetchError) throw fetchError;
      
      if (!planData) {
        throw new Error("Plan not found");
      }

      // Create a new username with a timestamp suffix
      const timestamp = new Date().getTime();
      const newUsername = `${planData.username}_copy_${timestamp}`;

      // Explicitly type the data with our PlanData interface
      const planDataTyped = planData as PlanData;

      // Create a copy of the plan with the new username
      const { data, error } = await supabase
        .from('plans')
        .insert({
          username: newUsername,
          company_name: planDataTyped.company_name,
          app_name: planDataTyped.app_name,
          status: 'draft',
          branding: planDataTyped.branding,
          features: planDataTyped.features,
          estimated_cost: planDataTyped.estimated_cost,
          estimated_days: planDataTyped.estimated_days,
          industry_type: planDataTyped.industry_type || null  // Ensure it's never undefined
        })
        .select();

      if (error) throw error;

      toast({
        title: "Plan duplicated",
        description: `Created a copy with username: ${newUsername}`
      });

      fetchPlans();
    } catch (error: any) {
      console.error('Error duplicating plan:', error);
      toast({
        variant: "destructive",
        title: "Error duplicating plan",
        description: error.message
      });
    }
  };

  const handleDeletePlan = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this plan?')) {
      try {
        const { error } = await supabase
          .from('plans')
          .delete()
          .eq('id', id);

        if (error) throw error;

        setPlans(plans.filter(plan => plan.id !== id));
        
        toast({
          title: "Plan deleted",
          description: "The plan has been permanently removed."
        });
      } catch (error: any) {
        console.error('Error deleting plan:', error);
        toast({
          variant: "destructive",
          title: "Error deleting plan",
          description: error.message
        });
      }
    }
  };

  const handleCopyLink = (username: string) => {
    const planUrl = `${window.location.origin}/plan/${username}`;
    navigator.clipboard.writeText(planUrl);
    
    toast({
      title: "Link copied",
      description: "Plan URL has been copied to clipboard"
    });
  };

  const filteredPlans = plans.filter(plan => {
    const query = searchQuery.toLowerCase();
    return (
      plan.username?.toLowerCase().includes(query) ||
      plan.company_name?.toLowerCase().includes(query) ||
      plan.app_name?.toLowerCase().includes(query)
    );
  });

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500/20 text-green-500 hover:bg-green-500/30">Approved</Badge>;
      case 'pending':
        return <Badge className="bg-amber-500/20 text-amber-500 hover:bg-amber-500/30">Pending</Badge>;
      case 'draft':
      default:
        return <Badge className="bg-blue-500/20 text-blue-400 hover:bg-blue-500/30">Draft</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <BulkPlanCreation />
      
      <Card className="border-siso-text/10 bg-black/30">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>App Plans</CardTitle>
          <Button onClick={handleCreatePlan} className="bg-gradient-to-r from-siso-red to-siso-orange">
            <Plus className="h-4 w-4 mr-2" /> Create New Plan
          </Button>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Input 
              placeholder="Search plans..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-black/20 border-siso-text/20"
            />
          </div>
          
          <div className="rounded-md border border-siso-text/10 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-black/40 hover:bg-black/50">
                  <TableHead>Username</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>App</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10 text-siso-text">
                      Loading plans...
                    </TableCell>
                  </TableRow>
                ) : filteredPlans.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10 text-siso-text">
                      No plans found. Create your first app plan.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPlans.map((plan) => (
                    <TableRow key={plan.id} className="hover:bg-black/20">
                      <TableCell className="font-medium">{plan.username}</TableCell>
                      <TableCell>{plan.company_name || '-'}</TableCell>
                      <TableCell>{plan.app_name || '-'}</TableCell>
                      <TableCell>{getStatusBadge(plan.status)}</TableCell>
                      <TableCell>{new Date(plan.created_at).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleViewPlan(plan.username)}
                          className="h-8 w-8 p-0"
                          title="View Plan"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEditPlan(plan.id)}
                          className="h-8 w-8 p-0"
                          title="Edit Plan"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleCopyLink(plan.username)}
                          className="h-8 w-8 p-0"
                          title="Copy Link"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDuplicatePlan(plan.id)}
                          className="h-8 w-8 p-0"
                          title="Duplicate"
                        >
                          <Copy className="h-4 w-4 text-blue-400" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeletePlan(plan.id)}
                          className="h-8 w-8 p-0 hover:text-red-500"
                          title="Delete Plan"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
