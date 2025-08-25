
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

/**
 * Props for the ClientPageTitle.
 * - icon: LucideIcon to render (use arrow-right as allowed)
 * - title: main heading (big/bold)
 * - subtitle: optional, text below the title
 * - className: optional, extra classes for container
 */
interface ClientPageTitleProps {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  className?: string;
}

/**
 * Client-side main page title, styled similar to AdminPageTitle with glass/card effect.
 */
export function ClientPageTitle({
  icon: Icon,
  title,
  subtitle,
  className,
}: ClientPageTitleProps) {
  return (
    <div
      className={cn(
        "flex items-start py-8 mb-8 w-full",
        "border-b border-border bg-gradient-to-r from-siso-bg/80 to-transparent",
        className
      )}
    >
      <div className="flex flex-row items-center gap-5 w-full">
        <div className="rounded-lg bg-[#18141e] p-4 flex items-center justify-center mr-3 shadow-sm border border-gray-800">
          <Icon className="w-8 h-8 text-siso-orange" strokeWidth={2.1} />
        </div>
        <div className="flex flex-col">
          <span
            className="text-3xl font-bold tracking-tight text-siso-text mt-0.5"
            style={{
              fontFamily: "Inter, sans-serif",
              letterSpacing: "-0.03em",
              lineHeight: "1.15",
            }}
          >
            {title}
          </span>
          {subtitle && (
            <span className="text-muted-foreground text-base mt-2">
              {subtitle}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
