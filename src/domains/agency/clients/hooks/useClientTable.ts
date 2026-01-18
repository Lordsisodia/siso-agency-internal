
import { useState, useRef, useCallback, useEffect } from 'react';
import { ClientData, ClientViewPreference } from '@/types/client.types';
import { useClientsList } from '@/domains/agency/clients/hooks';
import { useToast } from '@/lib/hooks/ui/useToast';
import { supabase } from '@/services/integrations/supabase/client';

const COLUMN_DB_FIELD_MAP: Record<string, string> = {
  business_name: 'company_name',
  full_name: 'contact_name',
  estimated_price: 'estimated_price',
  project_name: 'project_name',
  company_niche: 'company_niche',
  next_steps: 'next_steps',
  key_research: 'key_research',
  status: 'status',
  type: 'type',
  progress: 'progress',
};

const EDITABLE_FIELDS = new Set<string>([
  'business_name',
  'full_name',
  'status',
  'type',
  'project_name',
  'company_niche',
  'estimated_price',
]);

function normaliseValueForClient(field: string, value: string) {
  if (field === 'estimated_price') {
    const numeric = Number(value);
    return Number.isNaN(numeric) ? null : numeric;
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }

  return value;
}

function normaliseValueForDatabase(field: string, value: string) {
  if (field === 'estimated_price') {
    const numeric = Number(value);
    return Number.isNaN(numeric) ? null : numeric;
  }

  if (!value || value.trim().length === 0) {
    return null;
  }

  return value;
}

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
  const [tableClients, setTableClients] = useState<ClientData[]>([]);
  const editInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const { clients: rawClients, isLoading, totalCount, refetch } = useClientsList({
    page,
    pageSize: viewPreference.pageSize,
    searchQuery,
    statusFilter,
    sortColumn: viewPreference.sortColumn,
    sortDirection: viewPreference.sortDirection
  });

  useEffect(() => {
    setTableClients(rawClients);
  }, [rawClients]);

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
      prev.length === tableClients.length ? [] : tableClients.map(client => client.id)
    );
  }, [tableClients]);

  const handleSelectClient = useCallback((clientId: string) => {
    setSelectedClients(prev => 
      prev.includes(clientId) 
        ? prev.filter(id => id !== clientId)
        : [...prev, clientId]
    );
  }, []);

  const handleStartEdit = useCallback((client: ClientData, field: string) => {
    if (!EDITABLE_FIELDS.has(field)) {
      return;
    }

    setEditingCell({ id: client.id, field });
    setEditValue(String(client[field as keyof ClientData] || ''));
  }, []);

  const handleSaveEdit = useCallback(async ({ id, field, value }: { id: string; field: string; value: string }) => {
    if (!EDITABLE_FIELDS.has(field)) {
      return;
    }

    const dbField = COLUMN_DB_FIELD_MAP[field] || field;
    const clientValue = normaliseValueForClient(field, value);
    const dbValue = normaliseValueForDatabase(field, value);

    setTableClients((prev) =>
      prev.map((client) =>
        client.id === id
          ? {
              ...client,
              [field]: clientValue,
              updated_at: new Date().toISOString(),
            }
          : client
      )
    );
    setEditingCell(null);
    setEditValue('');

    try {
      const { error } = await supabase
        .from('client_onboarding')
        .update({ 
          [dbField]: dbValue,
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
        title: "Couldn't sync change",
        description: error.message || "Your update is visible locally but failed to sync to Supabase."
      });
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
    clients: tableClients,
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
