
import React, { useRef, useState, useEffect } from 'react';
import { TableColumn } from "@/hooks/useTableColumns";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import "@/components/ui/hide-scrollbar.css";

interface SpreadsheetTableProps {
  children: React.ReactNode;
  className?: string;
  pinnedColumns?: TableColumn[];
  showGrid?: boolean;
  containerClassName?: string;
}

export function SpreadsheetTable({ 
  children, 
  className, 
  pinnedColumns = [],
  showGrid = true,
  containerClassName
}: SpreadsheetTableProps) {
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
        "relative border border-border/30 rounded-lg overflow-hidden spreadsheet-grid",
        containerClassName
      )}
      style={{ background: "#121212" }} // dark background for the spreadsheet container
    >
      <ScrollArea
        ref={tableRef}
        className={cn("h-full max-h-[calc(100vh-300px)]", className)}
        style={{ background: "#121212" }}
      >
        <div className="relative">
          {/* sticky header background */}
          <div
            className="sticky top-0 z-20 border-b border-border/20 bg-background"
            style={{ height: `${headerHeight}px` }}
          />
          {children}
        </div>
      </ScrollArea>
    </div>
  );
}
