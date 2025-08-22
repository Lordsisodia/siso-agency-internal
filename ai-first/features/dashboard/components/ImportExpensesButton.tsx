
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Import } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { seedExpensesFromList } from "@/utils/financial/bulkExpenseSeeder";

/**
 * Button to import hardcoded bulk expenses into the database.
 */
export function ImportExpensesButton({ onImport }: { onImport?: () => void }) {
  const [isImporting, setIsImporting] = useState(false);

  const handleImport = async () => {
    setIsImporting(true);
    try {
      await seedExpensesFromList();
      toast({
        title: "Expenses Imported",
        description: "Sample expenses have been imported.",
      });
      onImport?.();
    } catch (error: any) {
      toast({
        title: "Import Failed",
        description: error?.message || "Failed to import expenses.",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Button 
      variant="outline"
      onClick={handleImport}
      disabled={isImporting}
      className="ml-2"
    >
      <Import className="h-4 w-4 mr-2" />
      {isImporting ? "Importing..." : "Import Demo Expenses"}
    </Button>
  );
}
