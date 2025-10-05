
import * as React from "react";
import { cn } from "@/lib/utils";
import { CheckIcon, ChevronsUpDown, ChevronDown, ChevronUp, PencilIcon, SaveIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Enhanced table components with Airtable-like functionality
const EnhancedTable = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => (
  <div className="relative w-full overflow-auto">
    <table 
      ref={ref} 
      className={cn(
        "w-full caption-bottom text-sm border-separate border-spacing-0",
        "bg-background backdrop-blur-sm",
        className
      )} 
      {...props} 
    />
  </div>
));
EnhancedTable.displayName = "EnhancedTable";

const EnhancedTableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead 
    ref={ref} 
    className={cn(
      "sticky top-0 z-20 bg-card/60 backdrop-blur-sm shadow-sm",
      className
    )}
    {...props} 
  />
));
EnhancedTableHeader.displayName = "EnhancedTableHeader";

const EnhancedTableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody 
    ref={ref} 
    className={cn(
      "[&_tr:last-child]:border-0",
      className
    )} 
    {...props} 
  />
));
EnhancedTableBody.displayName = "EnhancedTableBody";

const EnhancedTableRow = React.forwardRef<HTMLTableRowElement, React.HTMLAttributes<HTMLTableRowElement> & {
  isSelected?: boolean;
  isEditing?: boolean;
}>(({ className, isSelected, isEditing, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      "group transition-colors border-b border-border/30",
      "hover:bg-accent/5 data-[state=selected]:bg-accent/10",
      isSelected && "bg-accent/10",
      isEditing && "bg-accent/15 outline outline-1 outline-primary/30",
      className
    )}
    data-state={isSelected ? "selected" : undefined}
    {...props}
  />
));
EnhancedTableRow.displayName = "EnhancedTableRow";

const EnhancedTableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement> & {
    canSort?: boolean;
    isSorted?: boolean | 'asc' | 'desc';
  }
>(({ className, canSort, isSorted, children, ...props }, ref) => {
  const sorted = isSorted === true ? 'asc' : isSorted;

  return (
    <th
      ref={ref}
      className={cn(
        "h-10 px-3 text-left align-middle font-medium text-muted-foreground select-none",
        "border-r border-border/10 last:border-r-0",
        "[&:has([role=checkbox])]:w-10 [&:has([role=checkbox])]:pr-0",
        "[&:has([role=checkbox])]:pl-3 [&>[role=checkbox]]:translate-y-0.5",
        canSort && "cursor-pointer hover:bg-accent/5",
        className
      )}
      aria-sort={sorted ? (sorted === 'desc' ? 'descending' : 'ascending') : undefined}
      {...props}
    >
      <div className="flex items-center justify-between gap-1">
        <div className="flex-1 truncate">{children}</div>
        {canSort && (
          <div className="flex flex-col h-4 opacity-50">
            {sorted === 'asc' ? (
              <ChevronUp className="h-4 w-4 text-primary" />
            ) : sorted === 'desc' ? (
              <ChevronDown className="h-4 w-4 text-primary" />
            ) : (
              <ChevronsUpDown className="h-4 w-4" />
            )}
          </div>
        )}
      </div>
      <div className="absolute right-0 top-0 h-full w-1 cursor-col-resize touch-none" />
    </th>
  );
});
EnhancedTableHead.displayName = "EnhancedTableHead";

interface EnhancedTableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  isEditing?: boolean;
  isEditable?: boolean;
  onEdit?: () => void;
  onSave?: () => void;
  isSaving?: boolean;
}

const EnhancedTableCell = React.forwardRef<HTMLTableCellElement, EnhancedTableCellProps>(
  ({ className, isEditing, isEditable, onEdit, onSave, isSaving, children, ...props }, ref) => {
    return (
      <td
        ref={ref}
        className={cn(
          "p-2 align-middle relative border-r border-border/10 last:border-r-0",
          "[&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-0.5",
          isEditable && !isEditing && "hover:bg-accent/5 group-hover:cursor-pointer",
          isEditable && isEditing && "p-0 bg-background",
          className
        )}
        onClick={isEditable && !isEditing ? onEdit : undefined}
        {...props}
      >
        {children}
        {isEditable && !isEditing && (
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100">
            <div className="absolute inset-0 bg-accent/5" />
            <PencilIcon className="h-3 w-3 text-muted-foreground" />
          </div>
        )}
        {isEditable && isEditing && isSaving && (
          <div className="absolute top-1 right-1">
            <SaveIcon className="h-3 w-3 text-primary animate-pulse" />
          </div>
        )}
      </td>
    );
  }
);
EnhancedTableCell.displayName = "EnhancedTableCell";

interface EditableCellProps {
  value: string | number | null | undefined;
  onValueChange: (value: string) => void;
  onBlur?: () => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  className?: string;
}

const EditableCell = React.forwardRef<HTMLInputElement, EditableCellProps>(
  ({ value, onValueChange, onBlur, onKeyDown, className, ...props }, ref) => {
    const inputRef = React.useRef<HTMLInputElement>(null);

    React.useEffect(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.select();
      }
    }, []);

    return (
      <input
        ref={inputRef}
        className={cn(
          "w-full h-full px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/30",
          "border-0 bg-accent/5", 
          className
        )}
        value={value || ''}
        onChange={(e) => onValueChange(e.target.value)}
        onBlur={onBlur}
        onKeyDown={onKeyDown}
        autoComplete="off"
        {...props}
      />
    );
  }
);
EditableCell.displayName = "EditableCell";

export {
  EnhancedTable,
  EnhancedTableHeader,
  EnhancedTableBody,
  EnhancedTableRow,
  EnhancedTableHead,
  EnhancedTableCell,
  EditableCell
};
