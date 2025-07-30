
import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

// Simple card matching status "active" badge style
export function ViewClientCard({ clientId }: { clientId: string }) {
  return (
    <Link
      to={`/admin/clients/${clientId}`}
      className={cn(
        "group block w-full max-w-[140px] rounded-full px-4 py-1.5 border border-emerald-500/30",
        "bg-emerald-50/90 text-emerald-700 shadow-emerald-500/10",
        "hover:bg-emerald-100/90 hover:text-emerald-800 hover:shadow-lg transition-all duration-150",
        "flex items-center gap-2 justify-between text-xs font-semibold"
      )}
      aria-label="Go to client detail page"
    >
      <span>View client</span>
      <ArrowRight size={16} strokeWidth={2} className="ml-1 transition-transform group-hover:translate-x-1" />
    </Link>
  );
}
