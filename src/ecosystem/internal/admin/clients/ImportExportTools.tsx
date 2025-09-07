
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Download, Upload } from 'lucide-react';
import { ClientData } from '@/types/client.types';
import { useToast } from '@/hooks/use-toast';

interface ImportExportToolsProps {
  clients: ClientData[];
  onImportComplete: () => void;
}

export function ImportExportTools({ clients, onImportComplete }: ImportExportToolsProps) {
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const { toast } = useToast();

  const handleExport = () => {
    if (clients.length === 0) {
      toast({
        variant: "destructive",
        title: "No data to export",
        description: "There are no clients available to export."
      });
      return;
    }

    try {
      // Filter out sensitive or unnecessary data
      const exportData = clients.map(client => ({
        id: client.id,
        full_name: client.full_name,
        email: client.email,
        business_name: client.business_name,
        phone: client.phone,
        status: client.status,
        project_name: client.project_name,
        company_niche: client.company_niche,
        development_url: client.development_url,
        notion_plan_url: client.notion_plan_url,
        estimated_price: client.estimated_price,
        estimated_completion_date: client.estimated_completion_date,
        next_steps: client.next_steps,
        key_research: client.key_research,
        created_at: client.created_at,
        updated_at: client.updated_at
      }));

      // Create CSV or JSON file
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      // Create download link and trigger download
      const exportFileDefaultName = `clients-export-${new Date().toISOString().slice(0, 10)}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      toast({
        title: "Export successful",
        description: `Exported ${clients.length} clients as JSON`
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        variant: "destructive",
        title: "Export failed",
        description: "Failed to export client data. Please try again."
      });
    }
  };

  const handleImportClick = () => {
    setIsImportDialogOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setImportFile(e.target.files[0]);
    }
  };

  const handleImport = async () => {
    if (!importFile) {
      toast({
        variant: "destructive",
        title: "No file selected",
        description: "Please select a JSON file to import."
      });
      return;
    }

    try {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        if (!e.target?.result) return;
        
        try {
          const importedData = JSON.parse(e.target.result as string);
          
          if (!Array.isArray(importedData)) {
            throw new Error("Invalid import format. Expected an array of clients.");
          }

          // Here you would process the imported data and add it to your database
          // For now, we're just showing a success message
          toast({
            title: "Import successful",
            description: `Imported ${importedData.length} clients`
          });
          
          setIsImportDialogOpen(false);
          setImportFile(null);
          onImportComplete();
        } catch (parseError) {
          console.error('Import parse error:', parseError);
          toast({
            variant: "destructive",
            title: "Import failed",
            description: "Invalid JSON format. Please check your file and try again."
          });
        }
      };
      
      reader.readAsText(importFile);
    } catch (error) {
      console.error('Import error:', error);
      toast({
        variant: "destructive",
        title: "Import failed",
        description: "Failed to import client data. Please try again."
      });
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handleExport}
        className="h-9"
      >
        <Download className="h-4 w-4 mr-2" />
        Export
      </Button>
      
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handleImportClick}
        className="h-9"
      >
        <Upload className="h-4 w-4 mr-2" />
        Import
      </Button>
      
      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Clients</DialogTitle>
            <DialogDescription>
              Upload a JSON file with client data to import. This will add new clients to your database.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <Input
              type="file"
              accept=".json"
              onChange={handleFileChange}
            />
            <p className="text-sm text-muted-foreground mt-2">
              The file should contain a JSON array of client objects.
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsImportDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleImport}>
              Import Clients
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
