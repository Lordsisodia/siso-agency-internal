/**
 * Glass Card Demo Component
 * 
 * Demo container for showcasing the GlassCard component with proper background and layout.
 * 
 * Features:
 * - Centered layout with proper spacing
 * - Dark/light theme compatible background
 * - Fixed height container for consistent display
 * - Responsive padding
 * 
 * Usage Example:
 * ```tsx
 * import { DemoOne } from '@/components/ui/glass-card-demo';
 * 
 * <DemoOne />
 * ```
 */

import * as React from "react";
import GlassCard from "@/components/ui/glass-card";

const GlassCardDemo = () => {
  return (
    <div className="flex h-[450px] w-full items-center justify-center bg-zinc-100 p-10 dark:bg-zinc-800">
      <GlassCard />
    </div>
  );
};

export { GlassCardDemo as DemoOne };