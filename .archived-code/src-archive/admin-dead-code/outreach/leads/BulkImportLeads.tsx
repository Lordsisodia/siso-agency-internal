
import React from 'react';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ColumnBasedImport } from './import/ColumnBasedImport';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function BulkImportLeads() {
  return (
    <Card className="max-h-[80vh] overflow-hidden flex flex-col">
      <div className="p-4 border-b">
        <h3 className="text-lg font-semibold">Bulk Import Leads</h3>
        <p className="text-sm text-muted-foreground">
          Paste your data into each column, with one value per line. The number of lines should match across all columns.
        </p>
      </div>

      <ScrollArea className="flex-1 p-4">
        <ColumnBasedImport />
      </ScrollArea>
    </Card>
  );
}
