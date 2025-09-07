import { useState, useEffect } from 'react';
import { Card } from '@/shared/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/shared/hooks/use-toast';
import { Skeleton } from '@/shared/ui/skeleton';
import { TodoItem, ClientData } from '@/types/client.types';
import { TodoList } from '@/ecosystem/internal/admin/clients/TodoList';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { CheckCircle, Circle, Clock, FilterIcon } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { ClientDashboardLayout } from "@/client/client/ClientDashboardLayout";

export default function ClientTasksPage() {
  const [client, setClient] = useState<ClientData | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [filter, setFilter] = useState<'all' | 'completed' | 'pending'>('all');

  useEffect(() => {
    const fetchClientData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Use RPC to fetch client ID safely
        const { data: clientIdData, error: clientIdError } = await supabase.rpc('get_client_by_user_id', { user_uuid: user.id });

        if (clientIdError || !clientIdData || clientIdData.length === 0) return;
        const clientId = clientIdData[0].client_id;

        // Fetch client data
        const { data, error } = await supabase
          .from('client_onboarding')
          .select('*')
          .eq('id', clientId)
          .maybeSingle();

        if (error) throw error;
        if (data) {
          // Parse todos array with safe fallback and proper casting
          let todos: TodoItem[] = [];
          if (data.todos && Array.isArray(data.todos)) {
            // Ensure each todo item has the required properties of TodoItem
            todos = (data.todos as any[]).map(item => ({
              id: item.id || `temp-${Math.random().toString(36).substr(2, 9)}`,
              text: item.text || '',
              completed: !!item.completed,
              priority: item.priority || 'medium',
              due_date: item.due_date,
              related_to: item.related_to,
              assigned_to: item.assigned_to
            })) as TodoItem[];
          }
          
          const clientData = {
            ...(data as any),
            todos
          } as ClientData;
          
          setClient(clientData);
        }
      } catch (error) {
        console.error('Error fetching client data:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load tasks",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchClientData();
  }, [toast]);

  const handleUpdateTodos = async (todos: TodoItem[]) => {
    if (!client) return;

    try {
      // Serialize the todos to JSON to meet Supabase type requirements
      const { error } = await supabase
        .from('client_onboarding')
        .update({ todos: JSON.parse(JSON.stringify(todos)) })
        .eq('id', client.id);

      if (error) {
        toast({
          variant: "destructive",
          title: "Error updating todos",
          description: error.message,
        });
      } else {
        setClient(prev => prev ? { ...prev, todos } : null);
        toast({
          title: "Tasks updated",
          description: "Your tasks have been successfully updated.",
        });
      }
    } catch (error) {
      console.error('Unexpected error updating todos:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred while updating tasks.",
      });
    }
  };

  const filteredTodos = () => {
    if (!client?.todos) return [];
    
    switch (filter) {
      case 'completed':
        return client.todos.filter(todo => todo.completed);
      case 'pending':
        return client.todos.filter(todo => !todo.completed);
      default:
        return client.todos;
    }
  };

  const getTaskStats = () => {
    if (!client?.todos) return { total: 0, completed: 0, pending: 0 };
    
    const total = client.todos.length;
    const completed = client.todos.filter(todo => todo.completed).length;
    
    return {
      total,
      completed,
      pending: total - completed
    };
  };

  const stats = getTaskStats();

  if (loading) {
    return (
      <ClientDashboardLayout>
        <div>
          <Skeleton className="h-10 w-48 mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Skeleton className="h-24 w-full rounded-lg" />
            <Skeleton className="h-24 w-full rounded-lg" />
            <Skeleton className="h-24 w-full rounded-lg" />
          </div>
          <Skeleton className="h-64 w-full rounded-lg" />
        </div>
      </ClientDashboardLayout>
    );
  }

  return (
    <ClientDashboardLayout>
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-slate-900">Your Tasks</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="p-5 border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-full">
                <CheckCircle className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Total Tasks</p>
                <p className="text-2xl font-semibold">{stats.total}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-5 border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-full">
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Completed</p>
                <p className="text-2xl font-semibold">{stats.completed}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-5 border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-full">
                <Clock className="h-5 w-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Pending</p>
                <p className="text-2xl font-semibold">{stats.pending}</p>
              </div>
            </div>
          </Card>
        </div>
        
        <Card className="p-6 border border-slate-200">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <h2 className="text-xl font-semibold">Task List</h2>
            
            <div className="flex items-center gap-3">
              <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Filter</SelectLabel>
                    <SelectItem value="all">All Tasks</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {client?.todos && client.todos.length > 0 ? (
            <TodoList 
              todos={filteredTodos()} 
              onUpdate={handleUpdateTodos} 
              clientId={client.id} 
            />
          ) : (
            <div className="text-center py-8">
              <Circle className="h-12 w-12 mx-auto text-slate-300 mb-3" />
              <h3 className="text-lg font-medium mb-1">No Tasks Available</h3>
              <p className="text-slate-500">
                You don't have any tasks assigned currently.
              </p>
            </div>
          )}
        </Card>
      </div>
    </ClientDashboardLayout>
  );
}
