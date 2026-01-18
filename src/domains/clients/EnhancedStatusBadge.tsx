
import { cn } from "@/lib/utils";

interface EnhancedStatusBadgeProps {
  status: string;
  className?: string;
}

export function EnhancedStatusBadge({ status, className }: EnhancedStatusBadgeProps) {
  const baseClasses = "inline-flex items-center justify-center px-2.5 py-0.5 text-xs font-medium rounded-full";
  
  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return "bg-emerald-50/50 text-emerald-700 ring-1 ring-emerald-600/20";
      case 'pending':
        return "bg-amber-50/50 text-amber-700 ring-1 ring-amber-600/20";
      case 'completed':
        return "bg-blue-50/50 text-blue-700 ring-1 ring-blue-600/20";
      case 'cancelled':
        return "bg-rose-50/50 text-rose-700 ring-1 ring-rose-600/20";
      case 'on hold':
        return "bg-violet-50/50 text-violet-700 ring-1 ring-violet-600/20";
      case 'proposal':
        return "bg-cyan-50/50 text-cyan-700 ring-1 ring-cyan-600/20";
      case 'negotiation':
        return "bg-fuchsia-50/50 text-fuchsia-700 ring-1 ring-fuchsia-600/20";
      default:
        return "bg-slate-50/50 text-slate-700 ring-1 ring-slate-600/20";
    }
  };

  return (
    <span className={cn(baseClasses, getStatusStyle(status), className)}>
      {status}
    </span>
  );
}
