import { useState } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { 
  MoreHorizontal, 
  Search, 
  Filter, 
  ArrowUpDown,
  FileDown,
  FilePlus,
  Edit,
  Trash,
  Eye,
  Send,
  Clock,
  Check,
  AlertCircle,
  Loader2
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { FinancialTransaction, deleteTransaction } from "@/utils/financial";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Plus } from "lucide-react";
import { AddRevenueDialog } from "./revenue/AddRevenueDialog";

interface RevenueTableProps {
  revenues: FinancialTransaction[];
  isLoading?: boolean;
  onDataChange?: () => void;
}

export function RevenueTable({ revenues = [], isLoading = false, onDataChange }: RevenueTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewDetailsId, setViewDetailsId] = useState<string | null>(null);
  const [sortField, setSortField] = useState<string>("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [showAddDialog, setShowAddDialog] = useState(false);

  // Get the revenue being viewed in the details dialog
  const revenueDetails = viewDetailsId 
    ? revenues.find(revenue => revenue.id === viewDetailsId) 
    : null;

  // Handle sort toggling
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Simple client-side filtering and sorting
  const filteredRevenues = revenues
    .filter(revenue => 
      revenue.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      revenue.vendor?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      `${revenue.amount}`.includes(searchQuery)
    )
    .sort((a, b) => {
      if (sortField === "amount") {
        return sortDirection === "asc" 
          ? a.amount - b.amount 
          : b.amount - a.amount;
      } else if (sortField === "date") {
        return sortDirection === "asc" 
          ? new Date(a.date).getTime() - new Date(b.date).getTime() 
          : new Date(b.date).getTime() - new Date(a.date).getTime();
      } else if (sortField === "name") {
        const aVal = a.description || "";
        const bVal = b.description || "";
        return sortDirection === "asc" 
          ? aVal.localeCompare(bVal) 
          : bVal.localeCompare(aVal);
      }
      return 0;
    });

  // Handle revenue deletion
  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this revenue?")) {
      const success = await deleteTransaction(id);
      if (success && onDataChange) {
        onDataChange();
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Revenue Tracking</h2>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search revenue..."
              className="pl-8 w-[250px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" size="sm" className="h-9">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" size="sm" className="h-9">
            <FileDown className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button size="sm" className="h-9" onClick={() => setShowAddDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Revenue
          </Button>
        </div>
      </div>

      {/* Add Revenue Dialog */}
      <AddRevenueDialog 
        open={showAddDialog} 
        onOpenChange={setShowAddDialog} 
        onRevenueAdded={onDataChange || (() => {})} 
      />

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">
                <div className="flex items-center cursor-pointer" onClick={() => handleSort("name")}>
                  Description
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead>Source/Client</TableHead>
              <TableHead>
                <div className="flex items-center cursor-pointer" onClick={() => handleSort("amount")}>
                  Amount
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center cursor-pointer" onClick={() => handleSort("date")}>
                  Date
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Invoice</TableHead>
              <TableHead>Payment Method</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  <div className="flex justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredRevenues.length > 0 ? (
              filteredRevenues.map(revenue => (
                <TableRow key={revenue.id}>
                  <TableCell className="font-medium">{revenue.description}</TableCell>
                  <TableCell>{revenue.vendor?.name || "—"}</TableCell>
                  <TableCell>£{revenue.amount.toFixed(2)}</TableCell>
                  <TableCell>{new Date(revenue.date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <StatusBadge status={revenue.status} />
                  </TableCell>
                  <TableCell>{revenue.notes || "—"}</TableCell>
                  <TableCell>{revenue.payment_method?.name || "—"}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setViewDetailsId(revenue.id)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Send className="h-4 w-4 mr-2" />
                          Generate Invoice
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-red-600" 
                          onClick={() => handleDelete(revenue.id)}
                        >
                          <Trash className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  No revenue records found. Try adjusting your filters or add a new revenue record.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Revenue Details Dialog */}
      {revenueDetails && (
        <Dialog open={!!viewDetailsId} onOpenChange={(open) => !open && setViewDetailsId(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Revenue Details</DialogTitle>
              <DialogDescription>
                View detailed information about this revenue.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Description</h3>
                  <p>{revenueDetails.description}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Amount</h3>
                  <p className="font-semibold">£{revenueDetails.amount.toFixed(2)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Date</h3>
                  <p>{new Date(revenueDetails.date).toLocaleDateString()}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Source/Client</h3>
                  <p>{revenueDetails.vendor?.name || "—"}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Payment Method</h3>
                  <p>{revenueDetails.payment_method?.name || "—"}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
                  <p>{revenueDetails.status}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Recurrence</h3>
                  <p>
                    {revenueDetails.recurring_type === 'monthly' 
                      ? 'Monthly' 
                      : revenueDetails.recurring_type === 'annual'
                      ? 'Annual'
                      : 'One-Time'}
                  </p>
                </div>
              </div>
              {revenueDetails.notes && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Notes</h3>
                  <p className="text-sm">{revenueDetails.notes}</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  let color = "bg-gray-100 text-gray-800";
  let icon = null;

  switch (status) {
    case "completed":
      color = "bg-green-100 text-green-800";
      icon = <Check className="h-3 w-3 mr-1" />;
      break;
    case "pending":
      color = "bg-amber-100 text-amber-800";
      icon = <Clock className="h-3 w-3 mr-1" />;
      break;
    case "overdue":
      color = "bg-red-100 text-red-800";
      icon = <AlertCircle className="h-3 w-3 mr-1" />;
      break;
    case "draft":
      color = "bg-blue-100 text-blue-800";
      icon = <Edit className="h-3 w-3 mr-1" />;
      break;
  }

  return (
    <Badge variant="outline" className={`${color} flex items-center w-fit`}>
      {icon}
      {status}
    </Badge>
  );
}
