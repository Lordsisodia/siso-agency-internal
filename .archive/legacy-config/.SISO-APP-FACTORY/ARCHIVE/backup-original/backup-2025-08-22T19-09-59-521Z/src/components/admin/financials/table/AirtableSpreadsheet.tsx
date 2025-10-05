
import React, { useRef, useState, useEffect } from 'react';
import { TableColumn } from "@/hooks/useTableColumns";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead
} from "@/components/ui/table";
import "@/components/ui/hide-scrollbar.css";

interface AirtableSpreadsheetProps {
  children: React.ReactNode;
  className?: string;
  headerContent: React.ReactNode;
  bodyContent: React.ReactNode;
  pinnedColumns?: TableColumn[];
  showGrid?: boolean;
  containerClassName?: string;
}

export function AirtableSpreadsheet({ 
  children, 
  className,
  headerContent,
  bodyContent,
  pinnedColumns = [],
  showGrid = true,
  containerClassName
}: AirtableSpreadsheetProps) {
  const [headerHeight, setHeaderHeight] = useState(0);
  const tableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (tableRef.current) {
      const headerElement = tableRef.current.querySelector('thead');
      if (headerElement) {
        setHeaderHeight(headerElement.offsetHeight);
      }
    }
  }, [children]);

  return (
    <div 
      className={cn(
        "relative border border-border/30 rounded-lg overflow-hidden",
        showGrid && "airtable-grid",
        containerClassName
      )}
    >
      <ScrollArea
        ref={tableRef}
        className={cn("h-full max-h-[calc(100vh-300px)]", className)}
      >
        <div className="relative">
          <Table>
            <TableHeader>
              {headerContent}
            </TableHeader>
            <TableBody>
              {bodyContent}
            </TableBody>
          </Table>
        </div>
      </ScrollArea>
    </div>
  );
}
