
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { createTransaction } from "@/utils/financial";
import { FinancialTransaction } from "@/utils/financial/types";

// Types for the form
interface AddRevenueDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRevenueAdded: () => void;
}

export function AddRevenueDialog({ open, onOpenChange, onRevenueAdded }: AddRevenueDialogProps) {
  const [form, setForm] = useState({
    description: "",
    amount: "",
    date: "",
    vendor_name: "",
    notes: "",
    status: "completed",
    recurring_type: "one-time"
  });
  const [submitting, setSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.amount || !form.date || !form.description) {
      toast({
        title: "Missing Info",
        description: "Description, Amount and Date are required",
        variant: "destructive"
      });
      return;
    }
    setSubmitting(true);
    try {
      // Compose a minimal vendor relationship (for now: just a name field, could be improved)
      const newRevenue: Omit<FinancialTransaction, "id"> = {
        type: "revenue",
        amount: parseFloat(form.amount),
        currency: "GBP",
        date: form.date,
        description: form.description,
        vendor_id: undefined,
        payment_method_id: undefined,
        status: form.status,
        recurring_type: form.recurring_type as "one-time" | "monthly" | "annual" | null,
        notes: form.notes,
        // The API will ignore category_id for revenue, set to undefined
        category_id: undefined,
        receipt_url: "",
      };
      const ok = await createTransaction(newRevenue);
      if (ok) {
        toast({
          title: "Revenue Added",
          description: "A new revenue transaction was added."
        });
        onOpenChange(false);
        onRevenueAdded();
        setForm({
          description: "",
          amount: "",
          date: "",
          vendor_name: "",
          notes: "",
          status: "completed",
          recurring_type: "one-time"
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Revenue</DialogTitle>
          <DialogDescription>
            Enter details to add a new revenue entry.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 mt-2">
          <div>
            <label htmlFor="description" className="block mb-1 text-sm">Description*</label>
            <Input name="description" maxLength={64} placeholder="e.g. Client Payment" value={form.description} onChange={handleInputChange} required />
          </div>
          <div>
            <label htmlFor="amount" className="block mb-1 text-sm">Amount (£)*</label>
            <Input name="amount" type="number" min="0" step="0.01" placeholder="Amount" value={form.amount} onChange={handleInputChange} required />
          </div>
          <div>
            <label htmlFor="date" className="block mb-1 text-sm">Date*</label>
            <Input name="date" type="date" value={form.date} onChange={handleInputChange} required />
          </div>
          <div>
            <label htmlFor="vendor_name" className="block mb-1 text-sm">Source/Client</label>
            <Input name="vendor_name" placeholder="Who paid?" value={form.vendor_name} onChange={handleInputChange} />
          </div>
          <div>
            <label htmlFor="notes" className="block mb-1 text-sm">Notes</label>
            <Textarea name="notes" placeholder="Optional notes" value={form.notes} onChange={handleInputChange} />
          </div>
          {/* Could add Payment Method, Recurrence etc. */}
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Adding..." : "Add Revenue"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
