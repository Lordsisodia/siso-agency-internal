import * as React from "react";
import { useId, useRef, useMemo, useState } from "react";
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
  DropdownMenuLabel
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
  Trash,
  Plus,
  Ellipsis,
  CircleAlert
} from "lucide-react";
import { Pagination, PaginationContent, PaginationItem } from "@/components/ui/pagination";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { flexRender, ColumnDef, SortingState, ColumnFiltersState, VisibilityState, PaginationState, Row, Table as ReactTableInstance } from "@tanstack/react-table";

/** 
 * Props:
 * - table: react-table instance
 * - columns: ColumnDef<TRow, any>[]
 * - data: TRow[]
 * - UI and action handlers specific to use-case, e.g. status filtering, search, delete, add
 * - renderRowActions: custom row actions (eg: Edit/Delete)
 */
type AirtableTableProps<TRow extends { id: string }> = {
  table: ReactTableInstance<TRow>;
  columns: ColumnDef<TRow, any>[];
  searchQuery: string;
  statusFilter?: string;
  onSearchChange?: (query: string) => void;
  onStatusFilterChange?: (status: string) => void;
  renderRowActions?: (row: Row<TRow>) => React.ReactNode;
  statusBadge?: (status: string) => React.ReactNode;
  addButton?: React.ReactNode;
  deleteSelectedTitle?: string;
  addNewRow?: React.ReactNode;
};

export function AirtableTable<TRow extends { id: string }>({
  table,
  columns,
  searchQuery,
  statusFilter,
  onSearchChange,
  onStatusFilterChange,
  renderRowActions,
  statusBadge,
  addButton,
  deleteSelectedTitle,
  addNewRow
}: AirtableTableProps<TRow>) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // For filters (status)
  const uniqueStatusValues = useMemo(() => {
    const statusColumn = table.getColumn("status");
    if (!statusColumn) return [];
    const values = Array.from(statusColumn.getFacetedUniqueValues().keys());
    return values.sort();
  }, [table.getColumn("status")?.getFacetedUniqueValues()]);

  const statusCounts = useMemo(() => {
    const statusColumn = table.getColumn("status");
    if (!statusColumn) return new Map();
    return statusColumn.getFacetedUniqueValues();
  }, [table.getColumn("status")?.getFacetedUniqueValues()]);

  const selectedStatuses = useMemo(() => {
    const filterValue = table.getColumn("status")?.getFilterValue() as string[];
    return filterValue ?? [];
  }, [table.getColumn("status")?.getFilterValue()]);

  const handleStatusChange = (checked: boolean, value: string) => {
    const filterValue = table.getColumn("status")?.getFilterValue() as string[];
    const newFilterValue = filterValue ? [...filterValue] : [];
    if (checked) {
      newFilterValue.push(value);
    } else {
      const index = newFilterValue.indexOf(value);
      if (index > -1) newFilterValue.splice(index, 1);
    }
    table.getColumn("status")?.setFilterValue(newFilterValue.length ? newFilterValue : undefined);
    onStatusFilterChange?.(newFilterValue.length ? newFilterValue[0] : "all");
  };

  // Delete selected rows (default just toast)
  const handleDeleteRows = () => {
    toast({
      title: deleteSelectedTitle || "Delete",
      description: "Bulk delete not yet implemented."
    });
  };

  return (
    <div className="w-full px-0 sm:px-2 lg:px-4 xl:px-0">
      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* Filter by name or email */}
          <div className="relative">
            <Input
              id={`${id}-input`}
              ref={inputRef}
              className={cn(
                "peer min-w-60 ps-9 bg-gray-800 border-gray-600 text-white placeholder:text-gray-400",
                Boolean(table.getColumn("full_name")?.getFilterValue()) && "pe-9",
              )}
              value={(table.getColumn("full_name")?.getFilterValue() ?? searchQuery) as string}
              onChange={(e) => {
                table.getColumn("full_name")?.setFilterValue(e.target.value);
                onSearchChange?.(e.target.value);
              }}
              placeholder="Filter by name or email..."
              type="text"
              aria-label="Filter by name or email"
            />
            <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-gray-400 peer-disabled:opacity-50">
              <ListFilter size={16} strokeWidth={2} aria-hidden="true" />
            </div>
            {Boolean(table.getColumn("full_name")?.getFilterValue()) && (
              <button
                className="absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-lg text-gray-400 outline-offset-2 transition-colors hover:text-gray-200 focus:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Clear filter"
                onClick={() => {
                  table.getColumn("full_name")?.setFilterValue("");
                  if (inputRef.current) inputRef.current.focus();
                  onSearchChange?.("");
                }}
              >
                <CircleX size={16} strokeWidth={2} aria-hidden="true" />
              </button>
            )}
          </div>
          {/* Filter by status (if applicable) */}
          {uniqueStatusValues.length > 0 && (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="bg-gray-800 border-gray-600 text-gray-200 hover:bg-gray-700">
                  <Filter className="-ms-1 me-2 opacity-60" size={16} strokeWidth={2} aria-hidden="true" />
                  Status
                  {selectedStatuses.length > 0 && (
                    <span className="-me-1 ms-3 inline-flex h-5 max-h-full items-center rounded border border-gray-600 bg-gray-900 px-1 font-[inherit] text-[0.625rem] font-medium text-gray-400">
                      {selectedStatuses.length}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="min-w-36 p-3 bg-gray-800 border-gray-600" align="start">
                <div className="space-y-3">
                  <div className="text-xs font-medium text-gray-400">Filters</div>
                  <div className="space-y-3">
                    {uniqueStatusValues.map((value, i) => (
                      <div key={value} className="flex items-center gap-2">
                        <Checkbox
                          id={`${id}-${i}`}
                          checked={selectedStatuses.includes(value)}
                          onCheckedChange={(checked: boolean) => handleStatusChange(checked, value)}
                          className="border-gray-600 data-[state=checked]:bg-orange-600"
                        />
                        <Label
                          htmlFor={`${id}-${i}`}
                          className="flex grow justify-between gap-2 font-normal text-gray-200"
                        >
                          {value}
                          <span className="ms-2 text-xs text-gray-400">{statusCounts.get(value)}</span>
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          )}
          {/* Toggle columns visibility */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="bg-gray-800 border-gray-600 text-gray-200 hover:bg-gray-700">
                <Columns3 className="-ms-1 me-2 opacity-60" size={16} strokeWidth={2} aria-hidden="true" />
                View
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-gray-800 border-gray-600">
              <DropdownMenuLabel className="text-gray-200">Toggle columns</DropdownMenuLabel>
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize text-gray-200"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) => column.toggleVisibility(!!value)}
                      onSelect={(event) => event.preventDefault()}
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex items-center gap-3">
          {/* Delete selected */}
          {table.getSelectedRowModel().rows.length > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button className="ml-auto bg-gray-800 border-gray-600 text-gray-200 hover:bg-gray-700" variant="outline">
                  <Trash className="-ms-1 me-2 opacity-60" size={16} strokeWidth={2} aria-hidden="true" />
                  Delete
                  <span className="-me-1 ms-3 inline-flex h-5 max-h-full items-center rounded border border-gray-600 bg-gray-900 px-1 font-[inherit] text-[0.625rem] font-medium text-gray-400">
                    {table.getSelectedRowModel().rows.length}
                  </span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-gray-800 border-gray-600 text-white">
                <div className="flex flex-col gap-2 max-sm:items-center sm:flex-row sm:gap-4">
                  <div
                    className="flex size-9 shrink-0 items-center justify-center rounded-full border border-gray-600"
                    aria-hidden="true"
                  >
                    <CircleAlert className="text-orange-500" size={16} strokeWidth={2} />
                  </div>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-gray-100">Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription className="text-gray-300">
                      This action cannot be undone. This will permanently delete {table.getSelectedRowModel().rows.length} selected {table.getSelectedRowModel().rows.length === 1 ? "row" : "rows"}.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                </div>
                <AlertDialogFooter>
                  <AlertDialogCancel className="bg-gray-700 text-gray-200 hover:bg-gray-600 hover:text-white border-gray-600">Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteRows} className="bg-red-600 hover:bg-red-700 text-white">Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          {/* Add button */}
          {addButton}
        </div>
      </div>
      {/* Table */}
      <div className="overflow-hidden rounded-lg border border-gray-700 bg-gray-900 w-full">
        <Table className="table-fixed w-full text-white">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent border-gray-700">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      style={{ width: `${header.getSize()}px` }}
                      className="h-11 bg-gray-800 text-gray-100 border-gray-700"
                    >
                      {header.isPlaceholder ? null : header.column.getCanSort() ? (
                        <div
                          className={cn(
                            header.column.getCanSort() &&
                              "flex h-full cursor-pointer select-none items-center justify-between gap-2",
                          )}
                          onClick={header.column.getToggleSortingHandler()}
                          onKeyDown={(e) => {
                            if (
                              header.column.getCanSort() &&
                              (e.key === "Enter" || e.key === " ")
                            ) {
                              e.preventDefault();
                              header.column.getToggleSortingHandler()?.(e);
                            }
                          }}
                          tabIndex={header.column.getCanSort() ? 0 : undefined}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {{
                            asc: (
                              <ChevronUp
                                className="shrink-0 opacity-60"
                                size={16}
                                strokeWidth={2}
                                aria-hidden="true"
                              />
                            ),
                            desc: (
                              <ChevronDown
                                className="shrink-0 opacity-60"
                                size={16}
                                strokeWidth={2}
                                aria-hidden="true"
                              />
                            ),
                          }[header.column.getIsSorted() as string] ?? null}
                        </div>
                      ) : (
                        flexRender(header.column.columnDef.header, header.getContext())
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              <>
                {table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} data-state={row.getIsSelected() && "selected"} className="border-gray-700 hover:bg-gray-800/50">
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="last:py-0 border-gray-700 text-gray-100">
                        {cell.column.id === "actions" && renderRowActions
                          ? renderRowActions(row)
                          : flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
                {/* Add new row at the bottom */}
                {addNewRow}
              </>
            ) : (
              <TableRow className="border-gray-700">
                <TableCell colSpan={columns.length} className="h-24 text-center text-gray-400 border-gray-700">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {/* Pagination */}
      <div className="flex items-center justify-between gap-8 mt-4 text-gray-200">
        <div className="flex items-center gap-3">
          <Label htmlFor={id} className="max-sm:sr-only text-gray-300">
            Rows per page
          </Label>
          <select
            className="border rounded px-2 py-1 text-sm bg-gray-800 border-gray-600 text-white"
            value={table.getState().pagination.pageSize}
            onChange={(e) => table.setPageSize(Number(e.target.value))}
          >
            {[5, 10, 25, 50].map((pageSize) => (
              <option key={pageSize} value={pageSize}>
                {pageSize}
              </option>
            ))}
          </select>
        </div>
        <div className="flex grow justify-end whitespace-nowrap text-sm text-gray-400">
          <p className="whitespace-nowrap text-sm text-gray-400" aria-live="polite">
            <span className="text-gray-200">
              {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}-
              {Math.min(
                Math.max(
                  table.getState().pagination.pageIndex * table.getState().pagination.pageSize +
                    table.getState().pagination.pageSize,
                  0,
                ),
                table.getRowCount(),
              )}
            </span>{" "}
            of <span className="text-gray-200">{table.getRowCount().toString()}</span>
          </p>
        </div>
        <div>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <Button
                  size="icon"
                  variant="outline"
                  className="disabled:pointer-events-none disabled:opacity-50 bg-gray-800 border-gray-600 text-gray-200 hover:bg-gray-700"
                  onClick={() => table.firstPage()}
                  disabled={!table.getCanPreviousPage()}
                  aria-label="Go to first page"
                >
                  <ChevronFirst size={16} strokeWidth={2} aria-hidden="true" />
                </Button>
              </PaginationItem>
              <PaginationItem>
                <Button
                  size="icon"
                  variant="outline"
                  className="disabled:pointer-events-none disabled:opacity-50 bg-gray-800 border-gray-600 text-gray-200 hover:bg-gray-700"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                  aria-label="Go to previous page"
                >
                  <ChevronLeft size={16} strokeWidth={2} aria-hidden="true" />
                </Button>
              </PaginationItem>
              <PaginationItem>
                <Button
                  size="icon"
                  variant="outline"
                  className="disabled:pointer-events-none disabled:opacity-50 bg-gray-800 border-gray-600 text-gray-200 hover:bg-gray-700"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                  aria-label="Go to next page"
                >
                  <ChevronRight size={16} strokeWidth={2} aria-hidden="true" />
                </Button>
              </PaginationItem>
              <PaginationItem>
                <Button
                  size="icon"
                  variant="outline"
                  className="disabled:pointer-events-none disabled:opacity-50 bg-gray-800 border-gray-600 text-gray-200 hover:bg-gray-700"
                  onClick={() => table.lastPage()}
                  disabled={!table.getCanNextPage()}
                  aria-label="Go to last page"
                >
                  <ChevronLast size={16} strokeWidth={2} aria-hidden="true" />
                </Button>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </div>
  );
}
