
import { cn } from "@/lib/utils";

interface ClientStatusBadgeProps {
  status: string;
  className?: string;
}

export function ClientStatusBadge({ status, className }: ClientStatusBadgeProps) {
  const getStatusColor = () => {
    switch (status.toLowerCase()) {
      case 'active':
        return "bg-emerald-500/15 text-emerald-500 border-emerald-500/30 shadow-emerald-500/10";
      case 'pending':
        return "bg-amber-500/15 text-amber-500 border-amber-500/30 shadow-amber-500/10";
      case 'completed':
        return "bg-blue-500/15 text-blue-500 border-blue-500/30 shadow-blue-500/10";
      case 'cancelled':
        return "bg-rose-500/15 text-rose-500 border-rose-500/30 shadow-rose-500/10";
      case 'on hold':
        return "bg-violet-500/15 text-violet-500 border-violet-500/30 shadow-violet-500/10";
      case 'proposal':
        return "bg-cyan-500/15 text-cyan-500 border-cyan-500/30 shadow-cyan-500/10";
      case 'negotiation':
        return "bg-fuchsia-500/15 text-fuchsia-500 border-fuchsia-500/30 shadow-fuchsia-500/10";
      default:
        return "bg-muted/50 text-muted-foreground border-muted/50 shadow-muted/10";
    }
  };

  return (
    <div 
      className={cn(
        "inline-flex items-center justify-center rounded-full px-2.5 py-0.5",
        "text-xs font-medium border shadow-sm transition-all duration-200",
        "backdrop-blur-sm",
        getStatusColor(),
        className
      )}
    >
      <div className="flex items-center gap-1.5">
        <div className={cn(
          "h-1.5 w-1.5 rounded-full",
          status.toLowerCase() === 'active' && "animate-pulse"
        )} />
        <span>{status}</span>
      </div>
    </div>
  );
}
