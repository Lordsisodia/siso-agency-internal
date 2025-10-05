import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { formatRelativeTime } from '@/lib/formatters';
import { CircleUser, ExternalLink, ChevronRight, Filter, Search, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

export const ClientsList = React.memo(function ClientsList() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  
  const { data: clients = [], isLoading } = useQuery({
    queryKey: ['admin-clients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('client_onboarding')
        .select(`
          *,
          profiles:user_id(full_name, id)
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      return data || [];
    },
  });

  const filteredClients = searchQuery 
    ? clients.filter((client: any) => 
        client.profiles?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()))
    : clients;

  const viewAllClients = () => {
    navigate('/admin/clients');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500/20 text-green-400">Completed</Badge>;
      case 'in_progress':
        return <Badge className="bg-blue-500/20 text-blue-400">In Progress</Badge>;
      case 'pending':
      default:
        return <Badge className="bg-amber-500/20 text-amber-400">Pending</Badge>;
    }
  };

  return (
    <Card className="border border-gray-800 bg-black/30">
      <CardHeader className="flex flex-col space-y-2 pt-6">
        <div className="flex items-center justify-between">
          <CardTitle>Recent Clients</CardTitle>
          <Button 
            variant="ghost" 
            size="sm"
            className="text-neutral-100 hover:text-white"
            onClick={viewAllClients}
          >
            View All
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex items-center space-x-2 pt-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-100" />
            <Input
              placeholder="Search clients..."
              className="pl-9 bg-gray-900 border-gray-800 text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" size="icon" className="h-10 w-10">
            <Filter className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="default" className="flex items-center">
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="px-0 pt-0">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center justify-between px-6 py-3">
                <div className="flex items-center space-x-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div>
                    <Skeleton className="h-4 w-32 mb-1" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
            ))}
          </div>
        ) : filteredClients.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-white">No clients found.</p>
          </div>
        ) : (
          <div>
            {filteredClients.map((client: any, index: number) => (
              <div 
                key={client.id} 
                className={`flex items-center justify-between px-6 py-3 hover:bg-gray-900/50 transition-colors cursor-pointer ${
                  index !== filteredClients.length - 1 ? 'border-b border-gray-800' : ''
                }`}
                onClick={() => client.profiles?.id && navigate(`/admin/clients/${client.profiles.id}`)}
              >
                <div className="flex items-center space-x-3">
                  {client.profiles?.avatar_url ? (
                    <img 
                      src={client.profiles.avatar_url} 
                      alt={client.profiles?.full_name || 'Client'} 
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400">
                      <CircleUser className="h-6 w-6" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-white">
                      {client.profiles?.full_name || 'Unknown'}
                    </p>
                    <p className="text-xs text-neutral-100">
                      Step {client.current_step} of {client.total_steps} • {formatRelativeTime(client.updated_at)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusBadge(client.status)}
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
});
