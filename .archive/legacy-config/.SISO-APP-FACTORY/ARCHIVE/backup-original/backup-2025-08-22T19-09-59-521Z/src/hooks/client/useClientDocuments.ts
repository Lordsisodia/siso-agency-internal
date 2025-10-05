
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ClientDocument } from '@/types/client.types';
import { supabase } from '@/integrations/supabase/client';

export const useClientDocuments = (clientId: string) => {
  const queryClient = useQueryClient();

  // Fetch client documents
  const { data: documents, isLoading } = useQuery({
    queryKey: ['client-documents', clientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('client_documents')
        .select('*')
        .eq('client_id', clientId)
        .order('position', { ascending: true });

      if (error) throw error;
      return data as ClientDocument[];
    }
  });

  // Create a new document
  const createDocumentMutation = useMutation({
    mutationFn: async (newDocument: Partial<ClientDocument> & { document_type: 'app_plan' | 'functionalities' | 'wireframes' | 'inspiration', title: string }) => {
      const { data, error } = await supabase
        .from('client_documents')
        .insert({
          ...newDocument,
          client_id: clientId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-documents', clientId] });
    }
  });

  // Update an existing document
  const updateDocumentMutation = useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<ClientDocument>) => {
      const { data, error } = await supabase
        .from('client_documents')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-documents', clientId] });
    }
  });

  // Delete a document
  const deleteDocumentMutation = useMutation({
    mutationFn: async (documentId: string) => {
      const { error } = await supabase
        .from('client_documents')
        .delete()
        .eq('id', documentId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-documents', clientId] });
    }
  });

  return {
    documents,
    isLoading,
    createDocument: createDocumentMutation.mutate,
    updateDocument: updateDocumentMutation.mutate,
    deleteDocument: deleteDocumentMutation.mutate
  };
};
