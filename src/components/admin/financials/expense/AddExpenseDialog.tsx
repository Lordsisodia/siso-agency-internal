
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FilePlus } from "lucide-react";
import { ExpenseForm } from "./ExpenseForm";
import { useState } from "react";

interface AddExpenseDialogProps {
  onExpenseAdded?: () => void;
}

export function AddExpenseDialog({ onExpenseAdded }: AddExpenseDialogProps) {
  const [open, setOpen] = useState(false);

  const handleSuccess = async () => {
    // Close the dialog when expense is added
    setOpen(false);
    // Call the parent's callback if provided
    if (onExpenseAdded) {
      onExpenseAdded();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <FilePlus className="mr-2 h-4 w-4" />
          Add Expense
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Expense</DialogTitle>
          <DialogDescription>
            Enter the details for the new expense.
          </DialogDescription>
        </DialogHeader>
        <ExpenseForm onSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  );
}
