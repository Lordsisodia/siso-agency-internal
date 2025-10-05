
import { TableRow, TableCell } from "@/components/ui/table";
import { Loader2 } from "lucide-react";

interface ExpensesTableLoadingProps {
  colSpan: number;
}

export function ExpensesTableLoading({ colSpan }: ExpensesTableLoadingProps) {
  return (
    <TableRow>
      <TableCell colSpan={colSpan} className="text-center py-8">
        <div className="flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </TableCell>
    </TableRow>
  );
}
