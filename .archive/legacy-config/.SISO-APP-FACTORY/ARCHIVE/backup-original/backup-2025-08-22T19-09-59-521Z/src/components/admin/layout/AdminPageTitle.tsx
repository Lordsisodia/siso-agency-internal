
import React from "react";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

/**
 * Props for the AdminPageTitle.
 * - icon: LucideIcon to render
 * - title: main heading (big/bold)
 * - subtitle: optional, text below the title (subtext, description)
 * - className: optional extra classes
 */
interface AdminPageTitleProps {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  className?: string;
}

/**
 * Title header for admin pages matching the "square icon + text stacked" look
 */
export function AdminPageTitle({
  icon: Icon,
  title,
  subtitle,
  className,
}: AdminPageTitleProps) {
  return (
    <div
      className={cn(
        "flex items-start py-4 mb-6 w-full",
        "border-b border-border",
        "bg-gradient-to-r from-siso-bg/80 to-transparent",
        className
      )}
    >
      <div className="flex flex-row items-center gap-5 w-full">
        {/* Icon with square, rounded corners, soft neutral bg like in screenshot */}
        <div className="rounded-lg bg-[#f6f7fa] p-4 flex items-center justify-center mr-3 shadow-sm border border-gray-200">
          <Icon className="w-8 h-8 text-siso-orange" strokeWidth={2.1} />
        </div>
        <div className="flex flex-col">
          <span
            className="text-3xl font-bold tracking-tight text-siso-text leading-snug"
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
