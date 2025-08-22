
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Filter, ChevronDown, X, Download, RefreshCw, Upload } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ColumnManager } from '../../clients/ColumnManager';
import { LeadTableColumn } from '../types';
import { BulkImportLeads } from './BulkImportLeads';

interface LeadsToolbarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onAddLead: (e: React.FormEvent) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  selectedLeads: string[];
  onClearSelection: () => void;
  columns: LeadTableColumn[];
  onColumnsChange: (columns: LeadTableColumn[]) => void;
  showAllColumns: boolean;
  onToggleShowAll: () => void;
  onExport: () => void;
  onRefresh: () => void;
  isAddingLead?: boolean;
}

export const LeadsToolbar = ({
  searchQuery,
  onSearchChange,
  onAddLead,
  statusFilter,
  onStatusFilterChange,
  selectedLeads,
  onClearSelection,
  columns,
  onColumnsChange,
  showAllColumns,
  onToggleShowAll,
  onExport,
  onRefresh,
  isAddingLead
}: LeadsToolbarProps) => {
  const [importDialogOpen, setImportDialogOpen] = useState(false);

  return (
    <div className="px-4 py-2 border-b flex flex-wrap gap-2 items-center">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-8">
            <Filter className="h-4 w-4 mr-1" />
            Status: {statusFilter === 'all' ? 'All' : statusFilter}
            <ChevronDown className="h-4 w-4 ml-1" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => onStatusFilterChange('all')}>
            All
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onStatusFilterChange('new')}>
            New
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onStatusFilterChange('contacted')}>
            Contacted
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onStatusFilterChange('converted')}>
            Converted
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="flex-grow">
        <form onSubmit={onAddLead} className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search leads or add new..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-8 w-[240px]"
            />
          </div>
          <Button type="submit" disabled={isAddingLead || !searchQuery.trim()}>
            {isAddingLead ? 'Adding...' : 'Add Lead'}
          </Button>
        </form>
      </div>

      {selectedLeads.length > 0 && (
        <div className="flex items-center text-sm text-muted-foreground">
          <span>{selectedLeads.length} leads selected</span>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClearSelection}
            className="h-8 ml-2"
          >
            <X className="h-3 w-3 mr-1" />
            Clear
          </Button>
        </div>
      )}

      <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="h-8">
            <Upload className="h-4 w-4 mr-1" />
            Import
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-xl">
          <BulkImportLeads />
        </DialogContent>
      </Dialog>

      <ColumnManager 
        columns={columns}
        onColumnsChange={onColumnsChange}
        showAllColumns={showAllColumns}
        onToggleShowAll={onToggleShowAll}
      />

      <Button
        variant="outline"
        size="sm"
        className="h-8"
        onClick={onExport}
      >
        <Download className="h-4 w-4 mr-1" />
        Export
      </Button>

      <Button
        variant="outline"
        size="sm"
        className="h-8"
        onClick={onRefresh}
      >
        <RefreshCw className="h-4 w-4 mr-1" />
        Refresh
      </Button>
    </div>
  );
};
