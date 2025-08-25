import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { formatCompactNumber, formatRelativeTime } from '@/lib/formatters';
import { Loader2, ArrowUpRight, Instagram, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface InstagramLead {
  id: string;
  username: string;
  followers_count: number | null;
  status: string | null;
  created_at: string;
}

export const LeadsOverview = () => {
  const navigate = useNavigate();
  const { data: leads = [], isLoading } = useQuery({
    queryKey: ['admin-leads'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('instagram_leads')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      return data || [];
    },
  });

  const viewAllLeads = () => {
    // Future implementation for leads management page
    navigate('/admin/outreach');
  };

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'contacted':
        return <Badge variant="info">Contacted</Badge>;
      case 'converted':
        return <Badge variant="success">Converted</Badge>;
      case 'new':
      default:
        return <Badge variant="warning">New</Badge>;
    }
  };

  return (
    <Card className="border border-gray-800 bg-black/30">
      <CardHeader className="flex flex-row items-center justify-between pb-2 pt-6">
        <CardTitle className="flex items-center">
          <Instagram className="mr-2 h-5 w-5 text-pink-400" />
          Instagram Leads
        </CardTitle>
        <Button 
          variant="ghost" 
          size="sm"
          className="text-neutral-100 hover:text-white"
          onClick={viewAllLeads}
        >
          View All
          <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div>
                  <Skeleton className="h-5 w-32 mb-1" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        ) : leads.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-white">No leads found.</p>
            <Button variant="outline" size="sm" className="mt-2">
              Find New Leads
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {leads.map((lead: InstagramLead) => (
              <div key={lead.id} className="flex items-center justify-between p-3 rounded-md bg-gray-900/50 hover:bg-gray-900/70 transition-colors">
                <div>
                  <div className="flex items-center">
                    <p className="font-medium text-white">@{lead.username}</p>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 w-6 p-0 ml-1 text-pink-400 hover:text-pink-300"
                      onClick={() => window.open(`https://instagram.com/${lead.username}`, '_blank')}
                    >
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <div className="flex items-center mt-1 space-x-2 text-xs">
                    {getStatusBadge(lead.status)}
                    <span className="text-neutral-100">
                      {formatRelativeTime(lead.created_at)}
                    </span>
                  </div>
                </div>
                <div className="text-sm text-white font-medium">
                  {lead.followers_count ? (
                    <span className="flex items-center">
                      {formatCompactNumber(lead.followers_count)} 
                      <span className="text-neutral-100 text-xs ml-1">followers</span>
                    </span>
                  ) : (
                    <span className="text-neutral-100">N/A</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
