
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Import } from "lucide-react";
import { ImportProgress } from "./ImportProgress";
import { FileInput } from "./FileInput";
import { toast } from "@/components/ui/use-toast";
import { addMultipleTransactions } from "@/utils/financial/transactionModifications";

interface BulkImportDialogProps {
  onImportComplete?: () => void;
}

export function BulkImportDialog({ onImportComplete }: BulkImportDialogProps) {
  const [importProgress, setImportProgress] = useState(0);
  const [isImporting, setIsImporting] = useState(false);
  const [open, setOpen] = useState(false);

  const handleImport = async (expenses: any[]) => {
    setIsImporting(true);
    setImportProgress(0);
    
    try {
      const success = await addMultipleTransactions(expenses);
      if (success) {
        toast({
          title: "Success",
          description: `Successfully imported ${expenses.length} expenses`,
        });
        // Close dialog and trigger data reload
        setOpen(false);
        if (onImportComplete) {
          onImportComplete();
        }
      }
    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: "Error",
        description: "Failed to import expenses",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
      setImportProgress(100);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Import className="mr-2 h-4 w-4" />
          Import
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Import Expenses</DialogTitle>
          <DialogDescription>
            Upload a CSV file with your expenses data.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <FileInput onDataReady={handleImport} isImporting={isImporting} />
          <ImportProgress progress={importProgress} isImporting={isImporting} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
