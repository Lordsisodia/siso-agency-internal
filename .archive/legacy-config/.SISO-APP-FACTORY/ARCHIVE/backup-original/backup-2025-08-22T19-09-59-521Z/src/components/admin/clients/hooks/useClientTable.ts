
import { useState, useRef, useCallback } from 'react';
import { ClientData, ClientViewPreference } from '@/types/client.types';
import { useClientsList } from '@/hooks/client';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const useClientTable = (
  searchQuery: string = '',
  statusFilter: string = 'all',
  viewPreference: ClientViewPreference,
  onViewPreferenceChange: (preference: Partial<ClientViewPreference>) => void
) => {
  const [page, setPage] = useState(1);
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [activeClient, setActiveClient] = useState<string | null>(null);
  const [editingCell, setEditingCell] = useState<{id: string, field: string} | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const editInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const { clients, isLoading, totalCount, refetch } = useClientsList({
    page,
    pageSize: viewPreference.pageSize,
    searchQuery,
    statusFilter,
    sortColumn: viewPreference.sortColumn,
    sortDirection: viewPreference.sortDirection
  });

  const handleSort = useCallback((column: string) => {
    if (viewPreference.sortColumn === column) {
      onViewPreferenceChange({
        sortDirection: viewPreference.sortDirection === 'asc' ? 'desc' : 'asc'
      });
    } else {
      onViewPreferenceChange({
        sortColumn: column,
        sortDirection: 'asc'
      });
    }
  }, [viewPreference.sortColumn, viewPreference.sortDirection, onViewPreferenceChange]);

  const handleSelectAll = useCallback(() => {
    setSelectedClients(prev => 
      prev.length === clients.length ? [] : clients.map(client => client.id)
    );
  }, [clients]);

  const handleSelectClient = useCallback((clientId: string) => {
    setSelectedClients(prev => 
      prev.includes(clientId) 
        ? prev.filter(id => id !== clientId)
        : [...prev, clientId]
    );
  }, []);

  const handleStartEdit = useCallback((client: ClientData, field: string) => {
    setEditingCell({ id: client.id, field });
    setEditValue(String(client[field as keyof ClientData] || ''));
  }, []);

  const handleSaveEdit = useCallback(async ({ id, field, value }: { id: string; field: string; value: string }) => {
    try {
      const { error } = await supabase
        .from('client_onboarding')
        .update({ 
          [field]: value,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);
        
      if (error) throw error;
      
      toast({
        title: "Update successful",
        description: `Updated ${field} for this client.`
      });
      
      refetch().catch(console.error);
    } catch (error: any) {
      console.error('Error saving edit:', error);
      toast({
        variant: "destructive",
        title: "Error updating client",
        description: error.message || "Failed to save changes. Please try again."
      });
    } finally {
      setEditingCell(null);
    }
  }, [toast, refetch]);

  const handleDeleteSelected = useCallback(async () => {
    if (selectedClients.length === 0) return;
    
    if (window.confirm(`Are you sure you want to delete ${selectedClients.length} selected clients?`)) {
      try {
        const { error } = await supabase
          .from('client_onboarding')
          .delete()
          .in('id', selectedClients);
        
        if (error) throw error;
        
        toast({
          title: "Clients deleted",
          description: `Successfully deleted ${selectedClients.length} clients.`
        });
        
        setSelectedClients([]);
        refetch().catch(console.error);
      } catch (error: any) {
        console.error('Error deleting clients:', error);
        toast({
          variant: "destructive",
          title: "Error deleting clients",
          description: error.message || "Failed to delete selected clients."
        });
      }
    }
  }, [selectedClients, toast, refetch]);

  return {
    page,
    setPage,
    selectedClients,
    activeClient,
    setActiveClient,
    editingCell,
    editValue,
    setEditValue,
    editInputRef,
    clients,
    isLoading,
    totalCount,
    handleSort,
    handleSelectAll,
    handleSelectClient,
    handleStartEdit,
    handleSaveEdit,
    handleDeleteSelected,
    refetch
  };
};
