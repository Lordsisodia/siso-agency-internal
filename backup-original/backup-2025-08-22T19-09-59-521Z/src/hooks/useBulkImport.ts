
import { useState } from 'react';
import { toast } from 'sonner';
import { useLeadImport, ImportLead } from '@/hooks/useLeadImport';

export type ImportMode = 'skip' | 'update' | 'merge' | 'fail';

export const useBulkImport = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  
  const { importLeads } = useLeadImport();

  const processImport = async (data: ImportLead[], mode: ImportMode = 'skip'): Promise<boolean> => {
    try {
      setIsProcessing(true);
      setValidationErrors([]);
      setImportProgress(0);

      const results = await importLeads.mutateAsync({ leads: data, mode });
      
      if (results.errors && results.errors.length > 0) {
        setValidationErrors(results.errors);
        return false;
      }

      setImportProgress(100);
      return true;
    } catch (error) {
      console.error('Import error:', error);
      setValidationErrors([error instanceof Error ? error.message : 'Import failed']);
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    isProcessing,
    importProgress,
    validationErrors,
    processImport,
  };
};
