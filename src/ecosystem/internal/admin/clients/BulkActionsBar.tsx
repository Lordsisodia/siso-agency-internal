
import React from 'react';
import { Button } from '@/components/ui/button';
import { Trash2, Download } from "lucide-react";

interface BulkActionsBarProps {
  selectedCount: number;
  onDeleteSelected: () => void;
  onExportSelected: () => void;
}

export const BulkActionsBar = ({
  selectedCount,
  onDeleteSelected,
  onExportSelected
}: BulkActionsBarProps) => {
  return (
    <div className="flex items-center gap-2 mb-4 py-2.5 px-4 rounded-lg bg-card/30 border border-border/50 shadow-sm backdrop-blur-sm">
      <span className="text-sm font-medium text-muted-foreground">
        {selectedCount} clients selected
      </span>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={onDeleteSelected} 
        className="border-border/50 text-destructive hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
      >
        <Trash2 className="h-4 w-4 mr-1.5" />
        Delete
      </Button>
      <Button 
        variant="outline" 
        size="sm" 
        className="border-border/50 text-muted-foreground hover:bg-muted/50"
        onClick={onExportSelected}
      >
        <Download className="h-4 w-4 mr-1.5" />
        Export
      </Button>
    </div>
  );
};
