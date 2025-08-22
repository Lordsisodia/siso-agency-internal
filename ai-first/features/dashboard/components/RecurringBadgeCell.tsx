
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface RecurringBadgeCellProps {
  value: string | null;
}

export function RecurringBadgeCell({ value }: RecurringBadgeCellProps) {
  const getBadgeColor = (type: string | null) => {
    switch (type) {
      case 'monthly': return 'bg-green-900/30 text-green-300 border-green-800/50';
      case 'annual': return 'bg-purple-900/30 text-purple-300 border-purple-800/50';
      default: return 'bg-amber-900/30 text-amber-300 border-amber-800/50';
    }
  };

  return (
    <Badge className={cn("font-medium px-2", getBadgeColor(value))}>
      {value === 'monthly' ? 'Monthly' : value === 'annual' ? 'Annual' : 'One-Time'}
    </Badge>
  );
}
