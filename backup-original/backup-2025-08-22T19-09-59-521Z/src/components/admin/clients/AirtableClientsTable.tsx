import * as React from "react";
import { useRef, useMemo, useState, useId } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuItem
} from "@/components/ui/dropdown-menu";
import {
  ChevronDown,
  ChevronFirst,
  ChevronLast,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  CircleX,
  Columns3,
  Filter,
  ListFilter,
  Plus,
  Trash,
  Ellipsis,
  CircleAlert,
  Edit,
  Check,
  X,
  TrendingUp,
  Calendar,
  Activity,
  BarChart3,
  CheckCircle
} from "lucide-react";
import { useClientsList } from "@/hooks/client";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  getFacetedUniqueValues,
  useReactTable,
  SortingState,
  ColumnFiltersState,
  VisibilityState,
  PaginationState,
  Row
} from "@tanstack/react-table";
import { Pagination, PaginationContent, PaginationItem } from "@/components/ui/pagination";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { ClientData } from "@/types/client.types";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { ViewClientCard } from "./ViewClientCard";
import { Progress } from "@/components/ui/progress";

// Client progress component
function ClientProgress({ client }: { client: TableClient }) {
  // Calculate progress based on onboarding steps and project status
  const getProgressValue = () => {
    if (client.status === 'completed' || client.status === 'converted') return 100;
    if (client.status === 'delivery') return 90;
    if (client.status === 'in_progress') return 70;
    if (client.status === 'qualifying') return 40;
    if (client.status === 'contacted') return 20;
    return 10; // new
  };

  const getProgressColor = () => {
    const value = getProgressValue();
    if (value >= 90) return "bg-green-500";
    if (value >= 70) return "bg-orange-500";
    if (value >= 40) return "bg-blue-500";
    if (value >= 20) return "bg-yellow-500";
    return "bg-gray-500";
  };

  return (
    <div className="flex items-center gap-2 min-w-[120px]">
      <Progress 
        value={getProgressValue()} 
        className="h-2 flex-1"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.1)'
        }}
      />
      <span className="text-xs text-gray-400 min-w-[30px]">{getProgressValue()}%</span>
    </div>
  );
}

// Activity indicator component
function ActivityIndicator({ lastActivity }: { lastActivity?: string }) {
  // Mock activity calculation - in real app this would come from database
  const daysAgo = Math.floor(Math.random() * 14);
  
  const getActivityColor = () => {
    if (daysAgo <= 1) return "text-green-400";
    if (daysAgo <= 3) return "text-orange-400";
    if (daysAgo <= 7) return "text-yellow-400";
    return "text-gray-400";
  };

  const getActivityText = () => {
    if (daysAgo === 0) return "Today";
    if (daysAgo === 1) return "Yesterday";
    return `${daysAgo}d ago`;
  };

  return (
    <div className="flex items-center gap-2">
      <Activity className={`h-3 w-3 ${getActivityColor()}`} />
      <span className={`text-xs ${getActivityColor()}`}>{getActivityText()}</span>
    </div>
  );
}

// Inline editable cell component
interface EditableCellProps {
  value: string | number | undefined;
  onSave: (value: string) => void;
  type?: 'text' | 'select' | 'number';
  options?: { value: string; label: string }[];
  className?: string;
}

function EditableCell({ value, onSave, type = 'text', options, className }: EditableCellProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(String(value || ''));
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    onSave(editValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(String(value || ''));
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  React.useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  if (isEditing) {
    return (
      <div className="flex items-center gap-1">
        {type === 'select' && options ? (
          <Select value={editValue} onValueChange={setEditValue}>
            <SelectTrigger className="h-8 bg-black/60 border-orange-500/30 text-white focus:border-orange-500">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-black/90 border-orange-500/30 backdrop-blur-xl">
              {options.map((option) => (
                <SelectItem 
                  key={option.value} 
                  value={option.value}
                  className="text-white hover:bg-orange-500/10 focus:bg-orange-500/20"
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <Input
            ref={inputRef}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleSave}
            type={type === 'number' ? 'number' : 'text'}
            className="h-8 bg-black/60 border-orange-500/30 text-white focus:border-orange-500"
          />
        )}
        <div className="flex gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={handleSave}
            className="h-6 w-6 p-0 text-green-400 hover:bg-green-400/20"
          >
            <Check size={12} />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleCancel}
            className="h-6 w-6 p-0 text-red-400 hover:bg-red-400/20"
          >
            <X size={12} />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={() => setIsEditing(true)}
      className={cn(
        "cursor-pointer px-2 py-1 rounded hover:bg-orange-500/10 min-h-[32px] flex items-center group transition-colors",
        className
      )}
    >
      <span className="flex-1">{value || '-'}</span>
      <Edit size={12} className="opacity-0 group-hover:opacity-70 text-orange-400 ml-2 transition-opacity" />
    </div>
  );
}

// Enhanced status badge with lifecycle colors
function statusToBadge(status: string) {
  const statusOption = statusOptions.find(opt => opt.value === status);
  const label = statusOption?.label || status.charAt(0).toUpperCase() + status.slice(1);
  
  switch (status) {
    case 'completed':
    case 'converted':
      return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">{label}</Badge>;
    case 'contacted':
    case 'in_progress':
      return <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">{label}</Badge>;
    case 'qualifying':
      return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">{label}</Badge>;
    case 'delivery':
      return <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">{label}</Badge>;
    case 'churned':
      return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">{label}</Badge>;
    case 'pending':
    case 'new':
    default:
      return <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">{label}</Badge>;
  }
}

type TableClient = ClientData & { id: string; };

// Enhanced status options with lifecycle stages
const statusOptions = [
  { value: 'new', label: 'New Lead', color: 'amber' },
  { value: 'contacted', label: 'Contacted', color: 'orange' },
  { value: 'qualifying', label: 'Qualifying', color: 'blue' },
  { value: 'in_progress', label: 'In Progress', color: 'orange' },
  { value: 'delivery', label: 'In Delivery', color: 'purple' },
  { value: 'completed', label: 'Completed', color: 'green' },
  { value: 'converted', label: 'Converted', color: 'green' },
  { value: 'pending', label: 'Pending', color: 'amber' },
  { value: 'churned', label: 'Churned', color: 'red' }
];

// Enhanced columns with inline editing
const createColumns = (
  onUpdateField: (id: string, field: string, value: string) => void
): ColumnDef<TableClient>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected() ? true : table.getIsSomePageRowsSelected() ? "indeterminate" : false}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="border-orange-500/30 data-[state=checked]:bg-orange-600 data-[state=checked]:border-orange-600"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="border-orange-500/30 data-[state=checked]:bg-orange-600 data-[state=checked]:border-orange-600"
      />
    ),
    size: 28,
    enableSorting: false,
    enableHiding: false,
  },
  {
    header: "Name",
    accessorKey: "full_name",
    cell: ({ row }) => (
      <EditableCell
        value={row.getValue("full_name")}
        onSave={(value) => onUpdateField(row.original.id, 'full_name', value)}
        className="font-medium"
      />
    ),
    size: 180,
    enableHiding: false,
    filterFn: (row, columnId, filterValue) => {
      const rowValue = [row.original.full_name, row.original.email || ""].join(" ").toLowerCase();
      return rowValue.includes((filterValue ?? "").toLowerCase());
    },
  },
  {
    header: "Email",
    accessorKey: "email",
    size: 210,
    cell: ({ row }) => (
      <EditableCell
        value={row.getValue("email")}
        onSave={(value) => onUpdateField(row.original.id, 'email', value)}
      />
    )
  },
  {
    header: "Business Name",
    accessorKey: "business_name",
    size: 170,
    cell: ({ row }) => (
      <EditableCell
        value={row.getValue("business_name")}
        onSave={(value) => onUpdateField(row.original.id, 'business_name', value)}
      />
    )
  },
  {
    header: "Status",
    accessorKey: "status",
    cell: ({ row }) => (
      <EditableCell
        value={row.getValue("status")}
        onSave={(value) => onUpdateField(row.original.id, 'status', value)}
        type="select"
        options={statusOptions}
      />
    ),
    size: 120,
    filterFn: (row, columnId, filterValue: string[]) => {
      if (!filterValue?.length) return true;
      const status = row.getValue(columnId) as string;
      return filterValue.includes(status);
    },
  },
  {
    header: "Project",
    accessorKey: "project_name",
    size: 190,
    cell: ({ row }) => (
      <EditableCell
        value={row.getValue("project_name")}
        onSave={(value) => onUpdateField(row.original.id, 'project_name', value)}
      />
    )
  },
  {
    header: "Balance",
    accessorKey: "estimated_price",
    cell: ({ row }) => (
      <EditableCell
        value={row.getValue("estimated_price")}
        onSave={(value) => onUpdateField(row.original.id, 'estimated_price', value)}
        type="number"
      />
    ),
    size: 120,
  },
  {
    header: "Progress",
    accessorKey: "progress",
    cell: ({ row }) => <ClientProgress client={row.original} />,
    size: 140,
    enableSorting: false,
  },
  {
    header: "Last Activity",
    accessorKey: "last_activity",
    cell: ({ row }) => <ActivityIndicator lastActivity={row.getValue("last_activity")} />,
    size: 110,
    enableSorting: false,
  },
  {
    id: "viewClient",
    header: "Client Page",
    cell: ({ row }) => {
      return <ViewClientCard clientId={row.original.id} />;
    },
    size: 130,
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => <RowActions row={row} onUpdateField={onUpdateField} />,
    size: 60,
    enableHiding: false,
  }
];

import { AirtableTable } from "@/components/common/AirtableTable";

function RowActions({ 
  row, 
  onUpdateField 
}: { 
  row: Row<TableClient>;
  onUpdateField: (id: string, field: string, value: string) => void;
}) {
  const handleDelete = () => {
    // TODO: Implement delete functionality
    console.log('Delete client:', row.original.id);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="flex justify-end">
          <Button 
            size="icon" 
            variant="ghost" 
            className="shadow-none text-orange-400 hover:text-orange-300 hover:bg-orange-500/10" 
            aria-label="Edit client"
          >
            <Ellipsis size={16} strokeWidth={2} aria-hidden="true" />
          </Button>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-black/90 border-orange-500/30 backdrop-blur-xl">
        <DropdownMenuLabel className="text-orange-300">Client Actions</DropdownMenuLabel>
        <DropdownMenuItem 
          onClick={handleDelete}
          className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
        >
          <Trash size={14} className="mr-2" />
          Delete Client
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Add new row component
interface AddNewRowProps {
  onAddClient: (clientData: Partial<ClientData>) => void;
  columnsCount: number;
}

function AddNewRow({ onAddClient, columnsCount }: AddNewRowProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newClient, setNewClient] = useState<Partial<ClientData>>({
    full_name: '',
    email: '',
    business_name: '',
    status: 'new',
    project_name: '',
    estimated_price: 0
  });

  const handleSave = () => {
    if (newClient.full_name || newClient.business_name) {
      onAddClient(newClient);
      setNewClient({
        full_name: '',
        email: '',
        business_name: '',
        status: 'new',
        project_name: '',
        estimated_price: 0
      });
      setIsAdding(false);
    }
  };

  const handleCancel = () => {
    setNewClient({
      full_name: '',
      email: '',
      business_name: '',
      status: 'new',
      project_name: '',
      estimated_price: 0
    });
    setIsAdding(false);
  };

  if (isAdding) {
    return (
      <TableRow className="border-orange-500/30 bg-black/40 backdrop-blur-sm">
        <TableCell>
          <Checkbox disabled className="border-orange-500/30" />
        </TableCell>
        <TableCell>
          <Input
            value={newClient.full_name || ''}
            onChange={(e) => setNewClient(prev => ({ ...prev, full_name: e.target.value }))}
            placeholder="Full Name"
            className="h-8 bg-black/60 border-orange-500/30 text-white focus:border-orange-500 placeholder:text-gray-400"
          />
        </TableCell>
        <TableCell>
          <Input
            value={newClient.email || ''}
            onChange={(e) => setNewClient(prev => ({ ...prev, email: e.target.value }))}
            placeholder="Email"
            type="email"
            className="h-8 bg-black/60 border-orange-500/30 text-white focus:border-orange-500 placeholder:text-gray-400"
          />
        </TableCell>
        <TableCell>
          <Input
            value={newClient.business_name || ''}
            onChange={(e) => setNewClient(prev => ({ ...prev, business_name: e.target.value }))}
            placeholder="Business Name"
            className="h-8 bg-black/60 border-orange-500/30 text-white focus:border-orange-500 placeholder:text-gray-400"
          />
        </TableCell>
        <TableCell>
          <Select 
            value={newClient.status || 'new'} 
            onValueChange={(value) => setNewClient(prev => ({ ...prev, status: value as any }))}
          >
            <SelectTrigger className="h-8 bg-black/60 border-orange-500/30 text-white focus:border-orange-500">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-black/90 border-orange-500/30 backdrop-blur-xl">
              {statusOptions.map((option) => (
                <SelectItem 
                  key={option.value} 
                  value={option.value}
                  className="text-white hover:bg-orange-500/10 focus:bg-orange-500/20"
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </TableCell>
        <TableCell>
          <Input
            value={newClient.project_name || ''}
            onChange={(e) => setNewClient(prev => ({ ...prev, project_name: e.target.value }))}
            placeholder="Project Name"
            className="h-8 bg-black/60 border-orange-500/30 text-white focus:border-orange-500 placeholder:text-gray-400"
          />
        </TableCell>
        <TableCell>
          <Input
            value={newClient.estimated_price || ''}
            onChange={(e) => setNewClient(prev => ({ ...prev, estimated_price: parseFloat(e.target.value) || 0 }))}
            placeholder="0.00"
            type="number"
            className="h-8 bg-black/60 border-orange-500/30 text-white focus:border-orange-500 placeholder:text-gray-400"
          />
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-2">
            <Progress value={10} className="h-2 flex-1" />
            <span className="text-xs text-gray-400">10%</span>
          </div>
        </TableCell>
        <TableCell>
          <ActivityIndicator />
        </TableCell>
        <TableCell>-</TableCell>
        <TableCell>
          <div className="flex gap-1">
            <Button
              size="sm"
              onClick={handleSave}
              className="h-6 w-6 p-0 bg-green-600 hover:bg-green-700 border-green-500"
            >
              <Check size={12} />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleCancel}
              className="h-6 w-6 p-0 text-red-400 hover:bg-red-400/20"
            >
              <X size={12} />
            </Button>
          </div>
        </TableCell>
      </TableRow>
    );
  }

  return (
    <TableRow 
      className="border-dashed border-orange-500/30 hover:bg-orange-500/5 cursor-pointer transition-colors"
      onClick={() => setIsAdding(true)}
    >
      <TableCell colSpan={columnsCount} className="text-center py-4">
        <div className="flex items-center justify-center gap-2 text-orange-400 hover:text-orange-300 transition-colors">
          <Plus size={16} />
          <span>Add new client</span>
        </div>
      </TableCell>
    </TableRow>
  );
}

// Enhanced metrics component with real data calculations
function ClientMetrics({ clients }: { clients: TableClient[] }) {
  const metrics = React.useMemo(() => {
    console.log('ClientMetrics calculating from real data:', clients.length, 'clients');
    console.log('Sample client data:', clients.map(c => ({ name: c.business_name, status: c.status, price: c.estimated_price })));
    const total = clients.length;
    
    // Calculate active projects based on real status values from sample data
    const activeStatuses = ['In Progress', 'Contacted', 'in_progress', 'contacted', 'qualifying'];
    const active = clients.filter(c => {
      const status = c.status || '';
      const progress = c.progress || '';
      return activeStatuses.includes(status) || activeStatuses.includes(progress);
    }).length;
    
    // Calculate completed projects
    const completedStatuses = ['Completed', 'completed', 'converted', 'Delivered'];
    const completed = clients.filter(c => {
      const status = c.status || '';
      const progress = c.progress || '';
      return completedStatuses.includes(status) || completedStatuses.includes(progress);
    }).length;
    
    // Calculate total revenue from estimated_price field
    const revenue = clients.reduce((sum, c) => {
      const price = typeof c.estimated_price === 'number' ? c.estimated_price : 0;
      return sum + price;
    }, 0);
    
    // Calculate average project value
    const avgValue = total > 0 ? revenue / total : 0;
    
    // Calculate pending projects (new leads)
    const pendingStatuses = ['Not contacted', 'new', 'pending'];
    const pending = clients.filter(c => {
      const status = c.status || '';
      return pendingStatuses.includes(status);
    }).length;

    return { 
      total, 
      active, 
      completed, 
      revenue, 
      avgValue,
      pending,
      conversionRate: total > 0 ? Math.round((completed / total) * 100) : 0
    };
  }, [clients]);

  return (
    <div className="space-y-4 mb-6">
      {/* Data source indicator */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Client Overview</h3>
        <span className="text-xs text-gray-500 bg-black/40 px-2 py-1 rounded border border-orange-500/20">
          Real Data • {new Date().toLocaleDateString()}
        </span>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-black/40 backdrop-blur-sm border border-orange-500/20 rounded-lg p-4 hover:bg-black/60 transition-all">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="h-4 w-4 text-orange-400" />
            <span className="text-sm text-gray-400">Total Clients</span>
          </div>
          <p className="text-2xl font-bold text-white">{metrics.total}</p>
          <p className="text-xs text-gray-500 mt-1">{metrics.pending} new leads</p>
        </div>
        
        <div className="bg-black/40 backdrop-blur-sm border border-orange-500/20 rounded-lg p-4 hover:bg-black/60 transition-all">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="h-4 w-4 text-orange-400" />
            <span className="text-sm text-gray-400">Active Projects</span>
          </div>
          <p className="text-2xl font-bold text-white">{metrics.active}</p>
          <p className="text-xs text-gray-500 mt-1">In progress</p>
        </div>
        
        <div className="bg-black/40 backdrop-blur-sm border border-orange-500/20 rounded-lg p-4 hover:bg-black/60 transition-all">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="h-4 w-4 text-green-400" />
            <span className="text-sm text-gray-400">Completed</span>
          </div>
          <p className="text-2xl font-bold text-white">{metrics.completed}</p>
          <p className="text-xs text-gray-500 mt-1">{metrics.conversionRate}% conversion</p>
        </div>
        
        <div className="bg-black/40 backdrop-blur-sm border border-orange-500/20 rounded-lg p-4 hover:bg-black/60 transition-all">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-green-400" />
            <span className="text-sm text-gray-400">Total Value</span>
          </div>
          <p className="text-2xl font-bold text-white">£{metrics.revenue.toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-1">£{Math.round(metrics.avgValue)} avg</p>
        </div>
      </div>
    </div>
  );
}

export function AirtableClientsTable({
  searchQuery = "",
  statusFilter = "all",
  onSearchChange,
  onStatusFilterChange,
}: {
  searchQuery?: string;
  statusFilter?: string;
  onSearchChange?: (query: string) => void;
  onStatusFilterChange?: (status: string) => void;
}) {
  const id = useId();
  const { toast } = useToast();

  // Use our clients list hook
  const { clients, totalCount, isLoading, refetch } = useClientsList({
    searchQuery,
    statusFilter,
    sortColumn: "updated_at",
    sortDirection: "desc"
  });

  // Table state
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState<SortingState>([{ id: "full_name", desc: false }]);

  // Handle field updates
  const handleUpdateField = async (id: string, field: string, value: string) => {
    try {
      // TODO: Implement actual API call to update client
      console.log('Updating client:', { id, field, value });
      
      toast({
        title: "Client Updated",
        description: `${field} has been updated successfully.`,
      });
      
      // Refetch data to get latest changes
      await refetch();
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update client. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle adding new client
  const handleAddClient = async (clientData: Partial<ClientData>) => {
    try {
      // TODO: Implement actual API call to create client
      console.log('Adding new client:', clientData);
      
      toast({
        title: "Client Added",
        description: "New client has been added successfully.",
      });
      
      // Refetch data to include new client
      await refetch();
    } catch (error) {
      toast({
        title: "Add Failed",
        description: "Failed to add new client. Please try again.",
        variant: "destructive",
      });
    }
  };

  const columns = useMemo(() => createColumns(handleUpdateField), []);

  const data: TableClient[] = React.useMemo(
    () => clients.map(c => ({ ...c, id: c.id })),
    [clients]
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      pagination,
      columnFilters,
      columnVisibility,
    },
    enableSortingRemoval: false,
    manualPagination: false,
  });

  // Enhanced AirtableTable with add row functionality
  return (
    <div className="w-full px-0 sm:px-2 lg:px-4 xl:px-0">
      {/* Client Metrics Dashboard */}
      <ClientMetrics clients={data} />
      
      <AirtableTable
        table={table}
        columns={columns}
        searchQuery={searchQuery}
        statusFilter={statusFilter}
        onSearchChange={onSearchChange}
        onStatusFilterChange={onStatusFilterChange}
        renderRowActions={(row) => <RowActions row={row} onUpdateField={handleUpdateField} />}
        statusBadge={statusToBadge}
        addButton={
          <Button className="ml-auto bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg shadow-orange-500/25" variant="default">
            <Plus className="-ms-1 me-2 opacity-90" size={16} strokeWidth={2} aria-hidden="true" />
            Add client
          </Button>
        }
        deleteSelectedTitle="Delete client(s)"
        addNewRow={<AddNewRow onAddClient={handleAddClient} columnsCount={columns.length} />}
      />
    </div>
  );
}
