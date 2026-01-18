import React from 'react';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { 
  Search, 
  Filter, 
  Plus,
  RefreshCw,
  Columns
} from 'lucide-react';
import { ClientViewPreference, ClientData } from '@/types/client.types';
import { RefetchOptions } from '@tanstack/react-query';
import { ViewModeSwitcher } from "./ViewModeSwitcher";

interface ClientsHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  viewPreference?: ClientViewPreference;
  onViewPreferenceChange?: (preference: Partial<ClientViewPreference>) => void;
  onAddClient?: () => void;
  totalClients?: number;
  clients?: ClientData[];
  onRefetch?: (options?: RefetchOptions) => Promise<unknown>;
  viewMode?: "table" | "cards";
  setViewMode?: (mode: "table" | "cards") => void;
}

export function ClientsHeader({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  viewPreference,
  onViewPreferenceChange,
  onAddClient,
  totalClients,
  clients,
  onRefetch,
  viewMode,
  setViewMode,
}: ClientsHeaderProps) {
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange(e.target.value);
  };

  const handleStatusChange = (value: string) => {
    onStatusFilterChange(value);
  };

  const handleRefresh = () => {
    if (onRefetch) {
      onRefetch();
    }
  };

  return (
    <div className="flex flex-col gap-6 mb-3">
      <div className="flex flex-row gap-4 items-center justify-between">
        <div className="flex gap-2 flex-1">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search clients..."
              value={searchQuery}
              onChange={handleSearchInputChange}
              className="pl-9 border-gray-700/50 bg-gray-900/60 shadow-sm text-gray-100 placeholder:text-gray-400 focus:border-gray-600 focus:bg-gray-900/80"
            />
          </div>
          <Select value={statusFilter} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-40 border-gray-700/50 bg-gray-900/60 shadow-sm text-gray-100 focus:border-gray-600">
              <Filter className="h-4 w-4 mr-2 text-gray-400" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="bg-gray-900/95 text-gray-100 shadow-xl border-gray-700/50 z-50">
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="proposal">Proposal</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {/* RIGHT SIDE: View Switch, Refresh, Add Button */}
        <div className="flex items-center gap-1">
          {viewMode && setViewMode && (
            <ViewModeSwitcher viewMode={viewMode} setViewMode={setViewMode} />
          )}
          <Button
            variant="outline"
            size="icon"
            className="ml-1"
            onClick={handleRefresh}
            title="Refresh"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          {viewPreference && onViewPreferenceChange && (
            <Button
              variant="outline"
              size="icon"
              className="ml-1"
              onClick={() => {
                console.log("Open column customization");
              }}
              title="Columns"
            >
              <Columns className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="outline"
            size="icon"
            className="ml-1"
            onClick={onAddClient}
            title="Add Client"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
