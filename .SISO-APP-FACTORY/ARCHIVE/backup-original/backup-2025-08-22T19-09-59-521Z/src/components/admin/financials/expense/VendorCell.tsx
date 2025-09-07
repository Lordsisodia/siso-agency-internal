
import { cn } from "@/lib/utils";

interface VendorCellProps {
  name?: string;
}

export function VendorCell({ name }: VendorCellProps) {
  return (
    <span className={cn(
      "text-primary-foreground/90 font-normal mr-1",
      !name && "text-muted-foreground italic"
    )}>
      {name || "—"}
    </span>
  );
}
