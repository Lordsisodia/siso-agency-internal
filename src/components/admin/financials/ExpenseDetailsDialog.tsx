
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FinancialTransaction } from "@/utils/financial";

interface ExpenseDetailsDialogProps {
  expense: FinancialTransaction | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ExpenseDetailsDialog({ expense, isOpen, onOpenChange }: ExpenseDetailsDialogProps) {
  if (!expense) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Expense Details</DialogTitle>
          <DialogDescription>
            View detailed information about this expense.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Description</h3>
              <p>{expense.description}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Amount</h3>
              <p className="font-semibold">£{expense.amount.toFixed(2)}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Date</h3>
              <p>{new Date(expense.date).toLocaleDateString()}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Category</h3>
              <p>{expense.category?.name || "Uncategorized"}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Vendor</h3>
              <p>{expense.vendor?.name || "—"}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Payment Method</h3>
              <p>{expense.payment_method?.name || "—"}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Recurrence</h3>
              <p>
                {expense.recurring_type === 'monthly' 
                  ? 'Monthly' 
                  : expense.recurring_type === 'annual'
                  ? 'Annual'
                  : 'One-Time'}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
              <p>{expense.status}</p>
            </div>
          </div>
          {expense.notes && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Notes</h3>
              <p className="text-sm">{expense.notes}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
