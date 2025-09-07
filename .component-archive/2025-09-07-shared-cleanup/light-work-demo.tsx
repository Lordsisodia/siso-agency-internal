"use client";

import { EnhancedLightWorkManager } from "@/shared/ui/enhanced-light-work-manager";

export function LightWorkDemo() {
  return (
    <div className="flex flex-col p-4 w-full h-full">
      <EnhancedLightWorkManager selectedDate={new Date()} />
    </div>
  );
}