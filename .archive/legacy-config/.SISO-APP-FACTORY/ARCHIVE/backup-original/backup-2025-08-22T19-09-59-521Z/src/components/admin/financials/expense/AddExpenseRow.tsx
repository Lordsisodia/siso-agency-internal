import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createTransaction } from "@/utils/financial";
import { toast } from "@/hooks/use-toast";
import { TableRow, TableCell } from "@/components/ui/table";
import { Plus, Check, X } from "lucide-react";
import { FinancialTransaction } from "@/utils/financial/types";

type RecurringType = "one-time" | "monthly" | "annual";

export interface AddExpenseRowProps {
  onExpenseAdded: () => void;
  visibleColumns: any[];
}

// Helper to auto-focus first input
function useAutoFocus(ref, active) {
  useEffect(() => {
    if (active && ref.current) {
      ref.current.focus();
    }
  }, [active]);
}

export function AddExpenseRow({ onExpenseAdded, visibleColumns }: AddExpenseRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [form, setForm] = useState({
    description: "",
    amount: "",
    date: "",
    category_id: "",
    vendor_id: "",
    payment_method_id: "",
    recurring_type: "one-time" as RecurringType,
    notes: "",
    type: "expense" as "expense" | "revenue", // Fix: explicitly type as union type
    currency: "GBP",
    status: "completed"
  });
  const [isSaving, setIsSaving] = useState(false);

  useAutoFocus(inputRef, isEditing);

  // Reset form and switch back to add button state
  const resetForm = () => {
    setForm({
      description: "",
      amount: "",
      date: "",
      category_id: "",
      vendor_id: "",
      payment_method_id: "",
      recurring_type: "one-time",
      notes: "",
      type: "expense" as "expense" | "revenue", // Fix: maintain explicit type
      currency: "GBP",
      status: "completed"
    });
    setIsEditing(false);
  };

  // Populate field values
  const handleInput = (field: string, value: string) => {
    setForm(prev => ({
      ...prev,
      [field]: field === "recurring_type"
        ? (["one-time", "monthly", "annual"].includes(value) ? value : "one-time")
        : field === "type"
          ? (value === "revenue" ? "revenue" : "expense") // Ensure type is always valid
          : value
    }));
  };

  // Save logic
  const handleAdd = async () => {
    if (!form.description || !form.amount || !form.date) {
      toast({
        title: "Missing fields",
        description: "Description, amount & date are required",
        variant: "destructive"
      });
      return;
    }
    setIsSaving(true);
    const success = await createTransaction({
      ...form,
      amount: parseFloat(form.amount)
    });
    setIsSaving(false);
    if (success) {
      toast({ title: "Expense Added" });
      resetForm();
      onExpenseAdded();
    }
  };

  if (!isEditing) {
    return (
      <TableRow className="add-expense-row-trigger cursor-pointer group" onClick={() => setIsEditing(true)}>
        <TableCell colSpan={visibleColumns.length + 2} className="text-center py-3">
          <div className="flex items-center justify-center gap-2 text-muted-foreground opacity-90 group-hover:opacity-100 transition">
            <Button 
              variant="ghost" 
              size="icon"
              className="rounded-full p-1 border border-amber-700/60 bg-[#18181b] hover:bg-primary/80"
              aria-label="Add Expense"
              tabIndex={0}
            >
              <Plus className="h-5 w-5 text-primary" />
            </Button>
            <span className="tracking-wide text-amber-200">Add Expense</span>
          </div>
        </TableCell>
      </TableRow>
    );
  }

  return (
    <TableRow className="bg-gray-950/95 hover:bg-gray-800/40 border-b border-amber-800/40 focus-within:ring-1 focus-within:ring-primary">
      <TableCell /> {/* For checkbox col alignment */}
      {visibleColumns.map(col => {
        switch (col.key) {
          case "description":
            return (
              <TableCell key={col.key}>
                <Input
                  ref={inputRef}
                  value={form.description}
                  onChange={e => handleInput("description", e.target.value)}
                  placeholder="Description"
                  className="min-w-[140px] bg-[#18181b] border border-gray-800 text-amber-100"
                  autoFocus
                />
              </TableCell>
            );
          case "category":
            return (
              <TableCell key={col.key}>
                <Input
                  value={form.category_id}
                  onChange={e => handleInput("category_id", e.target.value)}
                  placeholder="Category ID"
                  className="bg-[#18181b] border border-gray-800 text-amber-100"
                />
              </TableCell>
            );
          case "amount":
            return (
              <TableCell key={col.key}>
                <Input
                  value={form.amount}
                  onChange={e => handleInput("amount", e.target.value)}
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  className="w-24 bg-[#18181b] border border-gray-800 text-amber-100"
                />
              </TableCell>
            );
          case "date":
            return (
              <TableCell key={col.key}>
                <Input
                  value={form.date}
                  onChange={e => handleInput("date", e.target.value)}
                  type="date"
                  className="bg-[#18181b] border border-gray-800 text-amber-100"
                />
              </TableCell>
            );
          case "recurring_type":
            return (
              <TableCell key={col.key}>
                <select
                  value={form.recurring_type}
                  onChange={e => handleInput("recurring_type", e.target.value)}
                  className="bg-[#18181b] border border-gray-800 text-amber-100 px-2 py-1 rounded"
                  style={{ minWidth: 90 }}
                >
                  <option value="one-time">One-Time</option>
                  <option value="monthly">Monthly</option>
                  <option value="annual">Annual</option>
                </select>
              </TableCell>
            );
          case "vendor":
            return (
              <TableCell key={col.key}>
                <Input
                  value={form.vendor_id}
                  onChange={e => handleInput("vendor_id", e.target.value)}
                  placeholder="Vendor ID"
                  className="bg-[#18181b] border border-gray-800 text-amber-100"
                />
              </TableCell>
            );
          case "payment_method":
            return (
              <TableCell key={col.key}>
                <Input
                  value={form.payment_method_id}
                  onChange={e => handleInput("payment_method_id", e.target.value)}
                  placeholder="Payment Method ID"
                  className="bg-[#18181b] border border-gray-800 text-amber-100"
                />
              </TableCell>
            );
          case "notes":
            return (
              <TableCell key={col.key}>
                <Input
                  value={form.notes}
                  onChange={e => handleInput("notes", e.target.value)}
                  placeholder="Notes"
                  className="bg-[#18181b] border border-gray-800 text-amber-100"
                />
              </TableCell>
            );
          default:
            return <TableCell key={col.key} />;
        }
      })}
      <TableCell>
        <div className="flex items-center gap-2 justify-end">
          <Button variant="ghost" size="sm" onClick={resetForm} disabled={isSaving}>
            <X className="h-4 w-4" />
          </Button>
          <Button variant="default" size="sm" onClick={handleAdd} disabled={isSaving}>
            <Check className="h-4 w-4 mr-1" /> Save
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
