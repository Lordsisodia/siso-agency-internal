
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Timeline } from '@/components/ui/timeline';
import { supabase } from '@/services/integrations/supabase/client';
import { useToast } from '@/lib/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { ClientData } from '@/types/client.types';
import { Skeleton } from '@/components/ui/skeleton';
import { ClipboardCheck, Clock } from 'lucide-react';
import { ClientDashboardLayout } from "@/client/client/ClientDashboardLayout";

export default function ClientStatusPage() {
  const [client, setClient] = useState<ClientData | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchClientData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Use RPC to fetch client ID safely
        const { data: clientIdData, error: clientIdError } = await supabase.rpc('get_client_by_user_id', { user_uuid: user.id });

        if (clientIdError || !clientIdData || clientIdData.length === 0) return;
        const clientId = clientIdData[0].client_id;

        const { data, error } = await supabase
          .from('client_onboarding')
          .select('*')
          .eq('id', clientId)
          .maybeSingle();

        if (error) throw error;
        if (data) setClient(data as unknown as ClientData);
      } catch (error) {
        console.error('Error fetching client data:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load client data",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchClientData();
  }, [toast]);

  const calculateProgress = () => {
    if (!client?.completed_steps || !client?.total_steps) return 0;
    return (client.completed_steps.length / client.total_steps) * 100;
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'completed': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const timelineData = [
    {
      title: "Project Kickoff",
      content: (
        <Card className="p-4 bg-white border border-slate-200">
          <h3 className="font-medium mb-2">Project Initialization</h3>
          <p className="text-sm text-slate-600">Project requirements and goals established</p>
          <div className="flex items-center gap-2 mt-2">
            <Clock className="h-4 w-4 text-slate-400" />
            <span className="text-xs text-slate-500">
              {new Date().toLocaleDateString()}
            </span>
          </div>
        </Card>
      ),
    },
    {
      title: "Development",
      content: (
        <Card className="p-4 bg-white border border-slate-200">
          <h3 className="font-medium mb-2">Development In Progress</h3>
          <p className="text-sm text-slate-600">Building core functionalities and features</p>
          <div className="flex items-center gap-2 mt-2">
            <Clock className="h-4 w-4 text-slate-400" />
            <span className="text-xs text-slate-500">In Progress</span>
          </div>
        </Card>
      ),
    },
    {
      title: "Testing",
      content: (
        <Card className="p-4 bg-white border border-slate-200">
          <h3 className="font-medium mb-2">Quality Assurance</h3>
          <p className="text-sm text-slate-600">Testing and bug fixing</p>
          <div className="flex items-center gap-2 mt-2">
            <Clock className="h-4 w-4 text-slate-400" />
            <span className="text-xs text-slate-500">Upcoming</span>
          </div>
        </Card>
      ),
    },
    {
      title: "Launch",
      content: (
        <Card className="p-4 bg-white border border-slate-200">
          <h3 className="font-medium mb-2">Project Deployment</h3>
          <p className="text-sm text-slate-600">Final launch and deployment</p>
          <div className="flex items-center gap-2 mt-2">
            <Clock className="h-4 w-4 text-slate-400" />
            <span className="text-xs text-slate-500">Planned</span>
          </div>
        </Card>
      ),
    },
  ];

  if (loading) {
    return (
      <ClientDashboardLayout>
        <div>
          <Skeleton className="h-10 w-48 mb-6" />
          <Skeleton className="h-64 w-full mb-6 rounded-lg" />
          <Skeleton className="h-96 w-full rounded-lg" />
        </div>
      </ClientDashboardLayout>
    );
  }

  return (
    <ClientDashboardLayout>
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-slate-900">Project Status</h1>
        
        <Card className="p-6 mb-6 border border-slate-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">{client?.project_name || "Your Project"}</h2>
              <p className="text-slate-500">{client?.company_name}</p>
            </div>
            <div className="mt-4 md:mt-0">
              <span 
                className={`px-3 py-1 rounded-full text-sm font-medium text-white ${getStatusColor(client?.status || '')}`}
              >
                {client?.status?.toUpperCase() || "PENDING"}
              </span>
            </div>
          </div>
          
          <div className="mb-8">
            <div className="flex justify-between mb-2">
              <h3 className="font-medium">Project Progress</h3>
              <span className="text-sm">{Math.round(calculateProgress())}%</span>
            </div>
            <Progress value={calculateProgress()} className="h-3" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-slate-500">Start Date</p>
              <p className="font-medium">{new Date().toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Estimated Completion</p>
              <p className="font-medium">
                {client?.estimated_completion_date 
                  ? new Date(client.estimated_completion_date).toLocaleDateString() 
                  : "TBD"}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Project Manager</p>
              <p className="font-medium">Agency Team</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6 mb-6 border border-slate-200">
          <h2 className="text-xl font-semibold mb-6 text-slate-900">Completed Milestones</h2>
          <div className="space-y-4">
            {(client?.completed_steps || []).map((step, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="mt-0.5">
                  <ClipboardCheck className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="font-medium">{step}</p>
                  <p className="text-sm text-slate-500">Completed</p>
                </div>
              </div>
            ))}
            {(client?.completed_steps?.length || 0) === 0 && (
              <p className="text-slate-500">No milestones completed yet</p>
            )}
          </div>
        </Card>
        
        <h2 className="text-xl font-semibold mb-4 text-slate-900">Project Timeline</h2>
        <Timeline data={timelineData} />
      </div>
    </ClientDashboardLayout>
  );
}
